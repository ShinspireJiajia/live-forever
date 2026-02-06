/**
 * 綠海報修個案單編輯頁面 JavaScript
 * @file green-case-edit.js
 * @description 處理報價單管理、簽名確認、付款連結、發票資訊等功能
 */

// ==================== 全域變數 ====================

// 目前個案單資料
let currentCase = {
    caseNo: 'GC-20251204-0001',
    status: '立案',
    project: '陸府觀森',
    houseId: 'A1-2',
    caseType: '維修',
    applicant: '吳Ｏ嬋',
    subject: '庭院植栽枯萎需更換',
    description: '庭院角落的植栽出現枯萎現象，需要進行更換處理。',
    urgent: false,
    startTime: '2025/12/04 10:30',
    overdueTime: '2025/12/11 10:30',
    signatureStatus: 'pending', // pending, signed
    paymentStatus: 'unpaid', // unpaid, paid, failed, refunded
    paymentLink: '',
    paymentTime: null
};

// 報價單列表
let quotationList = [
    {
        id: 1,
        quotationNo: 'GC-20251204-0001-Q1',
        quotationDate: '2025/12/04',
        expiryDate: '2026/01/03',
        amount: 15750,
        status: '已確認', // 草稿, 待確認, 已確認, 已取消
        isExpired: false,
        internalNote: '客戶已同意報價，預計下週一施工。材料已備妥，需協調園藝師傅時間。'
    },
    {
        id: 2,
        quotationNo: 'GC-20251204-0001-Q2',
        quotationDate: '2025/12/10',
        expiryDate: '2025/12/25',
        amount: 8400,
        status: '草稿',
        isExpired: true,
        internalNote: '待主管審核價格，客戶要求折扣5%，需評估成本後回覆。'
    }
];

// 簽名畫布相關變數
let signatureCanvas, signatureCtx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hasSignature = false;

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁籤功能
    initTabs();
    
    // 初始化簽名畫布
    initSignatureCanvas();
    
    // 初始化事件監聽
    initEventListeners();
    
    // 初始化表單資料
    initFormData();
    
    // 初始化報價單列表
    renderQuotationList();
    
    // 更新付款按鈕狀態
    updatePaymentButtonState();
    
    // 初始化進度彈窗
    initProgressModal();
    
    // 初始化刪除彈窗
    initDeleteModal();
    
    // 初始化延長期限彈窗
    initExtendModal();
    
    // 初始化星星評分
    initStarRating();
    
    // 初始化快速填入按鈕
    initQuickFillButtons();
    
    console.log('綠海報修個案單編輯頁面初始化完成');
});

// ==================== 頁籤功能 ====================

/**
 * 初始化頁籤切換功能
 */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // 移除所有 active 狀態
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // 設定當前頁籤為 active
            this.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

// ==================== 簽名畫布功能 ====================

// 「此次無需簽名」相關元素
let skipSignatureCheckbox, signatureDisabledOverlay, signatureArea;
let btnClearSign, btnConfirmSign;

/**
 * 初始化簽名畫布
 */
function initSignatureCanvas() {
    signatureCanvas = document.getElementById('signatureCanvas');
    signatureCtx = signatureCanvas.getContext('2d');
    signatureArea = document.getElementById('signatureArea');
    skipSignatureCheckbox = document.getElementById('skipSignature');
    signatureDisabledOverlay = document.getElementById('signatureDisabledOverlay');
    btnClearSign = document.getElementById('btnClearSign');
    btnConfirmSign = document.getElementById('btnConfirmSign');
    
    // 設定畫布樣式
    signatureCtx.strokeStyle = '#333';
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
    signatureCtx.lineJoin = 'round';

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
                signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
                hasSignature = false;
                // 隱藏提示文字
                const placeholder = document.getElementById('signaturePlaceholder');
                if (placeholder) placeholder.style.display = 'none';
            } else {
                // 啟用簽名區域
                if (signatureArea) signatureArea.classList.remove('disabled');
                // 隱藏遮罩層
                if (signatureDisabledOverlay) signatureDisabledOverlay.style.display = 'none';
                // 啟用按鈕
                if (btnClearSign) btnClearSign.disabled = false;
                if (btnConfirmSign) btnConfirmSign.disabled = false;
                // 顯示提示文字
                const placeholder = document.getElementById('signaturePlaceholder');
                if (placeholder) placeholder.style.display = 'flex';
            }
        });
        
        // 初始化時觸發一次，以處理預設勾選狀態
        skipSignatureCheckbox.dispatchEvent(new Event('change'));
    }
    
    // 滑鼠事件
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);
    
    // 觸控事件（手機/平板）
    signatureCanvas.addEventListener('touchstart', handleTouchStart);
    signatureCanvas.addEventListener('touchmove', handleTouchMove);
    signatureCanvas.addEventListener('touchend', stopDrawing);
    
    // 點擊簽名區域時隱藏提示
    signatureCanvas.addEventListener('mousedown', hideSignaturePlaceholder);
    signatureCanvas.addEventListener('touchstart', hideSignaturePlaceholder);
    
    // 清除簽名按鈕
    document.getElementById('btnClearSign').addEventListener('click', clearSignature);
    
    // 確認簽名按鈕
    document.getElementById('btnConfirmSign').addEventListener('click', confirmSignature);
}

/**
 * 隱藏簽名提示
 */
function hideSignaturePlaceholder() {
    const placeholder = document.getElementById('signaturePlaceholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }
}

/**
 * 開始繪製
 */
function startDrawing(e) {
    // 檢查是否已標記為無需簽名
    if (skipSignatureCheckbox && skipSignatureCheckbox.checked) return;
    
    isDrawing = true;
    [lastX, lastY] = getCoordinates(e);
}

/**
 * 繪製中
 */
function draw(e) {
    if (!isDrawing) return;
    
    e.preventDefault();
    
    const [x, y] = getCoordinates(e);
    
    signatureCtx.beginPath();
    signatureCtx.moveTo(lastX, lastY);
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();
    
    [lastX, lastY] = [x, y];
    hasSignature = true;
}

/**
 * 停止繪製
 */
function stopDrawing() {
    isDrawing = false;
}

/**
 * 處理觸控開始事件
 */
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    signatureCanvas.dispatchEvent(mouseEvent);
}

/**
 * 處理觸控移動事件
 */
function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    signatureCanvas.dispatchEvent(mouseEvent);
}

/**
 * 取得座標
 */
function getCoordinates(e) {
    const rect = signatureCanvas.getBoundingClientRect();
    const scaleX = signatureCanvas.width / rect.width;
    const scaleY = signatureCanvas.height / rect.height;
    
    if (e.touches) {
        return [
            (e.touches[0].clientX - rect.left) * scaleX,
            (e.touches[0].clientY - rect.top) * scaleY
        ];
    }
    
    return [
        (e.clientX - rect.left) * scaleX,
        (e.clientY - rect.top) * scaleY
    ];
}

/**
 * 清除簽名
 */
function clearSignature() {
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    hasSignature = false;
    
    // 顯示提示
    const placeholder = document.getElementById('signaturePlaceholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
    
    // 重設簽名狀態
    currentCase.signatureStatus = 'pending';
    updateSignatureStatus();
    updatePaymentButtonState();
}

/**
 * 確認簽名
 */
function confirmSignature() {
    if (!hasSignature) {
        alert('請先完成簽名');
        return;
    }
    
    // 更新簽名狀態
    currentCase.signatureStatus = 'signed';
    updateSignatureStatus();
    updatePaymentButtonState();
    
    // 取得簽名圖片資料
    const signatureData = signatureCanvas.toDataURL('image/png');
    console.log('簽名資料已儲存', signatureData.substring(0, 50) + '...');
    
    alert('簽名確認成功！');
}

/**
 * 更新簽名狀態顯示
 */
function updateSignatureStatus() {
    const statusValue = document.getElementById('signatureStatusValue');
    
    if (currentCase.signatureStatus === 'signed') {
        statusValue.textContent = '已簽名';
        statusValue.className = 'status-value status-success';
    } else {
        statusValue.textContent = '未簽名';
        statusValue.className = 'status-value status-pending';
    }
}

// ==================== 付款功能 ====================

/**
 * 更新付款按鈕狀態
 */
function updatePaymentButtonState() {
    const btnGeneratePaymentLink = document.getElementById('btnGeneratePaymentLink');
    const paymentHint = document.getElementById('paymentHint');
    
    // 檢查條件：
    // 1. 是否有已確認的報價單
    // 2. 已確認的報價單是否在有效期限內
    // 3. 客戶是否已簽名
    
    const confirmedQuotation = quotationList.find(q => q.status === '已確認');
    const isQuotationConfirmed = !!confirmedQuotation;
    const isQuotationValid = confirmedQuotation && !confirmedQuotation.isExpired;
    const isSigned = currentCase.signatureStatus === 'signed';
    
    if (!isQuotationConfirmed) {
        btnGeneratePaymentLink.disabled = true;
        paymentHint.textContent = '請先確認報價單';
        paymentHint.style.color = '#E74C3C';
    } else if (!isQuotationValid) {
        btnGeneratePaymentLink.disabled = true;
        paymentHint.textContent = '報價單已過期，請延長有效期限';
        paymentHint.style.color = '#E74C3C';
    } else if (!isSigned) {
        btnGeneratePaymentLink.disabled = true;
        paymentHint.textContent = '請先完成客戶簽名確認';
        paymentHint.style.color = '#F39C12';
    } else {
        btnGeneratePaymentLink.disabled = false;
        paymentHint.textContent = '可產生支付連結';
        paymentHint.style.color = '#27AE60';
    }
}

/**
 * 產生支付連結
 */
function generatePaymentLink() {
    // 模擬產生支付連結
    const paymentId = 'PAY' + Date.now();
    const link = `https://payment.lufu.com.tw/pay/${paymentId}`;
    
    document.getElementById('paymentLink').value = link;
    currentCase.paymentLink = link;
    
    // 啟用複製按鈕
    document.getElementById('btnCopyLink').disabled = false;
    
    alert('支付連結已產生！');
}

/**
 * 複製支付連結
 */
function copyPaymentLink() {
    const paymentLink = document.getElementById('paymentLink').value;
    
    if (!paymentLink) {
        alert('尚未產生支付連結');
        return;
    }
    
    navigator.clipboard.writeText(paymentLink).then(() => {
        alert('支付連結已複製到剪貼簿');
    }).catch(err => {
        console.error('複製失敗', err);
        // 備援方案
        const input = document.getElementById('paymentLink');
        input.select();
        document.execCommand('copy');
        alert('支付連結已複製到剪貼簿');
    });
}

// ==================== 發票功能 ====================

/**
 * 儲存發票資訊
 */
function saveInvoiceInfo() {
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const invoiceType = document.getElementById('invoiceType').value;
    const invoiceStatus = document.getElementById('invoiceStatus').value;
    const invoiceDate = document.getElementById('invoiceDate').value;
    
    // TODO: 實際儲存至後端
    console.log('發票資訊', {
        invoiceNumber,
        invoiceType,
        invoiceStatus,
        invoiceDate
    });
    
    alert('發票資訊已儲存');
}

/**
 * 串接電子發票 API（預留）
 */
function callInvoiceAPI() {
    // TODO: 實際串接電子發票 API
    console.log('呼叫電子發票 API（預留功能）');
    alert('電子發票 API 功能開發中...');
}

// ==================== 報價單列表功能 ====================

/**
 * 渲染報價單列表
 */
function renderQuotationList() {
    const tbody = document.getElementById('quotationTableBody');
    
    if (quotationList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">尚無報價單</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = quotationList.map(q => `
        <tr>
            <td>${q.quotationNo}</td>
            <td>${q.quotationDate}</td>
            <td>
                <span class="expiry-date ${q.isExpired ? 'expired' : ''}">${q.expiryDate}</span>
                ${q.isExpired ? '<span class="expired-label">已過期</span>' : ''}
            </td>
            <td>NT$ ${formatNumber(q.amount)}</td>
            <td><span class="status-badge ${getQuotationStatusClass(q.status)}">${q.status}</span></td>
            <td class="internal-note-cell">
                <span class="internal-note-text" title="${q.internalNote || ''}">${q.internalNote || '-'}</span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-table-view" data-id="${q.id}" title="檢視">檢視</button>
                    <button class="btn-table-edit" data-id="${q.id}" title="編輯">編輯</button>
                    ${q.isExpired ? `<button class="btn-table-extend" data-id="${q.id}" title="延長期限">延長</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
    
    // 綁定事件
    bindQuotationTableEvents();
}

/**
 * 取得報價單狀態樣式類別
 */
function getQuotationStatusClass(status) {
    const statusMap = {
        '草稿': 'status-warning',
        '待確認': 'status-info',
        '已確認': 'status-success',
        '已取消': 'status-danger'
    };
    return statusMap[status] || 'status-secondary';
}

/**
 * 綁定報價單表格事件
 */
function bindQuotationTableEvents() {
    // 檢視按鈕
    document.querySelectorAll('.btn-table-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            viewQuotation(id);
        });
    });
    
    // 編輯按鈕
    document.querySelectorAll('.btn-table-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            editQuotation(id);
        });
    });
    
    // 延長期限按鈕
    document.querySelectorAll('.btn-table-extend').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            openExtendModal(id);
        });
    });
}

/**
 * 檢視報價單
 */
function viewQuotation(id) {
    const quotation = quotationList.find(q => q.id === parseInt(id));
    if (quotation) {
        // 開啟報價單頁面（唯讀模式）
        window.location.href = `green-case-quotation.html?mode=view&id=${id}&caseNo=${currentCase.caseNo}`;
    }
}

/**
 * 編輯報價單
 */
function editQuotation(id) {
    const quotation = quotationList.find(q => q.id === parseInt(id));
    if (quotation) {
        // 開啟報價單編輯頁面
        window.location.href = `green-case-quotation.html?mode=edit&id=${id}&caseNo=${currentCase.caseNo}`;
    }
}

/**
 * 新增報價單
 */
function addQuotation() {
    // 計算新的報價單編號
    const quotationCount = quotationList.length + 1;
    const newQuotationNo = `${currentCase.caseNo}-Q${quotationCount}`;
    
    // 開啟新增報價單頁面
    window.location.href = `green-case-quotation.html?mode=add&caseNo=${currentCase.caseNo}&quotationNo=${newQuotationNo}`;
}

// ==================== 延長期限彈窗 ====================

/**
 * 初始化延長期限彈窗
 */
function initExtendModal() {
    const modal = document.getElementById('extendModal');
    const backdrop = document.getElementById('extendModalBackdrop');
    const closeBtn = document.getElementById('extendModalClose');
    const cancelBtn = document.getElementById('extendModalCancel');
    const confirmBtn = document.getElementById('extendModalConfirm');
    
    // 關閉彈窗
    closeBtn.addEventListener('click', closeExtendModal);
    cancelBtn.addEventListener('click', closeExtendModal);
    backdrop.addEventListener('click', closeExtendModal);
    
    // 確認延長
    confirmBtn.addEventListener('click', confirmExtendExpiry);
}

/**
 * 開啟延長期限彈窗
 */
function openExtendModal(quotationId) {
    const quotation = quotationList.find(q => q.id === parseInt(quotationId));
    
    if (!quotation) return;
    
    document.getElementById('extendQuotationNo').value = quotation.quotationNo;
    document.getElementById('extendOriginalExpiry').value = quotation.expiryDate;
    document.getElementById('extendNewExpiry').value = '';
    
    // 設定最小日期為今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('extendNewExpiry').min = today;
    
    // 儲存目前處理的報價單 ID
    document.getElementById('extendModal').dataset.quotationId = quotationId;
    
    // 顯示彈窗
    document.getElementById('extendModal').classList.add('show');
    document.getElementById('extendModalBackdrop').classList.add('show');
}

/**
 * 關閉延長期限彈窗
 */
function closeExtendModal() {
    document.getElementById('extendModal').classList.remove('show');
    document.getElementById('extendModalBackdrop').classList.remove('show');
}

/**
 * 確認延長期限
 */
function confirmExtendExpiry() {
    const quotationId = parseInt(document.getElementById('extendModal').dataset.quotationId);
    const newExpiry = document.getElementById('extendNewExpiry').value;
    
    if (!newExpiry) {
        alert('請選擇新的有效期限');
        return;
    }
    
    // 更新報價單有效期限
    const quotation = quotationList.find(q => q.id === quotationId);
    if (quotation) {
        quotation.expiryDate = newExpiry.replace(/-/g, '/');
        quotation.isExpired = false;
        
        // 重新渲染列表
        renderQuotationList();
        
        // 更新付款按鈕狀態
        updatePaymentButtonState();
        
        alert('報價單有效期限已延長');
    }
    
    closeExtendModal();
}

// ==================== 事件監聽 ====================

/**
 * 初始化事件監聽
 */
function initEventListeners() {
    // 新增報價單按鈕
    const btnAddQuotation = document.getElementById('btnAddQuotation');
    if (btnAddQuotation) {
        btnAddQuotation.addEventListener('click', addQuotation);
    }
    
    // 產生支付連結按鈕
    const btnGeneratePaymentLink = document.getElementById('btnGeneratePaymentLink');
    if (btnGeneratePaymentLink) {
        btnGeneratePaymentLink.addEventListener('click', generatePaymentLink);
    }
    
    // 複製連結按鈕
    const btnCopyLink = document.getElementById('btnCopyLink');
    if (btnCopyLink) {
        btnCopyLink.addEventListener('click', copyPaymentLink);
    }
    
    // 儲存發票資訊按鈕
    const btnSaveInvoice = document.getElementById('btnSaveInvoice');
    if (btnSaveInvoice) {
        btnSaveInvoice.addEventListener('click', saveInvoiceInfo);
    }
    
    // 串接電子發票 API 按鈕
    const btnCallInvoiceAPI = document.getElementById('btnCallInvoiceAPI');
    if (btnCallInvoiceAPI) {
        btnCallInvoiceAPI.addEventListener('click', callInvoiceAPI);
    }
    
    // 儲存按鈕（頂部和底部）
    const btnSaveTop = document.getElementById('btnSaveTop');
    const btnSaveBottom = document.getElementById('btnSaveBottom');
    
    if (btnSaveTop) {
        btnSaveTop.addEventListener('click', saveCase);
    }
    if (btnSaveBottom) {
        btnSaveBottom.addEventListener('click', saveCase);
    }
    
    // 刪除按鈕
    const btnDelete = document.getElementById('btnDelete');
    if (btnDelete) {
        btnDelete.addEventListener('click', openDeleteModal);
    }
    
    // 轉換按鈕
    const btnConvert = document.getElementById('btnConvert');
    if (btnConvert) {
        btnConvert.addEventListener('click', convertCase);
    }
    
    // 進度更新按鈕
    const btnProgressUpdate = document.getElementById('btnProgressUpdate');
    if (btnProgressUpdate) {
        btnProgressUpdate.addEventListener('click', openProgressModal);
    }
    
    // 發送訊息
    const btnSendMessage = document.getElementById('btnSendMessage');
    const chatInput = document.getElementById('chatInput');
    
    if (btnSendMessage) {
        btnSendMessage.addEventListener('click', sendMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // 附件上傳
    const btnAttachFile = document.getElementById('btnAttachFile');
    const chatFileInput = document.getElementById('chatFileInput');
    
    if (btnAttachFile && chatFileInput) {
        btnAttachFile.addEventListener('click', () => chatFileInput.click());
        chatFileInput.addEventListener('change', handleChatFileUpload);
    }
    
    // 檔案上傳
    const fileUpload = document.getElementById('fileUpload');
    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }
    
    // 圖片檢視
    initImageViewer();
}

/**
 * 初始化表單資料
 */
function initFormData() {
    // 設定表單編號
    document.getElementById('caseFormNo').textContent = currentCase.caseNo;
    
    // 設定時間
    document.getElementById('startTime').textContent = currentCase.startTime;
    document.getElementById('overdueTime').textContent = currentCase.overdueTime;
    
    // 更新簽名狀態
    updateSignatureStatus();
}

// ==================== 進度彈窗 ====================

/**
 * 初始化進度彈窗
 */
function initProgressModal() {
    const modal = document.getElementById('progressModal');
    const backdrop = document.getElementById('progressModalBackdrop');
    const closeBtn = document.getElementById('progressModalClose');
    const cancelBtn = document.getElementById('progressModalCancel');
    const confirmBtn = document.getElementById('progressModalConfirm');
    
    closeBtn.addEventListener('click', closeProgressModal);
    cancelBtn.addEventListener('click', closeProgressModal);
    backdrop.addEventListener('click', closeProgressModal);
    confirmBtn.addEventListener('click', updateProgress);
}

/**
 * 開啟進度彈窗
 */
function openProgressModal() {
    document.getElementById('progressModal').classList.add('show');
    document.getElementById('progressModalBackdrop').classList.add('show');
}

/**
 * 關閉進度彈窗
 */
function closeProgressModal() {
    document.getElementById('progressModal').classList.remove('show');
    document.getElementById('progressModalBackdrop').classList.remove('show');
}

/**
 * 更新進度
 */
function updateProgress() {
    const progressSelect = document.getElementById('progressSelect');
    const progressNote = document.getElementById('progressNote');
    
    const progressValue = progressSelect.value;
    const note = progressNote.value;
    
    // TODO: 實際更新進度
    console.log('更新進度', { progressValue, note });
    
    // 更新狀態下拉選單
    const statusMap = {
        '1': '立案',
        '2': '派工',
        '3': '維修評估',
        '4': '報價中',
        '5': '報價確認',
        '6': '維修中',
        '7': '待簽名',
        '8': '待付款',
        '9': '已付款',
        '10': '已開票',
        '11': '結案'
    };
    
    const statusSelect = document.getElementById('cStatus');
    if (statusSelect) {
        statusSelect.value = statusMap[progressValue] || '';
    }
    
    closeProgressModal();
    alert('進度已更新');
}

// ==================== 刪除彈窗 ====================

/**
 * 初始化刪除彈窗
 */
function initDeleteModal() {
    const modal = document.getElementById('deleteModal');
    const backdrop = document.getElementById('deleteModalBackdrop');
    const closeBtn = document.getElementById('deleteModalClose');
    const cancelBtn = document.getElementById('deleteModalCancel');
    const confirmBtn = document.getElementById('deleteModalConfirm');
    
    closeBtn.addEventListener('click', closeDeleteModal);
    cancelBtn.addEventListener('click', closeDeleteModal);
    backdrop.addEventListener('click', closeDeleteModal);
    confirmBtn.addEventListener('click', confirmDelete);
}

/**
 * 開啟刪除彈窗
 */
function openDeleteModal() {
    document.getElementById('deleteModal').classList.add('show');
    document.getElementById('deleteModalBackdrop').classList.add('show');
}

/**
 * 關閉刪除彈窗
 */
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    document.getElementById('deleteModalBackdrop').classList.remove('show');
}

/**
 * 確認刪除
 */
function confirmDelete() {
    // TODO: 實際刪除
    console.log('刪除個案單', currentCase.caseNo);
    
    closeDeleteModal();
    alert('個案單已刪除');
    
    // 返回列表頁
    window.location.href = 'green-case-list.html';
}

// ==================== 其他功能 ====================

/**
 * 儲存個案單
 */
function saveCase() {
    // 收集表單資料
    const formData = {
        caseNo: document.getElementById('cCaseNo').value,
        status: document.getElementById('cStatus').value,
        project: document.getElementById('cProject').value,
        houseId: document.getElementById('cHouseId').value,
        caseType: document.getElementById('cCaseType').value,
        applicant: document.getElementById('cApplicant').value,
        subject: document.getElementById('cSubject').value,
        description: document.getElementById('cDescription').value,
        urgent: document.getElementById('cUrgent').checked,
        completedDate: document.getElementById('cCompletedDate').value,
        completedNotes: document.getElementById('cCompletedNotes').value
    };
    
    // TODO: 實際儲存至後端
    console.log('儲存個案單', formData);
    
    alert('儲存成功！');
}

/**
 * 轉換個案單
 */
function convertCase() {
    // TODO: 實作轉換功能
    alert('轉換功能開發中...');
}

/**
 * 發送訊息
 */
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chatMessages');
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    
    const messageHtml = `
        <div class="message message-left">
            <div class="message-content">${escapeHtml(message)}</div>
            <div class="message-info">系統管理員 ${timeStr}</div>
        </div>
    `;
    
    chatMessages.insertAdjacentHTML('beforeend', messageHtml);
    chatInput.value = '';
    
    // 滾動到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * 處理聊天室檔案上傳
 */
function handleChatFileUpload(e) {
    const files = e.target.files;
    
    if (files.length === 0) return;
    
    // TODO: 實際上傳檔案
    console.log('上傳檔案', files);
    
    alert(`已選擇 ${files.length} 個檔案`);
}

/**
 * 處理檔案上傳
 */
function handleFileUpload(e) {
    const files = e.target.files;
    const uploadList = document.getElementById('uploadList');
    
    Array.from(files).forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'upload-item';
        fileItem.innerHTML = `
            <span class="upload-item-name">${file.name}</span>
            <span class="upload-item-size">${formatFileSize(file.size)}</span>
            <button type="button" class="upload-item-remove" title="移除">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        
        // 移除按鈕事件
        fileItem.querySelector('.upload-item-remove').addEventListener('click', function() {
            fileItem.remove();
        });
        
        uploadList.appendChild(fileItem);
    });
}

/**
 * 初始化圖片檢視
 */
function initImageViewer() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const img = this.closest('.attachment-preview').querySelector('.attachment-image');
            const fullSrc = img.dataset.fullSrc || img.src;
            
            // 簡易版：開新視窗
            window.open(fullSrc, '_blank');
        });
    });
}

/**
 * 初始化星星評分
 */
function initStarRating() {
    document.querySelectorAll('.star-rating').forEach(ratingContainer => {
        const stars = ratingContainer.querySelectorAll('i');
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.dataset.value);
                ratingContainer.dataset.rating = value;
                
                // 更新星星顯示
                stars.forEach((s, index) => {
                    if (index < value) {
                        s.className = 'fa-solid fa-star';
                    } else {
                        s.className = 'fa-regular fa-star';
                    }
                });
            });
            
            star.addEventListener('mouseenter', function() {
                const value = parseInt(this.dataset.value);
                
                stars.forEach((s, index) => {
                    if (index < value) {
                        s.className = 'fa-solid fa-star';
                    } else {
                        s.className = 'fa-regular fa-star';
                    }
                });
            });
        });
        
        ratingContainer.addEventListener('mouseleave', function() {
            const currentRating = parseInt(this.dataset.rating) || 0;
            
            stars.forEach((s, index) => {
                if (index < currentRating) {
                    s.className = 'fa-solid fa-star';
                } else {
                    s.className = 'fa-regular fa-star';
                }
            });
        });
    });
}

/**
 * 初始化快速填入按鈕
 */
function initQuickFillButtons() {
    document.querySelectorAll('.quick-fill-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.dataset.text;
            const textarea = document.getElementById('cCompletedNotes');
            
            if (textarea) {
                textarea.value = text;
            }
        });
    });
}

// ==================== 工具函式 ====================

/**
 * 格式化數字（加入千分位）
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化檔案大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * HTML 特殊字元跳脫
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
