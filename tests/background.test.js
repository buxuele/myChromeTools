// 后台服务校验：图标点击开侧边栏、配置迁移、下载消息

const test = require("node:test");
const assert = require("node:assert");
const vm = require("vm");
const { createChrome, readProjectFile } = require("./helpers");

function bootBackground({ local = {}, sync = {} } = {}) {
  const ctx = createChrome({ local, sync });
  const sandbox = vm.createContext({ chrome: ctx.chrome, console });
  vm.runInContext(readProjectFile("background.js"), sandbox);
  ctx.sandbox = sandbox;
  return ctx;
}

test("点击工具栏图标直接打开侧边栏", () => {
  const ctx = bootBackground();

  assert.strictEqual(typeof ctx.chrome.actionClick, "function", "应监听 action.onClicked");
  ctx.chrome.actionClick({ windowId: 7 });
  assert.strictEqual(ctx.chrome.openedPanel.windowId, 7, "应传入当前窗口 id");
});

test("安装与启动时把 sync 旧配置迁移到 local", async () => {
  const legacySettings = { sites: { chatgpt: { enabled: false } } };
  const ctx = bootBackground({
    sync: { aiToolsSettings: legacySettings, showPromptButtons: false }
  });

  assert.strictEqual(ctx.installedListeners.length, 1, "应注册 onInstalled 迁移");
  await ctx.installedListeners[0]();
  assert.deepStrictEqual(ctx.local.aiToolsSettings, legacySettings, "旧配置应写入 local");
  assert.strictEqual(ctx.local.showPromptButtons, false, "全局开关应一并迁移");

  ctx.local.aiToolsSettings = { sites: { chatgpt: { enabled: true } } };
  await ctx.startupListeners[0]();
  assert.strictEqual(
    ctx.local.aiToolsSettings.sites.chatgpt.enabled,
    true,
    "已有本地数据时不应被覆盖"
  );
});

test("local 无数据时内容脚本回退读取 sync", async () => {
  const { loadPage } = require("./helpers");
  const ctx = await loadPage({
    url: "https://www.guwendao.net/",
    files: ["defaults.js", "content_scripts/utils.js", "content_scripts/guwendao_content.js"],
    sync: {
      aiToolsSettings: {
        sites: { guwendao: { enabled: false, features: { enhancement: { enabled: true } } } }
      }
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.ok(
    !ctx.document.getElementById("aitools-guwendao-hide-toolbar"),
    "回退到 sync 的旧配置应生效"
  );
});

test("Pinterest 下载消息返回成功", async () => {
  const ctx = bootBackground();
  let response = null;
  const keepChannel = ctx.messageListeners[0]({ action: "download", url: "https://x/img.png" }, {}, (res) => {
    response = res;
  });

  assert.strictEqual(keepChannel, true, "应保持消息通道开放");
  assert.strictEqual(response.success, true);
  assert.strictEqual(response.downloadId, 1);
});
