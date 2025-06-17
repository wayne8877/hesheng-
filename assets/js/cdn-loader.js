/**
 * jsDelivr CDN 图片加载器
 * 全球最快的免费CDN解决方案
 */

class CDNImageLoader {
    constructor(options = {}) {
        // CDN配置
        this.config = {
            // 🔥 请替换为你的GitHub用户名
            username: options.username || 'YOUR_GITHUB_USERNAME',
            // 图片仓库名
            repo: options.repo || 'my-images',
            // CDN服务器列表 (按速度排序)
            cdnServers: [
                'https://cdn.jsdelivr.net/gh',
                'https://fastly.jsdelivr.net/gh', 
                'https://gcore.jsdelivr.net/gh'
            ],
            // 当前使用的CDN索引
            currentCDN: 0,
            // 图片格式优先级
            formats: ['avif', 'webp', 'jpg', 'png'],
            // 占位符SVG
            placeholder: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3E加载中...%3C/text%3E%3C/svg%3E"
        };
        
        // 初始化
        this.init();
    }
    
    init() {
        console.log('🚀 CDN图片加载器初始化...');
        this.setupObserver();
        this.loadExistingImages();
        this.setupErrorHandling();
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
            rootMargin: '50px' // 提前50px开始加载
        });
    }
    
    // 加载现有图片
    loadExistingImages() {
        // 转换现有的本地图片为CDN图片
        const localImages = document.querySelectorAll('img[src*="assets/images/"]');
        localImages.forEach(img => this.convertToLazyLoad(img));
        
        // 处理懒加载图片
        const lazyImages = document.querySelectorAll('img[data-src], img.lazy-load');
        lazyImages.forEach(img => this.observer.observe(img));
    }
    
    // 转换本地图片为CDN懒加载
    convertToLazyLoad(img) {
        const src = img.src;
        const filename = src.split('/').pop();
        const category = this.getCategoryFromPath(src);
        
        // 构建CDN URL
        const cdnUrl = this.buildCDNUrl(category, filename);
        
        // 设置懒加载
        img.dataset.src = cdnUrl;
        img.src = this.config.placeholder;
        img.classList.add('lazy-load');
        
        // 添加到观察器
        this.observer.observe(img);
    }
    
    // 从路径推断分类
    getCategoryFromPath(path) {
        if (path.includes('banner')) return 'banners';
        if (path.includes('pickup')) return 'products';
        if (path.includes('new')) return 'products';
        if (path.includes('gallery')) return 'gallery';
        if (path.includes('logo')) return 'logos';
        return 'gallery'; // 默认分类
    }
    
    // 构建CDN URL
    buildCDNUrl(category, filename) {
        const server = this.config.cdnServers[this.config.currentCDN];
        const webpFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        return `${server}/${this.config.username}/${this.config.repo}@main/${category}/${webpFilename}`;
    }
    
    // 加载图片
    async loadImage(img) {
        const originalSrc = img.dataset.src;
        if (!originalSrc) return;
        
        try {
            // 显示加载动画
            img.classList.add('loading');
            
            // 尝试加载图片
            const loadedSrc = await this.tryLoadWithFallback(originalSrc);
            
            // 设置图片源
            img.src = loadedSrc;
            img.classList.remove('loading');
            img.classList.add('loaded');
            
            // 预加载下一张图片
            this.preloadNext(img);
            
        } catch (error) {
            console.warn('图片加载失败:', originalSrc, error);
            this.handleImageError(img);
        }
    }
    
    // 尝试加载并回退
    async tryLoadWithFallback(url) {
        // 尝试所有CDN服务器
        for (let i = 0; i < this.config.cdnServers.length; i++) {
            try {
                const testUrl = url.replace(
                    this.config.cdnServers[this.config.currentCDN],
                    this.config.cdnServers[i]
                );
                
                await this.testImageLoad(testUrl);
                
                // 更新当前CDN
                if (i !== this.config.currentCDN) {
                    this.config.currentCDN = i;
                    console.log(`切换到CDN: ${this.config.cdnServers[i]}`);
                }
                
                return testUrl;
            } catch (error) {
                continue;
            }
        }
        
        throw new Error('所有CDN都无法加载图片');
    }
    
    // 测试图片加载
    testImageLoad(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(new Error('加载失败'));
            img.src = url;
        });
    }
    
    // 处理图片错误
    handleImageError(img) {
        img.src = this.config.placeholder;
        img.classList.add('error');
        img.alt = '图片加载失败';
    }
    
    // 预加载下一张图片
    preloadNext(currentImg) {
        const nextImg = currentImg.parentElement?.nextElementSibling?.querySelector('img[data-src]');
        if (nextImg && nextImg.dataset.src) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = nextImg.dataset.src;
            document.head.appendChild(link);
        }
    }
    
    // 设置错误处理
    setupErrorHandling() {
        window.addEventListener('online', () => {
            console.log('网络已连接，重新加载失败的图片');
            this.retryFailedImages();
        });
    }
    
    // 重试失败的图片
    retryFailedImages() {
        const failedImages = document.querySelectorAll('img.error');
        failedImages.forEach(img => {
            img.classList.remove('error');
            this.loadImage(img);
        });
    }
    
    // 手动加载图片
    loadImageManually(selector, category, filename) {
        const img = document.querySelector(selector);
        if (img) {
            const cdnUrl = this.buildCDNUrl(category, filename);
            img.dataset.src = cdnUrl;
            this.loadImage(img);
        }
    }
    
    // 批量更新配置
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        console.log('CDN配置已更新:', this.config);
    }
}

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 创建全局CDN加载器实例
    window.cdnLoader = new CDNImageLoader({
        username: 'YOUR_GITHUB_USERNAME', // 🔥 请替换为你的GitHub用户名
        repo: 'my-images'
    });
});

// 导出供其他模块使用
export { CDNImageLoader };
