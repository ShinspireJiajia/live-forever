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
        // ... (existing helper logic) ...
        const collateral = CRMMockData.getById('collateralReservations', parseInt(id));
        if (collateral) {
            document.getElementById('collateralId').value = collateral.id;
            
            // 設定案場並觸發戶別載入
            const projectSelect = document.getElementById('hProject');
            projectSelect.value = collateral.projectName;
            
            // 手動觸發案場變更以載入戶別選項
            const unitSelect = document.getElementById('hUnit');
            unitSelect.innerHTML = '';
            if (collateral.projectName && projectUnits[collateral.projectName]) {
                unitSelect.disabled = false;
                unitSelect.innerHTML = '<option value="">請選擇戶別</option>';
                projectUnits[collateral.projectName].forEach(function(unit) {
                    const option = document.createElement('option');
                    option.value = unit;
                    option.textContent = unit;
                    unitSelect.appendChild(option);
                });
            }
            
            document.getElementById('hUnit').value = collateral.unitName;
            document.getElementById('hMemberName').value = collateral.memberName;
            document.getElementById('hPhone').value = collateral.phone || '';
            document.getElementById('hDate').value = collateral.reservationDate || '';
            document.getElementById('hTimeSlot').value = collateral.timeSlot || '';
            document.getElementById('hInCharge').value = collateral.inCharge || '';
            
            // 載入貸款資訊
            if (document.getElementById('hBankOption')) {
                document.getElementById('hBankOption').value = collateral.bank || '';
            }
            if (document.getElementById('hLoanAmount')) {
                document.getElementById('hLoanAmount').value = collateral.loanAmount || '';
            }
            if (document.getElementById('hAgencyFee')) {
                document.getElementById('hAgencyFee').value = collateral.agencyFee || '';
            }
            if (document.getElementById('hPaymentDeadline')) {
                document.getElementById('hPaymentDeadline').value = collateral.paymentDeadline || '';
            }
            if (document.getElementById('hPaymentAccount')) {
                document.getElementById('hPaymentAccount').value = collateral.paymentAccount || '';
            }
            if (document.getElementById('hOtherSupplement')) {
                document.getElementById('hOtherSupplement').value = collateral.otherSupplement || '';
            }

            document.getElementById('hRemark').value = collateral.remark || '';
        }
    } else {
        // 新增模式：隱藏不必要的區塊 (完工資訊、留言板)
        const recordSection = document.getElementById('sectionRecordInfo');
        if (recordSection) recordSection.style.display = 'none';

        const chatSection = document.getElementById('sectionChat');
        if (chatSection) chatSection.style.display = 'none';
        
        // 隱藏簽名板
        const signatureSection = document.getElementById('sectionSignature');
        if (signatureSection) signatureSection.style.display = 'none';
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
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
            const placeholder = document.getElementById('signaturePlaceholder');
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
        
        const clearBtn = document.getElementById('btnClearSign');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const placeholder = document.getElementById('signaturePlaceholder');
                if (placeholder) placeholder.style.display = 'block';
            });
        }
    }
    
    // 貸款圖片上傳預覽
    const loanImageUpload = document.getElementById('loanImageUpload');
    const loanImagePreview = document.getElementById('loanImagePreview');
    
    if (loanImageUpload && loanImagePreview) {
        loanImageUpload.addEventListener('change', function(e) {
            loanImagePreview.innerHTML = ''; // 清除舊預覽
            const files = Array.from(e.target.files);
            
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const imgContainer = document.createElement('div');
                        imgContainer.style.position = 'relative';
                        imgContainer.style.width = '100px';
                        imgContainer.style.height = '100px';
                        
                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';
                        img.style.borderRadius = '4px';
                        img.style.border = '1px solid #ddd';
                        
                        // 刪除按鈕
                        const delBtn = document.createElement('button');
                        delBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                        delBtn.style.position = 'absolute';
                        delBtn.style.top = '-8px';
                        delBtn.style.right = '-8px';
                        delBtn.style.width = '20px';
                        delBtn.style.height = '20px';
                        delBtn.style.borderRadius = '50%';
                        delBtn.style.background = 'var(--color-danger)';
                        delBtn.style.color = 'white';
                        delBtn.style.border = 'none';
                        delBtn.style.fontSize = '12px';
                        delBtn.style.cursor = 'pointer';
                        delBtn.style.display = 'flex';
                        delBtn.style.alignItems = 'center';
                        delBtn.style.justifyContent = 'center';
                        
                        delBtn.onclick = function() {
                            imgContainer.remove();
                        };
                        
                        imgContainer.appendChild(img);
                        imgContainer.appendChild(delBtn);
                        loanImagePreview.appendChild(imgContainer);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    // 表單提交
    const form = document.getElementById('collateralEditForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 更新資料
            const idVal = document.getElementById('collateralId').value;
            const id = idVal ? parseInt(idVal) : null;
            
            if (id) {
                const collateral = CRMMockData.getById('collateralReservations', id);
                if (collateral) {
                    collateral.projectName = document.getElementById('hProject').value;
                    collateral.unitName = document.getElementById('hUnit').value;
                    collateral.memberName = document.getElementById('hMemberName').value;
                    collateral.phone = document.getElementById('hPhone').value;
                    collateral.reservationDate = document.getElementById('hDate').value;
                    collateral.timeSlot = document.getElementById('hTimeSlot').value;
                    collateral.inCharge = document.getElementById('hInCharge').value;
                    
                    // 儲存貸款資訊
                    if (document.getElementById('hBankOption')) {
                        collateral.bank = document.getElementById('hBankOption').value;
                    }
                    if (document.getElementById('hLoanAmount')) {
                        collateral.loanAmount = document.getElementById('hLoanAmount').value;
                    }
                    if (document.getElementById('hAgencyFee')) {
                        collateral.agencyFee = document.getElementById('hAgencyFee').value;
                    }
                    if (document.getElementById('hPaymentDeadline')) {
                        collateral.paymentDeadline = document.getElementById('hPaymentDeadline').value;
                    }
                    if (document.getElementById('hPaymentAccount')) {
                        collateral.paymentAccount = document.getElementById('hPaymentAccount').value;
                    }
                    if (document.getElementById('hOtherSupplement')) {
                        collateral.otherSupplement = document.getElementById('hOtherSupplement').value;
                    }

                    collateral.remark = document.getElementById('hRemark').value;
                    
                    CRMMockData.save();
                }
            }

            alert('資料已儲存');
            window.location.href = 'reservation-collateral.html';
        });
    }
});
