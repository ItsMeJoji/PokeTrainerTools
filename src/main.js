import './assets/styles/style.css'
import { initTheme, toggleTheme } from './utils/mode-toggle.js'
import { initEncounterCalc } from './features/encounter-calc.js'
import { initCatchRateCalc } from './features/catch-rate-calc.js'

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

const renderPage = () => {
  const hash = window.location.hash || '#/';
  const app = document.querySelector('#app');

  const content = (() => {
    if (hash === '#/' || hash === '') {
      return `
        <div class="flex flex-col items-center">
          <h1 class="mb-4 text-4xl font-extrabold tracking-tight">Poké Trainer Tools</h1>
          <p class="mb-8 text-lg text-gray-500 dark:text-gray-400">Welcome to your ultimate companion for Pokemon training. Explore our tools to optimize your experience!</p>
        </div>
      `;
    } else if (hash === '#/encounter') {
      // Encounter Calc handles its own initial innerHTML but we'll wrap it
      return `<div id="encounter-calc-container"></div>`;
    } else if (hash === '#/catch-rate') {
      return `<div id="catch-rate-calc-container"></div>`;
    } else if (hash === '#/shiny-odds') {
      return `
        <div class="text-left max-w-2xl mx-auto">
          <h1 class="mb-6 text-4xl text-black dark:text-white font-extrabold text-shadow-lg text-center">Shiny Odds Calculator</h1>
          <p class="mb-4 text-center">Determine the odds of finding a shiny Pokemon with different methods like Masuda, SOS streaks, or Shiny Charm.</p>
          <div class="p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center text-gray-400">
            Shiny Odds Calculator Coming Soon
          </div>
        </div>
      `;
    } else {
      return `<h1>404 - Page Not Found</h1><a href="#/">Go Home</a>`;
    }
  })();

  app.innerHTML = `
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-5xl">
      ${content}
    </div>
  `;

  if (hash === '#/encounter') {
    initEncounterCalc(document.querySelector('#encounter-calc-container'));
  } else if (hash === '#/catch-rate') {
    initCatchRateCalc(document.querySelector('#catch-rate-calc-container'));
  }
};

renderNavbar();
renderPage();

window.addEventListener('hashchange', renderPage);
