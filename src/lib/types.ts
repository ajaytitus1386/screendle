export interface Movie {
	id: number;
	title: string;
	poster_path: string | null;
	release_date: string;
	year: number;
	genres: string[];
	runtime: number;
	director: string;
	imdb_rating: number;
	keywords: string[];
	country: string;
}

export type MatchType = 'exact' | 'partial' | 'none';
export type Direction = 'up' | 'down' | 'match';

export interface PropertyMatch {
	value: string | number | string[];
	match: MatchType;
	direction?: Direction; // for numeric properties
}

export interface GuessResult {
	movie: Movie;
	matches: {
		genre: PropertyMatch;
		year: PropertyMatch;
		runtime: PropertyMatch;
		imdb_rating: PropertyMatch;
		director: PropertyMatch;
		keywords: PropertyMatch;
		country: PropertyMatch;
	};
}

export interface GameState {
	targetMovie: Movie | null;
	guesses: GuessResult[];
	gameOver: boolean;
	won: boolean;
}

// For localStorage persistence
export interface GameSave {
	date: string;
	targetMovieId: number;
	guesses: GuessResult[];
	gameOver: boolean;
	won: boolean;
}

// Scales mode types
export interface ScalesRound {
	movieA: Movie;
	movieB: Movie;
	correctAnswer: 'A' | 'B';
	userAnswer: 'A' | 'B' | null;
	revealed: boolean;
}

export interface ScalesGameSave {
	date: string;
	rounds: ScalesRound[];
	currentRound: number;
	score: number;
	gameComplete: boolean;
}
