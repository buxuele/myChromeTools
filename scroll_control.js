// 处理滚动控制逻辑，响应 popup.js 发送的 startScroll 和 stopScroll 消息。

(function () {
    let scrollInterval = null;
    let refreshInterval = null;
    let currentSpeed = 1; // 默认速度倍率
    let isAutoRefreshEnabled = false;
    let lastRefreshTime = Date.now();
    let shouldAutoScroll = false; // 新增：标记是否需要自动滚动

    // 保存滚动状态到 sessionStorage
    function saveScrollState(speed, autoRefresh) {
        sessionStorage.setItem('scrollState', JSON.stringify({
            speed: speed,
            autoRefresh: autoRefresh,
            timestamp: Date.now()
        }));
    }

    // 清除滚动状态
    function clearScrollState() {
        sessionStorage.removeItem('scrollState');
    }

    // 检查并恢复滚动状态
    function checkAndRestoreScrollState() {
        const savedState = sessionStorage.getItem('scrollState');
        if (savedState) {
            const state = JSON.parse(savedState);
            // 如果状态保存时间在5分钟内，则恢复滚动
            if (Date.now() - state.timestamp < 5 * 60 * 1000) {
                smoothAutoScroll(state.speed, state.autoRefresh);
            } else {
                clearScrollState();
            }
        }
    }

    function smoothAutoScroll(speed = 1, autoRefresh = false) {
        if (scrollInterval) {
            clearInterval(scrollInterval);
        }
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }

        currentSpeed = speed;
        isAutoRefreshEnabled = autoRefresh;
        lastRefreshTime = Date.now();
        shouldAutoScroll = true; // 设置自动滚动标记
        saveScrollState(speed, autoRefresh); // 保存状态
        
        const baseScrollAmount = 0.5; // 降低基础滚动量，因为帧率提高了
        const scrollAmount = baseScrollAmount * speed; // 根据速度调整滚动量
        let isPaused = false;
        let lastScrollHeight = 0;
        let scrollPosition = window.scrollY;
        let isScrollingToTop = false;
        const FRAME_INTERVAL = 16; // 60fps = 16ms per frame
        let lastFrameTime = Date.now();

        // 设置自动刷新检查
        if (isAutoRefreshEnabled) {
            refreshInterval = setInterval(async () => {
                const currentTime = Date.now();
                const timeSinceLastRefresh = (currentTime - lastRefreshTime) / 1000 / 60; // 转换为分钟
                
                // 每3分钟执行一次刷新序列
                if (timeSinceLastRefresh >= 3) {
                    // 停止滚动
                    if (scrollInterval) {
                        clearInterval(scrollInterval);
                        scrollInterval = null;
                    }
                    
                    // 休息2秒
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // 回到顶部
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    
                    // 休息2秒
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // 保存当前状态
                    const currentState = {
                        speed: currentSpeed,
                        autoRefresh: isAutoRefreshEnabled,
                        timestamp: Date.now()
                    };
                    sessionStorage.setItem('scrollState', JSON.stringify(currentState));
                    
                    // 刷新页面
                    window.location.reload();
                }
            }, 10000); // 每10秒检查一次
        }

        // 使用 setInterval 保持稳定的帧率
        scrollInterval = setInterval(() => {
            if (isPaused || isScrollingToTop) return;

            const currentTime = Date.now();
            const deltaTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;

            const scrollHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;
            const currentScroll = window.scrollY;
            const distanceToBottom = scrollHeight - (currentScroll + windowHeight);

            // 当接近底部时
            if (distanceToBottom < 100) {
                if (!isPaused) {
                    isPaused = true;
                    lastScrollHeight = scrollHeight;

                    // 检查是否有新内容加载
                    setTimeout(() => {
                        const newScrollHeight = document.documentElement.scrollHeight;
                        if (newScrollHeight === lastScrollHeight) {
                            // 如果确实到达底部，平滑滚动到顶部
                            isScrollingToTop = true;
                            const startPosition = window.scrollY;
                            const startTime = Date.now();
                            const duration = 800; // 稍微加快回到顶部的速度
                            let lastTopFrameTime = startTime;

                            function scrollToTop() {
                                if (!isScrollingToTop) return;

                                const currentTime = Date.now();
                                const elapsed = currentTime - startTime;
                                const progress = Math.min(elapsed / duration, 1);

                                // 使用 easeInOutQuad 缓动函数使滚动更自然
                                const easeProgress = progress < 0.5 
                                    ? 2 * progress * progress 
                                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                                window.scrollTo(0, startPosition * (1 - easeProgress));

                                if (progress < 1) {
                                    requestAnimationFrame(scrollToTop);
                                } else {
                                    isScrollingToTop = false;
                                    isPaused = false;
                                    scrollPosition = 0;
                                    lastFrameTime = Date.now(); // 重置帧时间
                                }
                            }

                            requestAnimationFrame(scrollToTop);
                        } else {
                            // 如果有新内容，继续滚动
                            isPaused = false;
                            lastFrameTime = Date.now(); // 重置帧时间
                        }
                    }, 1000);
                }
            } else {
                // 正常滚动，使用 deltaTime 来保持稳定的滚动速度
                scrollPosition += scrollAmount * (deltaTime / FRAME_INTERVAL);
                window.scrollTo(0, scrollPosition);
            }
        }, FRAME_INTERVAL);

        // 清理函数
        return () => {
            if (scrollInterval) {
                clearInterval(scrollInterval);
            }
            isScrollingToTop = false;
            isPaused = false;
        };
    }
  
    function stopScroll() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
        currentSpeed = 1;
        isAutoRefreshEnabled = false;
        shouldAutoScroll = false; // 清除自动滚动标记
        clearScrollState(); // 清除保存的状态
    }
  
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'startScroll') {
            smoothAutoScroll(message.speed || 1, message.autoRefresh || false);
        } else if (message.action === 'stopScroll') {
            stopScroll();
        }
    });

    // 页面加载完成后检查是否需要恢复滚动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndRestoreScrollState);
    } else {
        checkAndRestoreScrollState();
    }
})();