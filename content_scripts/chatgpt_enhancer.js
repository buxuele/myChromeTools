(function () {
  "use strict";

  const isOnChatGPTSite = window.location.hostname.includes("chatgpt.com");
  const BUTTON_TEXTS_TO_HIDE = ["询问 ChatGPT", "Ask ChatGPT", "问 ChatGPT"];

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

  /**
   * 查找并隐藏目标按钮（只在非 ChatGPT 官网上执行）
   */
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

    QUICK_PROMPTS.forEach(({ label, prompt }) => {
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
          proseMirror.textContent = prompt;
          proseMirror.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (textarea) {
          textarea.value = prompt;
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

  function init() {
    addCSS();
    
    if (isOnChatGPTSite) {
      adjustChatGPTInputHeight();
      createQuickPromptButtons();
    } else {
      findAndHideButton();
      observeFloatingButtons();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      if (isOnChatGPTSite) {
        createQuickPromptButtons();
      }
    }, 1000);
  });
})();
