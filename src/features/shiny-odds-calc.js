import { getVersions } from '../utils/pokeapi.js';
import { calculateShinyOdds, VERSION_TO_GEN, VERSIONS_WITH_SHINY_CHARM } from '../utils/shiny-odds-logic.js';

export async function initShinyOddsCalc(appContainer) {
    appContainer.innerHTML = `
        <div class="shiny-odds-page text-center max-w-2xl mx-auto px-4">
            <h1 class="mb-6 text-4xl text-black dark:text-white font-extrabold text-shadow-lg">Shiny Odds Calculator</h1>
            <p class="mb-8 text-lg text-gray-500 dark:text-gray-400">Calculate your chances of finding a Shiny Pokemon based on game version and method.</p>

            <div id="selection-container" class="space-y-6 mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transition-all duration-300">
                <div class="text-left">
                    <label for="game-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Game</label>
                    <select id="game-select" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="">Choose a game</option>
                    </select>
                </div>

                <div id="shiny-charm-container" class="hidden flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800/50 transition-all duration-300">
                    <input id="shiny-charm-toggle" type="checkbox" class="w-5 h-5 text-yellow-500 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600">
                    <label for="shiny-charm-toggle" class="text-sm font-bold text-yellow-800 dark:text-yellow-400 cursor-pointer select-none">Shiny Charm obtained?</label>
                </div>
            </div>

            <div id="odds-results" class="hidden space-y-4">
                <!-- Method Collapsibles -->
                <div id="methods-list" class="space-y-4 text-left">
                </div>
            </div>

            <p class="mt-8 text-xs text-gray-400 italic">* Odds are based on standard game mechanics. Some specific static encounters (like starters in some gens) may be Shiny Locked.</p>
        </div>
    `;

    const gameSelect = document.getElementById('game-select');
    const charmContainer = document.getElementById('shiny-charm-container');
    const charmToggle = document.getElementById('shiny-charm-toggle');
    const resultsContainer = document.getElementById('odds-results');
    const methodsList = document.getElementById('methods-list');

    // Populate Games
    try {
        const versions = await getVersions();
        versions.forEach(v => {
            const option = document.createElement('option');
            option.value = v.name;
            option.textContent = v.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            gameSelect.appendChild(option);
        });
    } catch (err) {
        console.error('Failed to load games:', err);
    }

    const updateUI = () => {
        const game = gameSelect.value;
        if (!game) {
            resultsContainer.classList.add('hidden');
            charmContainer.classList.add('hidden');
            return;
        }

        const gen = VERSION_TO_GEN[game];
        const hasCharm = charmToggle.checked;

        // Show/Hide Shiny Charm (Only in specific versions)
        if (VERSIONS_WITH_SHINY_CHARM.includes(game)) {
            charmContainer.classList.remove('hidden');
        } else {
            charmContainer.classList.add('hidden');
            charmToggle.checked = false;
        }

        resultsContainer.classList.remove('hidden');
        renderMethods(gen, hasCharm);
    };

    const renderMethods = (gen, hasCharm) => {
        const methods = [
            { id: 'random', name: 'Random Encounter', description: 'Standard wild Pokémon encounters in grass, caves, or water.' },
            { id: 'static', name: 'Static Encounter', description: 'Pokémon that appear as overworld sprites, gifts, or interactable objects (e.g., Legendaries, Snorlax).' },
            { id: 'masuda', name: 'Breeding (Masuda Method)', description: 'Breeding two Pokémon with different real-world language origins.', minGen: 4 },
            { id: 'pokeradar-gen4', name: 'Poké Radar (Gen 4)', description: 'Chaining Pokémon using the Poké Radar. Odds max out at a chain of 40.', minGen: 4, maxGen: 4, hasInput: true, inputLabel: 'Chain Length (0-40)', maxInput: 40 },
            { id: 'friendsafari', name: 'Friend Safari', description: 'Encounters in the Friend Safari have a flat boosted shiny rate.', minGen: 6, maxGen: 6 },
            { id: 'chainfishing', name: 'Chain Fishing', description: 'Consecutive successful fishing attempts increase odds. Maxes at chain 20.', minGen: 6, maxGen: 6, hasInput: true, inputLabel: 'Chain Length (0-20)', maxInput: 20 },
            { id: 'pokeradar-gen6', name: 'Poké Radar (Gen 6)', description: 'Chaining with the Poké Radar in Kalos. Odds max out at a chain of 40.', minGen: 6, maxGen: 6, hasInput: true, inputLabel: 'Chain Length (0-40)', maxInput: 40 }
        ];

        methodsList.innerHTML = methods
            .filter(m => (!m.minGen || gen >= m.minGen) && (!m.maxGen || gen <= m.maxGen))
            .map((m, index) => {
                // Get current input value if exists, or default 0
                const inputId = `input-${m.id}`;
                const currentVal = document.getElementById(inputId)?.value || 0;

                const odds = calculateShinyOdds(gen, m.id, hasCharm, { chain: parseInt(currentVal) });
                const isOpen = index === 0 ? 'open' : '';

                let inputHtml = '';
                if (m.hasInput) {
                    inputHtml = `
                        <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <label for="${inputId}" class="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">${m.inputLabel}</label>
                            <input type="number" id="${inputId}" min="0" max="${m.maxInput}" value="${currentVal}" 
                                class="shiny-input w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                                oninput="document.dispatchEvent(new CustomEvent('shinyInputUpdate'))">
                        </div>
                    `;
                }

                return `
                    <details class="group bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden" ${isOpen}>
                        <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div class="flex items-center space-x-3">
                                <span class="w-1.5 h-6 bg-yellow-500 rounded-full"></span>
                                <span class="font-bold text-gray-900 dark:text-white">${m.name}</span>
                            </div>
                            <div class="flex items-center space-x-4">
                                <span class="text-sm font-mono font-bold text-yellow-600 dark:text-yellow-400 fraction-display">${odds.fraction}</span>
                                <svg class="w-5 h-5 text-gray-400 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </summary>
                        <div class="p-4 pt-0 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-50 dark:border-gray-700">
                            <p class="mt-3 mb-4 italic">${m.description}</p>
                            ${inputHtml}
                            <div class="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div>
                                    <span class="block text-xs uppercase font-bold text-gray-400 mb-1">Percentage</span>
                                    <span class="text-lg font-bold text-gray-900 dark:text-white percentage-display">${odds.percentage}%</span>
                                </div>
                                <div>
                                    <span class="block text-xs uppercase font-bold text-gray-400 mb-1">Shiny Rolls</span>
                                    <span class="text-lg font-bold text-gray-900 dark:text-white rolls-display">${odds.rolls} <span class="text-xs font-normal text-gray-500">(1/${odds.base} base)</span></span>
                                </div>
                                <div class="hidden fraction-display">${odds.fraction}</div> 
                                <!-- Hidden element to store/update fraction for summary if needed, 
                                     actually summary is at top. Let's update top summary too. -->
                            </div>
                        </div>
                    </details>
                `;
            }).join('');
    };

    gameSelect.addEventListener('change', updateUI);
    charmToggle.addEventListener('change', updateUI);

    // Listen for custom input updates to re-render without closing details (if we handle state better)
    // Actually, full re-render closes details. Let's just re-calculate?
    // For simplicity V1: Re-render. Use state preservation for 'open' details?
    // Better: Add event listeners to inputs AFTER render.

    // Using event delegation for dynamic inputs
    methodsList.addEventListener('input', (e) => {
        if (e.target.classList.contains('shiny-input')) {
            // We need to update ONLY the results part of this card, or re-render.
            // Re-rendering kills contrast/focus.
            // Let's implement a targeted update.

            // Find parent method ID
            // Actually, simplest is to just trigger a recalc for that specific row.
            // But our render logic is monolithic.
            // Let's just re-render and try to restore focus? No, that's janky.

            // Let's attach onchange listener to update the numbers in place.
            const card = e.target.closest('details');
            const methodId = e.target.id.replace('input-', '');
            const val = parseInt(e.target.value);
            const game = gameSelect.value;
            const gen = VERSION_TO_GEN[game];
            const hasCharm = charmToggle.checked;

            const odds = calculateShinyOdds(gen, methodId, hasCharm, { chain: val });

            // Update DOM elements
            card.querySelector('.percentage-display').textContent = odds.percentage + '%';
            card.querySelector('.fraction-display').textContent = odds.fraction;
            card.querySelector('.rolls-display').innerHTML = `${odds.rolls} <span class="text-xs font-normal text-gray-500">(1/${odds.base} base)</span>`;
        }
    });

}
