// 侧边栏 UI，共享配置与配置读取逻辑来自 defaults.js

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 获取设置
async function getSettings() {
  const { settings } = await readState();
  return settings;
}

// 保存设置，写入 storage.local，content scripts 通过 storage.onChanged 热更新
async function saveSettings(settings) {
  await chrome.storage.local.set({ [STORAGE_KEY_SETTINGS]: cloneConfig(settings) });
}

// 快捷提示词按钮全局开关
async function getShowPromptButtons() {
  const { showPromptButtons } = await readState();
  return showPromptButtons;
}

async function setShowPromptButtons(enabled) {
  await chrome.storage.local.set({ [STORAGE_KEY_SHOW_PROMPT_BUTTONS]: enabled });
}

// 渲染全局开关卡片
async function renderGlobalCard(container) {
  const enabled = await getShowPromptButtons();

  const card = document.createElement("div");
  card.className = "site-card";
  card.innerHTML = `
    <div class="site-header">
      <div class="site-title">全局</div>
    </div>
    <div class="feature-list expanded">
      <div class="feature-item">
        <div class="feature-info">
          <div class="feature-name">快捷提示词按钮</div>
          <div class="feature-desc">在 ChatGPT、Grok 和 Gemini 输入框上方显示常用提示词</div>
        </div>
        <label class="switch" style="width: 34px; height: 18px;">
          <input type="checkbox" id="togglePromptButtons" ${enabled ? "checked" : ""}>
          <span class="slider" style="border-radius: 18px;"></span>
        </label>
      </div>
    </div>
  `;
  container.appendChild(card);

  card.querySelector("#togglePromptButtons").addEventListener("change", async (e) => {
    await setShowPromptButtons(e.target.checked);
  });
}

// 渲染单个功能项
function renderFeatureItem(siteKey, featureKey, featureConfig, siteEnabled) {
  const item = document.createElement("div");
  item.className = "feature-item";
  if (!siteEnabled) item.classList.add("disabled");

  const info = document.createElement("div");
  info.className = "feature-info";
  info.innerHTML = `
    <div class="feature-name">${escapeHtml(featureConfig.name)}</div>
    <div class="feature-desc">${escapeHtml(featureConfig.desc || "")}</div>
  `;
  item.appendChild(info);

  if (featureConfig.type === "select") {
    const select = document.createElement("select");
    select.className = "feature-select";
    select.dataset.site = siteKey;
    select.dataset.feature = featureKey;

    (featureConfig.options || []).forEach((option) => {
      const el = document.createElement("option");
      el.value = option.value;
      el.textContent = option.label;
      if (option.value === featureConfig.value) el.selected = true;
      select.appendChild(el);
    });

    item.appendChild(select);
  } else {
    const label = document.createElement("label");
    label.className = "switch";
    label.style.width = "34px";
    label.style.height = "18px";
    label.innerHTML = `
      <input type="checkbox" ${featureConfig.enabled ? "checked" : ""}
             data-site="${siteKey}" data-feature="${featureKey}">
      <span class="slider" style="border-radius: 18px;"></span>
    `;
    item.appendChild(label);
  }

  return item;
}

// 渲染 UI
async function renderSettings() {
  const container = document.getElementById("settingsList");
  container.innerHTML = "";

  const settings = await getSettings();

  await renderGlobalCard(container);

  Object.entries(settings.sites).forEach(([siteKey, siteConfig]) => {
    const card = document.createElement("div");
    card.className = "site-card";

    // 头部（站点开关）
    const header = document.createElement("div");
    header.className = "site-header";
    header.innerHTML = `
      <div class="site-title">${escapeHtml(siteConfig.name)}</div>
      <div class="site-toggle">
        <label class="switch">
          <input type="checkbox" ${siteConfig.enabled ? "checked" : ""} data-site="${siteKey}">
          <span class="slider"></span>
        </label>
      </div>
    `;

    // 子功能列表
    const featureList = document.createElement("div");
    featureList.className = "feature-list expanded";

    Object.entries(siteConfig.features).forEach(([featureKey, featureConfig]) => {
      featureList.appendChild(
        renderFeatureItem(siteKey, featureKey, featureConfig, siteConfig.enabled)
      );
    });

    card.appendChild(header);
    card.appendChild(featureList);
    container.appendChild(card);
  });

  bindEvents(settings);
}

let staticEventsBound = false;

function bindEvents(currentSettings) {
  // 站点开关
  document.querySelectorAll('.site-header input[type="checkbox"]').forEach((input) => {
    input.addEventListener("change", async (e) => {
      const siteKey = e.target.dataset.site;
      currentSettings.sites[siteKey].enabled = e.target.checked;

      const card = e.target.closest(".site-card");
      card.querySelectorAll(".feature-item").forEach((item) => {
        item.classList.toggle("disabled", !e.target.checked);
      });

      await saveSettings(currentSettings);
    });
  });

  // 功能开关
  document.querySelectorAll(".feature-item input[data-site][data-feature]").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const siteKey = e.target.dataset.site;
      const featureKey = e.target.dataset.feature;
      currentSettings.sites[siteKey].features[featureKey].enabled = e.target.checked;
      await saveSettings(currentSettings);
    });
  });

  // 功能下拉框
  document.querySelectorAll(".feature-item select[data-site]").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const siteKey = e.target.dataset.site;
      const featureKey = e.target.dataset.feature;
      currentSettings.sites[siteKey].features[featureKey].value = e.target.value;
      await saveSettings(currentSettings);
    });
  });

  // 静态控件只绑定一次，避免每次渲染重复叠加监听器
  if (staticEventsBound) return;
  staticEventsBound = true;

  // 重置按钮
  document.getElementById("resetAll").addEventListener("click", async () => {
    if (confirm("确定要恢复默认设置吗？")) {
      await saveSettings(cloneConfig(DEFAULT_CONFIG));
      await setShowPromptButtons(true);
      renderSettings();
    }
  });

  // 搜索功能
  document.getElementById("searchInput").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll(".site-card").forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(term) ? "block" : "none";
    });
  });

  // 导出配置
  document.getElementById("exportSettings").addEventListener("click", async () => {
    const settings = await getSettings();
    const payload = { ...settings, showPromptButtons: await getShowPromptButtons() };
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aiTools-config-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // 导入配置按钮点击
  document.getElementById("importSettings").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });

  // 处理文件导入
  document.getElementById("importFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      if (!imported.sites) {
        alert("配置文件格式错误：缺少 sites 字段");
        return;
      }

      if (confirm("导入配置将覆盖当前所有设置，是否继续？")) {
        await saveSettings(mergeSettings(imported));
        if (typeof imported.showPromptButtons === "boolean") {
          await setShowPromptButtons(imported.showPromptButtons);
        }
        renderSettings();
        alert("配置导入成功！");
      }
    } catch (error) {
      alert("导入失败：" + error.message);
    }

    e.target.value = "";
  });
}

// 当前提示词上下文
let currentPromptId = null;
let currentPrompts = [];

// 视图切换
function switchView(view) {
  document.getElementById("tabSettings").classList.toggle("active", view === "settings");
  document.getElementById("tabPrompts").classList.toggle("active", view === "prompts");

  document.getElementById("viewSettings").style.display = view === "settings" ? "block" : "none";
  document.getElementById("viewPrompts").style.display = view === "prompts" ? "block" : "none";

  if (view === "settings") {
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
    if (!currentPromptId || !currentPrompts.find((p) => p.id === currentPromptId)) {
      currentPromptId = currentPrompts[0].id;
    }
    renderPromptEditor();
  } else {
    renderEmptyPromptEditor();
  }
}

// 渲染提示词标签按钮
function renderPromptTabs() {
  const container = document.getElementById("promptTabs");
  container.innerHTML = "";

  currentPrompts.forEach((prompt) => {
    const btn = document.createElement("button");
    btn.className = "prompt-tab-btn" + (prompt.id === currentPromptId ? " active" : "");
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
  const container = document.getElementById("promptEditor");
  const prompt = currentPrompts.find((p) => p.id === currentPromptId);

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
      <input type="text" id="promptLabel" value="${escapeHtml(prompt.label)}" placeholder="输入按钮显示的名称">
    </div>
    <div class="prompt-field">
      <label>提示词内容</label>
      <textarea id="promptContent" placeholder="输入提示词内容">${escapeHtml(prompt.content)}</textarea>
    </div>
    <button id="addNewPrompt" class="btn-editor add">+ 添加新提示词</button>
  `;

  document.getElementById("saveCurrentPrompt").onclick = saveCurrentPrompt;
  document.getElementById("deleteCurrentPrompt").onclick = deleteCurrentPrompt;
  document.getElementById("addNewPrompt").onclick = addNewPrompt;
}

// 渲染空状态
function renderEmptyPromptEditor() {
  const container = document.getElementById("promptEditor");
  container.innerHTML = `
    <div class="prompt-empty">
      <p>暂无提示词</p>
      <button id="addFirstPrompt" class="btn-editor add" style="width: auto; margin-top: 16px;">+ 添加第一个提示词</button>
    </div>
  `;
  document.getElementById("addFirstPrompt").onclick = addNewPrompt;
}

// 保存当前提示词
async function saveCurrentPrompt() {
  const label = document.getElementById("promptLabel").value.trim();
  const content = document.getElementById("promptContent").value.trim();

  if (!label) {
    alert("按钮名称不能为空");
    return;
  }

  const settings = await getSettings();
  const promptIndex = settings.prompts.findIndex((p) => p.id === currentPromptId);

  if (promptIndex >= 0) {
    settings.prompts[promptIndex] = {
      id: currentPromptId,
      label: label,
      content: content
    };
    await saveSettings(settings);

    currentPrompts = settings.prompts;
    renderPromptTabs();

    const btn = document.getElementById("saveCurrentPrompt");
    const originalText = btn.textContent;
    btn.textContent = "已保存";
    btn.style.background = "#45a049";
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = "";
    }, 1500);
  }
}

// 删除当前提示词
async function deleteCurrentPrompt() {
  if (!confirm("确定要删除这个提示词吗？")) return;

  const settings = await getSettings();
  settings.prompts = settings.prompts.filter((p) => p.id !== currentPromptId);
  await saveSettings(settings);

  currentPrompts = settings.prompts;
  currentPromptId = currentPrompts.length > 0 ? currentPrompts[0].id : null;

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
  const newId = "prompt-" + Date.now();

  settings.prompts.push({
    id: newId,
    label: "新提示词",
    content: ""
  });

  await saveSettings(settings);
  currentPrompts = settings.prompts;
  currentPromptId = newId;

  renderPromptTabs();
  renderPromptEditor();
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("tabSettings").addEventListener("click", () => switchView("settings"));
  document.getElementById("tabPrompts").addEventListener("click", () => switchView("prompts"));

  renderPrompts();
});
