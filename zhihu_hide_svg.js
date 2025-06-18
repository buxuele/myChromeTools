// zhihu_hide_svg.js
// 隐藏所有的 4角星，SVG 元素

// zhihu_hide_svg.js
(function() {
    const hideSvgs = () => {
        document.querySelectorAll('.ZDI--FourPointedStar16').forEach(svg => {
            svg.style.display = 'none';
        });
    };
    hideSvgs(); // 初始运行
    setInterval(hideSvgs, 1000); // 每秒检查动态内容
})();