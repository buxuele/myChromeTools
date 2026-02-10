// 处理 https://medium.com/* 的文本选择菜单隐藏逻辑

(function () {
  "use strict";

  // 隐藏Medium文本选择菜单的CSS样式
  function addHideMenuStyles() {
    const style = document.createElement("style");
    style.id = "medium-hide-selection-menu";
    style.textContent = `
      /* 隐藏Medium文本选择弹出菜单 */
      div[class*="eo o ady ff adz aea aeb"],
      div[data-popper-reference-hidden],
      div[data-popper-escaped],
      div[data-popper-placement] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      
      /* 更具体的选择器，针对包含强调、回应、分享、私人笔记按钮的容器 */
      div[tabindex="-1"] > div[style*="position: absolute"] {
        display: none !important;
      }
      
      /* 隐藏包含这些按钮文本的容器 */
      div:has(p:contains("强调")),
      div:has(p:contains("回应")),
      div:has(p:contains("分享")),
      div:has(p:contains("私人笔记")) {
        display: none !important;
      }
    `;

    // 将样式添加到head中
    if (document.head) {
      document.head.appendChild(style);
      console.log("Medium文本选择菜单隐藏样式已添加");
    } else {
      // 如果head还没准备好，等待DOM加载
      document.addEventListener("DOMContentLoaded", () => {
        document.head.appendChild(style);
        console.log("Medium文本选择菜单隐藏样式已添加 (DOMContentLoaded)");
      });
    }
  }

  // 使用MutationObserver监控动态添加的菜单元素
  function observeAndHideMenus() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 检查是否是文本选择菜单容器
            if (
              node.classList &&
              (node.classList.contains("eo") ||
                node.hasAttribute("data-popper-reference-hidden") ||
                node.hasAttribute("data-popper-escaped") ||
                node.hasAttribute("data-popper-placement"))
            ) {
              node.style.display = "none";
              node.style.visibility = "hidden";
              node.style.opacity = "0";
              node.style.pointerEvents = "none";
              console.log("动态隐藏了Medium文本选择菜单");
            }

            // 检查子元素中是否包含菜单
            const menuElements =
              node.querySelectorAll &&
              node.querySelectorAll(
                [
                  'div[class*="eo o ady ff adz aea aeb"]',
                  "div[data-popper-reference-hidden]",
                  "div[data-popper-escaped]",
                  "div[data-popper-placement]",
                ].join(",")
              );

            if (menuElements && menuElements.length > 0) {
              menuElements.forEach((menu) => {
                menu.style.display = "none";
                menu.style.visibility = "hidden";
                menu.style.opacity = "0";
                menu.style.pointerEvents = "none";
              });
              console.log(
                `动态隐藏了${menuElements.length}个Medium文本选择菜单元素`
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

    console.log("Medium文本选择菜单监控已启动");

    // 10秒后停止监控以避免性能问题
    setTimeout(() => {
      observer.disconnect();
      console.log("Medium文本选择菜单监控已停止");
    }, 10000);
  }

  // 立即隐藏已存在的菜单元素
  function hideExistingMenus() {
    const selectors = [
      'div[class*="eo o ady ff adz aea aeb"]',
      "div[data-popper-reference-hidden]",
      "div[data-popper-escaped]",
      "div[data-popper-placement]",
      'div[tabindex="-1"] > div[style*="position: absolute"]',
    ];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        element.style.display = "none";
        element.style.visibility = "hidden";
        element.style.opacity = "0";
        element.style.pointerEvents = "none";
      });
      if (elements.length > 0) {
        console.log(
          `隐藏了${elements.length}个现有的Medium文本选择菜单元素 (${selector})`
        );
      }
    });
  }

  // 初始化函数
  function init() {
    // 添加CSS样式
    addHideMenuStyles();

    // 隐藏现有菜单
    hideExistingMenus();

    // 开始监控新菜单
    observeAndHideMenus();

    console.log("Medium文本选择菜单隐藏功能已初始化");
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
      hideExistingMenus();
      console.log("页面加载完成后再次隐藏Medium文本选择菜单");
    }, 1000);
  });
})();
