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
export async function getPokeBalls(genNumber) {
    try {
        // 1. Fetch version groups and their generations to build a lookup
        const versionGroups = await P.getVersionGroupsList({ limit: 100 });
        const versionGroupDetails = await Promise.all(
            versionGroups.results.map(vg => P.getVersionGroupByName(vg.name))
        );
        const versionToGen = {};
        versionGroupDetails.forEach(vg => {
            versionToGen[vg.generation.name] = vg.generation.url.split('/').filter(Boolean).pop();
        });
        // 2. Fetch standard-balls category
        const categoriesList = await P.getItemCategoriesList({ limit: 1000 });
        const ballCategories = await Promise.all(
            categoriesList.results
                .filter(cat => cat.name.includes('balls'))
                .map(cat => P.getItemCategoryByName(cat.name))
        );
        const ballItemCategory = { items: ballCategories.flatMap(cat => cat.items) };
        const ballRefs = ballItemCategory.items;

        const ballDetails = await Promise.all(
            ballRefs.map(ref => P.getItemByName(ref.name).catch(() => null))
        );

        const pokeBalls = ballDetails
            .filter(b => b !== null && b.game_indices && b.game_indices.length > 0)
            .map(b => {
                // Find earliest generation from game_indices
                let debutGen = 99;
                b.game_indices.forEach(gi => {
                    const gen = gi.generation.url.split('/').filter(Boolean).pop();
                    if (gen && gen < debutGen) debutGen = gen;
                });
                return {
                    name: b.name,
                    displayName: b.names.find(n => n.language.name === 'en')?.name || b.name,
                    sprite: b.sprites.default,
                    generation: debutGen
                };
            })
            .filter(b => b.generation <= genNumber)
            .sort((a, b) => a.displayName.localeCompare(b.displayName));
        return pokeBalls;
    } catch (error) {
        console.error('Error fetching Poke Balls:', error);
        return [];
    }
}
