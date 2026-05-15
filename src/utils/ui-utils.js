/**
 * Sets up a searchable dropdown.
 * @param {HTMLElement|string} dropdown - The dropdown container element or its ID.
 * @param {Array} items - Array of items to display [{name, displayName, sprite, ...}].
 * @param {Function} onSelect - Callback when an item is selected.
 * @param {string} placeholder - Initial placeholder text.
 */
export function setupSearchableDropdown(dropdown, items, onSelect, placeholder = "Select Pokemon") {
    const container = typeof dropdown === 'string' ? document.getElementById(dropdown) : dropdown;
    if (!container) return;

    const selectedDisplay = container.querySelector('.selected-item');
    const listContainer = container.querySelector('.dropdown-list');
    const itemsList = container.querySelector('.items-list');
    const searchInput = container.querySelector('.search-input');
    const selectedSpan = selectedDisplay.querySelector('span');

    const updateList = (filter = "") => {
        const filtered = items.filter(item =>
            (item.displayName || item.name || "").toLowerCase().includes(filter.toLowerCase())
        );

        itemsList.innerHTML = filtered.map(item => {
            const value = item.name || item.id || "";
            const displayName = item.displayName || item.name || "";
            const spriteHtml = item.sprite ? `<img src="${item.sprite}" class="w-6 h-6 mr-2 object-contain flex-shrink-0">` : '';

            return `
        <div data-value="${value}" class="dropdown-item px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer flex items-center text-sm text-gray-900 dark:text-white">
          ${spriteHtml}
          <span class="truncate">${displayName}</span>
        </div>
      `;
        }).join('') || '<div class="px-4 py-2 text-sm text-gray-500 italic text-center">No items found</div>';
    };

    selectedDisplay.onclick = (e) => {
        e.stopPropagation();
        const isHidden = listContainer.classList.contains('hidden');
        // Close other dropdowns
        document.querySelectorAll('.dropdown-list').forEach(l => {
            if (l !== listContainer) l.classList.add('hidden');
        });

        if (isHidden) {
            listContainer.classList.remove('hidden');
            if (searchInput) {
                searchInput.focus();
                updateList(searchInput.value);
            }
        } else {
            listContainer.classList.add('hidden');
        }
    };

    if (searchInput) {
        searchInput.onclick = (e) => e.stopPropagation();
        searchInput.oninput = (e) => updateList(e.target.value);
    }

    itemsList.onclick = (e) => {
        const itemEl = e.target.closest('.dropdown-item');
        if (!itemEl) return;

        const value = itemEl.dataset.value;
        const item = items.find(i => (i.name || i.id || "") === value);
        if (!item) return;

        const displayName = item.displayName || item.name || "";
        const spriteHtml = item.sprite ? `<img src="${item.sprite}" class="w-5 h-5 mr-2 flex-shrink-0">` : '';

        selectedSpan.className = "selected-text flex items-center overflow-hidden text-gray-900 dark:text-white";
        selectedSpan.innerHTML = `${spriteHtml}${displayName}`;

        listContainer.classList.add('hidden');
        if (onSelect) onSelect(item);
    };

    // Close on outside click
    const outsideClick = (e) => {
        if (!container.contains(e.target)) {
            listContainer.classList.add('hidden');
        }
    };
    document.addEventListener('click', outsideClick);

    // Set initial state
    if (placeholder) {
        selectedSpan.className = "placeholder text-gray-400";
        selectedSpan.textContent = placeholder;
    }
    updateList();

    // Return an object to allow manual updates if needed
    return {
        updateItems: (newItems) => {
            items = newItems;
            updateList(searchInput ? searchInput.value : "");
        },
        setSelected: (item) => {
            if (!item) {
                selectedSpan.className = "placeholder text-gray-400";
                selectedSpan.textContent = placeholder;
                return;
            }
            const displayName = item.displayName || item.name || "";
            const spriteHtml = item.sprite ? `<img src="${item.sprite}" class="w-5 h-5 mr-2 flex-shrink-0">` : '';
            selectedSpan.className = "selected-text flex items-center overflow-hidden text-gray-900 dark:text-white";
            selectedSpan.innerHTML = `${spriteHtml}${displayName}`;
        }
    };
}

/**
 * Updates a dropdown to show a loading state with animated dots.
 * @param {HTMLElement|string} dropdown - The dropdown container.
 * @param {string} message - Base message (e.g., "Loading Games").
 */
export function updateDropdownLoading(dropdown, message) {
    const container = typeof dropdown === 'string' ? document.getElementById(dropdown) : dropdown;
    if (!container) return;

    const selectedSpan = container.querySelector('.selected-item span');
    if (selectedSpan) {
        selectedSpan.className = "placeholder text-gray-400 flex items-center";
        selectedSpan.innerHTML = `${message}<span class="anim-loading-dots"></span>`;
    }
}

/**
 * Updates a dropdown to show an error state.
 * @param {HTMLElement|string} dropdown - The dropdown container.
 * @param {string} message - Error message.
 */
export function updateDropdownError(dropdown, message) {
    const container = typeof dropdown === 'string' ? document.getElementById(dropdown) : dropdown;
    if (!container) return;

    const selectedSpan = container.querySelector('.selected-item span');
    if (selectedSpan) {
        selectedSpan.className = "text-red-500 text-sm italic py-1";
        selectedSpan.textContent = message;
    }
}

/**
 * Helper to generate the HTML for a searchable dropdown.
 * @param {string} id - The ID for the dropdown container.
 * @param {string} label - Label for the dropdown.
 * @param {string} searchPlaceholder - Placeholder for the search input.
 * @returns {string} HTML string.
 */
export function getSearchableDropdownHtml(id, label, searchPlaceholder = "Search...") {
    return `
    <div class="text-left">
      ${label ? `<label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">${label}</label>` : ''}
      <div id="${id}" class="searchable-dropdown relative">
        <div class="selected-item bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer flex items-center justify-between">
          <span class="placeholder text-gray-400">Select Item</span>
          <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        <div class="dropdown-list hidden absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <div class="p-2 border-b border-gray-100 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-700 z-10">
            <input type="text" class="search-input w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-md focus:ring-0 text-gray-900 dark:text-white" placeholder="${searchPlaceholder}">
          </div>
          <div class="items-list py-1"></div>
        </div>
      </div>
    </div>
  `;
}
