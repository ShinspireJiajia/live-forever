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

    // 案場與戶別連動資料
    const projectUnits = {
        '陸府原森': ['A棟10F', 'A棟11A', 'A棟12A', 'A棟12B', 'B棟5A', 'B棟8A', 'C棟3A', 'A棟8F', 'B棟12F'],
        '陸府觀微': ['A1-2F', 'A1-3F', 'A2-5F', 'A2-6F', 'B1-3F', 'B1-4F', 'C棟5F'],
        '陸府植森': ['1棟-2F', '1棟-3F', '2棟-5F', '2棟-6F', '3棟-2F', '3棟-3F']
    };

    // 用於存放已上傳的圖片
    let uploadedImages = [];

    // 取得 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') ? parseInt(urlParams.get('id')) : null;

    // 初始化表單
    initForm(id);

    // 綁定事件
    bindEvents();

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

    function initForm(id) {
        if (!id) {
            // 新增模式
            document.title = '新增客變預約 - 陸府建設 CRM';
            document.querySelector('.page-title').textContent = '新增客變預約';
            document.querySelector('.breadcrumb-item.active').textContent = '新增預約';
            // 可以設定一些預設值
            document.getElementById('rAttendees').value = 1;
            document.getElementById('rPaymentStatus').value = '待繳費';
            
            // 新增時，繳費資訊欄位設定為唯讀/停用 (需配合戶別連動帶入)
            document.getElementById('rCustomChangeFee').disabled = true;
            document.getElementById('rPaymentDeadline').disabled = true;
            document.getElementById('rPaymentAccount').disabled = true;

            // 新增模式下隱藏以下區塊：紀錄資訊、上傳檔案、住戶簽名確認、留言板
            // 這些功能僅在編輯模式下顯示
            const sectionRecordInfo = document.getElementById('sectionRecordInfo');
            const sectionFileUpload = document.getElementById('sectionFileUpload');
            const sectionSignature = document.getElementById('sectionSignature');
            const sectionChat = document.getElementById('sectionChat');
            
            if (sectionRecordInfo) sectionRecordInfo.style.display = 'none';
            if (sectionFileUpload) sectionFileUpload.style.display = 'none';
            if (sectionSignature) sectionSignature.style.display = 'none';
            if (sectionChat) sectionChat.style.display = 'none';
            return;
        }

        // 編輯模式：從 CRMMockData 載入資料
        const item = CRMMockData.getById('customReservations', id);
        if (!item) {
            alert('查無資料');
            window.location.href = 'reservation-custom.html';
            return;
        }

        document.getElementById('customId').value = item.id;
        document.getElementById('rProject').value = item.projectName;
        
        // 手動載入戶別選項
        const unitSelect = document.getElementById('rUnit');
        unitSelect.innerHTML = '';
        if (item.projectName && projectUnits[item.projectName]) {
            unitSelect.disabled = false;
            unitSelect.innerHTML = '<option value="">請選擇戶別</option>';
            projectUnits[item.projectName].forEach(function(unit) {
                const option = document.createElement('option');
                option.value = unit;
                option.textContent = unit;
                unitSelect.appendChild(option);
            });
        }
        
        // 確保戶別選項存在
        if (item.unitName) {
            let hasOption = false;
            for (let i = 0; i < unitSelect.options.length; i++) {
                if (unitSelect.options[i].value === item.unitName) {
                    hasOption = true;
                    break;
                }
            }
            if (!hasOption) {
                const newOpt = document.createElement('option');
                newOpt.value = item.unitName;
                newOpt.textContent = item.unitName;
                unitSelect.appendChild(newOpt);
            }
            unitSelect.value = item.unitName;
        }
        
        document.getElementById('rMemberName').value = item.memberName;
        document.getElementById('rPhone').value = item.phone;
        document.getElementById('rDate').value = item.reservationDate || '';
        document.getElementById('rTimeSlot').value = item.timeSlot || '';
        document.getElementById('rAttendees').value = item.attendees || 1;
        document.getElementById('rHasDesigner').checked = item.hasDesigner || false;
        document.getElementById('rChangeDescription').value = item.changeDescription || '';
        document.getElementById('rRemark').value = item.remark || '';
        document.getElementById('rPaymentStatus').value = item.paymentStatus || '待繳費';
        document.getElementById('rCustomChangeFee').value = item.customChangeFee || '';
        document.getElementById('rPaymentDeadline').value = item.paymentDeadline || '';
        document.getElementById('rPaymentAccount').value = item.paymentAccount || '';

        // 載入紀錄資訊
        if (document.getElementById('cCompletedDate')) {
            document.getElementById('cCompletedDate').value = item.completedDate || '';
        }
        if (document.getElementById('cCompletedNotes')) {
            document.getElementById('cCompletedNotes').value = item.completedNotes || '';
        }

        // 編輯模式：設定不可編輯的欄位
        document.getElementById('rProject').disabled = true;
        unitSelect.disabled = true;
        document.getElementById('rMemberName').readOnly = true;
        document.getElementById('rPhone').readOnly = true;
        
        // 繳費資訊僅能修改繳費狀態，其餘欄位鎖定
        document.getElementById('rCustomChangeFee').disabled = true;
        document.getElementById('rPaymentDeadline').disabled = true;
        document.getElementById('rPaymentAccount').disabled = true;

        // 顯示已上傳檔案
        if (item.attachments && item.attachments.length > 0) {
            item.attachments.forEach(file => {
                addFileToUploadList(file.name, file.size);
            });
        }

        // 載入已上傳的圖片
        if (item.uploadedImages && Array.isArray(item.uploadedImages)) {
            uploadedImages = [...item.uploadedImages];
        }
    }

    function bindEvents() {
        // 案場與戶別連動
        document.getElementById('rProject').addEventListener('change', function() {
            const projectName = this.value;
            const unitSelect = document.getElementById('rUnit');
            unitSelect.innerHTML = '';
            
            if (projectName && projectUnits[projectName]) {
                unitSelect.disabled = false;
                unitSelect.innerHTML = '<option value="">請選擇戶別</option>';
                projectUnits[projectName].forEach(function(unit) {
                    const option = document.createElement('option');
                    option.value = unit;
                    option.textContent = unit;
                    unitSelect.appendChild(option);
                });
            } else {
                unitSelect.disabled = true;
                unitSelect.innerHTML = '<option value="">請先選擇案場</option>';
            }
        });

        // 戶別選擇事件 - 模擬帶入客變條件資訊 (新增預約時)
        document.getElementById('rUnit').addEventListener('change', function() {
            // 僅在新增模式 (無 ID) 或必要時觸發，這裡簡化為只要選戶別就帶入預設資訊(若欄位為空)
            // 或是強制帶入，因為題目要求「只會將戶別的客變條件資訊顯示」
            // 這裡假設選了戶別就會帶出該戶別對應的客變資訊 (模擬)
            if (this.value) {
                // 模擬從後端撈取的客變條件資訊
                document.getElementById('rCustomChangeFee').value = '25000'; // 範例金額
                document.getElementById('rPaymentDeadline').value = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]; // 當年底
                document.getElementById('rPaymentAccount').value = '822-987654321098'; // 範例帳號
            } else {
                // 清空
                document.getElementById('rCustomChangeFee').value = '';
                document.getElementById('rPaymentDeadline').value = '';
                document.getElementById('rPaymentAccount').value = '';
            }
        });

        // 快速填入按鈕
        document.querySelectorAll('.quick-fill-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = 'cCompletedNotes'; // 預設填入紀錄說明
                const target = document.getElementById(targetId);
                if (target) {
                    const currentVal = target.value;
                    target.value = currentVal ? currentVal + '\n' + this.dataset.text : this.dataset.text;
                }
            });
        });
        
        // 檔案上傳
        const fileInput = document.getElementById('fileUpload');
        
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                addFileToUploadList(file.name, file.size);
            });
        });

        // 簽名板功能
        initSignatureCanvas();

        // 表單提交
        document.getElementById('customEditForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const idVal = document.getElementById('customId').value;
            const currentId = idVal ? parseInt(idVal) : null;
            
            if (currentId) {
                // 編輯模式：更新資料
                const item = CRMMockData.getById('customReservations', currentId);
                if (item) {
                    // 可編輯欄位
                    item.reservationDate = document.getElementById('rDate').value;
                    item.timeSlot = document.getElementById('rTimeSlot').value;
                    item.attendees = parseInt(document.getElementById('rAttendees').value) || 1;
                    item.hasDesigner = document.getElementById('rHasDesigner').checked;
                    item.changeDescription = document.getElementById('rChangeDescription').value;
                    item.remark = document.getElementById('rRemark').value;
                    item.paymentStatus = document.getElementById('rPaymentStatus').value;
                    
                    // 紀錄資訊
                    item.completedDate = document.getElementById('cCompletedDate').value;
                    item.completedNotes = document.getElementById('cCompletedNotes').value;
                    
                    // 儲存上傳的圖片
                    item.uploadedImages = uploadedImages;
                    
                    CRMMockData.save();
                }
            } else {
                // 新增模式
                const newItem = {
                    id: Date.now(),
                    projectName: document.getElementById('rProject').value,
                    unitName: document.getElementById('rUnit').value,
                    memberName: document.getElementById('rMemberName').value,
                    phone: document.getElementById('rPhone').value,
                    reservationDate: document.getElementById('rDate').value,
                    timeSlot: document.getElementById('rTimeSlot').value,
                    status: '待確認',
                    hasUnread: false,
                    paymentStatus: document.getElementById('rPaymentStatus').value,
                    customChangeFee: document.getElementById('rCustomChangeFee').value || 0,
                    paymentDeadline: document.getElementById('rPaymentDeadline').value,
                    paymentAccount: document.getElementById('rPaymentAccount').value,
                    attendees: parseInt(document.getElementById('rAttendees').value) || 1,
                    hasDesigner: document.getElementById('rHasDesigner').checked,
                    changeDescription: document.getElementById('rChangeDescription').value,
                    remark: document.getElementById('rRemark').value,
                    completedDate: '',
                    completedNotes: '',
                    attachments: [],
                    uploadedImages: uploadedImages
                };
                
                CRMMockData.customReservations.push(newItem);
                CRMMockData.save();
            }
            
            alert('儲存成功！');
            window.location.href = 'reservation-custom.html';
        });

        // 聊天室附件
        document.getElementById('btnAttachFile').addEventListener('click', function() {
            document.getElementById('chatFileInput').click();
        });
        
        document.getElementById('btnSendMessage').addEventListener('click', function() {
            const input = document.getElementById('chatInput');
            const text = input.value.trim();
            if (text) {
                const chatMessages = document.getElementById('chatMessages');
                const msgDiv = document.createElement('div');
                msgDiv.className = 'message message-left'; // 模擬自己發送是左邊? 通常自己是右邊 message-right
                // 這裡假設客服使用系統是 "自己"，但樣式上通常 "我" 在右邊。
                // 參考 collateral-edit CSS: .message-right 是用戶(User/Resident)? 
                // 這裡系統使用者是客服(Admin)。
                // 根據 collateral-edit.html:
                // message-right: "請問要準備什麼證件嗎？" (陳小明 - User)
                // message-left: "您好，請攜帶..." (王曉明 - Admin)
                // 所以 Admin 發送應該是 message-left? 或者 Admin 視角自己是在右邊?
                // 通常 Chat UI: Self is Right.
                // 讓我們假設 Admin 是 Right (Self).
                msgDiv.className = 'message message-right'; 
                msgDiv.innerHTML = `
                    <div class="message-content">${text}</div>
                    <div class="message-info">系統管理員 ${new Date().toLocaleString()}</div>
                `;
                chatMessages.appendChild(msgDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                input.value = '';
            }
        });
    }

    function initSignatureCanvas() {
        const canvas = document.getElementById('signatureCanvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // 取得相關元素
        const signatureArea = document.getElementById('signatureArea');
        const skipSignatureCheckbox = document.getElementById('skipSignature');
        const clearBtn = document.getElementById('btnClearSign');
        const confirmBtn = document.getElementById('btnConfirmSign');
        const placeholder = document.getElementById('signaturePlaceholder');
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
                    if (placeholder) placeholder.style.display = 'flex';
                }
            });
            
            // 初始化時觸發一次，以處理預設勾選狀態
            skipSignatureCheckbox.dispatchEvent(new Event('change'));
        }

        // 設定 Canvas 大小自適應
        function resizeCanvas() {
            const parent = canvas.parentElement;
            if (parent.clientWidth > 0) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                canvas.width = parent.clientWidth;
                canvas.height = 200; // 固定高度
                ctx.putImageData(imageData, 0, 0);
            }
        }
        
        window.addEventListener('resize', resizeCanvas);
        // 初始調整
        setTimeout(resizeCanvas, 100);

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', stopDrawing);

        function startDrawing(e) {
            // 檢查是否已標記為無需簽名
            if (skipSignatureCheckbox && skipSignatureCheckbox.checked) return;
            
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
            document.getElementById('signaturePlaceholder').style.display = 'none';
        }

        function draw(e) {
            if (!isDrawing) return;
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            [lastX, lastY] = [e.offsetX, e.offsetY];
        }

        function stopDrawing() {
            isDrawing = false;
        }

        function handleTouchStart(e) {
            // 檢查是否已標記為無需簽名
            if (skipSignatureCheckbox && skipSignatureCheckbox.checked) return;
            
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            isDrawing = true;
            lastX = touch.clientX - rect.left;
            lastY = touch.clientY - rect.top;
            document.getElementById('signaturePlaceholder').style.display = 'none';
        }

        function handleTouchMove(e) {
            e.preventDefault();
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            lastX = x;
            lastY = y;
        }

        document.getElementById('btnClearSign').addEventListener('click', function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            document.getElementById('signaturePlaceholder').style.display = 'flex';
        });

         document.getElementById('btnConfirmSign').addEventListener('click', function() {
            // 實際儲存簽名圖片邏輯
            alert('簽名已確認');
        });
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
});
