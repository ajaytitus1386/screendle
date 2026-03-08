/**
 * Backfill plot_short and plot_full for existing movies in D1.
 *
 * Usage:
 *   # Local DB
 *   npx tsx scripts/backfill-plots.ts --local
 *
 *   # Production DB
 *   npx tsx scripts/backfill-plots.ts --remote
 *
 * Generates scripts/backfill-plots.sql, then apply with:
 *   wrangler d1 execute screendle-db --local --file=scripts/backfill-plots.sql
 *   wrangler d1 execute screendle-db --remote --file=scripts/backfill-plots.sql
 *
 * Requires OMDB_API_KEY in .env
 */

import 'dotenv/config';
import { writeFileSync, appendFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = join(__dirname, 'backfill-plots.sql');
const CHECKPOINT_FILE = join(__dirname, '.backfill-plots-checkpoint.json');

const OMDB_API_KEY = process.env.OMDB_API_KEY;
if (!OMDB_API_KEY) {
	console.error('Missing OMDB_API_KEY in .env');
	process.exit(1);
}

const OMDB_DELAY_MS = 110; // stay under 1000 req/day free tier
const BATCH_SIZE = 500;

function escapeSQL(str: string): string {
	return str.replace(/'/g, "''");
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

interface Checkpoint {
	processedIds: number[];
	updated: number;
	skipped: number;
}

function loadCheckpoint(): Checkpoint {
	if (existsSync(CHECKPOINT_FILE)) {
		try {
			return JSON.parse(readFileSync(CHECKPOINT_FILE, 'utf-8'));
		} catch {
			console.error('Corrupted checkpoint, starting fresh');
		}
	}
	return { processedIds: [], updated: 0, skipped: 0 };
}

function saveCheckpoint(cp: Checkpoint): void {
	writeFileSync(CHECKPOINT_FILE, JSON.stringify(cp));
}

async function fetchPlots(imdbId: string): Promise<{ short: string | null; full: string | null }> {
	const result = { short: null as string | null, full: null as string | null };
	try {
		const resShort = await fetch(`https://www.omdbapi.com/?i=${imdbId}&plot=short&apikey=${OMDB_API_KEY}`);
		if (resShort.ok) {
			const data = await resShort.json();
			if (data.Plot && data.Plot !== 'N/A') result.short = data.Plot;
		}
		await sleep(OMDB_DELAY_MS);
		const resFull = await fetch(`https://www.omdbapi.com/?i=${imdbId}&plot=full&apikey=${OMDB_API_KEY}`);
		if (resFull.ok) {
			const data = await resFull.json();
			if (data.Plot && data.Plot !== 'N/A') result.full = data.Plot;
		}
	} catch {
		// skip
	}
	return result;
}

async function main() {
	const isLocal = process.argv.includes('--local');
	const isRemote = process.argv.includes('--remote');
	if (!isLocal && !isRemote) {
		console.error('Usage: npx tsx scripts/backfill-plots.ts --local|--remote');
		process.exit(1);
	}

	const flag = isRemote ? '--remote' : '--local';

	// Get all movies with imdb_id that don't have plots yet
	console.error(`Querying movies from ${flag} DB...`);
	const rawJson = execSync(
		`npx wrangler d1 execute screendle-db ${flag} --json --command="SELECT id, imdb_id FROM movies WHERE imdb_id IS NOT NULL AND plot_short IS NULL"`,
		{ encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
	);

	const parsed = JSON.parse(rawJson);
	const rows: { id: number; imdb_id: string }[] = parsed[0]?.results || [];
	console.error(`Found ${rows.length} movies needing plots`);

	if (rows.length === 0) {
		console.error('Nothing to backfill!');
		return;
	}

	const checkpoint = loadCheckpoint();
	const processedSet = new Set(checkpoint.processedIds);
	const remaining = rows.filter((r) => !processedSet.has(r.id));

	console.error(`${processedSet.size} already done, ${remaining.length} remaining`);

	if (checkpoint.processedIds.length === 0) {
		writeFileSync(OUTPUT_FILE, `-- Backfill plots\n-- Generated: ${new Date().toISOString()}\n\n`);
	}

	let { updated, skipped } = checkpoint;
	let batchBuffer: string[] = [];

	function flushBatch() {
		if (batchBuffer.length === 0) return;
		const block = `BEGIN TRANSACTION;\n${batchBuffer.join('\n')}\nCOMMIT;\n\n`;
		appendFileSync(OUTPUT_FILE, block);
		batchBuffer = [];
	}

	for (let i = 0; i < remaining.length; i++) {
		const row = remaining[i];
		const plots = await fetchPlots(row.imdb_id);

		processedSet.add(row.id);

		if (!plots.short && !plots.full) {
			skipped++;
		} else {
			const shortVal = plots.short ? `'${escapeSQL(plots.short)}'` : 'NULL';
			const fullVal = plots.full ? `'${escapeSQL(plots.full)}'` : 'NULL';
			batchBuffer.push(
				`UPDATE movies SET plot_short = ${shortVal}, plot_full = ${fullVal} WHERE id = ${row.id};`
			);
			updated++;
		}

		if (batchBuffer.length >= BATCH_SIZE) flushBatch();

		if ((i + 1) % 50 === 0) {
			checkpoint.processedIds = [...processedSet];
			checkpoint.updated = updated;
			checkpoint.skipped = skipped;
			saveCheckpoint(checkpoint);
			console.error(`  Progress: ${processedSet.size}/${rows.length} (${updated} updated, ${skipped} skipped)`);
		}

		await sleep(OMDB_DELAY_MS);
	}

	flushBatch();
	checkpoint.processedIds = [...processedSet];
	checkpoint.updated = updated;
	checkpoint.skipped = skipped;
	saveCheckpoint(checkpoint);

	console.error(`\nDone! Updated ${updated}, skipped ${skipped}`);
	console.error(`Output: ${OUTPUT_FILE}`);
	console.error(`\nApply with:\n  npx wrangler d1 execute screendle-db ${flag} --file=scripts/backfill-plots.sql`);
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
