/**
 * Initializes the Catch Rate Calculator page.
 * @param {HTMLElement} appContainer - The container to render the page into.
 */
import pokeballSprite from '../assets/images/pokeball.png';
import unknownSprite from '../assets/images/unknown-sprite.png';

export function initCatchRateCalc(appContainer) {
  appContainer.innerHTML = `
    <div class="catch-rate-page text-center">
      <h1 class="mb-6 text-4xl text-black dark:text-white font-extrabold text-shadow-lg">Catch Rate Calculator</h1>
      <p class="mb-8 text-lg text-gray-500 dark:text-gray-400">Determine your chances of a successful catch based on HP, status, and various Pokeballs.</p>
      
      <!-- Action Button -->
      <div class="flex items-center justify-center h-12">
          <button id="start-catch" class="text-black px-8 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white font-bold rounded-full shadow-lg transform transition active:scale-95">
            Calculate Catch Rate
          </button>
          <button id="reset-catch" class="hidden text-black px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white font-bold rounded-full shadow-lg transform transition active:scale-95">
            Reset Calculator
          </button>
      </div>
      
      <div class="pokeball-scene relative flex flex-col items-center justify-center p-8 sm:p-20 min-h-[250px] sm:min-h-[300px]">
        <!-- Pokeball Wrapper -->
        <div id="pokeball-container" class="pokeball-wrapper relative flex items-center justify-center">
          
          <!-- Mystery Pokemon (Behind halves) -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
             <img id="mystery-pokemon" src="${unknownSprite}" class="w-16 h-16 sm:w-24 sm:h-24 opacity-0 transform scale-100" alt="Unknown Pokemon" />
          </div>

          <div class="pokeball-half pokeball-top z-10">
            <img src="${pokeballSprite}" class="pokeball-sprite" alt="pokeball top" />
          </div>
          <div class="pokeball-half pokeball-bottom z-10">
            <img src="${pokeballSprite}" class="pokeball-sprite" alt="pokeball bottom" />
          </div>
        </div>
      </div>
    </div>
  `;

  const startBtn = document.getElementById('start-catch');
  const resetBtn = document.getElementById('reset-catch');
  const container = document.getElementById('pokeball-container');
  const mysteryPokemon = document.getElementById('mystery-pokemon');

  startBtn.addEventListener('click', () => {
    // Hide start button
    startBtn.classList.add('hidden');

    // Trigger Shake
    container.classList.add('anim-pokeball-shake');

    // After shaking, trigger Open
    setTimeout(() => {
      container.classList.remove('anim-pokeball-shake');
      container.classList.add('anim-pokeball-open');

      // Trigger Pokemon Emergence
      mysteryPokemon.classList.add('anim-pokemon-emerge');

    }, 400); // Shake for 0.4s

    // Show Reset button after 2.5 seconds
    setTimeout(() => {
      resetBtn.classList.remove('hidden');
      resetBtn.classList.add('anim-fade-in');
    }, 2500);
  });

  resetBtn.addEventListener('click', () => {
    // Swap buttons back
    resetBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');

    // Reset container classes and trigger fade-in
    container.classList.remove('anim-pokeball-open');
    container.classList.add('anim-pokeball-reset');

    // Reset Pokemon
    mysteryPokemon.classList.remove('anim-pokemon-emerge');


    // Remove reset animation class after it completes to allow re-trigger
    setTimeout(() => {
      container.classList.remove('anim-pokeball-reset');
    }, 1000);
  });
}
