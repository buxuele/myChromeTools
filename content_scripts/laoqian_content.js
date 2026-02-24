// 为 lao-qian.hxwk.org 应用暗色阅读背景

(function () {
  "use strict";

  async function getConfig() {
    if (typeof AIToolsUtils !== 'undefined') {
      return await AIToolsUtils.getSettings();
    }
    return null;
  }

  function applyDarkBackground() {
    const el = document.querySelector('#content[role="main"]');
    
    if (!el) {
      console.warn('[aiTools] 没找到 #content[role="main"]');
      return;
    }
    
    el.style.backgroundColor = '#91b3b5';
  }

  async function init() {
    const config = await getConfig();
    
    if (config && config.enabled === false) return;
    
    applyDarkBackground();
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
    setTimeout(applyDarkBackground, 100);
  });
})();
