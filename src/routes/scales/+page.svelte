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

	let flippedA = $state(false);
	let flippedB = $state(false);

	// Reset flips when round changes
	$effect(() => {
		currentRound;
		flippedA = false;
		flippedB = false;
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

	.card-flip {
		perspective: 800px;
	}

	.card-flip-inner {
		position: relative;
		transition: transform 0.5s ease;
		transform-style: preserve-3d;
	}

	.card-flip-inner.flipped {
		transform: rotateY(180deg);
	}

	.card-face {
		backface-visibility: hidden;
	}

	.card-back {
		backface-visibility: hidden;
		transform: rotateY(180deg);
		position: absolute;
		inset: 0;
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
					<span class={score >= 7 ? 'text-crt-lime' : score >= 4 ? 'text-crt-amber' : 'text-crt-red'}>
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
							{round.userAnswer === round.correctAnswer ? 'bg-crt-lime/30 text-crt-lime border border-crt-lime/50' : 'bg-crt-red/30 text-crt-red border border-crt-red/50'}"
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
					<div class="rounded-xl bg-black/30 border {correct ? 'border-crt-lime/20' : 'border-crt-red/20'} p-3">
						<!-- Round label -->
						<div class="flex items-center justify-center gap-2 mb-3">
							<div class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold {correct ? 'bg-crt-lime/30 text-crt-lime' : 'bg-crt-red/30 text-crt-red'}">
								{i + 1}
							</div>
							<span class="text-xs font-semibold {correct ? 'text-crt-lime' : 'text-crt-red'}">
								{correct ? 'Correct' : 'Wrong'}
							</span>
						</div>

						<!-- Side-by-side posters -->
						<div class="grid grid-cols-2 gap-3">
							<!-- Movie A -->
							<div class="text-center {round.correctAnswer === 'A' ? 'ring-1 ring-crt-lime/40 rounded-lg p-2' : 'p-2'}">
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
								<p class="text-xs {round.correctAnswer === 'A' ? 'text-crt-lime font-bold' : 'text-muted-foreground'}">{round.movieA.imdb_rating.toFixed(1)}</p>
								{#if round.movieA.imdb_id}
									<a href={imdbUrl(round.movieA.imdb_id)} target="_blank" rel="noopener noreferrer" class="text-[10px] text-crt-cyan hover:text-crt-cyan/80">IMDb</a>
								{/if}
							</div>

							<!-- Movie B -->
							<div class="text-center {round.correctAnswer === 'B' ? 'ring-1 ring-crt-lime/40 rounded-lg p-2' : 'p-2'}">
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
								<p class="text-xs {round.correctAnswer === 'B' ? 'text-crt-lime font-bold' : 'text-muted-foreground'}">{round.movieB.imdb_rating.toFixed(1)}</p>
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
								? 'bg-crt-lime'
								: 'bg-crt-red'
							: i === currentRound
								? 'bg-crt-amber'
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
				{#each [
					{ movie: currentRoundData.movieA, side: 'A' as const, flipped: flippedA, toggleFlip: () => flippedA = !flippedA },
					{ movie: currentRoundData.movieB, side: 'B' as const, flipped: flippedB, toggleFlip: () => flippedB = !flippedB }
				] as { movie, side, flipped, toggleFlip }}
					<div class="card-flip">
						<div class="card-flip-inner {flipped ? 'flipped' : ''}">
							<!-- Front face: poster + pick -->
							<button
								onclick={() => pickMovie(side)}
								disabled={currentRoundData.revealed || transitioning}
								class="card-face w-full rounded-xl bg-dark-surface/80 backdrop-blur-sm border p-4 text-center transition-all
									{currentRoundData.revealed
										? currentRoundData.correctAnswer === side
											? 'border-crt-lime/60 bg-crt-lime/10'
											: currentRoundData.userAnswer === side
												? 'border-crt-red/60 bg-crt-red/10'
												: 'border-crt-amber/10'
										: 'border-white/10 hover:border-crt-amber/50 hover:bg-dark-surface cursor-pointer'}"
							>
								<!-- Info toggle -->
								<div class="flex justify-end -mb-2">
									<span
										role="button"
										tabindex="0"
										class="w-6 h-6 flex items-center justify-center rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 cursor-pointer z-10"
										onclick={(e) => { e.stopPropagation(); toggleFlip(); }}
										onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggleFlip(); } }}
										aria-label="Show movie details"
									>
										ℹ
									</span>
								</div>

								{#if movie.poster_path}
									<img
										src={posterUrl(movie.poster_path)}
										alt={movie.title}
										class="mx-auto mb-3 w-32 rounded-lg shadow-lg sm:w-40"
									/>
								{:else}
									<div class="mx-auto mb-3 w-32 h-48 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground sm:w-40 sm:h-60">
										No Poster
									</div>
								{/if}
								<h3 class="font-bold text-sm sm:text-base">{movie.title}</h3>
								<p class="text-xs text-muted-foreground">{movie.year}</p>

								{#if currentRoundData.revealed}
									<div class="mt-3">
										<span class="text-lg font-bold {currentRoundData.correctAnswer === side ? 'text-crt-lime' : 'text-muted-foreground'}">
											{movie.imdb_rating.toFixed(1)}
										</span>
										{#if currentRoundData.correctAnswer === side}
											<span class="ml-1 text-xs font-semibold text-crt-lime">Higher!</span>
										{/if}
									</div>
								{/if}
							</button>

							<!-- Back face: movie details -->
							<div
								class="card-back w-full rounded-xl bg-black/60 backdrop-blur-sm border border-crt-amber/10 p-4 flex flex-col justify-between"
							>
								<div>
									<div class="flex justify-between items-start mb-3">
										<h3 class="font-bold text-sm sm:text-base text-left">{movie.title}</h3>
										<button
											onclick={() => toggleFlip()}
											class="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-white/10"
											aria-label="Back to poster"
										>
											✕
										</button>
									</div>

									<div class="space-y-2 text-xs text-left">
										<div>
											<span class="text-muted-foreground">Year:</span>
											<span class="ml-1">{movie.year}</span>
										</div>
										<div>
											<span class="text-muted-foreground">Director:</span>
											<span class="ml-1">{movie.director}</span>
										</div>
										<div>
											<span class="text-muted-foreground">Runtime:</span>
											<span class="ml-1">{movie.runtime} min</span>
										</div>
										<div>
											<span class="text-muted-foreground">Genre:</span>
											<span class="ml-1">{movie.genres.join(', ')}</span>
										</div>
										<div>
											<span class="text-muted-foreground">Country:</span>
											<span class="ml-1">{movie.country}</span>
										</div>
										{#if movie.keywords.length > 0}
											<div>
												<span class="text-muted-foreground">Keywords:</span>
												<span class="ml-1">{movie.keywords.slice(0, 5).join(', ')}</span>
											</div>
										{/if}
									</div>
								</div>

								<!-- Pick button on back face too -->
								{#if !currentRoundData.revealed && !transitioning}
									<button
										onclick={() => pickMovie(side)}
										class="mt-4 w-full rounded-lg bg-white/10 py-2 text-sm font-semibold hover:bg-white/20 transition-colors"
									>
										Pick this movie
									</button>
								{:else if currentRoundData.revealed}
									<div class="mt-4 text-center">
										<span class="text-lg font-bold {currentRoundData.correctAnswer === side ? 'text-crt-lime' : 'text-muted-foreground'}">
											{movie.imdb_rating.toFixed(1)}
										</span>
										{#if currentRoundData.correctAnswer === side}
											<span class="ml-1 text-xs font-semibold text-crt-lime">Higher!</span>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Centered feedback badge (overlays between the two cards) -->
			{#if feedbackVisible && currentRoundData.revealed}
				{@const isCorrect = currentRoundData.userAnswer === currentRoundData.correctAnswer}
				<div
					class="feedback-badge absolute top-1/2 left-1/2 z-10 rounded-full px-5 py-2 text-sm font-bold shadow-lg
						{isCorrect ? 'bg-crt-lime text-white' : 'bg-crt-red text-white'}"
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
