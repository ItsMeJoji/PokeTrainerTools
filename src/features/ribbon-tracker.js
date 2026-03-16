import { getPokemonListUpToGeneration, getPokemonGameAvailability } from '../utils/pokemon-data.js';
import { setupSearchableDropdown, updateDropdownLoading, getSearchableDropdownHtml } from '../utils/ui-utils.js';
import { RIBBONS, ORIGIN_GAMES, isEligible, RIBBON_GAMES } from '../utils/ribbon-data.js';

/**
 * Initializes the Ribbon Tracker page.
 * @param {HTMLElement} appContainer - The container to render the page into.
 */
export async function initRibbonTracker(appContainer) {
  appContainer.innerHTML = `
    <div class="ribbon-tracker-page text-center max-w-4xl mx-auto px-4 pb-12">
      <h1 class="mb-6 text-4xl text-black dark:text-white font-extrabold text-shadow-lg">Ribbon Tracker</h1>
      <p class="mb-8 text-lg text-gray-500 dark:text-gray-400">Track ribbons and marks for your unique Pokémon journey.</p>

      <!-- Pokemon Entry Creator -->
      <div id="entry-creator" class="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transition-all duration-300">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
          Start a New Journey
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">What's your Pokemon's name?</label>
            <div class="flex gap-2">
              <input type="text" id="pokemon-nickname" placeholder="e.g. My Shiny Pikachu" class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
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
            <select id="origin-game" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="" disabled selected>Select a Game...</option>
              ${ORIGIN_GAMES.map(game => `<option value="${game.id}">${game.name}</option>`).join('')}
            </select>
          </div>
          <div class="flex items-end">
            <button id="add-entry" class="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-transform active:scale-95">
              Begin Journey
            </button>
          </div>
        </div>
      </div>

      <!-- Active Entries -->
      <div id="active-entries" class="space-y-6">
        <!-- Injected dynamically -->
      </div>

      <!-- Detail View (Modal-like or separate section) -->
      <div id="ribbon-detail-view" class="hidden fixed inset-0 z-50 items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
        <div class="bg-white dark:bg-gray-800 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div class="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
            <h3 id="detail-pokemon-name" class="text-xl font-bold text-gray-800 dark:text-white"></h3>
            <button id="close-detail" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div id="ribbon-grid-container" class="p-6 overflow-y-auto overflow-x-hidden flex-1">
            <!-- Ribbons will be injected here -->
          </div>
        </div>
      </div>

      <!-- Global Smart Tooltip -->
      <div id="smart-tooltip" class="fixed z-[100] pointer-events-none opacity-0 invisible transition-opacity duration-200 w-48 p-2 bg-gray-900 border border-gray-700 text-white text-xs rounded shadow-2xl text-center">
        <div id="smart-tooltip-title" class="font-bold mb-1"></div>
        <div id="smart-tooltip-desc" class="text-gray-300 text-[10px] leading-tight"></div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-b border-r border-gray-700 transform rotate-45"></div>
      </div>
    </div>
  `;

  // --- State ---
  let entries = JSON.parse(localStorage.getItem('ribbon_entries') || '[]');
  let selectedSpecies = null;
  let isFetchingAvailability = false;

  // --- Initial Data Load ---
  updateDropdownLoading('ribbon-pokemon-dropdown', "Loading Pok\u00e9mon");
  const pokemonList = await getPokemonListUpToGeneration(9);

  // Store the control object for resetting later
  let pokemonDropdown = setupSearchableDropdown('ribbon-pokemon-dropdown', pokemonList, (p) => {
    selectedSpecies = p;
    validateForm();
  });

  const saveEntries = () => {
    localStorage.setItem('ribbon_entries', JSON.stringify(entries));
  };

  // --- UI Functions ---
  const renderEntriesList = () => {
    // Migration: fix any entries that might have corrupted availableGames (Set serialized as {})
    entries.forEach(entry => {
      if (entry.availableGames && !Array.isArray(entry.availableGames)) {
        entry.availableGames = []; // Reset to empty array if corrupted
      }
    });

    const entriesList = document.getElementById('active-entries');
    if (entries.length === 0) {
      entriesList.innerHTML = `<div class="p-12 text-gray-500 dark:text-gray-400 italic">No Pokemon journeys started yet. Start one above!</div>`;
      return;
    }

    entriesList.innerHTML = entries.map((entry, idx) => `
      <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:border-blue-300 transition-all cursor-pointer group" onclick="window.openRibbonDetail(${idx})">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center border-2 ${entry.isShiny ? 'border-yellow-200 dark:border-yellow-900' : 'border-blue-100 dark:border-blue-900'} relative">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.isShiny ? 'shiny/' : ''}${entry.speciesId}.png" class="w-14 h-14 object-contain">
            ${entry.isShiny ? '<i class="fas fa-star text-[10px] text-yellow-400 absolute top-0 right-0 animate-pulse"></i>' : ''}
          </div>
          <div class="text-left">
            <h3 class="font-bold text-gray-800 dark:text-white">${entry.nickname}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              ${entry.speciesName} \u2022 ${ORIGIN_GAMES.find(g => g.id === entry.originGameId)?.name || (entry.originGen ? `Gen ${entry.originGen}` : 'Unknown')}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <div class="text-right hidden sm:block">
            ${(() => {
        const pokemonState = {
          originGameId: entry.originGameId,
          gen: parseInt(entry.originGen),
          isShadow: entry.originGameId === 'colo' || entry.originGameId === 'xd',
          availableGames: Array.isArray(entry.availableGames) ? new Set(entry.availableGames) : new Set()
        };

        // Standard eligible ribbons
        const eligibleBase = RIBBONS.filter(r => isEligible(pokemonState, r) && !r.isAutomated);
        let eligibleCount = eligibleBase.length;
        let collectedCount = entry.collectedRibbons.length;

        // Check for automated ribbons (Contest Memory)
        const contestRibbonIds = RIBBONS.filter(r => (r.gen === 3 || r.gen === 4) && r.name.includes('Contest')).map(r => r.id);
        const collectedContestCount = entry.collectedRibbons.filter(id => contestRibbonIds.includes(id)).length;
        
        if (collectedContestCount > 0) {
          eligibleCount++; // Contest Memory is eligible
          collectedCount++; // Contest Memory is earned
        }

        // Check for automated ribbons (Battle Memory)
        const battleRibbonIds = RIBBONS.filter(r => (r.gen === 3 || r.gen === 4) && (r.name.includes('Ability') || r.name.includes('Winning') || r.name.includes('Victory'))).map(r => r.id);
        const collectedBattleCount = entry.collectedRibbons.filter(id => battleRibbonIds.includes(id)).length;

        if (collectedBattleCount > 0) {
          eligibleCount++; // Battle Memory is eligible
          collectedCount++; // Battle Memory is earned
        }

        const isMaster = collectedCount > 0 && collectedCount === eligibleCount;

        return `
                <div class="flex items-center gap-2">
                  ${isMaster ? `
                    <div class="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      <i class="fas fa-crown text-[8px]"></i>
                      MASTER
                    </div>
                  ` : ''}
                  <div class="text-sm font-bold ${isMaster ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}">${collectedCount} / ${eligibleCount}</div>
                </div>
                <div class="text-[10px] uppercase tracking-wider text-gray-400">${isMaster ? 'Collection Complete' : 'Ribbons'}</div>
              `;
      })()}
          </div>
          <button onclick="event.stopPropagation(); window.deleteEntry(${idx})" class="p-2 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    `).join('');
  };

  window.deleteEntry = (idx) => {
    if (confirm('Are you sure you want to end this journey? Progress will be lost.')) {
      entries.splice(idx, 1);
      saveEntries();
      renderEntriesList();
    }
  };

  window.openRibbonDetail = (idx) => {
    const entry = entries[idx];
    const detailView = document.getElementById('ribbon-detail-view');
    const gridContainer = document.getElementById('ribbon-grid-container');
    const nameHeader = document.getElementById('detail-pokemon-name');

    nameHeader.innerHTML = `
      <div class="flex items-center gap-5 w-full">
        <div 
          onclick="window.openSpeciesEdit(${idx})"
          class="group relative w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center border-2 ${entry.isShiny ? 'border-yellow-200 dark:border-yellow-900/50' : 'border-gray-100 dark:border-gray-700'} shadow-sm shrink-0 cursor-pointer overflow-hidden transition-all hover:border-indigo-400 dark:hover:border-indigo-500"
        >
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.isShiny ? 'shiny/' : ''}${entry.speciesId}.png" class="w-14 h-14 object-contain transition-transform group-hover:scale-110">
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <i class="fas fa-pencil-alt text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md text-xs translate-y-1 group-hover:translate-y-0 duration-200"></i>
          </div>
          ${entry.isShiny ? '<i class="fas fa-star text-[8px] text-yellow-400 absolute top-1 right-1 animate-pulse"></i>' : ''}
        </div>
        
        <div class="flex flex-col flex-1 min-w-0">
          <div class="flex items-end gap-3 w-full">
            <div class="flex-1 min-w-0">
              <label class="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1 ml-1">Nickname</label>
              <div class="relative group/edit">
                <input type="text" value="${entry.nickname}" id="nickname-edit-input"
                  onblur="window.saveNickname(${idx})"
                  onkeyup="if(event.key === 'Enter') this.blur()"
                  class="bg-black/5 dark:bg-white/5 border border-transparent focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 font-black text-2xl text-gray-800 dark:text-white px-3 py-1.5 rounded-xl w-full hover:bg-black/5 dark:hover:bg-white/5 cursor-text transition-all truncate"
                >
                <i class="fas fa-edit absolute right-3 top-1/2 -translate-y-1/2 text-gray-400/50 group-hover/edit:text-blue-500 transition-colors pointer-events-none text-xs"></i>
              </div>
            </div>
            
            <button onclick="window.toggleEntryShiny(${idx})" 
              class="flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all active:scale-95 mb-[2px] ${entry.isShiny ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-700/50 dark:text-yellow-400' : 'bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-900/30 dark:border-gray-800 dark:text-gray-600'}"
            >
              <i class="fas fa-star ${entry.isShiny ? 'drop-shadow-sm' : ''}"></i>
              <span class="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Shiny</span>
            </button>
          </div>
          
          <div id="detail-name-container" class="flex items-center gap-2 mt-2 ml-1">
            <span class="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-black">${entry.speciesName} Journey</span>
            <div class="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800"></div>
            <div class="relative group/game">
              <select 
                onchange="window.updateEntryOriginGame(${idx}, this.value)"
                class="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[10px] text-gray-700 dark:text-gray-200 uppercase tracking-[0.2em] font-black py-0.5 px-2 pr-6 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:ring-2 focus:ring-blue-500/30"
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
    const pokemonState = {
      originGameId: entry.originGameId,
      gen: parseInt(entry.originGen),
      isShadow: entry.originGameId === 'colo' || entry.originGameId === 'xd',
      availableGames: entry.availableGames ? new Set(entry.availableGames) : null
    };

    // Generate the automated Contest Memory Ribbon if applicable
    const contestRibbonIds = RIBBONS.filter(r => (r.gen === 3 || r.gen === 4) && r.name.includes('Contest')).map(r => r.id);
    const collectedContestCount = entry.collectedRibbons.filter(id => contestRibbonIds.includes(id)).length;
    
    let automatedRibbons = [];
    if (collectedContestCount > 0) {
      const isGold = collectedContestCount === 40;
      automatedRibbons.push({
        id: 'gen6_contest_memory',
        name: isGold ? 'Contest Memory Ribbon (Gold)' : 'Contest Memory Ribbon',
        description: `A Ribbon awarded to a Pokémon that has overcome many challenges in Contests in the distant past. (Contests Cleared: ${collectedContestCount}/40)`,
        game: RIBBON_GAMES.XY,
        gen: 6,
        isEarned: true,
        isAutomated: true,
        isGold: isGold
      });
    }

    // Generate the automated Battle Memory Ribbon if applicable
    const battleRibbonIds = RIBBONS.filter(r => (r.gen === 3 || r.gen === 4) && (r.name.includes('Ability') || r.name.includes('Winning') || r.name.includes('Victory'))).map(r => r.id);
    const collectedBattleCount = entry.collectedRibbons.filter(id => battleRibbonIds.includes(id)).length;

    if (collectedBattleCount > 0) {
      const isGold = collectedBattleCount >= 7;
      automatedRibbons.push({
        id: 'gen6_battle_memory',
        name: isGold ? 'Battle Memory Ribbon (Gold)' : 'Battle Memory Ribbon',
        description: `A Ribbon awarded to a Pokémon that has overcome many challenges in Battle Towers in the distant past. (Battle Ribbons: ${collectedBattleCount}/8)`,
        game: RIBBON_GAMES.XY,
        gen: 6,
        isEarned: true,
        isAutomated: true,
        isGold: isGold
      });
    }

    const grouped = RIBBONS.reduce((acc, ribbon) => {
      if (!isEligible(pokemonState, ribbon) && !ribbon.isAutomated) return acc;
      
      // Skip the base automated ribbon in the normal loop, we'll inject it manually
      if (ribbon.isAutomated) return acc;

      let genLabel = `Generation ${ribbon.gen}`;
      let gameLabel = ribbon.game;

      if (ribbon.isRecurring && ribbon.gen < pokemonState.gen) {
        genLabel = 'Recurring Ribbons';
        gameLabel = 'Recurring'; // Use a special label to flatten
      } else if (ribbon.game === 'Colosseum / XD') {
        genLabel = 'Generation 3';
      } else if (ribbon.game === 'Marks') {
        genLabel = 'Marks';
      }

      if (!acc[genLabel]) {
        acc[genLabel] = {};
      }

      if (!acc[genLabel][gameLabel]) {
        acc[genLabel][gameLabel] = [];
      }

      acc[genLabel][gameLabel].push(ribbon);
      return acc;
    }, {});

    // Inject automated ribbons into their respective generations
    automatedRibbons.forEach(ar => {
      const genLabel = `Generation ${ar.gen}`;
      if (!grouped[genLabel]) grouped[genLabel] = {};
      if (!grouped[genLabel][ar.game]) grouped[genLabel][ar.game] = [];
      grouped[genLabel][ar.game].unshift(ar);
    });

    // Sort categories: Recurring first, then numeric generations, then Marks
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      if (a === 'Recurring Ribbons') return -1;
      if (b === 'Recurring Ribbons') return 1;
      if (a === 'Marks') return 1;
      if (b === 'Marks') return -1;
      return a.localeCompare(b, undefined, { numeric: true });
    });

    gridContainer.innerHTML = sortedCategories.map(genCategory => {
      const gamesObj = grouped[genCategory];
      const isRecurring = genCategory === 'Recurring Ribbons';

      // Calculate totals for this generation/category
      let earnedInGen = 0;
      let totalInGen = 0;
      Object.values(gamesObj).forEach(ribbons => {
        totalInGen += ribbons.length;
        ribbons.forEach(r => {
          const isEarned = r.isAutomated ? r.isEarned : entry.collectedRibbons.includes(r.id);
          if (isEarned) earnedInGen++;
        });
      });

      // Render the Generation/Category header
      return `
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3 pb-1 border-b dark:border-gray-700/50">
            <h3 class="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-[0.2em]">${genCategory}</h3>
            <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700/50">
              <span class="text-[9px] font-black ${earnedInGen === totalInGen ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}">${earnedInGen}</span>
              <span class="text-[9px] font-black text-gray-300 dark:text-gray-600">/</span>
              <span class="text-[9px] font-black text-gray-500 dark:text-gray-400">${totalInGen}</span>
            </div>
          </div>
          
          ${Object.entries(gamesObj).map(([gameCategory, eligibleRibbons]) => {
        return `
            <div class="mb-3 ${isRecurring ? '' : 'pl-4 border-l-2 border-indigo-200 dark:border-indigo-800'}">
              ${isRecurring ? '' : `<h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">${gameCategory}</h4>`}
              <div class="flex flex-wrap gap-3 pb-2">
                ${eligibleRibbons.map(ribbon => {
          const isEarned = ribbon.isAutomated ? ribbon.isEarned : entry.collectedRibbons.includes(ribbon.id);
          const isMemoryRibbon = ribbon.id === 'gen6_contest_memory' || ribbon.id === 'gen6_battle_memory';
          const iconClass = isMemoryRibbon && ribbon.isGold ? 'fa-award text-yellow-500 animate-pulse' : 'fa-ribbon';
          return `
                    <div 
                      ${ribbon.isAutomated ? '' : `onclick="window.toggleRibbon(${idx}, '${ribbon.id}')"`}
                      onmouseenter="window.showRibbonTooltip(this, '${ribbon.name.replace(/'/g, "\\'")}', '${ribbon.description.replace(/'/g, "\\'")}')"
                      onmouseleave="window.hideRibbonTooltip()"
                      class="relative w-10 h-10 rounded shadow-sm border ${isEarned ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500/50 dark:bg-indigo-900/30' : 'border-gray-200 bg-white opacity-50 hover:opacity-80 dark:border-gray-700 dark:bg-gray-800 dark:opacity-40'} flex items-center justify-center transition-all ${ribbon.isAutomated ? 'cursor-default' : 'cursor-pointer'}"
                    >
                      <i class="fas ${iconClass} ${isEarned ? 'text-indigo-500 dark:text-indigo-400 drop-shadow-sm' : 'text-gray-400 dark:text-gray-500'}"></i>
                    </div>
                  `;
        }).join('')}
              </div>
            </div>
            `;
      }).join('')}
        </div>
      `;
    }).join('');

    detailView.classList.remove('hidden');
    detailView.classList.add('flex');
  };

  window.toggleRibbon = (entryIdx, ribbonId) => {
    const entry = entries[entryIdx];
    const rbIdx = entry.collectedRibbons.indexOf(ribbonId);
    if (rbIdx > -1) {
      entry.collectedRibbons.splice(rbIdx, 1);
    } else {
      entry.collectedRibbons.push(ribbonId);
    }
    saveEntries();
    window.openRibbonDetail(entryIdx); // Re-render detail
    renderEntriesList(); // Update count on list
  };

  window.toggleEntryShiny = (idx) => {
    entries[idx].isShiny = !entries[idx].isShiny;
    saveEntries();
    window.openRibbonDetail(idx);
    renderEntriesList();
  };

  window.updateEntryNickname = window.saveNickname = (idx) => {
    const input = document.getElementById('nickname-edit-input');
    const newName = input.value.trim() || entries[idx].speciesName;
    entries[idx].nickname = newName;
    saveEntries();
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
      <div class="flex flex-col gap-2">
        <div class="w-full">
          ${getSearchableDropdownHtml('detail-species-dropdown', null, 'Search Pokemon...')}
        </div>
        <div class="flex items-center gap-3 mt-2">
          <button id="confirm-species-btn" class="!px-3 !py-1 !text-[10px] !font-black !rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm active:scale-95 uppercase tracking-wider">CONFIRM</button>
          <button id="cancel-species-btn" class="!px-3 !py-1 !text-[10px] !font-black !rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase tracking-wider">CANCEL</button>
        </div>
      </div>
    `;

    let tempSelectedSpecies = null;
    const dropdown = setupSearchableDropdown('detail-species-dropdown', pokemonList, (p) => {
      tempSelectedSpecies = p;
    }, false); // dark mode = false as it's handled by tailwind classes

    // Pre-select current species
    const currentSpecies = pokemonList.find(p => p.id === entry.speciesId);
    if (currentSpecies) dropdown.setSelected(currentSpecies);

    const cancelBtn = document.getElementById('cancel-species-btn');
    const confirmBtn = document.getElementById('confirm-species-btn');

    cancelBtn.onclick = (e) => {
      e.stopPropagation();
      nameContainer.innerHTML = originalContent;
    };

    confirmBtn.onclick = async (e) => {
      e.stopPropagation();
      if (!tempSelectedSpecies) return;

      // Show loading state if re-fetching availability
      confirmBtn.innerText = 'FETCHING...';
      confirmBtn.disabled = true;

      const oldSpeciesName = entry.speciesName;
      entry.speciesId = tempSelectedSpecies.id;
      entry.speciesName = tempSelectedSpecies.displayName;
      
      // If nickname was the old species name, update it to the new one
      if (entry.nickname === oldSpeciesName) {
        entry.nickname = entry.speciesName;
      }
      
      // Re-fetch availability for the new species
      const availability = await getPokemonGameAvailability(entry.speciesId);
      entry.availableGames = [...availability]; // Convert Set to Array for serialization

      saveEntries();
      renderEntriesList();
      window.openRibbonDetail(idx);
    };
  };

  window.updateEntryOriginGame = (idx, newGameId) => {
    const game = ORIGIN_GAMES.find(g => g.id === newGameId);
    if (game) {
      entries[idx].originGameId = newGameId;
      entries[idx].originGen = game.gen;
      saveEntries();
      window.openRibbonDetail(idx); // Full refresh to update eligibility
      renderEntriesList();
    }
  };

  const smartTooltip = document.getElementById('smart-tooltip');
  const tooltipTitle = document.getElementById('smart-tooltip-title');
  const tooltipDesc = document.getElementById('smart-tooltip-desc');
  const tooltipArrow = smartTooltip.querySelector('.absolute');

  window.showRibbonTooltip = (el, title, desc) => {
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
  };

  window.hideRibbonTooltip = () => {
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
      const availableGames = await getPokemonGameAvailability(selectedPokemonId);

      const newEntry = {
        id: Date.now().toString(),
        speciesId: selectedPokemonId,
        speciesName: selectedPokemonName,
        nickname: nickname,
        isShiny: isShiny,
        originGameId: selectedOriginId,
        originGen: ORIGIN_GAMES.find(g => g.id === selectedOriginId)?.gen || 1,
        collectedRibbons: [],
        availableGames: [...availableGames] // Store as array for localStorage
      };

      entries.unshift(newEntry);
      saveEntries();
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
  document.getElementById('close-detail').onclick = () => {
    const detailView = document.getElementById('ribbon-detail-view');
    detailView.classList.add('hidden');
    detailView.classList.remove('flex');
  };

  // Close on outside click for detail view
  document.getElementById('ribbon-detail-view').onclick = (e) => {
    if (e.target.id === 'ribbon-detail-view') {
      document.getElementById('close-detail').click();
    }
  };

  renderEntriesList();
}
