import {
  calculateEntryGenerations,
  getCurrentGenerationForEntry,
  getPokemonSpriteUrl
} from '../utils/ribbon-progress.js';

/**
 * Initializes the standalone Ribbon Tracker Popout widget.
 * Designed for both mini popout desktop windows and OBS / stream browser sources.
 * Displays the Pokemon sprite on top and the centered x/x count for the current gen below it.
 * Supports multi-selection cycling with smooth fade-in / fade-out animations.
 *
 * @param {HTMLElement} appContainer - The container to render into.
 */
export function initRibbonPopout(appContainer) {
  const urlParams = new URLSearchParams(window.location.search);
  const initialEntryId = urlParams.get('id');
  const queryBg = urlParams.get('bg'); // 'transparent', 'dark', 'light'

  // Settings
  let isTransparent = queryBg === 'transparent' || localStorage.getItem('ribbon_popout_transparent') === 'true';
  let cycleIntervalMs = parseInt(localStorage.getItem('ribbon_popout_cycle_speed') || '7000', 10);
  if (![4000, 7000, 10000, 15000].includes(cycleIntervalMs)) {
    cycleIntervalMs = 7000;
  }

  const readEntries = () => {
    try {
      return JSON.parse(localStorage.getItem('ribbon_entries') || '[]');
    } catch {
      return [];
    }
  };

  let entries = readEntries();

  // Load selected IDs for multi-display cycling
  const loadSelectedIds = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('ribbon_popout_selected_ids') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        // Keep only IDs that still exist in entries
        const valid = saved.filter(id => entries.some(e => String(e.id) === String(id)));
        if (valid.length > 0) return valid;
      }
    } catch {
      // fallback
    }
    // Default to the requested entry ID if provided, or the first entry
    if (initialEntryId && entries.some(e => String(e.id) === String(initialEntryId))) {
      return [initialEntryId];
    }
    return entries.length > 0 ? [entries[0].id] : [];
  };

  let selectedIds = loadSelectedIds();
  let currentCycleIndex = 0;
  let cycleTimer = null;
  let isTransitioning = false;
  let isMenuOpen = false;
  let isHovered = false;

  // Ensure currentCycleIndex is within bounds
  if (currentCycleIndex >= selectedIds.length) {
    currentCycleIndex = 0;
  }

  const getCurrentEntry = () => {
    entries = readEntries();
    if (entries.length === 0) return null;
    if (selectedIds.length === 0) {
      selectedIds = [entries[0].id];
    }
    if (currentCycleIndex >= selectedIds.length) {
      currentCycleIndex = 0;
    }
    const targetId = selectedIds[currentCycleIndex];
    return entries.find(e => String(e.id) === String(targetId)) || entries[0];
  };

  const updateTitle = (entry) => {
    if (entry) {
      document.title = `${entry.nickname || entry.speciesName} - Ribbon Popout`;
    } else {
      document.title = 'Ribbon Tracker Popout';
    }
  };

  const startCyclingTimer = () => {
    if (cycleTimer) {
      clearTimeout(cycleTimer);
      cycleTimer = null;
    }
    // Only cycle if more than 1 Pokemon is selected and menu isn't open
    if (selectedIds.length > 1 && !isMenuOpen && !isHovered) {
      cycleTimer = setTimeout(() => {
        advanceCycle(1);
      }, cycleIntervalMs);
    }
  };

  const advanceCycle = (delta = 1) => {
    if (selectedIds.length <= 1 || isTransitioning) return;
    isTransitioning = true;

    const displayWrap = document.getElementById('popout-display-container');
    if (displayWrap) {
      displayWrap.style.opacity = '0';
      displayWrap.style.transform = 'scale(0.93)';
    }

    setTimeout(() => {
      currentCycleIndex = (currentCycleIndex + delta + selectedIds.length) % selectedIds.length;
      updateDisplayContent();

      if (displayWrap) {
        // Trigger reflow to restart transition
        void displayWrap.offsetWidth;
        displayWrap.style.opacity = '1';
        displayWrap.style.transform = 'scale(1)';
      }

      setTimeout(() => {
        isTransitioning = false;
        startCyclingTimer();
      }, 350);
    }, 350);
  };

  const updateDisplayContent = () => {
    const entry = getCurrentEntry();
    if (!entry) return;
    updateTitle(entry);

    const genStatsList = calculateEntryGenerations(entry);
    const activeGen = getCurrentGenerationForEntry(entry, genStatsList);
    const spriteUrl = getPokemonSpriteUrl(entry.speciesId, entry.isShiny);

    const earned = activeGen ? activeGen.earned : 0;
    const total = activeGen ? activeGen.total : 0;
    const isCompleted = activeGen ? activeGen.isCompleted : false;
    const genLabel = activeGen ? `Gen ${activeGen.genNum}` : 'No Gen';

    const spriteEl = document.getElementById('popout-sprite');
    const shinyStarEl = document.getElementById('popout-shiny-star');
    const genBadgeEl = document.getElementById('popout-gen-badge');
    const countEarnedEl = document.getElementById('popout-count-earned');
    const countTotalEl = document.getElementById('popout-count-total');
    const nicknameEl = document.getElementById('popout-nickname');
    const genSwitcher = document.getElementById('popout-gen-switcher');

    if (spriteEl) {
      spriteEl.src = spriteUrl;
      spriteEl.alt = entry.speciesName;
    }
    if (shinyStarEl) {
      shinyStarEl.style.display = entry.isShiny ? 'block' : 'none';
    }
    if (genBadgeEl) {
      genBadgeEl.innerHTML = `
        <span>${genLabel}</span>
        ${isCompleted ? '<i class="fas fa-check-circle text-[9px] text-emerald-400"></i>' : ''}
      `;
      genBadgeEl.className = `inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${
        isCompleted 
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
          : 'bg-white/10 text-gray-300 border border-white/10'
      }`;
    }
    if (countEarnedEl) {
      countEarnedEl.textContent = earned;
      countEarnedEl.className = `text-3xl sm:text-4xl md:text-5xl transition-colors ${isCompleted ? 'text-emerald-400' : 'text-white'}`;
    }
    if (countTotalEl) {
      countTotalEl.textContent = total;
    }
    if (nicknameEl) {
      nicknameEl.textContent = entry.nickname || entry.speciesName;
    }

    if (genSwitcher) {
      genSwitcher.innerHTML = `
        <option value="auto" ${!entry.currentGen || entry.currentGen === 'auto' ? 'selected' : ''}>Auto (${genLabel})</option>
        ${genStatsList.map(g => `
          <option value="${g.genNum}" ${entry.currentGen == g.genNum ? 'selected' : ''}>
            ${g.category} (${g.earned}/${g.total})
          </option>
        `).join('')}
      `;
    }

    // Update pagination dots if present
    const dotsWrap = document.getElementById('popout-dots');
    if (dotsWrap && selectedIds.length > 1) {
      dotsWrap.innerHTML = selectedIds.map((id, idx) => `
        <button 
          data-dot-idx="${idx}" 
          class="w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentCycleIndex ? 'bg-red-500 w-3' : 'bg-white/30 hover:bg-white/60'}" 
          title="Jump to ${entries.find(e => String(e.id) === String(id))?.nickname || 'Pokemon'}"
        ></button>
      `).join('');
    }
  };

  const renderFull = () => {
    entries = readEntries();
    const currentEntry = getCurrentEntry();

    if (!currentEntry) {
      appContainer.innerHTML = `
        <div class="h-screen w-screen flex flex-col items-center justify-center p-6 text-center select-none ${isTransparent ? 'bg-transparent text-white' : 'bg-gray-900 text-white'}">
          <div class="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <i class="fas fa-ribbon text-2xl text-red-400 animate-pulse"></i>
          </div>
          <h2 class="text-base font-bold mb-1">No Active Journey</h2>
          <p class="text-xs text-gray-400 max-w-xs mb-4">Start or open a Pokémon journey in the Ribbon Tracker to display it here.</p>
          <a href="/ribbon-tracker" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#ef4444] text-white hover:bg-red-600 transition-colors">
            Go to Ribbon Tracker
          </a>
        </div>
      `;
      return;
    }

    updateTitle(currentEntry);
    const genStatsList = calculateEntryGenerations(currentEntry);
    const activeGen = getCurrentGenerationForEntry(currentEntry, genStatsList);
    const spriteUrl = getPokemonSpriteUrl(currentEntry.speciesId, currentEntry.isShiny);

    const earned = activeGen ? activeGen.earned : 0;
    const total = activeGen ? activeGen.total : 0;
    const isCompleted = activeGen ? activeGen.isCompleted : false;
    const genLabel = activeGen ? `Gen ${activeGen.genNum}` : 'No Gen';

    appContainer.innerHTML = `
      <div id="popout-root" class="relative w-screen h-screen flex flex-col items-center justify-center select-none overflow-hidden transition-colors duration-300 ${isTransparent ? 'bg-transparent' : 'bg-[#0f172a]'}" style="min-height: 100vh;">
        
        <div id="popout-toolbar" class="absolute top-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-50 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl whitespace-nowrap">
          
          <!-- Pokemon Multi-Selection Dropdown Button -->
          <div class="relative">
            <button 
              id="popout-pokemon-dropdown-btn" 
              type="button" 
              class="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-bold py-1 px-2 rounded-lg border border-gray-700 cursor-pointer transition-colors focus:outline-none"
              title="Select Pokémon to display and cycle"
            >
              <i class="fas fa-layer-group text-red-400 text-[10px]"></i>
              <span id="popout-pokemon-btn-label">Pokémon (${selectedIds.length})</span>
              <i class="fas fa-chevron-down text-[8px] text-gray-400 ml-0.5"></i>
            </button>

            <!-- Multi-Select Checkbox Popover Menu -->
            <div 
              id="popout-pokemon-dropdown-menu" 
              class="${isMenuOpen ? '' : 'hidden'} absolute left-0 top-full mt-1.5 w-60 max-h-72 overflow-y-auto bg-gray-900/95 border border-gray-700 rounded-xl shadow-2xl p-2.5 z-50 text-left backdrop-blur-lg"
            >
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-gray-800 text-[9px] uppercase tracking-wider font-black text-gray-400">
                <span>Display & Cycle</span>
                <div class="flex items-center gap-1.5">
                  <button type="button" id="popout-select-all-btn" class="hover:text-white transition-colors cursor-pointer">All</button>
                  <span class="text-gray-600">/</span>
                  <button type="button" id="popout-clear-all-btn" class="hover:text-white transition-colors cursor-pointer">Clear</button>
                </div>
              </div>

              <!-- List of Pokemon Checkboxes -->
              <div class="space-y-1 max-h-40 overflow-y-auto pr-1">
                ${entries.map(e => {
                  const isChecked = selectedIds.includes(String(e.id));
                  return `
                    <label class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs text-white select-none">
                      <input 
                        type="checkbox" 
                        value="${e.id}" 
                        ${isChecked ? 'checked' : ''} 
                        class="popout-entry-checkbox accent-[#ef4444] rounded cursor-pointer w-3.5 h-3.5"
                      />
                      <img src="${getPokemonSpriteUrl(e.speciesId, e.isShiny)}" class="w-6 h-6 object-contain shrink-0" />
                      <div class="flex flex-col min-w-0 flex-1 leading-tight">
                        <span class="font-bold truncate text-[11px]">${e.nickname}</span>
                        <span class="text-[9px] text-gray-400 truncate">${e.speciesName}</span>
                      </div>
                    </label>
                  `;
                }).join('')}
              </div>

              <!-- Cycle Speed Setting -->
              <div class="mt-2.5 pt-2 border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
                <span class="font-bold flex items-center gap-1">
                  <i class="fas fa-history text-[9px] text-red-400"></i> Speed:
                </span>
                <div class="flex items-center gap-1">
                  ${[4000, 7000, 10000, 15000].map(speed => `
                    <button 
                      type="button" 
                      data-speed="${speed}" 
                      class="popout-speed-btn px-1.5 py-0.5 rounded text-[9px] font-black cursor-pointer transition-colors ${
                        cycleIntervalMs === speed 
                          ? 'bg-[#ef4444] text-white shadow-sm' 
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }"
                    >
                      ${speed / 1000}s
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Generation Switcher Dropdown -->
          <select id="popout-gen-switcher" class="bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded-lg border border-gray-700 cursor-pointer focus:outline-none" title="Select Generation">
            <option value="auto" ${!currentEntry.currentGen || currentEntry.currentGen === 'auto' ? 'selected' : ''}>Auto (${genLabel})</option>
            ${genStatsList.map(g => `
              <option value="${g.genNum}" ${currentEntry.currentGen == g.genNum ? 'selected' : ''}>
                ${g.category} (${g.earned}/${g.total})
              </option>
            `).join('')}
          </select>

          <!-- Transparent Background Toggle (OBS Mode) -->
          <button id="popout-bg-toggle" class="p-1 px-1.5 text-[10px] font-bold rounded-lg bg-gray-800 text-gray-300 hover:text-white border border-gray-700 cursor-pointer transition-colors" title="${isTransparent ? 'Switch to Solid Background' : 'Switch to Transparent (OBS)'}">
            <i class="fas ${isTransparent ? 'fa-square' : 'fa-border-none'} mr-1"></i>${isTransparent ? 'Solid' : 'OBS'}
          </button>
        </div>

        <!-- Main Popout Content with CSS Fade Animation Container -->
        <div 
          id="popout-display-container" 
          class="flex flex-col items-center justify-center p-3 sm:p-4 text-center w-full max-w-full transition-all duration-350 ease-in-out transform scale-100 opacity-100"
        >
          <!-- Pokemon Sprite (On Top) -->
          <div class="relative group/sprite flex items-center justify-center mb-1">
            <img 
              id="popout-sprite" 
              src="${spriteUrl}" 
              alt="${currentEntry.speciesName}" 
              class="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] filter transition-transform duration-300 transform hover:scale-105"
              style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;"
            />
            <i 
              id="popout-shiny-star" 
              class="fas fa-star text-[11px] text-yellow-400 absolute top-1 right-1 animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" 
              style="display: ${currentEntry.isShiny ? 'block' : 'none'};"
            ></i>
          </div>

          <!-- Generation Indicator Badge -->
          <div 
            id="popout-gen-badge"
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${
              isCompleted 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-white/10 text-gray-300 border border-white/10'
            }" 
            style="text-shadow: 0 1px 3px rgba(0,0,0,0.8);"
          >
            <span>${genLabel}</span>
            ${isCompleted ? '<i class="fas fa-check-circle text-[9px] text-emerald-400"></i>' : ''}
          </div>

          <!-- Ribbon Count x/x (Below Sprite, Centered) -->
          <div 
            id="popout-count-wrap"
            class="flex items-center justify-center font-black tracking-tight text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]"
            style="text-shadow: 0 2px 8px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,1);"
          >
            <span id="popout-count-earned" class="text-3xl sm:text-4xl md:text-5xl ${isCompleted ? 'text-emerald-400' : 'text-white'}">
              ${earned}
            </span>
            <span class="text-2xl sm:text-3xl md:text-4xl text-gray-400/80 mx-1.5 font-bold select-none">/</span>
            <span id="popout-count-total" class="text-3xl sm:text-4xl md:text-5xl text-gray-300">
              ${total}
            </span>
          </div>

          <!-- Pokemon Nickname (Subtle below count) -->
          <div 
            id="popout-nickname" 
            class="mt-1 text-[11px] font-extrabold text-gray-300/90 tracking-wide uppercase truncate max-w-[180px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" 
            style="text-shadow: 0 1px 4px rgba(0,0,0,0.9);"
          >
            ${currentEntry.nickname || currentEntry.speciesName}
          </div>

          <!-- Pagination Dots (Shown only if cycling multiple Pokemon) -->
          <div 
            id="popout-dots" 
            class="mt-2.5 flex items-center justify-center gap-1.5 transition-opacity ${selectedIds.length > 1 ? 'opacity-80' : 'opacity-0 pointer-events-none'}"
          >
            ${selectedIds.length > 1 ? selectedIds.map((id, idx) => `
              <button 
                data-dot-idx="${idx}" 
                class="w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentCycleIndex ? 'bg-[#ef4444] w-3' : 'bg-white/30 hover:bg-white/60'}" 
                title="Jump to ${entries.find(e => String(e.id) === String(id))?.nickname || 'Pokemon'}"
              ></button>
            `).join('') : ''}
          </div>

        </div>

      </div>
    `;

    // Hook up interactive controls
    const toolbar = document.getElementById('popout-toolbar');
    if (toolbar) {
      toolbar.addEventListener('mouseenter', () => {
        isHovered = true;
        if (cycleTimer) clearTimeout(cycleTimer);
      });
      toolbar.addEventListener('mouseleave', () => {
        isHovered = false;
        startCyclingTimer();
      });
    }

    const dropdownBtn = document.getElementById('popout-pokemon-dropdown-btn');
    const dropdownMenu = document.getElementById('popout-pokemon-dropdown-menu');

    if (dropdownBtn && dropdownMenu) {
      dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
        dropdownMenu.classList.toggle('hidden', !isMenuOpen);
        if (isMenuOpen && cycleTimer) {
          clearTimeout(cycleTimer);
        } else if (!isMenuOpen) {
          startCyclingTimer();
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (isMenuOpen && !dropdownMenu.contains(e.target) && !dropdownBtn.contains(e.target)) {
          isMenuOpen = false;
          dropdownMenu.classList.add('hidden');
          startCyclingTimer();
        }
      });
    }

    // Checkbox toggling
    appContainer.querySelectorAll('.popout-entry-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const checkedValues = Array.from(appContainer.querySelectorAll('.popout-entry-checkbox:checked')).map(el => el.value);
        if (checkedValues.length === 0) {
          // Keep at least the current one selected
          cb.checked = true;
          return;
        }
        selectedIds = checkedValues;
        localStorage.setItem('ribbon_popout_selected_ids', JSON.stringify(selectedIds));
        
        const label = document.getElementById('popout-pokemon-btn-label');
        if (label) label.textContent = `Pokémon (${selectedIds.length})`;

        if (currentCycleIndex >= selectedIds.length) {
          currentCycleIndex = 0;
        }
        updateDisplayContent();
        startCyclingTimer();
      });
    });

    // Select All / Clear All
    const selectAllBtn = document.getElementById('popout-select-all-btn');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedIds = entries.map(e => String(e.id));
        localStorage.setItem('ribbon_popout_selected_ids', JSON.stringify(selectedIds));
        appContainer.querySelectorAll('.popout-entry-checkbox').forEach(cb => { cb.checked = true; });
        const label = document.getElementById('popout-pokemon-btn-label');
        if (label) label.textContent = `Pokémon (${selectedIds.length})`;
        updateDisplayContent();
        startCyclingTimer();
      });
    }

    const clearAllBtn = document.getElementById('popout-clear-all-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const active = getCurrentEntry();
        selectedIds = active ? [String(active.id)] : (entries.length > 0 ? [String(entries[0].id)] : []);
        localStorage.setItem('ribbon_popout_selected_ids', JSON.stringify(selectedIds));
        appContainer.querySelectorAll('.popout-entry-checkbox').forEach(cb => {
          cb.checked = selectedIds.includes(cb.value);
        });
        const label = document.getElementById('popout-pokemon-btn-label');
        if (label) label.textContent = `Pokémon (${selectedIds.length})`;
        currentCycleIndex = 0;
        updateDisplayContent();
        startCyclingTimer();
      });
    }

    // Speed setting buttons
    appContainer.querySelectorAll('.popout-speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newSpeed = parseInt(btn.dataset.speed, 10);
        cycleIntervalMs = newSpeed;
        localStorage.setItem('ribbon_popout_cycle_speed', String(newSpeed));
        appContainer.querySelectorAll('.popout-speed-btn').forEach(b => {
          b.className = 'popout-speed-btn px-1.5 py-0.5 rounded text-[9px] font-black cursor-pointer transition-colors bg-gray-800 text-gray-400 hover:text-white';
        });
        btn.className = 'popout-speed-btn px-1.5 py-0.5 rounded text-[9px] font-black cursor-pointer transition-colors bg-[#ef4444] text-white shadow-sm';
        startCyclingTimer();
      });
    });

    // Pagination dots click
    const dotsContainer = document.getElementById('popout-dots');
    if (dotsContainer) {
      dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('button[data-dot-idx]');
        if (dot) {
          const idx = parseInt(dot.dataset.dotIdx, 10);
          if (idx !== currentCycleIndex) {
            currentCycleIndex = idx;
            advanceCycle(0);
          }
        }
      });
    }

    // Generation Switcher
    const genSwitcher = document.getElementById('popout-gen-switcher');
    if (genSwitcher) {
      genSwitcher.addEventListener('change', (e) => {
        const val = e.target.value;
        const entry = getCurrentEntry();
        if (!entry) return;
        entry.currentGen = val === 'auto' ? null : parseInt(val, 10);
        const allEntries = readEntries();
        const targetEntry = allEntries.find(ent => ent.id === entry.id);
        if (targetEntry) {
          targetEntry.currentGen = entry.currentGen;
          targetEntry.lastUpdated = new Date().toISOString();
          localStorage.setItem('ribbon_entries', JSON.stringify(allEntries));
          const syncChan = new BroadcastChannel('ribbon_tracker_sync');
          syncChan.postMessage({ type: 'ENTRIES_UPDATED', entryId: targetEntry.id });
          syncChan.close();
        }
        updateDisplayContent();
      });
    }

    // Transparent Background Toggle
    const bgToggle = document.getElementById('popout-bg-toggle');
    if (bgToggle) {
      bgToggle.addEventListener('click', () => {
        isTransparent = !isTransparent;
        localStorage.setItem('ribbon_popout_transparent', isTransparent ? 'true' : 'false');
        renderFull();
      });
    }

    // Kick off automatic cycling timer if multiple Pokemon are selected
    startCyclingTimer();
  };

  // Initial Full Render
  renderFull();

  // Real-time synchronization: listen for ribbon/entry updates from main tracker window
  const syncChannel = new BroadcastChannel('ribbon_tracker_sync');
  syncChannel.onmessage = (event) => {
    if (event.data?.type === 'ENTRIES_UPDATED') {
      entries = readEntries();
      updateDisplayContent();
    }
  };

  const handleStorage = (event) => {
    if (event.key === 'ribbon_entries') {
      entries = readEntries();
      updateDisplayContent();
    }
  };
  window.addEventListener('storage', handleStorage);
}
