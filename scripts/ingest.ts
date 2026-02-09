/**
 * Movie Ingestion Script for Screendle
 *
 * Fetches popular movies from TMDB, enriches with OMDB data,
 * and outputs SQL INSERT statements for D1.
 *
 * Usage:
 *   npx tsx scripts/ingest.ts > scripts/seed.sql
 *
 * Then apply to D1:
 *   wrangler d1 execute screendle-db --local --file=scripts/schema.sql
 *   wrangler d1 execute screendle-db --local --file=scripts/seed.sql
 *
 * Requires TMDB_ACCESS_TOKEN and OMDB_API_KEY in .env
 */

import 'dotenv/config';

const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

if (!TMDB_ACCESS_TOKEN || !OMDB_API_KEY) {
	console.error('Missing TMDB_ACCESS_TOKEN or OMDB_API_KEY in .env');
	process.exit(1);
}

const COUNTRY_MAP: Record<string, string> = {
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

// OMDB free tier: 1000 requests/day. Add delay to avoid hitting rate limits.
const OMDB_DELAY_MS = 100;
// TMDB rate limit: ~40 requests per 10 seconds
const TMDB_DELAY_MS = 250;

const TARGET_MOVIES = 5000;
const TMDB_PAGES = Math.ceil(TARGET_MOVIES / 20); // 20 results per page

interface MovieRow {
	tmdb_id: number;
	imdb_id: string | null;
	title: string;
	year: number;
	runtime: number;
	imdb_rating: number;
	director: string;
	genres: string[];
	keywords: string[];
	country: string;
	poster_url: string | null;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeSQL(str: string): string {
	return str.replace(/'/g, "''");
}

async function tmdbFetch(path: string): Promise<any> {
	const res = await fetch(`${TMDB_BASE}${path}`, {
		headers: {
			Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
			'Content-Type': 'application/json'
		}
	});
	if (!res.ok) {
		throw new Error(`TMDB ${path} failed: ${res.status}`);
	}
	return res.json();
}

async function getOmdbRating(imdbId: string): Promise<number> {
	try {
		const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
		if (!res.ok) return 0;
		const data = await res.json();
		if (data.imdbRating && data.imdbRating !== 'N/A') {
			return parseFloat(data.imdbRating);
		}
	} catch {
		// skip
	}
	return 0;
}

async function fetchMovieDetails(tmdbId: number): Promise<MovieRow | null> {
	try {
		const details = await tmdbFetch(`/movie/${tmdbId}?append_to_response=credits,keywords`);

		// Skip non-English or very obscure movies
		if (!details.title || !details.release_date) return null;

		const director =
			details.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown';

		const keywords =
			details.keywords?.keywords?.slice(0, 10).map((k: any) => k.name) || [];

		const genres = details.genres?.map((g: any) => g.name) || [];

		const countryCode =
			details.production_countries?.[0]?.iso_3166_1 ||
			details.origin_country?.[0] ||
			'Unknown';

		let imdbRating = 0;
		if (details.imdb_id) {
			await sleep(OMDB_DELAY_MS);
			imdbRating = await getOmdbRating(details.imdb_id);
		}

		const year = details.release_date
			? new Date(details.release_date).getFullYear()
			: 0;

		return {
			tmdb_id: details.id,
			imdb_id: details.imdb_id || null,
			title: details.title,
			year,
			runtime: details.runtime || 0,
			imdb_rating: imdbRating,
			director,
			genres,
			keywords,
			country: COUNTRY_MAP[countryCode] || countryCode,
			poster_url: details.poster_path
				? `https://image.tmdb.org/t/p/w500${details.poster_path}`
				: null
		};
	} catch (err) {
		console.error(`Failed to fetch TMDB ID ${tmdbId}:`, err);
		return null;
	}
}

async function discoverMovieIds(): Promise<number[]> {
	const ids = new Set<number>();

	console.error(`Fetching up to ${TMDB_PAGES} pages from TMDB discover...`);

	for (let page = 1; page <= TMDB_PAGES && ids.size < TARGET_MOVIES; page++) {
		try {
			const data = await tmdbFetch(
				`/discover/movie?language=en-US&sort_by=popularity.desc` +
				`&vote_count.gte=100&with_original_language=en&page=${page}`
			);

			for (const movie of data.results) {
				ids.add(movie.id);
			}

			if (page % 50 === 0) {
				console.error(`  Page ${page}/${TMDB_PAGES}, collected ${ids.size} IDs`);
			}

			await sleep(TMDB_DELAY_MS);
		} catch (err) {
			console.error(`  Failed page ${page}:`, err);
			await sleep(1000);
		}
	}

	console.error(`Collected ${ids.size} unique movie IDs`);
	return [...ids];
}

async function main() {
	const ids = await discoverMovieIds();

	console.log('-- Screendle movie seed data');
	console.log('-- Generated: ' + new Date().toISOString());
	console.log('');

	let ingested = 0;
	let skipped = 0;

	for (let i = 0; i < ids.length; i++) {
		const movie = await fetchMovieDetails(ids[i]);

		if (!movie || movie.year === 0 || movie.runtime === 0) {
			skipped++;
			continue;
		}

		const sql =
			`INSERT OR IGNORE INTO movies (tmdb_id, imdb_id, title, year, runtime, imdb_rating, director, genres, keywords, country, poster_url) VALUES (` +
			`${movie.tmdb_id}, ` +
			`${movie.imdb_id ? `'${escapeSQL(movie.imdb_id)}'` : 'NULL'}, ` +
			`'${escapeSQL(movie.title)}', ` +
			`${movie.year}, ` +
			`${movie.runtime}, ` +
			`${movie.imdb_rating}, ` +
			`'${escapeSQL(movie.director)}', ` +
			`'${escapeSQL(JSON.stringify(movie.genres))}', ` +
			`'${escapeSQL(JSON.stringify(movie.keywords))}', ` +
			`'${escapeSQL(movie.country)}', ` +
			`${movie.poster_url ? `'${escapeSQL(movie.poster_url)}'` : 'NULL'}` +
			`);`;

		console.log(sql);
		ingested++;

		if ((i + 1) % 100 === 0) {
			console.error(`  Progress: ${i + 1}/${ids.length} (${ingested} ingested, ${skipped} skipped)`);
		}

		await sleep(TMDB_DELAY_MS);
	}

	console.error(`\nDone! Ingested ${ingested} movies, skipped ${skipped}`);
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
