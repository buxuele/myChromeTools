
// 默认配置
const DEFAULT_CONFIG = {
  sites: {
    chatgpt: {
      name: "ChatGPT",
      enabled: true,
      features: {
        hideFloating: {
          name: "隐藏浮动按钮",
          desc: "隐藏第三方插件的浮动按钮",
          enabled: true,
        },
        adjustInput: {
          name: "增加输入框高度",
          desc: "强制输入框高度为 100px",
          enabled: true,
        },
      },
    },
    zhihu: {
      name: "知乎",
      enabled: true,
      features: {
        showTime: {
          name: "显示发布时间",
          desc: "在标题旁直接显示时间",
          enabled: true,
        },
        hideFloat: {
          name: "隐藏操作栏",
          desc: "隐藏选中文本后的浮动菜单",
          enabled: true,
        },
      },
    },
    perplexity: {
      name: "Perplexity",
      enabled: true,
      features: {
        hideFloat: {
          name: "隐藏浮动元素",
          desc: "隐藏不必要的悬浮按钮",
          enabled: true,
        },
      },
    },
    pinterest: {
      name: "Pinterest",
      enabled: true,
      features: {
        originalImage: {
          name: "下载原图",
          desc: "自动替换为高清原图",
          enabled: true,
        },
      },
    },
  },
};

// 获取设置
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("aiToolsSettings", (result) => {
      resolve(result.aiToolsSettings || DEFAULT_CONFIG);
    });
  });
}

// 保存设置
async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ aiToolsSettings: settings }, () => {
      resolve();
      // 通知所有标签页更新
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            type: "SETTINGS_UPDATED",
            settings: settings,
          }).catch(() => {}); // 忽略连接错误
        });
      });
    });
  });
}

// 渲染 UI
async function renderSettings() {
  const container = document.getElementById("settingsList");
  container.innerHTML = "";
  
  const settings = await getSettings();

  Object.entries(settings.sites).forEach(([siteKey, siteConfig]) => {
    const card = document.createElement("div");
    card.className = "site-card";

    // 头部（站点开关）
    const header = document.createElement("div");
    header.className = "site-header";
    header.innerHTML = `
      <div class="site-title">${siteConfig.name}</div>
      <div class="site-toggle">
        <label class="switch">
          <input type="checkbox" ${siteConfig.enabled ? "checked" : ""} data-site="${siteKey}">
          <span class="slider"></span>
        </label>
      </div>
    `;

    // 头部点击展开/折叠功能列表
    // 注意：点击开关时不应触发折叠
    // header.addEventListener('click', (e) => {
    //     if (e.target.tagName !== 'INPUT' && e.target.className !== 'slider') {
    //         const list = card.querySelector('.feature-list');
    //         list.classList.toggle('expanded');
    //     }
    // });
    
    // 子功能列表
    const featureList = document.createElement("div");
    featureList.className = "feature-list expanded"; // 默认展开

    Object.entries(siteConfig.features).forEach(([featureKey, featureConfig]) => {
      const item = document.createElement("div");
      item.className = "feature-item";
      if (!siteConfig.enabled) item.classList.add("disabled");

      item.innerHTML = `
        <div class="feature-info">
          <div class="feature-name">${featureConfig.name}</div>
          <div class="feature-desc">${featureConfig.desc}</div>
        </div>
        <label class="switch" style="width: 34px; height: 18px;">
           <input type="checkbox" ${featureConfig.enabled ? "checked" : ""} 
                  data-site="${siteKey}" data-feature="${featureKey}">
           <span class="slider" style="border-radius: 18px;"></span>
        </label>
      `;
      featureList.appendChild(item);
    });

    card.appendChild(header);
    card.appendChild(featureList);
    container.appendChild(card);
  });

  // 绑定事件
  bindEvents(settings);
}

function bindEvents(currentSettings) {
  // 站点开关
  document.querySelectorAll('.site-header input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', async (e) => {
      const siteKey = e.target.dataset.site;
      currentSettings.sites[siteKey].enabled = e.target.checked;
      
      // 更新 UI 状态（禁用/启用子项）
      const card = e.target.closest('.site-card');
      const items = card.querySelectorAll('.feature-item');
      items.forEach(item => {
        if (e.target.checked) item.classList.remove('disabled');
        else item.classList.add('disabled');
      });

      await saveSettings(currentSettings);
    });
  });

  // 功能开关
  document.querySelectorAll('.feature-item input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', async (e) => {
      const siteKey = e.target.dataset.site;
      const featureKey = e.target.dataset.feature;
      currentSettings.sites[siteKey].features[featureKey].enabled = e.target.checked;
      await saveSettings(currentSettings);
    });
  });
  
  // 重置按钮
  document.getElementById('resetAll').addEventListener('click', async () => {
    if(confirm('确定要恢复默认设置吗？')) {
        await saveSettings(DEFAULT_CONFIG);
        renderSettings();
    }
  });

  // 搜索功能
  document.getElementById('searchInput').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.site-card').forEach(card => {
          const text = card.textContent.toLowerCase();
          if(text.includes(term)) {
              card.style.display = 'block';
          } else {
              card.style.display = 'none';
          }
      });
  });
}

// 初始化
document.addEventListener("DOMContentLoaded", renderSettings);
