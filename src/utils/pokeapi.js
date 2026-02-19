import { Pokedex } from 'pokeapi-js-wrapper';

const P = new Pokedex({
    cache: true,
    cacheImages: true
});

const MAINLINE_VERSIONS = [
    'red', 'blue', 'yellow',
    'gold', 'silver', 'crystal',
    'ruby', 'sapphire', 'emerald',
    'firered', 'leafgreen',
    'diamond', 'pearl', 'platinum',
    'heartgold', 'soulsilver',
    'black', 'white', 'black-2', 'white-2',
    'x', 'y', 'omega-ruby', 'alpha-sapphire',
    'sun', 'moon', 'ultra-sun', 'ultra-moon',
    'lets-go-pikachu', 'lets-go-eevee',
    'sword', 'shield',
    'brilliant-diamond', 'shining-pearl',
    'legends-arceus',
    'scarlet', 'violet',
    'legends-za'
];

/**
 * Fetches all mainline versions from PokeAPI.
 * Includes hardcoded versions for games not yet in the API.
 * @returns {Promise<Array>} List of versions.
 */
export async function getVersions() {
    try {
        const response = await P.getVersionsList();
        const apiVersions = response.results.map(v => v.name);

        // Combine API versions (filtered by MAINLINE) with MISSING mainland versions
        // This ensures unreleased games like legends-za appear.
        return MAINLINE_VERSIONS.map(name => ({
            name: name,
            url: response.results.find(v => v.name === name)?.url || null
        }));
    } catch (error) {
        console.error('Error fetching versions:', error);
        // Fallback to just the names
        return MAINLINE_VERSIONS.map(name => ({ name }));
    }
}

/**
 * Fetches locations associated with a specific version that have valid encounters.
 * Uses version-group filtering to prevent leakage and falls back to regional locations if data is missing.
 * Flow: Version -> Version Group (and all its Versions) -> Regions -> Locations -> Areas -> Encounters
 * @param {string} versionName - The name of the version (e.g., 'red').
 * @returns {Promise<Array>} List of locations with encounters.
 */
export async function getLocationsForVersion(versionName) {
    try {
        // 1. Get version group details and versions in that group
        const version = await P.getVersionByName(versionName);
        const versionGroup = await P.getVersionGroupByName(version.version_group.name);
        const groupVersionNames = versionGroup.versions.map(v => v.name);

        // 2. Fetch all locations for the regions in this version group
        const locationRefs = [];
        for (const regionRef of versionGroup.regions) {
            const region = await P.getRegionByName(regionRef.name);
            locationRefs.push(...region.locations);
        }

        // 3. Fetch detailed location data to get areas
        const locations = await Promise.all(
            locationRefs.map(ref => P.getLocationByName(ref.name).catch(() => null))
        );

        // 4. Flatten all areas and fetch their details to check encounters
        const areaRefs = locations
            .filter(loc => loc && loc.areas)
            .flatMap(loc => loc.areas.map(area => ({ ...area, locationName: loc.name })));

        const areaDetails = await Promise.all(
            areaRefs.map(ref => P.getLocationAreaByName(ref.name).catch(() => null))
        );

        // 5. Filter areas that have encounters for any version in this group
        // We use version-group filtering to be more robust than just the single version name
        const validLocationNames = new Set(
            areaDetails
                .filter(area => {
                    if (!area || !area.pokemon_encounters) return false;
                    return area.pokemon_encounters.some(encounter =>
                        encounter.version_details.some(vd => groupVersionNames.includes(vd.version.name))
                    );
                })
                .map(area => {
                    const ref = areaRefs.find(r => r.name === area.name);
                    return ref ? ref.locationName : null;
                })
                .filter(name => name !== null)
        );

        // 6. Fallback: If no locations with encounter data were found (common in Gen 8/9),
        // return all locations in the region that are likely to be encounterable.
        if (validLocationNames.size === 0) {
            locations.forEach(loc => {
                if (loc && (loc.areas.length > 0 || loc.name.includes('route') || loc.name.includes('cave'))) {
                    validLocationNames.add(loc.name);
                }
            });
        }

        // 7. Return the unique location names, formatted and sorted
        return Array.from(validLocationNames)
            .map(name => ({
                name: name,
                displayName: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

    } catch (error) {
        console.error(`Error fetching locations for version ${versionName}:`, error);
        return [];
    }
}

/**
 * Fetches all version groups from PokeAPI.
 * @returns {Promise<Array>} List of version groups.
 */
export async function getVersionGroups() {
    try {
        const response = await P.getVersionGroupsList();
        return response.results;
    } catch (error) {
        console.error('Error fetching version groups:', error);
        return [];
    }
}

/**
 * Fetches all Pokemon encounters for a specific version and location.
 * Groups by encounter method and aggregates chances.
 * @param {string} versionName - The name of the version.
 * @param {string} locationName - The name of the location.
 * @returns {Promise<Object>} Grouped encounters: { methodDisplay: [{ name, sprite, rate }] }.
 */
export async function getEncounters(versionName, locationName, options = {}) {
    try {
        const location = await P.getLocationByName(locationName);
        const areas = await Promise.all(
            location.areas.map(areaRef => P.getLocationAreaByName(areaRef.name).catch(() => null))
        );

        const encountersByArea = {}; // AreaDisplay -> { MethodName -> Map(PokemonName -> { sumChance, sprite }) }

        // Define Condition Categories
        const SLOT2_CONDITIONS = new Set(['slot2-ruby', 'slot2-sapphire', 'slot2-emerald', 'slot2-firered', 'slot2-leafgreen']);
        const TIME_CONDITIONS = new Set(['time-morning', 'time-day', 'time-night']);
        const RADIO_CONDITIONS = new Set(['radio-hoenn', 'radio-sinnoh']);
        const OTHER_SPECIAL = new Set(['radar-on', 'swarm-yes']); // Add others if needed like radio

        for (const area of areas) {
            if (!area || !area.pokemon_encounters) continue;

            // Format Area Name (Strip location prefix if present for cleaner UI)
            // e.g. "cerulean-cave-1f" -> "1f" inside "cerulean-cave"
            let areaNameDisplay = area.name;
            if (areaNameDisplay.startsWith(locationName + '-')) {
                areaNameDisplay = areaNameDisplay.substring(locationName.length + 1);
            }
            areaNameDisplay = areaNameDisplay.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            // If the name becomes empty or just "Area", usually we can keep it, 
            // or if it's the ONLY area, the UI loop will handle it.
            // But if we have "1f", "2f", we want those distinct.

            if (!encountersByArea[areaNameDisplay]) {
                encountersByArea[areaNameDisplay] = {};
            }

            for (const encounter of area.pokemon_encounters) {
                const versionDetail = encounter.version_details.find(vd => vd.version.name === versionName);
                if (versionDetail) {
                    for (const detail of versionDetail.encounter_details) {

                        const conditionValues = detail.condition_values.map(c => c.name);

                        // --- FILTER LOGIC (DISABLED) ---
                        // We are now showing everything, split by time for Walk.

                        let methodDisplayNames = [];

                        const methodNameRaw = detail.method.name;
                        const methodNameFormatted = methodNameRaw.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                        // Logic: "Explode" Walk encounters into Time categories
                        if (methodNameRaw === 'walk') {
                            // STRICT EXCLUSION: Skip if it has Radar, Swarm, Radio, or Slot 2 conditions
                            // Note: 'radio-off' and 'slot2-none' are standard states and should NOT be excluded.
                            if (conditionValues.includes('radar-on') ||
                                conditionValues.includes('swarm-yes') ||
                                (conditionValues.some(c => c.startsWith('radio-')) && !conditionValues.includes('radio-off')) ||
                                (conditionValues.some(c => c.startsWith('slot2-')) && !conditionValues.includes('slot2-none'))) {
                                continue;
                            }

                            const hasMorning = conditionValues.includes('time-morning');
                            const hasDay = conditionValues.includes('time-day');
                            const hasNight = conditionValues.includes('time-night');

                            const isTimeSpecific = hasMorning || hasDay || hasNight;

                            if (!isTimeSpecific) {
                                methodDisplayNames.push('Walk');
                            } else {
                                if (hasMorning) methodDisplayNames.push('Walk - 🌅');
                                if (hasDay) methodDisplayNames.push('Walk - ☀️');
                                if (hasNight) methodDisplayNames.push('Walk - 🌙');
                            }
                        } else {
                            // Non-walk methods (Surf, Old Rod, etc) - Keep as is
                            methodDisplayNames.push(methodNameFormatted);
                        }

                        // Add to all applicable lists
                        for (const methodKey of methodDisplayNames) {
                            if (!encountersByArea[areaNameDisplay][methodKey]) {
                                encountersByArea[areaNameDisplay][methodKey] = new Map();
                            }

                            const pokemonName = encounter.pokemon.name;
                            const chance = detail.chance;

                            if (encountersByArea[areaNameDisplay][methodKey].has(pokemonName)) {
                                encountersByArea[areaNameDisplay][methodKey].get(pokemonName).sumChance += chance;
                            } else {
                                encountersByArea[areaNameDisplay][methodKey].set(pokemonName, { sumChance: chance, sprite: null });
                            }
                        }
                    }
                }
            }
        }

        // Fetch Pokemon details for sprites
        const allPokemonNames = new Set();
        Object.values(encountersByArea).forEach(methods => {
            Object.values(methods).forEach(map => {
                map.forEach((_, name) => allPokemonNames.add(name));
            });
        });

        const pokemonNamesArray = Array.from(allPokemonNames);
        const pokemonDetails = await Promise.all(
            pokemonNamesArray.map(name => P.getPokemonByName(name).catch(() => null))
        );

        const spriteMap = new Map();
        pokemonNamesArray.forEach((name, index) => {
            const detail = pokemonDetails[index];
            // Priority: Front Default -> Official Artwork -> null
            const normal = detail?.sprites?.front_default
                || detail?.sprites?.other?.['official-artwork']?.front_default
                || null;
            const shiny = detail?.sprites?.front_shiny || null;

            spriteMap.set(name, { normal, shiny });
        });

        // Format results: { "Area 1": { "Walk": [ {name, ...} ] } }
        const finalGrouped = {};

        for (const [areaName, methods] of Object.entries(encountersByArea)) {
            // Only add area if it has methods
            if (Object.keys(methods).length > 0) {
                finalGrouped[areaName] = {};
                for (const [method, map] of Object.entries(methods)) {
                    finalGrouped[areaName][method] = Array.from(map.entries()).map(([name, data]) => ({
                        name: name,
                        displayName: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                        sprite: spriteMap.get(name).normal,
                        shinySprite: spriteMap.get(name).shiny,
                        rate: data.sumChance
                    })).sort((a, b) => b.rate - a.rate);
                }
            }
        }

        return finalGrouped;

    } catch (error) {
        console.error(`Error fetching encounters for ${locationName} in ${versionName}:`, error);
        return {};
    }
}

export default P;
