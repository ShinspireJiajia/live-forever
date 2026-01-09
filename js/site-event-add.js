/**
 * ============================================
 * 案場活動新增/編輯頁面 - JavaScript
 * ============================================
 * 檔案：site-event-add.js
 * 說明：處理案場活動新增與編輯功能
 * ============================================
 */

/**
 * 案場活動新增管理類別
 */
class SiteEventAddManager {
    constructor() {
        // 編輯模式時的活動 ID
        this.editingEventId = null;
        // 是否為編輯模式
        this.isEditMode = false;
        // 初始化
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.parseUrlParams();
        this.bindEvents();
        this.initDateDefaults();
        this.initProjectAutocomplete();
        this.initEditor();
        
        // 如果是編輯模式，載入活動資料
        if (this.isEditMode) {
            this.loadEventData();
        }
    }

    /**
     * 解析 URL 參數
     */
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('eventId');
        
        if (eventId) {
            this.editingEventId = eventId;
            this.isEditMode = true;
            this.updatePageForEditMode();
        }
    }

    /**
     * 更新頁面為編輯模式
     */
    updatePageForEditMode() {
        // 更新頁面標題
        document.getElementById('pageTitle').textContent = '編輯活動';
        document.getElementById('formPageTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> 編輯案場活動';
        document.title = '編輯案場活動 - 陸府建設 CRM';
        
        // 更新成功訊息
        document.getElementById('successTitle').textContent = '更新成功';
        document.getElementById('successMessage').textContent = '活動資料已成功更新';
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 表單提交
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEvent();
            });

            eventForm.addEventListener('reset', () => {
                // 重置時清除所有案場勾選
                setTimeout(() => {
                    this.clearProject();
                    this.clearImagePreview();
                }, 0);
            });
        }

        // 圖片上傳
        const imageUploadArea = document.getElementById('imageUploadArea');
        const formImage = document.getElementById('formImage');
        const removeImageBtn = document.getElementById('removeImageBtn');

        if (imageUploadArea && formImage) {
            // 點擊上傳區域觸發檔案選擇
            imageUploadArea.addEventListener('click', () => formImage.click());
            
            // 檔案選擇變化
            formImage.addEventListener('change', (e) => this.handleImageSelect(e));
            
            // 拖曳上傳
            imageUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                imageUploadArea.classList.add('dragover');
            });
            
            imageUploadArea.addEventListener('dragleave', () => {
                imageUploadArea.classList.remove('dragover');
            });
            
            imageUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                imageUploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleImageFile(files[0]);
                }
            });
        }

        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearImagePreview();
            });
        }

        // 日期驗證：結束時間必須晚於開始時間
        const startDt = document.getElementById('formStartDt');
        const endDt = document.getElementById('formEndDt');
        
        if (startDt && endDt) {
            startDt.addEventListener('change', () => this.validateDateRange());
            endDt.addEventListener('change', () => this.validateDateRange());
        }

        // 成功彈窗外部點擊關閉
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.addEventListener('click', (e) => {
                if (e.target === successModal) {
                    this.closeSuccessModal();
                }
            });
        }
    }

    /**
     * 初始化日期預設值
     */
    initDateDefaults() {
        const startDt = document.getElementById('formStartDt');
        const endDt = document.getElementById('formEndDt');
        
        // 如果不是編輯模式，設定預設開始時間為明天早上 9 點
        if (!this.isEditMode) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            
            const defaultEnd = new Date(tomorrow);
            defaultEnd.setHours(17, 0, 0, 0);
            
            if (startDt) {
                startDt.value = this.formatDateTimeLocal(tomorrow);
            }
            if (endDt) {
                endDt.value = this.formatDateTimeLocal(defaultEnd);
            }
        }
    }

    /**
     * 格式化日期為 datetime-local 輸入格式
     */
    formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    /**
     * 驗證日期範圍
     */
    validateDateRange() {
        const startDt = document.getElementById('formStartDt');
        const endDt = document.getElementById('formEndDt');
        
        if (startDt.value && endDt.value) {
            const startDate = new Date(startDt.value);
            const endDate = new Date(endDt.value);
            
            if (endDate <= startDate) {
                this.showToast('error', '日期錯誤', '結束時間必須晚於開始時間');
                endDt.value = '';
            }
        }
    }

    /**
     * 初始化案場 Autocomplete
     */
    initProjectAutocomplete() {
        const input = document.getElementById('projectSearchInput');
        const list = document.getElementById('projectSuggestionList');
        const clearBtn = document.getElementById('clearProjectBtn');

        if (!input || !list) return;

        // 輸入監聽
        input.addEventListener('input', (e) => {
            const value = e.target.value.trim().toLowerCase();
            this.filterProjects(value);
        });

        // 聚焦時顯示所有選項 (如果空白)
        input.addEventListener('focus', () => {
            if (input.value.trim() === '') {
                this.filterProjects('');
            } else {
                this.filterProjects(input.value.trim().toLowerCase());
            }
        });

        // 點擊外部關閉選單
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !list.contains(e.target)) {
                list.style.display = 'none';
            }
        });
        
        // 清除按鈕
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearProject();
                input.focus();
            });
        }
    }

    /**
     * 初始化 Rich Text Editor
     */
    initEditor() {
        const editorContent = document.getElementById('editorContent');
        if (!editorContent) return;

        // 綁定工具列按鈕
        const buttons = document.querySelectorAll('.editor-btn[data-command]');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.getAttribute('data-command');
                document.execCommand(command, false, null);
                editorContent.focus();
                this.updateToolbarStatus();
            });
        });

        // 字型大小
        const fontSizeSelect = document.getElementById('editorFontSize');
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', () => {
                document.execCommand('fontSize', false, fontSizeSelect.value);
                editorContent.focus();
            });
        }

        // 文字顏色
        const foreColorInput = document.getElementById('editorForeColor');
        if (foreColorInput) {
            foreColorInput.addEventListener('input', () => {
                document.execCommand('foreColor', false, foreColorInput.value);
            });
            foreColorInput.addEventListener('change', () => {
                editorContent.focus();
            });
        }

        // 建立連結
        const createLinkBtn = document.getElementById('editorCreateLink');
        if (createLinkBtn) {
            createLinkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const url = prompt('請輸入連結網址:', 'http://');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
                editorContent.focus();
            });
        }

        // 插入圖片
        const insertImageBtn = document.getElementById('editorInsertImage');
        const imageInput = document.getElementById('editorImageInput');
        
        if (insertImageBtn && imageInput) {
            insertImageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                imageInput.click();
            });
            
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (readerEvent) => {
                        // 插入圖片
                        document.execCommand('insertImage', false, readerEvent.target.result);
                    };
                    reader.readAsDataURL(file);
                }
                imageInput.value = '';
                editorContent.focus();
            });
        }
        
        // 監聽選區變化以更新工具列狀態
        editorContent.addEventListener('mouseup', () => this.updateToolbarStatus());
        editorContent.addEventListener('keyup', () => this.updateToolbarStatus());
    }

    /**
     * 更新工具列按鈕狀態
     */
    updateToolbarStatus() {
        const buttons = document.querySelectorAll('.editor-btn[data-command]');
        buttons.forEach(btn => {
            const command = btn.getAttribute('data-command');
            try {
                if (document.queryCommandState(command)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            } catch (e) {
                // 部分指令可能不支援 queryCommandState
            }
        });
    }

    /**
     * 過濾案場
     */
    filterProjects(keyword) {
        const list = document.getElementById('projectSuggestionList');
        if (!list) return;

        list.innerHTML = '';
        
        // 使用 CRMMockData.projects
        let projects = [];
        if (typeof CRMMockData !== 'undefined' && CRMMockData.projects) {
            projects = CRMMockData.projects;
        } else if (typeof MockData !== 'undefined' && MockData.projects) {
             projects = MockData.projects;
        } else if (typeof SiteEventMockData !== 'undefined' && SiteEventMockData.sites) {
            // Fallback: 如果 MockData 不存在 (理論上不應該發生)，使用 SiteEventMockData.sites
            // SiteEventMockData.sites is array of objects {id, name}
            projects = SiteEventMockData.sites;
        }

        // Apply filter
        if (keyword) {
            projects = projects.filter(p => p.name.toLowerCase().includes(keyword));
        }

        if (projects.length === 0) {
            const li = document.createElement('li');
            li.style.cssText = 'padding: 8px 12px; color: #999; font-size: 14px;';
            li.textContent = '無符合案場';
            list.appendChild(li);
        } else {
            projects.forEach(p => {
                const li = document.createElement('li');
                li.style.cssText = 'padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0;';
                li.addEventListener('mouseover', () => li.style.backgroundColor = '#f5f5f5');
                li.addEventListener('mouseout', () => li.style.backgroundColor = '#fff');
                
                li.innerHTML = `<i class="fa-solid fa-building" style="margin-right:8px; color:#888;"></i>${p.name}`;
                
                li.addEventListener('click', () => {
                    this.setProject(p);
                    list.style.display = 'none';
                });
                
                list.appendChild(li);
            });
        }
        
        list.style.display = 'block';
    }

    /**
     * 設定選取的案場
     */
    setProject(project) {
        const input = document.getElementById('projectSearchInput');
        const hiddenId = document.getElementById('selectedProjectId');
        const displayDiv = document.getElementById('selectedProjectDisplay');
        const nameSpan = document.getElementById('selectedProjectName');
        const inputGroup = input ? input.closest('.input-group') : null;

        if (hiddenId) hiddenId.value = project.name; // 使用名稱
        if (input) {
            input.value = project.name;
        }
        
        // 隱藏搜尋框，顯示結果
        if (inputGroup) inputGroup.style.display = 'none';
        
        if (displayDiv) {
            displayDiv.style.display = 'block';
            if (nameSpan) nameSpan.textContent = project.name;
            
            // 確保有移除按鈕
             if (!displayDiv.querySelector('.remove-project-icon')) {
                 // 找到 .badge 的 div
                 const badgeDiv = displayDiv.querySelector('div');
                 if (badgeDiv) {
                    const removeIcon = document.createElement('i');
                    removeIcon.className = 'fa-solid fa-times remove-project-icon';
                    removeIcon.style.cssText = 'margin-left: 10px; cursor: pointer; color: #666; font-size: 12px;';
                    removeIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.clearProject();
                    });
                    badgeDiv.appendChild(removeIcon);
                 }
             }
        }
    }

    /**
     * 清除選取的案場
     */
    clearProject() {
        const input = document.getElementById('projectSearchInput');
        const hiddenId = document.getElementById('selectedProjectId');
        const displayDiv = document.getElementById('selectedProjectDisplay');
        const inputGroup = input ? input.closest('.input-group') : null;

        if (hiddenId) hiddenId.value = '';
        if (input) {
            input.value = '';
        }
        
        if (inputGroup) inputGroup.style.display = 'flex';
        if (displayDiv) displayDiv.style.display = 'none';
    }

    /**
     * 處理圖片選擇
     */
    handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleImageFile(file);
        }
    }

    /**
     * 處理圖片檔案
     */
    handleImageFile(file) {
        // 驗證檔案類型
        if (!file.type.startsWith('image/')) {
            this.showToast('error', '檔案錯誤', '請選擇圖片檔案');
            return;
        }

        // 驗證檔案大小 (2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.showToast('error', '檔案過大', '圖片檔案大小不可超過 2MB');
            return;
        }

        // 預覽圖片
        const reader = new FileReader();
        reader.onload = (e) => {
            const imagePreview = document.getElementById('imagePreview');
            const uploadPlaceholder = document.getElementById('uploadPlaceholder');
            const removeImageBtn = document.getElementById('removeImageBtn');
            
            if (imagePreview && uploadPlaceholder) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                uploadPlaceholder.style.display = 'none';
                removeImageBtn.style.display = 'inline-flex';
            }
        };
        reader.readAsDataURL(file);
    }

    /**
     * 清除圖片預覽
     */
    clearImagePreview() {
        const imagePreview = document.getElementById('imagePreview');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const removeImageBtn = document.getElementById('removeImageBtn');
        const formImage = document.getElementById('formImage');
        
        if (imagePreview && uploadPlaceholder) {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
            uploadPlaceholder.style.display = 'flex';
            removeImageBtn.style.display = 'none';
            formImage.value = '';
        }
    }

    /**
     * 載入活動資料 (編輯模式)
     */
    loadEventData() {
        // 從 Mock 資料中找到對應的活動
        const event = SiteEventMockData.events.find(e => e.event_id === this.editingEventId);
        
        if (!event) {
            this.showToast('error', '錯誤', '找不到指定的活動資料');
            setTimeout(() => {
                window.location.href = 'site-event-list.html';
            }, 2000);
            return;
        }

        // 填入表單資料
        document.getElementById('formTitle').value = event.title || '';
        document.getElementById('formCategory').value = event.category || '';
        document.getElementById('formStartDt').value = event.start_dt ? event.start_dt.slice(0, 16) : '';
        document.getElementById('formEndDt').value = event.end_dt ? event.end_dt.slice(0, 16) : '';
        document.getElementById('formLocation').value = event.location || '';
        document.getElementById('formDescription').value = event.description || '';
        // 同步到編輯器
        const editorContent = document.getElementById('editorContent');
        if (editorContent) {
            editorContent.innerHTML = event.description || '';
        }
        document.getElementById('formMaxSlots').value = event.max_slots || 50;
        document.getElementById('formPrice').value = event.price || 0;
        document.getElementById('formDeadline').value = event.registration_deadline || '';
        document.getElementById('formMaxCompanion').value = event.max_companion || 0;
        document.getElementById('formRemindDays').value = event.remind_days_before || 3;
        document.getElementById('formNeedReceipt').checked = event.need_receipt || false;

        // 勾選適用案場 (支援舊資料格式：陣列)
        if (event.sites && event.sites.length > 0) {
            const siteName = event.sites[0]; // 只取第一個
            // 嘗試從 CRMMockData 取得物件以獲得完整資訊
             let project = null;
             if (typeof CRMMockData !== 'undefined' && CRMMockData.projects) {
                 project = CRMMockData.projects.find(p => p.name === siteName);
             }
             
             if (project) {
                 this.setProject(project);
             } else {
                 this.setProject({ name: siteName });
             }
        }
    }

    /**
     * 儲存活動
     */
    saveEvent() {
        // 同步編輯器內容到隱藏的 textarea
        const editorContent = document.getElementById('editorContent');
        const formDescription = document.getElementById('formDescription');
        if (editorContent && formDescription) {
            formDescription.value = editorContent.innerHTML;
        }

        // 驗證表單
        const form = document.getElementById('eventForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // 取得適用案場
        const selectedProjectName = document.getElementById('selectedProjectId').value;
        const selectedSites = selectedProjectName ? [selectedProjectName] : [];

        // 驗證至少選擇一個案場
        if (selectedSites.length === 0) {
            this.showToast('error', '錯誤', '請選擇適用案場');
            return;
        }

        // 驗證日期
        const startDt = document.getElementById('formStartDt').value;
        const endDt = document.getElementById('formEndDt').value;
        
        if (new Date(endDt) <= new Date(startDt)) {
            this.showToast('error', '日期錯誤', '結束時間必須晚於開始時間');
            return;
        }

        // 組合活動資料
        const eventData = {
            title: document.getElementById('formTitle').value,
            category: document.getElementById('formCategory').value,
            start_dt: startDt + ':00',
            end_dt: endDt + ':00',
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

        // 模擬儲存操作
        if (this.isEditMode) {
            // 更新現有活動
            const index = SiteEventMockData.events.findIndex(e => e.event_id === this.editingEventId);
            if (index !== -1) {
                SiteEventMockData.events[index] = { 
                    ...SiteEventMockData.events[index], 
                    ...eventData 
                };
            }
            console.log('更新活動:', eventData);
        } else {
            // 新增活動
            const newId = 'SE' + new Date().getFullYear() + String(SiteEventMockData.events.length + 1).padStart(3, '0');
            eventData.event_id = newId;
            eventData.created_by = 'admin';
            eventData.created_at = new Date().toISOString();
            SiteEventMockData.events.unshift(eventData);
            console.log('新增活動:', eventData);
        }

        // 顯示成功彈窗
        this.showSuccessModal();
    }

    /**
     * 顯示成功彈窗
     */
    showSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * 關閉成功彈窗
     */
    closeSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * 重置表單並繼續新增
     */
    resetAndNew() {
        this.closeSuccessModal();
        
        // 重置表單
        document.getElementById('eventForm').reset();
        
        // 清除案場選擇
        this.clearProject();
        
        // 清除圖片
        this.clearImagePreview();
        
        // 重新初始化日期
        this.initDateDefaults();
        
        // 如果是編輯模式，切換回新增模式
        if (this.isEditMode) {
            this.isEditMode = false;
            this.editingEventId = null;
            
            // 更新 URL（移除參數）
            window.history.replaceState({}, '', 'site-event-add.html');
            
            // 更新頁面標題
            document.getElementById('pageTitle').textContent = '新增活動';
            document.getElementById('formPageTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> 新增案場活動';
            document.title = '新增案場活動 - 陸府建設 CRM';
            
            // 更新成功訊息
            document.getElementById('successTitle').textContent = '新增成功';
            document.getElementById('successMessage').textContent = '活動已成功建立';
        }
        
        // 捲動到頁面頂部
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // 聚焦到第一個輸入框
        document.getElementById('formTitle').focus();
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

        // 5 秒後自動移除
        setTimeout(() => toast.remove(), 5000);
    }
}

// 全域變數
window.siteEventAddManager = null;

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    window.siteEventAddManager = new SiteEventAddManager();
});
