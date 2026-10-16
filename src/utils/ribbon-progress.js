import { RIBBONS, ORIGIN_GAMES, isEligible, RIBBON_GAMES, isGen34BattleRibbon, getRecurringRibbonAppearances } from './ribbon-data.js';
import { isKnownMythicalPokemonId, isKnownLegendaryPokemonId } from './pokemon-data.js';

// Maps originGameId to the PokeAPI version-group slug(s) for that game.
export const ORIGIN_GAME_VERSION_GROUPS = {
  rse: ['ruby-sapphire', 'emerald'],
  frlg: ['firered-leafgreen'],
  colo: ['colosseum'],
  xd: ['xd'],
  dppt: ['diamond-pearl', 'platinum'],
  hgss: ['heartgold-soulsilver'],
  bw_b2w2: ['black-white', 'black-2-white-2'],
  xy: ['x-y'],
  oras: ['omega-ruby-alpha-sapphire'],
  sm_usum: ['sun-moon', 'ultra-sun-ultra-moon'],
  lgpe: ['lets-go-pikachu-lets-go-eevee'],
  swsh: ['sword-shield'],
  bdsp: ['brilliant-diamond-shining-pearl'],
  pla: ['legends-arceus'],
  sv: ['scarlet-violet'],
};

/**
 * Merges PokeAPI availability with the origin game's guaranteed version groups.
 */
export const mergeAvailableGames = (apiGames, originGameId) => {
  const merged = new Set(apiGames);
  const originGroups = ORIGIN_GAME_VERSION_GROUPS[originGameId] || [];
  originGroups.forEach(vg => merged.add(vg));
  return merged;
};

export const getPokemonStateFromEntry = (entry) => {
  const isMythical = Boolean(entry.isMythical) || isKnownMythicalPokemonId(entry.speciesId);
  const allowMythicalRanked = typeof entry.allowMythicalRanked === 'boolean'
    ? entry.allowMythicalRanked
    : (Array.isArray(entry.collectedRibbons) && entry.collectedRibbons.includes('gen8_master_rank'));

  return {
    speciesId: entry.speciesId,
    speciesName: entry.speciesName,
    originGameId: entry.originGameId,
    gen: parseInt(entry.originGen),
    isShadow: entry.originGameId === 'colo' || entry.originGameId === 'xd',
    isMythical,
    isLegendary: Boolean(entry.isLegendary) || isKnownLegendaryPokemonId(entry.speciesId),
    allowMythicalRanked,
    collectedRibbons: Array.isArray(entry.collectedRibbons) ? entry.collectedRibbons : [],
    availableGames: mergeAvailableGames(
      Array.isArray(entry.availableGames) ? entry.availableGames : [],
      entry.originGameId
    )
  };
};

export const getEligibleStandardRibbons = (pokemonState) => (
  RIBBONS.filter(ribbon => isEligible(pokemonState, ribbon) && !ribbon.isAutomated)
);

export const getGen34BattleRibbonIds = (pokemonState) => (
  getEligibleStandardRibbons(pokemonState)
    .filter(ribbon => isGen34BattleRibbon(ribbon))
    .map(ribbon => ribbon.id)
);

/**
 * Calculates ribbon totals and earned counts for all generations a Pokemon is eligible for.
 * @param {Object} entry - Pokemon entry object
 * @returns {Array<Object>} Generation stats list
 */
export function calculateEntryGenerations(entry) {
  if (!entry) return [];
  const pokemonState = getPokemonStateFromEntry(entry);
  const collectedRibbons = Array.isArray(entry.collectedRibbons) ? entry.collectedRibbons : [];

  let automatedRibbons = [];
  if (pokemonState.gen <= 4) {
    const contestRibbonIds = RIBBONS.filter(r => (r.gen === 3 || r.gen === 4) && r.name.includes('Contest')).map(r => r.id);
    const collectedContestCount = collectedRibbons.filter(id => contestRibbonIds.includes(id)).length;
    if (collectedContestCount > 0) {
      const isContestGold = collectedContestCount === 40;
      automatedRibbons.push({
        id: 'gen6_contest_memory',
        name: isContestGold ? 'Contest Memory Ribbon (Gold)' : 'Contest Memory Ribbon',
        game: RIBBON_GAMES.XY,
        gen: 6,
        isEarned: true,
        isAutomated: true,
        isGold: isContestGold
      });
    }

    const battleRibbonIds = getGen34BattleRibbonIds(pokemonState);
    const collectedBattleCount = collectedRibbons.filter(id => battleRibbonIds.includes(id)).length;
    if (collectedBattleCount > 0) {
      const isBattleGold = collectedBattleCount >= 7;
      automatedRibbons.push({
        id: 'gen6_battle_memory',
        name: isBattleGold ? 'Battle Memory Ribbon (Gold)' : 'Battle Memory Ribbon',
        game: RIBBON_GAMES.XY,
        gen: 6,
        isEarned: true,
        isAutomated: true,
        isGold: isBattleGold
      });
    }
  }

  const grouped = {};
  RIBBONS.forEach(ribbon => {
    if (!isEligible(pokemonState, ribbon) && !ribbon.isAutomated) return;
    if (ribbon.isAutomated) return;

    if (!ribbon.isRecurring) {
      let genLabel = `Generation ${ribbon.gen}`;
      let gameLabel = ribbon.game;

      if (ribbon.game === 'Colosseum / XD') {
        genLabel = 'Generation 3';
      }

      if (!grouped[genLabel]) grouped[genLabel] = {};
      if (!grouped[genLabel][gameLabel]) grouped[genLabel][gameLabel] = [];
      grouped[genLabel][gameLabel].push(ribbon);
    } else {
      const appearances = getRecurringRibbonAppearances(ribbon, pokemonState);
      if (appearances.length === 0) return;

      const isCollected = collectedRibbons.includes(ribbon.id);
      const earnedGen = entry.ribbonEarnedInGen?.[ribbon.id];
      const matchedApp = appearances.find(app => app.gen === earnedGen) || appearances[0];

      appearances.forEach(app => {
        const genLabel = `Generation ${app.gen}`;
        const gameLabel = app.game;
        const isHidden = isCollected && app.gen !== matchedApp.gen;

        if (!grouped[genLabel]) grouped[genLabel] = {};
        if (!grouped[genLabel][gameLabel]) grouped[genLabel][gameLabel] = [];
        grouped[genLabel][gameLabel].push({
          ...ribbon,
          gen: app.gen,
          game: app.game,
          isHidden
        });
      });
    }
  });

  automatedRibbons.forEach(ar => {
    const genLabel = `Generation ${ar.gen}`;
    if (!grouped[genLabel]) grouped[genLabel] = {};
    if (!grouped[genLabel][ar.game]) grouped[genLabel][ar.game] = [];
    grouped[genLabel][ar.game].unshift(ar);
  });

  const sortedGenKeys = Object.keys(grouped)
    .filter(cat => cat.startsWith('Generation '))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return sortedGenKeys.map(genCategory => {
    const gamesObj = grouped[genCategory];
    const ribbonsInCategory = Object.values(gamesObj).flat();
    let totalInGen = 0;
    let earnedInGen = 0;

    ribbonsInCategory.forEach(r => {
      if (r.isHidden) return;
      if (r.isAutomated) {
        if (r.isEarned) {
          totalInGen++;
          earnedInGen++;
        }
      } else {
        totalInGen++;
        if (collectedRibbons.includes(r.id)) {
          earnedInGen++;
        }
      }
    });

    const isGen3 = genCategory === 'Generation 3';
    const genNum = parseInt(genCategory.replace('Generation ', ''), 10);
    const missableRibbons = ribbonsInCategory.filter(r => {
      if (r.isAutomated || r.isOptionalExtra || r.isHidden) return false;
      if (!r.isRecurring) return true;
      const appearances = getRecurringRibbonAppearances(r, pokemonState);
      return !appearances.some(app => app.gen > genNum);
    });
    const allMissableCollected = missableRibbons.length === 0 || missableRibbons.every(r => collectedRibbons.includes(r.id));
    const canMarkDone = !isGen3 && allMissableCollected;
    const isManualDone = canMarkDone && Array.isArray(entry.manualCompletedGens) && entry.manualCompletedGens.includes(genCategory);
    const isNaturallyCompleted = totalInGen > 0 && earnedInGen > 0 && earnedInGen === totalInGen;
    const isCompleted = isNaturallyCompleted || isManualDone;

    return {
      category: genCategory,
      genNum,
      earned: earnedInGen,
      total: totalInGen,
      isCompleted,
      isNaturallyCompleted,
      isManualDone
    };
  });
}

/**
 * Determines which generation is the Pokemon's current active generation.
 * Defaults to the first incomplete generation (or last if all completed),
 * unless user explicitly selected one.
 */
export function getCurrentGenerationForEntry(entry, genStatsList = null) {
  const statsList = genStatsList || calculateEntryGenerations(entry);
  if (!statsList || statsList.length === 0) return null;

  if (entry?.currentGen && entry.currentGen !== 'auto') {
    const found = statsList.find(g => g.genNum == entry.currentGen || g.category === entry.currentGen);
    if (found) return found;
  }

  // Find first incomplete generation
  const firstIncomplete = statsList.find(g => !g.isCompleted);
  if (firstIncomplete) return firstIncomplete;

  // Otherwise, return last generation
  return statsList[statsList.length - 1];
}

export function getPokemonSpriteUrl(speciesId, isShiny = false) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? 'shiny/' : ''}${speciesId}.png`;
}
