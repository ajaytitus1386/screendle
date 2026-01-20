<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { Movie } from '$lib/types';

	interface Props {
		onSelect: (movie: Movie) => void;
		disabled?: boolean;
		guessedIds?: number[];
	}

	let { onSelect, disabled = false, guessedIds = [] }: Props = $props();

	// Filter out already-guessed movies
	let filteredResults = $derived(results.filter(m => !guessedIds.includes(m.id)));

	let query = $state('');
	let results: Movie[] = $state([]);
	let isLoading = $state(false);
	let showDropdown = $state(false);
	let selectedIndex = $state(-1);

	const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

	let debounceTimer: ReturnType<typeof setTimeout>;

	async function searchMovies(searchQuery: string) {
		if (searchQuery.length < 2) {
			results = [];
			return;
		}

		isLoading = true;
		try {
			const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
			if (response.ok) {
				const data = await response.json();
				results = data.results || [];
			}
		} catch (error) {
			console.error('Search failed:', error);
			results = [];
		} finally {
			isLoading = false;
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;
		selectedIndex = -1;
		showDropdown = true;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			searchMovies(query);
		}, 300);
	}

	function handleSelect(movie: Movie) {
		onSelect(movie);
		query = '';
		results = [];
		showDropdown = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!showDropdown || filteredResults.length === 0) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, filteredResults.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, -1);
				break;
			case 'Enter':
				e.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
					handleSelect(filteredResults[selectedIndex]);
				}
				break;
			case 'Escape':
				showDropdown = false;
				break;
		}
	}

	function handleBlur() {
		// Delay to allow click on dropdown item
		setTimeout(() => {
			showDropdown = false;
		}, 200);
	}
</script>

<div class="relative">
	<Input
		type="text"
		placeholder={disabled ? 'Game over!' : 'Search for a movie...'}
		value={query}
		oninput={handleInput}
		onkeydown={handleKeydown}
		onfocus={() => (showDropdown = true)}
		onblur={handleBlur}
		{disabled}
		class="bg-black/40 backdrop-blur-sm border-white/20 focus:border-white/40"
	/>

	{#if showDropdown && (filteredResults.length > 0 || isLoading)}
		<div
			class="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-white/10 bg-black/90 backdrop-blur-md"
		>
			{#if isLoading}
				<div class="p-4 text-center text-muted-foreground">Searching...</div>
			{:else}
				{#each filteredResults as movie, index}
					<button
						type="button"
						class="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/10 {index ===
						selectedIndex
							? 'bg-white/10'
							: ''}"
						onmousedown={(e) => { e.preventDefault(); handleSelect(movie); }}
						ontouchend={(e) => { e.preventDefault(); handleSelect(movie); }}
					>
						{#if movie.poster_path}
							<img
								src="{TMDB_IMAGE_BASE}{movie.poster_path}"
								alt={movie.title}
								class="h-12 w-8 rounded object-cover"
							/>
						{:else}
							<div class="flex h-12 w-8 items-center justify-center rounded bg-white/10 text-xs">
								?
							</div>
						{/if}
						<div class="flex-1 min-w-0">
							<div class="truncate font-medium">{movie.title}</div>
							<div class="text-sm text-muted-foreground">{movie.year}</div>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	{/if}

	{#if query.length > 0 && query.length < 2}
		<div class="mt-1 text-xs text-muted-foreground">Type at least 2 characters...</div>
	{/if}
</div>
