(function () {
  "use strict";

  const isOnChatGPTSite = window.location.hostname.includes("chatgpt.com");
  const BUTTON_TEXTS_TO_HIDE = ["询问 ChatGPT", "Ask ChatGPT", "问 ChatGPT"];

  let QUICK_PROMPTS = [];

  // 获取配置
  async function getConfig() {
    if (typeof AIToolsUtils !== 'undefined') {
      return await AIToolsUtils.getSettings();
    }
    return null;
  }

  /**
   * 隐藏浮动的"询问 ChatGPT"按钮（只在非 ChatGPT 官网上执行）
   */
  function hideFloatingAskButton() {
    if (isOnChatGPTSite) return;

    const floatingDivs = document.querySelectorAll("div.fixed.select-none");
    floatingDivs.forEach((div) => {
      const text = div.textContent?.trim() || "";
      if (BUTTON_TEXTS_TO_HIDE.some((hideText) => text.includes(hideText))) {
        div.style.display = "none";
      }
    });
  }

  function findAndHideButton() {
    if (isOnChatGPTSite) return;
    hideFloatingAskButton();
  }

  function adjustChatGPTInputHeight() {
    if (!isOnChatGPTSite) return;

    const textarea = document.querySelector("#prompt-textarea");
    if (textarea) {
      textarea.style.height = "100px";
      textarea.style.minHeight = "100px";
      textarea.style.maxHeight = "100px";
    }

    const proseMirror = document.querySelector('div.ProseMirror[contenteditable="true"]');
    if (proseMirror) {
      proseMirror.style.height = "100px";
      proseMirror.style.minHeight = "100px";
      proseMirror.style.maxHeight = "100px";
    }
  }

  function createQuickPromptButtons() {
    if (!isOnChatGPTSite) return;
    if (document.getElementById("aitools-quick-prompts")) return;

    const inputContainer = document.querySelector('form[class*="stretch"]') || 
                          document.querySelector('form') ||
                          document.querySelector('#prompt-textarea')?.closest('div');
    
    if (!inputContainer) return;

    const buttonBar = document.createElement("div");
    buttonBar.id = "aitools-quick-prompts";
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
      button.title = prompt;
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
        const proseMirror = document.querySelector('div.ProseMirror[contenteditable="true"]');
        const textarea = document.querySelector("#prompt-textarea");
        
        if (proseMirror) {
          proseMirror.focus();
          proseMirror.textContent = content;
          proseMirror.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (textarea) {
          textarea.value = content;
          textarea.focus();
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      buttonBar.appendChild(button);
    });

    inputContainer.parentNode.insertBefore(buttonBar, inputContainer);
  }

  function observeFloatingButtons() {
    if (isOnChatGPTSite) return;

    const observer = new MutationObserver(() => {
      hideFloatingAskButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => observer.disconnect(), 10000);
  }

  function addCSS() {
    if (document.getElementById("aitools-chatgpt-enhancer")) return;

    const style = document.createElement("style");
    style.id = "aitools-chatgpt-enhancer";
    
    let cssContent = "";

    if (!isOnChatGPTSite) {
      cssContent += `
        *[data-extension*="chatgpt"] {
          display: none !important;
        }
      `;
    }

    if (isOnChatGPTSite) {
      cssContent += `
        #prompt-textarea,
        div.ProseMirror[contenteditable="true"] {
          height: 100px !important;
          min-height: 100px !important;
          max-height: 100px !important;
        }
      `;
    }

    style.textContent = cssContent;
    document.head.appendChild(style);
  }

  // 主初始化函数
  async function init() {
    const config = await getConfig();
    
    addCSS();
    
    if (isOnChatGPTSite) {
      if (!config || config.enabled !== false) {
        if (!config || config.features?.adjustInput?.enabled !== false) {
          adjustChatGPTInputHeight();
        }
        
        // 加载提示词配置
        const prompts = await AIToolsUtils.getPrompts();
        if (prompts && prompts.length > 0) {
          QUICK_PROMPTS = prompts;
          createQuickPromptButtons();
        }
      }
    } else {
      if (!config || config.enabled !== false) {
        if (!config || config.features?.hideFloating?.enabled !== false) {
          findAndHideButton();
          observeFloatingButtons();
        }
      }
    }
  }

  // 监听配置更新消息
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
      if (isOnChatGPTSite && QUICK_PROMPTS.length > 0) {
        createQuickPromptButtons();
      }
    }, 1000);
  });
})();
