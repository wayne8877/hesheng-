// 启用 Swiper 的 Autoplay 模块（如果 Swiper.use 存在）
if (typeof Swiper !== 'undefined' && Swiper.use) {
    Swiper.use([Swiper.Autoplay]);
}

// 性能优化：使用防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 主题切换功能 - 修复默认为亮色主题
const initThemeSwitch = () => {
    const themeToggle = document.getElementById('themeToggle');
    const themeWrapper = document.querySelector('.theme-switch-wrapper');

    // 强制设置为亮色主题作为默认
    const currentTheme = localStorage.getItem('theme') || 'light';

    // 确保默认是亮色主题
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    if (themeWrapper) {
        themeWrapper.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
};

// 语言切换功能
const initLanguageSwitch = async () => {
    const langToggle = document.getElementById('languageToggle');
    const currentLang = localStorage.getItem('language') || 'zh';
    
    const loadTranslations = async (lang) => {
        try {
            const response = await fetch(`/assets/translations/${lang}.json`);
            return await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            return {};
        }
    };
    
    const updateContent = async (lang) => {
        const translations = await loadTranslations(lang);
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
    };
    
    if (langToggle) {
        langToggle.addEventListener('click', async () => {
            const newLang = currentLang === 'zh' ? 'en' : 'zh';
            localStorage.setItem('language', newLang);
            await updateContent(newLang);
        });
    }
    
    await updateContent(currentLang);
};

// 导航栏滚动效果
const initScrollNav = () => {
    const nav = document.querySelector('.main-nav');
    if (!nav) return;
    
    const handleScroll = debounce(() => {
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    }, 10);
    
    window.addEventListener('scroll', handleScroll);
};

// 表单验证
const initFormValidation = () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                
                if (response.ok) {
                    showNotification('提交成功！', 'success');
                    form.reset();
                } else {
                    throw new Error('提交失败');
                }
            } catch (error) {
                showNotification('提交失败，请稍后重试', 'error');
            }
        });
    });
};

// 通知提示
const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
};

// 图片懒加载
const initLazyLoading = () => {
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // 回退方案：使用 Intersection Observer
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }
};

// 钮扣轮播无缝滚动功能
const initButtonCarousel = () => {
    const scrollContainer = document.querySelector('.scroll-container');
    const scrollContent = document.querySelector('.scroll-content');

    if (!scrollContainer || !scrollContent) return;

    // 复制内容以实现无缝轮播
    const originalItems = scrollContent.innerHTML;
    scrollContent.innerHTML = originalItems + originalItems;

    // 监听动画结束事件，重置位置
    scrollContent.addEventListener('animationiteration', () => {
        scrollContent.style.transform = 'translateX(0)';
    });

    // 鼠标悬停暂停动画
    scrollContainer.addEventListener('mouseenter', () => {
        scrollContent.style.animationPlayState = 'paused';
    });

    scrollContainer.addEventListener('mouseleave', () => {
        scrollContent.style.animationPlayState = 'running';
    });
};

// 社交媒体图标交互增强
const initSocialIcons = () => {
    const socialIcons = document.querySelectorAll('.social-icon');

    socialIcons.forEach(icon => {
        // 添加点击波纹效果
        icon.addEventListener('click', function(e) {
            e.preventDefault();

            // 创建波纹效果
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });

        // 添加键盘导航支持
        icon.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
};

// 响应式图片优化和占位符处理
const initResponsiveImages = () => {
    const images = document.querySelectorAll('img');

    // 创建占位符图片的函数
    const createPlaceholder = (width = 400, height = 300, text = '钮扣图片') => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // 绘制背景
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);

        // 绘制边框
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);

        // 绘制文字
        ctx.fillStyle = '#999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);

        return canvas.toDataURL();
    };

    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });

        img.addEventListener('error', function() {
            this.classList.add('error');
            // 设置占位符图片
            const alt = this.alt || '钮扣图片';
            this.src = createPlaceholder(400, 300, alt);
            this.style.filter = 'none';
            this.style.opacity = '0.8';
        });

        // 立即检查图片是否已经加载失败
        if (img.complete && img.naturalWidth === 0) {
            img.dispatchEvent(new Event('error'));
        }
    });
};

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    initThemeSwitch();
    initLanguageSwitch();
    initScrollNav();
    initFormValidation();
    initLazyLoading();
    initButtonCarousel();
    initSocialIcons();
    initResponsiveImages();
});

// 表单验证函数
function validateForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    if (!name || !email || !message) {
        alert('请填写所有必填字段');
        return false;
    }
    
    if (!validateEmail(email)) {
        alert('请输入有效的电子邮件地址');
        return false;
    }
    
    // TODO: 处理表单提交
    console.log('表单提交成功', { name, email, message });
    event.target.reset();
    alert('感谢您的留言，我们会尽快与您联系！');
}

// 邮箱验证函数
function validateEmail(email) {
    if (typeof email !== 'string') {
        return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(email);
}