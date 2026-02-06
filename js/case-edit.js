/**
 * 個案單編輯頁面 JavaScript
 * case-edit.js
 * 
 * 功能說明：
 * - 頁籤切換功能
 * - 表單資料載入與儲存
 * - 快速填入功能
 * - 檔案上傳功能
 * - 簽名功能
 * - 進度更新彈窗
 * - 刪除確認彈窗
 */

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // 初始化
    // ========================================
    
    // 側邊欄管理
    if (typeof SidebarManager !== 'undefined') {
        // 渲染共用元件 (Header + Sidebar)

        if (typeof initCRMLayout === 'function') {

            initCRMLayout();

        }

        

        const sidebarManager = new SidebarManager();
    }
    
    // ========================================
    // 頁籤切換功能
    // ========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // 移除所有 active 狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 設定當前頁籤為 active
            this.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
    
    // ========================================
    // 快速填入功能
    // ========================================
    const quickFillButtons = document.querySelectorAll('.quick-fill-btn');
    const completedNotesTextarea = document.getElementById('cCompletedNotes');
    
    quickFillButtons.forEach(button => {
        button.addEventListener('click', function() {
            const text = this.dataset.text;
            if (completedNotesTextarea) {
                completedNotesTextarea.value = text;
                completedNotesTextarea.focus();
            }
        });
    });
    
    // ========================================
    // 檔案上傳功能
    // ========================================
    const fileUpload = document.getElementById('fileUpload');
    const uploadList = document.getElementById('uploadList');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    let uploadedFiles = [];
    
    if (fileUpload) {
        fileUpload.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            
            files.forEach(file => {
                // 檢查檔案大小 (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`檔案 "${file.name}" 超過 5MB 限制`);
                    return;
                }
                
                // 加入檔案列表
                uploadedFiles.push(file);
                renderUploadList();
            });
            
            // 更新提示文字
            updateUploadPlaceholder();
            
            // 清空 input 以便重複上傳相同檔案
            fileUpload.value = '';
        });
    }
    
    /**
     * 渲染上傳檔案列表
     */
    function renderUploadList() {
        if (!uploadList) return;
        
        uploadList.innerHTML = '';
        
        uploadedFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'upload-item';
            
            // 如果是圖片則顯示縮圖
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = item.querySelector('img');
                    if (img) {
                        img.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
                
                item.innerHTML = `
                    <img src="" alt="${file.name}">
                    <span class="file-name">${file.name}</span>
                    <button type="button" class="btn-remove" data-index="${index}">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                `;
            } else {
                item.innerHTML = `
                    <i class="fa-solid fa-file-video"></i>
                    <span class="file-name">${file.name}</span>
                    <button type="button" class="btn-remove" data-index="${index}">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                `;
            }
            
            uploadList.appendChild(item);
        });
        
        // 綁定移除事件
        const removeButtons = uploadList.querySelectorAll('.btn-remove');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                uploadedFiles.splice(index, 1);
                renderUploadList();
                updateUploadPlaceholder();
            });
        });
    }
    
    /**
     * 更新上傳提示文字
     */
    function updateUploadPlaceholder() {
        if (!uploadPlaceholder) return;
        
        if (uploadedFiles.length > 0) {
            uploadPlaceholder.textContent = `已選擇 ${uploadedFiles.length} 個檔案`;
        } else {
            uploadPlaceholder.textContent = '未選擇任何檔案';
        }
    }
    
    // ========================================
    // 簽名功能
    // ========================================
    const signatureCanvas = document.getElementById('signatureCanvas');
    const signaturePlaceholder = document.getElementById('signaturePlaceholder');
    const btnClearSign = document.getElementById('btnClearSign');
    const btnConfirmSign = document.getElementById('btnConfirmSign');
    const signatureArea = document.getElementById('signatureArea');
    const skipSignatureCheckbox = document.getElementById('skipSignature');
    const signatureDisabledOverlay = document.getElementById('signatureDisabledOverlay');
    
    let isDrawing = false;
    let signatureCtx = null;
    let hasSignature = false;

    // 「此次無需簽名」核取方塊功能
    if (skipSignatureCheckbox) {
        skipSignatureCheckbox.addEventListener('change', function() {
            const isSkipped = this.checked;
            
            if (isSkipped) {
                // 停用簽名區域
                if (signatureArea) signatureArea.classList.add('disabled');
                // 顯示遮罩層
                if (signatureDisabledOverlay) signatureDisabledOverlay.style.display = 'flex';
                // 停用按鈕
                if (btnClearSign) btnClearSign.disabled = true;
                if (btnConfirmSign) btnConfirmSign.disabled = true;
                // 清除已有簽名
                if (signatureCtx && signatureCanvas) {
                    const dpr = window.devicePixelRatio || 1;
                    signatureCtx.clearRect(0, 0, signatureCanvas.width / dpr, signatureCanvas.height / dpr);
                    hasSignature = false;
                }
                // 隱藏提示文字
                if (signaturePlaceholder) signaturePlaceholder.classList.add('hidden');
            } else {
                // 啟用簽名區域
                if (signatureArea) signatureArea.classList.remove('disabled');
                // 隱藏遮罩層
                if (signatureDisabledOverlay) signatureDisabledOverlay.style.display = 'none';
                // 啟用按鈕
                if (btnClearSign) btnClearSign.disabled = false;
                if (btnConfirmSign) btnConfirmSign.disabled = false;
                // 顯示提示文字
                if (signaturePlaceholder) signaturePlaceholder.classList.remove('hidden');
            }
        });
        
        // 初始化時觸發一次，以處理預設勾選狀態
        skipSignatureCheckbox.dispatchEvent(new Event('change'));
    }
    
    if (signatureCanvas) {
        signatureCtx = signatureCanvas.getContext('2d');
        
        // 調整 canvas 尺寸以符合容器
        function resizeCanvas() {
            const container = signatureCanvas.parentElement;
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            // 設定實際畫布大小
            signatureCanvas.width = rect.width * dpr;
            signatureCanvas.height = 200 * dpr;
            
            // 設定 CSS 顯示大小
            signatureCanvas.style.width = rect.width + 'px';
            signatureCanvas.style.height = '200px';
            
            // 縮放繪圖上下文
            signatureCtx.scale(dpr, dpr);
            
            // 設定繪圖樣式
            signatureCtx.strokeStyle = '#000';
            signatureCtx.lineWidth = 2;
            signatureCtx.lineCap = 'round';
            signatureCtx.lineJoin = 'round';
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // 取得滑鼠/觸控位置
        function getPosition(e) {
            const rect = signatureCanvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            return { x, y };
        }
        
        // 開始繪製
        function startDrawing(e) {
            // 檢查是否已標記為無需簽名
            if (skipSignatureCheckbox && skipSignatureCheckbox.checked) return;
            
            e.preventDefault();
            isDrawing = true;
            hasSignature = true;
            
            if (signaturePlaceholder) {
                signaturePlaceholder.classList.add('hidden');
            }
            
            const pos = getPosition(e);
            signatureCtx.beginPath();
            signatureCtx.moveTo(pos.x, pos.y);
        }
        
        // 繪製中
        function draw(e) {
            if (!isDrawing) return;
            e.preventDefault();
            
            const pos = getPosition(e);
            signatureCtx.lineTo(pos.x, pos.y);
            signatureCtx.stroke();
        }
        
        // 結束繪製
        function stopDrawing() {
            isDrawing = false;
        }
        
        // 滑鼠事件
        signatureCanvas.addEventListener('mousedown', startDrawing);
        signatureCanvas.addEventListener('mousemove', draw);
        signatureCanvas.addEventListener('mouseup', stopDrawing);
        signatureCanvas.addEventListener('mouseleave', stopDrawing);
        
        // 觸控事件
        signatureCanvas.addEventListener('touchstart', startDrawing);
        signatureCanvas.addEventListener('touchmove', draw);
        signatureCanvas.addEventListener('touchend', stopDrawing);
    }
    
    // 清除簽名
    if (btnClearSign) {
        btnClearSign.addEventListener('click', function() {
            if (signatureCtx && signatureCanvas) {
                const dpr = window.devicePixelRatio || 1;
                signatureCtx.clearRect(0, 0, signatureCanvas.width / dpr, signatureCanvas.height / dpr);
                hasSignature = false;
                
                if (signaturePlaceholder) {
                    signaturePlaceholder.classList.remove('hidden');
                }
            }
        });
    }
    
    // 確認簽名
    if (btnConfirmSign) {
        btnConfirmSign.addEventListener('click', function() {
            if (!hasSignature) {
                alert('請先進行簽名');
                return;
            }
            
            // 取得簽名圖片 (Base64)
            const signatureData = signatureCanvas.toDataURL('image/png');
            console.log('簽名資料:', signatureData);
            alert('簽名已確認');
        });
    }
    
    // ========================================
    // 進度更新彈窗
    // ========================================
    const btnProgressUpdate = document.getElementById('btnProgressUpdate');
    const progressModal = document.getElementById('progressModal');
    const progressModalBackdrop = document.getElementById('progressModalBackdrop');
    const progressModalClose = document.getElementById('progressModalClose');
    const progressModalCancel = document.getElementById('progressModalCancel');
    const progressModalConfirm = document.getElementById('progressModalConfirm');
    
    function openProgressModal() {
        if (progressModal && progressModalBackdrop) {
            progressModal.classList.add('active');
            progressModalBackdrop.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }
    
    function closeProgressModal() {
        if (progressModal && progressModalBackdrop) {
            progressModal.classList.remove('active');
            progressModalBackdrop.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }
    
    if (btnProgressUpdate) {
        btnProgressUpdate.addEventListener('click', openProgressModal);
    }
    
    if (progressModalClose) {
        progressModalClose.addEventListener('click', closeProgressModal);
    }
    
    if (progressModalCancel) {
        progressModalCancel.addEventListener('click', closeProgressModal);
    }
    
    if (progressModalBackdrop) {
        progressModalBackdrop.addEventListener('click', closeProgressModal);
    }
    
    if (progressModalConfirm) {
        progressModalConfirm.addEventListener('click', function() {
            const progressSelect = document.getElementById('progressSelect');
            const progressNote = document.getElementById('progressNote');
            
            if (progressSelect) {
                const selectedValue = progressSelect.value;
                const selectedText = progressSelect.options[progressSelect.selectedIndex].text;
                
                console.log('進度更新:', selectedText, progressNote?.value);
                
                // 更新頁面顯示
                const milestoneStep = document.querySelector('.milestone-step');
                if (milestoneStep) {
                    milestoneStep.textContent = selectedText;
                }
                
                alert('進度已更新');
                closeProgressModal();
            }
        });
    }
    
    // ========================================
    // 刪除確認彈窗
    // ========================================
    const btnDelete = document.getElementById('btnDelete');
    const deleteModal = document.getElementById('deleteModal');
    const deleteModalBackdrop = document.getElementById('deleteModalBackdrop');
    const deleteModalClose = document.getElementById('deleteModalClose');
    const deleteModalCancel = document.getElementById('deleteModalCancel');
    const deleteModalConfirm = document.getElementById('deleteModalConfirm');
    
    function openDeleteModal() {
        if (deleteModal && deleteModalBackdrop) {
            deleteModal.classList.add('active');
            deleteModalBackdrop.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }
    
    function closeDeleteModal() {
        if (deleteModal && deleteModalBackdrop) {
            deleteModal.classList.remove('active');
            deleteModalBackdrop.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }
    
    if (btnDelete) {
        btnDelete.addEventListener('click', openDeleteModal);
    }
    
    if (deleteModalClose) {
        deleteModalClose.addEventListener('click', closeDeleteModal);
    }
    
    if (deleteModalCancel) {
        deleteModalCancel.addEventListener('click', closeDeleteModal);
    }
    
    if (deleteModalBackdrop) {
        deleteModalBackdrop.addEventListener('click', closeDeleteModal);
    }
    
    if (deleteModalConfirm) {
        deleteModalConfirm.addEventListener('click', function() {
            console.log('確認刪除個案單');
            alert('個案單已刪除');
            closeDeleteModal();
            // 返回列表頁
            window.location.href = 'case-list.html';
        });
    }
    
    // ========================================
    // 儲存功能
    // ========================================
    const btnSaveTop = document.getElementById('btnSaveTop');
    const btnSaveBottom = document.getElementById('btnSaveBottom');
    
    function saveCase() {
        // 收集表單資料
        const formData = {
            caseNo: document.getElementById('cCaseNo')?.value,
            status: document.getElementById('cStatus')?.value,
            project: document.getElementById('cProject')?.value,
            houseId: document.getElementById('cHouseId')?.value,
            caseType: document.getElementById('cCaseType')?.value,
            applicant: document.getElementById('cApplicant')?.value,
            subject: document.getElementById('cSubject')?.value,
            description: document.getElementById('cDescription')?.value,
            urgent: document.getElementById('cUrgent')?.checked,
            completedDate: document.getElementById('cCompletedDate')?.value,
            completedNotes: document.getElementById('cCompletedNotes')?.value,
            isNotSendQuestionnaire: document.getElementById('cIsNotSendQuestionnaire')?.checked
        };
        
        console.log('儲存資料:', formData);
        alert('資料已儲存');
    }
    
    if (btnSaveTop) {
        btnSaveTop.addEventListener('click', saveCase);
    }
    
    if (btnSaveBottom) {
        btnSaveBottom.addEventListener('click', saveCase);
    }
    
    // ========================================
    // 轉換功能
    // ========================================
    const btnConvert = document.getElementById('btnConvert');
    
    function convertCase() {
        console.log('轉換個案單');
        alert('個案單轉換功能');
    }
    
    if (btnConvert) {
        btnConvert.addEventListener('click', convertCase);
    }

    // ========================================
    // 線上對話功能
    // ========================================
    const chatContainer = document.getElementById('chatContainer');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const btnSendMessage = document.getElementById('btnSendMessage');
    const btnAttachFile = document.getElementById('btnAttachFile');
    const chatFileInput = document.getElementById('chatFileInput');

    /**
     * 取得當前時間格式字串
     * @returns {string} 格式化的時間字串
     */
    function getCurrentTimeString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        
        return `${year}/${month}/${day} ${displayHours}:${minutes} ${ampm}`;
    }

    /**
     * 新增訊息到對話區域
     * @param {string} content - 訊息內容
     * @param {string} type - 訊息類型 ('user' | 'admin')
     * @param {Object} options - 額外選項（檔案資訊等）
     */
    function addMessage(content, type = 'user', options = {}) {
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type === 'user' ? 'message-right' : 'message-left'}`;

        let html = '';

        // 訊息內容
        if (content) {
            html += `<div class="message-content">${escapeHtml(content)}</div>`;
        }

        // 附加檔案（圖片/影片/其他）
        if (options.file) {
            const fileName = options.file.name;
            const fileType = options.file.type || '';
            const fileUrl = options.fileUrl || URL.createObjectURL(options.file);
            
            // 判斷檔案類型
            if (fileType.startsWith('image/')) {
                // 圖片附件
                html += `
                    <div class="message-media">
                        <img src="${fileUrl}" alt="${escapeHtml(fileName)}" class="media-image" data-full-src="${fileUrl}">
                    </div>
                `;
            } else if (fileType.startsWith('video/')) {
                // 影片附件
                html += `
                    <div class="message-media">
                        <video controls class="media-video" preload="metadata">
                            <source src="${fileUrl}" type="${fileType}">
                            您的瀏覽器不支援影片播放
                        </video>
                    </div>
                `;
            } else {
                // 一般檔案附件
                const fileIcon = getFileIcon(fileName);
                html += `
                    <div class="message-file">
                        <i class="${fileIcon} file-icon"></i>
                        <span class="file-name">${escapeHtml(fileName)}</span>
                        <button class="file-download" title="下載檔案">
                            <i class="fa-solid fa-download"></i>
                        </button>
                    </div>
                `;
            }
        }

        // 時間資訊
        const timeString = getCurrentTimeString();
        if (type === 'user') {
            html += `<div class="message-time">${timeString}</div>`;
        } else {
            const sender = options.sender || '客服人員';
            html += `<div class="message-info">${sender} ${timeString}</div>`;
        }

        messageDiv.innerHTML = html;
        chatMessages.appendChild(messageDiv);

        // 為新增的圖片綁定燈箱事件
        const newImage = messageDiv.querySelector('.media-image');
        if (newImage) {
            newImage.addEventListener('click', function() {
                openImageLightbox(this.src, this.alt);
            });
        }

        // 捲動到最新訊息
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * 根據檔案名稱取得對應的圖示 class
     * @param {string} fileName - 檔案名稱
     * @returns {string} Font Awesome 圖示 class
     */
    function getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': 'fa-solid fa-file-pdf',
            'doc': 'fa-solid fa-file-word',
            'docx': 'fa-solid fa-file-word',
            'xls': 'fa-solid fa-file-excel',
            'xlsx': 'fa-solid fa-file-excel',
            'ppt': 'fa-solid fa-file-powerpoint',
            'pptx': 'fa-solid fa-file-powerpoint',
            'zip': 'fa-solid fa-file-zipper',
            'rar': 'fa-solid fa-file-zipper',
            'txt': 'fa-solid fa-file-lines'
        };
        return iconMap[ext] || 'fa-solid fa-file';
    }

    /**
     * HTML 跳脫處理
     * @param {string} text - 原始文字
     * @returns {string} 跳脫後的文字
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 發送訊息
     */
    function sendMessage() {
        if (!chatInput) return;

        const message = chatInput.value.trim();
        const hasFile = pendingFile !== null;
        
        // 必須有訊息或檔案才能發送
        if (!message && !hasFile) return;

        // 新增用戶訊息
        if (hasFile) {
            addMessage(message, 'user', { file: pendingFile });
            clearPendingFile();
        } else {
            addMessage(message, 'user');
        }

        // 清空輸入框
        chatInput.value = '';
        chatInput.focus();

        // 這裡可以呼叫 API 發送訊息到後端
        console.log('發送訊息:', message);
    }

    // 待上傳的檔案
    let pendingFile = null;

    /**
     * 顯示檔案預覽
     * @param {File} file - 檔案物件
     */
    function showFilePreview(file) {
        const chatInputArea = document.querySelector('.chat-input-area');
        if (!chatInputArea) return;

        // 移除現有的預覽
        clearPendingFile();

        // 儲存待上傳檔案
        pendingFile = file;

        // 建立預覽元素
        const preview = document.createElement('div');
        preview.className = 'chat-file-preview';
        preview.innerHTML = `
            <i class="fa-solid fa-file"></i>
            <span class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
            <button type="button" class="remove-file" title="移除檔案">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        // 移除按鈕事件
        preview.querySelector('.remove-file').addEventListener('click', function() {
            clearPendingFile();
        });

        // 插入到輸入框前面
        chatInputArea.insertBefore(preview, chatInput);
    }

    /**
     * 清除待上傳的檔案
     */
    function clearPendingFile() {
        pendingFile = null;
        const existingPreview = document.querySelector('.chat-file-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        if (chatFileInput) {
            chatFileInput.value = '';
        }
    }

    // 發送按鈕點擊事件
    if (btnSendMessage) {
        btnSendMessage.addEventListener('click', sendMessage);
    }

    // 輸入框 Enter 鍵發送
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // 附加檔案按鈕
    if (btnAttachFile && chatFileInput) {
        btnAttachFile.addEventListener('click', function() {
            chatFileInput.click();
        });

        chatFileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            
            if (files.length > 0) {
                const file = files[0]; // 一次只處理一個檔案
                
                // 檢查檔案大小 (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`檔案 "${file.name}" 超過 5MB 限制`);
                    chatFileInput.value = '';
                    return;
                }

                // 顯示檔案預覽
                showFilePreview(file);

                // 這裡可以呼叫 API 上傳檔案到後端
                console.log('選擇檔案:', file.name);
            }
        });
    }

    // 初始化時捲動到最新訊息
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ========================================
    // 圖片燈箱功能
    // ========================================
    let lightboxElement = null;

    /**
     * 建立圖片燈箱元素
     */
    function createLightbox() {
        if (lightboxElement) return lightboxElement;

        lightboxElement = document.createElement('div');
        lightboxElement.className = 'image-lightbox';
        lightboxElement.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" title="關閉">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <img src="" alt="">
                <button class="lightbox-download" title="下載圖片">
                    <i class="fa-solid fa-download"></i>
                    <span>下載圖片</span>
                </button>
            </div>
        `;

        // 關閉按鈕事件
        lightboxElement.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

        // 下載按鈕事件
        lightboxElement.querySelector('.lightbox-download').addEventListener('click', function() {
            const img = lightboxElement.querySelector('img');
            if (img.src) {
                const link = document.createElement('a');
                link.href = img.src;
                link.download = img.alt || '圖片';
                link.click();
            }
        });

        // 點擊背景關閉
        lightboxElement.addEventListener('click', function(e) {
            if (e.target === lightboxElement) {
                closeLightbox();
            }
        });

        // ESC 鍵關閉
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightboxElement.classList.contains('active')) {
                closeLightbox();
            }
        });

        document.body.appendChild(lightboxElement);
        return lightboxElement;
    }

    /**
     * 開啟圖片燈箱
     * @param {string} src - 圖片來源
     * @param {string} alt - 圖片描述
     */
    function openImageLightbox(src, alt) {
        const lightbox = createLightbox();
        const img = lightbox.querySelector('img');
        img.src = src;
        img.alt = alt || '圖片';
        
        // 顯示燈箱
        requestAnimationFrame(() => {
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    /**
     * 關閉圖片燈箱
     */
    function closeLightbox() {
        if (lightboxElement) {
            lightboxElement.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // 為現有的圖片綁定燈箱事件
    const existingImages = document.querySelectorAll('.media-image');
    existingImages.forEach(img => {
        img.addEventListener('click', function() {
            const fullSrc = this.dataset.fullSrc || this.src;
            openImageLightbox(fullSrc, this.alt);
        });
    });

    // ========================================
    // 附件區塊互動功能
    // ========================================
    
    // 為附件圖片綁定檢視事件
    const attachmentImages = document.querySelectorAll('.attachment-image');
    attachmentImages.forEach(img => {
        img.addEventListener('click', function() {
            const fullSrc = this.dataset.fullSrc || this.src;
            openImageLightbox(fullSrc, this.alt);
        });
    });

    // 為附件檢視按鈕綁定事件
    const viewButtons = document.querySelectorAll('.attachment-item .view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.attachment-item');
            const img = item.querySelector('.attachment-image');
            if (img) {
                const fullSrc = img.dataset.fullSrc || img.src;
                openImageLightbox(fullSrc, img.alt);
            }
        });
    });

    // 為附件下載按鈕綁定事件
    const attachmentDownloadBtns = document.querySelectorAll('.attachment-item .download-btn');
    attachmentDownloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.attachment-item');
            const nameEl = item.querySelector('.attachment-name');
            const fileName = nameEl ? nameEl.textContent : '附件';
            
            // 取得檔案來源
            const img = item.querySelector('.attachment-image');
            const video = item.querySelector('.attachment-video-player source');
            const src = img ? (img.dataset.fullSrc || img.src) : (video ? video.src : '');
            
            if (src) {
                const link = document.createElement('a');
                link.href = src;
                link.download = fileName;
                link.click();
            } else {
                alert('檔案下載功能開發中');
            }
        });
    });

    // 為影片播放按鈕綁定事件
    const playButtons = document.querySelectorAll('.attachment-item .play-btn');
    playButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.attachment-item');
            const video = item.querySelector('.attachment-video-player');
            const cover = item.querySelector('.video-cover');
            
            if (video && video.src) {
                // 有實際影片來源時播放
                cover.style.display = 'none';
                video.controls = true;
                video.play();
            } else {
                // 無影片來源時提示
                alert('影片播放功能開發中');
            }
        });
    });

    // 為影片封面綁定點擊事件
    const videCovers = document.querySelectorAll('.video-cover');
    videCovers.forEach(cover => {
        cover.addEventListener('click', function() {
            const item = this.closest('.attachment-item');
            const playBtn = item.querySelector('.play-btn');
            if (playBtn) {
                playBtn.click();
            }
        });
    });
    
    // ========================================
    // 星級評分顯示（唯讀）
    // ========================================
    const starRatings = document.querySelectorAll('.star-rating');
    
    starRatings.forEach(rating => {
        const currentRating = parseInt(rating.dataset.rating) || 0;
        const stars = rating.querySelectorAll('i');
        
        stars.forEach((star, index) => {
            if (index < currentRating) {
                star.classList.remove('fa-regular');
                star.classList.add('fa-solid');
            }
        });
    });
    
    // ========================================
    // 頁面載入時設定預設值
    // ========================================
    // 這裡可以根據 URL 參數載入個案單資料
    const urlParams = new URLSearchParams(window.location.search);
    const caseId = urlParams.get('id');
    
    if (caseId) {
        console.log('載入個案單:', caseId);
        // 這裡可以透過 API 載入資料
    }
});
