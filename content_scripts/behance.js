(function () {
    "use strict";

    // Selector for the element that should remain fixed at the top
    const selectorToFix = '.PrimaryNav-root-GKW';

    // Selectors for elements that should scroll with the page
    const selectorsToUnfix = [
        '.PrimaryNav-strip-Xyi',
        '.Explore-carouselContainer-ZMu',
        '.ExploreCategoryCarousel-container-rDE',
        '.Explore-headerContainer-fm3'
    ];

    // Sets to keep track of elements that have already been modified
    const modifiedFixed = new Set();
    const modifiedUnfixed = new Set();

    /**
     * Finds an element by its selector and changes its position.
     * @param {string} selector - The CSS selector for the element.
     * @param {string} position - The desired CSS position value ('fixed' or 'relative').
     * @param {Set} modifiedSet - The Set to track which selectors have been processed.
     * @returns {boolean} - True if the element was found and modified, false otherwise.
     */
    function modifyElementPosition(selector, position, modifiedSet) {
        if (modifiedSet.has(selector)) {
            return true;
        }

        const element = document.querySelector(selector);
        if (element) {
            element.style.position = position;
            console.log(`[aiTools] Set position to '${position}' for selector:`, selector);
            modifiedSet.add(selector);
            return true;
        }
        return false;
    }

    /**
     * Iterates through all selectors and tries to modify them.
     * @returns {boolean} - True if all elements have been found and modified.
     */
    function applyAllChanges() {
        // Handle the element to be fixed
        modifyElementPosition(selectorToFix, 'fixed', modifiedFixed);

        // Handle the elements to be unfixed
        selectorsToUnfix.forEach(selector => {
            modifyElementPosition(selector, 'relative', modifiedUnfixed);
        });

        // Check if all tasks are complete
        const allDone = modifiedFixed.has(selectorToFix) && modifiedUnfixed.size === selectorsToUnfix.length;
        return allDone;
    }

    // --- Execution Starts Here ---

    // 1. Try to modify the elements immediately on script load.
    applyAllChanges();

    // 2. Set up a MutationObserver to handle dynamically loaded elements.
    const observer = new MutationObserver(() => {
        if (applyAllChanges()) {
            // Once all elements are found and modified, stop observing to save resources.
            observer.disconnect();
            console.log('[aiTools] All Behance elements have been processed. Observer stopped.');
        }
    });

    // Start observing the entire document for changes.
    observer.observe(document.body, {
        childList: true, // Watch for added/removed nodes.
        subtree: true    // Watch all descendant nodes as well.
    });

    // 3. As a fallback, run the check again after a couple of seconds.
    setTimeout(() => {
        if (applyAllChanges()) {
            observer.disconnect();
        }
    }, 2000);

    // 4. Stop the observer after 10 seconds to prevent potential performance issues.
    setTimeout(() => {
        observer.disconnect();
        console.log('[aiTools] Observer timed out after 10 seconds.');
    }, 10000);

})();