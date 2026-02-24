(function () {
  "use strict";

  async function getConfig() {
    if (typeof AIToolsUtils !== 'undefined') {
      return await AIToolsUtils.getSettings();
    }
    return null;
  }

  function hideAihuaci() {
    const style = document.createElement('style');
    style.id = 'guwendao-hide-aihuaci';
    style.textContent = '.aihuacitollbar { display: none !important; }';
    document.head.appendChild(style);
  }

  async function init() {
    const config = await getConfig();
    
    if (config && config.enabled === false) return;
    if (config && config.features?.enhancement?.enabled === false) return;

    hideAihuaci();
  }

  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === "SETTINGS_UPDATED") {
        location.reload();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
