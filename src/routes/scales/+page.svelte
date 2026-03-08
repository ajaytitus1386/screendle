<script lang="ts">
	import { onMount } from 'svelte';
	import type { Movie, ScalesRound, ScalesGameSave } from '$lib/types';
	import { getTodaysDateKey } from '$lib/daily';
	import MovieCard from '$lib/components/MovieCard.svelte';

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
	let feedbackVisible = $state(false);

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
			img.onerror = () => resolve();
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

		rounds = [...rounds];
		saveGame();

		// Show feedback badge, then advance
		feedbackVisible = true;
		transitioning = true;
		setTimeout(() => {
			feedbackVisible = false;
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

	let cardA: MovieCard | undefined = $state();
	let cardB: MovieCard | undefined = $state();

	// Reset flips when round changes
	$effect(() => {
		currentRound;
		cardA?.resetFlip();
		cardB?.resetFlip();
	});

	let shareCopied = $state(false);

	function buildShareText(): string {
		const date = getTodaysDateKey();
		const emojis = rounds.map(r => r.userAnswer === r.correctAnswer ? '✅' : '❌').join('');
		return `Screendle Scales · ${date}\n${score}/${rounds.length}\n\n${emojis}\n\nscreendle.pages.dev/scales`;
	}

	async function share() {
		const text = buildShareText();
		try {
			await navigator.clipboard.writeText(text);
			shareCopied = true;
			setTimeout(() => { shareCopied = false; }, 2000);
		} catch {}
	}
</script>

<style>
	@keyframes feedback-pop {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.5);
		}
		20% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.15);
		}
		40% {
			transform: translate(-50%, -50%) scale(0.95);
		}
		60% {
			transform: translate(-50%, -50%) scale(1);
		}
		100% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	.feedback-badge {
		animation: feedback-pop 0.4s ease-out forwards;
	}

	@keyframes progress-fill {
		from { width: 0%; }
		to { width: 100%; }
	}

	.transition-bar {
		animation: progress-fill 2s linear forwards;
	}

</style>

<main class="container mx-auto max-w-2xl px-4 py-8">
	<!-- Header -->
	<header class="mb-6 text-center">
		<h1 class="mb-2 text-4xl font-headline font-bold tracking-tight">Screendle</h1>
		<p class="text-text-cream/70">Scales &mdash; Which has the higher IMDb rating?</p>
	</header>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">{loadingMessage}</div>
		</div>
	{:else if error}
		<div class="mx-auto max-w-md rounded-lg bg-crt-red/20 p-6 text-center">
			<p class="text-crt-red">{error}</p>
		</div>
	{:else if gameComplete}
		<!-- Final Score Screen -->
		<div class="text-center">
			<div class="rounded-xl bg-dark-surface/80 backdrop-blur-sm border border-crt-amber/10 p-8 mb-6">
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
							{round.userAnswer === round.correctAnswer ? 'bg-green-600/30 text-green-400 border border-green-600/50' : 'bg-red-600/30 text-red-400 border border-red-600/50'}"
					>
						{i + 1}
					</div>
				{/each}
			</div>

			<button
				onclick={share}
				class="mb-6 rounded-lg bg-dark-surface/80 border border-crt-amber/10 px-6 py-2 font-semibold hover:bg-dark-surface hover:border-crt-amber/30 transition-colors"
			>
				{shareCopied ? 'Copied!' : 'Share'}
			</button>

			<!-- Pair Review List -->
			<div class="mb-8 space-y-4">
				{#each rounds as round, i}
					{@const correct = round.userAnswer === round.correctAnswer}
					<div class="rounded-xl bg-black/30 border {correct ? 'border-green-600/20' : 'border-red-600/20'} p-3">
						<!-- Round label -->
						<div class="flex items-center justify-center gap-2 mb-3">
							<div class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold {correct ? 'bg-green-600/30 text-green-400' : 'bg-red-600/30 text-red-400'}">
								{i + 1}
							</div>
							<span class="text-xs font-semibold {correct ? 'text-green-400' : 'text-red-400'}">
								{correct ? 'Correct' : 'Wrong'}
							</span>
						</div>

						<!-- Side-by-side posters -->
						<div class="grid grid-cols-2 gap-3">
							<!-- Movie A -->
							<div class="text-center {round.correctAnswer === 'A' ? 'ring-1 ring-green-500/40 rounded-lg p-2' : 'p-2'}">
								{#if round.movieA.poster_path}
									<img
										src={posterUrl(round.movieA.poster_path)}
										alt={round.movieA.title}
										class="mx-auto mb-2 w-20 rounded-lg sm:w-24"
									/>
								{:else}
									<div class="mx-auto mb-2 w-20 h-30 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground text-xs sm:w-24 sm:h-36">?</div>
								{/if}
								<p class="text-xs font-semibold truncate">{round.movieA.title}</p>
								<p class="text-xs {round.correctAnswer === 'A' ? 'text-green-400 font-bold' : 'text-muted-foreground'}">{round.movieA.imdb_rating.toFixed(1)}</p>
								{#if round.movieA.imdb_id}
									<a href={imdbUrl(round.movieA.imdb_id)} target="_blank" rel="noopener noreferrer" class="text-[10px] text-crt-cyan hover:text-crt-cyan/80">IMDb</a>
								{/if}
							</div>

							<!-- Movie B -->
							<div class="text-center {round.correctAnswer === 'B' ? 'ring-1 ring-green-500/40 rounded-lg p-2' : 'p-2'}">
								{#if round.movieB.poster_path}
									<img
										src={posterUrl(round.movieB.poster_path)}
										alt={round.movieB.title}
										class="mx-auto mb-2 w-20 rounded-lg sm:w-24"
									/>
								{:else}
									<div class="mx-auto mb-2 w-20 h-30 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground text-xs sm:w-24 sm:h-36">?</div>
								{/if}
								<p class="text-xs font-semibold truncate">{round.movieB.title}</p>
								<p class="text-xs {round.correctAnswer === 'B' ? 'text-green-400 font-bold' : 'text-muted-foreground'}">{round.movieB.imdb_rating.toFixed(1)}</p>
								{#if round.movieB.imdb_id}
									<a href={imdbUrl(round.movieB.imdb_id)} target="_blank" rel="noopener noreferrer" class="text-[10px] text-crt-cyan hover:text-crt-cyan/80">IMDb</a>
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

		<!-- Movie Cards with centered feedback overlay -->
		<div class="relative">
			<div class="grid grid-cols-2 gap-4">
				<MovieCard
					bind:this={cardA}
					movie={currentRoundData.movieA}
					onclick={() => pickMovie('A')}
					disabled={currentRoundData.revealed || transitioning}
					revealed={currentRoundData.revealed}
					isCorrect={currentRoundData.correctAnswer === 'A'}
					isUserPick={currentRoundData.userAnswer === 'A'}
					showRating={currentRoundData.revealed}
					ratingLabel={currentRoundData.correctAnswer === 'A' ? 'Higher!' : ''}
				/>
				<MovieCard
					bind:this={cardB}
					movie={currentRoundData.movieB}
					onclick={() => pickMovie('B')}
					disabled={currentRoundData.revealed || transitioning}
					revealed={currentRoundData.revealed}
					isCorrect={currentRoundData.correctAnswer === 'B'}
					isUserPick={currentRoundData.userAnswer === 'B'}
					showRating={currentRoundData.revealed}
					ratingLabel={currentRoundData.correctAnswer === 'B' ? 'Higher!' : ''}
				/>
			</div>

			<!-- Centered feedback badge (overlays between the two cards) -->
			{#if feedbackVisible && currentRoundData.revealed}
				{@const isCorrect = currentRoundData.userAnswer === currentRoundData.correctAnswer}
				<div
					class="feedback-badge absolute top-1/2 left-1/2 z-10 rounded-full px-5 py-2 text-sm font-bold shadow-lg
						{isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}"
				>
					{isCorrect ? 'Correct!' : 'Wrong!'}
				</div>
			{/if}

			{#if transitioning}
				<div class="mt-4 h-1 w-full rounded-full bg-white/10 overflow-hidden">
					<div class="transition-bar h-full rounded-full bg-crt-amber/60"></div>
				</div>
			{/if}
		</div>
	{/if}
</main>
