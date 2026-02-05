/**
 * Catch rate logic based on Generation 3/4 formulas.
 */

/**
 * Calculates the modified catch rate 'a' and shake probability 'b'.
 * @param {number} baseRate - The Pokemon's base capture rate (0-255).
 * @param {number} currentHP - Current HP of the Pokemon.
 * @param {number} maxHP - Maximum HP of the Pokemon.
 * @param {number} ballBonus - Multiplier for the Poke Ball used.
 * @param {number} statusBonus - Multiplier for status conditions (1, 1.5, or 2).
 * @returns {Object} Calculated values { a, b, catchPercentage }.
 */
export function calculateGen34(baseRate, currentHP, maxHP, ballBonus, statusBonus) {

    //Console Log for Debugging
    // console.log("Catch Rate: " + baseRate);
    // console.log("Current HP: " + currentHP);
    // console.log("Max HP: " + maxHP);
    // console.log("Ball Bonus: " + ballBonus);
    // console.log("Status Bonus: " + statusBonus);

    // 1. Calculate modified catch rate 'a'
    // a = (((3 * HPmax) - (2 * HPcurrent)) / (3 * HPmax)) * Rate * BonusBall * BonusStatus
    let a = (((3 * maxHP) - (2 * currentHP)) / (3 * maxHP)) * baseRate * ballBonus * statusBonus;
    // Cap 'a' at 255
    if (a >= 255) {
        return { a: a, b: 65535, catchPercentage: 100 };
    }

    // 2. Calculate shake probability 'b'
    // b = 1048560 / sqrt(sqrt(16711680 / a))
    // We keep high precision throughout per user request
    const inner = 16711680 / a;
    const sqrt1 = Math.sqrt(inner);
    const sqrt2 = Math.sqrt(sqrt1);
    const b = 1048560 / sqrt2;

    // 3. Probablity of capture p = (b / 65536)^4
    const pPerShake = b / 65536;
    const catchProbability = Math.pow(pPerShake, 4);
    const catchPercentage = Math.pow(pPerShake, 4) * 100;

    return {
        a: a,
        b: b,
        catchProbability: catchProbability,
        catchPercentage: parseFloat(catchPercentage.toFixed(2))
    };
}

/**
 * Simulates the shake checks.
 * @param {number} b - The shake probability value.
 * @returns {number} Number of successful shakes (0-4).
 */
export function simulateShakes(b) {
    let successfulShakes = 0;
    for (let i = 0; i < 4; i++) {
        const rand = Math.floor(Math.random() * 65536);
        if (rand < b) {
            successfulShakes++;
        } else {
            break;
        }
    }
    return successfulShakes;
}
