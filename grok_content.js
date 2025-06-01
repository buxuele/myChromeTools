(function () {


  // 现有功能：点击专注模式按钮
  function clickFocusButton() {
    const focusButton =
      document.querySelector('button[aria-label="专注模式"]') ||
      document.querySelector('button.r-1phboty.r-10v3vxq');
    if (focusButton) {
      focusButton.click();
      console.log('专注模式按钮已点击');
      return true;
    } else {
      console.log('专注模式按钮未找到');
      return false;
    }
  }

  // 现有功能：调整输入框
  function adjustInputBox() {
    const textarea = document.querySelector('textarea.r-30o5oe');
    if (textarea) {
      textarea.style.height = '86px';
      textarea.focus();
      console.log('输入框高度已调整为 86px 并聚焦');
      return true;
    } else {
      console.log('输入框未找到');
      return false;
    }
  }

   
   

  // 初始化现有功能
  let focusButtonClicked = clickFocusButton();
  if (focusButtonClicked) {
    adjustInputBox();
  }

  // 增强 MutationObserver，监控复制按钮和回答内容的动态加载
  const observer = new MutationObserver((mutations, obs) => {
    // 检查专注模式和输入框
    if (!focusButtonClicked && clickFocusButton()) {
      focusButtonClicked = true;
      adjustInputBox();
    } else if (focusButtonClicked && adjustInputBox()) {
      // 仅在完成专注模式和输入框调整后停止监控这两部分
      console.log('专注模式和输入框调整完成');
    }

    

  });

  // 监控整个页面，捕获动态加载的元素
  const container = document.querySelector('.css-175oi2r') || document.body;
  observer.observe(container, { childList: true, subtree: true });

  // 10 秒后停止监控，避免性能问题
  setTimeout(() => {
    observer.disconnect();
    console.log('停止监控，未完成所有操作');
  }, 10000);
})();