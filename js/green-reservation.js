document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    const sidebarManager = new SidebarManager();

    // 查詢按鈕點擊事件
    const searchBtn = document.querySelector('.search-panel .btn-primary');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            alert('執行查詢');
        });
    }
    
    // 重置按鈕點擊事件
    const resetBtn = document.querySelector('.btn-secondary');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            document.querySelectorAll('.search-panel input').forEach(input => {
                input.value = '';
            });
            document.querySelectorAll('.search-panel select').forEach(select => {
                select.selectedIndex = 0;
            });
        });
    }
    
    // 新增預約按鈕點擊事件
    const addBtn = document.getElementById('btnAdd');
    if (addBtn) {
        // 按鈕已設定 href，無需額外 JS 處理
    }
    
    // 匯出按鈕點擊事件
    const exportBtn = document.getElementById('btnExport');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            alert('匯出資料');
        });
    }
    
    // 推播按鈕點擊事件
    const pushModalEl = document.getElementById('pushModal');
    
    // 初始化推播彈窗邏輯
    if (pushModalEl) {
        // 選擇推播類型
        const typeOptions = pushModalEl.querySelectorAll('.type-option');
        typeOptions.forEach(option => {
            option.addEventListener('click', function() {
                // 移除所有選中狀態
                typeOptions.forEach(opt => opt.classList.remove('selected'));
                // 添加當前選中狀態
                this.classList.add('selected');
                
                // 更新預覽標題
                const previewHeader = pushModalEl.querySelector('.preview-header');
                const typeTitle = this.querySelector('.type-title').textContent;
                if (previewHeader) {
                    previewHeader.textContent = `【${typeTitle}】`;
                }
            });
        });
        
        // 更新推播內容預覽
        const contentTextarea = pushModalEl.querySelector('.content-textarea');
        const previewBody = pushModalEl.querySelector('.preview-body');
        if (contentTextarea && previewBody) {
            contentTextarea.addEventListener('input', function() {
                previewBody.textContent = this.value;
            });
        }
        
        // 顯示/隱藏詳情
        const showDetailsCheckbox = pushModalEl.querySelector('#showDetails');
        const previewDetails = pushModalEl.querySelector('.preview-details');
        if (showDetailsCheckbox && previewDetails) {
            showDetailsCheckbox.addEventListener('change', function() {
                previewDetails.style.display = this.checked ? 'flex' : 'none';
            });
        }
        
        // 顯示/隱藏連結按鈕
        const includeLinkCheckbox = pushModalEl.querySelector('#includeLink');
        const previewActions = pushModalEl.querySelector('.preview-actions');
        if (includeLinkCheckbox && previewActions) {
            includeLinkCheckbox.addEventListener('change', function() {
                previewActions.style.display = this.checked ? 'flex' : 'none';
            });
        }
        
        // 發送按鈕
        const sendBtn = pushModalEl.querySelector('.btn-send-push');
        if (sendBtn) {
            sendBtn.addEventListener('click', function() {
                Modal.close(pushModalEl);
                Modal.alert({
                    title: '發送成功',
                    message: '推播通知已發送！',
                    type: 'success'
                });
            });
        }
        
        // 取消按鈕
        const cancelBtn = pushModalEl.querySelector('.modal-close-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                Modal.close(pushModalEl);
            });
        }
        
        // 關閉按鈕 (X)
        const closeXBtn = pushModalEl.querySelector('.modal-close');
        if (closeXBtn) {
            closeXBtn.addEventListener('click', function() {
                Modal.close(pushModalEl);
            });
        }
    }

    // 綁定推播按鈕開啟彈窗
    document.querySelectorAll('.btn-push').forEach(button => {
        button.addEventListener('click', function() {
            // 取得該列資料以填充預覽
            const row = this.closest('tr');
            if (row && pushModalEl) {
                const unit = row.cells[1].textContent;
                const date = row.cells[2].textContent;
                
                const previewUnit = pushModalEl.querySelector('#previewUnit');
                const previewDate = pushModalEl.querySelector('#previewDate');
                
                if (previewUnit) previewUnit.textContent = unit;
                if (previewDate) previewDate.textContent = date;
                
                // 開啟彈窗
                Modal.open(pushModalEl);
            }
        });
    });

    // 綁定完工確認單連結
    document.querySelectorAll('.completion-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const row = this.closest('tr');
            if (row) {
                const idText = row.cells[0].textContent.trim(); // e.g., "RES-001"
                window.location.href = `green-reservation-report.html?id=${idText}`;
            }
        });
    });
});
