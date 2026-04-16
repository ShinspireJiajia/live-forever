/**
 * ============================================
 * 基金會活動模組 - JavaScript
 * ============================================
 * 檔案：foundation-event.js
 * 說明：基金會活動管理（CMS 同步列表）
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
        this.updatePageInfo();
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
        // 關鍵字搜尋
        const btnSearch = document.getElementById('btnKeywordSearch');
        if (btnSearch) {
            btnSearch.addEventListener('click', () => this.handleSearch());
        }
        const searchKeyword = document.getElementById('searchKeyword');
        if (searchKeyword) {
            searchKeyword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch();
                }
            });
        }

        // 篩選下拉
        const filterAll = document.getElementById('filterAllData');
        if (filterAll) {
            filterAll.addEventListener('change', () => {
                this.currentPage = 1;
                this.renderTable();
                this.updatePageInfo();
            });
        }

        // 同步按鈕
        const btnSync = document.getElementById('btnSync');
        if (btnSync) {
            btnSync.addEventListener('click', () => this.handleSync());
        }

        // 同步按鈕
        const btnSync = document.getElementById('btnSync');
        const btnSync = document.getElementById('btnSync');
        const originalHtml = btnSync.innerHTML;
        
        // 顯示同步中狀態
        btnSync.disabled = true;
        btnSync.innerHTML = '<i class="fa-solid fa-sync spinning"></i> 同步中...';
        
        // 模擬 API 同步
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 恢復按鈕狀態
        btnSync.disabled = false;
        btnSync.innerHTML = originalHtml;
        
        // 顯示成功訊息
        this.showToast('success', '同步成功', '已從 CMS 同步最新活動資料');
        
        // 重新載入資料
        this.renderTable();
        this.updatePageInfo();
    }

    /**
     * 處理查詢
     */
    handleSearch() {
        this.currentPage = 1;
        this.renderTable();
        this.updatePageInfo();
    }

    /**
     * 篩選活動
     */
    filterEvents() {
        let filtered = [...this.events];
        
        // 關鍵字篩選
        const keyword = document.getElementById('searchKeyword')?.value?.trim();
        if (keyword) {
            filtered = filtered.filter(e => 
                e.title.toLowerCase().includes(keyword.toLowerCase())
            );
        }

        // 顯示狀態篩選
        const filterVisible = document.getElementById('filterAllData')?.value;
        if (filterVisible === 'visible') {
            filtered = filtered.filter(e => e.is_frontend_visible);
        } else if (filterVisible === 'hidden') {
            filtered = filtered.filter(e => !e.is_frontend_visible);
        }
        
        return filtered;
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
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#999;padding:20px;">無符合條件的活動資料</td></tr>';
            return;
        }
        
        tbody.innerHTML = pageData.map((event) => {
            // 格式化建立日期
            const created = event.created_at ? new Date(event.created_at) : null;
            const createdStr = created 
                ? created.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
                : '-';
            
            return `
                <tr>
                    <td>${event.title}</td>
                    <td>${event.publish_date || '-'}</td>
                    <td class="cell-bool"><input type="checkbox" ${event.is_frontend_visible ? 'checked' : ''} disabled></td>
                    <td class="cell-bool"><input type="checkbox" ${event.is_pinned ? 'checked' : ''} disabled></td>
                    <td class="cell-bool"><input type="checkbox" ${event.is_resident_only ? 'checked' : ''} disabled></td>
                    <td class="cell-bool"><input type="checkbox" ${event.is_form_visible ? 'checked' : ''} disabled></td>
                    <td>${createdStr}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="eventManager.viewCmsPage('${event.event_id}')" title="開啟 CMS 活動頁面">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="eventManager.editEvent('${event.event_id}')" title="報名規則設定">
                                <i class="fa-solid fa-gear"></i>
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="eventManager.viewRegistrations('${event.event_id}')" title="報名管理">
                                <i class="fa-solid fa-users"></i>
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
     * 更新頁面資訊
     */
    updatePageInfo() {
        const filtered = this.filterEvents();
        const totalPages = Math.ceil(filtered.length / this.pageSize) || 1;
        const infoEl = document.getElementById('pageDataInfo');
        if (infoEl) {
            infoEl.textContent = `頁次 ${this.currentPage} / ${totalPages} 共有 ${filtered.length} 筆資料`;
        }
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
        html += `<li class="page-item ${prevDisabled}">
                    <a class="page-link" href="javascript:void(0)" onclick="eventManager.goToPage(${this.currentPage - 1})">
                        <i class="fa-solid fa-chevron-left"></i></a></li>`;
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const active = i === this.currentPage ? 'active' : '';
                html += `<li class="page-item ${active}">
                            <a class="page-link" href="javascript:void(0)" onclick="eventManager.goToPage(${i})">${i}</a></li>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        // 下一頁
        const nextDisabled = this.currentPage === totalPages ? 'disabled' : '';
        html += `<li class="page-item ${nextDisabled}">
                    <a class="page-link" href="javascript:void(0)" onclick="eventManager.goToPage(${this.currentPage + 1})">
                        <i class="fa-solid fa-chevron-right"></i></a></li>`;
        
        html += '</ul>';
        wrapper.innerHTML = html;
    }

    /**
     * 跳轉頁面
     */
    goToPage(page) {
        const filtered = this.filterEvents();
        const totalPages = Math.ceil(filtered.length / this.pageSize);
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.renderTable();
        this.updatePageInfo();
    }

    /**
     * 查看 CMS 活動頁面（導向外部 URL）
     */
    viewCmsPage(eventId) {
        const event = FoundationMockData.getEventById(eventId);
        if (event && event.cms_url) {
            window.location.href = event.cms_url;
        } else {
            this.showToast('error', '錯誤', '找不到活動的 CMS 連結');
        }
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
     * 顯示提示訊息
     */
    showToast(type, title, message) {
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
window.eventManager = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('eventTableBody')) {
        window.eventManager = new FoundationEventManager();
    }
});
