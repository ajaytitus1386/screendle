import { json } from '@sveltejs/kit';
import { rowToMovie } from '$lib/db';
import { getDailyMovieId, getRandomMovieId, getTodaysDateKey } from '$lib/daily';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, platform }) => {
	const random = url.searchParams.get('random') === 'true';
	const db = platform!.env.DB;

	// Practice/random mode — bypass scheduling entirely
	if (random) {
		try {
			const tmdbId = getRandomMovieId();
			const row = await db
				.prepare('SELECT * FROM movies WHERE tmdb_id = ? AND imdb_rating > 0')
				.bind(tmdbId)
				.first();
			if (row) return json({ movie: rowToMovie(row) });

			const fallback = await db
				.prepare('SELECT * FROM movies WHERE imdb_rating > 0 ORDER BY RANDOM() LIMIT 1')
				.first();
			if (!fallback) return json({ error: 'No movies available' }, { status: 500 });
			return json({ movie: rowToMovie(fallback) });
		} catch (error) {
			console.error('Random movie fetch error:', error);
			return json({ error: 'Failed to fetch movie' }, { status: 500 });
		}
	}

	try {
		const today = getTodaysDateKey();

		// Primary path: read from pre-scheduled daily_puzzles table
		const scheduled = await db
			.prepare(`
				SELECT m.* FROM daily_puzzles dp
				JOIN movies m ON m.id = dp.movie_id
				WHERE dp.date = ?
			`)
			.bind(today)
			.first();

		if (scheduled) {
			return json({ movie: rowToMovie(scheduled) });
		}

		// Fallback: seeded RNG (backward-compatible, used until schedule is populated)
		console.warn(`No daily_puzzles entry for ${today}, using seeded RNG fallback`);
		const tmdbId = getDailyMovieId();
		const row = await db
			.prepare('SELECT * FROM movies WHERE tmdb_id = ? AND imdb_rating > 0')
			.bind(tmdbId)
			.first();

		if (!row) {
			const fallback = await db
				.prepare('SELECT * FROM movies WHERE imdb_rating > 0 ORDER BY RANDOM() LIMIT 1')
				.first();
			if (!fallback) return json({ error: 'No movies available' }, { status: 500 });
			return json({ movie: rowToMovie(fallback) });
		}

		return json({ movie: rowToMovie(row) });
	} catch (error) {
		console.error('Daily movie fetch error:', error);
		return json({ error: 'Failed to fetch daily movie' }, { status: 500 });
	}
};
