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
      'textarea[placeholder*="随便问"]',
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="问"]',
      'textarea.r-30o5oe',
      'div[contenteditable="true"]',
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
    const buttonBar = document.getElementById("aitools-grok-prompts");
    
    chrome.storage.sync.get(['showPromptButtons'], (result) => {
      const shouldShow = result.showPromptButtons !== false;
      
      if (!shouldShow && buttonBar) {
        buttonBar.style.display = 'none';
        return;
      }
      
      if (shouldShow && buttonBar) {
        buttonBar.style.display = 'flex';
        return;
      }
      
      if (!shouldShow) return;
      if (buttonBar) return;

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

      const newButtonBar = document.createElement("div");
      newButtonBar.id = "aitools-grok-prompts";
      newButtonBar.style.cssText = `
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

        newButtonBar.appendChild(button);
      });

      targetContainer.insertBefore(newButtonBar, targetContainer.firstChild);
      console.log('[aiTools] 按钮栏已创建');
    });
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
      if (request.type === "TOGGLE_PROMPT_BUTTONS") {
        createQuickPromptButtons();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", () => {
    let attempts = 0;
    const focusTimer = setInterval(() => {
      attempts++;
      const input = findInputContainer();
      if (input) {
        clearInterval(focusTimer);
        setTimeout(() => {
          input.focus();
          console.log('[aiTools] 已自动聚焦输入框');
          
          // 防抢夺策略：开启 2 秒的武装巡逻
          let guardCount = 0;
          const guardTimer = setInterval(() => {
            guardCount++;
            if (document.activeElement !== input) {
              input.focus();
              console.log('[aiTools] 强行夺回焦点');
            }
            if (guardCount > 6) { // 6 * 300ms = 1.8秒左右自动解散
              clearInterval(guardTimer);
            }
          }, 300);
        }, 500); // 找到元素后再等 0.5 秒确保事件绑定完成
      } else if (attempts > 50) { // 最长探测 10 秒
        clearInterval(focusTimer);
      }
    }, 200);

    setTimeout(() => {
      if (QUICK_PROMPTS.length > 0) {
        createQuickPromptButtons();
      }
    }, 2000);
  });
})();
