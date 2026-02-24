(function () {
  "use strict";

  async function getConfig() {
    if (typeof AIToolsUtils !== 'undefined') {
      return await AIToolsUtils.getSettings();
    }
    return null;
  }

  function addHideStyles() {
    if (document.getElementById("zhihu-hide-floating-bar")) return;

    const style = document.createElement("style");
    style.id = "zhihu-hide-floating-bar";
    style.textContent = `
      .RichContent-outputText {
        display: none !important;
      }
      .css-1jg5yfb,
      .css-fg13ww,
      div:has(> .css-fg13ww) {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function addPublishTime() {
    const timeElement = document.querySelector('meta[itemprop="datePublished"]');
    if (!timeElement) return;

    const rawTime = timeElement.content;
    if (!rawTime) return;

    const date = new Date(rawTime);
    const formattedTime = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

    const authorInfo = document.querySelector(".AuthorInfo");
    if (authorInfo) {
      if (authorInfo.innerText.includes(formattedTime)) return;

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

  async function init() {
    const config = await getConfig();
    
    if (config && config.enabled === false) return;

    if (!config || config.features?.showTime?.enabled !== false) {
      addPublishTime();
    }

    if (!config || config.features?.hideFloat?.enabled !== false) {
      addHideStyles();
    }
  }

  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === "SETTINGS_UPDATED") {
        location.reload();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
