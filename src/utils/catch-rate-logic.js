// Calculate the catch rate for Generation 3/4

export function calculateGen34(baseRate, currentHP, maxHP, ballBonus, statusBonus) {

    //Console Log for Debugging
    console.log("Catch Rate: " + baseRate);
    console.log("Current HP: " + currentHP);
    console.log("Max HP: " + maxHP);
    console.log("Ball Bonus: " + ballBonus);
    console.log("Status Bonus: " + statusBonus);

    // Calculate modified catch rate 'a'
    const cappedRate = Math.min(baseRate, 255);
    const a = Math.max(1, Math.floor(Math.floor(((3 * maxHP - 2 * currentHP) * Math.floor(cappedRate * ballBonus * statusBonus)) / (3 * maxHP))));

    // Cap 'a' at 255
    if (a >= 255) {
        return { a: a, b: 65535, catchPercentage: 100 };
    }

    // Calculate shake probability 'b'
    const b = a === 0 ? 0 : Math.floor(Math.round(65536 / Math.round(Math.sqrt(Math.round(Math.sqrt(Math.round(255 / a)))))));

    // Calculate probability of capture 
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


// Calculate the catch rate for Generation 5

function rndDown(x) {
    return Math.floor(x * 4096) / 4096;
}

function rnd(x) {
    return Math.round(x * 4096) / 4096;
}

function DexBonus(x) {

    var dexBonus = 0;

    if (x <= 30) {
        dexBonus = 0.3;
    }
    if (x >= 31 && x <= 150) {
        dexBonus = 0.5;
    }
    if (x >= 151 && x <= 300) {
        dexBonus = 0.7;
    }
    if (x >= 301 && x <= 450) {
        dexBonus = 0.8;
    }
    if (x >= 451 && x <= 600) {
        dexBonus = 0.9;
    }
    if (x >= 601) {
        dexBonus = 1;
    }
    return dexBonus;
}

export function calculateGen5(baseRate, currentHP, maxHP, ballBonus, statusBonus, grassModifier, dexCount, entralinkModifier) {

    //Console Log for Debugging
    console.log("Catch Rate: " + baseRate);
    console.log("Current HP: " + currentHP);
    console.log("Max HP: " + maxHP);
    console.log("Ball Bonus: " + ballBonus);
    console.log("Status Bonus: " + statusBonus);
    console.log("Grass Modifier: " + grassModifier);
    // Calculate Dex bonus
    let dexBonus;
    if (grassModifier === true) {
        dexBonus = DexBonus(dexCount);
    } else {
        dexBonus = 1; // Thick grass or other conditions disable the bonus
    }

    // Calculate Entralink bonus
    let entralinkBonus;
    if (entralinkModifier === "1") {
        entralinkBonus = 110;
    } else if (entralinkModifier === "2") {
        entralinkBonus = 120;
    } else if (entralinkModifier === "3") {
        entralinkBonus = 130;
    } else {
        entralinkBonus = 100;
    }

    // Calculate Pokedex Modifier
    let pokedexModifier;
    if (dexCount <= 30) {
        pokedexModifier = 0;
    }
    if (dexCount >= 31 && dexCount <= 150) {
        pokedexModifier = 0.5;
    }
    if (dexCount >= 151 && dexCount <= 300) {
        pokedexModifier = 1;
    }
    if (dexCount >= 301 && dexCount <= 450) {
        pokedexModifier = 1.5;
    }
    if (dexCount >= 451 && dexCount <= 600) {
        pokedexModifier = 2;
    }
    if (dexCount >= 601) {
        pokedexModifier = 2.5;
    }

    console.log("Dex Bonus: " + dexBonus);
    console.log("Entralink Bonus: " + entralinkBonus);

    // Calculate modified catch rate 'a'
    const cappedRate = Math.min(baseRate, 255);
    const a = Math.min(255, rndDown(rnd(rndDown(rnd(rnd((3 * maxHP - 2 * currentHP) * dexBonus) * cappedRate * ballBonus) / (3 * maxHP)) * statusBonus) * entralinkBonus / 100))

    // Cap 'a' at 255
    if (a >= 255) {
        return { a: a, b: 65535, catchPercentage: 100 };
    }

    // Calculate shake probability 'b'
    const b = a === 0 ? 0 : Math.floor(rnd(65536 / rnd(Math.sqrt(rnd(Math.sqrt(rnd(255 / a)))))));

    // Calculate probability of capture 
    const pPerShake = b / 65536;
    const catchProbability = Math.pow(pPerShake, 3);
    const catchPercentage = Math.pow(pPerShake, 3) * 100;

    // Calculate the chance for a Critical Capture
    const critChance = Math.floor(rnd(rnd(a * pokedexModifier) / 6));
    const critCapture = Math.min(1, critChance / 256);

    return {
        a: a,
        b: b,
        catchProbability: catchProbability,
        catchPercentage: parseFloat(catchPercentage.toFixed(2)),
        critCapture: parseFloat(critCapture.toFixed(4))
    };
}


// Simulate the shakes

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
