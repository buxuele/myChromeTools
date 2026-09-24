// 点击工具栏图标直接打开侧边栏
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// 把 storage.sync 上的旧配置迁移到 storage.local，本地无数据时才写入
const MIGRATE_KEYS = ["aiToolsSettings", "showPromptButtons"];

async function migrateStorage() {
  const sync = await chrome.storage.sync.get(MIGRATE_KEYS);
  const local = await chrome.storage.local.get(MIGRATE_KEYS);

  const toSet = {};
  for (const key of MIGRATE_KEYS) {
    if (!(key in local) && key in sync) {
      toSet[key] = sync[key];
    }
  }

  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
    console.log("[aiTools] 已从 storage.sync 迁移配置到 storage.local:", Object.keys(toSet));
  }
}

chrome.runtime.onInstalled.addListener(migrateStorage);
chrome.runtime.onStartup.addListener(migrateStorage);

// 统一的消息处理器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Pinterest 图片下载
  if (request.action === "download") {
    chrome.downloads.download(
      {
        url: request.url,
        saveAs: false
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("下载失败:", chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true, downloadId });
        }
      }
    );
    return true; // 保持消息通道开放
  }
});
