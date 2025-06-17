// 更新主题UI
function updateThemeUI(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const slider = document.querySelector('.theme-switch-slider');
    if (slider) {
        slider.style.transform = theme === 'dark' ? 'translateX(28px)' : 'translateX(0)';
    }
}

// 初始化主题切换
export function initThemeSwitch() {
    const themeSwitch = document.querySelector('.theme-switch-wrapper');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 检查本地存储中的主题设置
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        updateThemeUI(currentTheme);
    } else if (prefersDarkScheme.matches) {
        updateThemeUI('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        updateThemeUI('light');
        localStorage.setItem('theme', 'light');
    }

    // 切换主题
    if (themeSwitch) {
        themeSwitch.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            updateThemeUI(newTheme);
            localStorage.setItem('theme', newTheme);
            console.log('Theme switched to:', newTheme);
        });
    }

    // 监听系统主题变化
    prefersDarkScheme.addEventListener('change', (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        updateThemeUI(newTheme);
        localStorage.setItem('theme', newTheme);
        console.log('System theme changed to:', newTheme);
    });
} 