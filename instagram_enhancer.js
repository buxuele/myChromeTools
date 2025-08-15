// 完整的路径: D:\JS\chrome_extension\aiTools\instagram_enhancer.js
// 内容:
(function () {
  "use strict";

  const BODY_CLASS_NAME = 'three-column-feed';
  let gridContainer = null;
  let articleObserver = null; // 用于观察帖子的Observer
  let lastUrl = '';

  /**
   * 清理函数：在页面切换时移除旧的元素和监听器
   */
  function cleanup() {
    if (articleObserver) {
      articleObserver.disconnect();
      articleObserver = null;
    }
    const oldGrid = document.getElementById('aiToolsGridContainer');
    if (oldGrid) {
      oldGrid.remove();
    }
    gridContainer = null;
    document.body.classList.remove(BODY_CLASS_NAME);
    
    // 把原始帖子的显示恢复
    const mainElement = document.querySelector('main');
    if(mainElement){
        const originalFeed = mainElement.querySelector('div[data-pagelet="story_tray"] + div');
        if (originalFeed) {
            originalFeed.style.display = '';
        }
    }
    console.log('[aiTools] Cleaned up previous grid.');
  }

  /**
   * 创建并注入我们的网格容器
   */
  function createGridContainer() {
    // 找到一个稳定的父元素来注入我们的容器
    const mainElement = document.querySelector('main');
    if (!mainElement) return false;

    // 找到原始的帖子流容器并隐藏它
    const originalFeed = mainElement.querySelector('div[data-pagelet="story_tray"] + div');
    if (!originalFeed || !originalFeed.parentNode) return false;
    
    originalFeed.style.display = 'none'; // 隐藏原始帖子

    gridContainer = document.createElement('div');
    gridContainer.id = 'aiToolsGridContainer';
    gridContainer.className = 'aitools-grid';
    
    originalFeed.parentNode.insertBefore(gridContainer, originalFeed);
    return true;
  }

  /**
   * 处理单个帖子（<article> 元素）
   */
  function processArticle(articleNode) {
    if (!gridContainer || articleNode.dataset.aitoolsProcessed) {
      return;
    }
    articleNode.dataset.aitoolsProcessed = 'true';

    const linkElement = articleNode.querySelector('a[href^="/p/"], a[href^="/reel/"]');
    const imageElement = articleNode.querySelector('img.x5yr21d');

    if (linkElement && imageElement) {
      const postUrl = linkElement.href;
      const imageUrl = imageElement.src;

      const gridItem = document.createElement('a');
      gridItem.className = 'aitools-grid-item';
      gridItem.href = postUrl;
      gridItem.target = '_blank';

      const gridImage = document.createElement('img');
      gridImage.src = imageUrl;

      const overlay = document.createElement('div');
      overlay.className = 'aitools-overlay';

      gridItem.appendChild(gridImage);
      gridItem.appendChild(overlay);
      gridContainer.appendChild(gridItem);
    }
  }

  /**
   * 主初始化函数
   */
  function init() {
    cleanup(); // 先清理

    if (window.location.pathname !== '/') {
        console.log('[aiTools] Not on home page. Deactivating.');
        return;
    }

    console.log('[aiTools] On home page. Initializing grid view...');
    document.body.classList.add(BODY_CLASS_NAME);

    if (!createGridContainer()) {
        console.error('[aiTools] Failed to create grid container.');
        return;
    }

    document.querySelectorAll('article').forEach(processArticle);

    articleObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'ARTICLE') {
              processArticle(node);
            } else if (node.querySelectorAll) {
              node.querySelectorAll('article').forEach(processArticle);
            }
          }
        });
      }
    });

    const mainElement = document.querySelector('main');
    if (mainElement) {
      articleObserver.observe(mainElement, { childList: true, subtree: true });
    }
  }

  /**
   * 轮询检查器，确保核心DOM元素加载完毕再执行
   */
  function waitForElementAndRun(selector, callback) {
      const interval = setInterval(() => {
          const element = document.querySelector(selector);
          if (element) {
              clearInterval(interval);
              callback();
          }
      }, 100); // 每 100ms 检查一次
  }

  /**
   * 路由变化监听器
   */
  function handleRouteChange() {
    const url = location.href;
    if (url === lastUrl) return;
    lastUrl = url;

    // 当URL变化时，等待 main 元素出现后，再执行初始化
    waitForElementAndRun('main', init);
  }

  // --- 脚本启动入口 ---
  console.log('[aiTools] Script injected. Waiting for body...');
  // 等待 body 出现
  waitForElementAndRun('body', () => {
      // Body 出现后，开始监听路由变化
      new MutationObserver(handleRouteChange).observe(document.body, { childList: true, subtree: true });
      // 并立即触发一次路由处理
      handleRouteChange();
  });

})();