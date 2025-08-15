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
 


// 下载逻辑
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





// 监听来自 content_script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadImage") {
    const imageUrl = request.url;
    const finalFilename = `reddit_imgs/${request.filename}`; // 组合文件夹和文件名

    console.log('后台收到下载请求:', imageUrl);
    console.log('目标文件路径:', finalFilename);

    // 1. 搜索下载项，检查文件是否已存在
    chrome.downloads.search({ query: [finalFilename] }, (results) => {
      // 检查搜索结果中是否有任何一个下载是成功的 (state: "complete")
      const fileExists = results.some(item => item.filename.endsWith(finalFilename) && item.state === 'complete');
      
      if (fileExists) {
        console.log(`文件 "${finalFilename}" 已存在，跳过下载。`);
        // 使用 Chrome 的通知 API 提醒用户（可选，但体验更好）
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon128.png', // 你需要在项目里添加一个图标文件
          title: '下载已跳过',
          message: `图片 "${request.filename}" 已经存在于您的下载目录中。`
        });
      } else {
        // 2. 如果文件不存在，则执行下载
        console.log(`文件 "${finalFilename}" 不存在，开始下载。`);
        chrome.downloads.download({
          url: imageUrl,
          filename: finalFilename,
          conflictAction: 'overwrite' // 设置为 overwrite，但因为我们已经检查过，所以基本不会触发
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error('下载失败:', chrome.runtime.lastError.message);
          } else {
            console.log('下载任务已创建，ID:', downloadId);
          }
        });
      }
    });
  }
});
