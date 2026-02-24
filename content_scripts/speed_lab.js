(function () {
  "use strict";

  async function getConfig() {
    if (typeof AIToolsUtils !== 'undefined') {
      return await AIToolsUtils.getSettings();
    }
    return null;
  }

  function autoCheckPrivacyConsent() {
    const checkbox = document.querySelector(
      '#privacyConsent[type="checkbox"][name="privacyConsent"]'
    );

    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;

      const changeEvent = new Event("change", { bubbles: true });
      checkbox.dispatchEvent(changeEvent);

      const clickEvent = new Event("click", { bubbles: true });
      checkbox.dispatchEvent(clickEvent);

      return true;
    } else if (checkbox && checkbox.checked) {
      return true;
    }
    return false;
  }

  function autoClickStartButton() {
    const startButton = document.querySelector("#startButton");
    if (startButton && !startButton.classList.contains("disabled")) {
      startButton.click();
      return true;
    }
    return false;
  }

  function findCheckboxWithFallback() {
    let checkbox = document.querySelector("#privacyConsent");
    if (checkbox && checkbox.type === "checkbox") {
      return checkbox;
    }

    checkbox = document.querySelector(
      'input[name="privacyConsent"][type="checkbox"]'
    );
    if (checkbox) {
      return checkbox;
    }

    checkbox = document.querySelector(
      'input[ng-model="privacyConsent"][type="checkbox"]'
    );
    if (checkbox) {
      return checkbox;
    }

    const labels = document.querySelectorAll("label");
    for (const label of labels) {
      const text = label.textContent || "";
      if (
        text.includes("data policy") ||
        text.includes("privacy") ||
        text.includes("IP addresses")
      ) {
        const forAttr = label.getAttribute("for");
        if (forAttr) {
          checkbox = document.querySelector(`#${forAttr}`);
          if (checkbox && checkbox.type === "checkbox") {
            return checkbox;
          }
        }

        checkbox = label.querySelector('input[type="checkbox"]');
        if (checkbox) {
          return checkbox;
        }
      }
    }

    return null;
  }

  function autoCheckWithFallback() {
    const checkbox = findCheckboxWithFallback();

    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;

      const events = ["change", "click", "input"];
      events.forEach((eventType) => {
        const event = new Event(eventType, { bubbles: true });
        checkbox.dispatchEvent(event);
      });

      if (window.angular) {
        const scope = window.angular.element(checkbox).scope();
        if (scope) {
          scope.$apply(() => {
            scope.privacyConsent = true;
          });
        }
      }

      return true;
    } else if (checkbox && checkbox.checked) {
      return true;
    }

    return false;
  }

  async function init() {
    const config = await getConfig();
    
    if (config && config.enabled === false) return;

    let success = autoCheckPrivacyConsent();

    if (!success) {
      success = autoCheckWithFallback();
    }

    if (success) {
      setTimeout(autoClickStartButton, 500);
    } else {
      const observer = new MutationObserver((mutations, obs) => {
        let shouldTry = false;

        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (
                  node.querySelector &&
                  (node.querySelector("#privacyConsent") ||
                    node.querySelector('input[type="checkbox"]') ||
                    node.querySelector('input[name="privacyConsent"]'))
                ) {
                  shouldTry = true;
                  break;
                }

                if (
                  node.id === "privacyConsent" ||
                  (node.type === "checkbox" && node.name === "privacyConsent")
                ) {
                  shouldTry = true;
                  break;
                }
              }
            }
          }
        }

        if (shouldTry) {
          setTimeout(() => {
            const success =
              autoCheckPrivacyConsent() || autoCheckWithFallback();
            if (success) {
              setTimeout(autoClickStartButton, 500);
              obs.disconnect();
            }
          }, 100);
        }
      });

      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
      }, 10000);
    }
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
      const success = autoCheckPrivacyConsent() || autoCheckWithFallback();
      if (success) {
        setTimeout(autoClickStartButton, 500);
      }
    }, 1000);
  });
})();
