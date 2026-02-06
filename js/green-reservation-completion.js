// 拍照功能
function takePhoto(previewId) {
    const inputId = previewId + '-input';
    document.getElementById(inputId).click();
}

// 處理照片上傳
function handlePhotoUpload(event, previewId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewDiv = document.getElementById(previewId);
            previewDiv.innerHTML = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            previewDiv.appendChild(img);
        }
        reader.readAsDataURL(file);
    }
}

// 簽名功能
function initSignatureCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // 調整 canvas 大小以適應容器
    function resizeCanvas() {
        const parent = canvas.parentElement;
        const rect = parent.getBoundingClientRect();
        // 減去 padding 和 border
        const width = rect.width - 32; // 假設 padding 是 16px * 2
        canvas.width = width;
        // 高度保持固定或比例
        // canvas.height = 150; 
        
        // 重繪背景
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // 初始調整
    // resizeCanvas(); // 暫時不自動調整，避免清除內容，實際專案可能需要更複雜的處理
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    // 設置畫布背景為白色
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 設置畫筆樣式
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    function getCoords(e) {
        const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.offsetX,
            y: e.offsetY
        };
    }

    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        const { x, y } = getCoords(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getCoords(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // 滑鼠事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // 觸控事件
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
}

// 清除簽名
function clearSignature(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 切換住戶簽名區塊的啟用/停用狀態
function toggleResidentSignature() {
    const skipCheckbox = document.getElementById('skipResidentSignature');
    const overlay = document.getElementById('residentSignatureDisabledOverlay');
    const canvas = document.getElementById('resident-signature');
    
    if (skipCheckbox && overlay && canvas) {
        if (skipCheckbox.checked) {
            // 勾選「無需簽名」時，顯示遮罩層並停用簽名板
            overlay.style.display = 'flex';
            canvas.style.pointerEvents = 'none';
        } else {
            // 取消勾選時，隱藏遮罩層並啟用簽名板
            overlay.style.display = 'none';
            canvas.style.pointerEvents = 'auto';
        }
    }
}

// 提交表單
function submitForm() {
    const itemStructure = [
        {
            section: '客廳區域',
            subSections: [
                {
                    title: '內裝',
                    items: [
                        { name: '玄關門', id: 'entrance-door' },
                        { name: '天花板/牆壁漆面', id: 'ceiling-wall' },
                        { name: '落地窗/鋁窗推拉功能', id: 'window' },
                        { name: '木地板/矽利康', id: 'floor' }
                    ]
                },
                {
                    title: '機電',
                    items: [
                        { name: '電源箱檢測', id: 'power-box' },
                        { name: 'One Touch燈源開關', id: 'light-switch' },
                        { name: '插座功能', id: 'outlet' },
                        { name: '保安燈', id: 'security-light' },
                        { name: '室內對講主機', id: 'intercom' },
                        { name: '冷氣出風口', id: 'ac-vent' }
                    ]
                }
            ]
        },
        {
            section: '景觀陽台',
            subSections: [
                {
                    title: '內裝', // Assuming a title for consistency
                    items: [
                        { name: '地排水檢測', id: 'drainage' },
                        { name: '燈具/插座功能', id: 'balcony-light' }
                    ]
                }
            ]
        },
        {
            section: '廚房',
            subSections: [
                {
                    title: '內裝',
                    items: [
                        { name: '天花板/牆壁漆面', id: 'kitchen-ceiling' },
                        { name: '壁磚', id: 'kitchen-tile' },
                        { name: '三合一鋁門', id: 'kitchen-door' },
                        { name: '櫥櫃', id: 'cabinet' },
                        { name: '人造石檯面', id: 'countertop' }
                    ]
                },
                {
                    title: '機電',
                    items: [
                        { name: '給排水檢測', id: 'kitchen-plumbing' },
                        { name: '蒸烤爐功能', id: 'oven' },
                        { name: '排油煙機功能', id: 'hood' },
                        { name: '洗碗機功能', id: 'dishwasher' }
                    ]
                }
            ]
        },
        {
            section: '浴室',
            subSections: [
                {
                    title: '主浴室',
                    items: [
                        { name: '天花板', id: 'master-bath-ceiling' },
                        { name: '壁/地磚', id: 'master-bath-tile' },
                        { name: '門扇', id: 'master-bath-door' },
                        { name: '鏡箱/鏡櫃', id: 'master-bath-mirror' },
                        { name: '淋浴玻璃', id: 'master-bath-shower' }
                    ]
                },
                {
                    title: '機電',
                    items: [
                        { name: '燈具/插座功能', id: 'bath-light' },
                        { name: '緊急壓扣', id: 'emergency-button' },
                        { name: '暖風機', id: 'heater' },
                        { name: '給排水檢測', id: 'bath-plumbing' }
                    ]
                }
            ]
        },
        {
            section: '主臥室',
            subSections: [
                {
                    title: '內裝',
                    items: [
                        { name: '天花板/牆壁漆面', id: 'master-ceiling' },
                        { name: '門扇/窗戶功能', id: 'master-door' },
                        { name: '木地板', id: 'master-floor' }
                    ]
                },
                {
                    title: '機電',
                    items: [
                        { name: '燈具/插座功能', id: 'master-light' },
                        { name: '冷氣出風口', id: 'master-ac' }
                    ]
                }
            ]
        },
        {
            section: '用電安全須知檢查項目',
            subSections: [
                {
                    title: '', // No sub-section title
                    items: [
                        { name: '電器插頭正常插牢', id: 'plug' },
                        { name: '插座無損壞', id: 'socket-damage' },
                        { name: '插頭無焦黑', id: 'plug-burn' },
                        { name: '插座無累積塵埃造成通電不良', id: 'socket-dust' },
                        { name: '延長電線無綑綁造成發熱', id: 'extension' },
                        { name: '電線無壓在重物下', id: 'wire-pressure' }
                    ]
                }
            ]
        }
    ];

    const formData = {
        inspectionDate: document.getElementById('inspection-date').value,
        houseNumber: document.getElementById('house-number').value,
        residentName: document.getElementById('resident-name').value,
        sections: [],
        residentSignature: '',
        managerSignature: ''
    };

    itemStructure.forEach(sectionInfo => {
        const sectionData = { title: sectionInfo.section, subSections: [] };
        sectionInfo.subSections.forEach(subSectionInfo => {
            const subSectionData = { title: subSectionInfo.title, items: [] };
            subSectionInfo.items.forEach(item => {
                const statusEl = document.querySelector(`input[name="${item.id}-status"]:checked`);
                const notesEl = document.getElementById(`${item.id}-notes`);
                const photoPreviewEl = document.getElementById(`${item.id}-photo`);
                const photoImgEl = photoPreviewEl ? photoPreviewEl.querySelector('img') : null;

                subSectionData.items.push({
                    name: item.name,
                    status: statusEl ? statusEl.value : '未檢查',
                    notes: notesEl ? notesEl.value : '',
                    photo: photoImgEl ? photoImgEl.src : ''
                });
            });
            sectionData.subSections.push(subSectionData);
        });
        formData.sections.push(sectionData);
    });

    // 檢查必填項目
    if (!formData.inspectionDate || !formData.houseNumber || !formData.residentName) {
        alert('請填寫完整的檢查日期、戶號和住戶姓名。');
        return;
    }

    // 收集並檢查簽名
    const residentSignatureCanvas = document.getElementById('resident-signature');
    const managerSignatureCanvas = document.getElementById('manager-signature');

    function isCanvasEmpty(canvas) {
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let isEmpty = true;
        for (let i = 0; i < data.length; i += 4) {
            // Check if pixel is not white (and not fully transparent)
            if (data[i] !== 255 || data[i+1] !== 255 || data[i+2] !== 255) {
                isEmpty = false;
                break;
            }
        }
        return isEmpty;
    }


    if (isCanvasEmpty(residentSignatureCanvas)) {
        alert('請住戶簽名確認。');
        return;
    }
    if (isCanvasEmpty(managerSignatureCanvas)) {
        alert('請品服部主任簽名確認。');
        return;
    }

    formData.residentSignature = residentSignatureCanvas.toDataURL();
    formData.managerSignature = managerSignatureCanvas.toDataURL();

    // 將資料儲存到 localStorage
    localStorage.setItem('inspectionData', JSON.stringify(formData));

    // 顯示成功訊息並跳轉
    alert('完工確認單已提交成功！');
    window.location.href = 'green-reservation.html';
}

// 設置當前日期為預設值 & 初始化簽名版
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    document.getElementById('inspection-date').value = `${year}-${month}-${day}`;

    initSignatureCanvas('resident-signature');
    initSignatureCanvas('manager-signature');
    
    // 初始化住戶簽名區塊的狀態（預設勾選無需簽名）
    toggleResidentSignature();
});
