


// 统一的消息处理器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Pinterest 图片下载
  if (request.action === "download") {
    chrome.downloads.download({
      url: request.url,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error("下载失败:", chrome.runtime.lastError);
        sendResponse({ success: false });
      } else {
        sendResponse({ success: true });
      }
    });
    return true; // 保持消息通道开放
  }


});
