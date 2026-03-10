<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { Movie } from '$lib/types';

	interface Props {
		onSelect: (movie: Movie) => void;
		disabled?: boolean;
		guessedIds?: number[];
		placeholderNames?: string[];
		guessCount?: string;
		suggestions?: Movie[];
	}

	let { onSelect, disabled = false, guessedIds = [], placeholderNames = [], guessCount = '', suggestions = [] }: Props = $props();

	const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

	let query = $state('');
	let results: Movie[] = $state([]);

	// Filter out already-guessed movies
	let filteredResults = $derived(results.filter(m => !guessedIds.includes(m.id)));
	let isLoading = $state(false);
	let showDropdown = $state(false);
	let selectedIndex = $state(-1);
	let isFocused = $state(false);

	const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

	// Animated placeholder — static text when unfocused, typewriter when focused
	const STATIC_PLACEHOLDER = 'Search for a movie...';
	let animatedPlaceholder = $state(STATIC_PLACEHOLDER);

	$effect(() => {
		if (disabled) {
			animatedPlaceholder = 'Game over!';
			return;
		}

		if (!isFocused || placeholderNames.length === 0) {
			animatedPlaceholder = STATIC_PLACEHOLDER;
			return;
		}

		let nameIndex = 0;
		let charIndex = 0;
		let isDeleting = false;
		let timeoutId: ReturnType<typeof setTimeout>;

		function tick() {
			const name = placeholderNames[nameIndex];

			if (!isDeleting) {
				charIndex++;
				animatedPlaceholder = name.slice(0, charIndex);

				if (charIndex >= name.length) {
					timeoutId = setTimeout(() => {
						isDeleting = true;
						tick();
					}, 1500);
					return;
				}

				const typeSpeed = Math.max(40, Math.min(120, 2000 / name.length));
				timeoutId = setTimeout(tick, typeSpeed);
			} else {
				charIndex--;
				animatedPlaceholder = name.slice(0, charIndex) || '\u200B';

				if (charIndex <= 0) {
					isDeleting = false;
					nameIndex = (nameIndex + 1) % placeholderNames.length;
					timeoutId = setTimeout(tick, 400);
					return;
				}

				const deleteSpeed = Math.max(25, Math.min(80, 1200 / name.length));
				timeoutId = setTimeout(tick, deleteSpeed);
			}
		}

		timeoutId = setTimeout(tick, 400);

		return () => clearTimeout(timeoutId);
	});

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
			isFocused = false;
		}, 200);
	}

	// Auto-scrolling carousel for quick picks
	let carouselEl: HTMLDivElement | undefined = $state();
	let scrollPaused = $state(false);

	$effect(() => {
		const el = carouselEl;
		const shouldScroll = showDropdown && isFocused && query.length === 0 && suggestions.length > 0 && !disabled;
		if (!el || !shouldScroll) return;

		let animId: number;
		const speed = 0.5; // px per frame

		function step() {
			if (!scrollPaused && el) {
				el.scrollLeft += speed;
				// Loop: when we've scrolled past halfway (the duplicated set), reset
				if (el.scrollLeft >= el.scrollWidth / 2) {
					el.scrollLeft = 0;
				}
			}
			animId = requestAnimationFrame(step);
		}
		animId = requestAnimationFrame(step);
		return () => cancelAnimationFrame(animId);
	});
</script>

<div class="relative">
	<Input
		type="text"
		placeholder={animatedPlaceholder}
		value={query}
		oninput={handleInput}
		onkeydown={handleKeydown}
		onfocus={() => { isFocused = true; showDropdown = true; }}
		onblur={handleBlur}
		{disabled}
		class="bg-black/40 backdrop-blur-sm border-white/20 focus:border-white/40 {guessCount && !isFocused ? 'pr-24' : ''}"
	/>

	{#if guessCount && !isFocused}
		<span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
			{guessCount}
		</span>
	{/if}

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
	{:else if showDropdown && isFocused && query.length === 0 && suggestions.length > 0 && !disabled}
		<!-- Auto-scrolling quick picks carousel -->
		<div class="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-white/10 bg-black/90 backdrop-blur-md p-3">
			<p class="text-xs text-muted-foreground mb-2">Quick picks &mdash; click to guess:</p>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				bind:this={carouselEl}
				class="quick-picks-carousel flex gap-2 overflow-x-auto"
				onmouseenter={() => scrollPaused = true}
				onmouseleave={() => scrollPaused = false}
				ontouchstart={() => scrollPaused = true}
				ontouchend={() => { setTimeout(() => scrollPaused = false, 2000); }}
			>
				<!-- Duplicate suggestions for seamless looping -->
				{#each [...suggestions, ...suggestions] as movie, i}
					<button
						type="button"
						class="flex-shrink-0 w-20 rounded-xl overflow-hidden border border-white/10 hover:border-crt-amber/50 transition-colors cursor-pointer"
						onmousedown={(e) => { e.preventDefault(); handleSelect(movie); }}
						ontouchend={(e) => { e.preventDefault(); handleSelect(movie); }}
					>
						{#if movie.poster_path}
							<img
								src="{TMDB_POSTER_BASE}{movie.poster_path}"
								alt={movie.title}
								class="w-full aspect-[2/3] object-cover block"
							/>
						{:else}
							<div class="w-full aspect-[2/3] bg-white/5 flex items-center justify-center text-muted-foreground text-xs">
								?
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if query.length > 0 && query.length < 2}
		<div class="mt-1 text-xs text-muted-foreground">Type at least 2 characters...</div>
	{/if}
</div>
