// (function () {
//   // 1. 处理 https://x.com/i/grok 的逻辑
//   if (window.location.href.startsWith('https://x.com/i/grok')) {
//       function clickFocusButton() {
//           const focusButton =
//               document.querySelector('button[aria-label="专注模式"]') ||
//               document.querySelector('button.r-1phboty.r-10v3vxq');
//           if (focusButton) {
//               focusButton.click();
//               console.log('专注模式按钮已点击');
//               return true;
//           } else {
//               console.log('专注模式按钮未找到');
//               return false;
//           }
//       }

//       function adjustInputBox() {
//           const textarea = document.querySelector('textarea.r-30o5oe');
//           if (textarea) {
//               textarea.style.height = '86px';
//               textarea.focus();
//               console.log('输入框高度已调整为 86px 并聚焦');
//               return true;
//           } else {
//               console.log('输入框未找到');
//               return false;
//           }
//       }

//       let focusButtonClicked = clickFocusButton();
//       if (focusButtonClicked) {
//           adjustInputBox();
//       }

//       const observer = new MutationObserver((mutations, obs) => {
//           if (!focusButtonClicked && clickFocusButton()) {
//               focusButtonClicked = true;
//               adjustInputBox();
//           } else if (focusButtonClicked && adjustInputBox()) {
//               obs.disconnect();
//           }
//       });

//       const container = document.querySelector('.css-175oi2r') || document.body;
//       observer.observe(container, { childList: true, subtree: true });

//       setTimeout(() => {
//           observer.disconnect();
//           console.log('停止监控，未完成所有操作');
//       }, 5000);
//   }

//   // 2. 处理 https://i.pinimg.com/* 的逻辑
//   if (window.location.href.startsWith('https://i.pinimg.com/')) {
//       let newUrl = window.location.href;
//       let urlChanged = false;
//       if (newUrl.includes('/736x/')) {
//           newUrl = newUrl.replace('/736x/', '/originals/');
//           urlChanged = true;
//       } else if (newUrl.includes('/1200x/')) {
//           newUrl = newUrl.replace('/1200x/', '/originals/');
//           urlChanged = true;
//       }

//       if (urlChanged) {
//           window.location.replace(newUrl);
//       }

//       if (newUrl.includes('/originals/')) {
//           function triggerDownload() {
//               const img = document.querySelector('img');
//               if (img && img.src) {
//                   console.log('找到图片，URL:', img.src);
//                   chrome.runtime.sendMessage({
//                       action: 'download',
//                       url: img.src
//                   }, (response) => {
//                       if (response && response.success) {
//                           console.log('图片下载已触发');
//                       } else {
//                           console.log('图片下载失败:', response ? response.error : '无响应');
//                       }
//                   });
//                   return true;
//               } else {
//                   console.log('图片元素未找到');
//                   return false;
//               }
//           }

//           window.addEventListener('load', () => {
//               if (triggerDownload()) {
//                   console.log('下载在 load 事件中触发');
//               }
//           });

//           const observer = new MutationObserver((mutations, obs) => {
//               if (triggerDownload()) {
//                   obs.disconnect();
//                   console.log('下载在 MutationObserver 中触发，停止监控');
//               }
//           });

//           observer.observe(document.body, { childList: true, subtree: true });

//           setTimeout(() => {
//               observer.disconnect();
//               console.log('停止监控图片，未触发下载');
//           }, 5000);
//       }
//   }

//   // 3. 处理 https://grok.com/ 的逻辑，插入提示词
//   let scrollInterval = null;

//   function smoothAutoScroll() {
//       if (scrollInterval) {
//           clearInterval(scrollInterval);
//       }
//       scrollInterval = setInterval(() => {
//           const scrollHeight = document.documentElement.scrollHeight;
//           const windowHeight = window.innerHeight;
//           const currentScroll = window.scrollY;
//           if (currentScroll + windowHeight >= scrollHeight - 1) {
//               window.scrollTo({ top: 0, behavior: 'smooth' });
//           } else {
//               window.scrollBy({ top: 2, behavior: 'smooth' });
//           }
//       }, 16); // 每16毫秒滚动一次，约60fps
//   }

//   function stopScroll() {
//       if (scrollInterval) {
//           clearInterval(scrollInterval);
//           scrollInterval = null;
//       }
//   }

//   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//       if (message.action === "insertText" && window.location.href.startsWith("https://grok.com/")) {
//           const dialogBox = document.querySelector("textarea") || document.querySelector("input[type='text']");
//           if (dialogBox) {
//               const textToInsert = "你是一名计算机专家，编程高手。\n我是一名普通程序员。请用中文来解释。\n\n";
//               dialogBox.value = textToInsert;
//               const inputEvent = new Event("input", { bubbles: true });
//               dialogBox.dispatchEvent(inputEvent);
//               console.log("已插入预设文字");
//           } else {
//               console.log("未找到对话框元素");
//           }
//       } else if (message.action === 'startScroll') {
//           smoothAutoScroll();
//       } else if (message.action === 'stopScroll') {
//           stopScroll();
//       }
//   });
// })();
