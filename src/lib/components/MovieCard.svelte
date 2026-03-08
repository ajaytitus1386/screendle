<script lang="ts">
	import type { Movie } from '$lib/types';
	import { Info } from '@lucide/svelte';

	interface Props {
		movie: Movie;
		onclick?: () => void;
		disabled?: boolean;
		revealed?: boolean;
		isCorrect?: boolean;
		isUserPick?: boolean;
		showRating?: boolean;
		ratingLabel?: string;
		flippable?: boolean;
		class?: string;
	}

	let {
		movie,
		onclick,
		disabled = false,
		revealed = false,
		isCorrect = false,
		isUserPick = false,
		showRating = false,
		ratingLabel = '',
		flippable = true,
		class: className = ''
	}: Props = $props();

	let flipped = $state(false);
	let cardEl: HTMLDivElement | undefined = $state();
	let isSmall = $state(false);

	function posterUrl(path: string | null): string {
		if (!path) return '';
		return `https://image.tmdb.org/t/p/w300${path}`;
	}

	function toggleFlip(e?: Event) {
		e?.stopPropagation();
		e?.preventDefault();
		flipped = !flipped;
	}

	export function resetFlip() {
		flipped = false;
	}

	// Detect small card width via ResizeObserver
	$effect(() => {
		if (!cardEl) return;
		const observer = new ResizeObserver((entries) => {
			isSmall = entries[0].contentRect.width < 160;
		});
		observer.observe(cardEl);
		return () => observer.disconnect();
	});

	const circumference = 2 * Math.PI * 20;
</script>

<style>
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

	/* When small and flipped, expand the inner container */
	.card-flip-inner.expanded {
		position: absolute;
		min-width: 200px;
		left: 50%;
		transform: translateX(-50%) rotateY(180deg);
		z-index: 30;
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

	/* When expanded, back face fills the expanded container */
	.card-flip-inner.expanded .card-back {
		position: relative;
		inset: auto;
	}

	@media (prefers-reduced-motion: reduce) {
		.card-flip-inner {
			transition: none;
		}
	}
</style>

<div
	bind:this={cardEl}
	class="card-flip {className} relative {flipped && isSmall ? 'z-30' : ''}"
>
	<div class="card-flip-inner {flipped ? (isSmall ? 'expanded' : 'flipped') : ''}">
		<!-- Front face: poster + blur extension -->
		<button
			onclick={onclick}
			{disabled}
			class="card-face w-full rounded-xl overflow-hidden border text-center transition-all
				{revealed
					? isCorrect
						? 'border-green-600/60 bg-green-600/10'
						: isUserPick
							? 'border-red-600/60 bg-red-600/10'
							: 'border-crt-amber/10'
					: 'border-white/10 hover:border-crt-amber/50 hover:bg-dark-surface cursor-pointer'}"
		>
			<div class="poster-container relative overflow-hidden rounded-xl">
				{#if movie.poster_path}
					<img
						src={posterUrl(movie.poster_path)}
						alt={movie.title}
						class="w-full aspect-[2/3] object-cover block"
					/>

					{#if flippable}
						<!-- Blurred extension: duplicate bottom slice -->
						<div class="relative h-8 -mt-1 overflow-hidden">
							<div
								class="absolute top-[-8px] bottom-0"
								style="left: -8px; right: -8px;
									background-image: url('{posterUrl(movie.poster_path)}');
									background-size: calc(100% + 16px);
									background-position: center bottom;
									filter: blur(10px) saturate(1.2);"
							></div>
							<!-- Gradient fade for seamless blend -->
							<div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
						</div>
					{/if}
				{:else}
					<div class="w-full aspect-[2/3] bg-white/5 flex items-center justify-center text-muted-foreground text-sm">
						No Poster
					</div>
					{#if flippable}
						<!-- Spacer for info icon placement -->
						<div class="h-8"></div>
					{/if}
				{/if}

				<!-- Circular score indicator (Scales revealed state) -->
				{#if showRating}
					<div class="absolute inset-0 flex items-center justify-center z-10 bg-black/40 rounded-xl">
						<svg viewBox="0 0 48 48" class="w-16 h-16">
							<!-- Background ring -->
							<circle cx="24" cy="24" r="20" fill="none"
								stroke="currentColor" stroke-width="3"
								class="text-white/20" />
							<!-- Progress arc -->
							<circle cx="24" cy="24" r="20" fill="none"
								stroke="currentColor" stroke-width="3"
								stroke-dasharray={circumference}
								stroke-dashoffset={circumference * (1 - movie.imdb_rating / 10)}
								stroke-linecap="round"
								transform="rotate(-90 24 24)"
								class={isCorrect ? 'text-green-400' : 'text-muted-foreground'} />
						</svg>
						<!-- Rating number centered -->
						<span class="absolute text-lg font-bold {isCorrect ? 'text-green-400' : 'text-white'}">
							{movie.imdb_rating.toFixed(1)}
						</span>
						{#if ratingLabel}
							<span class="absolute top-1/2 mt-5 text-xs font-semibold text-green-400">
								{ratingLabel}
							</span>
						{/if}
					</div>
				{/if}
			</div>
		</button>

		<!-- Info icon — outside front-face button to avoid nested buttons -->
		{#if flippable && !flipped}
			<button
				type="button"
				onclick={toggleFlip}
				class="card-face absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20
					p-1 rounded-full text-white/70 hover:text-white
					transition-colors cursor-pointer"
				aria-label="Show movie details"
			>
				<Info class="w-6 h-6" />
			</button>
		{/if}

		<!-- Back face: movie details -->
		<div
			class="card-back w-full rounded-xl bg-black/80 backdrop-blur-sm border border-crt-amber/10 p-3 flex flex-col overflow-y-auto"
		>
			<div class="flex justify-between items-start mb-2">
				<h3 class="font-bold text-sm text-left truncate">{movie.title}</h3>
				<button
					onclick={() => toggleFlip()}
					class="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-white/10"
					aria-label="Back to poster"
				>
					✕
				</button>
			</div>

			<div class="space-y-1.5 text-xs text-left">
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

			<div class="mt-auto pt-2">
				{#if onclick && !revealed && !disabled}
					<button
						onclick={() => onclick?.()}
						class="w-full rounded-lg bg-white/10 py-1.5 text-sm font-semibold hover:bg-white/20 transition-colors"
					>
						Pick this movie
					</button>
				{:else if showRating}
					<div class="text-center">
						<span class="text-lg font-bold {isCorrect ? 'text-green-400' : 'text-muted-foreground'}">
							{movie.imdb_rating.toFixed(1)}
						</span>
						{#if ratingLabel}
							<span class="ml-1 text-xs font-semibold text-green-400">{ratingLabel}</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
