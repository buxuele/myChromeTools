// 处理滚动控制逻辑，响应 popup.js 发送的 startScroll 和 stopScroll 消息。


(function () {
    let scrollInterval = null;
  
    function smoothAutoScroll() {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
      scrollInterval = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const currentScroll = window.scrollY;
        if (currentScroll + windowHeight >= scrollHeight - 1) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollBy({ top: 2, behavior: 'smooth' });
        }
      }, 16); // 每16毫秒滚动一次，约60fps
    }
  
    function stopScroll() {
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
    }
  
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'startScroll') {
        smoothAutoScroll();
      } else if (message.action === 'stopScroll') {
        stopScroll();
      }
    });
  })();