(function () {
    "use strict";
  
    /**
     * 检查并修复页面上的Google重定向链接
     * @param {Node} targetNode - 要扫描的DOM节点，通常是 document.body 或新添加的元素
     */
    function fixRedirectLinks(targetNode) {
      // 只查找以 google.com/url? 开头的链接，并且还没有被我们处理过
      const redirectLinks = targetNode.querySelectorAll(
        'a[href^="https://www.google.com/url?"]:not([data-link-fixed="true"])'
      );
  
      if (redirectLinks.length > 0) {
        console.log(`[aiTools] 发现了 ${redirectLinks.length} 个需要修复的重定向链接。`);
      }
  
      redirectLinks.forEach((link) => {
        try {
          const url = new URL(link.href);
          const realUrl = url.searchParams.get("q"); // 'q' 参数里存放着真实的目标URL
  
          if (realUrl) {
            // 解码URL，以防有特殊字符
            const decodedUrl = decodeURIComponent(realUrl);
            
            // 更新链接的 href 属性
            link.href = decodedUrl;
            
            // 添加一个标记，防止重复处理
            link.setAttribute("data-link-fixed", "true");
  
            // (可选) 更新链接的 title 提示，让用户知道链接已被净化
            link.title = `已直达: ${decodedUrl}`;
          }
        } catch (error) {
          console.error("[aiTools] 修复链接失败:", error, "原始链接:", link.href);
        }
      });
    }
  
    // AI Studio 的聊天内容是动态加载的，所以我们需要监控DOM的变化
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // 当有新节点被添加到页面时
        if (mutation.addedNodes.length > 0) {
          // 检查这些新节点里是否包含我们需要修复的链接
          mutation.addedNodes.forEach(node => {
            // 确保是元素节点，而不是文本节点等
            if (node.nodeType === Node.ELEMENT_NODE) {
              fixRedirectLinks(node);
            }
          });
        }
      }
    });
  
    // --- 脚本启动逻辑 ---
    console.log("[aiTools] 链接直达功能已启动，正在监控页面变化...");
    
    // 1. 页面加载后，立即对现有内容执行一次修复
    fixRedirectLinks(document.body);
  
    // 2. 开始监控整个 body 的子节点变化，以捕获新加载的聊天内容
    observer.observe(document.body, {
      childList: true, // 监控子节点的添加或删除
      subtree: true,   // 监控所有后代节点
    });
  
  })();

  