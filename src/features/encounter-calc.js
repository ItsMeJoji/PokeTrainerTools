import grassSprite from '../assets/images/grass-sprite.png';
import unknownSprite from '../assets/images/unknown-sprite.png';
import { getVersions, getLocationsForVersion, getEncounters } from '../utils/pokeapi.js';

/**
 * Initializes the Encounter Calculator page.
 * @param {HTMLElement} appContainer - The container to render the page into.
 */
export async function initEncounterCalc(appContainer) {
  appContainer.innerHTML = `
    <div class="encounter-page text-center max-w-2xl mx-auto px-4">
      <h1 class="mb-6 text-4xl text-black px-8 py-3 dark:text-white font-extrabold text-shadow-lg">Encounter Calculator</h1>
      <p class="mb-8 text-lg text-gray-500 dark:text-gray-400">Calculate the probability of encountering specific Pokemon in various regions and conditions. *</p>
      
      <!-- Selections Container -->
      <div id="selection-container" class="space-y-6 mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transition-all duration-300">
        <!-- Game Selection -->
        <div>
          <label for="game-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left">Select Game</label>
          <select id="game-select" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option value="">Loading versions...</option>
          </select>
        </div>

        <!-- Location Selection -->
        <div id="location-wrapper" class="hidden opacity-0 transition-opacity duration-500">
          <label for="location-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left">Select Location</label>
          <select id="location-select" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option value="">Choose a location</option>
          </select>
        </div>

        <!-- Advanced Filter Grid (DPPT) -->
        <div id="dppt-filter-wrapper" class="hidden opacity-0 transition-opacity duration-500">
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left">Encounters Conditions</label>
          <div class="grid grid-cols-4 gap-4 mb-4">
            <!-- Radar -->
            <div class="flex items-center">
              <input id="check-radar" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="check-radar" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none cursor-pointer">Radar</label>
            </div>
            <!-- Swarm -->
            <div class="flex items-center">
              <input id="check-swarm" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="check-swarm" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none cursor-pointer">Swarm</label>
            </div>
            <!-- Time -->
            <div class="flex items-center">
              <input id="check-time" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="check-time" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none cursor-pointer">Time</label>
            </div>
            <!-- Slot 2 -->
            <div class="flex items-center">
              <input id="check-slot2" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="check-slot2" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none cursor-pointer">Slot 2</label>
            </div>
          </div>

          <!-- Conditional Dropdowns -->
          <div class="space-y-3">
            <!-- Time Dropdown -->
            <div id="time-dropdown-container" class="hidden">
               <select id="select-time" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option value="">Select Time</option>
                <option value="time-morning">Morning</option>
                <option value="time-day">Day</option>
                <option value="time-night">Night</option>
              </select>
            </div>
            <!-- Slot 2 Dropdown -->
            <div id="slot2-dropdown-container" class="hidden">
               <select id="select-slot2" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option value="">Select Cartridge</option>
                <option value="slot2-ruby">Ruby</option>
                <option value="slot2-sapphire">Sapphire</option>
                <option value="slot2-emerald">Emerald</option>
                <option value="slot2-firered">FireRed</option>
                <option value="slot2-leafgreen">LeafGreen</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Advanced Filter Grid (HGSS) -->
        <div id="hgss-filter-wrapper" class="hidden opacity-0 transition-opacity duration-500">
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left">Encounters Conditions</label>
          <div class="grid grid-cols-3 gap-4 mb-4">
            <!-- Time -->
            <div class="flex items-center">
              <input id="check-hgss-time" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="check-hgss-time" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none cursor-pointer">Time</label>
            </div>
            <!-- Radio -->
            <div class="flex items-center">
              <input id="check-radio" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="check-radio" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none cursor-pointer">Radio</label>
            </div>
            <!-- Swarm -->
            <div class="flex items-center">
              <input id="check-hgss-swarm" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="check-hgss-swarm" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none cursor-pointer">Swarm</label>
            </div>
          </div>

          <!-- Conditional Dropdowns -->
          <div class="space-y-3">
            <!-- Time Dropdown (HGSS) -->
            <div id="hgss-time-dropdown-container" class="hidden">
               <select id="select-hgss-time" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option value="">Select Time</option>
                <option value="time-morning">Morning</option>
                <option value="time-day">Day</option>
                <option value="time-night">Night</option>
              </select>
            </div>
            <!-- Radio Dropdown -->
            <div id="radio-dropdown-container" class="hidden">
               <select id="select-radio" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option value="">Select Radio Sound</option>
                <option value="radio-hoenn">Hoenn Sound</option>
                <option value="radio-sinnoh">Sinnoh Sound</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex items-center justify-center h-12 mb-8">
          <button id="start-encounter" class="text-black px-8 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white font-bold rounded-full shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            Start Encounter
          </button>
          <button id="reset-encounter" class="hidden text-black px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-green-800 dark:text-white font-bold rounded-full shadow-lg transform transition active:scale-95">
            Reset Encounter
          </button>
      </div>

      <!-- Results Header (Centered Title) -->
      <h1 id="results-header" class="hidden text-3xl text-black px-8 py-3 dark:text-white font-bold mb-4 z-20 relative opacity-0 transition-opacity duration-1000 mt-2 text-shadow-lg">
        <!-- Location Name Will Go Here -->
      </h1>

      <div class="relative w-full min-h-[400px] mt-0">
        <!-- Pokemon Encounters (Flow Document) -->
        <div id="encounter-results" class="z-0 w-full flex flex-col items-center gap-12 opacity-0 transition-opacity duration-500 pointer-events-none p-4 pt-24 pb-12">
          <!-- Pokemon cards categorized by method will be injected here -->
        </div>

        <!-- Grass Scene (Overlay) -->
        <div class="grass-scene flex flex-col items-center justify-center p-8 sm:p-20 min-h-[300px]">
          <div class="grass-wrapper relative w-full h-full flex items-center justify-center">
            <img src="${grassSprite}" class="grass-sprite side-left" alt="grass" />
            <img src="${grassSprite}" class="grass-sprite center-left" alt="grass" />
            <img src="${grassSprite}" class="grass-sprite center-right" alt="grass" />
            <img src="${grassSprite}" class="grass-sprite side-right" alt="grass" />
          </div>
        </div>
      </div>
      <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">*Advanced Filters (Radar, Swarm, etc.) Coming Soon</p>
    </div>
  `;

  const startBtn = document.getElementById('start-encounter');
  const resetBtn = document.getElementById('reset-encounter');
  const gameSelect = document.getElementById('game-select');
  const locationSelect = document.getElementById('location-select');
  const locationWrapper = document.getElementById('location-wrapper');

  const dpptFilterWrapper = document.getElementById('dppt-filter-wrapper');
  const checkRadar = document.getElementById('check-radar');
  const checkSwarm = document.getElementById('check-swarm');
  const checkTime = document.getElementById('check-time');
  const checkSlot2 = document.getElementById('check-slot2');

  const timeDropdownContainer = document.getElementById('time-dropdown-container');
  const selectTime = document.getElementById('select-time');
  const slot2DropdownContainer = document.getElementById('slot2-dropdown-container');
  const selectSlot2 = document.getElementById('select-slot2');

  const resultsHeader = document.getElementById('results-header');

  const hgssFilterWrapper = document.getElementById('hgss-filter-wrapper');
  const checkHgssTime = document.getElementById('check-hgss-time');
  const checkRadio = document.getElementById('check-radio');
  const checkHgssSwarm = document.getElementById('check-hgss-swarm');

  const hgssTimeDropdownContainer = document.getElementById('hgss-time-dropdown-container');
  const selectHgssTime = document.getElementById('select-hgss-time');
  const radioDropdownContainer = document.getElementById('radio-dropdown-container');
  const selectRadio = document.getElementById('select-radio');

  const encounterResults = document.getElementById('encounter-results');
  const sprites = document.querySelectorAll('.grass-sprite');

  // Disable start button until location is selected
  startBtn.disabled = true;

  // Populate games
  try {
    const versions = await getVersions();
    gameSelect.innerHTML = '<option value="">Choose a game</option>';
    versions.forEach(version => {
      const option = document.createElement('option');
      option.value = version.name;
      option.textContent = version.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      gameSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load games:', error);
    gameSelect.innerHTML = '<option value="">Error loading games</option>';
  }

  // Toggle Handlers
  checkTime.addEventListener('change', () => {
    if (checkTime.checked) {
      timeDropdownContainer.classList.remove('hidden');
    } else {
      timeDropdownContainer.classList.add('hidden');
      selectTime.value = "";
    }
  });

  checkSlot2.addEventListener('change', () => {
    if (checkSlot2.checked) {
      slot2DropdownContainer.classList.remove('hidden');
    } else {
      slot2DropdownContainer.classList.add('hidden');
      selectSlot2.value = "";
    }
  });

  // Toggle Handlers (HGSS)
  checkHgssTime.addEventListener('change', () => {
    if (checkHgssTime.checked) {
      hgssTimeDropdownContainer.classList.remove('hidden');
    } else {
      hgssTimeDropdownContainer.classList.add('hidden');
      selectHgssTime.value = "";
    }
  });

  checkRadio.addEventListener('change', () => {
    if (checkRadio.checked) {
      radioDropdownContainer.classList.remove('hidden');
    } else {
      radioDropdownContainer.classList.add('hidden');
      selectRadio.value = "";
    }
  });

  // Handle game change
  gameSelect.addEventListener('change', async () => {
    const selectedVersion = gameSelect.value;
    startBtn.disabled = true;

    // Reset Filter UI
    dpptFilterWrapper.classList.add('hidden', 'opacity-0');
    hgssFilterWrapper.classList.add('hidden', 'opacity-0');

    [checkRadar, checkSwarm, checkTime, checkSlot2, checkHgssTime, checkRadio, checkHgssSwarm].forEach(c => { if (c) c.checked = false; });
    timeDropdownContainer.classList.add('hidden');
    slot2DropdownContainer.classList.add('hidden');
    hgssTimeDropdownContainer.classList.add('hidden');
    radioDropdownContainer.classList.add('hidden');

    selectTime.value = "";
    selectSlot2.value = "";
    selectHgssTime.value = "";
    selectRadio.value = "";

    if (!selectedVersion) {
      locationWrapper.classList.add('hidden');
      return;
    }

    // Logic for Advanced Filters (DISABLED FOR TIME-SPLIT VIEW)
    /*
    if (['diamond', 'pearl', 'platinum'].includes(selectedVersion)) {
        dpptFilterWrapper.classList.remove('hidden');
        void dpptFilterWrapper.offsetWidth; // reflow
        dpptFilterWrapper.classList.remove('opacity-0');

    } else if (['heartgold', 'soulsilver'].includes(selectedVersion)) {
        hgssFilterWrapper.classList.remove('hidden');
        void hgssFilterWrapper.offsetWidth; // reflow
        hgssFilterWrapper.classList.remove('opacity-0');
    }
    */
    // TODO: Re-integrate HGSS logic if needed later, focusing on DPPT for now.

    locationWrapper.classList.remove('hidden');
    // Trigger reflow to enable transition
    void locationWrapper.offsetWidth;
    locationWrapper.classList.remove('opacity-0');

    locationSelect.innerHTML = '<option value="">Loading locations...</option>';
    locationSelect.disabled = true;

    try {
      const locations = await getLocationsForVersion(selectedVersion);
      locationSelect.innerHTML = '<option value="">Choose a location</option>';
      if (locations.length === 0) {
        locationSelect.innerHTML = '<option value="">No locations found</option>';
      } else {
        locations.forEach(loc => {
          const option = document.createElement('option');
          option.value = loc.name;
          option.textContent = loc.displayName;
          locationSelect.appendChild(option);
        });
        locationSelect.disabled = false;
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
      locationSelect.innerHTML = '<option value="">Error loading locations</option>';
    }
  });

  locationSelect.addEventListener('change', () => {
    startBtn.disabled = !locationSelect.value;
  });

  // Shiny Toggle Handler
  encounterResults.addEventListener('click', (e) => {
    const card = e.target.closest('.pokemon-card');
    if (!card) return;

    const img = card.querySelector('img');
    const normalSrc = img.dataset.normal;
    const shinySrc = img.dataset.shiny;

    if (!shinySrc || shinySrc === 'null') return; // No shiny sprite available

    const isShiny = img.src === shinySrc;

    // Toggle Source
    img.src = isShiny ? normalSrc : shinySrc;

    // Trigger sparkles if becoming shiny
    if (!isShiny) {
      // Create blue star sparkles (oneshot)
      for (let i = 0; i < 4; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('blue-star', 'anim-shiny-sparkle-oneshot');

        // Directional expansion
        const directions = [
          { x: -40, y: -40 }, // Top Left
          { x: 40, y: -40 },  // Top Right
          { x: -40, y: 40 },  // Bottom Left
          { x: 40, y: 40 }    // Bottom Right
        ];

        sparkle.style.setProperty('--tx', `${directions[i].x}px`);
        sparkle.style.setProperty('--ty', `${directions[i].y}px`);

        // Add a slight delay for variety
        sparkle.style.animationDelay = `${i * 0.05}s`;

        card.appendChild(sparkle);

        // Remove after animation
        sparkle.addEventListener('animationend', () => {
          sparkle.remove();
        });
      }
    }
  });

  startBtn.addEventListener('click', async () => {
    const version = gameSelect.value;
    const location = locationSelect.value;

    // Collect Filter Options
    const isHgss = ['heartgold', 'soulsilver'].includes(version);

    let filterOptions = {};

    if (isHgss) {
      filterOptions = {
        radar: false, // HGSS doesnt have radar filter here
        swarm: document.getElementById('check-hgss-swarm') ? document.getElementById('check-hgss-swarm').checked : false,
        time: document.getElementById('check-hgss-time') && document.getElementById('check-hgss-time').checked ? document.getElementById('select-hgss-time').value : null,
        slot2: null,
        radio: document.getElementById('check-radio') && document.getElementById('check-radio').checked ? document.getElementById('select-radio').value : null,
      };
    } else {
      filterOptions = {
        radar: document.getElementById('check-radar') ? document.getElementById('check-radar').checked : false,
        swarm: document.getElementById('check-swarm') ? document.getElementById('check-swarm').checked : false,
        time: document.getElementById('check-time') && document.getElementById('check-time').checked ? document.getElementById('select-time').value : null,
        slot2: document.getElementById('check-slot2') && document.getElementById('check-slot2').checked ? document.getElementById('select-slot2').value : null,
        radio: null
      };
    }

    // Start UI animation
    startBtn.classList.add('hidden');
    document.getElementById('selection-container').classList.add('hidden');

    // Trigger Rustling
    sprites.forEach(sprite => {
      sprite.classList.remove('anim-fade-in', 'anim-part-left', 'anim-part-right');
      sprite.classList.add('anim-rustle');
    });

    // Fetch encounters while animating (WITH FILTER OPTIONS)
    let groupedEncounters = {};
    try {
      groupedEncounters = await getEncounters(version, location, filterOptions);
    } catch (error) {
      console.error('Error in encounter fetch:', error);
    }

    // Render grouped encounters (Area -> Method -> List)
    // groupedEncounters is now: { "1F": { "Walk": [...] }, "B1F": { ... } }

    const areaSections = Object.entries(groupedEncounters).map(([areaName, methods], index) => {
      // Determine if this detail should be open (first one is open)
      const isOpen = index === 0 ? 'open' : '';

      const methodHtml = Object.entries(methods).map(([method, pokemon]) => `
        <div class="method-section w-full max-w-4xl mb-8 last:mb-0">
          <h3 class="text-xl font-bold mb-4 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2 text-left ml-4">${method}</h3>
          <div class="flex flex-wrap justify-center items-center gap-6">
            ${pokemon.map(p => `
              <div class="pokemon-card relative flex flex-col items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 w-32 sm:w-40 transition-transform hover:scale-105 cursor-pointer select-none">
                <img 
                  src="${p.sprite || unknownSprite}" 
                  data-normal="${p.sprite || unknownSprite}"
                  data-shiny="${p.shinySprite || 'null'}"
                  alt="${p.displayName}" 
                  class="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2 transition-opacity duration-200" 
                />
                <span class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1 text-center">${p.displayName}</span>
                <span class="text-xs font-mono px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">${p.rate}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');

      return `
        <details class="group w-full max-w-5xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6" ${isOpen}>
          <summary class="cursor-pointer list-none p-6 flex items-center justify-between bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span class="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
              <span class="w-2 h-8 bg-blue-500 rounded-full"></span>
              ${areaName}
            </span>
            <span class="text-gray-400 transform transition-transform duration-300 group-open:rotate-180">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </summary>
          <div class="p-6 pt-2 bg-white/30 dark:bg-gray-900/30">
            ${methodHtml}
          </div>
        </details>
      `;
    }).join('') || '<div class="text-gray-500 font-medium text-lg bg-gray-100 dark:bg-gray-800 py-4 px-8 rounded-full">No encounters found in data.</div>';

    encounterResults.innerHTML = areaSections;

    // Set and Show Results Header
    // Get display name from selected option text
    const locationNameDisplay = locationSelect.options[locationSelect.selectedIndex].text;
    resultsHeader.textContent = locationNameDisplay;

    // Delay showing header until grass parts (1s) to be smooth
    setTimeout(() => {
      resultsHeader.classList.remove('hidden');
      resultsHeader.classList.remove('opacity-0');
      resultsHeader.classList.add('opacity-100');
    }, 1100);

    // After rustling, trigger Parting
    setTimeout(() => {
      sprites.forEach(sprite => {
        sprite.classList.remove('anim-rustle');
        if (sprite.classList.contains('center-left') || sprite.classList.contains('side-left')) {
          sprite.classList.add('anim-part-left');
        } else {
          sprite.classList.add('anim-part-right');
        }
      });

      // Show encounters behind the parting grass
      encounterResults.classList.remove('opacity-0');
      encounterResults.classList.add('opacity-100');
      encounterResults.style.pointerEvents = 'auto'; // Re-enable pointer events for shiny toggle
    }, 1100);

    // Show Reset button after 2 seconds (faster)
    setTimeout(() => {
      resetBtn.classList.remove('hidden');
      resetBtn.classList.add('anim-fade-in');
    }, 2000);
  });

  resetBtn.addEventListener('click', () => {
    // Hide results
    encounterResults.classList.add('opacity-0');
    encounterResults.classList.remove('opacity-100');
    encounterResults.style.pointerEvents = 'none';

    // Hide Header
    resultsHeader.classList.add('hidden', 'opacity-0');

    // Swap buttons back
    resetBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');

    // Show selection container
    document.getElementById('selection-container').classList.remove('hidden');
    document.getElementById('selection-container').classList.add('anim-fade-in');

    // Reset sprites with fade in
    sprites.forEach(sprite => {
      sprite.classList.remove('anim-part-left', 'anim-part-right');
      sprite.classList.add('anim-fade-in');
    });
  });
}
