(function () {
  "use strict";

  async function getConfig() {
    if (typeof AIToolsUtils !== 'undefined') {
      return await AIToolsUtils.getSettings();
    }
    return null;
  }

  function addHideButtonStyles() {
    const style = document.createElement("style");
    style.id = "perplexity-hide-floating-buttons";
    style.textContent = `
      div.absolute.z-\\[5\\] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;

    if (document.head) {
      document.head.appendChild(style);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.head.appendChild(style);
      });
    }
  }

  function hideExistingButtons() {
    const buttons = document.querySelectorAll("div.absolute.z-\\[5\\]");

    buttons.forEach((button) => {
      button.style.display = "none";
      button.style.visibility = "hidden";
      button.style.opacity = "0";
      button.style.pointerEvents = "none";
    });
  }

  function observeAndHideButtons() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (
              node.classList &&
              node.classList.contains("absolute") &&
              node.classList.contains("z-[5]")
            ) {
              node.style.display = "none";
              node.style.visibility = "hidden";
              node.style.opacity = "0";
              node.style.pointerEvents = "none";
            }

            const buttons =
              node.querySelectorAll &&
              node.querySelectorAll("div.absolute.z-\\[5\\]");

            if (buttons && buttons.length > 0) {
              buttons.forEach((button) => {
                button.style.display = "none";
                button.style.visibility = "hidden";
                button.style.opacity = "0";
                button.style.pointerEvents = "none";
              });
            }
          }
        });
      });
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
    }, 10000);
  }

  async function init() {
    const config = await getConfig();
    
    if (config && config.enabled === false) return;
    if (config && config.features?.hideFloat?.enabled === false) return;

    addHideButtonStyles();
    hideExistingButtons();
    observeAndHideButtons();
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

  window.addEventListener("load", () => {
    setTimeout(() => {
      hideExistingButtons();
    }, 1000);
  });
})();
