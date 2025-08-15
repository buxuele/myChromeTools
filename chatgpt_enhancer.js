(function () {
  "use strict";

  // 要隐藏的按钮上的文字
  const BUTTON_TEXT_TO_HIDE = "询问 ChatGPT";

  /**
   * 查找并隐藏目标按钮 - 使用多种选择器策略
   * @returns {boolean} - 如果找到并隐藏了按钮，则返回 true
   */
  function findAndHideButton() {
    let found = false;

    // 策略1: 通过文本内容查找
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      if (button.textContent && button.textContent.trim() === BUTTON_TEXT_TO_HIDE) {
        button.style.display = 'none !important';
        console.log(`[aiTools] 通过文本匹配隐藏了 "${BUTTON_TEXT_TO_HIDE}" 按钮`);
        found = true;
      }
    }

    // 策略2: 通过CSS类名查找（基于你提供的HTML结构）
    const specificButtons = document.querySelectorAll('button.btn.btn-secondary.shadow-long');
    for (const button of specificButtons) {
      if (button.textContent && button.textContent.includes(BUTTON_TEXT_TO_HIDE)) {
        button.style.display = 'none !important';
        console.log(`[aiTools] 通过CSS类名隐藏了 "${BUTTON_TEXT_TO_HIDE}" 按钮`);
        found = true;
      }
    }

    // 策略3: 通过SVG图标查找（基于你提供的HTML结构中的SVG路径）
    const svgButtons = document.querySelectorAll('button svg[width="20"][height="20"]');
    for (const svg of svgButtons) {
      const button = svg.closest('button');
      if (button && button.textContent && button.textContent.includes(BUTTON_TEXT_TO_HIDE)) {
        button.style.display = 'none !important';
        console.log(`[aiTools] 通过SVG图标隐藏了 "${BUTTON_TEXT_TO_HIDE}" 按钮`);
        found = true;
      }
    }

    return found;
  }

  /**
   * 添加CSS样式来隐藏按钮（作为备用方案）
   */
  function addHideButtonCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* 隐藏包含"询问 ChatGPT"文本的按钮 */
      button:has(span:contains("询问 ChatGPT")) {
        display: none !important;
      }
      /* 备用选择器 */
      button.btn.btn-secondary.shadow-long:has(span:contains("询问 ChatGPT")) {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    console.log('[aiTools] 已添加CSS样式来隐藏按钮');
  }

  // 初始化函数
  function init() {
    // 立即尝试隐藏按钮
    findAndHideButton();

    // 添加CSS样式作为备用
    addHideButtonCSS();

    // 设置MutationObserver监控动态内容
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          // 检查是否有新的按钮元素被添加
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'BUTTON' || node.querySelector('button')) {
                shouldCheck = true;
                break;
              }
            }
          }
        }
        if (shouldCheck) break;
      }

      if (shouldCheck) {
        // 延迟一点执行，确保DOM完全更新
        setTimeout(findAndHideButton, 100);
      }
    });

    // 开始观察
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('[aiTools] ChatGPT 按钮隐藏功能已启动');
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