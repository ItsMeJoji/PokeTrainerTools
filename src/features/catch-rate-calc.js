/**
 * Initializes the Catch Rate Calculator page.
 * @param {HTMLElement} appContainer - The container to render the page into.
 */
import pokeballSprite from '../assets/images/pokeball.png';
import unknownSprite from '../assets/images/unknown-sprite.png';

import { getPokemonUpToGeneration, getPokeBalls } from '../utils/pokemon-data.js';
import { calculateGen34, simulateShakes } from '../utils/catch-rate-logic.js';
import P from '../utils/pokeapi.js';

export async function initCatchRateCalc(appContainer) {
  appContainer.innerHTML = `
    <div class="catch-rate-page text-center max-w-2xl mx-auto px-4">
      <h1 class="mb-6 text-4xl text-black dark:text-white font-extrabold text-shadow-lg">Catch Rate Calculator</h1>
      <p class="mb-8 text-lg text-gray-500 dark:text-gray-400">Determine your chances of a successful catch based on HP, status, and various Pokeballs.*</p>
      
      <!-- Selections Container -->
      <div id="selection-container" class="space-y-6 mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transition-all duration-300">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <!-- Generation Selection -->
          <div>
            <label for="gen-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Generation</label>
            <select id="gen-select" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Choose Generation</option>
              ${[3, 4].map(num => `<option value="${num}">Generation ${num}</option>`).join('')}
            </select>
          </div>

          <!-- Pokemon Selection (Custom Searchable) -->
          <div id="pokemon-search-container" class="opacity-50 pointer-events-none transition-opacity duration-300">
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Pokemon</label>
            <div id="pokemon-dropdown" class="searchable-dropdown relative">
                <div class="selected-item bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer flex items-center justify-between">
                    <span class="placeholder text-gray-400">Select a Pokemon</span>
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <div class="dropdown-list hidden absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    <div class="p-2 border-b border-gray-100 dark:border-gray-600">
                        <input type="text" class="search-input w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-md focus:ring-0 dark:text-white" placeholder="Search Pokemon...">
                    </div>
                    <div class="items-list py-1"></div>
                </div>
            </div>
          </div>
        </div>

        <!-- HP Controls -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <label for="hp-slider" class="text-sm font-medium text-gray-900 dark:text-white">HP Percentage: <span id="hp-value" class="font-bold text-red-600">100</span>%</label>
            <div class="flex items-center">
              <input id="check-1hp" type="checkbox" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="check-1hp" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none cursor-pointer">Exactly 1 HP</label>
            </div>
          </div>
          <input id="hp-slider" type="range" min="1" max="100" value="100" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 dark:bg-gray-700">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <!-- Status Selection -->
          <div>
            <label for="status-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Status Condition</label>
            <select id="status-select" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="1">None</option>
              <option value="2">Sleep / Freeze</option>
              <option value="1.5">Paralysis / Poison / Burn</option>
            </select>
          </div>

          <!-- Poké Ball Selection (Custom Searchable) -->
          <div id="ball-search-container">
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Poké Ball</label>
            <div id="ball-dropdown" class="searchable-dropdown relative">
                <div class="selected-item bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer flex items-center justify-between">
                    <span class="selected-text flex items-center"><img src="${pokeballSprite}" class="w-5 h-5 mr-2">Poke Ball</span>
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <div class="dropdown-list hidden absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    <div class="p-2 border-b border-gray-100 dark:border-gray-600">
                        <input type="text" class="search-input w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-md focus:ring-0 dark:text-white" placeholder="Search Poké Balls...">
                    </div>
                    <div class="items-list py-1"></div>
                </div>
            </div>
          </div>
        </div>

        <!-- Contextual Inputs (Hidden by default) -->
        <div id="contextual-inputs" class="hidden grid grid-cols-1 gap-4 text-left p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
             <!-- Dynamically injected inputs -->
        </div>
      </div>
      
      <!-- Action Button -->
      <div class="flex items-center justify-center space-x-4 h-12 mb-8">
          <button id="start-catch" disabled class="text-black px-8 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white font-bold rounded-full shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            Calculate Catch Rate
          </button>
          <button id="recalculate-catch" class="hidden text-black px-8 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white font-bold rounded-full shadow-lg transform transition active:scale-95">
            Recalculate
          </button>
          <button id="reset-catch" class="hidden text-black px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white font-bold rounded-full shadow-lg transform transition active:scale-95">
            Reset
          </button>
      </div>

      
      <div class="pokeball-scene relative flex flex-col items-center justify-center p-8 sm:p-20 min-h-[250px] sm:min-h-[300px]">
      <!-- Pokeball Wrapper -->
      <div id="pokeball-container" class="pokeball-wrapper relative flex items-center justify-center">
      
      <!-- Selected Pokemon (Behind halves) -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <img id="mystery-pokemon" src="${unknownSprite}" class="w-16 h-16 sm:w-24 sm:h-24 opacity-0 transform scale-125" alt="Pokemon" />
      </div>
      
      <div class="pokeball-half pokeball-top z-10">
      <img id="pokeball-top-img" src="${pokeballSprite}" class="pokeball-sprite" alt="pokeball top" />
      </div>
      <div class="pokeball-half pokeball-bottom z-10">
      <img id="pokeball-bottom-img" src="${pokeballSprite}" class="pokeball-sprite" alt="pokeball bottom" />
      </div>
      </div>
      </div>
      
      <!-- Result Display -->
      <div id="catch-result" class="catch-result hidden mb-4 opacity-0 transition-opacity duration-1000">
        <h2 id="catch-percentage" class="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-1">0%</h2>
        <p id="catch-message" class="text-gray-600 dark:text-gray-400 font-medium mb-4"></p>
        
        <!-- Calculation Breakdown Collapsible -->
        <details id="calculation-breakdown" class="text-left bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden transition-all duration-300">
          <summary class="px-4 py-3 font-bold text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 flex items-center justify-between select-none">
            Calculation Breakdown
            <svg class="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </summary>
          <div id="breakdown-content" class="p-4 space-y-3 text-xs sm:text-sm font-mono text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-600">
            <!-- Breakdown content injected here -->
          </div>
        </details>
      </div>
      
      <p class="mt-8 text-xs text-gray-400 italic">* Gen 1-2 and 5-9 calculations coming soon. Only Gen 3 & 4 logic is active. Note the logic is still a work in progress to match Bulbapedia's calculations.</p>
    </div>
  `;

  // --- Element References ---
  const startBtn = document.getElementById('start-catch');
  const recalBtn = document.getElementById('recalculate-catch');
  const resetBtn = document.getElementById('reset-catch');
  const genSelect = document.getElementById('gen-select');
  const pokemonSearchContainer = document.getElementById('pokemon-search-container');
  const hpSlider = document.getElementById('hp-slider');
  const hpValueDisplay = document.getElementById('hp-value');
  const check1hp = document.getElementById('check-1hp');
  const statusSelect = document.getElementById('status-select');
  const contextInputs = document.getElementById('contextual-inputs');
  const catchResult = document.getElementById('catch-result');
  const catchPercentage = document.getElementById('catch-percentage');
  const catchMessage = document.getElementById('catch-message');
  const pokeballContainer = document.getElementById('pokeball-container');
  const mysteryPokemon = document.getElementById('mystery-pokemon');
  const ballTopImg = document.getElementById('pokeball-top-img');
  const ballBottomImg = document.getElementById('pokeball-bottom-img');
  const breakdownContent = document.getElementById('breakdown-content');
  const calculationBreakdown = document.getElementById('calculation-breakdown');

  let currentPokemonList = [];
  let ballList = [];
  let selectedPokemon = null;
  let selectedBall = null;

  // --- Searchable Dropdown Utility ---
  function setupSearchableDropdown(dropdownId, items, onSelect, placeholder = "Select Item") {
    const dropdown = document.getElementById(dropdownId);
    const selectedDisplay = dropdown.querySelector('.selected-item');
    const listContainer = dropdown.querySelector('.dropdown-list');
    const itemsList = dropdown.querySelector('.items-list');
    const searchInput = dropdown.querySelector('.search-input');

    const updateList = (filter = "") => {
      const filtered = items.filter(item =>
        item.displayName.toLowerCase().includes(filter.toLowerCase())
      );
      itemsList.innerHTML = filtered.map(item => `
            <div data-value="${item.id || item.name}" class="dropdown-item px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer flex items-center text-sm dark:text-white">
                ${item.sprite ? `<img src="${item.sprite}" class="w-6 h-6 mr-2 object-contain">` : ''}
                ${item.displayName}
            </div>
        `).join('') || '<div class="px-4 py-2 text-sm text-gray-500 italic">No items found</div>';
    };

    selectedDisplay.onclick = (e) => {
      e.stopPropagation();
      const isHidden = listContainer.classList.contains('hidden');
      document.querySelectorAll('.dropdown-list').forEach(l => l.classList.add('hidden'));
      if (isHidden) {
        listContainer.classList.remove('hidden');
        searchInput.focus();
        updateList(searchInput.value);
      }
    };

    searchInput.onclick = (e) => e.stopPropagation();
    searchInput.oninput = (e) => updateList(e.target.value);

    itemsList.onclick = (e) => {
      const itemEl = e.target.closest('.dropdown-item');
      if (!itemEl) return;
      const value = itemEl.dataset.value;
      const item = items.find(i => (i.id || i.name) == value);

      selectedDisplay.querySelector('span').className = "selected-text flex items-center";
      selectedDisplay.querySelector('span').innerHTML = `
            ${item.sprite ? `<img src="${item.sprite}" class="w-5 h-5 mr-2">` : ''}
            ${item.displayName}
        `;
      listContainer.classList.add('hidden');
      onSelect(item);
      if (dropdownId === 'pokemon-dropdown') {
        startBtn.disabled = !item;
      }
    };

    // Close on outside click
    const outsideClick = (e) => {
      if (!dropdown.contains(e.target)) listContainer.classList.add('hidden');
    };
    document.addEventListener('click', outsideClick);

    // Initial state
    updateList();
  }

  // --- Initial Data Load & Event Listeners ---
  genSelect.addEventListener('change', async () => {
    const gen = parseInt(genSelect.value);
    if (!gen) {
      pokemonSearchContainer.classList.add('opacity-50', 'pointer-events-none');
      // Reset dropdowns if no generation selected
      setupSearchableDropdown('pokemon-dropdown', [], () => { }, "Select a Generation first");
      setupSearchableDropdown('ball-dropdown', [], () => { }, "Select a Generation first");
      selectedPokemon = null;
      selectedBall = null;
      return;
    }

    pokemonSearchContainer.classList.remove('opacity-50', 'pointer-events-none');

    // Show Loading state
    setupSearchableDropdown('pokemon-dropdown', [], () => { }, "Loading Pokemon...");

    try {
      currentPokemonList = await getPokemonUpToGeneration(gen);
      setupSearchableDropdown('pokemon-dropdown', currentPokemonList, (p) => {
        selectedPokemon = p;
      }, "Select Pokemon");

      ballList = await getPokeBalls(gen);
      setupSearchableDropdown('ball-dropdown', ballList, (b) => {
        selectedBall = b;
        ballTopImg.src = b.sprite;
        ballBottomImg.src = b.sprite;
        updateContextualInputs(b.name, selectedPokemon);
      }, "Select Poké Ball");

      // Default select first available ball (usually Poke Ball)
      const pokeBall = ballList.find(b => b.name === 'poke-ball') || ballList[0];
      if (pokeBall) {
        selectedBall = pokeBall;
        const ballSelectedSpan = document.querySelector('#ball-dropdown .selected-item span');
        ballSelectedSpan.innerHTML = `<img src="${pokeBall.sprite}" class="w-5 h-5 mr-2">${pokeBall.displayName}`;
        ballTopImg.src = pokeBall.sprite;
        ballBottomImg.src = pokeBall.sprite;
        updateContextualInputs(pokeBall.name, selectedPokemon);
      }

    } catch (err) {
      console.error('Error in selection update:', err);
      setupSearchableDropdown('pokemon-dropdown', [], () => { }, "Error loading Pokemon");
      setupSearchableDropdown('ball-dropdown', [], () => { }, "Error loading Balls");
    }
  });

  function updateContextualInputs(ballName, pokemon) {
    contextInputs.innerHTML = '';

    if (ballName === 'timer-ball') {
      contextInputs.classList.remove('hidden');
      contextInputs.innerHTML = `
          <div>
            <label for="timer-turns" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Turns Passed</label>
            <input id="timer-turns" type="number" min="1" value="1" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
        `;
    } else if (ballName === 'level-ball') {
      contextInputs.classList.remove('hidden');
      contextInputs.innerHTML = `
          <div>
            <label for="pokemon-level-diff" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Level Difference</label>
            <select id="pokemon-level-diff" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="<=1x"><= 1x</option>
              <option value="2x">2x</option>
              <option value=">2x <4x">> 2x < 4x</option>
              <option value=">=4x">>= 4x</option>
            </select>
          </div>
        `;
    } else if (ballName === 'lure-ball') {
      contextInputs.classList.remove('hidden');
      contextInputs.innerHTML = `
          <div class="flex items-center space-x-2">
            <input id="fishing-indicator" type="checkbox" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600">
            <label for="fishing-indicator" class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Fishing?</label>
          </div>
        `;
    } else if (ballName === 'love-ball') {
      contextInputs.classList.remove('hidden');
      contextInputs.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <input id="opposite-gender" type="checkbox" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600">
              <label for="opposite-gender" class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Opposite Gender?</label>
            </div>
            <div class="flex items-center space-x-2">
              <input id="same-pokemon" type="checkbox" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600">
              <label for="same-pokemon" class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Same Pokemon?</label>
            </div>
          </div>
        `;
    } else {
      contextInputs.classList.add('hidden');
    }
  }

  hpSlider.addEventListener('input', () => {
    hpValueDisplay.textContent = hpSlider.value;
    if (check1hp.checked) check1hp.checked = false;
  });

  check1hp.addEventListener('change', () => {
    if (check1hp.checked) {
      hpValueDisplay.textContent = "Exactly 1";
      hpSlider.classList.add('opacity-50');
    } else {
      hpValueDisplay.textContent = hpSlider.value;
      hpSlider.classList.remove('opacity-50');
    }
  });

  const performCatch = async () => {
    const hpPercent = check1hp.checked ? 0.5 : parseInt(hpSlider.value);
    const statusBonus = parseFloat(statusSelect.value);

    // Contextual values
    const pokemonLevelDiff = document.getElementById('pokemon-level-diff')?.value || '<=1x';
    const fishing = document.getElementById('fishing-indicator')?.checked || false;
    const oppositeGender = document.getElementById('opposite-gender')?.checked || false;
    const samePokemon = document.getElementById('same-pokemon')?.checked || false;

    // Fetch extra data if needed (Heavy/Fast ball)
    let pokemonWeight = 0;
    let baseSpeed = 0;

    if (selectedBall.name === 'heavy-ball' || selectedBall.name === 'fast-ball') {
      const pDetails = await getPokemonDetails(selectedPokemon.name);
      pokemonWeight = pDetails.weight;
      baseSpeed = pDetails.stats.find(s => s.stat.name === 'speed')?.base_stat || 0;
    }



    let ballBonus = 1;
    let apricornBonus = 1;
    const bName = selectedBall.name;
    let heavyBall = false;

    switch (bName) {
      case 'master-ball': ballBonus = 255; break;
      case 'ultra-ball': ballBonus = 2; break;
      case 'great-ball': case 'safari-ball': case 'park-ball': ballBonus = 1.5; break;
      case 'net-ball': ballBonus = 3; break;
      case 'dive-ball': ballBonus = 3.5; break;
      case 'repeat-ball': ballBonus = 3; break;
      case 'timer-ball':
        const turns = parseInt(document.getElementById('timer-turns')?.value || 1);
        ballBonus = Math.min(4, 1 + (turns * 1229 / 4096));
        break;
      case 'nest-ball': ballBonus = 3; break;
      case 'dusk-ball': ballBonus = 3.5; break;
      case 'quick-ball': ballBonus = 4; break;
      // Apricorn Balls 
      case 'level-ball':
      case 'lure-ball':
      case 'moon-ball':
      case 'friend-ball':
      case 'love-ball':
      case 'heavy-ball':
      case 'fast-ball':
        ballBonus = 1;
        switch (bName) {
          case 'level-ball':
            switch (pokemonLevelDiff) {
              case '<=1x': apricornBonus = 1; break;
              case '2x': apricornBonus = 2; break;
              case '>2x <4x': apricornBonus = 4; break;
              case '>=4x': apricornBonus = 8; break;
            }
            break;
          case 'lure-ball':
            apricornBonus = fishing ? 3 : 1;
            break;
          case 'moon-ball':
            const moonEvolutionFamily = ['nidoran-female', 'nidorina', 'nidoran-male', 'nidorino', 'clefairy', 'cleffa', 'igglybuff', 'jigglypuff', 'skitty'];
            apricornBonus = moonEvolutionFamily.includes(selectedPokemon.name) ? 4 : 1;
            break;
          case 'friend-ball':
            apricornBonus = 1;
            break;
          case 'love-ball':
            apricornBonus = (oppositeGender && samePokemon) ? 8 : 1;
            break;
          case 'heavy-ball':
            heavyBall = true;
            if (pokemonWeight < 2048) apricornBonus = -20;
            else if (pokemonWeight < 3072) apricornBonus = 20;
            else if (pokemonWeight < 4096) apricornBonus = 30;
            else apricornBonus = 40;
            break;
          case 'fast-ball':
            apricornBonus = baseSpeed >= 100 ? 4 : 1;
            break;
        }
        break;
      default: ballBonus = 1;
    }
    const maxHP = 100;
    const currentHP = check1hp.checked ? 1 : Math.max(1, (hpPercent / 100) * maxHP);

    let result;
    if (bName === 'master-ball') {
      result = { a: 255, b: 65535, catchPercentage: 100 };
    }
    else if (apricornBonus != 1 || heavyBall) {
      if (heavyBall) {
        result = calculateGen34(Math.max(1, selectedPokemon.captureRate + apricornBonus), currentHP, maxHP, ballBonus, statusBonus);
      }
      else {
        result = calculateGen34(selectedPokemon.captureRate * apricornBonus, currentHP, maxHP, ballBonus, statusBonus);
      }
    }
    else {
      result = calculateGen34(selectedPokemon.captureRate, currentHP, maxHP, ballBonus, statusBonus);
    }

    console.log("Catch Calculation Breakdown:", {
      parameters: {
        pokemon: selectedPokemon.displayName,
        ball: bName,
        baseCatchRate: selectedPokemon.captureRate,
        maxHP: maxHP,
        currentHP: currentHP,
        statusModifier: statusBonus,
        ballModifier: ballBonus,
        apricornBonus: apricornBonus,
        heavyBall: heavyBall,
        pokemonWeight: pokemonWeight,
        oppositeGender: oppositeGender,
        samePokemon: samePokemon,
        baseSpeed: baseSpeed,
        fishing: fishing,
      },
      results: {
        "Modified Catch Rate (a)": result.a,
        "Shake Probability (b)": result.b,
        "Probability of Capture (p)": result.catchPercentage + "%"
      }
    });

    // Populate UI breakdown
    let apricornInfo = '';
    if (heavyBall) {
      apricornInfo = `<span class="font-bold">Apricorn Modifier:</span> <span class="text-right text-blue-600 dark:text-blue-400">${apricornBonus > 0 ? '+' : ''}${apricornBonus} (Added to Base Catch Rate)</span>`;
    } else if (apricornBonus !== 1) {
      apricornInfo = `<span class="font-bold">Apricorn Modifier:</span> <span class="text-right text-blue-600 dark:text-blue-400">x${apricornBonus} (Multiplied to Base Catch Rate)</span>`;
    }

    breakdownContent.innerHTML = `
      <div class="grid grid-cols-2 gap-2 pb-2 border-b border-gray-100 dark:border-gray-600">
        <span class="font-bold">Pokemon:</span> <span class="text-right">${selectedPokemon.displayName}</span>
        <span class="font-bold">Base Catch Rate:</span> <span class="text-right">${selectedPokemon.captureRate}</span>
        <span class="font-bold">HP:</span> <span class="text-right">${Math.round(currentHP)} / ${maxHP}</span>
        <span class="font-bold">Status Modifier:</span> <span class="text-right">x${statusBonus}</span>
        <span class="font-bold">Ball Modifier:</span> <span class="text-right">x${Number.isInteger(ballBonus) ? ballBonus : ballBonus.toFixed(2)}</span>
        ${apricornInfo}
      </div>
      <div class="grid grid-cols-2 gap-2 pt-1">
        <span class="font-bold">Catch Rate (a):</span> <span class="text-right">${result.a}</span>
        <span class="font-bold">Shake Prob (b):</span> <span class="text-right">${result.b}</span>
        <span class="font-bold text-red-600 dark:text-red-400">Total Probability:</span> <span class="text-right font-bold text-red-600 dark:text-red-400">${result.catchPercentage}%</span>
      </div>
    `;
    calculationBreakdown.open = false; // Start collapsed
    const shakes = bName === 'master-ball' ? 4 : simulateShakes(result.b);

    startBtn.classList.add('hidden');
    recalBtn.classList.remove('hidden');
    resetBtn.classList.remove('hidden');
    recalBtn.disabled = true;
    resetBtn.disabled = true;

    pokeballContainer.classList.add('anim-pokeball-shake');

    setTimeout(() => {
      pokeballContainer.classList.remove('anim-pokeball-shake');

      if (shakes === 4 || result.catchPercentage >= 100) {
        pokeballContainer.classList.add('anim-pokeball-open');
        mysteryPokemon.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`;
        mysteryPokemon.classList.add('anim-pokemon-emerge');
        catchMessage.textContent = `You caught ${selectedPokemon.displayName}!`;
      } else {
        catchMessage.textContent = `The ${selectedBall.displayName} shook ${shakes} times... but it broke free!`;
      }

      catchPercentage.textContent = `${result.catchPercentage}%`;
      catchResult.classList.remove('hidden');
      void catchResult.offsetWidth;
      catchResult.classList.remove('opacity-0');
      catchResult.classList.add('opacity-100');

      recalBtn.disabled = false;
      resetBtn.disabled = false;
      recalBtn.classList.add('anim-fade-in');
      resetBtn.classList.add('anim-fade-in');
    }, 400);
  };

  startBtn.addEventListener('click', () => {
    if (!selectedPokemon || !selectedBall) return;
    performCatch();
  });

  recalBtn.addEventListener('click', () => {
    catchResult.classList.remove('opacity-100');
    catchResult.classList.add('opacity-0');
    setTimeout(() => {
      catchResult.classList.add('hidden');
      pokeballContainer.classList.remove('anim-pokeball-open');
      pokeballContainer.classList.add('anim-pokeball-reset');
      mysteryPokemon.classList.remove('anim-pokemon-emerge');

      setTimeout(() => {
        pokeballContainer.classList.remove('anim-pokeball-reset');
        performCatch();
      }, 500);
    }, 300);
  });

  resetBtn.addEventListener('click', () => {
    resetBtn.classList.add('hidden');
    recalBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
    startBtn.disabled = true;
    genSelect.value = "";

    // Clear selections
    selectedPokemon = null;
    selectedBall = null;
    hpSlider.value = 100;
    hpValueDisplay.textContent = "100";
    hpSlider.classList.remove('opacity-50');
    check1hp.checked = false;
    statusSelect.value = "1";
    calculationBreakdown.open = false;
    breakdownContent.innerHTML = "";

    // Reset searchable dropdowns
    setupSearchableDropdown('pokemon-dropdown', [], () => { }, "Select a Pokemon");
    pokemonSearchContainer.classList.add('opacity-50', 'pointer-events-none');

    // Default Ball/Pokemon select visual reset
    const ballSpan = document.querySelector('#ball-dropdown .selected-item span');
    if (ballSpan) {
      ballSpan.innerHTML = `<img src="${pokeballSprite}" class="w-5 h-5 mr-2">Poke Ball`;
    }
    ballTopImg.src = pokeballSprite;
    ballBottomImg.src = pokeballSprite;
    const pokemonSpan = document.querySelector('#pokemon-dropdown .selected-item span');
    if (pokemonSpan) {
      pokemonSpan.textContent = "Select a Pokemon";
      pokemonSpan.className = "placeholder text-gray-400";
    }

    document.getElementById('pokemon-dropdown').classList.remove('pointer-events-none');
    document.getElementById('ball-dropdown').classList.remove('pointer-events-none');

    catchResult.classList.add('opacity-0');
    setTimeout(() => {
      catchResult.classList.add('hidden');
      pokeballContainer.classList.remove('anim-pokeball-open');
      pokeballContainer.classList.add('anim-pokeball-reset');
      mysteryPokemon.classList.remove('anim-pokemon-emerge');

      setTimeout(() => {
        pokeballContainer.classList.remove('anim-pokeball-reset');
      }, 1000);
    }, 300);
  });
}

/**
 * Helper to fetch detailed Pokemon data for weight and speed.
 */
async function getPokemonDetails(name) {
  try {
    // Import P is not possible here without moving it or passing it, 
    // but pokeapi.js exports P as default.
    // Wait, catch-rate-calc.js doesn't import P. It imports getPokemonUpToGeneration.
    // I'll add an export to pokemon-data.js for the Pokedex instance or a wrapper.
    return await P.getPokemonByName(name);
  } catch (error) {
    console.error('Error fetching pokemon details:', error);
    return { weight: 0, stats: [] };
  }
}
