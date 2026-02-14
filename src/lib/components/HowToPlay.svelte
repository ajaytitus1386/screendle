<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		defaultTab?: 'classic' | 'scales';
	}

	let { open, onClose, defaultTab = 'classic' }: Props = $props();

	let activeTab: 'classic' | 'scales' = $state('classic');

	// Sync default tab when modal opens
	$effect(() => {
		if (open) {
			activeTab = defaultTab;
		}
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
		onclick={handleBackdropClick}
	>
		<!-- Modal -->
		<div class="relative w-full max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-background/95 border border-white/10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
			<!-- Close button -->
			<button
				onclick={onClose}
				aria-label="Close"
				class="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
			</button>

			<div class="p-6">
				<h2 class="text-2xl font-bold text-center mb-1">How to Play</h2>
				<p class="text-sm text-muted-foreground text-center mb-5">Choose a mode to learn the rules</p>

				<!-- Tabs -->
				<div class="flex rounded-lg bg-white/5 p-1 mb-6">
					<button
						onclick={() => activeTab = 'classic'}
						class="flex-1 rounded-md py-2 text-sm font-semibold transition-colors
							{activeTab === 'classic' ? 'bg-green-500/20 text-green-400' : 'text-muted-foreground hover:text-foreground'}"
					>
						Classic
					</button>
					<button
						onclick={() => activeTab = 'scales'}
						class="flex-1 rounded-md py-2 text-sm font-semibold transition-colors
							{activeTab === 'scales' ? 'bg-orange-500/20 text-orange-400' : 'text-muted-foreground hover:text-foreground'}"
					>
						Scales
					</button>
				</div>

				<!-- Classic Tab Content -->
				{#if activeTab === 'classic'}
					<div class="space-y-5">
						<!-- Step 1 -->
						<div class="flex gap-3">
							<div class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">1</div>
							<div>
								<p class="text-sm font-semibold mb-1">Guess the daily movie</p>
								<p class="text-xs text-muted-foreground">Search for a movie and submit your guess. You have <span class="text-foreground font-semibold">10 tries</span> to find the answer.</p>
							</div>
						</div>

						<!-- Step 2 -->
						<div class="flex gap-3">
							<div class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">2</div>
							<div>
								<p class="text-sm font-semibold mb-2">Read the color-coded feedback</p>
								<p class="text-xs text-muted-foreground mb-3">Each guess shows 7 properties compared to the target movie:</p>

								<!-- Mock game row -->
								<div class="flex gap-1.5 overflow-x-auto pb-1 mb-3 -mx-1 px-1">
									<div class="flex-shrink-0 w-10 h-10 rounded bg-black/60 flex items-center justify-center text-[8px] text-muted-foreground">Poster</div>
									<div class="flex-shrink-0 w-14 h-10 rounded bg-orange-500/70 flex items-center justify-center text-[9px]">Drama</div>
									<div class="flex-shrink-0 w-12 h-10 rounded bg-red-600/50 flex flex-col items-center justify-center text-[9px]"><span>2015</span><span class="text-[10px]">↑</span></div>
									<div class="flex-shrink-0 w-12 h-10 rounded bg-green-600/70 flex items-center justify-center text-[9px]">148m</div>
									<div class="flex-shrink-0 w-12 h-10 rounded bg-red-600/50 flex flex-col items-center justify-center text-[9px]"><span>7.4</span><span class="text-[10px]">↓</span></div>
									<div class="flex-shrink-0 w-14 h-10 rounded bg-red-600/50 flex items-center justify-center text-[9px]">Nolan</div>
									<div class="flex-shrink-0 w-14 h-10 rounded bg-orange-500/70 flex items-center justify-center text-[9px]">sci-fi...</div>
									<div class="flex-shrink-0 w-12 h-10 rounded bg-green-600/70 flex items-center justify-center text-[9px]">USA</div>
								</div>

								<!-- Legend -->
								<div class="space-y-1.5">
									<div class="flex items-center gap-2">
										<div class="w-3 h-3 rounded-sm bg-green-600/70"></div>
										<span class="text-xs text-muted-foreground"><span class="text-green-400 font-semibold">Green</span> = exact match</span>
									</div>
									<div class="flex items-center gap-2">
										<div class="w-3 h-3 rounded-sm bg-orange-500/70"></div>
										<span class="text-xs text-muted-foreground"><span class="text-orange-400 font-semibold">Orange</span> = partial match (e.g. shared genre)</span>
									</div>
									<div class="flex items-center gap-2">
										<div class="w-3 h-3 rounded-sm bg-red-600/50"></div>
										<span class="text-xs text-muted-foreground"><span class="text-red-400 font-semibold">Red</span> = no match</span>
									</div>
									<div class="flex items-center gap-2">
										<span class="w-3 text-center text-xs">↑↓</span>
										<span class="text-xs text-muted-foreground"><span class="text-foreground font-semibold">Arrows</span> = target is higher or lower</span>
									</div>
								</div>
							</div>
						</div>

						<!-- Step 3 -->
						<div class="flex gap-3">
							<div class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">3</div>
							<div>
								<p class="text-sm font-semibold mb-1">Narrow it down</p>
								<p class="text-xs text-muted-foreground">Use the clue bar that builds up from your guesses to zero in on the right movie.</p>
							</div>
						</div>

						<!-- Properties -->
						<div>
							<p class="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">7 Properties</p>
							<div class="flex flex-wrap gap-1.5">
								{#each ['Genre', 'Year', 'Runtime', 'IMDb Rating', 'Director', 'Keywords', 'Country'] as prop}
									<span class="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">{prop}</span>
								{/each}
							</div>
						</div>
					</div>

				<!-- Scales Tab Content -->
				{:else}
					<div class="space-y-5">
						<!-- Step 1 -->
						<div class="flex gap-3">
							<div class="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">1</div>
							<div>
								<p class="text-sm font-semibold mb-1">Two movies, one choice</p>
								<p class="text-xs text-muted-foreground">Each round shows two movie posters. <span class="text-foreground font-semibold">Tap the one you think has the higher IMDb rating.</span></p>
							</div>
						</div>

						<!-- Mock poster pair -->
						<div class="grid grid-cols-2 gap-3 px-2">
							<div class="rounded-lg bg-black/40 border border-white/10 p-3 text-center">
								<div class="mx-auto mb-2 w-16 h-24 rounded bg-white/5 flex items-center justify-center text-muted-foreground text-lg">A</div>
								<p class="text-xs font-semibold">Movie A</p>
								<p class="text-[10px] text-muted-foreground">2019</p>
							</div>
							<div class="rounded-lg bg-black/40 border border-white/10 p-3 text-center">
								<div class="mx-auto mb-2 w-16 h-24 rounded bg-white/5 flex items-center justify-center text-muted-foreground text-lg">B</div>
								<p class="text-xs font-semibold">Movie B</p>
								<p class="text-[10px] text-muted-foreground">2014</p>
							</div>
						</div>

						<!-- Step 2 -->
						<div class="flex gap-3">
							<div class="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">2</div>
							<div>
								<p class="text-sm font-semibold mb-1">Ratings revealed</p>
								<p class="text-xs text-muted-foreground">After you pick, both ratings are shown. The winner gets a <span class="text-green-400 font-semibold">green border</span>, wrong picks get <span class="text-red-400 font-semibold">red</span>.</p>
							</div>
						</div>

						<!-- Step 3 -->
						<div class="flex gap-3">
							<div class="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">3</div>
							<div>
								<p class="text-sm font-semibold mb-1">10 rounds, rising difficulty</p>
								<p class="text-xs text-muted-foreground">Early rounds have a wide rating gap. Later rounds are close calls. Your final score is out of 10.</p>
							</div>
						</div>

						<!-- Mock progress bar -->
						<div>
							<p class="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Progress</p>
							<div class="flex gap-1">
								<div class="h-2 flex-1 rounded-full bg-green-500"></div>
								<div class="h-2 flex-1 rounded-full bg-green-500"></div>
								<div class="h-2 flex-1 rounded-full bg-red-500"></div>
								<div class="h-2 flex-1 rounded-full bg-green-500"></div>
								<div class="h-2 flex-1 rounded-full bg-orange-500"></div>
								<div class="h-2 flex-1 rounded-full bg-white/10"></div>
								<div class="h-2 flex-1 rounded-full bg-white/10"></div>
								<div class="h-2 flex-1 rounded-full bg-white/10"></div>
								<div class="h-2 flex-1 rounded-full bg-white/10"></div>
								<div class="h-2 flex-1 rounded-full bg-white/10"></div>
							</div>
							<div class="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
								<span>Easy</span>
								<span>Hard</span>
							</div>
						</div>

						<!-- Step 4 -->
						<div class="flex gap-3">
							<div class="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">4</div>
							<div>
								<p class="text-sm font-semibold mb-1">Review your results</p>
								<p class="text-xs text-muted-foreground">After round 10, see your score and browse all pairs with links to their IMDb pages.</p>
							</div>
						</div>
					</div>
				{/if}

				<!-- Got it button -->
				<button
					onclick={onClose}
					class="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
				>
					Got it
				</button>
			</div>
		</div>
	</div>
{/if}
