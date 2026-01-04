(function () {
  "use strict";

  /**
   * 隐藏选中文本时弹出的浮动操作栏（复制、喜欢、评论等）
   */
  function hideFloatingBar() {
    const style = document.createElement("style");
    style.id = "zhihu-hide-floating-bar";
    style.textContent = `
      /* 隐藏选中文本时的浮动操作栏 */
      .css-1jg5yfb,
      .css-fg13ww,
      .css-15eh6e9,
      /* 通用选择器：包含复制、喜欢、评论图标的浮动栏 */
      div:has(> .css-fg13ww),
      div:has(.ZDI--Repeat24):has(.ZDI--Heart24):has(.ZDI--ChatBubble24) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    if (!document.getElementById("zhihu-hide-floating-bar")) {
      document.head.appendChild(style);
    }
  }

  /**
   * 从 ContentItem-time 元素中提取发布时间并显示在作者信息区域
   */
  function showPublishDate() {
    // 查找发布时间元素
    const timeElement = document.querySelector(".ContentItem-time");
    if (!timeElement) {
      return false;
    }

    // 查找关注按钮
    const followButton = document.querySelector(".Post-Author .FollowButton");
    if (!followButton) {
      return false;
    }

    // 检查是否已经添加过
    if (document.getElementById("zhihu-publish-date-display")) {
      return true;
    }

    // 获取时间文本
    const timeText = timeElement.textContent?.trim() || "";
    if (!timeText) {
      return false;
    }

    // 创建显示元素
    const dateDisplay = document.createElement("span");
    dateDisplay.id = "zhihu-publish-date-display";
    dateDisplay.style.cssText = `
      padding: 4px 10px;
      margin-right: 12px;
      background: #f6f6f6;
      border-radius: 4px;
      font-size: 13px;
      color: #646464;
    `;
    dateDisplay.textContent = timeText;

    // 插入到关注按钮之前
    followButton.parentNode.insertBefore(dateDisplay, followButton);
    console.log("[aiTools] 知乎发布时间已显示:", timeText);
    return true;
  }

  function init() {
    // 隐藏浮动操作栏
    hideFloatingBar();

    // 尝试立即执行
    if (showPublishDate()) return;

    // 等待 DOM 加载
    const observer = new MutationObserver(() => {
      if (showPublishDate()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    // 10秒后停止监控
    setTimeout(() => observer.disconnect(), 10000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
