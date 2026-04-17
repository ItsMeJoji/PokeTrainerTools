import { getPokemonListUpToGeneration, P } from '../utils/pokemon-data.js';
import { setupSearchableDropdown, updateDropdownLoading, getSearchableDropdownHtml } from '../utils/ui-utils.js';
import { POKEMON_LOOKUP_INSTRUCTIONS } from '../utils/instruction-content.js';

// Ordered list of mainline English-release games (gen order, 'green' excluded)
const GAME_ORDER = [
  'red', 'blue', 'yellow',
  'gold', 'silver', 'crystal',
  'ruby', 'sapphire', 'emerald', 'firered', 'leafgreen',
  'diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver',
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

// Maps a version name to its PokeAPI sprites.versions path [generation, group]
// Gen 1-5 have version-specific sprites; Gen 6+ only have modern artwork
const VERSION_SPRITE_MAP = {
  'red': ['generation-i', 'red-blue'],
  'blue': ['generation-i', 'red-blue'],
  'yellow': ['generation-i', 'yellow'],
  'gold': ['generation-ii', 'gold'],
  'silver': ['generation-ii', 'silver'],
  'crystal': ['generation-ii', 'crystal'],
  'ruby': ['generation-iii', 'ruby-sapphire'],
  'sapphire': ['generation-iii', 'ruby-sapphire'],
  'emerald': ['generation-iii', 'emerald'],
  'firered': ['generation-iii', 'firered-leafgreen'],
  'leafgreen': ['generation-iii', 'firered-leafgreen'],
  'diamond': ['generation-iv', 'diamond-pearl'],
  'pearl': ['generation-iv', 'diamond-pearl'],
  'platinum': ['generation-iv', 'platinum'],
  'heartgold': ['generation-iv', 'heartgold-soulsilver'],
  'soulsilver': ['generation-iv', 'heartgold-soulsilver'],
  'black': ['generation-v', 'black-white'],
  'white': ['generation-v', 'black-white'],
  'black-2': ['generation-v', 'black-white'],
  'white-2': ['generation-v', 'black-white'],
};

const EXCLUDED_VERSIONS = new Set(['green']);

// Some Pokemon are stored under a different form name in the API
const POKEMON_API_NAME_OVERRIDES = {
  'minior': 'minior-red-meteor',
  'mimikyu': 'mimikyu-disguised',
};

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

/** Returns the index of a version in GAME_ORDER, or Infinity if not found. */
function gameOrderIndex(version) {
  const i = GAME_ORDER.indexOf(version);
  return i === -1 ? Infinity : i;
}

/**
 * Initializes the Pokemon Lookup page.
 * @param {HTMLElement} appContainer - The container to render the page into.
 */
export async function initPokemonLookup(appContainer) {
  appContainer.innerHTML = `
    <div class="pokemon-lookup-page text-center max-w-2xl mx-auto px-4">
      <h1 class="mb-6 text-4xl text-black dark:text-white font-extrabold text-shadow-lg">Pokemon Lookup</h1>
      <p class="mb-8 text-lg text-gray-500 dark:text-gray-400">Find where any Pokemon can be encountered across all games.</p>

      <!-- Instructions Collapsible -->
      <details class="group mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
        <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 list-none [&::-webkit-details-marker]:hidden border-b border-transparent group-open:border-gray-100 dark:group-open:border-gray-700">
          <div class="flex items-center space-x-3">
            <span class="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            <span class="text-xl font-bold text-gray-900 dark:text-white">How to Use This Tool</span>
          </div>
          <svg class="w-6 h-6 text-gray-400 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </summary>
        <div class="p-6 bg-gray-50/50 dark:bg-gray-900/20">
          ${POKEMON_LOOKUP_INSTRUCTIONS}
        </div>
      </details>
      
      <!-- Selection Container -->
      <div id="lookup-selection-container" class="space-y-6 mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transition-all duration-300">
        <div>
          <div id="pokemon-lookup-container-dropdown">
            ${getSearchableDropdownHtml('pokemon-lookup-dropdown', 'Select Pokemon', 'Search Pokemon...')}
          </div>
        </div>

        <!-- Choice Buttons (Hidden until Pokemon selected) -->
        <div id="lookup-choice-container" class="hidden opacity-0 transition-opacity duration-500 flex flex-col items-center gap-4">
          <p class="text-lg font-bold text-gray-700 dark:text-gray-300">Where are you hunting?</p>
          <div class="flex gap-4">
            <button id="lookup-select-game-btn" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-black dark:text-white font-bold rounded-full shadow-lg transition-transform active:scale-95">
              Select a Game
            </button>
            <button id="lookup-show-everything-btn" class="px-6 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-black dark:text-white font-bold rounded-full shadow-lg transition-transform active:scale-95">
              <span id="lookup-everything-text">Show EVERYTHING!</span>
            </button>
          </div>
        </div>

        <!-- Game Selection (Hidden until "Select a Game" clicked) -->
        <div id="lookup-game-container" class="hidden opacity-0 transition-opacity duration-500 space-y-4">
          <div id="game-select-container">
            ${getSearchableDropdownHtml('lookup-game-dropdown', 'Select Game', 'Search games...')}
          </div>
          <button id="lookup-go-back-btn" class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            Go Back
          </button>
        </div>

        <!-- Go Back button for 'Show EVERYTHING!' state -->
        <div id="lookup-everything-back" class="hidden opacity-0 transition-opacity duration-500 flex flex-col items-center">
          <button id="lookup-everything-back-btn" class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            Go Back
          </button>
        </div>
      </div>

      <!-- Results Container -->
      <div id="lookup-results" class="space-y-4 text-left"></div>
    </div>
  `;

  // --- Element References ---
  const pokemonDropdown = document.getElementById('pokemon-lookup-dropdown');
  const choiceContainer = document.getElementById('lookup-choice-container');
  const gameContainer = document.getElementById('lookup-game-container');
  const gameDropdown = document.getElementById('lookup-game-dropdown');
  const selectGameBtn = document.getElementById('lookup-select-game-btn');
  const showEverythingBtn = document.getElementById('lookup-show-everything-btn');
  const goBackBtn = document.getElementById('lookup-go-back-btn');
  const everythingBackContainer = document.getElementById('lookup-everything-back');
  const everythingBackBtn = document.getElementById('lookup-everything-back-btn');
  const resultsContainer = document.getElementById('lookup-results');

  let selectedPokemon = null;
  let pokemonEncounterData = null;
  let pokemonSprites = {};      // { versionName: normalSpriteUrl | null }
  let pokemonShinySprites = {}; // { versionName: shinySpriteUrl | null }

  // --- Data Loading ---
  // Show loading state in the Pokemon dropdown
  updateDropdownLoading(pokemonDropdown, "Loading Pokémon");

  const pokemonList = await getPokemonListUpToGeneration(9);

  setupSearchableDropdown(pokemonDropdown, pokemonList, (pokemon) => {
    selectedPokemon = pokemon;
    choiceContainer.classList.remove('hidden');
    setTimeout(() => choiceContainer.classList.remove('opacity-0'), 10);
    gameContainer.classList.add('hidden', 'opacity-0');
    everythingBackContainer.classList.add('hidden', 'opacity-0');
    resultsContainer.innerHTML = '';
    pokemonEncounterData = null;
  });

  // --- Shiny Sprite Toggle (capturing listener — intercepts before <summary> toggles <details>) ---
  resultsContainer.addEventListener('click', (e) => {
    const img = e.target.closest('.version-sprite');
    if (!img) return;

    e.stopPropagation(); // Prevents event from reaching <summary> and toggling the collapsible

    const normalSrc = img.dataset.normal;
    const shinySrc = img.dataset.shiny;
    if (!shinySrc || shinySrc === 'null') return;

    const isShiny = img.dataset.state === 'shiny';
    img.src = isShiny ? normalSrc : shinySrc;
    img.dataset.state = isShiny ? 'normal' : 'shiny';

    // Sparkle flash
    img.classList.add('anim-sparkle');
    img.addEventListener('animationend', () => img.classList.remove('anim-sparkle'), { once: true });
  }, true); // capture: true — fires before summary sees the click

  // --- Event Listeners ---
  selectGameBtn.onclick = async () => {
    choiceContainer.classList.add('hidden', 'opacity-0');
    gameContainer.classList.remove('hidden');
    setTimeout(() => gameContainer.classList.remove('opacity-0'), 10);

    if (!pokemonEncounterData) {
      updateDropdownLoading(gameDropdown, "Loading encounters");
      await fetchEncounterData();
    }
    populateGameSelect();
  };

  showEverythingBtn.onclick = async () => {
    // Hide choice buttons, show standalone Go Back
    choiceContainer.classList.add('hidden', 'opacity-0');
    everythingBackContainer.classList.remove('hidden');
    setTimeout(() => everythingBackContainer.classList.remove('opacity-0'), 10);

    if (!pokemonEncounterData) {
      resultsContainer.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl"></i><p class="mt-2 text-gray-500">Fetching all encounters...</p></div>';
      await fetchEncounterData();
    }
    renderResults();
  };

  everythingBackBtn.onclick = () => {
    everythingBackContainer.classList.add('hidden', 'opacity-0');
    resultsContainer.innerHTML = '';
    pokemonEncounterData = null;
    choiceContainer.classList.remove('hidden');
    setTimeout(() => choiceContainer.classList.remove('opacity-0'), 10);
  };

  goBackBtn.onclick = () => {
    gameContainer.classList.add('hidden', 'opacity-0');
    choiceContainer.classList.remove('hidden');
    setTimeout(() => choiceContainer.classList.remove('opacity-0'), 10);
  };

  // gameSelect.onchange = () => {
  //   if (gameSelect.value) {
  //     renderResults(gameSelect.value);
  //   }
  // };

  async function fetchEncounterData() {
    try {
      const apiName = POKEMON_API_NAME_OVERRIDES[selectedPokemon.name] || selectedPokemon.name;
      const response = await P.getPokemonByName(apiName);
      const encounterDetails = await P.resource(normalizePokeApiPath(response.location_area_encounters));

      // Build version sprite maps (normal + shiny) from the API response
      const spriteVersions = response.sprites?.versions || {};
      pokemonSprites = {};
      pokemonShinySprites = {};
      for (const [versionName, [gen, group]] of Object.entries(VERSION_SPRITE_MAP)) {
        pokemonSprites[versionName] = spriteVersions[gen]?.[group]?.front_default || null;
        pokemonShinySprites[versionName] = spriteVersions[gen]?.[group]?.front_shiny || null;
      }

      // groupedByVersion: { version: { area: { methodKey: { method, chance, minLevel, maxLevel } } } }
      const groupedByVersion = {};

      for (const encounter of encounterDetails) {
        const areaName = encounter.location_area.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        for (const detail of encounter.version_details) {
          const versionName = detail.version.name;

          // Filter excluded versions (e.g. Japanese-only 'green')
          if (EXCLUDED_VERSIONS.has(versionName)) continue;

          if (!groupedByVersion[versionName]) groupedByVersion[versionName] = {};
          if (!groupedByVersion[versionName][areaName]) groupedByVersion[versionName][areaName] = {};

          for (const encDetail of detail.encounter_details) {
            const methodRaw = encDetail.method.name;
            const methodFormatted = methodRaw.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const conditions = encDetail.condition_values.map(c => c.name);

            // Split Walk encounters by time-of-day (inspired by encounter-calc.js)
            let methodKeys = [];
            if (methodRaw === 'walk') {
              const hasMorning = conditions.includes('time-morning');
              const hasDay = conditions.includes('time-day');
              const hasNight = conditions.includes('time-night');
              if (!hasMorning && !hasDay && !hasNight) {
                methodKeys.push('Walk');
              } else {
                if (hasMorning) methodKeys.push('Walk - 🌅 Morning');
                if (hasDay) methodKeys.push('Walk - ☀️ Day');
                if (hasNight) methodKeys.push('Walk - 🌙 Night');
              }
            } else {
              methodKeys.push(methodFormatted);
            }

            // Aggregate into keyed map: sum chance, track min/max level
            const areaMap = groupedByVersion[versionName][areaName];
            for (const key of methodKeys) {
              if (!areaMap[key]) {
                areaMap[key] = { method: key, chance: 0, minLevel: Infinity, maxLevel: -Infinity };
              }
              areaMap[key].chance += encDetail.chance;
              areaMap[key].minLevel = Math.min(areaMap[key].minLevel, encDetail.min_level);
              areaMap[key].maxLevel = Math.max(areaMap[key].maxLevel, encDetail.max_level);
            }
          }
        }
      }

      // Convert each area's keyed map to a sorted array
      const result = {};
      for (const version in groupedByVersion) {
        result[version] = {};
        for (const area in groupedByVersion[version]) {
          result[version][area] = Object.values(groupedByVersion[version][area])
            .sort((a, b) => b.chance - a.chance);
        }
      }

      pokemonEncounterData = result;
    } catch (error) {
      console.error('Error fetching encounter data:', error);
      resultsContainer.innerHTML = '<div class="text-red-500 text-center py-8">Failed to fetch encounter data.</div>';
    }
  }

  function populateGameSelect() {
    if (!pokemonEncounterData) return;
    const versions = Object.keys(pokemonEncounterData)
      .sort((a, b) => gameOrderIndex(a) - gameOrderIndex(b));

    const gameItems = versions.map(v => ({
      name: v,
      displayName: v.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }));

    setupSearchableDropdown(gameDropdown, gameItems, (game) => {
      renderResults(game.name);
    }, "Choose a game");
  }

  function renderResults(specificVersion = null) {
    resultsContainer.innerHTML = '';
    if (!pokemonEncounterData) return;
    const versionsToShow = specificVersion
      ? [specificVersion]
      : Object.keys(pokemonEncounterData).sort((a, b) => gameOrderIndex(a) - gameOrderIndex(b));

    if (versionsToShow.length === 0) {
      resultsContainer.innerHTML = '<div class="text-center py-8 text-gray-500">No encounters found for this Pokemon.</div>';
      return;
    }

    versionsToShow.forEach((version, index) => {
      const displayVersion = version.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const areas = pokemonEncounterData[version];

      let areasHtml = '';
      for (const areaName in areas) {
        const encounters = areas[areaName];
        areasHtml += `
          <div class="mb-4 last:mb-0">
            <h4 class="text-md font-bold text-gray-700 dark:text-gray-300 mb-2 px-2 border-l-4 border-blue-400">${areaName}</h4>
            <div class="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
              <table class="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-400">
                  <tr>
                    <th class="px-3 py-1.5">Method</th>
                    <th class="px-3 py-1.5">Level</th>
                    <th class="px-3 py-1.5 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  ${encounters.map(e => `
                    <tr class="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                      <td class="px-3 py-1.5 font-medium text-gray-800 dark:text-gray-200">${e.method}</td>
                      <td class="px-3 py-1.5">${e.minLevel}${e.minLevel === e.maxLevel ? '' : '-' + e.maxLevel}</td>
                      <td class="px-3 py-1.5 text-right font-mono text-blue-600 dark:text-blue-400">${e.chance}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      const isOpen = versionsToShow.length === 1 ? 'open' : '';

      const sprite = pokemonSprites[version] || null;
      const shinySprite = pokemonShinySprites[version] || null;
      // Gen 1-2 sprites have white backgrounds — blend them out in light mode
      const isOldGen = !!VERSION_SPRITE_MAP[version] &&
        ['generation-i', 'generation-ii'].includes(VERSION_SPRITE_MAP[version][0]);
      const bgClass = isOldGen ? 'sprite-remove-bg' : '';
      // Gen 3+ sprites are larger (1.5× = 60px); Gen 1-2 stay at 40px
      const spriteSize = isOldGen ? 'width:40px;height:40px;' : 'width:60px;height:60px;';
      const spriteHtml = sprite
        ? `<img src="${sprite}"
               data-normal="${sprite}"
               data-shiny="${shinySprite || 'null'}"
               alt="${displayVersion} sprite"
               class="version-sprite object-contain cursor-pointer select-none ${bgClass}"
               style="${spriteSize}image-rendering:pixelated" />`
        : '';

      resultsContainer.innerHTML += `
        <details class="group w-full bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden" ${isOpen}>
          <summary class="cursor-pointer list-none p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              ${spriteHtml}
              ${displayVersion}
            </span>
            <svg class="h-5 w-5 text-gray-400 transform transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div class="p-4 border-t border-gray-100 dark:border-gray-700 space-y-6">
            ${areasHtml}
          </div>
        </details>
      `;
    });
  }
}
