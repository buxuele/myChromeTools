// 监听快捷键 
chrome.commands.onCommand.addListener((command) => {
  if (command === "insert-text") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "insertText" });
    });
  }
});



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'download') {
      chrome.downloads.download({
        url: request.url,
        saveAs: false // 使用浏览器默认下载行为
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error('下载失败:', chrome.runtime.lastError);
          sendResponse({ success: false });
        } else {
          sendResponse({ success: true });
        }
      });
      return true; // 保持消息通道开放以发送响应
    }
  });