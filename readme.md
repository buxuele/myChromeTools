## 更新记录

- 6 月 1 日，新增: Google Gemini 自动保存聊天功能。

---

## 功能列表（按网站）

### Grok (`grok.com` 和 `x.com/i/grok`)

- **自动界面调整 (`grok_content.js`)**:
  - 自动点击“专注模式”按钮，以便更好地查看对话。
  - 自动调整输入框的高度至 `86px` 并将光标聚焦在输入框内，方便立即输入。
- **快捷键插入预设文本 (`grok_insert_text.js` & `background.js`)**:
  - 使用快捷键 `Ctrl+Q` (Windows/Linux) 或 `Command+Shift+G` (Mac)。
  - 在 Grok 的输入框中自动插入预设的中文提示：“你是一名计算机专家，编程高手。
我是一名普通程序员。请用中文来解释。

”。
- **HTML转Markdown (`turndown.js`)**:
  - 项目中包含了 `turndown.js` 库，用于将 HTML 内容转换为 Markdown 格式。此功能目前在 Grok 页面未激活使用。

### Pinterest 图片 (`i.pinimg.com`)

- **自动获取原图 (`pinterest_content.js`)**:
  - 当浏览 Pinterest 图片页面时 (例如 `i.pinimg.com/.../736x/...jpg` 或 `i.pinimg.com/.../1200x/...jpg`)，脚本会自动将 URL 中的图片尺寸（如 `736x`, `1200x`）替换为 `originals`。
  - 页面会自动跳转到包含原始尺寸图片的 URL。
- **自动下载图片 (`pinterest_content.js` & `background.js`)**:
  - 在跳转到原始尺寸图片的 URL 后，脚本会自动触发浏览器下载该图片。

### Google AI Studio (`aistudio.google.com/prompts/`)

- **自动保存Prompt (`gemini_auto_save.js`)**:
  - 在 Google AI Studio 的 Prompt 编辑页面，脚本会每隔 30 秒自动尝试点击“保存 Prompt”按钮。
  - 此功能有助于防止在长时间编辑 Prompt 时意外丢失未保存的更改。

### 知乎 (`zhihu.com` 和 `zhuanlan.zhihu.com`)

- **隐藏特定SVG图标 (`zhihu_hide_svg.js`)**:
  - 在知乎主站及专栏文章页面，自动隐藏所有 class 为 `ZDI--FourPointedStar16` 的 SVG 元素（四角星图标）。
  - 此脚本会定时运行以处理动态加载的内容。

### 所有网站通用功能

- **自动滚动页面 (`scroll_control.js` & `popup.js`)**:
  - 通过浏览器右上角的扩展图标打开控制面板。
  - **多种滚动速度**: 提供正常速度、5 倍速、10 倍速三种自动向下滚动页面的选项。
  - **停止滚动**: 可以随时停止自动滚动。
  - **自动刷新与继续滚动**:
    - 可选择开启“自动刷新”功能。开启后，页面会在滚动约 3 分钟后自动执行以下操作：停止滚动 -> 等待 2 秒 -> 平滑滚动回页面顶部 -> 等待 2 秒 -> 刷新页面。
    - 刷新后，如果距离上次刷新操作在 5 分钟内，会自动恢复之前的滚动速度和自动刷新状态。
  - **状态保存**: 滚动速度和自动刷新状态会保存在会话中，刷新后能自动恢复（5 分钟有效）。
  - **域名显示与限制**: 控制面板会显示当前域名。在某些特殊页面（如 `chrome://` 页面、扩展管理页面、本地文件 `file://` 等）无法激活此功能。

---

## 项目说明

### 文件的作用

- `manifest.json` 是入口，所有其他文件的运行都依赖于它的配置。
- `background.js`：处理后台任务，如快捷键监听、跨脚本通信、图片下载等。

### 目的

此项目旨在某些特定网站上，进行个性化的增强操作，提升用户体验。

聊天记录: `https://x.com/i/grok?conversation=1922691362044117397`

### 新增功能点子 (待实现或细化)

- Pinterest 自动下载原始尺寸图片:
  - 将 `736x` 或 `1200x` 自动替换为 `originals`。
- Grok 输入框优化:
  - 增加输入框的高度 (例如增加 `25px`)。
  - 光标自动聚焦在输入框内。

### 图标设计参考

相关讨论: `https://chatgpt.com/c/6824c447-bcb4-8002-a576-4e72aa876c2d`

要求如下：
1. **图标风格偏好**: 积极向上。
2. **是否希望包含字母**: "工具"二字。
3. **配色喜好**: 彩虹色，多种颜色。
4. **是否希望图中有工具元素**: 螺丝刀、扳手、工具箱等图案。
5. **图标尺寸需求**: `512x512`。

### 项目创建与配置基础

#### 1. 创建步骤
1. 新建 `manifest.json` 文件并填入基本配置。
   - `"manifest_version": 3,` (注意：版本 2 已被废弃)。
2. 新建图片文件夹 (如 `icons`) 并准备不同尺寸的扩展图标。
3. 打开 Chrome 浏览器，导航至 `chrome://extensions/`，启用“开发者模式”，然后点击“加载已解压的扩展程序”并选择插件文件夹。

#### 2. `manifest.json` 关键配置说明

##### a. `matches` (内容脚本注入目标)
- `"matches": ["https://www.google.com/*"],` (仅限特定域名)。
- `"matches": ["*://*/*"],` (所有 HTTP 和 HTTPS 网站)。
- `"matches": ["<all_urls>"],` (所有类型的 URL，包括 `file://` 等)。

##### b. `run_at` (内容脚本注入时机)
- `"document_start"`: DOM 构建之前，CSS 应用之后。
- `"document_end"`: DOM 加载完成之后，图片等子资源加载之前 (类似 `DOMContentLoaded`)。
- `"document_idle"`: `document_end` 之后，或窗口 `load` 事件触发之后，浏览器选择合适的时机注入。这是默认值。

---

### 开发笔记与颜色参考

Sublime Text 编辑器默认主题颜色参考：
- 背景 (bg): `#303841` / `rgba(48,56,65,255)`
- 文本 (text): `#d8dfea` / `rgba(216,223,234,255)`
