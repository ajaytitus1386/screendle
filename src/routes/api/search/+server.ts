import { json } from '@sveltejs/kit';
import { TMDB_ACCESS_TOKEN, OMDB_API_KEY } from '$env/static/private';
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

async function getEnrichedMovie(tmdbId: number): Promise<Movie | null> {
	// Fetch movie details with credits and keywords appended
	const detailsResponse = await fetch(
		`${TMDB_BASE}/movie/${tmdbId}?append_to_response=credits,keywords`,
		{
			headers: {
				Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
				'Content-Type': 'application/json'
			}
		}
	);

	if (!detailsResponse.ok) {
		return null;
	}

	const details = await detailsResponse.json();

	// Find director from credits
	const director =
		details.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown';

	// Get keywords (limit to 10)
	const keywords =
		details.keywords?.keywords?.slice(0, 10).map((k: any) => k.name) || [];

	// Get IMDb rating from OMDB if we have an IMDb ID
	let imdbRating = 0;
	if (details.imdb_id) {
		try {
			const omdbResponse = await fetch(
				`https://www.omdbapi.com/?i=${details.imdb_id}&apikey=${OMDB_API_KEY}`
			);
			if (omdbResponse.ok) {
				const omdbData = await omdbResponse.json();
				if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
					imdbRating = parseFloat(omdbData.imdbRating);
				}
			}
		} catch (error) {
			console.error('OMDB fetch failed:', error);
		}
	}

	// Get country from production countries
	const country =
		details.production_countries?.[0]?.iso_3166_1 ||
		details.origin_country?.[0] ||
		'Unknown';

	// Map country codes to readable names
	const countryMap: Record<string, string> = {
		US: 'USA',
		GB: 'UK',
		CA: 'Canada',
		AU: 'Australia',
		FR: 'France',
		DE: 'Germany',
		JP: 'Japan',
		KR: 'South Korea',
		IN: 'India',
		IT: 'Italy',
		ES: 'Spain',
		CN: 'China',
		NZ: 'New Zealand'
	};

	return {
		id: details.id,
		title: details.title,
		poster_path: details.poster_path,
		release_date: details.release_date || '',
		year: details.release_date ? new Date(details.release_date).getFullYear() : 0,
		genres: details.genres?.map((g: any) => g.name) || [],
		runtime: details.runtime || 0,
		director,
		imdb_rating: imdbRating,
		keywords,
		country: countryMap[country] || country
	};
}
