/**
 * Initializes the Shiny Hunting Guide page.
 * @param {HTMLElement} container - The container to render the guide into.
 */
export function initShinyHuntingGuide(container) {
    container.innerHTML = `
    <div class="anim-fade-in text-left max-w-4xl mx-auto px-4 py-8">
      <h1 class="mb-8 text-5xl font-extrabold tracking-tight text-black dark:text-white text-shadow-lg text-center">Shiny Hunting Guide</h1>
      
      <div class="space-y-12">
        <!-- Section: The Beginning -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 bg-blue-500 rounded-full"></span>
            The Beginning
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
            Shiny Pokémon were first introduced in <span class="font-bold text-gray-800 dark:text-gray-200">Generation II</span> (Pokémon Gold, Silver, and Crystal). These rare variants feature a different color palette and are accompanied by a distinctive flash of stars and a "berdalading" sound when they enter battle.
          </p>
          <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-100 dark:border-blue-800">
            <p class="text-blue-800 dark:text-blue-200 italic">
              "The most famous example is the <span class="font-bold">Red Gyarados</span> at the Lake of Rage, which served as many players' first introduction to this rare phenomenon."
            </p>
          </div>
        </section>

        <!-- Section: The Odds -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 bg-red-500 rounded-full"></span>
            Understanding the Odds
          </h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">Classic Odds (Gen II - V)</h3>
              <div class="text-4xl font-black text-red-500">1 in 8,192</div>
              <p class="text-gray-600 dark:text-gray-400">In the early days, finding a Shiny was a monumental task, determined by specific Individual Values (DVs) or Personality Values.</p>
            </div>
            <div class="space-y-4">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">Modern Odds (Gen VI+)</h3>
              <div class="text-4xl font-black text-green-500">1 in 4,096</div>
              <p class="text-gray-600 dark:text-gray-400">Starting with Pokémon X and Y, the base rate was doubled, making these rare creatures slightly more accessible to the average trainer.</p>
            </div>
          </div>
        </section>

        <!-- Section: Hunting Methods -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 bg-yellow-500 rounded-full"></span>
            Hunting Methods
          </h2>
          <div class="grid md:grid-cols-2 gap-x-8 gap-y-10">
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                Random / Static Encounters
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">The most basic method. Each encounter is a simple roll of the dice. Some static encounters are "Shiny Locked" and can never be shiny!</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                The Masuda Method
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Breeding two Pokémon from different language regions (e.g., English and Japanese) significantly boosts egg shiny rates.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                Poké Radar Chaining
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Used in Gen IV, VI, and BDSP. Catching/defeating the same species in a row increases odds up to 1/200 at a 40 chain when using the Poké Radar.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                Chain Fishing
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Introduced in Gen VI. Successfully reeling in Pokémon consecutive times increases the shiny probability drastically.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                SOS Battles (Gen VII)
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Pokemon calling for help in battle in Alola builds a chain that improves shiny odds and hidden ability chances for the allies that appear.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                Catch Combo (Let's Go)
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Catching the same species repeatedly in Let's Go Pikachu/Eevee increases overworld shiny spawns for any species!</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                Curry Cooking (Gen VIII)
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Cooking high-quality curry in the Galar wild area can occasionally attract a shiny Pokémon to your camp.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                Hyperspace Donuts (Gen VI)
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Traveling through Hoopa's rings in Lumiose City with "Sparkling Power" from one of Ansha's donuts to increase shiny odds.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                Sandwich Power (Gen IX)
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Using Herba Mystica in Paldean sandwiches grants "Sparkling Power," vastly increasing specific type shiny spawns.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                Mass Outbreaks
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Groups of the same species appear in the overworld. In <span class="font-bold">PLA</span>, massive outbreaks (and massive mass outbreaks) have boosted odds. In <span class="font-bold">SV</span>, defeating 60+ members of an outbreak provides a permanent boost for that specific outbreak.</p>
            </div>
          </div>
        </section>

        <!-- Section: Shiny Charm -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 bg-purple-500 rounded-full"></span>
            The Shiny Charm
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
            A Key Item obtained by completing the National (or Regional) Pokédex. It provides permanent additional "rolls" for Shininess, stacking with almost all other hunting methods to provide the best possible odds.
          </p>
        </section>

        <!-- CTA Section -->
        <section class="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center transform transition hover:scale-[1.01] flex flex-col items-center">
          <h2 class="text-3xl font-extrabold text-black dark:text-white mb-4">Ready to start your hunt?</h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 font-medium">Use our specialized calculator to see your exact odds for any method across all generations!</p>
          <button id="guide-cta-btn" class="tool-cta border-none cursor-pointer" style="background-color: #f59e0b; align-self: center">
            Try it now!
          </button>
        </section>
      </div>
    </div>
  `;

    document.getElementById('guide-cta-btn').addEventListener('click', () => {
        window.location.hash = '#/shiny-odds';
    });
}
