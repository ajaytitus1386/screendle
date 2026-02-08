import { json } from '@sveltejs/kit';
import { TMDB_ACCESS_TOKEN } from '$env/static/private';
import { getEnrichedMovie } from '$lib/api';
import type { Movie } from '$lib/types';
import type { RequestHandler } from './$types';

const TMDB_BASE = 'https://api.themoviedb.org/3';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');

	if (!query || query.length < 2) {
		return json({ results: [] });
	}

	try {
		// Search TMDB for movies
		const searchResponse = await fetch(
			`${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`,
			{
				headers: {
					Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
					'Content-Type': 'application/json'
				}
			}
		);

		if (!searchResponse.ok) {
			console.error('TMDB search failed:', await searchResponse.text());
			return json({ results: [] });
		}

		const searchData = await searchResponse.json();
		const movies = searchData.results.slice(0, 8); // Limit to 8 results

		// Enrich each movie with full details
		const enrichedMovies = await Promise.all(
			movies.map(async (movie: any) => {
				try {
					return await getEnrichedMovie(movie.id);
				} catch (error) {
					console.error(`Failed to enrich movie ${movie.id}:`, error);
					return null;
				}
			})
		);

		return json({
			results: enrichedMovies.filter((m): m is Movie => m !== null)
		});
	} catch (error) {
		console.error('Search error:', error);
		return json({ results: [] }, { status: 500 });
	}
};
