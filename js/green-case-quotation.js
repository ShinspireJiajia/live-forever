/**
 * 綠海報修個案單報價單頁面 JavaScript
 * @file green-case-quotation.js
 * @description 處理報價單明細編輯、金額計算、狀態管理等功能
 */

// ==================== 全域變數 ====================

// 目前報價單資料
let currentQuotation = {
    quotationNo: '',
    caseNo: '',
    customerName: '',
    projectName: '',
    houseId: '',
    repairDescription: '',
    quotationDate: '',
    expiryDate: '',
    status: '草稿',
    items: [],
    notes: '',
    includeTax: false,
    taxRate: 0.05
};

// 頁面模式：add（新增）、edit（編輯）、view（檢視）
let pageMode = 'add';

// 項目列 ID 計數器
let rowIdCounter = 0;

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    // 解析 URL 參數
    parseUrlParams();
    
    // 初始化事件監聽
    initEventListeners();
    
    // 初始化表格事件
    initTableEvents();
    
    // 計算金額
    calculateTotal();
    
    // 根據模式設定頁面
    setPageMode();
    
    console.log('報價單頁面初始化完成');
});

// ==================== URL 參數處理 ====================

/**
 * 解析 URL 參數
 */
function parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    pageMode = urlParams.get('mode') || 'add';
    currentQuotation.caseNo = urlParams.get('caseNo') || '';
    currentQuotation.quotationNo = urlParams.get('quotationNo') || '';
    
    const quotationId = urlParams.get('id');
    
    // 設定個案單號
    if (currentQuotation.caseNo) {
        document.getElementById('caseNo').textContent = currentQuotation.caseNo;
    }
    
    // 如果是編輯或檢視模式，載入資料
    if ((pageMode === 'edit' || pageMode === 'view') && quotationId) {
        loadQuotationData(quotationId);
    } else if (pageMode === 'add' && currentQuotation.quotationNo) {
        // 新增模式，設定報價單號
        document.getElementById('quotationNo').textContent = currentQuotation.quotationNo;
        
        // 設定預設日期
        const today = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(today.getDate() + 30);
        
        document.getElementById('quotationDate').value = formatDateForInput(today);
        document.getElementById('expiryDate').value = formatDateForInput(expiryDate);
        
        // 清空明細表格，只保留一行
        clearTableRows();
        addNewRow();
    }
}

/**
 * 載入報價單資料（模擬）
 */
function loadQuotationData(quotationId) {
    // TODO: 實際從後端載入資料
    // 這裡使用模擬資料
    
    const mockData = {
        id: quotationId,
        quotationNo: 'GC-20251204-0001-Q1',
        caseNo: 'GC-20251204-0001',
        customerName: '吳Ｏ嬋',
        projectName: '陸府觀森',
        houseId: 'A1-2',
        repairDescription: '庭院角落的植栽出現枯萎現象，需要進行更換處理。',
        quotationDate: '2025-12-04',
        expiryDate: '2026-01-03',
        status: '已確認',
        items: [
            { itemName: '桂花樹（高度120cm）', unit: '株', qty: 3, price: 1500, remark: '' },
            { itemName: '培養土', unit: '包', qty: 5, price: 150, remark: '' },
            { itemName: '施工工資', unit: '式', qty: 1, price: 8000, remark: '含運費' },
            { itemName: '廢棄物清運', unit: '式', qty: 1, price: 2500, remark: '' }
        ],
        notes: '1. 報價有效期限為30天。\n2. 付款方式：完工後一次付清。\n3. 植栽保固期限：三個月（人為因素除外）。\n4. 如有任何問題，歡迎來電洽詢。',
        includeTax: false
    };
    
    // 填入資料
    document.getElementById('quotationNo').textContent = mockData.quotationNo;
    document.getElementById('caseNo').textContent = mockData.caseNo;
    document.getElementById('customerName').textContent = mockData.customerName;
    document.getElementById('projectName').textContent = mockData.projectName;
    document.getElementById('houseId').textContent = mockData.houseId;
    document.getElementById('repairDescription').textContent = mockData.repairDescription;
    document.getElementById('quotationDate').value = mockData.quotationDate;
    document.getElementById('expiryDate').value = mockData.expiryDate;
    document.getElementById('quotationStatus').value = mockData.status;
    document.getElementById('quotationNotes').value = mockData.notes;
    document.getElementById('includeTax').checked = mockData.includeTax;
    
    // 清空並重建明細表格
    clearTableRows();
    mockData.items.forEach(item => {
        addNewRow(item);
    });
    
    // 計算金額
    calculateTotal();
    
    currentQuotation = mockData;
}

/**
 * 根據模式設定頁面
 */
function setPageMode() {
    const isViewMode = pageMode === 'view';
    
    // 檢視模式下禁用所有輸入
    if (isViewMode) {
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = true;
        });
        
        // 隱藏操作按鈕
        document.querySelectorAll('.btn-remove-row, #btnAddRow').forEach(el => {
            el.style.display = 'none';
        });
        
        // 修改儲存按鈕文字
        document.querySelectorAll('#btnSave, #btnSaveBottom').forEach(btn => {
            btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> 編輯';
            btn.onclick = function() {
                window.location.href = `green-case-quotation.html?mode=edit&id=${currentQuotation.id}&caseNo=${currentQuotation.caseNo}`;
            };
        });
    }
}

// ==================== 事件監聽 ====================

/**
 * 初始化事件監聯
 */
function initEventListeners() {
    // 返回按鈕
    const btnBack = document.getElementById('btnBack');
    const btnBackBottom = document.getElementById('btnBackBottom');
    
    if (btnBack) {
        btnBack.addEventListener('click', goBack);
    }
    if (btnBackBottom) {
        btnBackBottom.addEventListener('click', goBack);
    }
    
    // 儲存按鈕
    const btnSave = document.getElementById('btnSave');
    const btnSaveBottom = document.getElementById('btnSaveBottom');
    
    if (btnSave) {
        btnSave.addEventListener('click', saveQuotation);
    }
    if (btnSaveBottom) {
        btnSaveBottom.addEventListener('click', saveQuotation);
    }
    
    // 列印按鈕
    const btnPrint = document.getElementById('btnPrint');
    if (btnPrint) {
        btnPrint.addEventListener('click', printQuotation);
    }
    
    // 新增項目按鈕
    const btnAddRow = document.getElementById('btnAddRow');
    if (btnAddRow) {
        btnAddRow.addEventListener('click', () => addNewRow());
    }
    
    // 含稅選項
    const includeTax = document.getElementById('includeTax');
    if (includeTax) {
        includeTax.addEventListener('change', calculateTotal);
    }
}

/**
 * 初始化表格事件
 */
function initTableEvents() {
    const tbody = document.getElementById('quotationDetailBody');
    
    // 使用事件委派處理表格內的事件
    tbody.addEventListener('input', function(e) {
        const target = e.target;
        
        // 數量或單價變更時重新計算
        if (target.name === 'qty' || target.name === 'price') {
            const row = target.closest('tr');
            calculateRowAmount(row);
            calculateTotal();
        }
    });
    
    tbody.addEventListener('click', function(e) {
        const target = e.target.closest('.btn-remove-row');
        
        if (target) {
            const row = target.closest('tr');
            removeRow(row);
        }
    });
    
    // 初始化現有行的 ID
    document.querySelectorAll('#quotationDetailBody tr').forEach(row => {
        const rowId = parseInt(row.dataset.rowId) || 0;
        if (rowId > rowIdCounter) {
            rowIdCounter = rowId;
        }
    });
}

// ==================== 表格操作 ====================

/**
 * 清空表格列
 */
function clearTableRows() {
    const tbody = document.getElementById('quotationDetailBody');
    tbody.innerHTML = '';
    rowIdCounter = 0;
}

/**
 * 新增項目列
 */
function addNewRow(itemData = null) {
    rowIdCounter++;
    const rowId = rowIdCounter;
    
    const tbody = document.getElementById('quotationDetailBody');
    const rowCount = tbody.querySelectorAll('tr').length + 1;
    
    const newRow = document.createElement('tr');
    newRow.dataset.rowId = rowId;
    
    newRow.innerHTML = `
        <td class="td-no">${rowCount}</td>
        <td class="td-item">
            <input type="text" class="form-control" name="itemName" value="${itemData?.itemName || ''}" placeholder="請輸入品名規格">
        </td>
        <td class="td-unit">
            <input type="text" class="form-control input-center" name="unit" value="${itemData?.unit || ''}" placeholder="單位">
        </td>
        <td class="td-qty">
            <input type="number" class="form-control input-right" name="qty" value="${itemData?.qty || 1}" min="1">
        </td>
        <td class="td-price">
            <input type="number" class="form-control input-right" name="price" value="${itemData?.price || 0}" min="0">
        </td>
        <td class="td-amount">
            <span class="amount-value">${formatNumber((itemData?.qty || 1) * (itemData?.price || 0))}</span>
        </td>
        <td class="td-remark">
            <input type="text" class="form-control" name="remark" value="${itemData?.remark || ''}" placeholder="備註">
        </td>
        <td class="td-action">
            <button type="button" class="btn-remove-row" title="刪除此項">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(newRow);
    
    // 計算該行金額
    calculateRowAmount(newRow);
    calculateTotal();
    
    // 聚焦到品名輸入框
    newRow.querySelector('input[name="itemName"]').focus();
}

/**
 * 刪除項目列
 */
function removeRow(row) {
    const tbody = document.getElementById('quotationDetailBody');
    const rowCount = tbody.querySelectorAll('tr').length;
    
    // 至少保留一行
    if (rowCount <= 1) {
        alert('至少需要保留一項明細');
        return;
    }
    
    row.remove();
    
    // 重新編號
    renumberRows();
    
    // 重新計算總計
    calculateTotal();
}

/**
 * 重新編號
 */
function renumberRows() {
    const tbody = document.getElementById('quotationDetailBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach((row, index) => {
        row.querySelector('.td-no').textContent = index + 1;
    });
}

/**
 * 計算單行金額
 */
function calculateRowAmount(row) {
    const qtyInput = row.querySelector('input[name="qty"]');
    const priceInput = row.querySelector('input[name="price"]');
    const amountSpan = row.querySelector('.amount-value');
    
    const qty = parseFloat(qtyInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    const amount = qty * price;
    
    amountSpan.textContent = formatNumber(amount);
}

/**
 * 計算總金額
 */
function calculateTotal() {
    const tbody = document.getElementById('quotationDetailBody');
    const rows = tbody.querySelectorAll('tr');
    
    let subtotal = 0;
    
    rows.forEach(row => {
        const qtyInput = row.querySelector('input[name="qty"]');
        const priceInput = row.querySelector('input[name="price"]');
        
        const qty = parseFloat(qtyInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        
        subtotal += qty * price;
    });
    
    // 計算稅金
    const includeTax = document.getElementById('includeTax').checked;
    const taxRate = currentQuotation.taxRate;
    let taxAmount = 0;
    let total = subtotal;
    
    if (includeTax) {
        taxAmount = Math.round(subtotal * taxRate);
        total = subtotal + taxAmount;
    }
    
    // 更新顯示
    document.getElementById('subtotal').textContent = 'NT$ ' + formatNumber(subtotal);
    document.getElementById('taxAmount').textContent = 'NT$ ' + formatNumber(taxAmount);
    document.getElementById('totalAmount').textContent = 'NT$ ' + formatNumber(total);
}

// ==================== 儲存與列印 ====================

/**
 * 儲存報價單
 */
function saveQuotation() {
    // 收集表單資料
    const quotationData = collectFormData();
    
    // 驗證資料
    if (!validateQuotation(quotationData)) {
        return;
    }
    
    // TODO: 實際儲存至後端
    console.log('儲存報價單', quotationData);
    
    alert('報價單已儲存！');
    
    // 如果是新增模式，切換為編輯模式
    if (pageMode === 'add') {
        const newUrl = `green-case-quotation.html?mode=edit&id=new&caseNo=${currentQuotation.caseNo}&quotationNo=${quotationData.quotationNo}`;
        history.replaceState(null, '', newUrl);
        pageMode = 'edit';
    }
}

/**
 * 收集表單資料
 */
function collectFormData() {
    const tbody = document.getElementById('quotationDetailBody');
    const rows = tbody.querySelectorAll('tr');
    
    const items = [];
    
    rows.forEach(row => {
        const itemName = row.querySelector('input[name="itemName"]').value;
        const unit = row.querySelector('input[name="unit"]').value;
        const qty = parseFloat(row.querySelector('input[name="qty"]').value) || 0;
        const price = parseFloat(row.querySelector('input[name="price"]').value) || 0;
        const remark = row.querySelector('input[name="remark"]').value;
        
        items.push({
            itemName,
            unit,
            qty,
            price,
            amount: qty * price,
            remark
        });
    });
    
    return {
        quotationNo: document.getElementById('quotationNo').textContent,
        caseNo: document.getElementById('caseNo').textContent,
        quotationDate: document.getElementById('quotationDate').value,
        expiryDate: document.getElementById('expiryDate').value,
        status: document.getElementById('quotationStatus').value,
        items: items,
        notes: document.getElementById('quotationNotes').value,
        includeTax: document.getElementById('includeTax').checked
    };
}

/**
 * 驗證報價單資料
 */
function validateQuotation(data) {
    // 檢查有效期限
    const quotationDate = new Date(data.quotationDate);
    const expiryDate = new Date(data.expiryDate);
    
    if (expiryDate <= quotationDate) {
        alert('有效期限必須晚於報價日期');
        return false;
    }
    
    // 檢查明細項目
    let hasValidItem = false;
    
    for (const item of data.items) {
        if (item.itemName && item.qty > 0 && item.price > 0) {
            hasValidItem = true;
        }
    }
    
    if (!hasValidItem) {
        alert('請至少填寫一項有效的報價明細');
        return false;
    }
    
    return true;
}

/**
 * 列印報價單
 */
function printQuotation() {
    // 隱藏不需列印的元素
    document.body.classList.add('print-mode');
    
    window.print();
    
    // 列印完成後恢復
    document.body.classList.remove('print-mode');
}

// ==================== 導航功能 ====================

/**
 * 返回個案單編輯頁
 */
function goBack() {
    const caseNo = currentQuotation.caseNo || document.getElementById('caseNo').textContent;
    
    // 詢問是否儲存
    if (pageMode !== 'view' && hasUnsavedChanges()) {
        const confirmLeave = confirm('您有未儲存的變更，確定要離開嗎？');
        if (!confirmLeave) {
            return;
        }
    }
    
    // 返回個案單編輯頁
    window.location.href = `green-case-edit.html?caseNo=${caseNo}`;
}

/**
 * 檢查是否有未儲存的變更
 */
function hasUnsavedChanges() {
    // TODO: 實作變更偵測邏輯
    return false;
}

// ==================== 工具函式 ====================

/**
 * 格式化數字（加入千分位）
 */
function formatNumber(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化日期為 input[type="date"] 格式
 */
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
