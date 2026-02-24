/**
 * aiTools 公共工具函数库
 * 为所有 content_scripts 提供共享功能
 */

(function () {
  "use strict";

  // 暴露到全局作用域
  window.AIToolsUtils = {
    waitForElement,
    observeDOMChanges,
    getSettings,
    getPrompts,
    initWithRetry,
    insertPromptToInput,
    createButtonBar
  };

  /**
   * 等待元素出现
   * @param {string} selector - CSS 选择器
   * @param {number} timeout - 超时时间（毫秒）
   * @param {number} interval - 检查间隔（毫秒）
   * @returns {Promise<Element|null>}
   */
  function waitForElement(selector, timeout = 10000, interval = 100) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const check = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }
        
        if (Date.now() - startTime >= timeout) {
          console.log(`[aiTools] 等待元素超时: ${selector}`);
          resolve(null);
          return;
        }
        
        setTimeout(check, interval);
      };
      
      check();
    });
  }

  /**
   * 等待多个选择器中的任意一个出现
   * @param {string[]} selectors - CSS 选择器数组
   * @param {number} timeout - 超时时间
   * @returns {Promise<Element|null>}
   */
  function waitForAnyElement(selectors, timeout = 10000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const check = () => {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            resolve(element);
            return;
          }
        }
        
        if (Date.now() - startTime >= timeout) {
          console.log(`[aiTools] 等待元素超时`);
          resolve(null);
          return;
        }
        
        setTimeout(check, 100);
      };
      
      check();
    });
  }

  /**
   * 监控 DOM 变化
   * @param {Function} callback - 回调函数，接收 mutations
   * @param {Object} options - 配置选项
   * @returns {MutationObserver}
   */
  function observeDOMChanges(callback, options = {}) {
    const config = {
      timeout: options.timeout || 10000,
      target: options.target || document.body,
      config: options.observerConfig || { childList: true, subtree: true },
      ...options
    };
    
    const observer = new MutationObserver((mutations) => {
      callback(mutations, observer);
    });
    
    if (config.target) {
      observer.observe(config.target, config.config);
    }
    
    if (config.timeout > 0) {
      setTimeout(() => {
        observer.disconnect();
        console.log('[aiTools] DOM 监控已自动停止');
      }, config.timeout);
    }
    
    return observer;
  }

  // 默认提示词
  const DEFAULT_PROMPTS = [
    {
      id: "read-article",
      label: "读文章",
      content: "### 读文章\n我们继续读文章。对于下面的每个文章，我给出链接，你给出 3-5句短评，给出批评意见，2-3句整体，口语化，日常话，我们是老朋友那种\n\n下面开始"
    },
    {
      id: "write-tweet",
      label: "写推特",
      content: "### 写推特帖子\n我的偏好:\n- 用最短、最接地气的日常口语回答，严禁任何心理学/大脑术语\n- 输出控制在用户指定字数以内\n- 严格按用户给的示例句子风格和内容走，不要自行添加解释、建议或多余内容。"
    },
    {
      id: "small-steps",
      label: "小步骤",
      content: "### 指导操作步骤\n请不要一下子给出这么多步骤,每次给出小步骤！你输出太多太乱，我容易失去耐心，后果非常严重。\n\n禁止基于经验的瞎猜，必须依据项目实际目录结构和代码逻辑给出结论。\n\n比如，当前在那个文件夹目录，执行哪个命令\n比如，在哪个位置执行这个命令？？ npm run build"
    },
    {
      id: "search-project",
      label: "搜项目",
      content: "### 搜索 github 项目\n帮我在 github 上搜一下，这种项目:\n一键发送帖子，尤其是 x, 知乎，抖音，小红书这种平台\n最好是能一键发送到多个平台。\n\n要比较新的，用户多的，有效的，好用好评的。"
    }
  ];

  /**
   * 获取提示词列表
   * @returns {Promise<Array>}
   */
  async function getPrompts() {
    return new Promise((resolve) => {
      chrome.storage.sync.get("aiToolsSettings", (result) => {
        if (chrome.runtime.lastError) {
          console.error('[aiTools] 获取提示词失败:', chrome.runtime.lastError);
          resolve(DEFAULT_PROMPTS);
          return;
        }
        
        const settings = result.aiToolsSettings;
        if (settings && settings.prompts && settings.prompts.length > 0) {
          resolve(settings.prompts);
        } else {
          // 如果没有自定义提示词，返回默认值
          resolve(DEFAULT_PROMPTS);
        }
      });
    });
  }

  /**
   * 获取扩展配置
   * @returns {Promise<Object>}
   */
  async function getSettings() {
    return new Promise((resolve) => {
      const hostname = window.location.hostname;
      
      chrome.storage.sync.get("aiToolsSettings", (result) => {
        if (chrome.runtime.lastError) {
          console.error('[aiTools] 获取配置失败:', chrome.runtime.lastError);
          resolve(null);
          return;
        }
        
        const settings = result.aiToolsSettings;
        if (!settings) {
          resolve(null);
          return;
        }
        
        // 找到当前站点配置
        let siteConfig = null;
        for (const [key, config] of Object.entries(settings.sites || {})) {
          if (hostname.includes(key.toLowerCase())) {
            siteConfig = { key, ...config };
            break;
          }
        }
        
        resolve(siteConfig);
      });
    });
  }

  /**
   * 带重试机制的初始化
   * @param {Function} initFn - 初始化函数
   * @param {Object} options - 配置
   */
  async function initWithRetry(initFn, options = {}) {
    const config = {
      maxRetries: options.maxRetries || 5,
      retryDelay: options.retryDelay || 1000,
      checkInterval: options.checkInterval || 500,
      condition: options.condition || null,
      ...options
    };
    
    let retries = 0;
    
    const tryInit = async () => {
      // 如果有前置条件，先检查
      if (config.condition && !config.condition()) {
        if (retries < config.maxRetries) {
          retries++;
          setTimeout(tryInit, config.checkInterval);
          return;
        }
        console.log('[aiTools] 初始化条件未满足，已达最大重试次数');
        return;
      }
      
      try {
        const result = await initFn();
        if (result === false && retries < config.maxRetries) {
          retries++;
          setTimeout(tryInit, config.retryDelay);
        }
      } catch (error) {
        console.error('[aiTools] 初始化失败:', error);
        if (retries < config.maxRetries) {
          retries++;
          setTimeout(tryInit, config.retryDelay);
        }
      }
    };
    
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", tryInit);
    } else {
      tryInit();
    }
  }

  /**
   * 向输入框插入提示词
   * @param {Element} inputElement - 输入元素
   * @param {string} text - 要插入的文本
   */
  function insertPromptToInput(inputElement, text) {
    if (!inputElement) return false;
    
    inputElement.focus();
    
    if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
      inputElement.value = text;
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (inputElement.contentEditable === 'true') {
      inputElement.textContent = text;
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      
      // 设置光标到末尾
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

  /**
   * 创建按钮栏
   * @param {string} id - 按钮栏 ID
   * @param {Array} buttons - 按钮配置数组 {label, title, onClick}
   * @returns {HTMLElement}
   */
  function createButtonBar(id, buttons) {
    if (document.getElementById(id)) {
      return document.getElementById(id);
    }
    
    const buttonBar = document.createElement("div");
    buttonBar.id = id;
    buttonBar.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 8px 12px;
      background: transparent;
      margin-bottom: 8px;
      flex-wrap: wrap;
    `;
    
    buttons.forEach(({ label, title, onClick }) => {
      const button = document.createElement("button");
      button.textContent = label;
      button.type = "button";
      if (title) button.title = title;
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
      
      button.addEventListener("click", onClick);
      buttonBar.appendChild(button);
    });
    
    return buttonBar;
  }

})();
