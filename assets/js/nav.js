// 加载导航栏
export async function loadNavigation() {
    // This function will no longer load HTML or initialize language/theme switches directly.
    // Page-specific scripts will handle initialization of their existing nav elements.
    console.log('loadNavigation called, but not performing HTML loading or primary init.');

    // We can retain active link logic here if needed,
    // but it needs to query the document directly, not a template.
    try {
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop() || 'index.html';
        // console.log('Current page for active link:', pageName);

        const navItems = document.querySelectorAll('.main-nav .nav-item'); // Query existing nav
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === pageName) {
                item.classList.add('active');
                // console.log('Set active nav item in document:', href);
            } else {
                item.classList.remove('active');
            }
        });

        // 初始化极简导航栏滚动效果
        initMinimalistNavScroll();

        return true;
    } catch (error) {
        console.error('Error setting active navigation link:', error);
        return false;
    }
}

// 极简主义导航栏滚动效果
function initMinimalistNavScroll() {
    const nav = document.querySelector('.main-nav');
    if (!nav) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavOnScroll() {
        const scrollY = window.scrollY;

        // 滚动超过50px时添加scrolled类
        if (scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavOnScroll);
            ticking = true;
        }
    }

    // 监听滚动事件
    window.addEventListener('scroll', requestTick, { passive: true });

    // 初始检查
    updateNavOnScroll();
}