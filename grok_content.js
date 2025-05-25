// 处理 https://x.com/i/grok 的专注模式按钮点击和输入框调整逻辑。


(function () {
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
  
    let focusButtonClicked = clickFocusButton();
    if (focusButtonClicked) {
      adjustInputBox();
    }
  
    const observer = new MutationObserver((mutations, obs) => {
      if (!focusButtonClicked && clickFocusButton()) {
        focusButtonClicked = true;
        adjustInputBox();
      } else if (focusButtonClicked && adjustInputBox()) {
        obs.disconnect();
      }
    });
  
    const container = document.querySelector('.css-175oi2r') || document.body;
    observer.observe(container, { childList: true, subtree: true });
  
    setTimeout(() => {
      observer.disconnect();
      console.log('停止监控，未完成所有操作');
    }, 5000);
  })();