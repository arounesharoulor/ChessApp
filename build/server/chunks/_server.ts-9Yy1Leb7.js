import { c as connectDb } from './db-BzxrUwZZ.js';
import 'node:fs/promises';
import 'node:path';
import 'node:url';
import 'pg';

//#region src/routes/api/players/+server.ts
var GET = async () => {
	const result = await (await connectDb()).query("SELECT * FROM players ORDER BY name");
	return new Response(JSON.stringify(result.rows), { headers: { "Content-Type": "application/json" } });
};
var POST = async ({ request }) => {
	const { id, name, rating, club } = await request.json();
	await (await connectDb()).query("INSERT INTO players (id, name, rating, club) VALUES ($1, $2, $3, $4)", [
		id,
		name,
		rating,
		club
	]);
	return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};
var PUT = async ({ request }) => {
	const { id, name, rating, club } = await request.json();
	await (await connectDb()).query("UPDATE players SET name = $1, rating = $2, club = $3 WHERE id = $4", [
		name,
		rating,
		club,
		id
	]);
	return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};
var DELETE = async ({ request }) => {
	const { id } = await request.json();
	await (await connectDb()).query("DELETE FROM players WHERE id = $1", [id]);
	return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};

export { DELETE, GET, POST, PUT };
//# sourceMappingURL=_server.ts-9Yy1Leb7.js.map
