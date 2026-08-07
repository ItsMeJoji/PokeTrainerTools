export function initOtherCreatorsTools(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="anim-fade-in text-left max-w-4xl mx-auto">
      <h1 class="mb-8 font-extrabold tracking-tight text-black dark:text-white text-center md:text-center">Other Creator's Tools</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-10 text-center md:text-center text-lg">
        Here's a list of amazing tools and resources created by other members of the Pokémon community that I use often!
      </p>

      <div class="space-y-8">
        <!--Professor Rex's FRLG Safari Tool -->
        <span class="block bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow flex flex-col md:flex-row">
          <a href="https://professorrex.github.io/FRLG_Safari/" target="_blank" rel="noopener noreferrer" class="md:w-1/3 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity">
             <!-- Placeholder for tool preview -->
             <div class="text-center">
               <i class="fas fa-gamepad text-4xl text-gray-400 dark:text-gray-600 mb-2"></i>
               <span class="block text-sm font-bold text-gray-500">Professor Rex's FRLG Safari Tool</span>
             </div>
          </a>
          <div class="p-6 md:w-2/3 flex flex-col justify-center">
            <h2 class="text-2xl font-bold text-black dark:text-white mb-3">Professor Rex's FRLG Safari Tool</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Sometimes, you find a Shiny Chansey, and don't want to say "F*ck it, we ball!" This tool made by Professor Rex helps you catch the Safari Zone Pokemon you find in FRLG. EXTREMELY helpful during Safari Week!
            </p>
            <a href="https://professorrex.github.io/FRLG_Safari/" target="_blank" rel="noopener noreferrer" class="brand-link inline-flex items-center gap-2 font-bold hover:underline self-start">
              Visit Professor Rex's FRLG Safari Tool <i class="fas fa-external-link-alt text-sm"></i>
            </a>
          </div>
        </span>

      </div>
    </div>
  `;
}
