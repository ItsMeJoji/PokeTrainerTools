/**
 * Contest Accessories Data and 12-Category Theme Template for Gen 4 Super Contests
 * (Pokemon Diamond, Pearl, and Platinum)
 *
 * Scoring values in templates:
 *   2 = High Scoring (+2 points)
 *   1 = Good Scoring (+1 point)
 *   0 = Low Scoring (+0 points)
 *   null = Unset / Not yet rated
 */

export const CONTEST_CATEGORIES = [
  {
    id: 'bright',
    name: 'Bright',
    description: 'Favors white, yellow, glittering, sparkling, or luminous accessories.'
  },
  {
    id: 'colorful',
    name: 'Colorful',
    description: 'Favors multi-colored items or accessories with distinct color in their name (excluding white).'
  },
  {
    id: 'created',
    name: 'Created',
    description: 'Favors artificial objects, crafted items, stages, balloons, and masks; natural items score poorly.'
  },
  {
    id: 'festive',
    name: 'Festive',
    description: 'Favors celebration props, confetti, party accessories, balloons, and carnival gear.'
  },
  {
    id: 'flexible',
    name: 'Flexible',
    description: 'Favors pliable, soft items, cloth, fabric, feathers, and fluffy accessories.'
  },
  {
    id: 'gaudy',
    name: 'Gaudy',
    description: 'Favors extravagant, flashy, eccentric, eye-catching, or dramatic accessories.'
  },
  {
    id: 'intangible',
    name: 'Intangible',
    description: 'Favors ethereal or non-solid items: fire, sparks, smoke, powders, notes, and dewdrops.'
  },
  {
    id: 'natural',
    name: 'Natural',
    description: 'Favors organic items: leaves, mushrooms, flowers, pebbles, scales, and feathers.'
  },
  {
    id: 'relaxed',
    name: 'Relaxed',
    description: 'Favors cozy, calm, or leisurely accessories like beds, pipes, parasols, and coins.'
  },
  {
    id: 'shapely',
    name: 'Shapely',
    description: 'Favors accessories with distinct contours, geometric silhouettes, or symmetrical outlines.'
  },
  {
    id: 'sharp',
    name: 'Sharp',
    description: 'Favors pointed, jagged, or spiky accessories such as claws, horns, crystals, and jagged boulders.'
  },
  {
    id: 'solid',
    name: 'Solid',
    description: 'Favors heavy, rigid, rock, metallic, dense, and firm structures like pedestals and boulders.'
  }
];

export const ACCESSORY_CATEGORY_KEYS = CONTEST_CATEGORIES.map(cat => cat.id);

export const SCORE_OPTIONS = [
  {
    value: 2,
    label: 'High Scoring',
    badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-600',
    btnClass: 'bg-emerald-600 text-white hover:bg-emerald-700'
  },
  {
    value: 1,
    label: 'Good Scoring',
    badgeClass: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-600',
    btnClass: 'bg-blue-600 text-white hover:bg-blue-700'
  },
  {
    value: 0,
    label: 'Low Scoring',
    badgeClass: 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-600',
    btnClass: 'bg-gray-600 text-white hover:bg-gray-700'
  }
];

export const DEFAULT_CATEGORY_VALUES = Object.freeze({
  bright: null,
  colorful: null,
  created: null,
  festive: null,
  flexible: null,
  gaudy: null,
  intangible: null,
  natural: null,
  relaxed: null,
  shapely: null,
  sharp: null,
  solid: null
});

/**
 * Standard Item Template for an Accessory.
 * Values: 0 (Low), 1 (Good), 2 (High), or null (Unset).
 */
export const ACCESSORY_ITEM_TEMPLATE = {
  id: '',
  name: '',
  file: '',
  categories: { ...DEFAULT_CATEGORY_VALUES },
  notes: ''
};

/**
 * Creates an accessory item object enforcing the 12 categories schema with 0, 1, 2 values.
 *
 * @param {string} name - Display name of the accessory
 * @param {string} file - Filename in src/assets/images/contest-accessories/
 * @param {Partial<Record<typeof ACCESSORY_CATEGORY_KEYS[number], 0 | 1 | 2 | null>>} categoryOverrides
 * @param {string} [notes] - Optional context or notes on where to obtain the accessory
 */
export function createAccessoryTemplate(name, file, categoryOverrides = {}, notes = '') {
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const categories = {};
  for (const key of ACCESSORY_CATEGORY_KEYS) {
    const raw = categoryOverrides[key];
    if (raw === 2 || raw === 'High') {
      categories[key] = 2;
    } else if (raw === 1 || raw === 'Good') {
      categories[key] = 1;
    } else if (raw === 0 || raw === 'Low') {
      categories[key] = 0;
    } else {
      categories[key] = null;
    }
  }

  return {
    id,
    name,
    file,
    categories,
    notes
  };
}

/**
 * Generates an editable code template in JS format for an item using 0, 1, 2 values.
 */
export function generateJsTemplate(item) {
  const catEntries = ACCESSORY_CATEGORY_KEYS.map(
    key => `    ${key}: ${item.categories[key] !== null ? item.categories[key] : 'null'},`
  ).join('\n');

  return `createAccessoryTemplate(\n  '${item.name}',\n  '${item.file}',\n  {\n${catEntries}\n  }${item.notes ? `,\n  '${item.notes.replace(/'/g, "\\'")}'` : ''}\n)`;
}

/**
 * Generates a JSON template for an item.
 */
export function generateJsonTemplate(item) {
  return JSON.stringify(item, null, 2);
}

/**
 * Base list of all 99 Gen 4 Contest Accessories with their 12-category templates (values: 0, 1, 2).
 */
export const CONTEST_ACCESSORIES = [
  createAccessoryTemplate('Award Podium', 'Accessory_Award_Podium_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 0,
    gaudy: 2,
    intangible: 0,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }, 'Reward for winning Tough contest.'),
  createAccessoryTemplate('Big Leaf', 'Accessory_Big_Leaf_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 0,
    festive: 0,
    flexible: 2,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Big Scale', 'Accessory_Big_Scale_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 2,
    relaxed: 0,
    shapely: 1,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Big Tree', 'Accessory_Big_Tree_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 1,
    intangible: 0,
    natural: 2,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Black Beard', 'Accessory_Black_Beard_Sprite.png', {
    bright: 0,
    colorful: 2,
    created: 2,
    festive: 0,
    flexible: 2,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 2,
    shapely: 1,
    sharp: 2,
    solid: 1
  }),
  createAccessoryTemplate('Black Fluff', 'Accessory_Black_Fluff_Sprite.png', {
    bright: 0,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 2,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 2,
    shapely: 1,
    sharp: 0,
    solid: 1
  }),
  createAccessoryTemplate('Black Moustache', 'Accessory_Black_Moustache_Sprite.png', {
    bright: 0,
    colorful: 2,
    created: 2,
    festive: 0,
    flexible: 2,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 2,
    shapely: 1,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Black Pebble', 'Accessory_Black_Pebble_Sprite.png', {
    bright: 0,
    colorful: 2,
    created: 1,
    festive: 1,
    flexible: 0,
    gaudy: 2,
    intangible: 0,
    natural: 1,
    relaxed: 2,
    shapely: 2,
    sharp: 0,
    solid: 2
  }),
  createAccessoryTemplate('Black Specs', 'Accessory_Black_Specs_Sprite.png', {
    bright: 0,
    colorful: 2,
    created: 2,
    festive: 0,
    flexible: 0,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 2,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Blue Balloons', 'Accessory_Blue_Balloons_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 1,
    shapely: 1,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Blue Barrette', 'Accessory_Blue_Barrette_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 1,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Blue Feather', 'Accessory_Blue_Feather_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 1,
    sharp: 2,
    solid: 1
  }),
  createAccessoryTemplate('Blue Flower', 'Accessory_Blue_Flower_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Blue Scale', 'Accessory_Blue_Scale_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 2,
    relaxed: 2,
    shapely: 1,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Brown Fluff', 'Accessory_Brown_Fluff_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 2,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 2,
    shapely: 1,
    sharp: 0,
    solid: 1
  }),
  createAccessoryTemplate('Cape', 'Accessory_Cape_Sprite.png', {
    bright: 0,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 2,
    shapely: 2,
    sharp: 2,
    solid: 1
  }),
  createAccessoryTemplate('Carpet', 'Accessory_Carpet_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 2,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 0,
    solid: 2
  }),
  createAccessoryTemplate('Chimchar Mask', 'Accessory_Chimchar_Mask_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 0,
    solid: 1
  }),
  createAccessoryTemplate('Colored Parasol', 'Accessory_Colored_Parasol_Sprite.png', {
    bright: 2,
    colorful: 2,
    created: 2,
    festive: 2,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Confetti', 'Accessory_Confetti_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 1,
    shapely: 1,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Crown', 'Accessory_Crown_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 2,
    festive: 2,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 0,
    shapely: 2,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Cube Stage', 'Accessory_Cube_Stage_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 0,
    gaudy: 2,
    intangible: 0,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Determination', 'Accessory_Determination_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 1,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 1,
    relaxed: 1,
    shapely: 0,
    sharp: 1,
    solid: 0
  }),
  createAccessoryTemplate('Eerie Thing', 'Accessory_Eerie_Thing_Sprite.png', {
    bright: 0,
    colorful: 2,
    created: 1,
    festive: 0,
    flexible: 2,
    gaudy: 0,
    intangible: 2,
    natural: 2,
    relaxed: 2,
    shapely: 1,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Flag', 'Accessory_Flag_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Flower Stage', 'Accessory_Flower_Stage_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 2,
    flexible: 0,
    gaudy: 2,
    intangible: 0,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Fluffy Bed', 'Accessory_Fluffy_Bed_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 0,
    solid: 1
  }),
  createAccessoryTemplate('Glass Stage', 'Accessory_Glass_Stage_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 2,
    festive: 2,
    flexible: 0,
    gaudy: 2,
    intangible: 0,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Glitter Boulder', 'Accessory_Glitter_Boulder_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 1,
    festive: 2,
    flexible: 0,
    gaudy: 2,
    intangible: 0,
    natural: 1,
    relaxed: 0,
    shapely: 2,
    sharp: 0,
    solid: 2
  }),
  createAccessoryTemplate('Glitter Powder', 'Accessory_Glitter_Powder_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 2,
    festive: 2,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 1,
    relaxed: 0,
    shapely: 1,
    sharp: 0,
    solid: 1
  }),
  createAccessoryTemplate('Gold Pedestal', 'Accessory_Gold_Pedestal_Sprite.png', {
    bright: 2,
    colorful: 2,
    created: 2,
    festive: 2,
    flexible: 0,
    gaudy: 2,
    intangible: 0,
    natural: 0,
    relaxed: 0,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Googly Specs', 'Accessory_Googly_Specs_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 0,
    flexible: 0,
    gaudy: 1,
    intangible: 1,
    natural: 0,
    relaxed: 2,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Gorgeous Specs', 'Accessory_Gorgeous_Specs_Sprite.png', {
    bright: 0,
    colorful: 2,
    created: 2,
    festive: 2,
    flexible: 0,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Green Balloons', 'Accessory_Green_Balloons_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 1,
    shapely: 1,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Green Barrette', 'Accessory_Green_Barrette_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 1,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Green Scale', 'Accessory_Green_Scale_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 1,
    sharp: 0,
    solid: 2
  }),
  createAccessoryTemplate('Heroic Headband', 'Accessory_Heroic_Headband_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Humming Note', 'Accessory_Humming_Note_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 2,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 1,
    relaxed: 1,
    shapely: 0,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Jagged Boulder', 'Accessory_Jagged_Boulder_Sprite.png', {
    bright: 1,
    colorful: 0,
    created: 0,
    festive: 0,
    flexible: 0,
    gaudy: 1,
    intangible: 0,
    natural: 2,
    relaxed: 2,
    shapely: 2,
    sharp: 0,
    solid: 2
  }),
  createAccessoryTemplate('Lace Headdress', 'Accessory_Lace_Headdress_Sprite.png', {
    bright: 2,
    colorful: 0,
    created: 2,
    festive: 2,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 2,
    solid: 1
  }),
  createAccessoryTemplate('Mini Pebble', 'Accessory_Mini_Pebble_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 1,
    festive: 1,
    flexible: 0,
    gaudy: 2,
    intangible: 0,
    natural: 1,
    relaxed: 1,
    shapely: 2,
    sharp: 0,
    solid: 2
  }),
  createAccessoryTemplate('Mirror Ball', 'Accessory_Mirror_Ball_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 2,
    festive: 2,
    flexible: 0,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 0,
    shapely: 2,
    sharp: 0,
    solid: 2
  }),
  createAccessoryTemplate('Mystic Fire', 'Accessory_Mystic_Fire_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 1,
    festive: 2,
    flexible: 2,
    gaudy: 1,
    intangible: 2,
    natural: 2,
    relaxed: 1,
    shapely: 0,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Narrow Leaf', 'Accessory_Narrow_Leaf_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 0,
    festive: 0,
    flexible: 2,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 1,
    sharp: 2,
    solid: 1
  }),
  createAccessoryTemplate('Narrow Scale', 'Accessory_Narrow_Scale_Sprite.png', {
    bright: 0,
    colorful: 1,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 2,
    relaxed: 2,
    shapely: 1,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Old Umbrella', 'Accessory_Old_Umbrella_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 0,
    flexible: 1,
    gaudy: 1,
    intangible: 1,
    natural: 0,
    relaxed: 2,
    shapely: 2,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Orange Flower', 'Accessory_Orange_Flower_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Orange Fluff', 'Accessory_Orange_Fluff_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 2,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 1,
    sharp: 0,
    solid: 1
  }),
  createAccessoryTemplate('Peculiar Spoon', 'Accessory_Peculiar_Spoon_Sprite.png', {
    bright: 1,
    colorful: 0,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 1,
    intangible: 0,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Photo Board', 'Accessory_Photo_Board_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Pink Balloon', 'Accessory_Pink_Balloon_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 1,
    shapely: 1,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Pink Barrette', 'Accessory_Pink_Barrette_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 1,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Pink Flower', 'Accessory_Pink_Flower_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Pink Fluff', 'Accessory_Pink_Fluff_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 2,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 1,
    sharp: 0,
    solid: 1
  }),
  createAccessoryTemplate('Pink Scale', 'Accessory_Pink_Scale_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 1,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Piplup Mask', 'Accessory_Piplup_Mask_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 0,
    solid: 1
  }),
  createAccessoryTemplate('Poison Extract', 'Accessory_Poison_Extract_Sprite.png', {
    bright: 0,
    colorful: 2,
    created: 1,
    festive: 0,
    flexible: 2,
    gaudy: 0,
    intangible: 2,
    natural: 2,
    relaxed: 2,
    shapely: 0,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Pretty Dewdrop', 'Accessory_Pretty_Dewdrop_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 0,
    festive: 2,
    flexible: 2,
    gaudy: 1,
    intangible: 2,
    natural: 2,
    relaxed: 0,
    shapely: 1,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Professor Hat', 'Accessory_Professor_Hat_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Puffy Smoke', 'Accessory_Puffy_Smoke_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 0,
    festive: 0,
    flexible: 2,
    gaudy: 1,
    intangible: 2,
    natural: 2,
    relaxed: 1,
    shapely: 0,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Purple Scale', 'Accessory_Purple_Scale_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 1,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Red Balloons', 'Accessory_Red_Balloons_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 1,
    shapely: 1,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Red Barrette', 'Accessory_Red_Barrette_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 1,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Red Feather', 'Accessory_Red_Feather_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 1,
    sharp: 2,
    solid: 1
  }),
  createAccessoryTemplate('Red Flower', 'Accessory_Red_Flower_Sprite.png', {
    bright: 1,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Retro Pipe', 'Accessory_Retro_Pipe_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 0,
    flexible: 0,
    gaudy: 1,
    intangible: 0,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Round Pebble', 'Accessory_Round_Pebble_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 1,
    festive: 1,
    flexible: 0,
    gaudy: 2,
    intangible: 0,
    natural: 1,
    relaxed: 1,
    shapely: 2,
    sharp: 0,
    solid: 2
  }),
  createAccessoryTemplate('Seashell', 'Accessory_Seashell_Sprite.png', {
    bright: 2,
    colorful: 0,
    created: 0,
    festive: 1,
    flexible: 0,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Shed Claw', 'Accessory_Shed_Claw_Sprite.png', {
    bright: 2,
    colorful: 0,
    created: 1,
    festive: 1,
    flexible: 0,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 0,
    shapely: 2,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Shed Horn', 'Accessory_Shed_Horn_Sprite.png', {
    bright: 2,
    colorful: 0,
    created: 1,
    festive: 1,
    flexible: 0,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 0,
    shapely: 2,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Shimmering Fire', 'Accessory_Shimmering_Fire_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 1,
    festive: 2,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 2,
    relaxed: 1,
    shapely: 0,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Shiny Powder', 'Accessory_Shiny_Powder_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 2,
    festive: 2,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 1,
    relaxed: 0,
    shapely: 1,
    sharp: 0,
    solid: 1
  }),
  createAccessoryTemplate('Silk Veil', 'Accessory_Silk_Veil_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 2,
    festive: 2,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 0,
    shapely: 2,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Small Leaf', 'Accessory_Small_Leaf_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 0,
    festive: 0,
    flexible: 2,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 1,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Snaggy Pebble', 'Accessory_Snaggy_Pebble_Sprite.png', {
    bright: 1,
    colorful: 0,
    created: 0,
    festive: 0,
    flexible: 0,
    gaudy: 1,
    intangible: 0,
    natural: 2,
    relaxed: 1,
    shapely: 2,
    sharp: 0,
    solid: 2
  }),
  createAccessoryTemplate('Snow Crystal', 'Accessory_Snow_Crystal_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 0,
    festive: 2,
    flexible: 2,
    gaudy: 1,
    intangible: 2,
    natural: 2,
    relaxed: 0,
    shapely: 1,
    sharp: 1,
    solid: 0
  }),
  createAccessoryTemplate('Sparks', 'Accessory_Sparks_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 1,
    festive: 2,
    flexible: 2,
    gaudy: 1,
    intangible: 2,
    natural: 2,
    relaxed: 1,
    shapely: 0,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Spotlight', 'Accessory_Spotlight_Sprite.png', {
    bright: 2,
    colorful: 0,
    created: 2,
    festive: 2,
    flexible: 1,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 0,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Spring', 'Accessory_Spring_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Standing Mike', 'Accessory_Standing_Mike_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Stump', 'Accessory_Stump_Sprite.png', {
    bright: 1,
    colorful: 0,
    created: 1,
    festive: 0,
    flexible: 0,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Surfboard', 'Accessory_Surfboard_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 0,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Sweet Candy', 'Accessory_Sweet_Candy_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 2
  }),
  createAccessoryTemplate('Thick Mushroom', 'Accessory_Thick_Mushroom_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 1,
    festive: 1,
    flexible: 1,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 0,
    shapely: 2,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Thin Mushroom', 'Accessory_Thin_Mushroom_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 1,
    festive: 1,
    flexible: 1,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 0,
    shapely: 1,
    sharp: 2,
    solid: 1
  }),
  createAccessoryTemplate('Tiara', 'Accessory_Tiara_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 2,
    festive: 2,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 0,
    shapely: 2,
    sharp: 2,
    solid: 2
  }),
  createAccessoryTemplate('Top Hat', 'Accessory_Top_Hat_Sprite.png', {
    bright: 0,
    colorful: 2,
    created: 2,
    festive: 2,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 2,
    shapely: 2,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Turtwig Mask', 'Accessory_Turtwig_Mask_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 2,
    sharp: 0,
    solid: 1
  }),
  createAccessoryTemplate('Wealthy Coin', 'Accessory_Wealthy_Coin_Sprite.png', {
    bright: 1,
    colorful: 1,
    created: 2,
    festive: 2,
    flexible: 0,
    gaudy: 2,
    intangible: 0,
    natural: 0,
    relaxed: 0,
    shapely: 2,
    sharp: 0,
    solid: 2
  }),
  createAccessoryTemplate('White Beard', 'Accessory_White_Beard_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 2,
    festive: 0,
    flexible: 2,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 0,
    shapely: 1,
    sharp: 2,
    solid: 1
  }),
  createAccessoryTemplate('White Feather', 'Accessory_White_Feather_Sprite.png', {
    bright: 2,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 2,
    relaxed: 0,
    shapely: 1,
    sharp: 2,
    solid: 1
  }),
  createAccessoryTemplate('White Flower', 'Accessory_White_Flower_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 0,
    shapely: 2,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('White Fluff', 'Accessory_White_Fluff_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 0,
    festive: 1,
    flexible: 2,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 0,
    shapely: 1,
    sharp: 0,
    solid: 1
  }),
  createAccessoryTemplate('White Moustache', 'Accessory_White_Moustache_Sprite.png', {
    bright: 2,
    colorful: 1,
    created: 2,
    festive: 0,
    flexible: 2,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 0,
    shapely: 1,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Yellow Balloon', 'Accessory_Yellow_Balloon_Sprite.png', {
    bright: 2,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 2,
    gaudy: 2,
    intangible: 2,
    natural: 0,
    relaxed: 1,
    shapely: 1,
    sharp: 0,
    solid: 0
  }),
  createAccessoryTemplate('Yellow Barrette', 'Accessory_Yellow_Barrette_Sprite.png', {
    bright: 2,
    colorful: 2,
    created: 2,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 0,
    relaxed: 1,
    shapely: 1,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Yellow Feather', 'Accessory_Yellow_Feather_Sprite.png', {
    bright: 2,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 2,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 1,
    sharp: 2,
    solid: 1
  }),
  createAccessoryTemplate('Yellow Flower', 'Accessory_Yellow_Flower_Sprite.png', {
    bright: 2,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 1,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 2,
    sharp: 1,
    solid: 1
  }),
  createAccessoryTemplate('Yellow Fluff', 'Accessory_Yellow_Fluff_Sprite.png', {
    bright: 2,
    colorful: 2,
    created: 0,
    festive: 1,
    flexible: 2,
    gaudy: 1,
    intangible: 1,
    natural: 2,
    relaxed: 1,
    shapely: 1,
    sharp: 0,
    solid: 1
  })
];
