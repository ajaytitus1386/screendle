import { json } from '@sveltejs/kit';
import { rowToMovie } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, platform }) => {
	const genres = url.searchParams.get('genres');
	const excludeId = url.searchParams.get('exclude');
	const excludeIds = url.searchParams.get('excludeIds');
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '6'), 10);

	// Clue filters
	const yearMin = url.searchParams.get('yearMin');
	const yearMax = url.searchParams.get('yearMax');
	const runtimeMin = url.searchParams.get('runtimeMin');
	const runtimeMax = url.searchParams.get('runtimeMax');
	const ratingMin = url.searchParams.get('ratingMin');
	const ratingMax = url.searchParams.get('ratingMax');

	const db = platform!.env.DB;

	try {
		const conditions: string[] = ['imdb_rating > 0'];
		const params: string[] = [];

		// Genre filter
		if (genres) {
			const genreList = genres.split(',').map(g => g.trim()).filter(Boolean);
			if (genreList.length > 0) {
				const genreConditions = genreList.map(() => `genres LIKE ?`);
				conditions.push(`(${genreConditions.join(' OR ')})`);
				params.push(...genreList.map(g => `%"${g}"%`));
			}
		}

		// Exclude single ID (target movie)
		if (excludeId) {
			conditions.push(`tmdb_id != ?`);
			params.push(excludeId);
		}

		// Exclude multiple IDs (already guessed + existing suggestions)
		if (excludeIds) {
			const ids = excludeIds.split(',').filter(Boolean);
			if (ids.length > 0) {
				conditions.push(`tmdb_id NOT IN (${ids.map(() => '?').join(',')})`);
				params.push(...ids);
			}
		}

		// Clue-based range filters
		if (yearMin) { conditions.push(`year >= ?`); params.push(yearMin); }
		if (yearMax) { conditions.push(`year <= ?`); params.push(yearMax); }
		if (runtimeMin) { conditions.push(`runtime >= ?`); params.push(runtimeMin); }
		if (runtimeMax) { conditions.push(`runtime <= ?`); params.push(runtimeMax); }
		if (ratingMin) { conditions.push(`imdb_rating >= ?`); params.push(ratingMin); }
		if (ratingMax) { conditions.push(`imdb_rating <= ?`); params.push(ratingMax); }

		const query = `SELECT * FROM movies WHERE ${conditions.join(' AND ')} ORDER BY RANDOM() LIMIT ${limit}`;

		const { results } = await db.prepare(query).bind(...params).all();
		const suggestions = results.map(rowToMovie);

		return json({ suggestions });
	} catch (error) {
		console.error('Suggestions fetch error:', error);
		return json({ suggestions: [] });
	}
};
