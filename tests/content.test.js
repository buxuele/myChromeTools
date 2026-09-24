// 内容脚本行为校验：开关生效、热更新、无整页刷新

const test = require("node:test");
const assert = require("node:assert");
const { loadPage, contentFiles, loadDefaults, sleep } = require("./helpers");

const defaults = loadDefaults();

function settingsWith(mutator) {
  const settings = defaults.cloneConfig(defaults.DEFAULT_CONFIG);
  mutator(settings);
  return settings;
}

async function boot(script, url, options = {}) {
  return loadPage({ url, files: contentFiles(script), ...options });
}

const STYLE_CASES = [
  {
    name: "古文岛隐藏工具条",
    script: "content_scripts/guwendao_content.js",
    url: "https://www.guwendao.net/",
    styleId: "aitools-guwendao-hide-toolbar",
    site: "guwendao",
    feature: "enhancement"
  },
  {
    name: "Medium 隐藏文本选择菜单",
    script: "content_scripts/medium_content.js",
    url: "https://medium.com/",
    styleId: "aitools-medium-hide-menu",
    site: "medium",
    feature: "hideFloat"
  },
  {
    name: "Perplexity 隐藏浮动元素",
    script: "content_scripts/perplexity_content.js",
    url: "https://www.perplexity.ai/",
    styleId: "aitools-perplexity-hide-float",
    site: "perplexity",
    feature: "hideFloat"
  }
];

STYLE_CASES.forEach((testCase) => {
  test(testCase.name, async () => {
    const ctx = await boot(testCase.script, testCase.url);
    await sleep(50);
    assert.ok(ctx.document.getElementById(testCase.styleId), "默认应注入样式");

    await ctx.chrome.storage.local.set({
      aiToolsSettings: settingsWith((s) => {
        s.sites[testCase.site].features[testCase.feature].enabled = false;
      })
    });
    await sleep(50);
    assert.ok(!ctx.document.getElementById(testCase.styleId), "关闭功能应移除样式");

    await ctx.chrome.storage.local.set({
      aiToolsSettings: settingsWith((s) => {
        s.sites[testCase.site].features[testCase.feature].enabled = true;
      })
    });
    await sleep(50);
    assert.ok(ctx.document.getElementById(testCase.styleId), "重新开启应恢复样式");

    await ctx.chrome.storage.local.set({
      aiToolsSettings: settingsWith((s) => {
        s.sites[testCase.site].enabled = false;
      })
    });
    await sleep(50);
    assert.ok(!ctx.document.getElementById(testCase.styleId), "关闭站点应移除样式");

    assert.strictEqual(ctx.window.location.href, testCase.url, "配置热更新不应刷新页面");
  });
});

test("知乎：隐藏浮动样式与发布时间可独立开关", async () => {
  const ctx = await boot("content_scripts/zhihu_content.js", "https://zhuanlan.zhihu.com/", {
    body: `
      <meta itemprop="datePublished" content="2024-05-06T10:20:30Z">
      <div class="AuthorInfo"></div>
      <div class="Post-Header"></div>
    `
  });
  await sleep(50);

  assert.ok(ctx.document.getElementById("aitools-zhihu-hide-float"));
  assert.strictEqual(ctx.document.querySelectorAll(".aitools-publish-time").length, 2);

  await ctx.chrome.storage.local.set({
    aiToolsSettings: settingsWith((s) => {
      s.sites.zhihu.features.showTime.enabled = false;
    })
  });
  await sleep(50);
  assert.strictEqual(
    ctx.document.querySelectorAll(".aitools-publish-time").length,
    0,
    "关闭显示发布时间应移除时间标记"
  );
  assert.ok(ctx.document.getElementById("aitools-zhihu-hide-float"), "另一个功能不应受影响");

  await ctx.chrome.storage.local.set({
    aiToolsSettings: settingsWith((s) => {
      s.sites.zhihu.enabled = false;
    })
  });
  await sleep(50);
  assert.ok(!ctx.document.getElementById("aitools-zhihu-hide-float"), "关闭站点应移除样式");
});

test("老钱博客：暗色背景子开关生效且可还原", async () => {
  const ctx = await boot("content_scripts/laoqian_content.js", "http://lao-qian.hxwk.org/", {
    body: `<div id="content" role="main"></div>`
  });
  await sleep(50);

  const target = ctx.document.querySelector("#content");
  assert.strictEqual(target.style.backgroundColor, "rgb(145, 179, 181)");

  await ctx.chrome.storage.local.set({
    aiToolsSettings: settingsWith((s) => {
      s.sites.laoqian.features.darkBackground.enabled = false;
    })
  });
  await sleep(50);
  assert.strictEqual(target.style.backgroundColor, "", "关闭子开关应还原背景");

  await ctx.chrome.storage.local.set({
    aiToolsSettings: settingsWith((s) => {
      s.sites.laoqian.features.darkBackground.enabled = true;
    })
  });
  await sleep(50);
  assert.strictEqual(target.style.backgroundColor, "rgb(145, 179, 181)");
});

test("Behance：定位修复可关闭并还原原始内联样式", async () => {
  const ctx = await boot("content_scripts/behance.js", "https://www.behance.net/", {
    body: `
      <div class="PrimaryNav-root-GKW"></div>
      <div class="PrimaryNav-strip-Xyi" style="position: absolute;"></div>
      <div class="Explore-carouselContainer-ZMu"></div>
      <div class="ExploreCategoryCarousel-container-rDE"></div>
      <div class="Explore-headerContainer-fm3"></div>
    `
  });
  await sleep(80);

  const fixed = ctx.document.querySelector(".PrimaryNav-root-GKW");
  const unfixed = ctx.document.querySelector(".PrimaryNav-strip-Xyi");
  assert.strictEqual(fixed.style.position, "fixed");
  assert.strictEqual(unfixed.style.position, "relative");

  await ctx.chrome.storage.local.set({
    aiToolsSettings: settingsWith((s) => {
      s.sites.behance.enabled = false;
    })
  });
  await sleep(80);
  assert.strictEqual(fixed.style.position, "", "关闭站点应还原空内联定位");
  assert.strictEqual(unfixed.style.position, "absolute", "应还原原始内联定位");
});

test("ChatGPT：输入框高度与提示词按钮独立开关", async () => {
  const ctx = await boot("content_scripts/chatgpt_enhancer.js", "https://chatgpt.com/", {
    body: `
      <div class="wrap">
        <form class="stretch"><textarea id="prompt-textarea"></textarea></form>
      </div>
    `
  });
  await sleep(80);

  const heightStyle = ctx.document.getElementById("aitools-chatgpt-input-height");
  const bar = ctx.document.getElementById("aitools-quick-prompts");
  assert.ok(heightStyle, "默认应注入输入框高度样式");
  assert.ok(bar, "默认应创建提示词按钮栏");
  assert.strictEqual(bar.querySelectorAll("button").length, 4);

  bar.querySelector("button").click();
  await sleep(30);
  const textarea = ctx.document.getElementById("prompt-textarea");
  assert.strictEqual(textarea.value, defaults.DEFAULT_PROMPTS[0].content, "点击按钮应写入输入框");

  await ctx.chrome.storage.local.set({
    aiToolsSettings: settingsWith((s) => {
      s.sites.chatgpt.features.adjustInput.enabled = false;
    })
  });
  await sleep(80);
  assert.ok(
    !ctx.document.getElementById("aitools-chatgpt-input-height"),
    "关闭输入框高度应移除样式"
  );
  assert.ok(ctx.document.getElementById("aitools-quick-prompts"), "提示词按钮不应受影响");

  await ctx.chrome.storage.local.set({ showPromptButtons: false });
  await sleep(80);
  assert.ok(
    !ctx.document.getElementById("aitools-quick-prompts"),
    "关闭全局开关应移除提示词按钮"
  );
  assert.strictEqual(ctx.window.location.href, "https://chatgpt.com/", "不应刷新页面");
});

test("Grok：提示词按钮随站点开关增删", async () => {
  let deep = "<textarea placeholder='随便问点什么'></textarea>";
  for (let i = 0; i < 10; i++) deep = `<div>${deep}</div>`;

  const ctx = await boot("content_scripts/grok_content.js", "https://x.com/i/grok", {
    body: `<main>${deep}</main>`
  });
  await sleep(150);

  const bar = ctx.document.getElementById("aitools-grok-prompts");
  assert.ok(bar, "默认应创建提示词按钮栏");
  assert.strictEqual(bar.querySelectorAll("button").length, 4);

  await ctx.chrome.storage.local.set({
    aiToolsSettings: settingsWith((s) => {
      s.sites.grok.enabled = false;
    })
  });
  await sleep(150);
  assert.ok(!ctx.document.getElementById("aitools-grok-prompts"), "关闭站点应移除按钮栏");

  await ctx.chrome.storage.local.set({
    aiToolsSettings: settingsWith((s) => {
      s.sites.grok.enabled = true;
      s.sites.grok.features.quickPrompts.enabled = false;
    })
  });
  await sleep(150);
  assert.ok(
    !ctx.document.getElementById("aitools-grok-prompts"),
    "关闭快捷提示词子开关应移除按钮栏"
  );
});

test("Gemini：提示词按钮受全局开关控制", async () => {
  const ctx = await boot("content_scripts/gemini_content.js", "https://gemini.google.com/", {
    body: `<div><input-area-v2></input-area-v2><rich-textarea></rich-textarea></div>`
  });
  await sleep(150);

  assert.ok(ctx.document.getElementById("aitools-quick-prompts-gemini"), "默认应创建按钮栏");

  await ctx.chrome.storage.local.set({ showPromptButtons: false });
  await sleep(150);
  assert.ok(
    !ctx.document.getElementById("aitools-quick-prompts-gemini"),
    "关闭全局开关应移除按钮栏"
  );

  await ctx.chrome.storage.local.set({ showPromptButtons: true });
  await sleep(150);
  assert.ok(ctx.document.getElementById("aitools-quick-prompts-gemini"), "重新开启应恢复按钮栏");
});

test("Speed Test：自动测速受开关控制", async () => {
  const body = `
    <input type="checkbox" id="privacyConsent" name="privacyConsent">
    <button id="startButton"></button>
  `;

  const enabledCtx = await boot("content_scripts/speed_lab.js", "https://speed.measurementlab.net/", {
    body
  });
  await sleep(400);
  assert.strictEqual(
    enabledCtx.document.getElementById("privacyConsent").checked,
    true,
    "默认应自动勾选隐私同意"
  );

  const disabledCtx = await boot("content_scripts/speed_lab.js", "https://speed.measurementlab.net/", {
    body,
    local: {
      aiToolsSettings: settingsWith((s) => {
        s.sites.speedlab.features.autoStart.enabled = false;
      })
    }
  });
  await sleep(400);
  assert.strictEqual(
    disabledCtx.document.getElementById("privacyConsent").checked,
    false,
    "关闭自动测速后不应勾选"
  );
});

test("Hacker News：基础样式可卸载，快捷键在输入框内不劫持", async () => {
  const ctx = await boot("content_scripts/hacker_news/content.js", "https://news.ycombinator.com/", {
    body: `
      <input type="text" id="search">
      <div class="athing" id="a1"><div class="titleline"><a href="https://example.com/1">story 1</a></div></div>
      <div class="athing" id="a2"><div class="titleline"><a href="https://example.com/2">story 2</a></div></div>
    `
  });
  await sleep(80);

  const baseLink = ctx.document.getElementById("aitools-hn-base");
  assert.ok(baseLink, "默认应注入基础样式表");
  assert.strictEqual(
    baseLink.href,
    "chrome-extension://aitools-test/content_scripts/hacker_news/styles.css"
  );

  const press = (target, key) =>
    target.dispatchEvent(new ctx.window.KeyboardEvent("keydown", { key, bubbles: true }));

  press(ctx.document.body, "j");
  await sleep(30);
  assert.ok(ctx.document.getElementById("a1").classList.contains("selected"), "J 键应选中第一条");

  press(ctx.document.getElementById("search"), "j");
  await sleep(30);
  assert.ok(
    !ctx.document.getElementById("a2").classList.contains("selected"),
    "输入框内按 J 不应触发导航"
  );

  await ctx.chrome.storage.local.set({
    aiToolsSettings: settingsWith((s) => {
      s.sites.hackernews.enabled = false;
    })
  });
  await sleep(80);
  assert.ok(!ctx.document.getElementById("aitools-hn-base"), "关闭站点应卸载基础样式");
  assert.strictEqual(
    ctx.document.querySelectorAll(".athing.selected").length,
    0,
    "关闭站点应清除选中态"
  );
});

test("Hacker News：主题与行距下拉框生效", async () => {
  const ctx = await boot("content_scripts/hacker_news/content.js", "https://news.ycombinator.com/", {
    body: `<div class="athing"><div class="titleline"><a href="https://example.com/1">story</a></div></div>`
  });
  await sleep(80);

  assert.ok(!ctx.document.getElementById("aitools-hn-theme"), "默认主题不注入覆盖样式");

  await ctx.chrome.storage.local.set({
    aiToolsSettings: settingsWith((s) => {
      s.sites.hackernews.features.theme.value = "dark";
      s.sites.hackernews.features.spacing.value = "compact";
    })
  });
  await sleep(80);
  const themeCss = ctx.document.getElementById("aitools-hn-theme");
  const spacingCss = ctx.document.getElementById("aitools-hn-spacing");
  assert.ok(themeCss && themeCss.textContent.includes("#2d2d2d"), "暗色主题应注入覆盖样式");
  assert.ok(spacingCss && spacingCss.textContent.includes("1.2"), "紧凑行距应注入覆盖样式");

  await ctx.chrome.storage.local.set({
    aiToolsSettings: settingsWith((s) => {
      s.sites.hackernews.features.font.value = "system";
    })
  });
  await sleep(80);
  assert.ok(
    ctx.document.getElementById("aitools-hn-font").textContent.includes("-apple-system"),
    "系统字体应注入覆盖样式"
  );
});

test("Pinterest：开关关闭时不改写地址，开启时按地址去重下载", async () => {
  const enabledCtx = await boot("content_scripts/pinterest_content.js", "https://i.pinimg.com/736x/a/b.jpg");
  await sleep(80);
  assert.ok(
    enabledCtx.errors.some((message) => message.includes("navigation")),
    "默认配置下应改写地址"
  );

  const gatedCtx = await boot("content_scripts/pinterest_content.js", "https://i.pinimg.com/736x/a/b.jpg", {
    local: {
      aiToolsSettings: settingsWith((s) => {
        s.sites.pinterest.features.originalImage.enabled = false;
      })
    }
  });
  await sleep(80);
  assert.ok(
    !gatedCtx.errors.some((message) => message.includes("navigation")),
    "关闭功能后不应改写地址"
  );

  const store = {};
  const imageBody = `<img src="https://i.pinimg.com/originals/x/y.jpg">`;
  const first = await boot("content_scripts/pinterest_content.js", "https://i.pinimg.com/originals/x/y.jpg", {
    body: imageBody,
    local: store
  });
  await sleep(200);
  assert.strictEqual(first.sentMessages.length, 1, "首次应触发下载");
  assert.strictEqual(first.sentMessages[0].url, "https://i.pinimg.com/originals/x/y.jpg");

  const second = await boot("content_scripts/pinterest_content.js", "https://i.pinimg.com/originals/x/y.jpg", {
    body: imageBody,
    local: store
  });
  await sleep(200);
  assert.strictEqual(second.sentMessages.length, 0, "重复打开同一图片不应再次下载");
});
