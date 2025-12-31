/**
 * 報價單確認頁面 JavaScript
 * @file green-quotation-confirm.js
 * @description 處理報價單確認頁面的簽名功能與表單提交
 */

// ==================== 全域變數 ====================

// 簽名畫布相關變數
let canvas, ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hasSignature = false;

// ==================== 模擬資料 ====================

/**
 * 模擬報價單資料
 * 實際使用時應從後端 API 取得
 */
const mockQuotationData = {
    quotationNo: 'GC-20251229-0001-Q1',
    customerName: '王大明',
    projectName: '陸府原森',
    unitNo: 'A1-12F',
    quotationDate: '2025/12/29',
    validDate: '2026/01/28',
    contactPhone: '0912-345-678',
    description: '庭院植栽枯萎更換及草皮修補',
    items: [
        {
            no: 1,
            name: '桂花（高度 150cm）',
            unit: '株',
            qty: 2,
            price: 1500,
            remark: '含種植'
        },
        {
            no: 2,
            name: '七里香（高度 80cm）',
            unit: '株',
            qty: 5,
            price: 600,
            remark: '含種植'
        },
        {
            no: 3,
            name: '草皮修補',
            unit: '式',
            qty: 1,
            price: 2500,
            remark: '約 3 坪'
        },
        {
            no: 4,
            name: '工資',
            unit: '式',
            qty: 1,
            price: 3000,
            remark: ''
        }
    ],
    remarks: [
        '本報價單有效期限為 30 天，逾期需重新報價。',
        '付款方式：線上信用卡付款或銀行轉帳。',
        '植栽更換保固期限為 3 個月。',
        '施工時間將於確認付款後另行通知。'
    ]
};

// ==================== 初始化 ====================

/**
 * 頁面載入完成後初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    initPage();
    initSignatureCanvas();
    bindEvents();
});

/**
 * 初始化頁面資料
 */
function initPage() {
    // 載入報價單資料
    loadQuotationData(mockQuotationData);
}

/**
 * 載入報價單資料到頁面
 * @param {Object} data - 報價單資料
 */
function loadQuotationData(data) {
    // 填入基本資訊
    document.getElementById('quotationNo').textContent = data.quotationNo;
    document.getElementById('customerName').textContent = data.customerName;
    document.getElementById('projectName').textContent = data.projectName;
    document.getElementById('unitNo').textContent = data.unitNo;
    document.getElementById('quotationDate').textContent = data.quotationDate;
    document.getElementById('validDate').textContent = data.validDate;
    document.getElementById('contactPhone').textContent = data.contactPhone;
    document.getElementById('description').textContent = data.description;

    // 產生報價明細表格
    renderDetailTable(data.items);

    // 計算並顯示金額
    calculateTotal(data.items);

    // 產生備註說明
    renderRemarks(data.remarks);

    // 更新彈窗中的報價單號
    document.getElementById('modalQuotationNo').textContent = data.quotationNo;
}

/**
 * 產生報價明細表格
 * @param {Array} items - 報價明細項目
 */
function renderDetailTable(items) {
    const tbody = document.getElementById('detailBody');
    tbody.innerHTML = '';

    items.forEach(item => {
        const amount = item.qty * item.price;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.no}</td>
            <td>${item.name}</td>
            <td>${item.unit}</td>
            <td>${item.qty}</td>
            <td>${formatCurrency(item.price)}</td>
            <td>${formatCurrency(amount)}</td>
            <td>${item.remark || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * 計算並顯示金額匯總
 * @param {Array} items - 報價明細項目
 */
function calculateTotal(items) {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const taxRate = 0.05;
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `NT$ ${formatNumber(subtotal)}`;
    document.getElementById('tax').textContent = `NT$ ${formatNumber(tax)}`;
    document.getElementById('total').textContent = `NT$ ${formatNumber(total)}`;
}

/**
 * 產生備註說明
 * @param {Array} remarks - 備註項目
 */
function renderRemarks(remarks) {
    const container = document.getElementById('remarkContent');
    const ul = container.querySelector('ul');
    ul.innerHTML = '';

    remarks.forEach(remark => {
        const li = document.createElement('li');
        li.textContent = remark;
        ul.appendChild(li);
    });
}

// ==================== 簽名畫布功能 ====================

/**
 * 初始化簽名畫布
 */
function initSignatureCanvas() {
    canvas = document.getElementById('signatureCanvas');
    ctx = canvas.getContext('2d');

    // 設定畫布實際尺寸（處理高解析度螢幕）
    resizeCanvas();

    // 設定畫筆樣式
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 監聽視窗大小變化
    window.addEventListener('resize', resizeCanvas);
}

/**
 * 調整畫布尺寸
 */
function resizeCanvas() {
    const wrapper = canvas.parentElement;
    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // 設定畫布實際尺寸
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;

    // 設定 CSS 尺寸
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '200px';

    // 縮放畫布以匹配解析度
    ctx.scale(dpr, dpr);

    // 重新設定畫筆樣式
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

/**
 * 綁定事件
 */
function bindEvents() {
    // 簽名畫布事件
    bindCanvasEvents();

    // 清除簽名按鈕
    document.getElementById('clearSignature').addEventListener('click', clearSignature);

    // 同意條款核取方塊
    document.getElementById('agreeCheckbox').addEventListener('change', updateSubmitButton);

    // 提交按鈕
    document.getElementById('submitBtn').addEventListener('click', handleSubmit);

    // 前往付款按鈕
    document.getElementById('goPaymentBtn').addEventListener('click', goToPayment);
}

/**
 * 綁定畫布繪圖事件
 */
function bindCanvasEvents() {
    // 滑鼠事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // 觸控事件
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
}

/**
 * 開始繪圖
 * @param {MouseEvent} e - 滑鼠事件
 */
function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;

    // 標記畫布為啟用狀態
    canvas.parentElement.classList.add('active');
}

/**
 * 繪製線條
 * @param {MouseEvent} e - 滑鼠事件
 */
function draw(e) {
    if (!isDrawing) return;

    e.preventDefault();
    const pos = getMousePos(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;

    // 標記有簽名
    if (!hasSignature) {
        hasSignature = true;
        canvas.parentElement.classList.add('has-signature');
        updateSubmitButton();
    }
}

/**
 * 停止繪圖
 */
function stopDrawing() {
    isDrawing = false;
    canvas.parentElement.classList.remove('active');
}

/**
 * 處理觸控開始事件
 * @param {TouchEvent} e - 觸控事件
 */
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    startDrawing(mouseEvent);
}

/**
 * 處理觸控移動事件
 * @param {TouchEvent} e - 觸控事件
 */
function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    draw(mouseEvent);
}

/**
 * 取得滑鼠在畫布中的位置
 * @param {MouseEvent} e - 滑鼠事件
 * @returns {Object} 座標物件 { x, y }
 */
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

/**
 * 清除簽名
 */
function clearSignature() {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    hasSignature = false;
    canvas.parentElement.classList.remove('has-signature');
    updateSubmitButton();
}

/**
 * 取得簽名圖片（Base64 格式）
 * @returns {string} Base64 編碼的圖片資料
 */
function getSignatureImage() {
    return canvas.toDataURL('image/png');
}

// ==================== 表單提交 ====================

/**
 * 更新提交按鈕狀態
 */
function updateSubmitButton() {
    const agreeChecked = document.getElementById('agreeCheckbox').checked;
    const submitBtn = document.getElementById('submitBtn');

    if (agreeChecked && hasSignature) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

/**
 * 處理表單提交
 */
function handleSubmit() {
    const agreeChecked = document.getElementById('agreeCheckbox').checked;

    // 驗證
    if (!agreeChecked) {
        alert('請先勾選同意條款');
        return;
    }

    if (!hasSignature) {
        alert('請先簽名');
        return;
    }

    // 顯示確認時間
    const now = new Date();
    const confirmDatetime = formatDatetime(now);
    document.getElementById('confirmDatetime').textContent = confirmDatetime;
    document.getElementById('modalConfirmTime').textContent = confirmDatetime;

    // 收集提交資料
    const submitData = {
        quotationNo: mockQuotationData.quotationNo,
        confirmDatetime: now.toISOString(),
        signature: getSignatureImage()
    };

    console.log('提交資料：', submitData);

    // 模擬提交成功
    // 實際使用時應呼叫後端 API
    setTimeout(() => {
        showSuccessModal();
    }, 500);
}

/**
 * 顯示成功彈窗
 */
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('show');
}

/**
 * 關閉成功彈窗
 */
function hideSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
}

/**
 * 前往付款頁面
 */
function goToPayment() {
    // 實際使用時應導向付款頁面
    alert('即將導向付款頁面...');
    
    // 模擬導向
    // window.location.href = 'payment.html?quotationNo=' + mockQuotationData.quotationNo;
}

// ==================== 工具函式 ====================

/**
 * 格式化數字（加入千分位）
 * @param {number} num - 數字
 * @returns {string} 格式化後的字串
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化貨幣
 * @param {number} amount - 金額
 * @returns {string} 格式化後的金額字串
 */
function formatCurrency(amount) {
    return formatNumber(amount);
}

/**
 * 格式化日期時間
 * @param {Date} date - 日期物件
 * @returns {string} 格式化後的日期時間字串
 */
function formatDatetime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}
