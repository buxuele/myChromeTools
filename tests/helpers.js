// 测试公共设施：chrome API 模拟、页面加载器、默认配置加载器

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM, VirtualConsole } = require("jsdom");

const root = path.join(__dirname, "..");

function readProjectFile(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 模拟 chrome API，storage 为 Promise 风格，与 MV3 一致
function createChrome({ local = {}, sync = {} } = {}) {
  const changedListeners = [];
  const messageListeners = [];
  const installedListeners = [];
  const startupListeners = [];
  const sentMessages = [];
  const tabQueries = [];

  function makeArea(store, area) {
    return {
      async get(keys) {
        const list =
          keys === undefined || keys === null
            ? Object.keys(store)
            : Array.isArray(keys)
              ? keys
              : [keys];
        const out = {};
        list.forEach((key) => {
          if (key in store) out[key] = store[key];
        });
        return out;
      },
      async set(items) {
        const changes = {};
        for (const [key, value] of Object.entries(items)) {
          changes[key] = { oldValue: store[key], newValue: value };
          store[key] = value;
        }
        changedListeners.forEach((listener) => listener(changes, area));
      },
      async remove(keys) {
        const list = Array.isArray(keys) ? keys : [keys];
        list.forEach((key) => delete store[key]);
      }
    };
  }

  const chrome = {
    storage: {
      local: makeArea(local, "local"),
      sync: makeArea(sync, "sync"),
      onChanged: { addListener: (fn) => changedListeners.push(fn) }
    },
    runtime: {
      lastError: null,
      getURL: (p) => "chrome-extension://aitools-test/" + p,
      onMessage: { addListener: (fn) => messageListeners.push(fn) },
      onInstalled: { addListener: (fn) => installedListeners.push(fn) },
      onStartup: { addListener: (fn) => startupListeners.push(fn) },
      sendMessage: (message, callback) => {
        sentMessages.push(message);
        const response = { success: true, downloadId: sentMessages.length };
        if (typeof callback === "function") callback(response);
        return Promise.resolve(response);
      }
    },
    action: {
      onClicked: { addListener: (fn) => (chrome.actionClick = fn) }
    },
    sidePanel: {
      open: (options) => {
        chrome.openedPanel = options;
      }
    },
    downloads: {
      download: (options, callback) => callback(1)
    },
    tabs: {
      query: (query, callback) => {
        tabQueries.push(query);
        callback([{ id: 1, windowId: 7 }]);
      }
    }
  };

  return {
    chrome,
    local,
    sync,
    changedListeners,
    messageListeners,
    installedListeners,
    startupListeners,
    sentMessages,
    tabQueries
  };
}

// 读取 defaults.js 并导出其顶层配置
function loadDefaults() {
  const context = {};
  vm.createContext(context);
  const source =
    readProjectFile("defaults.js") +
    "\nglobalThis.__exports = { DEFAULT_CONFIG, DEFAULT_PROMPTS, STORAGE_KEY_SETTINGS, STORAGE_KEY_SHOW_PROMPT_BUTTONS, cloneConfig, mergeSettings, matchSite, readState };";
  vm.runInContext(source, context);
  return context.__exports;
}

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/g, "");
}

function inlineScripts(files) {
  return files
    .map((file) => `<script>${readProjectFile(file).replace(/<\/script/g, "<\\/script")}</script>`)
    .join("");
}

// 加载页面并执行指定脚本，files 顺序即执行顺序
async function loadPage({ url, files, html, local = {}, sync = {}, body = "" }) {
  const ctx = createChrome({ local, sync });
  const page =
    stripScripts(html || "<!DOCTYPE html><html><head></head><body></body></html>").replace(
      "</body>",
      `${body}${inlineScripts(files)}</body>`
    );

  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (error) => errors.push(String(error.message || error)));
  virtualConsole.on("error", (...args) => errors.push(args.join(" ")));

  const dom = new JSDOM(page, {
    url,
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.chrome = ctx.chrome;
      window.alert = () => {};
      window.confirm = () => true;
      window.Element.prototype.scrollIntoView = () => {};
    }
  });

  ctx.dom = dom;
  ctx.window = dom.window;
  ctx.document = dom.window.document;
  ctx.errors = errors;
  ctx.fireChanged = (changes) =>
    ctx.changedListeners.forEach((listener) => listener(changes, "local"));
  return ctx;
}

// 内容脚本通用加载组合
function contentFiles(script) {
  return ["defaults.js", "content_scripts/utils.js", script];
}

module.exports = {
  root,
  sleep,
  readProjectFile,
  createChrome,
  loadDefaults,
  loadPage,
  contentFiles
};
