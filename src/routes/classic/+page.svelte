<script lang="ts">
	import { onMount } from 'svelte';
	import type { GuessResult, Movie, GameSave } from '$lib/types';
	import { getTodaysDateKey } from '$lib/daily';
	import GameRow from '$lib/components/GameRow.svelte';
	import CollapsedRow from '$lib/components/CollapsedRow.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import { Film, Calendar, Clock, Star, Clapperboard, Tag, Globe, ChevronDown, ChevronUp } from '@lucide/svelte';

	// Column headers for the property grid
	const columns = [
		{ key: 'number', label: '#', width: 'w-8', icon: null },
		{ key: 'poster', label: '', width: 'w-14', icon: null },
		{ key: 'genre', label: 'Genre', width: 'w-28', icon: Film },
		{ key: 'year', label: 'Year', width: 'w-20', icon: Calendar },
		{ key: 'runtime', label: 'Runtime', width: 'w-20', icon: Clock },
		{ key: 'imdb_rating', label: 'IMDb', width: 'w-20', icon: Star },
		{ key: 'director', label: 'Director', width: 'w-32', icon: Clapperboard },
		{ key: 'keywords', label: 'Keywords', width: 'w-32', icon: Tag },
		{ key: 'country', label: 'Country', width: 'w-24', icon: Globe }
	];

	const STORAGE_KEY = 'screendle-game';

	// Game state
	let guesses: GuessResult[] = $state([]);
	let gameOver = $state(false);
	let won = $state(false);
	let targetMovie: Movie | null = $state(null);
	let loading = $state(true);
	let error = $state('');
	let shareCopied = $state(false);
	let suggestions: Movie[] = $state([]);
	let suggestionsLoading = $state(false);
	let tableExpanded = $state(false);

	// Filter out guessed movies from suggestions
	let filteredSuggestions = $derived(
		suggestions.filter(m => !guesses.some(g => g.movie.id === m.id))
	);

	// Suggestion names for animated placeholder
	let suggestionNames = $derived(filteredSuggestions.map(m => m.title));

	async function loadSuggestions() {
		if (!targetMovie || suggestions.length > 0) return;
		suggestionsLoading = true;
		try {
			const genres = targetMovie.genres.join(',');
			const res = await fetch(`/api/suggestions?genres=${encodeURIComponent(genres)}&exclude=${targetMovie.id}`);
			if (res.ok) {
				const data = await res.json();
				suggestions = data.suggestions;
			}
		} catch { /* ignore */ }
		suggestionsLoading = false;
	}

	$effect(() => {
		if (targetMovie && !loading) {
			loadSuggestions();
		}
	});

	onMount(async () => {
		const today = getTodaysDateKey();
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed: GameSave = JSON.parse(saved);
				if (parsed.date === today) {
					// Fetch today's movie to populate targetMovie
					const res = await fetch('/api/daily');
					if (res.ok) {
						const data = await res.json();
						targetMovie = data.movie;
						guesses = parsed.guesses;
						gameOver = parsed.gameOver;
						won = parsed.won;
						loading = false;
						return;
					}
				}
			} catch { /* fall through to fresh game */ }
		}
		await loadGame();
	});

	async function loadGame() {
		loading = true;
		error = '';
		try {
			const response = await fetch('/api/daily');
			if (!response.ok) throw new Error('Failed to fetch movie');
			const data = await response.json();
			targetMovie = data.movie;
			guesses = [];
			gameOver = false;
			won = false;
		} catch (e) {
			console.error('Failed to load game:', e);
			error = "Failed to load today's puzzle. Please try refreshing.";
		} finally {
			loading = false;
		}
	}

	function buildShareText(): string {
		const date = getTodaysDateKey();
		const guessCount = won ? `${guesses.length}/10` : 'X/10';
		const emojiMap: Record<string, string> = { exact: '🟩', partial: '🟧', none: '🟥' };
		const rows = guesses.map(g => {
			const m = g.matches;
			return [m.genre, m.year, m.runtime, m.imdb_rating, m.director, m.keywords, m.country]
				.map(p => emojiMap[p.match])
				.join('');
		}).join('\n');
		return `Screendle Classic · ${date}\n${guessCount}\n\n${rows}\n\nscreendle.pages.dev/classic`;
	}

	async function share() {
		const text = buildShareText();
		try {
			await navigator.clipboard.writeText(text);
			shareCopied = true;
			setTimeout(() => { shareCopied = false; }, 2000);
		} catch {
			// fallback: select a textarea
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

		const wasSuggestion = suggestions.some(m => m.id === movie.id);

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

		// Fetch a replacement suggestion if one was used
		if (wasSuggestion && !gameOver) {
			fetchReplacementSuggestion();
		}
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
				const val = matches.year.value as number;
				result.yearMin = result.yearMin ? Math.max(result.yearMin, val + 1) : val + 1;
			} else if (matches.year.direction === 'down') {
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

	function formatRuntime(mins: number): string {
		if (mins < 60) return `${mins}m`;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return m === 0 ? `${mins}m (${h}hr)` : `${mins}m (${h}hr ${m}min)`;
	}

	function formatYearClue(min: number | null, max: number | null): { label: string; value: string } {
		if (min !== null && max !== null && min === max) return { label: 'Released in', value: `${min}` };
		if (min !== null && max !== null) {
			const lo = Math.min(min, max);
			const hi = Math.max(min, max);
			return { label: 'Released between', value: `${lo} and ${hi}` };
		}
		if (min !== null) return { label: 'Released after', value: `${min - 1}` };
		if (max !== null) return { label: 'Released before', value: `${max + 1}` };
		return { label: '', value: '' };
	}

	function formatRuntimeClue(min: number | null, max: number | null): { label: string; value: string } {
		if (min !== null && max !== null && min === max) return { label: 'Is', value: `${formatRuntime(min)} long` };
		if (min !== null && max !== null) {
			const lo = Math.min(min, max);
			const hi = Math.max(min, max);
			return { label: 'Between', value: `${formatRuntime(lo)} and ${formatRuntime(hi)}` };
		}
		if (min !== null) return { label: 'Longer than', value: formatRuntime(min - 1) };
		if (max !== null) return { label: 'Shorter than', value: formatRuntime(max + 1) };
		return { label: '', value: '' };
	}

	function formatRatingClue(min: number | null, max: number | null): { label: string; value: string } {
		if (min !== null && max !== null && min === max) return { label: 'Rated', value: `${min.toFixed(1)} on IMDb` };
		if (min !== null && max !== null) return { label: 'Rated between', value: `${min.toFixed(1)} and ${max.toFixed(1)}` };
		if (min !== null) return { label: 'Rated above', value: min.toFixed(1) };
		if (max !== null) return { label: 'Rated below', value: max.toFixed(1) };
		return { label: '', value: '' };
	}

	// Fetch a replacement suggestion matching accumulated clues
	async function fetchReplacementSuggestion() {
		if (!targetMovie || gameOver) return;

		const excludeIds = [
			targetMovie.id,
			...guesses.map(g => g.movie.id),
			...suggestions.map(m => m.id)
		].join(',');

		const params = new URLSearchParams({ limit: '1', excludeIds });

		// Add clue-based filters
		if (clues.possibleGenres.length > 0) {
			params.set('genres', clues.possibleGenres.join(','));
		}
		if (clues.yearMin !== null) params.set('yearMin', String(clues.yearMin));
		if (clues.yearMax !== null) params.set('yearMax', String(clues.yearMax));
		if (clues.runtimeMin !== null) params.set('runtimeMin', String(clues.runtimeMin));
		if (clues.runtimeMax !== null) params.set('runtimeMax', String(clues.runtimeMax));
		if (clues.imdbMin !== null) params.set('ratingMin', String(clues.imdbMin));
		if (clues.imdbMax !== null) params.set('ratingMax', String(clues.imdbMax));

		try {
			const res = await fetch(`/api/suggestions?${params}`);
			if (res.ok) {
				const data = await res.json();
				if (data.suggestions.length > 0) {
					suggestions = [...suggestions, ...data.suggestions];
				}
			}
		} catch { /* ignore */ }
	}
</script>

<main class="container mx-auto max-w-5xl px-4 py-8">
	<!-- Header -->
	<header class="mb-8 text-center">
		<h1 class="mb-2 text-4xl font-headline font-bold tracking-tight">Screendle</h1>
		<p class="text-text-cream/70">Classic &mdash; Guess the movie</p>
	</header>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading today's puzzle...</div>
		</div>
	{:else if error}
		<div class="mx-auto max-w-md rounded-lg bg-crt-red/20 p-6 text-center">
			<p class="text-crt-red">{error}</p>
		</div>
	{:else}

		<!-- Search Input -->
		<div class="mx-auto mb-6 max-w-md">
			<SearchInput
				onSelect={handleGuess}
				disabled={gameOver}
				guessedIds={guesses.map(g => g.movie.id)}
				placeholderNames={suggestionNames}
				guessCount={guesses.length > 0 ? `${guesses.length} / 10 guesses` : ''}
			/>
		</div>

		<!-- Suggestions Row — always visible while playing -->
		{#if filteredSuggestions.length > 0 && !gameOver}
			<div class="mx-auto mb-4 max-w-3xl">
				<p class="text-xs text-muted-foreground mb-2 text-center">
					{guesses.length === 0 ? 'Try one of these to get started:' : 'Quick picks:'}
				</p>
				<div class="flex justify-center gap-2 overflow-x-auto pb-1">
					{#each filteredSuggestions as movie}
						<MovieCard
							{movie}
							onclick={() => handleGuess(movie)}
							disabled={gameOver}
							flippable={false}
							class="w-28 flex-shrink-0"
						/>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Clues / Game Over — mutually exclusive, same slot -->
		{#if gameOver && targetMovie}
			<div class="mx-auto mb-6 max-w-3xl rounded-lg {won ? 'bg-green-600/10 border-green-600/30' : 'bg-red-600/10 border-red-600/30'} border p-4 backdrop-blur-sm">
				<h3 class="text-sm font-semibold {won ? 'text-green-400' : 'text-red-400'} mb-1">
					{won ? 'Congratulations!' : 'Game Over'}
				</h3>
				<p class="text-xs text-muted-foreground mb-3">
					{#if won}
						You guessed <span class="font-semibold text-foreground">{targetMovie.title}</span> in {guesses.length}
						{guesses.length === 1 ? 'try' : 'tries'}!
					{:else}
						The movie was <span class="font-semibold text-foreground">{targetMovie.title}</span>
					{/if}
				</p>
				<div class="flex flex-wrap gap-2">
					<button
						onclick={share}
						class="rounded bg-black/30 px-3 py-1.5 text-xs font-semibold hover:bg-black/50 transition-colors"
					>
						{shareCopied ? 'Copied!' : 'Share'}
					</button>
					<button
						onclick={() => fetch('/api/daily?random=true').then(r => r.json()).then(data => { targetMovie = data.movie; guesses = []; gameOver = false; won = false; })}
						class="rounded bg-black/30 px-3 py-1.5 text-xs font-semibold hover:bg-black/50 transition-colors"
					>
						New Game
					</button>
				</div>
			</div>
		{:else if guesses.length > 0 && hasClues(clues)}
			<div class="mx-auto mb-6 max-w-3xl rounded-lg bg-crt-cyan/10 border border-crt-cyan/30 p-4 backdrop-blur-sm">
				<h3 class="text-sm font-semibold text-crt-cyan mb-1">Accumulated Clues</h3>
				<p class="text-xs text-crt-cyan/60 mb-3">You are looking for a movie that:</p>
				<div class="flex flex-wrap gap-3 text-xs">
					{#if clues.yearMin !== null || clues.yearMax !== null}
						{@const yearExact = clues.yearMin !== null && clues.yearMax !== null && clues.yearMin === clues.yearMax}
						{@const yearClue = formatYearClue(clues.yearMin, clues.yearMax)}
						<div class="bg-black/30 rounded px-2 py-1 flex items-center gap-1.5">
							<Calendar class="w-3 h-3 text-muted-foreground flex-shrink-0" />
							<span class="text-foreground">{yearClue.label} </span><span class={yearExact ? 'text-green-400' : 'text-orange-400'}>{yearClue.value}</span>
						</div>
					{/if}
					{#if clues.runtimeMin !== null || clues.runtimeMax !== null}
						{@const runtimeExact = clues.runtimeMin !== null && clues.runtimeMax !== null && clues.runtimeMin === clues.runtimeMax}
						{@const runtimeClue = formatRuntimeClue(clues.runtimeMin, clues.runtimeMax)}
						<div class="bg-black/30 rounded px-2 py-1 flex items-center gap-1.5">
							<Clock class="w-3 h-3 text-muted-foreground flex-shrink-0" />
							<span class="text-foreground">{runtimeClue.label} </span><span class={runtimeExact ? 'text-green-400' : 'text-orange-400'}>{runtimeClue.value}</span>
						</div>
					{/if}
					{#if clues.imdbMin !== null || clues.imdbMax !== null}
						{@const imdbExact = clues.imdbMin !== null && clues.imdbMax !== null && clues.imdbMin === clues.imdbMax}
						{@const imdbClue = formatRatingClue(clues.imdbMin, clues.imdbMax)}
						<div class="bg-black/30 rounded px-2 py-1 flex items-center gap-1.5">
							<Star class="w-3 h-3 text-muted-foreground flex-shrink-0" />
							<span class="text-foreground">{imdbClue.label} </span><span class={imdbExact ? 'text-green-400' : 'text-orange-400'}>{imdbClue.value}</span>
						</div>
					{/if}
					{#if clues.possibleGenres.length > 0}
						<div class="bg-black/30 rounded px-2 py-1 flex items-center gap-1.5">
							<Film class="w-3 h-3 text-muted-foreground flex-shrink-0" />
							<span class="text-foreground">Includes </span><span class="text-orange-400">{clues.possibleGenres.join(', ')}</span>
						</div>
					{/if}
					{#if clues.possibleKeywords.length > 0}
						<div class="bg-black/30 rounded px-2 py-1 flex items-center gap-1.5">
							<Tag class="w-3 h-3 text-muted-foreground flex-shrink-0" />
							<span class="text-foreground">Tagged with </span><span class="text-orange-400">{clues.possibleKeywords.slice(0, 5).join(', ')}{clues.possibleKeywords.length > 5 ? '...' : ''}</span>
						</div>
					{/if}
					{#if clues.knownDirector}
						<div class="bg-black/30 rounded px-2 py-1 flex items-center gap-1.5">
							<Clapperboard class="w-3 h-3 text-muted-foreground flex-shrink-0" />
							<span class="text-foreground">Directed by </span><span class="text-green-400">{clues.knownDirector}</span>
						</div>
					{/if}
					{#if clues.knownCountry}
						<div class="bg-black/30 rounded px-2 py-1 flex items-center gap-1.5">
							<Globe class="w-3 h-3 text-muted-foreground flex-shrink-0" />
							<span class="text-foreground">Made in </span><span class="text-green-400">{clues.knownCountry}</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Game Board — hidden until first guess -->
		{#if guesses.length > 0}
			<div class="flex justify-center">
				<div class="overflow-x-auto inline-flex flex-col">
					<!-- Column Headers -->
					<div class="mb-2 flex gap-2">
						{#each columns as col}
							<div
								class="group {col.width} flex-shrink-0 rounded-lg bg-dark-surface/80 px-2 py-2
											 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground
											 backdrop-blur-sm flex items-center justify-center"
							>
								{#if col.icon}
									{@const Icon = col.icon}
									<Icon class="w-4 h-4 block group-hover:hidden" />
									<span class="hidden group-hover:block">{col.label}</span>
								{:else}
									{col.label}
								{/if}
							</div>
						{/each}
					</div>

					<!-- Guess Rows (newest first) -->
					<div class="flex flex-col gap-2">
						{#if gameOver && !won && targetMovie}
							<GameRow
								result={compareMovies(targetMovie, targetMovie)}
								guessNumber="A"
								delay={0}
							/>
						{/if}
						{#each [...guesses].reverse() as guess, i}
							{@const guessNum = guesses.length - i}
							{#if i === 0}
								<!-- Latest guess: always expanded -->
								<GameRow result={guess} guessNumber={guessNum} delay={0} />
							{:else if tableExpanded}
								<!-- Expanded mode: show full rows -->
								<GameRow result={guess} guessNumber={guessNum} delay={0} />
							{:else}
								<!-- Collapsed mode: compact row -->
								<CollapsedRow result={guess} guessNumber={guessNum} onExpand={() => tableExpanded = true} />
							{/if}
						{/each}
					</div>

					<!-- Expand/Collapse toggle -->
					{#if guesses.length > 1}
						<button
							onclick={() => tableExpanded = !tableExpanded}
							class="mt-2 flex items-center justify-center gap-1 rounded-lg bg-dark-surface/40 px-3 py-1.5
										 text-xs text-muted-foreground hover:bg-dark-surface/60 hover:text-foreground
										 transition-colors cursor-pointer self-center"
						>
							{#if tableExpanded}
								<ChevronUp class="w-3 h-3" />
								Collapse
							{:else}
								<ChevronDown class="w-3 h-3" />
								Expand all ({guesses.length - 1})
							{/if}
						</button>
					{/if}
				</div>
			</div>
		{/if}

	{/if}
</main>
