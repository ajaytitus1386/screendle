import { json } from '@sveltejs/kit';
import { rowToMovie } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, platform }) => {
	const query = url.searchParams.get('q');

	if (!query || query.length < 2) {
		return json({ results: [] });
	}

	try {
		const db = platform!.env.DB;
		const { results } = await db
			.prepare('SELECT * FROM movies WHERE title LIKE ? ORDER BY imdb_rating DESC LIMIT 8')
			.bind(`%${query}%`)
			.all();

		return json({
			results: results.map(rowToMovie)
		});
	} catch (error) {
		console.error('Search error:', error);
		return json({ results: [] }, { status: 500 });
	}
};
