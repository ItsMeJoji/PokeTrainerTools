export const POKEMON_LOOKUP_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>Pokemon Lookup</strong> tool. Use it to find where a Pokemon appears across mainline games and compare encounter details quickly.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Getting Started: Selection</h3>
  <p>Start with the "Select Pokemon" dropdown. It includes Pokemon from Gen 1 through Gen 9. After choosing a target, you can either filter by one game or view all game results.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Focused Research vs. Full History</h3>
  <p><strong>Select a Game</strong> is best when you are playing one specific version and only need relevant data.</p>
  <p><strong>Show EVERYTHING!</strong> lists encounters across all supported games in order, which is useful for planning hunts or comparing options.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Interpreting the Data</h3>
  <p>Each game is in a collapsible section. Inside, encounters are grouped by <strong>Location Area</strong> and method so you can see exactly where and how to find the Pokemon.</p>
  <ul class="list-disc pl-6 space-y-1">
    <li><strong>Method:</strong> How the encounter happens (grass, surfing, rods, and more).</li>
    <li><strong>Level Range:</strong> Minimum and maximum levels you can encounter.</li>
    <li><strong>Encounter Rate:</strong> The relative chance for that Pokemon in that slot.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Sprites and Shiny Preview</h3>
  <p>Each section shows a version-appropriate sprite. For older games, that means older sprite styles; for newer games, modern artwork.</p>
  <p>Click a sprite to toggle shiny preview so you can quickly compare normal and shiny appearance.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Data Notes</h3>
  <p>Data comes from <strong>PokeAPI</strong>. Some special forms are mapped automatically (for example, Minior and Mimikyu defaults).</p>
  <p>If something looks off, it is usually tied to special-event flags or data gaps in the source API.</p>
</div>
`;

export const ENCOUNTER_CALC_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>Encounter Calculator</strong>. Use it to see what can appear in each location and how likely each encounter is.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">The Core Workflow</h3>
  <p>Use three steps: <strong>Select Game</strong>, <strong>Select Location</strong>, then <strong>Start Encounter</strong>.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Advanced Filters and Game Mechanics</h3>
  <p>When needed, generation-specific filters appear automatically. For example:</p>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>Gen 4 (DPPT):</strong> PokeRadar, Swarms, Time of Day, and Slot 2 dongle options.</li>
    <li><strong>HGSS:</strong> Radio Sound filters that change available encounters.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Analyzing Your Results</h3>
  <p>Results are grouped by <strong>Area</strong> and <strong>Method</strong>. Use them to compare route efficiency, plan hunts, or prep for challenge runs.</p>

  <p>Some newer encounter data is still missing in PokeAPI, so those entries are not shown yet.</p>
</div>
`;

export const CATCH_RATE_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>Catch Rate Calculator</strong>. It estimates your catch chance per ball using generation rules, HP, status, and ball effects.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Step 1: Select Generation</h3>
  <p>Catch formulas vary by generation, so this choice changes the calculation engine and modifier rules.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Step 2: Configure Battle State</h3>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>HP:</strong> Lower HP increases catch chance. Use "Exactly 1 HP" to simulate False Swipe setups.</li>
    <li><strong>Status:</strong> Sleep/Freeze and Paralysis/Burn/Poison apply different multipliers by generation.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Step 3: Choose a Poke Ball</h3>
  <p>Some balls depend on extra context (turn count, area type, level difference, etc.), and the tool will prompt for those details when relevant.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Understanding the Breakdown</h3>
  <p>The breakdown shows key formula values:</p>
  <ul class="list-disc pl-6 space-y-1">
    <li><strong>Value a:</strong> Modified catch rate after major multipliers.</li>
    <li><strong>Value b:</strong> Shake-check threshold used in per-shake success checks.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Quick Tips</h3>
  <p>Compare balls directly. Situational balls often beat Ultra Ball in the right setup.</p>
</div>
`;

export const SHINY_ODDS_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>Shiny Odds Calculator</strong>. Use it to compare shiny odds across games, methods, and modifiers.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Understanding Shiny Rolls</h3>
  <p>Shiny checks are RNG rolls. Base odds are 1/8192 in Gens 1-5 and 1/4096 in Gens 6+. Method bonuses add extra rolls and raise total odds.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Methods and Modifiers</h3>
  <p>Inputs are method-specific and appear dynamically. Common examples include Masuda, SOS chaining, outbreak modifiers, and charm effects.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Probability vs. Results</h3>
  <p>Odds are per encounter, not guarantees. This tool helps you set expectations and compare practical method efficiency.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Efficiency and Timing</h3>
  <p>Also consider time per check. A better odds method can still be slower in practice if each attempt takes longer.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Accuracy Disclaimer</h3>
  <p>Formulas are based on commonly accepted community research and references.</p>
</div>
`;

export const SOS_MOVE_TRACKER_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>SOS Move Tracker</strong>. It helps you track caller PP during Gen 7 SOS chains.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Why It Matters</h3>
  <p>If the caller runs out of PP and uses Struggle, recoil can end your chain. Tracking PP prevents avoidable breaks.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">How to Use It</h3>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>Select Target:</strong> Choose the Pokemon you are chaining.</li>
    <li><strong>Verify Moves:</strong> Confirm or edit the loaded moveset.</li>
    <li><strong>Log Moves:</strong> Decrement PP each time the caller acts.</li>
    <li><strong>Swap Safely:</strong> Replace low-PP callers only after a new ally appears.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Special Case: Ditto</h3>
  <p>Use the "Transformed!" mode when Ditto copies your lead so PP tracking stays accurate.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Long Chain Setup</h3>
  <p>Harvest + Skill Swap + Leppa Berry setups can stabilize very long chains. Without that setup, PP tracking becomes even more important.</p>
</div>
`;

export const RIBBON_TRACKER_INSTRUCTIONS = `
<div class="space-y-4 text-left p-2">
  <p>Welcome to the <strong>Ribbon Tracker</strong>. Use it to track Ribbon Master progress and avoid missed ribbons before transfers.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">What is a Ribbon Master?</h3>
  <p>A Ribbon Master is a Pokemon that earns every ribbon it is eligible for from its origin game onward.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">How It Is Organized</h3>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>By Generation/Game:</strong> See what is available at each stage.</li>
    <li><strong>Eligibility Logic:</strong> Species/game restrictions are reflected in the list.</li>
    <li><strong>Saved Progress:</strong> Stored locally, with optional Google Drive sync.</li>
  </ul>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Common Roadblocks</h3>
  <p>Battle Tower ribbons and certain contest ribbons are frequent bottlenecks. The linked guide covers practical strategies.</p>
  
  <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Transfer Checkpoint</h3>
  <p>Some transfers are one-way. Use the checklist before moving forward so you do not lock yourself out of older ribbons.</p>
</div>
`;
