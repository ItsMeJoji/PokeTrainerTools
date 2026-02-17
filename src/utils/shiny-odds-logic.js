/**
 * Shiny Odds Logic for different generations and methods.
 */

export const VERSION_TO_GEN = {
    'red': 1, 'blue': 1, 'yellow': 1,
    'gold': 2, 'silver': 2, 'crystal': 2,
    'ruby': 3, 'sapphire': 3, 'emerald': 3, 'firered': 3, 'leafgreen': 3,
    'diamond': 4, 'pearl': 4, 'platinum': 4, 'heartgold': 4, 'soulsilver': 4,
    'black': 5, 'white': 5, 'black-2': 5, 'white-2': 5,
    'x': 6, 'y': 6, 'omega-ruby': 6, 'alpha-sapphire': 6,
    'sun': 7, 'moon': 7, 'ultra-sun': 7, 'ultra-moon': 7,
    'sword': 8, 'shield': 8, 'brilliant-diamond': 8, 'shining-pearl': 8, 'legends-arceus': 8,
    'scarlet': 9, 'violet': 9
};

export const VERSIONS_WITH_SHINY_CHARM = [
    'black-2', 'white-2',
    'x', 'y', 'omega-ruby', 'alpha-sapphire',
    'sun', 'moon', 'ultra-sun', 'ultra-moon',
    'sword', 'shield', 'brilliant-diamond', 'shining-pearl', 'legends-arceus',
    'scarlet', 'violet'
];

/**
 * Calculates the shiny odds based on generation, method, and extra help (Shiny Charm).
 * @param {number} gen - Generation number (1-9).
 * @param {string} method - 'random', 'static', 'breeding', 'masuda'.
 * @param {boolean} hasShinyCharm - Whether the player has the Shiny Charm.
 * @returns {Object} { fraction: string, percentage: string, rolls: number }
 */
export function calculateShinyOdds(gen, method, hasShinyCharm = false) {
    if (gen < 2) return { fraction: '0/0', percentage: '0', rolls: 0 };

    let baseOdds = gen >= 6 ? 4096 : 8192;
    let rolls = 1;

    // Shiny Charm Effect (Introduced in Gen 5)
    // +2 rolls for most methods
    if (hasShinyCharm && gen >= 5) {
        rolls += 2;
    }

    // Method Adjustments
    if (method === 'masuda') {
        if (gen === 4) rolls += 4; // 1+4 = 5/8192
        else if (gen === 5) rolls += 5; // 1+5 = 6/8192 (Wait, Shiny Charm adds to this in Gen 5? Yes, 6+2=8/8192)
        else if (gen >= 6) rolls += 5; // 1+5 = 6/4096 base Masuda
    }

    // Specific Generation Adjustments
    if (gen === 5 && method === 'masuda' && hasShinyCharm) {
        // Gen 5 Masuda + Charm = 8/8192 = 1/1024
        rolls = 8;
    } else if (gen >= 6 && method === 'masuda' && hasShinyCharm) {
        // Gen 6+ Masuda + Charm = 8/4096 = 1/512
        rolls = 8;
    }

    const percentage = (rolls / baseOdds) * 100;

    // Simplify fraction if possible
    let displayFraction = `${rolls}/${baseOdds}`;
    if (baseOdds % rolls === 0) {
        displayFraction = `1/${baseOdds / rolls}`;
    } else {
        // Approximate for common values if not perfectly divisible
        const approx = Math.round(baseOdds / rolls);
        displayFraction = `~1/${approx} (${rolls}/${baseOdds})`;
    }

    return {
        fraction: displayFraction,
        percentage: percentage.toFixed(4),
        rolls: rolls,
        base: baseOdds
    };
}
