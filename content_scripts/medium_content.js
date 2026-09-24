// 隐藏 Medium 文本选择菜单

(function () {
  "use strict";

  const STYLE_ID = "aitools-medium-hide-menu";
  const HIDE_CSS = `
    div[class*="eo o ady ff adz aea aeb"],
    div[data-popper-reference-hidden],
    div[data-popper-escaped],
    div[data-popper-placement],
    div[tabindex="-1"] > div[style*="position: absolute"] {
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
