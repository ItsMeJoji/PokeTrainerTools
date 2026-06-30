import fs from 'fs/promises';
import { Pokedex } from 'pokeapi-js-wrapper';

const P = new Pokedex({
  cache: false,
  cacheImages: false
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

function normalizePokeApiPath(rawPath) {
    if (!rawPath || typeof rawPath !== 'string') return rawPath;
    try {
        const parsed = new URL(rawPath);
        return parsed.pathname + parsed.search;
    } catch (error) {
        return rawPath;
    }
}

async function fetchResourceWithRetry(path, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            return await P.resource(path);
        } catch (e) {
            if (i === retries) return null;
            await new Promise(r => setTimeout(r, 150 * (i + 1)));
        }
    }
}

async function mapWithConcurrency(items, limit, mapper) {
    if (!Array.isArray(items) || items.length === 0) return [];
    const results = new Array(items.length);
    let cursor = 0;
    async function worker() {
        while (true) {
            const index = cursor++;
            if (index >= items.length) return;
            results[index] = await mapper(items[index], index);
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return results;
}

async function getLocationsForVersion(versionName) {
    try {
        console.log(`Processing ${versionName}...`);
        let version;
        try {
            version = await P.getVersionByName(versionName);
        } catch (e) {
            console.log(`Version ${versionName} not found in API. Skipping.`);
            return [];
        }
        const versionGroup = await P.getVersionGroupByName(version.version_group.name);
        const groupVersionNames = versionGroup.versions.map(v => v.name);

        const regions = await Promise.all(
            versionGroup.regions.map(regionRef => P.getRegionByName(regionRef.name).catch(() => null))
        );
        const locationRefs = regions.filter(Boolean).flatMap(region => region.locations || []);

        const locations = await mapWithConcurrency(locationRefs, 15, async ref => {
            const path = normalizePokeApiPath(ref.url);
            let loc = await fetchResourceWithRetry(path);
            if (!loc) {
                loc = await P.getLocationByName(ref.name).catch(() => null);
            }
            return loc;
        });

        const areaRefs = locations
            .filter(loc => loc && loc.areas)
            .flatMap(loc => loc.areas.map(area => ({ ...area, locationName: loc.name })));

        const areaDetails = await mapWithConcurrency(areaRefs, 15, async ref => {
            const path = normalizePokeApiPath(ref.url);
            return fetchResourceWithRetry(path);
        });

        const validLocationNames = new Set();
        for (let i = 0; i < areaDetails.length; i++) {
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

        const locationByName = new Map(locations.filter(Boolean).map(loc => [loc.name, loc]));
        const finalResult = Array.from(validLocationNames).map(name => {
            const loc = locationByName.get(name);
            const englishName = loc?.names?.find?.(n => n?.language?.name === 'en')?.name;
            return {
                name: name,
                displayName: englishName || name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            };
        });

        if ((versionName === 'x' || versionName === 'y') && !finalResult.some(loc => loc.name === 'friend-safari')) {
            const friendSafariLocation = locations.find(loc => loc?.name === 'friend-safari');
            if (friendSafariLocation?.areas?.length) {
                const friendAreas = await mapWithConcurrency(friendSafariLocation.areas, 10, areaRef =>
                    fetchResourceWithRetry(normalizePokeApiPath(areaRef.url))
                );
                const hasFriendSafariEncounters = friendAreas.some(area =>
                    area?.pokemon_encounters?.some(encounter =>
                        encounter.version_details?.some(vd => groupVersionNames.includes(vd.version.name))
                    )
                );
                if (hasFriendSafariEncounters) {
                    finalResult.push({ name: 'friend-safari', displayName: 'Friend Safari' });
                }
            }
        }

        finalResult.sort((a, b) => a.displayName.localeCompare(b.displayName));
        console.log(`Finished ${versionName}: found ${finalResult.length} locations`);
        return finalResult;
    } catch (e) {
        console.error(`Error processing ${versionName}:`, e);
        return [];
    }
}

async function main() {
    console.log('Generating locations mapping...');
    const result = {};
    for (const version of MAINLINE_VERSIONS) {
        result[version] = await getLocationsForVersion(version);
    }
    
    await fs.mkdir('./src/data', { recursive: true });
    await fs.writeFile('./src/data/locations.json', JSON.stringify(result, null, 2));
    console.log('Finished writing src/data/locations.json');
}

main();
