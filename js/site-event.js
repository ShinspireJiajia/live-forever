/**
 * ============================================
 * 案場活動模組 - JavaScript
 * ============================================
 * 檔案：site-event.js
 * 說明：案場活動管理相關功能（後台手動建立，住戶限定）
 * ============================================
 */

/**
 * 案場活動管理類別
 */
class SiteEventManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 5;
        this.events = [];
        this.deleteEventId = null;
        this.editingEventId = null;
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.loadMockData();
        this.bindEvents();
        this.renderTable();
    }

    /**
     * 載入模擬資料
     */
    loadMockData() {
        this.events = [...SiteEventMockData.events];
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 查詢表單
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
            searchForm.addEventListener('reset', () => {
                setTimeout(() => {
                    this.currentPage = 1;
                    this.renderTable();
                }, 0);
            });
        }

        // 新增活動按鈕 - 跳轉到新增頁面
        const btnAdd = document.getElementById('btnAdd');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                window.location.href = 'site-event-add.html';
            });
        }

        // 表單提交
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEvent();
            });
        }

        // 點擊彈窗外部關閉
        const eventModal = document.getElementById('eventModal');
        if (eventModal) {
            eventModal.addEventListener('click', (e) => {
                if (e.target === eventModal) {
                    this.closeModal();
                }
            });
        }

        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target === deleteModal) {
                    this.closeDeleteModal();
                }
            });
        }
    }

    /**
     * 處理查詢
     */
    handleSearch() {
        this.currentPage = 1;
        this.renderTable();
    }

    /**
     * 取得篩選條件
     */
    getFilters() {
        const filters = {};
        
        const searchSite = document.getElementById('searchSite');
        const searchTitle = document.getElementById('searchTitle');
        const searchCategory = document.getElementById('searchCategory');
        const searchDateFrom = document.getElementById('searchDateFrom');
        const searchDateTo = document.getElementById('searchDateTo');
        
        if (searchSite?.value) filters.site = searchSite.value;
        if (searchTitle?.value) filters.title = searchTitle.value;
        if (searchCategory?.value) filters.category = searchCategory.value;
        if (searchDateFrom?.value) filters.dateFrom = searchDateFrom.value;
        if (searchDateTo?.value) filters.dateTo = searchDateTo.value;
        
        return filters;
    }

    /**
     * 篩選活動
     */
    filterEvents() {
        const filters = this.getFilters();
        let filtered = [...this.events];
        
        // 案場篩選
        if (filters.site) {
            filtered = filtered.filter(e => e.sites.includes(filters.site));
        }
        
        // 活動名稱篩選
        if (filters.title) {
            filtered = filtered.filter(e => 
                e.title.toLowerCase().includes(filters.title.toLowerCase())
            );
        }
        
        // 類別篩選
        if (filters.category) {
            filtered = filtered.filter(e => e.category === filters.category);
        }
        
        // 日期範圍篩選
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            filtered = filtered.filter(e => new Date(e.start_dt) >= fromDate);
        }
        
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59);
            filtered = filtered.filter(e => new Date(e.start_dt) <= toDate);
        }
        
        return filtered;
    }

    /**
     * 取得活動狀態
     */
    getEventStatus(event) {
        const now = new Date();
        const startDate = new Date(event.start_dt);
        const endDate = new Date(event.end_dt);
        
        if (now < startDate) return '即將開始';
        if (now >= startDate && now <= endDate) return '進行中';
        return '已結束';
    }

    /**
     * 取得狀態樣式類別
     */
    getStatusClass(status) {
        switch (status) {
            case '即將開始': return 'upcoming';
            case '進行中': return 'active';
            case '已結束': return 'ended';
            default: return '';
        }
    }

    /**
     * 渲染表格
     */
    renderTable() {
        const tbody = document.getElementById('eventTableBody');
        if (!tbody) return;
        
        const filtered = this.filterEvents();
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = filtered.slice(start, end);
        
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">無符合條件的活動資料</td></tr>';
            this.renderPagination(0);
            return;
        }
        
        tbody.innerHTML = pageData.map((event, index) => {
            const status = this.getEventStatus(event);
            const statusClass = this.getStatusClass(status);

            // 計算已報名人數
            const registeredCount = SiteEventMockData.registrations
                .filter(r => r.event_id === event.event_id && r.payment_status !== '已取消')
                .reduce((sum, r) => sum + 1 + r.companion_count, 0);
            
            // 產生序號
            const startDate = new Date(event.start_dt);
            const yymmdd = startDate.getFullYear().toString().substr(2) + 
                           (startDate.getMonth() + 1).toString().padStart(2, '0') + 
                           startDate.getDate().toString().padStart(2, '0');
            const sequence = event.event_id.slice(-3);
            const serialNo = `SE${yymmdd}${sequence}`;

            // 案場標籤
            const sitesHtml = this.renderSiteTags(event.sites);
            
            return `
                <tr>
                    <td>${serialNo}</td>
                    <td class="site-tags-cell">${sitesHtml}</td>
                    <td>${event.title}</td>
                    <td>${event.category}</td>
                    <td>${this.formatDateTime(event.start_dt)}</td>
                    <td>${this.formatDateTime(event.end_dt)}</td>
                    <td>${event.max_slots} 人</td>
                    <td>${registeredCount} 人</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-success" onclick="siteEventManager.editEvent('${event.event_id}')">
                                <i class="fa-solid fa-pen-to-square"></i> 編輯
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="siteEventManager.viewRegistrations('${event.event_id}')">
                                <i class="fa-solid fa-users"></i> 報名
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="siteEventManager.deleteEvent('${event.event_id}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // 渲染分頁
        this.renderPagination(filtered.length);
    }

    /**
     * 渲染案場標籤
     */
    renderSiteTags(sites) {
        if (sites.length <= 2) {
            return sites.map(s => `<span class="site-tag">${s}</span>`).join('');
        } else {
            const first = sites.slice(0, 1).map(s => `<span class="site-tag">${s}</span>`).join('');
            return `<div class="site-tags-wrapper">${first}<span class="site-tags-more" title="${sites.join(', ')}">+${sites.length - 1}</span></div>`;
        }
    }

    /**
     * 格式化日期時間
     */
    formatDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    /**
     * 渲染分頁
     */
    renderPagination(totalItems) {
        const wrapper = document.getElementById('paginationWrapper');
        if (!wrapper) return;
        
        const totalPages = Math.ceil(totalItems / this.pageSize);
        
        if (totalPages <= 1) {
            wrapper.innerHTML = '';
            return;
        }
        
        let html = '<ul class="pagination">';
        
        // 上一頁
        const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
        html += `
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="javascript:void(0)" onclick="siteEventManager.goToPage(${this.currentPage - 1})">
                    <i class="fa-solid fa-chevron-left"></i>
                </a>
            </li>`;
        
        // 頁碼
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const active = i === this.currentPage ? 'active' : '';
                html += `
                    <li class="page-item ${active}">
                        <a class="page-link" href="javascript:void(0)" onclick="siteEventManager.goToPage(${i})">${i}</a>
                    </li>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        // 下一頁
        const nextDisabled = this.currentPage === totalPages ? 'disabled' : '';
        html += `
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="javascript:void(0)" onclick="siteEventManager.goToPage(${this.currentPage + 1})">
                    <i class="fa-solid fa-chevron-right"></i>
                </a>
            </li>`;
        
        html += '</ul>';
        wrapper.innerHTML = html;
    }

    /**
     * 跳轉頁面
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filterEvents().length / this.pageSize);
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.renderTable();
    }

    /**
     * 開啟彈窗 (新增)
     */
    openModal() {
        this.editingEventId = null;
        document.getElementById('modalTitle').textContent = '新增案場活動';
        document.getElementById('eventForm').reset();
        document.getElementById('eventId').value = '';
        
        // 清除所有勾選
        document.querySelectorAll('#siteCheckboxGroup input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        document.getElementById('eventModal').classList.add('active');
    }

    /**
     * 關閉彈窗
     */
    closeModal() {
        document.getElementById('eventModal').classList.remove('active');
        this.editingEventId = null;
    }

    /**
     * 編輯活動 - 跳轉到編輯頁面
     */
    editEvent(eventId) {
        window.location.href = `site-event-add.html?eventId=${eventId}`;
    }

    /**
     * 編輯活動 (彈窗模式 - 保留備用)
     */
    editEventModal(eventId) {
        const event = this.events.find(e => e.event_id === eventId);
        if (!event) return;
        
        this.editingEventId = eventId;
        document.getElementById('modalTitle').textContent = '編輯案場活動';
        document.getElementById('eventId').value = eventId;
        
        // 填入表單資料
        document.getElementById('formTitle').value = event.title;
        document.getElementById('formCategory').value = event.category;
        document.getElementById('formStartDt').value = event.start_dt.slice(0, 16);
        document.getElementById('formEndDt').value = event.end_dt.slice(0, 16);
        document.getElementById('formDescription').value = event.description || '';
        document.getElementById('formLocation').value = event.location || '';
        document.getElementById('formMaxSlots').value = event.max_slots;
        document.getElementById('formPrice').value = event.price;
        document.getElementById('formDeadline').value = event.registration_deadline || '';
        document.getElementById('formMaxCompanion').value = event.max_companion;
        document.getElementById('formRemindDays').value = event.remind_days_before;
        document.getElementById('formNeedReceipt').checked = event.need_receipt;
        
        // 勾選案場
        document.querySelectorAll('#siteCheckboxGroup input[type="checkbox"]').forEach(cb => {
            cb.checked = event.sites.includes(cb.value);
        });
        
        document.getElementById('eventModal').classList.add('active');
    }

    /**
     * 儲存活動
     */
    saveEvent() {
        // 驗證表單
        const form = document.getElementById('eventForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // 取得勾選的案場
        const selectedSites = [];
        document.querySelectorAll('#siteCheckboxGroup input[type="checkbox"]:checked').forEach(cb => {
            selectedSites.push(cb.value);
        });
        
        if (selectedSites.length === 0) {
            this.showToast('error', '錯誤', '請至少選擇一個適用案場');
            return;
        }
        
        // 組合資料
        const eventData = {
            title: document.getElementById('formTitle').value,
            category: document.getElementById('formCategory').value,
            start_dt: document.getElementById('formStartDt').value + ':00',
            end_dt: document.getElementById('formEndDt').value + ':00',
            description: document.getElementById('formDescription').value,
            location: document.getElementById('formLocation').value,
            sites: selectedSites,
            max_slots: parseInt(document.getElementById('formMaxSlots').value),
            price: parseInt(document.getElementById('formPrice').value) || 0,
            registration_deadline: document.getElementById('formDeadline').value,
            max_companion: parseInt(document.getElementById('formMaxCompanion').value) || 0,
            allow_companion: parseInt(document.getElementById('formMaxCompanion').value) > 0,
            remind_days_before: parseInt(document.getElementById('formRemindDays').value) || 0,
            need_receipt: document.getElementById('formNeedReceipt').checked,
            updated_at: new Date().toISOString()
        };
        
        if (this.editingEventId) {
            // 更新現有活動
            const index = this.events.findIndex(e => e.event_id === this.editingEventId);
            if (index !== -1) {
                this.events[index] = { ...this.events[index], ...eventData };
            }
            this.showToast('success', '更新成功', '活動資料已更新');
        } else {
            // 新增活動
            const newId = 'SE' + new Date().getFullYear() + String(this.events.length + 1).padStart(3, '0');
            eventData.event_id = newId;
            eventData.created_by = 'admin';
            eventData.created_at = new Date().toISOString();
            this.events.unshift(eventData);
            this.showToast('success', '新增成功', '已建立新案場活動');
        }
        
        this.closeModal();
        this.renderTable();
    }

    /**
     * 刪除活動 (開啟確認彈窗)
     */
    deleteEvent(eventId) {
        this.deleteEventId = eventId;
        document.getElementById('deleteModal').classList.add('active');
    }

    /**
     * 關閉刪除確認彈窗
     */
    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('active');
        this.deleteEventId = null;
    }

    /**
     * 確認刪除
     */
    confirmDelete() {
        if (!this.deleteEventId) return;
        
        const index = this.events.findIndex(e => e.event_id === this.deleteEventId);
        if (index !== -1) {
            this.events.splice(index, 1);
            this.showToast('success', '刪除成功', '活動已刪除');
            this.renderTable();
        }
        
        this.closeDeleteModal();
    }

    /**
     * 查看報名紀錄
     */
    viewRegistrations(eventId) {
        window.location.href = `site-event-registration.html?eventId=${eventId}`;
    }

    /**
     * 顯示提示訊息
     */
    showToast(type, title, message) {
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fa-solid ${iconMap[type] || 'fa-info-circle'}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        container.appendChild(toast);
        
        setTimeout(() => toast.remove(), 5000);
    }
}

// 全域變數
window.siteEventManager = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('eventTableBody')) {
        window.siteEventManager = new SiteEventManager();
    }
});
