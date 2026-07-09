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

  let players: Player[] = [];
  let tournaments: Tournament[] = [];
  let selectedTournamentId = '';
  let playerForm = { name: '', rating: '', club: '' };
  let playerEditId: string | null = null;
  let tournamentForm = { name: '', date: '' };
  let tournamentEditId: string | null = null;

  onMount(async () => {
    await loadState();
  });

  function createId(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function normalizeTournament(tournament: any): Tournament {
    return {
      ...tournament,
      players: typeof tournament.players === 'string' ? JSON.parse(tournament.players) : tournament.players || [],
      matches: typeof tournament.matches === 'string' ? JSON.parse(tournament.matches) : tournament.matches || []
    };
  }

  async function loadState() {
    const currentId = selectedTournamentId;
    const [playerRes, tournamentRes] = await Promise.all([
      fetch('/api/players'),
      fetch('/api/tournaments')
    ]);

    players = await playerRes.json();
    const rawTournaments = await tournamentRes.json();
    tournaments = rawTournaments.map(normalizeTournament);
    selectedTournamentId = tournaments.find((entry) => entry.id === currentId)?.id ?? tournaments[0]?.id ?? '';
  }

  function resetPlayerForm() {
    playerForm = { name: '', rating: '', club: '' };
    playerEditId = null;
  }

  async function handlePlayerSubmit() {
    const trimmedName = playerForm.name.trim();
    const trimmedClub = playerForm.club.trim();
    const ratingValue = Number(playerForm.rating) || 1200;

    if (!trimmedName) return;

    if (playerEditId) {
      await fetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playerEditId, name: trimmedName, club: trimmedClub || 'Independent', rating: ratingValue })
      });
    } else {
      await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: createId('player'), name: trimmedName, club: trimmedClub || 'Independent', rating: ratingValue })
      });
    }

    await loadState();
    resetPlayerForm();
  }

  function editPlayer(player: Player) {
    playerForm = { name: player.name, rating: String(player.rating), club: player.club };
    playerEditId = player.id;
  }

  async function deletePlayer(playerId: string) {
    await fetch('/api/players', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: playerId })
    });
    await loadState();
  }

  function resetTournamentForm() {
    tournamentForm = { name: '', date: '' };
    tournamentEditId = null;
  }

  async function handleTournamentSubmit() {
    const trimmedName = tournamentForm.name.trim();
    const trimmedDate = tournamentForm.date.trim();

    if (!trimmedName) return;

    if (tournamentEditId) {
      const existingTournament = tournaments.find((entry) => entry.id === tournamentEditId);
      await fetch('/api/tournaments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tournamentEditId,
          name: trimmedName,
          date: trimmedDate || 'TBD',
          players: existingTournament?.players ?? [],
          matches: existingTournament?.matches ?? []
        })
      });
    } else {
      await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: createId('tournament'), name: trimmedName, date: trimmedDate || 'TBD', players: [], matches: [] })
      });
    }

    await loadState();
    resetTournamentForm();
  }

  function editTournament(tournament: Tournament) {
    tournamentForm = { name: tournament.name, date: tournament.date };
    tournamentEditId = tournament.id;
    selectedTournamentId = tournament.id;
  }

  async function deleteTournament(tournamentId: string) {
    await fetch('/api/tournaments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tournamentId })
    });
    await loadState();
  }

  async function togglePlayerInTournament(playerId: string) {
    const tournament = tournaments.find((entry) => entry.id === selectedTournamentId);
    if (!tournament) return;

    const currentPlayers = Array.isArray(tournament.players)
      ? tournament.players
      : JSON.parse(tournament.players as unknown as string);

    const nextPlayers = currentPlayers.includes(playerId)
      ? currentPlayers.filter((id) => id !== playerId)
      : [...currentPlayers, playerId];

    const updatedTournament = { ...tournament, id: tournament.id, players: nextPlayers, matches: [] };
    const response = await fetch('/api/tournaments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTournament)
    });

    if (!response.ok) {
      console.error('Failed to update tournament players', await response.text());
      return;
    }

    await loadState();
  }

  async function generateMatches() {
    const tournament = tournaments.find((entry) => entry.id === selectedTournamentId);
    if (!tournament) return;

    const currentPlayers = Array.isArray(tournament.players)
      ? tournament.players
      : JSON.parse(tournament.players as unknown as string);

    if (currentPlayers.length < 2) return;

    const shuffled = [...currentPlayers].sort(() => Math.random() - 0.5);
    const nextMatches: Match[] = [];

    for (let index = 0; index < shuffled.length - 1; index += 2) {
      const playerA = shuffled[index];
      const playerB = shuffled[index + 1];
      const winner = Math.random() > 0.5 ? playerA : playerB;
      nextMatches.push({ id: createId('match'), playerA, playerB, winner, round: Math.floor(index / 2) + 1 });
    }

    const updatedTournament = { ...tournament, players: currentPlayers, matches: nextMatches };
    const response = await fetch('/api/tournaments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTournament)
    });

    if (!response.ok) {
      console.error('Failed to update tournament matches', await response.text());
      return;
    }

    await loadState();
  }

  $: currentTournament = tournaments.find((entry) => entry.id === selectedTournamentId) ?? null;
  $: canGenerateMatches = currentTournament?.players.length >= 2;
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
      <div class="hero-stats">
        <div>
          <span>Total players</span>
          <strong>{players.length}</strong>
        </div>
        <div>
          <span>Active tournaments</span>
          <strong>{tournaments.length}</strong>
        </div>
        <div>
          <span>Current event</span>
          <strong>{currentTournament ? currentTournament.name : 'None'}</strong>
        </div>
      </div>
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
        <button type="button" on:click={generateMatches} disabled={!canGenerateMatches}>
          Generate random matches
        </button>
        {#if currentTournament && currentTournament.players.length < 2}
          <p class="help-text">Add at least 2 players to this tournament before generating matches.</p>
        {/if}
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
