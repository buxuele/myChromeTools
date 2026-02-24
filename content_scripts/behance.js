(function () {
  "use strict";

  async function getConfig() {
    if (typeof AIToolsUtils !== 'undefined') {
      return await AIToolsUtils.getSettings();
    }
    return null;
  }

  const selectorToFix = '.PrimaryNav-root-GKW';
  const selectorsToUnfix = [
    '.PrimaryNav-strip-Xyi',
    '.Explore-carouselContainer-ZMu',
    '.ExploreCategoryCarousel-container-rDE',
    '.Explore-headerContainer-fm3'
  ];

  const modifiedFixed = new Set();
  const modifiedUnfixed = new Set();

  function modifyElementPosition(selector, position, modifiedSet) {
    if (modifiedSet.has(selector)) {
      return true;
    }

    const element = document.querySelector(selector);
    if (element) {
      element.style.position = position;
      modifiedSet.add(selector);
      return true;
    }
    return false;
  }

  function applyAllChanges() {
    modifyElementPosition(selectorToFix, 'fixed', modifiedFixed);
    selectorsToUnfix.forEach(selector => {
      modifyElementPosition(selector, 'relative', modifiedUnfixed);
    });
    return modifiedFixed.has(selectorToFix) && modifiedUnfixed.size === selectorsToUnfix.length;
  }

  async function init() {
    const config = await getConfig();
    
    if (config && config.enabled === false) return;
    if (config && config.features?.enhancement?.enabled === false) return;

    applyAllChanges();

    const observer = new MutationObserver(() => {
      if (applyAllChanges()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      if (applyAllChanges()) {
        observer.disconnect();
      }
    }, 2000);

    setTimeout(() => {
      observer.disconnect();
    }, 10000);
  }

  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === "SETTINGS_UPDATED") {
        location.reload();
      }
    });
  }

  init();
})();
