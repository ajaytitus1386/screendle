<script lang="ts">
</script>

<main class="container mx-auto max-w-2xl px-4 py-16">
	<header class="mb-12 text-center">
		<h1 class="mb-3 text-5xl font-bold font-headline tracking-tight">Screendle</h1>
		<p class="text-lg text-text-cream/70">Daily movie games. Pick a mode.</p>
	</header>

	<div class="grid gap-6 sm:grid-cols-2">
		<!-- Classic Mode Card -->
		<a
			href="/classic"
			class="group rounded-xl bg-dark-surface/80 backdrop-blur-sm border border-crt-amber/10 p-6 transition-all hover:border-crt-cyan/50 hover:bg-dark-surface"
		>
			<div class="mb-3 inline-block rounded-lg bg-crt-cyan/20 px-3 py-1 text-sm font-semibold text-crt-cyan">
				Classic
			</div>
			<h2 class="mb-2 text-xl font-bold text-foreground group-hover:text-crt-cyan transition-colors">
				Guess the Movie
			</h2>
			<p class="text-sm text-muted-foreground">
				Guess the daily movie and get feedback on genre, year, runtime, rating, director, keywords, and country.
			</p>
		</a>

		<!-- Scales Mode Card -->
		<a
			href="/scales"
			class="group rounded-xl bg-dark-surface/80 backdrop-blur-sm border border-crt-amber/10 p-6 transition-all hover:border-crt-amber/50 hover:bg-dark-surface"
		>
			<div class="mb-3 inline-block rounded-lg bg-crt-amber/20 px-3 py-1 text-sm font-semibold text-crt-amber">
				Scales
			</div>
			<h2 class="mb-2 text-xl font-bold text-foreground group-hover:text-crt-amber transition-colors">
				Higher or Lower
			</h2>
			<p class="text-sm text-muted-foreground">
				Two movies, one question &mdash; which has the higher IMDb rating? 10 rounds, difficulty ramps up.
			</p>
		</a>
	</div>
</main>
