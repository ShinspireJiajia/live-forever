/**
 * 綠海報修個案單列表頁面 JavaScript
 * green-case-list.js
 * 
 * 功能說明：
 * - 綠海報修個案單列表資料載入與顯示
 * - 搜尋/篩選功能
 * - 新增/編輯/刪除個案單
 * - 檔案匯入功能
 * - 分頁功能
 * - 編號格式：GC-YYYYMMDD-XXXX
 */

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // 初始化
    // ========================================
    
    // 側邊欄管理
    // 渲染共用元件 (Header + Sidebar)

    if (typeof initCRMLayout === 'function') {

        initCRMLayout();

    }

    

    const sidebarManager = new SidebarManager();
    
    // 彈窗管理
    const caseModal = new Modal('caseModal');
    const deleteModal = new Modal('deleteModal');
    
    // 分頁設定
    let currentPage = 1;
    const pageSize = 10;
    
    // 待刪除的個案單 ID
    let deleteTargetId = null;
    
    // ========================================
    // Mock 資料（綠海報修個案單）
    // ========================================
    const mockCaseData = [
        {
            id: 1,
            caseNo: 'GC-20251204-0001',
            caseType: '售後',
            subject: '庭院植栽枯萎需更換',
            unit: 'A1-2',
            type: '維修',
            applicant: '吳Ｏ嬋',
            project: '陸府觀森 測試',
            status: '報價確認',
            closeDate: '',
            caseOverdue: '',
            caseOverdueStatus: '',
            milestoneOverdue: '2025-12-09',
            milestoneOverdueStatus: '已逾期',
            hasUnreadMessage: true,
            quotationCount: 2,
            signatureStatus: '未簽名',
            paymentStatus: '未付款'
        },
        {
            id: 2,
            caseNo: 'GC-20251128-0001',
            caseType: '售後',
            subject: '草皮養護異常',
            unit: 'A-03F',
            type: '維修',
            applicant: '林Ｏ君',
            project: 'Jade123',
            status: '維修中',
            closeDate: '',
            caseOverdue: '',
            caseOverdueStatus: '',
            milestoneOverdue: '2025-12-05',
            milestoneOverdueStatus: '已逾期',
            hasUnreadMessage: true,
            quotationCount: 1,
            signatureStatus: '未簽名',
            paymentStatus: '未付款'
        },
        {
            id: 3,
            caseNo: 'GC-20251115-0001',
            caseType: '售後',
            subject: '樹木修剪作業',
            unit: 'A1-02F',
            type: '維修',
            applicant: '林Ｏ君',
            project: 'PARK259',
            status: '待簽名',
            closeDate: '',
            caseOverdue: '2025-12-01',
            caseOverdueStatus: '',
            milestoneOverdue: '2025-11-20',
            milestoneOverdueStatus: '已逾期',
            quotationCount: 1,
            signatureStatus: '未簽名',
            paymentStatus: '未付款'
        },
        {
            id: 4,
            caseNo: 'GC-20251101-0001',
            caseType: '售後',
            subject: '病蟲害防治處理',
            unit: 'A1-01F',
            type: '維修',
            applicant: '林Ｏ君',
            project: '陸府觀森 測試',
            status: '待付款',
            closeDate: '',
            caseOverdue: '',
            caseOverdueStatus: '',
            milestoneOverdue: '2025-11-10',
            milestoneOverdueStatus: '',
            quotationCount: 1,
            signatureStatus: '已簽名',
            paymentStatus: '未付款'
        },
        {
            id: 5,
            caseNo: 'GC-20251020-0001',
            caseType: '售後',
            subject: '灌溉系統維修',
            unit: 'A1-01F',
            type: '維修',
            applicant: '林Ｏ君',
            project: '陸府觀森 測試',
            status: '已付款',
            closeDate: '',
            caseOverdue: '',
            caseOverdueStatus: '',
            milestoneOverdue: '',
            milestoneOverdueStatus: '',
            quotationCount: 1,
            signatureStatus: '已簽名',
            paymentStatus: '已付款'
        },
        {
            id: 6,
            caseNo: 'GC-20251010-0001',
            caseType: '售後',
            subject: '季節性施肥作業',
            unit: 'A-3',
            type: '維修',
            applicant: '高Ｏ蘆',
            project: '漢皇莊園',
            status: '結案',
            closeDate: '2025-10-15',
            caseOverdue: '',
            caseOverdueStatus: '',
            milestoneOverdue: '',
            milestoneOverdueStatus: '',
            quotationCount: 1,
            signatureStatus: '已簽名',
            paymentStatus: '已付款',
            invoiceStatus: '已開票'
        },
        {
            id: 7,
            caseNo: 'GC-20250920-0001',
            caseType: '售後',
            subject: '花卉更新種植',
            unit: 'A-06F',
            type: '維修',
            applicant: '漢ＯＯＯＯ君',
            project: 'Jade123',
            status: '立案',
            closeDate: '',
            caseOverdue: '',
            caseOverdueStatus: '',
            milestoneOverdue: '2025-09-25',
            milestoneOverdueStatus: '已逾期',
            quotationCount: 0,
            signatureStatus: '未簽名',
            paymentStatus: '未付款'
        },
        {
            id: 8,
            caseNo: 'GC-20250910-0001',
            caseType: '售後',
            subject: '草皮補植作業',
            unit: 'B2-4',
            type: '維修',
            applicant: '林Ｏ常',
            project: '陸府觀森 測試',
            status: '派工',
            closeDate: '',
            caseOverdue: '',
            caseOverdueStatus: '',
            milestoneOverdue: '2025-09-15',
            milestoneOverdueStatus: '已逾期',
            quotationCount: 0,
            signatureStatus: '未簽名',
            paymentStatus: '未付款'
        },
        {
            id: 9,
            caseNo: 'GC-20250901-0001',
            caseType: '售後',
            subject: '園藝造景調整',
            unit: 'B2-4',
            type: '維修',
            applicant: '林Ｏ常',
            project: '陸府觀森 測試',
            status: '報價中',
            closeDate: '',
            caseOverdue: '',
            caseOverdueStatus: '',
            milestoneOverdue: '2025-09-10',
            milestoneOverdueStatus: '已逾期',
            quotationCount: 1,
            signatureStatus: '未簽名',
            paymentStatus: '未付款'
        },
        {
            id: 10,
            caseNo: 'GC-20250820-0001',
            caseType: '售後',
            subject: '陽台植栽養護',
            unit: 'B2-3',
            type: '維修',
            applicant: '李Ｏ木',
            project: '陸府觀森 測試',
            status: '結案',
            closeDate: '2025-08-25',
            caseOverdue: '',
            caseOverdueStatus: '',
            milestoneOverdue: '',
            milestoneOverdueStatus: '',
            quotationCount: 1,
            signatureStatus: '已簽名',
            paymentStatus: '已付款',
            invoiceStatus: '已開票'
        }
    ];
    
    // ========================================
    // 載入資料
    // ========================================
    loadCaseData();
    
    /**
     * 載入綠海報修個案單資料
     * @param {Object} filters - 篩選條件
     */
    function loadCaseData(filters = {}) {
        let filteredData = [...mockCaseData];
        
        // 套用篩選條件
        if (filters.project) {
            filteredData = filteredData.filter(item => item.project.includes(filters.project));
        }
        if (filters.unit) {
            filteredData = filteredData.filter(item => item.unit === filters.unit);
        }
        if (filters.caseNo) {
            filteredData = filteredData.filter(item => item.caseNo.includes(filters.caseNo));
        }
        if (filters.caseType) {
            filteredData = filteredData.filter(item => item.caseType === filters.caseType);
        }
        if (filters.status) {
            filteredData = filteredData.filter(item => item.status === filters.status);
        }
        if (filters.priority) {
            filteredData = filteredData.filter(item => item.priority === filters.priority);
        }
        if (filters.milestoneOverdue) {
            if (filters.milestoneOverdue === '是') {
                filteredData = filteredData.filter(item => item.milestoneOverdueStatus === '已逾期');
            } else {
                filteredData = filteredData.filter(item => item.milestoneOverdueStatus !== '已逾期');
            }
        }
        if (filters.overdueStatus) {
            filteredData = filteredData.filter(item => item.caseOverdueStatus === filters.overdueStatus);
        }
        
        // 計算分頁
        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pagedData = filteredData.slice(startIndex, endIndex);
        
        // 渲染表格
        renderTable(pagedData);
        
        // 渲染分頁
        renderPagination(totalItems, totalPages);
    }
    
    /**
     * 渲染表格
     * @param {Array} data - 表格資料
     */
    function renderTable(data) {
        const tbody = document.getElementById('caseTableBody');
        
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" class="text-center" style="padding: 20px;">暫無資料</td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = data.map(item => `
            <tr class="${item.hasUnreadMessage ? 'has-unread-message' : ''}">
                <td class="col-1 ${item.caseOverdueStatus === '已逾期' ? 'red' : ''}">
                    ${item.hasUnreadMessage ? '<span class="unread-badge" title="有未讀訊息"><i class="fa-solid fa-envelope"></i></span>' : ''}
                    ${item.caseNo}
                </td>
                <td class="col-1">${item.caseType}</td>
                <td class="col-1">${item.subject || ''}</td>
                <td class="col-1">${item.unit}</td>
                <td class="col-1">${item.type}</td>
                <td class="col-1">${item.applicant}</td>
                <td class="col-1">${item.project}</td>
                <td class="col-1"><span class="status-badge status-${getStatusClass(item.status)}">${item.status}</span></td>
                <td class="col-1">${item.closeDate || ''}</td>
                <td class="col-1 red">${item.caseOverdue || ''}</td>
                <td class="col-1 ${item.milestoneOverdueStatus === '已逾期' ? 'red' : ''}">${formatMilestoneOverdue(item.milestoneOverdue, item.milestoneOverdueStatus)}</td>
                <td class="col-1">
                    <div class="table-actions">
                        <button class="btn-table-edit" data-id="${item.id}" title="編輯">編輯</button>
                        <button class="btn-table-delete" data-id="${item.id}" title="刪除">刪除</button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // 綁定編輯按鈕事件 - 導向到編輯頁面
        tbody.querySelectorAll('.btn-table-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                window.location.href = `green-case-edit.html?id=${id}`;
            });
        });
        
        // 綁定刪除按鈕事件
        tbody.querySelectorAll('.btn-table-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                openDeleteModal(id);
            });
        });
    }
    
    /**
     * 取得狀態對應的 CSS class
     * @param {string} status - 狀態
     * @returns {string} CSS class 名稱
     */
    function getStatusClass(status) {
        const statusMap = {
            '立案': 'default',
            '派工': 'info',
            '維修評估': 'info',
            '報價中': 'warning',
            '報價確認': 'primary',
            '維修中': 'info',
            '待簽名': 'warning',
            '待付款': 'warning',
            '已付款': 'success',
            '已開票': 'success',
            '結案': 'success'
        };
        return statusMap[status] || 'default';
    }
    
    /**
     * 格式化里程碑逾期顯示
     * @param {string} date - 日期
     * @param {string} status - 逾期狀態
     * @returns {string} HTML 字串
     */
    function formatMilestoneOverdue(date, status) {
        if (!date) return '';
        let html = date;
        if (status === '已逾期') {
            html += '<p class="overdue-label">已逾期</p>';
        }
        return html;
    }
    
    /**
     * 渲染分頁
     * @param {number} totalItems - 總筆數
     * @param {number} totalPages - 總頁數
     */
    function renderPagination(totalItems, totalPages) {
        const wrapper = document.getElementById('paginationWrapper');
        
        if (totalItems === 0) {
            wrapper.innerHTML = '';
            return;
        }
        
        let paginationHTML = `
            <div class="pagination">
                <div class="pagination-buttons">
                    <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="1">
                        ««
                    </button>
                    <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                        «
                    </button>
        `;
        
        // 頁碼按鈕
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // 如果還有更多頁面，顯示省略號
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        if (endPage < totalPages) {
            paginationHTML += `
                <button class="pagination-btn" data-page="${totalPages}">
                    ${totalPages}
                </button>
            `;
        }
        
        paginationHTML += `
                    <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                        »
                    </button>
                    <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${totalPages}">
                        »»
                    </button>
                </div>
            </div>
            <div class="pagination-info-text">TotalRecords：${totalItems}</div>
        `;
        
        wrapper.innerHTML = paginationHTML;
        
        // 綁定分頁事件
        wrapper.querySelectorAll('.pagination-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', function() {
                currentPage = parseInt(this.dataset.page);
                loadCaseData(getSearchFilters());
            });
        });
    }
    
    // ========================================
    // 搜尋功能
    // ========================================
    
    const searchForm = document.getElementById('searchForm');
    
    /**
     * 取得搜尋條件
     * @returns {Object} 篩選條件物件
     */
    function getSearchFilters() {
        return {
            project: document.getElementById('searchProject').value,
            unit: document.getElementById('searchUnit').value,
            caseNo: document.getElementById('searchCaseNo').value,
            caseType: document.getElementById('searchCaseType').value,
            status: document.getElementById('searchStatus').value,
            priority: document.getElementById('searchPriority').value,
            milestoneOverdue: document.getElementById('searchMilestoneOverdue').value,
            overdueStatus: document.getElementById('searchOverdueStatus').value
        };
    }
    
    // 表單送出事件（查詢）
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        currentPage = 1;
        loadCaseData(getSearchFilters());
    });
    
    // 重置按鈕事件
    searchForm.addEventListener('reset', function() {
        setTimeout(() => {
            currentPage = 1;
            loadCaseData();
        }, 0);
    });
    
    // ========================================
    // 新增/編輯個案單
    // ========================================
    
    const btnAdd = document.getElementById('btnAdd');
    const btnSave = document.getElementById('btnSave');
    const btnCancel = document.getElementById('btnCancel');
    const modalClose = document.getElementById('modalClose');
    
    // 新增按鈕事件
    btnAdd.addEventListener('click', function() {
        openAddModal();
    });
    
    // 儲存按鈕事件
    btnSave.addEventListener('click', function() {
        saveCase();
    });
    
    // 取消按鈕事件
    btnCancel.addEventListener('click', function() {
        caseModal.close();
    });
    
    // 關閉按鈕事件
    modalClose.addEventListener('click', function() {
        caseModal.close();
    });
    
    /**
     * 產生綠海報修個案單編號
     * 格式：GC-YYYYMMDD-XXXX
     * @returns {string} 個案單編號
     */
    function generateCaseNo() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        
        // 取得當天最大序號（實際應從後端取得）
        const todayCases = mockCaseData.filter(c => c.caseNo.includes(`GC-${dateStr}`));
        const nextSeq = String(todayCases.length + 1).padStart(4, '0');
        
        return `GC-${dateStr}-${nextSeq}`;
    }
    
    /**
     * 開啟新增彈窗
     */
    function openAddModal() {
        document.getElementById('modalTitle').textContent = '新增綠海報修個案單';
        document.getElementById('caseForm').reset();
        document.getElementById('caseId').value = '';
        caseModal.open();
    }
    
    /**
     * 開啟編輯彈窗
     * @param {number} id - 個案單 ID
     */
    function openEditModal(id) {
        const caseItem = mockCaseData.find(item => item.id === id);
        if (!caseItem) return;
        
        document.getElementById('modalTitle').textContent = '編輯綠海報修個案單';
        document.getElementById('caseId').value = caseItem.id;
        document.getElementById('caseProject').value = caseItem.project;
        document.getElementById('caseUnit').value = caseItem.unit;
        document.getElementById('caseType').value = caseItem.type;
        document.getElementById('caseCaseType').value = caseItem.caseType;
        document.getElementById('caseApplicant').value = caseItem.applicant;
        document.getElementById('caseStatus').value = caseItem.status;
        document.getElementById('caseCloseDate').value = caseItem.closeDate;
        document.getElementById('caseSubject').value = caseItem.subject || '';
        
        caseModal.open();
    }
    
    /**
     * 儲存個案單
     */
    function saveCase() {
        const form = document.getElementById('caseForm');
        
        // 表單驗證
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const id = document.getElementById('caseId').value;
        const caseData = {
            caseNo: id ? null : generateCaseNo(), // 新增時產生編號
            project: document.getElementById('caseProject').value,
            unit: document.getElementById('caseUnit').value,
            type: document.getElementById('caseType').value,
            caseType: document.getElementById('caseCaseType').value,
            applicant: document.getElementById('caseApplicant').value,
            status: document.getElementById('caseStatus').value,
            closeDate: document.getElementById('caseCloseDate').value,
            subject: document.getElementById('caseSubject').value,
            description: document.getElementById('caseDescription').value
        };
        
        if (id) {
            // 編輯模式
            console.log('更新綠海報修個案單:', id, caseData);
            alert('綠海報修個案單更新成功！');
        } else {
            // 新增模式
            console.log('新增綠海報修個案單:', caseData);
            alert(`綠海報修個案單新增成功！\n編號：${caseData.caseNo}`);
        }
        
        caseModal.close();
        loadCaseData(getSearchFilters());
    }
    
    // ========================================
    // 刪除個案單
    // ========================================
    
    const btnDeleteConfirm = document.getElementById('btnDeleteConfirm');
    const btnDeleteCancel = document.getElementById('btnDeleteCancel');
    const deleteModalClose = document.getElementById('deleteModalClose');
    
    // 確認刪除按鈕事件
    btnDeleteConfirm.addEventListener('click', function() {
        if (deleteTargetId) {
            console.log('刪除綠海報修個案單:', deleteTargetId);
            alert('綠海報修個案單已刪除！');
            deleteModal.close();
            deleteTargetId = null;
            loadCaseData(getSearchFilters());
        }
    });
    
    // 取消刪除按鈕事件
    btnDeleteCancel.addEventListener('click', function() {
        deleteModal.close();
        deleteTargetId = null;
    });
    
    // 關閉刪除彈窗按鈕事件
    deleteModalClose.addEventListener('click', function() {
        deleteModal.close();
        deleteTargetId = null;
    });
    
    /**
     * 開啟刪除確認彈窗
     * @param {number} id - 個案單 ID
     */
    function openDeleteModal(id) {
        deleteTargetId = id;
        deleteModal.open();
    }
    
    // ========================================
    // 檔案匯入功能
    // ========================================
    
    const importFileInput = document.getElementById('importFile');
    
    if (importFileInput) {
        importFileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                console.log('匯入檔案:', this.files[0].name);
                alert(`檔案 "${this.files[0].name}" 已選擇，匯入功能開發中...`);
            }
        });
    }
    
    // ========================================
    // 匯出功能
    // ========================================
    
    const btnExport = document.getElementById('btnExport');
    
    btnExport.addEventListener('click', function() {
        alert('匯出功能開發中...');
    });
});
