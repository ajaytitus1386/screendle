-- Add plot columns to existing movies table
ALTER TABLE movies ADD COLUMN plot_short TEXT;
ALTER TABLE movies ADD COLUMN plot_full TEXT;
