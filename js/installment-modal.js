/**
 * ============================================
 * 陸府建設 CRM 系統 - 期款管理彈窗功能
 * ============================================
 * 檔案：installment-modal.js
 * 說明：案場期款管理彈窗的 JavaScript 功能
 * 建立日期：2025-12-28
 * ============================================
 */

/**
 * 期款管理彈窗類別
 */
class InstallmentModal {
    /**
     * 建構子
     * @param {string} modalId - 彈窗元素的 ID
     */
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.overlay = this.modal.querySelector('.modal-overlay');
        this.closeBtn = this.modal.querySelector('.modal-close');
        this.closeFooterBtn = this.modal.querySelector('.btn-close-modal');
        this.tableBody = document.getElementById('installmentTableBody');
        this.projectNameEl = document.getElementById('installmentProjectName');
        
        this.currentProjectId = null;
        this.currentProjectName = '';
        
        // 期款 Mock 資料（按案場分類）
        this.installmentData = {
            254: [
                { id: 1, period: '000', name: '停用', expectedDate: '2025-08-04', pushDate: '2025-08-03', enabled: true },
                { id: 2, period: '001', name: '訂金', expectedDate: '2025-08-01', pushDate: '2025-07-17', enabled: true },
                { id: 3, period: '002', name: '簽約款', expectedDate: '2025-08-06', pushDate: '2025-07-21', enabled: true },
                { id: 4, period: '003', name: '開工款', expectedDate: '2025-08-15', pushDate: '2025-08-06', enabled: true }
            ],
            287: [
                { id: 1, period: '000', name: '停用', expectedDate: '2025-08-04', pushDate: '2025-08-03', enabled: false },
                { id: 2, period: '001', name: '訂金', expectedDate: '2025-08-01', pushDate: '2025-07-17', enabled: true },
                { id: 3, period: '002', name: '簽約款', expectedDate: '2025-08-06', pushDate: '2025-07-21', enabled: true },
                { id: 4, period: '003', name: '開工款', expectedDate: '2025-08-15', pushDate: '2025-08-06', enabled: true },
                { id: 5, period: '01', name: '擋土柱完成', expectedDate: '2025-08-22', pushDate: '2025-08-10', enabled: true },
                { id: 6, period: '02', name: '地下室基礎完成', expectedDate: '2025-08-29', pushDate: '2025-08-20', enabled: true },
                { id: 7, period: '03', name: '地下室頂板完成', expectedDate: '2025-09-05', pushDate: '2025-08-28', enabled: true },
                { id: 8, period: '04', name: '1F頂板完成', expectedDate: '2025-09-12', pushDate: '2025-09-05', enabled: true },
                { id: 9, period: '05', name: '2F頂板完成', expectedDate: '2025-09-19', pushDate: '2025-09-12', enabled: true },
                { id: 10, period: '06', name: '結構體完成', expectedDate: '2025-09-26', pushDate: '2025-09-19', enabled: true }
            ]
        };
        
        // 預設資料（當該案場無資料時使用）
        this.defaultInstallmentData = [
            { id: 1, period: '001', name: '訂金', expectedDate: '2025-08-01', pushDate: '2025-07-17', enabled: true },
            { id: 2, period: '002', name: '簽約款', expectedDate: '2025-08-15', pushDate: '2025-08-01', enabled: true },
            { id: 3, period: '003', name: '開工款', expectedDate: '2025-09-01', pushDate: '2025-08-15', enabled: true }
        ];
        
        this._bindEvents();
    }
    
    /**
     * 綁定事件處理
     */
    _bindEvents() {
        // 點擊遮罩關閉彈窗
        this.overlay.addEventListener('click', () => this.close());
        
        // 點擊關閉按鈕關閉彈窗
        this.closeBtn.addEventListener('click', () => this.close());
        
        // 底部關閉按鈕
        if (this.closeFooterBtn) {
            this.closeFooterBtn.addEventListener('click', () => this.close());
        }
        
        // 新增期款按鈕
        const addBtn = document.getElementById('btnAddInstallment');
        if (addBtn) {
            addBtn.addEventListener('click', () => this._handleAddInstallment());
        }
        
        // 按 ESC 鍵關閉彈窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }
    
    /**
     * 開啟彈窗
     * @param {number} projectId - 案場 ID
     * @param {string} projectName - 案場名稱
     */
    open(projectId, projectName) {
        this.currentProjectId = projectId;
        this.currentProjectName = projectName;
        
        // 更新標題顯示案場名稱
        if (this.projectNameEl) {
            this.projectNameEl.textContent = projectName;
        }
        
        // 載入期款資料
        this._loadInstallmentData();
        
        // 顯示彈窗
        this.modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
    
    /**
     * 關閉彈窗
     */
    close() {
        this.modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        this.currentProjectId = null;
        this.currentProjectName = '';
    }
    
    /**
     * 檢查彈窗是否開啟
     * @returns {boolean}
     */
    isOpen() {
        return this.modal.classList.contains('active');
    }
    
    /**
     * 載入期款資料
     */
    _loadInstallmentData() {
        const data = this.installmentData[this.currentProjectId] || this.defaultInstallmentData;
        this._renderTable(data);
    }
    
    /**
     * 渲染表格
     * @param {Array} data - 期款資料陣列
     */
    _renderTable(data) {
        if (!data || data.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="no-data">
                            <i class="fa-solid fa-inbox"></i>
                            尚無期款資料，請點擊「新增期款」按鈕新增
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        this.tableBody.innerHTML = data.map(item => this._renderTableRow(item)).join('');
        
        // 綁定操作按鈕事件
        this._bindRowEvents();
    }
    
    /**
     * 渲染表格列
     * @param {Object} item - 期款資料物件
     * @returns {string} - HTML 字串
     */
    _renderTableRow(item) {
        const badgeClass = item.enabled ? 'badge-active' : 'badge-inactive';
        const toggleBtnClass = item.enabled ? 'btn-outline-success' : 'btn-outline-secondary';
        const toggleIcon = item.enabled ? 'fa-toggle-on' : 'fa-toggle-off';
        const toggleText = item.enabled ? '已啟用' : '已停用';
        const toggleTitle = item.enabled ? '點擊停用' : '點擊啟用';
        
        // 取得該期款的進度紀錄數量
        const progressRecords = this._getProgressRecordCount(item.id);
        const progressBadge = progressRecords > 0 
            ? `<span class="record-count-badge">${progressRecords}</span>` 
            : '';
        
        return `
            <tr data-id="${item.id}">
                <td>
                    <span class="period-badge ${badgeClass}">第${item.period}期</span>
                </td>
                <td>
                    <strong class="installment-name">${item.name}</strong>
                </td>
                <td>
                    <span class="date-display">
                        <i class="fa-solid fa-calendar text-primary"></i>
                        ${item.expectedDate}
                    </span>
                </td>
                <td>
                    <span class="date-display">
                        <i class="fa-solid fa-bell text-warning"></i>
                        ${item.pushDate}
                    </span>
                </td>
                <td>
                    <div class="btn-group-custom">
                        <button type="button" 
                                class="btn-action btn-outline-primary" 
                                data-action="edit" 
                                data-id="${item.id}" 
                                title="編輯期款">
                            <i class="fa-solid fa-pen-to-square"></i>
                            <span class="btn-text">編輯</span>
                        </button>
                        <button type="button" 
                                class="btn-action btn-outline-info" 
                                data-action="progress" 
                                data-id="${item.id}" 
                                data-period="${item.period}"
                                data-name="${item.name}"
                                title="進度紀錄">
                            <i class="fa-solid fa-chart-line"></i>
                            <span class="btn-text">進度紀錄</span>
                            ${progressBadge}
                        </button>
                        <button type="button" 
                                class="btn-action ${toggleBtnClass}" 
                                data-action="toggle" 
                                data-id="${item.id}" 
                                data-enabled="${item.enabled}"
                                title="${toggleTitle}">
                            <i class="fa-solid ${toggleIcon}"></i>
                            <span class="btn-text">${toggleText}</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    /**
     * 取得期款的進度紀錄數量
     * @param {number} installmentId - 期款 ID
     * @returns {number}
     */
    _getProgressRecordCount(installmentId) {
        if (window.progressRecordModal && window.progressRecordModal.progressData) {
            const key = `${this.currentProjectId}_${installmentId}`;
            const records = window.progressRecordModal.progressData[key];
            return records ? records.length : 0;
        }
        return 0;
    }
    
    /**
     * 綁定表格列事件
     */
    _bindRowEvents() {
        // 編輯按鈕
        this.tableBody.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this._handleEditInstallment(id);
            });
        });
        
        // 進度紀錄按鈕
        this.tableBody.querySelectorAll('[data-action="progress"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const period = btn.dataset.period;
                const name = btn.dataset.name;
                this._handleProgressRecord(id, period, name);
            });
        });
        
        // 啟用/停用按鈕
        this.tableBody.querySelectorAll('[data-action="toggle"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const enabled = btn.dataset.enabled === 'true';
                this._handleToggleInstallment(id, enabled);
            });
        });
    }
    
    /**
     * 處理新增期款
     */
    _handleAddInstallment() {
        // 開啟新增期款表單彈窗
        if (typeof InstallmentFormModal !== 'undefined' && window.installmentFormModal) {
            window.installmentFormModal.open('add', null, this.currentProjectId, () => {
                this._loadInstallmentData();
            });
        } else {
            alert(`新增「${this.currentProjectName}」的期款`);
        }
    }
    
    /**
     * 處理編輯期款
     * @param {number} id - 期款 ID
     */
    _handleEditInstallment(id) {
        const data = this.installmentData[this.currentProjectId] || this.defaultInstallmentData;
        const item = data.find(d => d.id === id);
        
        if (typeof InstallmentFormModal !== 'undefined' && window.installmentFormModal) {
            window.installmentFormModal.open('edit', item, this.currentProjectId, () => {
                this._loadInstallmentData();
            });
        } else {
            alert(`編輯期款：第${item.period}期 - ${item.name}`);
        }
    }
    
    /**
     * 處理啟用/停用期款
     * @param {number} id - 期款 ID
     * @param {boolean} currentEnabled - 目前狀態
     */
    _handleToggleInstallment(id, currentEnabled) {
        const newStatus = !currentEnabled;
        const statusText = newStatus ? '啟用' : '停用';
        
        // 更新資料
        const data = this.installmentData[this.currentProjectId] || this.defaultInstallmentData;
        const item = data.find(d => d.id === id);
        if (item) {
            item.enabled = newStatus;
            
            // 重新渲染表格
            this._renderTable(data);
            
            // 顯示提示訊息
            console.log(`期款「第${item.period}期 - ${item.name}」已${statusText}`);
        }
    }
    
    /**
     * 處理進度紀錄
     * @param {number} id - 期款 ID
     * @param {string} period - 期數
     * @param {string} name - 款項名稱
     */
    _handleProgressRecord(id, period, name) {
        // 開啟進度紀錄彈窗
        if (typeof ProgressRecordModal !== 'undefined' && window.progressRecordModal) {
            window.progressRecordModal.open(
                this.currentProjectId,
                id,
                `第${period}期 - ${name}`,
                () => {
                    // 更新期款列表以顯示最新的進度紀錄數量
                    this._loadInstallmentData();
                }
            );
        } else {
            alert(`開啟「第${period}期 - ${name}」的進度紀錄`);
        }
    }
    
    /**
     * 取得當前案場的期款資料
     * @returns {Array}
     */
    getInstallmentData() {
        return this.installmentData[this.currentProjectId] || [];
    }
    
    /**
     * 新增期款資料
     * @param {Object} data - 期款資料
     */
    addInstallmentData(data) {
        if (!this.installmentData[this.currentProjectId]) {
            this.installmentData[this.currentProjectId] = [];
        }
        
        // 產生新的 ID
        const existingIds = this.installmentData[this.currentProjectId].map(d => d.id);
        const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
        
        data.id = newId;
        this.installmentData[this.currentProjectId].push(data);
        this._loadInstallmentData();
    }
    
    /**
     * 更新期款資料
     * @param {number} id - 期款 ID
     * @param {Object} data - 更新的資料
     */
    updateInstallmentData(id, data) {
        const existingData = this.installmentData[this.currentProjectId];
        if (existingData) {
            const index = existingData.findIndex(d => d.id === id);
            if (index !== -1) {
                existingData[index] = { ...existingData[index], ...data };
                this._loadInstallmentData();
            }
        }
    }
}

/**
 * 期款表單彈窗類別（新增/編輯用）
 */
class InstallmentFormModal {
    /**
     * 建構子
     * @param {string} modalId - 彈窗元素的 ID
     */
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.overlay = this.modal.querySelector('.modal-overlay');
        this.closeBtn = this.modal.querySelector('.modal-close');
        this.form = document.getElementById('installmentForm');
        this.titleEl = document.getElementById('installmentFormTitle');
        
        this.mode = 'add'; // 'add' 或 'edit'
        this.currentItem = null;
        this.currentProjectId = null;
        this.onSaveCallback = null;
        
        this._bindEvents();
    }
    
    /**
     * 綁定事件處理
     */
    _bindEvents() {
        // 點擊遮罩關閉彈窗
        this.overlay.addEventListener('click', () => this.close());
        
        // 點擊關閉按鈕關閉彈窗
        this.closeBtn.addEventListener('click', () => this.close());
        
        // 取消按鈕
        const cancelBtn = document.getElementById('btnInstallmentCancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }
        
        // 儲存按鈕
        const saveBtn = document.getElementById('btnInstallmentSave');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this._handleSave());
        }
        
        // 按 ESC 鍵關閉彈窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }
    
    /**
     * 開啟彈窗
     * @param {string} mode - 模式 ('add' 或 'edit')
     * @param {Object|null} item - 編輯時的期款資料
     * @param {number} projectId - 案場 ID
     * @param {Function} callback - 儲存後的回呼函數
     */
    open(mode, item, projectId, callback) {
        this.mode = mode;
        this.currentItem = item;
        this.currentProjectId = projectId;
        this.onSaveCallback = callback;
        
        // 設定標題
        this.titleEl.textContent = mode === 'add' ? '新增期款' : '編輯期款';
        
        // 重置表單
        this.form.reset();
        
        // 如果是編輯模式，填入資料
        if (mode === 'edit' && item) {
            document.getElementById('installmentPeriod').value = item.period;
            document.getElementById('installmentName').value = item.name;
            document.getElementById('installmentExpectedDate').value = item.expectedDate;
            document.getElementById('installmentPushDate').value = item.pushDate;
        }
        
        // 顯示彈窗
        this.modal.classList.add('active');
    }
    
    /**
     * 關閉彈窗
     */
    close() {
        this.modal.classList.remove('active');
        this.currentItem = null;
        this.onSaveCallback = null;
    }
    
    /**
     * 檢查彈窗是否開啟
     * @returns {boolean}
     */
    isOpen() {
        return this.modal.classList.contains('active');
    }
    
    /**
     * 處理儲存
     */
    _handleSave() {
        // 驗證表單
        if (!this.form.checkValidity()) {
            this.form.reportValidity();
            return;
        }
        
        // 收集表單資料
        const formData = {
            period: document.getElementById('installmentPeriod').value,
            name: document.getElementById('installmentName').value,
            expectedDate: document.getElementById('installmentExpectedDate').value,
            pushDate: document.getElementById('installmentPushDate').value,
            enabled: true
        };
        
        // 呼叫主彈窗的方法來儲存資料
        if (window.installmentModal) {
            if (this.mode === 'add') {
                window.installmentModal.addInstallmentData(formData);
            } else if (this.mode === 'edit' && this.currentItem) {
                window.installmentModal.updateInstallmentData(this.currentItem.id, formData);
            }
        }
        
        // 關閉彈窗
        this.close();
        
        // 執行回呼
        if (typeof this.onSaveCallback === 'function') {
            this.onSaveCallback();
        }
        
        // 顯示成功訊息
        const actionText = this.mode === 'add' ? '新增' : '編輯';
        console.log(`期款${actionText}成功：${formData.name}`);
    }
}
