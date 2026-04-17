import fs from 'fs';
import path from 'path';

const API_BASE = 'https://pokeapi.co/api/v2';

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

async function api(endpoint) {
  // Using native fetch to bypass pokeapi-js-wrapper's localForage crashing
  const res = await fetch(endpoint.startsWith('http') ? endpoint : `${API_BASE}/${endpoint}`);
  if (!res.ok) throw new Error(`API failed: ${res.status}`);
  return res.json();
}

async function runEncounterRateTest() {
  console.log('Starting Traverse of PokeAPI for Encounter Rates (Native Fetch)...');
  const outputFile = path.join(process.cwd(), '../results/encounter-rate-report.txt');
  fs.writeFileSync(outputFile, 'Encounter Rate > 100% Audit Report\n===================================\n\n');

  let flaggedCount = 0;

  try {
    for (const versionName of MAINLINE_VERSIONS) {
      console.log(`Analyzing version: ${versionName}...`);
      let version;
      try {
        version = await api(`version/${versionName}`);
      } catch (err) {
        console.warn(`Version ${versionName} not found in API. Skipping.`);
        continue;
      }

      const versionGroup = await api(`version-group/${version.version_group.name}`);

      const locationRefs = [];
      for (const regionRef of versionGroup.regions) {
        const region = await api(`region/${regionRef.name}`);
        locationRefs.push(...region.locations);
      }

      for (const locRef of locationRefs) {
        let location;
        try {
          location = await api(`location/${locRef.name}`);
        } catch (e) {
          continue;
        }

        for (const areaRef of location.areas) {
          let area;
          try {
            area = await api(`location-area/${areaRef.name}`);
          } catch (e) {
            continue;
          }

          if (!area.pokemon_encounters) continue;

          const methodGroups = {};

          for (const encounter of area.pokemon_encounters) {
            const versionDetail = encounter.version_details.find(vd => vd.version.name === versionName);
            if (!versionDetail) continue;

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
                  if (hasMorning) methodDisplayNames.push('Walk - Morning');
                  if (hasDay) methodDisplayNames.push('Walk - Day');
                  if (hasNight) methodDisplayNames.push('Walk - Night');
                }
              } else {
                methodDisplayNames.push(methodNameFormatted);
              }

              for (const methodKey of methodDisplayNames) {
                if (!methodGroups[methodKey]) methodGroups[methodKey] = {};
                if (!methodGroups[methodKey][encounter.pokemon.name]) {
                  methodGroups[methodKey][encounter.pokemon.name] = 0;
                }
                methodGroups[methodKey][encounter.pokemon.name] += detail.chance;
              }
            }
          }

          for (const [methodName, pokemonRates] of Object.entries(methodGroups)) {
            const totalRate = Object.values(pokemonRates).reduce((sum, rate) => sum + rate, 0);

            if (totalRate > 100) {
              flaggedCount++;
              const msg = `[!] FLAG: ${totalRate}% Total\nGame: ${versionName}\nLocation: ${location.name}\nArea: ${area.name}\nMethod: ${methodName}\nBreakdown: ${JSON.stringify(pokemonRates)}\n\n`;
              fs.appendFileSync(outputFile, msg);
              console.log(`Flagged: ${versionName} | ${area.name} | ${methodName} (${totalRate}%)`);
            }
          }
        }
      }
    }

    console.log(`\nTest Complete. Found ${flaggedCount} issues. Review ${outputFile}.`);
    if (flaggedCount === 0) {
      fs.appendFileSync(outputFile, 'No encounter group totals exceeded 100%.\n');
    }

  } catch (err) {
    console.error("Test failed abruptly:", err);
  }
}

runEncounterRateTest();
