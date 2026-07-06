import { ad as head, m as escape_html, ae as attr, af as ensure_array_like } from './server-D9hv8TE7.js';

//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let currentTournament, ranking;
		let players = [];
		let tournaments = [];
		let selectedTournamentId = "";
		let playerForm = {
			name: "",
			rating: "",
			club: ""
		};
		let tournamentForm = {
			name: "",
			date: ""
		};
		currentTournament = tournaments.find((entry) => entry.id === selectedTournamentId) ?? null;
		ranking = (() => {
			if (!currentTournament) return [];
			const stats = /* @__PURE__ */ new Map();
			currentTournament.players.forEach((playerId) => {
				const player = players.find((entry) => entry.id === playerId);
				if (player) stats.set(playerId, {
					playerId,
					name: player.name,
					wins: 0,
					losses: 0,
					points: 0
				});
			});
			currentTournament.matches.forEach((match) => {
				const winnerEntry = stats.get(match.winner);
				const loserId = match.winner === match.playerA ? match.playerB : match.playerA;
				const loserEntry = stats.get(loserId);
				if (winnerEntry) {
					winnerEntry.wins += 1;
					winnerEntry.points += 3;
				}
				if (loserEntry) loserEntry.losses += 1;
			});
			return [...stats.values()].sort((left, right) => right.points - left.points || right.wins - left.wins);
		})();
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Chess Tournament Manager</title>`);
			});
			$$renderer.push(`<meta name="description" content="Manage players, tournaments, and random matches in one dashboard."/>`);
		});
		$$renderer.push(`<main class="app-shell"><section class="hero-card"><div><p class="eyebrow">Chess Tournament Manager</p> <h1>Run your event from one place.</h1> <p class="hero-copy">Create players, build tournaments, assign competitors, generate random matches, and review the final podium.</p> <div class="hero-stats"><div><span>Total players</span> <strong>${escape_html(players.length)}</strong></div> <div><span>Active tournaments</span> <strong>${escape_html(tournaments.length)}</strong></div> <div><span>Current event</span> <strong>${escape_html(currentTournament ? currentTournament.name : "None")}</strong></div></div></div> <div class="hero-badge">Live local demo</div></section> <section class="grid-section"><div class="card"><div class="section-heading"><h2>Player management</h2> <p>Add, update, or remove fighters from the roster.</p></div> <form class="stack"><input${attr("value", playerForm.name)} placeholder="Player name"/> <input${attr("value", playerForm.club)} placeholder="Club"/> <input${attr("value", playerForm.rating)} type="number" placeholder="Rating"/> <div class="actions"><button type="submit">${escape_html("Add player")}</button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></form> <div class="list"><!--[-->`);
		const each_array = ensure_array_like(players);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let player = each_array[$$index];
			$$renderer.push(`<article class="list-item"><div><strong>${escape_html(player.name)}</strong> <p>${escape_html(player.club)} · rating ${escape_html(player.rating)}</p></div> <div class="actions compact"><button type="button" class="secondary">Edit</button> <button type="button" class="danger">Delete</button></div></article>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="card"><div class="section-heading"><h2>Tournament setup</h2> <p>Create events and choose which players will compete.</p></div> <form class="stack"><input${attr("value", tournamentForm.name)} placeholder="Tournament name"/> <input${attr("value", tournamentForm.date)} type="date"/> <div class="actions"><button type="submit">${escape_html("Create tournament")}</button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></form> <div class="list"><!--[-->`);
		const each_array_1 = ensure_array_like(tournaments);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let tournament = each_array_1[$$index_1];
			$$renderer.push(`<article class="list-item tournament-item"><button type="button" class="ghost"><div><strong>${escape_html(tournament.name)}</strong> <p>${escape_html(tournament.date)} · ${escape_html(tournament.players.length)} players</p></div></button> <div class="actions compact"><button type="button" class="secondary">Edit</button> <button type="button" class="danger">Delete</button></div></article>`);
		}
		$$renderer.push(`<!--]--></div></div></section> `);
		if (currentTournament) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="card wide-card"><div class="section-heading"><h2>${escape_html(currentTournament.name)}</h2> <p>${escape_html(currentTournament.date)}</p></div> <div class="assign-grid"><div><h3>Assigned players</h3> <div class="list"><!--[-->`);
			const each_array_2 = ensure_array_like(currentTournament.players);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let playerId = each_array_2[$$index_2];
				const player = players.find((entry) => entry.id === playerId);
				if (player) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<article class="list-item"><div><strong>${escape_html(player.name)}</strong> <p>${escape_html(player.club)}</p></div> <button type="button" class="secondary">Remove</button></article>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div></div> <div><h3>Available players</h3> <div class="list"><!--[-->`);
			const each_array_3 = ensure_array_like(players);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let player = each_array_3[$$index_3];
				if (!currentTournament.players.includes(player.id)) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<article class="list-item"><div><strong>${escape_html(player.name)}</strong> <p>${escape_html(player.club)}</p></div> <button type="button" class="secondary">Add</button></article>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div></div></div> <div class="actions match-actions"><button type="button">Generate random matches</button></div> `);
			if (currentTournament.matches.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="matches-grid"><div><h3>Results</h3> <div class="list"><!--[-->`);
				const each_array_4 = ensure_array_like(currentTournament.matches);
				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let match = each_array_4[$$index_4];
					const winner = players.find((entry) => entry.id === match.winner);
					const playerA = players.find((entry) => entry.id === match.playerA);
					const playerB = players.find((entry) => entry.id === match.playerB);
					$$renderer.push(`<article class="list-item"><div><strong>Round ${escape_html(match.round)}</strong> <p>${escape_html(playerA?.name ?? "Unknown")} vs ${escape_html(playerB?.name ?? "Unknown")} · winner ${escape_html(winner?.name ?? "Unknown")}</p></div></article>`);
				}
				$$renderer.push(`<!--]--></div></div> <div><h3>Final rankings</h3> <div class="podium"><!--[-->`);
				const each_array_5 = ensure_array_like(ranking.slice(0, 3));
				for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
					let entry = each_array_5[index];
					$$renderer.push(`<article class="podium-place"><span class="placement">${escape_html(index + 1)}${escape_html(index === 0 ? "st" : index === 1 ? "nd" : "rd")}</span> <strong>${escape_html(entry.name)}</strong> <p>${escape_html(entry.wins)} wins · ${escape_html(entry.points)} points</p></article>`);
				}
				$$renderer.push(`<!--]--></div></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></main>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BXRI60u2.js.map
