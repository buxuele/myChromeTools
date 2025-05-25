// 处理 https://grok.com/* 的文字插入逻辑，
// 响应 background.js 发送的 insertText 消息。



(function () {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'insertText') {
        const dialogBox = document.querySelector('textarea') || document.querySelector("input[type='text']");
        if (dialogBox) {
          const textToInsert = '你是一名计算机专家，编程高手。\n我是一名普通程序员。请用中文来解释。\n\n';
          dialogBox.value = textToInsert;
          const inputEvent = new Event('input', { bubbles: true });
          dialogBox.dispatchEvent(inputEvent);
          console.log('已插入预设文字');
        } else {
          console.log('未找到对话框元素');
        }
      }
    });
  })();