-- Migration: add category column to daily_puzzles
-- SQLite does not support ALTER TABLE ADD COLUMN IF NOT EXISTS.
-- If the column already exists this will error — that is safe to ignore.
-- Run: npm run db:migrate:local
--      npm run db:migrate:remote

ALTER TABLE daily_puzzles ADD COLUMN category TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS idx_daily_puzzles_category ON daily_puzzles(category);
