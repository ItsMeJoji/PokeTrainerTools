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

                <div id="sparkling-power-container" class="hidden flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/50 transition-all duration-300">
                    <label for="sparkling-power-global" class="text-sm font-bold text-orange-800 dark:text-orange-400 cursor-pointer select-none">Sparkling Power:</label>
                    <select id="sparkling-power-global" class="bg-white dark:bg-gray-700 border border-orange-200 dark:border-orange-800/50 text-orange-900 dark:text-white text-sm rounded-lg block p-1.5 focus:ring-orange-500 focus:border-orange-500">
                        <option value="0">None</option>
                        <option value="1">Level 1</option>
                        <option value="3">Level 3</option>
                    </select>
                </div>

                <div id="research-level-container" class="hidden flex items-center space-x-3 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800/50 transition-all duration-300">
                    <label for="research-level-global" class="text-sm font-bold text-teal-800 dark:text-teal-400 cursor-pointer select-none">Research Level:</label>
                    <select id="research-level-global" class="bg-white dark:bg-gray-700 border border-teal-200 dark:border-teal-800/50 text-teal-900 dark:text-white text-sm rounded-lg block p-1.5 focus:ring-teal-500 focus:border-teal-500">
                        <option value="0">None</option>
                        <option value="1">Level 10</option>
                        <option value="2">Perfect</option>
                    </select>
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
    const sparklingContainer = document.getElementById('sparkling-power-container');
    const sparklingSelect = document.getElementById('sparkling-power-global');
    const researchContainer = document.getElementById('research-level-container');
    const researchSelect = document.getElementById('research-level-global');
    const resultsContainer = document.getElementById('odds-results');
    const methodsList = document.getElementById('methods-list');

    const VERSION_MAPPING = {
        'Red / Blue / Yellow': 'red',
        'Gold / Silver / Crystal': 'gold',
        'Ruby / Sapphire / Emerald': 'ruby',
        'FireRed / LeafGreen': 'firered',
        'Diamond / Pearl / Platinum': 'diamond',
        'HeartGold / SoulSilver': 'heartgold',
        'Black / White': 'black',
        'Black 2 / White 2': 'black-2',
        'X / Y': 'x',
        'Omega Ruby / Alpha Sapphire': 'omega-ruby',
        'Sun / Moon': 'sun',
        'Ultra Sun / Ultra Moon': 'ultra-sun',
        "Let's Go Pikachu / Eevee": 'lets-go-pikachu',
        'Sword / Shield': 'sword',
        'Brilliant Diamond / Shining Pearl': 'brilliant-diamond',
        'Legends Arceus': 'legends-arceus',
        'Scarlet / Violet': 'scarlet',
        'Legends Z-A': 'legends-za'
    };

    // Populate Games
    try {
        Object.keys(VERSION_MAPPING).forEach(label => {
            const option = document.createElement('option');
            option.value = VERSION_MAPPING[label];
            option.textContent = label;
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

        // Show/Hide Global Sparkling Power (Only for SV)
        if (game === 'scarlet' || game === 'violet') {
            sparklingContainer.classList.remove('hidden');
        } else {
            sparklingContainer.classList.add('hidden');
            sparklingSelect.value = "0";
        }

        // Show/Hide Global Research Level (Only for PLA)
        if (game === 'legends-arceus') {
            researchContainer.classList.remove('hidden');
        } else {
            researchContainer.classList.add('hidden');
            researchSelect.value = "0";
        }

        resultsContainer.classList.remove('hidden');

        // Preserve input states before re-render
        const savedStates = new Map();
        methodsList.querySelectorAll('.shiny-input').forEach(input => {
            if (input.type === 'checkbox') {
                savedStates.set(input.id, input.checked);
            } else {
                savedStates.set(input.id, input.value);
            }
        });

        // Preserve open state of details
        const openIds = Array.from(methodsList.querySelectorAll('details[open]')).map(d => d.querySelector('.method-id-marker')?.dataset.id);

        renderMethods(gen, hasCharm, game);

        // Restore input states after re-render
        savedStates.forEach((val, id) => {
            const input = document.getElementById(id);
            if (input) {
                if (input.type === 'checkbox') input.checked = val;
                else input.value = val;
            }
        });

        // Restore open state
        if (openIds.length > 0) {
            methodsList.querySelectorAll('details').forEach(d => {
                const id = d.querySelector('.method-id-marker')?.dataset.id;
                if (openIds.includes(id)) d.open = true;
            });
        }
    };

    const renderMethods = (gen, hasCharm, game) => {
        const methods = [
            { id: 'random', name: 'Random Encounter', description: 'Standard wild Pokémon encounters in grass, caves, or water.' },
            { id: 'static', name: 'Static Encounter', description: 'Pokémon that appear as overworld sprites, gifts, or interactable objects (e.g., Legendaries, Snorlax). *Note: Some Static Encounters are Shiny Locked. Check specific species for details.*', excludedVersions: ['sword', 'shield', 'legends-arceus', 'legends-za'] },
            { id: 'breeding', name: 'Breeding', description: 'Breeding Pokémon in the Day Care. In Gen 2, having a Shiny parent significantly boosts odds.', minGen: 2, maxGen: 2, inputs: [{ type: 'checkbox', id: 'shinyParent', label: 'Shiny Parent?' }] },
            { id: 'odd-egg', name: 'Odd Egg', description: 'A special egg containing a baby Pokémon with a 1/10 shiny chance in Pokémon Crystal.', allowedVersions: ['gold'] },
            { id: 'masuda', name: 'Breeding (Masuda Method)', description: 'Breeding two Pokémon with different real-world language origins.', minGen: 4, hasInput: false, excludedVersions: ['lets-go-pikachu', 'lets-go-eevee', 'legends-arceus', 'legends-za'] },
            { id: 'pokeradar-gen4', name: 'Poké Radar (Gen 4)', description: 'Chaining Pokémon using the Poké Radar. Odds max out at a chain of 40.', minGen: 4, maxGen: 4, inputs: [{ type: 'number', id: 'chain', label: 'Chain Length (0-40)', max: 40 }], allowedVersions: ['diamond'] },
            { id: 'friendsafari', name: 'Friend Safari', description: 'Encounters in the Friend Safari have a flat boosted shiny rate.', minGen: 6, maxGen: 6, allowedVersions: ['x'] },
            { id: 'chainfishing', name: 'Chain Fishing', description: 'Consecutive successful fishing attempts increase odds. Maxes at chain 20.', minGen: 6, maxGen: 6, inputs: [{ type: 'number', id: 'chain', label: 'Chain Length (0-20)', max: 20 }] },
            { id: 'pokeradar-gen6', name: 'Poké Radar (Gen 6)', description: 'Chaining with the Poké Radar in Kalos. Odds max out at a chain of 40.', minGen: 6, maxGen: 6, inputs: [{ type: 'number', id: 'chain', label: 'Chain Length (0-40)', max: 40 }], allowedVersions: ['x'] },
            { id: 'sos', name: 'SOS Method', description: 'Pokémon calling for help in Gen 7. Odds increase at chains of 11, 21, and 31.', minGen: 7, maxGen: 7, inputs: [{ type: 'number', id: 'chain', label: 'Chain Length', max: 255 }], allowedVersions: ['sun', 'ultra-sun'] },
            { id: 'catchcombo', name: 'Catch Combo', description: 'Chaining the same species in Let\'s Go. Odds increase at 11, 21, and 31.', minGen: 7, maxGen: 7, inputs: [{ type: 'number', id: 'combo', label: 'Combo Length', max: 999 }, { type: 'checkbox', id: 'lure', label: 'Lure active?' }], allowedVersions: ['lets-go-pikachu'] },
            { id: 'dynamax-adventure', name: 'Dynamax Adventure', description: 'The Max Lair in Galar has extremely high shiny rates.', minGen: 8, maxGen: 8, allowedVersions: ['sword'] },
            { id: 'curry-spawn', name: 'Curry Spawn', description: 'Pokémon attracted to your camp after cooking curry.', minGen: 8, maxGen: 8, allowedVersions: ['sword'] },
            { id: 'diglett-bonus', name: 'Diglett Bonus', description: 'Finding 40 Diglett sparks in the Grand Underground doubles shiny odds.', minGen: 8, maxGen: 8, allowedVersions: ['brilliant-diamond'] },
            {
                id: 'pla-research', name: 'Outbreaks', description: 'Legends Arceus odds based on outbreak types.', minGen: 8, maxGen: 8, allowedVersions: ['legends-arceus'], inputs: [
                    { type: 'select', id: 'outbreak', label: 'Outbreak Type', options: [{ v: 0, l: 'None' }, { v: 1, l: 'Mass Outbreak' }, { v: 2, l: 'Massive Mass Outbreak' }] }
                ]
            },
            {
                id: 'sv-outbreak', name: 'Outbreaks', description: 'Scarlet/Violet odds based on outbreak kills.', minGen: 9, maxGen: 9, allowedVersions: ['scarlet'], inputs: [
                    { type: 'number', id: 'kills', label: 'Outbreak Kills (0-60+)', max: 60 }
                ]
            },
            { id: 'tera-raid', name: 'Tera Raid', description: 'The odds for Tera Raids are fixed and not affected by the Shiny Charm or Sparkling Power.', minGen: 9, maxGen: 9, allowedVersions: ['scarlet'] },
            { id: 'fossil-restore', name: 'Fossil Restoration', description: 'Restoring fossils in Legends Z-A. Odds are fixed at 1/4096.', minGen: 9, maxGen: 9, allowedVersions: ['legends-za'] },
            {
                id: 'hyperspace', name: 'Hyperspace Random Encounter', description: 'Pokémon in Hyperspace in Legends Z-A. Sparkling Power level 1-3 can be applied.', minGen: 9, maxGen: 9, allowedVersions: ['legends-za'], inputs: [
                    { type: 'select', id: 'sparkling', label: 'Sparkling Power Level', options: [{ v: 0, l: 'None' }, { v: 1, l: 'Level 1' }, { v: 2, l: 'Level 2' }, { v: 3, l: 'Level 3' }] }
                ]
            },
            {
                id: 'hyperspace-static', name: 'Hyperspace Static Encounter', description: 'Static Legendaries in Hyperspace. Sparkling Power and Shiny Charm can be applied. *Note: Some Static Encounters are Shiny Locked. Check specific species for details.*', minGen: 9, maxGen: 9, allowedVersions: ['legends-za'], inputs: [
                    { type: 'select', id: 'sparkling', label: 'Sparkling Power Level', options: [{ v: 0, l: 'None' }, { v: 1, l: 'Level 1' }, { v: 2, l: 'Level 2' }, { v: 3, l: 'Level 3' }] }
                ]
            }
        ];

        methodsList.innerHTML = methods
            .filter(m => (!m.minGen || gen >= m.minGen) && (!m.maxGen || gen <= m.maxGen))
            .filter(m => !m.allowedVersions || m.allowedVersions.includes(game))
            .filter(m => !m.excludedVersions || !m.excludedVersions.includes(game))
            .map((m, index) => {
                // Get current value from DOM if possible for consistency
                const inputId = `input-${m.id}`;
                const currentVal = document.getElementById(inputId)?.value || 0;

                // Add version and global sparkling power/research level to parameters
                const params = { game: game };
                if (game === 'scarlet' || game === 'violet') {
                    params.sparkling = parseInt(sparklingSelect.value) || 0;
                }
                if (game === 'legends-arceus') {
                    params.level = parseInt(researchSelect.value) || 0;
                }

                const odds = calculateShinyOdds(gen, m.id, hasCharm, params);
                const isOpen = index === 0 ? 'open' : '';

                let inputHtml = '';
                if (m.inputs) {
                    inputHtml = `<div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">`;
                    m.inputs.forEach(input => {
                        const fieldId = `input-${m.id}-${input.id}`;
                        if (input.type === 'number') {
                            inputHtml += `
                                <div>
                                    <label for="${fieldId}" class="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">${input.label}</label>
                                    <input type="number" id="${fieldId}" min="0" max="${input.max}" value="0" 
                                        class="shiny-input w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white">
                                </div>
                            `;
                        } else if (input.type === 'checkbox') {
                            inputHtml += `
                                <div class="flex items-center space-x-2">
                                    <input type="checkbox" id="${fieldId}" 
                                        class="shiny-input w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500">
                                    <label for="${fieldId}" class="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none">${input.label}</label>
                                </div>
                            `;
                        } else if (input.type === 'select') {
                            inputHtml += `
                                <div>
                                    <label for="${fieldId}" class="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">${input.label}</label>
                                    <select id="${fieldId}" class="shiny-input w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white">
                                        ${input.options.map(opt => `<option value="${opt.v}">${opt.l}</option>`).join('')}
                                    </select>
                                </div>
                            `;
                        }
                    });
                    inputHtml += `</div>`;
                } else if (m.hasInput) {
                    // Legacy support for single input type if needed, but we've migrated.
                }

                return `
                    <details class="group bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden" ${isOpen}>
                        <div class="method-id-marker hidden" data-id="${m.id}"></div>
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
    sparklingSelect.addEventListener('change', updateUI);
    researchSelect.addEventListener('change', updateUI);

    // Listen for custom input updates to re-render without closing details (if we handle state better)
    // Actually, full re-render closes details. Let's just re-calculate?
    // For simplicity V1: Re-render. Use state preservation for 'open' details?
    // Better: Add event listeners to inputs AFTER render.

    // Using event delegation for dynamic inputs
    methodsList.addEventListener('input', (e) => {
        if (e.target.classList.contains('shiny-input')) {
            const card = e.target.closest('details');
            const methodId = card.querySelector('.method-id-marker').dataset.id;
            const game = gameSelect.value;
            const gen = VERSION_TO_GEN[game];
            const hasCharm = charmToggle.checked;

            // Collect all inputs for this method
            const extraParams = { game: game };

            // Global Sparkling for SV
            if (game === 'scarlet' || game === 'violet') {
                extraParams.sparkling = parseInt(sparklingSelect.value) || 0;
            }

            // Global Research Level for PLA
            if (game === 'legends-arceus') {
                extraParams.level = parseInt(researchSelect.value) || 0;
            }

            card.querySelectorAll('.shiny-input').forEach(input => {
                const paramId = input.id.replace(`input-${methodId}-`, '');
                if (input.type === 'checkbox') {
                    extraParams[paramId] = input.checked;
                } else if (input.id.startsWith(`input-${methodId}-`)) {
                    extraParams[paramId] = parseInt(input.value) || 0;
                }
            });

            // Special case for legacy single input SOS/Radar if they were still used, 
            // but we migrated everything to the new structure.
            if (e.target.id === `input-${methodId}`) {
                extraParams['chain'] = parseInt(e.target.value) || 0;
            }

            const odds = calculateShinyOdds(gen, methodId, hasCharm, extraParams);

            // Update DOM elements
            card.querySelector('.percentage-display').textContent = odds.percentage + '%';
            card.querySelector('.fraction-display').textContent = odds.fraction;
            card.querySelector('summary .fraction-display').textContent = odds.fraction;
            card.querySelector('.rolls-display').innerHTML = `${odds.rolls} <span class="text-xs font-normal text-gray-500">(1/${odds.base} base)</span>`;
        }
    });

}
