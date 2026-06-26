/**
 * Initializes the Shiny Hunting Guide page.
 * @param {HTMLElement} container - The container to render the guide into.
 */
export function initShinyHuntingGuide(container) {
    container.innerHTML = `
    <div class="anim-fade-in text-left max-w-4xl mx-auto px-4 py-8">
      <h1 class="mb-8 text-5xl font-extrabold tracking-tight text-black dark:text-white text-shadow-lg text-center">Shiny Hunting</h1>
      
      <div class="space-y-12">
        <!-- Section: The Beginning -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 brand-marker-red rounded-full"></span>
            Is My Pokemon Sick?
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
            Shiny Pokemon were first introduced in <span class="font-bold text-gray-800 dark:text-gray-200">Generation II</span> (Pokemon Gold, Silver, and Crystal). These Pokemon feature a different color palette, have a distinctive flash of stars/sparkles, and a "berdalading" sound when they enter battle.
          </p>
          <div class="mt-6 p-4 brand-panel-red">
            <p class="brand-text-red italic">
              The most famous example of a Shiny Pokemon is the <span class="font-bold">Red Gyarados</span> at the Lake of Rage, which served as many players' first introduction to Shiny Pokemon in Pokemon Gold, Silver, and Crystal as well as their remakes Pokemon HeartGold and SoulSilver.
            </p>
          </div>
        </section>

        <!-- Section: The Odds -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 brand-marker-red rounded-full"></span>
            Understanding the Odds
          </h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">Classic Odds (Gen II - V)</h3>
              <div class="text-4xl font-black text-[#ef4444]">1 in 8,192</div>
              <p class="text-gray-600 dark:text-gray-400">These are the original odds. In the early games, Shiny Pokemon were much rarer and harder to obtain without the use of glitches.</p>
            </div>
            <div class="space-y-4">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">Modern Odds (Gen VI+)</h3>
              <div class="text-4xl font-black text-[#facc15]">1 in 4,096</div>
              <p class="text-gray-600 dark:text-gray-400">Starting in X/Y, base odds were halved, making Shiny Pokemon more obtainable in likely fewer encounters.</p>
            </div>
          </div>
          <br>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
            While these odds make it seem impossible to find a Shiny Pokemon, there are ways (from Generation IV onwards) to increase your odds.
          </p>
        </section>

        <!-- Section: Hunting Methods -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 brand-marker-yellow rounded-full"></span>
            Hunting Methods
          </h2>
          <div class="grid md:grid-cols-2 gap-x-8 gap-y-10">
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full brand-marker-yellow"></span>
                Random / Static Encounters
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">This is the most basic method. Each encounter is an independent shiny check, but keep in mind that some some static encounters are "Shiny Locked" and can never be shiny!</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full brand-marker-yellow"></span>
                The Masuda Method
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">First introduced in Generation IV, this method increases your odds of finding a Shiny Pokemon by breeding two Pokemon from different language regions (e.g., English and Japanese).</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full brand-marker-yellow"></span>
                Poke Radar Chaining
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Introduced in Gen IV, VI, and BDSP, but not unlocked until the post-game, Using the Poke Radar to catch or defeat the same species in a row increases odds up to 1/200 at a 40-chain.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full brand-marker-yellow"></span>
                Chain Fishing
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Introduced in Gen VI, successfully reeling in Pokemon consecutive times increases the shiny probability drastically, up to 1/100 odds at a 20-chain. </p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full brand-marker-yellow"></span>
                SOS Battles (Gen VII)
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">In Alola, Pokemon calling for help in battle builds a chain that improves shiny odds and hidden ability chances for the allies that appear. The odds increase the longer your chain is, capping at max odds at a 31-chain.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full brand-marker-yellow"></span>
                Catch Combo (Let's Go)
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Catching the same species repeatedly in Let's Go Pikachu/Eevee increases overworld shiny spawns for the chained Pokemon. Just like SOS Battles, the odds increase with each successful catch, capping at max odds at a 31-chain.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full brand-marker-yellow"></span>
                Curry Cooking (Gen VIII)
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Cooking high-quality curry in the Galar wild area can occasionally attract a shiny Pokemon to your camp. While this doesn't change the odds, the Shiny Pokemon will have a Curry Mark, and that's pretty cool!</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full brand-marker-yellow"></span>
                Hyperspace Donuts (Gen IX)
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Introduced in Pokemon Legends ZA, You can use special Hyperspace Donuts with "Sparkling Power" from Ansha donuts to increase shiny odds.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full brand-marker-yellow"></span>
                Sandwich Power (Gen IX)
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Using Herba Mystica in sandwiches grants "Sparkling Power," increasing specific type shiny spawns. When combined with Mass Outbreaks, this makes your odds insanely good.</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full brand-marker-yellow"></span>
                Mass Outbreaks (Gen IX)
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Large groups of the same Pokemon will appear in the overworld on occasion. In <span class="font-bold">PLA</span>, massive outbreaks (and massive mass outbreaks) have boosted odds, and can spawn Pokemon of the same evo-line. In <span class="font-bold">SV</span>, defeating 60+ members of an outbreak provides a permanent boost for that specific Pokemon outbreak.</p>
            </div>
          </div>
        </section>

        <!-- Section: Shiny Charm -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 brand-marker-red rounded-full"></span>
            The Shiny Charm
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
            If you don't care about hunting at full odds, the Shiny Charm is a essential for hunting. It is usually obtained by completing the Pokedex and it provides a permanent increase to your odds for Shiny Pokemon, and it can stack with almost all other hunting methods to give you the best possible odds.
          </p>
        </section>

        <!-- CTA Section -->
        <section class="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center transform transition hover:scale-[1.01] flex flex-col items-center">
          <h2 class="text-3xl font-extrabold text-black dark:text-white mb-4">Ready to start?</h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 font-medium">Use the calculator to check exact odds for each method and game.</p>
          <button id="guide-cta-btn" class="tool-cta border-none cursor-pointer" style="background-color: #f59e0b; align-self: center">
            Try it now!
          </button>
        </section>
      </div>
    </div>
  `;

    document.getElementById('guide-cta-btn').addEventListener('click', () => {
        window.location.pathname = '/shiny-odds';
    });
}

