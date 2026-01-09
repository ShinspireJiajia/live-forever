/**
 * ============================================
 * 基金會活動報名管理 - JavaScript
 * ============================================
 * 檔案：foundation-registration.js
 * 說明：基金會活動報名紀錄管理功能
 * ============================================
 */

/**
 * 基金會報名管理類別
 */
class FoundationRegistrationManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.currentEventId = null;
        this.currentEvent = null;
        this.registrations = [];
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 從 URL 取得活動 ID
        const urlParams = new URLSearchParams(window.location.search);
        this.currentEventId = urlParams.get('eventId');
        
        this.loadEventInfo();
        this.loadRegistrations();
        this.bindEvents();
        this.renderTable();
        this.updateStats();
    }

    /**
     * 載入活動資訊
     */
    loadEventInfo() {
        if (this.currentEventId) {
            this.currentEvent = FoundationMockData.getEventById(this.currentEventId);
            this.renderEventInfo();
        }
    }

    /**
     * 渲染活動資訊
     */
    renderEventInfo() {
        const event = this.currentEvent;
        if (!event) return;

        const infoEl = document.getElementById('eventInfoCard');
        if (!infoEl) return;

        const status = this.getEventStatus(event);
        const statusClass = this.getStatusClass(status);

        infoEl.innerHTML = `
            <div class="event-info-header">
                <div>
                    <h2 class="event-info-title">${event.title}</h2>
                    <span class="category-tag">${event.category}</span>
                    ${event.is_resident_only ? '<span class="identity-badge resident" style="margin-left:8px;">住戶限定</span>' : ''}
                </div>
                <span class="event-status ${statusClass}">${status}</span>
            </div>
            <div class="event-info-grid">
                <div class="event-info-item">
                    <span class="event-info-label">活動時間</span>
                    <span class="event-info-value">${this.formatDateTime(event.start_dt)} ~ ${this.formatDateTime(event.end_dt)}</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">報名費用</span>
                    <span class="event-info-value">${event.price > 0 ? '$' + event.price.toLocaleString() : '免費'}</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">報名上限</span>
                    <span class="event-info-value">${event.max_slots} 人</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">攜伴上限</span>
                    <span class="event-info-value">${event.allow_companion ? event.max_companion + ' 人' : '不開放攜伴'}</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">通行碼</span>
                    <span class="event-info-value">${event.access_code || '無'}</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">最後同步時間</span>
                    <span class="event-info-value">${this.formatDateTime(event.last_sync_at)}</span>
                </div>
            </div>
        `;
    }

    /**
     * 載入報名紀錄
     */
    loadRegistrations() {
        if (this.currentEventId) {
            this.registrations = FoundationMockData.getRegistrationsByEventId(this.currentEventId);
        } else {
            this.registrations = FoundationMockData.registrations;
        }
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

        // 新增報名
        const btnAdd = document.getElementById('btnAdd');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openAddModal());
        }

        // 匯出
        const btnExport = document.getElementById('btnExport');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportData());
        }

        // 發送通知
        const btnNotify = document.getElementById('btnNotify');
        if (btnNotify) {
            btnNotify.addEventListener('click', () => this.sendNotification());
        }
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
        
        const searchName = document.getElementById('searchName');
        const searchPhone = document.getElementById('searchPhone');
        const searchIdentity = document.getElementById('searchIdentity');
        const searchPaymentStatus = document.getElementById('searchPaymentStatus');
        
        if (searchName?.value) filters.name = searchName.value;
        if (searchPhone?.value) filters.phone = searchPhone.value;
        if (searchIdentity?.value) filters.identity = searchIdentity.value;
        if (searchPaymentStatus?.value) filters.paymentStatus = searchPaymentStatus.value;
        
        return filters;
    }

    /**
     * 篩選報名紀錄
     */
    filterRegistrations() {
        const filters = this.getFilters();
        let filtered = [...this.registrations];
        
        if (filters.name) {
            filtered = filtered.filter(r => 
                r.applicant_name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }
        
        if (filters.phone) {
            filtered = filtered.filter(r => 
                r.phone.includes(filters.phone)
            );
        }
        
        if (filters.identity) {
            filtered = filtered.filter(r => r.user_identity === filters.identity);
        }
        
        if (filters.paymentStatus) {
            filtered = filtered.filter(r => r.payment_status === filters.paymentStatus);
        }
        
        return filtered;
    }

    /**
     * 渲染表格
     */
    renderTable() {
        const tbody = document.getElementById('registrationTableBody');
        if (!tbody) return;
        
        const filtered = this.filterRegistrations();
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = filtered.slice(start, end);
        
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" class="text-center">無符合條件的報名資料</td></tr>';
            return;
        }
        
        tbody.innerHTML = pageData.map((reg, index) => {
            const daysSince = FoundationMockData.getDaysSinceRegistration(reg.created_at);
            const canRefund = FoundationMockData.canRefund(reg.created_at);
            const paymentStatusClass = this.getPaymentStatusClass(reg.payment_status);
            const paymentMethodIcon = this.getPaymentMethodIcon(reg.payment_method);
            
            return `
                <tr>
                    <td>${start + index + 1}</td>
                    <td>${reg.reg_id}</td>
                    <td>
                        ${reg.user_identity}
                        ${reg.is_manual_audit ? '(已稽核)' : ''}
                    </td>
                    <td>
                        ${reg.applicant_name}
                        ${reg.crm_member_id ? '<br><small class="text-muted">CRM: ' + reg.crm_member_id + '</small>' : ''}
                    </td>
                    <td>${reg.phone}</td>
                    <td>${reg.companion_count} 人</td>
                    <td>
                        $${reg.final_amount.toLocaleString()}
                        ${reg.original_amount !== reg.final_amount ? 
                            `<br><small class="text-muted">(原$${reg.original_amount.toLocaleString()})</small>` : ''}
                    </td>
                    <td>${reg.payment_method || '-'}</td>
                    <td>${reg.payment_status}</td>
                    <td>${this.formatDate(reg.created_at)}</td>
                    <td>${reg.has_receipt ? '是' : '否'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-success" onclick="registrationManager.viewDetail('${reg.reg_id}')">查看</button>
                            <button class="btn btn-sm btn-outline-success" onclick="registrationManager.editRegistration('${reg.reg_id}')">編輯</button>
                            ${reg.payment_status === '待繳費' ? `
                                <button class="btn btn-sm btn-outline-success" onclick="registrationManager.confirmPayment('${reg.reg_id}')">確認繳費</button>
                            ` : ''}
                            ${reg.payment_status === '已入帳' && canRefund ? `
                                <button class="btn btn-sm btn-outline-danger" onclick="registrationManager.markRefund('${reg.reg_id}')">標記退費</button>
                            ` : ''}
                            ${reg.payment_status === '已入帳' && !canRefund ? `
                                <button class="btn btn-sm btn-disabled" title="超過180天不可退費" disabled>不可退費</button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // 渲染分頁
        this.renderPagination(filtered.length);
    }

    /**
     * 取得繳費狀態樣式
     */
    getPaymentStatusClass(status) {
        switch (status) {
            case '待繳費': return 'pending';
            case '已入帳': return 'paid';
            case '已取消': return 'cancelled';
            case '退費中': return 'refunding';
            default: return '';
        }
    }

    /**
     * 取得繳費方式圖示
     */
    getPaymentMethodIcon(method) {
        switch (method) {
            case '信用卡': return '<i class="fa-solid fa-credit-card"></i>';
            case '轉帳': return '<i class="fa-solid fa-building-columns"></i>';
            case '現金': return '<i class="fa-solid fa-money-bill-wave"></i>';
            default: return '';
        }
    }

    /**
     * 取得繳費方式樣式
     */
    getPaymentMethodClass(method) {
        switch (method) {
            case '信用卡': return 'credit-card';
            case '轉帳': return 'transfer';
            case '現金': return 'cash';
            default: return '';
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
            minute: '2-digit'
        });
    }

    /**
     * 格式化日期
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
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
        
        let html = '<div class="pagination">';
        
        // 上一頁
        html += `<button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="registrationManager.goToPage(${this.currentPage - 1})">
            <i class="fa-solid fa-chevron-left"></i>
        </button>`;
        
        // 頁碼
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="registrationManager.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<span class="page-ellipsis">...</span>';
            }
        }
        
        // 下一頁
        html += `<button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="registrationManager.goToPage(${this.currentPage + 1})">
            <i class="fa-solid fa-chevron-right"></i>
        </button>`;
        
        html += '</div>';
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
        const stats = this.currentEventId ? 
            FoundationMockData.getRegistrationStats(this.currentEventId) :
            this.calculateAllStats();
        
        const totalEl = document.getElementById('statTotal');
        const pendingEl = document.getElementById('statPending');
        const paidEl = document.getElementById('statPaid');
        const cancelledEl = document.getElementById('statCancelled');
        const refundingEl = document.getElementById('statRefunding');
        const residentEl = document.getElementById('statResident');
        
        if (totalEl) totalEl.textContent = stats.total;
        if (pendingEl) pendingEl.textContent = stats.pending;
        if (paidEl) paidEl.textContent = stats.paid;
        if (cancelledEl) cancelledEl.textContent = stats.cancelled;
        if (refundingEl) refundingEl.textContent = stats.refunding;
        if (residentEl) residentEl.textContent = stats.resident;
    }

    /**
     * 計算所有統計
     */
    calculateAllStats() {
        const registrations = this.registrations;
        return {
            total: registrations.length,
            pending: registrations.filter(r => r.payment_status === '待繳費').length,
            paid: registrations.filter(r => r.payment_status === '已入帳').length,
            cancelled: registrations.filter(r => r.payment_status === '已取消').length,
            refunding: registrations.filter(r => r.payment_status === '退費中').length,
            resident: registrations.filter(r => r.user_identity === '住戶').length
        };
    }

    /**
     * 查看報名詳情
     */
    viewDetail(regId) {
        window.location.href = `foundation-registration-edit.html?id=${regId}&readonly=true`;
    }

    /**
     * 編輯/稽核報名
     */
    editRegistration(regId) {
        window.location.href = `foundation-registration-edit.html?id=${regId}`;
    }

    /**
     * 確認繳費
     */
    confirmPayment(regId) {
        if (confirm('確定要將此報名標記為「已入帳」嗎？')) {
            this.showToast('success', '繳費確認', '已將報名狀態更新為已入帳');
            this.renderTable();
            this.updateStats();
        }
    }

    /**
     * 標記退費
     */
    markRefund(regId) {
        const reg = this.registrations.find(r => r.reg_id === regId);
        if (!reg) return;
        
        if (!FoundationMockData.canRefund(reg.created_at)) {
            this.showToast('error', '無法退費', '此報名已超過 180 天，依規定不可退費');
            return;
        }
        
        if (confirm('確定要將此報名標記為「退費中」嗎？\n\n注意：實際退款需線下人工執行，系統僅作狀態標記。')) {
            this.showToast('success', '退費標記', '已將報名狀態更新為退費中，請進行線下退款處理');
            this.renderTable();
            this.updateStats();
        }
    }

    /**
     * 開啟新增報名彈窗
     */
    openAddModal() {
        const modal = document.getElementById('addModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * 匯出資料
     */
    exportData() {
        this.showToast('info', '匯出中', '正在產生報名名單 Excel 檔案...');
        // 實際專案中這裡會實作匯出邏輯
    }

    /**
     * 發送通知
     */
    sendNotification() {
        const modal = document.getElementById('notifyModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * 顯示提示訊息
     */
    showToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
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
let registrationManager;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('registrationTableBody')) {
        registrationManager = new FoundationRegistrationManager();
    }
});
