document.addEventListener('DOMContentLoaded', function () {
    const currentDomain = document.getElementById('currentDomain');

    // 获取当前标签页的域名并显示
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
            try {
                const url = new URL(tabs[0].url);
                currentDomain.textContent = url.hostname;
            } catch (error) {
                currentDomain.textContent = '无法获取域名';
            }
        } else {
            currentDomain.textContent = '未找到活动标签页';
        }
    });
});