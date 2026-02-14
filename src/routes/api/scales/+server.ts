import { json } from '@sveltejs/kit';
import { rowToMovie, rowToMovieFromAlias } from '$lib/db';
import { getDailyScalesMovieIds, getTodaysSeed, getTodaysDateKey, seededRandom } from '$lib/daily';
import type { Movie } from '$lib/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
	const db = platform!.env.DB;

	try {
		const today = getTodaysDateKey();

		// Primary path: read from pre-scheduled scales_rounds table
		const { results: scheduledRounds } = await db
			.prepare(`
				SELECT
					sr.round_number,
					ma.tmdb_id AS a_tmdb_id, ma.imdb_id AS a_imdb_id, ma.title AS a_title,
					ma.year AS a_year, ma.runtime AS a_runtime, ma.imdb_rating AS a_imdb_rating,
					ma.director AS a_director, ma.genres AS a_genres, ma.keywords AS a_keywords,
					ma.country AS a_country, ma.poster_url AS a_poster_url,
					mb.tmdb_id AS b_tmdb_id, mb.imdb_id AS b_imdb_id, mb.title AS b_title,
					mb.year AS b_year, mb.runtime AS b_runtime, mb.imdb_rating AS b_imdb_rating,
					mb.director AS b_director, mb.genres AS b_genres, mb.keywords AS b_keywords,
					mb.country AS b_country, mb.poster_url AS b_poster_url
				FROM scales_rounds sr
				JOIN movies ma ON ma.id = sr.movie_a_id
				JOIN movies mb ON mb.id = sr.movie_b_id
				WHERE sr.date = ?
				ORDER BY sr.round_number ASC
			`)
			.bind(today)
			.all();

		if (scheduledRounds.length === 10) {
			const pairs = scheduledRounds.map((row) => ({
				movieA: rowToMovieFromAlias(row, 'a'),
				movieB: rowToMovieFromAlias(row, 'b')
			}));
			return json({ pairs });
		}

		// Fallback: seeded RNG (backward-compatible, used until schedule is populated)
		if (scheduledRounds.length > 0) {
			console.warn(`Only ${scheduledRounds.length} scales_rounds for ${today}, falling back to seeded RNG`);
		} else {
			console.warn(`No scales_rounds for ${today}, using seeded RNG fallback`);
		}

		const seed = getTodaysSeed();
		const movieIds = getDailyScalesMovieIds(seed);

		// Fetch all 20 movies from D1
		const placeholders = movieIds.map(() => '?').join(',');
		const { results } = await db
			.prepare(`SELECT * FROM movies WHERE tmdb_id IN (${placeholders})`)
			.bind(...movieIds)
			.all();

		// Build a lookup map and preserve the original order
		const movieMap = new Map<number, Movie>();
		for (const row of results) {
			movieMap.set(row.tmdb_id as number, rowToMovie(row));
		}

		// Get movies in original order, filter out missing/unrated
		const validMovies = movieIds
			.map((id) => movieMap.get(id))
			.filter((m): m is Movie => m !== undefined && m.imdb_rating > 0);

		// Create pairs from consecutive movies
		const rawPairs: { movieA: Movie; movieB: Movie; gap: number }[] = [];
		for (let i = 0; i + 1 < validMovies.length && rawPairs.length < 10; i += 2) {
			const gap = Math.abs(validMovies[i].imdb_rating - validMovies[i + 1].imdb_rating);
			rawPairs.push({
				movieA: validMovies[i],
				movieB: validMovies[i + 1],
				gap
			});
		}

		// Sort by gap descending (easy first = widest gap, hard last = narrowest gap)
		rawPairs.sort((a, b) => b.gap - a.gap);

		// Randomize A/B position per pair using seed so it's consistent for the day
		const pairs = rawPairs.map((pair, i) => {
			const swap = seededRandom(seed + 70000 + i) > 0.5;
			if (swap) {
				return { movieA: pair.movieB, movieB: pair.movieA };
			}
			return { movieA: pair.movieA, movieB: pair.movieB };
		});

		return json({ pairs });
	} catch (error) {
		console.error('Scales fetch error:', error);
		return json({ error: 'Failed to fetch scales pairs' }, { status: 500 });
	}
};
