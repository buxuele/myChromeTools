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

  // 新功能：自定义 HTML 到 Markdown 转换
  function htmlToMarkdown(html) {
    // 清理 HTML，移除不必要的嵌套 span
    let cleanedHtml = html.replace(/<span[^>]*>(.*?)<\/span>/gi, '$1');
    return cleanedHtml
      .replace(/<div[^>]*class="[^"]*r-adyw6z[^"]*"[^>]*>(.*?)<\/div>/gi, '## $1\n\n') // 标题
      .replace(/<div[^>]*class="[^"]*r-b88u0q[^"]*"[^>]*>(.*?)<\/div>/gi, '**$1**') // 加粗
      .replace(/<div[^>]*class="[^"]*r-1qd0xha[^"]*"[^>]*>(.*?)<\/div>/gi, '$1\n\n') // 段落
      .replace(/<br\s*\/?>/gi, '\n') // 换行
      .replace(/<\/?[^>]+>/gi, '') // 移除其他标签
      .replace(/\n{3,}/g, '\n\n') // 清理多余空行
      .trim();
  }

  // 新功能：处理复制按钮点击
  function copyAsMarkdown(event) {
    const copyButton = event.target.closest('button[aria-label="复制文本"]');
    if (!copyButton) return; // 确保点击的是复制按钮

    // 定位回答容器（基于提供的 XPath 和 DOM 结构）
    const answerContainer = copyButton.closest('div.css-175oi2r.r-1awozwy.r-16lk18l.r-13qz1uu');
    if (!answerContainer) {
      console.log('未找到 Grok 回答容器');
      return;
    }

    // 提取回答内容的 HTML
    const answerElements = answerContainer.querySelectorAll('div.css-146c3p1');
    if (!answerElements.length) {
      console.log('未找到回答内容元素');
      return;
    }

    // 拼接所有回答内容的 HTML
    let answerHtml = '';
    answerElements.forEach(el => {
      answerHtml += el.outerHTML;
    });

    // 转换为 Markdown
    const markdownContent = htmlToMarkdown(answerHtml);

    // 写入剪贴板
    navigator.clipboard.writeText(markdownContent).then(() => {
      console.log('已将 Markdown 格式内容复制到剪贴板');
      showToast('已复制为 Markdown 格式');
    }).catch(err => {
      console.error('复制到剪贴板失败:', err);
    });

    // 阻止默认复制行为
    event.preventDefault();
    event.stopPropagation();
  }

  // 显示复制成功的提示
  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; background: #333; color: #fff;
      padding: 10px 20px; border-radius: 5px; z-index: 1000;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
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

    // 检查复制按钮是否出现
    const copyButton = document.querySelector('button[aria-label="复制文本"]');
    if (copyButton && !document.body.dataset.copyListenerAdded) {
      document.addEventListener('click', copyAsMarkdown, { capture: true });
      document.body.dataset.copyListenerAdded = 'true'; // 防止重复绑定
      console.log('已为复制按钮添加事件监听');
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