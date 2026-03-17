/**
 * Initializes the Ribbon Master Guide page.
 * @param {HTMLElement} container - The container to render the guide into.
 */
export function initRibbonMasterGuide(container) {
  container.innerHTML = `
    <div class="anim-fade-in text-left max-w-4xl mx-auto px-4 py-8">
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-5xl font-extrabold tracking-tight text-black dark:text-white text-shadow-lg">Ribbon Master Guide</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 font-medium">The ultimate challenge for the most dedicated trainers.</p>
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
              <p class="text-sm text-indigo-900/70 dark:text-indigo-300">Thousands of trainers share their journeys on <span class="font-bold">r/pokemonribbons</span>, documenting decades-long adventures across every console.</p>
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
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">Most Ribbon Masters begin in <span class="font-bold text-gray-600 dark:text-gray-400">Generation 3</span> (GameCube or GBA) to maximize the number of ribbons. The "Truest" Ribbon Masters often start as <span class="font-bold text-indigo-500">Shadow Pokémon</span> from Colosseum or XD: Gale of Darkness.</p>
            
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
              <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Generation 3 & 4: The Contest Era</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">The most time-consuming phase. You must win 20 contests in Hoenn and 20 super contests in Sinnoh. These eventually merge into the prestigious <span class="font-bold text-indigo-500 italic">Contest Memory Ribbon</span> in Gen 6.</p>
            </div>

            <div class="relative pl-8 border-l-2 border-emerald-100 dark:border-emerald-900">
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800"></div>
              <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Generation 4 & 5: The Tower Barrier</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Gen 4 features 5 brutal Battle Tower ribbons. Gen 5 is unique—it has <span class="font-bold">no ribbons</span>, serving only as a bridge for your Pokémon to reach the 3DS era via Poké Transporter.</p>
            </div>

            <div class="relative pl-8 border-l-2 border-emerald-100 dark:border-emerald-900">
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800"></div>
              <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Generation 6 - 9: The Modern Age</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Focus shifts to the Battle Maison, Battle Tree, and eventually the Ranked Battle Master Ball Ribbon in Sword/Shield and Scarlet/Violet. Don't forget the weekly ribbons from certain NPCs!</p>
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
              <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">Some ribbons (like the Footprint Ribbon) change their acquisition method based on level or friendship.</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span class="text-xs font-black text-indigo-500 uppercase">Tip 03</span>
              <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">Level check! The earlier Tower Ribbons do not adjust your Pokemon's level to 50, meaning you could get locked out of getting some ribbons.</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span class="text-xs font-black text-indigo-500 uppercase">Tip 04</span>
              <p class="text-sm mt-1 text-gray-700 dark:text-gray-300">The Master Rank Ribbon can be obtained in Sword and Shield, even if the servers aren't as active. The community has Galar Fight Nights to help you get it!</p>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="bg-indigo-600 p-10 rounded-3xl shadow-2xl text-center transform transition hover:scale-[1.01] flex flex-col items-center">
          <h2 class="text-3xl font-extrabold text-white mb-4">Start Your Journey</h2>
          <p class="text-lg text-indigo-100 mb-8 font-medium">Use our Ribbon Tracker to manage multiple candidates and ensure no ribbon is left behind!</p>
          <button id="guide-cta-btn" class="!px-8 !py-3 !text-lg !font-bold !rounded-full bg-white text-indigo-600 hover:bg-gray-100 transition-all shadow-xl active:scale-95 border-none cursor-pointer">
            Go to Tracker
          </button>
        </section>
      </div>
    </div>
    `;

  document.getElementById('guide-cta-btn').onclick = () => {
    window.location.hash = '#/ribbon-tracker';
  };
}
