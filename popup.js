document.getElementById('openSidePanel').addEventListener('click', async () => {
  const windowId = await chrome.windows.getCurrent().then(w => w.id);
  // 打开侧边栏
  // 注意：需要 Chrome 114+，且需要在 manifest 中配置 permissions: ["sidePanel"]
  if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ windowId });
      window.close(); // 闭 popup
  } else {
      alert("您的浏览器不支持直接打开侧边栏，请手动点击浏览器工具栏的侧边栏图标。");
  }
});
