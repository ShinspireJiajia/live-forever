/**
 * ============================================
 * 陸府建設 CRM 系統 - 交屋預約頁面 JavaScript
 * ============================================
 * 檔案：reservation-handover.js
 * 說明：處理交屋預約頁面的互動邏輯
 * 建立日期：2025-12-29
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    // 渲染共用元件 (Header + Sidebar)

    if (typeof initCRMLayout === 'function') {

        initCRMLayout();

    }

    

    const sidebarManager = new SidebarManager();
    
    // 初始化彈窗
    const handoverModal = new Modal('handoverModal');
    const confirmHandoverModal = new Modal('confirmHandoverModal');
    const pushModal = new Modal('pushModal');
    
    // 分頁設定
    let currentPage = 1;
    const pageSize = 10;
    
    // 載入資料
    loadHandoverData();
    
    /**
     * 載入交屋預約資料
     */
    function loadHandoverData(filters) {
        const result = CRMMockData.getPaged('handoverReservations', currentPage, pageSize, filters);
        renderTable(result.items);
        renderPagination(result);
    }
    
    /**
     * 渲染表格
     */
    function renderTable(data) {
        const tbody = document.getElementById('handoverTableBody');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="text-center">無資料</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(function(handover, index) {
            // 狀態樣式對應
            let statusClass = '';
            switch(handover.status) {
                case '待預約': statusClass = 'status-pending'; break;
                case '已預約': statusClass = 'status-reserved'; break;
                case '交屋中': statusClass = 'status-inprogress'; break;
                case '已交屋': statusClass = 'status-completed'; break;
            }
            
            // 款項與驗屋狀態
            let paymentClass = handover.paymentStatus === '已結清' ? 'status-completed' : 'status-warning';
            let inspectionClass = handover.inspectionStatus === '已完成' ? 'status-completed' : 'status-warning';
            
            // 提醒狀態
            let remindHtml = '';
            if (handover.remindStatus) {
                const remindClass = handover.remindStatus === '已發送' ? 'remind-sent' : 'remind-pending';
                const remindIcon = handover.remindStatus === '已發送' ? 'fa-check' : 'fa-clock';
                remindHtml = `<span class="remind-badge ${remindClass}"><i class="fa-solid ${remindIcon}"></i>${handover.remindStatus}</span>`;
            } else {
                remindHtml = '<span class="remind-badge remind-pending"><i class="fa-solid fa-clock"></i>未發送</span>';
            }
            
            return `
                <tr>
                    <td>${(currentPage - 1) * pageSize + index + 1}</td>
                    <td>${handover.projectName}</td>
                    <td>${handover.unitName}</td>
                    <td>${handover.memberName}</td>
                    <td>${handover.reservationDate || '-'}</td>
                    <td>${handover.timeSlot || '-'}</td>
                    <td><span class="status-badge ${paymentClass}">${handover.paymentStatus}</span></td>
                    <td><span class="status-badge ${inspectionClass}">${handover.inspectionStatus}</span></td>
                    <td><span class="status-badge ${statusClass}">${handover.status}</span></td>
                    <td>${remindHtml}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" data-id="${handover.id}" title="編輯">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            ${handover.status !== '已交屋' ? `
                                <button class="btn-action btn-confirm" data-id="${handover.id}" title="確認交屋">
                                    <i class="fa-solid fa-key"></i>
                                </button>
                            ` : `
                                <button class="btn-action btn-survey" data-id="${handover.id}" title="發送問卷">
                                    <i class="fa-solid fa-clipboard-question"></i>
                                </button>
                            `}
                            <button class="btn-action btn-notify" data-id="${handover.id}" title="發送通知">
                                <i class="fa-solid fa-bell"></i>
                            </button>
                            <button class="btn-action btn-delete" data-id="${handover.id}" title="刪除">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        bindTableEvents();
    }
    
    /**
     * 綁定表格操作事件
     */
    function bindTableEvents() {
        // 編輯按鈕
        document.querySelectorAll('.btn-edit').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                editHandover(id);
            });
        });
        
        // 確認交屋按鈕
        document.querySelectorAll('.btn-confirm').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                showConfirmHandover(id);
            });
        });
        
        // 通知按鈕
        document.querySelectorAll('.btn-notify').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                showPushModal(id);
            });
        });
        
        // 問卷按鈕
        document.querySelectorAll('.btn-survey').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                sendSurvey(id);
            });
        });
        
        // 刪除按鈕
        document.querySelectorAll('.btn-delete').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                deleteHandover(id);
            });
        });
    }
    
    /**
     * 渲染分頁
     */
    function renderPagination(result) {
        const wrapper = document.getElementById('paginationWrapper');
        
        if (result.totalPages <= 1) {
            wrapper.innerHTML = '';
            return;
        }
        
        wrapper.innerHTML = `
            <div class="pagination">
                <span class="pagination-info">共 ${result.total} 筆，第 ${result.page} / ${result.totalPages} 頁</span>
                <div class="pagination-buttons">
                    <button class="pagination-btn" ${result.page === 1 ? 'disabled' : ''} data-page="${result.page - 1}">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    ${generatePageButtons(result.page, result.totalPages)}
                    <button class="pagination-btn" ${result.page === result.totalPages ? 'disabled' : ''} data-page="${result.page + 1}">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        wrapper.querySelectorAll('.pagination-btn:not([disabled])').forEach(function(btn) {
            btn.addEventListener('click', function() {
                currentPage = parseInt(this.dataset.page);
                loadHandoverData();
            });
        });
    }
    
    /**
     * 生成分頁按鈕
     */
    function generatePageButtons(current, total) {
        let buttons = '';
        for (let i = 1; i <= total; i++) {
            if (i === current) {
                buttons += `<button class="pagination-btn active">${i}</button>`;
            } else if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) {
                buttons += `<button class="pagination-btn" data-page="${i}">${i}</button>`;
            } else if (i === current - 3 || i === current + 3) {
                buttons += '<span class="pagination-ellipsis">...</span>';
            }
        }
        return buttons;
    }
    
    // 新增預約按鈕事件
    document.getElementById('btnAdd').addEventListener('click', function() {
        document.getElementById('modalTitle').textContent = '新增交屋預約';
        document.getElementById('handoverForm').reset();
        document.getElementById('handoverId').value = '';
        handoverModal.open();
    });
    
    /**
     * 編輯交屋預約
     */
    function editHandover(id) {
        const handover = CRMMockData.getById('handoverReservations', id);
        if (!handover) return;
        
        document.getElementById('modalTitle').textContent = '編輯交屋預約';
        document.getElementById('handoverId').value = handover.id;
        document.getElementById('hProject').value = handover.projectName;
        document.getElementById('hUnit').value = handover.unitName;
        document.getElementById('hMemberName').value = handover.memberName;
        document.getElementById('hPhone').value = handover.phone;
        document.getElementById('hDate').value = handover.reservationDate || '';
        document.getElementById('hTimeSlot').value = handover.timeSlot || '';
        document.getElementById('hStatus').value = handover.status;
        document.getElementById('hRemark').value = handover.remark || '';
        
        // 設定檢核項目
        document.getElementById('checkPayment').checked = handover.paymentStatus === '已結清';
        document.getElementById('checkInspection').checked = handover.inspectionStatus === '已完成';
        
        handoverModal.open();
    }
    
    // 確認交屋相關
    let currentConfirmId = null;
    
    /**
     * 顯示確認交屋彈窗
     */
    function showConfirmHandover(id) {
        const handover = CRMMockData.getById('handoverReservations', id);
        if (!handover) return;
        
        currentConfirmId = id;
        document.getElementById('confirmUnitName').textContent = `${handover.projectName} ${handover.unitName}`;
        document.getElementById('confirmRemark').value = '';
        
        confirmHandoverModal.open();
    }
    
    document.getElementById('btnConfirmHandover').addEventListener('click', function() {
        if (currentConfirmId) {
            alert('已確認交屋完成！系統將自動發送滿意度問卷給住戶。');
            confirmHandoverModal.close();
            loadHandoverData();
        }
    });
    
    document.getElementById('btnConfirmCancel').addEventListener('click', function() {
        confirmHandoverModal.close();
    });
    
    // 推播通知相關
    let currentPushId = null;
    
    /**
     * 顯示推播通知彈窗
     */
    function showPushModal(id) {
        const handover = CRMMockData.getById('handoverReservations', id);
        if (!handover) return;
        
        currentPushId = id;
        
        // 更新預覽資訊
        document.getElementById('previewUnit').textContent = handover.unitName;
        document.getElementById('previewDate').textContent = handover.reservationDate || '尚未預約';
        
        pushModal.open();
    }
    
    // 推播類型選擇
    document.querySelectorAll('.type-option').forEach(function(option) {
        option.addEventListener('click', function() {
            document.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            
            // 更新預覽標題
            const typeTitle = this.querySelector('.type-title').textContent;
            document.querySelector('.preview-header').textContent = `【${typeTitle}】`;
        });
    });
    
    // 發送推播按鈕
    document.querySelector('.btn-send-push')?.addEventListener('click', function() {
        const selectedType = document.querySelector('.type-option.selected .type-title').textContent;
        alert(`已透過 LINE@ 發送「${selectedType}」通知！`);
        pushModal.close();
        loadHandoverData();
    });
    
    // 關閉推播彈窗
    document.querySelector('.modal-close-btn')?.addEventListener('click', function() {
        pushModal.close();
    });
    
    /**
     * 發送滿意度問卷
     */
    function sendSurvey(id) {
        const handover = CRMMockData.getById('handoverReservations', id);
        if (!handover) return;
        
        if (confirm(`確定要發送滿意度問卷給 ${handover.memberName} 嗎？`)) {
            alert(`已發送滿意度問卷給 ${handover.memberName}`);
        }
    }
    
    /**
     * 刪除交屋預約
     */
    function deleteHandover(id) {
        const handover = CRMMockData.getById('handoverReservations', id);
        if (!handover) return;
        
        if (typeof ConfirmDialog !== 'undefined') {
            ConfirmDialog.show({
                title: '確認刪除',
                message: `確定要刪除 ${handover.memberName} 的交屋預約嗎？`,
                onConfirm: function() {
                    alert('已刪除預約');
                    loadHandoverData();
                }
            });
        } else {
            if (confirm(`確定要刪除 ${handover.memberName} 的交屋預約嗎？`)) {
                alert('已刪除預約');
                loadHandoverData();
            }
        }
    }
    
    // 儲存按鈕
    document.getElementById('btnSave').addEventListener('click', function() {
        const form = document.getElementById('handoverForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        alert('已儲存交屋預約');
        handoverModal.close();
        loadHandoverData();
    });
    
    // 取消按鈕
    document.getElementById('btnCancel').addEventListener('click', function() {
        handoverModal.close();
    });
    
    // 批次通知按鈕
    document.getElementById('btnBatchNotify').addEventListener('click', function() {
        alert('已發送批次交屋通知');
    });
    
    // 匯出按鈕
    document.getElementById('btnExport').addEventListener('click', function() {
        alert('匯出功能開發中...');
    });
    
    // 查詢表單
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        currentPage = 1;
        loadHandoverData();
    });
    
    // 重置表單
    document.getElementById('searchForm').addEventListener('reset', function() {
        setTimeout(function() {
            currentPage = 1;
            loadHandoverData();
        }, 0);
    });
    
    // 戶號選擇連動會員資料
    document.getElementById('hUnit').addEventListener('change', function() {
        const unit = this.value;
        if (unit) {
            // 模擬帶入會員資料
            document.getElementById('hMemberName').value = '張小明';
            document.getElementById('hPhone').value = '0934-567-890';
        } else {
            document.getElementById('hMemberName').value = '';
            document.getElementById('hPhone').value = '';
        }
    });
});
