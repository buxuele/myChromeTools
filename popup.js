
// 负责处理，自动滚动页面的2个按钮！！
document.addEventListener('DOMContentLoaded', function () {
    const colorPicker = document.getElementById('colorPicker');
    const saveButton = document.getElementById('saveButton');
    const startScrollButton = document.getElementById('startScrollButton');
    const stopScrollButton = document.getElementById('stopScrollButton');
    const currentDomainSpan = document.getElementById('currentDomain');

    // 获取当前活动标签的域名
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = new URL(tabs[0].url);
        currentDomainSpan.textContent = url.hostname;
    });

    // 保存背景颜色
    saveButton.addEventListener('click', function () {
        const color = colorPicker.value;
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'setBackgroundColor', color: color });
        });
    });

    // 启动自动滚动
    startScrollButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'startScroll' });
        });
    });

    // 停止自动滚动
    stopScrollButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'stopScroll' });
        });
    });
});

