# 我想把 grok 输出的内容， 转为md， 失败！


# 修改内容
- 把原来的 content.js 拆分为4个文件，方便单独管理， 以及后面的拓展。
- 以后再新增功能， 先在 manifest.json  matches 中增加配置， 然后新建一个js


# 文件的作用
- manifest.json 是入口，所有其他文件的运行都依赖于它的配置。
- background.js  


# 目的
此项目，某些特定网站上，进行特别的操作。 个性化操作。

聊天记录:

https://x.com/i/grok?conversation=1922691362044117397


# 新增：
- 自动下载原始尺寸的图片 https://ca.pinterest.com/
- 那么就把  736x 或 1200x， 自动替换为 originals


1. 增加输入框的高度，可以增加 25px
2. 光标自动聚集在输入框内


### 生成图片， icon 
https://chatgpt.com/c/6824c447-bcb4-8002-a576-4e72aa876c2d

要求如下：
1. **图标风格偏好**： 积极向上。 
2. **是否希望包含字母**： 写上工具2个字。
3. **配色喜好**： 彩色，我喜欢彩虹色，即多种颜色。
4. **是否希望图中有工具元素**：如螺丝刀、扳手、工具箱图案， 很合适
5. **是否有图标尺寸需求**： 512×512 


# 创建项目的步骤
1. 新建一个 manifest.json 文件, 填入一些信息。
"manifest_version": 3,  # 2 已经被废弃了。
2. 新建图片文件夹，准备图片
3. 打开：chrome://extensions/， 上传 插件文件夹


### manifest.json 内容

#### 1. matches 的用法
- "matches": ["https://www.google.com/*"], 只限定某个域名
- "matches": ["*://*/*"], 全部的网站。
- "matches": ["<all_urls>"], 全部的网站。


### 2. "run_at": 有以下几种值
- "document_start"
- "document_end"
- "document_idle"

sublime 的默认背景颜色是 
bg:
#303841
rgba(48,56,65,255)

text:
#d8dfea
rgba(216,223,234,255)

