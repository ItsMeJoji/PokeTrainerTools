import { Pokedex } from 'pokeapi-js-wrapper';

const P = new Pokedex({
    cache: true,
    cacheImages: true
});

/**
 * Fetches all Pokemon for a specific generation.
 * @param {number} genNumber - The generation number (1-9).
 * @returns {Promise<Array>} List of Pokemon with id, name, and capture_rate.
 */
export async function getPokemonByGeneration(genNumber) {
    try {
        const genResponse = await P.getGenerationByName(genNumber);
        const speciesRefs = genResponse.pokemon_species;

        const speciesDetails = await Promise.all(
            speciesRefs.map(ref => P.getPokemonSpeciesByName(ref.name).catch(() => null))
        );

        return speciesDetails
            .filter(s => s !== null)
            .map(s => ({
                id: s.id,
                name: s.name,
                displayName: s.names.find(n => n.language.name === 'en')?.name || s.name,
                captureRate: s.capture_rate,
                generation: genNumber
            }))
            .sort((a, b) => a.id - b.id);
    } catch (error) {
        console.error(`Error fetching Pokemon for Generation ${genNumber}:`, error);
        return [];
    }
}

/**
 * Fetches all Pokemon up to a specific generation.

 * @param {number} genNumber - The generation number (1-9).
 * @returns {Promise<Array>} List of Pokemon with id, name, and capture_rate.
 */
export async function getPokemonUpToGeneration(genNumber) {
    try {
        const gens = Array.from({ length: genNumber }, (_, i) => i + 1);
        const genData = await Promise.all(gens.map(g => P.getGenerationByName(g)));

        const speciesRefs = genData.flatMap(g => g.pokemon_species);

        // Fetch species details in chunks to avoid overwhelming the API
        const speciesDetails = await Promise.all(
            speciesRefs.map(ref => P.getPokemonSpeciesByName(ref.name).catch(() => null))
        );

        return speciesDetails
            .filter(s => s !== null)
            .map(s => ({
                id: s.id,
                name: s.name,
                displayName: s.names.find(n => n.language.name === 'en')?.name || s.name,
                captureRate: s.capture_rate,
                generation: parseInt(s.generation.url.split('/').filter(Boolean).pop())
            }))
            .sort((a, b) => a.id - b.id);
    } catch (error) {
        console.error(`Error fetching Pokemon up to Generation ${genNumber}:`, error);
        return [];
    }
}

/**
 * Fetches all Poke Balls available in or before a specific generation.
 * @returns {Promise<Array>} List of Poke Balls with name and sprite.
 */
/**
 * Fetches all Poke Balls available in or before a specific generation.
 * Uses a hardcoded list for reliability and performance.
 * @param {number} genNumber - The generation number (1-9).
 * @returns {Array} List of Poke Balls with name, displayName, and sprite.
 */
export async function getPokeBalls(genNumber) {
    const allBalls = [
        // Gen 1
        { name: 'poke-ball', displayName: 'Poké Ball', gen: 1, id: 4 },
        { name: 'great-ball', displayName: 'Great Ball', gen: 1, id: 3 },
        { name: 'ultra-ball', displayName: 'Ultra Ball', gen: 1, id: 2 },
        { name: 'master-ball', displayName: 'Master Ball', gen: 1, id: 1 },
        { name: 'safari-ball', displayName: 'Safari Ball', gen: 1, id: 5 },
        // Gen 2
        { name: 'level-ball', displayName: 'Level Ball', gen: 2, id: 447 },
        { name: 'lure-ball', displayName: 'Lure Ball', gen: 2, id: 448 },
        { name: 'moon-ball', displayName: 'Moon Ball', gen: 2, id: 449 },
        { name: 'friend-ball', displayName: 'Friend Ball', gen: 2, id: 450 },
        { name: 'love-ball', displayName: 'Love Ball', gen: 2, id: 451 },
        { name: 'heavy-ball', displayName: 'Heavy Ball', gen: 2, id: 452 },
        { name: 'fast-ball', displayName: 'Fast Ball', gen: 2, id: 453 },
        { name: 'sport-ball', displayName: 'Sport Ball', gen: 2, id: 499 },
        // Gen 3
        { name: 'net-ball', displayName: 'Net Ball', gen: 3, id: 454 },
        { name: 'dive-ball', displayName: 'Dive Ball', gen: 3, id: 455 },
        { name: 'nest-ball', displayName: 'Nest Ball', gen: 3, id: 456 },
        { name: 'repeat-ball', displayName: 'Repeat Ball', gen: 3, id: 457 },
        { name: 'timer-ball', displayName: 'Timer Ball', gen: 3, id: 458 },
        { name: 'luxury-ball', displayName: 'Luxury Ball', gen: 3, id: 459 },
        { name: 'premier-ball', displayName: 'Premier Ball', gen: 3, id: 460 },
        // Gen 4
        { name: 'dusk-ball', displayName: 'Dusk Ball', gen: 4, id: 6 },
        { name: 'heal-ball', displayName: 'Heal Ball', gen: 4, id: 7 },
        { name: 'quick-ball', displayName: 'Quick Ball', gen: 4, id: 8 },
        { name: 'cherish-ball', displayName: 'Cherish Ball', gen: 4, id: 9 },
        { name: 'park-ball', displayName: 'Park Ball', gen: 4, id: 500 },
        // Gen 5
        { name: 'dream-ball', displayName: 'Dream Ball', gen: 5, id: 576 },
        // Gen 7
        { name: 'beast-ball', displayName: 'Beast Ball', gen: 7, id: 859 },
        // Gen 8
        { name: 'strange-ball', displayName: 'Strange Ball', gen: 8, id: 1694 }
    ];

    const filteredBalls = allBalls.filter(b => b.gen <= genNumber).filter(b => {
        if (genNumber === 5) {
            const excludedBalls = [
                'level-ball', 'lure-ball', 'moon-ball', 'friend-ball',
                'love-ball', 'heavy-ball', 'fast-ball', 'sport-ball',
                'safari-ball', 'park-ball', 'dream-ball'
            ];
            return !excludedBalls.includes(b.name);
        }
        return true;
    });

    return filteredBalls.map(b => ({
        ...b,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${b.name}.png`
    })).sort((a, b) => a.displayName.localeCompare(b.displayName));
}
