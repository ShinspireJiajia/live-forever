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

    // 模擬資料 (需與列表頁同步)
    const customReservations = [
        {
            id: 1,
            projectName: '陸府原森',
            unitName: 'A棟8F',
            memberName: '王大明',
            phone: '0912-345-678',
            reservationDate: '2025-10-15',
            timeSlot: '10:00-11:00',
            status: '已預約',
            paymentStatus: '待繳費',
            customChangeFee: 15000,
            paymentDeadline: '2025-10-25',
            paymentAccount: '822-123456789012',
            attendees: 2,
            hasDesigner: true,
            remark: '希望與設計師討論',
            changeDescription: '原有三房改兩房，主臥擴大',
            attachments: [
                { name: '平面配置圖_v1.pdf', size: 1024 * 1024 * 2.5 }, // 2.5MB
                { name: '參考圖片.jpg', size: 1024 * 500 } // 500KB
            ]
        },
        {
            id: 2,
            projectName: '陸府原森',
            unitName: 'B棟12F',
            memberName: '張美玲',
            phone: '0922-333-444',
            reservationDate: '2025-10-16',
            timeSlot: '14:00-15:00',
            status: '已完成',
            paymentStatus: '已繳費',
            customChangeFee: 5000,
            paymentDeadline: '2025-10-10',
            paymentAccount: '822-123456789012',
            attendees: 1,
            hasDesigner: false,
            remark: '',
            changeDescription: '增加插座，廚房專迴',
            attachments: [
                { name: '插座迴路圖.pdf', size: 1024 * 800 }
            ]
        },
        {
            id: 3,
            projectName: '陸府觀微',
            unitName: 'C棟5F',
            memberName: '李小華',
            phone: '0933-555-666',
            reservationDate: '2025-11-05',
            timeSlot: '09:00-10:00',
            status: '已取消',
            paymentStatus: '無需繳費',
            attendees: 3,
            hasDesigner: true,
            remark: '臨時有事改期',
            changeDescription: '客廳地磚升級大理石'
        },
        {
            id: 4,
            projectName: '陸府植森',
            unitName: '1棟-3F',
            memberName: '陳志偉',
            phone: '0911-222-333',
            reservationDate: '',
            timeSlot: '',
            status: '待確認',
            paymentStatus: '無需繳費',
            attendees: 1,
            hasDesigner: false,
            remark: '尚未預約'
        }
    ];

    // 取得 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));

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
            return;
        }

        // 編輯模式
        const item = customReservations.find(r => r.id === id);
        if (!item) {
            alert('查無資料');
            window.location.href = 'reservation-custom.html';
            return;
        }

        document.getElementById('customId').value = item.id;
        document.getElementById('rProject').value = item.projectName;
        
        // 觸發 change 事件以更新戶別
        const event = new Event('change');
        document.getElementById('rProject').dispatchEvent(event);
        
        document.getElementById('rUnit').value = item.unitName;
        document.getElementById('rMemberName').value = item.memberName;
        document.getElementById('rPhone').value = item.phone;
        document.getElementById('rDate').value = item.reservationDate;
        document.getElementById('rTimeSlot').value = item.timeSlot;
        document.getElementById('rAttendees').value = item.attendees || 1;
        document.getElementById('rHasDesigner').checked = item.hasDesigner || false;
        document.getElementById('rChangeDescription').value = item.changeDescription || '';
        document.getElementById('rRemark').value = item.remark || '';
        document.getElementById('rPaymentStatus').value = item.paymentStatus || '待繳費';
        document.getElementById('rCustomChangeFee').value = item.customChangeFee || '';
        document.getElementById('rPaymentDeadline').value = item.paymentDeadline || '';
        document.getElementById('rPaymentAccount').value = item.paymentAccount || '';

        // 編輯時，繳費資訊僅能修改繳費狀態，其餘欄位鎖定
        document.getElementById('rCustomChangeFee').disabled = true;
        document.getElementById('rPaymentDeadline').disabled = true;
        document.getElementById('rPaymentAccount').disabled = true;

        // 顯示已上傳檔案
        if (item.attachments && item.attachments.length > 0) {
            item.attachments.forEach(file => {
                addFileToUploadList(file.name, file.size);
            });
        }

        // 如果已完成或其他狀態，可能需要鎖定欄位或顯示紀錄
        if (item.status === '已完成') {
             // 模擬完成資料
            document.getElementById('cCompletedDate').value = '2025-10-16'; // 範例
            document.getElementById('cCompletedNotes').value = '客變項目確認無誤，已簽名。';
        }
    }

    function bindEvents() {
        // 案場與戶別連動
        const projectUnits = {
            '陸府原森': ['A棟10F', 'A棟11A', 'A棟12A', 'A棟12B', 'B棟5A', 'B棟8A', 'C棟3A'],
            '陸府觀微': ['A1-2F', 'A1-3F', 'A2-5F', 'A2-6F', 'B1-3F', 'B1-4F'],
            '陸府植森': ['1棟-2F', '1棟-3F', '2棟-5F', '2棟-6F', '3棟-2F', '3棟-3F']
        };

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
            // 驗證邏輯...
            
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
