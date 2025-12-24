(function () {
  "use strict";

  // 获取当前亮度值
  function getCurrentBrightness() {
    return parseFloat(localStorage.getItem("aitools_brightness") || "1.0");
  }

  // 设置亮度值
  function setBrightness(brightness) {
    localStorage.setItem("aitools_brightness", brightness.toString());
    applyBrightness(brightness);
  }

  // 应用亮度到页面
  function applyBrightness(brightness) {
    let style = document.getElementById("aitools-brightness-controller");

    if (!style) {
      style = document.createElement("style");
      style.id = "aitools-brightness-controller";
      document.head.appendChild(style);
    }

    style.textContent = `
      /* 通用文字亮度控制 */
      p, span, div, h1, h2, h3, h4, h5, h6, 
      a, button, input, textarea, label, 
      li, td, th, blockquote, pre, code,
      .text, .content, .article, .post {
        filter: brightness(${brightness}) !important;
      }
    `;
  }

  // 降低亮度 1%
  function decreaseBrightness() {
    const current = getCurrentBrightness();
    const newBrightness = Math.max(0.1, current - 0.01); // 最低10%亮度
    setBrightness(newBrightness);
    return newBrightness;
  }

  // 增加亮度 1%
  function increaseBrightness() {
    const current = getCurrentBrightness();
    const newBrightness = Math.min(2.0, current + 0.01); // 最高200%亮度
    setBrightness(newBrightness);
    return newBrightness;
  }

  // 重置亮度
  function resetBrightness() {
    setBrightness(1.0);
    return 1.0;
  }

  // 监听来自popup的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "decreaseBrightness") {
      const newBrightness = decreaseBrightness();
      sendResponse({ brightness: newBrightness });
    } else if (request.action === "increaseBrightness") {
      const newBrightness = increaseBrightness();
      sendResponse({ brightness: newBrightness });
    } else if (request.action === "resetBrightness") {
      const newBrightness = resetBrightness();
      sendResponse({ brightness: newBrightness });
    } else if (request.action === "getBrightness") {
      sendResponse({ brightness: getCurrentBrightness() });
    }
  });

  // 页面加载时应用保存的亮度
  function init() {
    const savedBrightness = getCurrentBrightness();
    applyBrightness(savedBrightness);
  }

  // 初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
