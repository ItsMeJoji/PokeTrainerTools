/**
 * Logic and UI for the Massive Mass Outbreak (MMO) Permutations Tracker.
 */

// Generate the MMO permutations down to 0 reserve.
function generatePermutations(totalSpawns) {
  const results = [];

  function search(seq, reserve, onField) {
    if (reserve === 0) {
      // All reserve spawns are out. Now catch the remaining on-field Pokémon.
      const finalSeq = [...seq];
      for (let i = 0; i < onField; i++) {
        finalSeq.push('C');
      }
      results.push(finalSeq);
      return;
    }

    // Action: Catch 1 (replaces 1 from reserve)
    search([...seq, 'C'], reserve - 1, onField);

    // Actions: Multi-KO 2, 3, or 4
    for (let k = 2; k <= onField; k++) {
      let replenished = Math.min(k, reserve);
      search([...seq, `KO${k}`], reserve - replenished, onField - k + replenished);
    }
  }

  // Initially we have 4 on field, the rest are in reserve.
  // E.g., for 8 spawns: 4 on field, 4 in reserve.
  search([], totalSpawns - 4, 4);
  return results;
}

export function initMmoPermutations(container) {
  let currentWave = 1;
  const waveSpawns = { 1: 8, 2: 6 };

  const getSavedState = () => JSON.parse(localStorage.getItem('mmoTrackerState') || '{}');
  const saveState = (state) => localStorage.setItem('mmoTrackerState', JSON.stringify(state));

  // Initialize Shell (Header, Description, Legend)
  container.innerHTML = `
    <div class="anim-fade-in text-center max-w-4xl mx-auto">
      <h1 class="mb-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white text-shadow-sm">MMO Permutations</h1>
      <p class="mb-8 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Track which Massive Mass Outbreak catch and multi-KO combinations you have tested to find your shiny!
      </p>

      <div class="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-8 mb-8 transition-all duration-300">
        
        <!-- Legend -->
        <details class="group mb-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
          <summary class="flex justify-between items-center font-bold p-4 cursor-pointer text-gray-800 dark:text-gray-200 list-none">
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              How to Read the Permutations
            </span>
            <svg class="w-5 h-5 opacity-70 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </summary>
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 space-y-4 text-left">
            <div class="flex items-start gap-3">
              <span class="mt-0.5 px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">C1, C2...</span>
              <p><strong>Catch Pokémon one-by-one.</strong> E.g., <span class="font-bold text-gray-800 dark:text-gray-200">C2</span> means you should catch 2 Pokémon individually, without triggering a multi-battle.</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="flex gap-1 flex-shrink-0">
                <span class="mt-0.5 px-2 py-0.5 rounded font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 text-xs">KO2</span>
                <span class="mt-0.5 px-2 py-0.5 rounded font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-xs">KO3</span>
                <span class="mt-0.5 px-2 py-0.5 rounded font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs">KO4</span>
              </div>
              <p><strong>Trigger a Multi-Battle.</strong> Engage 2, 3, or 4 Pokémon at the same time and catch all of them in that single battle. The color indicates how many are in the battle.</p>
            </div>
          </div>
          <div class="px-4 py-3 bg-gray-100/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-center">
            <a href="/info/mmo-guide" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              Learn more about Massive Mass Outbreak Mechanics
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </div>
        </details>

        <!-- Dynamic Content (Controls, Progress, Grid) -->
        <div id="mmo-dynamic-content"></div>
      </div>
    </div>
  `;

  const dynamicArea = container.querySelector('#mmo-dynamic-content');

  const renderTracker = () => {
    const currentSpawns = waveSpawns[currentWave];
    const perms = generatePermutations(currentSpawns);
    const savedState = getSavedState();
    const spawnKey = `spawns_${currentSpawns}`;
    const completedSet = new Set(savedState[spawnKey] || []);

    dynamicArea.innerHTML = `
      <!-- Controls -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
        
        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <!-- Wave Selection -->
          <div class="w-full sm:w-auto">
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 text-left sm:text-center">Wave</label>
            <div class="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1 w-full sm:w-fit">
              <button class="wave-toggle flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${currentWave === 1 ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}" data-wave="1">
                Wave 1
              </button>
              <button class="wave-toggle flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${currentWave === 2 ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}" data-wave="2">
                Wave 2
              </button>
            </div>
          </div>

          <!-- Spawns Selection -->
          <div class="w-full sm:w-auto">
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 text-left sm:text-center">Total Spawns</label>
            <div class="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1 w-full sm:w-fit">
              ${(currentWave === 1 ? [8, 9, 10] : [6, 7]).map(s => `
                <button class="spawn-toggle flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${currentSpawns === s ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}" data-spawns="${s}">
                  ${s}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div class="w-full sm:w-auto flex justify-end sm:mt-auto">
          <button id="reset-perms-btn" class="w-full sm:w-auto bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Reset Progress
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between text-sm font-medium mb-2">
          <span class="text-gray-600 dark:text-gray-400">Completion</span>
          <span id="mmo-completion-text" class="text-blue-600 dark:text-blue-400">${completedSet.size} / ${perms.length} (${Math.round((completedSet.size / perms.length) * 100)}%)</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div id="mmo-completion-bar" class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style="width: ${Math.round((completedSet.size / perms.length) * 100)}%"></div>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
        ${perms.map((perm, index) => {
      const permString = perm.join('-');
      const isCompleted = completedSet.has(permString);
      const groupedPerm = [];
      let cCount = 0;
      for (const action of perm) {
        if (action === 'C') {
          cCount++;
        } else {
          if (cCount > 0) {
            groupedPerm.push(`C${cCount}`);
            cCount = 0;
          }
          groupedPerm.push(action);
        }
      }
      if (cCount > 0) groupedPerm.push(`C${cCount}`);

      return `
            <button class="perm-row flex flex-col items-start p-3 rounded-xl border-2 transition-all duration-200 ${isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 opacity-60' : 'bg-gray-50 border-gray-200 hover:border-blue-300 dark:bg-gray-900 dark:border-gray-700 dark:hover:border-blue-500 shadow-sm hover:shadow'}" data-perm="${permString}">
              <div class="flex items-center justify-between w-full mb-2">
                <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Path #${index + 1}</span>
                <div class="check-container">
                  ${isCompleted ? '<svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' : ''}
                </div>
              </div>
              <div class="flex flex-wrap gap-1">
                ${groupedPerm.map(action => {
        let colorClass = 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500';
        if (action.startsWith('C')) colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        if (action === 'KO2') colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
        if (action === 'KO3') colorClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
        if (action === 'KO4') colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800';
        return `<span class="px-2 py-0.5 rounded text-xs font-bold ${colorClass}">${action}</span>`;
      }).join('<span class="text-gray-400 dark:text-gray-500 flex items-center shrink-0">→</span>')}
              </div>
            </button>
          `;
    }).join('')}
      </div>
    `;

    attachEvents();
  };

  const attachEvents = () => {
    const currentSpawns = waveSpawns[currentWave];

    // Wave toggles
    dynamicArea.querySelectorAll('.wave-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentWave = parseInt(e.currentTarget.getAttribute('data-wave'), 10);
        renderTracker();
      });
    });

    // Spawn toggles
    dynamicArea.querySelectorAll('.spawn-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        waveSpawns[currentWave] = parseInt(e.currentTarget.getAttribute('data-spawns'), 10);
        renderTracker();
      });
    });

    // Reset button
    const resetBtn = dynamicArea.querySelector('#reset-perms-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to reset your progress for ${currentSpawns} spawns?`)) {
          const state = getSavedState();
          state[`spawns_${currentSpawns}`] = [];
          saveState(state);
          renderTracker();
        }
      });
    }

    // Row toggles
    dynamicArea.querySelectorAll('.perm-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const permString = e.currentTarget.getAttribute('data-perm');
        const state = getSavedState();
        const spawnKey = `spawns_${currentSpawns}`;
        let completed = state[spawnKey] || [];
        let isNowCompleted = false;

        if (completed.includes(permString)) {
          completed = completed.filter(p => p !== permString);
        } else {
          completed.push(permString);
          isNowCompleted = true;
        }

        state[spawnKey] = completed;
        saveState(state);

        // UI update for row
        const rowClassesCompleted = ['bg-green-50', 'border-green-200', 'dark:bg-green-900/20', 'dark:border-green-800', 'opacity-60'];
        const rowClassesIncomplete = ['bg-gray-50', 'border-gray-200', 'hover:border-blue-300', 'dark:bg-gray-900', 'dark:border-gray-700', 'dark:hover:border-blue-500', 'shadow-sm', 'hover:shadow'];

        if (isNowCompleted) {
          row.classList.remove(...rowClassesIncomplete);
          row.classList.add(...rowClassesCompleted);
          row.querySelector('.check-container').innerHTML = '<svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>';
        } else {
          row.classList.remove(...rowClassesCompleted);
          row.classList.add(...rowClassesIncomplete);
          row.querySelector('.check-container').innerHTML = '';
        }

        // UI update for progress
        const totalPerms = dynamicArea.querySelectorAll('.perm-row').length;
        const count = completed.length;
        const pct = Math.round((count / totalPerms) * 100);
        const text = dynamicArea.querySelector('#mmo-completion-text');
        if (text) text.textContent = `${count} / ${totalPerms} (${pct}%)`;
        const bar = dynamicArea.querySelector('#mmo-completion-bar');
        if (bar) bar.style.width = `${pct}%`;
      });
    });
  };

  renderTracker();
}
