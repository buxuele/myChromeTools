(function () {
  "use strict";

  // 要隐藏的按钮文字（支持多种语言和变体）
  const BUTTON_TEXTS_TO_HIDE = [
    "询问 ChatGPT",
    "Ask ChatGPT",
    "ChatGPT",
    "问 ChatGPT",
    "Ask AI",
    "AI助手"
  ];

  /**
   * 查找并隐藏目标按钮 - 使用多种选择器策略
   * @returns {boolean} - 如果找到并隐藏了按钮，则返回 true
   */
  function findAndHideButton() {
    let found = false;

    // 策略1: 通过文本内容查找所有可能的按钮元素
    const allButtons = document.querySelectorAll('button, div[role="button"], a[role="button"], span[role="button"]');
    for (const button of allButtons) {
      const text = button.textContent?.trim() || '';
      if (BUTTON_TEXTS_TO_HIDE.some(hideText => text.includes(hideText))) {
        button.style.display = 'none !important';
        button.style.visibility = 'hidden !important';
        button.style.opacity = '0 !important';
        console.log(`[aiTools] 通过文本匹配隐藏了包含 "${text}" 的按钮`);
        found = true;
      }
    }

    // 策略2: 隐藏常见的弹出框容器
    const popupSelectors = [
      '[class*="popup"]',
      '[class*="tooltip"]',
      '[class*="floating"]',
      '[class*="overlay"]',
      '[id*="chatgpt"]',
      '[class*="chatgpt"]',
      '[data-testid*="chatgpt"]'
    ];

    for (const selector of popupSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent?.trim() || '';
        if (BUTTON_TEXTS_TO_HIDE.some(hideText => text.includes(hideText))) {
          element.style.display = 'none !important';
          element.style.visibility = 'hidden !important';
          console.log(`[aiTools] 通过选择器 "${selector}" 隐藏了弹出框`);
          found = true;
        }
      }
    }

    // 策略3: 隐藏可能的浮动按钮（通常有固定定位）
    const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
    for (const element of fixedElements) {
      const text = element.textContent?.trim() || '';
      if (BUTTON_TEXTS_TO_HIDE.some(hideText => text.includes(hideText))) {
        element.style.display = 'none !important';
        console.log(`[aiTools] 隐藏了固定定位的元素: "${text}"`);
        found = true;
      }
    }

    return found;
  }

  /**
   * 添加CSS样式来隐藏按钮和强制设置输入框高度
   */
  function addHideButtonCSS() {
    const style = document.createElement('style');
    style.id = 'aitools-chatgpt-hider';
    style.textContent = `
      /* 通用隐藏规则 - 针对可能的扩展注入元素 */
      *[data-extension*="chatgpt"],
      *[data-testid*="chatgpt"],
      *[aria-label*="ChatGPT"],
      *[title*="ChatGPT"],
      *[id*="chatgpt"],
      *[class*="chatgpt"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* 隐藏可能的AI助手相关元素 */
      *[aria-label*="AI助手"],
      *[title*="AI助手"],
      *[data-testid*="ai-assistant"] {
        display: none !important;
        visibility: hidden !important;
      }

      /* 强制设置ChatGPT输入框高度为100px */
      #prompt-textarea {
        height: 100px !important;
        min-height: 100px !important;
        max-height: 100px !important;
      }

      /* 针对ProseMirror编辑器 */
      div.ProseMirror[contenteditable="true"] {
        height: 100px !important;
        min-height: 100px !important;
        max-height: 100px !important;
      }

      /* 针对输入框父容器 */
      div._prosemirror-parent_ebv8s_2,
      div[class*="_prosemirror-parent_"],
      div[class*="prosemirror-parent"] {
        height: 100px !important;
        min-height: 100px !important;
        max-height: 100px !important;
      }

      /* 通用输入框样式 */
      div[contenteditable="true"][data-virtualkeyboard="true"],
      div[contenteditable="true"][translate="no"] {
        height: 100px !important;
        min-height: 100px !important;
        max-height: 100px !important;
      }

      /* 添加一个隐藏类，供JavaScript使用 */
      .aitools-hidden {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;

    // 避免重复添加样式
    if (!document.getElementById('aitools-chatgpt-hider')) {
      document.head.appendChild(style);
      console.log('[aiTools] 已添加CSS样式来隐藏 ChatGPT 相关元素和强制设置输入框高度');
    }
  }

  /**
   * 查找并修改ChatGPT输入框高度为100px
   */
  function adjustChatGPTInputHeight() {
    // 检查是否在ChatGPT网站上
    if (!window.location.hostname.includes('chatgpt.com')) {
      return false;
    }

    let found = false;

    // 策略1: 直接定位 #prompt-textarea 元素（你提供的具体元素）
    const promptTextarea = document.querySelector('#prompt-textarea');
    if (promptTextarea) {
      promptTextarea.style.height = '100px !important';
      promptTextarea.style.minHeight = '100px !important';
      promptTextarea.style.maxHeight = '100px !important';
      console.log('[aiTools] 直接设置 #prompt-textarea 高度为100px');
      found = true;
    }

    // 策略2: 查找 ProseMirror 编辑器
    const proseMirrorElements = document.querySelectorAll('div.ProseMirror[contenteditable="true"]');
    for (const element of proseMirrorElements) {
      if (element.id === 'prompt-textarea' || element.getAttribute('data-virtualkeyboard') === 'true') {
        element.style.height = '100px !important';
        element.style.minHeight = '100px !important';
        element.style.maxHeight = '100px !important';
        console.log('[aiTools] 设置 ProseMirror 编辑器高度为100px');
        found = true;
      }
    }

    // 策略3: 查找包含输入框的父容器
    const parentContainers = document.querySelectorAll('div._prosemirror-parent_ebv8s_2, div[class*="_prosemirror-parent_"], div[class*="prosemirror-parent"]');
    for (const container of parentContainers) {
      container.style.height = '100px !important';
      container.style.maxHeight = '100px !important';
      container.style.minHeight = '100px !important';
      console.log('[aiTools] 设置输入框父容器高度为100px');
      found = true;
    }

    // 策略4: 通过更广泛的选择器查找（包括首页情况）
    const fallbackSelectors = [
      'div[contenteditable="true"][data-virtualkeyboard="true"]',
      'div[contenteditable="true"][translate="no"]',
      'textarea[name="prompt-textarea"]',
      'div[data-placeholder*="询问"]',
      'div[data-placeholder*="Ask"]'
    ];

    for (const selector of fallbackSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        element.style.height = '100px !important';
        element.style.minHeight = '100px !important';
        element.style.maxHeight = '100px !important';

        // 同时调整父容器
        const parent = element.closest('div[class*="max-h-"]') || element.parentElement;
        if (parent && parent !== element) {
          parent.style.height = '100px !important';
          parent.style.maxHeight = '100px !important';
          parent.style.minHeight = '100px !important';
        }

        console.log(`[aiTools] 通过选择器 "${selector}" 调整了输入框高度`);
        found = true;
      }
    }

    return found;
  }

  /**
   * 监听文字选中事件，立即隐藏可能出现的弹出框
   */
  function setupSelectionListener() {
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        // 文字被选中时，延迟检查并隐藏弹出框
        setTimeout(() => {
          findAndHideButton();
        }, 50);
        setTimeout(() => {
          findAndHideButton();
        }, 200);
        setTimeout(() => {
          findAndHideButton();
        }, 500);
      }
    });

    // 监听鼠标抬起事件（选中文字后）
    document.addEventListener('mouseup', () => {
      setTimeout(() => {
        findAndHideButton();
      }, 100);
    });
  }

  // 初始化函数
  function init() {
    // 立即尝试隐藏按钮
    findAndHideButton();

    // 调整ChatGPT输入框高度
    adjustChatGPTInputHeight();

    // 添加CSS样式作为备用
    addHideButtonCSS();

    // 设置文字选中事件监听
    setupSelectionListener();

    // 设置定时器持续检查和调整输入框高度（针对ChatGPT网站）
    if (window.location.hostname.includes('chatgpt.com')) {
      const inputHeightInterval = setInterval(() => {
        adjustChatGPTInputHeight();
      }, 1000); // 每秒检查一次

      // 10分钟后停止定时器，避免长期占用资源
      setTimeout(() => {
        clearInterval(inputHeightInterval);
        console.log('[aiTools] 输入框高度调整定时器已停止');
      }, 600000);
    }

    // 设置MutationObserver监控动态内容
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      let shouldAdjustInput = false;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          // 检查是否有新的元素被添加
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 检查是否是按钮或包含按钮的元素
              const className = node.className ? String(node.className) : '';
              if (node.tagName === 'BUTTON' ||
                node.querySelector && node.querySelector('button, div[role="button"], a[role="button"]') ||
                node.getAttribute && (node.getAttribute('role') === 'button' ||
                  className.includes('popup') ||
                  className.includes('tooltip') ||
                  className.includes('floating'))) {
                shouldCheck = true;
              }

              // 检查是否是输入框相关元素
              if (className.includes('prosemirror') ||
                node.id === 'prompt-textarea' ||
                node.querySelector && node.querySelector('#prompt-textarea, .ProseMirror, [class*="prosemirror"]')) {
                shouldAdjustInput = true;
              }
            }
          }
        }
      }

      if (shouldCheck) {
        // 延迟一点执行，确保DOM完全更新
        setTimeout(findAndHideButton, 50);
      }

      if (shouldAdjustInput) {
        // 调整输入框高度
        setTimeout(adjustChatGPTInputHeight, 100);
      }
    });

    // 开始观察
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'style', 'aria-label', 'title']
    });

    console.log('[aiTools] ChatGPT 增强功能已启动 - 隐藏弹出按钮 + 调整输入框高度');
  }

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 页面加载完成后再次检查
  window.addEventListener('load', () => {
    setTimeout(findAndHideButton, 1000);
  });

})();