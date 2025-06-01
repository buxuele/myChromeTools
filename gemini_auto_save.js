// ==UserScript==
// @name         Auto Click Compare Button
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically clicks the compare button every 20 seconds if it's clickable.
// @match        https://aistudio.google.com/prompts/*  // <-- 重要：请根据实际页面URL调整此匹配模式
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const BUTTON_SELECTOR = 'button[data-test-compare]'; // 你验证过可行的选择器
    const CLICK_INTERVAL_MS = 20000; // 20秒

    let intervalId = null; // 用于存储 setInterval 的 ID，方便之后清除

    function isButtonReadyToClick(buttonElement) {
        if (!buttonElement) {
            return false; // 按钮不存在
        }
        // 检查按钮是否被禁用
        if (buttonElement.disabled) {
            // console.log('Compare button is disabled.');
            return false;
        }
        // 检查按钮是否可见 (这是一个基础的可见性检查)
        // offsetParent 会在元素或其祖先 display: none 时为 null
        // getBoundingClientRect().width/height 为 0 也表示不可见
        if (buttonElement.offsetParent === null || buttonElement.getBoundingClientRect().width === 0 || buttonElement.getBoundingClientRect().height === 0) {
            // console.log('Compare button is not visible.');
            return false;
        }
        // 你还可以添加其他条件，例如检查特定的class来判断是否可点击
        // if (buttonElement.classList.contains('some-inactive-class')) {
        //     return false;
        // }
        return true;
    }

    function attemptClick() {
        console.log('Attempting to find and click compare button...');
        const compareButton = document.querySelector(BUTTON_SELECTOR);

        if (isButtonReadyToClick(compareButton)) {
            console.log('Compare button found and is clickable. Clicking now!');
            compareButton.click();
            // 可选：如果点击后希望停止定时器，可以在这里清除
            // stopAutoClick();
            // console.log('Compare button clicked. Auto-clicker stopped.');
        } else if (compareButton) {
            console.log('Compare button found, but not in a clickable state (disabled or not visible).');
        } else {
            console.log('Compare button not found with selector:', BUTTON_SELECTOR);
        }
    }

    function startAutoClick() {
        if (intervalId !== null) {
            console.log('Auto-clicker is already running.');
            return;
        }
        console.log(`Starting auto-clicker. Will attempt to click every ${CLICK_INTERVAL_MS / 1000} seconds.`);
        // 立即执行一次，然后设置定时器
        attemptClick();
        intervalId = setInterval(attemptClick, CLICK_INTERVAL_MS);
    }

    function stopAutoClick() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
            console.log('Auto-clicker stopped.');
        } else {
            console.log('Auto-clicker is not running.');
        }
    }

    // --- 如何启动和控制 ---
    // 1. 自动启动 (如果这是用户脚本，通常会立即执行)
    // 确保页面加载完毕后再启动，避免元素还未渲染
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAutoClick);
    } else {
        startAutoClick();
    }

    // 2. 或者，你可以暴露函数到 window 对象，以便在控制台手动控制 (用于测试)
    // window.startMyAutoClicker = startAutoClick;
    // window.stopMyAutoClicker = stopAutoClick;
    // console.log('To control from console, use window.startMyAutoClicker() and window.stopMyAutoClicker()');

    // 注意：对于一个真正的插件，你可能需要更复杂的逻辑来处理页面导航、
    // 插件图标点击启动/停止等。

})();