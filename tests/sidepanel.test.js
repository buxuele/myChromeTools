// 侧边栏校验：渲染、开关与下拉框持久化、注入转义、静态绑定

const test = require("node:test");
const assert = require("node:assert");
const { loadPage, loadDefaults, readProjectFile, sleep } = require("./helpers");

const defaults = loadDefaults();

async function boot(local = {}) {
  return loadPage({
    url: "chrome-extension://aitools-test/sidepanel.html",
    html: readProjectFile("sidepanel.html"),
    files: ["defaults.js", "sidepanel.js"],
    local
  });
}

async function openSettings(ctx) {
  ctx.document.getElementById("tabSettings").click();
  await sleep(60);
  return ctx.document;
}

function change(element) {
  element.dispatchEvent(new element.ownerDocument.defaultView.Event("change"));
}

test("提示词页渲染默认提示词", async () => {
  const ctx = await boot();
  await sleep(60);

  const tabs = ctx.document.querySelectorAll(".prompt-tab-btn");
  assert.strictEqual(tabs.length, 4);
  assert.strictEqual(tabs[0].textContent, "读文章");
  assert.ok(ctx.document.getElementById("promptLabel"));
});

test("功能设置渲染全局卡片与全部站点", async () => {
  const ctx = await boot();
  const document = await openSettings(ctx);

  const cards = document.querySelectorAll("#settingsList .site-card");
  assert.strictEqual(
    cards.length,
    1 + Object.keys(defaults.DEFAULT_CONFIG.sites).length,
    "卡片数量应为全局加站点数"
  );
});

test("站点开关写入 storage.local 且不广播标签页", async () => {
  const ctx = await boot();
  const document = await openSettings(ctx);

  const toggle = document.querySelector('.site-header input[data-site="chatgpt"]');
  toggle.checked = false;
  change(toggle);
  await sleep(60);

  assert.strictEqual(ctx.local.aiToolsSettings.sites.chatgpt.enabled, false);
  assert.strictEqual(ctx.sync.aiToolsSettings, undefined, "不应再写 storage.sync");
  assert.strictEqual(ctx.tabQueries.length, 0, "不应再向标签页广播消息");

  await ctx.chrome.storage.local.set({
    aiToolsSettings: { ...ctx.local.aiToolsSettings, sites: { chatgpt: { enabled: false } } }
  });
  await sleep(60);
  assert.strictEqual(
    ctx.document.querySelector('.site-header input[data-site="chatgpt"]').checked,
    false,
    "外部配置变更后重新渲染应保持状态"
  );
});

test("全局快捷提示词开关持久化", async () => {
  const ctx = await boot();
  const document = await openSettings(ctx);

  const cards = document.querySelectorAll("#settingsList .site-card");
  assert.ok(cards[0].textContent.includes("全局"), "全局卡片应排第一");

  const toggle = document.getElementById("togglePromptButtons");
  assert.strictEqual(toggle.checked, true, "默认开启");

  toggle.checked = false;
  change(toggle);
  await sleep(60);
  assert.strictEqual(ctx.local.showPromptButtons, false);
});

test("下拉框型功能可选择并持久化", async () => {
  const ctx = await boot();
  const document = await openSettings(ctx);

  const themeSelect = document.querySelector(
    'select[data-site="hackernews"][data-feature="theme"]'
  );
  assert.ok(themeSelect, "Hacker News 主题应渲染为下拉框");
  assert.deepStrictEqual(
    Array.from(themeSelect.options).map((o) => o.value),
    ["default", "dark", "blue", "green", "purple"]
  );
  assert.strictEqual(themeSelect.value, "default");

  themeSelect.value = "purple";
  change(themeSelect);
  await sleep(60);
  assert.strictEqual(ctx.local.aiToolsSettings.sites.hackernews.features.theme.value, "purple");

  const toggle = document.querySelector('input[data-site="hackernews"][data-feature="shortcuts"]');
  assert.ok(toggle, "开关型功能仍应渲染为开关");
  toggle.checked = false;
  change(toggle);
  await sleep(60);
  assert.strictEqual(
    ctx.local.aiToolsSettings.sites.hackernews.features.shortcuts.enabled,
    false
  );
  assert.strictEqual(
    ctx.local.aiToolsSettings.sites.hackernews.features.theme.value,
    "purple",
    "开关与下拉框互不干扰"
  );
});

test("注入内容全部转义", async () => {
  const hostileLabel = '<img src=x onerror="window.__pwned=1">';
  const hostileContent = "</textarea><script>window.__pwned=1</script>";

  const ctx = await boot({
    aiToolsSettings: {
      prompts: [{ id: "evil", label: hostileLabel, content: hostileContent }],
      sites: {}
    }
  });
  await sleep(60);

  assert.strictEqual(ctx.window.__pwned, undefined, "不应执行注入脚本");
  assert.strictEqual(ctx.document.getElementById("promptLabel").value, hostileLabel);
  assert.strictEqual(ctx.document.getElementById("promptContent").value, hostileContent);
  assert.strictEqual(
    ctx.document.querySelectorAll("#promptEditor img").length,
    0,
    "不应生成 img 节点"
  );

  const document = await openSettings(ctx);
  const siteCards = document.querySelectorAll("#settingsList .site-card");
  assert.strictEqual(siteCards.length, 1 + Object.keys(defaults.DEFAULT_CONFIG.sites).length);
});

test("恢复默认同时重置全局与站点开关", async () => {
  const ctx = await boot();
  const document = await openSettings(ctx);

  const featureToggle = document.querySelector(
    'input[data-site="chatgpt"][data-feature="adjustInput"]'
  );
  featureToggle.checked = false;
  change(featureToggle);
  await sleep(60);

  document.getElementById("resetAll").click();
  await sleep(80);

  assert.strictEqual(ctx.local.aiToolsSettings.sites.chatgpt.features.adjustInput.enabled, true);
  assert.strictEqual(ctx.local.showPromptButtons, true);
});

test("反复切换视图不会重复叠加静态监听器", async () => {
  const ctx = await boot();
  await openSettings(ctx);

  for (let i = 0; i < 3; i++) {
    ctx.document.getElementById("tabPrompts").click();
    await sleep(30);
    ctx.document.getElementById("tabSettings").click();
    await sleep(30);
  }

  let confirmCount = 0;
  ctx.window.confirm = () => {
    confirmCount += 1;
    return true;
  };

  ctx.document.getElementById("resetAll").click();
  await sleep(80);
  assert.strictEqual(confirmCount, 1, "恢复默认只应弹出一次确认框");
});
