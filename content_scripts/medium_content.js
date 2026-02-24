// 处理 https://medium.com/* 的文本选择菜单隐藏逻辑

(function () {
  "use strict";

  // 获取配置
  async function getConfig() {
    if (typeof AIToolsUtils !== 'undefined') {
      return await AIToolsUtils.getSettings();
    }
    return null;
  }

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

    if (document.head) {
      document.head.appendChild(style);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.head.appendChild(style);
      });
    }
  }

  // 使用MutationObserver监控动态添加的菜单元素
  function observeAndHideMenus() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
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
            }

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
            }
          }
        });
      });
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
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
    });
  }

  // 主初始化函数
  async function init() {
    const config = await getConfig();
    
    // 如果站点被禁用或特定功能被禁用，则跳过
    if (config && config.enabled === false) return;
    if (config && config.features?.hideFloat?.enabled === false) return;

    addHideMenuStyles();
    hideExistingMenus();
    observeAndHideMenus();
  }

  // 监听配置更新
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === "SETTINGS_UPDATED") {
        location.reload();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      hideExistingMenus();
    }, 1000);
  });
})();
