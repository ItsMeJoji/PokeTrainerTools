import grassSprite from '../assets/images/grass-sprite.png';

/**
 * Initializes the Encounter Calculator page.
 * @param {HTMLElement} appContainer - The container to render the page into.
 */
export function initEncounterCalc(appContainer) {
  appContainer.innerHTML = `
    <div class="encounter-page text-center">
      <h1 class="mb-6 text-4xl font-extrabold tracking-tight">Encounter Calculator</h1>
      <p class="mb-8 text-lg text-gray-500 dark:text-gray-400">Calculate the probability of encountering specific Pokemon in various regions and conditions.</p>
      
      <!-- Action Button -->
      <div class="flex items-center justify-center h-12">
          <button id="start-encounter" class="text-black px-8 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white font-bold rounded-full shadow-lg transform transition active:scale-95">
            Start Encounter
          </button>
          <button id="reset-encounter" class="hidden text-black px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white font-bold rounded-full shadow-lg transform transition active:scale-95">
            Reset Encounter
          </button>
      </div>
      
      <div class="grass-scene relative flex flex-col items-center justify-center p-8 sm:p-20 min-h-[250px] sm:min-h-[300px]">
        <!-- Grass Sprites -->
        <div class="grass-wrapper relative w-full h-full flex items-center justify-center">
          <!-- Side Left (Raised) -->
          <img src="${grassSprite}" class="grass-sprite side-left" alt="grass" />
          <!-- Center Pair -->
          <img src="${grassSprite}" class="grass-sprite center-left" alt="grass" />
          <img src="${grassSprite}" class="grass-sprite center-right" alt="grass" />
          <!-- Side Right (Raised) -->
          <img src="${grassSprite}" class="grass-sprite side-right" alt="grass" />
        </div>
        
      </div>
    </div>
  `;

  const startBtn = document.getElementById('start-encounter');
  const resetBtn = document.getElementById('reset-encounter');
  const sprites = document.querySelectorAll('.grass-sprite');

  startBtn.addEventListener('click', () => {
    // Hide start button
    startBtn.classList.add('hidden');

    // Trigger Rustling
    sprites.forEach(sprite => {
      sprite.classList.remove('anim-fade-in');
      sprite.classList.add('anim-rustle');
    });

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
    }, 800); // Rustle for 0.8s

    // Show Reset button after 3 seconds
    setTimeout(() => {
      resetBtn.classList.remove('hidden');
      resetBtn.classList.add('anim-fade-in');
    }, 3000);
  });

  resetBtn.addEventListener('click', () => {
    // Swap buttons back
    resetBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');

    // Reset sprites with fade in
    sprites.forEach(sprite => {
      sprite.classList.remove('anim-part-left', 'anim-part-right');
      sprite.classList.add('anim-fade-in');
    });
  });
}
