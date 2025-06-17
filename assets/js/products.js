document.addEventListener('DOMContentLoaded', function() {
    // 产品筛选功能
    const filterOptions = document.querySelectorAll('.filter-option');
    const productCards = document.querySelectorAll('.product-card');

    filterOptions.forEach(option => {
        option.addEventListener('click', function() {
            const filterGroup = this.closest('.filter-group');
            const filterType = filterGroup.querySelector('h4').textContent;
            const filterValue = this.dataset.filter;

            // 更新按钮状态
            filterGroup.querySelectorAll('.filter-option').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // 筛选产品
            filterProducts();
        });
    });

    function filterProducts() {
        const typeFilter = document.querySelector('.filter-group:first-child .filter-option.active').dataset.filter;
        const craftFilter = document.querySelector('.filter-group:last-child .filter-option.active').dataset.filter;

        productCards.forEach(card => {
            const cardType = card.dataset.type;
            const cardCraft = card.dataset.craft;
            
            const typeMatch = typeFilter === 'all' || cardType === typeFilter;
            const craftMatch = craftFilter === 'all' || cardCraft === craftFilter;

            if (typeMatch && craftMatch) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    // 快速查看功能
    const quickViewBtns = document.querySelectorAll('.quick-view');
    const modal = document.querySelector('.quick-view-modal');
    const closeModal = document.querySelector('.close-modal');

    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.product-card');
            const productData = {
                title: card.querySelector('.product-title').textContent,
                desc: card.querySelector('.product-desc').textContent,
                price: card.querySelector('.product-price').textContent,
                image: card.querySelector('.product-avatar').src,
                specs: Array.from(card.querySelectorAll('.spec-item')).map(spec => spec.textContent.trim())
            };

            // 更新弹窗内容
            updateModalContent(productData);
            
            // 显示弹窗
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function updateModalContent(data) {
        const modal = document.querySelector('.quick-view-modal');
        modal.querySelector('.preview-title').textContent = data.title;
        modal.querySelector('.preview-desc').textContent = data.desc;
        modal.querySelector('.preview-price').textContent = data.price;
        modal.querySelector('.main-image').src = data.image;

        const specsContainer = modal.querySelector('.preview-specs');
        specsContainer.innerHTML = data.specs.map(spec => `
            <div class="spec-item">
                <i class="icon-info"></i>
                <span>${spec}</span>
            </div>
        `).join('');
    }

    // 关闭弹窗
    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // 点击弹窗外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // 加入询价单功能
    const inquiryBtns = document.querySelectorAll('.inquiry-btn');
    let inquiryList = [];

    inquiryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.product-card');
            const productData = {
                title: card.querySelector('.product-title').textContent,
                price: card.querySelector('.product-price').textContent,
                image: card.querySelector('.product-avatar').src
            };

            // 添加到询价单
            addToInquiryList(productData);
            
            // 更新按钮状态
            this.textContent = '已加入询价单';
            this.disabled = true;
            
            // 显示提示
            showNotification('已添加到询价单');
        });
    });

    function addToInquiryList(product) {
        inquiryList.push(product);
        // 这里可以添加将数据保存到localStorage或发送到服务器的逻辑
        console.log('询价单:', inquiryList);
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
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
        }, 2000);
    }

    // 添加通知样式
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}); 