import { getPokemonListUpToGeneration, getPokemonGameAvailability, getPokemonSpeciesFlags, isKnownMythicalPokemonId, isKnownLegendaryPokemonId } from '../utils/pokemon-data.js';
import { setupSearchableDropdown, updateDropdownLoading, getSearchableDropdownHtml } from '../utils/ui-utils.js';
import { RIBBONS, ORIGIN_GAMES, isEligible, RIBBON_GAMES, isGen34BattleRibbon, getRecurringRibbonAppearances } from '../utils/ribbon-data.js';
import { initGoogleAuth, signIn, signOut, isSignedIn, signInRedirect } from '../auth/google-auth.js';
import { SyncManager } from '../auth/sync-manager.js';
import { RIBBON_TRACKER_INSTRUCTIONS } from '../utils/instruction-content.js';

const ribbonImageModules = import.meta.glob('../assets/images/ribbons-and-marks/*.png', { eager: true, import: 'default' });
const ribbonImageMap = Object.fromEntries(
  Object.entries(ribbonImageModules).map(([path, url]) => [
    path.split('/').pop().replace(/\.png$/i, ''),
    url
  ])
);

function slugifyRibbonLabel(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getRibbonImageCandidates(ribbon) {
  const candidates = new Set();
  const normalizedName = slugifyRibbonLabel(ribbon.name.replace(/\s*\(gold\)\s*/i, ' gold '));

  candidates.add(normalizedName);

  if (normalizedName.endsWith('-mark')) {
    candidates.add(normalizedName);
  }

  if (normalizedName.endsWith('-ribbon')) {
    candidates.add(normalizedName);
  } else if (!normalizedName.endsWith('-mark')) {
    candidates.add(`${normalizedName}-ribbon`);
  }

  if (ribbon.id === 'gen6_contest_memory') {
    candidates.add(ribbon.isGold ? 'contest-memory-ribbon-gold' : 'contest-memory-ribbon');
  }

  if (ribbon.id === 'gen6_battle_memory') {
    candidates.add(ribbon.isGold ? 'battle-memory-ribbon-gold' : 'battle-memory-ribbon');
  }

  const contestTypeMatch = ribbon.name.match(/^(Cool|Beauty|Cute|Smart|Tough)(?: Super)? Contest \((Normal|Great|Super|Ultra|Hyper|Master)\)$/i);
  if (contestTypeMatch) {
    const [, type, rank] = contestTypeMatch;
    const normalizedType = type.toLowerCase();
    const normalizedRank = rank.toLowerCase();

    if (ribbon.gen === 3) {
      const hoennRankMap = {
        normal: 'hoenn',
        super: 'super-hoenn',
        hyper: 'hyper-hoenn',
        master: 'master-hoenn'
      };
      const mappedRank = hoennRankMap[normalizedRank];
      if (mappedRank) {
        candidates.add(`${normalizedType}-ribbon-${mappedRank}`);
      }
    }

    if (ribbon.gen === 4) {
      const sinnohRankMap = {
        normal: 'sinnoh',
        great: 'great-sinnoh',
        ultra: 'ultra-sinnoh',
        master: 'master-sinnoh'
      };
      const mappedRank = sinnohRankMap[normalizedRank];
      if (mappedRank) {
        candidates.add(`${normalizedType}-ribbon-${mappedRank}`);
      }
    }
  }

  if (normalizedName === 'battle-royal-master') {
    candidates.add('battle-royal-master-ribbon');
  }

  if (normalizedName === 'great-battle-tree-ribbon') {
    candidates.add('battle-tree-great-ribbon');
  }

  if (normalizedName === 'master-battle-tree-ribbon') {
    candidates.add('battle-tree-master-ribbon');
  }

  if (normalizedName === 'smartness-master-ribbon') {
    candidates.add('cleverness-master-ribbon');
  }

  return [...candidates];
}

function getRibbonImageUrl(ribbon) {
  const candidates = getRibbonImageCandidates(ribbon);
  return candidates.map(candidate => ribbonImageMap[candidate]).find(Boolean) || null;
}

function humanizeRibbonSlug(slug) {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const usedRibbonImageKeys = new Set(
  RIBBONS.flatMap(ribbon => getRibbonImageCandidates(ribbon))
);
usedRibbonImageKeys.add('contest-memory-ribbon-gold');
usedRibbonImageKeys.add('battle-memory-ribbon-gold');

const OPTIONAL_EXTRA_RIBBONS = Object.keys(ribbonImageMap)
  .filter(key => !usedRibbonImageKeys.has(key))
  .sort((a, b) => {
    const aIsMark = a.endsWith('-mark');
    const bIsMark = b.endsWith('-mark');

    if (aIsMark !== bIsMark) {
      return aIsMark ? 1 : -1;
    }

    return a.localeCompare(b);
  })
  .map(key => ({
    id: `optional_${key}`,
    name: humanizeRibbonSlug(key),
    description: 'Optional extra ribbon/mark for personal tracking. This does not affect Ribbon Master status.',
    imageKey: key,
    isOptionalExtra: true
  }));

// Maps originGameId to the PokeAPI version-group slug(s) for that game.
// This ensures a Pokemon is always considered available in its own origin game,
// even if PokeAPI move data is incomplete (e.g. event-exclusive mythicals).
const ORIGIN_GAME_VERSION_GROUPS = {
  rse: ['ruby-sapphire', 'emerald'],
  frlg: ['firered-leafgreen'],
  colo: ['colosseum'],
  xd: ['xd'],
  dppt: ['diamond-pearl', 'platinum'],
  hgss: ['heartgold-soulsilver'],
  bw_b2w2: ['black-white', 'black-2-white-2'],
  xy: ['x-y'],
  oras: ['omega-ruby-alpha-sapphire'],
  sm_usum: ['sun-moon', 'ultra-sun-ultra-moon'],
  lgpe: ['lets-go-pikachu-lets-go-eevee'],
  swsh: ['sword-shield'],
  bdsp: ['brilliant-diamond-shining-pearl'],
  pla: ['legends-arceus'],
  sv: ['scarlet-violet'],
};

/**
 * Merges PokeAPI availability with the origin game's guaranteed version groups.
 * A Pokemon must always be considered present in the game it originated from.
 */
const mergeAvailableGames = (apiGames, originGameId) => {
  const merged = new Set(apiGames);
  const originGroups = ORIGIN_GAME_VERSION_GROUPS[originGameId] || [];
  originGroups.forEach(vg => merged.add(vg));
  return merged;
};

const getPokemonStateFromEntry = (entry) => {
  const isMythical = Boolean(entry.isMythical) || isKnownMythicalPokemonId(entry.speciesId);
  const allowMythicalRanked = typeof entry.allowMythicalRanked === 'boolean'
    ? entry.allowMythicalRanked
    : (Array.isArray(entry.collectedRibbons) && entry.collectedRibbons.includes('gen8_master_rank'));

  return {
    speciesId: entry.speciesId,
    speciesName: entry.speciesName,
    originGameId: entry.originGameId,
    gen: parseInt(entry.originGen),
    isShadow: entry.originGameId === 'colo' || entry.originGameId === 'xd',
    isMythical,
    isLegendary: Boolean(entry.isLegendary) || isKnownLegendaryPokemonId(entry.speciesId),
    allowMythicalRanked,
    collectedRibbons: Array.isArray(entry.collectedRibbons) ? entry.collectedRibbons : [],
    availableGames: mergeAvailableGames(
      Array.isArray(entry.availableGames) ? entry.availableGames : [],
      entry.originGameId
    )
  };
};

const getEligibleStandardRibbons = (pokemonState) => (
  RIBBONS.filter(ribbon => isEligible(pokemonState, ribbon) && !ribbon.isAutomated)
);

const getGen34BattleRibbonIds = (pokemonState) => (
  getEligibleStandardRibbons(pokemonState)
    .filter(ribbon => isGen34BattleRibbon(ribbon))
    .map(ribbon => ribbon.id)
);


/**
 * Initializes the Ribbon Tracker page.
 * @param {HTMLElement} appContainer - The container to render the page into.
 */
export async function initRibbonTracker(appContainer) {
  appContainer.innerHTML = `
    <div class="ribbon-tracker-page text-center w-full max-w-full sm:max-w-4xl mx-auto px-3 sm:px-4 pb-12 overflow-x-hidden">
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <h1 class="text-4xl text-black dark:text-white font-extrabold text-shadow-lg">Ribbon Tracker</h1>
        <button id="cloud-sync-btn" class="p-2 rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 group relative border-none bg-transparent cursor-pointer">
          <i id="cloud-icon" class="fas fa-cloud text-2xl text-gray-300 dark:text-gray-600"></i>
          <div id="sync-status-tooltip" class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[110%] w-48 p-2 bg-gray-900 border border-gray-700 text-white text-[10px] rounded shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
            Cloud Sync Disconnected. Click to sign in with Google Drive.
          </div>
        </button>
      </div>
      <p class="mb-2 text-lg text-gray-500 dark:text-gray-400">Track ribbons and marks for your unique Pok&eacute;mon journey.</p>
      
      <!-- Instructions Collapsible -->
      <details class="group mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden text-center">
        <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 list-none [&::-webkit-details-marker]:hidden border-b border-transparent group-open:border-gray-100 dark:group-open:border-gray-700">
          <div class="flex items-center space-x-3">
            <span class="w-1.5 h-6 brand-marker-yellow rounded-full"></span>
            <span class="text-xl font-bold text-gray-900 dark:text-white">How to Use This Tool</span>
          </div>
          <svg class="w-6 h-6 text-gray-400 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </summary>
        <div class="p-6 bg-gray-50/50 dark:bg-gray-900/20">
          <div class="mb-6">
            <a href="/info/ribbon-master-guide" class="inline-flex items-center text-sm font-bold brand-link transition-colors brand-panel-red px-6 py-2 rounded-full shadow-sm">
              <i class="fas fa-question-circle mr-2"></i> Ribbon Master Guide
            </a>
          </div>
          ${RIBBON_TRACKER_INSTRUCTIONS}
        </div>
      </details>

      <!-- Pokemon Entry Creator -->
      <div id="entry-creator" class="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transition-all duration-300">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span class="w-1.5 h-6 brand-marker-red rounded-full"></span>
          Start a New Journey
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">What's your Pokemon's name?</label>
            <div class="flex gap-2">
              <input type="text" id="pokemon-nickname" placeholder="e.g. My Shiny Pikachu" class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
              <label class="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 group">
                <input type="checkbox" id="is-shiny-checkbox" class="hidden peer">
                <i class="fas fa-star text-gray-300 peer-checked:text-yellow-400 group-hover:scale-110 transition-transform"></i>
                <span class="text-xs font-bold text-gray-500 dark:text-gray-400 peer-checked:text-yellow-500">Shiny</span>
              </label>
            </div>
          </div>
          <div id="pokemon-select-container">
            ${getSearchableDropdownHtml('ribbon-pokemon-dropdown', 'Which species?', 'Search Pokemon...')}
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Origin Game</label>
            <select id="origin-game" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="" disabled selected>Select a Game...</option>
              ${ORIGIN_GAMES.map(game => `<option value="${game.id}">${game.name}</option>`).join('')}
            </select>
          </div>
          <div class="flex items-end">
            <button id="add-entry" class="w-full px-6 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-black dark:text-white font-bold rounded-lg shadow-lg transition-transform active:scale-95">
              Begin Journey
            </button>
          </div>
        </div>
      </div>

      <!-- Sort Options -->
      <div class="mb-6 flex items-center justify-end gap-2 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <label for="ribbon-sort-select" class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sort By:</label>
        <div class="relative">
          <select id="ribbon-sort-select" class="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-800 dark:text-white py-1.5 pl-3 pr-8 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20">
            <option value="dex">Dex Number</option>
            <option value="name">Pokemon Name</option>
            <option value="progress">Ribbon Progress</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 dark:text-gray-500">
            <i class="fas fa-chevron-down text-[10px]"></i>
          </div>
        </div>
      </div>

      <!-- Active Entries -->
      <div id="active-entries" class="space-y-6">
        <!-- Injected dynamically -->
      </div>

      <!-- Detail View (Modal-like or separate section) -->
      <div id="ribbon-detail-view" class="ribbon-detail-overlay hidden fixed inset-0 z-[1000] items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="ribbon-detail-panel w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col min-w-0 max-h-[92dvh] sm:max-h-[90vh]">
          <div class="relative rounded-t-2xl sm:rounded-t-3xl p-4 sm:p-5 pr-14 border-b border-gray-100 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
            <h3 id="detail-pokemon-name" class="text-left text-lg sm:text-xl font-black text-gray-900 dark:text-white"></h3>
            <button id="close-detail" class="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 !p-0 text-xs leading-none rounded-sm bg-black/5 dark:bg-white/5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              X
            </button>
          </div>
          <div id="ribbon-grid-container" class="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1 min-w-0">
            <!-- Ribbons will be injected here -->
          </div>
        </div>
      </div>

      <!-- Global Smart Tooltip -->
      <div id="smart-tooltip" class="fixed z-[1010] pointer-events-none opacity-0 invisible transition-opacity duration-200 w-48 p-2 bg-gray-900 border border-gray-700 text-white text-xs rounded shadow-2xl text-center">
        <div id="smart-tooltip-title" class="font-bold mb-1"></div>
        <div id="smart-tooltip-desc" class="text-gray-300 text-[10px] leading-tight"></div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-b border-r border-gray-700 transform rotate-45"></div>
      </div>
    </div>
  `;
  // --- State ---
  let entries = JSON.parse(localStorage.getItem('ribbon_entries') || '[]');
  let currentSort = localStorage.getItem('ribbon_sort_option') || 'dex';
  const migratedSpeciesFlags = entries.reduce((changed, entry) => {
    let didChange = false;
    if (typeof entry.isMythical !== 'boolean') {
      entry.isMythical = isKnownMythicalPokemonId(entry.speciesId);
      didChange = true;
    }
    if (typeof entry.isLegendary !== 'boolean') {
      entry.isLegendary = isKnownLegendaryPokemonId(entry.speciesId);
      didChange = true;
    }
    return changed || didChange;
  }, false);

  if (migratedSpeciesFlags) {
    localStorage.setItem('ribbon_entries', JSON.stringify(entries));
  }

  let selectedSpecies = null;
  let isFetchingAvailability = false;
  let tooltipTimeoutId = null;
  let currentDetailEntryIdx = null;
  const categoryBulkSelectionByEntry = {};

  const closeNavbarOverlays = () => {
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => menu.classList.remove('show'));
    document.querySelectorAll('.dropdown button.active').forEach(button => {
      button.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
    });
  };

  // --- Initial Data Load ---
  updateDropdownLoading('ribbon-pokemon-dropdown', "Loading Pok\u00e9mon");
  const pokemonList = await getPokemonListUpToGeneration(9);

  // Store the control object for resetting later
  let pokemonDropdown = setupSearchableDropdown('ribbon-pokemon-dropdown', pokemonList, (p) => {
    selectedSpecies = p;
    validateForm();
  });

  // --- Cloud Sync Logic ---
  const updateSyncStatus = (status) => {
    const icon = document.getElementById('cloud-icon');
    const tooltip = document.getElementById('sync-status-tooltip');

    icon.className = 'fas text-2xl transition-all duration-300 ';

    switch (status) {
      case 'syncing':
        icon.classList.add('fa-sync-alt', 'fa-spin', 'text-yellow-400');
        tooltip.innerText = 'Syncing with Google Drive...';
        break;
      case 'synced':
        icon.classList.add('fa-cloud', 'text-[#ef4444]');
        tooltip.innerText = `Last synced: ${new Date().toLocaleTimeString()}`;
        break;
      case 'error':
        icon.classList.add('fa-cloud', 'text-red-500');
        tooltip.innerText = 'Sync error. Click to retry.';
        break;
      case 'disconnected':
      default:
        icon.classList.add('fa-cloud', 'text-gray-300', 'dark:text-gray-600');
        tooltip.innerText = 'Cloud Sync Disconnected. Click to sign in.';
    }
  };

  const saveEntries = async (updatedEntryId = null) => {
    // Update timestamp for the modified entry
    if (updatedEntryId) {
      const entry = entries.find(e => e.id === updatedEntryId);
      if (entry) entry.lastUpdated = new Date().toISOString();
    }

    localStorage.setItem('ribbon_entries', JSON.stringify(entries));

    if (isSignedIn()) {
      updateSyncStatus('syncing');
      try {
        await SyncManager.push();
        updateSyncStatus('synced');
      } catch (err) {
        console.error('Cloud Push Error:', err);
        updateSyncStatus('error');
      }
    }
  };

  // Initialize Auth
  const authPromise = initGoogleAuth().then(() => {
    if (isSignedIn()) {
      updateSyncStatus('synced');
      // Trigger background sync
      SyncManager.sync().then(syncedEntries => {
        if (syncedEntries) {
          entries = syncedEntries;
          renderEntriesList();
        }
      });
    }
  });

  document.getElementById('cloud-sync-btn').onclick = async () => {
    if (!isSignedIn()) {
      signInRedirect('sync_ribbons');
      return;
    } else {
      // Toggle sync manually if already signed in
      updateSyncStatus('syncing');
      try {
        const syncedEntries = await SyncManager.sync();
        if (syncedEntries) {
          entries = syncedEntries;
          renderEntriesList();
        }
        updateSyncStatus('synced');
      } catch (err) {
        console.error('Manual Sync Error:', err);
        updateSyncStatus('error');
      }
    }
  };

  // --- UI Functions ---
  const getEntryProgressStats = (entry) => {
    const pokemonState = getPokemonStateFromEntry(entry);

    // Standard eligible ribbons
    const eligibleBase = getEligibleStandardRibbons(pokemonState);
    const eligibleBaseIds = new Set(eligibleBase.map(ribbon => ribbon.id));
    let eligibleCount = eligibleBase.length;
    let collectedCount = entry.collectedRibbons.filter(id => eligibleBaseIds.has(id)).length;

    // Check for automated ribbons (Contest Memory)
    const contestRibbonIds = RIBBONS.filter(r => (r.gen === 3 || r.gen === 4) && r.name.includes('Contest')).map(r => r.id);
    const collectedContestCount = entry.collectedRibbons.filter(id => contestRibbonIds.includes(id)).length;

    if (collectedContestCount > 0) {
      eligibleCount++; // Contest Memory is eligible
      collectedCount++; // Contest Memory is earned
    }

    // Check for automated ribbons (Battle Memory)
    const battleRibbonIds = getGen34BattleRibbonIds(pokemonState);
    const collectedBattleCount = entry.collectedRibbons.filter(id => battleRibbonIds.includes(id)).length;

    if (collectedBattleCount > 0) {
      eligibleCount++; // Battle Memory is eligible
      collectedCount++; // Battle Memory is earned
    }

    const isMaster = collectedCount > 0 && collectedCount === eligibleCount;
    const progressRatio = eligibleCount > 0 ? collectedCount / eligibleCount : 0;

    return {
      eligibleCount,
      collectedCount,
      isMaster,
      progressRatio
    };
  };

  const renderCardHtml = (entry, stats, originalIdx) => {
    const isMaster = stats.isMaster;
    const collectedCount = stats.collectedCount;
    const eligibleCount = stats.eligibleCount;

    return `
      <div class="ribbon-entry-card bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:border-yellow-300 transition-all cursor-pointer group" data-entry-idx="${originalIdx}" onclick="window.openRibbonDetail(${originalIdx})">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center border-2 ${entry.isShiny ? 'border-yellow-200 dark:border-yellow-900' : 'border-red-100 dark:border-red-900'} relative">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.isShiny ? 'shiny/' : ''}${entry.speciesId}.png" class="w-14 h-14 object-contain">
            ${entry.isShiny ? '<i class="fas fa-star text-[10px] text-yellow-400 absolute top-0 right-0 animate-pulse"></i>' : ''}
          </div>
          <div class="text-left min-w-0">
            <h3 class="font-bold text-gray-800 dark:text-white truncate">${entry.nickname}</h3>
            <div class="flex flex-col text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
              <span class="truncate">${entry.speciesName}</span>
              <span class="truncate">${ORIGIN_GAMES.find(g => g.id === entry.originGameId)?.name || (entry.originGen ? `Gen ${entry.originGen}` : 'Unknown')}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <div class="text-right flex flex-col items-end">
            <div class="flex items-center gap-1.5 sm:gap-2">
              ${isMaster ? `
                <div class="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-600 text-white text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  <i class="fas fa-crown text-[8px]"></i>
                  <span class="hidden sm:inline">MASTER</span>
                </div>
              ` : ''}
              <div class="ribbon-card-count text-sm font-bold whitespace-nowrap ${isMaster ? 'text-amber-600 dark:text-amber-400' : 'text-[#ef4444] dark:text-red-300'}">${collectedCount} / ${eligibleCount}</div>
            </div>
            <div class="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 mt-0.5 sm:mt-0 whitespace-nowrap">${isMaster ? '<span class="hidden sm:inline">Collection </span>Complete' : 'Ribbons'}</div>
          </div>
          <button onclick="event.stopPropagation(); window.deleteEntry(${originalIdx})" class="p-2 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    `;
  };

  const renderEntriesList = () => {
    // Migration: fix any entries that might have corrupted availableGames (Set serialized as {})
    entries.forEach(entry => {
      if (entry.availableGames && !Array.isArray(entry.availableGames)) {
        entry.availableGames = []; // Reset to empty array if corrupted
      }
      if (!Array.isArray(entry.optionalRibbons)) {
        entry.optionalRibbons = [];
      }
    });

    const entriesList = document.getElementById('active-entries');
    if (entries.length === 0) {
      entriesList.innerHTML = `<div class="p-12 text-gray-500 dark:text-gray-400 italic">No Pokemon journeys started yet. Start one above!</div>`;
      return;
    }

    // Read previous collapse/open state from DOM if they exist
    const inProgressDetails = document.getElementById('in-progress-details');
    const completedDetails = document.getElementById('completed-details');
    const isInProgressOpen = inProgressDetails ? inProgressDetails.open : false;
    const isCompletedOpen = completedDetails ? completedDetails.open : false;

    const inProgressOpenAttr = isInProgressOpen ? 'open' : '';
    const completedOpenAttr = isCompletedOpen ? 'open' : '';

    // Calculate progress stats and keep original index
    const processedEntries = entries.map((entry, originalIdx) => {
      const stats = getEntryProgressStats(entry);
      return {
        entry,
        stats,
        originalIdx
      };
    });

    // Sort entries according to currentSort
    processedEntries.sort((a, b) => {
      if (currentSort === 'dex') {
        const idA = Number(a.entry.speciesId) || 0;
        const idB = Number(b.entry.speciesId) || 0;
        if (idA !== idB) return idA - idB;
        return a.entry.nickname.localeCompare(b.entry.nickname);
      } else if (currentSort === 'name') {
        const nameComp = a.entry.speciesName.localeCompare(b.entry.speciesName);
        if (nameComp !== 0) return nameComp;
        const idA = Number(a.entry.speciesId) || 0;
        const idB = Number(b.entry.speciesId) || 0;
        if (idA !== idB) return idA - idB;
        return a.entry.nickname.localeCompare(b.entry.nickname);
      } else if (currentSort === 'progress') {
        if (b.stats.progressRatio !== a.stats.progressRatio) {
          return b.stats.progressRatio - a.stats.progressRatio;
        }
        const idA = Number(a.entry.speciesId) || 0;
        const idB = Number(b.entry.speciesId) || 0;
        if (idA !== idB) return idA - idB;
        return a.entry.nickname.localeCompare(b.entry.nickname);
      }
      return 0;
    });

    const inProgressEntries = processedEntries.filter(item => !item.stats.isMaster);
    const completedEntries = processedEntries.filter(item => item.stats.isMaster);

    const inProgressHtml = inProgressEntries.length === 0
      ? `<div class="p-6 text-gray-500 dark:text-gray-400 italic">No Pokémon currently in progress.</div>`
      : inProgressEntries.map(item => renderCardHtml(item.entry, item.stats, item.originalIdx)).join('');

    const completedHtml = completedEntries.length === 0
      ? `<div class="p-6 text-gray-500 dark:text-gray-400 italic">No completed journeys yet.</div>`
      : completedEntries.map(item => renderCardHtml(item.entry, item.stats, item.originalIdx)).join('');

    entriesList.innerHTML = `
      <!-- In Progress Collapsible -->
      <details id="in-progress-details" ${inProgressOpenAttr} class="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden text-center mb-6">
        <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 list-none [&::-webkit-details-marker]:hidden border-b border-transparent group-open:border-gray-100 dark:group-open:border-gray-700">
          <div class="flex items-center space-x-3">
            <span class="w-1.5 h-6 bg-[#ef4444] rounded-full"></span>
            <span class="text-xl font-bold text-gray-900 dark:text-white">In Progress (${inProgressEntries.length})</span>
          </div>
          <svg class="w-6 h-6 text-gray-400 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </summary>
        <div class="p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/20 space-y-4">
          ${inProgressHtml}
        </div>
      </details>

      <!-- Completed Collapsible -->
      <details id="completed-details" ${completedOpenAttr} class="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden text-center">
        <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 list-none [&::-webkit-details-marker]:hidden border-b border-transparent group-open:border-gray-100 dark:group-open:border-gray-700">
          <div class="flex items-center space-x-3">
            <span class="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
            <span class="text-xl font-bold text-gray-900 dark:text-white">Completed (${completedEntries.length})</span>
          </div>
          <svg class="w-6 h-6 text-gray-400 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </summary>
        <div class="p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/20 space-y-4">
          ${completedHtml}
        </div>
      </details>
    `;

    requestAnimationFrame(() => {
      entriesList.querySelectorAll('.ribbon-entry-card').forEach((card, index) => {
        window.setTimeout(() => {
          card.classList.add('is-visible');
        }, index * 35);
      });
    });
  };

  window.deleteEntry = (idx) => {
    if (confirm('Are you sure you want to end this journey? Progress will be lost.')) {
      entries.splice(idx, 1);
      saveEntries(); // Entire list changed
      renderEntriesList();
    }
  };

  const getGenerationWarningHtml = (genCategory, entry, isCompleted) => {
    if (!genCategory.startsWith('Generation ')) return '';
    const genNum = parseInt(genCategory.replace('Generation ', ''), 10);
    const originGen = parseInt(entry.originGen, 10);

    // If Pokemon originated in a later generation, this generation does not apply
    if (originGen && genNum < originGen) return '';

    // Gen 9 is currently the latest mainline generation with nowhere to move up to yet
    if (genNum >= 9) return '';

    const isGen3 = genCategory === 'Generation 3';
    const hasWinningRibbon = isGen3 && entry.collectedRibbons.includes('gen3_winning');
    const isGen4 = genCategory === 'Generation 4';
    const hasFootprintRibbon = entry.collectedRibbons.includes('gen4_footprint');

    if (isCompleted) {
      return `
        <div class="generation-warning-box bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 rounded-xl p-2.5 mb-3 text-xs flex items-center gap-2">
          <i class="fas fa-check-circle text-emerald-500 shrink-0 text-sm"></i>
          <span><strong>Generation Complete:</strong> All ribbons in this generation are collected. Safe to transfer forward!</span>
        </div>
      `;
    }

    const pokemonState = getPokemonStateFromEntry(entry);
    const eligibleInGen = RIBBONS.filter(r => {
      if (!isEligible(pokemonState, r) || r.isAutomated) return false;
      if (r.game === 'Marks') return false;
      if (r.game === 'Colosseum / XD') return genNum === 3;
      return r.gen === genNum;
    });

    const missableRibbons = eligibleInGen.filter(r => {
      if (!r.isRecurring) return true;
      const appearances = getRecurringRibbonAppearances(r, pokemonState);
      return !appearances.some(app => app.gen > genNum);
    });
    const allMissableCollected = missableRibbons.length === 0 || missableRibbons.every(r => entry.collectedRibbons.includes(r.id));

    if (allMissableCollected) {
      return `
        <div class="generation-warning-box bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 rounded-xl p-3 mb-3 text-xs leading-relaxed">
          <div class="flex items-start gap-2">
            <i class="fas fa-info-circle text-blue-500 dark:text-blue-400 shrink-0 mt-0.5"></i>
            <div>
              <strong>Transfer Notice:</strong> Safe to transfer forward! All generation-exclusive ribbons in this section are collected. Any remaining uncollected ribbons (such as Royal, Daily ribbons, etc.) can be obtained in later generation games—just make sure to get them in those later games.
            </div>
          </div>
          ${isGen4 ? `
            <div class="mt-2.5 pt-2.5 border-t border-blue-200/70 dark:border-blue-800/50 flex items-start gap-2 ${hasFootprintRibbon ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-300'}">
              <i class="fas ${hasFootprintRibbon ? 'fa-check-circle text-emerald-500' : 'fa-exclamation-circle text-amber-500'} shrink-0 mt-0.5"></i>
              <div>
                ${hasFootprintRibbon
            ? `<strong>Footprint Ribbon Collected:</strong> Safe to level this Pokémon past Lv. 70.`
            : `<strong>Footprint Ribbon Warning:</strong> It is easiest to get the <strong>Footprint Ribbon</strong> in Gen 4 with Max Friendship. In later generations, most Pokémon must gain <strong>30 levels</strong> from their met level to receive it, making any Pokémon transferred above <strong>Lv. 70</strong> unable to obtain it!`}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    return `
      <div class="generation-warning-box bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 rounded-xl p-3 mb-3 text-xs leading-relaxed">
        <div class="flex items-start gap-2">
          <i class="fas fa-exclamation-triangle text-amber-500 dark:text-amber-400 shrink-0 mt-0.5"></i>
          <div>
            <strong>Transfer Warning:</strong> Do not transfer this Pokémon to the next generation until all ribbons in this section are collected. Inter-generation transfers are permanent and one-way!
          </div>
        </div>
        ${isGen3 ? `
          <div class="mt-2.5 pt-2.5 border-t border-amber-200/70 dark:border-amber-800/50 flex items-start gap-2 ${hasWinningRibbon ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-300'}">
            <i class="fas ${hasWinningRibbon ? 'fa-check-circle text-emerald-500' : 'fa-exclamation-circle text-red-500'} shrink-0 mt-0.5"></i>
            <div>
              ${hasWinningRibbon
          ? `<strong>Winning Ribbon Collected:</strong> Safe to level this Pokémon past Lv. 50.`
          : `<strong>Battle Tower Lv. 50 Warning:</strong> Do not level this Pokémon past <strong>Lv. 50</strong> until you obtain the <strong>Winning Ribbon</strong>! Pokémon above Lv. 50 are permanently barred from entering the Battle Tower Level 50 Challenge in Gen 3.`}
            </div>
          </div>
        ` : ''}
        ${isGen4 ? `
          <div class="mt-2.5 pt-2.5 border-t border-amber-200/70 dark:border-amber-800/50 flex items-start gap-2 ${hasFootprintRibbon ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-300'}">
            <i class="fas ${hasFootprintRibbon ? 'fa-check-circle text-emerald-500' : 'fa-exclamation-circle text-red-500'} shrink-0 mt-0.5"></i>
            <div>
              ${hasFootprintRibbon
          ? `<strong>Footprint Ribbon Collected:</strong> Safe to level this Pokémon past Lv. 70.`
          : `<strong>Footprint Ribbon Warning:</strong> It is easiest to get the <strong>Footprint Ribbon</strong> in Gen 4 with Max Friendship. In later generations, most Pokémon must gain <strong>30 levels</strong> from their met level to receive it, making any Pokémon transferred above <strong>Lv. 70</strong> unable to obtain it!`}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  const getRecurringRibbonsWarningHtml = (entry, eligibleRibbons, isCompleted) => {
    // Chronological order of mainline game version groups (oldest to newest).
    // Used to find the LAST game in a ribbon's versionGroups that this Pokémon can access.
    const GAME_ORDER = [
      { key: 'diamond-pearl', label: 'Brilliant Diamond / Shining Pearl (or DP/Pt/HGSS)' },
      { key: 'platinum', label: 'Brilliant Diamond / Shining Pearl (or DP/Pt/HGSS)' },
      { key: 'heartgold-soulsilver', label: 'Brilliant Diamond / Shining Pearl (or DP/Pt/HGSS)' },
      { key: 'black-white', label: 'Black / White' },
      { key: 'black-2-white-2', label: 'Black 2 / White 2' },
      { key: 'x-y', label: 'X / Y' },
      { key: 'omega-ruby-alpha-sapphire', label: 'Omega Ruby / Alpha Sapphire' },
      { key: 'sun-moon', label: 'Sun / Moon' },
      { key: 'ultra-sun-ultra-moon', label: 'Ultra Sun / Ultra Moon' },
      { key: 'sword-shield', label: 'Sword / Shield' },
      { key: 'brilliant-diamond-shining-pearl', label: 'Brilliant Diamond / Shining Pearl' },
      { key: 'legends-arceus', label: 'Legends: Arceus' },
      { key: 'scarlet-violet', label: 'Scarlet / Violet' },
    ];

    // Ribbons that have a deadline (not available in Sword/Shield or Scarlet/Violet)
    const deadlineRibbons = eligibleRibbons.filter(r =>
      r.isRecurring &&
      r.id !== 'gen3_effort' &&
      Array.isArray(r.versionGroups) &&
      !r.versionGroups.includes('sword-shield') &&
      !r.versionGroups.includes('scarlet-violet')
    );

    if (deadlineRibbons.length === 0) return '';

    const availableGames = entry.availableGames instanceof Set
      ? entry.availableGames
      : new Set(Array.isArray(entry.availableGames) ? entry.availableGames : []);

    // For each ribbon, find the last game this Pokémon can access it in
    const ribbonsWithDeadline = deadlineRibbons.map(r => {
      // Walk game order in reverse to find the latest accessible game for this ribbon
      let lastGame = null;
      for (let i = GAME_ORDER.length - 1; i >= 0; i--) {
        const game = GAME_ORDER[i];
        if (r.versionGroups.includes(game.key)) {
          // Check if this Pokémon can enter this game
          if (availableGames.size === 0 || availableGames.has(game.key)) {
            lastGame = game;
            break;
          }
        }
      }
      return { ribbon: r, lastGame };
    }).filter(({ lastGame }) => lastGame !== null);

    if (ribbonsWithDeadline.length === 0) return '';

    const allDeadlineDone = ribbonsWithDeadline.every(({ ribbon }) => entry.collectedRibbons.includes(ribbon.id));

    if (isCompleted || allDeadlineDone) {
      return `
        <div class="recurring-warning-box bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 rounded-xl p-2.5 mb-3 text-xs flex items-center gap-2">
          <i class="fas fa-check-circle text-emerald-500 shrink-0 text-sm"></i>
          <span><strong>Transfer Deadline Met:</strong> All time-limited recurring ribbons have been collected!</span>
        </div>
      `;
    }

    // Group ribbons by their deadline game label
    const byDeadline = {};
    ribbonsWithDeadline.forEach(({ ribbon, lastGame }) => {
      const label = lastGame.label;
      if (!byDeadline[label]) byDeadline[label] = [];
      byDeadline[label].push(ribbon);
    });

    const deadlineBlocks = Object.entries(byDeadline).map(([gameLabel, ribbons]) => {
      const pills = ribbons.map(r => {
        const collected = entry.collectedRibbons.includes(r.id);
        return collected
          ? `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold"><i class="fas fa-check text-[8px]"></i>${r.name}</span>`
          : `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] font-semibold"><i class="fas fa-times text-[8px]"></i>${r.name}</span>`;
      }).join('');

      return `
        <div class="mt-2 pt-2 border-t border-amber-200/70 dark:border-amber-800/50 first:mt-0 first:pt-0 first:border-t-0">
          <div class="font-semibold text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1.5">
            <i class="fas fa-hourglass-half mr-1 text-[9px]"></i>Last chance: <strong>${gameLabel}</strong>
          </div>
          <div class="flex flex-wrap gap-1.5">${pills}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="recurring-warning-box bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 rounded-xl p-3 mb-3 text-xs leading-relaxed">
        <div class="flex items-start gap-2 mb-2">
          <i class="fas fa-exclamation-triangle text-amber-500 dark:text-amber-400 shrink-0 mt-0.5"></i>
          <div>
            <strong>Transfer Deadline Warning:</strong> The following ribbons cannot be obtained in Sword / Shield or Scarlet / Violet. Collect them before transferring past the listed game!
          </div>
        </div>
        ${deadlineBlocks}
      </div>
    `;
  };


  window.openRibbonDetail = (idx) => {
    window.hideRibbonTooltip();
    const entry = entries[idx];
    const isDifferentEntry = currentDetailEntryIdx !== idx;
    currentDetailEntryIdx = idx;
    const detailView = document.getElementById('ribbon-detail-view');
    const gridContainer = document.getElementById('ribbon-grid-container');
    const nameHeader = document.getElementById('detail-pokemon-name');
    const detailPanel = detailView.querySelector('.ribbon-detail-panel');

    nameHeader.innerHTML = `
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full pr-2">
        <div 
          id="detail-species-sprite-wrap"
          onclick="window.openSpeciesEdit(${idx})"
          class="group relative w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center border-2 ${entry.isShiny ? 'border-yellow-200 dark:border-yellow-900/50' : 'border-gray-100 dark:border-gray-700'} shadow-sm shrink-0 cursor-pointer overflow-hidden transition-all hover:border-yellow-400 dark:hover:border-yellow-500"
        >
          <img id="detail-species-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.isShiny ? 'shiny/' : ''}${entry.speciesId}.png" class="w-14 h-14 object-contain transition-transform group-hover:scale-110">
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <i class="fas fa-pencil-alt text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md text-xs translate-y-1 group-hover:translate-y-0 duration-200"></i>
          </div>
          <i id="detail-species-shiny-badge" class="fas fa-star text-[8px] text-yellow-400 absolute top-1 right-1 animate-pulse ${entry.isShiny ? '' : 'hidden'}"></i>
        </div>
        
        <div class="flex flex-col flex-1 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-end gap-3 w-full">
            <div class="flex-1 min-w-0">
              <label class="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1 ml-1">Nickname</label>
              <div class="relative group/edit">
                <input type="text" value="${entry.nickname}" id="nickname-edit-input"
                  onblur="window.saveNickname(${idx})"
                  onkeyup="if(event.key === 'Enter') this.blur()"
                  class="bg-black/5 dark:bg-white/5 border border-transparent focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 font-black text-xl sm:text-2xl text-gray-800 dark:text-white px-3 py-1.5 rounded-xl w-full hover:bg-black/5 dark:hover:bg-white/5 cursor-text transition-all truncate"
                >
              </div>
            </div>
            
          </div>
          
          <div id="detail-name-container" class="w-full flex flex-col sm:flex-row sm:items-center gap-2 mt-2 ml-1">
            <span class="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-black">${entry.speciesName} Journey</span>
            <div class="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800"></div>
            <div class="relative group/game">
              <select 
                onchange="window.updateEntryOriginGame(${idx}, this.value)"
                class="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[10px] text-gray-700 dark:text-gray-200 uppercase tracking-[0.2em] font-black py-0.5 px-2 pr-6 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:ring-2 focus:ring-red-500/30"
              >
                ${ORIGIN_GAMES.map(g => `<option value="${g.id}" ${g.id === entry.originGameId ? 'selected' : ''}>${g.name}</option>`).join('')}
              </select>
              <i class="fas fa-caret-down absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none text-[8px]"></i>
            </div>
          </div>
        </div>
      </div>
    `;
    // Group eligible ribbons by Generation, then by Game Category
    // Group eligible ribbons by Generation/Category, then by Game Category
    // Recurring ribbons move to the top group ONLY if they are from an earlier gen than the Pokemon
    const pokemonState = getPokemonStateFromEntry(entry);
    // Generate the automated Contest Memory Ribbon if applicable (only for Gen 3 & 4 Pokémon)
    let automatedRibbons = [];
    if (pokemonState.gen <= 4) {
      const contestRibbonIds = RIBBONS.filter(r => (r.gen === 3 || r.gen === 4) && r.name.includes('Contest')).map(r => r.id);
      const collectedContestCount = entry.collectedRibbons.filter(id => contestRibbonIds.includes(id)).length;
      if (collectedContestCount > 0) {
        const isContestGold = collectedContestCount === 40;
        automatedRibbons.push({
          id: 'gen6_contest_memory',
          name: isContestGold ? 'Contest Memory Ribbon (Gold)' : 'Contest Memory Ribbon',
          description: `A Ribbon awarded to a Pokémon that has overcome many challenges in Contests in the distant past. (Contests Cleared: ${collectedContestCount}/40)`,
          game: RIBBON_GAMES.XY,
          gen: 6,
          isEarned: true,
          isAutomated: true,
          isGold: isContestGold
        });
      }

      // Generate the automated Battle Memory Ribbon if applicable
      const battleRibbonIds = getGen34BattleRibbonIds(pokemonState);
      const collectedBattleCount = entry.collectedRibbons.filter(id => battleRibbonIds.includes(id)).length;
      if (collectedBattleCount > 0) {
        const isBattleGold = collectedBattleCount >= 7;
        automatedRibbons.push({
          id: 'gen6_battle_memory',
          name: isBattleGold ? 'Battle Memory Ribbon (Gold)' : 'Battle Memory Ribbon',
          description: `A Ribbon awarded to a Pokémon that has overcome many challenges in Battle Towers in the distant past. (Battle Ribbons: ${collectedBattleCount}/8)`,
          game: RIBBON_GAMES.XY,
          gen: 6,
          isEarned: true,
          isAutomated: true,
          isGold: isBattleGold
        });
      }
    }

    const grouped = {};

    RIBBONS.forEach(ribbon => {
      if (!isEligible(pokemonState, ribbon) && !ribbon.isAutomated) return;
      if (ribbon.isAutomated) return;

      if (!ribbon.isRecurring) {
        let genLabel = `Generation ${ribbon.gen}`;
        let gameLabel = ribbon.game;

        if (ribbon.game === 'Colosseum / XD') {
          genLabel = 'Generation 3';
        }

        if (!grouped[genLabel]) grouped[genLabel] = {};
        if (!grouped[genLabel][gameLabel]) grouped[genLabel][gameLabel] = [];
        grouped[genLabel][gameLabel].push(ribbon);
      } else {
        const appearances = getRecurringRibbonAppearances(ribbon, pokemonState);
        if (appearances.length === 0) return;

        const isCollected = entry.collectedRibbons.includes(ribbon.id);
        const earnedGen = entry.ribbonEarnedInGen?.[ribbon.id];
        const matchedApp = appearances.find(app => app.gen === earnedGen) || appearances[0];

        appearances.forEach(app => {
          const genLabel = `Generation ${app.gen}`;
          const gameLabel = app.game;
          const isHidden = isCollected && app.gen !== matchedApp.gen;

          if (!grouped[genLabel]) grouped[genLabel] = {};
          if (!grouped[genLabel][gameLabel]) grouped[genLabel][gameLabel] = [];
          grouped[genLabel][gameLabel].push({
            ...ribbon,
            gen: app.gen,
            game: app.game,
            isHidden
          });
        });
      }
    });

    // Inject automated ribbons into their respective generations
    automatedRibbons.forEach(ar => {
      const genLabel = `Generation ${ar.gen}`;
      if (!grouped[genLabel]) grouped[genLabel] = {};
      if (!grouped[genLabel][ar.game]) grouped[genLabel][ar.game] = [];
      grouped[genLabel][ar.game].unshift(ar);
    });

    if (OPTIONAL_EXTRA_RIBBONS.length > 0) {
      grouped['Optional Extras'] = {
        'Optional Ribbons & Marks': OPTIONAL_EXTRA_RIBBONS
      };
    }

    // Sort categories: Recurring first, then numeric generations, then Marks. Exclude empty categories.
    const sortedCategories = Object.keys(grouped)
      .filter(category => {
        const gamesObj = grouped[category];
        if (!gamesObj) return false;
        const ribbons = Object.values(gamesObj).flat();
        return ribbons.length > 0;
      })
      .sort((a, b) => {
        if (a === 'Recurring Ribbons') return -1;
        if (b === 'Recurring Ribbons') return 1;
        if (a === 'Optional Extras') return 1;
        if (b === 'Optional Extras') return -1;
        if (a === 'Marks') return 1;
        if (b === 'Marks') return -1;
        return a.localeCompare(b, undefined, { numeric: true });
      });

    const categoryBulkSelection = {};

    gridContainer.innerHTML = sortedCategories.map(genCategory => {
      const gamesObj = grouped[genCategory];
      const isRecurring = genCategory === 'Recurring Ribbons';
      const isOptionalExtras = genCategory === 'Optional Extras';
      const isGenerationCategory = genCategory.startsWith('Generation ');
      const isMarksCategory = genCategory === 'Marks';
      const supportsBulkToggle = isGenerationCategory || isMarksCategory || isRecurring;
      const ribbonsInCategory = Object.values(gamesObj).flat();
      const selectableStandardRibbonIds = ribbonsInCategory
        .filter(ribbon => !ribbon.isAutomated && !ribbon.isOptionalExtra && !ribbon.isHidden)
        .map(ribbon => ribbon.id);
      const selectableOptionalRibbonIds = ribbonsInCategory
        .filter(ribbon => ribbon.isOptionalExtra && !ribbon.isHidden)
        .map(ribbon => ribbon.id);
      const totalSelectableInCategory = selectableStandardRibbonIds.length + selectableOptionalRibbonIds.length;
      const selectedStandardInCategory = selectableStandardRibbonIds.filter(id => entry.collectedRibbons.includes(id)).length;
      const selectedOptionalInCategory = selectableOptionalRibbonIds.filter(id => entry.optionalRibbons.includes(id)).length;
      const allSelectableEarned = totalSelectableInCategory > 0
        && (selectedStandardInCategory + selectedOptionalInCategory) === totalSelectableInCategory;

      if (supportsBulkToggle && totalSelectableInCategory > 0) {
        categoryBulkSelection[genCategory] = {
          standardRibbonIds: selectableStandardRibbonIds,
          optionalRibbonIds: selectableOptionalRibbonIds
        };
      }

      // Calculate totals for this generation/category
      let earnedInGen = 0;
      let totalInGen = 0;
      if (!isOptionalExtras) {
        Object.values(gamesObj).forEach(ribbons => {
          ribbons.forEach(r => {
            if (r.isHidden) return;
            if (r.isAutomated) {
              if (r.isEarned) {
                totalInGen++;
                earnedInGen++;
              }
            } else {
              totalInGen++;
              if (entry.collectedRibbons.includes(r.id)) {
                earnedInGen++;
              }
            }
          });
        });
      }

      const isGen3 = genCategory === 'Generation 3';
      const genNum = parseInt(genCategory.replace('Generation ', ''), 10);
      const missableRibbons = ribbonsInCategory.filter(r => {
        if (r.isAutomated || r.isOptionalExtra || r.isHidden) return false;
        if (!r.isRecurring) return true;
        const appearances = getRecurringRibbonAppearances(r, pokemonState);
        return !appearances.some(app => app.gen > genNum);
      });
      const allMissableCollected = missableRibbons.length === 0 || missableRibbons.every(r => entry.collectedRibbons.includes(r.id));
      const canMarkDone = isGenerationCategory && !isGen3 && allMissableCollected;

      const isManualDone = canMarkDone && Array.isArray(entry.manualCompletedGens) && entry.manualCompletedGens.includes(genCategory);
      const isNaturallyCompleted = isOptionalExtras
        ? (totalSelectableInCategory > 0 && allSelectableEarned)
        : (totalInGen > 0 && earnedInGen > 0 && earnedInGen === totalInGen);
      const isCompleted = isNaturallyCompleted || isManualDone;

      // Check previous collapse/open state from existing DOM details element if still on same entry
      const prevDetails = !isDifferentEntry && window.CSS && CSS.escape
        ? gridContainer.querySelector(`details[data-category="${CSS.escape(genCategory)}"]`)
        : null;
      const wasCompleted = prevDetails ? prevDetails.dataset.completed === 'true' : isCompleted;

      let isOpen;
      if (!prevDetails) {
        // Initial view for this entry: completed sections collapse, incomplete sections stay open
        isOpen = !isCompleted;
      } else if (isCompleted && !wasCompleted) {
        // Just transitioned to completed: collapse
        isOpen = false;
      } else if (!isCompleted && wasCompleted) {
        // Just transitioned from completed to incomplete: expand
        isOpen = true;
      } else {
        // Preserve user's current manual open/closed state
        isOpen = prevDetails.open;
      }

      // Render the Generation/Category collapsible
      return `
        <details ${isOpen ? 'open' : ''} data-category="${genCategory.replace(/"/g, '&quot;')}" data-completed="${isCompleted ? 'true' : 'false'}" class="group mb-5 min-w-0">
          <summary class="flex items-center justify-between gap-3 mb-3 pb-1.5 border-b dark:border-gray-700/50 min-w-0 cursor-pointer list-none select-none hover:opacity-85 transition-opacity [&::-webkit-details-marker]:hidden">
            <div class="flex items-center gap-2 min-w-0">
              <i class="fas fa-chevron-right text-[10px] text-gray-400 dark:text-gray-500 transform transition-transform duration-200 group-open:rotate-90 shrink-0"></i>
              <h3 class="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-[0.2em] min-w-0">${genCategory}</h3>
              <span class="category-completed-check shrink-0 ${isCompleted && !isOptionalExtras ? '' : 'hidden'}"><i class="fas fa-check-circle text-green-500 text-[11px]" title="Section Completed"></i></span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div class="category-manual-done-container shrink-0">
                ${canMarkDone && !isNaturallyCompleted ? getManualDoneButtonHtml(idx, genCategory, isManualDone) : ''}
              </div>
              ${supportsBulkToggle && totalSelectableInCategory > 0
          ? `<button
                  data-bulk-category="${genCategory.replace(/"/g, '&quot;')}"
                  onclick="event.stopPropagation(); window.toggleCategoryRibbons(${idx}, '${genCategory.replace(/'/g, "\\'")}')"
                  class="category-bulk-btn inline-flex items-center px-2 py-0.5 h-[18px] leading-none text-[9px] font-black whitespace-nowrap rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >${allSelectableEarned ? 'Deselect All' : 'Select All'}</button>`
          : ''}
              ${isOptionalExtras
          ? `<div class="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">Not counted</div>`
          : `<div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700/50">
                <span class="category-earned-count text-[9px] font-black ${isCompleted ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}">${earnedInGen}</span>
                <span class="text-[9px] font-black text-gray-300 dark:text-gray-600">/</span>
                <span class="category-total-count text-[9px] font-black text-gray-500 dark:text-gray-400">${totalInGen}</span>
              </div>`}
            </div>
          </summary>
          
          <div class="pb-1">
            ${getGenerationWarningHtml(genCategory, entry, isCompleted)}
            ${isRecurring ? getRecurringRibbonsWarningHtml(entry, ribbonsInCategory, isCompleted) : ''}
            ${Object.entries(gamesObj).map(([gameCategory, eligibleRibbons]) => {
            const isSV = gameCategory === 'Scarlet / Violet';
            const showMythicalRankedToggle = isSV && pokemonState.isMythical;
            return `
            ${showMythicalRankedToggle ? `
              <div class="mb-3.5 p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-left flex items-start gap-2.5">
                <input 
                  type="checkbox" 
                  id="entry-mythical-ranked-checkbox-${idx}"
                  ${pokemonState.allowMythicalRanked ? 'checked' : ''}
                  onchange="window.toggleMythicalRanked(${idx}, this.checked)"
                  class="mt-0.5 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer shrink-0"
                >
                <label for="entry-mythical-ranked-checkbox-${idx}" class="cursor-pointer select-none text-xs text-gray-700 dark:text-gray-300">
                  <span class="font-bold text-gray-900 dark:text-white">Allow Mythicals in Ranked Battles?</span>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">Mythical Pok&eacute;mon are normally banned from Ranked Battles, but were permitted during a certain time period. Check this if you obtained the <strong>Master Rank Ribbon</strong> during that time period.</p>
                </label>
              </div>
            ` : ''}
            <div class="mb-3 min-w-0 ${isRecurring || isOptionalExtras ? '' : 'pl-3 sm:pl-4 border-l-2 border-yellow-200 dark:border-yellow-800'}">
              ${isRecurring ? '' : `<h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 break-words pr-1">${gameCategory}</h4>`}
              <div class="grid grid-cols-[repeat(auto-fit,minmax(2.25rem,2.25rem))] sm:grid-cols-[repeat(auto-fit,minmax(2.5rem,2.5rem))] justify-start gap-2 sm:gap-3 pb-2 min-w-0 max-w-full overflow-x-hidden">
                ${eligibleRibbons.map(ribbon => {
              const isEarned = ribbon.isOptionalExtra
                ? entry.optionalRibbons.includes(ribbon.id)
                : ribbon.isAutomated
                  ? ribbon.isEarned
                  : entry.collectedRibbons.includes(ribbon.id);
              const isMemoryRibbon = ribbon.id === 'gen6_contest_memory' || ribbon.id === 'gen6_battle_memory';
              const iconClass = isMemoryRibbon && ribbon.isGold ? 'fa-award text-yellow-500 animate-pulse' : 'fa-ribbon';
              const ribbonImageUrl = ribbon.isOptionalExtra ? ribbonImageMap[ribbon.imageKey] : getRibbonImageUrl(ribbon);
              return `
                    <div 
                      data-ribbon-id="${ribbon.id}"
                      data-category="${genCategory.replace(/"/g, '&quot;')}"
                      ${ribbon.isAutomated ? 'data-automated="true"' : ''}
                      ${ribbon.isOptionalExtra ? 'data-optional="true"' : ''}
                      ${ribbon.isAutomated ? '' : ribbon.isOptionalExtra ? `onclick="window.toggleOptionalRibbon(${idx}, '${ribbon.id}')"` : `onclick="window.toggleRibbon(${idx}, '${ribbon.id}', '${genCategory.replace(/'/g, "\\'")}')"`}
                      ontouchstart="window.showRibbonTooltip(this, '${ribbon.name.replace(/'/g, "\\'")}', '${ribbon.description.replace(/'/g, "\\'")}', true)"
                      onmouseenter="window.showRibbonTooltip(this, '${ribbon.name.replace(/'/g, "\\'")}', '${ribbon.description.replace(/'/g, "\\'")}')"
                      onmouseleave="window.hideRibbonTooltip()"
                      class="ribbon-card-item relative w-9 h-9 sm:w-10 sm:h-10 rounded shadow-sm border ${isEarned ? 'border-yellow-400 bg-yellow-50 dark:border-yellow-500/50 dark:bg-yellow-900/30' : 'border-gray-200 bg-white opacity-50 hover:opacity-80 dark:border-gray-700 dark:bg-gray-800 dark:opacity-40'} flex items-center justify-center transition-all ${ribbon.isAutomated ? 'cursor-default' : 'cursor-pointer'} ${ribbon.isHidden ? 'hidden' : ''}"
                    >
                      ${ribbonImageUrl
                  ? `<img src="${ribbonImageUrl}" alt="${ribbon.name}" class="w-7 h-7 sm:w-8 sm:h-8 object-contain ${isEarned ? '' : 'grayscale'}">`
                  : `<i class="fas ${iconClass} ${isEarned ? 'text-[#ef4444] dark:text-red-300 drop-shadow-sm' : 'text-gray-400 dark:text-gray-500'}"></i>`}
                    </div>
                  `;
            }).join('')}
              </div>
            </div>
            `;
          }).join('')}
          </div>
        </details>
      `;
    }).join('');
    categoryBulkSelectionByEntry[idx] = categoryBulkSelection;

    const isAlreadyOpen = detailView.classList.contains('is-visible') && !isDifferentEntry;
    if (!isAlreadyOpen) {
      closeNavbarOverlays();
      document.body.classList.add('overflow-hidden', 'ribbon-modal-open');
      detailView.classList.remove('hidden');
      detailView.classList.add('flex');
      requestAnimationFrame(() => {
        detailView.classList.add('is-visible');
        detailPanel.classList.add('is-visible');
      });
    }
  };

  const updateSingleRibbonElement = (ribbonEl, isEarned) => {
    if (!ribbonEl) return;
    const earnedClasses = ['border-yellow-400', 'bg-yellow-50', 'dark:border-yellow-500/50', 'dark:bg-yellow-900/30'];
    const unearnedClasses = ['border-gray-200', 'bg-white', 'opacity-50', 'hover:opacity-80', 'dark:border-gray-700', 'dark:bg-gray-800', 'dark:opacity-40'];

    if (isEarned) {
      ribbonEl.classList.remove(...unearnedClasses);
      ribbonEl.classList.add(...earnedClasses);
    } else {
      ribbonEl.classList.remove(...earnedClasses);
      ribbonEl.classList.add(...unearnedClasses);
    }

    const img = ribbonEl.querySelector('img');
    if (img) {
      if (isEarned) {
        img.classList.remove('grayscale');
      } else {
        img.classList.add('grayscale');
      }
    }

    const icon = ribbonEl.querySelector('i');
    if (icon) {
      if (isEarned) {
        icon.classList.remove('text-gray-400', 'dark:text-gray-500');
        icon.classList.add('text-[#ef4444]', 'dark:text-red-300', 'drop-shadow-sm');
      } else {
        icon.classList.remove('text-[#ef4444]', 'dark:text-red-300', 'drop-shadow-sm');
        icon.classList.add('text-gray-400', 'dark:text-gray-500');
      }
    }
  };

  const getManualDoneButtonHtml = (entryIdx, genCategory, isManualDone) => `
    <button
      onclick="event.stopPropagation(); window.toggleManualCategoryComplete(${entryIdx}, '${genCategory.replace(/'/g, "\\'")}')"
      class="category-manual-done-btn inline-flex items-center gap-1 px-2 py-0.5 h-[18px] leading-none text-[9px] font-black whitespace-nowrap rounded-full ${isManualDone ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900/70' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'} transition-colors cursor-pointer"
      title="${isManualDone ? 'Click to unmark manual completion' : 'Manually mark this generation as completed (all generation-exclusive ribbons collected)'}"
    >
      <i class="fas ${isManualDone ? 'fa-check-circle text-emerald-500' : 'fa-check'} text-[8px]"></i>
      ${isManualDone ? 'Done' : 'Mark Done'}
    </button>
  `;

  const getCategoryCompletionState = (entryIdx, genCategory) => {
    const entry = entries[entryIdx];
    if (!entry) return null;
    const pokemonState = getPokemonStateFromEntry(entry);
    const gridContainer = document.getElementById('ribbon-grid-container');
    const categoryEl = gridContainer?.querySelector(`details[data-category="${CSS.escape(genCategory)}"]`);
    if (!categoryEl) return null;

    const isOptionalExtras = genCategory === 'Optional Extras';
    const isGenerationCategory = genCategory.startsWith('Generation ');
    const isGen3 = genCategory === 'Generation 3';
    const genNum = isGenerationCategory ? parseInt(genCategory.replace('Generation ', ''), 10) : null;

    const bulkData = categoryBulkSelectionByEntry?.[entryIdx]?.[genCategory];
    const standardIds = bulkData?.standardRibbonIds || [];
    const optionalIds = bulkData?.optionalRibbonIds || [];
    const totalSelectable = standardIds.length + optionalIds.length;
    const earnedStandard = standardIds.filter(id => entry.collectedRibbons.includes(id)).length;
    const earnedOptional = optionalIds.filter(id => (entry.optionalRibbons || []).includes(id)).length;
    const allSelectableEarned = totalSelectable > 0 && (earnedStandard + earnedOptional) === totalSelectable;

    const ribbonItems = categoryEl.querySelectorAll('.ribbon-card-item');
    let totalInGen = 0;
    let earnedInGen = 0;
    const uncollectedMissableIds = [];

    ribbonItems.forEach(item => {
      const id = item.dataset.ribbonId;
      const isAutomated = item.dataset.automated === 'true';
      const isOpt = item.dataset.optional === 'true';
      const isHidden = item.classList.contains('hidden');

      if (isHidden) return;

      if (!isOpt) {
        totalInGen++;
        const isCollected = entry.collectedRibbons.includes(id);
        if (isAutomated) {
          earnedInGen++;
        } else if (isCollected) {
          earnedInGen++;
        }

        if (!isAutomated && isGenerationCategory) {
          const r = RIBBONS.find(rb => rb.id === id);
          if (r) {
            let isMissable = true;
            if (r.isRecurring) {
              const appearances = getRecurringRibbonAppearances(r, pokemonState);
              isMissable = !appearances.some(app => app.gen > genNum);
            }
            if (isMissable && !isCollected) {
              uncollectedMissableIds.push(id);
            }
          }
        }
      }
    });

    const isNaturallyCompleted = isOptionalExtras
      ? (totalSelectable > 0 && allSelectableEarned)
      : (totalInGen > 0 && earnedInGen > 0 && earnedInGen === totalInGen);

    const allMissableCollected = isGenerationCategory && uncollectedMissableIds.length === 0;
    const canMarkDone = isGenerationCategory && !isGen3 && allMissableCollected;
    const isManualDone = canMarkDone && Array.isArray(entry.manualCompletedGens) && entry.manualCompletedGens.includes(genCategory);
    const isCompleted = isNaturallyCompleted || isManualDone;

    return {
      categoryEl,
      isOptionalExtras,
      isGenerationCategory,
      totalInGen,
      earnedInGen,
      totalSelectable,
      allSelectableEarned,
      isNaturallyCompleted,
      canMarkDone,
      isManualDone,
      isCompleted
    };
  };

  const updateCategoryHeaderState = (entryIdx, genCategory) => {
    const state = getCategoryCompletionState(entryIdx, genCategory);
    if (!state) return;
    const { categoryEl, isOptionalExtras, totalInGen, earnedInGen, allSelectableEarned, isCompleted, canMarkDone, isNaturallyCompleted, isManualDone } = state;
    const entry = entries[entryIdx];

    const wasCompleted = categoryEl.dataset.completed === 'true';
    categoryEl.dataset.completed = isCompleted ? 'true' : 'false';

    const earnedCountEl = categoryEl.querySelector('.category-earned-count');
    if (earnedCountEl) {
      earnedCountEl.textContent = earnedInGen;
      if (earnedInGen === totalInGen && totalInGen > 0) {
        earnedCountEl.classList.remove('text-gray-500', 'dark:text-gray-400');
        earnedCountEl.classList.add('text-green-500');
      } else {
        earnedCountEl.classList.remove('text-green-500');
        earnedCountEl.classList.add('text-gray-500', 'dark:text-gray-400');
      }
    }

    const totalCountEl = categoryEl.querySelector('.category-total-count');
    if (totalCountEl) {
      totalCountEl.textContent = totalInGen;
    }

    const bulkBtn = categoryEl.querySelector('.category-bulk-btn');
    if (bulkBtn) {
      bulkBtn.textContent = allSelectableEarned ? 'Deselect All' : 'Select All';
    }

    const checkEl = categoryEl.querySelector('.category-completed-check');
    if (checkEl) {
      if (isCompleted && !isOptionalExtras) {
        checkEl.classList.remove('hidden');
      } else {
        checkEl.classList.add('hidden');
      }
    }

    const manualDoneContainer = categoryEl.querySelector('.category-manual-done-container');
    if (manualDoneContainer) {
      if (canMarkDone && !isNaturallyCompleted) {
        manualDoneContainer.innerHTML = getManualDoneButtonHtml(entryIdx, genCategory, isManualDone);
      } else {
        manualDoneContainer.innerHTML = '';
      }
    }

    const warningBox = categoryEl.querySelector('.generation-warning-box');
    if (warningBox) {
      warningBox.outerHTML = getGenerationWarningHtml(genCategory, entry, isCompleted);
    }

    if (genCategory === 'Recurring Ribbons') {
      const recurringWarningBox = categoryEl.querySelector('.recurring-warning-box');
      if (recurringWarningBox) {
        // Re-derive eligible recurring ribbons from RIBBONS data (matches the new filter in getRecurringRibbonsWarningHtml)
        const eligibleRecurring = RIBBONS.filter(r =>
          r.isRecurring &&
          r.id !== 'gen3_effort' &&
          Array.isArray(r.versionGroups) &&
          !r.versionGroups.includes('sword-shield') &&
          !r.versionGroups.includes('scarlet-violet')
        );
        recurringWarningBox.outerHTML = getRecurringRibbonsWarningHtml(entry, eligibleRecurring, isCompleted);
      }
    }

    if (isCompleted && !wasCompleted) {
      categoryEl.open = false;
    } else if (!isCompleted && wasCompleted) {
      categoryEl.open = true;
    }
  };

  const updateBackgroundCardProgress = (entryIdx) => {
    const entry = entries[entryIdx];
    if (!entry) return;
    const stats = getEntryProgressStats(entry);
    const card = document.querySelector(`.ribbon-entry-card[data-entry-idx="${entryIdx}"]`);
    if (card) {
      const countEl = card.querySelector('.ribbon-card-count');
      if (countEl) {
        countEl.textContent = `${stats.collectedCount} / ${stats.eligibleCount}`;
        if (stats.isMaster) {
          countEl.className = 'ribbon-card-count text-sm font-bold whitespace-nowrap text-amber-600 dark:text-amber-400';
        } else {
          countEl.className = 'ribbon-card-count text-sm font-bold whitespace-nowrap text-[#ef4444] dark:text-red-300';
        }
      }
    }
  };

  const updateAutomatedGen6Ribbons = (entryIdx) => {
    const entry = entries[entryIdx];
    if (!entry) return;
    const pokemonState = getPokemonStateFromEntry(entry);
    if (pokemonState.gen > 4) return; // Contest and Battle Memory only apply to Gen 3 & 4 Pokémon

    const contestRibbonIds = RIBBONS.filter(r => (r.gen === 3 || r.gen === 4) && r.name.includes('Contest')).map(r => r.id);
    const collectedContestCount = entry.collectedRibbons.filter(id => contestRibbonIds.includes(id)).length;
    const isContestGold = collectedContestCount === 40;

    const battleRibbonIds = getGen34BattleRibbonIds(pokemonState);
    const collectedBattleCount = entry.collectedRibbons.filter(id => battleRibbonIds.includes(id)).length;
    const isBattleGold = collectedBattleCount >= 7;

    const gridContainer = document.getElementById('ribbon-grid-container');
    if (!gridContainer) return;

    const gen6El = gridContainer.querySelector('details[data-category="Generation 6"]');
    if (!gen6El) return;

    // Contest Memory Ribbon
    let contestEl = gen6El.querySelector('[data-ribbon-id="gen6_contest_memory"]');
    if (collectedContestCount > 0) {
      const desc = `A Ribbon awarded to a Pokémon that has overcome many challenges in Contests in the distant past. (Contests Cleared: ${collectedContestCount}/40)`;
      const name = isContestGold ? 'Contest Memory Ribbon (Gold)' : 'Contest Memory Ribbon';
      const contestRibbonObj = { id: 'gen6_contest_memory', name, isGold: isContestGold };
      const newImgUrl = getRibbonImageUrl(contestRibbonObj);
      const iconClass = isContestGold ? 'fa-award text-yellow-500 animate-pulse' : 'fa-ribbon';

      if (contestEl) {
        contestEl.setAttribute('onmouseenter', `window.showRibbonTooltip(this, '${name.replace(/'/g, "\\'")}', '${desc.replace(/'/g, "\\'")}')`);
        contestEl.setAttribute('ontouchstart', `window.showRibbonTooltip(this, '${name.replace(/'/g, "\\'")}', '${desc.replace(/'/g, "\\'")}', true)`);
        const img = contestEl.querySelector('img');
        if (img && newImgUrl) img.src = newImgUrl;
      } else {
        const firstGrid = gen6El.querySelector('.grid');
        if (firstGrid) {
          const div = document.createElement('div');
          div.className = 'ribbon-card-item relative w-9 h-9 sm:w-10 sm:h-10 rounded shadow-sm border border-yellow-400 bg-yellow-50 dark:border-yellow-500/50 dark:bg-yellow-900/30 flex items-center justify-center transition-all cursor-default';
          div.setAttribute('data-ribbon-id', 'gen6_contest_memory');
          div.setAttribute('data-category', 'Generation 6');
          div.setAttribute('data-automated', 'true');
          div.setAttribute('onmouseenter', `window.showRibbonTooltip(this, '${name.replace(/'/g, "\\'")}', '${desc.replace(/'/g, "\\'")}')`);
          div.setAttribute('ontouchstart', `window.showRibbonTooltip(this, '${name.replace(/'/g, "\\'")}', '${desc.replace(/'/g, "\\'")}', true)`);
          div.setAttribute('onmouseleave', 'window.hideRibbonTooltip()');
          div.innerHTML = newImgUrl
            ? `<img src="${newImgUrl}" alt="${name}" class="w-7 h-7 sm:w-8 sm:h-8 object-contain">`
            : `<i class="fas ${iconClass} text-[#ef4444] dark:text-red-300 drop-shadow-sm"></i>`;
          firstGrid.prepend(div);
        }
      }
    } else if (contestEl) {
      contestEl.remove();
    }

    // Battle Memory Ribbon
    let battleEl = gen6El.querySelector('[data-ribbon-id="gen6_battle_memory"]');
    if (collectedBattleCount > 0) {
      const desc = `A Ribbon awarded to a Pokémon that has overcome many challenges in Battle Towers in the distant past. (Battle Ribbons: ${collectedBattleCount}/8)`;
      const name = isBattleGold ? 'Battle Memory Ribbon (Gold)' : 'Battle Memory Ribbon';
      const battleRibbonObj = { id: 'gen6_battle_memory', name, isGold: isBattleGold };
      const newImgUrl = getRibbonImageUrl(battleRibbonObj);
      const iconClass = isBattleGold ? 'fa-award text-yellow-500 animate-pulse' : 'fa-ribbon';

      if (battleEl) {
        battleEl.setAttribute('onmouseenter', `window.showRibbonTooltip(this, '${name.replace(/'/g, "\\'")}', '${desc.replace(/'/g, "\\'")}')`);
        battleEl.setAttribute('ontouchstart', `window.showRibbonTooltip(this, '${name.replace(/'/g, "\\'")}', '${desc.replace(/'/g, "\\'")}', true)`);
        const img = battleEl.querySelector('img');
        if (img && newImgUrl) img.src = newImgUrl;
      } else {
        const firstGrid = gen6El.querySelector('.grid');
        if (firstGrid) {
          const div = document.createElement('div');
          div.className = 'ribbon-card-item relative w-9 h-9 sm:w-10 sm:h-10 rounded shadow-sm border border-yellow-400 bg-yellow-50 dark:border-yellow-500/50 dark:bg-yellow-900/30 flex items-center justify-center transition-all cursor-default';
          div.setAttribute('data-ribbon-id', 'gen6_battle_memory');
          div.setAttribute('data-category', 'Generation 6');
          div.setAttribute('data-automated', 'true');
          div.setAttribute('onmouseenter', `window.showRibbonTooltip(this, '${name.replace(/'/g, "\\'")}', '${desc.replace(/'/g, "\\'")}')`);
          div.setAttribute('ontouchstart', `window.showRibbonTooltip(this, '${name.replace(/'/g, "\\'")}', '${desc.replace(/'/g, "\\'")}', true)`);
          div.setAttribute('onmouseleave', 'window.hideRibbonTooltip()');
          div.innerHTML = newImgUrl
            ? `<img src="${newImgUrl}" alt="${name}" class="w-7 h-7 sm:w-8 sm:h-8 object-contain">`
            : `<i class="fas ${iconClass} text-[#ef4444] dark:text-red-300 drop-shadow-sm"></i>`;
          firstGrid.prepend(div);
        }
      }
    } else if (battleEl) {
      battleEl.remove();
    }

    updateCategoryHeaderState(entryIdx, 'Generation 6');
  };

  const closeRibbonDetail = () => {
    const detailView = document.getElementById('ribbon-detail-view');
    const detailPanel = detailView.querySelector('.ribbon-detail-panel');

    currentDetailEntryIdx = null;
    window.hideRibbonTooltip();
    detailView.classList.remove('is-visible');
    detailPanel.classList.remove('is-visible');
    document.body.classList.remove('overflow-hidden', 'ribbon-modal-open');

    window.setTimeout(() => {
      detailView.classList.add('hidden');
      detailView.classList.remove('flex');
      renderEntriesList();
    }, 220);
  };

  window.toggleRibbon = (entryIdx, ribbonId, genCategoryOrNum) => {
    window.hideRibbonTooltip();
    const entry = entries[entryIdx];
    if (!entry) return;

    if (!Array.isArray(entry.collectedRibbons)) {
      entry.collectedRibbons = [];
    }
    if (!entry.ribbonEarnedInGen || typeof entry.ribbonEarnedInGen !== 'object') {
      entry.ribbonEarnedInGen = {};
    }

    const rbIdx = entry.collectedRibbons.indexOf(ribbonId);
    const isNowEarned = rbIdx === -1;
    let earnedGen = null;
    if (isNowEarned) {
      entry.collectedRibbons.push(ribbonId);
      if (genCategoryOrNum) {
        earnedGen = typeof genCategoryOrNum === 'number'
          ? genCategoryOrNum
          : parseInt(String(genCategoryOrNum).replace(/\D/g, ''), 10);
        if (earnedGen) {
          entry.ribbonEarnedInGen[ribbonId] = earnedGen;
        }
      }
    } else {
      entry.collectedRibbons.splice(rbIdx, 1);
      delete entry.ribbonEarnedInGen[ribbonId];
    }
    saveEntries(entry.id);

    // Targeted update — find all instances of this ribbon in DOM
    const gridContainer = document.getElementById('ribbon-grid-container');
    const ribbonCards = gridContainer ? gridContainer.querySelectorAll(`[data-ribbon-id="${CSS.escape(ribbonId)}"]`) : [];
    const touchedCategories = new Set();

    ribbonCards.forEach(card => {
      const cardCat = card.dataset.category;
      if (cardCat) touchedCategories.add(cardCat);

      const isSameCategory = genCategoryOrNum && (
        cardCat === genCategoryOrNum ||
        (typeof genCategoryOrNum === 'number' && cardCat === `Generation ${genCategoryOrNum}`)
      );

      if (isNowEarned) {
        if (isSameCategory || ribbonCards.length === 1) {
          updateSingleRibbonElement(card, true);
          card.classList.remove('hidden');
        } else {
          updateSingleRibbonElement(card, false);
          card.classList.add('hidden');
        }
      } else {
        updateSingleRibbonElement(card, false);
        card.classList.remove('hidden');
      }
    });

    const primaryCat = typeof genCategoryOrNum === 'string' && genCategoryOrNum.startsWith('Generation ')
      ? genCategoryOrNum
      : (typeof genCategoryOrNum === 'string' && (genCategoryOrNum === 'Marks' || genCategoryOrNum === 'Optional Extras' || genCategoryOrNum === 'Recurring Ribbons')
        ? genCategoryOrNum
        : (genCategoryOrNum ? `Generation ${typeof genCategoryOrNum === 'number' ? genCategoryOrNum : parseInt(String(genCategoryOrNum).replace(/\D/g, ''), 10)}` : null));
    if (primaryCat) touchedCategories.add(primaryCat);

    touchedCategories.forEach(cat => updateCategoryHeaderState(entryIdx, cat));

    // Update memory ribbons ONLY if a Gen 3/4 contest or battle ribbon changed
    const r = RIBBONS.find(rb => rb.id === ribbonId);
    if (r && (((r.gen === 3 || r.gen === 4) && r.name.includes('Contest')) || isGen34BattleRibbon(r))) {
      updateAutomatedGen6Ribbons(entryIdx);
    }

    updateBackgroundCardProgress(entryIdx);
  };

  window.toggleCategoryRibbons = (entryIdx, genCategory) => {
    window.hideRibbonTooltip();
    const entry = entries[entryIdx];
    if (!entry) return;

    const selection = categoryBulkSelectionByEntry?.[entryIdx]?.[genCategory];
    if (!selection) return;

    const standardRibbonIds = Array.isArray(selection.standardRibbonIds) ? selection.standardRibbonIds : [];
    const optionalRibbonIds = Array.isArray(selection.optionalRibbonIds) ? selection.optionalRibbonIds : [];

    if (!Array.isArray(entry.collectedRibbons)) {
      entry.collectedRibbons = [];
    }
    if (!Array.isArray(entry.optionalRibbons)) {
      entry.optionalRibbons = [];
    }
    if (!entry.ribbonEarnedInGen || typeof entry.ribbonEarnedInGen !== 'object') {
      entry.ribbonEarnedInGen = {};
    }

    const hasAllStandard = standardRibbonIds.every(id => entry.collectedRibbons.includes(id));
    const hasAllOptional = optionalRibbonIds.every(id => entry.optionalRibbons.includes(id));
    const hasAllSelected = (standardRibbonIds.length + optionalRibbonIds.length) > 0
      && hasAllStandard
      && hasAllOptional;

    const genNum = parseInt(String(genCategory).replace(/\D/g, ''), 10);

    if (hasAllSelected) {
      const standardRibbonIdSet = new Set(standardRibbonIds);
      const optionalRibbonIdSet = new Set(optionalRibbonIds);
      entry.collectedRibbons = entry.collectedRibbons.filter(id => !standardRibbonIdSet.has(id));
      entry.optionalRibbons = entry.optionalRibbons.filter(id => !optionalRibbonIdSet.has(id));
      standardRibbonIds.forEach(id => {
        delete entry.ribbonEarnedInGen[id];
      });
    } else {
      const collectedRibbonSet = new Set(entry.collectedRibbons);
      const optionalRibbonSet = new Set(entry.optionalRibbons);

      standardRibbonIds.forEach(id => {
        if (!collectedRibbonSet.has(id)) {
          entry.collectedRibbons.push(id);
          collectedRibbonSet.add(id);
        }
        if (genNum) {
          entry.ribbonEarnedInGen[id] = genNum;
        }
      });

      optionalRibbonIds.forEach(id => {
        if (!optionalRibbonSet.has(id)) {
          entry.optionalRibbons.push(id);
          optionalRibbonSet.add(id);
        }
      });
    }

    saveEntries(entry.id);

    // Targeted update for bulk toggle — update each affected ribbon element across all appearances
    const gridContainer = document.getElementById('ribbon-grid-container');
    const touchedCategories = new Set([genCategory]);

    [...standardRibbonIds, ...optionalRibbonIds].forEach(id => {
      const cards = gridContainer ? gridContainer.querySelectorAll(`[data-ribbon-id="${CSS.escape(id)}"]`) : [];
      const isOpt = cards[0]?.dataset.optional === 'true';
      const isNowEarned = isOpt ? entry.optionalRibbons.includes(id) : entry.collectedRibbons.includes(id);

      cards.forEach(card => {
        const cardCat = card.dataset.category;
        if (cardCat) touchedCategories.add(cardCat);

        if (isNowEarned) {
          if (cardCat === genCategory || cards.length === 1) {
            updateSingleRibbonElement(card, true);
            card.classList.remove('hidden');
          } else {
            updateSingleRibbonElement(card, false);
            card.classList.add('hidden');
          }
        } else {
          updateSingleRibbonElement(card, false);
          card.classList.remove('hidden');
        }
      });
    });

    touchedCategories.forEach(cat => updateCategoryHeaderState(entryIdx, cat));

    if (genCategory === 'Generation 3' || genCategory === 'Generation 4') {
      updateAutomatedGen6Ribbons(entryIdx);
    }
    updateBackgroundCardProgress(entryIdx);
  };

  window.toggleOptionalRibbon = (entryIdx, ribbonId) => {
    window.hideRibbonTooltip();
    const entry = entries[entryIdx];
    if (!entry) return;
    if (!Array.isArray(entry.optionalRibbons)) {
      entry.optionalRibbons = [];
    }

    const ribbonIndex = entry.optionalRibbons.indexOf(ribbonId);
    const isNowEarned = ribbonIndex === -1;
    if (isNowEarned) {
      entry.optionalRibbons.push(ribbonId);
    } else {
      entry.optionalRibbons.splice(ribbonIndex, 1);
    }
    saveEntries(entry.id);

    // Targeted update — no full re-render
    const gridContainer = document.getElementById('ribbon-grid-container');
    const ribbonCards = gridContainer ? gridContainer.querySelectorAll(`[data-ribbon-id="${CSS.escape(ribbonId)}"]`) : [];
    ribbonCards.forEach(card => {
      updateSingleRibbonElement(card, isNowEarned);
      const cat = card.dataset.category;
      if (cat) updateCategoryHeaderState(entryIdx, cat);
    });
  };

  window.toggleManualCategoryComplete = (entryIdx, genCategory) => {
    window.hideRibbonTooltip();
    const entry = entries[entryIdx];
    if (!entry) return;

    if (!Array.isArray(entry.manualCompletedGens)) {
      entry.manualCompletedGens = [];
    }

    const idxInArray = entry.manualCompletedGens.indexOf(genCategory);
    const gridContainer = document.getElementById('ribbon-grid-container');
    const detailsEl = gridContainer?.querySelector(`details[data-category="${CSS.escape(genCategory)}"]`);

    if (idxInArray > -1) {
      entry.manualCompletedGens.splice(idxInArray, 1);
      if (detailsEl) {
        detailsEl.dataset.completed = 'false';
        detailsEl.open = true;
      }
    } else {
      entry.manualCompletedGens.push(genCategory);
      if (detailsEl) {
        detailsEl.dataset.completed = 'true';
        detailsEl.open = false;
      }
    }

    saveEntries(entry.id);
    updateCategoryHeaderState(entryIdx, genCategory);
  };

  window.toggleEntryShiny = (idx) => {
    entries[idx].isShiny = !entries[idx].isShiny;
    saveEntries(entries[idx].id);
    window.openRibbonDetail(idx);
    renderEntriesList();
  };

  window.toggleMythicalRanked = (entryIdx, isAllowed) => {
    const entry = entries[entryIdx];
    if (!entry) return;

    entry.allowMythicalRanked = Boolean(isAllowed);
    saveEntries(entry.id);
    openRibbonDetail(entryIdx);
    renderEntriesList();
  };

  window.updateEntryNickname = window.saveNickname = (idx) => {
    const input = document.getElementById('nickname-edit-input');
    const newName = input.value.trim() || entries[idx].speciesName;
    entries[idx].nickname = newName;
    saveEntries(entries[idx].id);
    renderEntriesList();
    window.openRibbonDetail(idx);
  };

  /**
   * Opens the species selection dropdown in the detail view.
   * @param {number} idx - Index of the entry to edit.
   */
  window.openSpeciesEdit = async (idx) => {
    const entry = entries[idx];
    const nameContainer = document.getElementById('detail-name-container');
    const pokemonList = await getPokemonListUpToGeneration(9);

    // Save current original content to restore on cancel/blur
    const originalContent = nameContainer.innerHTML;

    nameContainer.innerHTML = `
      <div class="w-full flex flex-col gap-2">
        <div class="w-full flex items-center gap-2 min-w-0">
          <div class="flex-1 min-w-0">
            ${getSearchableDropdownHtml('detail-species-dropdown', null, 'Search Pokemon...')}
          </div>
          <button id="edit-shiny-toggle-btn" class="shrink-0 inline-flex items-center gap-1 !px-2.5 !py-2 !text-[10px] !font-black !rounded-lg transition-all shadow-sm active:scale-95 uppercase tracking-[0.1em] ${entry.isShiny ? 'bg-yellow-50 border border-yellow-700 text-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-700/50 dark:text-yellow-400' : 'bg-gray-100 border border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}">
            <i class="fas fa-star"></i>
            <span>Shiny</span>
          </button>
        </div>
        <div class="flex items-center gap-3 mt-2">
          <button id="confirm-species-btn" class="!px-3 !py-1 !text-[10px] !font-black !rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-black dark:text-white transition-all shadow-sm active:scale-95 uppercase tracking-wider">CONFIRM</button>
          <button id="cancel-species-btn" class="!px-3 !py-1 !text-[10px] !font-black !rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase tracking-wider">CANCEL</button>
        </div>
      </div>
    `;

    let tempSelectedSpecies = null;
    const dropdown = setupSearchableDropdown('detail-species-dropdown', pokemonList, (p) => {
      tempSelectedSpecies = p;
    }, 'Select Pokemon');

    // Pre-select current species
    const currentSpecies = pokemonList.find(p => p.id === entry.speciesId);
    if (currentSpecies) dropdown.setSelected(currentSpecies);

    const cancelBtn = document.getElementById('cancel-species-btn');
    const confirmBtn = document.getElementById('confirm-species-btn');
    const editShinyBtn = document.getElementById('edit-shiny-toggle-btn');
    const detailSprite = document.getElementById('detail-species-sprite');
    const detailSpriteWrap = document.getElementById('detail-species-sprite-wrap');
    const detailShinyBadge = document.getElementById('detail-species-shiny-badge');

    const applyEditShinyButtonState = () => {
      const enabledClasses = ['bg-yellow-50', 'border-yellow-700', 'text-yellow-500', 'dark:bg-yellow-900/20', 'dark:border-yellow-700/50', 'dark:text-yellow-400'];
      const disabledClasses = ['bg-gray-100', 'border-gray-200', 'text-gray-500', 'dark:bg-gray-800', 'dark:border-gray-700', 'dark:text-gray-300'];
      editShinyBtn.classList.remove(...enabledClasses, ...disabledClasses);
      editShinyBtn.classList.add(...(entry.isShiny ? enabledClasses : disabledClasses));
    };

    applyEditShinyButtonState();

    editShinyBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      entry.isShiny = !entry.isShiny;
      await saveEntries(entry.id);
      renderEntriesList();
      applyEditShinyButtonState();

      if (detailSprite) {
        detailSprite.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.isShiny ? 'shiny/' : ''}${entry.speciesId}.png`;
      }

      if (detailShinyBadge) {
        detailShinyBadge.classList.toggle('hidden', !entry.isShiny);
      }

      if (detailSpriteWrap) {
        detailSpriteWrap.classList.remove('border-yellow-200', 'dark:border-yellow-900/50', 'border-gray-100', 'dark:border-gray-700');
        if (entry.isShiny) {
          detailSpriteWrap.classList.add('border-yellow-200', 'dark:border-yellow-900/50');
        } else {
          detailSpriteWrap.classList.add('border-gray-100', 'dark:border-gray-700');
        }
      }
    };

    cancelBtn.onclick = (e) => {
      e.stopPropagation();
      nameContainer.innerHTML = originalContent;
    };

    confirmBtn.onclick = async (e) => {
      e.stopPropagation();
      if (!tempSelectedSpecies) {
        nameContainer.innerHTML = originalContent;
        return;
      }

      // Show loading state if re-fetching availability
      confirmBtn.innerText = 'FETCHING...';
      confirmBtn.disabled = true;

      const oldSpeciesName = entry.speciesName;
      entry.speciesId = tempSelectedSpecies.id;
      entry.speciesName = tempSelectedSpecies.displayName;
      entry.isMythical = isKnownMythicalPokemonId(entry.speciesId);
      entry.isLegendary = isKnownLegendaryPokemonId(entry.speciesId);

      // If nickname was the old species name, update it to the new one
      if (entry.nickname === oldSpeciesName) {
        entry.nickname = entry.speciesName;
      }

      // Re-fetch availability for the new species
      const [availability, speciesFlags] = await Promise.all([
        getPokemonGameAvailability(entry.speciesId),
        getPokemonSpeciesFlags(entry.speciesId)
      ]);
      // Ensure origin game's version groups are always included, regardless of PokeAPI data
      entry.availableGames = [...mergeAvailableGames(availability, entry.originGameId)];
      entry.isMythical = speciesFlags.isMythical;
      entry.isLegendary = speciesFlags.isLegendary;

      saveEntries(entry.id);
      renderEntriesList();
      window.openRibbonDetail(idx);
    };
  };

  window.updateEntryOriginGame = (idx, newGameId) => {
    const game = ORIGIN_GAMES.find(g => g.id === newGameId);
    if (game) {
      entries[idx].originGameId = newGameId;
      entries[idx].originGen = game.gen;
      saveEntries(entries[idx].id);
      window.openRibbonDetail(idx); // Full refresh to update eligibility
      renderEntriesList();
    }
  };

  const smartTooltip = document.getElementById('smart-tooltip');
  const tooltipTitle = document.getElementById('smart-tooltip-title');
  const tooltipDesc = document.getElementById('smart-tooltip-desc');
  const tooltipArrow = smartTooltip.querySelector('.absolute');

  window.showRibbonTooltip = (el, title, desc, forceAutoHide = false) => {
    if (tooltipTimeoutId) {
      clearTimeout(tooltipTimeoutId);
      tooltipTimeoutId = null;
    }

    const rect = el.getBoundingClientRect();
    tooltipTitle.textContent = title;
    tooltipDesc.textContent = desc;

    const tooltipWidth = 192; // match w-48
    const viewportWidth = window.innerWidth;
    const padding = 16;

    // Ideal center position
    let x = rect.left + rect.width / 2;
    const y = rect.top - 8;

    // Constrain to viewport
    let finalX = x;
    if (x - tooltipWidth / 2 < padding) {
      finalX = tooltipWidth / 2 + padding;
    } else if (x + tooltipWidth / 2 > viewportWidth - padding) {
      finalX = viewportWidth - tooltipWidth / 2 - padding;
    }

    smartTooltip.style.left = `${finalX}px`;
    smartTooltip.style.top = `${y}px`;
    smartTooltip.style.transform = `translate(-50%, -100%)`;

    // Adjust arrow to stay over the ribbon
    const arrowOffset = x - finalX;
    tooltipArrow.style.left = `calc(50% + ${arrowOffset}px)`;

    smartTooltip.style.opacity = '1';
    smartTooltip.style.visibility = 'visible';

    const shouldAutoHide = forceAutoHide || window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (shouldAutoHide) {
      tooltipTimeoutId = window.setTimeout(() => {
        window.hideRibbonTooltip();
      }, 3000);
    }
  };

  window.hideRibbonTooltip = () => {
    if (tooltipTimeoutId) {
      clearTimeout(tooltipTimeoutId);
      tooltipTimeoutId = null;
    }
    smartTooltip.style.opacity = '0';
    smartTooltip.style.visibility = 'hidden';
  };

  const originGameSelect = document.getElementById('origin-game');
  const nicknameInput = document.getElementById('pokemon-nickname');
  const isShinyCheckbox = document.getElementById('is-shiny-checkbox');
  const addButton = document.getElementById('add-entry');

  // Disable Add Button until a Pokemon and Origin Game are selected
  const validateForm = () => {
    addButton.disabled = !selectedSpecies || !originGameSelect.value;
  };

  // No need to re-initialize here, we'll use the variable from above
  originGameSelect.addEventListener('change', () => {
    validateForm();
  });

  addButton.addEventListener('click', async () => {
    if (!selectedSpecies || !originGameSelect.value || isFetchingAvailability) return;

    const selectedPokemonId = selectedSpecies.id;
    const selectedPokemonName = selectedSpecies.displayName;
    const selectedOriginId = originGameSelect.value;
    const nickname = nicknameInput.value.trim() || selectedPokemonName;
    const isShiny = isShinyCheckbox.checked;

    // Prevent double clicking
    isFetchingAvailability = true;
    addButton.disabled = true;
    const originalText = addButton.innerHTML;
    addButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Adding...';

    try {
      // Fetch specific game availability for this Pokemon from PokeAPI
      // Used to determine if the Pokemon can even enter Gen 8/9 games for those ribbons
      const [availableGames, speciesFlags] = await Promise.all([
        getPokemonGameAvailability(selectedPokemonId),
        getPokemonSpeciesFlags(selectedPokemonId)
      ]);

      const newEntry = {
        id: Date.now().toString(),
        speciesId: selectedPokemonId,
        speciesName: selectedPokemonName,
        nickname: nickname,
        isShiny: isShiny,
        originGameId: selectedOriginId,
        originGen: ORIGIN_GAMES.find(g => g.id === selectedOriginId)?.gen || 1,
        isMythical: speciesFlags.isMythical,
        isLegendary: speciesFlags.isLegendary,
        allowMythicalRanked: false,
        collectedRibbons: [],
        optionalRibbons: [],
        availableGames: [...mergeAvailableGames(availableGames, selectedOriginId)], // Always include origin game
        lastUpdated: new Date().toISOString()
      };

      entries.unshift(newEntry);
      saveEntries(newEntry.id);
      renderEntriesList();

      // Reset form
      selectedSpecies = null;
      pokemonDropdown.setSelected(null); // Clear the dropdown display

      nicknameInput.value = '';
      isShinyCheckbox.checked = false;
      // We keep the originGameSelect value for batch adding (user requested better UX)
      validateForm();
    } catch (error) {
      console.error("Failed to add Pokemon", error);
      alert("Failed to fetch Pokemon data. Please try again.");
    } finally {
      isFetchingAvailability = false;
      addButton.innerHTML = originalText;
      validateForm(); // Re-validation
    }
  });

  // --- Event Listeners ---
  const sortSelect = document.getElementById('ribbon-sort-select');
  if (sortSelect) {
    sortSelect.value = currentSort;
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      localStorage.setItem('ribbon_sort_option', currentSort);
      renderEntriesList();
    });
  }

  document.getElementById('close-detail').onclick = () => {
    closeRibbonDetail();
  };

  // Close on outside click for detail view
  document.getElementById('ribbon-detail-view').onclick = (e) => {
    if (e.target.id === 'ribbon-detail-view') {
      closeRibbonDetail();
    }
  };

  renderEntriesList();
}
