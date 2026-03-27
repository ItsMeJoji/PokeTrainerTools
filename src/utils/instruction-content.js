export const POKEMON_LOOKUP_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>Pokemon Lookup</strong> tool! This comprehensive feature is designed to be your ultimate companion for identifying encounter locations across the entire mainline Pokemon series. Whether you are a casual player trying to finish your Pokedex, a competitive trainer looking for specific base stats and abilities, or a dedicated shiny hunter planning your next long-term project, this tool provides the granular data you need.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Getting Started: Selection</h3>
  <p>The journey begins with the "Select Pokemon" dropdown. We have integrated data for every single Pokemon from Generation 1 (Red/Blue/Yellow) all the way through the latest entries in Generation 9 (Scarlet/Violet). As you type, the list filters in real-time. Once you select your target, you'll be presented with two primary ways to explore: "Select a Game" or "Show EVERYTHING!".</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Focused Research vs. Full History</h3>
  <p>The <strong>Select a Game</strong> button is perfect for active playthroughs. If you're currently in the middle of a HeartGold Nuzlocke and want to know if Scyther is available in the Bug Catching Contest, this mode will filter the results to only show that specific version's data. This keeps the interface clean and prevents information overload.</p>
  <p>Conversely, the <strong>Show EVERYTHING!</strong> mode is a power-user favorite. It generates a massive, chronologically sorted list of every single encounter that Pokemon has ever had. From the pixelated grass of Gen 1 to the open world of Gen 9, you can see how encounter rates and locations have shifted over decades of game design. This is particularly useful for shiny hunters who want to find the game with the highest natural encounter rate or the most convenient "reset" spot.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Interpreting the Data</h3>
  <p>Each game version is contained within a collapsible section. Opening one reveals the specific <strong>Location Areas</strong> where your Pokemon resides. We break this down by "Area" (e.g., 1F, B1F, or specific Routes) to ensure you aren't wandering blindly. Inside each area, a detailed table displays:</p>
  <ul class="list-disc pl-6 space-y-1">
    <li><strong>Method:</strong> How you find them. Is it walking in tall grass? Surfing? Using a Super Rod? Or perhaps a special event like a Headbutt tree or Rock Smash?</li>
    <li><strong>Level Range:</strong> The minimum and maximum levels you can expect to see. This is vital for "Repel Trick" strategies, where you use a Repel with a lead Pokemon at a specific level to filter out lower-level spawns.</li>
    <li><strong>Encounter Rate:</strong> The percentage chance that this specific Pokemon will appear compared to others in that pool.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Interactive Sprites and Shiny Previews</h3>
  <p>We believe data should be beautiful. Every game section features a version-appropriate sprite. For Generations 1 through 5, you'll see the exact sprites used in those original games (e.g., the iconic green-tinted sprites from Yellow or the animated styles of Black/White). For Generations 6 and beyond, we use modern high-definition artwork.</p>
  <p><strong>The Shiny Toggle:</strong> One of our most popular features is the ability to preview shiny forms directly. Clicking on any Pokemon sprite will instantly toggle it to its rare shiny coloration. When you toggle a shiny, you'll see a custom "sparkle" animation—a small nod to the thrill of seeing that flash in-game. This helps you decide if a specific hunt is visually worth the effort!</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Technical Notes and Reliability</h3>
  <p>All data is fetched dynamically from the <strong>PokeAPI</strong>, ensuring the most up-to-date and accurate information available to the community. We also handle special forms—for example, searching for "Minior" will correctly pull data for its Meteor form, and "Mimikyu" will default to its Disguised form. If you ever find a discrepancy, remember that some special event encounters (like the Celebi event in Crystal) have unique flags in the database.</p>
  <p>By centralizing this information, the Pokemon Lookup tool eliminates the need for multiple open browser tabs on various wikis. Whether you're checking "Let's Go" spawn rates or original "Red" safari zone percentages, it's all right here at your fingertips. Happy hunting!</p>
</div>
`;

export const ENCOUNTER_CALC_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>Encounter Calculator</strong>! This tool is designed to provide you with a high-fidelity simulation and breakdown of exactly what Pokemon are hiding in the tall grass (or water, or caves) of your favorite game. Unlike a standard wiki list, this calculator accounts for dynamic variables like time of day, special game mechanics, and regional variations to give you the most accurate percentages possible.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">The Core Workflow</h3>
  <p>Using the calculator is a three-step process: <strong>Select Game</strong>, <strong>Select Location</strong>, and <strong>Start Encounter</strong>. Once you pick a game, the "Location" dropdown will dynamically populate with every named area in that version. We've gone to great lengths to ensure locations are named intuitively, matching their in-game counterparts.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Advanced Filters and Game Mechanics</h3>
  <p>The real power of this tool lies in its ability to handle complex game-specific mechanics. When you select certain generations, "Advanced Filter" grids will appear. For example:</p>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>Gen 4 (DPPT) Mechanics:</strong>
      <ul class="list-circle pl-6 mt-1">
        <li><strong>PokeRadar:</strong> Toggling this will show you exclusive encounters only available when using the radar in Sinnoh.</li>
        <li><strong>Swarms:</strong> Every day, a specific Pokemon "swarms" a route. This filter adds that rare 40% encounter to the list.</li>
        <li><strong>Time of Day:</strong> Morning, Day, and Night drastically change what appears. Selecting a time filters the results to match that specific window.</li>
        <li><strong>Slot 2 (Dual Slot):</strong> Reminiscent of the original DS hardware, this simulates having a Gen 3 cartridge in the GBA slot, which unlocks "Dongle" encounters like Elekid or Magby.</li>
      </ul>
    </li>
    <li><strong>HeartGold / SoulSilver (HGSS) Mechanics:</strong>
      <ul class="list-circle pl-6 mt-1">
        <li><strong>Radio Sounds:</strong> Johto is unique! By playing the "Hoenn Sound" or "Sinnoh Sound" on your PokeGear radio, you can find non-native Pokemon. This filter updates the encounter pool accordingly.</li>
      </ul>
    </li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Analyzing Your Results</h3>
  <p>Encounters are grouped by <strong>Area</strong> (e.g., 1F vs. B1F) and then by <strong>Method</strong>. Each Pokemon card shows its name, a high-quality sprite, and its exact encounter percentage. This is invaluable for:</p>
  <ol class="list-decimal pl-6 space-y-1">
    <li><strong>Shiny Hunting Planning:</strong> If a Pokemon has a 10% rate in Route A but a 20% rate in Route B, you'll know exactly where to set up your hunt.</li>
    <li><strong>Nuzlocke Execution:</strong> Know exactly what could pop out for your "first encounter on the route."</li>
    <li><strong>Repel Tricks:</strong> Although we don't calculate the repel levels here, seeing the level ranges helps you determine if a Repel Trick is viable in your current location.</li>
  </ol>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Interactive Features</h3>
  <p>Just like our Lookup tool, every sprite in the result list is interactive. Click a sprite to see its shiny form! We've also included a "Reset Encounter" button that allows you to quickly go back and change filters or locations without refreshing the page. This is part of our commitment to a smooth, single-page application experience.</p>
  <p>Whether you're looking for that 1% Chansey in the Safari Zone or just trying to see what you can find at night on Route 1, the Encounter Calculator provides the most detailed and immersive way to explore the wild Pokemon of the world.</p>
</div>
`;

export const CATCH_RATE_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>Catch Rate Calculator</strong>! This is perhaps the most essential tool for any trainer facing down a legendary Pokemon or a rare shiny. Catching a Pokemon isn't just luck—it is a rigorous mathematical formula that involves base catch rates, health ratios, status conditions, and specific Poké Ball multipliers. This tool brings those "under-the-hood" numbers to the surface so you can catch with confidence.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Step 1: Selecting Your Generation</h3>
  <p>The "Capture Formula" has changed significantly over the decades. In Generation 3 and 4, the math was quite different from the modernized Gen 8 and 9 systems. Selecting the correct generation is vital because it changes the multipliers for status conditions, the way Poké Balls behave (like the Timer Ball's scaling), and even the "Critical Catch" logic introduced in Gen 5. Our calculator automatically adjusts its internal engine based on this selection.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Step 2: Configuring the Target</h3>
  <p>Once your generation and target Pokemon are selected, you'll need to input the current battle conditions:</p>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>HP Percentage:</strong> Use the slider to estimate the target's health. The lower the health, the higher the catch rate. For professional hunters, the "Exactly 1 HP" checkbox simulates the effect of the move <em>False Swipe</em>, which provides the absolute maximum HP-based boost.</li>
    <li><strong>Status Condition:</strong> Sleep and Freeze are the gold standards, providing a massive 2.5x multiplier in modern games (or 2.0x in older ones). Paralysis, Burn, and Poison provide a smaller but still significant 1.5x boost. Selecting "None" uses the base multiplier of 1.0x.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Step 3: Choosing Your Poké Ball</h3>
  <p>This is where the strategy really shines. Different Poké Balls have vastly different multipliers depending on the context. When you select a specialized ball, the tool will often ask for more information. For example:</p>
  <ul class="list-disc pl-6 space-y-1">
    <li><strong>Timer Ball:</strong> Enter how many turns have passed to see the rate ramp up to its 4.0x maximum.</li>
    <li><strong>Dusk Ball:</strong> Are you in a cave or is it night? Toggle the indicator to see a 3.0x or 3.5x boost.</li>
    <li><strong>Level Ball:</strong> Input your own Pokemon's level to compare it against the wild target.</li>
    <li><strong>Net Ball:</strong> The calculator automatically checks if the target is Water or Bug type based on the Pokedex data.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">The Results and Calculation Breakdown</h3>
  <p>After clicking "Calculate Catch Rate," you'll see a simulated "Poké Ball toss" animation followed by your percentage chance of success per throw. But we don't stop there. For those who want to see the "why," we include a <strong>Calculation Breakdown</strong> collapsible. This section reveals the raw variables used by the game engine:</p>
  <ul class="list-disc pl-6 space-y-1">
    <li><strong>Value 'a':</strong> This is the modified catch rate after HP and Status are applied. If 'a' is 255 or higher, the catch is guaranteed.</li>
    <li><strong>Value 'b':</strong> For lower catch rates, this determines if each of the four "shakes" is successful. We display the percentage chance for a single shake to succeed.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Pro Tips for Master Trainers</h3>
  <p>Use this tool to compare balls. Sometimes an Ultra Ball (2.0x) is actually worse than a Repeat Ball (3.5x) or a Net Ball. Also, pay attention to "Capture Powers" (Gen 6/7/9) which can be toggled in the calculator to see that extra edge. By understanding the math, you can save your Master Ball for the true emergencies. Good luck in the field, and may your critical catches be frequent!</p>
</div>
`;

export const SHINY_ODDS_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>Shiny Odds Calculator</strong>! This tool is designed to provide you with the most accurate mathematical expectations for your shiny hunts across every generation of the Pokemon series. Whether you are using the classic Masuda Method, SOS chaining in Alola, or crafting Sparkling Power sandwiches in Paldea, this calculator breaking down the "rolls" to give you a clear picture of your probability.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Understanding Shiny "Rolls"</h3>
  <p>In the Pokemon games, the engine determines if a Pokemon is shiny by performing a series of "rolls" or checks against a random number generator (RNG). A base encounter has a 1 in 8192 chance (Gens 1-5) or 1 in 4096 chance (Gens 6+). Every "bonus" you get—like the Shiny Charm or a specific hunting method—adds more rolls to this check. If any of those rolls succeed, the Pokemon is shiny. Our calculator uses these exact roll counts to determine the final probability.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Methods and Modifiers</h3>
  <p>The tool supports a wide array of specialized methods. When you select a game and a method, the interface will dynamically present the variables that matter for that specific hunt. For example:</p>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>Masuda Method:</strong> Breeding two Pokemon from different real-world languages adds 5 or 6 extra rolls depending on the generation.</li>
    <li><strong>SOS Chaining (Gen 7):</strong> As your chain grows, the internal "bin" of rolls increases at milestones like 10, 20, and 30 encounters.</li>
    <li><strong>DexNav (Gen 6):</strong> This is a complex formula that accounts for your "Search Level" and random "Shiny Boost" chances per encounter.</li>
    <li><strong>Mass Outbreaks (PLA/SV):</strong> These provide a massive inherent boost, which can be further amplified by completion of the Pokedex or specific Sandwich powers.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Probability vs. Reality</h3>
  <p>It is important to remember that these percentages represent the <strong>odds per encounter</strong>. While a 1/512 chance (common for Masuda with Charm) sounds high, it doesn't guarantee a shiny within 512 eggs. This is known as "Gambler's Fallacy." To help you plan, consider the cumulative probability: by encounter 512, you have roughly a 63% chance of having seen at least one shiny. By encounter 1500, that chance rises to over 95%. This tool helps you set realistic expectations for your session.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Efficiency and Timing</h3>
  <p>When planning a hunt, look at the time investment. A method with 1/200 odds that takes 5 minutes per check (like some static resets) might actually be less efficient than a 1/4096 method that allows for 100 checks per hour (like heavy-encounters). We recommend using our <strong>Shiny Hunting Guide</strong> (linked at the top) to learn the physical execution of these techniques before inputting your data here for probability verification.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Accuracy Disclaimer</h3>
  <p>We use the most widely accepted formulas researched by the community (such as those from Smogon and Bulbapedia).</p>
</div>
`;

export const SOS_MOVE_TRACKER_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>SOS Move Tracker</strong>! This specialized utility is a lifesaver for anyone undertaking SOS Chaining in Generation 7 (Sun, Moon, Ultra Sun, and Ultra Moon). While SOS chaining is a fantastic way to acquire Hidden Abilities and high IVs, the biggest threat to your chain is the wild Pokemon's PP (Power Points). If a wild Pokemon runs out of PP and uses "Struggle," it will faint from recoil damage, ending your hours of hard work instantly.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">The Goal of the Tracker</h3>
  <p>This tool acts as a dedicated companion to your 3DS. Its primary purpose is to keep a precise count of every move used by the wild "caller" Pokemon. By knowing exactly how much PP is left, you can safely switch to a new caller before the current one becomes a danger to itself. This allows for essentially "infinite" chains if managed correctly.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">How to Use the Tracker</h3>
  <p>Using the tracker is straightforward but requires consistent attention during your battle. For example:</p>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>Select Your Target:</strong> Search for the Pokemon you are currently chaining. We've limited the list to Pokemon known for appearing in SOS battles to keep the search efficient.</li>
    <li><strong>Initialize Moves:</strong> Once selected, the tool automatically pulls the standard moveset for that Pokemon at the relevant encounter level. You can manually adjust these if you notice a different move being used.</li>
    <li><strong>Log Actions:</strong> Every time the wild Pokemon takes a turn and uses a move, click the corresponding button in the tracker to decrement its PP. The tool will turn orange when PP is low and red when it is critical.</li>
    <li><strong>Switching Callers:</strong> When your current caller is low on PP, faint it ONLY after the *new* ally has successfully called for help and appeared. Then, reset the tracker for the new Pokemon to start the cycle over.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Special Cases: Ditto and Smeargle</h3>
  <p>Certain Pokemon require extra care. When hunting <strong>Ditto</strong>, it will transform into your lead Pokemon. Use the "Transformed!" toggle to switch the tracker to match your own lead's moveset and PP. This is vital because Ditto only gets 5 PP per move after transforming, making it one of the most volatile chains to maintain.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">The "Leppa Berry" Infinite Chain</h3>
  <p>To truly master SOS chaining, we highly recommend the <strong>Harvest + Skill Swap</strong> strategy. By giving the wild Pokemon the "Harvest" ability and a Leppa Berry, it will infinitely restore its own PP. However, if you haven't set up this advanced loop yet, this tracker is your primary line of defense against a broken chain. Check our <strong>SOS Chaining Guide</strong> for the full breakdown of how to prepare your team for these marathons.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Pro Tip: Adrenaline Orbs</h3>
  <p>Remember that you only need to use one Adrenaline Orb per match to increase the call rate permanently! Don't waste turns re-using them. Use your turns to status the allies or use a "Nothing" item like a Poke Ball on a full team to pass the turn without damaging the caller. Keep your eyes on the PP counts, and that shiny will eventually appear!</p>
</div>
`;

export const RIBBON_TRACKER_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>Ribbon Tracker</strong>! This tool is the ultimate dashboard for "Ribbon Masters"—Pokemon that have been carried across multiple generations to collect every possible award and title the series has to offer. Whether you are working on a single companion from the Gameboy Advance era or a new friend from Paldea, this tracker helps you visualize and complete your collection.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">What is a Ribbon Master?</h3>
  <p>A Ribbon Master is defined as a Pokemon that has obtained every ribbon it was eligible for from its origin game onwards. This challenge is one of the most prestigious community-driven goals in the Pokemon fandom. Our tracker is built to support this journey by organizing ribbons by generation and game, ensuring you don't miss a single one before transferring your Pokemon to the next era.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Navigating the Collection</h3>
  <p>Ribbons are grouped hierarchically to mirror the transfer path. For example:</p>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>Generational Tabs:</strong> Switch between Gen 3, Gen 4, etc., to see the specific ribbons available in those titles.</li>
    <li><strong>Eligibility Logic:</strong> Some ribbons are exclusive to certain games (like Legend Ribbon in Gen 4) or specific Pokemon (like the "National Ribbon" for purified Shadow Pokemon). The tracker provides descriptions for each to help you understand where and how to get them.</li>
    <li><strong>Progress Saving:</strong> Every checkbox you click is saved locally to your browser's storage. If you have <strong>Google Drive Sync</strong> enabled in our app, your progress will even follow you across devices!</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">The Most Common Hurdles</h3>
  <p>Every generation has its "gatekeeper" ribbons. In Gen 3 and 4, the <strong>Battle Tower</strong> ribbons are notoriously difficult, requiring a high level of competitive strategy. In Gen 6 and 7, the <strong>Contest Spectacular</strong> ribbons are more about preparation and "Coolness" stats. Our <strong>Ribbon Master Guide</strong> (linked above) provides deep-dive strategies for conquering these specific challenges, including recommended movesets for the towers.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Transferring: The Point of No Return</h3>
  <p>Perhaps the most critical use of this tracker is the "Transfer Checklist." Once you move a Pokemon from Gen 4 to Gen 5, it can NEVER go back. You must be 100% certain you have every ribbon before using the Poke Transporter or Poke Transfer Lab. Use the checklists here to double and triple-check your collection before making the leap.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Celebrating Your Journey</h3>
  <p>Ribbons are more than just icons—they are memories. The "legendary" titles granted by these ribbons (like "the Living Legend" or "the Royal Resident") show up when you send your Pokemon into battle in modern games. Use this tracker to turn your favorite Pokemon into a true champion across the ages. We can't wait to see your completed Ribbon Masters!</p>
</div>
`;
