import type { RequestHandler } from '@sveltejs/kit';
import { connectDb } from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  const db = await connectDb();
  const result = await db.query('SELECT * FROM players ORDER BY name');
  return new Response(JSON.stringify(result.rows), { 
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    } 
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { id, name, rating, club } = body;
  const db = await connectDb();
  await db.query('INSERT INTO players (id, name, rating, club) VALUES ($1, $2, $3, $4)', [id, name, rating, club]);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { id, name, rating, club } = body;
  const db = await connectDb();
  await db.query('UPDATE players SET name = $1, rating = $2, club = $3 WHERE id = $4', [name, rating, club, id]);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { id } = body;
  const db = await connectDb();
  await db.query('DELETE FROM players WHERE id = $1', [id]);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
