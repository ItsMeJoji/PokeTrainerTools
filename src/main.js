import './assets/styles/style.css'
import { initTheme, toggleTheme } from './utils/mode-toggle.js'
import { initEncounterCalc } from './features/encounter-calc.js'
import { initCatchRateCalc } from './features/catch-rate-calc.js'
import { initShinyOddsCalc } from './features/shiny-odds-calc.js'
import grassSprite from './assets/images/grass-sprite.png'
import pokeballSprite from './assets/images/pokeball.png'
import P from './utils/pokeapi.js'

// Initialize theme
initTheme();

const renderNavbar = () => {
  const isDark = document.documentElement.classList.contains('dark');
  document.querySelector('#navbar').innerHTML = `
    <nav class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
      <div class="flex gap-4 items-center">
        <a href="#/">Home</a>
        <div class="dropdown">
          <button class="flex items-center gap-1 hover:text-blue-500 transition-colors">
            Tools
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <div class="dropdown-menu">
            <a href="#/encounter" class="dropdown-item">Encounter Calculator</a>
            <a href="#/catch-rate" class="dropdown-item">Catch Rate Calculator</a>
            <a href="#/shiny-odds" class="dropdown-item">Shiny Odds Calculator</a>
          </div>
        </div>
      </div>
      <div class="theme-switch-wrapper">
        <label class="theme-switch" for="checkbox">
          <input type="checkbox" id="checkbox" ${isDark ? 'checked' : ''} />
          <div class="slider">
            <span class="moon">🌙</span>
            <span class="sun">☀️</span>
          </div>
        </label>
      </div>
    </nav>
  `;

  document.querySelector('#checkbox').addEventListener('change', (e) => {
    toggleTheme();
  });
};

/**
 * Fetches a random shiny pokemon sprite for the homepage.
 */
async function getRandomShinyPokemon() {
  try {
    const id = Math.floor(Math.random() * 649) + 1; // Gen 1-5
    const pokemon = await P.getPokemonByName(id);
    return pokemon.sprites.front_shiny || pokemon.sprites.front_default;
  } catch (err) {
    console.error('Error fetching random shiny:', err);
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png'; // Pikachu fallback
  }
}

const renderPage = () => {
  const hash = window.location.hash || '#/';
  const app = document.querySelector('#app');

  const content = (() => {
    if (hash === '#/' || hash === '') {
      // Logic for random shiny
      const homeContent = `
        <div class="flex flex-col items-center">
          <h1 class="mb-4 text-5xl font-extrabold tracking-tight text-black dark:text-white text-shadow-lg text-center">Poké Trainer Tools</h1>
          <p class="mb-12 text-xl text-gray-500 dark:text-gray-400 max-w-2xl text-center">Your ultimate companion for Pokémon training and hunting. Optimize your journey with our specialized calculators.</p>
          
          <div class="tool-previews w-full">
            <!-- Encounter Calculator -->
            <div class="tool-card anim-fade-in shadow-2xl">
              <div class="tool-image bg-encounter">
                <div class="tool-overlay">
                  <img src="${grassSprite}" class="anim-rustle-periodic" />
                </div>
              </div>
              <div class="tool-content">
                <h3>Encounter Calculator</h3>
                <p>Plan your hunt by discovering exactly which Pokémon appear in any game, location, and area!</p>
                <a href="#/encounter" class="tool-cta">Try it now!</a>
              </div>
            </div>

            <!-- Catch Rate Calculator -->
            <div class="tool-card anim-fade-in shadow-2xl" style="animation-delay: 0.2s">
              <div class="tool-image bg-catch">
                <div class="tool-overlay">
                  <img src="${pokeballSprite}" class="anim-pokeball-shake-periodic" />
                </div>
              </div>
              <div class="tool-content">
                <h3>Catch Rate Calculator</h3>
                <p>Never waste a Poke Ball again! Calculate your precise capture probabilities across all generations!</p>
                <a href="#/catch-rate" class="tool-cta" style="background-color: #ef4444">Try it now!</a>
              </div>
            </div>

            <!-- Shiny Odds Calculator -->
            <div class="tool-card anim-fade-in shadow-2xl" style="animation-delay: 0.4s">
              <div class="tool-image bg-shiny">
                <div class="tool-overlay" id="shiny-tool-overlay">
                  <div class="animate-pulse w-24 h-24 bg-white/20 rounded-full"></div>
                </div>
              </div>
              <div class="tool-content">
                <h3>Shiny Odds Calculator</h3>
                <p>Check your shiny hunting efficiency! Calculate odds for various methods across all generations!</p>
                <a href="#/shiny-odds" class="tool-cta" style="background-color: #f59e0b">Try it now!</a>
              </div>
            </div>
          </div>
        </div>
      `;

      // We need to fetch the shiny pokemon after setting innerHTML or do it before.
      // Better to do it after or use a placeholder then replace.
      return homeContent;
    }
    else if (hash === '#/encounter') {
      // Encounter Calc handles its own initial innerHTML but we'll wrap it
      return `<div id="encounter-calc-container"></div>`;
    } else if (hash === '#/catch-rate') {
      return `<div id="catch-rate-calc-container"></div>`;
    } else if (hash === '#/shiny-odds') {
      return `<div id="shiny-odds-calc-container"></div>`;
    } else {
      return `<h1>404 - Page Not Found</h1><a href="#/">Go Home</a>`;
    }
  })();

  app.innerHTML = `
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-5xl">
      ${content}
    </div>
  `;

  if (hash === '#/' || hash === '') {
    getRandomShinyPokemon().then(sprite => {
      const overlay = document.querySelector('#shiny-tool-overlay');
      if (overlay) {
        overlay.innerHTML = `
          <img src="${sprite}" class="relative z-10" />
          <div class="star-container">
            <div class="blue-star anim-shiny-sparkle-periodic" style="--tx: -60px; --ty: -60px;"></div>
            <div class="blue-star anim-shiny-sparkle-periodic" style="--tx: 60px; --ty: 60px; animation-delay: 0.2s"></div>
            <div class="blue-star anim-shiny-sparkle-periodic" style="--tx: -60px; --ty: 60px; animation-delay: 0.4s"></div>
            <div class="blue-star anim-shiny-sparkle-periodic" style="--tx: 60px; --ty: -60px; animation-delay: 0.6s"></div>
          </div>
        `;
      }
    });
  } else if (hash === '#/encounter') {
    initEncounterCalc(document.querySelector('#encounter-calc-container'));
  } else if (hash === '#/catch-rate') {
    initCatchRateCalc(document.querySelector('#catch-rate-calc-container'));
  } else if (hash === '#/shiny-odds') {
    initShinyOddsCalc(document.querySelector('#shiny-odds-calc-container'));
  }
};

renderNavbar();
renderPage();

window.addEventListener('hashchange', renderPage);
