// 处理 https://i.pinimg.com/* 的 URL 修改和图片下载逻辑。

(function () {
  "use strict";

  async function getConfig() {
    if (typeof AIToolsUtils !== 'undefined') {
      return await AIToolsUtils.getSettings();
    }
    return null;
  }

  let newUrl = window.location.href;
  let urlChanged = false;
  
  if (newUrl.includes('/736x/')) {
    newUrl = newUrl.replace('/736x/', '/originals/');
    urlChanged = true;
  } else if (newUrl.includes('/1200x/')) {
    newUrl = newUrl.replace('/1200x/', '/originals/');
    urlChanged = true;
  }

  if (urlChanged) {
    window.location.replace(newUrl);
  }

  if (newUrl.includes('/originals/')) {
    function triggerDownload() {
      const img = document.querySelector('img');
      if (img && img.src) {
        chrome.runtime.sendMessage(
          {
            action: 'download',
            url: img.src
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('[aiTools] 消息发送失败:', chrome.runtime.lastError);
              return;
            }
            if (response && response.success) {
              console.log('[aiTools] 图片下载已触发');
            }
          }
        );
        return true;
      }
      return false;
    }

    async function init() {
      const config = await getConfig();
      
      if (config && config.enabled === false) return;
      if (config && config.features?.originalImage?.enabled === false) return;

      window.addEventListener('load', () => {
        if (triggerDownload()) {
          console.log('[aiTools] 下载在 load 事件中触发');
        }
      });

      const observer = new MutationObserver((mutations, obs) => {
        if (triggerDownload()) {
          obs.disconnect();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
      }, 5000);
    }

    init();
  }
})();
