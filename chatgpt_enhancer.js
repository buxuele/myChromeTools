(function () {
  "use strict";

  // 要隐藏的按钮文字（支持多种语言和变体）
  const BUTTON_TEXTS_TO_HIDE = [
    "询问 ChatGPT",
    "Ask ChatGPT",
    "ChatGPT",
    "问 ChatGPT",
    "Ask AI",
    "AI助手",
  ];

  /**
   * 隐藏浮动的"询问 ChatGPT"按钮
   */
  function hideFloatingAskButton() {
    // 方法1: 隐藏所有 fixed + select-none 的 div
    const floatingDivs = document.querySelectorAll("div.fixed.select-none");

    floatingDivs.forEach((div) => {
      const text = div.textContent?.trim() || "";
      if (BUTTON_TEXTS_TO_HIDE.some((hideText) => text.includes(hideText))) {
        div.style.display = "none !important";
        div.style.visibility = "hidden !important";
        div.style.opacity = "0 !important";
        div.style.pointerEvents = "none !important";
        console.log("[aiTools] 隐藏了浮动按钮:", text.substring(0, 30));
      }
    });

    // 方法2: 通过 style 属性查找 fixed 定位的元素
    const allDivs = document.querySelectorAll(
      'div[style*="top:"], div[style*="left:"]'
    );
    allDivs.forEach((div) => {
      const text = div.textContent?.trim() || "";
      if (BUTTON_TEXTS_TO_HIDE.some((hideText) => text.includes(hideText))) {
        div.style.display = "none !important";
        div.style.visibility = "hidden !important";
        div.style.opacity = "0 !important";
        div.style.pointerEvents = "none !important";
        console.log("[aiTools] 通过位置隐藏了浮动按钮");
      }
    });
  }

  /**
   * 查找并隐藏目标按钮
   */
  function findAndHideButton() {
    // 隐藏浮动按钮
    hideFloatingAskButton();

    // 通过文本内容查找所有可能的按钮元素
    const allButtons = document.querySelectorAll(
      'button, div[role="button"], a[role="button"], span[role="button"]'
    );
    for (const button of allButtons) {
      const text = button.textContent?.trim() || "";
      if (BUTTON_TEXTS_TO_HIDE.some((hideText) => text.includes(hideText))) {
        button.style.display = "none !important";
        button.style.visibility = "hidden !important";
        button.style.opacity = "0 !important";
      }
    }

    // 隐藏常见的弹出框容器
    const popupSelectors = [
      '[class*="popup"]',
      '[class*="tooltip"]',
      '[class*="floating"]',
      '[class*="overlay"]',
      '[id*="chatgpt"]',
      '[class*="chatgpt"]',
      '[data-testid*="chatgpt"]',
    ];

    for (const selector of popupSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent?.trim() || "";
        if (BUTTON_TEXTS_TO_HIDE.some((hideText) => text.includes(hideText))) {
          element.style.display = "none !important";
          element.style.visibility = "hidden !important";
        }
      }
    }

    // 隐藏可能的浮动按钮
    const fixedElements = document.querySelectorAll(
      '[style*="position: fixed"], [style*="position:fixed"]'
    );
    for (const element of fixedElements) {
      const text = element.textContent?.trim() || "";
      if (BUTTON_TEXTS_TO_HIDE.some((hideText) => text.includes(hideText))) {
        element.style.display = "none !important";
      }
    }
  }

  /**
   * 调整ChatGPT输入框高度为100px
   */
  function adjustChatGPTInputHeight() {
    if (!window.location.hostname.includes("chatgpt.com")) {
      return;
    }

    // 直接定位 #prompt-textarea 元素
    const promptTextarea = document.querySelector("#prompt-textarea");
    if (promptTextarea) {
      promptTextarea.style.height = "100px !important";
      promptTextarea.style.minHeight = "100px !important";
      promptTextarea.style.maxHeight = "100px !important";
    }

    // 查找 ProseMirror 编辑器
    const proseMirrorElements = document.querySelectorAll(
      'div.ProseMirror[contenteditable="true"]'
    );
    for (const element of proseMirrorElements) {
      element.style.height = "100px !important";
      element.style.minHeight = "100px !important";
      element.style.maxHeight = "100px !important";
    }

    // 查找输入框父容器
    const parentContainers = document.querySelectorAll(
      'div[class*="_prosemirror-parent_"], div[class*="prosemirror-parent"]'
    );
    for (const container of parentContainers) {
      container.style.height = "100px !important";
      container.style.maxHeight = "100px !important";
      container.style.minHeight = "100px !important";
    }

    // 通用输入框选择器
    const fallbackSelectors = [
      'div[contenteditable="true"][data-virtualkeyboard="true"]',
      'div[contenteditable="true"][translate="no"]',
    ];

    for (const selector of fallbackSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        element.style.height = "100px !important";
        element.style.minHeight = "100px !important";
        element.style.maxHeight = "100px !important";
      }
    }
  }

  /**
   * 使用 MutationObserver 监控动态添加的浮动按钮
   */
  function observeFloatingButtons() {
    const observer = new MutationObserver(() => {
      // 每次 DOM 变化时都检查并隐藏浮动按钮
      hideFloatingAskButton();
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    console.log("[aiTools] ChatGPT 浮动按钮监控已启动");

    // 30秒后停止监控（延长时间以确保捕获所有动态元素）
    setTimeout(() => {
      observer.disconnect();
      console.log("[aiTools] ChatGPT 浮动按钮监控已停止");
    }, 30000);
  }

  /**
   * 添加CSS样式
   */
  function addCSS() {
    const style = document.createElement("style");
    style.id = "aitools-chatgpt-enhancer";
    style.textContent = `
      /* 隐藏ChatGPT相关弹出元素 */
      *[data-extension*="chatgpt"],
      *[data-testid*="chatgpt"],
      *[aria-label*="ChatGPT"],
      *[title*="ChatGPT"],
      *[id*="chatgpt"],
      *[class*="chatgpt"],
      *[aria-label*="AI助手"],
      *[title*="AI助手"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* 强制设置输入框高度为100px */
      #prompt-textarea,
      div.ProseMirror[contenteditable="true"],
      div[class*="_prosemirror-parent_"],
      div[class*="prosemirror-parent"],
      div[contenteditable="true"][data-virtualkeyboard="true"],
      div[contenteditable="true"][translate="no"] {
        height: 100px !important;
        min-height: 100px !important;
        max-height: 100px !important;
      }

    `;

    if (!document.getElementById("aitools-chatgpt-enhancer")) {
      document.head.appendChild(style);
    }
  }

  // 初始化函数
  function init() {
    findAndHideButton();
    adjustChatGPTInputHeight();
    addCSS();
    observeFloatingButtons();
  }

  // 等待DOM加载完成后执行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // 页面完全加载后再次检查
  window.addEventListener("load", () => {
    setTimeout(() => {
      findAndHideButton();
      console.log("[aiTools] 页面加载完成后再次隐藏 ChatGPT 浮动按钮");
    }, 1000);
  });

  // 定期检查（前5秒每500ms检查一次）
  let checkCount = 0;
  const intervalId = setInterval(() => {
    hideFloatingAskButton();
    checkCount++;
    if (checkCount >= 10) {
      clearInterval(intervalId);
      console.log("[aiTools] 停止定期检查浮动按钮");
    }
  }, 500);
})();
