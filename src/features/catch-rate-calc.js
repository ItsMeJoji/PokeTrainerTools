import pokeballSprite from '../assets/images/pokeball.png';

/**
 * Initializes the Catch Rate Calculator page.
 * @param {HTMLElement} appContainer - The container to render the page into.
 */
export function initCatchRateCalc(appContainer) {
    appContainer.innerHTML = `
    <div class="catch-rate-page text-center">
      <h1 class="mb-6 text-4xl font-extrabold tracking-tight">Catch Rate Calculator</h1>
      <p class="mb-8 text-lg text-gray-500 dark:text-gray-400">Determine your chances of a successful catch based on HP, status, and various Pokeballs.</p>
      
      <!-- Action Button -->
      <div class="flex items-center justify-center h-12">
          <button id="start-catch" class="text-black px-8 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white font-bold rounded-full shadow-lg transform transition active:scale-95">
            Start Pokeball
          </button>
          <button id="reset-catch" class="hidden text-black px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white font-bold rounded-full shadow-lg transform transition active:scale-95">
            Reset Ball
          </button>
      </div>
      
      <div class="pokeball-scene relative flex flex-col items-center justify-center p-8 sm:p-20 min-h-[250px] sm:min-h-[300px]">
        <!-- Pokeball Wrapper -->
        <div id="pokeball-container" class="pokeball-wrapper relative">
          <div class="pokeball-half pokeball-top">
            <img src="${pokeballSprite}" class="pokeball-sprite" alt="pokeball top" />
          </div>
          <div class="pokeball-half pokeball-bottom">
            <img src="${pokeballSprite}" class="pokeball-sprite" alt="pokeball bottom" />
          </div>
        </div>
      </div>
    </div>
  `;

    const startBtn = document.getElementById('start-catch');
    const resetBtn = document.getElementById('reset-catch');
    const container = document.getElementById('pokeball-container');

    startBtn.addEventListener('click', () => {
        // Hide start button
        startBtn.classList.add('hidden');

        // Trigger Shake
        container.classList.add('anim-pokeball-shake');

        // After shaking, trigger Open
        setTimeout(() => {
            container.classList.remove('anim-pokeball-shake');
            container.classList.add('anim-pokeball-open');
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

        // Remove reset animation class after it completes to allow re-trigger
        setTimeout(() => {
            container.classList.remove('anim-pokeball-reset');
        }, 1000);
    });
}
