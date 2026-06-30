import localForage from 'localforage';
import { Pokedex } from 'pokeapi-js-wrapper';

const LOCAL_POKEAPI_HOSTNAMES = ['localhost', '127.0.0.1'];
const LOCAL_POKEAPI_URL = 'http://localhost:8000/api/v2/';
const DEFAULT_POKEAPI_URL = 'https://pokeapi.co/api/v2/';

const useLocalApi = LOCAL_POKEAPI_HOSTNAMES.includes(window.location.hostname);
const apiUrl = useLocalApi ? LOCAL_POKEAPI_URL : DEFAULT_POKEAPI_URL;
const parsedApiUrl = new URL(apiUrl);

console.info('[PokeAPI] Using base URL:', apiUrl, '(cache disabled:', useLocalApi, ')');

if (useLocalApi) {
    console.info('[PokeAPI] Local API mode enabled. Preserving localForage for faster verified location loads.');
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
    locationLists: {}, // versionName -> lightweight location list
    encounters: {}, // version-location -> encounters
    encounterConditionValues: {}, // condition value name -> detail
};
const LOCATION_CACHE_PREFIX = 'verified_locations_v5';
const LOCATION_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const locationCacheReady = localForage.ready().catch(() => undefined);
const PATH_DEBUG = true;
const ENCOUNTER_DEBUG = false;
const RESOURCE_RETRY_LIMIT = 2;
const RESOURCE_RETRY_DELAY_MS = 120;
const LOCATION_FETCH_CONCURRENCY = 12;
const AREA_FETCH_CONCURRENCY = 8;

function logPathDebug(...args) {
    if (!PATH_DEBUG) return;
    console.info('[PathDebug]', ...args);
}

function logEncounterDebug(...args) {
    if (!ENCOUNTER_DEBUG) return;
    console.info('[EncounterDebug]', ...args);
}

function getLocationCacheKey(versionName) {
    return `${LOCATION_CACHE_PREFIX}:${parsedApiUrl.host}${parsedApiUrl.pathname}:${versionName}`;
}

async function getCachedLocations(versionName) {
    try {
        await locationCacheReady;
        const payload = await localForage.getItem(getLocationCacheKey(versionName));
        if (!payload || !Array.isArray(payload.locations) || typeof payload.savedAt !== 'number') {
            return null;
        }
        if (Date.now() - payload.savedAt > LOCATION_CACHE_TTL_MS) {
            return null;
        }
        // Guard against stale/partial caches in local snapshots.
        if (versionName === 'x' || versionName === 'y') {
            const hasBerryFields = payload.locations.some(loc => loc?.name === 'kalos-berry-fields');
            const hasFriendSafari = payload.locations.some(loc => loc?.name === 'friend-safari');
            const hasReasonableCoverage = payload.locations.length >= 30;
            if (!hasBerryFields || !hasFriendSafari || !hasReasonableCoverage) {
                return null;
            }
        }
        return payload.locations;
    } catch (error) {
        return null;
    }
}

async function setCachedLocations(versionName, locations) {
    try {
        await locationCacheReady;
        await localForage.setItem(getLocationCacheKey(versionName), {
            savedAt: Date.now(),
            locations
        });
    } catch (error) {
        // Non-fatal cache write failure.
    }
}

function getEnglishLocalizedText(entries, preferredKeys) {
    if (!Array.isArray(entries)) return null;
    const englishEntry = entries.find(entry => entry?.language?.name === 'en') || entries[0];
    if (!englishEntry) return null;

    for (const key of preferredKeys) {
        const value = englishEntry[key];
        if (typeof value === 'string' && value.trim()) {
            return value.replace(/\s+/g, ' ').trim();
        }
    }

    return null;
}

function getEncounterConditionValueLabel(raw, detail) {
    const proseLabel = getEnglishLocalizedText(detail?.prose, ['prose', 'name', 'description']);
    if (proseLabel) return proseLabel;

    const flavorLabel = getEnglishLocalizedText(detail?.flavor_text_entries, ['flavor_text']);
    if (flavorLabel) return flavorLabel;

    const descriptionLabel = getEnglishLocalizedText(detail?.descriptions, ['description']);
    if (descriptionLabel) return descriptionLabel;

    const nameLabel = getEnglishLocalizedText(detail?.names, ['name']);
    if (nameLabel) return nameLabel;

    if (raw === 'radar-on') {
        return 'Radar On';
    }
    if (raw === 'swarm-yes') {
        return 'Swarm';
    }
    if (raw.startsWith('slot2-')) {
        const value = raw.replace('slot2-', '');
        return `Slot 2: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
    }
    if (raw.startsWith('radio-')) {
        const value = raw.replace('radio-', '');
        return `Radio: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
    }
    if (raw.startsWith('time-')) {
        const value = raw.replace('time-', '');
        return `Time: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
    }

    return raw.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatEncounterConditionLabels(conditionValueRefs, methodNameRaw, conditionValueDetails = {}) {
    if (!Array.isArray(conditionValueRefs) || conditionValueRefs.length === 0) {
        return [];
    }

    const labels = [];
    for (const conditionValueRef of conditionValueRefs) {
        const raw = conditionValueRef?.name;
        if (!raw || raw === 'none') continue;
        if (methodNameRaw === 'walk' && ['time-morning', 'time-day', 'time-night'].includes(raw)) {
            continue;
        }

        labels.push(getEncounterConditionValueLabel(raw, conditionValueDetails[raw]));
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchResourceWithRetry(path, { retries = RESOURCE_RETRY_LIMIT, retryDelayMs = RESOURCE_RETRY_DELAY_MS, fallback = null } = {}) {
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await P.resource(path);
        } catch (error) {
            lastError = error;
            if (attempt < retries) {
                await sleep(retryDelayMs * (attempt + 1));
            }
        }
    }

    if (typeof fallback === 'function') {
        try {
            return await fallback();
        } catch (fallbackError) {
            lastError = fallbackError;
        }
    }

    if (PATH_DEBUG) {
        console.warn('[PathDebug] resource fetch failed', { path, message: lastError?.message || String(lastError) });
    }
    return null;
}

async function getEncounterConditionValueDetails(conditionValueRefs) {
    if (!Array.isArray(conditionValueRefs) || conditionValueRefs.length === 0) {
        return {};
    }

    const uniqueRefs = Array.from(
        new Map(
            conditionValueRefs
                .filter(ref => ref?.name)
                .map(ref => [ref.name, ref])
        ).values()
    );

    const missingRefs = uniqueRefs.filter(ref => !resultCache.encounterConditionValues[ref.name]);
    if (missingRefs.length > 0) {
        await mapWithConcurrency(missingRefs, AREA_FETCH_CONCURRENCY, async ref => {
            const path = normalizePokeApiPath(ref.url) || `/api/v2/encounter-condition-value/${ref.name}/`;
            const detail = await fetchResourceWithRetry(path);
            resultCache.encounterConditionValues[ref.name] = detail || null;
        });
    }

    return Object.fromEntries(
        uniqueRefs.map(ref => [ref.name, resultCache.encounterConditionValues[ref.name]])
    );
}

export async function getEncounterConditionLabelsForRefs(conditionValueRefs, methodNameRaw) {
    const conditionValueDetails = await getEncounterConditionValueDetails(conditionValueRefs);
    return formatEncounterConditionLabels(conditionValueRefs, methodNameRaw, conditionValueDetails);
}

async function mapWithConcurrency(items, limit, mapper) {
    if (!Array.isArray(items) || items.length === 0) return [];
    const safeLimit = Math.max(1, Math.min(limit || 1, items.length));
    const results = new Array(items.length);
    let cursor = 0;

    async function worker() {
        while (true) {
            const currentIndex = cursor;
            cursor += 1;
            if (currentIndex >= items.length) return;
            results[currentIndex] = await mapper(items[currentIndex], currentIndex);
        }
    }

    await Promise.all(Array.from({ length: safeLimit }, () => worker()));
    return results;
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
        const locationsData = (await import('../data/locations.json')).default;
        if (locationsData && locationsData[versionName] && locationsData[versionName].length > 0) {
            logPathDebug(`getLocationsForVersion(${versionName}) using static json data`, { count: locationsData[versionName].length });
            resultCache.locations[versionName] = locationsData[versionName];
            return locationsData[versionName];
        }
    } catch (e) {
        console.warn('Failed to load static locations json, falling back to PokeAPI cache/network.', e);
    }

    const cached = await getCachedLocations(versionName);
    if (cached) {
        logPathDebug(`getLocationsForVersion(${versionName}) using cached list`, { count: cached.length });
        resultCache.locations[versionName] = cached;
        return cached;
    }

    try {
        const version = await P.getVersionByName(versionName);
        const versionGroup = await P.getVersionGroupByName(version.version_group.name);
        const groupVersionNames = versionGroup.versions.map(v => v.name);

        const regions = await Promise.all(
            versionGroup.regions.map(regionRef => P.getRegionByName(regionRef.name).catch(() => null))
        );
        const locationRefs = regions
            .filter(Boolean)
            .flatMap(region => region.locations || []);
        logPathDebug(`getLocationsForVersion(${versionName}) location refs`, {
            total: locationRefs.length,
            sample: locationRefs.slice(0, 10).map(ref => normalizePokeApiPath(ref.url))
        });

        const locations = await mapWithConcurrency(locationRefs, LOCATION_FETCH_CONCURRENCY, async ref => {
            const path = normalizePokeApiPath(ref.url);
            logPathDebug(`location pull`, { versionName, name: ref.name, path });
            return fetchResourceWithRetry(path, {
                fallback: () => P.getLocationByName(ref.name).catch(() => null)
            });
        });

        const areaRefs = locations
            .filter(loc => loc && loc.areas)
            .flatMap(loc => loc.areas.map(area => ({ ...area, locationName: loc.name })));
        logPathDebug(`getLocationsForVersion(${versionName}) area refs`, {
            total: areaRefs.length,
            sample: areaRefs.slice(0, 12).map(ref => normalizePokeApiPath(ref.url))
        });

        const areaDetails = await mapWithConcurrency(areaRefs, AREA_FETCH_CONCURRENCY, async ref => {
            const path = normalizePokeApiPath(ref.url);
            logPathDebug(`location-area pull`, { versionName, area: ref.name, locationName: ref.locationName, path });
            return fetchResourceWithRetry(path);
        });

        const validLocationNames = new Set();
        for (let i = 0; i < areaDetails.length; i += 1) {
            const area = areaDetails[i];
            const ref = areaRefs[i];
            if (!area || !ref || !Array.isArray(area.pokemon_encounters)) continue;
            const hasEncounterForGroup = area.pokemon_encounters.some(encounter =>
                encounter.version_details.some(vd => groupVersionNames.includes(vd.version.name))
            );
            if (hasEncounterForGroup) {
                validLocationNames.add(ref.locationName);
            }
        }

        const locationByName = new Map(
            locations
                .filter(Boolean)
                .map(loc => [loc.name, loc])
        );

        const finalResult = Array.from(validLocationNames)
            .map(name => {
                const loc = locationByName.get(name);
                const englishName = loc?.names?.find?.(n => n?.language?.name === 'en')?.name;
                return {
                    name: name,
                    displayName: englishName || name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                };
            })
            .sort((a, b) => a.displayName.localeCompare(b.displayName));
        logPathDebug(`getLocationsForVersion(${versionName}) verified locations (before safety checks)`, {
            count: finalResult.length,
            names: finalResult.map(loc => loc.name)
        });

        // Safety net: some local snapshots can miss Friend Safari from derived sets even though
        // area data exists. Verify it directly and include if it has XY encounters.
        if ((versionName === 'x' || versionName === 'y') && !finalResult.some(loc => loc.name === 'friend-safari')) {
            const friendSafariLocation = locations.find(loc => loc?.name === 'friend-safari');
            if (friendSafariLocation?.areas?.length) {
                const friendAreas = await mapWithConcurrency(friendSafariLocation.areas, AREA_FETCH_CONCURRENCY, areaRef =>
                    fetchResourceWithRetry(normalizePokeApiPath(areaRef.url))
                );
                const hasFriendSafariEncounters = friendAreas.some(area =>
                    area?.pokemon_encounters?.some(encounter =>
                        encounter.version_details?.some(vd => groupVersionNames.includes(vd.version.name))
                    )
                );
                if (hasFriendSafariEncounters) {
                    finalResult.push({
                        name: 'friend-safari',
                        displayName: 'Friend Safari'
                    });
                    finalResult.sort((a, b) => a.displayName.localeCompare(b.displayName));
                }
            }
        }

        if (versionName === 'x' || versionName === 'y') {
            const route7Locations = finalResult.filter(loc =>
                loc.name.includes('route-7') || loc.displayName.includes('Route 7') || loc.displayName.includes('Berry')
            );
            logEncounterDebug(`${versionName} location candidates near route-7/berry`, route7Locations.map(l => l.name));
        }
        logPathDebug(`getLocationsForVersion(${versionName}) final verified locations`, {
            count: finalResult.length,
            names: finalResult.map(loc => loc.name)
        });

        resultCache.locations[versionName] = finalResult;
        await setCachedLocations(versionName, finalResult);
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
    if (resultCache.locationLists[versionName]) return resultCache.locationLists[versionName];
    if (resultCache.locations[versionName]) return resultCache.locations[versionName];

    try {
        const version = await P.getVersionByName(versionName);
        const versionGroup = await P.getVersionGroupByName(version.version_group.name);

        const regions = await Promise.all(
            versionGroup.regions.map(regionRef => P.getRegionByName(regionRef.name).catch(() => null))
        );
        const locationRefs = regions
            .filter(Boolean)
            .flatMap(region => region.locations || []);

        const finalResult = locationRefs
            .map(ref => ({
                name: ref.name,
                displayName: ref.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        resultCache.locationLists[versionName] = finalResult;
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
    const optionsCacheKey = JSON.stringify({
        radar: Boolean(options.radar),
        swarm: Boolean(options.swarm),
        time: options.time || null,
        slot2: options.slot2 || null,
        radio: options.radio || null
    });
    const cacheKey = `${versionName}-${locationName}-${optionsCacheKey}`;
    if (resultCache.encounters[cacheKey]) return resultCache.encounters[cacheKey];

    try {
        const location = await P.getLocationByName(locationName);
        const areas = await mapWithConcurrency(location.areas, AREA_FETCH_CONCURRENCY, areaRef =>
            fetchResourceWithRetry(normalizePokeApiPath(areaRef.url))
        );
        const conditionValueDetails = await getEncounterConditionValueDetails(
            areas
                .filter(area => Array.isArray(area?.pokemon_encounters))
                .flatMap(area =>
                    area.pokemon_encounters.flatMap(encounter =>
                        encounter.version_details
                            .filter(vd => vd.version.name === versionName)
                            .flatMap(vd =>
                                vd.encounter_details.flatMap(detail => detail.condition_values || [])
                            )
                    )
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
                        const conditionValueRefs = detail.condition_values || [];
                        const conditionValues = conditionValueRefs.map(c => c.name);
                        let methodDisplayNames = [];
                        const methodNameRaw = detail.method.name;
                        const methodNameFormatted = methodNameRaw.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                        const isGen5 = ['black', 'white', 'black-2', 'white-2'].includes(versionName);

                        if (isGen5) {
                            const hasRadar = conditionValues.includes('radar-on');
                            const hasSwarm = conditionValues.includes('swarm-yes');
                            // Skip if conditions don't match UI options (even if non-walk in Gen 5)
                            if (hasRadar && !options.radar) continue;
                            if (hasSwarm && !options.swarm) continue;

                            const hasSpring = conditionValues.includes('season-spring');
                            const hasSummer = conditionValues.includes('season-summer');
                            const hasAutumn = conditionValues.includes('season-autumn');
                            const hasWinter = conditionValues.includes('season-winter');

                            const methodBase = methodNameRaw === 'walk' ? 'Walk' : methodNameFormatted;

                            if (!hasSpring && !hasSummer && !hasAutumn && !hasWinter) {
                                methodDisplayNames.push(`${methodBase} - Spring 🌱`);
                                methodDisplayNames.push(`${methodBase} - Summer ☀️`);
                                methodDisplayNames.push(`${methodBase} - Autumn 🍂`);
                                methodDisplayNames.push(`${methodBase} - Winter ❄️`);
                            } else {
                                if (hasSpring) methodDisplayNames.push(`${methodBase} - Spring 🌱`);
                                if (hasSummer) methodDisplayNames.push(`${methodBase} - Summer ☀️`);
                                if (hasAutumn) methodDisplayNames.push(`${methodBase} - Autumn 🍂`);
                                if (hasWinter) methodDisplayNames.push(`${methodBase} - Winter ❄️`);
                            }
                        } else if (methodNameRaw === 'walk') {
                            // Only filter conditional walk encounters when a UI option is not selected.
                            // This prevents unrelated games (e.g., XY) from losing valid area data.
                            const hasRadar = conditionValues.includes('radar-on');
                            const hasSwarm = conditionValues.includes('swarm-yes');
                            const slot2Cond = conditionValues.find(c => c.startsWith('slot2-') && c !== 'slot2-none');
                            const radioCond = conditionValues.find(c => c.startsWith('radio-') && c !== 'radio-off');

                            if (hasRadar && !options.radar) {
                                if (versionName === 'x' || versionName === 'y') {
                                    logEncounterDebug(`${versionName} filtered radar encounter`, { locationName, area: area.name, pokemon: encounter.pokemon.name, conditionValues });
                                }
                                continue;
                            }
                            if (hasSwarm && !options.swarm) {
                                if (versionName === 'x' || versionName === 'y') {
                                    logEncounterDebug(`${versionName} filtered swarm encounter`, { locationName, area: area.name, pokemon: encounter.pokemon.name, conditionValues });
                                }
                                continue;
                            }
                            if (slot2Cond && options.slot2 !== slot2Cond) {
                                if (versionName === 'x' || versionName === 'y') {
                                    logEncounterDebug(`${versionName} filtered slot2 encounter`, { locationName, area: area.name, pokemon: encounter.pokemon.name, conditionValues, selectedSlot2: options.slot2 });
                                }
                                continue;
                            }
                            if (radioCond && options.radio !== radioCond) {
                                if (versionName === 'x' || versionName === 'y') {
                                    logEncounterDebug(`${versionName} filtered radio encounter`, { locationName, area: area.name, pokemon: encounter.pokemon.name, conditionValues, selectedRadio: options.radio });
                                }
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

                        const conditionLabels = formatEncounterConditionLabels(conditionValueRefs, methodNameRaw, conditionValueDetails);
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
        const SEASONS = ['Spring 🌱', 'Summer ☀️', 'Autumn 🍂', 'Winter ❄️'];

        for (const areaEntry of sortedAreaEntries) {
            const areaName = areaEntry.name;
            const methods = encountersByArea[areaName];
            if (methods && Object.keys(methods).length > 0) {
                // Pre-process methodOrderByArea to ensure all 4 seasons exist for any base method if one does
                const orderedMethods = [...methodOrderByArea[areaName]];

                // Find all base methods that have a season
                const baseMethodsWithSeasons = new Set();
                for (const method of orderedMethods) {
                    for (const season of SEASONS) {
                        if (method.endsWith(` - ${season}`)) {
                            baseMethodsWithSeasons.add(method.replace(` - ${season}`, ''));
                        }
                    }
                }

                // Inject missing seasons
                const finalOrder = [];
                const seenMethods = new Set();
                for (const method of orderedMethods) {
                    let handled = false;
                    for (const season of SEASONS) {
                        if (method.endsWith(` - ${season}`)) {
                            const base = method.replace(` - ${season}`, '');
                            // If we encounter a seasonal method, emit ALL 4 seasons right then (if not already done)
                            if (!seenMethods.has(`${base} - Spring 🌱`)) {
                                SEASONS.forEach(s => {
                                    const m = `${base} - ${s}`;
                                    finalOrder.push(m);
                                    seenMethods.add(m);
                                    if (!methods[m]) methods[m] = new Map();
                                });
                            }
                            handled = true;
                            break;
                        }
                    }
                    if (!handled) {
                        finalOrder.push(method);
                        seenMethods.add(method);
                    }
                }

                finalGrouped[areaName] = {};
                for (const method of finalOrder) {
                    const map = methods[method];
                    finalGrouped[areaName][method] = Array.from(map.entries()).map(([name, data]) => ({
                        name: name,
                        displayName: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                        sprite: spriteMap.get(name).normal,
                        shinySprite: spriteMap.get(name).shiny,
                        rate: data.sumChance,
                        conditionTexts: data.conditions && data.conditions.size > 0 ? Array.from(data.conditions) : [],
                        conditionText: data.conditions && data.conditions.size > 0 ? Array.from(data.conditions).join(', ') : null
                    })).sort((a, b) => b.rate - a.rate);
                }
            }
        }

        resultCache.encounters[cacheKey] = finalGrouped;
        const areaCount = Object.keys(finalGrouped).length;
        const methodCount = Object.values(finalGrouped).reduce((sum, methods) => sum + Object.keys(methods).length, 0);
        const encounterCount = Object.values(finalGrouped).reduce(
            (sum, methods) => sum + Object.values(methods).reduce((inner, rows) => inner + rows.length, 0),
            0
        );
        logPathDebug('encounters summary', { versionName, locationName, areaCount, methodCount, encounterCount });

        if (versionName === 'x' || versionName === 'y') {
            logEncounterDebug(`${versionName} built methods for ${locationName}`, Object.keys(finalGrouped));
        }
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
