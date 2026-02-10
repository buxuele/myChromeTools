(function () {
  "use strict";

  /**
   * 查找并自动勾选隐私政策 checkbox
   * @returns {boolean} - 如果找到并勾选了 checkbox，则返回 true
   */
  function autoCheckPrivacyConsent() {
    // 根据提供的HTML结构查找 checkbox
    const checkbox = document.querySelector(
      '#demo-human[type="checkbox"][name="demo-human"]'
    );

    if (checkbox && !checkbox.checked) {
      // 勾选 checkbox
      checkbox.checked = true;

      // 触发 change 事件，确保 Angular 应用能够检测到变化
      const changeEvent = new Event("change", { bubbles: true });
      checkbox.dispatchEvent(changeEvent);

      // 触发 click 事件作为备用
      const clickEvent = new Event("click", { bubbles: true });
      checkbox.dispatchEvent(clickEvent);

      console.log("[aiTools] 已自动勾选隐私政策 checkbox");
      return true;
    } else if (checkbox && checkbox.checked) {
      console.log("[aiTools] 隐私政策 checkbox 已经被勾选");
      return true;
    } else {
      console.log("[aiTools] 未找到隐私政策 checkbox");
      return false;
    }
  }

  /**
   * 使用多种策略查找 checkbox（备用方案）
   */
  function findCheckboxWithFallback() {
    // 策略1: 通过 ID 查找
    let checkbox = document.querySelector("#demo-human");
    if (checkbox && checkbox.type === "checkbox") {
      return checkbox;
    }

    // 策略2: 通过 name 属性查找
    checkbox = document.querySelector(
      'input[name="demo-human"][type="checkbox"]'
    );
    if (checkbox) {
      return checkbox;
    }

    // 策略3: 通过 ng-model 属性查找
    checkbox = document.querySelector(
      'input[ng-model="privacyConsent"][type="checkbox"]'
    );
    if (checkbox) {
      return checkbox;
    }

    // 策略4: 通过包含隐私政策文本的 label 查找相关 checkbox
    const labels = document.querySelectorAll("label");
    for (const label of labels) {
      const text = label.textContent || "";
      if (
        text.includes("data policy") ||
        text.includes("privacy") ||
        text.includes("IP addresses")
      ) {
        const forAttr = label.getAttribute("for");
        if (forAttr) {
          checkbox = document.querySelector(`#${forAttr}`);
          if (checkbox && checkbox.type === "checkbox") {
            return checkbox;
          }
        }

        // 查找 label 内部的 checkbox
        checkbox = label.querySelector('input[type="checkbox"]');
        if (checkbox) {
          return checkbox;
        }
      }
    }

    return null;
  }

  /**
   * 执行自动勾选操作（使用备用策略）
   */
  function autoCheckWithFallback() {
    const checkbox = findCheckboxWithFallback();

    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;

      // 触发多种事件确保兼容性
      const events = ["change", "click", "input"];
      events.forEach((eventType) => {
        const event = new Event(eventType, { bubbles: true });
        checkbox.dispatchEvent(event);
      });

      // 如果是 Angular 应用，尝试触发 Angular 特定的事件
      if (window.angular) {
        const scope = window.angular.element(checkbox).scope();
        if (scope) {
          scope.$apply(() => {
            scope.privacyConsent = true;
          });
        }
      }

      console.log("[aiTools] 已通过备用策略自动勾选隐私政策 checkbox");
      return true;
    } else if (checkbox && checkbox.checked) {
      console.log("[aiTools] 隐私政策 checkbox 已经被勾选");
      return true;
    }

    return false;
  }

  /**
   * 初始化函数
   */
  function init() {
    console.log("[aiTools] Speed Measurement Lab 自动勾选功能已启动");

    // 立即尝试勾选
    let success = autoCheckPrivacyConsent();

    if (!success) {
      // 如果第一次尝试失败，使用备用策略
      success = autoCheckWithFallback();
    }

    // 如果仍然失败，设置 MutationObserver 监控页面变化
    if (!success) {
      const observer = new MutationObserver((mutations, obs) => {
        let shouldTry = false;

        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // 检查是否添加了包含 checkbox 的元素
                if (
                  node.querySelector &&
                  (node.querySelector("#demo-human") ||
                    node.querySelector('input[type="checkbox"]') ||
                    node.querySelector('input[ng-model="privacyConsent"]'))
                ) {
                  shouldTry = true;
                  break;
                }

                // 检查节点本身是否是目标 checkbox
                if (
                  node.id === "demo-human" ||
                  (node.type === "checkbox" && node.name === "demo-human")
                ) {
                  shouldTry = true;
                  break;
                }
              }
            }
          }
        }

        if (shouldTry) {
          setTimeout(() => {
            const success =
              autoCheckPrivacyConsent() || autoCheckWithFallback();
            if (success) {
              // 成功后停止监控
              obs.disconnect();
              console.log("[aiTools] 自动勾选成功，停止监控");
            }
          }, 100);
        }
      });

      // 开始监控
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
      });

      // 10秒后停止监控，避免性能问题
      setTimeout(() => {
        observer.disconnect();
        console.log("[aiTools] 监控超时，停止监控");
      }, 10000);
    }
  }

  // 等待页面加载
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // 页面完全加载后再次尝试
  window.addEventListener("load", () => {
    setTimeout(() => {
      autoCheckPrivacyConsent() || autoCheckWithFallback();
    }, 1000);
  });
})();
