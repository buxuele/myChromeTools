// 处理 https://i.pinimg.com/* 的原图地址改写与图片下载

(function () {
  "use strict";

  const DOWNLOADED_KEY = "downloadedUrls";
  const DOWNLOADED_LIMIT = 100;
  // 只在窗口期内去重，防止同页重复触发，窗口之外重新打开仍然下载
  const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

  let downloadStarted = false;

  function toOriginalUrl(url) {
    return url.replace("/736x/", "/originals/").replace("/1200x/", "/originals/");
  }

  function normalizeEntry(item) {
    return typeof item === "string" ? { url: item, at: 0 } : item;
  }

  async function readDownloaded() {
    const stored = await chrome.storage.local.get(DOWNLOADED_KEY);
    return (stored[DOWNLOADED_KEY] || []).map(normalizeEntry).filter((item) => item && item.url);
  }

  async function recentlyDownloaded(url) {
    const list = await readDownloaded();
    const hit = list.find(
      (item) => item.url === url && Date.now() - item.at < DEDUPE_WINDOW_MS
    );
    return hit ? Date.now() - hit.at : 0;
  }

  async function markDownloaded(url) {
    const list = (await readDownloaded()).filter(
      (item) => item.url !== url && Date.now() - item.at < DEDUPE_WINDOW_MS
    );
    await chrome.storage.local.set({
      [DOWNLOADED_KEY]: [{ url, at: Date.now() }, ...list].slice(0, DOWNLOADED_LIMIT)
    });
  }

  function requestDownload(url) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "download", url }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("[aiTools] 下载消息发送失败:", chrome.runtime.lastError);
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
    if (!img || !img.src) {
      console.log("[aiTools] 页面上没有找到图片节点");
      return;
    }

    const url = img.src;
    const elapsed = await recentlyDownloaded(url);
    if (elapsed > 0) {
      console.log(
        "[aiTools] 十分钟内已下载过，跳过，剩余",
        Math.ceil((DEDUPE_WINDOW_MS - elapsed) / 60000),
        "分钟:",
        url
      );
      return;
    }

    downloadStarted = true;
    console.log("[aiTools] 请求下载原图:", url);
    const success = await requestDownload(url);
    if (success) {
      await markDownloaded(url);
      console.log("[aiTools] 图片下载已触发");
    } else {
      downloadStarted = false;
      console.log("[aiTools] 下载未成功，已放开重试");
    }
  }

  async function apply() {
    const config = await AIToolsUtils.getSettings();

    if (config && config.enabled === false) {
      console.log("[aiTools] Pinterest 站点开关已关闭，自动下载停用");
      return;
    }
    if (config && config.features?.originalImage?.enabled === false) {
      console.log("[aiTools] 下载原图子开关已关闭，自动下载停用");
      return;
    }

    const href = window.location.href;

    // 配置检查通过后再改写地址，关闭开关时不再强制跳转
    if (href.includes("/736x/") || href.includes("/1200x/")) {
      console.log("[aiTools] 地址改写为原图:", toOriginalUrl(href));
      window.location.replace(toOriginalUrl(href));
      return;
    }

    if (!href.includes("/originals/")) {
      console.log("[aiTools] 地址不含 736x、1200x、originals，不做处理:", href);
      return;
    }

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
