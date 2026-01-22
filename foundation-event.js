/**
 * ============================================
 * 基金會活動模組 - JavaScript
 * ============================================
 * 檔案：foundation-event.js
 * 說明：基金會活動管理相關功能
 * ============================================
 */

/**
 * 基金會活動管理類別
 */
class FoundationEventManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 5;
        this.events = [];
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.loadMockData();
        this.bindEvents();
        this.renderTable();
        this.updateStats();
    }

    /**
     * 載入模擬資料
     */
    loadMockData() {
        this.events = FoundationMockData.events;
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

        // 同步按鈕
        const btnSync = document.getElementById('btnSync');
        if (btnSync) {
            btnSync.addEventListener('click', () => this.handleSync());
        }

        // 新增活動
        const btnAdd = document.getElementById('btnAdd');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openEventModal());
        }
    }

    /**
     * 處理同步
     */
    async handleSync() {
        const btnSync = document.getElementById('btnSync');
        const icon = btnSync.querySelector('i');
        
        // 顯示同步中狀態
        icon.classList.add('spinning');
        btnSync.disabled = true;
        btnSync.innerHTML = '<i class="fa-solid fa-sync spinning"></i> 同步中...';
        
        // 模擬 API 同步
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 更新最後同步時間
        const syncTime = new Date().toLocaleString('zh-TW');
        const lastSyncEl = document.getElementById('lastSyncTime');
        if (lastSyncEl) {
            lastSyncEl.textContent = syncTime;
        }
        
        // 恢復按鈕狀態
        btnSync.disabled = false;
        btnSync.innerHTML = '<i class="fa-solid fa-sync"></i> 手動同步';
        
        // 顯示成功訊息
        this.showToast('success', '同步成功', '已從外部 API 同步最新活動資料');
        
        // 重新載入資料
        this.renderTable();
        this.updateStats();
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
        
        const searchTitle = document.getElementById('searchTitle');
        const searchCategory = document.getElementById('searchCategory');
        const searchDateFrom = document.getElementById('searchDateFrom');
        const searchDateTo = document.getElementById('searchDateTo');
        
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
        
        if (filters.title) {
            filtered = filtered.filter(e => 
                e.title.toLowerCase().includes(filters.title.toLowerCase())
            );
        }
        
        if (filters.category) {
            filtered = filtered.filter(e => e.category === filters.category);
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
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">無符合條件的活動資料</td></tr>';
            return;
        }
        
        tbody.innerHTML = pageData.map((event, index) => {
            const status = this.getEventStatus(event);

            // 計算已報名人數 (排除已取消)
            const registeredCount = FoundationMockData.registrations
                .filter(r => r.event_id === event.event_id && r.payment_status !== '已取消')
                .reduce((sum, r) => sum + 1 + r.companion_count, 0);
            
            // 產生序號: EV + YYMMDD + 流水號(2碼)
            const startDate = new Date(event.start_dt);
            const yymmdd = startDate.getFullYear().toString().substr(2) + 
                           (startDate.getMonth() + 1).toString().padStart(2, '0') + 
                           startDate.getDate().toString().padStart(2, '0');
            
            let sequence = '01';
            // 嘗試從 event_id 取得最後兩碼
            const idMatch = event.event_id.match(/\d{2}$/);
            if (idMatch) {
                sequence = idMatch[0];
            }

            const serialNo = `EV${yymmdd}${sequence}`;
            
            return `
                <tr>
                    <td>${serialNo}</td>
                    <td>
                        ${event.title}
                        ${event.is_resident_only ? '(住戶限定)' : ''}
                    </td>
                    <td>${event.category}</td>
                    <td>${this.formatDateTime(event.start_dt)}</td>
                    <td>${this.formatDateTime(event.end_dt)}</td>
                    <td>${event.max_slots} 人</td>
                    <td>${registeredCount} 人</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-success" onclick="eventManager.editEvent('${event.event_id}')">編輯規則</button>
                            <button class="btn btn-sm btn-outline-success" onclick="eventManager.viewRegistrations('${event.event_id}')">報名管理</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // 渲染分頁
        this.renderPagination(filtered.length);
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
                <a class="page-link" href="javascript:void(0)" onclick="eventManager.goToPage(${this.currentPage - 1})">
                    <i class="fa-solid fa-chevron-left"></i>
                </a>
            </li>`;
        
        // 頁碼
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const active = i === this.currentPage ? 'active' : '';
                html += `
                    <li class="page-item ${active}">
                        <a class="page-link" href="javascript:void(0)" onclick="eventManager.goToPage(${i})">${i}</a>
                    </li>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        // 下一頁
        const nextDisabled = this.currentPage === totalPages ? 'disabled' : '';
        html += `
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="javascript:void(0)" onclick="eventManager.goToPage(${this.currentPage + 1})">
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
        this.currentPage = page;
        this.renderTable();
    }

    /**
     * 更新統計
     */
    updateStats() {
        const events = this.events;
        
        const totalEl = document.getElementById('statTotal');
        const activeEl = document.getElementById('statActive');
        const upcomingEl = document.getElementById('statUpcoming');
        const endedEl = document.getElementById('statEnded');
        
        if (totalEl) totalEl.textContent = events.length;
        if (activeEl) activeEl.textContent = events.filter(e => this.getEventStatus(e) === '進行中').length;
        if (upcomingEl) upcomingEl.textContent = events.filter(e => this.getEventStatus(e) === '即將開始').length;
        if (endedEl) endedEl.textContent = events.filter(e => this.getEventStatus(e) === '已結束').length;
    }

    /**
     * 編輯活動規則
     */
    editEvent(eventId) {
        window.location.href = `foundation-event-edit.html?id=${eventId}`;
    }

    /**
     * 查看報名紀錄
     */
    viewRegistrations(eventId) {
        window.location.href = `foundation-registration.html?eventId=${eventId}`;
    }

    /**
     * 開啟活動設定彈窗
     */
    openEventModal(event = null) {
        // 這裡可以實作彈窗邏輯
        console.log('Open event modal', event);
    }

    /**
     * 顯示提示訊息
     */
    showToast(type, title, message) {
        // 建立 toast 元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        
        // 加入頁面
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        container.appendChild(toast);
        
        // 自動移除
        setTimeout(() => toast.remove(), 5000);
    }
}

// 全域變數
window.eventManager = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('eventTableBody')) {
        window.eventManager = new FoundationEventManager();
    }
});
