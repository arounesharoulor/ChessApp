import { c as connectDb } from './db-BzxrUwZZ.js';
import 'node:fs/promises';
import 'node:path';
import 'node:url';
import 'pg';

//#region src/routes/api/tournaments/+server.ts
var GET = async () => {
	const result = await (await connectDb()).query("SELECT * FROM tournaments ORDER BY date");
	return new Response(JSON.stringify(result.rows), { headers: { "Content-Type": "application/json" } });
};
var POST = async ({ request }) => {
	const { id, name, date, players, matches } = await request.json();
	await (await connectDb()).query("INSERT INTO tournaments (id, name, date, players, matches) VALUES ($1, $2, $3, $4, $5)", [
		id,
		name,
		date,
		JSON.stringify(players || []),
		JSON.stringify(matches || [])
	]);
	return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};
var PUT = async ({ request }) => {
	const { id, name, date, players, matches } = await request.json();
	await (await connectDb()).query("UPDATE tournaments SET name = $1, date = $2, players = $3, matches = $4 WHERE id = $5", [
		name,
		date,
		JSON.stringify(players || []),
		JSON.stringify(matches || []),
		id
	]);
	return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};
var DELETE = async ({ request }) => {
	const { id } = await request.json();
	await (await connectDb()).query("DELETE FROM tournaments WHERE id = $1", [id]);
	return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
};

export { DELETE, GET, POST, PUT };
//# sourceMappingURL=_server.ts-Dxp9MQxJ.js.map
