chrome.storage.sync.get(['showPromptButtons'], (result) => {
  const checkbox = document.getElementById('togglePromptButtons');
  checkbox.checked = result.showPromptButtons !== false;
});

document.getElementById('togglePromptButtons').addEventListener('change', (e) => {
  const enabled = e.target.checked;
  chrome.storage.sync.set({ showPromptButtons: enabled }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'TOGGLE_PROMPT_BUTTONS', 
          enabled: enabled 
        });
      }
    });
  });
});

document.getElementById('openSidePanel').addEventListener('click', async () => {
  const windowId = await chrome.windows.getCurrent().then(w => w.id);
  if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ windowId });
      window.close();
  } else {
      alert("您的浏览器不支持直接打开侧边栏，请手动点击浏览器工具栏的侧边栏图标。");
  }
});
