document.addEventListener('DOMContentLoaded', function() {
    // 渲染共用元件 (Header + Sidebar)

    if (typeof initCRMLayout === 'function') {

        initCRMLayout();

    }

    

    const sidebarManager = new SidebarManager();
    
    // 取得 URL 參數中的 ID
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    // 案場與戶別連動資料
    const projectUnits = {
        '陸府原森': ['A棟10F', 'A棟11A', 'A棟12A', 'A棟12B', 'B棟5A', 'B棟8A', 'C棟3A'],
        '陸府觀微': ['A1-2F', 'A1-3F', 'A2-5F', 'A2-6F', 'B1-3F', 'B1-4F'],
        '陸府植森': ['1棟-2F', '1棟-3F', '2棟-5F', '2棟-6F', '3棟-2F', '3棟-3F']
    };
    
    // 案場選擇變更事件
    const projectSelect = document.getElementById('hProject');
    if (projectSelect) {
        projectSelect.addEventListener('change', function() {
            const projectName = this.value;
            const unitSelect = document.getElementById('hUnit');
            
            // 清空戶別選項
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
    }
    
    // 載入資料
    if (id) {
        const handover = CRMMockData.getById('handoverReservations', parseInt(id));
        if (handover) {
            document.getElementById('handoverId').value = handover.id;
            
            // 設定案場並觸發戶別載入
            const projectSelect = document.getElementById('hProject');
            projectSelect.value = handover.projectName;
            
            // 手動觸發案場變更以載入戶別選項
            const unitSelect = document.getElementById('hUnit');
            unitSelect.innerHTML = '';
            if (handover.projectName && projectUnits[handover.projectName]) {
                unitSelect.disabled = false;
                unitSelect.innerHTML = '<option value="">請選擇戶別</option>';
                projectUnits[handover.projectName].forEach(function(unit) {
                    const option = document.createElement('option');
                    option.value = unit;
                    option.textContent = unit;
                    unitSelect.appendChild(option);
                });
            }
            
            document.getElementById('hUnit').value = handover.unitName;
            document.getElementById('hMemberName').value = handover.memberName;
            document.getElementById('hPhone').value = handover.phone || '';
            document.getElementById('hDate').value = handover.reservationDate || '';
            document.getElementById('hTimeSlot').value = handover.timeSlot || '';
            document.getElementById('hInCharge').value = handover.inCharge || '';
            document.getElementById('hRemark').value = handover.remark || '';
        }
    }
    
    // 快速填入按鈕
    document.querySelectorAll('.quick-fill-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('cCompletedNotes').value = this.dataset.text;
        });
    });
    
    // 簽名板功能
    const canvas = document.getElementById('signatureCanvas');
    if (canvas) {
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
        
        // 「此次無需簽名」核取方塊功能
        if (skipSignatureCheckbox) {
            skipSignatureCheckbox.addEventListener('change', function() {
                const isSkipped = this.checked;
                
                if (isSkipped) {
                    // 停用簽名區域
                    signatureArea.classList.add('disabled');
                    // 停用按鈕
                    if (clearBtn) clearBtn.disabled = true;
                    if (confirmBtn) confirmBtn.disabled = true;
                    // 清除已有簽名
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // 隱藏提示文字
                    if (placeholder) placeholder.style.display = 'none';
                } else {
                    // 啟用簽名區域
                    signatureArea.classList.remove('disabled');
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
        
        // 調整 Canvas 大小
        function resizeCanvas() {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        }
        window.addEventListener('resize', resizeCanvas);
        // Initial resize might need a small delay or check visibility
        setTimeout(resizeCanvas, 100);
        
        function startDrawing(e) {
            // 檢查是否已標記為無需簽名
            if (skipSignatureCheckbox && skipSignatureCheckbox.checked) return;
            
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
            if (placeholder) placeholder.style.display = 'none';
        }
        
        function draw(e) {
            if (!isDrawing) return;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            [lastX, lastY] = [e.offsetX, e.offsetY];
        }
        
        function stopDrawing() {
            isDrawing = false;
        }
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (placeholder) placeholder.style.display = 'block';
            });
        }
    }
    
    // 表單提交
    const form = document.getElementById('handoverEditForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 更新資料
            const idVal = document.getElementById('handoverId').value;
            const id = idVal ? parseInt(idVal) : null;
            
            if (id) {
                const handover = CRMMockData.getById('handoverReservations', id);
                if (handover) {
                    handover.projectName = document.getElementById('hProject').value;
                    handover.unitName = document.getElementById('hUnit').value;
                    handover.memberName = document.getElementById('hMemberName').value;
                    handover.phone = document.getElementById('hPhone').value;
                    handover.reservationDate = document.getElementById('hDate').value;
                    handover.timeSlot = document.getElementById('hTimeSlot').value;
                    handover.inCharge = document.getElementById('hInCharge').value;
                    handover.remark = document.getElementById('hRemark').value;
                    
                    CRMMockData.save();
                }
            }

            alert('資料已儲存');
            window.location.href = 'reservation-handover.html';
        });
    }
});
