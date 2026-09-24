// manifest 与工程结构校验

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { root, readProjectFile } = require("./helpers");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git"].includes(entry.name)) return [];
      return walk(full);
    }
    return full.endsWith(".js") ? [full] : [];
  });
}

test("manifest 无 popup，权限已收敛", () => {
  const manifest = JSON.parse(readProjectFile("manifest.json"));

  assert.strictEqual(manifest.action.default_popup, undefined);
  assert.strictEqual(manifest.permissions.join(","), "storage,downloads,sidePanel");
  assert.strictEqual(manifest.version, "1.1");
  assert.strictEqual(manifest.side_panel.default_path, "sidepanel.html");
  assert.ok(!fs.existsSync(path.join(root, "popup.html")));
  assert.ok(!fs.existsSync(path.join(root, "popup.js")));
});

test("content_scripts 声明的文件全部存在且以 defaults.js 开头", () => {
  const manifest = JSON.parse(readProjectFile("manifest.json"));

  manifest.content_scripts.forEach((entry) => {
    assert.ok(entry.js.length >= 3, `缺少 defaults.js 或 utils.js: ${entry.matches}`);
    assert.strictEqual(entry.js[0], "defaults.js", `首个脚本必须是 defaults.js: ${entry.matches}`);
    assert.ok(entry.js[1].endsWith("content_scripts/utils.js"));
    entry.js.forEach((file) => {
      assert.ok(fs.existsSync(path.join(root, file)), `文件不存在: ${file}`);
    });
  });
});

test("站点匹配规则覆盖全部注入域名", () => {
  const manifest = JSON.parse(readProjectFile("manifest.json"));
  const patterns = manifest.content_scripts.flatMap((entry) => entry.matches);

  assert.ok(patterns.includes("https://levelup.gitconnected.com/*"), "Medium 第二域名缺少通配");
  assert.ok(patterns.every((p) => !p.endsWith(".com/")), "匹配规则路径不能只命中根路径");
});

test("Hacker News 基础样式改为脚本注入并声明为可访问资源", () => {
  const manifest = JSON.parse(readProjectFile("manifest.json"));
  const hn = manifest.content_scripts.find((entry) =>
    entry.matches.includes("https://news.ycombinator.com/*")
  );

  assert.strictEqual(hn.css, undefined, "styles.css 应由脚本注入，便于站点开关卸载");

  const resources = manifest.web_accessible_resources.flatMap((item) => item.resources);
  assert.ok(resources.includes("content_scripts/hacker_news/styles.css"));
  assert.ok(resources.includes("Nunito-fonts/Nunito-Bold.ttf"));
  assert.ok(resources.includes("Nunito-fonts/Nunito-SemiBold.ttf"));
});

test("代码里不再出现整页刷新与 sync 直连", () => {
  const files = walk(path.join(root, "content_scripts")).concat(
    path.join(root, "sidepanel.js"),
    path.join(root, "defaults.js")
  );

  files.forEach((file) => {
    const source = fs.readFileSync(file, "utf8");
    const name = path.relative(root, file);
    assert.ok(!source.includes("location.reload"), `${name} 不应使用 location.reload`);
    if (name !== "defaults.js" && name !== "background.js") {
      assert.ok(!source.includes("chrome.storage.sync"), `${name} 不应直连 storage.sync`);
    }
  });
});

test("死文件已清理", () => {
  ["brightness_controller.js", "todo.md"].forEach((file) => {
    assert.ok(!fs.existsSync(path.join(root, file)), `${file} 应已删除`);
  });

  const source = fs.readFileSync(path.join(root, "content_scripts/hacker_news/content.js"), "utf8");
  assert.ok(!source.includes("forceRoundedFont"), "forceRoundedFont 是死函数");
  assert.ok(!source.includes("fonts.googleapis.com"), "不应再请求在线字体");
});
