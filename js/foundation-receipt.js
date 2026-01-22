/**
 * Foundation Receipt Edit Logic
 * 基金會活動 - 收據套印與編輯邏輯
 */

document.addEventListener('DOMContentLoaded', () => {
    initReceiptPage();
});

// 全域變數存放資料
let receiptData = {
    receiptNo: '',
    date: '',
    donorName: '',
    donorId: '',
    amount: 0,
    payMethod: '',
    purpose: '',
    address: ''
};

/**
 * 初始化頁面
 */
function initReceiptPage() {
    loadReceiptData();
    bindEvents();
    // 初始渲染已在 loadReceiptData 中觸發
}

/**
 * 綁定事件
 */
function bindEvents() {
    // 列印按鈕
    const btnPrint = document.getElementById('btnPrint');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            window.print();
        });
    }

    // 返回按鈕
    const btnBack = document.getElementById('btnBack');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            window.history.back();
        });
    }

    // 表單輸入監聽 - 即時更新預覽
    const inputs = document.querySelectorAll('#editForm input, #editForm select, #editForm textarea');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const field = e.target.id;
            const val = e.target.value;
            
            // 更新資料物件
            if (field in receiptData) {
                receiptData[field] = val;
            }
            
            // 特殊處理
            if (field === 'donorName' || field === 'donorId') {
                updateDonorDisplay();
            } else if (field === 'amount') {
                receiptData.amount = val;
                const amtText = val ? `$${Number(val).toLocaleString()}` : '';
                updateElementText('displayAmount1', amtText);
                updateElementText('displayAmount2', amtText);
            } else if (field === 'receiptDate') {
                 const formattedDate = formatConfirmDate(val);
                 updateElementText('displayDate1', formattedDate);
                 updateElementText('displayDate2', formattedDate);
                 
                 // 依據日期重新產生收據編號
                 const newNo = generateReceiptNo(val);
                 setInput('receiptNo', newNo); // 更新輸入框
                 receiptData.receiptNo = newNo; // 更新資料
                 updateElementText('displayReceiptNo1', newNo);
                 updateElementText('displayReceiptNo2', newNo);

            } else {
                // 通用更新
                updateElementText(`display${capitalize(field)}1`, val);
                updateElementText(`display${capitalize(field)}2`, val);
            }
        });
    });
}

function capitalize(s) {
    if(!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * 下載並載入收據資料
 */
function loadReceiptData() {
    // 從 URL 參數獲取資料
    // 活動開始日期
    const eventDate = getQueryParam('eventDate') || new Date().toISOString().split('T')[0];
    
    // 收據編號
    // 規則：YYMMDD001，依據繳費完成日(此處以 eventDate 代表)
    let receiptNo = getQueryParam('receiptNo');
    if (!receiptNo || receiptNo === 'undefined' || receiptNo === '系統尚未產生') {
        receiptNo = generateReceiptNo(eventDate);
    }
    
    receiptData = {
        receiptNo: receiptNo,
        date: formatConfirmDate(eventDate), // 轉換格式 yyyy/mm/dd
        donorName: getQueryParam('donorName') ? decodeURIComponent(getQueryParam('donorName')) : '',
        donorId: getQueryParam('donorId') || '', // 新增 donorId
        amount: getQueryParam('amount') || 0,
        payMethod: getQueryParam('payMethod') ? decodeURIComponent(getQueryParam('payMethod')) : '現金',
        purpose: '活動報名費用',
        address: getQueryParam('address') ? decodeURIComponent(getQueryParam('address')) : ''
    };

    // 填入表單欄位
    setInput('receiptNo', receiptData.receiptNo);
    setInput('receiptDate', receiptData.date);
    setInput('donorName', receiptData.donorName);
    setInput('donorId', receiptData.donorId);
    setInput('amount', receiptData.amount);
    setInput('payMethod', receiptData.payMethod);
    setInput('purpose', receiptData.purpose || ''); // 備註

    // 強制設定 readonly
    document.getElementById('receiptNo').readOnly = true;

    // 初始更新預覽
    updateDonorDisplay();
    updateElementText('displayReceiptNo1', receiptData.receiptNo);
    updateElementText('displayReceiptNo2', receiptData.receiptNo);
    updateElementText('displayDate1', receiptData.date);
    updateElementText('displayDate2', receiptData.date);
    
    const amtText = receiptData.amount ? `$${Number(receiptData.amount).toLocaleString()}` : '';
    updateElementText('displayAmount1', amtText);
    updateElementText('displayAmount2', amtText);
    
    updateElementText('displayPayMethod1', receiptData.payMethod);
    updateElementText('displayPayMethod2', receiptData.payMethod);
    updateElementText('displayPurpose1', receiptData.purpose);
    updateElementText('displayPurpose2', receiptData.purpose);
}

function setInput(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function updateElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function updateDonorDisplay() {
    const name = document.getElementById('donorName').value;
    const id = document.getElementById('donorId').value;
    const text = `${name}  ${id}`;
    updateElementText('displayDonor1', text);
    updateElementText('displayDonor2', text);
}

// 格式化日期 yyyy-mm-dd -> yyyy/mm/dd
function formatConfirmDate(dateStr) {
    if (!dateStr) return '';
    return dateStr.replace(/-/g, '/');
}

/**
 * 產生收據編號
 * 規則：YYMMDD001 (西元後兩碼+月+日+001)
 */
function generateReceiptNo(dateStr) {
    if (!dateStr) return '';
    
    // 嘗試解析日期
    // 支援 yyyy-mm-dd 或 yyyy/mm/dd
    let d = new Date(dateStr);
    
    // 若直接解析失敗
    if (isNaN(d.getTime())) {
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
            d = new Date(parts[0], parts[1] - 1, parts[2]);
        }
    }

    if (isNaN(d.getTime())) return ''; // 無法解析

    const yearFull = d.getFullYear();
    const yearShort = yearFull.toString().slice(-2);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    // 序號固定為 001 (模擬)
    return `${yearShort}${month}${day}001`;
}

/**
 * 取得 URL 查詢參數
 */
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
