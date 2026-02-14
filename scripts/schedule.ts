/**
 * Screendle Schedule Generator
 *
 * Generates INSERT OR IGNORE SQL for daily_puzzles and scales_rounds tables,
 * pre-scheduling N days of Classic and Scales movie puzzles.
 *
 * Usage:
 *   npx tsx scripts/schedule.ts [options]
 *
 * Options:
 *   --days N           Days ahead to schedule (default: 60)
 *   --lookback N       Repeat-avoidance window in days (default: 180)
 *   --start YYYY-MM-DD Start date (default: tomorrow)
 *   --output FILE      Output SQL file (default: scripts/schedule.sql)
 *   --remote           Read from remote D1 instead of local
 *   --dry-run          Print SQL to stdout, don't write file
 */

import { writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Seeded RNG (mirrors src/lib/daily.ts exactly)
// ---------------------------------------------------------------------------

function seededRandom(seed: number): number {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
	const result = [...arr];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(seededRandom(seed + i) * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

function dateToInt(date: string): number {
	// YYYY-MM-DD -> YYYYMMDD integer
	return parseInt(date.replace(/-/g, ''), 10);
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function tomorrow(): string {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().slice(0, 10);
}

function addDays(date: string, n: number): string {
	const d = new Date(date + 'T00:00:00Z');
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
}

function subtractDays(date: string, n: number): string {
	return addDays(date, -n);
}

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): Record<string, string | boolean> {
	const args: Record<string, string | boolean> = {};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg.startsWith('--')) {
			const key = arg.slice(2);
			const next = argv[i + 1];
			if (next && !next.startsWith('--')) {
				args[key] = next;
				i++;
			} else {
				args[key] = true;
			}
		}
	}
	return args;
}

// ---------------------------------------------------------------------------
// D1 query via wrangler CLI
// Uses temp files instead of --command to avoid shell escaping issues in CI
// ---------------------------------------------------------------------------

function queryD1(sql: string, remote: boolean): any[] {
	const flag = remote ? '--remote' : '--local';
	const tmpFile = join(tmpdir(), `screendle-query-${Date.now()}.sql`);
	writeFileSync(tmpFile, sql, 'utf-8');
	try {
		// wrangler d1 execute outputs JSON to stdout by default (no --json flag needed)
		// stderr goes to inherit so CI logs show wrangler's own warnings/errors
		const out = execSync(
			`npx wrangler d1 execute screendle-db ${flag} --file="${tmpFile}"`,
			{ encoding: 'utf-8', stdio: ['pipe', 'pipe', 'inherit'] }
		);
		const jsonMatch = out.match(/\[[\s\S]*\]/);
		if (!jsonMatch) {
			console.error('D1 query returned no JSON. Raw output:', out.slice(0, 200));
			return [];
		}
		const parsed = JSON.parse(jsonMatch[0]);
		return parsed[0]?.results ?? [];
	} catch (e: any) {
		console.error('D1 query failed:');
		console.error('SQL:', sql);
		console.error('stdout:', e.stdout ?? '(empty)');
		process.exit(1);
	} finally {
		try { unlinkSync(tmpFile); } catch { /* ignore cleanup errors */ }
	}
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const DAYS_AHEAD = parseInt(args['days'] as string ?? '60', 10);
	const LOOKBACK = parseInt(args['lookback'] as string ?? '180', 10);
	const START_DATE = (args['start'] as string) ?? tomorrow();
	const OUTPUT_FILE = (args['output'] as string) ?? join(__dirname, 'schedule.sql');
	const DRY_RUN = Boolean(args['dry-run']);
	const REMOTE = Boolean(args['remote']);

	const END_DATE = addDays(START_DATE, DAYS_AHEAD - 1);

	console.error(`Screendle Schedule Generator`);
	console.error(`  Range:    ${START_DATE} → ${END_DATE} (${DAYS_AHEAD} days)`);
	console.error(`  Lookback: ${LOOKBACK} days`);
	console.error(`  Source:   ${REMOTE ? 'remote D1' : 'local D1'}`);
	console.error('');

	// ---- 1. Fetch existing schedule to find already-scheduled dates ----------

	console.error('Reading existing daily_puzzles...');
	const lookbackStart = subtractDays(START_DATE, LOOKBACK);
	const existingClassic = queryD1(
		`SELECT dp.date, m.tmdb_id FROM daily_puzzles dp JOIN movies m ON m.id = dp.movie_id WHERE dp.date >= '${lookbackStart}'`,
		REMOTE
	);
	const scheduledClassicDates = new Set<string>(
		existingClassic.filter(r => r.date >= START_DATE).map(r => r.date)
	);

	console.error('Reading existing scales_rounds...');
	const existingScalesDates = queryD1(
		`SELECT DISTINCT date FROM scales_rounds WHERE date >= '${START_DATE}'`,
		REMOTE
	).map(r => r.date);
	const scheduledScalesDates = new Set<string>(existingScalesDates);

	// ---- 2. Fetch eligible movie pool ----------------------------------------

	console.error('Fetching eligible movies from D1...');
	const allMovies: { id: number; tmdb_id: number; imdb_rating: number }[] = queryD1(
		`SELECT id, tmdb_id, imdb_rating FROM movies WHERE imdb_rating > 0`,
		REMOTE
	);

	if (allMovies.length < 20) {
		console.error(`ERROR: Only ${allMovies.length} rated movies — need at least 20 for Scales.`);
		process.exit(1);
	}

	console.error(`  ${allMovies.length} eligible movies`);
	console.error(`  ${scheduledClassicDates.size} Classic dates already scheduled in range`);
	console.error(`  ${scheduledScalesDates.size} Scales dates already scheduled in range`);
	console.error('');

	// ---- 3. Build Classic sliding-window of recently used movies --------------

	// Map date -> tmdb_id for the lookback window
	const recentlyUsedByDate = new Map<string, number>();
	for (const row of existingClassic) {
		recentlyUsedByDate.set(row.date, row.tmdb_id);
	}

	// Set of tmdb_ids currently in the lookback window
	const usedTmdbIds = new Set<number>(recentlyUsedByDate.values());

	// ---- 4. Generate SQL -------------------------------------------------------

	const sqlLines: string[] = [
		`-- Screendle schedule`,
		`-- Generated: ${new Date().toISOString()}`,
		`-- Range: ${START_DATE} → ${END_DATE} (${DAYS_AHEAD} days)`,
		`-- Source: ${REMOTE ? 'remote' : 'local'} D1`,
		``,
		`-- Classic (daily_puzzles)`,
		``
	];

	let classicCount = 0;
	let scalesCount = 0;

	for (let i = 0; i < DAYS_AHEAD; i++) {
		const date = addDays(START_DATE, i);

		// ---- Classic -----------------------------------------------------------
		if (!scheduledClassicDates.has(date)) {
			const pool = allMovies.filter(m => !usedTmdbIds.has(m.tmdb_id));
			const effectivePool = pool.length > 0 ? pool : allMovies; // safety: pool exhausted

			if (pool.length === 0) {
				console.error(`WARNING: Pool exhausted at ${date} — reusing movies (increase --lookback or add more movies)`);
			}

			// Deterministic shuffle: salt 99999 to avoid collision with existing API seeds
			const seed = dateToInt(date) + 99999;
			const shuffled = seededShuffle(effectivePool, seed);
			const chosen = shuffled[0];

			sqlLines.push(
				`INSERT OR IGNORE INTO daily_puzzles (date, movie_id, category) VALUES ` +
				`('${date}', (SELECT id FROM movies WHERE tmdb_id = ${chosen.tmdb_id}), 'default');`
			);
			classicCount++;

			// Advance sliding window
			usedTmdbIds.add(chosen.tmdb_id);
			recentlyUsedByDate.set(date, chosen.tmdb_id);

			// Expire entries that fall outside the lookback window
			const expiredDate = subtractDays(date, LOOKBACK);
			const expiredTmdbId = recentlyUsedByDate.get(expiredDate);
			if (expiredTmdbId !== undefined) {
				usedTmdbIds.delete(expiredTmdbId);
			}
		}
	}

	// ---- Scales ---------------------------------------------------------------
	sqlLines.push('', `-- Scales (scales_rounds)`, '');

	for (let i = 0; i < DAYS_AHEAD; i++) {
		const date = addDays(START_DATE, i);

		if (!scheduledScalesDates.has(date)) {
			// Distinct salt from Classic (99999) and existing API seeds (50000, 70000)
			const seed = dateToInt(date) + 150000;
			const shuffled = seededShuffle(allMovies, seed);
			const pool20 = shuffled.slice(0, 20);

			// Create 10 pairs from consecutive movies
			const rawPairs: { a: typeof allMovies[0]; b: typeof allMovies[0]; gap: number }[] = [];
			for (let j = 0; j + 1 < pool20.length && rawPairs.length < 10; j += 2) {
				rawPairs.push({
					a: pool20[j],
					b: pool20[j + 1],
					gap: Math.abs(pool20[j].imdb_rating - pool20[j + 1].imdb_rating)
				});
			}

			// Sort by gap descending: widest gap = round 1 (easiest), narrowest = round 10 (hardest)
			rawPairs.sort((x, y) => y.gap - x.gap);

			for (let roundIdx = 0; roundIdx < rawPairs.length; roundIdx++) {
				const roundNumber = roundIdx + 1;
				let { a, b } = rawPairs[roundIdx];

				// Deterministic A/B swap per round
				const swap = seededRandom(seed + 70000 + roundIdx) > 0.5;
				if (swap) [a, b] = [b, a];

				sqlLines.push(
					`INSERT OR IGNORE INTO scales_rounds (date, round_number, movie_a_id, movie_b_id) VALUES ` +
					`('${date}', ${roundNumber}, ` +
					`(SELECT id FROM movies WHERE tmdb_id = ${a.tmdb_id}), ` +
					`(SELECT id FROM movies WHERE tmdb_id = ${b.tmdb_id}));`
				);
			}
			scalesCount++;
		}
	}

	// ---- 5. Output -------------------------------------------------------------

	const sql = sqlLines.join('\n') + '\n';

	console.error(`Generated:`);
	console.error(`  Classic: ${classicCount} new days`);
	console.error(`  Scales:  ${scalesCount} new days (${scalesCount * 10} rounds)`);
	console.error('');

	if (DRY_RUN) {
		process.stdout.write(sql);
	} else {
		writeFileSync(OUTPUT_FILE, sql, 'utf-8');
		console.error(`Written to: ${OUTPUT_FILE}`);
		console.error('');
		console.error('Apply with:');
		if (REMOTE) {
			console.error(`  npm run schedule:apply:remote`);
		} else {
			console.error(`  npm run schedule:apply:local`);
			console.error(`  npm run schedule:apply:remote  (when ready for production)`);
		}
	}
}

main();
