# aiTools - 网站增强工具集

为特定网站提供自动化功能和个性化操作的浏览器扩展。

## 功能列表

### ChatGPT (chatgpt.com)
- **输入框高度调整**：将输入框固定为 100px 高度，方便输入长文本
- **快捷提示词按钮**：在输入框上方显示常用提示词按钮
  - 读文章：快速插入文章阅读和短评提示词
  - 写推特：插入推特写作风格提示词
  - 小步骤：插入分步指导提示词
  - 搜项目：插入 GitHub 项目搜索提示词
- **隐藏第三方浮动按钮**：在非 ChatGPT 官网上隐藏第三方扩展的"询问 ChatGPT"浮动按钮

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

## 项目结构

```
├── manifest.json           # 扩展配置入口
├── background.js          # 后台服务
├── chatgpt_enhancer.js    # ChatGPT 增强功能
├── pinterest_content.js   # Pinterest 图片下载
├── behance.js            # Behance 增强
├── medium_content.js     # Medium 菜单隐藏
├── perplexity_content.js # Perplexity 增强
├── zhihu_content.js      # 知乎增强
├── laoqian_content.js    # 老钱博客背景
├── speed_lab.js          # Speed Test 增强
└── images/               # 图标资源
```

## 安装方法

1. 克隆或下载此项目
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹

## 开发说明

### 添加新功能

1. 在 `manifest.json` 的 `content_scripts` 中添加新的配置：
```json
{
  "matches": ["https://example.com/*"],
  "js": ["example_content.js"]
}
```

2. 创建对应的 JS 文件（如 `example_content.js`）
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

- 添加 ChatGPT 快捷提示词按钮功能
- 添加老钱博客暗色背景支持
- 拆分 content.js 为多个独立文件，便于管理和扩展
- 支持 Pinterest 原始图片下载
- 支持 Medium 文本选择菜单隐藏

## 参考资料

聊天记录: https://x.com/i/grok?conversation=1922691362044117397

图标生成: https://chatgpt.com/c/6824c447-bcb4-8002-a576-4e72aa876c2d
