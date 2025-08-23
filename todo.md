### 8.23 ✅ 已完成 - Speed Measurement Lab 自动勾选功能

对这个网站 https://speed.measurementlab.net/#/ 每次打开这个网页，自动勾选隐私政策 checkbox。

**实现详情：**

- 新增了 `speed_measurementlab_content.js` 文件
- 更新了 `manifest.json` 添加对应的 content script 配置
- 支持多种查找策略确保兼容性：
  - 通过 ID `#demo-human` 查找
  - 通过 name 属性 `demo-human` 查找
  - 通过 ng-model `privacyConsent` 查找
  - 通过包含隐私政策文本的 label 查找
- 使用 MutationObserver 监控动态加载的元素
- 触发多种事件确保 Angular 应用能检测到变化

**目标元素：**

```html
<input
  type="checkbox"
  id="demo-human"
  name="demo-human"
  ng-model="privacyConsent"
/>
```

### 8.15 拆分功能。 把滚动功能，单独拆分出去。

当前这个项目。
由于我不断增加新的功能，导致非常混乱、
我决定进行拆分。

1. 把滚动相关的功能，单独放到一个新的文件夹， 作为一个新的，独立的插件， 叫做 autoScroll/
2. 其他部分，即对每个网站的特殊处理，依然放在这里。
