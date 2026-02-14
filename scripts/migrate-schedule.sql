-- Migration: add category column to daily_puzzles
-- Safe to run multiple times (SQLite ALTER TABLE ADD COLUMN is idempotent if column already exists via IF NOT EXISTS workaround)
-- Run: npx wrangler d1 execute screendle-db --local --file=scripts/migrate-schedule.sql
--      npx wrangler d1 execute screendle-db --file=scripts/migrate-schedule.sql

ALTER TABLE daily_puzzles ADD COLUMN category TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS idx_daily_puzzles_category ON daily_puzzles(category);
