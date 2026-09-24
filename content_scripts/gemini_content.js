(function () {
  "use strict";

  if (!window.location.hostname.includes("gemini.google.com")) return;

  const BAR_ID = "aitools-quick-prompts-gemini";

  const state = {
    barOn: false,
    prompts: []
  };

  function findEditable() {
    return document.querySelector('rich-textarea div.ql-editor[contenteditable="true"]');
  }

  function insertContent(content) {
    const editable = findEditable();
    if (editable) {
      AIToolsUtils.insertPromptToInput(editable, content);
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

    if (state.prompts.length === 0) return;
    if (existing && existing.dataset.signature === signature()) return;
    if (existing) existing.remove();

    const richTextarea = document.querySelector("rich-textarea");
    if (!richTextarea) return;

    const target =
      document.querySelector("input-area-v2") ||
      document.querySelector(".input-area") ||
      document.querySelector(".text-input-field") ||
      richTextarea;
    if (!target.parentNode) return;

    const bar = AIToolsUtils.createPromptBar(BAR_ID, state.prompts, insertContent);
    bar.dataset.signature = signature();
    target.parentNode.insertBefore(bar, target);
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

    state.barOn =
      !siteOff &&
      !(config && config.features?.quickPrompts?.enabled === false) &&
      (await readState()).showPromptButtons;
    state.prompts = await AIToolsUtils.getPrompts();

    scheduleRender(0);
  }

  AIToolsUtils.onSettingsChanged(apply);

  function start() {
    apply();

    // 单页应用动态加载监控
    let renderTimer = null;
    const observer = new MutationObserver(() => {
      if (!state.barOn) return;
      clearTimeout(renderTimer);
      renderTimer = setTimeout(renderBar, 500);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
