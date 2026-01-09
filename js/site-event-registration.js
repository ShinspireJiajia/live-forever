/**
 * ============================================
 * 案場活動報名紀錄 - JavaScript
 * ============================================
 * 檔案：site-event-registration.js
 * 說明：案場活動報名紀錄管理功能
 * ============================================
 */

/**
 * 案場活動報名管理類別
 */
class SiteEventRegistrationManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.registrations = [];
        this.events = [];
        this.cancelRegId = null;
        this.eventIdFilter = null;
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.loadMockData();
        this.parseUrlParams();
        this.bindEvents();
        this.populateEventDropdown();
        this.renderTable();
        this.updateStats();
        this.renderEventInfo();
    }

    /**
     * 載入模擬資料
     */
    loadMockData() {
        this.registrations = [...SiteEventMockData.registrations];
        this.events = [...SiteEventMockData.events];
    }

    /**
     * 解析 URL 參數
     */
    parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const eventId = params.get('eventId');
        if (eventId) {
            this.eventIdFilter = eventId;
            const eventSelect = document.getElementById('searchEvent');
            if (eventSelect) {
                eventSelect.value = eventId;
            }
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
                this.eventIdFilter = null;
                setTimeout(() => {
                    this.currentPage = 1;
                    this.renderTable();
                    this.updateStats();
                    this.renderEventInfo();
                }, 0);
            });
        }

        // 新增報名按鈕
        const btnAdd = document.getElementById('btnAdd');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openAddModal());
        }

        // 發送通知按鈕
        const btnNotify = document.getElementById('btnNotify');
        if (btnNotify) {
            btnNotify.addEventListener('click', () => this.openNotifyModal());
        }

        // 匯出按鈕
        const btnExport = document.getElementById('btnExport');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.handleExport());
        }

        // 點擊彈窗外部關閉
        ['addModal', 'cancelModal', 'notifyModal'].forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('active');
                    }
                });
            }
        });
    }

    /**
     * 填充活動下拉選單
     */
    populateEventDropdown() {
        const searchEvent = document.getElementById('searchEvent');
        const formEvent = document.getElementById('formEvent');
        
        const options = this.events.map(e => 
            `<option value="${e.event_id}">${e.title}</option>`
        ).join('');
        
        if (searchEvent) {
            searchEvent.innerHTML = '<option value="">全部活動</option>' + options;
            if (this.eventIdFilter) {
                searchEvent.value = this.eventIdFilter;
            }
        }
        if (formEvent) {
            formEvent.innerHTML = '<option value="">請選擇活動</option>' + options;
        }
    }

    /**
     * 處理查詢
     */
    handleSearch() {
        this.currentPage = 1;
        const eventId = document.getElementById('searchEvent')?.value;
        this.eventIdFilter = eventId || null;
        this.renderTable();
        this.updateStats();
        this.renderEventInfo();
    }

    /**
     * 取得篩選條件
     */
    getFilters() {
        const filters = {};
        
        const searchSite = document.getElementById('searchSite');
        const searchEvent = document.getElementById('searchEvent');
        const searchName = document.getElementById('searchName');
        const searchUnit = document.getElementById('searchUnit');
        const searchStatus = document.getElementById('searchStatus');
        
        if (searchSite?.value) filters.site = searchSite.value;
        if (searchEvent?.value) filters.eventId = searchEvent.value;
        if (searchName?.value) filters.name = searchName.value;
        if (searchUnit?.value) filters.unit = searchUnit.value;
        if (searchStatus?.value) filters.status = searchStatus.value;
        
        // URL 參數優先
        if (this.eventIdFilter && !filters.eventId) {
            filters.eventId = this.eventIdFilter;
        }
        
        return filters;
    }

    /**
     * 篩選報名紀錄
     */
    filterRegistrations() {
        const filters = this.getFilters();
        let filtered = [...this.registrations];
        
        // 案場篩選
        if (filters.site) {
            filtered = filtered.filter(r => r.site_name === filters.site);
        }
        
        // 活動篩選
        if (filters.eventId) {
            filtered = filtered.filter(r => r.event_id === filters.eventId);
        }
        
        // 姓名篩選
        if (filters.name) {
            filtered = filtered.filter(r => 
                r.applicant_name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }
        
        // 戶別篩選
        if (filters.unit) {
            filtered = filtered.filter(r => 
                r.unit_no.toLowerCase().includes(filters.unit.toLowerCase())
            );
        }
        
        // 狀態篩選
        if (filters.status) {
            filtered = filtered.filter(r => r.payment_status === filters.status);
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
            this.renderPagination(0);
            return;
        }
        
        tbody.innerHTML = pageData.map((reg, index) => {
            const event = this.events.find(e => e.event_id === reg.event_id);
            const eventTitle = event ? event.title : '(未知活動)';
            const statusClass = this.getStatusClass(reg.payment_status);
            
            return `
                <tr>
                    <td>${start + index + 1}</td>
                    <td>${reg.reg_id}</td>
                    <td>${reg.site_name}</td>
                    <td>${eventTitle}</td>
                    <td>${reg.unit_no}</td>
                    <td>${reg.applicant_name}</td>
                    <td>${reg.phone}</td>
                    <td>${reg.companion_count} 人</td>
                    <td>NT$ ${reg.amount.toLocaleString()}</td>
                    <td><span class="reg-status ${statusClass}">${reg.payment_status}</span></td>
                    <td>${this.formatDate(reg.created_at)}</td>
                    <td>
                        <div class="action-buttons">
                            ${reg.payment_status !== '已取消' ? `
                                <button class="btn btn-sm btn-outline-danger" onclick="siteRegManager.cancelRegistration('${reg.reg_id}')">
                                    <i class="fa-solid fa-ban"></i> 取消
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.renderPagination(filtered.length);
    }

    /**
     * 取得狀態樣式類別
     */
    getStatusClass(status) {
        switch (status) {
            case '已報名': return 'registered';
            case '待繳費': return 'pending';
            case '已取消': return 'cancelled';
            default: return '';
        }
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
        
        let html = '<ul class="pagination">';
        
        const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
        html += `
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="javascript:void(0)" onclick="siteRegManager.goToPage(${this.currentPage - 1})">
                    <i class="fa-solid fa-chevron-left"></i>
                </a>
            </li>`;
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const active = i === this.currentPage ? 'active' : '';
                html += `
                    <li class="page-item ${active}">
                        <a class="page-link" href="javascript:void(0)" onclick="siteRegManager.goToPage(${i})">${i}</a>
                    </li>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        const nextDisabled = this.currentPage === totalPages ? 'disabled' : '';
        html += `
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="javascript:void(0)" onclick="siteRegManager.goToPage(${this.currentPage + 1})">
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
        const totalPages = Math.ceil(this.filterRegistrations().length / this.pageSize);
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.renderTable();
    }

    /**
     * 更新統計
     */
    updateStats() {
        const filtered = this.filterRegistrations();
        
        const statTotal = document.getElementById('statTotal');
        const statPending = document.getElementById('statPending');
        const statPaid = document.getElementById('statPaid');
        const statCancelled = document.getElementById('statCancelled');
        
        if (statTotal) statTotal.textContent = filtered.length;
        if (statPending) statPending.textContent = filtered.filter(r => r.payment_status === '待繳費').length;
        if (statPaid) statPaid.textContent = filtered.filter(r => r.payment_status === '已報名').length;
        if (statCancelled) statCancelled.textContent = filtered.filter(r => r.payment_status === '已取消').length;
    }

    /**
     * 渲染活動資訊卡片
     */
    renderEventInfo() {
        const card = document.getElementById('eventInfoCard');
        if (!card) return;
        
        const filters = this.getFilters();
        if (!filters.eventId) {
            card.style.display = 'none';
            return;
        }
        
        const event = this.events.find(e => e.event_id === filters.eventId);
        if (!event) {
            card.style.display = 'none';
            return;
        }
        
        const registeredCount = this.registrations
            .filter(r => r.event_id === event.event_id && r.payment_status !== '已取消')
            .reduce((sum, r) => sum + 1 + r.companion_count, 0);
        
        card.style.display = 'block';
        card.innerHTML = `
            <div class="event-info-header">
                <h3 class="event-info-title">${event.title}</h3>
                <a href="site-event-list.html" class="btn btn-sm btn-secondary">
                    <i class="fa-solid fa-arrow-left"></i> 返回活動列表
                </a>
            </div>
            <div class="event-info-grid">
                <div class="event-info-item">
                    <span class="event-info-label">適用案場</span>
                    <span class="event-info-value">${event.sites.join(', ')}</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">活動時間</span>
                    <span class="event-info-value">${this.formatDateTime(event.start_dt)} ~ ${this.formatDateTime(event.end_dt)}</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">報名人數</span>
                    <span class="event-info-value">${registeredCount} / ${event.max_slots} 人</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">活動費用</span>
                    <span class="event-info-value">${event.price > 0 ? 'NT$ ' + event.price.toLocaleString() : '免費'}</span>
                </div>
            </div>
        `;
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
     * 開啟新增報名彈窗
     */
    openAddModal() {
        document.getElementById('addForm').reset();
        
        // 填充活動選單
        const formEvent = document.getElementById('formEvent');
        if (formEvent) {
            formEvent.innerHTML = '<option value="">請選擇活動</option>' + 
                this.events.map(e => `<option value="${e.event_id}">${e.title}</option>`).join('');
        }
        
        // 監聽活動選擇以更新案場選單
        formEvent?.addEventListener('change', () => this.updateFormSites());
        
        document.getElementById('addModal').classList.add('active');
    }

    /**
     * 更新表單案場選單
     */
    updateFormSites() {
        const eventId = document.getElementById('formEvent')?.value;
        const formSite = document.getElementById('formSite');
        if (!formSite) return;
        
        if (!eventId) {
            formSite.innerHTML = '<option value="">請先選擇活動</option>';
            return;
        }
        
        const event = this.events.find(e => e.event_id === eventId);
        if (!event) return;
        
        formSite.innerHTML = '<option value="">請選擇案場</option>' + 
            event.sites.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    /**
     * 關閉新增報名彈窗
     */
    closeAddModal() {
        document.getElementById('addModal').classList.remove('active');
    }

    /**
     * 儲存報名
     */
    saveRegistration() {
        const form = document.getElementById('addForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const eventId = document.getElementById('formEvent').value;
        const site = document.getElementById('formSite').value;
        const unit = document.getElementById('formUnit').value;
        const name = document.getElementById('formName').value;
        const phone = document.getElementById('formPhone').value;
        const companion = parseInt(document.getElementById('formCompanion').value) || 0;
        
        const event = this.events.find(e => e.event_id === eventId);
        
        // 建立新報名紀錄
        const newReg = {
            reg_id: 'SR' + new Date().getFullYear() + String(this.registrations.length + 1).padStart(6, '0'),
            event_id: eventId,
            site_name: site,
            unit_no: unit,
            member_id: '',
            applicant_name: name,
            phone: phone,
            companion_count: companion,
            payment_status: event && event.price > 0 ? '待繳費' : '已報名',
            payment_method: '',
            amount: event ? event.price * (1 + companion) : 0,
            has_receipt: event ? event.need_receipt : false,
            created_at: new Date().toISOString()
        };
        
        this.registrations.unshift(newReg);
        
        this.closeAddModal();
        this.renderTable();
        this.updateStats();
        this.showToast('success', '報名成功', '已新增報名紀錄');
    }

    /**
     * 取消報名 (開啟確認彈窗)
     */
    cancelRegistration(regId) {
        this.cancelRegId = regId;
        document.getElementById('cancelModal').classList.add('active');
    }

    /**
     * 關閉取消確認彈窗
     */
    closeCancelModal() {
        document.getElementById('cancelModal').classList.remove('active');
        this.cancelRegId = null;
    }

    /**
     * 確認取消
     */
    confirmCancel() {
        if (!this.cancelRegId) return;
        
        const reg = this.registrations.find(r => r.reg_id === this.cancelRegId);
        if (reg) {
            reg.payment_status = '已取消';
            this.showToast('success', '取消成功', '報名紀錄已取消');
            this.renderTable();
            this.updateStats();
        }
        
        this.closeCancelModal();
    }

    /**
     * 開啟通知彈窗
     */
    openNotifyModal() {
        document.getElementById('notifyModal').classList.add('active');
    }

    /**
     * 關閉通知彈窗
     */
    closeNotifyModal() {
        document.getElementById('notifyModal').classList.remove('active');
    }

    /**
     * 處理匯出
     */
    handleExport() {
        this.showToast('info', '匯出中', '正在產生 Excel 檔案...');
        setTimeout(() => {
            this.showToast('success', '匯出成功', '報名名單已匯出');
        }, 1500);
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
window.siteRegManager = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('registrationTableBody')) {
        window.siteRegManager = new SiteEventRegistrationManager();
    }
});
