/**
 * Ribbon and Mark data for PokeTrainer Tools.
 * Categorized by specific games and sources.
 */

export const RIBBON_GAMES = {
  RS_E: 'Ruby / Sapphire / Emerald',
  COLO_XD: 'Colosseum / XD',
  DP_PT: 'Diamond / Pearl / Platinum',
  HG_SS: 'HeartGold / SoulSilver',
  XY: 'X / Y',
  OR_AS: 'Omega Ruby / Alpha Sapphire',
  SM_USUM: 'Sun / Moon / Ultra Sun / Ultra Moon',
  SW_SH: 'Sword / Shield',
  BD_SP: 'Brilliant Diamond / Sparkling Pearl',
  PLA: 'Legends: Arceus',
  SV: 'Scarlet / Violet',
  MARKS: 'Marks'
};

export const ORIGIN_GAMES = [
  { id: 'rse', name: 'Ruby / Sapphire / Emerald', gen: 3 },
  { id: 'frlg', name: 'FireRed / LeafGreen', gen: 3 },
  { id: 'colo', name: 'Colosseum', gen: 3, isShadow: true },
  { id: 'xd', name: 'XD: Gale of Darkness', gen: 3, isShadow: true },
  { id: 'dppt', name: 'Diamond / Pearl / Platinum', gen: 4 },
  { id: 'hgss', name: 'HeartGold / SoulSilver', gen: 4 },
  { id: 'bw_b2w2', name: 'Black / White / B2 / W2', gen: 5 },
  { id: 'xy', name: 'X / Y', gen: 6 },
  { id: 'oras', name: 'Omega Ruby / Alpha Sapphire', gen: 6 },
  { id: 'sm_usum', name: 'Sun / Moon / Ultra Sun / Ultra Moon', gen: 7 },
  { id: 'lgpe', name: "Let's Go Pikachu / Eevee", gen: 7 },
  { id: 'swsh', name: 'Sword / Shield', gen: 8 },
  { id: 'bdsp', name: 'Brilliant Diamond / Shining Pearl', gen: 8 },
  { id: 'pla', name: 'Legends: Arceus', gen: 8 },
  { id: 'sv', name: 'Scarlet / Violet', gen: 9 }
];

export const RIBBONS = [
  // --- Generation 3 ---
  { id: 'gen3_champion', name: 'Champion Ribbon', game: RIBBON_GAMES.RS_E, description: 'Defeat the Champion.', gen: 3 },
  { id: 'gen3_cool_normal', name: 'Cool Contest (Normal)', game: RIBBON_GAMES.RS_E, description: 'Win Normal Rank Cool Contest.', gen: 3 },
  { id: 'gen3_cool_super', name: 'Cool Contest (Super)', game: RIBBON_GAMES.RS_E, description: 'Win Super Rank Cool Contest.', gen: 3 },
  { id: 'gen3_cool_hyper', name: 'Cool Contest (Hyper)', game: RIBBON_GAMES.RS_E, description: 'Win Hyper Rank Cool Contest.', gen: 3 },
  { id: 'gen3_cool_master', name: 'Cool Contest (Master)', game: RIBBON_GAMES.RS_E, description: 'Win Master Rank Cool Contest.', gen: 3 },
  { id: 'gen3_beauty_normal', name: 'Beauty Contest (Normal)', game: RIBBON_GAMES.RS_E, description: 'Win Normal Rank Beauty Contest.', gen: 3 },
  { id: 'gen3_beauty_super', name: 'Beauty Contest (Super)', game: RIBBON_GAMES.RS_E, description: 'Win Super Rank Beauty Contest.', gen: 3 },
  { id: 'gen3_beauty_hyper', name: 'Beauty Contest (Hyper)', game: RIBBON_GAMES.RS_E, description: 'Win Hyper Rank Beauty Contest.', gen: 3 },
  { id: 'gen3_beauty_master', name: 'Beauty Contest (Master)', game: RIBBON_GAMES.RS_E, description: 'Win Master Rank Beauty Contest.', gen: 3 },
  { id: 'gen3_cute_normal', name: 'Cute Contest (Normal)', game: RIBBON_GAMES.RS_E, description: 'Win Normal Rank Cute Contest.', gen: 3 },
  { id: 'gen3_cute_super', name: 'Cute Contest (Super)', game: RIBBON_GAMES.RS_E, description: 'Win Super Rank Cute Contest.', gen: 3 },
  { id: 'gen3_cute_hyper', name: 'Cute Contest (Hyper)', game: RIBBON_GAMES.RS_E, description: 'Win Hyper Rank Cute Contest.', gen: 3 },
  { id: 'gen3_cute_master', name: 'Cute Contest (Master)', game: RIBBON_GAMES.RS_E, description: 'Win Master Rank Cute Contest.', gen: 3 },
  { id: 'gen3_smart_normal', name: 'Smart Contest (Normal)', game: RIBBON_GAMES.RS_E, description: 'Win Normal Rank Smart Contest.', gen: 3 },
  { id: 'gen3_smart_super', name: 'Smart Contest (Super)', game: RIBBON_GAMES.RS_E, description: 'Win Super Rank Smart Contest.', gen: 3 },
  { id: 'gen3_smart_hyper', name: 'Smart Contest (Hyper)', game: RIBBON_GAMES.RS_E, description: 'Win Hyper Rank Smart Contest.', gen: 3 },
  { id: 'gen3_smart_master', name: 'Smart Contest (Master)', game: RIBBON_GAMES.RS_E, description: 'Win Master Rank Smart Contest.', gen: 3 },
  { id: 'gen3_tough_normal', name: 'Tough Contest (Normal)', game: RIBBON_GAMES.RS_E, description: 'Win Normal Rank Tough Contest.', gen: 3 },
  { id: 'gen3_tough_super', name: 'Tough Contest (Super)', game: RIBBON_GAMES.RS_E, description: 'Win Super Rank Tough Contest.', gen: 3 },
  { id: 'gen3_tough_hyper', name: 'Tough Contest (Hyper)', game: RIBBON_GAMES.RS_E, description: 'Win Hyper Rank Tough Contest.', gen: 3 },
  { id: 'gen3_tough_master', name: 'Tough Contest (Master)', game: RIBBON_GAMES.RS_E, description: 'Win Master Rank Tough Contest.', gen: 3 },
  { id: 'gen3_winning', name: 'Winning Ribbon', game: RIBBON_GAMES.RS_E, description: 'Win 50 consecutive Lv 50 battles in Battle Tower.', gen: 3 },
  { id: 'gen3_victory', name: 'Victory Ribbon', game: RIBBON_GAMES.RS_E, description: 'Win 50 consecutive Lv 100 battles in Battle Tower.', gen: 3 },
  { id: 'gen3_artist', name: 'Artist Ribbon', game: RIBBON_GAMES.RS_E, description: 'Win Master Rank Contest with high score.', gen: 3 },
  { id: 'gen3_effort', name: 'Effort Ribbon', game: RIBBON_GAMES.RS_E, description: 'Reach 510 EVs.', gen: 3, isRecurring: true },

  // --- Colosseum / XD ---
  { id: 'gen3_national', name: 'National Ribbon', game: RIBBON_GAMES.COLO_XD, description: 'Purify a Shadow Pokemon.', gen: 3, exclusiveSource: 'Colosseum/XD' },
  { id: 'gen3_earth', name: 'Earth Ribbon', game: RIBBON_GAMES.COLO_XD, description: 'Full Mt. Battle clear.', gen: 3 },

  // --- Generation 4 ---
  { id: 'gen4_champion', name: 'Sinnoh Champion Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Defeat the Sinnoh Champion.', gen: 4 },
  { id: 'gen4_cool_super_normal', name: 'Cool Super Contest (Normal)', game: RIBBON_GAMES.DP_PT, description: 'Win Normal Rank Cool Super Contest.', gen: 4 },
  { id: 'gen4_cool_super_great', name: 'Cool Super Contest (Great)', game: RIBBON_GAMES.DP_PT, description: 'Win Great Rank Cool Super Contest.', gen: 4 },
  { id: 'gen4_cool_super_ultra', name: 'Cool Super Contest (Ultra)', game: RIBBON_GAMES.DP_PT, description: 'Win Ultra Rank Cool Super Contest.', gen: 4 },
  { id: 'gen4_cool_super_master', name: 'Cool Super Contest (Master)', game: RIBBON_GAMES.DP_PT, description: 'Win Master Rank Cool Super Contest.', gen: 4 },
  { id: 'gen4_beauty_super_normal', name: 'Beauty Super Contest (Normal)', game: RIBBON_GAMES.DP_PT, description: 'Win Normal Rank Beauty Super Contest.', gen: 4 },
  { id: 'gen4_beauty_super_great', name: 'Beauty Super Contest (Great)', game: RIBBON_GAMES.DP_PT, description: 'Win Great Rank Beauty Super Contest.', gen: 4 },
  { id: 'gen4_beauty_super_ultra', name: 'Beauty Super Contest (Ultra)', game: RIBBON_GAMES.DP_PT, description: 'Win Ultra Rank Beauty Super Contest.', gen: 4 },
  { id: 'gen4_beauty_super_master', name: 'Beauty Super Contest (Master)', game: RIBBON_GAMES.DP_PT, description: 'Win Master Rank Beauty Super Contest.', gen: 4 },
  { id: 'gen4_cute_super_normal', name: 'Cute Super Contest (Normal)', game: RIBBON_GAMES.DP_PT, description: 'Win Normal Rank Cute Super Contest.', gen: 4 },
  { id: 'gen4_cute_super_great', name: 'Cute Super Contest (Great)', game: RIBBON_GAMES.DP_PT, description: 'Win Great Rank Cute Super Contest.', gen: 4 },
  { id: 'gen4_cute_super_ultra', name: 'Cute Super Contest (Ultra)', game: RIBBON_GAMES.DP_PT, description: 'Win Ultra Rank Cute Super Contest.', gen: 4 },
  { id: 'gen4_cute_super_master', name: 'Cute Super Contest (Master)', game: RIBBON_GAMES.DP_PT, description: 'Win Master Rank Cute Super Contest.', gen: 4 },
  { id: 'gen4_smart_super_normal', name: 'Smart Super Contest (Normal)', game: RIBBON_GAMES.DP_PT, description: 'Win Normal Rank Smart Super Contest.', gen: 4 },
  { id: 'gen4_smart_super_great', name: 'Smart Super Contest (Great)', game: RIBBON_GAMES.DP_PT, description: 'Win Great Rank Smart Super Contest.', gen: 4 },
  { id: 'gen4_smart_super_ultra', name: 'Smart Super Contest (Ultra)', game: RIBBON_GAMES.DP_PT, description: 'Win Ultra Rank Smart Super Contest.', gen: 4 },
  { id: 'gen4_smart_super_master', name: 'Smart Super Contest (Master)', game: RIBBON_GAMES.DP_PT, description: 'Win Master Rank Smart Super Contest.', gen: 4 },
  { id: 'gen4_tough_super_normal', name: 'Tough Super Contest (Normal)', game: RIBBON_GAMES.DP_PT, description: 'Win Normal Rank Tough Super Contest.', gen: 4 },
  { id: 'gen4_tough_super_great', name: 'Tough Super Contest (Great)', game: RIBBON_GAMES.DP_PT, description: 'Win Great Rank Tough Super Contest.', gen: 4 },
  { id: 'gen4_tough_super_ultra', name: 'Tough Super Contest (Ultra)', game: RIBBON_GAMES.DP_PT, description: 'Win Ultra Rank Tough Super Contest.', gen: 4 },
  { id: 'gen4_tough_super_master', name: 'Tough Super Contest (Master)', game: RIBBON_GAMES.DP_PT, description: 'Win Master Rank Tough Super Contest.', gen: 4 },
  { id: 'gen4_ability', name: 'Ability Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Beat Palmer (21 streak).', gen: 4 },
  { id: 'gen4_great_ability', name: 'Great Ability Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Beat Palmer (49 streak).', gen: 4 },
  { id: 'gen4_double_ability', name: 'Double Ability Ribbon', game: RIBBON_GAMES.DP_PT, description: '50 streak in Battle Tower Double Challenge.', gen: 4 },
  { id: 'gen4_multi_ability', name: 'Multi Ability Ribbon', game: RIBBON_GAMES.DP_PT, description: '50 streak in Battle Tower Multi Challenge.', gen: 4 },
  { id: 'gen4_pair_ability', name: 'Pair Ability Ribbon', game: RIBBON_GAMES.DP_PT, description: '50 streak in Battle Tower Link Multi Challenge.', gen: 4 },
  { id: 'gen4_world_ability', name: 'World Ability Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Reach Rank 5 in Wi-Fi Battle Tower.', gen: 4 },
  { id: 'gen4_footprint', name: 'Footprint Ribbon', game: RIBBON_GAMES.DP_PT, description: 'High friendship.', gen: 4, isRecurring: true },
  { id: 'gen4_gorgeous', name: 'Gorgeous Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Purchased at the Ribbon Syndicate for 10,000 Poké Dollars.', gen: 4, isRecurring: true },
  { id: 'gen4_royal', name: 'Royal Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Purchased at the Ribbon Syndicate for 100,000 Poké Dollars.', gen: 4, isRecurring: true },
  { id: 'gen4_gorgeous_royal', name: 'Gorgeous Royal Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Purchased at the Ribbon Syndicate for 999,999 Poké Dollars.', gen: 4, isRecurring: true },

  // --- Days of the Week (Gen 4) ---
  { id: 'gen4_alert', name: 'Alert Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Talk to Week Siblings (Monday).', gen: 4, isRecurring: true },
  { id: 'gen4_shock', name: 'Shock Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Talk to Week Siblings (Tuesday).', gen: 4, isRecurring: true },
  { id: 'gen4_downcast', name: 'Downcast Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Talk to Week Siblings (Wednesday).', gen: 4, isRecurring: true },
  { id: 'gen4_careless', name: 'Careless Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Talk to Week Siblings (Thursday).', gen: 4, isRecurring: true },
  { id: 'gen4_relax', name: 'Relax Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Talk to Week Siblings (Friday).', gen: 4, isRecurring: true },
  { id: 'gen4_snooze', name: 'Snooze Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Talk to Week Siblings (Saturday).', gen: 4, isRecurring: true },
  { id: 'gen4_smile', name: 'Smile Ribbon', game: RIBBON_GAMES.DP_PT, description: 'Talk to Week Siblings (Sunday).', gen: 4, isRecurring: true },

  // --- Gen 4 HeartGold / SoulSilver Exclusives ---
  { id: 'gen4_legend', name: 'Legend Ribbon', game: RIBBON_GAMES.HG_SS, description: 'Defeat Red on Mt. Silver.', gen: 4 },

  // --- Generation 6 ---
  { id: 'gen6_kalos_champion', name: 'Kalos Champion Ribbon', game: RIBBON_GAMES.XY, description: 'Defeat the Kalos Champion.', gen: 6 },
  { id: 'gen6_skillful_battler', name: 'Skillful Battler Ribbon', game: RIBBON_GAMES.XY, description: 'Beat Battle Maison Chatelaine (Regular).', gen: 6 },
  { id: 'gen6_expert_battler', name: 'Expert Battler Ribbon', game: RIBBON_GAMES.XY, description: 'Beat Battle Maison Chatelaine (Super).', gen: 6 },
  { id: 'gen6_training', name: 'Training Ribbon', game: RIBBON_GAMES.XY, description: 'Complete all Super Training.', gen: 6 },
  { id: 'gen6_best_friends', name: 'Best Friends Ribbon', game: RIBBON_GAMES.XY, description: 'Max affection in Amie/Refresh.', gen: 6, isRecurring: true },
  { id: 'gen6_hoenn_champion', name: 'Hoenn Champion Ribbon', game: RIBBON_GAMES.OR_AS, description: 'Defeat the Hoenn Champion in ORAS.', gen: 6 },
  { id: 'gen6_contest_memory', name: 'Contest Memory Ribbon', game: RIBBON_GAMES.XY, description: 'A Ribbon awarded to a Pokémon that has overcome many challenges in Contests in the distant past.', gen: 6, isAutomated: true },
  { id: 'gen6_battle_memory', name: 'Battle Memory Ribbon', game: RIBBON_GAMES.XY, description: 'A Ribbon awarded to a Pokémon that has overcome many challenges in Battle Towers in the distant past.', gen: 6, isAutomated: true },
  { id: 'gen6_coolness_master', name: 'Coolness Master Ribbon', game: RIBBON_GAMES.OR_AS, description: 'Win Master Rank Coolness Contest.', gen: 6 },
  { id: 'gen6_beauty_master', name: 'Beauty Master Ribbon', game: RIBBON_GAMES.OR_AS, description: 'Win Master Rank Beauty Contest.', gen: 6 },
  { id: 'gen6_cuteness_master', name: 'Cuteness Master Ribbon', game: RIBBON_GAMES.OR_AS, description: 'Win Master Rank Cuteness Contest.', gen: 6 },
  { id: 'gen6_smartness_master', name: 'Smartness Master Ribbon', game: RIBBON_GAMES.OR_AS, description: 'Win Master Rank Smartness Contest.', gen: 6 },
  { id: 'gen6_toughness_master', name: 'Toughness Master Ribbon', game: RIBBON_GAMES.OR_AS, description: 'Win Master Rank Toughness Contest.', gen: 6 },
  { id: 'gen6_contest_star', name: 'Contest Star Ribbon', game: RIBBON_GAMES.OR_AS, description: 'Win all 5 Master Rank Contests in ORAS.', gen: 6 },

  // --- Generation 7 ---
  { id: 'gen7_alola_champion', name: 'Alola Champion Ribbon', game: RIBBON_GAMES.SM_USUM, description: 'Defeat the Alola Champion.', gen: 7 },
  { id: 'gen7_battle_royal', name: 'Battle Royal Master', game: RIBBON_GAMES.SM_USUM, description: 'Win Master Rank Battle Royal.', gen: 7 },
  { id: 'gen7_battle_tree_great', name: 'Great Battle Tree Ribbon', game: RIBBON_GAMES.SM_USUM, description: 'Beat Battle Tree Legend (20).', gen: 7 },
  { id: 'gen7_battle_tree_master', name: 'Master Battle Tree Ribbon', game: RIBBON_GAMES.SM_USUM, description: 'Beat Battle Tree Legend (50).', gen: 7 },

  // --- Generation 8 ---
  { id: 'gen8_master_rank', name: 'Master Rank Ribbon', game: RIBBON_GAMES.SW_SH, description: 'Reach Master Ball Tier in Ranked.', gen: 8, versionGroup: 'sword-shield', isRecurring: true },
  { id: 'gen8_galar_champion', name: 'Galar Champion Ribbon', game: RIBBON_GAMES.SW_SH, description: 'Defeat The Champion Cup.', gen: 8, versionGroup: 'sword-shield' },
  { id: 'gen8_tower_master', name: 'Tower Master Ribbon', game: RIBBON_GAMES.SW_SH, description: 'Defeat Leon in one of the higher tiers of the Battle Tower.', gen: 8, versionGroup: 'sword-shield' },
  { id: 'gen8_hisui', name: 'Hisui Ribbon', game: RIBBON_GAMES.PLA, description: 'Pose for a Photograph in Jubilife Village.', gen: 8, versionGroup: 'legends-arceus' },
  { id: 'gen8_twinkling_star', name: 'Twinkling Star Ribbon', game: RIBBON_GAMES.BD_SP, description: 'Win all 5 Master Rank Contests in BD/SP.', gen: 8, versionGroup: 'brilliant-diamond-shining-pearl' },

  // --- Generation 9 ---
  { id: 'gen9_paldea_champion', name: 'Paldea Champion Ribbon', game: RIBBON_GAMES.SV, description: 'Win the Ace Academy Tournament.', gen: 9, versionGroup: 'scarlet-violet' },

  // --- Marks ---
  { id: 'mark_itemfinder', name: 'Itemfinder Mark', game: RIBBON_GAMES.MARKS, description: 'Randomly given after Pokémon find items in Let\'s Go mode.', gen: 9, versionGroup: 'scarlet-violet' },
  { id: 'mark_gourmand', name: 'Gourmand Mark', game: RIBBON_GAMES.MARKS, description: 'Make sandwiches with the Pokémon Purchase a food item in a shop/stall.', gen: 9, versionGroup: 'scarlet-violet' },
  { id: 'mark_partner', name: 'Partner Mark', game: RIBBON_GAMES.MARKS, description: 'Have your Pokémon\'s friendship be at 200 or higher - Randomly added after walking around with it.', gen: 9, versionGroup: 'scarlet-violet' }
];

/**
 * Checks if a Pokemon can obtain a specific ribbon based on its origin and the ribbon's gen.
 */
export function isEligible(pokemonState, ribbon) {
  // If the ribbon requires the pokemon to be in a specific game it's not available in, return false.
  // Only filter if we have availability data; otherwise default to allowing it (handles legacy entries).
  if (ribbon.versionGroup && pokemonState.availableGames && pokemonState.availableGames.size > 0 && !pokemonState.availableGames.has(ribbon.versionGroup)) {
    return false;
  }

  // A Pokemon can only earn ribbons from its origin generation or later.
  // EXCEPT for recurring ribbons (Effort, Footprint, etc) which are available in almost all games.
  if (!ribbon.isRecurring && ribbon.gen < pokemonState.gen) {
    return false;
  }

  // Handle exclusive sources (e.g. National Ribbon from Colosseum/XD)
  // The pokemon must ALSO have originated from that specific game.
  if (ribbon.exclusiveSource === 'Colosseum/XD') {
    return pokemonState.gen === 3 && pokemonState.isShadow;
  }

  return true;
}
