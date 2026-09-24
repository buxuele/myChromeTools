/**
 * aiTools 公共工具函数库
 * 为所有 content_scripts 提供共享功能
 * 依赖先加载的 defaults.js
 */

(function () {
  "use strict";

  window.AIToolsUtils = {
    getSettings,
    getPrompts,
    insertPromptToInput,
    createPromptBar,
    applyStyle,
    removeStyle,
    onSettingsChanged
  };

  /**
   * 获取当前站点配置
   * @returns {Promise<Object|null>} 站点配置，未匹配到返回 null
   */
  async function getSettings() {
    try {
      const { settings } = await readState();
      return matchSite(window.location.hostname, settings);
    } catch (error) {
      console.error("[aiTools] 获取配置失败:", error);
      return null;
    }
  }

  /**
   * 获取提示词列表
   * @returns {Promise<Array>}
   */
  async function getPrompts() {
    try {
      const { settings } = await readState();
      return settings.prompts && settings.prompts.length > 0
        ? settings.prompts
        : cloneConfig(DEFAULT_PROMPTS);
    } catch (error) {
      console.error("[aiTools] 获取提示词失败:", error);
      return cloneConfig(DEFAULT_PROMPTS);
    }
  }

  /**
   * 配置变更监听，替代整页刷新
   * @param {Function} handler 配置变化后的回调
   */
  function onSettingsChanged(handler) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area && area !== "local") return;
      if (changes[STORAGE_KEY_SETTINGS] || changes[STORAGE_KEY_SHOW_PROMPT_BUTTONS]) {
        handler();
      }
    });
  }

  /**
   * 统一的提示词按钮栏，chatgpt、grok、gemini 共用
   * @param {string} id 按钮栏 id
   * @param {Array} prompts 提示词列表
   * @param {Function} onClick 点击回调，参数为 content 与 index
   * @returns {HTMLElement}
   */
  function createPromptBar(id, prompts, onClick) {
    const bar = document.createElement("div");
    bar.id = id;
    bar.className = "aitools-prompt-bar";
    bar.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 8px 12px;
      background: transparent;
      margin-bottom: 8px;
      flex-wrap: wrap;
    `;

    prompts.forEach(({ label, content }, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.title = content;
      button.dataset.promptIndex = String(index);
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
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick(content, index);
      });
      bar.appendChild(button);
    });

    return bar;
  }

  /**
   * 注入样式，重复调用不会叠加
   * @param {string} id 样式节点 id
   * @param {string} css 样式内容
   */
  function applyStyle(id, css) {
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = css;
    return style;
  }

  /**
   * 移除样式
   * @param {string} id 样式节点 id
   */
  function removeStyle(id) {
    const style = document.getElementById(id);
    if (style) style.remove();
  }

  /**
   * 向输入框插入提示词
   * @param {Element} inputElement 输入元素
   * @param {string} text 文本
   * @returns {boolean}
   */
  function insertPromptToInput(inputElement, text) {
    if (!inputElement) return false;

    inputElement.focus();

    if (inputElement.tagName === "TEXTAREA" || inputElement.tagName === "INPUT") {
      inputElement.value = text;
      inputElement.dispatchEvent(new Event("input", { bubbles: true }));
      inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (inputElement.isContentEditable || inputElement.contentEditable === "true") {
      inputElement.textContent = text;
      inputElement.dispatchEvent(new Event("input", { bubbles: true }));

      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(inputElement);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      return false;
    }

    return true;
  }
})();
