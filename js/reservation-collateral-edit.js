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
        '陸府原森': ['A棟10F', 'A棟11A', 'A棟12A', 'A棟12B', 'B棟5A', 'B棟8A', 'C棟3A', 'A棟8F', 'B棟12F', 'A棟15F'],
        '陸府觀微': ['A1-2F', 'A1-3F', 'A2-5F', 'A2-6F', 'B1-3F', 'B1-4F', 'C棟5F'],
        '陸府植森': ['1棟-2F', '1棟-3F', '2棟-5F', '2棟-6F', '3棟-2F', '3棟-3F']
    };
    
    // 用於存放已上傳的貸款圖片（編輯模式下載入既有圖片）
    let uploadedLoanImages = [];
    
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
    
    /**
     * 渲染貸款圖片預覽區域
     * @param {Array} images - 圖片陣列（可為 URL 或 Base64）
     */
    function renderLoanImagePreview(images) {
        const loanImagePreview = document.getElementById('loanImagePreview');
        if (!loanImagePreview) return;
        
        loanImagePreview.innerHTML = '';
        
        images.forEach((imgSrc, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'relative';
            imgContainer.style.width = '100px';
            imgContainer.style.height = '100px';
            imgContainer.dataset.index = index;
            
            const img = document.createElement('img');
            img.src = imgSrc;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';
            img.style.border = '1px solid #ddd';
            img.style.cursor = 'pointer';
            
            // 點擊圖片可放大預覽
            img.onclick = function() {
                showImageModal(imgSrc);
            };
            
            // 刪除按鈕
            const delBtn = document.createElement('button');
            delBtn.type = 'button';
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
            
            delBtn.onclick = function(e) {
                e.stopPropagation();
                // 從陣列中移除該圖片
                uploadedLoanImages.splice(index, 1);
                // 重新渲染
                renderLoanImagePreview(uploadedLoanImages);
            };
            
            imgContainer.appendChild(img);
            imgContainer.appendChild(delBtn);
            loanImagePreview.appendChild(imgContainer);
        });
    }
    
    /**
     * 顯示圖片放大預覽 Modal
     * @param {string} imgSrc - 圖片來源
     */
    function showImageModal(imgSrc) {
        // 建立 Modal 背景
        const modalOverlay = document.createElement('div');
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100%';
        modalOverlay.style.height = '100%';
        modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.alignItems = 'center';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.zIndex = '9999';
        modalOverlay.style.cursor = 'pointer';
        
        // 建立圖片元素
        const modalImg = document.createElement('img');
        modalImg.src = imgSrc;
        modalImg.style.maxWidth = '90%';
        modalImg.style.maxHeight = '90%';
        modalImg.style.borderRadius = '8px';
        modalImg.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        
        // 關閉按鈕
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.width = '40px';
        closeBtn.style.height = '40px';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.background = 'white';
        closeBtn.style.color = '#333';
        closeBtn.style.border = 'none';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        
        modalOverlay.appendChild(modalImg);
        modalOverlay.appendChild(closeBtn);
        document.body.appendChild(modalOverlay);
        
        // 點擊背景或關閉按鈕關閉 Modal
        modalOverlay.onclick = function() {
            document.body.removeChild(modalOverlay);
        };
        
        closeBtn.onclick = function(e) {
            e.stopPropagation();
            document.body.removeChild(modalOverlay);
        };
    }
    
    /**
     * 載入問卷結果到顯示區塊
     * @param {Object} questionnaireResult - 問卷結果物件
     */
    function loadQuestionnaireResult(questionnaireResult) {
        if (!questionnaireResult) {
            // 若無問卷結果，隱藏問卷結果區塊
            const qBlock = document.getElementById('questionnaireResultBlock');
            if (qBlock) qBlock.style.display = 'none';
            return;
        }
        
        // 顯示問卷結果區塊
        const qBlock = document.getElementById('questionnaireResultBlock');
        if (qBlock) qBlock.style.display = 'block';
        
        // 填入問卷結果
        if (document.getElementById('qLoanIntent')) {
            document.getElementById('qLoanIntent').value = questionnaireResult.loanIntent || '-';
        }
        if (document.getElementById('qSelectedBank')) {
            document.getElementById('qSelectedBank').value = questionnaireResult.selectedBank || '-';
        }
        if (document.getElementById('qExpectedLoanAmount')) {
            const amount = questionnaireResult.expectedLoanAmount;
            document.getElementById('qExpectedLoanAmount').value = amount ? `${amount} 萬元` : '-';
        }
        if (document.getElementById('qLoanPurpose')) {
            document.getElementById('qLoanPurpose').value = questionnaireResult.loanPurpose || '-';
        }
        // 載入對保地點資訊
        if (document.getElementById('qCollateralLocation')) {
            document.getElementById('qCollateralLocation').value = questionnaireResult.collateralLocation || '-';
        }
        if (document.getElementById('qCollateralAddress')) {
            document.getElementById('qCollateralAddress').value = questionnaireResult.collateralAddress || '-';
        }
        if (document.getElementById('qHasOtherLoans')) {
            let otherLoansText = questionnaireResult.hasOtherLoans ? '是' : '否';
            if (questionnaireResult.hasOtherLoans && questionnaireResult.otherLoanAmount) {
                otherLoansText += `（約 ${questionnaireResult.otherLoanAmount} 萬元）`;
            }
            document.getElementById('qHasOtherLoans').value = otherLoansText;
        }
        if (document.getElementById('qPreferredContactTime')) {
            document.getElementById('qPreferredContactTime').value = questionnaireResult.preferredContactTime || '-';
        }
        if (document.getElementById('qPropertyRegistration')) {
            document.getElementById('qPropertyRegistration').value = questionnaireResult.propertyRegistration || '-';
        }
        if (document.getElementById('qRegistrationName')) {
            document.getElementById('qRegistrationName').value = questionnaireResult.registrationName || '-';
        }
        if (document.getElementById('qRegistrationId')) {
            document.getElementById('qRegistrationId').value = questionnaireResult.registrationId || '-';
        }
        if (document.getElementById('qOtherNotes')) {
            document.getElementById('qOtherNotes').value = questionnaireResult.otherNotes || '-';
        }
    }
    
    /**
     * 載入戶別條件設定（代辦費、繳款期限、繳款帳號）
     * @param {Object} unitCondition - 戶別條件物件
     */
    function loadUnitCondition(unitCondition) {
        if (!unitCondition) return;
        
        if (document.getElementById('hAgencyFee')) {
            document.getElementById('hAgencyFee').value = unitCondition.agencyFee || '';
        }
        if (document.getElementById('hPaymentDeadline')) {
            document.getElementById('hPaymentDeadline').value = unitCondition.paymentDeadline || '';
        }
        if (document.getElementById('hPaymentAccount')) {
            document.getElementById('hPaymentAccount').value = unitCondition.paymentAccount || '';
        }
    }
    
    // 載入資料
    if (id) {
        // 編輯模式：載入已存在的資料
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
            
            // 設定戶別（需確保選項已加入）
            if (collateral.unitName) {
                // 檢查是否已有此選項，若無則動態加入
                let hasOption = false;
                for (let i = 0; i < unitSelect.options.length; i++) {
                    if (unitSelect.options[i].value === collateral.unitName) {
                        hasOption = true;
                        break;
                    }
                }
                if (!hasOption) {
                    const newOpt = document.createElement('option');
                    newOpt.value = collateral.unitName;
                    newOpt.textContent = collateral.unitName;
                    unitSelect.appendChild(newOpt);
                }
                unitSelect.value = collateral.unitName;
            }
            
            document.getElementById('hMemberName').value = collateral.memberName;
            document.getElementById('hPhone').value = collateral.phone || '';
            document.getElementById('hDate').value = collateral.reservationDate || '';
            document.getElementById('hTimeSlot').value = collateral.timeSlot || '';
            document.getElementById('hInCharge').value = collateral.inCharge || '';
            
            // 載入貸款資訊（銀行、金額）
            if (document.getElementById('hBankOption')) {
                document.getElementById('hBankOption').value = collateral.bank || '';
            }
            if (document.getElementById('hLoanAmount')) {
                document.getElementById('hLoanAmount').value = collateral.loanAmount || '';
            }
            
            // 載入戶別條件設定（代辦費、繳款期限、繳款帳號）
            loadUnitCondition(collateral.unitCondition);
            
            // 載入問卷結果
            loadQuestionnaireResult(collateral.questionnaireResult);
            
            if (document.getElementById('hOtherSupplement')) {
                document.getElementById('hOtherSupplement').value = collateral.otherSupplement || '';
            }

            document.getElementById('hRemark').value = collateral.remark || collateral.notes || '';
            
            // 載入紀錄資訊（完成日期、紀錄說明）
            if (document.getElementById('cCompletedDate')) {
                document.getElementById('cCompletedDate').value = collateral.completedDate || '';
            }
            if (document.getElementById('cCompletedNotes')) {
                document.getElementById('cCompletedNotes').value = collateral.completedNotes || '';
            }
            
            // 載入已上傳的貸款圖片（多筆）
            if (collateral.loanImages && Array.isArray(collateral.loanImages)) {
                uploadedLoanImages = [...collateral.loanImages];
                renderLoanImagePreview(uploadedLoanImages);
            }
            
            // ========================================
            // 編輯模式：設定不可編輯的欄位
            // 案場、戶別、預約者姓名、手機、主責人員 設為唯讀
            // ========================================
            projectSelect.disabled = true;
            unitSelect.disabled = true;
            document.getElementById('hMemberName').readOnly = true;
            document.getElementById('hPhone').readOnly = true;
            document.getElementById('hInCharge').disabled = true;
            
            // 貸款資訊中部分欄位也設為唯讀
            if (document.getElementById('hBankOption')) {
                document.getElementById('hBankOption').disabled = true;
            }
            if (document.getElementById('hLoanAmount')) {
                document.getElementById('hLoanAmount').readOnly = true;
            }
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

        // 新增模式下隱藏貸款資訊中的：代辦費金額、繳款期限、繳款帳號
        const rowAgencyFeeDeadline = document.getElementById('rowAgencyFeeDeadline');
        if (rowAgencyFeeDeadline) rowAgencyFeeDeadline.style.display = 'none';

        const rowPaymentAccount = document.getElementById('rowPaymentAccount');
        if (rowPaymentAccount) rowPaymentAccount.style.display = 'none';
        
        // 新增模式下隱藏問卷結果區塊
        const qBlock = document.getElementById('questionnaireResultBlock');
        if (qBlock) qBlock.style.display = 'none';
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
    
    // 貸款圖片上傳預覽（支援多筆，追加模式）
    const loanImageUpload = document.getElementById('loanImageUpload');
    const loanImagePreview = document.getElementById('loanImagePreview');
    
    if (loanImageUpload && loanImagePreview) {
        loanImageUpload.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            
            // 追加新上傳的圖片到現有陣列
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        // 將新圖片加入陣列
                        uploadedLoanImages.push(event.target.result);
                        // 重新渲染預覽區域
                        renderLoanImagePreview(uploadedLoanImages);
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // 清空 input 以便可以重複選擇相同檔案
            this.value = '';
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
                // 編輯模式
                const collateral = CRMMockData.getById('collateralReservations', id);
                if (collateral) {
                    // 基本資料（部分欄位唯讀，但仍保持資料完整性）
                    collateral.projectName = document.getElementById('hProject').value;
                    collateral.unitName = document.getElementById('hUnit').value;
                    collateral.memberName = document.getElementById('hMemberName').value;
                    collateral.phone = document.getElementById('hPhone').value;
                    
                    // 可編輯欄位：日期、時段、備註
                    collateral.reservationDate = document.getElementById('hDate').value;
                    collateral.timeSlot = document.getElementById('hTimeSlot').value;
                    collateral.remark = document.getElementById('hRemark').value;
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
                    
                    // 儲存紀錄資訊（完成日期、紀錄說明）
                    if (document.getElementById('cCompletedDate')) {
                        collateral.completedDate = document.getElementById('cCompletedDate').value;
                    }
                    if (document.getElementById('cCompletedNotes')) {
                        collateral.completedNotes = document.getElementById('cCompletedNotes').value;
                    }
                    
                    // 儲存貸款圖片（多筆）
                    collateral.loanImages = uploadedLoanImages;
                    
                    CRMMockData.save();
                }
            } else {
                // 新增模式
                const newCollateral = {
                    id: Date.now(),
                    projectName: document.getElementById('hProject').value,
                    unitName: document.getElementById('hUnit').value,
                    memberName: document.getElementById('hMemberName').value,
                    phone: document.getElementById('hPhone').value,
                    reservationDate: document.getElementById('hDate').value,
                    timeSlot: document.getElementById('hTimeSlot').value,
                    inCharge: document.getElementById('hInCharge').value,
                    remark: document.getElementById('hRemark').value,
                    bank: document.getElementById('hBankOption') ? document.getElementById('hBankOption').value : '',
                    loanAmount: document.getElementById('hLoanAmount') ? document.getElementById('hLoanAmount').value : '',
                    status: '待確認',
                    hasUnread: false,
                    loanImages: uploadedLoanImages
                };
                
                CRMMockData.collateralReservations.push(newCollateral);
                CRMMockData.save();
            }

            alert('資料已儲存');
            window.location.href = 'reservation-collateral.html';
        });
    }
});