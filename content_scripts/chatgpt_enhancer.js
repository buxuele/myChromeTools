(function () {
  "use strict";

  const BAR_ID = "aitools-quick-prompts";
  const INPUT_STYLE_ID = "aitools-chatgpt-input-height";
  const INPUT_HEIGHT_CSS = `
    #prompt-textarea,
    div.ProseMirror[contenteditable="true"] {
      height: 100px !important;
      min-height: 100px !important;
      max-height: 100px !important;
    }
  `;

  const state = {
    barOn: false,
    heightOn: false,
    prompts: []
  };

  function findInputContainer() {
    return (
      document.querySelector('form[class*="stretch"]') ||
      document.querySelector("form") ||
      (document.querySelector("#prompt-textarea")
        ? document.querySelector("#prompt-textarea").closest("div")
        : null)
    );
  }

  function insertContent(content) {
    const proseMirror = document.querySelector('div.ProseMirror[contenteditable="true"]');
    const textarea = document.querySelector("#prompt-textarea");
    const target = proseMirror || textarea;

    if (target) {
      AIToolsUtils.insertPromptToInput(target, content);
    }
  }

  function signature() {
    return JSON.stringify(state.prompts.map((p) => [p.id, p.label]));
  }

  function renderBar() {
    const existing = document.getElementById(BAR_ID);

    if (!state.barOn) {
      if (existing) existing.remove();
      return;
    }

    if (existing && existing.dataset.signature === signature()) return;
    if (existing) existing.remove();

    const container = findInputContainer();
    if (!container || !container.parentNode) return;

    const bar = AIToolsUtils.createPromptBar(BAR_ID, state.prompts, insertContent);
    bar.dataset.signature = signature();
    container.parentNode.insertBefore(bar, container);
  }

  function scheduleRender(attempt) {
    renderBar();
    if (state.barOn && !document.getElementById(BAR_ID) && attempt < 6) {
      setTimeout(() => scheduleRender(attempt + 1), 1000);
    }
  }

  async function apply() {
    const config = await AIToolsUtils.getSettings();
    const siteOff = !!(config && config.enabled === false);

    state.heightOn = !siteOff && !(config && config.features?.adjustInput?.enabled === false);
    state.barOn =
      !siteOff &&
      !(config && config.features?.quickPrompts?.enabled === false) &&
      (await readState()).showPromptButtons;
    state.prompts = await AIToolsUtils.getPrompts();

    if (state.heightOn) {
      AIToolsUtils.applyStyle(INPUT_STYLE_ID, INPUT_HEIGHT_CSS);
    } else {
      AIToolsUtils.removeStyle(INPUT_STYLE_ID);
    }

    scheduleRender(0);
  }

  AIToolsUtils.onSettingsChanged(apply);

  // 页面重绘会移除按钮栏，去抖后补回
  let renderTimer = null;
  const observer = new MutationObserver(() => {
    if (!state.barOn) return;
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderBar, 500);
  });

  function start() {
    apply();
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.addEventListener("load", () => {
    if (state.barOn) scheduleRender(0);
  });
})();
