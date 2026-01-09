/**
 * 派工單管理頁面 JavaScript
 * work-order.js
 */

document.addEventListener('DOMContentLoaded', function() {
    const sidebarManager = new SidebarManager();
    const workOrderModal = new Modal('workOrderModal');
    
    let currentPage = 1;
    const pageSize = 10;
    
    // 搜尋面板收合功能
    const searchPanelHeader = document.getElementById('searchPanelHeader');
    const searchPanel = document.querySelector('.search-panel');
    const searchPanelToggleIcon = document.getElementById('searchPanelToggleIcon');
    
    if (searchPanelHeader && searchPanel) {
        searchPanelHeader.addEventListener('click', function() {
            searchPanel.classList.toggle('collapsed');
        });
    }

    loadWorkOrderData();
    
    function loadWorkOrderData(filters) {
        const result = CRMMockData.getPaged('workOrders', currentPage, pageSize, filters);
        renderTable(result.items);
        renderPagination(result);
    }
    
    function renderTable(data) {
        const tbody = document.getElementById('workOrderTableBody');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" class="text-center">無資料</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(function(order, index) {
            let statusClass = '';
            switch(order.status) {
                case '待派工': statusClass = 'status-pending'; break;
                case '處理中': statusClass = 'status-processing'; break;
                case '已完成': statusClass = 'status-completed'; break;
                case '已取消': statusClass = 'status-cancelled'; break;
            }
            
            let priorityClass = '';
            switch(order.priority) {
                case '高': priorityClass = 'priority-high'; break;
                case '中': priorityClass = 'priority-medium'; break;
                case '低': priorityClass = 'priority-low'; break;
            }
            
            return `
                <tr>
                    <td data-label="序號">${(currentPage - 1) * pageSize + index + 1}</td>
                    <td data-label="單號"><a href="#" class="link-order" data-id="${order.id}">${order.orderNo}</a></td>
                    <td data-label="案場">${order.projectName}</td>
                    <td data-label="戶號">${order.unitName}</td>
                    <td data-label="類型">${order.type}</td>
                    <td data-label="類別">${order.category}</td>
                    <td data-label="描述" class="text-ellipsis" title="${order.description}">${order.description}</td>
                    <td data-label="承辦單位">${order.assignee}</td>
                    <td data-label="優先"><span class="priority-badge ${priorityClass}">${order.priority}</span></td>
                    <td data-label="狀態"><span class="status-badge ${statusClass}">${order.status}</span></td>
                    <td data-label="到期日">${order.dueDate}</td>
                    <td data-label="操作">
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" data-id="${order.id}" title="編輯">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-action btn-delete" data-id="${order.id}" title="刪除">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // 綁定事件
        document.querySelectorAll('.btn-edit').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                editWorkOrder(id);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                deleteWorkOrder(id);
            });
        });
        
        document.querySelectorAll('.link-order').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const id = parseInt(this.dataset.id);
                viewWorkOrder(id);
            });
        });
    }
    
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
                loadWorkOrderData();
            });
        });
    }
    
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
    
    document.getElementById('btnAdd').addEventListener('click', function() {
        document.getElementById('modalTitle').textContent = '新增派工單';
        document.getElementById('workOrderForm').reset();
        document.getElementById('workOrderId').value = '';
        workOrderModal.open();
    });
    
    function editWorkOrder(id) {
        const order = CRMMockData.getById('workOrders', id);
        if (!order) return;
        
        document.getElementById('modalTitle').textContent = '編輯派工單';
        document.getElementById('workOrderId').value = order.id;
        document.getElementById('woProject').value = order.projectName;
        document.getElementById('woUnit').value = order.unitName;
        document.getElementById('woType').value = order.type;
        document.getElementById('woCategory').value = order.category;
        document.getElementById('woAssignee').value = order.assignee;
        document.getElementById('woPriority').value = order.priority;
        document.getElementById('woDueDate').value = order.dueDate;
        document.getElementById('woStatus').value = order.status;
        document.getElementById('woDescription').value = order.description;
        
        workOrderModal.open();
    }
    
    function viewWorkOrder(id) {
        const order = CRMMockData.getById('workOrders', id);
        if (!order) return;
        
        alert(`派工單詳情：\n單號：${order.orderNo}\n案場：${order.projectName}\n戶號：${order.unitName}\n類型：${order.type}\n類別：${order.category}\n描述：${order.description}\n承辦：${order.assignee}\n狀態：${order.status}\n優先：${order.priority}\n到期日：${order.dueDate}`);
    }
    
    function deleteWorkOrder(id) {
        const order = CRMMockData.getById('workOrders', id);
        if (!order) return;
        
        ConfirmDialog.show({
            title: '確認刪除',
            message: `確定要刪除派工單「${order.orderNo}」嗎？`,
            onConfirm: function() {
                alert('已刪除派工單');
                loadWorkOrderData();
            }
        });
    }
    
    document.getElementById('btnSave').addEventListener('click', function() {
        const form = document.getElementById('workOrderForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        alert('已儲存派工單資料');
        workOrderModal.close();
        loadWorkOrderData();
    });
    
    document.getElementById('btnCancel').addEventListener('click', function() {
        workOrderModal.close();
    });
    
    document.getElementById('btnExport').addEventListener('click', function() {
        alert('匯出功能開發中...');
    });
    
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        currentPage = 1;
        loadWorkOrderData();
    });
    
    document.getElementById('searchForm').addEventListener('reset', function() {
        setTimeout(function() {
            currentPage = 1;
            loadWorkOrderData();
        }, 0);
    });
});
