/**
 * ============================================
 * 房屋健檢報告頁面 JavaScript
 * 檔案：js/house-checkup-report.js
 * ============================================
 */

// ============================================
// Mock 資料
// ============================================
const mockReservationData = {
    id: 'chk250315001',
    siteName: '陸府原森',
    unit: 'A棟5F',
    residentName: '王大明',
    phone: '0912-345-678',
    checkDate: '2025-03-15',
    timeSlot: '09:00 - 10:00',
    status: '已預約',
    items: {}
};

// 照片儲存物件
const uploadedPhotos = {};

// 簽名相關變數
let signatureCanvas = null;
let signatureCtx = null;
let isDrawing = false;
let hasSignature = false;

// ============================================
// 頁面初始化
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // 初始化共用元件 (Header & Sidebar)
    if (typeof initCRMLayout === 'function') {
        initCRMLayout();
    }

    // 初始化側邊欄邏輯
    if (typeof SidebarManager !== 'undefined') {
        new SidebarManager();
    }

    // 載入基本資訊
    loadReservationInfo();
    
    // 初始化簽名畫布
    initSignatureCanvas();
    
    // 初始化事件監聽器
    initEventListeners();
    
    // 初始化照片上傳
    initPhotoUploads();
});

/**
 * 載入預約資訊
 */
function loadReservationInfo() {
    // 從 URL 取得預約 ID（實際環境從 URL 參數取得）
    const urlParams = new URLSearchParams(window.location.search);
    const reservationId = urlParams.get('id') || mockReservationData.id;
    
    // 填入基本資訊
    document.getElementById('infoSite').textContent = mockReservationData.siteName;
    document.getElementById('infoUnit').textContent = mockReservationData.unit;
    document.getElementById('infoName').textContent = mockReservationData.residentName;
    document.getElementById('infoPhone').textContent = mockReservationData.phone;
    document.getElementById('infoDate').textContent = mockReservationData.checkDate;
    document.getElementById('infoTime').textContent = mockReservationData.timeSlot;
}

/**
 * 初始化事件監聽器
 */
function initEventListeners() {
    // 返回按鈕
    const btnBack = document.getElementById('btnBack');
    if (btnBack) {
        btnBack.addEventListener('click', function() {
            if (confirm('確定要離開嗎？未儲存的內容將會遺失')) {
                history.back();
            }
        });
    }
    
    // 暫存按鈕
    const btnSaveDraft = document.getElementById('btnSaveDraft');
    if (btnSaveDraft) {
        btnSaveDraft.addEventListener('click', saveDraft);
    }
    
    // 完成提交按鈕
    const btnComplete = document.getElementById('btnComplete');
    if (btnComplete) {
        btnComplete.addEventListener('click', completeReport);
    }
    
    // 清除簽名按鈕
    const btnClearSign = document.getElementById('btnClearSign');
    if (btnClearSign) {
        btnClearSign.addEventListener('click', clearSignature);
    }
    
    // 確認簽名按鈕
    const btnConfirmSign = document.getElementById('btnConfirmSign');
    if (btnConfirmSign) {
        btnConfirmSign.addEventListener('click', confirmSignature);
    }
}

/**
 * 初始化照片上傳功能
 */
function initPhotoUploads() {
    // 取得所有照片輸入元素
    const photoInputs = document.querySelectorAll('input[type="file"][accept="image/*"]');
    
    photoInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            handlePhotoUpload(e, this.id.replace('-photo', ''));
        });
    });
}

/**
 * 觸發照片上傳
 * @param {string} itemId - 項目 ID
 */
function triggerPhotoUpload(itemId) {
    const input = document.getElementById(itemId + '-photo');
    if (input) {
        input.click();
    }
}

/**
 * 處理照片上傳
 * @param {Event} e - 事件物件
 * @param {string} itemId - 項目 ID
 */
function handlePhotoUpload(e, itemId) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // 初始化該項目的照片陣列
    if (!uploadedPhotos[itemId]) {
        uploadedPhotos[itemId] = [];
    }
    
    const previewContainer = document.getElementById(itemId + '-preview');
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const photoData = {
                id: Date.now() + Math.random(),
                name: file.name,
                data: e.target.result
            };
            
            uploadedPhotos[itemId].push(photoData);
            
            // 建立預覽元素
            const previewItem = document.createElement('div');
            previewItem.className = 'photo-preview-item';
            previewItem.dataset.photoId = photoData.id;
            previewItem.innerHTML = `
                <img src="${photoData.data}" alt="${file.name}">
                <button type="button" class="remove-photo" onclick="removePhoto('${itemId}', ${photoData.id})">
                    <i class="fa-solid fa-times"></i>
                </button>
            `;
            
            previewContainer.appendChild(previewItem);
        };
        
        reader.readAsDataURL(file);
    });
    
    // 清除輸入以允許重複選擇相同檔案
    e.target.value = '';
}

/**
 * 移除照片
 * @param {string} itemId - 項目 ID
 * @param {number} photoId - 照片 ID
 */
function removePhoto(itemId, photoId) {
    // 從陣列中移除
    if (uploadedPhotos[itemId]) {
        uploadedPhotos[itemId] = uploadedPhotos[itemId].filter(p => p.id !== photoId);
    }
    
    // 從畫面移除
    const previewContainer = document.getElementById(itemId + '-preview');
    const previewItem = previewContainer.querySelector(`[data-photo-id="${photoId}"]`);
    if (previewItem) {
        previewItem.remove();
    }
}

// ============================================
// 簽名功能
// ============================================

/**
 * 初始化簽名畫布
 */
function initSignatureCanvas() {
    signatureCanvas = document.getElementById('signatureCanvas');
    if (!signatureCanvas) return;
    
    signatureCtx = signatureCanvas.getContext('2d');
    
    // 設定畫布尺寸
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 繪圖事件
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);
    
    // 觸控事件
    signatureCanvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        signatureCanvas.dispatchEvent(mouseEvent);
    });
    
    signatureCanvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        signatureCanvas.dispatchEvent(mouseEvent);
    });
    
    signatureCanvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup');
        signatureCanvas.dispatchEvent(mouseEvent);
    });
}

/**
 * 調整畫布尺寸
 */
function resizeCanvas() {
    if (!signatureCanvas) return;
    
    const container = signatureCanvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    signatureCanvas.width = rect.width;
    signatureCanvas.height = rect.height;
    
    // 設定繪圖樣式
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
    signatureCtx.lineJoin = 'round';
    signatureCtx.strokeStyle = '#000000';
}

/**
 * 開始繪製
 * @param {Event} e - 事件物件
 */
function startDrawing(e) {
    isDrawing = true;
    
    // 隱藏提示文字
    const placeholder = document.getElementById('signaturePlaceholder');
    if (placeholder) {
        placeholder.classList.add('hidden');
    }
    
    // 設定區域為活動狀態
    const signatureArea = document.getElementById('signatureArea');
    signatureArea.classList.add('active');
    
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    signatureCtx.beginPath();
    signatureCtx.moveTo(x, y);
}

/**
 * 繪製中
 * @param {Event} e - 事件物件
 */
function draw(e) {
    if (!isDrawing) return;
    
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();
}

/**
 * 停止繪製
 */
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        hasSignature = true;
    }
}

/**
 * 清除簽名
 */
function clearSignature() {
    if (!signatureCtx) return;
    
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    hasSignature = false;
    
    // 顯示提示文字
    const placeholder = document.getElementById('signaturePlaceholder');
    if (placeholder) {
        placeholder.classList.remove('hidden');
    }
    
    // 移除狀態樣式
    const signatureArea = document.getElementById('signatureArea');
    signatureArea.classList.remove('active', 'signed');
}

/**
 * 確認簽名
 */
function confirmSignature() {
    if (!hasSignature) {
        alert('請先進行簽名！');
        return;
    }
    
    const signatureArea = document.getElementById('signatureArea');
    signatureArea.classList.remove('active');
    signatureArea.classList.add('signed');
    
    alert('簽名已確認！');
}

// ============================================
// 資料處理
// ============================================

/**
 * 收集表單資料
 * @returns {Object} 表單資料
 */
function collectFormData() {
    const data = {
        reservation: mockReservationData,
        checkItems: {},
        summary: document.getElementById('summaryNotes').value,
        maintenanceSuggestion: document.getElementById('maintenanceSuggestion').value,
        signature: null,
        photos: uploadedPhotos
    };
    
    // 收集各檢查項目的狀態
    const checkItems = [
        'exterior-wall', 'window-frame', 'balcony',
        'ceiling', 'floor', 'door',
        'electrical', 'plumbing', 'bathroom'
    ];
    
    checkItems.forEach(item => {
        const statusRadio = document.querySelector(`input[name="${item}-status"]:checked`);
        const maintainRadio = document.querySelector(`input[name="${item}-maintain"]:checked`);
        const notes = document.getElementById(item + '-notes');
        
        data.checkItems[item] = {
            status: statusRadio ? statusRadio.value : null,
            maintain: maintainRadio ? maintainRadio.value : null,
            notes: notes ? notes.value : '',
            photos: uploadedPhotos[item] || []
        };
    });
    
    // 取得簽名資料
    if (hasSignature && signatureCanvas) {
        data.signature = signatureCanvas.toDataURL('image/png');
    }
    
    return data;
}

/**
 * 驗證表單
 * @returns {Object} 驗證結果 { valid: boolean, message: string }
 */
function validateForm() {
    const checkItems = [
        'exterior-wall', 'window-frame', 'balcony',
        'ceiling', 'floor', 'door',
        'electrical', 'plumbing', 'bathroom'
    ];
    
    // 檢查所有項目是否都有填寫狀態
    for (const item of checkItems) {
        const statusRadio = document.querySelector(`input[name="${item}-status"]:checked`);
        if (!statusRadio) {
            return { valid: false, message: `請選擇「${getItemLabel(item)}」的檢查狀態` };
        }
    }
    
    // 檢查簽名 (已改為非必填)
    // if (!hasSignature) {
    //     return { valid: false, message: '請完成住戶簽名' };
    // }
    
    return { valid: true, message: '' };
}

/**
 * 取得項目標籤
 * @param {string} itemId - 項目 ID
 * @returns {string} 項目標籤
 */
function getItemLabel(itemId) {
    const labels = {
        'exterior-wall': '外牆磁磚',
        'window-frame': '窗框密封',
        'balcony': '陽台防水',
        'ceiling': '天花板/牆壁',
        'floor': '地板',
        'door': '門窗五金',
        'electrical': '電源箱/插座',
        'plumbing': '給排水管線',
        'bathroom': '衛浴設備'
    };
    return labels[itemId] || itemId;
}

/**
 * 暫存報告
 */
function saveDraft() {
    const formData = collectFormData();
    
    // 儲存到 localStorage（實際環境會送到後端）
    localStorage.setItem('houseCheckupDraft_' + mockReservationData.id, JSON.stringify(formData));
    
    alert('報告已暫存！');
}

/**
 * 完成並提交報告
 */
function completeReport() {
    // 驗證表單
    const validation = validateForm();
    if (!validation.valid) {
        alert(validation.message);
        return;
    }
    
    // 確認提交
    if (!confirm('確定要提交報告嗎？提交後將生成 PDF 報告供住戶下載。')) {
        return;
    }
    
    // 收集資料
    const formData = collectFormData();
    
    // 模擬提交（實際環境會送到後端生成 PDF）
    console.log('提交的報告資料：', formData);
    
    // 顯示成功訊息
    alert('報告提交成功！');
    
    // 顯示下載區塊
    showDownloadSection();
    
    // 隱藏提交按鈕
    const completeSection = document.querySelector('.complete-actions');
    if (completeSection) {
        completeSection.style.display = 'none';
    }
}

/**
 * 顯示下載區塊
 */
function showDownloadSection() {
    const downloadSection = document.getElementById('downloadSection');
    if (!downloadSection) return;
    
    // 設定檔案名稱和日期
    const fileName = `房屋健檢報告_${mockReservationData.unit}_${mockReservationData.checkDate.replace(/-/g, '')}.pdf`;
    const fileDate = new Date().toLocaleString('zh-TW');
    
    document.getElementById('downloadFileName').textContent = fileName;
    document.getElementById('downloadFileDate').textContent = fileDate;
    
    // 顯示區塊
    downloadSection.style.display = 'block';
    
    // 滾動到下載區塊
    downloadSection.scrollIntoView({ behavior: 'smooth' });
}

// 將函數掛載到全域以供 HTML onclick 使用
window.triggerPhotoUpload = triggerPhotoUpload;
window.removePhoto = removePhoto;
window.addSummaryText = addSummaryText;

/**
 * 新增總結文字
 * @param {string} text - 要新增的文字
 */
function addSummaryText(text) {
    const summaryInput = document.getElementById('summaryNotes');
    if (!summaryInput) return;
    
    if (summaryInput.value) {
        summaryInput.value += '、' + text;
    } else {
        summaryInput.value = text;
    }
}
