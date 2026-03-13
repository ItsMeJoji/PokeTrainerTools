/**
 * Ribbon and Mark data for PokeTrainer Tools.
 * Categorized by specific games and sources.
 */

export const RIBBON_CATEGORIES = {
  RS_E: 'Ruby / Sapphire / Emerald',
  FR_LG: 'FireRed / LeafGreen',
  COLO_XD: 'Colosseum / XD',
  DP_PT: 'Diamond / Pearl / Platinum',
  HG_SS: 'HeartGold / SoulSilver',
  XY: 'X / Y',
  OR_AS: 'Omega Ruby / Alpha Sapphire',
  SM_USUM: 'Sun / Moon / Ultra Sun / Ultra Moon',
  SW_SH: 'Sword / Shield',
  BD_SP: 'Brilliant Diamond / Shining Pearl',
  PLA: 'Legends: Arceus',
  SV: 'Scarlet / Violet',
  GEN9_PALDEA: 'Gen 9 Paldea',
  MARKS: 'Marks'
};

export const ORIGIN_GAMES = [
  { id: 'rby', name: 'Red / Blue / Yellow', gen: 1 },
  { id: 'gsc', name: 'Gold / Silver / Crystal', gen: 2 },
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
  // --- Ruby / Sapphire / Emerald ---
  { id: 'gen3_champion', name: 'Champion Ribbon', category: RIBBON_CATEGORIES.RS_E, description: 'Defeat the Champion in RS/E.', gen: 3 },
  { id: 'gen3_cool_normal', name: 'Cool Contest (Normal)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Normal Rank Cool Contest.', gen: 3 },
  { id: 'gen3_cool_super', name: 'Cool Contest (Super)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Super Rank Cool Contest.', gen: 3 },
  { id: 'gen3_cool_hyper', name: 'Cool Contest (Hyper)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Hyper Rank Cool Contest.', gen: 3 },
  { id: 'gen3_cool_master', name: 'Cool Contest (Master)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Master Rank Cool Contest.', gen: 3 },
  { id: 'gen3_beauty_normal', name: 'Beauty Contest (Normal)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Normal Rank Beauty Contest.', gen: 3 },
  { id: 'gen3_beauty_super', name: 'Beauty Contest (Super)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Super Rank Beauty Contest.', gen: 3 },
  { id: 'gen3_beauty_hyper', name: 'Beauty Contest (Hyper)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Hyper Rank Beauty Contest.', gen: 3 },
  { id: 'gen3_beauty_master', name: 'Beauty Contest (Master)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Master Rank Beauty Contest.', gen: 3 },
  { id: 'gen3_cute_normal', name: 'Cute Contest (Normal)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Normal Rank Cute Contest.', gen: 3 },
  { id: 'gen3_cute_super', name: 'Cute Contest (Super)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Super Rank Cute Contest.', gen: 3 },
  { id: 'gen3_cute_hyper', name: 'Cute Contest (Hyper)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Hyper Rank Cute Contest.', gen: 3 },
  { id: 'gen3_cute_master', name: 'Cute Contest (Master)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Master Rank Cute Contest.', gen: 3 },
  { id: 'gen3_smart_normal', name: 'Smart Contest (Normal)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Normal Rank Smart Contest.', gen: 3 },
  { id: 'gen3_smart_super', name: 'Smart Contest (Super)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Super Rank Smart Contest.', gen: 3 },
  { id: 'gen3_smart_hyper', name: 'Smart Contest (Hyper)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Hyper Rank Smart Contest.', gen: 3 },
  { id: 'gen3_smart_master', name: 'Smart Contest (Master)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Master Rank Smart Contest.', gen: 3 },
  { id: 'gen3_tough_normal', name: 'Tough Contest (Normal)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Normal Rank Tough Contest.', gen: 3 },
  { id: 'gen3_tough_super', name: 'Tough Contest (Super)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Super Rank Tough Contest.', gen: 3 },
  { id: 'gen3_tough_hyper', name: 'Tough Contest (Hyper)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Hyper Rank Tough Contest.', gen: 3 },
  { id: 'gen3_tough_master', name: 'Tough Contest (Master)', category: RIBBON_CATEGORIES.RS_E, description: 'Win Master Rank Tough Contest.', gen: 3 },
  { id: 'gen3_victory', name: 'Victory Ribbon', category: RIBBON_CATEGORIES.RS_E, description: 'Win 50 consecutive battles in Battle Tower.', gen: 3 },
  { id: 'gen3_artist', name: 'Artist Ribbon', category: RIBBON_CATEGORIES.RS_E, description: 'Win Master Rank Contest with high score.', gen: 3 },
  { id: 'gen3_effort', name: 'Effort Ribbon', category: RIBBON_CATEGORIES.RS_E, description: 'Reach 510 EVs.', gen: 3 },

  // --- FireRed / LeafGreen ---
  // (FRLG shares most ribbons with RSE but also has its own Champion ribbon logic in some contexts)
  // For the tracker, we keep them distinct if necessary.
  
  // --- Colosseum / XD ---
  { id: 'gen3_national', name: 'National Ribbon', category: RIBBON_CATEGORIES.COLO_XD, description: 'Purify a Shadow Pokemon.', gen: 3, exclusiveSource: 'Colosseum/XD' },
  { id: 'gen3_earth', name: 'Earth Ribbon', category: RIBBON_CATEGORIES.COLO_XD, description: 'Full Mt. Battle clear.', gen: 3, exclusiveSource: 'Colosseum/XD' },

  // --- Diamond / Pearl / Platinum ---
  { id: 'gen4_champion', name: 'Sinnoh Champ', category: RIBBON_CATEGORIES.DP_PT, description: 'Defeat the Sinnoh Champion.', gen: 4 },
  { id: 'gen4_cool_super_normal', name: 'Cool Super Contest (Normal)', category: RIBBON_CATEGORIES.DP_PT, description: 'Win Normal Rank Cool Super Contest.', gen: 4 },
  { id: 'gen4_cool_super_great', name: 'Cool Super Contest (Great)', category: RIBBON_CATEGORIES.DP_PT, description: 'Win Great Rank Cool Super Contest.', gen: 4 },
  { id: 'gen4_cool_super_ultra', name: 'Cool Super Contest (Ultra)', category: RIBBON_CATEGORIES.DP_PT, description: 'Win Ultra Rank Cool Super Contest.', gen: 4 },
  { id: 'gen4_cool_super_master', name: 'Cool Super Contest (Master)', category: RIBBON_CATEGORIES.DP_PT, description: 'Win Master Rank Cool Super Contest.', gen: 4 },
  { id: 'gen4_ability', name: 'Ability Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: 'Beat Palmer (21 streak).', gen: 4 },
  { id: 'gen4_great_ability', name: 'Great Ability Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: 'Beat Palmer (49 streak).', gen: 4 },
  { id: 'gen4_multi_ability', name: 'Multi Ability Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: '50 streak in Multi Battle Tower.', gen: 4 },
  { id: 'gen4_pair_ability', name: 'Pair Ability Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: '50 streak in Link Multi Battle Tower.', gen: 4 },
  { id: 'gen4_world_ability', name: 'World Ability Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: 'Reach Rank 5 in Wi-Fi Battle Tower.', gen: 4 },
  { id: 'gen4_footprint', name: 'Footprint Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: 'High friendship.', gen: 4 },

  // --- Days of the Week (Gen 4) ---
  { id: 'gen4_alert', name: 'Alert Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: 'Talk to Week Siblings (Monday).', gen: 4 },
  { id: 'gen4_shock', name: 'Shock Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: 'Talk to Week Siblings (Tuesday).', gen: 4 },
  { id: 'gen4_downcast', name: 'Downcast Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: 'Talk to Week Siblings (Wednesday).', gen: 4 },
  { id: 'gen4_careless', name: 'Careless Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: 'Talk to Week Siblings (Thursday).', gen: 4 },
  { id: 'gen4_relax', name: 'Relax Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: 'Talk to Week Siblings (Friday).', gen: 4 },
  { id: 'gen4_snooze', name: 'Snooze Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: 'Talk to Week Siblings (Saturday).', gen: 4 },
  { id: 'gen4_smile', name: 'Smile Ribbon', category: RIBBON_CATEGORIES.DP_PT, description: 'Talk to Week Siblings (Sunday).', gen: 4 },

  // --- HeartGold / SoulSilver ---
  { id: 'gen4_legend', name: 'Legend Ribbon', category: RIBBON_CATEGORIES.HG_SS, description: 'Defeat Red on Mt. Silver.', gen: 4 },

  // --- X / Y ---
  { id: 'gen6_kalos_champion', name: 'Kalos Champ', category: RIBBON_CATEGORIES.XY, description: 'Defeat the Kalos Champion.', gen: 6 },
  { id: 'gen6_skillful_battler', name: 'Skillful Battler', category: RIBBON_CATEGORIES.XY, description: 'Beat Battle Maison Chatelaine (20).', gen: 6 },
  { id: 'gen6_expert_battler', name: 'Expert Battler', category: RIBBON_CATEGORIES.XY, description: 'Beat Battle Maison Chatelaine (50).', gen: 6 },
  { id: 'gen6_training', name: 'Training Ribbon', category: RIBBON_CATEGORIES.XY, description: 'Complete all Super Training.', gen: 6 },
  { id: 'gen6_best_friends', name: 'Best Friends', category: RIBBON_CATEGORIES.XY, description: 'Max affection in Amie/Refresh.', gen: 6 },

  // --- Omega Ruby / Alpha Sapphire ---
  { id: 'gen6_hoenn_champion', name: 'Hoenn Champ', category: RIBBON_CATEGORIES.OR_AS, description: 'Defeat the Hoenn Champion in ORAS.', gen: 6 },
  { id: 'gen6_contest_star', name: 'Contest Star', category: RIBBON_CATEGORIES.OR_AS, description: 'Win all 5 Master Rank Contests in ORAS.', gen: 6 },

  // --- Sun / Moon / US / UM ---
  { id: 'gen7_alola_champion', name: 'Alola Champ', category: RIBBON_CATEGORIES.SM_USUM, description: 'Defeat the Alola Champion.', gen: 7 },
  { id: 'gen7_battle_royal', name: 'Battle Royal Master', category: RIBBON_CATEGORIES.SM_USUM, description: 'Win Master Rank Battle Royal.', gen: 7 },
  { id: 'gen7_battle_tree_great', name: 'Great Battle Tree', category: RIBBON_CATEGORIES.SM_USUM, description: 'Beat Battle Tree Legend (20).', gen: 7 },
  { id: 'gen7_battle_tree_master', name: 'Master Battle Tree', category: RIBBON_CATEGORIES.SM_USUM, description: 'Beat Battle Tree Legend (50).', gen: 7 },

  // --- Sword / Shield ---
  { id: 'gen8_galar_champion', name: 'Galar Champ', category: RIBBON_CATEGORIES.SW_SH, description: 'Defeat Leon.', gen: 8 },
  { id: 'gen8_tower_master', name: 'Tower Master', category: RIBBON_CATEGORIES.SW_SH, description: 'Beat Leon in Battle Tower.', gen: 8 },
  { id: 'gen8_master_rank', name: 'Master Rank Ribbon', category: RIBBON_CATEGORIES.SW_SH, description: 'Reach Master Ball Tier in Ranked.', gen: 8 },
  { id: 'gen8_partner', name: 'Partner Ribbon', category: RIBBON_CATEGORIES.SW_SH, description: 'High friendship with Pok\u00e9mon from Isle of Armor.', gen: 8 },

  // --- Brilliant Diamond / Shining Pearl ---
  // (BDSP uses many Gen 4 ribbons, will map them if we add dynamic version detection)

  // --- Legends: Arceus ---
  { id: 'gen8_hisui', name: 'Hisui Ribbon', category: RIBBON_CATEGORIES.PLA, description: 'Photograph in Jubilife.', gen: 8 },

  // --- Scarlet / Violet ---
  { id: 'gen9_paldea_champion', name: 'Paldea Champ', category: RIBBON_CATEGORIES.SV, description: 'Defeat Geeta.', gen: 9 },

  // --- Marks ---
  { id: 'mark_uncommon', name: 'Uncommon Mark', category: RIBBON_CATEGORIES.MARKS, description: 'Caught in the wild.', gen: 8 },
  { id: 'mark_rare', name: 'Rare Mark', category: RIBBON_CATEGORIES.MARKS, description: 'Extremely rare find.', gen: 8 },
  { id: 'mark_mightiest', name: 'Mightiest Mark', category: RIBBON_CATEGORIES.MARKS, description: '7-Star Tera Raid.', gen: 9 }
];

/**
 * Checks if a Pokemon can obtain a specific ribbon based on its origin and the ribbon's gen.
 */
export function isEligible(pokemon, ribbon) {
  // pokemon object can have { originGameId, gen, isShadow }
  const game = ORIGIN_GAMES.find(g => g.id === pokemon.originGameId);
  const gen = game ? game.gen : (pokemon.gen || 1);
  const isShadow = game ? game.isShadow : pokemon.isShadow;

  // Colosseum/XD exclusive ribbons
  if (ribbon.exclusiveSource === 'Colosseum/XD') {
    return isShadow || pokemon.origin === 'Colosseum' || pokemon.origin === 'XD';
  }

  // Cross-gen transfer logic:
  // Gen 1/2 can get Gen 3 ribbons (via FRLG/Colo/XD proxies in Gen 3 environment)
  if (gen === 1 || gen === 2) {
    return ribbon.gen >= 3;
  }

  // General rule: Pokemon can get ribbons from their origin gen onwards
  return gen <= ribbon.gen;
}
