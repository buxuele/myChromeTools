document.addEventListener('DOMContentLoaded', function () {
    const startScrollButton = document.getElementById('startScrollButton');
    const stopScrollButton = document.getElementById('stopScrollButton');

    // 开始滚动
    startScrollButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'startScroll' });
        });
    });

    // 停止滚动
    stopScrollButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'stopScroll' });
        });
    });
});