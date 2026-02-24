(function () {
  "use strict";

  async function getConfig() {
    if (typeof AIToolsUtils !== 'undefined') {
      return await AIToolsUtils.getSettings();
    }
    return null;
  }

  let QUICK_PROMPTS = [];

  function findInputContainer() {
    const selectors = [
      'div[contenteditable="true"]',
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="问"]',
      'div[role="textbox"]',
      'main div[contenteditable="true"]'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        console.log('[aiTools] 找到输入框:', selector);
        return el;
      }
    }
    
    console.log('[aiTools] 未找到输入框');
    return null;
  }

  function createQuickPromptButtons() {
    if (document.getElementById("aitools-grok-prompts")) return;

    const inputElement = findInputContainer();
    if (!inputElement) return;

    let targetContainer = inputElement;
    for (let i = 0; i < 7; i++) {
      targetContainer = targetContainer.parentElement;
      if (!targetContainer) break;
    }
    
    if (!targetContainer) {
      console.log('[aiTools] 未找到合适的父容器');
      return;
    }

    const buttonBar = document.createElement("div");
    buttonBar.id = "aitools-grok-prompts";
    buttonBar.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 8px 12px;
      background: transparent;
      margin-bottom: 8px;
      flex-wrap: wrap;
    `;

    QUICK_PROMPTS.forEach(({ label, content }) => {
      const button = document.createElement("button");
      button.textContent = label;
      button.type = "button";
      button.title = content;
      button.style.cssText = `
        padding: 6px 12px;
        background: #4a4a4a;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
      `;

      button.addEventListener("click", () => {
        const textarea = findInputContainer();
        
        if (textarea) {
          textarea.focus();
          
          if (textarea.tagName === 'TEXTAREA') {
            textarea.value = content;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            textarea.textContent = content;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(textarea);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }
          
          console.log('[aiTools] 已插入提示词:', label);
        }
      });

      buttonBar.appendChild(button);
    });

    targetContainer.insertBefore(buttonBar, targetContainer.firstChild);
    console.log('[aiTools] 按钮栏已创建');
  }

  async function init() {
    const config = await getConfig();
    
    if (config && config.enabled === false) return;
    if (config && config.features?.quickPrompts?.enabled === false) return;

    // 加载提示词配置
    const prompts = await AIToolsUtils.getPrompts();
    if (prompts && prompts.length > 0) {
      QUICK_PROMPTS = prompts;
      setTimeout(createQuickPromptButtons, 1000);
      setTimeout(createQuickPromptButtons, 3000);
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
      if (QUICK_PROMPTS.length > 0) {
        createQuickPromptButtons();
      }
    }, 2000);
  });
})();
