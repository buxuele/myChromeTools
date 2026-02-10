(function () {
  "use strict";

  /**
   * 添加CSS样式隐藏 Perplexity 的浮动按钮
   */
  function addHideButtonStyles() {
    const style = document.createElement("style");
    style.id = "perplexity-hide-floating-buttons";
    style.textContent = `
      /* 隐藏 Perplexity 的浮动按钮容器 */
      div.absolute.z-\\[5\\] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;

    if (document.head) {
      document.head.appendChild(style);
      console.log("[aiTools] Perplexity 浮动按钮隐藏样式已添加");
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.head.appendChild(style);
        console.log(
          "[aiTools] Perplexity 浮动按钮隐藏样式已添加 (DOMContentLoaded)"
        );
      });
    }
  }

  /**
   * 隐藏已存在的浮动按钮元素
   */
  function hideExistingButtons() {
    const buttons = document.querySelectorAll("div.absolute.z-\\[5\\]");

    buttons.forEach((button) => {
      button.style.display = "none";
      button.style.visibility = "hidden";
      button.style.opacity = "0";
      button.style.pointerEvents = "none";
    });

    if (buttons.length > 0) {
      console.log(`[aiTools] 隐藏了 ${buttons.length} 个 Perplexity 浮动按钮`);
    }
  }

  /**
   * 使用 MutationObserver 监控动态添加的按钮
   */
  function observeAndHideButtons() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 检查节点本身是否是目标元素
            if (
              node.classList &&
              node.classList.contains("absolute") &&
              node.classList.contains("z-[5]")
            ) {
              node.style.display = "none";
              node.style.visibility = "hidden";
              node.style.opacity = "0";
              node.style.pointerEvents = "none";
              console.log("[aiTools] 动态隐藏了 Perplexity 浮动按钮");
            }

            // 检查子元素中是否包含目标元素
            const buttons =
              node.querySelectorAll &&
              node.querySelectorAll("div.absolute.z-\\[5\\]");

            if (buttons && buttons.length > 0) {
              buttons.forEach((button) => {
                button.style.display = "none";
                button.style.visibility = "hidden";
                button.style.opacity = "0";
                button.style.pointerEvents = "none";
              });
              console.log(
                `[aiTools] 动态隐藏了 ${buttons.length} 个 Perplexity 浮动按钮`
              );
            }
          }
        });
      });
    });

    // 开始观察
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    console.log("[aiTools] Perplexity 浮动按钮监控已启动");

    // 10秒后停止监控以避免性能问题
    setTimeout(() => {
      observer.disconnect();
      console.log("[aiTools] Perplexity 浮动按钮监控已停止");
    }, 10000);
  }

  /**
   * 初始化函数
   */
  function init() {
    // 添加CSS样式
    addHideButtonStyles();

    // 隐藏现有按钮
    hideExistingButtons();

    // 开始监控新按钮
    observeAndHideButtons();

    console.log("[aiTools] Perplexity 浮动按钮隐藏功能已初始化");
  }

  // 根据页面加载状态执行初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // 页面完全加载后再次检查
  window.addEventListener("load", () => {
    setTimeout(() => {
      hideExistingButtons();
      console.log("[aiTools] 页面加载完成后再次隐藏 Perplexity 浮动按钮");
    }, 1000);
  });
})();
