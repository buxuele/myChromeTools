# aiTools - 网站增强工具集

为特定网站提供自动化功能和个性化操作的浏览器扩展。

## 功能列表

### ChatGPT (chatgpt.com)
- **输入框高度调整**：将输入框固定为 100px 高度，方便输入长文本
- **快捷提示词按钮**：在输入框上方显示常用提示词按钮（可在侧边栏"提示词管理"中自定义）
  - 读文章：快速插入文章阅读和短评提示词
  - 写推特：插入推特写作风格提示词
  - 小步骤：插入分步指导提示词
  - 搜项目：插入 GitHub 项目搜索提示词
- **隐藏第三方浮动按钮**：在非 ChatGPT 官网上隐藏第三方扩展的"询问 ChatGPT"浮动按钮

### Grok (x.com/i/grok)
- **快捷提示词按钮**：在输入框上方显示常用提示词按钮（与 ChatGPT 共享同一套提示词配置，可在侧边栏"提示词管理"中自定义）

### Pinterest (i.pinimg.com)
- **自动下载原始尺寸图片**：自动将 736x 或 1200x 替换为 originals，下载原始高清图片

### Behance (behance.net)
- 网站增强功能

### Medium (medium.com)
- **隐藏文本选择菜单**：自动隐藏 Medium 的文本选择弹出菜单（强调、回应、分享等按钮）

### Perplexity (perplexity.ai)
- 网站增强功能

### 知乎专栏 (zhuanlan.zhihu.com)
- 网站增强功能

### 老钱博客 (lao-qian.hxwk.org)
- **暗色阅读背景**：自动应用 #91b3b5 背景色，提供更舒适的阅读体验

### Speed Test (speed.measurementlab.net)
- 网站增强功能

### Hacker News (news.ycombinator.com)
- **字体优化**：应用 Nunito 圆体字体，提升阅读体验
- **字体大小调整**：整体字体增大 150%，标题更大更清晰
- **间距优化**：增加新闻条目之间的间距
- **键盘快捷键**：
  - `J/K`：上下导航新闻条目
  - `Enter`：打开选中的新闻
- **自定义主题**：支持多种配色方案（默认、暗色、蓝色、绿色、紫色）

## 项目结构

```
├── manifest.json              # 扩展配置入口
├── background.js              # 后台服务
├── popup.html / popup.js      # 弹出窗口
├── sidepanel.html / sidepanel.js  # 侧边面板（暗色主题）
├── styles/
│   └── sidepanel.css          # 侧边面板样式（暗色主题）
├── images/                    # 图标资源
├── Nunito-fonts/              # Nunito 字体文件
├── content_scripts/           # 内容脚本目录
│   ├── utils.js               # 公共工具函数库
│   ├── chatgpt_enhancer.js    # ChatGPT 增强功能
│   ├── pinterest_content.js   # Pinterest 图片下载
│   ├── behance.js             # Behance 增强
│   ├── medium_content.js      # Medium 菜单隐藏
│   ├── perplexity_content.js  # Perplexity 增强
│   ├── zhihu_content.js       # 知乎增强
│   ├── laoqian_content.js     # 老钱博客背景
│   ├── speed_lab.js           # Speed Test 增强
│   ├── grok_content.js        # Grok 增强
│   ├── guwendao_content.js    # 古文岛增强
│   └── hacker_news/           # Hacker News 美化
│       ├── content.js
│       └── styles.css
└── docs/                      # 文档
    ├── readme.md
    └── todo.md
```

## 安装方法

1. 克隆或下载此项目
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹

## 设置面板

点击浏览器工具栏上的扩展图标，选择"打开详细设置面板"。面板顶部有两个标签页：

### 功能设置
- **站点开关**：启用/禁用特定网站的所有功能
- **功能开关**：单独控制每个功能的开启/关闭
- **搜索设置**：快速查找特定功能
- **导入/导出**：备份和恢复配置（支持 JSON 格式）
- **恢复默认**：一键重置所有设置为默认值

### 提示词管理（默认页面）
- **顶部按钮栏**：所有提示词以按钮形式显示在顶部，点击切换编辑
- **编辑区域**：下方大区域编辑当前选中的提示词
  - 按钮名称：修改按钮显示的文字
  - 提示词内容：编辑完整的提示词文本（支持多行）
- **添加提示词**：点击"+ 添加新提示词"创建新按钮
- **删除提示词**：点击编辑区域右上角的"删除"按钮
- **保存修改**：点击"保存"按钮保存当前提示词
- **自动同步**：ChatGPT 和 Grok 共享同一套提示词配置

## 开发说明

### 添加新功能

1. 在 `manifest.json` 的 `content_scripts` 中添加新的配置：
```json
{
  "matches": ["https://example.com/*"],
  "js": ["content_scripts/example_content.js"]
}
```

2. 在 `content_scripts/` 目录下创建对应的 JS 文件
3. 实现具体功能逻辑

### manifest.json 配置说明

#### matches 用法
- `"matches": ["https://www.google.com/*"]` - 限定某个域名
- `"matches": ["*://*/*"]` - 所有网站
- `"matches": ["<all_urls>"]` - 所有网站

#### run_at 选项
- `"document_start"` - 文档开始加载时
- `"document_end"` - DOM 加载完成时
- `"document_idle"` - 页面空闲时（默认）

## 技术栈

- Manifest V3
- 原生 JavaScript
- Chrome Extension API

## 更新日志

### 2026.02.10 重要更新
- **添加配置系统**：所有 content_scripts 现在支持通过侧边面板开启/关闭功能
- **暗色主题侧边面板**：重写 UI 为暗色主题，移除所有悬浮动画
- **导入/导出配置**：支持将设置导出为 JSON 文件或从文件导入
- **公共工具库**：新增 `utils.js` 提供 waitForElement、observeDOMChanges、getSettings 等公共函数
- **错误处理增强**：添加重试机制和配置热更新支持
- **提示词管理（默认页面）**：重新设计的提示词管理界面
  - 顶部按钮栏快速切换不同提示词
  - 大编辑区域方便修改提示词内容
  - 支持添加、删除、保存提示词
  - ChatGPT 和 Grok 共享同一套提示词配置

### 历史更新
- 合并 Hacker News 美化插件到主扩展
- 添加 ChatGPT 快捷提示词按钮功能
- 添加老钱博客暗色背景支持
- 拆分 content.js 为多个独立文件，便于管理和扩展
- 支持 Pinterest 原始图片下载
- 支持 Medium 文本选择菜单隐藏

## 参考资料

聊天记录: https://x.com/i/grok?conversation=1922691362044117397

图标生成: https://chatgpt.com/c/6824c447-bcb4-8002-a576-4e72aa876c2d
