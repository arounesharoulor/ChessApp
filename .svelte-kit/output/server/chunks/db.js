import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
//#region src/lib/db.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var dataFile = path.join(__dirname, "..", "..", ".chess-data.json");
var initialized = false;
var pool = null;
var useFallback = false;
async function ensureStoreFile() {
	await mkdir(path.dirname(dataFile), { recursive: true });
	try {
		await readFile(dataFile, "utf8");
	} catch {
		await writeFile(dataFile, JSON.stringify({
			players: [],
			tournaments: []
		}), "utf8");
	}
}
function normalizeTournament(entry) {
	const playersValue = entry.players;
	const matchesValue = entry.matches;
	return {
		...entry,
		players: typeof playersValue === "string" ? JSON.parse(playersValue) : Array.isArray(playersValue) ? playersValue : [],
		matches: typeof matchesValue === "string" ? JSON.parse(matchesValue) : Array.isArray(matchesValue) ? matchesValue : []
	};
}
async function readStore() {
	await ensureStoreFile();
	const raw = await readFile(dataFile, "utf8");
	const parsed = JSON.parse(raw);
	return {
		players: parsed.players ?? [],
		tournaments: (parsed.tournaments ?? []).map((entry) => normalizeTournament(entry))
	};
}
async function writeStore(store) {
	await ensureStoreFile();
	await writeFile(dataFile, JSON.stringify(store), "utf8");
}
async function initializeDb() {
	const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;
	if (connectionString) {
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
		useFallback = false;
		return;
	}
	await ensureStoreFile();
	useFallback = true;
}
async function handleFallbackQuery(text, params = []) {
	const store = await readStore();
	const upper = text.trim().toUpperCase();
	if (upper.startsWith("SELECT * FROM PLAYERS")) return { rows: [...store.players].sort((left, right) => String(left.name).localeCompare(String(right.name))) };
	if (upper.startsWith("INSERT INTO PLAYERS")) {
		const [id, name, rating, club] = params;
		store.players.push({
			id,
			name,
			rating: Number(rating),
			club
		});
		await writeStore(store);
		return { rowCount: 1 };
	}
	if (upper.startsWith("UPDATE PLAYERS")) {
		const [name, rating, club, id] = params;
		const entry = store.players.find((item) => item.id === id);
		if (entry) {
			entry.name = name;
			entry.rating = Number(rating);
			entry.club = club;
			await writeStore(store);
			return { rowCount: 1 };
		}
		return { rowCount: 0 };
	}
	if (upper.startsWith("DELETE FROM PLAYERS")) {
		const [id] = params;
		store.players = store.players.filter((item) => item.id !== id);
		await writeStore(store);
		return { rowCount: 1 };
	}
	if (upper.startsWith("SELECT * FROM TOURNAMENTS")) return { rows: [...store.tournaments].sort((left, right) => String(left.date).localeCompare(String(right.date))) };
	if (upper.startsWith("INSERT INTO TOURNAMENTS")) {
		const [id, name, date, players, matches] = params;
		const parsedPlayers = typeof players === "string" ? JSON.parse(players) : players ?? [];
		const parsedMatches = typeof matches === "string" ? JSON.parse(matches) : matches ?? [];
		store.tournaments.push({
			id,
			name,
			date,
			players: parsedPlayers,
			matches: parsedMatches
		});
		await writeStore(store);
		return { rowCount: 1 };
	}
	if (upper.startsWith("UPDATE TOURNAMENTS")) {
		const [name, date, players, matches, id] = params;
		const entry = store.tournaments.find((item) => item.id === id);
		if (entry) {
			entry.name = name;
			entry.date = date;
			entry.players = typeof players === "string" ? JSON.parse(players) : players ?? [];
			entry.matches = typeof matches === "string" ? JSON.parse(matches) : matches ?? [];
			await writeStore(store);
			return { rowCount: 1 };
		}
		return { rowCount: 0 };
	}
	if (upper.startsWith("DELETE FROM TOURNAMENTS")) {
		const [id] = params;
		store.tournaments = store.tournaments.filter((item) => item.id !== id);
		await writeStore(store);
		return { rowCount: 1 };
	}
	return { rows: [] };
}
async function connectDb() {
	if (!initialized) {
		await initializeDb();
		initialized = true;
	}
	if (useFallback) return { query: async (text, params = []) => handleFallbackQuery(text, params) };
	return pool;
}
//#endregion
export { connectDb as t };
