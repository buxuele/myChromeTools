// 古文岛网站增强

(function () {
  "use strict";

  const STYLE_ID = "aitools-guwendao-hide-toolbar";
  const HIDE_CSS = ".aihuacitollbar { display: none !important; }";

  async function apply() {
    const config = await AIToolsUtils.getSettings();
    const shouldApply =
      !(config && config.enabled === false) &&
      !(config && config.features?.enhancement?.enabled === false);

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
