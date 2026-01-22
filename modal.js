/**
 * ============================================
 * 陸府建設 CRM 系統 - 彈窗邏輯
 * ============================================
 * 檔案：modal.js
 * 說明：處理彈出視窗的開啟、關閉、確認對話框等功能
 * 建立日期：2025-12-03
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // 彈窗類別
    // ============================================
    
    /**
     * 彈窗管理類別
     * @param {Object|string} options - 設定選項 或 彈窗ID
     */
    function Modal(options) {
        // 支援字串 ID 參數
        if (typeof options === 'string') {
            options = { id: options };
        }

        // 預設設定
        this.options = Object.assign({
            id: null,                  // 彈窗 ID
            title: '',                 // 標題
            content: '',               // 內容（HTML 字串）
            size: '',                  // 尺寸：'' | 'sm' | 'lg' | 'xl' | 'fullscreen'
            closable: true,            // 是否可關閉
            closeOnBackdrop: true,     // 點擊背景是否關閉
            closeOnEscape: true,       // 按 ESC 是否關閉
            showHeader: true,          // 是否顯示標題區
            showFooter: true,          // 是否顯示底部區
            footerButtons: [],         // 底部按鈕配置
            animation: '',             // 動畫：'' | 'fade' | 'slide-down' | 'slide-up'
            onOpen: null,              // 開啟時的回呼
            onClose: null,             // 關閉時的回呼
            onConfirm: null,           // 確認時的回呼
            onCancel: null             // 取消時的回呼
        }, options);

        this.element = null;
        this.backdrop = null;
        this.isOpen = false;

        // 初始化
        this.init();
    }

    // ============================================
    // 初始化
    // ============================================
    
    Modal.prototype.init = function() {
        // 如果有指定 ID，嘗試取得現有元素
        if (this.options.id) {
            this.element = document.getElementById(this.options.id);
        }

        // 如果沒有現有元素，創建新的
        if (!this.element) {
            this.create();
        }

        // 綁定事件
        this.bindEvents();
    };

    // ============================================
    // 創建彈窗
    // ============================================
    
    Modal.prototype.create = function() {
        // 創建背景遮罩
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'modal-backdrop';

        // 創建彈窗容器
        this.element = document.createElement('div');
        this.element.className = 'modal';
        
        if (this.options.id) {
            this.element.id = this.options.id;
        }
        
        if (this.options.size) {
            this.element.classList.add('modal-' + this.options.size);
        }
        
        if (this.options.animation) {
            this.element.classList.add('modal-' + this.options.animation);
        }

        // 創建彈窗內容
        this.element.innerHTML = this.buildContent();

        // 加入 DOM
        document.body.appendChild(this.backdrop);
        document.body.appendChild(this.element);
    };

    /**
     * 建構彈窗內容 HTML
     * @returns {string}
     */
    Modal.prototype.buildContent = function() {
        let html = '<div class="modal-content">';

        // 標題區
        if (this.options.showHeader) {
            html += '<div class="modal-header">';
            html += '<h3 class="modal-title">' + this.options.title + '</h3>';
            if (this.options.closable) {
                html += '<button type="button" class="modal-close" data-action="close">';
                html += '<i class="fa-solid fa-xmark"></i>';
                html += '</button>';
            }
            html += '</div>';
        }

        // 內容區
        html += '<div class="modal-body">';
        html += this.options.content;
        html += '</div>';

        // 底部區
        if (this.options.showFooter && this.options.footerButtons.length > 0) {
            html += '<div class="modal-footer">';
            this.options.footerButtons.forEach(function(btn) {
                const btnClass = btn.class || 'btn-secondary';
                const btnAction = btn.action || '';
                html += '<button type="button" class="btn ' + btnClass + '" data-action="' + btnAction + '">';
                html += btn.text;
                html += '</button>';
            });
            html += '</div>';
        }

        html += '</div>';

        return html;
    };

    // ============================================
    // 事件綁定
    // ============================================
    
    Modal.prototype.bindEvents = function() {
        const self = this;

        // 關閉按鈕
        this.element.querySelectorAll('[data-action="close"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.close();
            });
        });

        // 確認按鈕
        this.element.querySelectorAll('[data-action="confirm"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (typeof self.options.onConfirm === 'function') {
                    const result = self.options.onConfirm();
                    // 如果回呼返回 false，不關閉彈窗
                    if (result !== false) {
                        self.close();
                    }
                } else {
                    self.close();
                }
            });
        });

        // 取消按鈕
        this.element.querySelectorAll('[data-action="cancel"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (typeof self.options.onCancel === 'function') {
                    self.options.onCancel();
                }
                self.close();
            });
        });

        // 點擊背景關閉
        if (this.options.closeOnBackdrop) {
            this.element.addEventListener('click', function(e) {
                if (e.target === self.element) {
                    self.close();
                }
            });
        }

        // ESC 鍵關閉
        if (this.options.closeOnEscape) {
            this.escHandler = function(e) {
                if (e.key === 'Escape' && self.isOpen) {
                    self.close();
                }
            };
            document.addEventListener('keydown', this.escHandler);
        }
    };

    // ============================================
    // 公開方法
    // ============================================
    
    /**
     * 開啟彈窗
     */
    Modal.prototype.open = function() {
        if (this.isOpen) return;

        this.isOpen = true;
        document.body.classList.add('modal-open');
        
        if (this.backdrop) {
            this.backdrop.classList.add('active');
        }
        this.element.classList.add('active');

        // 觸發回呼
        if (typeof this.options.onOpen === 'function') {
            this.options.onOpen();
        }

        // 設定焦點到彈窗
        const firstFocusable = this.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    };

    /**
     * 關閉彈窗
     */
    Modal.prototype.close = function() {
        if (!this.isOpen) return;

        this.isOpen = false;
        
        if (this.backdrop) {
            this.backdrop.classList.remove('active');
        }
        this.element.classList.remove('active');

        // 檢查是否還有其他彈窗開啟
        const otherModals = document.querySelectorAll('.modal.active');
        if (otherModals.length === 0) {
            document.body.classList.remove('modal-open');
        }

        // 觸發回呼
        if (typeof this.options.onClose === 'function') {
            this.options.onClose();
        }
    };

    /**
     * 更新彈窗標題
     * @param {string} title - 新標題
     */
    Modal.prototype.setTitle = function(title) {
        const titleEl = this.element.querySelector('.modal-title');
        if (titleEl) {
            titleEl.textContent = title;
        }
    };

    /**
     * 更新彈窗內容
     * @param {string} content - 新內容（HTML）
     */
    Modal.prototype.setContent = function(content) {
        const bodyEl = this.element.querySelector('.modal-body');
        if (bodyEl) {
            bodyEl.innerHTML = content;
        }
    };

    /**
     * 銷毀彈窗
     */
    Modal.prototype.destroy = function() {
        this.close();

        // 移除 ESC 事件監聽
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
        }

        // 移除 DOM 元素
        if (this.backdrop && this.backdrop.parentNode) {
            this.backdrop.parentNode.removeChild(this.backdrop);
        }
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        this.element = null;
        this.backdrop = null;
    };

    // ============================================
    // 靜態方法 - 確認對話框
    // ============================================
    
    /**
     * 顯示確認對話框
     * @param {Object} options - 設定選項
     * @returns {Promise}
     */
    Modal.confirm = function(options) {
        return new Promise(function(resolve) {
            const defaultOptions = {
                title: '確認',
                message: '確定要執行此操作嗎？',
                type: 'warning', // warning | danger | success | info
                confirmText: '確認',
                cancelText: '取消',
                confirmClass: 'btn-primary',
                cancelClass: 'btn-secondary'
            };

            const opts = Object.assign({}, defaultOptions, options);

            // 建構內容
            const iconMap = {
                warning: 'fa-exclamation-triangle',
                danger: 'fa-trash',
                success: 'fa-check-circle',
                info: 'fa-info-circle'
            };

            const content = `
                <div class="modal-confirm-icon ${opts.type}">
                    <i class="fa-solid ${iconMap[opts.type] || iconMap.warning}"></i>
                </div>
                <div class="modal-confirm-title">${opts.title}</div>
                <div class="modal-confirm-message">${opts.message}</div>
            `;

            const modal = new Modal({
                content: content,
                size: 'sm',
                showHeader: false,
                footerButtons: [
                    { text: opts.cancelText, class: opts.cancelClass, action: 'cancel' },
                    { text: opts.confirmText, class: opts.confirmClass, action: 'confirm' }
                ],
                onConfirm: function() {
                    resolve(true);
                },
                onCancel: function() {
                    resolve(false);
                },
                onClose: function() {
                    // 關閉後銷毀
                    setTimeout(function() {
                        modal.destroy();
                    }, 300);
                }
            });

            modal.element.classList.add('modal-confirm');
            modal.open();
        });
    };

    /**
     * 顯示刪除確認對話框
     * @param {string} itemName - 要刪除的項目名稱
     * @returns {Promise}
     */
    Modal.confirmDelete = function(itemName) {
        return Modal.confirm({
            title: '刪除確認',
            message: itemName ? '確定要刪除「' + itemName + '」嗎？此操作無法復原。' : '確定要刪除此項目嗎？此操作無法復原。',
            type: 'danger',
            confirmText: '刪除',
            confirmClass: 'btn-danger'
        });
    };

    /**
     * 顯示訊息彈窗
     * @param {Object} options - 設定選項
     */
    Modal.alert = function(options) {
        const defaultOptions = {
            title: '訊息',
            message: '',
            type: 'info',
            buttonText: '確定'
        };

        const opts = Object.assign({}, defaultOptions, options);

        const iconMap = {
            warning: 'fa-exclamation-triangle',
            danger: 'fa-times-circle',
            success: 'fa-check-circle',
            info: 'fa-info-circle'
        };

        const content = `
            <div class="modal-confirm-icon ${opts.type}">
                <i class="fa-solid ${iconMap[opts.type] || iconMap.info}"></i>
            </div>
            <div class="modal-confirm-title">${opts.title}</div>
            <div class="modal-confirm-message">${opts.message}</div>
        `;

        const modal = new Modal({
            content: content,
            size: 'sm',
            showHeader: false,
            footerButtons: [
                { text: opts.buttonText, class: 'btn-primary', action: 'close' }
            ],
            onClose: function() {
                setTimeout(function() {
                    modal.destroy();
                }, 300);
            }
        });

        modal.element.classList.add('modal-confirm');
        modal.open();
    };

    // ============================================
    // 全域彈窗管理
    // ============================================
    
    /**
     * 從 HTML 元素開啟彈窗
     * @param {string|HTMLElement} selector - 彈窗選擇器或元素
     */
    Modal.open = function(selector) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element) {
            const modal = new Modal({ id: element.id });
            modal.element = element;
            modal.bindEvents();
            modal.open();
            return modal;
        }
        return null;
    };

    /**
     * 關閉指定的彈窗
     * @param {string|HTMLElement} selector - 彈窗選擇器或元素
     */
    Modal.close = function(selector) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element) {
            element.classList.remove('active');
            const backdrop = element.previousElementSibling;
            if (backdrop && backdrop.classList.contains('modal-backdrop')) {
                backdrop.classList.remove('active');
            }
            
            const otherModals = document.querySelectorAll('.modal.active');
            if (otherModals.length === 0) {
                document.body.classList.remove('modal-open');
            }
        }
    };

    /**
     * 關閉所有彈窗
     */
    Modal.closeAll = function() {
        document.querySelectorAll('.modal.active').forEach(function(modal) {
            Modal.close(modal);
        });
    };

    // ============================================
    // 自動初始化
    // ============================================
    
    /**
     * 自動綁定觸發器（data-toggle="modal"）
     */
    function initTriggers() {
        document.querySelectorAll('[data-toggle="modal"]').forEach(function(trigger) {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('data-target') || this.getAttribute('href');
                if (target) {
                    Modal.open(target);
                }
            });
        });
    }

    // DOM 載入完成後初始化觸發器
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTriggers);
    } else {
        initTriggers();
    }

    // ============================================
    // 匯出
    // ============================================
    window.CRMModal = Modal;
    
    // 相容別名（供 HTML 頁面使用）
    window.Modal = Modal;
    
    // ConfirmDialog 快捷方式
    window.ConfirmDialog = {
        show: function(options) {
            return Modal.confirm({
                title: options.title || '確認',
                message: options.message || '',
                type: options.type || 'warning',
                confirmText: options.confirmText || '確認',
                cancelText: options.cancelText || '取消',
                onConfirm: options.onConfirm,
                onCancel: options.onCancel
            }).then(function(confirmed) {
                if (confirmed && typeof options.onConfirm === 'function') {
                    options.onConfirm();
                } else if (!confirmed && typeof options.onCancel === 'function') {
                    options.onCancel();
                }
            });
        }
    };

})();
