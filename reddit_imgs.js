window.addEventListener('load', () => {
    // 查找图片元素
    const imgElement = document.querySelector('main img');
    
    // 查找包含帖子信息的底部栏元素
    const bottomBarElement = document.querySelector('post-bottom-bar');
  
    if (imgElement && imgElement.src && bottomBarElement) {
      const imageUrl = imgElement.src;
      
      // 从底部栏元素中获取帖子标题
      // .replace(/[^a-zA-Z0-9\s-]/g, "") 清理掉不适合做文件名的特殊字符
      // .replace(/\s+/g, '-') 将空格替换为连字符
      const postTitle = (bottomBarElement.getAttribute('title') || 'reddit-image')
                           .replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, '-');
  
      // 从图片 URL 中提取原始 ID 部分，确保唯一性
      const urlObject = new URL(imageUrl);
      const pathnameParts = urlObject.pathname.split('/');
      const imageId = pathnameParts[pathnameParts.length - 1].split('.')[0]; // 例如 "how-can-i...-y7rfor7ns5if1"
      
      // 组合成新的、友好的文件名，并使用 .webp 扩展名
      const friendlyFilename = `${postTitle}-${imageId}.webp`;
  
      console.log('找到图片 URL:', imageUrl);
      console.log('生成的文件名:', friendlyFilename);
  
      // 将图片 URL 和新的文件名一起发送给后台脚本
      chrome.runtime.sendMessage({
        action: "downloadImage",
        url: imageUrl,
        filename: friendlyFilename
      });
    } else {
      console.log('未能找到图片元素或帖子信息栏。');
    }
  });