// Curated list of popular, recognizable movies (TMDB IDs)
// These are well-known movies that most players would have heard of
export const DAILY_MOVIE_IDS = [
	155,    // The Dark Knight
	238,    // The Godfather
	550,    // Fight Club
	680,    // Pulp Fiction
	13,     // Forrest Gump
	120,    // The Lord of the Rings: The Fellowship of the Ring
	244786, // Whiplash
	27205,  // Inception
	424,    // Schindler's List
	389,    // 12 Angry Men
	157336, // Interstellar
	122,    // The Lord of the Rings: The Two Towers
	103,    // The Return of the King
	278,    // The Shawshank Redemption
	429,    // The Good, the Bad and the Ugly
	497,    // The Green Mile
	240,    // The Godfather Part II
	769,    // GoodFellas
	207,    // Dead Poets Society
	73,     // American History X
	106,    // Predator
	101,    // Leon: The Professional
	694,    // The Shining
	539,    // Psycho
	185,    // A Clockwork Orange
	11,     // Star Wars
	1891,   // The Empire Strikes Back
	1892,   // Return of the Jedi
	78,     // Blade Runner
	603,    // The Matrix
	604,    // The Matrix Reloaded
	605,    // The Matrix Revolutions
	629,    // The Usual Suspects
	807,    // Se7en
	489,    // Good Will Hunting
	745,    // The Sixth Sense
	1422,   // The Departed
	274,    // The Silence of the Lambs
	37165,  // The Truman Show
	857,    // Saving Private Ryan
	62,     // 2001: A Space Odyssey
	510,    // One Flew Over the Cuckoo's Nest
	1359,   // American Psycho
	348,    // Alien
	679,    // Aliens
	8587,   // The Lion King
	812,    // Aladdin
	10681,  // WALL·E
	862,    // Toy Story
	863,    // Toy Story 2
	10193,  // Toy Story 3
	98,     // Gladiator
	197,    // Braveheart
	289,    // Casablanca
	11036,  // The Notebook
	597,    // Titanic
	76341,  // Mad Max: Fury Road
	68718,  // Django Unchained
	16869,  // Inglourious Basterds
	24,     // Kill Bill: Volume 1
	393,    // Kill Bill: Volume 2
	111,    // Scarface
	111776, // Boyhood
	77338,  // The Intouchables
	637,    // Life Is Beautiful
	1895,   // Star Wars: Episode III - Revenge of the Sith
	140607, // Star Wars: The Force Awakens
	181808, // Star Wars: The Last Jedi
	568332, // Taylor Swift: The Eras Tour (removing, not a traditional movie)
	640,    // Catch Me If You Can
	1726,   // Iron Man
	1771,   // Captain America: The First Avenger
	24428,  // The Avengers
	299536, // Avengers: Infinity War
	299534, // Avengers: Endgame
	118340, // Guardians of the Galaxy
	315635, // Spider-Man: Homecoming
	429617, // Spider-Man: Far From Home
	634649, // Spider-Man: No Way Home
	99861,  // Avengers: Age of Ultron
	284053, // Thor: Ragnarok
	284054, // Black Panther
	505642, // Black Panther: Wakanda Forever
	269149, // Zootopia
	150540, // Inside Out
	508947, // Turning Red
	301528, // Toy Story 4
	920,    // Cars
	585,    // Monsters, Inc.
	12,     // Finding Nemo
	127380, // Finding Dory
	354912, // Coco
	508442, // Soul
	508943, // Luca
	324857, // Spider-Man: Into the Spider-Verse
	569094, // Spider-Man: Across the Spider-Verse
	335984, // Blade Runner 2049
	346364, // It
	438631, // Dune
	438632, // Dune: Part Two
	361743, // Top Gun: Maverick
	744,    // Top Gun
	1124,   // The Prestige
	194662, // Birdman
	314365, // Spotlight
	313369, // La La Land
	376867, // Moonlight
	399055, // The Shape of Water
	490132, // Green Book
	496243, // Parasite
	581734, // Nomadland
	718821, // CODA
	497698, // Everything Everywhere All at Once
	872585, // Oppenheimer
	346698, // Barbie
];

// Simple seeded random number generator
function seededRandom(seed: number): number {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

// Get today's date as a number for seeding (YYYYMMDD format)
export function getTodaysSeed(): number {
	const now = new Date();
	return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

// Get the movie ID for a given date
export function getDailyMovieId(seed?: number): number {
	const dateSeed = seed ?? getTodaysSeed();
	const index = Math.floor(seededRandom(dateSeed) * DAILY_MOVIE_IDS.length);
	return DAILY_MOVIE_IDS[index];
}

// Get today's date string for localStorage key
export function getTodaysDateKey(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Get a completely random movie ID (for testing/practice mode)
export function getRandomMovieId(): number {
	const index = Math.floor(Math.random() * DAILY_MOVIE_IDS.length);
	return DAILY_MOVIE_IDS[index];
}
