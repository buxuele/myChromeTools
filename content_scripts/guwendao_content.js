// 隐藏古文岛划词翻译按钮
const hideAihuaci = () => {
    const style = document.createElement('style');
    style.textContent = '.aihuacitollbar { display: none !important; }';
    document.head.appendChild(style);
};

hideAihuaci();
