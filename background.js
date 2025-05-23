// 监听快捷键
chrome.commands.onCommand.addListener((command) => {
  if (command === "insert-text") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // 检查是否有错误
      if (chrome.runtime.lastError) {
        console.error("查询标签失败:", chrome.runtime.lastError);
        return;
      }
      // 检查是否找到活动标签
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "insertText" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("发送消息失败:", chrome.runtime.lastError);
          }
        });
      } else {
        console.error("未找到活动标签");
      }
    });
  }
});

// 下载逻辑保持不变
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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