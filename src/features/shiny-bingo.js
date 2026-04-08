import { getPokemonListUpToGeneration, P } from '../utils/pokemon-data.js';
import { getSearchableDropdownHtml, setupSearchableDropdown } from '../utils/ui-utils.js';

const localSpriteModules = import.meta.glob('../assets/images/shiny-bingo/Pokemon/{XY,SM,SS,SV}/*.png', { eager: true, import: 'default' });
const localSpriteMap = Object.fromEntries(
  Object.entries(localSpriteModules).map(([path, url]) => {
    const parts = path.split('/');
    const folder = parts[parts.length - 2];
    const file = parts[parts.length - 1].replace('.png', '');
    return [`${folder}-${file}`, url];
  })
);

const localIconModules = import.meta.glob('../assets/images/shiny-bingo/Icons/*.png', { eager: true, import: 'default' });
const localIconMap = Object.fromEntries(
  Object.entries(localIconModules).map(([path, url]) => [
    path.split('/').pop().replace('.png', ''),
    url
  ])
);

const GAME_OPTIONS = [
  { id: 'all', label: 'All Game Eras', min: 1, max: 1025 },
  { id: 'gsc', label: 'Gold / Silver / Crystal', min: 1, max: 251, spriteSource: 'api', spriteVariants: ['gold', 'silver', 'crystal'], badge: 'GSC', icon: 'GSC', color: 'from-amber-400 to-yellow-600' },
  { id: 'rse', label: 'Ruby / Sapphire / Emerald', min: 1, max: 386, spriteSource: 'api', spriteVariants: ['ruby', 'sapphire', 'emerald'], badge: 'RSE', icon: 'RSE', color: 'from-emerald-500 to-teal-600' },
  { id: 'frlg', label: 'FireRed / LeafGreen', min: 1, max: 386, spriteSource: 'api', spriteVariants: ['firered', 'leafgreen'], badge: 'FRLG', icon: 'FRLG', color: 'from-red-500 to-orange-500' },
  { id: 'dppt', label: 'Diamond / Pearl / Platinum', min: 1, max: 493, spriteSource: 'api', spriteVariants: ['diamond', 'pearl', 'platinum'], badge: 'DPPT', icon: 'DPPT_HGSS', color: 'from-sky-500 to-indigo-600' },
  { id: 'hgss', label: 'HeartGold / SoulSilver', min: 1, max: 493, spriteSource: 'api', spriteVariants: ['heartgold', 'soulsilver'], badge: 'HGSS', icon: 'DPPT_HGSS', color: 'from-yellow-500 to-slate-500' },
  { id: 'bw', label: 'Black / White / B2 / W2', min: 1, max: 649, spriteSource: 'api', spriteVariants: ['black', 'white'], badge: 'BW', icon: 'BW', color: 'from-slate-700 to-slate-900' },
  { id: 'xy', label: 'X / Y', min: 1, max: 721, spriteSource: 'local', localFolder: 'XY', badge: 'XY', icon: 'XY', color: 'from-pink-500 to-fuchsia-600' },
  { id: 'oras', label: 'Omega Ruby / Alpha Sapphire', min: 1, max: 721, spriteSource: 'local', localFolder: 'XY', badge: 'ORAS', icon: 'ORAS', color: 'from-rose-500 to-sky-500' },
  { id: 'sm', label: 'Sun / Moon', min: 1, max: 809, spriteSource: 'local', localFolder: 'SM', badge: 'SM', icon: 'SM', color: 'from-orange-500 to-amber-500' },
  { id: 'usum', label: 'Ultra Sun / Ultra Moon', min: 1, max: 809, spriteSource: 'local', localFolder: 'SM', badge: 'USUM', icon: 'USUM', color: 'from-orange-600 to-purple-600' },
  { id: 'ss', label: 'Sword / Shield', min: 1, max: 905, spriteSource: 'local', localFolder: 'SS', badge: 'SS', icon: 'SS', color: 'from-cyan-500 to-blue-600' },
  { id: 'bdsp', label: 'Brilliant Diamond / Shining Pearl', min: 1, max: 493, spriteSource: 'local', localFolder: 'SS', badge: 'BDSP', icon: 'BDSP', color: 'from-blue-500 to-pink-500' },
  { id: 'lgpe', label: "Let's Go Pikachu / Eevee", min: 1, max: 809, spriteSource: 'local', localFolder: 'SS', badge: 'LGPE', icon: 'LGPE', color: 'from-yellow-400 to-amber-600' },
  { id: 'pla', label: 'Legends: Arceus', min: 1, max: 905, spriteSource: 'local', localFolder: 'SS', badge: 'PLA', icon: 'PLA', color: 'from-slate-500 to-cyan-600' },
  { id: 'sv', label: 'Scarlet / Violet', min: 1, max: 1025, spriteSource: 'local', localFolder: 'SV', badge: 'SV', icon: 'SV', color: 'from-red-500 to-violet-600' },
  { id: 'plza', label: 'Legends Z-A', min: 1, max: 1025, spriteSource: 'local', localFolder: 'SV', badge: 'PLZA', icon: 'PLZA', color: 'from-emerald-500 to-lime-500' }
];

const SPRITE_PATHS = {
  gold: ['generation-ii', 'gold'],
  silver: ['generation-ii', 'silver'],
  crystal: ['generation-ii', 'crystal'],
  ruby: ['generation-iii', 'ruby-sapphire'],
  sapphire: ['generation-iii', 'ruby-sapphire'],
  emerald: ['generation-iii', 'emerald'],
  firered: ['generation-iii', 'firered-leafgreen'],
  leafgreen: ['generation-iii', 'firered-leafgreen'],
  diamond: ['generation-iv', 'diamond-pearl'],
  pearl: ['generation-iv', 'diamond-pearl'],
  platinum: ['generation-iv', 'platinum'],
  heartgold: ['generation-iv', 'heartgold-soulsilver'],
  soulsilver: ['generation-iv', 'heartgold-soulsilver'],
  black: ['generation-v', 'black-white'],
  white: ['generation-v', 'black-white']
};

const pokemonDetailsCache = new Map();
const exportImageDataUrlCache = new Map();

function getBingoHeaderLetterDataUrl(letter) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="224" height="180" viewBox="0 0 224 180">
      <rect width="224" height="180" fill="none" />
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#ffffff"
        font-family="Leelawadee UI, Arial, sans-serif"
        font-size="92"
        font-weight="900"
      >${letter}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function sampleUnique(items, count) {
  const pool = [...items];
  const picked = [];

  while (pool.length > 0 && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }

  return picked;
}

function getSelectedGame(gameId) {
  return GAME_OPTIONS.find(option => option.id === gameId) || GAME_OPTIONS[0];
}

function gameSupportsPokemon(game, pokemonId) {
  if (!game || game.id === 'all') {
    return true;
  }

  if (game.id === 'lgpe') {
    return (pokemonId >= 1 && pokemonId <= 151) || pokemonId === 808 || pokemonId === 809;
  }

  return pokemonId >= game.min && pokemonId <= game.max;
}

function getFilteredPokemon(allPokemon, gameId) {
  const game = getSelectedGame(gameId);
  return allPokemon.filter(pokemon => gameSupportsPokemon(game, pokemon.id));
}

function getRandomGameVariant(gameId, pokemonId) {
  const game = getSelectedGame(gameId);
  if (game.id === 'all') {
    const weightedGames = GAME_OPTIONS.filter(option => option.id !== 'all' && gameSupportsPokemon(option, pokemonId));
    const randomGame = weightedGames[Math.floor(Math.random() * weightedGames.length)];
    const variant = randomGame.spriteVariants
      ? randomGame.spriteVariants[Math.floor(Math.random() * randomGame.spriteVariants.length)]
      : null;
    return { gameId: randomGame.id, variant };
  }

  const variant = game.spriteVariants
    ? game.spriteVariants[Math.floor(Math.random() * game.spriteVariants.length)]
    : null;
  return { gameId: game.id, variant };
}

async function getPokemonDetails(pokemonName) {
  if (pokemonDetailsCache.has(pokemonName)) {
    return pokemonDetailsCache.get(pokemonName);
  }

  const details = await P.getPokemonByName(pokemonName);
  pokemonDetailsCache.set(pokemonName, details);
  return details;
}

function getApiSpriteUrl(details, variant) {
  const spritePath = SPRITE_PATHS[variant];
  if (!spritePath) {
    return null;
  }

  const [generation, version] = spritePath;
  return details.sprites?.versions?.[generation]?.[version]?.front_default || details.sprites?.front_default || null;
}

async function buildBoardCell(pokemon, forcedGameId = null) {
  const gameSelection = getRandomGameVariant(forcedGameId || 'all', pokemon.id);
  const game = getSelectedGame(gameSelection.gameId);
  let sprite = null;

  if (game.spriteSource === 'local') {
    const key = `${game.localFolder}-${String(pokemon.id).padStart(3, '0')}`;
    sprite = localSpriteMap[key] || null;
  } else {
    const details = await getPokemonDetails(pokemon.name);
    sprite = getApiSpriteUrl(details, gameSelection.variant) || details.sprites?.front_default;
  }

  return {
    pokemonId: pokemon.id,
    pokemonName: pokemon.displayName,
    pokemonApiName: pokemon.name,
    gameId: game.id,
    gameLabel: game.badge,
    gameIcon: localIconMap[game.icon] || null,
    gameColor: game.color,
    sprite
  };
}

function getInstructionsHtml() {
  return `
    <div class="space-y-4 text-left text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      <p>Build a 5x5 shiny-hunting bingo board, then use <strong class="text-gray-900 dark:text-white">Game Era Filter</strong> to control which Pokemon can appear. Some games have smaller available rosters, so the board and manual picker both respect those limits.</p>
      <p>Use <strong class="text-gray-900 dark:text-white">Reroll Board</strong> to generate a fresh card, or click any square to open the editor and set an exact Pokemon for that space. The editor now uses only the selected game to decide which Pokemon are valid.</p>
      <p><strong class="text-gray-900 dark:text-white">Export PNG</strong> saves the current board as an image with the BINGO header and game icons. Sprites come from <strong class="text-gray-900 dark:text-white">PokeAPI for Gen 1-5</strong> and the local imported sprite archive for <strong class="text-gray-900 dark:text-white">Gen 6+</strong>.</p>
    </div>
  `;
}

function getCellHtml(cell, index) {
  return `
    <button
      class="shiny-bingo-cell group relative overflow-hidden rounded-none border border-slate-200 dark:border-white/40 bg-white dark:bg-[#4b4f59] p-2 sm:p-3 shadow-[0_10px_26px_rgba(148,163,184,0.24)] hover:shadow-[0_16px_34px_rgba(148,163,184,0.32)] dark:shadow-md dark:hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
      data-index="${index}"
      title="Click to edit this space"
    >
      <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${cell.gameColor} opacity-90"></div>
      <div class="absolute top-1 right-1 sm:top-2 sm:right-2">
        ${cell.gameIcon
          ? `<img src="${cell.gameIcon}" alt="${cell.gameLabel}" class="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white shadow-sm object-cover">`
          : `<span class="inline-flex items-center rounded-md bg-white/90 px-1.5 py-1 text-[9px] font-black tracking-[0.18em] text-gray-700">${cell.gameLabel}</span>`}
      </div>
      <div class="mt-5 sm:mt-6 flex items-center justify-center min-h-24 sm:min-h-28">
        ${cell.sprite
          ? `<img src="${cell.sprite}" alt="${cell.pokemonName}" class="w-20 h-20 object-contain" style="image-rendering: pixelated;">`
          : `<div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700"></div>`}
      </div>
    </button>
  `;
}

function buildExportBoardElement(boardState) {
  const wrapper = document.createElement('div');
  wrapper.style.width = '1120px';
  wrapper.style.padding = '24px';
  wrapper.style.background = 'linear-gradient(180deg, #5b5f69 0%, #424651 100%)';
  wrapper.style.fontFamily = '"Leelawadee UI", system-ui, sans-serif';
  wrapper.style.boxSizing = 'border-box';

  const header = document.createElement('div');
  header.style.display = 'grid';
  header.style.gridTemplateColumns = 'repeat(5, 1fr)';
  header.style.gap = '0';
  header.style.marginBottom = '16px';
  header.style.border = '1px solid rgba(255,255,255,0.4)';

  ['B', 'I', 'N', 'G', 'O'].forEach((letter, index) => {
    const cell = document.createElement('div');
    cell.style.height = '180px';
    cell.style.display = 'flex';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';
    cell.style.padding = '0';
    cell.style.background = 'rgba(255,255,255,0.06)';
    if (index < 4) {
      cell.style.borderRight = '1px solid rgba(255,255,255,0.4)';
    }

    const letterInner = document.createElement('img');
    letterInner.src = getBingoHeaderLetterDataUrl(letter);
    letterInner.alt = letter;
    letterInner.style.display = 'block';
    letterInner.style.width = '100%';
    letterInner.style.height = '100%';
    letterInner.style.objectFit = 'contain';

    cell.appendChild(letterInner);
    header.appendChild(cell);
  });

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
  grid.style.gap = '16px';

  boardState.forEach((entry) => {
    const tile = document.createElement('div');
    tile.style.position = 'relative';
    tile.style.background = '#4b4f59';
    tile.style.border = '1px solid rgba(255,255,255,0.4)';
    tile.style.padding = '12px';
    tile.style.minHeight = '180px';
    tile.style.boxSizing = 'border-box';

    const accent = document.createElement('div');
    accent.style.position = 'absolute';
    accent.style.left = '0';
    accent.style.right = '0';
    accent.style.top = '0';
    accent.style.height = '4px';
    accent.style.background = '#60a5fa';
    tile.appendChild(accent);

    const badgeWrap = document.createElement('div');
    badgeWrap.style.position = 'absolute';
    badgeWrap.style.top = '8px';
    badgeWrap.style.right = '8px';
    if (entry.gameIcon) {
      const icon = document.createElement('img');
      icon.src = entry.gameIcon;
      icon.alt = entry.gameLabel;
      icon.style.width = '34px';
      icon.style.height = '34px';
      icon.style.objectFit = 'cover';
      icon.style.borderRadius = '6px';
      icon.style.background = '#ffffff';
      badgeWrap.appendChild(icon);
    } else {
      const label = document.createElement('div');
      label.textContent = entry.gameLabel;
      label.style.background = 'rgba(255,255,255,0.92)';
      label.style.color = '#374151';
      label.style.padding = '4px 6px';
      label.style.borderRadius = '6px';
      label.style.fontSize = '10px';
      label.style.fontWeight = '900';
      badgeWrap.appendChild(label);
    }
    tile.appendChild(badgeWrap);

    const spriteWrap = document.createElement('div');
    spriteWrap.style.display = 'flex';
    spriteWrap.style.alignItems = 'center';
    spriteWrap.style.justifyContent = 'center';
    spriteWrap.style.minHeight = '132px';
    spriteWrap.style.marginTop = '18px';
    if (entry.sprite) {
      const sprite = document.createElement('img');
      sprite.src = entry.sprite;
      sprite.alt = entry.pokemonName;
      sprite.style.width = '88px';
      sprite.style.height = '88px';
      sprite.style.objectFit = 'contain';
      sprite.style.imageRendering = 'pixelated';
      spriteWrap.appendChild(sprite);
    }
    tile.appendChild(spriteWrap);

    grid.appendChild(tile);
  });

  wrapper.appendChild(header);
  wrapper.appendChild(grid);
  return wrapper;
}

async function getExportSafeImageUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl;
  }

  if (exportImageDataUrlCache.has(imageUrl)) {
    return exportImageDataUrlCache.get(imageUrl);
  }

  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Image request failed: ${response.status}`);
    }

    const blob = await response.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    exportImageDataUrlCache.set(imageUrl, dataUrl);
    return dataUrl;
  } catch (error) {
    console.warn('Failed to convert image for export:', imageUrl, error);
    return imageUrl;
  }
}

export async function initShinyBingo(appContainer) {
  appContainer.innerHTML = `
    <div class="text-center max-w-6xl mx-auto px-4 pb-12">
      <h1 class="mb-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-black dark:text-white text-shadow-lg">Shiny Bingo Generator</h1>
      <p class="mb-8 text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">Generate a shiny-hunting bingo board across every generation, reroll targets, and export the challenge card when the lineup feels right.</p>

      <details class="group mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden text-center">
        <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 list-none [&::-webkit-details-marker]:hidden border-b border-transparent group-open:border-gray-100 dark:group-open:border-gray-700">
          <div class="flex items-center space-x-3">
            <span class="w-1.5 h-6 bg-yellow-500 rounded-full"></span>
            <span class="text-xl font-bold text-gray-900 dark:text-white">How to Use This Tool</span>
          </div>
          <svg class="w-6 h-6 text-gray-400 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </summary>
        <div class="p-6 bg-gray-50/50 dark:bg-gray-900/20">
          ${getInstructionsHtml()}
        </div>
      </details>

      <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="p-6 sm:p-8 bg-gradient-to-br from-amber-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 border-b border-gray-100 dark:border-gray-700">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <label for="bingo-game" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Game Era Filter</label>
              <select id="bingo-game" class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5">
                ${GAME_OPTIONS.map(option => `<option value="${option.id}">${option.label}</option>`).join('')}
              </select>
            </div>
            <div class="flex items-end">
              <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button id="reroll-bingo-board" class="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-black dark:text-white font-black rounded-xl shadow-lg transition-transform active:scale-95">Reroll Board</button>
                <button id="export-bingo-board" class="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-black dark:text-white font-black rounded-xl shadow-lg transition-transform active:scale-95">Export PNG</button>
              </div>
            </div>
          </div>
          <p id="bingo-status" class="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-left"></p>
        </div>

        <div id="bingo-export-area" class="p-4 sm:p-8 bg-[radial-gradient(circle_at_top,#fef3c7,transparent_35%),linear-gradient(180deg,#fffdf5_0%,#ffffff_35%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,#4b5563,transparent_25%),linear-gradient(180deg,#111827_0%,#0f172a_40%,#020617_100%)]">
          <div class="mb-4 grid grid-cols-5 border border-white/40">
            ${['B', 'I', 'N', 'G', 'O'].map(letter => `
              <div class="flex items-center justify-center min-h-16 sm:min-h-20 text-3xl sm:text-5xl font-black tracking-[0.25em] text-slate-700 border-r last:border-r-0 border-slate-200/80 bg-white/70 shadow-[0_8px_20px_rgba(148,163,184,0.16)] dark:text-white dark:border-white/40 dark:bg-white/5 dark:shadow-none">
                ${letter}
              </div>
            `).join('')}
          </div>
          <div id="bingo-board" class="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4"></div>
        </div>
      </div>

      <div id="bingo-cell-editor" class="hidden fixed inset-0 z-50 items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-visible">
          <div class="rounded-t-2xl sm:rounded-t-3xl flex items-start justify-between gap-4 p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
            <div>
              <h3 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white">Set Bingo Space</h3>
              <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Choose a game and Pokemon for this square.</p>
            </div>
            <button id="close-bingo-editor" class="shrink-0 p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="p-4 sm:p-5 space-y-4 sm:space-y-5">
            <div>
              <label for="editor-game" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Game</label>
              <select id="editor-game" class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5">
                ${GAME_OPTIONS.filter(option => option.id !== 'all').map(option => `<option value="${option.id}">${option.label}</option>`).join('')}
              </select>
            </div>
            <div id="editor-pokemon-dropdown-wrap">
              ${getSearchableDropdownHtml('editor-pokemon-dropdown', 'Pokemon', 'Search Pokemon...')}
            </div>
            <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button id="cancel-bingo-editor" class="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-transform active:scale-95">Cancel</button>
              <button id="save-bingo-editor" class="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-black dark:text-white font-bold rounded-xl transition-transform active:scale-95">Set Space</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const gameSelect = document.getElementById('bingo-game');
  const rerollButton = document.getElementById('reroll-bingo-board');
  const exportButton = document.getElementById('export-bingo-board');
  const boardContainer = document.getElementById('bingo-board');
  const statusText = document.getElementById('bingo-status');
  const exportArea = document.getElementById('bingo-export-area');
  const editorModal = document.getElementById('bingo-cell-editor');
  const editorGame = document.getElementById('editor-game');
  const closeEditorButton = document.getElementById('close-bingo-editor');
  const cancelEditorButton = document.getElementById('cancel-bingo-editor');
  const saveEditorButton = document.getElementById('save-bingo-editor');

  let allPokemon = [];
  let boardState = [];
  let editingCellIndex = null;
  let editorPokemonDropdown = null;
  let editorSelectedPokemon = null;

  async function generateBoard() {
    const filteredPokemon = getFilteredPokemon(allPokemon, gameSelect.value);

    if (filteredPokemon.length === 0) {
      boardState = [];
      boardContainer.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 italic">No Pokemon match the current filter.</div>';
      statusText.textContent = 'No valid Pokemon found for that filter combination.';
      return;
    }

    const selectedPokemon = sampleUnique(filteredPokemon, Math.min(25, filteredPokemon.length));
    boardState = await Promise.all(selectedPokemon.map(pokemon => buildBoardCell(pokemon, gameSelect.value === 'all' ? null : gameSelect.value)));
    renderBoard();

    const gameLabel = getSelectedGame(gameSelect.value).label;
    statusText.textContent = `Showing ${boardState.length} targets from ${gameLabel}. Click any tile to set that space manually.`;
  }

  function renderBoard() {
    boardContainer.innerHTML = boardState.map((cell, index) => getCellHtml(cell, index)).join('');
  }

  function updateEditorPokemonOptions() {
    const filteredPokemon = getFilteredPokemon(allPokemon, editorGame.value);
    if (!editorPokemonDropdown) {
      editorPokemonDropdown = setupSearchableDropdown('editor-pokemon-dropdown', filteredPokemon, (pokemon) => {
        editorSelectedPokemon = pokemon;
      }, 'Select Pokemon');
      return;
    }

    editorSelectedPokemon = null;
    editorPokemonDropdown.updateItems(filteredPokemon);
    editorPokemonDropdown.setSelected(null);
  }

  function openEditor(index) {
    editingCellIndex = index;
    const currentCell = boardState[index];
    editorGame.value = currentCell.gameId;
    updateEditorPokemonOptions();

    const currentPokemon = allPokemon.find(pokemon => pokemon.id === currentCell.pokemonId) || null;
    editorSelectedPokemon = currentPokemon;
    if (currentPokemon && editorPokemonDropdown) {
      editorPokemonDropdown.setSelected(currentPokemon);
    }

    editorModal.classList.remove('hidden');
    editorModal.classList.add('flex');
  }

  function closeEditor() {
    editingCellIndex = null;
    editorSelectedPokemon = null;
    editorModal.classList.add('hidden');
    editorModal.classList.remove('flex');
  }

  async function exportBoardAsPng() {
    if (!window.html2canvas) {
      alert('PNG export is not available right now.');
      return;
    }

    exportButton.disabled = true;
    const originalLabel = exportButton.textContent;
    exportButton.textContent = 'Exporting...';

    const exportBoardState = await Promise.all(
      boardState.map(async (entry) => ({
        ...entry,
        sprite: await getExportSafeImageUrl(entry.sprite),
        gameIcon: await getExportSafeImageUrl(entry.gameIcon)
      }))
    );

    const exportNode = buildExportBoardElement(exportBoardState);
    exportNode.style.position = 'fixed';
    exportNode.style.left = '-10000px';
    exportNode.style.top = '0';
    document.body.appendChild(exportNode);

    try {
      const canvas = await window.html2canvas(exportNode, {
        backgroundColor: '#4b4f59',
        scale: 2,
        logging: false
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'shiny-bingo-card.png';
      link.click();
    } catch (error) {
      console.error('Failed to export bingo board:', error);
      alert('Failed to export the bingo board. Please try again.');
    } finally {
      exportNode.remove();
      exportButton.disabled = false;
      exportButton.textContent = originalLabel;
    }
  }

  boardContainer.addEventListener('click', async (event) => {
    const cell = event.target.closest('.shiny-bingo-cell');
    if (!cell) return;

    const index = Number(cell.dataset.index);
    if (Number.isNaN(index)) return;

    openEditor(index);
  });

  rerollButton.addEventListener('click', generateBoard);
  gameSelect.addEventListener('change', generateBoard);
  exportButton.addEventListener('click', exportBoardAsPng);
  editorGame.addEventListener('change', updateEditorPokemonOptions);
  closeEditorButton.addEventListener('click', closeEditor);
  cancelEditorButton.addEventListener('click', closeEditor);
  editorModal.addEventListener('click', (event) => {
    if (event.target.id === 'bingo-cell-editor') {
      closeEditor();
    }
  });
  saveEditorButton.addEventListener('click', async () => {
    if (editingCellIndex === null || !editorSelectedPokemon) {
      return;
    }

    saveEditorButton.disabled = true;
    const originalText = saveEditorButton.textContent;
    saveEditorButton.textContent = 'Setting...';

    try {
      boardState[editingCellIndex] = await buildBoardCell(editorSelectedPokemon, editorGame.value);
      renderBoard();
      closeEditor();
    } finally {
      saveEditorButton.disabled = false;
      saveEditorButton.textContent = originalText;
    }
  });

  statusText.textContent = 'Loading Pokemon pool...';
  allPokemon = await getPokemonListUpToGeneration(9);
  await generateBoard();
}
