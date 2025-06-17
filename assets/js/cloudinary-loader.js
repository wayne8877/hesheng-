/**
 * Cloudinary CDN 图片加载器
 * 免费25GB + 全球CDN + 自动优化
 */

class CloudinaryImageLoader {
    constructor(options = {}) {
        this.config = {
            // 🔥 替换为你的Cloudinary云名称
            cloudName: options.cloudName || 'YOUR_CLOUD_NAME',
            // 基础URL
            baseUrl: 'https://res.cloudinary.com',
            // 默认优化参数
            defaultTransforms: 'f_auto,q_auto,c_scale',
            // 占位符
            placeholder: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3E加载中...%3C/text%3E%3C/svg%3E"
        };
        
        this.init();
    }
    
    init() {
        console.log('🌟 Cloudinary CDN 初始化...');
        this.setupObserver();
        this.convertExistingImages();
        this.setupResponsiveImages();
    }
    
    // 构建Cloudinary URL
    buildUrl(imageName, options = {}) {
        const {
            width = 'auto',
            height = 'auto',
            crop = 'scale',
            quality = 'auto',
            format = 'auto',
            folder = ''
        } = options;
        
        const transforms = [
            width !== 'auto' ? `w_${width}` : 'w_auto',
            height !== 'auto' ? `h_${height}` : '',
            `c_${crop}`,
            `f_${format}`,
            `q_${quality}`
        ].filter(Boolean).join(',');
        
        const path = folder ? `${folder}/${imageName}` : imageName;
        return `${this.config.baseUrl}/${this.config.cloudName}/image/upload/${transforms}/${path}`;
    }
    
    // 获取响应式图片URL
    getResponsiveUrl(imageName, folder = '') {
        const width = window.innerWidth;
        let targetWidth = 'auto';
        
        if (width <= 480) targetWidth = '480';
        else if (width <= 768) targetWidth = '768';
        else if (width <= 1200) targetWidth = '1200';
        else targetWidth = '1920';
        
        return this.buildUrl(imageName, {
            width: targetWidth,
            folder: folder
        });
    }
    
    // 设置Intersection Observer
    setupObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });
    }
    
    // 转换现有图片为Cloudinary
    convertExistingImages() {
        const localImages = document.querySelectorAll('img[src*="assets/images/"]');
        localImages.forEach(img => {
            const src = img.src;
            const filename = src.split('/').pop();
            const folder = this.getFolderFromPath(src);
            
            // 设置Cloudinary数据
            img.dataset.cloudinary = filename;
            img.dataset.folder = folder;
            img.src = this.config.placeholder;
            img.classList.add('cloudinary-lazy');
            
            // 添加到观察器
            this.observer.observe(img);
        });
        
        // 处理已有的懒加载图片
        const lazyImages = document.querySelectorAll('img[data-cloudinary], img.cloudinary-lazy');
        lazyImages.forEach(img => this.observer.observe(img));
    }
    
    // 从路径推断文件夹
    getFolderFromPath(path) {
        if (path.includes('banner')) return 'banners';
        if (path.includes('pickup')) return 'products';
        if (path.includes('new')) return 'products';
        if (path.includes('gallery')) return 'gallery';
        if (path.includes('logo')) return 'logos';
        return 'website'; // 默认文件夹
    }
    
    // 加载图片
    async loadImage(img) {
        const imageName = img.dataset.cloudinary;
        const folder = img.dataset.folder || '';
        
        if (!imageName) return;
        
        try {
            img.classList.add('loading');
            
            // 构建优化后的URL
            const optimizedUrl = this.getResponsiveUrl(imageName, folder);
            
            // 预加载图片
            await this.preloadImage(optimizedUrl);
            
            // 设置图片源
            img.src = optimizedUrl;
            img.classList.remove('loading');
            img.classList.add('loaded');
            
            // 预加载下一张
            this.preloadNext(img);
            
        } catch (error) {
            console.warn('Cloudinary图片加载失败:', error);
            this.handleError(img, imageName, folder);
        }
    }
    
    // 预加载图片
    preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(new Error('加载失败'));
            img.src = url;
        });
    }
    
    // 错误处理 - 尝试不同的文件夹和格式
    async handleError(img, imageName, folder) {
        const fallbackOptions = [
            { folder: '', format: 'jpg' },
            { folder: 'website', format: 'jpg' },
            { folder: folder, format: 'png' },
            { folder: '', format: 'png' }
        ];
        
        for (const option of fallbackOptions) {
            try {
                const fallbackUrl = this.buildUrl(imageName, {
                    width: 'auto',
                    folder: option.folder,
                    format: option.format
                });
                
                await this.preloadImage(fallbackUrl);
                img.src = fallbackUrl;
                img.classList.add('loaded');
                return;
            } catch (error) {
                continue;
            }
        }
        
        // 所有尝试都失败
        img.src = this.config.placeholder;
        img.classList.add('error');
    }
    
    // 预加载下一张图片
    preloadNext(currentImg) {
        const nextImg = currentImg.parentElement?.nextElementSibling?.querySelector('img[data-cloudinary]');
        if (nextImg && nextImg.dataset.cloudinary) {
            const nextUrl = this.getResponsiveUrl(nextImg.dataset.cloudinary, nextImg.dataset.folder);
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = nextUrl;
            document.head.appendChild(link);
        }
    }
    
    // 设置响应式图片
    setupResponsiveImages() {
        window.addEventListener('resize', this.debounce(() => {
            const images = document.querySelectorAll('img.loaded[data-cloudinary]');
            images.forEach(img => {
                const newUrl = this.getResponsiveUrl(img.dataset.cloudinary, img.dataset.folder);
                if (img.src !== newUrl) {
                    img.src = newUrl;
                }
            });
        }, 300));
    }
    
    // 防抖函数
    debounce(func, wait) {
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
    
    // 手动加载图片
    loadImageManually(selector, imageName, folder = '') {
        const img = document.querySelector(selector);
        if (img) {
            img.dataset.cloudinary = imageName;
            img.dataset.folder = folder;
            this.loadImage(img);
        }
    }
    
    // 更新配置
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        console.log('Cloudinary配置已更新:', this.config);
    }
    
    // 获取图片信息
    getImageInfo(imageName, folder = '') {
        const url = this.buildUrl(imageName, { folder });
        return {
            url: url,
            responsive: {
                mobile: this.buildUrl(imageName, { width: '480', folder }),
                tablet: this.buildUrl(imageName, { width: '768', folder }),
                desktop: this.buildUrl(imageName, { width: '1200', folder })
            }
        };
    }
}

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 🔥 替换为你的Cloudinary云名称
    window.cloudinaryLoader = new CloudinaryImageLoader({
        cloudName: 'YOUR_CLOUD_NAME'
    });
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CloudinaryImageLoader };
}
