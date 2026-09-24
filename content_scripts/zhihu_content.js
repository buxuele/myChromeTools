// 知乎专栏：显示发布时间与隐藏浮动菜单

(function () {
  "use strict";

  const STYLE_ID = "aitools-zhihu-hide-float";
  const TIME_CLASS = "aitools-publish-time";
  const HIDE_CSS = `
    .RichContent-outputText,
    .css-1jg5yfb,
    .css-fg13ww,
    div:has(> .css-fg13ww) {
      display: none !important;
    }
  `;

  function addPublishTime() {
    const timeElement = document.querySelector('meta[itemprop="datePublished"]');
    if (!timeElement || !timeElement.content) return;

    const date = new Date(timeElement.content);
    const formattedTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    const createStamp = (style) => {
      const el = document.createElement("span");
      el.className = TIME_CLASS;
      el.style.cssText = style;
      el.textContent = `发布于 ${formattedTime}`;
      return el;
    };

    const authorInfo = document.querySelector(".AuthorInfo");
    const hasAuthorInfo = !!authorInfo;

    if (authorInfo && !authorInfo.querySelector("." + TIME_CLASS)) {
      authorInfo.appendChild(
        createStamp("color: #8590a6; font-size: 14px; margin-left: 10px; align-self: center;")
      );
    }

    // 没有作者栏时才退回到文章头部，避免同页出现两处时间
    const postHeader = document.querySelector(".Post-Header");
    if (!hasAuthorInfo && postHeader && !postHeader.querySelector("." + TIME_CLASS)) {
      postHeader.appendChild(createStamp("color: #8590a6; font-size: 14px; margin-top: 10px; display: block;"));
    }
  }

  function removePublishTime() {
    document.querySelectorAll("." + TIME_CLASS).forEach((el) => el.remove());
  }

  async function apply() {
    const config = await AIToolsUtils.getSettings();
    const siteOff = !!(config && config.enabled === false);

    const hideFloatOn = !siteOff && !(config && config.features?.hideFloat?.enabled === false);
    const showTimeOn = !siteOff && !(config && config.features?.showTime?.enabled === false);

    if (hideFloatOn) {
      AIToolsUtils.applyStyle(STYLE_ID, HIDE_CSS);
    } else {
      AIToolsUtils.removeStyle(STYLE_ID);
    }

    if (showTimeOn) {
      addPublishTime();
    } else {
      removePublishTime();
    }
  }

  AIToolsUtils.onSettingsChanged(apply);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }

  window.addEventListener("load", () => {
    setTimeout(apply, 500);
  });
})();
