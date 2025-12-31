/**
 * ============================================
 * 陸府建設 CRM 系統 - 分頁邏輯
 * ============================================
 * 檔案：pagination.js
 * 說明：處理分頁功能，包含頁碼切換、每頁筆數、跳轉頁面
 * 建立日期：2025-12-03
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // 分頁類別
    // ============================================
    
    /**
     * 分頁管理類別
     * @param {Object} options - 設定選項
     */
    function Pagination(options) {
        // 預設設定
        this.options = Object.assign({
            container: null,           // 分頁容器選擇器或元素
            totalItems: 0,             // 總筆數
            itemsPerPage: 10,          // 每頁筆數
            currentPage: 1,            // 當前頁碼
            maxVisiblePages: 5,        // 最多顯示的頁碼數量
            showInfo: true,            // 顯示資訊（共 X 筆）
            showSizeSelect: true,      // 顯示每頁筆數選擇
            showGoto: false,           // 顯示跳轉頁面
            showFirstLast: true,       // 顯示第一頁/最後一頁按鈕
            pageSizeOptions: [10, 20, 50, 100], // 每頁筆數選項
            infoText: '共 {total} 筆，第 {start} - {end} 筆',
            prevText: '<i class="fa-solid fa-chevron-left"></i>',
            nextText: '<i class="fa-solid fa-chevron-right"></i>',
            firstText: '<i class="fa-solid fa-angles-left"></i>',
            lastText: '<i class="fa-solid fa-angles-right"></i>',
            onChange: null,            // 頁碼改變時的回呼函數
            onSizeChange: null         // 每頁筆數改變時的回呼函數
        }, options);

        // 初始化
        this.init();
    }

    // ============================================
    // 初始化
    // ============================================
    
    Pagination.prototype.init = function() {
        // 取得容器元素
        if (typeof this.options.container === 'string') {
            this.container = document.querySelector(this.options.container);
        } else {
            this.container = this.options.container;
        }

        if (!this.container) {
            console.warn('Pagination: 找不到分頁容器');
            return;
        }

        // 渲染分頁
        this.render();
    };

    // ============================================
    // 計算屬性
    // ============================================
    
    /**
     * 計算總頁數
     * @returns {number}
     */
    Pagination.prototype.getTotalPages = function() {
        return Math.ceil(this.options.totalItems / this.options.itemsPerPage) || 1;
    };

    /**
     * 計算當前頁的起始筆數
     * @returns {number}
     */
    Pagination.prototype.getStartItem = function() {
        if (this.options.totalItems === 0) return 0;
        return (this.options.currentPage - 1) * this.options.itemsPerPage + 1;
    };

    /**
     * 計算當前頁的結束筆數
     * @returns {number}
     */
    Pagination.prototype.getEndItem = function() {
        const end = this.options.currentPage * this.options.itemsPerPage;
        return Math.min(end, this.options.totalItems);
    };

    // ============================================
    // 渲染
    // ============================================
    
    /**
     * 渲染分頁元件
     */
    Pagination.prototype.render = function() {
        const totalPages = this.getTotalPages();
        let html = '<div class="pagination-wrapper">';

        // 分頁資訊
        if (this.options.showInfo) {
            html += this.renderInfo();
        }

        // 每頁筆數選擇
        if (this.options.showSizeSelect) {
            html += this.renderSizeSelect();
        }

        // 分頁導覽
        html += this.renderNavigation(totalPages);

        // 跳轉頁面
        if (this.options.showGoto) {
            html += this.renderGoto(totalPages);
        }

        html += '</div>';

        this.container.innerHTML = html;

        // 綁定事件
        this.bindEvents();
    };

    /**
     * 渲染分頁資訊
     * @returns {string}
     */
    Pagination.prototype.renderInfo = function() {
        const text = this.options.infoText
            .replace('{total}', this.options.totalItems)
            .replace('{start}', this.getStartItem())
            .replace('{end}', this.getEndItem());

        return '<div class="pagination-info">' + text + '</div>';
    };

    /**
     * 渲染每頁筆數選擇
     * @returns {string}
     */
    Pagination.prototype.renderSizeSelect = function() {
        let html = '<div class="pagination-size">';
        html += '<span class="pagination-size-label">每頁</span>';
        html += '<select class="form-select pagination-size-select">';

        this.options.pageSizeOptions.forEach(function(size) {
            const selected = size === this.options.itemsPerPage ? ' selected' : '';
            html += '<option value="' + size + '"' + selected + '>' + size + ' 筆</option>';
        }, this);

        html += '</select>';
        html += '</div>';

        return html;
    };

    /**
     * 渲染分頁導覽
     * @param {number} totalPages - 總頁數
     * @returns {string}
     */
    Pagination.prototype.renderNavigation = function(totalPages) {
        const currentPage = this.options.currentPage;
        let html = '<ul class="pagination">';

        // 第一頁按鈕
        if (this.options.showFirstLast) {
            const firstDisabled = currentPage === 1 ? ' disabled' : '';
            html += '<li class="pagination-item pagination-first' + firstDisabled + '">';
            html += '<button class="pagination-link" data-page="1" title="第一頁">' + this.options.firstText + '</button>';
            html += '</li>';
        }

        // 上一頁按鈕
        const prevDisabled = currentPage === 1 ? ' disabled' : '';
        html += '<li class="pagination-item pagination-prev' + prevDisabled + '">';
        html += '<button class="pagination-link" data-page="' + (currentPage - 1) + '" title="上一頁">' + this.options.prevText + '</button>';
        html += '</li>';

        // 頁碼
        const pages = this.getVisiblePages(totalPages);
        pages.forEach(function(page) {
            if (page === '...') {
                html += '<li class="pagination-item"><span class="pagination-ellipsis">...</span></li>';
            } else {
                const activeClass = page === currentPage ? ' active' : '';
                html += '<li class="pagination-item' + activeClass + '">';
                html += '<button class="pagination-link" data-page="' + page + '">' + page + '</button>';
                html += '</li>';
            }
        });

        // 下一頁按鈕
        const nextDisabled = currentPage === totalPages ? ' disabled' : '';
        html += '<li class="pagination-item pagination-next' + nextDisabled + '">';
        html += '<button class="pagination-link" data-page="' + (currentPage + 1) + '" title="下一頁">' + this.options.nextText + '</button>';
        html += '</li>';

        // 最後一頁按鈕
        if (this.options.showFirstLast) {
            const lastDisabled = currentPage === totalPages ? ' disabled' : '';
            html += '<li class="pagination-item pagination-last' + lastDisabled + '">';
            html += '<button class="pagination-link" data-page="' + totalPages + '" title="最後一頁">' + this.options.lastText + '</button>';
            html += '</li>';
        }

        html += '</ul>';

        return html;
    };

    /**
     * 計算可見的頁碼
     * @param {number} totalPages - 總頁數
     * @returns {Array}
     */
    Pagination.prototype.getVisiblePages = function(totalPages) {
        const currentPage = this.options.currentPage;
        const maxVisible = this.options.maxVisiblePages;
        const pages = [];

        if (totalPages <= maxVisible) {
            // 總頁數小於等於最大顯示數，顯示所有頁碼
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // 計算顯示範圍
            const half = Math.floor(maxVisible / 2);
            let start = Math.max(1, currentPage - half);
            let end = Math.min(totalPages, currentPage + half);

            // 調整範圍
            if (currentPage - half < 1) {
                end = Math.min(totalPages, maxVisible);
            }
            if (currentPage + half > totalPages) {
                start = Math.max(1, totalPages - maxVisible + 1);
            }

            // 新增第一頁
            if (start > 1) {
                pages.push(1);
                if (start > 2) {
                    pages.push('...');
                }
            }

            // 新增中間頁碼
            for (let i = start; i <= end; i++) {
                if (i !== 1 && i !== totalPages) {
                    pages.push(i);
                } else if (pages.indexOf(i) === -1) {
                    pages.push(i);
                }
            }

            // 新增最後一頁
            if (end < totalPages) {
                if (end < totalPages - 1) {
                    pages.push('...');
                }
                pages.push(totalPages);
            }
        }

        return pages;
    };

    /**
     * 渲染跳轉頁面
     * @param {number} totalPages - 總頁數
     * @returns {string}
     */
    Pagination.prototype.renderGoto = function(totalPages) {
        let html = '<div class="pagination-goto">';
        html += '<span class="pagination-goto-label">前往</span>';
        html += '<input type="number" class="form-control pagination-goto-input" min="1" max="' + totalPages + '" value="' + this.options.currentPage + '">';
        html += '<span class="pagination-goto-label">頁</span>';
        html += '<button class="btn btn-secondary pagination-goto-btn">GO</button>';
        html += '</div>';

        return html;
    };

    // ============================================
    // 事件處理
    // ============================================
    
    /**
     * 綁定事件
     */
    Pagination.prototype.bindEvents = function() {
        const self = this;

        // 頁碼按鈕點擊
        this.container.querySelectorAll('.pagination-link').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const page = parseInt(this.getAttribute('data-page'));
                if (!isNaN(page)) {
                    self.goToPage(page);
                }
            });
        });

        // 每頁筆數選擇
        const sizeSelect = this.container.querySelector('.pagination-size-select');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', function() {
                const size = parseInt(this.value);
                self.setItemsPerPage(size);
            });
        }

        // 跳轉頁面
        const gotoInput = this.container.querySelector('.pagination-goto-input');
        const gotoBtn = this.container.querySelector('.pagination-goto-btn');

        if (gotoInput && gotoBtn) {
            gotoBtn.addEventListener('click', function() {
                const page = parseInt(gotoInput.value);
                if (!isNaN(page)) {
                    self.goToPage(page);
                }
            });

            gotoInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const page = parseInt(this.value);
                    if (!isNaN(page)) {
                        self.goToPage(page);
                    }
                }
            });
        }
    };

    // ============================================
    // 公開方法
    // ============================================
    
    /**
     * 跳轉到指定頁面
     * @param {number} page - 頁碼
     */
    Pagination.prototype.goToPage = function(page) {
        const totalPages = this.getTotalPages();
        
        // 確保頁碼在有效範圍內
        page = Math.max(1, Math.min(page, totalPages));

        if (page === this.options.currentPage) return;

        this.options.currentPage = page;
        this.render();

        // 觸發回呼
        if (typeof this.options.onChange === 'function') {
            this.options.onChange(page, this.options.itemsPerPage);
        }
    };

    /**
     * 設定每頁筆數
     * @param {number} size - 每頁筆數
     */
    Pagination.prototype.setItemsPerPage = function(size) {
        if (size === this.options.itemsPerPage) return;

        this.options.itemsPerPage = size;
        this.options.currentPage = 1; // 重置到第一頁
        this.render();

        // 觸發回呼
        if (typeof this.options.onSizeChange === 'function') {
            this.options.onSizeChange(size);
        }
        if (typeof this.options.onChange === 'function') {
            this.options.onChange(1, size);
        }
    };

    /**
     * 設定總筆數
     * @param {number} total - 總筆數
     */
    Pagination.prototype.setTotalItems = function(total) {
        this.options.totalItems = total;
        
        // 確保當前頁碼有效
        const totalPages = this.getTotalPages();
        if (this.options.currentPage > totalPages) {
            this.options.currentPage = totalPages;
        }

        this.render();
    };

    /**
     * 更新設定
     * @param {Object} options - 新的設定
     */
    Pagination.prototype.update = function(options) {
        Object.assign(this.options, options);
        this.render();
    };

    /**
     * 取得當前狀態
     * @returns {Object}
     */
    Pagination.prototype.getState = function() {
        return {
            currentPage: this.options.currentPage,
            itemsPerPage: this.options.itemsPerPage,
            totalItems: this.options.totalItems,
            totalPages: this.getTotalPages(),
            startItem: this.getStartItem(),
            endItem: this.getEndItem()
        };
    };

    /**
     * 銷毀分頁元件
     */
    Pagination.prototype.destroy = function() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    };

    // ============================================
    // 匯出
    // ============================================
    window.CRMPagination = Pagination;
    
    // 相容別名（供 HTML 頁面使用）
    window.Pagination = Pagination;

})();
