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
    'sun': 7, 'moon': 7, 'ultra-sun': 7, 'ultra-moon': 7, 'lets-go-pikachu': 7, 'lets-go-eevee': 7,
    'sword': 8, 'shield': 8, 'brilliant-diamond': 8, 'shining-pearl': 8, 'legends-arceus': 8,
    'scarlet': 9, 'violet': 9, 'legends-za': 9
};

export const VERSIONS_WITH_SHINY_CHARM = [
    'black-2', 'white-2',
    'x', 'y', 'omega-ruby', 'alpha-sapphire',
    'sun', 'moon', 'ultra-sun', 'ultra-moon',
    'sword', 'shield', 'brilliant-diamond', 'shining-pearl', 'legends-arceus',
    'scarlet', 'violet', 'legends-za'
];

/**
 * Calculates the shiny odds based on generation, method, and extra help (Shiny Charm).
 * @param {number} gen - Generation number (1-9).
 * @param {string} method - 'random', 'static', 'breeding', 'masuda', 'pokeradar-gen4', 'pokeradar-gen6', 'chainfishing', 'friendsafari', 'sos', 'catchcombo', 'dynamax-adventure', 'curry-spawn', 'diglett-bonus', 'pla-research', 'sv-outbreak', 'tera-raid', 'fossil-restore', 'hyperspace'.
 * @param {boolean} hasShinyCharm - Whether the player has the Shiny Charm.
 * @param {Object} extraParams - Additional parameters like 'chain' length, 'game' name, etc.
 * @returns {Object} { fraction: string, percentage: string, rolls: number }
 */
export function calculateShinyOdds(gen, method, hasShinyCharm = false, extraParams = {}) {
    if (gen < 1) return { fraction: '0/0', percentage: '0', rolls: 0 };

    const game = extraParams.game || '';
    let baseOdds = gen >= 6 ? 4096 : 8192;
    let rolls = 1;

    // BDSP Shiny Charm Bug: Only affects breeding
    let effectiveCharm = hasShinyCharm;
    if ((game === 'brilliant-diamond' || game === 'shining-pearl') && method !== 'masuda') {
        effectiveCharm = false;
    }

    // Shiny Charm Effect (Introduced in Gen 5)
    // +2 rolls for most methods
    if (effectiveCharm && gen >= 5) {
        // PLA charm logic handles itself in its specific block below
        // SV charm logic is also standard, but PLA has specific requirements
        if (game !== 'legends-arceus') {
            rolls += 2;
        }
    }

    // Global Modifiers: Sparkling Power (Gen 9) & Research Level (PLA)
    const sparkling = extraParams.sparkling || 0;
    const researchLevel = extraParams.level || 0; // 0: None, 1: Level 10, 2: Perfect

    // Sparkling Power (Gen 9 SV)
    if (gen === 9 && method !== 'masuda' && method !== 'static' && method !== 'fossil-restore') {
        if (game === 'scarlet' || game === 'violet') {
            if (sparkling === 1) rolls += 1;
            else if (sparkling === 3) rolls += 3;
        } else if (game === 'legends-za') {
            // PLZA Hyperspace handles its own sparkling in its block
        }
    }

    // Research Level (PLA)
    if (game === 'legends-arceus') {
        // Research level adds to rolls for ALL methods in PLA
        if (researchLevel === 1) rolls += 1;
        else if (researchLevel === 2) rolls += 3;

        // Charm in PLA adds +3 rolls ONLY if Research Level is 10 or Perfect (>=1)
        if (hasShinyCharm && researchLevel >= 1) {
            rolls += 3;
        }
    }

    // Method Adjustments
    if (method === 'masuda') {
        if (gen === 4) rolls += 4; // 1+4 = 5/8192
        else if (gen === 5) rolls += 5; // 1+5 = 6/8192
        else if (gen >= 6) rolls += 5; // 1+5 = 6/4096 base Masuda
    }

    // Specific Generation Adjustments
    if (gen === 5 && method === 'masuda' && effectiveCharm) {
        rolls = 8;
    } else if (gen >= 6 && method === 'masuda' && effectiveCharm) {
        rolls = 8;
    }

    if (method === 'pokeradar-gen4') {
        const chain = Math.min(extraParams.chain || 0, 40);
        let n = Math.ceil(65535 / (8200 - chain * 200));
        let probability = n / 65536;
        let oneInX = Math.round(1 / probability);
        return formatResult(1, oneInX);
    } else if (method === 'pokeradar-gen6') {
        const chain = Math.min(extraParams.chain || 0, 40);
        if (chain >= 40) return formatResult(1, 200);

        let n = Math.ceil(65535 / (8200 - chain * 200));
        let oneInX = Math.round(65536 / n);
        return formatResult(1, oneInX);
    } else if (method === 'chainfishing') {
        const chain = Math.min(extraParams.chain || 0, 20);
        rolls += 2 * chain;
    } else if (method === 'friendsafari') {
        rolls = 5;
        if (effectiveCharm) rolls += 2;
    } else if (method === 'sos') {
        const chain = extraParams.chain || 0;
        if (chain >= 31) rolls += 12;
        else if (chain >= 21) rolls += 8;
        else if (chain >= 11) rolls += 4;
    } else if (method === 'catchcombo') {
        const combo = extraParams.combo || 0;
        const lure = extraParams.lure || false;
        if (lure) rolls += 1;
        if (combo >= 31) rolls += 11;
        else if (combo >= 21) rolls += 7;
        else if (combo >= 11) rolls += 3;
    } else if (method === 'dynamax-adventure') {
        baseOdds = effectiveCharm ? 100 : 300;
        return formatResult(1, baseOdds);
    } else if (method === 'curry-spawn') {
        // Base is 4096, rolls 1
    } else if (method === 'diglett-bonus') {
        rolls = 2;
    } else if (method === 'pla-research') {
        // Outbreak rolls in PLA
        const outbreak = extraParams.outbreak || 0; // 0: None, 1: Regular, 2: Massive Mass
        if (outbreak === 1) rolls += 25;
        else if (outbreak === 2) rolls += 12;
    } else if (method === 'sv-outbreak') {
        const kills = extraParams.kills || 0;
        if (kills >= 60) rolls += 2;
        else if (kills >= 30) rolls += 1;
    } else if (method === 'tera-raid') {
        return formatResult(1, 4103);
    } else if (method === 'fossil-restore') {
        return formatResult(1, 4096);
    } else if (method === 'breeding' && gen === 2) {
        if (extraParams.shinyParent) {
            return formatResult(1, 64);
        }
        // Generic Gen 2 breeding is still 1/8192 if parent not shiny
    } else if (method === 'odd-egg') {
        return formatResult(1, 10);
    } else if (method === 'hyperspace' || method === 'hyperspace-static') {
        // PLZA Hyperspace specifically uses Sparkling Power 1-3
        rolls += (sparkling || 0);
        // Hyperspace Static (Legendaries) are also affected by Shiny Charm in PLZA
        if (method === 'hyperspace-static' && hasShinyCharm) {
            rolls += 3; // Using PLA-style +3 rolls for charm
        }
    }

    return formatResult(rolls, baseOdds);
}

function formatResult(rolls, baseOdds) {
    const percentage = (rolls / baseOdds) * 100;

    // Simplify fraction
    let displayFraction = `${rolls}/${baseOdds}`;
    if (baseOdds % rolls === 0) {
        displayFraction = `1/${baseOdds / rolls}`;
    } else {
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
