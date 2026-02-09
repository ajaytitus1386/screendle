-- Screendle D1 Schema

CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tmdb_id INTEGER UNIQUE NOT NULL,
  imdb_id TEXT,
  title TEXT NOT NULL,
  year INTEGER,
  runtime INTEGER,
  imdb_rating REAL,
  director TEXT,
  genres TEXT,         -- JSON array e.g. ["Action","Drama"]
  keywords TEXT,       -- JSON array e.g. ["heist","prison"]
  country TEXT,
  poster_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);

CREATE TABLE IF NOT EXISTS daily_puzzles (
  date TEXT PRIMARY KEY,  -- YYYY-MM-DD
  movie_id INTEGER NOT NULL REFERENCES movies(id)
);

CREATE TABLE IF NOT EXISTS scales_rounds (
  date TEXT NOT NULL,          -- YYYY-MM-DD
  round_number INTEGER NOT NULL,  -- 1-10
  movie_a_id INTEGER NOT NULL REFERENCES movies(id),
  movie_b_id INTEGER NOT NULL REFERENCES movies(id),
  PRIMARY KEY (date, round_number)
);
