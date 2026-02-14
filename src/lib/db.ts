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

/** Convert a D1 row with aliased columns (from a JOIN) into a Movie object.
 *  Columns are expected to be prefixed, e.g. a_title, b_imdb_rating, etc.
 */
export function rowToMovieFromAlias(row: any, prefix: string): Movie {
	return {
		id: row[`${prefix}_tmdb_id`],
		imdb_id: row[`${prefix}_imdb_id`],
		title: row[`${prefix}_title`],
		poster_path: row[`${prefix}_poster_url`]
			? row[`${prefix}_poster_url`].replace('https://image.tmdb.org/t/p/w500', '')
			: null,
		release_date: `${row[`${prefix}_year`]}-01-01`,
		year: row[`${prefix}_year`],
		genres: JSON.parse(row[`${prefix}_genres`] || '[]'),
		runtime: row[`${prefix}_runtime`],
		director: row[`${prefix}_director`],
		imdb_rating: row[`${prefix}_imdb_rating`],
		keywords: JSON.parse(row[`${prefix}_keywords`] || '[]'),
		country: row[`${prefix}_country`]
	};
}
