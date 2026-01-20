import { json } from '@sveltejs/kit';
import { TMDB_ACCESS_TOKEN, OMDB_API_KEY } from '$env/static/private';
import { getDailyMovieId } from '$lib/daily';
import type { Movie } from '$lib/types';
import type { RequestHandler } from './$types';

const TMDB_BASE = 'https://api.themoviedb.org/3';

export const GET: RequestHandler = async () => {
	const movieId = getDailyMovieId();

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
