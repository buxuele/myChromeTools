// 处理 https://i.pinimg.com/* 的原图地址改写与图片下载

(function () {
  "use strict";

  const DOWNLOADED_KEY = "downloadedUrls";
  const DOWNLOADED_LIMIT = 100;

  let downloadStarted = false;

  function toOriginalUrl(url) {
    return url.replace("/736x/", "/originals/").replace("/1200x/", "/originals/");
  }

  async function hasDownloaded(url) {
    const stored = await chrome.storage.local.get(DOWNLOADED_KEY);
    return (stored[DOWNLOADED_KEY] || []).includes(url);
  }

  async function markDownloaded(url) {
    const stored = await chrome.storage.local.get(DOWNLOADED_KEY);
    const list = stored[DOWNLOADED_KEY] || [];
    await chrome.storage.local.set({
      [DOWNLOADED_KEY]: [url, ...list.filter((item) => item !== url)].slice(0, DOWNLOADED_LIMIT)
    });
  }

  function requestDownload(url) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "download", url }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("[aiTools] 消息发送失败:", chrome.runtime.lastError);
          resolve(false);
          return;
        }
        resolve(!!(response && response.success));
      });
    });
  }

  async function downloadFirstImage() {
    if (downloadStarted) return;

    const img = document.querySelector("img");
    if (!img || !img.src) return;

    const url = img.src;
    if (await hasDownloaded(url)) {
      console.log("[aiTools] 该图片已下载过，跳过:", url);
      return;
    }

    downloadStarted = true;
    const success = await requestDownload(url);
    if (success) {
      await markDownloaded(url);
      console.log("[aiTools] 图片下载已触发");
    } else {
      downloadStarted = false;
    }
  }

  function isEnabled(config) {
    return !(config && config.enabled === false) && !(config && config.features?.originalImage?.enabled === false);
  }

  async function apply() {
    const config = await AIToolsUtils.getSettings();
    if (!isEnabled(config)) return;

    // 配置检查通过后再改写地址，关闭开关时不再强制跳转
    if (window.location.href.includes("/736x/") || window.location.href.includes("/1200x/")) {
      window.location.replace(toOriginalUrl(window.location.href));
      return;
    }

    if (!window.location.href.includes("/originals/")) return;

    window.addEventListener("load", downloadFirstImage);

    const observer = new MutationObserver((mutations, obs) => {
      downloadFirstImage().then(() => {
        if (downloadStarted) obs.disconnect();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => observer.disconnect(), 5000);
  }

  AIToolsUtils.onSettingsChanged(() => {
    downloadStarted = false;
    apply();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
