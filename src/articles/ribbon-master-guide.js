/**
 * Initializes the Ribbon Master Guide page.
 * @param {HTMLElement} container - The container to render the guide into.
 */
export function initRibbonMasterGuide(container) {
  container.innerHTML = `
    <div class="anim-fade-in text-left max-w-4xl mx-auto px-4 py-8">
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-5xl font-extrabold tracking-tight text-black dark:text-white text-shadow-lg">Ribbon Master Guide</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 font-medium">A long-term challenge for trainers who enjoy completion goals.</p>
      </div>
      
      <div class="space-y-12">
        <!-- Section: What is a Ribbon Master? -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 bg-gold-500 rounded-full" style="background-color: #f59e0b"></span>
            What is a Ribbon Master?
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-lg mb-6">
            A <span class="font-bold text-indigo-600 dark:text-indigo-400">Ribbon Master</span> (RM) is a single Pokémon that has obtained <span class="italic">every single ribbon possible</span> for it to achieve from its game of origin all the way to the current generation.
          </p>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="p-5 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800">
              <h3 class="font-bold text-orange-800 dark:text-orange-200 mb-2">The Golden Rule</h3>
              <p class="text-sm text-orange-900/70 dark:text-orange-300">A Pokémon only needs the ribbons available <span class="font-bold text-orange-950 dark:text-orange-100">starting from its origin game</span>. A Pikachu caught in Gen 6 doesn't need Gen 3 ribbons to be a RM!</p>
            </div>
            <div class="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
              <h3 class="font-bold text-indigo-800 dark:text-indigo-200 mb-2">The Community</h3>
              <p class="text-sm text-indigo-900/70 dark:text-indigo-300">Many trainers like to share progress and advice on the <span class="font-bold">r/pokemonribbons</span> subreddit.</p>
            </div>
          </div>
        </section>

        <!-- Section: Getting Started -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
            <span class="w-1.5 h-8 bg-blue-500 rounded-full"></span>
            Choosing Your Candidate
          </h2>
          <div class="space-y-6">
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">Most Ribbon Master runs start in <span class="font-bold text-gray-600 dark:text-gray-400">Generation 3</span> (GameCube or GBA) to maximize total ribbon count. Some players begin with <span class="font-bold text-indigo-500">Shadow Pokemon</span> from Colosseum or XD for access to exclusive ribbons.</p>
            
            <div class="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
              <h4 class="font-bold text-gray-800 dark:text-white mb-3">Common Starting Points:</h4>
              <ul class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 font-bold">•</span>
                  <span><span class="font-bold text-gray-800 dark:text-gray-200">National Ribbon:</span> Only obtainable by Shadow Pokémon in Colosseum/XD.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 font-bold">•</span>
                  <span><span class="font-bold text-gray-800 dark:text-gray-200">Earth Ribbon:</span> Reward for 100 consecutive wins at Mt. Battle in the GameCube games.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Section: The Journey by Generation -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
            <span class="w-1.5 h-8 bg-emerald-500 rounded-full"></span>
            The Generational Gaunlet
          </h2>
          
          <div class="space-y-8">
            <div class="relative pl-8 border-l-2 border-emerald-100 dark:border-emerald-900">
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800"></div>
              <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Generation 3 & 4: The Tower & Contest Era</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">This is usually the longest phase. You need 20 contests in Hoenn and 20 Super Contests in Sinnoh. You will also need to complete the Battle Towers in each of these Generations, consisting of 2 Ribons in Generation 3 and 6 Ribbons in Generation 4. In Gen 6, these consolidate into the <span class="font-bold italic">Contest Memory Ribbon</span> and <span class="font-bold italic">Battle Memory Ribbon</span>.</p>
            </div>

            <div class="relative pl-8 border-l-2 border-emerald-100 dark:border-emerald-900">
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800"></div>
              <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Generation 5: A Rest Stop</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Gen 5 has <span class="font-bold">no ribbons</span>, so it mainly acts as a transfer bridge to the 3DS era. You could go Pokestar Studios to obtain a special Star animation that plays when entering battles.</p>
            </div>

            <div class="relative pl-8 border-l-2 border-emerald-100 dark:border-emerald-900">
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800"></div>
              <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Generation 6 & 7: Even More Battles</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">You'll be battling at the <span class="font-bold">Battle Maison</span>, <span class="font-bold">Battle Tree</span>, and <span class="font-bold">Battle Royal</span> as the last major Battle Facilities of the series. Don't forget the weekly ribbons from certain NPCs and other Miscellaneous Ribbons.</p>
            </div>

            <div class="relative pl-8 border-l-2 border-emerald-100 dark:border-emerald-900">
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800"></div>
              <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Generation 9: Final Stretch</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Currently, the <span class="font-bold">last step</span> in a Ribbon Master's journey. Completing contests in BDSP, conquering the Battle Tower in either BDSP or SWSH, and finally winning in Master Rank on the Online Rank Ladder will complete your hardest ribbons. But don't forget to get the newest additions to RM Journeys, <span class="font-bold">Marks</span>! There are currently 3 obtainable Marks to get in Generation 8.</p>
            </div>

            <div class="relative pl-8 border-l-2 border-emerald-100 dark:border-emerald-900">
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800"></div>
              <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Generation 10: The Future </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">With the release of Winds and Waves, that will begin Generation 10, and hopefully that will mean more Ribbons and Marks to obtain. Only time will tell.</p>
            </div>

          </div>
        </section>

        <!-- Section: Pro Tips -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-6">Recommendations</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span class="text-xs font-black text-indigo-500 uppercase">Tip 01</span>
              <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">Use <span class="font-bold">Berries</span> and <span class="font-bold">Poffins</span> carefully! In older games, sheen is permanent and can't be reset.</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span class="text-xs font-black text-indigo-500 uppercase">Tip 02</span>
              <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">Some ribbons (like the Footprint Ribbon) change their acquisition method based on <span class="font-bold">level</span> or <span class="font-bold">friendship</span>.</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span class="text-xs font-black text-indigo-500 uppercase">Tip 03</span>
              <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">Level check! The earlier Tower Ribbons do not adjust your Pokemon's level to 50, meaning you could get <span class="font-bold">locked out</span> of getting some ribbons.</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span class="text-xs font-black text-indigo-500 uppercase">Tip 04</span>
              <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">The Master Rank Ribbon can be obtained in Sword and Shield or Scarlet and Violet, even if the servers aren't as active. The r/pokemonribbons community has <span class="font-bold">Galar/Paldea Fight Nights</span> to help you get it!</p>
            </div>
          </div>
        </section>

        <!-- Ribbon Tracker CTA Section -->
        <section class="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center transform transition hover:scale-[1.01] flex flex-col items-center">
          <h2 class="text-3xl font-extrabold text-black dark:text-white mb-4">Ready to start?</h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 font-medium">Use the Ribbon Tracker to manage candidates and keep your checklist organized.</p>
          <button id="guide-cta-btn" class="tool-cta border-none cursor-pointer text-white px-8 py-3 rounded-full font-bold shadow-md" style="background-color: #6366f1; align-self: center">
            Ribbon Tracker Tool
          </button>
        </section>
      </div>
    </div>
    `;

  document.getElementById('guide-cta-btn').addEventListener('click', () => {
    window.location.hash = '#/ribbon-tracker';
  });
}

