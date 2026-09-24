// Hacker News 增强
// 基础样式由 styles.css 提供，本脚本只负责可开关的功能与覆盖样式

(function () {
  "use strict";

  const BASE_STYLE_ID = "aitools-hn-base";
  const STYLE_IDS = {
    scroll: "aitools-hn-scroll",
    font: "aitools-hn-font",
    spacing: "aitools-hn-spacing",
    theme: "aitools-hn-theme"
  };

  const state = {
    enabled: false,
    shortcutsOn: false,
    newTabOn: false
  };

  let selected = null;

  // 基础样式表必须可卸载，站点开关关闭时才能还原原生页面
  function ensureBaseStyle() {
    if (document.getElementById(BASE_STYLE_ID)) return;
    const link = document.createElement("link");
    link.id = BASE_STYLE_ID;
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("content_scripts/hacker_news/styles.css");
    (document.head || document.documentElement).appendChild(link);
  }

  function removeBaseStyle() {
    const link = document.getElementById(BASE_STYLE_ID);
    if (link) link.remove();
  }

  // 仅注入与基础样式不同的覆盖规则
  function fontCss(value) {
    if (value !== "system") return "";
    return `
      * {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif !important;
        font-weight: 400 !important;
        font-style: normal !important;
      }
      .titleline a { font-weight: 700 !important; }
    `;
  }

  function spacingCss(value) {
    if (value === "normal") return "";
    const compact = value === "compact";
    return `
      body { line-height: ${compact ? "1.2" : "1.6"} !important; }
      .spacer { height: ${compact ? "8px" : "25px"} !important; }
      .subtext { padding-bottom: ${compact ? "4px" : "12px"} !important; }
    `;
  }

  function themeCss(value) {
    const themes = {
      dark: {
        bg: "#2d2d2d",
        text: "#e0e0e0",
        link: "#4a9eff",
        meta: "#a0a0a0",
        accent: "#4a9eff"
      },
      blue: {
        bg: "#f0f8ff",
        text: "#1e3a8a",
        link: "#1e90ff",
        meta: "#6b7280",
        accent: "#1e90ff"
      },
      green: {
        bg: "#f0fff0",
        text: "#1f2937",
        link: "#059669",
        meta: "#6b7280",
        accent: "#10b981"
      },
      purple: {
        bg: "#f8f0ff",
        text: "#1f2937",
        link: "#7c3aed",
        meta: "#6b7280",
        accent: "#8b5cf6"
      }
    };

    const theme = themes[value];
    if (!theme) return "";

    return `
      body, #hnmain {
        background-color: ${theme.bg} !important;
        color: ${theme.text} !important;
      }
      .athing { background-color: ${theme.bg} !important; }
      .titleline a { color: ${theme.link} !important; }
      .titleline a:visited { color: ${theme.meta} !important; }
      .subtext, .subtext a, .rank, .sitebit, .sitebit a { color: ${theme.meta} !important; }
      .hnuser { color: ${theme.accent} !important; }
      .pagetop, .pagetop a { color: ${theme.text} !important; }
      .yclinks, .yclinks a { color: ${theme.meta} !important; }
    `;
  }

  function setStyle(id, css) {
    if (css) {
      AIToolsUtils.applyStyle(id, css);
    } else {
      AIToolsUtils.removeStyle(id);
    }
  }

  function clearSelection() {
    if (!selected) return;
    selected.classList.remove("selected");
    selected.style.backgroundColor = "";
    selected = null;
  }

  function enhanceLinks() {
    if (state.newTabOn) {
      document.querySelectorAll('a[href^="http"]').forEach((link) => {
        if (link.hostname && !link.hostname.includes("ycombinator.com")) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.dataset.aitoolsBlank = "1";
        }
      });
    } else {
      document.querySelectorAll("a[data-aitools-blank]").forEach((link) => {
        link.target = "";
        link.rel = "";
        delete link.dataset.aitoolsBlank;
      });
    }
  }

  function handleKeydown(event) {
    if (!state.shortcutsOn) return;

    const target = event.target;
    if (
      target &&
      (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    ) {
      return;
    }

    if (event.key !== "j" && event.key !== "k" && event.key !== "Enter") return;

    if (event.key === "j" || event.key === "k") {
      const stories = document.querySelectorAll(".athing");
      if (stories.length === 0) return;

      let next = null;
      const current = document.querySelector(".athing.selected");

      if (!current) {
        next = stories[0];
      } else {
        const index = Array.from(stories).indexOf(current);
        if (event.key === "j" && index < stories.length - 1) next = stories[index + 1];
        if (event.key === "k" && index > 0) next = stories[index - 1];
      }

      if (next) {
        clearSelection();
        next.classList.add("selected");
        next.style.backgroundColor = "#fff3cd";
        next.scrollIntoView({ behavior: "auto", block: "center" });
        selected = next;
      }
      return;
    }

    if (event.key === "Enter" && selected) {
      const link = selected.querySelector(".titleline > a");
      if (!link) return;
      if (event.ctrlKey || event.metaKey) {
        window.open(link.href, "_blank");
      } else {
        window.location.href = link.href;
      }
    }
  }

  async function apply() {
    const config = await AIToolsUtils.getSettings();
    const features = (config && config.features) || {};

    state.enabled = !(config && config.enabled === false);
    state.shortcutsOn = state.enabled && features.shortcuts?.enabled !== false;
    state.newTabOn = state.enabled && features.newTabLinks?.enabled !== false;

    if (!state.enabled) {
      removeBaseStyle();
      Object.values(STYLE_IDS).forEach((id) => AIToolsUtils.removeStyle(id));
      clearSelection();
      enhanceLinks();
      return;
    }

    ensureBaseStyle();
    AIToolsUtils.applyStyle(STYLE_IDS.scroll, "html { scroll-behavior: auto !important; }");
    setStyle(STYLE_IDS.font, fontCss(features.font?.value));
    setStyle(STYLE_IDS.spacing, spacingCss(features.spacing?.value));
    setStyle(STYLE_IDS.theme, themeCss(features.theme?.value));
    enhanceLinks();

    if (!state.shortcutsOn) clearSelection();
  }

  AIToolsUtils.onSettingsChanged(apply);
  document.addEventListener("keydown", handleKeydown);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
