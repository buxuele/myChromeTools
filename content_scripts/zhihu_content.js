(function () {
  "use strict";

  // 默认配置
  const DEFAULT_CONFIG = {
    features: {
      showTime: { enabled: true },
      hideFloat: { enabled: true },
    }
  };

  async function getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get("aiToolsSettings", (result) => {
        const settings = result.aiToolsSettings;
        if (settings && settings.sites && settings.sites.zhihu) {
          resolve(settings.sites.zhihu);
        } else {
          resolve({ enabled: true, features: DEFAULT_CONFIG.features });
        }
      });
    });
  }

  // 初始化
  async function init() {
    const config = await getSettings();
    if (!config.enabled) return;

    if (config.features.showTime.enabled) {
         addPublishTime();
    }
    
    // 隐藏浮动栏
    if (config.features.hideFloat.enabled) {
        addHideStyles();
    }
  }

  function addHideStyles() {
    // 避免重复添加
    if (document.getElementById("zhihu-hide-floating-bar")) return;

    const style = document.createElement("style");
    style.id = "zhihu-hide-floating-bar";
    style.textContent = `
          /* 隐藏选中文本时的浮动操作栏 */
          .RichContent-outputText {
              display: none !important;
          }
           /* 通用选择器：包含复制、喜欢、评论图标的浮动栏 - 备用方案 */
          .css-1jg5yfb,
          .css-fg13ww,
          div:has(> .css-fg13ww) {
            display: none !important;
          }
      `;
    document.head.appendChild(style);
  }

  function addPublishTime() {
    // 查找文章发布时间
    const timeElement = document.querySelector('meta[itemprop="datePublished"]');
    if (!timeElement) return;

    const rawTime = timeElement.content; // e.g. 2023-10-27T10:00:00.000Z
    if (!rawTime) return;

    // 格式化时间
    const date = new Date(rawTime);
    const formattedTime = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

    // 查找目标插入位置：作者信息栏
    const authorInfo = document.querySelector(".AuthorInfo");
    if (authorInfo) {
      if (authorInfo.innerText.includes(formattedTime)) return; // 避免重复

      const timeSpan = document.createElement("span");
      timeSpan.style.cssText = `
              color: #8590a6;
              font-size: 14px;
              margin-left: 10px;
              align-self: center;
          `;
      timeSpan.textContent = `发布于 ${formattedTime}`;
      authorInfo.appendChild(timeSpan);
    } 
    // 针对专栏文章头部的另一种布局
    const postHeader = document.querySelector(".Post-Header");
     if (postHeader && !authorInfo) {
          if (postHeader.innerText.includes(formattedTime)) return;

          const timeDiv = document.createElement("div");
           timeDiv.style.cssText = `
              color: #8590a6;
              font-size: 14px;
              margin-top: 10px;
          `;
          timeDiv.textContent = `发布于 ${formattedTime}`;
          postHeader.appendChild(timeDiv);
     }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  
  // 监听设置更新
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "SETTINGS_UPDATED") {
      // 简单处理：重新执行 init (可能需要先清理 old styles，但 simpler is better here)
      // 如果禁用了，目前无法动态移除（除了 reload），但这是 MVP。
       init();
    }
  });

})();
