import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let db;

async function initializeDb() {
  db = await open({
    filename: path.join(__dirname, 'chess.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
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
      players TEXT NOT NULL DEFAULT '[]',
      matches TEXT NOT NULL DEFAULT '[]'
    );
  `);
}

app.get('/api/players', async (_req, res) => {
  const players = await db.all('SELECT * FROM players ORDER BY name');
  res.json(players);
});

app.post('/api/players', async (req, res) => {
  const { id, name, rating, club } = req.body;
  await db.run('INSERT INTO players (id, name, rating, club) VALUES (?, ?, ?, ?)', [id, name, rating, club]);
  res.json({ success: true });
});

app.put('/api/players/:id', async (req, res) => {
  const { name, rating, club } = req.body;
  await db.run('UPDATE players SET name = ?, rating = ?, club = ? WHERE id = ?', [name, rating, club, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/players/:id', async (req, res) => {
  await db.run('DELETE FROM players WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

function parseTournamentRow(row) {
  return {
    ...row,
    players: typeof row.players === 'string' ? JSON.parse(row.players) : row.players || [],
    matches: typeof row.matches === 'string' ? JSON.parse(row.matches) : row.matches || []
  };
}

app.get('/api/tournaments', async (_req, res) => {
  const tournaments = await db.all('SELECT * FROM tournaments ORDER BY date');
  res.json(tournaments.map(parseTournamentRow));
});

app.post('/api/tournaments', async (req, res) => {
  const { id, name, date, players, matches } = req.body;
  await db.run('INSERT INTO tournaments (id, name, date, players, matches) VALUES (?, ?, ?, ?, ?)', [id, name, date, JSON.stringify(players || []), JSON.stringify(matches || [])]);
  res.json({ success: true });
});

app.put('/api/tournaments/:id', async (req, res) => {
  const { name, date, players, matches } = req.body;
  await db.run('UPDATE tournaments SET name = ?, date = ?, players = ?, matches = ? WHERE id = ?', [name, date, JSON.stringify(players || []), JSON.stringify(matches || []), req.params.id]);
  res.json({ success: true });
});

app.delete('/api/tournaments/:id', async (req, res) => {
  await db.run('DELETE FROM tournaments WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

initializeDb().then(() => {
  app.listen(port, () => {
    console.log(`Chess API running on http://localhost:${port}`);
  });
});
