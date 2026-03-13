import { getPokemonListUpToGeneration } from '../utils/pokemon-data.js';
import { setupSearchableDropdown, updateDropdownLoading, getSearchableDropdownHtml } from '../utils/ui-utils.js';
import { RIBBONS, RIBBON_CATEGORIES, ORIGIN_GAMES, isEligible } from '../utils/ribbon-data.js';

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
            <input type="text" id="pokemon-nickname" placeholder="e.g. My Shiny Pikachu" class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
          </div>
          <div id="pokemon-select-container">
            ${getSearchableDropdownHtml('ribbon-pokemon-dropdown', 'Which species?', 'Search Pokemon...')}
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Origin Game</label>
            <select id="origin-game" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
      <div id="ribbon-detail-view" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
        <div class="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div class="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
            <h3 id="detail-pokemon-name" class="text-xl font-bold text-gray-800 dark:text-white"></h3>
            <button id="close-detail" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div id="ribbon-grid-container" class="p-6 overflow-y-auto flex-1">
            <!-- Ribbons will be injected here -->
          </div>
        </div>
      </div>
    </div>
  `;

  // --- State ---
  let entries = JSON.parse(localStorage.getItem('ribbon_entries') || '[]');
  let selectedSpecies = null;

  // --- Initial Data Load ---
  updateDropdownLoading('ribbon-pokemon-dropdown', "Loading Pok\u00e9mon");
  const pokemonList = await getPokemonListUpToGeneration(9);
  setupSearchableDropdown('ribbon-pokemon-dropdown', pokemonList, (p) => {
    selectedSpecies = p;
  });

  // --- UI Functions ---
  const renderEntries = () => {
    const container = document.getElementById('active-entries');
    if (entries.length === 0) {
      container.innerHTML = `<div class="p-12 text-gray-500 dark:text-gray-400 italic">No Pokemon journeys started yet. Start one above!</div>`;
      return;
    }

    container.innerHTML = entries.map((entry, idx) => `
      <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:border-blue-300 transition-all cursor-pointer group" onclick="window.openRibbonDetail(${idx})">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center border-2 border-blue-100 dark:border-blue-900">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.speciesId}.png" class="w-14 h-14 object-contain">
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
            <div class="text-sm font-bold text-blue-600 dark:text-blue-400">${entry.collectedRibbons.length} / ${RIBBONS.filter(r => isEligible({ originGameId: entry.originGameId }, r)).length}</div>
            <div class="text-[10px] uppercase tracking-wider text-gray-400">Ribbons</div>
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
      localStorage.setItem('ribbon_entries', JSON.stringify(entries));
      renderEntries();
    }
  };

  window.openRibbonDetail = (idx) => {
    const entry = entries[idx];
    const detailView = document.getElementById('ribbon-detail-view');
    const gridContainer = document.getElementById('ribbon-grid-container');
    document.getElementById('detail-pokemon-name').textContent = `${entry.nickname}'s Ribbon Progress`;

    // Group ribbons by category
    const grouped = RIBBONS.reduce((acc, ribbon) => {
      if (!acc[ribbon.category]) acc[ribbon.category] = [];
      acc[ribbon.category].push(ribbon);
      return acc;
    }, {});

    gridContainer.innerHTML = Object.entries(grouped).map(([category, ribbons]) => {
      const eligibleRibbons = ribbons.filter(r => isEligible({ originGameId: entry.originGameId }, r));
      if (eligibleRibbons.length === 0) return '';

      return `
        <div class="mb-8">
          <h4 class="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-widest text-left">${category}</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            ${eligibleRibbons.map(ribbon => {
              const isCollected = entry.collectedRibbons.includes(ribbon.id);
              return `
                <div class="relative group cursor-pointer" onclick="window.toggleRibbon(${idx}, '${ribbon.id}')">
                  <div class="p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${isCollected ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' : 'bg-gray-50 border-transparent dark:bg-gray-900/50 hover:border-gray-200 dark:hover:border-gray-700'}">
                    <div class="w-10 h-10 flex items-center justify-center opacity-${isCollected ? '100' : '30'}">
                       <i class="fas fa-ribbon text-2xl ${isCollected ? 'text-blue-500' : 'text-gray-400'}"></i>
                    </div>
                    <span class="text-[10px] font-bold leading-tight ${isCollected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500'}">${ribbon.name}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
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
    localStorage.setItem('ribbon_entries', JSON.stringify(entries));
    window.openRibbonDetail(entryIdx); // Re-render detail
    renderEntries(); // Update count on list
  };

  // --- Event Listeners ---
  document.getElementById('add-entry').onclick = () => {
    const nickname = document.getElementById('pokemon-nickname').value.trim();
    const originGameId = document.getElementById('origin-game').value;
    
    if (!nickname || !selectedSpecies) {
      alert('Please provide a name and select a Pokemon!');
      return;
    }

    const newEntry = {
      nickname,
      speciesId: selectedSpecies.id,
      speciesName: selectedSpecies.displayName,
      originGameId,
      collectedRibbons: [],
      timestamp: Date.now()
    };

    entries.unshift(newEntry);
    localStorage.setItem('ribbon_entries', JSON.stringify(entries));
    
    // Reset form
    document.getElementById('pokemon-nickname').value = '';
    renderEntries();
  };

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

  renderEntries();
}
