document.addEventListener('DOMContentLoaded', function() {
    // 渲染側邊欄
    if (typeof renderSidebar === 'function') {
        renderSidebar();
    }
    // 渲染共用元件 (Header + Sidebar)

    if (typeof initCRMLayout === 'function') {

        initCRMLayout();

    }

    

    const sidebarManager = new SidebarManager();

    // 取得 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const inspectionId = urlParams.get('id');
    const isEditMode = !!inspectionId;

    // 頁面標題調整
    if (isEditMode) {
        document.querySelector('.page-title').textContent = '編輯驗屋預約';
        document.querySelector('.breadcrumb-item.active').textContent = '編輯預約';
    } else {
        document.querySelector('.page-title').textContent = '新增驗屋預約';
        document.querySelector('.breadcrumb-item.active').textContent = '新增預約';
        
        // 新增模式隱藏：驗屋紀錄、上傳檔案、住戶簽名、留言版
        const sectionsToHide = ['sectionRecordInfo', 'sectionFileUpload', 'sectionSignature', 'sectionChat'];
        sectionsToHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
            }
        });
    }

    // 初始化表單元素
    const form = document.getElementById('inspectionEditForm');
    const projectSelect = document.getElementById('rProject');
    const unitSelect = document.getElementById('rUnit');
    const hasThirdPartyCheckbox = document.getElementById('rHasThirdParty');
    const thirdPartyCompanyInput = document.getElementById('rThirdPartyCompany');
    const thirdPartyCompanyRow = document.getElementById('thirdPartyCompanyRow');

    // 綁定事件
    bindEvents();
    
    // 如果是編輯模式，載入資料
    if (isEditMode) {
        loadInspectionData(inspectionId);
    }

    function bindEvents() {
        // 案場與戶別連動
        // 模擬資料
        const projectUnits = {
            '陸府原森': ['A棟10F', 'A棟11A', 'A棟12A', 'A棟12B', 'B棟5A', 'B棟8A', 'C棟3A'],
            '陸府觀微': ['A1-2F', 'A1-3F', 'A2-5F', 'A2-6F', 'B1-3F', 'B1-4F'],
            '陸府植森': ['1棟-2F', '1棟-3F', '2棟-5F', '2棟-6F', '3棟-2F', '3棟-3F']
        };

        projectSelect.addEventListener('change', function() {
            const project = this.value;
            unitSelect.innerHTML = '<option value="">請選擇戶別</option>';
            
            if (project && projectUnits[project]) {
                unitSelect.disabled = false;
                projectUnits[project].forEach(unit => {
                    unitSelect.add(new Option(unit, unit));
                });
            } else {
                unitSelect.disabled = true;
                unitSelect.innerHTML = '<option value="">請先選擇案場</option>';
            }
        });

        // 第三方驗屋公司連動
        hasThirdPartyCheckbox.addEventListener('change', function() {
            if (this.checked) {
                thirdPartyCompanyRow.style.display = 'block';
                thirdPartyCompanyInput.setAttribute('required', 'required');
            } else {
                thirdPartyCompanyRow.style.display = 'none';
                thirdPartyCompanyInput.removeAttribute('required');
                thirdPartyCompanyInput.value = ''; // 清空值
            }
        });

        // 快速填入按鈕
        document.querySelectorAll('.quick-fill-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = 'cCompletedNotes';
                const target = document.getElementById(targetId);
                if (target) {
                    const currentVal = target.value;
                    const text = this.dataset.text;
                    target.value = currentVal ? currentVal + '\n' + text : text;
                }
            });
        });

        // 檔案上傳預覽
        const fileInput = document.getElementById('fileUpload');
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                addFileToUploadList(file.name, file.size);
            });
        });

        // 初始化簽名板
        initSignatureCanvas();

        // 聊天室功能
        initChat();

        // 表單提交處理
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 驗證表單
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = {
                id: document.getElementById('inspectionId').value || Date.now(),
                project: projectSelect.value,
                unit: unitSelect.value,
                memberName: document.getElementById('rMemberName').value,
                phone: document.getElementById('rPhone').value,
                date: document.getElementById('rDate').value,
                timeSlot: document.getElementById('rTimeSlot').value,
                attendees: document.getElementById('rAttendees').value,
                hasThirdParty: hasThirdPartyCheckbox.checked,
                thirdPartyCompany: hasThirdPartyCheckbox.checked ? thirdPartyCompanyInput.value : '',
                remark: document.getElementById('rRemark').value,
                completedDate: document.getElementById('cCompletedDate').value,
                inspector: document.getElementById('cInspector').value,
                completedNotes: document.getElementById('cCompletedNotes').value
            };

            console.log('Saving reservation:', formData);
            
            alert('儲存成功！');
            window.location.href = 'reservation-inspection.html';
        });
    }

    function loadInspectionData(id) {
        console.log('Loading data for id:', id);
        
        // 模擬資料回填
        setTimeout(() => {
            projectSelect.value = '陸府原森';
            // 觸發 change 載入戶別
            projectSelect.dispatchEvent(new Event('change'));
            
            unitSelect.value = 'A棟10F';
            document.getElementById('rMemberName').value = '陳大文';
            document.getElementById('rPhone').value = '0912-345678';
            document.getElementById('rDate').value = '2025-01-20';
            document.getElementById('rTimeSlot').value = '09:00-12:00';
            document.getElementById('rAttendees').value = 2;
            
            // 模擬第三方驗屋
            if (id === '1' || id === 1) { 
                 hasThirdPartyCheckbox.checked = true;
                 hasThirdPartyCheckbox.dispatchEvent(new Event('change'));
                 thirdPartyCompanyInput.value = '安心驗屋股份有限公司';
                 
                 // 模擬已有紀錄
                 document.getElementById('cCompletedDate').value = '2025-01-20';
                 document.getElementById('cInspector').value = '李工程師';
                 document.getElementById('cCompletedNotes').value = '初驗完成，有些許缺失需改善。';
                 
                 // 模擬已上傳檔案
                 addFileToUploadList('驗屋報告_初驗.pdf', 2500000);
                 addFileToUploadList('客廳牆面龜裂.jpg', 1200000);
            }
            
            document.getElementById('inspectionId').value = id;
        }, 100);
    }

    function addFileToUploadList(name, size) {
        const uploadList = document.getElementById('uploadList');
        const item = document.createElement('div');
        item.className = 'upload-item';
        item.innerHTML = `
            <div class="file-info">
                <i class="fa-regular fa-file"></i>
                <span class="file-name">${name}</span>
                <span class="file-size">(${formatBytes(size)})</span>
            </div>
            <button type="button" class="btn-remove-file"><i class="fa-solid fa-xmark"></i></button>
        `;
        
        item.querySelector('.btn-remove-file').addEventListener('click', function() {
            item.remove();
        });
        
        uploadList.appendChild(item);
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function initSignatureCanvas() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const placeholder = document.getElementById('signaturePlaceholder');
        let isDrawing = false;

        // 取得相關元素
        const signatureArea = document.getElementById('signatureArea');
        const skipSignatureCheckbox = document.getElementById('skipSignature');
        const clearBtn = document.getElementById('btnClearSign');
        const confirmBtn = document.getElementById('btnConfirmSign');
        const overlay = document.getElementById('signatureDisabledOverlay');

        // 「此次無需簽名」核取方塊功能
        if (skipSignatureCheckbox) {
            skipSignatureCheckbox.addEventListener('change', function() {
                const isSkipped = this.checked;
                
                if (isSkipped) {
                    // 停用簽名區域
                    if (signatureArea) signatureArea.classList.add('disabled');
                    // 顯示遮罩層
                    if (overlay) overlay.style.display = 'flex';
                    // 停用按鈕
                    if (clearBtn) clearBtn.disabled = true;
                    if (confirmBtn) confirmBtn.disabled = true;
                    // 清除已有簽名
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // 隱藏提示文字
                    if (placeholder) placeholder.style.display = 'none';
                } else {
                    // 啟用簽名區域
                    if (signatureArea) signatureArea.classList.remove('disabled');
                    // 隱藏遮罩層
                    if (overlay) overlay.style.display = 'none';
                    // 啟用按鈕
                    if (clearBtn) clearBtn.disabled = false;
                    if (confirmBtn) confirmBtn.disabled = false;
                    // 顯示提示文字
                    if (placeholder) placeholder.style.display = 'block';
                }
            });
            
            // 初始化時觸發一次，以處理預設勾選狀態
            skipSignatureCheckbox.dispatchEvent(new Event('change'));
        }
        
        // 設定 Canvas 大小 (需等待容器渲染完成)
        function resizeCanvas() {
            const parent = canvas.parentElement;
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        // Delay initial resize to ensure DOM is ready
        setTimeout(resizeCanvas, 100);

        // 繪圖事件
        function startDraw(e) {
            // 檢查是否已標記為無需簽名
            if (skipSignatureCheckbox && skipSignatureCheckbox.checked) return;
            
            isDrawing = true;
            placeholder.style.display = 'none';
            ctx.beginPath();
            ctx.moveTo(getX(e), getY(e));
        }

        function draw(e) {
            if (!isDrawing) return;
            ctx.lineTo(getX(e), getY(e));
            ctx.stroke();
        }

        function endDraw() {
            isDrawing = false;
        }

        function getX(e) {
            const rect = canvas.getBoundingClientRect();
            return (e.clientX || e.touches[0].clientX) - rect.left;
        }

        function getY(e) {
            const rect = canvas.getBoundingClientRect();
            return (e.clientY || e.touches[0].clientY) - rect.top;
        }

        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', endDraw);
        canvas.addEventListener('mouseout', endDraw);

        canvas.addEventListener('touchstart', startDraw);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', endDraw);

        // 按鈕事件
        document.getElementById('btnClearSign').addEventListener('click', function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            placeholder.style.display = 'block';
        });

        document.getElementById('btnConfirmSign').addEventListener('click', function() {
            // 簡單檢查是否有內容 (透過是否隱藏 placeholder 判定是比較寬鬆的做法，嚴謹可用 getImageData 檢查像素)
            if (placeholder.style.display !== 'none') {
                alert('請先進行簽名');
                return;
            }
            alert('簽名已確認');
            // 可以將 canvas.toDataURL() 存入 hidden input
        });
    }

    function initChat() {
        const btnSend = document.getElementById('btnSendMessage');
        const chatInput = document.getElementById('chatInput');
        const chatFileInput = document.getElementById('chatFileInput');
        const chatMessages = document.getElementById('chatMessages');
        
        if (!btnSend || !chatInput || !chatMessages) return;

        btnSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        const btnAttach = document.getElementById('btnAttachFile');
        if (btnAttach) {
            btnAttach.addEventListener('click', function() {
                if (chatFileInput) chatFileInput.click();
            });
        }

        if (chatFileInput) {
            chatFileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    appendFileMessage(file, 'right', '系統管理員');
                    this.value = ''; // Reset
                }
            });
        }

        function sendMessage() {
            const text = chatInput.value.trim();
            if (text) {
                appendMessage(text, 'right', '系統管理員'); // 假設操作者是管理員
                chatInput.value = '';
            }
        }

        function appendMessage(text, side, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message message-${side}`;
            msgDiv.innerHTML = `
                <div class="message-content">${text}</div>
                <div class="message-info">${sender} ${new Date().toLocaleString()}</div>
            `;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function appendFileMessage(file, side, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message message-${side}`;
            
            let contentHtml = '';
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                contentHtml = `
                    <div class="message-media">
                        <img src="${url}" alt="${file.name}" class="media-image" style="max-width: 200px; border-radius: 8px;">
                    </div>`;
            } else {
                contentHtml = `
                    <div class="message-file">
                        <i class="fa-solid fa-file"></i>
                        <span class="file-name">${file.name}</span>
                    </div>`;
            }

            msgDiv.innerHTML = `
                ${contentHtml}
                <div class="message-info">${sender} ${new Date().toLocaleString()}</div>
            `;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
});
