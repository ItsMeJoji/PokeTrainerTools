import localForage from 'localforage';
import { Pokedex } from 'pokeapi-js-wrapper';

const LOCAL_POKEAPI_HOSTNAMES = ['localhost', '127.0.0.1'];
const LOCAL_POKEAPI_URL = 'http://localhost:8000/api/v2/';
const DEFAULT_POKEAPI_URL = 'https://pokeapi.co/api/v2/';

//const useLocalApi = LOCAL_POKEAPI_HOSTNAMES.includes(window.location.hostname);
const useLocalApi = false;
const apiUrl = useLocalApi ? LOCAL_POKEAPI_URL : DEFAULT_POKEAPI_URL;
const parsedApiUrl = new URL(apiUrl);

console.info('[PokeAPI] Using base URL:', apiUrl, '(cache disabled:', useLocalApi, ')');

if (useLocalApi) {
    localForage.ready()
        .then(() => localForage.clear())
        .then(() => console.info('[PokeAPI] Cleared localForage cache for local API mode.'))
        .catch(error => console.warn('[PokeAPI] Failed to clear local cache:', error));
}

const P = new Pokedex({
    cache: !useLocalApi, // disable wrapper cache when using local API so offline state is detectable
    cacheImages: false, // Disabled to prevent Service Worker Response clone conflict
    protocol: parsedApiUrl.protocol.replace(':', ''),
    hostName: parsedApiUrl.host,
    versionPath: parsedApiUrl.pathname.endsWith('/') ? parsedApiUrl.pathname : `${parsedApiUrl.pathname}/`
});

// Secondary results cache to store processed data
const resultCache = {
    versions: null,
    locations: {}, // versionName -> locations
    encounters: {}, // version-location -> encounters
};

function formatEncounterConditionLabels(conditionValues, methodNameRaw) {
    if (!Array.isArray(conditionValues) || conditionValues.length === 0) {
        return [];
    }

    const labels = [];
    for (const raw of conditionValues) {
        if (!raw || raw === 'none') continue;
        if (methodNameRaw === 'walk' && ['time-morning', 'time-day', 'time-night'].includes(raw)) {
            continue;
        }

        if (raw === 'radar-on') {
            labels.push('Radar On');
            continue;
        }
        if (raw === 'swarm-yes') {
            labels.push('Swarm');
            continue;
        }
        if (raw.startsWith('slot2-')) {
            const value = raw.replace('slot2-', '');
            labels.push(`Slot 2: ${value.charAt(0).toUpperCase() + value.slice(1)}`);
            continue;
        }
        if (raw.startsWith('radio-')) {
            const value = raw.replace('radio-', '');
            labels.push(`Radio: ${value.charAt(0).toUpperCase() + value.slice(1)}`);
            continue;
        }
        if (raw.startsWith('time-')) {
            const value = raw.replace('time-', '');
            labels.push(`Time: ${value.charAt(0).toUpperCase() + value.slice(1)}`);
            continue;
        }

        labels.push(raw.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
    }

    return Array.from(new Set(labels));
}

function normalizePokeApiPath(rawPath) {
    if (!rawPath || typeof rawPath !== 'string') {
        return rawPath;
    }
    try {
        const parsed = new URL(rawPath);
        return parsed.pathname + parsed.search;
    } catch (error) {
        return rawPath;
    }
}

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
    if (resultCache.versions) return resultCache.versions;
    try {
        const response = await P.getVersionsList();
        const versions = MAINLINE_VERSIONS.map(name => ({
            name: name,
            url: response.results.find(v => v.name === name)?.url || null
        }));
        resultCache.versions = versions;
        return versions;
    } catch (error) {
        console.error('Error fetching versions:', error);
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
    if (resultCache.locations[versionName]) return resultCache.locations[versionName];

    try {
        const version = await P.getVersionByName(versionName);
        const versionGroup = await P.getVersionGroupByName(version.version_group.name);
        const groupVersionNames = versionGroup.versions.map(v => v.name);

        const locationRefs = [];
        for (const regionRef of versionGroup.regions) {
            const region = await P.getRegionByName(regionRef.name);
            locationRefs.push(...region.locations);
        }

        const locations = await Promise.all(
            locationRefs.map(ref => P.getLocationByName(ref.name).catch(() => null))
        );

        const areaRefs = locations
            .filter(loc => loc && loc.areas)
            .flatMap(loc => loc.areas.map(area => ({ ...area, locationName: loc.name })));

        // Fetch area details in chunks
        const areaDetails = [];
        const chunkSize = 20;
        for (let i = 0; i < areaRefs.length; i += chunkSize) {
            const chunk = areaRefs.slice(i, i + chunkSize);
            const details = await Promise.all(
                chunk.map(ref => P.getLocationAreaByName(ref.name).catch(() => null))
            );
            areaDetails.push(...details);
        }

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

        if (validLocationNames.size === 0) {
            locations.forEach(loc => {
                if (loc && (loc.areas.length > 0 || loc.name.includes('route') || loc.name.includes('cave'))) {
                    validLocationNames.add(loc.name);
                }
            });
        }

        const finalResult = Array.from(validLocationNames)
            .map(name => ({
                name: name,
                displayName: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        resultCache.locations[versionName] = finalResult;
        return finalResult;
    } catch (error) {
        console.error(`Error fetching locations for version ${versionName}:`, error);
        return [];
    }
}

/**
 * Fetches a lightweight list of locations for a specific version.
 * This is MUCH faster than getLocationsForVersion because it doesn't resolve location details or area encounters.
 * @param {string} versionName - The name of the version.
 * @returns {Promise<Array>} List of locations with name and displayName.
 */
export async function getLocationsListForVersion(versionName) {
    if (resultCache.locations[versionName]) return resultCache.locations[versionName];

    try {
        const version = await P.getVersionByName(versionName);
        const versionGroup = await P.getVersionGroupByName(version.version_group.name);

        const locationRefs = [];
        for (const regionRef of versionGroup.regions) {
            const region = await P.getRegionByName(regionRef.name);
            locationRefs.push(...region.locations);
        }

        const finalResult = locationRefs
            .map(ref => ({
                name: ref.name,
                displayName: ref.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        // Note: We don't cache this in resultCache.locations because it's not the "full" verified list.
        // However, for the dropdown, it's perfect.
        return finalResult;
    } catch (error) {
        console.error(`Error fetching locations list for version ${versionName}:`, error);
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
    const cacheKey = `${versionName}-${locationName}`;
    if (resultCache.encounters[cacheKey]) return resultCache.encounters[cacheKey];

    try {
        const location = await P.getLocationByName(locationName);
        const areas = await Promise.all(
            location.areas.map(areaRef =>
                P.resource(normalizePokeApiPath(areaRef.url))
                    .catch(() => P.getLocationAreaByName(areaRef.name).catch(() => null))
            )
        );

        const encountersByArea = {};
        const methodOrderByArea = {};
        const areaEntries = [];

        for (const area of areas) {
            if (!area || !area.pokemon_encounters) continue;

            let areaNameDisplay = area.name;
            if (areaNameDisplay.startsWith(locationName + '-')) {
                areaNameDisplay = areaNameDisplay.substring(locationName.length + 1);
            }
            areaNameDisplay = areaNameDisplay.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            if (!encountersByArea[areaNameDisplay]) {
                encountersByArea[areaNameDisplay] = {};
                methodOrderByArea[areaNameDisplay] = [];
                areaEntries.push({
                    name: areaNameDisplay,
                    id: typeof area.id === 'number' ? area.id : Number.MAX_SAFE_INTEGER
                });
            }

            for (const encounter of area.pokemon_encounters) {
                const versionDetail = encounter.version_details.find(vd => vd.version.name === versionName);
                if (versionDetail) {
                    for (const detail of versionDetail.encounter_details) {
                        const conditionValues = detail.condition_values.map(c => c.name);
                        let methodDisplayNames = [];
                        const methodNameRaw = detail.method.name;
                        const methodNameFormatted = methodNameRaw.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                        if (methodNameRaw === 'walk') {
                            if (conditionValues.includes('radar-on') ||
                                conditionValues.includes('swarm-yes') ||
                                (conditionValues.some(c => c.startsWith('radio-')) && !conditionValues.includes('radio-off')) ||
                                (conditionValues.some(c => c.startsWith('slot2-')) && !conditionValues.includes('slot2-none'))) {
                                continue;
                            }

                            const hasMorning = conditionValues.includes('time-morning');
                            const hasDay = conditionValues.includes('time-day');
                            const hasNight = conditionValues.includes('time-night');

                            if (!hasMorning && !hasDay && !hasNight) {
                                methodDisplayNames.push('Walk');
                            } else {
                                if (hasMorning) methodDisplayNames.push('Walk - 🌅');
                                if (hasDay) methodDisplayNames.push('Walk - ☀️');
                                if (hasNight) methodDisplayNames.push('Walk - 🌙');
                            }
                        } else {
                            methodDisplayNames.push(methodNameFormatted);
                        }

                        const conditionLabels = formatEncounterConditionLabels(conditionValues, methodNameRaw);
                        for (const methodKey of methodDisplayNames) {
                            if (!encountersByArea[areaNameDisplay][methodKey]) {
                                encountersByArea[areaNameDisplay][methodKey] = new Map();
                                methodOrderByArea[areaNameDisplay].push(methodKey);
                            }
                            const pokemonName = encounter.pokemon.name;
                            const chance = detail.chance;
                            if (encountersByArea[areaNameDisplay][methodKey].has(pokemonName)) {
                                const entry = encountersByArea[areaNameDisplay][methodKey].get(pokemonName);
                                entry.sumChance += chance;
                                conditionLabels.forEach(label => entry.conditions.add(label));
                            } else {
                                encountersByArea[areaNameDisplay][methodKey].set(pokemonName, {
                                    sumChance: chance,
                                    conditions: new Set(conditionLabels),
                                    sprite: null
                                });
                            }
                        }
                    }
                }
            }
        }

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
            const normal = detail?.sprites?.front_default
                || detail?.sprites?.other?.['official-artwork']?.front_default
                || null;
            const shiny = detail?.sprites?.front_shiny || null;
            spriteMap.set(name, { normal, shiny });
        });

        const finalGrouped = {};
        const sortedAreaEntries = areaEntries.sort((a, b) => a.id - b.id);
        for (const areaEntry of sortedAreaEntries) {
            const areaName = areaEntry.name;
            const methods = encountersByArea[areaName];
            if (methods && Object.keys(methods).length > 0) {
                finalGrouped[areaName] = {};
                for (const method of methodOrderByArea[areaName]) {
                    const map = methods[method];
                    finalGrouped[areaName][method] = Array.from(map.entries()).map(([name, data]) => ({
                        name: name,
                        displayName: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                        sprite: spriteMap.get(name).normal,
                        shinySprite: spriteMap.get(name).shiny,
                        rate: data.sumChance,
                        conditionText: data.conditions && data.conditions.size > 0 ? Array.from(data.conditions).join(', ') : null
                    })).sort((a, b) => b.rate - a.rate);
                }
            }
        }

        resultCache.encounters[cacheKey] = finalGrouped;
        return finalGrouped;
    } catch (error) {
        console.error(`Error fetching encounters for ${locationName} in ${versionName}:`, error);
        return {};
    }
}

/**
 * Fetches the moves available to a Pokemon in Generation 7 (Sun/Moon/Ultra).
 * @param {string} pokemonName - The name of the Pokemon.
 * @returns {Promise<Array>} List of Gen 7 moves.
 */
export async function getPokemonMovesGen7(pokemonName) {
    try {
        const pokemon = await P.getPokemonByName(pokemonName);
        const gen7Moves = pokemon.moves.filter(m =>
            m.version_group_details.some(v =>
                v.version_group.name === 'sun-moon' || v.version_group.name === 'ultra-sun-ultra-moon'
            )
        ).map(m => m.move.name);

        return gen7Moves;
    } catch (error) {
        console.error(`Error fetching Gen 7 moves for ${pokemonName}:`, error);
        return [];
    }
}

/**
 * Fetches details about a specific move, including its base PP.
 * @param {string} moveName - The name of the move.
 * @returns {Promise<Object>} Move details (name, pp, type).
 */
export async function getMoveDetails(moveName) {
    try {
        const move = await P.getMoveByName(moveName);
        return {
            name: move.name,
            displayName: move.names.find(n => n.language.name === 'en')?.name || move.name,
            pp: move.pp,
            type: move.type.name
        };
    } catch (error) {
        console.error(`Error fetching details for move ${moveName}:`, error);
        return { name: moveName, displayName: moveName, pp: 0, type: 'unknown' };
    }
}

export { P };
export default P;
