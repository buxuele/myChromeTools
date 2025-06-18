
(function () {
  "use strict";

  // --- 配置 ---
  const SAVE_BUTTON_SELECTOR = 'button[aria-label="Save prompt"]'; // **修正：这是保存按钮的选择器**
  // 备选选择器 (如果上面的失效): 'button[data-test-manual-save="outside"]' 或包含 'save-button' 类的按钮
  const CLICK_INTERVAL_MS = 30000; // 30秒
  // --- 结束配置 ---

  let intervalId = null; // 用于存储 setInterval 的 ID，方便之后清除

  /**
   * 检查按钮是否准备好被点击 (存在、未禁用、可见)
   * @param {Element} buttonElement - 要检查的按钮元素
   * @returns {boolean} - 如果按钮可点击则返回 true
   */
  function isButtonReadyToClick(buttonElement) {
    if (!buttonElement) {
      // console.log(`Log: Button with selector "${SAVE_BUTTON_SELECTOR}" not found in DOM yet.`);
      return false; // 按钮不存在
    }
    // 检查按钮是否被禁用
    if (buttonElement.disabled) {
      console.log(`Log: SAVE button (${SAVE_BUTTON_SELECTOR}) found, but it is disabled.`);
      return false;
    }
    // 检查按钮是否可见
    const rect = buttonElement.getBoundingClientRect();
    if (
      buttonElement.offsetParent === null || // 元素或其祖先 display: none
      rect.width === 0 ||                   // 宽度为0
      rect.height === 0                     // 高度为0
    ) {
      console.log(`Log: SAVE button (${SAVE_BUTTON_SELECTOR}) found, but it is not visible (offsetParent is null or dimensions are zero).`);
      return false;
    }
    // 你还可以添加其他条件，例如检查特定的class来判断是否可点击
    // if (buttonElement.classList.contains('some-inactive-class')) {
    //     console.log('Log: SAVE button found, but has an inactive class.');
    //     return false;
    // }
    return true;
  }

  /**
   * 尝试查找并点击保存按钮
   */
  function attemptClick() {
    console.log(`Log: Attempting to find SAVE button with selector: "${SAVE_BUTTON_SELECTOR}"`);
    const saveButton = document.querySelector(SAVE_BUTTON_SELECTOR);

    if (isButtonReadyToClick(saveButton)) {
      console.log(`Log: SAVE button (${SAVE_BUTTON_SELECTOR}) found and is clickable. Clicking now!`);
      saveButton.click();
      console.log(`Log: SAVE button (${SAVE_BUTTON_SELECTOR}) successfully clicked.`); // **点击后增加的日志**

      // 可选：如果点击后希望停止定时器，可以在这里清除
      // stopAutoClick();
      // console.log('Log: SAVE button clicked. Auto-clicker stopped.');
    } else if (saveButton) {
      // 按钮存在但不可点击，isButtonReadyToClick 内部已经打印了原因
      // console.log(`Log: SAVE button (${SAVE_BUTTON_SELECTOR}) found, but it's not in a clickable state (e.g., disabled or not visible). Check previous logs from isButtonReadyToClick.`);
    } else {
      // 按钮未找到，isButtonReadyToClick 返回 false 前，此日志更早出现
      console.log(`Log: SAVE button with selector "${SAVE_BUTTON_SELECTOR}" was NOT found in the DOM.`);
    }
  }

  /**
   * 启动自动点击定时器
   */
  function startAutoClick() {
    if (intervalId !== null) {
      console.log("Log: Auto-clicker for SAVE button is already running.");
      return;
    }
    console.log(
      `Log: Starting auto-clicker for SAVE button. Will attempt to click every ${
        CLICK_INTERVAL_MS / 1000
      } seconds.`
    );
    // 立即执行一次，然后设置定时器
    attemptClick(); // 确保启动时立即尝试一次
    intervalId = setInterval(attemptClick, CLICK_INTERVAL_MS);
  }

  /**
   * 停止自动点击定时器
   */
  function stopAutoClick() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
      console.log("Log: Auto-clicker for SAVE button stopped.");
    } else {
      console.log("Log: Auto-clicker for SAVE button is not running (cannot stop).");
    }
  }

  // --- 脚本启动逻辑 ---
  // 确保页面加载完毕后再启动，避免元素还未渲染
  if (document.readyState === "loading") {
    console.log("Log: Document is loading. Waiting for DOMContentLoaded.");
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Log: DOMContentLoaded event fired. Starting auto-clicker.");
        startAutoClick();
    });
  } else {
    console.log("Log: Document already loaded. Starting auto-clicker immediately.");
    startAutoClick();
  }

  // 2. 或者，你可以暴露函数到 window 对象，以便在控制台手动控制 (用于测试和调试)
  // window.geminiAutoSaver = { start: startAutoClick, stop: stopAutoClick };
  // console.log('Log: To control from console, use: window.geminiAutoSaver.start() and window.geminiAutoSaver.stop()');

})();