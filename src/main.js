import './assets/styles/style.css'
import { initTheme, toggleTheme } from './utils/mode-toggle.js'
import { initEncounterCalc } from './features/encounter-calc.js'
import { initCatchRateCalc } from './features/catch-rate-calc.js'
import { initShinyOddsCalc } from './features/shiny-odds-calc.js'
import { initShinyHuntingGuide } from './articles/shiny-hunting-guide.js'
import { initSosHuntingGuide } from './articles/sos-hunting-guide.js'
import { initMmoGuide } from './articles/mmo-guide.js'
import { initPokemonLookup } from './features/pokemon-lookup.js'
import { initSosMoveTracker } from './features/sos-move-tracker.js'
import { initMmoPermutations } from './features/mmo-permutations.js'
import { initRibbonTracker } from './features/ribbon-tracker.js'
import grassSprite from './assets/images/grass-sprite.png'
import pokeballSprite from './assets/images/pokeball.png'
import P from './utils/pokeapi.js'
import { getVersions } from './utils/pokeapi.js'

// Pre-fetch critical data on startup
getVersions();

// Initialize theme
initTheme();

const renderNavbar = () => {
  const isDark = document.documentElement.classList.contains('dark');
  document.querySelector('#navbar').innerHTML = `
    <nav class="flex justify-between items-center h-16 px-4 bg-[#1a1a1b] text-white">
      <div class="flex gap-4 items-center">
        <a href="#/" class="flex items-center">
          <img src="${pokeballSprite}" class="w-8 h-8 object-contain" alt="PokéTrainer Tools Logo" />
        </a>
        <a href="#/" class="text-xl font-bold tracking-tight hover:no-underline text-white">PokéTrainer Tools</a>
      </div>
      <div class="flex items-center gap-6 h-full">
        <div class="dropdown h-full">
          <button class="flex items-center gap-1 hover:text-blue-500 transition-colors bg-transparent text-white h-full px-4 border border-transparent cursor-pointer">
            Tools
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <div class="dropdown-menu">
            <a href="#/pokemon-lookup" class="dropdown-item">Pokemon Lookup</a>
            <a href="#/encounter" class="dropdown-item">Encounter Calculator</a>
            <a href="#/catch-rate" class="dropdown-item">Catch Rate Calculator</a>
            <a href="#/shiny-odds" class="dropdown-item">Shiny Odds Calculator</a>
            <a href="#/sos-tracker" class="dropdown-item">SOS Move Tracker</a>
            <a href="#/mmo-permutations" class="dropdown-item">MMO Permutations</a>
            <a href="#/ribbon-tracker" class="dropdown-item">Ribbon Tracker</a>
          </div>
        </div>
        <div class="dropdown h-full">
          <button class="flex items-center gap-1 hover:text-blue-400 transition-colors bg-transparent text-white h-full px-4 border border-transparent cursor-pointer">
            Info
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <div class="dropdown-menu">
            <a href="#/info/shiny-hunting" class="dropdown-item">Shiny Hunting Guide</a>
            <a href="#/info/sos-hunting" class="dropdown-item">SOS Chaining Guide</a>
            <a href="#/info/mmo-guide" class="dropdown-item">MMO Permutations Guide</a>
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
      </div>
    </nav>
  `;

  document.querySelector('#checkbox').addEventListener('change', (e) => {
    toggleTheme();
  });

  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector('button');
    const menu = dropdown.querySelector('.dropdown-menu');

    button.addEventListener('click', (e) => {
      e.stopPropagation();

      const isOpen = menu.classList.contains('show');

      dropdowns.forEach(other => {
        other.querySelector('.dropdown-menu').classList.remove('show');
        other.querySelector('button').classList.remove('active');
        other.querySelector('button').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        menu.classList.add('show');
        button.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', (e) => {
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.querySelector('.dropdown-menu').classList.remove('show');
        dropdown.querySelector('button').classList.remove('active');
        dropdown.querySelector('button').setAttribute('aria-expanded', 'false');
      }
    });
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

/**
 * Fetches a random (non-shiny) pokemon sprite for the lookup card.
 */
async function getRandomPokemon() {
  try {
    const id = Math.floor(Math.random() * 649) + 1; // Gen 1-5
    const pokemon = await P.getPokemonByName(id);
    return pokemon.sprites.front_default;
  } catch (err) {
    console.error('Error fetching random pokemon:', err);
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'; // Pikachu fallback
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
          <h1 class="mb-4 text-5xl font-extrabold tracking-tight text-black dark:text-white text-shadow-lg text-center">PokéTrainer Tools</h1>
          <p class="mb-12 text-xl text-gray-500 dark:text-gray-400 max-w-2xl text-center">Your ultimate companion for Pokémon training and hunting. Optimize your journey with our specialized calculators.</p>
          
          <div class="tool-previews w-full">
            <!-- Pokemon Lookup -->
            <div class="tool-card anim-fade-in shadow-2xl">
              <div class="tool-image bg-lookup">
                <div class="tool-overlay" id="lookup-tool-overlay">
                  <div class="animate-pulse w-24 h-24 bg-white/20 rounded-full"></div>
                </div>
              </div>
              <div class="tool-content">
                <h3>Pokémon Lookup</h3>
                <p>Find every location where any Pokémon can be encountered across all games, complete with encounter rates and level ranges!</p>
                <a href="#/pokemon-lookup" class="tool-cta" style="background-color: #6366f1">Try it now!</a>
              </div>
            </div>

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

            <!-- Ribbon Tracker -->
            <div class="tool-card anim-fade-in shadow-2xl" style="animation-delay: 0.6s">
              <div class="tool-image bg-blue-600">
                <div class="tool-overlay flex items-center justify-center">
                  <i class="fas fa-ribbon text-7xl text-white/50 anim-rustle-periodic"></i>
                </div>
              </div>
              <div class="tool-content">
                <h3>Ribbon Tracker</h3>
                <p>Track every ribbon and mark for your battle-hardened companions across all generations!</p>
                <a href="#/ribbon-tracker" class="tool-cta" style="background-color: #3b82f6">Try it now!</a>
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
    } else if (hash === '#/pokemon-lookup') {
      return `<div id="pokemon-lookup-container"></div>`;
    } else if (hash === '#/privacy') {
      return `
        <div class="anim-fade-in text-left max-w-3xl mx-auto">
          <h1 class="mb-8 font-extrabold tracking-tight text-black dark:text-white">Privacy Policy</h1>
          <div class="space-y-6 text-gray-600 dark:text-gray-400">
            <p>By using PokéTrainer Tools, you consent to this Privacy Policy. We value your privacy and aim to be transparent about how we operate.</p>
            
            <section>
              <h2 class="text-2xl font-bold text-black dark:text-white mb-2">Information We Collect</h2>
              <p>Actually, we don't collect anything! PokéTrainer Tools is designed to be a client-side utility. We do not store your personal information, Pokémon hunt data, or search history on our site.</p>
            </section>

            <section>
              <h2 class="text-2xl font-bold text-black dark:text-white mb-2">Third-Party Advertising and Cookies</h2>
              <p>While we don't collect cookies ourselves, we use Google AdSense to serve advertisements. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</p>
              <br>
              <p>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" class="text-blue-500 hover:underline">Google Ad Settings</a>.</p>
            </section>
          </div>
        </div>
      `;
    } else if (hash === '#/contact') {
      return `
        <div class="anim-fade-in text-left max-w-3xl mx-auto">
          <h1 class="mb-8 font-extrabold tracking-tight text-black dark:text-white">Contact</h1>
          <div class="space-y-6 text-gray-600 dark:text-gray-400">
            <p>If you have any questions, suggestions, or if you find any incorrect information on our site, please reach out!</p>
            
            <section>
              <h2 class="text-2xl font-bold text-black dark:text-white mb-2">Get in Touch</h2>
              <p>The best way to contact me is via X (formerly Twitter). Send me a DM or mention me: 
                <a href="https://x.com/itsmejoji_" target="_blank" class="text-blue-500 font-bold hover:underline">@ItsMeJoji_</a>
              </p>
            </section>
          </div>
        </div>
      `;
    } else if (hash === '#/info/shiny-hunting') {
      return `<div id="shiny-hunting-guide-container"></div>`;
    } else if (hash === '#/info/sos-hunting') {
      return `<div id="sos-hunting-guide-container"></div>`;
    } else if (hash === '#/info/mmo-guide') {
      return `<div id="mmo-guide-container"></div>`;
    } else if (hash === '#/sos-tracker') {
      return `<div id="sos-move-tracker-container"></div>`;
    } else if (hash === '#/mmo-permutations') {
      return `<div id="mmo-permutations-container"></div>`;
    } else if (hash === '#/ribbon-tracker') {
      return `<div id="ribbon-tracker-container"></div>`;
    } else {
      return `<h1>404 - Page Not Found</h1><a href="#/">Go Home</a>`;
    }
  })();

  app.innerHTML = `
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-5xl min-h-[80vh]">
      ${content}
    </div>
    
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
      <footer class="mt-8 py-12 border-t border-gray-200 dark:border-gray-800 w-full">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-center md:text-left">
          <!-- Left Column -->
          <div>
            <div class="flex flex-col sm:flex-row items-center gap-3 mb-4 justify-center md:justify-start">
              <p class="text-gray-600 dark:text-gray-400 font-medium text-lg">Created by <strong class="text-black dark:text-white">ItsMeJoji</strong></p>
              <div class="flex gap-4">
                <a href="https://youtube.com/@itsmejoji" target="_blank" rel="noopener noreferrer" class="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full shadow-md hover:scale-110 transition-all border border-gray-200 dark:border-gray-700" title="YouTube">
                  <i class="fab fa-youtube text-xl"></i>
                </a>
                <a href="https://x.com/itsmejoji_" target="_blank" rel="noopener noreferrer" class="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full shadow-md hover:scale-110 transition-all border border-gray-200 dark:border-gray-700" title="Twitter">
                  <i class="fab fa-twitter text-xl"></i>
                </a>
                <a href="https://twitch.tv/itsmejoji" target="_blank" rel="noopener noreferrer" class="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full shadow-md hover:scale-110 transition-all border border-gray-200 dark:border-gray-700" title="Twitch">
                  <i class="fab fa-twitch text-xl"></i>
                </a>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="flex justify-center md:justify-end gap-6 text-gray-600 dark:text-gray-400 font-medium">
            <a href="#/privacy" class="hover:text-blue-500 transition-colors">Privacy Policy</a>
            <a href="#/contact" class="hover:text-blue-500 transition-colors">Contact</a>
          </div>
        </div>

        <div class="mt-12 text-center">
          <p class="text-gray-500 dark:text-gray-500 text-sm mb-6 max-w-2xl mx-auto leading-relaxed italic">This is a fan-made project built for Pokémon trainers and enthusiasts. We are not affiliated with the official Pokémon brand.</p>
          <p class="text-gray-500 dark:text-gray-500 text-sm mb-6 max-w-2xl mx-auto leading-relaxed italic">Information and Logic is pulled from Bulbapedia and PokeAPI.</p>
          <div class="text-xs text-gray-400 dark:text-gray-600 space-y-1 opacity-75">
            <p>© 1995 - ${new Date().getFullYear()} Nintendo, GAME FREAK, and Creatures, Inc.</p>
            <p>Pokémon and Pokémon character names are trademarks of Nintendo, GAME FREAK, and Creatures, Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  `;

  if (hash === '#/' || hash === '') {
    // Shiny Odds card: random shiny sprite
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

    // Pokemon Lookup card: random normal sprite + magnifying glass Z-animation
    getRandomPokemon().then(sprite => {
      const overlay = document.querySelector('#lookup-tool-overlay');
      if (overlay) {
        overlay.innerHTML = `
          <img src="${sprite}" class="relative z-10" style="image-rendering:pixelated; object-fit:contain" />
          <div class="mag-glass anim-mag-z-periodic"></div>
        `;
      }
    });
  } else if (hash === '#/encounter') {
    initEncounterCalc(document.querySelector('#encounter-calc-container'));
  } else if (hash === '#/catch-rate') {
    initCatchRateCalc(document.querySelector('#catch-rate-calc-container'));
  } else if (hash === '#/shiny-odds') {
    initShinyOddsCalc(document.querySelector('#shiny-odds-calc-container'));
  } else if (hash === '#/pokemon-lookup') {
    initPokemonLookup(document.querySelector('#pokemon-lookup-container'));
  } else if (hash === '#/info/shiny-hunting') {
    initShinyHuntingGuide(document.querySelector('#shiny-hunting-guide-container'));
  } else if (hash === '#/info/sos-hunting') {
    initSosHuntingGuide(document.querySelector('#sos-hunting-guide-container'));
  } else if (hash === '#/info/mmo-guide') {
    initMmoGuide(document.querySelector('#mmo-guide-container'));
  } else if (hash === '#/sos-tracker') {
    initSosMoveTracker(document.querySelector('#sos-move-tracker-container'));
  } else if (hash === '#/mmo-permutations') {
    initMmoPermutations(document.querySelector('#mmo-permutations-container'));
  } else if (hash === '#/ribbon-tracker') {
    initRibbonTracker(document.querySelector('#ribbon-tracker-container'));
  }
};

renderNavbar();
renderPage();

window.addEventListener('hashchange', renderPage);
