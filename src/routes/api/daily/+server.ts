import { json } from '@sveltejs/kit';
import { getDailyMovieId, getRandomMovieId } from '$lib/daily';
import { getEnrichedMovie } from '$lib/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const random = url.searchParams.get('random') === 'true';
	const movieId = random ? getRandomMovieId() : getDailyMovieId();

	try {
		const movie = await getEnrichedMovie(movieId);

		if (!movie) {
			return json({ error: 'Failed to fetch daily movie' }, { status: 500 });
		}

		return json({ movie });
	} catch (error) {
		console.error('Daily movie fetch error:', error);
		return json({ error: 'Failed to fetch daily movie' }, { status: 500 });
	}
};
