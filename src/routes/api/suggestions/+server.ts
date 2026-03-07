import { json } from '@sveltejs/kit';
import { rowToMovie } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, platform }) => {
	const genres = url.searchParams.get('genres');
	const excludeId = url.searchParams.get('exclude');
	if (!genres) return json({ suggestions: [] });

	const genreList = genres.split(',').map(g => g.trim()).filter(Boolean);
	if (genreList.length === 0) return json({ suggestions: [] });

	const db = platform!.env.DB;

	try {
		// Build WHERE clause: match any genre via LIKE on the JSON genres column
		const conditions = genreList.map(() => `genres LIKE ?`);
		const params = genreList.map(g => `%"${g}"%`);

		let query = `SELECT * FROM movies WHERE (${conditions.join(' OR ')}) AND imdb_rating > 0`;
		if (excludeId) {
			query += ` AND tmdb_id != ?`;
			params.push(excludeId);
		}
		query += ` ORDER BY RANDOM() LIMIT 6`;

		const { results } = await db.prepare(query).bind(...params).all();
		const suggestions = results.map(rowToMovie);

		return json({ suggestions });
	} catch (error) {
		console.error('Suggestions fetch error:', error);
		return json({ suggestions: [] });
	}
};
