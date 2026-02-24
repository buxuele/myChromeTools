
// 默认配置
const DEFAULT_CONFIG = {
  prompts: [
    {
      id: "read-article",
      label: "读文章",
      content: "### 读文章\n我们继续读文章。对于下面的每个文章，我给出链接，你给出 3-5句短评，给出批评意见，2-3句整体，口语化，日常话，我们是老朋友那种\n\n下面开始"
    },
    {
      id: "write-tweet",
      label: "写推特",
      content: "### 写推特帖子\n我的偏好:\n- 用最短、最接地气的日常口语回答，严禁任何心理学/大脑术语\n- 输出控制在用户指定字数以内\n- 严格按用户给的示例句子风格和内容走，不要自行添加解释、建议或多余内容。"
    },
    {
      id: "small-steps",
      label: "小步骤",
      content: "### 指导操作步骤\n请不要一下子给出这么多步骤,每次给出小步骤！你输出太多太乱，我容易失去耐心，后果非常严重。\n\n禁止基于经验的瞎猜，必须依据项目实际目录结构和代码逻辑给出结论。\n\n比如，当前在那个文件夹目录，执行哪个命令\n比如，在哪个位置执行这个命令？？ npm run build"
    },
    {
      id: "search-project",
      label: "搜项目",
      content: "### 搜索 github 项目\n帮我在 github 上搜一下，这种项目:\n一键发送帖子，尤其是 x, 知乎，抖音，小红书这种平台\n最好是能一键发送到多个平台。\n\n要比较新的，用户多的，有效的，好用好评的。"
    }
  ],
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
    grok: {
      name: "Grok (X)",
      enabled: true,
      features: {
        quickPrompts: {
          name: "快捷提示词按钮",
          desc: "在输入框上方显示常用提示词",
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
    medium: {
      name: "Medium",
      enabled: true,
      features: {
        hideFloat: {
          name: "隐藏文本选择菜单",
          desc: "隐藏选中文本后的弹出菜单",
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
    behance: {
      name: "Behance",
      enabled: true,
      features: {
        enhancement: {
          name: "网站增强",
          desc: "Behance 网站增强功能",
          enabled: true,
        },
      },
    },
    laoqian: {
      name: "老钱博客",
      enabled: true,
      features: {
        darkBackground: {
          name: "暗色阅读背景",
          desc: "应用舒适的阅读背景色",
          enabled: true,
        },
      },
    },
    guwendao: {
      name: "古文岛",
      enabled: true,
      features: {
        enhancement: {
          name: "网站增强",
          desc: "古文岛网站增强功能",
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

  // 导出配置
  document.getElementById('exportSettings').addEventListener('click', async () => {
    const settings = await getSettings();
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aiTools-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // 导入配置按钮点击
  document.getElementById('importSettings').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  // 处理文件导入
  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      if (!imported.sites) {
        alert('配置文件格式错误：缺少 sites 字段');
        return;
      }
      
      if (confirm('导入配置将覆盖当前所有设置，是否继续？')) {
        // 合并默认配置，确保 prompts 字段存在
        const mergedSettings = {
          ...DEFAULT_CONFIG,
          ...imported,
          sites: {
            ...DEFAULT_CONFIG.sites,
            ...imported.sites
          }
        };
        await saveSettings(mergedSettings);
        renderSettings();
        alert('配置导入成功！');
      }
    } catch (error) {
      alert('导入失败：' + error.message);
    }
    
    e.target.value = '';
  });
}

// 当前视图
let currentView = 'prompts';
let currentPromptId = null;
let currentPrompts = [];

// 视图切换
function switchView(view) {
    currentView = view;
    
    document.getElementById('tabSettings').classList.toggle('active', view === 'settings');
    document.getElementById('tabPrompts').classList.toggle('active', view === 'prompts');
    
    document.getElementById('viewSettings').style.display = view === 'settings' ? 'block' : 'none';
    document.getElementById('viewPrompts').style.display = view === 'prompts' ? 'block' : 'none';
    
    if (view === 'settings') {
        renderSettings();
    } else {
        renderPrompts();
    }
}

// 渲染提示词管理界面
async function renderPrompts() {
    const settings = await getSettings();
    currentPrompts = settings.prompts || DEFAULT_CONFIG.prompts;
    
    renderPromptTabs();
    
    if (currentPrompts.length > 0) {
        if (!currentPromptId || !currentPrompts.find(p => p.id === currentPromptId)) {
            currentPromptId = currentPrompts[0].id;
        }
        renderPromptEditor();
    } else {
        renderEmptyPromptEditor();
    }
}

// 渲染提示词标签按钮
function renderPromptTabs() {
    const container = document.getElementById('promptTabs');
    container.innerHTML = '';
    
    currentPrompts.forEach(prompt => {
        const btn = document.createElement('button');
        btn.className = 'prompt-tab-btn' + (prompt.id === currentPromptId ? ' active' : '');
        btn.textContent = prompt.label;
        btn.dataset.id = prompt.id;
        btn.onclick = () => {
            currentPromptId = prompt.id;
            renderPromptTabs();
            renderPromptEditor();
        };
        container.appendChild(btn);
    });
}

// 渲染提示词编辑器
function renderPromptEditor() {
    const container = document.getElementById('promptEditor');
    const prompt = currentPrompts.find(p => p.id === currentPromptId);
    
    if (!prompt) {
        renderEmptyPromptEditor();
        return;
    }
    
    container.innerHTML = `
        <div class="prompt-editor-header">
            <span class="prompt-editor-title">编辑提示词</span>
            <div class="prompt-editor-actions">
                <button id="deleteCurrentPrompt" class="btn-editor delete">删除</button>
                <button id="saveCurrentPrompt" class="btn-editor save">保存</button>
            </div>
        </div>
        <div class="prompt-field">
            <label>按钮名称</label>
            <input type="text" id="promptLabel" value="${prompt.label}" placeholder="输入按钮显示的名称">
        </div>
        <div class="prompt-field">
            <label>提示词内容</label>
            <textarea id="promptContent" placeholder="输入提示词内容">${prompt.content}</textarea>
        </div>
        <button id="addNewPrompt" class="btn-editor add">+ 添加新提示词</button>
    `;
    
    // 绑定事件
    document.getElementById('saveCurrentPrompt').onclick = saveCurrentPrompt;
    document.getElementById('deleteCurrentPrompt').onclick = deleteCurrentPrompt;
    document.getElementById('addNewPrompt').onclick = addNewPrompt;
}

// 渲染空状态
function renderEmptyPromptEditor() {
    const container = document.getElementById('promptEditor');
    container.innerHTML = `
        <div class="prompt-empty">
            <div class="prompt-empty-icon">📝</div>
            <p>暂无提示词</p>
            <button id="addFirstPrompt" class="btn-editor add" style="width: auto; margin-top: 16px;">+ 添加第一个提示词</button>
        </div>
    `;
    document.getElementById('addFirstPrompt').onclick = addNewPrompt;
}

// 保存当前提示词
async function saveCurrentPrompt() {
    const label = document.getElementById('promptLabel').value.trim();
    const content = document.getElementById('promptContent').value.trim();
    
    if (!label) {
        alert('按钮名称不能为空');
        return;
    }
    
    const settings = await getSettings();
    const promptIndex = settings.prompts.findIndex(p => p.id === currentPromptId);
    
    if (promptIndex >= 0) {
        settings.prompts[promptIndex] = {
            id: currentPromptId,
            label: label,
            content: content
        };
        await saveSettings(settings);
        
        // 刷新显示
        currentPrompts = settings.prompts;
        renderPromptTabs();
        
        // 显示成功提示
        const btn = document.getElementById('saveCurrentPrompt');
        const originalText = btn.textContent;
        btn.textContent = '已保存';
        btn.style.background = '#45a049';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1500);
    }
}

// 删除当前提示词
async function deleteCurrentPrompt() {
    if (!confirm('确定要删除这个提示词吗？')) return;
    
    const settings = await getSettings();
    settings.prompts = settings.prompts.filter(p => p.id !== currentPromptId);
    await saveSettings(settings);
    
    currentPrompts = settings.prompts;
    if (currentPrompts.length > 0) {
        currentPromptId = currentPrompts[0].id;
    } else {
        currentPromptId = null;
    }
    
    renderPromptTabs();
    if (currentPromptId) {
        renderPromptEditor();
    } else {
        renderEmptyPromptEditor();
    }
}

// 添加新提示词
async function addNewPrompt() {
    const settings = await getSettings();
    const newId = 'prompt-' + Date.now();
    
    settings.prompts.push({
        id: newId,
        label: '新提示词',
        content: ''
    });
    
    await saveSettings(settings);
    currentPrompts = settings.prompts;
    currentPromptId = newId;
    
    renderPromptTabs();
    renderPromptEditor();
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('tabSettings').addEventListener('click', () => switchView('settings'));
    document.getElementById('tabPrompts').addEventListener('click', () => switchView('prompts'));
    
    renderPrompts();
});
