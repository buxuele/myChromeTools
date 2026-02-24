

### 2026.2.8 项目目录重构
重构项目目录结构，解决根目录文件过多的问题：
- 创建 `content_scripts/` 目录，存放所有内容脚本
- 创建 `styles/` 目录，存放样式文件
- 创建 `docs/` 目录，存放文档文件
- 保留 .py/.bat 工具脚本在根目录
- 更新 manifest.json 中所有内容脚本路径
- 更新 sidepanel.html 中样式引用路径
- 更新 readme.md 项目结构说明

### 2026.2.8 合并 my_hacker_news 插件
将独立的 my_hacker_news 插件合并到 aiTools 主扩展中：
- 复制 hacker_news_content.js 和 hacker_news_styles.css
- 复制 Nunito-fonts 字体目录
- 更新 manifest.json 添加 Hacker News 配置
- 更新 readme.md 文档
- 合并完成后可删除 my_hacker_news 文件夹

### 2026.2.2 给chatgpt 增加一排按钮



### 12.25
增加内容
对https://www.perplexity.ai 这个网站
隐藏所有的这个元素

<div class="absolute z-[5]" style="top: 428.133px; left: 112.392px;"> 

class="absolute z-[5]"


### 10.9 增加 behance 
https://www.behance.net/galleries/best-of-behance


### 调整亮度。这个不要了
太卡了

{
    "matches": ["<all_urls>"],
    "js": ["brightness_controller.js"]
},



### 8.24
- todo 对微博图片进行，自动下载。即点击一个图片的详情页面

能自动替换为原始大小尺寸的图片
而且注意有多种情况，包括:
img4
img1 
如果其中一个请求成功，即，下载成功了，那么就停止。 




### 8.23 完成 - Speed Measurement Lab 自动勾选功能
 

### 8.15 拆分功能。 把滚动功能，单独拆分出去。

当前这个项目。
由于我不断增加新的功能，导致非常混乱、
我决定进行拆分。

1. 把滚动相关的功能，单独放到一个新的文件夹， 作为一个新的，独立的插件， 叫做 autoScroll/
2. 其他部分，即对每个网站的特殊处理，依然放在这里。
