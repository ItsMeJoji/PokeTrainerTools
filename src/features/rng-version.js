// rng-version.js

export async function initRNGPage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Set up initial state
    let currentNumber = 1;
    let isShiny = false;

    // Create UI with Tailwind classes
    container.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans p-4">
      <h1 class="text-4xl md:text-6xl font-bold mb-8 text-yellow-400 text-center uppercase tracking-widest">
        Pokemon: RNG Version
      </h1>
      
      <div id="number-display" class="text-8xl md:text-9xl font-mono font-black mb-12 transition-all duration-100 drop-shadow-2xl">
        ${currentNumber}
      </div>

      <button id="reroll-btn" class="px-10 py-5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-full text-2xl font-bold shadow-xl transform active:scale-95 transition-all uppercase">
        Reroll
      </button>

      <div id="shiny-message" class="h-8 mt-6 text-xl text-yellow-200 font-bold opacity-0 transition-opacity">
        ✨ A SHINY NUMBER APPEARED! ✨
      </div>
    </div>
  `;

    const display = document.getElementById('number-display');
    const btn = document.getElementById('reroll-btn');
    const message = document.getElementById('shiny-message');

    const roll = () => {
        // 1 in 20 chance (5%) to hit the joke "Shiny"
        const hitSuccess = Math.floor(Math.random() * 20) === 0;

        if (hitSuccess) {
            currentNumber = 8192;
            isShiny = true;
        } else {
            // Pick a random "losing" number between 2 and 8192
            currentNumber = Math.floor(Math.random() * 8191) + 2;
            isShiny = false;
        }

        // Update Display
        display.innerText = currentNumber;

        // Apply "Shiny" effects
        if (isShiny) {
            display.classList.add('text-red-500', 'scale-110', 'animate-bounce');
            message.classList.remove('opacity-0');
            message.classList.add('animate-pulse');
        } else {
            display.classList.remove('text-red-500', 'scale-110', 'animate-bounce');
            display.classList.add('text-white');
            message.classList.add('opacity-0');
            message.classList.remove('animate-pulse');
        }
    };

    btn.addEventListener('click', roll);
}