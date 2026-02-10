// Hacker News 布局优化脚本 - 优化版本
// 只在页面初次加载时执行，移除持续监听以降低系统资源消耗

console.log("HN 布局优化插件已加载 - 资源优化版本");

// 初始化增强功能（只在页面加载时执行一次）
function initializeApp() {
  console.log("初始化HN布局优化，仅在页面加载时执行");
  initializeEnhancements();
}

// 确保只在页面加载时执行一次，降低资源消耗
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  // 页面已经加载完成，立即执行
  initializeApp();
}

function initializeEnhancements() {
  console.log("开始应用 HN 布局优化");

  // 加载初始设置
  loadInitialSettings();

  // 添加平滑滚动
  addSmoothScrolling();

  // 优化链接行为
  enhanceLinks();

  // 添加键盘快捷键
  addKeyboardShortcuts();

  // 优化表格结构
  enhanceTableStructure();

  // 添加加载动画
  addLoadingAnimations();

  console.log("HN 布局优化应用完成");
}

// 强制应用圆体字体
function forceRoundedFont() {
  console.log("正在强制应用 Nunito SemiBold 600 圆体字体...");

  // 专门加载 Nunito Medium 500
  const linkElement = document.createElement("link");
  linkElement.rel = "stylesheet";
  linkElement.href =
    "https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700&display=swap";
  linkElement.crossOrigin = "anonymous";
  document.head.appendChild(linkElement);

  // 确保字体加载完成后应用样式
  linkElement.onload = () => {
    console.log("Nunito SemiBold 600 字体加载完成");
    applyRoundedFontStyles();
  };

  // 立即应用字体样式，不等待
  applyRoundedFontStyles();
}

// 应用 Nunito SemiBold 600 圆体字体样式的函数
function applyRoundedFontStyles() {
  console.log("应用 Nunito SemiBold 600 字体样式...");

  // 创建字体样式 - 专门使用 Nunito SemiBold 600
  const fontStyle = document.createElement("style");
  fontStyle.id = "rounded-font-override";
  fontStyle.textContent = `
    /* 强制 Nunito SemiBold 600 圆体字体 - 最高优先级 */
    * {
      font-family: "Nunito", sans-serif !important;
      font-weight: 600 !important;
      font-style: normal !important;
    }
    
    body, .pagetop, .titleline, .subtext, .rank, .sitebit, .yclinks, h1, h2, h3, h4, h5, h6, p, div, span, a, td, th {
      font-family: "Nunito", sans-serif !important;
      font-weight: 600 !important;
      font-style: normal !important;
    }
    
    /* 特别针对标题使用 Nunito Bold 900，字体大小18pt */
    .titleline {
      font-size: 18pt !important;
    }
    
    .titleline a {
      font-family: "Nunito", sans-serif !important;
      font-weight: 900 !important;
      font-style: normal !important;
    }
    
    /* 确保所有文本元素都使用 Nunito SemiBold 600 */
    .subtext, .subtext * {
      font-family: "Nunito", sans-serif !important;
      font-weight: 600 !important;
    }
    
    .rank {
      font-family: "Nunito", sans-serif !important;
      font-weight: 600 !important;
    }
    
    .sitebit, .sitebit * {
      font-family: "Nunito", sans-serif !important;
      font-weight: 600 !important;
    }
    
    .pagetop, .pagetop * {
      font-family: "Nunito", sans-serif !important;
      font-weight: 600 !important;
    }
    
    .yclinks, .yclinks * {
      font-family: "Nunito", sans-serif !important;
      font-weight: 600 !important;
    }
  `;

  // 移除之前的样式（如果存在）
  const existingStyle = document.getElementById("rounded-font-override");
  if (existingStyle) {
    existingStyle.remove();
  }

  // 添加新样式到head的最后，确保优先级最高
  document.head.appendChild(fontStyle);

  // 动态强制应用 Nunito SemiBold 600 到所有现有元素
  const allElements = document.querySelectorAll("*");
  allElements.forEach((element) => {
    element.style.setProperty(
      "font-family",
      '"Nunito", sans-serif',
      "important"
    );
    element.style.setProperty("font-weight", "600", "important");
    element.style.setProperty("font-style", "normal", "important");
  });

  // 特别处理标题链接使用 Nunito Bold 900，字体大小18pt
  const titleLines = document.querySelectorAll(".titleline");
  titleLines.forEach((titleLine) => {
    titleLine.style.setProperty("font-size", "18pt", "important");
  });

  const titleLinks = document.querySelectorAll(".titleline a");
  titleLinks.forEach((link) => {
    link.style.setProperty("font-family", '"Nunito", sans-serif', "important");
    link.style.setProperty("font-weight", "900", "important");
    link.style.setProperty("font-style", "normal", "important");
  });

  console.log("Nunito SemiBold 600 字体样式应用完成");
}

// 禁用平滑滚动效果
function addSmoothScrolling() {
  const style = document.createElement("style");
  style.textContent = `
        html {
            scroll-behavior: auto !important;
        }
    `;
  document.head.appendChild(style);
}

// 优化链接行为
function enhanceLinks() {
  // 为外部链接添加新标签页打开
  const links = document.querySelectorAll('a[href^="http"]');
  links.forEach((link) => {
    if (!link.hostname.includes("ycombinator.com")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });

  // 移除悬停动画效果
}

// 添加键盘快捷键（优化版本，减少DOM查询）
function addKeyboardShortcuts() {
  // 使用单个事件监听器处理所有键盘事件
  document.addEventListener("keydown", function (e) {
    // 只处理特定按键，减少不必要的处理
    if (!["j", "k", "Enter"].includes(e.key)) return;

    // J/K 键导航
    if (e.key === "j" || e.key === "k") {
      const stories = document.querySelectorAll(".athing");
      if (stories.length === 0) return;

      const currentStory = document.querySelector(".athing.selected");
      let nextStory;

      if (!currentStory) {
        nextStory = stories[0];
      } else {
        const currentIndex = Array.from(stories).indexOf(currentStory);
        if (e.key === "j" && currentIndex < stories.length - 1) {
          nextStory = stories[currentIndex + 1];
        } else if (e.key === "k" && currentIndex > 0) {
          nextStory = stories[currentIndex - 1];
        }
      }

      if (nextStory) {
        // 移除之前的选中状态
        const prevSelected = document.querySelector(".athing.selected");
        if (prevSelected) {
          prevSelected.classList.remove("selected");
          prevSelected.style.backgroundColor = "";
        }

        // 添加新的选中状态
        nextStory.classList.add("selected");
        nextStory.style.backgroundColor = "#fff3cd";
        nextStory.scrollIntoView({ behavior: "auto", block: "center" });
      }
    }

    // Enter 键打开选中的故事
    if (e.key === "Enter") {
      const selectedStory = document.querySelector(".athing.selected");
      if (selectedStory) {
        const link = selectedStory.querySelector(".titleline > a");
        if (link) {
          if (e.ctrlKey || e.metaKey) {
            window.open(link.href, "_blank");
          } else {
            window.location.href = link.href;
          }
        }
      }
    }
  });
}

// 优化表格结构（无动画）
function enhanceTableStructure() {
  // 为主表格添加容器
  const mainTable = document.querySelector("table");
  if (
    mainTable &&
    !mainTable.parentElement.classList.contains("hn-container")
  ) {
    const container = document.createElement("div");
    container.className = "hn-container";
    mainTable.parentNode.insertBefore(container, mainTable);
    container.appendChild(mainTable);
  }

  // 移除所有动画效果
}

// 移除所有加载动画
function addLoadingAnimations() {
  // 不添加任何动画效果
}

// 移除持续监听以降低系统资源消耗
// 只在页面初次加载时执行优化，不再监听页面变化

// 移除右键菜单和双击功能以降低资源消耗
// 如需这些功能，可以在用户明确需要时再添加

// 当前设置
let currentSettings = {
  enabled: true,
  font: "nunito",
  spacing: "normal",
  theme: "default",
};

// 监听来自 popup 的消息（保留此监听器，因为用户可能需要实时更新设置）
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "updateSettings") {
    console.log("收到设置更新:", request.settings);
    currentSettings = request.settings;
    applyCustomSettings();
    sendResponse({ success: true });
  }
});

// 应用自定义设置
function applyCustomSettings() {
  if (!currentSettings.enabled) {
    removeCustomStyles();
    return;
  }

  applyFontSettings();
  applySpacingSettings();
  applyThemeSettings();
}

// 应用字体设置
function applyFontSettings() {
  const fontStyle = document.getElementById("custom-font-style");
  if (fontStyle) {
    fontStyle.remove();
  }

  // 加载所需字体
  loadRequiredFonts();

  const style = document.createElement("style");
  style.id = "custom-font-style";

  let fontFamily = "";
  let fontWeight = "600";

  switch (currentSettings.font) {
    case "nunito":
      fontFamily = '"Nunito", sans-serif';
      fontWeight = "600";
      break;
    case "roboto":
      fontFamily = '"Roboto", sans-serif';
      fontWeight = "400";
      break;
    case "system":
      fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
      fontWeight = "400";
      break;
  }

  style.textContent = `
    * {
      font-family: ${fontFamily} !important;
      font-weight: ${fontWeight} !important;
    }
    
    .titleline {
      font-size: 18pt !important;
    }
    
    .titleline a {
      font-family: ${fontFamily} !important;
      font-weight: ${
        currentSettings.font === "nunito" ? "900" : "600"
      } !important;
    }
    
    body {
      font-size: 15pt !important;
    }
    
    .pagetop {
      font-size: 15pt !important;
    }
    
    .titleline {
      font-size: 18pt !important;
    }
    
    .subtext {
      font-size: 10.5pt !important;
    }
    
    .rank {
      font-size: 15pt !important;
    }
    
    .sitebit {
      font-size: 12pt !important;
    }
    
    .yclinks {
      font-size: 12pt !important;
    }
  `;

  document.head.appendChild(style);
}

// 加载所需字体
function loadRequiredFonts() {
  // 移除之前的字体链接
  const existingLinks = document.querySelectorAll("link[data-font-loader]");
  existingLinks.forEach((link) => link.remove());

  // 根据当前字体设置加载相应字体
  let fontUrl = "";

  switch (currentSettings.font) {
    case "nunito":
      fontUrl =
        "https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700&display=swap";
      break;
    case "roboto":
      fontUrl =
        "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap";
      break;
    case "system":
      // 系统字体不需要加载
      return;
  }

  if (fontUrl) {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = fontUrl;
    linkElement.crossOrigin = "anonymous";
    linkElement.setAttribute("data-font-loader", "true");
    document.head.appendChild(linkElement);
  }
}

// 应用间距设置
function applySpacingSettings() {
  const spacingStyle = document.getElementById("custom-spacing-style");
  if (spacingStyle) {
    spacingStyle.remove();
  }

  const style = document.createElement("style");
  style.id = "custom-spacing-style";

  let lineHeight = "1.4";
  let spacerHeight = "15px";
  let paddingBottom = "8px";

  switch (currentSettings.spacing) {
    case "compact":
      lineHeight = "1.2";
      spacerHeight = "8px";
      paddingBottom = "4px";
      break;
    case "normal":
      lineHeight = "1.4";
      spacerHeight = "15px";
      paddingBottom = "8px";
      break;
    case "relaxed":
      lineHeight = "1.6";
      spacerHeight = "25px";
      paddingBottom = "12px";
      break;
  }

  style.textContent = `
    body {
      line-height: ${lineHeight} !important;
    }
    
    .spacer {
      height: ${spacerHeight} !important;
    }
    
    .subtext {
      padding-bottom: ${paddingBottom} !important;
    }
  `;

  document.head.appendChild(style);
}

// 应用主题设置
function applyThemeSettings() {
  const themeStyle = document.getElementById("custom-theme-style");
  if (themeStyle) {
    themeStyle.remove();
  }

  const style = document.createElement("style");
  style.id = "custom-theme-style";

  let backgroundColor = "#f6f6ef";
  let textColor = "#000000";
  let linkColor = "#1a4480";
  let metaColor = "#828282";
  let accentColor = "#ff6600";

  switch (currentSettings.theme) {
    case "default":
      backgroundColor = "#f6f6ef";
      textColor = "#000000";
      linkColor = "#1a4480";
      metaColor = "#828282";
      accentColor = "#ff6600";
      break;
    case "dark":
      backgroundColor = "#2d2d2d";
      textColor = "#e0e0e0";
      linkColor = "#4a9eff";
      metaColor = "#a0a0a0";
      accentColor = "#4a9eff";
      break;
    case "blue":
      backgroundColor = "#f0f8ff";
      textColor = "#1e3a8a";
      linkColor = "#1e90ff";
      metaColor = "#6b7280";
      accentColor = "#1e90ff";
      break;
    case "green":
      backgroundColor = "#f0fff0";
      textColor = "#1f2937";
      linkColor = "#059669";
      metaColor = "#6b7280";
      accentColor = "#10b981";
      break;
    case "purple":
      backgroundColor = "#f8f0ff";
      textColor = "#1f2937";
      linkColor = "#7c3aed";
      metaColor = "#6b7280";
      accentColor = "#8b5cf6";
      break;
  }

  style.textContent = `
    body, #hnmain {
      background-color: ${backgroundColor} !important;
      color: ${textColor} !important;
    }
    
    .athing {
      background-color: ${backgroundColor} !important;
    }
    
    .titleline a {
      color: ${linkColor} !important;
    }
    
    .titleline a:visited {
      color: ${metaColor} !important;
    }
    
    .subtext, .subtext a, .rank, .sitebit, .sitebit a {
      color: ${metaColor} !important;
    }
    
    .hnuser {
      color: ${accentColor} !important;
    }
    
    .pagetop, .pagetop a {
      color: ${textColor} !important;
    }
    
    .yclinks, .yclinks a {
      color: ${metaColor} !important;
    }
  `;

  document.head.appendChild(style);
}

// 移除自定义样式
function removeCustomStyles() {
  const customStyles = [
    "custom-font-style",
    "custom-spacing-style",
    "custom-theme-style",
  ];
  customStyles.forEach((id) => {
    const style = document.getElementById(id);
    if (style) {
      style.remove();
    }
  });
}

// 初始化时加载设置
function loadInitialSettings() {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(
      {
        enabled: true,
        font: "nunito",
        spacing: "normal",
        theme: "default",
      },
      function (items) {
        currentSettings = items;
        applyCustomSettings();
      }
    );
  }
}
