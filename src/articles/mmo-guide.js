/**
 * Initializes the MMO Permutations Guide page.
 * @param {HTMLElement} container - The container to render the guide into.
 */
export function initMmoGuide(container) {
  container.innerHTML = `
    <div class="anim-fade-in text-left max-w-4xl mx-auto px-4 py-8">
      <h1 class="mb-8 text-5xl font-extrabold tracking-tight text-black dark:text-white text-shadow-lg text-center">Massive Mass Outbreak Guide</h1>
      
      <div class="space-y-12">
        <!-- Section: Introduction -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 brand-marker-red rounded-full"></span>
            What are Massive Mass Outbreaks?
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-lg mb-4">
            Introduced in the <span class="font-bold text-gray-800 dark:text-gray-200">Daybreak Update</span> for Pokemon Legends: Arceus, Massive Mass Outbreaks (MMO) is when multiple outbreaks appear simultaneously across a map, usually with a storm occurring.
          </p>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
            Unlike standard Mass Outbreaks, MMOs can have a "Second Outbreak" chance where clearing out the first Outbreak (by either catching, KOing, or scaring the Pokemon) can trigger a second Outbreak of either Evolved or Alpha Pokemon. Outbreaks are more likely to spawn when indicated with a Sparkle on the Outbreak Icon on the map.
          </p>
        </section>

        <!-- Section: How Permutations Work -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 brand-marker-yellow rounded-full"></span>
            How the Permutations Work
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            The game determines the spawns for an Outbreak based on how you clear the Pokemon. By changing the sequence of catches and KOs, you can create different results for the next spawns in a Outbreak. Plus this works on the Second Outbreak as well!
          </p>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="brand-panel-yellow p-6">
              <h3 class="text-xl font-bold brand-text-yellow mb-2">Individual Catches (C1, C2, C3, C4)</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Catching Pokemon one-by-one advances the "reserve" queue linearly. This is the most common way to progress an outbreak.</p>
            </div>
            <div class="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800">
              <h3 class="text-xl font-bold text-red-900 dark:text-red-200 mb-2">Multi-Battles (KO2, KO3, KO4)</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Engaging multiple Pokemon at once advances RNG differently. A 4-way battle can produce a very different Wave 2 than four single battles.</p>
            </div>
          </div>
        </section>

        <!-- Section: The Strategy -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 brand-marker-red rounded-full"></span>
            The "Shiny Hunt" Strategy
          </h2>
          <ol class="space-y-4">
            <li class="flex gap-4">
              <span class="flex-shrink-0 w-8 h-8 brand-step-badge rounded-full flex items-center justify-center font-bold">1</span>
              <p class="text-gray-600 dark:text-gray-400"><span class="font-bold text-gray-800 dark:text-gray-200">Save at the Jubilife Gate</span>: This is your "backup" save in case the MMO despawns or you want to hunt a different one.</p>
            </li>
            <li class="flex gap-4">
              <span class="flex-shrink-0 w-8 h-8 brand-step-badge rounded-full flex items-center justify-center font-bold">2</span>
              <p class="text-gray-600 dark:text-gray-400"><span class="font-bold text-gray-800 dark:text-gray-200">Save at the MMO</span>: Once you find an outbreak you want to permutate, fly to it and <span class="font-bold border-b border-[#facc15]">save your game</span> right there. You don't need to go back to Jubilife after every reset!</p>
            </li>
            <li class="flex gap-4">
              <span class="flex-shrink-0 w-8 h-8 brand-step-badge rounded-full flex items-center justify-center font-bold">3</span>
              <p class="text-gray-600 dark:text-gray-400"><span class="font-bold text-gray-800 dark:text-gray-200">Do a Permutation</span>: Follow the first Permutation from our Permutations tool. If no shiny appears in Outbreak 1 (or Outbreak 2), <span class="font-bold border-b border-red-500">reset your game</span> to your on-site save.</p>
            </li>
            <li class="flex gap-4">
              <span class="flex-shrink-0 w-8 h-8 brand-step-badge rounded-full flex items-center justify-center font-bold">4</span>
              <p class="text-gray-600 dark:text-gray-400"><span class="font-bold text-gray-800 dark:text-gray-200">Move to the Next</span>: Mark that Permutation as <span class="font-bold text-green-600">Completed</span> and try the next one in the list.</p>
            </li>
          </ol>
        </section>

        <!-- Section: Outbreak 1 vs Outbreak 2 -->
        <section class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h2 class="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
            <span class="w-1.5 h-8 brand-marker-yellow rounded-full"></span>
            Wave 1 vs Wave 2
          </h2>
          <div class="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              <span class="font-bold">Outbreak 1</span> typically has 8 to 10 spawns. This is your initial Outbreak, if this ones has a chance of spawning a second. If you're looking for a Shiny Pokemon, this is usually where you want to do the most Permuations.
            </p>
            <p>
              <span class="font-bold">Outbreak 2</span> typically has 6 or 7 spawns. This Outbreak is a "bonus" Outbreak triggered by clearing Outbreal 1, but not always guaranteed. It is more likely to occur if the Outbreak Icon has a Sparkle on it.
            </p>
          </div>
        </section>


        <!-- MMO Tracker CTA Section -->
        <section class="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center transform transition hover:scale-[1.01] flex flex-col items-center">
          <h2 class="text-3xl font-extrabold text-black dark:text-white mb-4">Ready to track paths?</h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 font-medium">Use the MMO Permutations tool to check paths efficiently and avoid duplicates.</p>
          <button id="mmo-tool-cta-btn" class="tool-cta border-none cursor-pointer text-white px-8 py-3 rounded-full font-bold shadow-md" style="background-color: #ef4444; align-self: center">
            MMO Permutations Tool
          </button>
        </section>
      </div>
    </div>
  `;

  document.getElementById('mmo-tool-cta-btn').addEventListener('click', () => {
    window.location.pathname = '/mmo-permutations';
  });
}

