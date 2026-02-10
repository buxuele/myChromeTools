(function () {
  "use strict";

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
        const textarea = findInputContainer();
        
        if (textarea) {
          textarea.focus();
          
          if (textarea.tagName === 'TEXTAREA') {
            textarea.value = prompt;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            textarea.textContent = prompt;
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

  function init() {
    setTimeout(createQuickPromptButtons, 1000);
    setTimeout(createQuickPromptButtons, 3000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", () => {
    setTimeout(createQuickPromptButtons, 2000);
  });
})();
