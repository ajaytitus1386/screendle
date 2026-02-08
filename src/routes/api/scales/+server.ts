import { json } from '@sveltejs/kit';
import { getDailyScalesMovieIds, getTodaysSeed, seededRandom } from '$lib/daily';
import { getEnrichedMovie } from '$lib/api';
import type { Movie } from '$lib/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const seed = getTodaysSeed();
	const movieIds = getDailyScalesMovieIds(seed);

	try {
		// Fetch all 20 movies in parallel
		const movies = await Promise.all(
			movieIds.map(async (id) => {
				try {
					return await getEnrichedMovie(id);
				} catch (error) {
					console.error(`Failed to fetch movie ${id}:`, error);
					return null;
				}
			})
		);

		// Filter out failed fetches and movies with no rating
		const validMovies = movies.filter(
			(m): m is Movie => m !== null && m.imdb_rating > 0
		);

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
