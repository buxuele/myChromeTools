// Speed Test 自动勾选隐私同意并开始测速

(function () {
  "use strict";

  function autoCheckPrivacyConsent() {
    const checkbox = document.querySelector(
      '#privacyConsent[type="checkbox"][name="privacyConsent"]'
    );

    if (checkbox && !checkbox.checked) {
      setTimeout(() => {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        checkbox.dispatchEvent(new Event("click", { bubbles: true }));
      }, 200);
      return true;
    }
    return !!checkbox;
  }

  function autoClickStartButton() {
    const startButton = document.querySelector("#startButton");
    if (startButton && !startButton.classList.contains("disabled")) {
      setTimeout(() => {
        startButton.click();
      }, 200);
      return true;
    }
    return false;
  }

  function findCheckboxWithFallback() {
    let checkbox = document.querySelector("#privacyConsent");
    if (checkbox && checkbox.type === "checkbox") return checkbox;

    checkbox = document.querySelector('input[name="privacyConsent"][type="checkbox"]');
    if (checkbox) return checkbox;

    checkbox = document.querySelector('input[ng-model="privacyConsent"][type="checkbox"]');
    if (checkbox) return checkbox;

    const labels = document.querySelectorAll("label");
    for (const label of labels) {
      const text = label.textContent || "";
      if (text.includes("data policy") || text.includes("privacy") || text.includes("IP addresses")) {
        const forAttr = label.getAttribute("for");
        if (forAttr) {
          checkbox = document.querySelector(`#${forAttr}`);
          if (checkbox && checkbox.type === "checkbox") return checkbox;
        }
        checkbox = label.querySelector('input[type="checkbox"]');
        if (checkbox) return checkbox;
      }
    }

    return null;
  }

  function autoCheckWithFallback() {
    const checkbox = findCheckboxWithFallback();

    if (checkbox && !checkbox.checked) {
      setTimeout(() => {
        checkbox.checked = true;

        ["change", "click", "input"].forEach((eventType) => {
          checkbox.dispatchEvent(new Event(eventType, { bubbles: true }));
        });

        if (window.angular) {
          const scope = window.angular.element(checkbox).scope();
          if (scope) {
            scope.$apply(() => {
              scope.privacyConsent = true;
            });
          }
        }
      }, 200);
      return true;
    }
    return !!checkbox;
  }

  let enabled = false;
  let observer = null;

  function stopObserve() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function runAutomation() {
    let success = autoCheckPrivacyConsent() || autoCheckWithFallback();

    if (success) {
      setTimeout(autoClickStartButton, 700);
      return;
    }

    if (observer) return;

    observer = new MutationObserver((mutations) => {
      const shouldTry = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.id === "privacyConsent" ||
              (node.type === "checkbox" && node.name === "privacyConsent") ||
              (node.querySelector &&
                (node.querySelector("#privacyConsent") ||
                  node.querySelector('input[type="checkbox"]') ||
                  node.querySelector('input[name="privacyConsent"]'))))
        )
      );

      if (!shouldTry) return;

      setTimeout(() => {
        success = autoCheckPrivacyConsent() || autoCheckWithFallback();
        if (success) {
          setTimeout(autoClickStartButton, 700);
          stopObserve();
        }
      }, 300);
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });

    setTimeout(stopObserve, 10000);
  }

  async function apply() {
    const config = await AIToolsUtils.getSettings();
    const shouldApply =
      !(config && config.enabled === false) &&
      !(config && config.features?.autoStart?.enabled === false);

    if (shouldApply && !enabled) {
      enabled = true;
      runAutomation();
    } else if (!shouldApply) {
      enabled = false;
      stopObserve();
    }
  }

  AIToolsUtils.onSettingsChanged(apply);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }

  window.addEventListener("load", () => {
    if (!enabled) return;
    setTimeout(() => {
      if (autoCheckPrivacyConsent() || autoCheckWithFallback()) {
        setTimeout(autoClickStartButton, 700);
      }
    }, 1500);
  });
})();
