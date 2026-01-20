<script lang="ts">
	import { onMount } from 'svelte';
	import type { GuessResult, Movie, GameSave } from '$lib/types';
	import { getTodaysDateKey } from '$lib/daily';
	import GameRow from '$lib/components/GameRow.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';

	// Column headers for the property grid
	const columns = [
		{ key: 'poster', label: '', width: 'w-16' },
		{ key: 'genre', label: 'Genre', width: 'w-28' },
		{ key: 'year', label: 'Year', width: 'w-20' },
		{ key: 'runtime', label: 'Runtime', width: 'w-20' },
		{ key: 'imdb_rating', label: 'IMDb', width: 'w-20' },
		{ key: 'director', label: 'Director', width: 'w-32' },
		{ key: 'keywords', label: 'Keywords', width: 'w-32' },
		{ key: 'country', label: 'Country', width: 'w-24' }
	];

	const STORAGE_KEY = 'screendle-game';

	// Game state
	let guesses: GuessResult[] = $state([]);
	let gameOver = $state(false);
	let won = $state(false);
	let targetMovie: Movie | null = $state(null);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		await loadGame();
	});

	async function loadGame() {
		loading = true;
		error = '';

		try {
			// Fetch today's movie
			const response = await fetch('/api/daily');
			if (!response.ok) {
				throw new Error('Failed to fetch daily movie');
			}
			const data = await response.json();
			targetMovie = data.movie;

			// Load saved game state from localStorage
			const todayKey = getTodaysDateKey();
			const savedData = localStorage.getItem(STORAGE_KEY);

			if (savedData) {
				const saved: GameSave = JSON.parse(savedData);
				// Only restore if it's from today and matches the target movie
				if (saved.date === todayKey && saved.targetMovieId === targetMovie?.id) {
					guesses = saved.guesses;
					gameOver = saved.gameOver;
					won = saved.won;
				}
			}
		} catch (e) {
			console.error('Failed to load game:', e);
			error = 'Failed to load today\'s puzzle. Please try refreshing.';
		} finally {
			loading = false;
		}
	}

	function saveGame() {
		if (!targetMovie) return;

		const save: GameSave = {
			date: getTodaysDateKey(),
			targetMovieId: targetMovie.id,
			guesses,
			gameOver,
			won
		};

		localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
	}

	function handleGuess(movie: Movie) {
		if (gameOver || !targetMovie) return;

		// Check if already guessed this movie
		if (guesses.some(g => g.movie.id === movie.id)) {
			return;
		}

		// Compare the guessed movie with target
		const result = compareMovies(movie, targetMovie);
		guesses = [...guesses, result];

		// Check win condition
		if (movie.id === targetMovie.id) {
			gameOver = true;
			won = true;
		} else if (guesses.length >= 10) {
			gameOver = true;
			won = false;
		}

		// Save to localStorage
		saveGame();
	}

	function compareMovies(guess: Movie, target: Movie): GuessResult {
		return {
			movie: guess,
			matches: {
				genre: {
					value: guess.genres,
					match: arraysEqual(guess.genres, target.genres)
						? 'exact'
						: arraysOverlap(guess.genres, target.genres)
							? 'partial'
							: 'none'
				},
				year: {
					value: guess.year,
					match: guess.year === target.year ? 'exact' : 'none',
					direction: guess.year === target.year ? 'match' : guess.year < target.year ? 'up' : 'down'
				},
				runtime: {
					value: guess.runtime,
					match: Math.abs(guess.runtime - target.runtime) <= 5 ? 'exact' : 'none',
					direction:
						Math.abs(guess.runtime - target.runtime) <= 5
							? 'match'
							: guess.runtime < target.runtime
								? 'up'
								: 'down'
				},
				imdb_rating: {
					value: guess.imdb_rating,
					match: guess.imdb_rating === target.imdb_rating ? 'exact' : 'none',
					direction:
						guess.imdb_rating === target.imdb_rating
							? 'match'
							: guess.imdb_rating < target.imdb_rating
								? 'up'
								: 'down'
				},
				director: {
					value: guess.director,
					match: guess.director.toLowerCase() === target.director.toLowerCase() ? 'exact' : 'none'
				},
				keywords: {
					value: guess.keywords,
					match: arraysEqual(guess.keywords, target.keywords)
						? 'exact'
						: arraysOverlap(guess.keywords, target.keywords)
							? 'partial'
							: 'none'
				},
				country: {
					value: guess.country,
					match: guess.country.toLowerCase() === target.country.toLowerCase() ? 'exact' : 'none'
				}
			}
		};
	}

	function arraysEqual(a: string[], b: string[]): boolean {
		if (a.length !== b.length) return false;
		const sortedA = [...a].sort();
		const sortedB = [...b].sort();
		return sortedA.every((val, i) => val.toLowerCase() === sortedB[i].toLowerCase());
	}

	function arraysOverlap(a: string[], b: string[]): boolean {
		const lowerB = b.map((s) => s.toLowerCase());
		return a.some((item) => lowerB.includes(item.toLowerCase()));
	}

	// Compute accumulated clues from all guesses
	interface AccumulatedClues {
		yearMin: number | null;
		yearMax: number | null;
		runtimeMin: number | null;
		runtimeMax: number | null;
		imdbMin: number | null;
		imdbMax: number | null;
		possibleGenres: string[];
		possibleKeywords: string[];
		knownDirector: string | null;
		knownCountry: string | null;
	}

	let clues = $derived.by((): AccumulatedClues => {
		const result: AccumulatedClues = {
			yearMin: null,
			yearMax: null,
			runtimeMin: null,
			runtimeMax: null,
			imdbMin: null,
			imdbMax: null,
			possibleGenres: [],
			possibleKeywords: [],
			knownDirector: null,
			knownCountry: null
		};

		const matchingGenres: string[][] = [];
		const matchingKeywords: string[][] = [];

		for (const guess of guesses) {
			const { matches } = guess;

			// Year constraints
			if (matches.year.direction === 'up') {
				// Target is higher than guess
				const val = matches.year.value as number;
				result.yearMin = result.yearMin ? Math.max(result.yearMin, val + 1) : val + 1;
			} else if (matches.year.direction === 'down') {
				// Target is lower than guess
				const val = matches.year.value as number;
				result.yearMax = result.yearMax ? Math.min(result.yearMax, val - 1) : val - 1;
			} else if (matches.year.match === 'exact') {
				result.yearMin = matches.year.value as number;
				result.yearMax = matches.year.value as number;
			}

			// Runtime constraints
			if (matches.runtime.direction === 'up') {
				const val = matches.runtime.value as number;
				result.runtimeMin = result.runtimeMin ? Math.max(result.runtimeMin, val + 1) : val + 1;
			} else if (matches.runtime.direction === 'down') {
				const val = matches.runtime.value as number;
				result.runtimeMax = result.runtimeMax ? Math.min(result.runtimeMax, val - 1) : val - 1;
			} else if (matches.runtime.match === 'exact') {
				result.runtimeMin = matches.runtime.value as number;
				result.runtimeMax = matches.runtime.value as number;
			}

			// IMDb constraints
			if (matches.imdb_rating.direction === 'up') {
				const val = matches.imdb_rating.value as number;
				result.imdbMin = result.imdbMin ? Math.max(result.imdbMin, val) : val;
			} else if (matches.imdb_rating.direction === 'down') {
				const val = matches.imdb_rating.value as number;
				result.imdbMax = result.imdbMax ? Math.min(result.imdbMax, val) : val;
			} else if (matches.imdb_rating.match === 'exact') {
				result.imdbMin = matches.imdb_rating.value as number;
				result.imdbMax = matches.imdb_rating.value as number;
			}

			// Collect partial/exact genre matches
			if (matches.genre.match === 'partial' || matches.genre.match === 'exact') {
				matchingGenres.push(matches.genre.value as string[]);
			}

			// Collect partial/exact keyword matches
			if (matches.keywords.match === 'partial' || matches.keywords.match === 'exact') {
				matchingKeywords.push(matches.keywords.value as string[]);
			}

			// Exact matches
			if (matches.director.match === 'exact') {
				result.knownDirector = matches.director.value as string;
			}
			if (matches.country.match === 'exact') {
				result.knownCountry = matches.country.value as string;
			}
		}

		// Find common genres across all partial matches
		if (matchingGenres.length > 0) {
			result.possibleGenres = matchingGenres.reduce((acc, genres) => {
				if (acc.length === 0) return genres;
				return acc.filter(g => genres.some(g2 => g2.toLowerCase() === g.toLowerCase()));
			}, [] as string[]);
		}

		// Find common keywords across all partial matches
		if (matchingKeywords.length > 0) {
			result.possibleKeywords = matchingKeywords.reduce((acc, keywords) => {
				if (acc.length === 0) return keywords;
				return acc.filter(k => keywords.some(k2 => k2.toLowerCase() === k.toLowerCase()));
			}, [] as string[]);
		}

		return result;
	});

	function hasClues(c: AccumulatedClues): boolean {
		return c.yearMin !== null || c.yearMax !== null ||
			c.runtimeMin !== null || c.runtimeMax !== null ||
			c.imdbMin !== null || c.imdbMax !== null ||
			c.possibleGenres.length > 0 || c.possibleKeywords.length > 0 ||
			c.knownDirector !== null || c.knownCountry !== null;
	}
</script>

<main class="container mx-auto max-w-5xl px-4 py-8">
	<!-- Header -->
	<header class="mb-8 text-center">
		<h1 class="mb-2 text-4xl font-bold tracking-tight">Screendle</h1>
		<p class="text-muted-foreground">Guess the movie of the day</p>
	</header>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading today's puzzle...</div>
		</div>
	{:else if error}
		<div class="mx-auto max-w-md rounded-lg bg-red-500/20 p-6 text-center">
			<p class="text-red-400">{error}</p>
		</div>
	{:else}
		<!-- Search Input -->
		<div class="mx-auto mb-8 max-w-md">
			<SearchInput onSelect={handleGuess} disabled={gameOver} guessedIds={guesses.map(g => g.movie.id)} />
		</div>

		<!-- Game Board -->
		<div class="overflow-x-auto">
			<!-- Column Headers -->
			<div class="mb-2 flex gap-2">
				{#each columns as col}
					<div
						class="{col.width} flex-shrink-0 rounded-lg bg-black/40 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm"
					>
						{col.label}
					</div>
				{/each}
			</div>

			<!-- Guess Rows -->
			<div class="flex flex-col gap-2">
				{#each guesses as guess, index}
					<GameRow result={guess} delay={index * 0.1} />
				{/each}
			</div>

			<!-- Empty state -->
			{#if guesses.length === 0}
				<div class="mt-8 text-center text-muted-foreground">
					<p>Start typing a movie title to make your first guess!</p>
				</div>
			{/if}
		</div>

		<!-- Win/Lose Message -->
		{#if gameOver && targetMovie}
			<div class="mt-8 text-center">
				{#if won}
					<div class="rounded-lg bg-green-500/20 p-6 backdrop-blur-sm">
						<h2 class="text-2xl font-bold text-green-400">Congratulations!</h2>
						<p class="mt-2 text-muted-foreground">
							You guessed <span class="font-semibold text-foreground">{targetMovie.title}</span> in {guesses.length}
							{guesses.length === 1 ? 'try' : 'tries'}!
						</p>
					</div>
				{:else}
					<div class="rounded-lg bg-red-500/20 p-6 backdrop-blur-sm">
						<h2 class="text-2xl font-bold text-red-400">Game Over</h2>
						<p class="mt-2 text-muted-foreground">
							The movie was <span class="font-semibold text-foreground">{targetMovie.title}</span>
						</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Clue Accumulator -->
		{#if guesses.length > 0 && hasClues(clues) && !gameOver}
			<div class="mt-6 rounded-lg bg-blue-500/10 border border-blue-500/30 p-4 backdrop-blur-sm">
				<h3 class="text-sm font-semibold text-blue-400 mb-2">Accumulated Clues</h3>
				<div class="flex flex-wrap gap-3 text-xs">
					{#if clues.yearMin !== null || clues.yearMax !== null}
						<div class="bg-black/30 rounded px-2 py-1">
							<span class="text-muted-foreground">Year:</span>
							<span class="text-foreground ml-1">
								{#if clues.yearMin === clues.yearMax}
									{clues.yearMin}
								{:else}
									{clues.yearMin ?? '?'} - {clues.yearMax ?? '?'}
								{/if}
							</span>
						</div>
					{/if}
					{#if clues.runtimeMin !== null || clues.runtimeMax !== null}
						<div class="bg-black/30 rounded px-2 py-1">
							<span class="text-muted-foreground">Runtime:</span>
							<span class="text-foreground ml-1">
								{#if clues.runtimeMin === clues.runtimeMax}
									{clues.runtimeMin}m
								{:else}
									{clues.runtimeMin ?? '?'} - {clues.runtimeMax ?? '?'}m
								{/if}
							</span>
						</div>
					{/if}
					{#if clues.imdbMin !== null || clues.imdbMax !== null}
						<div class="bg-black/30 rounded px-2 py-1">
							<span class="text-muted-foreground">IMDb:</span>
							<span class="text-foreground ml-1">
								{#if clues.imdbMin === clues.imdbMax}
									{clues.imdbMin}
								{:else}
									{clues.imdbMin ?? '?'} - {clues.imdbMax ?? '?'}
								{/if}
							</span>
						</div>
					{/if}
					{#if clues.possibleGenres.length > 0}
						<div class="bg-black/30 rounded px-2 py-1">
							<span class="text-muted-foreground">Genres:</span>
							<span class="text-orange-400 ml-1">{clues.possibleGenres.join(', ')}</span>
						</div>
					{/if}
					{#if clues.possibleKeywords.length > 0}
						<div class="bg-black/30 rounded px-2 py-1">
							<span class="text-muted-foreground">Keywords:</span>
							<span class="text-orange-400 ml-1">{clues.possibleKeywords.slice(0, 5).join(', ')}{clues.possibleKeywords.length > 5 ? '...' : ''}</span>
						</div>
					{/if}
					{#if clues.knownDirector}
						<div class="bg-black/30 rounded px-2 py-1">
							<span class="text-muted-foreground">Director:</span>
							<span class="text-green-400 ml-1">{clues.knownDirector}</span>
						</div>
					{/if}
					{#if clues.knownCountry}
						<div class="bg-black/30 rounded px-2 py-1">
							<span class="text-muted-foreground">Country:</span>
							<span class="text-green-400 ml-1">{clues.knownCountry}</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Guess Counter -->
		<div class="mt-6 text-center text-sm text-muted-foreground">
			{guesses.length} / 10 guesses
		</div>
	{/if}
</main>
