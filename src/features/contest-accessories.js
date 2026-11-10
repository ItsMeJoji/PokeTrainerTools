/**
 * Feature: Gen 4 Super Contest Visual Helper
 * Helps users choose the best accessories for the Visual Competition (Dress Up)
 * based on the selected contest category in Pokemon Diamond, Pearl, and Platinum.
 */

import {
  CONTEST_CATEGORIES,
  CONTEST_ACCESSORIES
} from '../data/contest-accessories.js';

// Load accessory sprites via Vite glob import
const accessoryImages = import.meta.glob('../assets/images/contest-accessories/*.png', {
  eager: true,
  import: 'default'
});

const imageMap = Object.fromEntries(
  Object.entries(accessoryImages).map(([path, url]) => {
    const filename = path.split('/').pop();
    return [filename, url];
  })
);

export function initContestAccessories(container) {
  if (!container) return;

  let selectedThemeId = 'bright';

  // Render initial static shell once (header + dropdown card)
  container.innerHTML = `
    <div class="anim-fade-in max-w-5xl mx-auto space-y-8">
      
      <!-- Header -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100 dark:bg-pink-950/60 border border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300 text-xs sm:text-sm font-bold tracking-wide">
          <i class="fas fa-sparkles text-pink-500"></i> Gen 4 Contests • Visual Competition
        </div>
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Contest Visual <span class="text-pink-500">Helper</span>
        </h1>
        <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
          Choose the best accessories for the visual part of the contest to maximize pink hearts in Pokémon Diamond, Pearl, and Platinum.
        </p>
      </div>

      <!-- Category Dropdown Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 space-y-4">
        <div>
          <label for="theme-select" class="block text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-2">
            Select Category (${CONTEST_CATEGORIES.length} Categories)
          </label>
          <div class="relative">
            <select id="theme-select" class="w-full pl-4 pr-10 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-extrabold text-base sm:text-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all cursor-pointer shadow-sm">
              ${CONTEST_CATEGORIES.map(cat => `
                <option value="${cat.id}" ${cat.id === selectedThemeId ? 'selected' : ''}>
                  ${cat.name}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Category Criteria -->
        <div id="category-criteria" class="pt-3 border-t border-gray-100 dark:border-gray-700/60">
        </div>
      </div>

      <!-- Accessories Section (only this reloads on category change) -->
      <div id="accessories-section" class="space-y-8">
      </div>

    </div>
  `;

  const themeSelect = container.querySelector('#theme-select');
  const criteriaContainer = container.querySelector('#category-criteria');
  const accessoriesSection = container.querySelector('#accessories-section');

  function renderAccessoryCard(item, score) {
    const imgUrl = imageMap[item.file] || '';

    return `
      <div 
        class="accessory-card p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-pink-400 dark:hover:border-pink-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
      >
        <div class="w-16 h-16 flex items-center justify-center p-1 bg-gray-50 dark:bg-gray-900 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          ${imgUrl ? `
            <img 
              src="${imgUrl}" 
              alt="${item.name}" 
              class="max-w-full max-h-full object-contain" 
              style="image-rendering: pixelated; width: 48px; height: 48px;" 
            />
          ` : `<i class="fas fa-image text-gray-400"></i>`}
        </div>
        <span class="text-xs font-extrabold text-gray-900 dark:text-white line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-pink-400">
          ${item.name}
        </span>
        <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
          ${score === 2 ? '+2 pts' : score === 1 ? '+1 pt' : '0 pts'}
        </span>
      </div>
    `;
  }

  function updateAccessories() {
    const currentTheme = CONTEST_CATEGORIES.find(c => c.id === selectedThemeId) || CONTEST_CATEGORIES[0];

    // Update criteria description in place
    if (criteriaContainer) {
      criteriaContainer.innerHTML = `
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <strong class="text-gray-900 dark:text-white">${currentTheme.name} Category:</strong> ${currentTheme.description}
        </p>
      `;
    }

    // Group accessories based on compatibility with the selected category (2 = High, 1 = Good, 0 = Low)
    const highItems = CONTEST_ACCESSORIES.filter(a => a.categories[selectedThemeId] === 2 || a.categories[selectedThemeId] === 'High');
    const goodItems = CONTEST_ACCESSORIES.filter(a => a.categories[selectedThemeId] === 1 || a.categories[selectedThemeId] === 'Good');
    const lowItems = CONTEST_ACCESSORIES.filter(a => a.categories[selectedThemeId] === 0 || a.categories[selectedThemeId] === 'Low');

    if (accessoriesSection) {
      accessoriesSection.innerHTML = `
        <!-- High Scoring (+2 Points) -->
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
            <h3 class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <i class="fas fa-star text-emerald-500"></i>
              High Scoring Accessories (${highItems.length})
            </h3>
            <span class="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
              +2 Points each
            </span>
          </div>

          ${highItems.length > 0 ? `
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              ${highItems.map(item => renderAccessoryCard(item, 2)).join('')}
            </div>
          ` : `
            <div class="p-6 text-center rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
              No accessories currently rated as High for the <strong>${currentTheme.name}</strong> category.
            </div>
          `}
        </div>

        <!-- Good Scoring (+1 Point) -->
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 dark:border-blue-800/60 pb-2">
            <h3 class="text-xl font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <i class="fas fa-check-circle text-blue-500"></i>
              Good Scoring Accessories (${goodItems.length})
            </h3>
            <span class="text-xs font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-300 dark:border-blue-700">
              +1 Point each
            </span>
          </div>

          ${goodItems.length > 0 ? `
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              ${goodItems.map(item => renderAccessoryCard(item, 1)).join('')}
            </div>
          ` : `
            <div class="p-6 text-center rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
              No accessories currently rated as Good for the <strong>${currentTheme.name}</strong> category.
            </div>
          `}
        </div>

        <!-- Low Scoring (+0 Points) -->
        ${lowItems.length > 0 ? `
          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <h3 class="text-xl font-extrabold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <i class="fas fa-minus-circle"></i>
                Low Scoring Accessories (${lowItems.length})
              </h3>
              <span class="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700">
                +0 Points
              </span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              ${lowItems.map(item => renderAccessoryCard(item, 0)).join('')}
            </div>
          </div>
        ` : ''}
      `;
    }
  }

  // Bind change event on persistent dropdown
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      selectedThemeId = e.target.value;
      updateAccessories();
    });
  }

  // Initial populate of accessories
  updateAccessories();
}
