document.addEventListener('DOMContentLoaded', function() {
    const tableContainer = document.getElementById('table-container');
    const arrowLeft = document.getElementById('arrow-left');
    const arrowRight = document.getElementById('arrow-right');
    const scrollProgress = document.getElementById('scroll-progress');
    const swipeHint = document.getElementById('swipe-hint');
    
    // 檢查是否需要滾動
    function checkScrollNeeded() {
        if (!tableContainer) return false;
        return tableContainer.scrollWidth > tableContainer.clientWidth;
    }
    
    // 更新滾動進度條
    function updateScrollProgress() {
        if (!tableContainer) return;
        const maxScroll = tableContainer.scrollWidth - tableContainer.clientWidth;
        const scrollPercentage = (tableContainer.scrollLeft / maxScroll) * 100;
        if (scrollProgress) {
            scrollProgress.style.width = scrollPercentage + '%';
        }
    }
    
    // 更新箭頭狀態
    function updateArrows() {
        if (!tableContainer) return;
        const maxScroll = tableContainer.scrollWidth - tableContainer.clientWidth;
        const scrollNeeded = checkScrollNeeded();
        
        // 如果不需要滾動，隱藏整個指示器
        const indicatorContainer = document.querySelector('.scroll-indicator-container');
        if (indicatorContainer) {
            indicatorContainer.style.display = scrollNeeded ? 'flex' : 'none';
        }
        
        if (!scrollNeeded) {
            return;
        }
        
        // 更新左箭頭狀態
        if (arrowLeft) {
            arrowLeft.classList.toggle('disabled', tableContainer.scrollLeft <= 0);
        }
        
        // 更新右箭頭狀態
        if (arrowRight) {
            arrowRight.classList.toggle('disabled', tableContainer.scrollLeft >= maxScroll - 5); // 5px 容差
        }
        
        // 更新滾動進度條
        updateScrollProgress();
    }
    
    // 點擊左箭頭
    if (arrowLeft) {
        arrowLeft.addEventListener('click', function() {
            if (!arrowLeft.classList.contains('disabled')) {
                tableContainer.scrollBy({ left: -200, behavior: 'smooth' });
            }
        });
    }
    
    // 點擊右箭頭
    if (arrowRight) {
        arrowRight.addEventListener('click', function() {
            if (!arrowRight.classList.contains('disabled')) {
                tableContainer.scrollBy({ left: 200, behavior: 'smooth' });
            }
        });
    }
    
    // 監聽滾動事件
    if (tableContainer) {
        tableContainer.addEventListener('scroll', updateArrows);
        
        // 添加觸摸滑動支持
        let touchStartX = 0;
        let touchEndX = 0;
        
        tableContainer.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        tableContainer.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const swipeThreshold = 50; // 設定滑動閾值
            if (touchEndX < touchStartX - swipeThreshold) {
                // 向左滑動 (顯示右側內容)
                if (arrowRight && !arrowRight.classList.contains('disabled')) {
                    tableContainer.scrollBy({ left: 100, behavior: 'smooth' });
                }
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                // 向右滑動 (顯示左側內容)
                if (arrowLeft && !arrowLeft.classList.contains('disabled')) {
                    tableContainer.scrollBy({ left: -100, behavior: 'smooth' });
                }
            }
        }
    }
    
    // 頁面加載和調整大小時檢查滾動
    window.addEventListener('load', function() {
        updateArrows();
        
        // 檢查是否需要顯示滑動提示
        if (checkScrollNeeded()) {
            // 檢查是否是首次訪問
            if (!localStorage.getItem('hasSeenSwipeHint')) {
                // 顯示滑動提示
                if (swipeHint) {
                    swipeHint.style.display = 'flex';
                    
                    // 設置已顯示過提示的標記
                    localStorage.setItem('hasSeenSwipeHint', 'true');
                    
                    // 3秒後自動隱藏提示
                    setTimeout(function() {
                        swipeHint.style.display = 'none';
                    }, 3000);
                }
            }
        }
    });
    
    window.addEventListener('resize', updateArrows);
    
    // 清除按鈕功能
    const clearButton = document.querySelector('.btn-clear');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            const statusSelect = document.getElementById('payment-status');
            const nameInput = document.getElementById('payment-name');
            if (statusSelect) statusSelect.selectedIndex = 0;
            if (nameInput) nameInput.value = '';
        });
    }
    
    // 初始化箭頭狀態
    updateArrows();
    
    // 自動檢測是否需要滾動，並在需要時顯示提示動畫
    function checkAndShowHint() {
        if (checkScrollNeeded()) {
            const scrollArrows = document.querySelector('.scroll-arrows');
            if (scrollArrows) {
                scrollArrows.style.animation = 'none';
                setTimeout(() => {
                    scrollArrows.style.animation = 'slideHint 2s ease-in-out';
                }, 10);
            }
        }
    }
    
    // 頁面加載後檢查
    window.addEventListener('load', checkAndShowHint);
    window.addEventListener('resize', checkAndShowHint);
    
    // 搜尋功能
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const status = document.getElementById('payment-status').value;
            const name = document.getElementById('payment-name').value.toLowerCase();
            
            // 這裡可以實現實際的搜尋邏輯
            alert(`執行搜尋：狀態=${status}，款項名稱=${name}`);
            
            // 實際應用中，這裡應該是向後端發送請求或過濾現有數據
        });
    }
    
    // 新增期款按鈕功能
    const addPaymentBtn = document.getElementById('add-payment-btn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', function() {
            alert('開啟新增期款表單');
            // 實際應用中，這裡應該是打開新增表單或模態框
        });
    }
});

// 全局函數，用於 HTML 中的 onclick
window.sendNotification = function(itemName, status) {
    alert(`推播通知：${itemName} 的繳費狀態為 ${status}`);
};
