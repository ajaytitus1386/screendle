<script lang="ts">
</script>

<main class="container mx-auto max-w-2xl px-4 py-16">
	<header class="mb-12 text-center">
		<h1 class="mb-3 text-5xl font-bold tracking-tight">Screendle</h1>
		<p class="text-lg text-muted-foreground">Daily movie games. Pick a mode.</p>
	</header>

	<div class="grid gap-6 sm:grid-cols-2">
		<!-- Classic Mode Card -->
		<a
			href="/classic"
			class="group rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 p-6 transition-all hover:border-green-500/50 hover:bg-black/50"
		>
			<div class="mb-3 inline-block rounded-lg bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-400">
				Classic
			</div>
			<h2 class="mb-2 text-xl font-bold text-foreground group-hover:text-green-400 transition-colors">
				Guess the Movie
			</h2>
			<p class="text-sm text-muted-foreground">
				Guess the daily movie and get feedback on genre, year, runtime, rating, director, keywords, and country.
			</p>
		</a>

		<!-- Scales Mode Card -->
		<a
			href="/scales"
			class="group rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 p-6 transition-all hover:border-orange-500/50 hover:bg-black/50"
		>
			<div class="mb-3 inline-block rounded-lg bg-orange-500/20 px-3 py-1 text-sm font-semibold text-orange-400">
				Scales
			</div>
			<h2 class="mb-2 text-xl font-bold text-foreground group-hover:text-orange-400 transition-colors">
				Higher or Lower
			</h2>
			<p class="text-sm text-muted-foreground">
				Two movies, one question &mdash; which has the higher IMDb rating? 10 rounds, difficulty ramps up.
			</p>
		</a>
	</div>
</main>
