/**
 * Initializes the SOS Hunting Guide page.
 * @param {HTMLElement} container - The container to render the guide into.
 */
export function initSosHuntingGuide(container) {
  container.innerHTML = `
    <div class="anim-fade-in text-left max-w-4xl mx-auto px-4 py-8">
      <h1 class="mb-8 text-5xl font-extrabold tracking-tight text-black dark:text-white text-shadow-lg text-center">SOS Chaining Guide</h1>
      
      <div class="space-y-12">
        <!-- Section: Introduction -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 bg-blue-500 rounded-full"></span>
            What is SOS Chaining?
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
            Introduced in <span class="font-bold text-gray-800 dark:text-gray-200">Generation VII</span>, SOS Battles occur when a wild Pokémon calls for help when its HP is low. Chain-calling these allies increases the odds of finding Shiny Pokémon, Pokémon with Hidden Abilities, and Pokémon with max IVs.
          </p>
        </section>

        <!-- Section: Ideal Setup -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 bg-purple-500 rounded-full"></span>
            The Ideal Setup
          </h2>
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">To create an infinite SOS Chain without the caller running out of PP and struggling to death, use the "Harvest" method.</p>
            
            <div class="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">1. The Setup Pokémon</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-2">A Pokémon with the <span class="font-bold">Harvest</span> ability (like Exeggutor or Trevenant) holding a <span class="font-bold">Leppa Berry</span>.</p>
              <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-1">
                <li>Move: <span class="font-bold">Skill Swap</span> (to give the wild Pokémon Harvest)</li>
                <li>Move: <span class="font-bold">Trick</span> or <span class="font-bold">Bestow</span> (to give the wild Pokémon the Leppa Berry)</li>
              </ul>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">2. The False Swiper</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-2">A high-level Pokémon to lower the target's HP and knock out the allies.</p>
              <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-1">
                <li>Move: <span class="font-bold">False Swipe</span> or <span class="font-bold">Hold Back</span> (leaves target at 1 HP)</li>
                <li>Items: <span class="font-bold">Adrenaline Orb</span> (use one to increase call rate)</li>
              </ul>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">3. Scare the Caller</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-2">Using an Adrenaline Orb on the caller to increase its call rate.</p>
              <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-1">
                <li><span class="font-bold">You can also reselect Adrenaline Orb on turns where nothing is called to prevent knocking out the caller.</span></li>
              </ul>
            </div>
          </div>
        </section>

        <!-- SOS Move Tracker CTA Section -->
        <section class="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center transform transition hover:scale-[1.01] flex flex-col items-center">
          <h2 class="text-3xl font-extrabold text-black dark:text-white mb-4">Track Wild Pokémon PP</h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 font-medium">Use the SOS Move Tracker to know when to swap callers before Struggle becomes a risk.</p>
          <button id="sos-tracker-cta-btn" class="tool-cta border-none cursor-pointer text-white px-8 py-3 rounded-full font-bold shadow-md" style="background-color: #8b5cf6; align-self: center">
            SOS Move Tracker
          </button>
        </section>

        <!-- Section: Chain Mechanics -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 bg-red-500 rounded-full"></span>
            Chain Mechanics & Odds
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6 font-medium">As the chain grows, the rewards increase. The chain resets after 255 calls in Sun and Moon (it loops back to 0), but in Ultra Sun and Ultra Moon, the chain never resets.</p>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-100 dark:border-red-800">
              <h4 class="font-bold text-red-800 dark:text-red-200 mb-1">Chain Length 0 - 10</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Base shiny odds (1/4096), 0 guaranteed max IVs, 0% Hidden Ability chance.</p>
            </div>
            <div class="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-2xl border border-orange-100 dark:border-orange-800">
              <h4 class="font-bold text-orange-800 dark:text-orange-200 mb-1">Chain Length 11 - 20</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Odds slightly increased, 1 guaranteed max IV, 5% Hidden Ability chance.</p>
            </div>
            <div class="bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-2xl border border-yellow-100 dark:border-yellow-800">
              <h4 class="font-bold text-yellow-800 dark:text-yellow-200 mb-1">Chain Length 21 - 30</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Odds increased further, 2 guaranteed max IVs, 10% Hidden Ability chance.</p>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-100 dark:border-green-800">
              <h4 class="font-bold text-green-800 dark:text-green-200 mb-1">Chain Length 31+</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Max shiny odds (up to 1/273 with Shiny Charm), 4 guaranteed max IVs, 15% Hidden Ability chance.</p>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center transform transition hover:scale-[1.01] flex flex-col items-center">
          <h2 class="text-3xl font-extrabold text-black dark:text-white mb-4">Calculate Your Odds</h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 font-medium">Use the Shiny Odds Calculator to estimate your SOS odds based on game and modifiers.</p>
          <button id="sos-cta-btn" class="tool-cta border-none cursor-pointer" style="background-color: #f59e0b; align-self: center">
            Shiny Odds Calculator
          </button>
        </section>
      </div>
    </div>
  `;

  document.getElementById('sos-cta-btn').addEventListener('click', () => {
    window.location.hash = '#/shiny-odds';
  });

  document.getElementById('sos-tracker-cta-btn').addEventListener('click', () => {
    window.location.hash = '#/sos-tracker';
  });
}

