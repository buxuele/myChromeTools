// 处理 https://i.pinimg.com/* 的 URL 修改和图片下载逻辑。


(function () {
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
          console.log('找到图片，URL:', img.src);
          chrome.runtime.sendMessage(
            {
              action: 'download',
              url: img.src
            },
            (response) => {
              if (response && response.success) {
                console.log('图片下载已触发');
              } else {
                console.log('图片下载失败:', response ? response.error : '无响应');
              }
            }
          );
          return true;
        } else {
          console.log('图片元素未找到');
          return false;
        }
      }
  
      window.addEventListener('load', () => {
        if (triggerDownload()) {
          console.log('下载在 load 事件中触发');
        }
      });
  
      const observer = new MutationObserver((mutations, obs) => {
        if (triggerDownload()) {
          obs.disconnect();
          console.log('下载在 MutationObserver 中触发，停止监控');
        }
      });
  
      observer.observe(document.body, { childList: true, subtree: true });
  
      setTimeout(() => {
        observer.disconnect();
        console.log('停止监控图片，未触发下载');
      }, 5000);
    }
  })();