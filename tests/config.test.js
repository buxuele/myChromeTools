// 配置模块校验：hosts 匹配、存量配置合并

const test = require("node:test");
const assert = require("node:assert");
const { loadDefaults } = require("./helpers");

const defaults = loadDefaults();

// vm 上下文里的对象与测试上下文不同源，统一转成本地对象再比较
const plain = (value) => JSON.parse(JSON.stringify(value));

const EXPECTED_HOSTS = {
  chatgpt: ["chatgpt.com"],
  grok: ["x.com"],
  gemini: ["gemini.google.com"],
  zhihu: ["zhuanlan.zhihu.com"],
  medium: ["medium.com", "levelup.gitconnected.com"],
  perplexity: ["perplexity.ai"],
  pinterest: ["i.pinimg.com"],
  behance: ["behance.net"],
  laoqian: ["lao-qian.hxwk.org"],
  guwendao: ["guwendao.net"],
  speedlab: ["speed.measurementlab.net"],
  hackernews: ["news.ycombinator.com"]
};

// manifest 里真实注入的域名，必须都能匹配到某个站点
const INJECTED_HOSTS = [
  "i.pinimg.com",
  "chatgpt.com",
  "www.behance.net",
  "medium.com",
  "levelup.gitconnected.com",
  "speed.measurementlab.net",
  "www.perplexity.ai",
  "zhuanlan.zhihu.com",
  "lao-qian.hxwk.org",
  "www.guwendao.net",
  "x.com",
  "gemini.google.com",
  "news.ycombinator.com"
];

const NON_MATCHING = {
  chatgpt: ["chatgpt.com.evil.example", "notchatgpt.com"],
  grok: ["www.x.com.evil.example", "grok.example"],
  pinterest: ["www.pinterest.com"],
  laoqian: ["hxwk.org"]
};

test("每个站点都声明了 hosts，且能匹配真实域名", () => {
  const settings = defaults.cloneConfig(defaults.DEFAULT_CONFIG);

  assert.deepStrictEqual(Object.keys(settings.sites), Object.keys(EXPECTED_HOSTS));

  for (const [key, hosts] of Object.entries(EXPECTED_HOSTS)) {
    assert.deepStrictEqual(plain(settings.sites[key].hosts), hosts, `${key} 的 hosts 不正确`);

    hosts.forEach((host) => {
      const matched = defaults.matchSite(host, settings);
      assert.ok(matched, `${host} 应匹配到 ${key}`);
      assert.strictEqual(matched.key, key, `${host} 匹配到了错误的站点`);
    });
  }
});

test("manifest 注入的每个域名都能匹配到站点配置", () => {
  const settings = defaults.cloneConfig(defaults.DEFAULT_CONFIG);

  INJECTED_HOSTS.forEach((host) => {
    const matched = defaults.matchSite(host, settings);
    assert.ok(matched, `${host} 没有任何站点配置，设置页开关会失效`);
  });
});

test("子域名匹配，无关域名不误匹配", () => {
  const settings = defaults.cloneConfig(defaults.DEFAULT_CONFIG);

  assert.strictEqual(defaults.matchSite("www.chatgpt.com", settings).key, "chatgpt");
  assert.strictEqual(defaults.matchSite("news.ycombinator.com", settings).key, "hackernews");

  for (const [key, hosts] of Object.entries(NON_MATCHING)) {
    hosts.forEach((host) => {
      const matched = defaults.matchSite(host, settings);
      assert.ok(!matched || matched.key !== key, `${host} 不应匹配到 ${key}`);
    });
  }

  assert.strictEqual(defaults.matchSite("example.com", settings), null);
});

test("旧版存量配置合并后补齐 hosts、新站点与新功能", () => {
  const legacy = {
    prompts: [{ id: "p1", label: "自定义", content: "内容" }],
    sites: {
      chatgpt: {
        name: "ChatGPT",
        enabled: false,
        features: {
          hideFloating: { name: "旧功能", desc: "已废弃", enabled: false },
          adjustInput: { name: "增加输入框高度", desc: "强制输入框高度为 100px", enabled: false }
        }
      },
      grok: {
        name: "Grok (X)",
        enabled: true,
        features: { quickPrompts: { name: "快捷提示词按钮", desc: "", enabled: false } }
      }
    }
  };

  const merged = defaults.mergeSettings(legacy);

  assert.deepStrictEqual(plain(merged.sites.chatgpt.hosts), ["chatgpt.com"], "旧配置要补 hosts");
  assert.strictEqual(merged.sites.chatgpt.enabled, false, "存量开关要保留");
  assert.strictEqual(
    merged.sites.chatgpt.features.adjustInput.enabled,
    false,
    "存量功能开关要保留"
  );
  assert.strictEqual(
    merged.sites.chatgpt.features.hideFloating,
    undefined,
    "已废弃功能不应复活"
  );
  assert.strictEqual(
    merged.sites.chatgpt.features.quickPrompts.enabled,
    true,
    "新增功能要补默认值"
  );
  assert.strictEqual(merged.sites.hackernews.enabled, true, "新增站点要补默认值");
  assert.strictEqual(merged.sites.hackernews.features.theme.value, "default");
  assert.deepStrictEqual(plain(merged.prompts), legacy.prompts, "自定义提示词要保留");
});

test("存量配置里手工塞入的下拉框选项不能覆盖默认选项", () => {
  const merged = defaults.mergeSettings({
    sites: {
      hackernews: {
        features: {
          theme: { type: "select", value: "dark", options: [{ value: "hack", label: "恶意项" }] }
        }
      }
    }
  });

  assert.strictEqual(merged.sites.hackernews.features.theme.value, "dark", "用户选值要保留");
  assert.deepStrictEqual(
    plain(merged.sites.hackernews.features.theme.options.map((o) => o.value)),
    ["default", "dark", "blue", "green", "purple"],
    "选项列表以默认配置为准"
  );
});

test("无配置时返回默认配置且不共享引用", () => {
  const first = defaults.mergeSettings(undefined);
  first.sites.chatgpt.enabled = false;
  first.prompts[0].label = "改坏了";

  const second = defaults.mergeSettings(undefined);
  assert.strictEqual(second.sites.chatgpt.enabled, true, "默认配置不能被就地篡改");
  assert.strictEqual(second.prompts[0].label, "读文章");
});
