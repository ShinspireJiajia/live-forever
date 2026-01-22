document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    // 渲染共用元件 (Header + Sidebar)

    if (typeof initCRMLayout === 'function') {

        initCRMLayout();

    }

    

    const sidebarManager = new SidebarManager();
    
    // 設定側邊欄選單狀態
    const greenMenu = document.querySelector('[data-menu-id="green"]');
    if (greenMenu) {
        greenMenu.classList.add('active'); // 展開綠海養護
        const submenu = greenMenu.querySelector('.menu-items');
        if (submenu) submenu.style.display = 'block';
        
        // 標記當前頁面 (雖然是新頁面，但邏輯上屬於養護合約的子功能，可以讓養護合約保持高亮，或者不標記)
        const currentLink = greenMenu.querySelector('a[href="green-contract.html"]');
        if (currentLink) {
            currentLink.parentElement.classList.add('active');
        }
    }

    // 獲取 URL 參數中的合約 ID
    const urlParams = new URLSearchParams(window.location.search);
    const contractId = urlParams.get('id') || '未知合約';
    
    // 顯示合約 ID
    const displayId = document.getElementById('contract-id-display');
    if (displayId) displayId.textContent = contractId;

    // 載入資料
    const tbody = document.getElementById('payment-table-body');
    loadPaymentData(contractId, tbody);

    // 初始化滾動功能
    initScrollFeatures();

    // 初始化搜尋功能
    initSearchFeatures();

    // 初始化新增/編輯彈窗功能
    initEditModal();

    // 初始化 LINE 推播彈窗功能
    initLineNotifyModal();
});

function loadPaymentData(contractId, tbody) {
    if (!tbody) return;

    // 模擬資料
    window.paymentData = [
        { id: 1, name: '第一期管理費', date: '2025-01-10', amount: '12,000', status: 'paid', type: '後開發票', invStatus: '已開立', invNumber: 'AB-12345678', invDate: '2025-01-15', taxAmount: '600', proof: '無', note: '提前繳費，享有優惠折扣' },
        { id: 2, name: '第二期管理費', date: '2025-04-10', amount: '12,000', status: 'paid', type: '後開發票', invStatus: '未開立', invNumber: '', invDate: '', taxAmount: '', proof: '無', note: '' },
        { id: 3, name: '第三期管理費', date: '2025-07-10', amount: '12,000', status: 'unpaid', type: '後開發票', invStatus: '未開立', invNumber: '', invDate: '', taxAmount: '', proof: '無', note: '' },
        { id: 4, name: '第四期管理費', date: '2025-10-10', amount: '12,000', status: 'unpaid', type: '後開發票', invStatus: '未開立', invNumber: '', invDate: '', taxAmount: '', proof: '無', note: '' },
        { id: 5, name: '年度樹木修剪', date: '2025-05-15', amount: '5,000', status: 'unpaid', type: '預開發票', invStatus: '處理中', invNumber: 'CD-87654321', invDate: '2025-05-01', taxAmount: '250', proof: '有', note: '包含大型機具進場費用' }
    ];
    
    renderTable(window.paymentData, tbody);
}

// 全域函數供 HTML onclick 呼叫
window.viewProof = function(id) {
    alert('檢視繳款證明 (ID: ' + id + ')');
};

function renderTable(data, tbody) {
    let html = '';
    if (data.length === 0) {
        html = '<tr><td colspan="12" style="text-align:center; padding: 20px;">查無資料</td></tr>';
    } else {
        data.forEach(item => {
            const statusClass = item.status === 'paid' ? 'status-paid' : 'status-unpaid';
            const statusText = item.status === 'paid' ? '已繳費' : '未繳費';
            
            const proofDisplay = item.proof === '有' 
                ? `<a href="javascript:void(0)" class="btn-link" onclick="viewProof(${item.id})"><i class="fa-solid fa-file-invoice"></i> 檢視</a>` 
                : '無';

            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.date}</td>
                    <td>NT$ ${item.amount}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>${item.type}</td>
                    <td>${item.invStatus}</td>
                    <td>${item.invNumber || '-'}</td>
                    <td>${item.invDate || '-'}</td>
                    <td>${item.taxAmount ? 'NT$ ' + item.taxAmount : '-'}</td>
                    <td>${proofDisplay}</td>
                    <td class="tooltip">
                        ${item.note ? (item.note.length > 10 ? item.note.substring(0, 10) + '...' : item.note) : '-'}
                        ${item.note ? `<span class="tooltip-text">${item.note}</span>` : ''}
                    </td>
                    <td>
                        <div class="payment-action-buttons">
                            <button class="btn-action btn-edit" title="編輯" onclick="openEditModal(${item.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="btn-action btn-delete" title="刪除" onclick="deletePayment(${item.id})"><i class="fa-solid fa-trash"></i></button>
                            <button class="btn-action btn-notify" title="推播" onclick="openLineNotifyModal(${item.id})"><i class="fa-solid fa-bell"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    tbody.innerHTML = html;
}

function initScrollFeatures() {
    const tableContainer = document.getElementById('payment-table-container');
    const arrowLeft = document.getElementById('arrow-left');
    const arrowRight = document.getElementById('arrow-right');
    const scrollProgress = document.getElementById('scroll-progress');
    
    if (tableContainer) {
        // 更新箭頭狀態與進度條
        const updateState = () => {
            const maxScroll = tableContainer.scrollWidth - tableContainer.clientWidth;
            const scrollPercentage = maxScroll > 0 ? (tableContainer.scrollLeft / maxScroll) * 100 : 0;
            
            if (scrollProgress) scrollProgress.style.width = scrollPercentage + '%';
            
            if (arrowLeft) arrowLeft.classList.toggle('disabled', tableContainer.scrollLeft <= 0);
            if (arrowRight) arrowRight.classList.toggle('disabled', tableContainer.scrollLeft >= maxScroll - 5);
        };

        tableContainer.addEventListener('scroll', updateState);
        window.addEventListener('resize', updateState);
        
        // 初始呼叫一次
        setTimeout(updateState, 100);
        
        if (arrowLeft) {
            arrowLeft.addEventListener('click', function() {
                if (!arrowLeft.classList.contains('disabled')) {
                    tableContainer.scrollBy({ left: -200, behavior: 'smooth' });
                }
            });
        }
        
        if (arrowRight) {
            arrowRight.addEventListener('click', function() {
                if (!arrowRight.classList.contains('disabled')) {
                    tableContainer.scrollBy({ left: 200, behavior: 'smooth' });
                }
            });
        }
    }
}

function initSearchFeatures() {
    const searchBtn = document.getElementById('payment-search-btn');
    const clearBtn = document.getElementById('payment-clear-btn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            alert('執行搜尋...');
            // 實際專案中這裡會呼叫 API 或過濾現有資料
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            document.getElementById('payment-status').value = 'all';
            document.getElementById('payment-name').value = '';
        });
    }
}

// ==========================================
// 新增/編輯彈窗邏輯
// ==========================================
let currentEditId = null;

function initEditModal() {
    const modal = document.getElementById('editPaymentModal');
    const addBtn = document.getElementById('add-payment-btn');
    const closeBtn = document.getElementById('editPaymentModalClose');
    const cancelBtn = document.getElementById('editPaymentCancel');
    const saveBtn = document.getElementById('editPaymentSave');
    const overlay = modal.querySelector('.modal-overlay');

    // 發票類型連動發票字號
    const typeSelect = document.getElementById('edit-type');
    const invNumberInput = document.getElementById('edit-invNumber');
    
    if (typeSelect && invNumberInput) {
        typeSelect.addEventListener('change', function() {
            if (this.value === '預開發票') {
                invNumberInput.disabled = false;
            } else {
                invNumberInput.disabled = true;
                invNumberInput.value = '';
            }
        });
    }

    // 繳款證明檔案上傳處理
    const proofFile = document.getElementById('edit-proof-file');
    const proofPreviewArea = document.getElementById('proof-preview-area');
    const viewProofBtn = document.getElementById('view-proof-btn');
    const deleteProofBtn = document.getElementById('delete-proof-btn');
    const proofFileName = document.getElementById('proof-file-name');

    if (proofFile) {
        proofFile.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                if (proofPreviewArea) proofPreviewArea.style.display = 'flex';
                if (proofFileName) proofFileName.textContent = this.files[0].name;
                if (viewProofBtn) {
                    viewProofBtn.href = URL.createObjectURL(this.files[0]);
                    viewProofBtn.onclick = null;
                }
            }
        });
    }

    if (deleteProofBtn) {
        deleteProofBtn.addEventListener('click', function() {
            if (proofFile) proofFile.value = '';
            if (proofPreviewArea) proofPreviewArea.style.display = 'none';
            if (proofFileName) proofFileName.textContent = '';
            if (viewProofBtn) viewProofBtn.href = '#';
        });
    }

    function openModal(isEdit = false) {
        const title = document.getElementById('editPaymentModalTitle');
        title.textContent = isEdit ? '編輯期款' : '新增期款';
        
        // 控制異動歷程顯示
        const historySection = document.getElementById('payment-history-section');
        if (historySection) {
            historySection.style.display = isEdit ? 'block' : 'none';
        }
        
        // 初始化發票字號欄位狀態
        const typeSelect = document.getElementById('edit-type');
        const invNumberInput = document.getElementById('edit-invNumber');
        const invDateInput = document.getElementById('edit-invDate');
        const taxAmountInput = document.getElementById('edit-taxAmount');

        if (typeSelect && invNumberInput) {
            if (!isEdit) {
                // 新增時預設狀態
                typeSelect.value = '預開發票';
                invNumberInput.disabled = false;
                invNumberInput.value = '';
                if (invDateInput) invDateInput.value = '';
                if (taxAmountInput) taxAmountInput.value = '';
            } else {
                // 編輯時根據當前值設定
                invNumberInput.disabled = (typeSelect.value !== '預開發票');
            }
        }

        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        document.getElementById('paymentForm').reset();
        currentEditId = null;
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            currentEditId = null;
            openModal(false);
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const form = document.getElementById('paymentForm');
            if (form.checkValidity()) {
                alert(currentEditId ? '更新成功！' : '新增成功！');
                closeModal();
                // 這裡應該重新載入資料
            } else {
                form.reportValidity();
            }
        });
    }
}

// 全域函數供 HTML onclick 呼叫
window.openEditModal = function(id) {
    currentEditId = id;
    const modal = document.getElementById('editPaymentModal');
    const title = document.getElementById('editPaymentModalTitle');
    title.textContent = '編輯期款';
    
    // 模擬填入資料
    document.getElementById('edit-name').value = '第一期管理費';
    document.getElementById('edit-date').value = '2025-01-10';
    document.getElementById('edit-amount').value = '12000';
    document.getElementById('edit-status').value = 'paid';
    
    // 模擬填入發票類型與字號
    const typeSelect = document.getElementById('edit-type');
    const invNumberInput = document.getElementById('edit-invNumber');
    const invDateInput = document.getElementById('edit-invDate');
    const taxAmountInput = document.getElementById('edit-taxAmount');

    // 重置繳款證明欄位
    const proofFile = document.getElementById('edit-proof-file');
    const proofPreviewArea = document.getElementById('proof-preview-area');
    const viewProofBtn = document.getElementById('view-proof-btn');
    const proofFileName = document.getElementById('proof-file-name');
    
    if (proofFile) proofFile.value = '';
    if (proofPreviewArea) proofPreviewArea.style.display = 'none';

    if (typeSelect) {
        // 根據 ID 模擬不同資料 (ID 5 為預開發票)
        if (id === 5) {
            typeSelect.value = '預開發票';
            if (invNumberInput) {
                invNumberInput.value = 'CD-87654321';
                invNumberInput.disabled = false;
            }
            if (invDateInput) invDateInput.value = '2025-05-01';
            if (taxAmountInput) taxAmountInput.value = '250';

            // 模擬已有繳款證明
            if (proofPreviewArea) {
                proofPreviewArea.style.display = 'flex';
                if (proofFileName) proofFileName.textContent = 'payment_proof_202505.pdf';
                if (viewProofBtn) {
                    viewProofBtn.href = 'javascript:void(0)';
                    viewProofBtn.onclick = function() { alert('檢視原繳款證明'); };
                }
            }
        } else if (id === 1) {
            // ID 1 為已開立發票
            typeSelect.value = '後開發票';
            if (invNumberInput) {
                invNumberInput.value = 'AB-12345678';
                invNumberInput.disabled = true; // 後開發票通常由系統產生或不可編輯，這裡假設不可編輯
            }
            if (invDateInput) invDateInput.value = '2025-01-15';
            if (taxAmountInput) taxAmountInput.value = '600';
        } else {
            typeSelect.value = '後開發票';
            if (invNumberInput) {
                invNumberInput.value = '';
                invNumberInput.disabled = true;
            }
            if (invDateInput) invDateInput.value = '';
            if (taxAmountInput) taxAmountInput.value = '';
        }
    }
    
    // 顯示並載入異動歷程
    const historySection = document.getElementById('payment-history-section');
    if (historySection) {
        historySection.style.display = 'block';
        
        const historyBody = document.getElementById('payment-history-body');
        if (historyBody) {
            // 模擬異動歷程資料
            const historyData = [
                { time: '2025-01-15 14:30', user: '王小明', note: '確認入帳，更新狀態為已繳費' },
                { time: '2025-01-10 09:15', user: '系統自動', note: '建立期款資料' }
            ];
            
            let html = '';
            historyData.forEach(item => {
                html += `
                    <tr>
                        <td>${item.time}</td>
                        <td>${item.user}</td>
                        <td>${item.note}</td>
                    </tr>
                `;
            });
            historyBody.innerHTML = html;
        }
    }
    
    modal.classList.add('active');
};

window.deletePayment = function(id) {
    if (confirm('確定要刪除此筆款項紀錄嗎？')) {
        alert('刪除成功！');
        // 這裡應該重新載入資料
    }
};

// ==========================================
// LINE 推播彈窗邏輯
// ==========================================
function initLineNotifyModal() {
    const modal = document.getElementById('lineNotifyModal');
    const closeBtn = document.getElementById('lineNotifyClose');
    const cancelBtn = document.getElementById('lineNotifyCancel');
    const sendBtn = document.getElementById('lineNotifySend');
    const overlay = modal.querySelector('.modal-overlay');
    
    // 關閉彈窗
    function closeModal() {
        modal.classList.remove('active');
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            alert('推播通知已發送！');
            closeModal();
        });
    }
    
    // 選擇推播類型
    const typeOptions = document.querySelectorAll('.type-option');
    typeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除所有選中狀態
            typeOptions.forEach(opt => opt.classList.remove('selected'));
            // 添加當前選中狀態
            this.classList.add('selected');
            
            // 更新預覽標題
            const previewHeader = document.getElementById('previewHeader');
            const typeTitle = this.querySelector('.type-title').textContent;
            previewHeader.textContent = `【${typeTitle}】`;
            
            // 根據類型更新預設內容 (模擬)
            const contentTextarea = document.getElementById('notifyContent');
            const previewBody = document.getElementById('previewBody');
            let defaultText = '';
            
            const type = this.getAttribute('data-type');
            switch(type) {
                case 'completion':
                    defaultText = '我們已經完成了您的項目。請您撥冗查看檢查結果，並在確認無誤後回復簽名，以便我們進行後續處理。';
                    break;
                case 'upcoming':
                    defaultText = '親愛的住戶您好，提醒您預約的服務日期即將到來，請留意時間。';
                    break;
                case 'renewal':
                    defaultText = '親愛的住戶您好，您的合約即將到期，若有續約需求請與我們聯繫安排討論。';
                    break;
                case 'service':
                    defaultText = '親愛的住戶您好，綠海養護服務已開放線上申請，歡迎多加利用。';
                    break;
                case 'payment':
                    const modal = document.getElementById('lineNotifyModal');
                    const paymentId = modal.getAttribute('data-payment-id');
                    const payment = window.paymentData ? window.paymentData.find(p => p.id == paymentId) : null;
                    
                    if (payment) {
                        defaultText = `親愛的住戶您好，提醒您本期款項尚未繳納。\n\n應繳金額：NT$ ${payment.amount}\n繳款期限：${payment.date}\n繳款連結：https://pay.example.com/pay/${payment.id}`;
                    } else {
                        defaultText = '親愛的住戶您好，提醒您本期款項尚未繳納，請盡速繳款。';
                    }
                    break;
                case 'payment_completed': {
                    const modal = document.getElementById('lineNotifyModal');
                    const paymentId = modal.getAttribute('data-payment-id');
                    const payment = window.paymentData ? window.paymentData.find(p => p.id == paymentId) : null;
                    
                    if (payment) {
                        defaultText = `親愛的住戶您好，您的款項已確認入帳。\n\n款項名稱：${payment.name}\n入帳金額：NT$ ${payment.amount}\n\n感謝您的繳納。`;
                    } else {
                        defaultText = '親愛的住戶您好，您的款項已確認入帳，感謝您的繳納。';
                    }
                    break;
                }
                default:
                    defaultText = contentTextarea.value;
            }
            
            contentTextarea.value = defaultText;
            previewBody.textContent = defaultText;
        });
    });
    
    // 更新推播內容預覽
    const contentTextarea = document.getElementById('notifyContent');
    if (contentTextarea) {
        contentTextarea.addEventListener('input', function() {
            const previewBody = document.getElementById('previewBody');
            previewBody.textContent = this.value;
        });
    }
    
    // 顯示/隱藏詳情
    const showDetailsCheckbox = document.getElementById('showDetails');
    if (showDetailsCheckbox) {
        showDetailsCheckbox.addEventListener('change', function() {
            const previewDetails = document.getElementById('previewDetails');
            previewDetails.style.display = this.checked ? 'flex' : 'none';
        });
    }
    
    // 顯示/隱藏連結按鈕
    const includeLinkCheckbox = document.getElementById('includeLink');
    if (includeLinkCheckbox) {
        includeLinkCheckbox.addEventListener('change', function() {
            const previewActions = document.getElementById('previewActions');
            previewActions.style.display = this.checked ? 'flex' : 'none';
        });
    }
}

window.openLineNotifyModal = function(id) {
    const modal = document.getElementById('lineNotifyModal');
    modal.setAttribute('data-payment-id', id); // 儲存當前付款 ID
    modal.classList.add('active');
    
    // 預設選中繳款通知
    const paymentOption = modal.querySelector('.type-option[data-type="payment"]');
    if (paymentOption) {
        paymentOption.click();
    }
    
    console.log('Open notify for payment id:', id);
};

