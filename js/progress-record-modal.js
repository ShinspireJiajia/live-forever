/**
 * ============================================
 * 陸府建設 CRM 系統 - 進度紀錄彈窗功能
 * ============================================
 * 檔案：progress-record-modal.js
 * 說明：期款完工進度紀錄管理彈窗的 JavaScript 功能
 * 建立日期：2025-12-28
 * ============================================
 */

/**
 * 進度紀錄管理彈窗類別
 */
class ProgressRecordModal {
    /**
     * 建構子
     * @param {string} modalId - 彈窗元素的 ID
     */
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.overlay = this.modal.querySelector('.modal-overlay');
        this.closeBtn = this.modal.querySelector('.modal-close');
        this.closeFooterBtn = this.modal.querySelector('.btn-close-progress-modal');
        this.recordList = document.getElementById('progressRecordList');
        this.installmentNameEl = document.getElementById('progressInstallmentName');
        
        this.currentProjectId = null;
        this.currentInstallmentId = null;
        this.currentInstallmentName = '';
        this.onCloseCallback = null;
        
        // 進度紀錄 Mock 資料（以 projectId_installmentId 為 key）
        this.progressData = {
            '287_2': [
                {
                    id: 1,
                    date: '2025-07-20',
                    description: '訂金已收取完成，客戶確認簽約意願，準備進入簽約階段。',
                    images: [
                        'https://picsum.photos/seed/p1/400/300',
                        'https://picsum.photos/seed/p2/400/300'
                    ]
                }
            ],
            '287_3': [
                {
                    id: 1,
                    date: '2025-07-25',
                    description: '簽約文件準備中，預計下週完成。',
                    images: []
                },
                {
                    id: 2,
                    date: '2025-08-01',
                    description: '簽約款收取完成，客戶已完成簽約程序。',
                    images: [
                        'https://picsum.photos/seed/p3/400/300'
                    ]
                }
            ],
            '287_5': [
                {
                    id: 1,
                    date: '2025-08-10',
                    description: '擋土柱施工中，目前完成約30%。',
                    images: [
                        'https://picsum.photos/seed/c1/400/300',
                        'https://picsum.photos/seed/c2/400/300',
                        'https://picsum.photos/seed/c3/400/300'
                    ]
                },
                {
                    id: 2,
                    date: '2025-08-15',
                    description: '擋土柱施工進度良好，已完成60%。',
                    images: [
                        'https://picsum.photos/seed/c4/400/300'
                    ]
                },
                {
                    id: 3,
                    date: '2025-08-20',
                    description: '擋土柱已完成施工，驗收合格。',
                    images: [
                        'https://picsum.photos/seed/c5/400/300',
                        'https://picsum.photos/seed/c6/400/300'
                    ]
                }
            ]
        };
        
        this._bindEvents();
        this._initLightbox();
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
        
        // 新增進度紀錄按鈕
        const addBtn = document.getElementById('btnAddProgress');
        if (addBtn) {
            addBtn.addEventListener('click', () => this._handleAddProgress());
        }
        
        // 按 ESC 鍵關閉彈窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }
    
    /**
     * 初始化圖片燈箱
     */
    _initLightbox() {
        // 建立燈箱 DOM
        if (!document.getElementById('imageLightbox')) {
            const lightbox = document.createElement('div');
            lightbox.id = 'imageLightbox';
            lightbox.className = 'image-lightbox';
            lightbox.innerHTML = `
                <button class="lightbox-close" title="關閉">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="lightbox-content">
                    <img src="" alt="圖片預覽">
                </div>
            `;
            document.body.appendChild(lightbox);
            
            // 點擊關閉
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox || e.target.closest('.lightbox-close')) {
                    this._closeLightbox();
                }
            });
            
            // ESC 關閉
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this._closeLightbox();
                }
            });
        }
    }
    
    /**
     * 開啟燈箱
     * @param {string} src - 圖片路徑
     */
    _openLightbox(src) {
        const lightbox = document.getElementById('imageLightbox');
        const img = lightbox.querySelector('img');
        img.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * 關閉燈箱
     */
    _closeLightbox() {
        const lightbox = document.getElementById('imageLightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    /**
     * 開啟彈窗
     * @param {number} projectId - 案場 ID
     * @param {number} installmentId - 期款 ID
     * @param {string} installmentName - 期款名稱（含期數）
     * @param {Function} callback - 關閉時的回呼函數
     */
    open(projectId, installmentId, installmentName, callback) {
        this.currentProjectId = projectId;
        this.currentInstallmentId = installmentId;
        this.currentInstallmentName = installmentName;
        this.onCloseCallback = callback;
        
        // 更新標題
        if (this.installmentNameEl) {
            this.installmentNameEl.textContent = installmentName;
        }
        
        // 載入進度紀錄
        this._loadProgressData();
        
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
        
        // 執行回呼
        if (typeof this.onCloseCallback === 'function') {
            this.onCloseCallback();
        }
        
        this.currentProjectId = null;
        this.currentInstallmentId = null;
        this.currentInstallmentName = '';
        this.onCloseCallback = null;
    }
    
    /**
     * 檢查彈窗是否開啟
     * @returns {boolean}
     */
    isOpen() {
        return this.modal.classList.contains('active');
    }
    
    /**
     * 取得資料 key
     * @returns {string}
     */
    _getDataKey() {
        return `${this.currentProjectId}_${this.currentInstallmentId}`;
    }
    
    /**
     * 載入進度紀錄資料
     */
    _loadProgressData() {
        const key = this._getDataKey();
        const data = this.progressData[key] || [];
        this._renderList(data);
    }
    
    /**
     * 渲染進度紀錄列表
     * @param {Array} data - 進度紀錄陣列
     */
    _renderList(data) {
        if (!data || data.length === 0) {
            this.recordList.innerHTML = `
                <div class="no-progress-data">
                    <i class="fa-solid fa-clipboard-list"></i>
                    <p>尚無進度紀錄，請點擊「新增進度紀錄」按鈕新增</p>
                </div>
            `;
            return;
        }
        
        // 按日期排序（最新的在前）
        const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.recordList.innerHTML = sortedData.map(item => this._renderCard(item)).join('');
        
        // 綁定事件
        this._bindCardEvents();
    }
    
    /**
     * 渲染單張進度紀錄卡片
     * @param {Object} item - 進度紀錄物件
     * @returns {string} - HTML 字串
     */
    _renderCard(item) {
        // 圖片區域
        let imagesHtml = '';
        if (item.images && item.images.length > 0) {
            const imageItems = item.images.map(src => `
                <div class="progress-image-item" data-src="${src}">
                    <img src="${src}" alt="進度照片">
                    <div class="image-overlay">
                        <i class="fa-solid fa-search-plus"></i>
                    </div>
                </div>
            `).join('');
            
            imagesHtml = `
                <div class="progress-images">
                    <div class="progress-images-label">
                        <i class="fa-solid fa-images"></i>
                        施工照片（${item.images.length} 張）
                    </div>
                    <div class="progress-images-grid">
                        ${imageItems}
                    </div>
                </div>
            `;
        }
        
        // 說明區域
        const descriptionHtml = item.description 
            ? `<div class="progress-description-text">${item.description}</div>`
            : `<div class="progress-description-empty">未填寫說明</div>`;
        
        return `
            <div class="progress-record-card" data-id="${item.id}">
                <div class="progress-card-header">
                    <div class="progress-card-info">
                        <div class="progress-date">
                            <i class="fa-solid fa-calendar-day"></i>
                            ${item.date}
                        </div>
                    </div>
                    <div class="progress-card-actions">
                        <button type="button" class="btn-card-action btn-edit" data-action="edit" data-id="${item.id}" title="編輯">
                            <i class="fa-solid fa-pen-to-square"></i>
                            編輯
                        </button>
                        <button type="button" class="btn-card-action btn-delete" data-action="delete" data-id="${item.id}" title="刪除">
                            <i class="fa-solid fa-trash"></i>
                            刪除
                        </button>
                    </div>
                </div>
                <div class="progress-card-body">
                    <div class="progress-description">
                        <div class="progress-description-label">
                            <i class="fa-solid fa-comment-dots"></i>
                            進度說明
                        </div>
                        ${descriptionHtml}
                    </div>
                    ${imagesHtml}
                </div>
            </div>
        `;
    }
    
    /**
     * 綁定卡片事件
     */
    _bindCardEvents() {
        // 編輯按鈕
        this.recordList.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this._handleEditProgress(id);
            });
        });
        
        // 刪除按鈕
        this.recordList.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this._handleDeleteProgress(id);
            });
        });
        
        // 圖片點擊（開啟燈箱）
        this.recordList.querySelectorAll('.progress-image-item').forEach(item => {
            item.addEventListener('click', () => {
                const src = item.dataset.src;
                this._openLightbox(src);
            });
        });
    }
    
    /**
     * 處理新增進度紀錄
     */
    _handleAddProgress() {
        if (typeof ProgressFormModal !== 'undefined' && window.progressFormModal) {
            window.progressFormModal.open('add', null, this.currentProjectId, this.currentInstallmentId, () => {
                this._loadProgressData();
            });
        } else {
            alert('新增進度紀錄');
        }
    }
    
    /**
     * 處理編輯進度紀錄
     * @param {number} id - 紀錄 ID
     */
    _handleEditProgress(id) {
        const key = this._getDataKey();
        const data = this.progressData[key] || [];
        const item = data.find(d => d.id === id);
        
        if (item && typeof ProgressFormModal !== 'undefined' && window.progressFormModal) {
            window.progressFormModal.open('edit', item, this.currentProjectId, this.currentInstallmentId, () => {
                this._loadProgressData();
            });
        }
    }
    
    /**
     * 處理刪除進度紀錄
     * @param {number} id - 紀錄 ID
     */
    _handleDeleteProgress(id) {
        if (confirm('確定要刪除這筆進度紀錄嗎？')) {
            const key = this._getDataKey();
            if (this.progressData[key]) {
                this.progressData[key] = this.progressData[key].filter(d => d.id !== id);
                this._loadProgressData();
                console.log('已刪除進度紀錄');
            }
        }
    }
    
    /**
     * 新增進度紀錄資料
     * @param {Object} data - 進度紀錄資料
     */
    addProgressData(data) {
        const key = this._getDataKey();
        if (!this.progressData[key]) {
            this.progressData[key] = [];
        }
        
        // 產生新的 ID
        const existingIds = this.progressData[key].map(d => d.id);
        const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
        
        data.id = newId;
        this.progressData[key].push(data);
        this._loadProgressData();
    }
    
    /**
     * 更新進度紀錄資料
     * @param {number} id - 紀錄 ID
     * @param {Object} data - 更新的資料
     */
    updateProgressData(id, data) {
        const key = this._getDataKey();
        const existingData = this.progressData[key];
        if (existingData) {
            const index = existingData.findIndex(d => d.id === id);
            if (index !== -1) {
                existingData[index] = { ...existingData[index], ...data };
                this._loadProgressData();
            }
        }
    }
}

/**
 * 進度紀錄表單彈窗類別（新增/編輯用）
 */
class ProgressFormModal {
    /**
     * 建構子
     * @param {string} modalId - 彈窗元素的 ID
     */
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.overlay = this.modal.querySelector('.modal-overlay');
        this.closeBtn = this.modal.querySelector('.modal-close');
        this.form = document.getElementById('progressForm');
        this.titleEl = document.getElementById('progressFormTitle');
        
        this.mode = 'add';
        this.currentItem = null;
        this.currentProjectId = null;
        this.currentInstallmentId = null;
        this.onSaveCallback = null;
        this.selectedImages = []; // 儲存選擇的圖片
        
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
        const cancelBtn = document.getElementById('btnProgressCancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }
        
        // 儲存按鈕
        const saveBtn = document.getElementById('btnProgressSave');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this._handleSave());
        }
        
        // 圖片上傳區域
        const uploadArea = document.getElementById('imageUploadArea');
        const fileInput = document.getElementById('progressImages');
        
        if (uploadArea && fileInput) {
            // 點擊上傳
            uploadArea.addEventListener('click', () => fileInput.click());
            
            // 拖放上傳
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                this._handleFiles(files);
            });
            
            // 檔案選擇
            fileInput.addEventListener('change', () => {
                this._handleFiles(fileInput.files);
            });
        }
        
        // 按 ESC 鍵關閉彈窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }
    
    /**
     * 處理上傳的檔案
     * @param {FileList} files - 檔案列表
     */
    _handleFiles(files) {
        for (let file of files) {
            // 驗證檔案類型
            if (!file.type.match('image/(jpeg|png)')) {
                alert('僅支援 JPG、PNG 格式的圖片');
                continue;
            }
            
            // 驗證檔案大小（5MB）
            if (file.size > 5 * 1024 * 1024) {
                alert('單張圖片不可超過 5MB');
                continue;
            }
            
            // 讀取並預覽圖片
            const reader = new FileReader();
            reader.onload = (e) => {
                this.selectedImages.push(e.target.result);
                this._renderImagePreviews();
            };
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * 渲染圖片預覽
     */
    _renderImagePreviews() {
        const container = document.getElementById('imagePreviewContainer');
        
        if (this.selectedImages.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = this.selectedImages.map((src, index) => `
            <div class="image-preview-item" data-index="${index}">
                <img src="${src}" alt="預覽圖片 ${index + 1}">
                <button type="button" class="remove-image" data-index="${index}" title="移除圖片">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `).join('');
        
        // 綁定移除按鈕事件
        container.querySelectorAll('.remove-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.selectedImages.splice(index, 1);
                this._renderImagePreviews();
            });
        });
    }
    
    /**
     * 開啟彈窗
     * @param {string} mode - 模式 ('add' 或 'edit')
     * @param {Object|null} item - 編輯時的進度紀錄資料
     * @param {number} projectId - 案場 ID
     * @param {number} installmentId - 期款 ID
     * @param {Function} callback - 儲存後的回呼函數
     */
    open(mode, item, projectId, installmentId, callback) {
        this.mode = mode;
        this.currentItem = item;
        this.currentProjectId = projectId;
        this.currentInstallmentId = installmentId;
        this.onSaveCallback = callback;
        this.selectedImages = [];
        
        // 設定標題
        this.titleEl.textContent = mode === 'add' ? '新增進度紀錄' : '編輯進度紀錄';
        
        // 重置表單
        this.form.reset();
        document.getElementById('imagePreviewContainer').innerHTML = '';
        
        // 設定預設日期為今天
        if (mode === 'add') {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('progressDate').value = today;
        }
        
        // 如果是編輯模式，填入資料
        if (mode === 'edit' && item) {
            document.getElementById('progressDate').value = item.date;
            document.getElementById('progressDescription').value = item.description || '';
            
            // 載入現有圖片
            if (item.images && item.images.length > 0) {
                this.selectedImages = [...item.images];
                this._renderImagePreviews();
            }
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
        this.selectedImages = [];
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
            date: document.getElementById('progressDate').value,
            description: document.getElementById('progressDescription').value,
            images: [...this.selectedImages]
        };
        
        // 呼叫主彈窗的方法來儲存資料
        if (window.progressRecordModal) {
            if (this.mode === 'add') {
                window.progressRecordModal.addProgressData(formData);
            } else if (this.mode === 'edit' && this.currentItem) {
                window.progressRecordModal.updateProgressData(this.currentItem.id, formData);
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
        console.log(`進度紀錄${actionText}成功`);
    }
}
