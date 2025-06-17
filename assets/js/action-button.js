document.addEventListener('DOMContentLoaded', function() {
    var actionButton = document.querySelector('[data-role="action-button"]');
    if (!actionButton) return;

    var mainAction = actionButton.querySelector('.main-action');
    var actionList = actionButton.querySelector('.actions');

    function toggleMenu(event) {
        event.stopPropagation();
        actionButton.classList.toggle('active');
    }

    function closeMenu() {
        actionButton.classList.remove('active');
    }// 主按钮点击事件
    mainAction.addEventListener('click', toggleMenu);

    // 点击文档其他部分关闭菜单
    document.addEventListener('click', closeMenu);

    // 阻止菜单项点击事件冒泡
    actionList.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // 返回顶部功能
    var backToTop = actionList.querySelector('a[title="返回顶部"]');
    if (backToTop) {
        backToTop.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            actionButton.classList.remove('active');
        });
    }
});         