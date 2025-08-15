(function () {
  "use strict";

  // --- 配置 ---
  // 主布局容器，我们的UI将注入到这里
  const LAYOUT_CONTAINER_SELECTOR = 'ms-app .makersuite-layout';
  // 聊天记录的滚动容器，MutationObserver将监视它
  const CHAT_SCROLL_CONTAINER_SELECTOR = 'ms-autoscroll-container'; 
  // 每个对话轮次的元素
  const USER_TURN_SELECTOR = 'ms-chat-turn';
  // 标识用户提问的元素
  const USER_PROMPT_SELECTOR = '.user-prompt-container';
  const SUMMARY_LENGTH = 60;
  const DEBOUNCE_DELAY = 500;

  // --- 全局变量 ---
  let outlineContainer = null;
  let outlineList = null;
  let debounceTimer = null;
  let observer = null;
  let lastClickedItem = null;
  let isInitialized = false; // 防止重复初始化

  function log(message) {
    console.log(`[aiTools-GeminiOutline] ${message}`);
  }

  function error(message) {
    console.error(`[aiTools-GeminiOutline] ${message}`);
  }

  /**
   * 创建并注入侧边栏UI
   */
  function createSidebar(layoutContainer) {
    if (document.getElementById('ai-tools-gemini-outline')) return;

    outlineContainer = document.createElement('div');
    outlineContainer.id = 'ai-tools-gemini-outline';
    
    outlineContainer.innerHTML = `
      <div class="gco-header">
        <h3>对话大纲</h3>
        <div>
          <button id="gco-refresh-btn" class="gco-header-btn" title="手动刷新">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
          </button>
          <button id="gco-toggle-btn" class="gco-header-btn gco-toggle-btn" title="收起/展开">
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
          </button>
        </div>
      </div>
      <ul class="gco-list"></ul>
    `;

    layoutContainer.insertBefore(outlineContainer, layoutContainer.firstChild);
    log("Sidebar UI injected.");

    outlineList = outlineContainer.querySelector('.gco-list');

    document.getElementById('gco-refresh-btn').addEventListener('click', updateOutline);
    document.getElementById('gco-toggle-btn').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      outlineContainer.classList.toggle('collapsed');
      btn.classList.toggle('collapsed');
    });
  }

  /**
   * 更新大纲列表
   */
  function updateOutline() {
    if (!outlineList) return;

    const allTurns = document.querySelectorAll(USER_TURN_SELECTOR);
    if (allTurns.length === 0) {
        log("No conversation turns found yet.");
        outlineList.innerHTML = '<li class="gco-list-item-empty">开始对话以生成大纲...</li>';
        return;
    }

    log(`Found ${allTurns.length} conversation turns.`);
    outlineList.innerHTML = '';

    allTurns.forEach(turnElement => {
      const userPromptContainer = turnElement.querySelector(USER_PROMPT_SELECTOR);
      
      if (userPromptContainer) {
        const text = userPromptContainer.textContent.trim();
        if (!text && !turnElement.querySelector('ms-image-chunk')) return;

        const summary = text 
          ? text.substring(0, SUMMARY_LENGTH) + (text.length > SUMMARY_LENGTH ? '...' : '')
          : '[图片]';

        const listItem = document.createElement('a');
        listItem.className = 'gco-list-item';
        listItem.textContent = summary;
        listItem.title = text || '用户上传的图片';
        listItem.href = '#';

        listItem.addEventListener('click', (e) => {
          e.preventDefault();
          turnElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (lastClickedItem) lastClickedItem.classList.remove('active');
          listItem.classList.add('active');
          lastClickedItem = listItem;
        });

        outlineList.appendChild(listItem);
      }
    });
    log("Outline list updated.");
  }
  
  /**
   * 启动 MutationObserver 监视聊天内容变化
   */
  function startObserver() {
    const chatContainer = document.querySelector(CHAT_SCROLL_CONTAINER_SELECTOR);
    if (!chatContainer) {
        error("Chat scroll container not found for MutationObserver. Auto-update will be disabled.");
        return;
    }

    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateOutline, DEBOUNCE_DELAY);
    });
    observer.observe(chatContainer, { childList: true, subtree: true });
    log(`MutationObserver started successfully on <${chatContainer.tagName.toLowerCase()}>.`);
  }

  /**
   * 主初始化函数
   */
  function main() {
    if (isInitialized) return;

    const layoutContainer = document.querySelector(LAYOUT_CONTAINER_SELECTOR);
    if (!layoutContainer) {
        error("Main layout container not found. Aborting initialization.");
        return;
    }
    
    isInitialized = true;
    createSidebar(layoutContainer);
    updateOutline(); // 首次运行以显示初始状态（或空状态）
    startObserver(); // 立即启动观察者
  }

  // --- 启动逻辑 ---
  // Gemini 页面是动态加载的，我们需要一个更可靠的启动方式。
  // 我们将监视整个文档的变化，一旦发现我们需要的核心布局容器出现，就执行初始化。
  log("Script loaded. Observing document for layout container...");
  const bodyObserver = new MutationObserver((mutations, obs) => {
    if (document.querySelector(LAYOUT_CONTAINER_SELECTOR)) {
      log("Layout container found. Initializing script.");
      obs.disconnect(); // 找到后就停止观察 body
      main();
    }
  });

  // 如果页面加载时已经存在，则直接运行
  if (document.querySelector(LAYOUT_CONTAINER_SELECTOR)) {
    main();
  } else {
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

})();