// 全局默认配置与配置读取，content scripts 与 sidepanel 共用
// 必须先于 utils.js 和 sidepanel.js 加载

const STORAGE_KEY_SETTINGS = "aiToolsSettings";
const STORAGE_KEY_SHOW_PROMPT_BUTTONS = "showPromptButtons";

const DEFAULT_PROMPTS = [
  {
    id: "read-article",
    label: "读文章",
    content: "### 读文章\n我们继续读文章。对于下面的每个文章，我给出链接，你给出 3-5句短评，给出批评意见，2-3句整体，口语化，日常话，我们是老朋友那种\n\n下面开始"
  },
  {
    id: "write-tweet",
    label: "写推特",
    content: "### 写推特帖子\n我的偏好:\n- 用最短、最接地气的日常口语回答，严禁任何心理学/大脑术语\n- 输出控制在用户指定字数以内\n- 严格按照用户给的示例句子风格走，不要自行添加解释、建议或多余内容。"
  },
  {
    id: "small-steps",
    label: "小步骤",
    content: "### 指导操作步骤\n请不要一下子给出这么多步骤,每次给出小步骤！你输出太多太乱，我容易失去耐心，后果非常严重。\n\n禁止基于经验的瞎猜，必须依据项目实际目录结构和代码逻辑给出结论。\n\n比如，当前在那个文件夹目录，执行哪个命令\n比如，在什么位置执行这个命令？？ npm run build"
  },
  {
    id: "search-project",
    label: "搜项目",
    content: "### 搜索 github 项目\n帮我在 github 上搜一下，这种项目:\n一键发送帖子，尤其是 x， 知乎，抖音，小红书这种平台\n最好是一键发送到多个平台。\n\n要比较新的，用户多的，有效的，好用好评的。"
  }
];

const DEFAULT_CONFIG = {
  prompts: DEFAULT_PROMPTS,
  sites: {
    chatgpt: {
      name: "ChatGPT",
      hosts: ["chatgpt.com"],
      enabled: true,
      features: {
        quickPrompts: {
          name: "快捷提示词按钮",
          desc: "在输入框上方显示常用提示词",
          enabled: true
        },
        adjustInput: {
          name: "增加输入框高度",
          desc: "强制输入框高度为 100px",
          enabled: true
        }
      }
    },
    grok: {
      name: "Grok (X)",
      hosts: ["x.com"],
      enabled: true,
      features: {
        quickPrompts: {
          name: "快捷提示词按钮",
          desc: "在输入框上方显示常用提示词",
          enabled: true
        }
      }
    },
    gemini: {
      name: "Gemini",
      hosts: ["gemini.google.com"],
      enabled: true,
      features: {
        quickPrompts: {
          name: "快捷提示词按钮",
          desc: "在输入框上方显示常用提示词",
          enabled: true
        }
      }
    },
    zhihu: {
      name: "知乎",
      hosts: ["zhuanlan.zhihu.com"],
      enabled: true,
      features: {
        showTime: {
          name: "显示发布时间",
          desc: "在标题旁直接显示时间",
          enabled: true
        },
        hideFloat: {
          name: "隐藏操作栏",
          desc: "隐藏选中文本后的浮动菜单",
          enabled: true
        }
      }
    },
    medium: {
      name: "Medium",
      hosts: ["medium.com", "levelup.gitconnected.com"],
      enabled: true,
      features: {
        hideFloat: {
          name: "隐藏文本选择菜单",
          desc: "隐藏选中文本后的弹出菜单",
          enabled: true
        }
      }
    },
    perplexity: {
      name: "Perplexity",
      hosts: ["perplexity.ai"],
      enabled: true,
      features: {
        hideFloat: {
          name: "隐藏浮动元素",
          desc: "隐藏不必要的悬浮按钮",
          enabled: true
        }
      }
    },
    pinterest: {
      name: "Pinterest",
      hosts: ["i.pinimg.com"],
      enabled: true,
      features: {
        originalImage: {
          name: "下载原图",
          desc: "自动替换为高清原图并下载",
          enabled: true
        }
      }
    },
    behance: {
      name: "Behance",
      hosts: ["behance.net"],
      enabled: true,
      features: {
        enhancement: {
          name: "网站增强",
          desc: "修复导航与轮播的定位问题",
          enabled: true
        }
      }
    },
    laoqian: {
      name: "老钱博客",
      hosts: ["lao-qian.hxwk.org"],
      enabled: true,
      features: {
        darkBackground: {
          name: "暗色阅读背景",
          desc: "应用舒适的阅读背景色",
          enabled: true
        }
      }
    },
    guwendao: {
      name: "古文岛",
      hosts: ["guwendao.net"],
      enabled: true,
      features: {
        enhancement: {
          name: "网站增强",
          desc: "隐藏爱画词工具条",
          enabled: true
        }
      }
    },
    speedlab: {
      name: "Speed Test",
      hosts: ["speed.measurementlab.net"],
      enabled: true,
      features: {
        autoStart: {
          name: "自动开始测速",
          desc: "自动勾选隐私同意并点击开始",
          enabled: true
        }
      }
    },
    hackernews: {
      name: "Hacker News",
      hosts: ["news.ycombinator.com"],
      enabled: true,
      features: {
        shortcuts: {
          name: "键盘快捷键",
          desc: "J 与 K 上下导航，Enter 打开新闻",
          enabled: true
        },
        newTabLinks: {
          name: "外链新标签",
          desc: "外部链接在新标签页打开",
          enabled: true
        },
        font: {
          name: "字体",
          desc: "标题与正文字体方案",
          type: "select",
          value: "nunito",
          options: [
            { value: "nunito", label: "Nunito 圆体" },
            { value: "system", label: "系统字体" }
          ]
        },
        spacing: {
          name: "行距",
          desc: "新闻条目的行距",
          type: "select",
          value: "normal",
          options: [
            { value: "compact", label: "紧凑" },
            { value: "normal", label: "标准" },
            { value: "relaxed", label: "宽松" }
          ]
        },
        theme: {
          name: "主题",
          desc: "页面配色方案",
          type: "select",
          value: "default",
          options: [
            { value: "default", label: "默认" },
            { value: "dark", label: "暗色" },
            { value: "blue", label: "蓝色" },
            { value: "green", label: "绿色" },
            { value: "purple", label: "紫色" }
          ]
        }
      }
    }
  }
};

// 深拷贝，避免默认配置被就地篡改
function cloneConfig(data) {
  return JSON.parse(JSON.stringify(data));
}

// 用存量配置覆盖默认配置，缺失的站点、功能与 hosts 一律回退到默认值
function mergeSettings(stored) {
  const base = cloneConfig(DEFAULT_CONFIG);
  if (!stored || typeof stored !== "object") return base;

  if (Array.isArray(stored.prompts) && stored.prompts.length > 0) {
    base.prompts = stored.prompts;
  }

  const storedSites = stored.sites || {};
  for (const [key, site] of Object.entries(storedSites)) {
    const def = base.sites[key];
    if (!def) {
      base.sites[key] = site;
      continue;
    }

    const merged = { ...def, ...site, hosts: def.hosts, features: {} };
    for (const [featureKey, featureDef] of Object.entries(def.features)) {
      const storedFeature = (site.features || {})[featureKey];
      if (!storedFeature) {
        merged.features[featureKey] = featureDef;
        continue;
      }
      merged.features[featureKey] = {
        ...featureDef,
        ...storedFeature,
        ...(featureDef.options ? { options: featureDef.options } : {})
      };
    }
    base.sites[key] = merged;
  }

  return base;
}

// 按 hosts 精确匹配当前站点，支持子域名
function matchSite(hostname, settings) {
  const host = String(hostname || "").toLowerCase();
  for (const [key, site] of Object.entries(settings.sites || {})) {
    const hit = (site.hosts || []).some((h) => host === h || host.endsWith("." + h));
    if (hit) return { key, ...site };
  }
  return null;
}

// 读取配置，storage.local 优先，缺失时回退 storage.sync，保证旧数据平滑迁移
async function readState() {
  const keys = [STORAGE_KEY_SETTINGS, STORAGE_KEY_SHOW_PROMPT_BUTTONS];
  const local = await chrome.storage.local.get(keys);
  let settings = local[STORAGE_KEY_SETTINGS];
  let showPromptButtons = local[STORAGE_KEY_SHOW_PROMPT_BUTTONS];

  if (settings === undefined || showPromptButtons === undefined) {
    const sync = await chrome.storage.sync.get(keys);
    if (settings === undefined) settings = sync[STORAGE_KEY_SETTINGS];
    if (showPromptButtons === undefined) showPromptButtons = sync[STORAGE_KEY_SHOW_PROMPT_BUTTONS];
  }

  return {
    settings: mergeSettings(settings),
    showPromptButtons: showPromptButtons !== false
  };
}
