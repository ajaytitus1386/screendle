<script lang="ts">
	import type { GuessResult, MatchType } from '$lib/types';
	import { cn } from '$lib/utils';
	import { ArrowBigUp, ArrowBigDown, Trophy } from '@lucide/svelte';

	interface Props {
		result: GuessResult;
		delay?: number;
		guessNumber?: number | string;
	}

	let { result, delay = 0, guessNumber }: Props = $props();

	const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

	// Expandable state for arrays
	let genreExpanded = $state(false);
	let keywordsExpanded = $state(false);

	function getMatchClass(match: MatchType): string {
		switch (match) {
			case 'exact':
				return 'bg-green-600/70';
			case 'partial':
				return 'bg-orange-500/70';
			case 'none':
				return 'bg-red-600/50';
		}
	}

	function formatArray(value: string[], expanded: boolean): string {
		if (expanded || value.length <= 3) {
			return value.join(', ');
		}
		return value.slice(0, 3).join(', ') + '...';
	}

</script>

{#snippet directionArrow(direction: string)}
	<span class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-white/20">
		{#if direction === 'up'}
			<ArrowBigUp class="w-12 h-12" />
		{:else}
			<ArrowBigDown class="w-12 h-12" />
		{/if}
	</span>
{/snippet}

<div
	class="flex gap-2 animate-in fade-in slide-in-from-bottom-2"
	style="animation-delay: {delay}s; animation-fill-mode: backwards;"
>
	<!-- Guess # -->
	{#if guessNumber !== undefined}
		<div class="w-8 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-muted-foreground">
			{#if guessNumber === 'A'}
				<Trophy class="w-4 h-4 text-crt-amber" />
			{:else}
				{guessNumber}
			{/if}
		</div>
	{/if}

	<!-- Poster -->
	<div class="w-14 h-[84px] flex-shrink-0 self-start overflow-hidden rounded-lg bg-black/60 backdrop-blur-sm">
		{#if result.movie.poster_path}
			<img
				src="{TMDB_IMAGE_BASE}{result.movie.poster_path}"
				alt={result.movie.title}
				class="h-full w-full object-cover"
			/>
		{:else}
			<div class="flex h-full items-center justify-center text-xs text-muted-foreground">
				No img
			</div>
		{/if}
	</div>

	<!-- Genre -->
	<button
		type="button"
		class={cn(
			'w-28 flex-shrink-0 rounded-lg px-2 py-2 text-center text-xs backdrop-blur-sm transition-colors cursor-pointer',
			getMatchClass(result.matches.genre.match),
			genreExpanded && 'min-h-fit'
		)}
		onclick={() => (result.matches.genre.value as string[]).length > 3 && (genreExpanded = !genreExpanded)}
	>
		<div class="flex h-full items-center justify-center">
			<span class={genreExpanded ? '' : 'line-clamp-3'}>
				{formatArray(result.matches.genre.value as string[], genreExpanded)}
				{#if (result.matches.genre.value as string[]).length > 3 && !genreExpanded}
					<span class="text-white/60 ml-1">+{(result.matches.genre.value as string[]).length - 3}</span>
				{/if}
			</span>
		</div>
	</button>

	<!-- Year -->
	<div
		class={cn(
			'w-20 flex-shrink-0 rounded-lg px-2 py-2 text-center backdrop-blur-sm transition-colors',
			getMatchClass(result.matches.year.match)
		)}
	>
		<div class="flex h-full items-center justify-center relative">
			<span class="font-semibold">{result.matches.year.value}</span>
			{#if result.matches.year.direction && result.matches.year.direction !== 'match'}
				{@render directionArrow(result.matches.year.direction)}
			{/if}
		</div>
	</div>

	<!-- Runtime -->
	<div
		class={cn(
			'w-20 flex-shrink-0 rounded-lg px-2 py-2 text-center backdrop-blur-sm transition-colors',
			getMatchClass(result.matches.runtime.match)
		)}
	>
		<div class="flex h-full items-center justify-center relative">
			<span class="font-semibold">{result.matches.runtime.value}m</span>
			{#if result.matches.runtime.direction && result.matches.runtime.direction !== 'match'}
				{@render directionArrow(result.matches.runtime.direction)}
			{/if}
		</div>
	</div>

	<!-- IMDb Rating -->
	<div
		class={cn(
			'w-20 flex-shrink-0 rounded-lg px-2 py-2 text-center backdrop-blur-sm transition-colors',
			getMatchClass(result.matches.imdb_rating.match)
		)}
	>
		<div class="flex h-full items-center justify-center relative">
			<span class="font-semibold">{result.matches.imdb_rating.value}</span>
			{#if result.matches.imdb_rating.direction && result.matches.imdb_rating.direction !== 'match'}
				{@render directionArrow(result.matches.imdb_rating.direction)}
			{/if}
		</div>
	</div>

	<!-- Director -->
	<div
		class={cn(
			'w-32 flex-shrink-0 rounded-lg px-2 py-2 text-center text-xs backdrop-blur-sm transition-colors',
			getMatchClass(result.matches.director.match)
		)}
	>
		<div class="flex h-full items-center justify-center">
			<span class="line-clamp-2">{result.matches.director.value}</span>
		</div>
	</div>

	<!-- Keywords -->
	<button
		type="button"
		class={cn(
			'w-32 flex-shrink-0 rounded-lg px-2 py-2 text-center text-xs backdrop-blur-sm transition-colors cursor-pointer',
			getMatchClass(result.matches.keywords.match),
			keywordsExpanded && 'min-h-fit'
		)}
		onclick={() => (result.matches.keywords.value as string[]).length > 3 && (keywordsExpanded = !keywordsExpanded)}
	>
		<div class="flex h-full items-center justify-center">
			<span class={keywordsExpanded ? '' : 'line-clamp-3'}>
				{formatArray(result.matches.keywords.value as string[], keywordsExpanded)}
				{#if (result.matches.keywords.value as string[]).length > 3 && !keywordsExpanded}
					<span class="text-white/60 ml-1">+{(result.matches.keywords.value as string[]).length - 3}</span>
				{/if}
			</span>
		</div>
	</button>

	<!-- Country -->
	<div
		class={cn(
			'w-24 flex-shrink-0 rounded-lg px-2 py-2 text-center text-sm backdrop-blur-sm transition-colors',
			getMatchClass(result.matches.country.match)
		)}
	>
		<div class="flex h-full items-center justify-center">
			<span>{result.matches.country.value}</span>
		</div>
	</div>
</div>
