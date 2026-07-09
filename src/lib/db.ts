import 'dotenv/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = process.env.VERCEL ? '/tmp/.chess-data.json' : path.join(__dirname, '..', '..', '.chess-data.json');

type PlayerRecord = {
  id?: string;
  name?: string;
  rating?: number;
  club?: string;
};

type TournamentRecord = {
  id?: string;
  name?: string;
  date?: string;
  players: string[];
  matches: Array<Record<string, unknown>>;
};

type StoreShape = {
  players: PlayerRecord[];
  tournaments: TournamentRecord[];
};

let initialized = false;
let pool: InstanceType<typeof Pool> | null = null;
let useFallback = false;

async function ensureStoreFile() {
  await mkdir(path.dirname(dataFile), { recursive: true });

  try {
    await readFile(dataFile, 'utf8');
  } catch {
    await writeFile(dataFile, JSON.stringify({ players: [], tournaments: [] }), 'utf8');
  }
}

function normalizeTournament(entry: Record<string, unknown>): TournamentRecord {
  const playersValue = entry.players;
  const matchesValue = entry.matches;

  return {
    ...entry,
    players: typeof playersValue === 'string' ? JSON.parse(playersValue) : Array.isArray(playersValue) ? (playersValue as string[]) : [],
    matches: typeof matchesValue === 'string' ? JSON.parse(matchesValue) : Array.isArray(matchesValue) ? (matchesValue as Array<Record<string, unknown>>) : []
  } as TournamentRecord;
}

async function readStore(): Promise<StoreShape> {
  await ensureStoreFile();
  const raw = await readFile(dataFile, 'utf8');
  const parsed = JSON.parse(raw) as StoreShape;

  return {
    players: parsed.players ?? [],
    tournaments: (parsed.tournaments ?? []).map((entry) => normalizeTournament(entry as Record<string, unknown>))
  };
}

async function writeStore(store: StoreShape) {
  await ensureStoreFile();
  await writeFile(dataFile, JSON.stringify(store), 'utf8');
}

async function initializeDb() {
  const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;

  console.log("DATABASE_URL =", connectionString);

  if (connectionString) {
    console.log("Connecting to PostgreSQL...");

    pool = new Pool({ connectionString });
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        club TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        players JSONB NOT NULL DEFAULT '[]',
        matches JSONB NOT NULL DEFAULT '[]'
      );
    `);

    console.log("✅ PostgreSQL Connected!");

    useFallback = false;
    return;
  }

  console.log("⚠ Using JSON fallback");

  await ensureStoreFile();
  useFallback = true;
}

async function handleFallbackQuery(text: string, params: unknown[] = []) {
  const store = await readStore();
  const upper = text.trim().toUpperCase();

  if (upper.startsWith('SELECT * FROM PLAYERS')) {
    return { rows: [...store.players].sort((left, right) => String(left.name).localeCompare(String(right.name))) };
  }

  if (upper.startsWith('INSERT INTO PLAYERS')) {
    const [id, name, rating, club] = params;
    store.players.push({ id: id as string, name: name as string, rating: Number(rating), club: club as string });
    await writeStore(store);
    return { rowCount: 1 };
  }

  if (upper.startsWith('UPDATE PLAYERS')) {
    const [name, rating, club, id] = params;
    const entry = store.players.find((item) => item.id === id);
    if (entry) {
      entry.name = name as string;
      entry.rating = Number(rating);
      entry.club = club as string;
      await writeStore(store);
      return { rowCount: 1 };
    }
    return { rowCount: 0 };
  }

  if (upper.startsWith('DELETE FROM PLAYERS')) {
    const [id] = params;
    store.players = store.players.filter((item) => item.id !== id);
    await writeStore(store);
    return { rowCount: 1 };
  }

  if (upper.startsWith('SELECT * FROM TOURNAMENTS')) {
    return { rows: [...store.tournaments].sort((left, right) => String(left.date).localeCompare(String(right.date))) };
  }

  if (upper.startsWith('INSERT INTO TOURNAMENTS')) {
    const [id, name, date, players, matches] = params;
    const parsedPlayers = typeof players === 'string' ? JSON.parse(players) : (players as string[] | undefined ?? []);
    const parsedMatches = typeof matches === 'string' ? JSON.parse(matches) : (matches as Array<Record<string, unknown>> | undefined ?? []);
    store.tournaments.push({ id: id as string, name: name as string, date: date as string, players: parsedPlayers, matches: parsedMatches });
    await writeStore(store);
    return { rowCount: 1 };
  }

  if (upper.startsWith('UPDATE TOURNAMENTS')) {
    const [name, date, players, matches, id] = params;
    const entry = store.tournaments.find((item) => item.id === id);
    if (entry) {
      entry.name = name as string;
      entry.date = date as string;
      entry.players = typeof players === 'string' ? JSON.parse(players) : (players as string[] | undefined ?? []);
      entry.matches = typeof matches === 'string' ? JSON.parse(matches) : (matches as Array<Record<string, unknown>> | undefined ?? []);
      await writeStore(store);
      return { rowCount: 1 };
    }
    return { rowCount: 0 };
  }

  if (upper.startsWith('DELETE FROM TOURNAMENTS')) {
    const [id] = params;
    store.tournaments = store.tournaments.filter((item) => item.id !== id);
    await writeStore(store);
    return { rowCount: 1 };
  }

  return { rows: [] };
}

let initPromise: Promise<void> | null = null;

export async function connectDb() {
  if (!initPromise) {
    initPromise = initializeDb();
  }
  await initPromise;

  if (useFallback) {
    return {
      query: async (text: string, params: unknown[] = []) => handleFallbackQuery(text, params)
    };
  }

  return pool;
}
