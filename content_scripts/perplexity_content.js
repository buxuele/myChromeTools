// 隐藏 Perplexity 不必要的浮动元素

(function () {
  "use strict";

  const STYLE_ID = "aitools-perplexity-hide-float";
  const HIDE_CSS = `
    div.absolute.z-\\[5\\] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;

  async function apply() {
    const config = await AIToolsUtils.getSettings();
    const shouldApply =
      !(config && config.enabled === false) &&
      !(config && config.features?.hideFloat?.enabled === false);

    if (shouldApply) {
      AIToolsUtils.applyStyle(STYLE_ID, HIDE_CSS);
    } else {
      AIToolsUtils.removeStyle(STYLE_ID);
    }
  }

  AIToolsUtils.onSettingsChanged(apply);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
