<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Screendle - Daily Movie Guessing Game</title>
</svelte:head>

<div class="dark min-h-screen bg-background text-foreground">
	<!-- Navbar -->
	<nav class="h-12 flex items-center justify-between px-4 border-b border-white/5">
		<div class="w-10">
			<!-- Left slot (reserved for future icons) -->
		</div>
		<div>
			<!-- Center slot -->
		</div>
		<div class="w-10">
			<!-- Right slot (reserved for future icons) -->
		</div>
	</nav>

	{@render children()}
</div>
