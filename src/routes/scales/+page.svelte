<script lang="ts">
	import { onMount } from 'svelte';
	import type { Movie, ScalesRound, ScalesGameSave } from '$lib/types';
	import { getTodaysDateKey } from '$lib/daily';

	const STORAGE_KEY = 'screendle-scales';
	const TOTAL_ROUNDS = 10;

	let rounds: ScalesRound[] = $state([]);
	let currentRound = $state(0);
	let score = $state(0);
	let gameComplete = $state(false);
	let loading = $state(true);
	let error = $state('');
	let transitioning = $state(false);
	let loadingMessage = $state('Loading today\'s Scales...');

	onMount(async () => {
		const today = getTodaysDateKey();
		const saved = localStorage.getItem(STORAGE_KEY);

		if (saved) {
			try {
				const parsed: ScalesGameSave = JSON.parse(saved);
				if (parsed.date === today && parsed.rounds.length > 0) {
					rounds = parsed.rounds;
					currentRound = parsed.currentRound;
					score = parsed.score;
					gameComplete = parsed.gameComplete;
					// Preload images for restored game too
					await preloadAllImages(parsed.rounds);
					loading = false;
					return;
				}
			} catch {
				// Invalid save, fetch fresh
			}
		}

		await fetchPairs();
	});

	function preloadImage(url: string): Promise<void> {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve();
			img.onerror = () => resolve(); // resolve anyway so we don't block
			img.src = url;
		});
	}

	async function preloadAllImages(roundsList: ScalesRound[]): Promise<void> {
		loadingMessage = 'Loading posters...';
		const urls: string[] = [];
		for (const round of roundsList) {
			if (round.movieA.poster_path) urls.push(posterUrl(round.movieA.poster_path));
			if (round.movieB.poster_path) urls.push(posterUrl(round.movieB.poster_path));
		}
		await Promise.all(urls.map(preloadImage));
	}

	async function fetchPairs() {
		loading = true;
		error = '';
		loadingMessage = 'Loading today\'s Scales...';

		try {
			const response = await fetch('/api/scales');
			if (!response.ok) throw new Error('Failed to fetch pairs');

			const data = await response.json();
			const pairs: { movieA: Movie; movieB: Movie }[] = data.pairs;

			const newRounds: ScalesRound[] = pairs.map((pair) => ({
				movieA: pair.movieA,
				movieB: pair.movieB,
				correctAnswer: pair.movieA.imdb_rating >= pair.movieB.imdb_rating ? 'A' : 'B',
				userAnswer: null,
				revealed: false
			}));

			// Preload all poster images before starting
			await preloadAllImages(newRounds);

			rounds = newRounds;
			currentRound = 0;
			score = 0;
			gameComplete = false;
			saveGame();
		} catch (e) {
			console.error('Failed to load Scales:', e);
			error = 'Failed to load today\'s Scales. Please try refreshing.';
		} finally {
			loading = false;
		}
	}

	function saveGame() {
		const save: ScalesGameSave = {
			date: getTodaysDateKey(),
			rounds,
			currentRound,
			score,
			gameComplete
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
	}

	function pickMovie(choice: 'A' | 'B') {
		if (transitioning || gameComplete || rounds.length === 0) return;
		if (rounds[currentRound].revealed) return;

		const round = rounds[currentRound];
		round.userAnswer = choice;
		round.revealed = true;

		if (choice === round.correctAnswer) {
			score++;
		}

		// Trigger reactivity
		rounds = [...rounds];
		saveGame();

		// Auto-advance after delay
		transitioning = true;
		setTimeout(() => {
			if (currentRound + 1 >= rounds.length) {
				gameComplete = true;
				saveGame();
			} else {
				currentRound++;
				saveGame();
			}
			transitioning = false;
		}, 2000);
	}

	function posterUrl(path: string | null): string {
		if (!path) return '';
		return `https://image.tmdb.org/t/p/w300${path}`;
	}

	function imdbUrl(imdbId: string | null): string {
		if (!imdbId) return '';
		return `https://www.imdb.com/title/${imdbId}/`;
	}

	let currentRoundData = $derived(rounds.length > 0 ? rounds[currentRound] : null);
</script>

<main class="container mx-auto max-w-2xl px-4 py-8">
	<!-- Header -->
	<header class="mb-6 text-center">
		<a href="/" class="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">&larr; Back</a>
		<h1 class="mb-2 text-4xl font-bold tracking-tight">Screendle</h1>
		<p class="text-muted-foreground">Scales &mdash; Which has the higher IMDb rating?</p>
	</header>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">{loadingMessage}</div>
		</div>
	{:else if error}
		<div class="mx-auto max-w-md rounded-lg bg-red-500/20 p-6 text-center">
			<p class="text-red-400">{error}</p>
		</div>
	{:else if gameComplete}
		<!-- Final Score Screen -->
		<div class="text-center">
			<div class="rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 p-8 mb-6">
				<p class="text-sm text-muted-foreground mb-2">Final Score</p>
				<p class="text-6xl font-bold mb-2">
					<span class={score >= 7 ? 'text-green-400' : score >= 4 ? 'text-orange-400' : 'text-red-400'}>
						{score}
					</span>
					<span class="text-2xl text-muted-foreground">/ {rounds.length}</span>
				</p>
				<p class="text-sm text-muted-foreground">
					{#if score === rounds.length}
						Perfect score!
					{:else if score >= 8}
						Excellent!
					{:else if score >= 6}
						Nice work!
					{:else if score >= 4}
						Not bad!
					{:else}
						Better luck tomorrow!
					{/if}
				</p>
			</div>

			<!-- Round History Grid -->
			<div class="flex justify-center gap-1.5 mb-8">
				{#each rounds as round, i}
					<div
						class="w-8 h-8 rounded flex items-center justify-center text-xs font-bold
							{round.userAnswer === round.correctAnswer ? 'bg-green-500/30 text-green-400 border border-green-500/50' : 'bg-red-500/30 text-red-400 border border-red-500/50'}"
					>
						{i + 1}
					</div>
				{/each}
			</div>

			<!-- Pair List -->
			<div class="mb-8 space-y-3 text-left">
				{#each rounds as round, i}
					{@const correct = round.userAnswer === round.correctAnswer}
					{@const winner = round.correctAnswer === 'A' ? round.movieA : round.movieB}
					{@const loser = round.correctAnswer === 'A' ? round.movieB : round.movieA}
					<div class="rounded-lg bg-black/30 border {correct ? 'border-green-500/30' : 'border-red-500/30'} p-3 flex items-center gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold {correct ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'}">
							{i + 1}
						</div>
						<div class="flex-1 min-w-0 text-sm">
							<div class="flex items-baseline gap-1.5">
								<span class="font-semibold text-green-400 truncate">{winner.title}</span>
								<span class="text-xs text-muted-foreground flex-shrink-0">({winner.imdb_rating.toFixed(1)})</span>
								{#if winner.imdb_id}
									<a href={imdbUrl(winner.imdb_id)} target="_blank" rel="noopener noreferrer" class="text-xs text-blue-400 hover:text-blue-300 flex-shrink-0">IMDb</a>
								{/if}
							</div>
							<div class="flex items-baseline gap-1.5">
								<span class="text-muted-foreground truncate">{loser.title}</span>
								<span class="text-xs text-muted-foreground flex-shrink-0">({loser.imdb_rating.toFixed(1)})</span>
								{#if loser.imdb_id}
									<a href={imdbUrl(loser.imdb_id)} target="_blank" rel="noopener noreferrer" class="text-xs text-blue-400 hover:text-blue-300 flex-shrink-0">IMDb</a>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<a
				href="/"
				class="inline-block rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
			>
				Back to Home
			</a>
		</div>
	{:else if currentRoundData}
		<!-- Progress Bar -->
		<div class="flex gap-1.5 mb-6">
			{#each rounds as round, i}
				<div
					class="h-2 flex-1 rounded-full transition-colors
						{i < currentRound
							? round.userAnswer === round.correctAnswer
								? 'bg-green-500'
								: 'bg-red-500'
							: i === currentRound
								? 'bg-orange-500'
								: 'bg-white/10'}"
				></div>
			{/each}
		</div>

		<!-- Score + Round Counter -->
		<div class="flex justify-between items-center mb-6 text-sm text-muted-foreground">
			<span>Round {currentRound + 1} / {rounds.length}</span>
			<span>Score: {score} / {currentRound + (currentRoundData.revealed ? 1 : 0)}</span>
		</div>

		<!-- Movie Cards -->
		<div class="grid grid-cols-2 gap-4">
			<!-- Movie A -->
			<button
				onclick={() => pickMovie('A')}
				disabled={currentRoundData.revealed || transitioning}
				class="group rounded-xl bg-black/40 backdrop-blur-sm border p-4 text-center transition-all
					{currentRoundData.revealed
						? currentRoundData.correctAnswer === 'A'
							? 'border-green-500/60 bg-green-500/10'
							: currentRoundData.userAnswer === 'A'
								? 'border-red-500/60 bg-red-500/10'
								: 'border-white/10'
						: 'border-white/10 hover:border-orange-500/50 hover:bg-black/50 cursor-pointer'}"
			>
				{#if currentRoundData.movieA.poster_path}
					<img
						src={posterUrl(currentRoundData.movieA.poster_path)}
						alt={currentRoundData.movieA.title}
						class="mx-auto mb-3 w-32 rounded-lg shadow-lg sm:w-40"
					/>
				{:else}
					<div class="mx-auto mb-3 w-32 h-48 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground sm:w-40 sm:h-60">
						No Poster
					</div>
				{/if}
				<h3 class="font-bold text-sm sm:text-base">{currentRoundData.movieA.title}</h3>
				<p class="text-xs text-muted-foreground">{currentRoundData.movieA.year}</p>

				{#if currentRoundData.revealed}
					<div class="mt-3">
						<span class="text-lg font-bold {currentRoundData.correctAnswer === 'A' ? 'text-green-400' : 'text-muted-foreground'}">
							{currentRoundData.movieA.imdb_rating.toFixed(1)}
						</span>
						{#if currentRoundData.correctAnswer === 'A'}
							<span class="ml-1 text-xs font-semibold text-green-400">Higher!</span>
						{/if}
					</div>
				{/if}
			</button>

			<!-- Movie B -->
			<button
				onclick={() => pickMovie('B')}
				disabled={currentRoundData.revealed || transitioning}
				class="group rounded-xl bg-black/40 backdrop-blur-sm border p-4 text-center transition-all
					{currentRoundData.revealed
						? currentRoundData.correctAnswer === 'B'
							? 'border-green-500/60 bg-green-500/10'
							: currentRoundData.userAnswer === 'B'
								? 'border-red-500/60 bg-red-500/10'
								: 'border-white/10'
						: 'border-white/10 hover:border-orange-500/50 hover:bg-black/50 cursor-pointer'}"
			>
				{#if currentRoundData.movieB.poster_path}
					<img
						src={posterUrl(currentRoundData.movieB.poster_path)}
						alt={currentRoundData.movieB.title}
						class="mx-auto mb-3 w-32 rounded-lg shadow-lg sm:w-40"
					/>
				{:else}
					<div class="mx-auto mb-3 w-32 h-48 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground sm:w-40 sm:h-60">
						No Poster
					</div>
				{/if}
				<h3 class="font-bold text-sm sm:text-base">{currentRoundData.movieB.title}</h3>
				<p class="text-xs text-muted-foreground">{currentRoundData.movieB.year}</p>

				{#if currentRoundData.revealed}
					<div class="mt-3">
						<span class="text-lg font-bold {currentRoundData.correctAnswer === 'B' ? 'text-green-400' : 'text-muted-foreground'}">
							{currentRoundData.movieB.imdb_rating.toFixed(1)}
						</span>
						{#if currentRoundData.correctAnswer === 'B'}
							<span class="ml-1 text-xs font-semibold text-green-400">Higher!</span>
						{/if}
					</div>
				{/if}
			</button>
		</div>

		<!-- Feedback after pick -->
		{#if currentRoundData.revealed}
			<div class="mt-4 text-center text-sm">
				{#if currentRoundData.userAnswer === currentRoundData.correctAnswer}
					<span class="text-green-400 font-semibold">Correct!</span>
				{:else}
					<span class="text-red-400 font-semibold">Wrong!</span>
				{/if}
			</div>
		{/if}
	{/if}
</main>
