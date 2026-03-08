<script lang="ts">
	import type { GuessResult, MatchType } from '$lib/types';

	interface Props {
		result: GuessResult;
		guessNumber: number | string;
		onExpand: () => void;
	}

	let { result, guessNumber, onExpand }: Props = $props();

	function getMatchClass(match: MatchType): string {
		switch (match) {
			case 'exact': return 'bg-green-600/70';
			case 'partial': return 'bg-orange-500/70';
			case 'none': return 'bg-red-600/50';
		}
	}
</script>

<button onclick={onExpand}
	class="flex items-center gap-2 rounded-lg bg-dark-surface/40 px-0 py-1
				 hover:bg-dark-surface/60 transition-colors cursor-pointer text-left">
	<!-- # column -->
	<span class="w-8 flex-shrink-0 text-center text-xs font-semibold text-muted-foreground">{guessNumber}</span>
	<!-- Poster column → movie title (truncated) -->
	<span class="w-14 flex-shrink-0 truncate text-xs font-medium">{result.movie.title}</span>
	<!-- 7 match columns: solid colored blocks at column widths -->
	<div class="w-28 flex-shrink-0 h-7 rounded-lg {getMatchClass(result.matches.genre.match)}"></div>
	<div class="w-20 flex-shrink-0 h-7 rounded-lg {getMatchClass(result.matches.year.match)}"></div>
	<div class="w-20 flex-shrink-0 h-7 rounded-lg {getMatchClass(result.matches.runtime.match)}"></div>
	<div class="w-20 flex-shrink-0 h-7 rounded-lg {getMatchClass(result.matches.imdb_rating.match)}"></div>
	<div class="w-32 flex-shrink-0 h-7 rounded-lg {getMatchClass(result.matches.director.match)}"></div>
	<div class="w-32 flex-shrink-0 h-7 rounded-lg {getMatchClass(result.matches.keywords.match)}"></div>
	<div class="w-24 flex-shrink-0 h-7 rounded-lg {getMatchClass(result.matches.country.match)}"></div>
</button>
