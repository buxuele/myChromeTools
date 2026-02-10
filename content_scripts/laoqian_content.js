// 为 lao-qian.hxwk.org 应用暗色阅读背景

(function () {
  "use strict";

  function applyDarkBackground() {
    const el = document.querySelector('#content[role="main"]');
    
    if (!el) {
      console.warn('没找到 #content[role="main"]，可能页面结构变了');
      return;
    }
    
    el.style.backgroundColor = '#91b3b5';
    console.log('已应用暗色阅读背景');
  }

  // 根据页面加载状态执行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyDarkBackground);
  } else {
    applyDarkBackground();
  }

  // 页面完全加载后再次应用，确保样式生效
  window.addEventListener("load", () => {
    setTimeout(applyDarkBackground, 100);
  });
})();
