(function () {
  "use strict";

  // 检查是否在 ChatGPT 官网上
  const isOnChatGPTSite = window.location.hostname.includes("chatgpt.com");

  // 要隐藏的按钮文字（更精确的匹配，避免误伤）
  // 只匹配明确的第三方浮动按钮文字
  const BUTTON_TEXTS_TO_HIDE = ["询问 ChatGPT", "Ask ChatGPT", "问 ChatGPT"];

  /**
   * 隐藏浮动的"询问 ChatGPT"按钮（只在非 ChatGPT 官网上执行）
   */
  function hideFloatingAskButton() {
    // 在 ChatGPT 官网上不执行隐藏逻辑
    if (isOnChatGPTSite) {
      return;
    }

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
   * 查找并隐藏目标按钮（只在非 ChatGPT 官网上执行）
   */
  function findAndHideButton() {
    // 在 ChatGPT 官网上不执行隐藏逻辑
    if (isOnChatGPTSite) {
      return;
    }

    // 隐藏浮动按钮
    hideFloatingAskButton();

    // 通过文本内容查找所有可能的按钮元素
    const allButtons = document.querySelectorAll(
      'button, div[role="button"], a[role="button"], span[role="button"]'
    );
    for (const button of allButtons) {
      const text = button.textContent?.trim() || "";
      // 使用精确匹配，避免误伤
      if (
        BUTTON_TEXTS_TO_HIDE.some(
          (hideText) => text === hideText || text.startsWith(hideText)
        )
      ) {
        button.style.display = "none !important";
        button.style.visibility = "hidden !important";
        button.style.opacity = "0 !important";
      }
    }

    // 只隐藏明确标记为第三方扩展的弹出框
    const popupSelectors = ['[data-extension*="chatgpt"]'];

    for (const selector of popupSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        element.style.display = "none !important";
        element.style.visibility = "hidden !important";
      }
    }

    // 隐藏可能的浮动按钮（只匹配精确文本）
    const fixedElements = document.querySelectorAll(
      '[style*="position: fixed"], [style*="position:fixed"]'
    );
    for (const element of fixedElements) {
      const text = element.textContent?.trim() || "";
      if (
        BUTTON_TEXTS_TO_HIDE.some(
          (hideText) => text === hideText || text.startsWith(hideText)
        )
      ) {
        element.style.display = "none !important";
      }
    }
  }

  /**
   * 快捷提示词配置
   */
  const QUICK_PROMPTS = [
    {
      label: "读文章",
      prompt: `### 读文章
我们继续读文章。对于下面的每个文章，我给出链接，你给出 3-5句短评，给出批评意见，2-3句整体，口语化，日常话，我们是老朋友那种

下面开始
`
    },
    {
      label: "写推特",
      prompt: `### 写推特帖子
我的偏好:
- 用最短、最接地气的日常口语回答，严禁任何心理学/大脑术语
- 输出控制在用户指定字数以内
- 严格按用户给的示例句子风格和内容走，不要自行添加解释、建议或多余内容。
`
    },
    {
      label: "小步骤",
      prompt: `### 指导操作步骤
请不要一下子给出这么多步骤,每次给出小步骤！你输出太多太乱，我容易失去耐心，后果非常严重。

禁止基于经验的瞎猜，必须依据项目实际目录结构和代码逻辑给出结论。

比如，当前在那个文件夹目录，执行哪个命令
比如，在哪个位置执行这个命令？？ npm run build
`
    },
    {
      label: "搜项目",
      prompt: `### 搜索 github 项目
帮我在 github 上搜一下，这种项目:
一键发送帖子，尤其是 x, 知乎，抖音，小红书这种平台
最好是能一键发送到多个平台。

要比较新的，用户多的，有效的，好用好评的。
`
    }
  ];

  /**
   * 创建快捷提示词按钮栏
   */
  function createQuickPromptButtons() {
    if (!window.location.hostname.includes("chatgpt.com")) {
      return;
    }

    // 避免重复创建
    if (document.getElementById("aitools-quick-prompts")) {
      return;
    }

    // 查找输入框容器
    const inputContainer = document.querySelector('form[class*="stretch"]') || 
                          document.querySelector('form') ||
                          document.querySelector('#prompt-textarea')?.closest('div');
    
    if (!inputContainer) {
      console.log("[aiTools] 未找到输入框容器，稍后重试");
      return;
    }

    // 创建按钮容器
    const buttonBar = document.createElement("div");
    buttonBar.id = "aitools-quick-prompts";
    buttonBar.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 8px 12px;
      background: transparent;
      border-radius: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;
      align-items: center;
    `;

    // 创建按钮
    QUICK_PROMPTS.forEach(({ label, prompt }) => {
      const button = document.createElement("button");
      button.textContent = label;
      button.type = "button";
      button.title = prompt; // 添加 tooltip
      button.style.cssText = `
        padding: 6px 12px;
        background: #4a4a4a;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
        white-space: nowrap;
      `;

      // 悬停效果
      button.addEventListener("mouseenter", () => {
        button.style.background = "#5a5a5a";
        button.style.transform = "translateY(-1px)";
      });
      button.addEventListener("mouseleave", () => {
        button.style.background = "#4a4a4a";
        button.style.transform = "translateY(0)";
      });

      // 点击插入提示词
      button.addEventListener("click", () => {
        const textarea = document.querySelector("#prompt-textarea");
        const proseMirror = document.querySelector('div.ProseMirror[contenteditable="true"]');
        
        if (proseMirror) {
          // 使用 ProseMirror 编辑器
          proseMirror.focus();
          proseMirror.textContent = prompt;
          
          // 触发 input 事件
          proseMirror.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (textarea) {
          // 使用 textarea
          textarea.value = prompt;
          textarea.focus();
          
          // 触发 input 事件
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        console.log(`[aiTools] 已插入提示词: ${label}`);
      });

      buttonBar.appendChild(button);
    });

    // 插入到输入框上方
    inputContainer.parentNode.insertBefore(buttonBar, inputContainer);
    console.log("[aiTools] 快捷提示词按钮已创建");
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
    // 在 ChatGPT 官网上不需要监控浮动按钮
    if (isOnChatGPTSite) {
      return;
    }

    const observer = new MutationObserver(() => {
      // 每次 DOM 变化时都检查并隐藏浮动按钮
      hideFloatingAskButton();
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    console.log("[aiTools] 第三方 ChatGPT 浮动按钮监控已启动");

    // 30秒后停止监控（延长时间以确保捕获所有动态元素）
    setTimeout(() => {
      observer.disconnect();
      console.log("[aiTools] 第三方 ChatGPT 浮动按钮监控已停止");
    }, 30000);
  }

  /**
   * 添加CSS样式
   */
  function addCSS() {
    const style = document.createElement("style");
    style.id = "aitools-chatgpt-enhancer";

    // 只在非 ChatGPT 官网上添加隐藏第三方扩展的 CSS
    let cssContent = "";

    if (!isOnChatGPTSite) {
      cssContent += `
        /* 只隐藏第三方扩展注入的 ChatGPT 相关元素 */
        *[data-extension*="chatgpt"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `;
    }

    // ChatGPT 官网的输入框高度调整
    if (isOnChatGPTSite) {
      cssContent += `
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
    }

    style.textContent = cssContent;

    if (!document.getElementById("aitools-chatgpt-enhancer")) {
      document.head.appendChild(style);
    }
  }

  // 初始化函数
  function init() {
    findAndHideButton();
    adjustChatGPTInputHeight();
    createQuickPromptButtons();
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
      createQuickPromptButtons();
      if (!isOnChatGPTSite) {
        console.log("[aiTools] 页面加载完成后再次检查第三方 ChatGPT 浮动按钮");
      }
    }, 1000);
  });

  // 定期检查（前5秒每500ms检查一次，只在非 ChatGPT 官网上执行）
  if (!isOnChatGPTSite) {
    let checkCount = 0;
    const intervalId = setInterval(() => {
      hideFloatingAskButton();
      checkCount++;
      if (checkCount >= 10) {
        clearInterval(intervalId);
        console.log("[aiTools] 停止定期检查浮动按钮");
      }
    }, 500);
  }
})();
