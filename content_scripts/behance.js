// Behance 导航与轮播定位修复

(function () {
  "use strict";

  const TARGETS = [
    { selector: ".PrimaryNav-root-GKW", position: "fixed" },
    { selector: ".PrimaryNav-strip-Xyi", position: "relative" },
    { selector: ".Explore-carouselContainer-ZMu", position: "relative" },
    { selector: ".ExploreCategoryCarousel-container-rDE", position: "relative" },
    { selector: ".Explore-headerContainer-fm3", position: "relative" }
  ];

  // 记录原始内联定位，关闭时原样恢复
  const originalPositions = new Map();
  let observer = null;

  function applyTargets() {
    let applied = 0;

    TARGETS.forEach(({ selector, position }) => {
      const element = document.querySelector(selector);
      if (!element) return;

      if (!originalPositions.has(selector)) {
        originalPositions.set(selector, element.style.position);
      }
      element.style.position = position;
      applied++;
    });

    return applied === TARGETS.length;
  }

  function revertTargets() {
    originalPositions.forEach((original, selector) => {
      const element = document.querySelector(selector);
      if (element) element.style.position = original;
    });
    originalPositions.clear();

    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function startObserve() {
    if (observer) return;

    observer = new MutationObserver(() => {
      if (applyTargets() && observer) {
        observer.disconnect();
        observer = null;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      if (observer) {
        applyTargets();
        observer.disconnect();
        observer = null;
      }
    }, 10000);
  }

  async function apply() {
    const config = await AIToolsUtils.getSettings();
    const shouldApply =
      !(config && config.enabled === false) &&
      !(config && config.features?.enhancement?.enabled === false);

    if (shouldApply) {
      applyTargets();
      startObserve();
    } else {
      revertTargets();
    }
  }

  AIToolsUtils.onSettingsChanged(apply);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
