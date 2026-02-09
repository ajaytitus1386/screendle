import { json } from '@sveltejs/kit';
import { rowToMovie } from '$lib/db';
import { getDailyMovieId, getRandomMovieId } from '$lib/daily';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, platform }) => {
	const random = url.searchParams.get('random') === 'true';
	const tmdbId = random ? getRandomMovieId() : getDailyMovieId();

	try {
		const db = platform!.env.DB;
		const row = await db
			.prepare('SELECT * FROM movies WHERE tmdb_id = ?')
			.bind(tmdbId)
			.first();

		if (!row) {
			return json({ error: 'Movie not found in database' }, { status: 404 });
		}

		return json({ movie: rowToMovie(row) });
	} catch (error) {
		console.error('Daily movie fetch error:', error);
		return json({ error: 'Failed to fetch daily movie' }, { status: 500 });
	}
};
