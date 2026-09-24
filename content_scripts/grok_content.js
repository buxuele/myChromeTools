(function () {
  "use strict";

  const BAR_ID = "aitools-grok-prompts";

  const state = {
    barOn: false,
    focusOn: false,
    prompts: []
  };

  function findInputContainer() {
    const selectors = [
      'textarea[placeholder*="随便问"]',
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="问"]',
      "textarea.r-30o5oe",
      'div[contenteditable="true"]',
      'div[role="textbox"]',
      "main div[contenteditable=\"true\"]"
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }

    console.log("[aiTools] 未找到输入框");
    return null;
  }

  function insertContent(content) {
    const input = findInputContainer();
    if (!input) {
      console.error("[aiTools] 点击时未找到输入框");
      return;
    }
    AIToolsUtils.insertPromptToInput(input, content);
    console.log("[aiTools] 已插入提示词");
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

    const input = findInputContainer();
    if (!input) return;

    let container = input;
    for (let i = 0; i < 7; i++) {
      container = container.parentElement;
      if (!container) break;
    }
    if (!container) {
      console.log("[aiTools] 未找到合适的父容器");
      return;
    }

    const bar = AIToolsUtils.createPromptBar(BAR_ID, state.prompts, insertContent);
    bar.dataset.signature = signature();
    container.insertBefore(bar, container.firstChild);
    console.log("[aiTools] 按钮栏已创建，共", state.prompts.length, "个按钮");
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

    state.focusOn = !siteOff;
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  // 页面重绘会移除按钮栏，去抖后补回
  let renderTimer = null;
  const observer = new MutationObserver(() => {
    if (!state.barOn) return;
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderBar, 500);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("load", () => {
    console.log("[aiTools] window.load 事件触发");

    // 站点开关决定是否自动聚焦，与提示词按钮开关相互独立
    if (!state.focusOn) return;

    // 异步加载的输入框需要巡逻等待，同时防抖动抢夺焦点
    let attempts = 0;
    const focusTimer = setInterval(() => {
      attempts++;
      const input = findInputContainer();
      if (input) {
        clearInterval(focusTimer);
        setTimeout(() => {
          input.focus();
          console.log("[aiTools] 已自动聚焦输入框");

          let guardCount = 0;
          const guardTimer = setInterval(() => {
            guardCount++;
            if (document.activeElement !== input) {
              input.focus();
              console.log("[aiTools] 强行夺回焦点");
            }
            if (guardCount > 6) {
              clearInterval(guardTimer);
            }
          }, 300);
        }, 500);
      } else if (attempts > 50) {
        clearInterval(focusTimer);
      }
    }, 200);

    scheduleRender(1);
  });
})();
