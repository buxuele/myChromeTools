document.addEventListener('DOMContentLoaded', function () {
    const normalSpeedBtn = document.getElementById('normalSpeedBtn');
    const doubleSpeedBtn = document.getElementById('doubleSpeedBtn');
    const fiveSpeedBtn = document.getElementById('fiveSpeedBtn');
    const stopScrollButton = document.getElementById('stopScrollButton');
    const autoRefreshBtn = document.getElementById('autoRefreshBtn');
    const currentDomain = document.getElementById('currentDomain');

    let isAutoRefreshEnabled = true; // 默认开启自动刷新

    // 初始化自动刷新按钮状态
    autoRefreshBtn.textContent = '自动刷新: 开启';
    autoRefreshBtn.classList.add('active');

    // 检查当前标签页是否可以注入脚本
    function canInjectScript(tab) {
        // 检查是否是 chrome:// 开头的页面
        if (tab.url.startsWith('chrome://')) {
            return false;
        }
        // 检查是否是 chrome-extension:// 开头的页面
        if (tab.url.startsWith('chrome-extension://')) {
            return false;
        }
        // 检查是否是 file:// 开头的页面
        if (tab.url.startsWith('file://')) {
            return false;
        }
        return true;
    }

    // 获取当前标签页的域名
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
            const url = new URL(tabs[0].url);
            currentDomain.textContent = url.hostname;
            
            // 如果当前页面不允许注入脚本，禁用所有按钮
            if (!canInjectScript(tabs[0])) {
                [normalSpeedBtn, doubleSpeedBtn, fiveSpeedBtn, stopScrollButton, autoRefreshBtn].forEach(btn => {
                    btn.disabled = true;
                    btn.title = '当前页面不支持此功能';
                });
                currentDomain.textContent += ' (不支持)';
            }
        }
    });

    // 更新按钮状态
    function updateButtonStates(activeButton) {
        [normalSpeedBtn, doubleSpeedBtn, fiveSpeedBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // 发送滚动消息的通用函数
    function sendScrollMessage(speed, autoRefresh = false) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (!tabs[0] || !canInjectScript(tabs[0])) {
                console.log('当前页面不支持此功能');
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, { 
                action: 'startScroll',
                speed: speed,
                autoRefresh: autoRefresh
            }).catch(error => {
                console.log('发送消息失败:', error);
                // 如果发送失败，重置按钮状态
                updateButtonStates(null);
                isAutoRefreshEnabled = true; // 重置为默认开启状态
                autoRefreshBtn.textContent = '自动刷新: 开启';
                autoRefreshBtn.classList.add('active');
            });
        });
    }

    // 更新自动刷新按钮状态
    function updateAutoRefreshButton() {
        isAutoRefreshEnabled = !isAutoRefreshEnabled;
        autoRefreshBtn.textContent = `自动刷新: ${isAutoRefreshEnabled ? '开启' : '关闭'}`;
        autoRefreshBtn.classList.toggle('active', isAutoRefreshEnabled);
        
        // 如果当前有滚动在进行，更新滚动状态
        if (document.querySelector('.scroll-btn.active')) {
            const activeButton = document.querySelector('.scroll-btn.active');
            let speed = 1;
            if (activeButton === doubleSpeedBtn) speed = 5;
            if (activeButton === fiveSpeedBtn) speed = 10;
            sendScrollMessage(speed, isAutoRefreshEnabled);
        }
    }

    // 自动刷新按钮点击事件
    autoRefreshBtn.addEventListener('click', updateAutoRefreshButton);

    // 正常速度滚动
    normalSpeedBtn.addEventListener('click', function () {
        sendScrollMessage(1, isAutoRefreshEnabled);
        updateButtonStates(normalSpeedBtn);
    });

    // 2倍速度滚动
    doubleSpeedBtn.addEventListener('click', function () {
        sendScrollMessage(5, isAutoRefreshEnabled);
        updateButtonStates(doubleSpeedBtn);
    });

    // 5倍速度滚动
    fiveSpeedBtn.addEventListener('click', function () {
        sendScrollMessage(10, isAutoRefreshEnabled);
        updateButtonStates(fiveSpeedBtn);
    });

    // 停止滚动
    stopScrollButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (!tabs[0] || !canInjectScript(tabs[0])) {
                console.log('当前页面不支持此功能');
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, { 
                action: 'stopScroll',
                autoRefresh: false 
            }).catch(error => {
                console.log('发送消息失败:', error);
            }).finally(() => {
                // 无论消息是否发送成功，都重置UI状态
                updateButtonStates(null);
                isAutoRefreshEnabled = true; // 重置为默认开启状态
                autoRefreshBtn.textContent = '自动刷新: 开启';
                autoRefreshBtn.classList.add('active');
            });
        });
    });
});