// 當文件載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    const sidebarManager = new SidebarManager();
    
    // 手動設定 "案場管理" 為 active，因為此頁面是其子頁面
    const greenSiteLink = document.querySelector('a[href="green-site.html"]');
    if (greenSiteLink) {
        greenSiteLink.classList.add('active');
        
        // 展開父選單
        let parentItem = greenSiteLink.closest('.menu-items');
        if (parentItem) {
            let parentMenuItem = parentItem.closest('.menu-item');
            while (parentMenuItem) {
                parentMenuItem.classList.add('expanded');
                parentItem = parentMenuItem.parentElement.closest('.menu-items');
                parentMenuItem = parentItem ? parentItem.closest('.menu-item') : null;
            }
        }
    }

    // 獲取DOM元素
    const saveButton = document.getElementById('saveButton');
    const successMessage = document.getElementById('successMessage');
    
    // 點擊儲存按鈕事件
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            // 顯示載入狀態
            saveButton.disabled = true;
            const originalContent = saveButton.innerHTML;
            saveButton.innerHTML = '<span class="save-icon">⏳</span>儲存中...';
            
            // 模擬儲存過程（實際應用中應該是AJAX請求）
            setTimeout(function() {
                // 恢復按鈕狀態
                saveButton.disabled = false;
                saveButton.innerHTML = originalContent;
                
                // 顯示成功訊息
                if (successMessage) {
                    successMessage.style.display = 'block';
                    
                    // 3秒後隱藏成功訊息
                    setTimeout(function() {
                        successMessage.style.display = 'none';
                    }, 3000);
                }
            }, 1000);
        });
    }
    
    // 點擊時段切換狀態（示範用）
    const slots = document.querySelectorAll('.slot');
    slots.forEach(function(slot) {
        slot.addEventListener('click', function() {
            const currentValue = parseInt(this.textContent);
            // 循環切換：0 -> 1 -> 2 -> 0
            const newValue = (currentValue + 1) % 3;
            this.textContent = newValue;
            
            // 更新樣式
            this.className = 'slot';
            if (newValue === 0) {
                this.classList.add('slot-available');
            } else if (newValue === 1) {
                this.classList.add('slot-booked-1');
            } else if (newValue === 2) {
                this.classList.add('slot-booked-2');
            }
        });
    });
});
