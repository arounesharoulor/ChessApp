import type { RequestHandler } from '@sveltejs/kit';
import { connectDb } from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  const db = await connectDb();
  const result = await db.query('SELECT * FROM tournaments ORDER BY date');
  return new Response(JSON.stringify(result.rows), { 
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    } 
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { id, name, date, players, matches } = body;
  const db = await connectDb();
  await db.query(
    'INSERT INTO tournaments (id, name, date, players, matches) VALUES ($1, $2, $3, $4, $5)',
    [id, name, date, JSON.stringify(players || []), JSON.stringify(matches || [])]
  );
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { id, name, date, players, matches } = body;
  const db = await connectDb();
  await db.query('UPDATE tournaments SET name = $1, date = $2, players = $3, matches = $4 WHERE id = $5', [
    name,
    date,
    JSON.stringify(players || []),
    JSON.stringify(matches || []),
    id
  ]);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { id } = body;
  const db = await connectDb();
  await db.query('DELETE FROM tournaments WHERE id = $1', [id]);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
