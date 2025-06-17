import translations from './translations.js';

// 默认语言
const DEFAULT_LANG = 'zh';
// 强制设置为中文
localStorage.setItem('lang', 'zh');
let currentLang = 'zh';

// 更新所有需要翻译的元素
function updateTranslations() {
    console.log('Updating translations to:', currentLang);
    const elements = document.querySelectorAll('[data-translate]');
    console.log('Found elements to translate:', elements.length);
    
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLang] && translations[currentLang][key]) {
            // 对于输入框，更新placeholder
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.placeholder = translations[currentLang][key];
            } else if (element.tagName === 'META' && element.hasAttribute('content')) {
                element.setAttribute('content', translations[currentLang][key]);
            } else {
                element.textContent = translations[currentLang][key];
            }
            // console.log('Translated element:', key, 'to:', translations[currentLang][key]);
        } else {
            console.warn(`Translation missing for key: ${key} in language: ${currentLang}`);
        }
    });

    // 更新语言切换按钮文本
    const langToggle = document.getElementById('languageToggle');
    if (langToggle) {
        langToggle.textContent = currentLang === 'zh' ? '中文 | EN' : 'EN | 中文';
        console.log('Updated language toggle button text');
    } else {
        console.warn('Language toggle button not found');
    }

    // 更新HTML lang属性
    document.documentElement.setAttribute('lang', currentLang);
    console.log('Updated HTML lang attribute');

    // 根据语言调整导航项样式
    const navItems = document.querySelectorAll('.nav-item');
    if (currentLang === 'en') {
        navItems.forEach(item => item.classList.add('lang-en-nav'));
        console.log('Added lang-en-nav class to nav items');
    } else {
        navItems.forEach(item => item.classList.remove('lang-en-nav'));
        console.log('Removed lang-en-nav class from nav items');
    }
}

// 切换语言
export function toggleLanguage(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    console.log('Toggle language called. Current language:', currentLang);
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    console.log('New language:', currentLang);
    localStorage.setItem('lang', currentLang);
    updateTranslations();
}

// 初始化语言系统
export async function initializeLanguage() {
    try {
        console.log('Initializing language system');
        // 从localStorage获取保存的语言设置
        const savedLang = localStorage.getItem('lang');
        console.log('Saved language:', savedLang);
        
        if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
            currentLang = savedLang;
            console.log('Using saved language:', currentLang);
        } else {
            console.log('Using default language:', DEFAULT_LANG);
            localStorage.setItem('lang', DEFAULT_LANG);
        }

        // 更新页面上的所有翻译
        updateTranslations();
        return true;
    } catch (error) {
        console.error('Failed to initialize language system:', error);
        return false;
    }
} 