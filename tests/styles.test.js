// Hacker News 基础样式校验，保证与旧版渲染结果一致

const test = require("node:test");
const assert = require("node:assert");
const { readProjectFile } = require("./helpers");

const css = readProjectFile("content_scripts/hacker_news/styles.css");

test("全局字重为 600，类名规则保留 700", () => {
  const universal = css.match(/\*\s*\{[^}]*font-weight:\s*(\d+)/);
  assert.ok(universal, "应存在全局字重规则");
  assert.strictEqual(universal[1], "600", "全局字重应为 600，与旧版一致");

  assert.ok(/\.subtext\s*\{[^}]*font-weight:\s*700/.test(css), "正文附加信息保持 700");
  assert.ok(/\.titleline a\s*\{[^}]*font-weight:\s*900/.test(css), "标题链接保持 900");
});

test("默认链接色与作者色与旧版一致", () => {
  assert.ok(/\.titleline a\s*\{[^}]*color:\s*#1a4480/.test(css), "标题链接色应为 1a4480");
  assert.ok(/\.hnuser\s*\{[^}]*color:\s*#ff6600/.test(css), "作者名色应为 ff6600");
});

test("字体走本地相对路径", () => {
  assert.ok(/url\(\.\.\/\.\.\/Nunito-fonts\/Nunito-SemiBold\.ttf\)/.test(css));
  assert.ok(/url\(\.\.\/\.\.\/Nunito-fonts\/Nunito-Bold\.ttf\)/.test(css));
  assert.ok(!css.includes("fonts.googleapis.com"), "不应请求在线字体");
  assert.ok(!css.includes("__MSG_@@extension_id__"), "相对路径不再依赖扩展 id 占位符");
});
