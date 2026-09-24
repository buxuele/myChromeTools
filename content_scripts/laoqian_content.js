// 为 lao-qian.hxwk.org 应用暗色阅读背景

(function () {
  "use strict";

  const TARGET_SELECTOR = '#content[role="main"]';

  async function apply() {
    const config = await AIToolsUtils.getSettings();
    const shouldApply =
      !(config && config.enabled === false) &&
      !(config && config.features?.darkBackground?.enabled === false);

    const el = document.querySelector(TARGET_SELECTOR);
    if (!el) {
      console.warn("[aiTools] 没找到 " + TARGET_SELECTOR);
      return;
    }

    el.style.backgroundColor = shouldApply ? "#91b3b5" : "";
  }

  AIToolsUtils.onSettingsChanged(apply);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }

  window.addEventListener("load", () => {
    setTimeout(apply, 100);
  });
})();
