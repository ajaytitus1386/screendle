import type { Movie } from '$lib/types';

/** Convert a D1 row into a Movie object */
export function rowToMovie(row: any): Movie {
	return {
		id: row.tmdb_id,
		imdb_id: row.imdb_id,
		title: row.title,
		poster_path: row.poster_url
			? row.poster_url.replace('https://image.tmdb.org/t/p/w500', '')
			: null,
		release_date: `${row.year}-01-01`,
		year: row.year,
		genres: JSON.parse(row.genres || '[]'),
		runtime: row.runtime,
		director: row.director,
		imdb_rating: row.imdb_rating,
		keywords: JSON.parse(row.keywords || '[]'),
		country: row.country
	};
}
