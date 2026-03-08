<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import HowToPlay from '$lib/components/HowToPlay.svelte';
	import { House } from '@lucide/svelte';

	let { children } = $props();

	const SEEN_KEY = 'screendle-seen-tutorial';

	let howToPlayOpen = $state(false);

	// Derive the default tab from the current route
	let defaultTab = $derived(
		$page.url.pathname.startsWith('/scales') ? 'scales' as const : 'classic' as const
	);

	onMount(() => {
		if (!localStorage.getItem(SEEN_KEY)) {
			howToPlayOpen = true;
			localStorage.setItem(SEEN_KEY, '1');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Screendle - Daily Movie Guessing Game</title>
</svelte:head>

<div class="dark min-h-screen bg-background text-foreground overflow-x-hidden">
	<!-- Navbar - outside scanline container, no scanlines here -->
	<nav class="h-12 flex items-center justify-between px-4 border-b border-crt-amber/10">
		<a href="/" class="text-sm font-headline font-semibold tracking-wide hover:text-crt-amber transition-colors">
			<House class="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-crt-amber/10 transition-colors p-1 rounded-full"/>
		</a>
		<div class="w-10 flex justify-end">
			<button
				onclick={() => howToPlayOpen = true}
				class="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-crt-amber/10 transition-colors"
				aria-label="How to play"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
			</button>
		</div>
	</nav>

	<!-- Content area with CRT scanline overlay -->
	<div class="crt-scanlines">
		{@render children()}
	</div>

	<HowToPlay open={howToPlayOpen} onClose={() => howToPlayOpen = false} {defaultTab} />
</div>
