# aiTools - 网站增强工具集

为特定网站提供自动化功能和个性化操作的浏览器扩展。

## 功能列表

### ChatGPT，chatgpt.com
- 输入框高度调整，固定为 100px，方便输入长文本
- 快捷提示词按钮，在输入框上方显示常用提示词
  - 读文章，快速插入文章阅读和短评提示词
  - 写推特，插入推特写作风格提示词
  - 小步骤，插入分步指导提示词
  - 搜项目，插入 GitHub 项目搜索提示词

### Grok，x.com/i/grok
- 快捷提示词按钮，与 ChatGPT 共享同一套提示词配置
- 自动获取焦点，侦测异步加载的输入框并巡逻夺回焦点

### Gemini，gemini.google.com
- 快捷提示词按钮，适配富文本输入框，共享同一套提示词配置

### Pinterest，i.pinimg.com
- 自动把 736x 与 1200x 地址替换为 originals 并下载高清原图，按地址去重

### Behance，behance.net
- 修复导航固定与轮播定位问题

### Medium，medium.com 与 levelup.gitconnected.com
- 隐藏文本选择弹出菜单

### Perplexity，perplexity.ai
- 隐藏不必要的浮动元素

### 知乎专栏，zhuanlan.zhihu.com
- 标题旁显示发布时间
- 隐藏选中文本后的浮动菜单

### 老钱博客，lao-qian.hxwk.org
- 暗色阅读背景

### 古文岛，guwendao.net
- 隐藏爱画词工具条

### Speed Test，speed.measurementlab.net
- 自动勾选隐私同意并点击开始测速

### Hacker News，news.ycombinator.com
- Nunito 圆体字体，整体字号放大
- 字体、行距、主题三项在设置页用下拉框切换
- J 与 K 上下导航，Enter 打开选中的新闻，输入框内不劫持按键
- 外部链接在新标签页打开
- 站点开关关闭时完全卸载样式，还原原生页面

## 项目结构

```
├── manifest.json              # 扩展配置入口
├── defaults.js                # 共享默认配置与配置读取，必须最先加载
├── background.js              # 后台服务，图标点击开侧边栏与配置迁移
├── sidepanel.html / sidepanel.js  # 侧边面板
├── styles/
│   └── sidepanel.css          # 侧边面板样式
├── images/                    # 图标资源
├── Nunito-fonts/              # Nunito 字体文件
├── content_scripts/           # 内容脚本目录
│   ├── utils.js               # 公共工具函数库
│   ├── chatgpt_enhancer.js    # ChatGPT 增强
│   ├── gemini_content.js      # Gemini 增强
│   ├── grok_content.js        # Grok 增强
│   ├── pinterest_content.js   # Pinterest 原图下载
│   ├── behance.js             # Behance 定位修复
│   ├── medium_content.js      # Medium 菜单隐藏
│   ├── perplexity_content.js  # Perplexity 浮动元素隐藏
│   ├── zhihu_content.js       # 知乎增强
│   ├── laoqian_content.js     # 老钱博客背景
│   ├── guwendao_content.js    # 古文岛增强
│   ├── speed_lab.js           # Speed Test 自动测速
│   └── hacker_news/           # Hacker News 美化
│       ├── content.js
│       └── styles.css
├── tests/                     # 自动化测试
├── eslint.config.js           # 代码检查规则
├── package.json               # 测试与检查命令
├── .editorconfig / .gitattributes  # 编辑器与行尾约定
└── readme.md
```

## 安装方法

1. 克隆或下载此项目
2. 打开 Chrome 浏览器，访问 chrome://extensions/
3. 开启右上角的开发者模式
4. 点击加载已解压的扩展程序
5. 选择项目文件夹

## 设置面板

点击浏览器工具栏上的扩展图标，直接打开侧边栏。面板顶部有两个标签页。

### 功能设置
- 全局开关，快捷提示词按钮的总开关，作用于 ChatGPT、Grok 与 Gemini
- 站点开关，启用或禁用某个网站的全部功能
- 功能开关，单独控制每个功能的开启与关闭
- 下拉框，字体、行距、主题这类多选项功能用下拉框切换
- 搜索设置，快速查找特定功能
- 导入与导出，用 JSON 备份和恢复配置
- 恢复默认，一键重置所有设置

### 提示词管理，默认页面
- 顶部按钮栏，点击切换要编辑的提示词
- 编辑区域，修改按钮名称与提示词内容
- 添加提示词，点击添加新提示词按钮
- 删除提示词，点击编辑区域右上角的删除按钮
- 保存修改，点击保存按钮生效
- 自动同步，ChatGPT、Grok 与 Gemini 共享同一套提示词配置

## 开发说明

### 运行测试与检查

1. npm install
2. npm test，运行全部自动化测试
3. npm run lint，运行代码检查

### 添加新功能

1. 在 defaults.js 的 sites 中声明站点 hosts 与功能项，这样设置页会自动生成开关
2. 在 manifest.json 的 content_scripts 中添加配置，js 数组必须以 defaults.js 与 content_scripts/utils.js 开头：
```json
{
  "matches": ["https://example.com/*"],
  "js": ["defaults.js", "content_scripts/utils.js", "content_scripts/example_content.js"]
}
```
3. 在 content_scripts 目录下创建脚本，用 AIToolsUtils.getSettings 读配置，用 AIToolsUtils.onSettingsChanged 注册热更新，实现开启与关闭两个方向的逻辑
4. 在 tests 目录下补充对应的开关测试

### manifest.json 配置说明

#### matches 用法
- "https://www.google.com/*" 限定某个域名
- "*://*/*" 所有网站
- "<all_urls>" 所有网站

#### run_at 选项
- document_start 文档开始加载时
- document_end DOM 加载完成时
- document_idle 页面空闲时，默认值

## 权限说明

- storage，读写站点配置与提示词，数据存放在 storage.local
- downloads，下载 Pinterest 原图
- sidePanel，点击图标打开侧边栏

## 技术栈

- Manifest V3
- 原生 JavaScript
- Chrome Extension API
- Node.js 内置 test runner 与 jsdom 做自动化测试
- ESLint 做代码检查

## 更新日志

### 2026.09.23 更新
- 删除 popup，点击工具栏图标直接打开侧边栏
- 站点匹配改为 hosts 显式声明，修复 Grok、Pinterest、老钱博客开关失效的问题
- 配置从 storage.sync 迁移到 storage.local，扩展启动时自动迁移旧数据
- 配置变更改用 storage.onChanged 热更新，删除 10 处整页刷新
- Hacker News、Gemini、Speed Test 纳入设置页，Hacker News 增加字体、行距、主题下拉框
- Hacker News 快捷键在输入框与输入域内不再劫持按键
- 提示词与站点名称在设置页全部转义，导入恶意配置不再能注入脚本
- Pinterest 关闭开关时不再改写地址，下载按地址去重
- 权限收敛为 storage、downloads、sidePanel
- 新增 defaults.js 共享配置，删除死代码与重复的默认提示词
- 新增 ESLint 与 33 项自动化测试，统一行尾为 LF

### 2026.04.18 更新
- Grok 支持，添加全异步防抖自动聚焦机制，解决 SPA 页面焦点被内部脚本抢走的问题

### 2026.02.10 更新
- 添加配置系统，所有内容脚本支持通过侧边面板开关
- 暗色主题侧边面板，移除悬浮动画
- 导入与导出配置，支持 JSON 格式
- 公共工具库 utils.js，提供配置读取、样式注入与按钮栏构建
- 提示词管理界面，支持添加、删除、保存与多站点共享

### 历史更新
- 合并 Hacker News 美化插件到主扩展
- 添加 ChatGPT 快捷提示词按钮功能
- 添加老钱博客暗色背景支持
- 拆分 content.js 为多个独立文件
- 支持 Pinterest 原始图片下载
- 支持 Medium 文本选择菜单隐藏

## 参考资料

聊天记录 https://x.com/i/grok?conversation=1922691362044117397

图标生成 https://chatgpt.com/c/6824c447-bcb4-8002-a576-4e72aa876c2d
