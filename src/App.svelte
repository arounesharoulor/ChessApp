<script lang="ts">
  import { onMount } from 'svelte';

  type Player = {
    id: string;
    name: string;
    rating: number;
    club: string;
  };

  type Match = {
    id: string;
    playerA: string;
    playerB: string;
    winner: string;
    round: number;
  };

  type Tournament = {
    id: string;
    name: string;
    date: string;
    players: string[];
    matches: Match[];
  };

  const storageKey = 'chess-tournament-state-v1';

  let players: Player[] = [];
  let tournaments: Tournament[] = [];
  let selectedTournamentId = '';
  let playerForm = { name: '', rating: '', club: '' };
  let playerEditId: string | null = null;
  let tournamentForm = { name: '', date: '' };
  let tournamentEditId: string | null = null;

  onMount(() => {
    loadState();
  });

  function createId(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function loadState() {
    if (typeof window === 'undefined') return;

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      players = [
        { id: 'player-ava', name: 'Ava', rating: 2048, club: 'Royal Knights' },
        { id: 'player-jules', name: 'Jules', rating: 1987, club: 'City Chess Club' },
        { id: 'player-mia', name: 'Mia', rating: 1876, club: 'North End' },
        { id: 'player-noah', name: 'Noah', rating: 1923, club: 'Central Academy' }
      ];
      tournaments = [
        {
          id: 'tournament-summer',
          name: 'Summer Open',
          date: '2026-08-15',
          players: ['player-ava', 'player-jules', 'player-mia', 'player-noah'],
          matches: []
        }
      ];
      selectedTournamentId = tournaments[0].id;
      saveState();
      return;
    }

    const parsed = JSON.parse(raw);
    players = parsed.players ?? [];
    tournaments = parsed.tournaments ?? [];
    selectedTournamentId = parsed.selectedTournamentId ?? tournaments[0]?.id ?? '';
  }

  function saveState() {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ players, tournaments, selectedTournamentId })
    );
  }

  function resetPlayerForm() {
    playerForm = { name: '', rating: '', club: '' };
    playerEditId = null;
  }

  function handlePlayerSubmit() {
    const trimmedName = playerForm.name.trim();
    const trimmedClub = playerForm.club.trim();
    const ratingValue = Number(playerForm.rating) || 1200;

    if (!trimmedName) return;

    if (playerEditId) {
      players = players.map((player) =>
        player.id === playerEditId
          ? { ...player, name: trimmedName, club: trimmedClub || 'Independent', rating: ratingValue }
          : player
      );
    } else {
      players = [
        { id: createId('player'), name: trimmedName, club: trimmedClub || 'Independent', rating: ratingValue },
        ...players
      ];
    }

    resetPlayerForm();
    saveState();
  }

  function editPlayer(player: Player) {
    playerForm = { name: player.name, rating: String(player.rating), club: player.club };
    playerEditId = player.id;
  }

  function deletePlayer(playerId: string) {
    players = players.filter((player) => player.id !== playerId);
    tournaments = tournaments.map((tournament) => ({
      ...tournament,
      players: tournament.players.filter((id) => id !== playerId),
      matches: tournament.matches.filter((match) => match.playerA !== playerId && match.playerB !== playerId)
    }));
    if (selectedTournamentId && !tournaments.some((tournament) => tournament.id === selectedTournamentId)) {
      selectedTournamentId = tournaments[0]?.id ?? '';
    }
    saveState();
  }

  function resetTournamentForm() {
    tournamentForm = { name: '', date: '' };
    tournamentEditId = null;
  }

  function handleTournamentSubmit() {
    const trimmedName = tournamentForm.name.trim();
    const trimmedDate = tournamentForm.date.trim();

    if (!trimmedName) return;

    if (tournamentEditId) {
      tournaments = tournaments.map((tournament) =>
        tournament.id === tournamentEditId
          ? { ...tournament, name: trimmedName, date: trimmedDate || 'TBD' }
          : tournament
      );
    } else {
      tournaments = [
        { id: createId('tournament'), name: trimmedName, date: trimmedDate || 'TBD', players: [], matches: [] },
        ...tournaments
      ];
      selectedTournamentId = tournaments[0].id;
    }

    resetTournamentForm();
    saveState();
  }

  function editTournament(tournament: Tournament) {
    tournamentForm = { name: tournament.name, date: tournament.date };
    tournamentEditId = tournament.id;
    selectedTournamentId = tournament.id;
  }

  function deleteTournament(tournamentId: string) {
    tournaments = tournaments.filter((tournament) => tournament.id !== tournamentId);
    if (selectedTournamentId === tournamentId) {
      selectedTournamentId = tournaments[0]?.id ?? '';
    }
    saveState();
  }

  function togglePlayerInTournament(playerId: string) {
    const tournament = tournaments.find((entry) => entry.id === selectedTournamentId);
    if (!tournament) return;

    const isAssigned = tournament.players.includes(playerId);
    const nextPlayers = isAssigned
      ? tournament.players.filter((id) => id !== playerId)
      : [...tournament.players, playerId];

    tournaments = tournaments.map((entry) =>
      entry.id === selectedTournamentId ? { ...entry, players: nextPlayers, matches: [] } : entry
    );
    saveState();
  }

  function generateMatches() {
    const tournament = tournaments.find((entry) => entry.id === selectedTournamentId);
    if (!tournament || tournament.players.length < 2) return;

    const shuffled = [...tournament.players].sort(() => Math.random() - 0.5);
    const nextMatches: Match[] = [];

    for (let index = 0; index < shuffled.length - 1; index += 2) {
      const playerA = shuffled[index];
      const playerB = shuffled[index + 1];
      const winner = Math.random() > 0.5 ? playerA : playerB;
      nextMatches.push({ id: createId('match'), playerA, playerB, winner, round: Math.floor(index / 2) + 1 });
    }

    tournaments = tournaments.map((entry) =>
      entry.id === selectedTournamentId ? { ...entry, matches: nextMatches } : entry
    );
    saveState();
  }

  $: currentTournament = tournaments.find((entry) => entry.id === selectedTournamentId) ?? null;
  $: ranking = (() => {
    if (!currentTournament) return [];

    const stats = new Map<string, { playerId: string; name: string; wins: number; losses: number; points: number }>();

    currentTournament.players.forEach((playerId) => {
      const player = players.find((entry) => entry.id === playerId);
      if (player) {
        stats.set(playerId, { playerId, name: player.name, wins: 0, losses: 0, points: 0 });
      }
    });

    currentTournament.matches.forEach((match) => {
      const winnerEntry = stats.get(match.winner);
      const loserId = match.winner === match.playerA ? match.playerB : match.playerA;
      const loserEntry = stats.get(loserId);

      if (winnerEntry) {
        winnerEntry.wins += 1;
        winnerEntry.points += 3;
      }
      if (loserEntry) {
        loserEntry.losses += 1;
      }
    });

    return [...stats.values()].sort((left, right) => right.points - left.points || right.wins - left.wins);
  })();
</script>

<svelte:head>
  <title>Chess Tournament Manager</title>
  <meta name="description" content="Manage players, tournaments, and random matches in one dashboard." />
</svelte:head>

<main class="app-shell">
  <section class="hero-card">
    <div>
      <p class="eyebrow">Chess Tournament Manager</p>
      <h1>Run your event from one place.</h1>
      <p class="hero-copy">
        Create players, build tournaments, assign competitors, generate random matches, and review the final podium.
      </p>
    </div>
    <div class="hero-badge">Live local demo</div>
  </section>

  <section class="grid-section">
    <div class="card">
      <div class="section-heading">
        <h2>Player management</h2>
        <p>Add, update, or remove fighters from the roster.</p>
      </div>

      <form class="stack" on:submit|preventDefault={handlePlayerSubmit}>
        <input bind:value={playerForm.name} placeholder="Player name" />
        <input bind:value={playerForm.club} placeholder="Club" />
        <input bind:value={playerForm.rating} type="number" placeholder="Rating" />
        <div class="actions">
          <button type="submit">{playerEditId ? 'Update player' : 'Add player'}</button>
          {#if playerEditId}
            <button type="button" class="secondary" on:click={resetPlayerForm}>Cancel</button>
          {/if}
        </div>
      </form>

      <div class="list">
        {#each players as player (player.id)}
          <article class="list-item">
            <div>
              <strong>{player.name}</strong>
              <p>{player.club} · rating {player.rating}</p>
            </div>
            <div class="actions compact">
              <button type="button" class="secondary" on:click={() => editPlayer(player)}>Edit</button>
              <button type="button" class="danger" on:click={() => deletePlayer(player.id)}>Delete</button>
            </div>
          </article>
        {/each}
      </div>
    </div>

    <div class="card">
      <div class="section-heading">
        <h2>Tournament setup</h2>
        <p>Create events and choose which players will compete.</p>
      </div>

      <form class="stack" on:submit|preventDefault={handleTournamentSubmit}>
        <input bind:value={tournamentForm.name} placeholder="Tournament name" />
        <input bind:value={tournamentForm.date} type="date" />
        <div class="actions">
          <button type="submit">{tournamentEditId ? 'Update tournament' : 'Create tournament'}</button>
          {#if tournamentEditId}
            <button type="button" class="secondary" on:click={resetTournamentForm}>Cancel</button>
          {/if}
        </div>
      </form>

      <div class="list">
        {#each tournaments as tournament (tournament.id)}
          <article class="list-item tournament-item">
            <button type="button" class="ghost" on:click={() => (selectedTournamentId = tournament.id)}>
              <div>
                <strong>{tournament.name}</strong>
                <p>{tournament.date} · {tournament.players.length} players</p>
              </div>
            </button>
            <div class="actions compact">
              <button type="button" class="secondary" on:click={() => editTournament(tournament)}>Edit</button>
              <button type="button" class="danger" on:click={() => deleteTournament(tournament.id)}>Delete</button>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  {#if currentTournament}
    <section class="card wide-card">
      <div class="section-heading">
        <h2>{currentTournament.name}</h2>
        <p>{currentTournament.date}</p>
      </div>

      <div class="assign-grid">
        <div>
          <h3>Assigned players</h3>
          <div class="list">
            {#each currentTournament.players as playerId (playerId)}
              {@const player = players.find((entry) => entry.id === playerId)}
              {#if player}
                <article class="list-item">
                  <div>
                    <strong>{player.name}</strong>
                    <p>{player.club}</p>
                  </div>
                  <button type="button" class="secondary" on:click={() => togglePlayerInTournament(player.id)}>Remove</button>
                </article>
              {/if}
            {/each}
          </div>
        </div>

        <div>
          <h3>Available players</h3>
          <div class="list">
            {#each players as player (player.id)}
              {#if !currentTournament.players.includes(player.id)}
                <article class="list-item">
                  <div>
                    <strong>{player.name}</strong>
                    <p>{player.club}</p>
                  </div>
                  <button type="button" class="secondary" on:click={() => togglePlayerInTournament(player.id)}>Add</button>
                </article>
              {/if}
            {/each}
          </div>
        </div>
      </div>

      <div class="actions match-actions">
        <button type="button" on:click={generateMatches}>Generate random matches</button>
      </div>

      {#if currentTournament.matches.length > 0}
        <div class="matches-grid">
          <div>
            <h3>Results</h3>
            <div class="list">
              {#each currentTournament.matches as match (match.id)}
                {@const winner = players.find((entry) => entry.id === match.winner)}
                {@const playerA = players.find((entry) => entry.id === match.playerA)}
                {@const playerB = players.find((entry) => entry.id === match.playerB)}
                <article class="list-item">
                  <div>
                    <strong>Round {match.round}</strong>
                    <p>{playerA?.name ?? 'Unknown'} vs {playerB?.name ?? 'Unknown'} · winner {winner?.name ?? 'Unknown'}</p>
                  </div>
                </article>
              {/each}
            </div>
          </div>

          <div>
            <h3>Final rankings</h3>
            <div class="podium">
              {#each ranking.slice(0, 3) as entry, index (entry.playerId)}
                <article class="podium-place">
                  <span class="placement">{index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'}</span>
                  <strong>{entry.name}</strong>
                  <p>{entry.wins} wins · {entry.points} points</p>
                </article>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </section>
  {/if}
</main>
