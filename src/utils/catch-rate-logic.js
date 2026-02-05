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
    console.log("Catch Rate: " + baseRate);
    console.log("Current HP: " + currentHP);
    console.log("Max HP: " + maxHP);
    console.log("Ball Bonus: " + ballBonus);
    console.log("Status Bonus: " + statusBonus);

    // Calculate modified catch rate 'a'
    //a = ((((3 * HPmax) - (2 * HPcurrent)) * Rate * BonusBall * BonusStatus) / (3 * HPmax)) 
    const cappedRate = Math.min(baseRate, 255);
    const a = Math.max(1, Math.floor(Math.floor(((3 * maxHP - 2 * currentHP) * Math.floor(cappedRate * ballBonus * statusBonus)) / (3 * maxHP))));

    // Cap 'a' at 255
    if (a >= 255) {
        return { a: a, b: 65535, catchPercentage: 100 };
    }

    // Calculate shake probability 'b'
    // b = 1048560 / sqrt(sqrt(16711680 / a))
    const b = Math.floor(1048560 / Math.floor(Math.sqrt(Math.floor(Math.sqrt(16711680 / a)))));

    // Calculate probability of capture 
    // p = (b / 65536)^4
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
