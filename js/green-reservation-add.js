document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    const sidebarManager = new SidebarManager();

    // 檔案上傳功能
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    let uploadedFiles = [];

    if (dropZone && fileInput) {
        // 點擊上傳
        dropZone.addEventListener('click', () => fileInput.click());

        // 檔案選擇變更
        fileInput.addEventListener('change', handleFiles);

        // 拖曳效果
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            handleFiles({ target: { files: files } });
        });
    }

    function handleFiles(e) {
        const files = e.target.files;
        if (!files) return;
        
        Array.from(files).forEach(file => {
            if (!uploadedFiles.some(f => f.name === file.name)) {
                uploadedFiles.push(file);
                addFileToList(file);
            }
        });
    }

    function addFileToList(file) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <div class="file-name">
                <i class="fa-regular fa-file"></i>
                <span>${file.name}</span>
            </div>
            <i class="fa-solid fa-times file-remove" title="移除"></i>
        `;

        // 移除檔案功能
        item.querySelector('.file-remove').addEventListener('click', function(e) {
            e.stopPropagation(); // 防止觸發 dropZone 點擊
            uploadedFiles = uploadedFiles.filter(f => f !== file);
            item.remove();
        });

        fileList.appendChild(item);
    }

    // 表單提交功能
    const form = document.getElementById('reservation-form');
    const successModal = document.getElementById('success-modal');
    const closeSuccess = document.getElementById('close-success');
    const confirmSuccess = document.getElementById('confirm-success');
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 檢查必填欄位
            const unit = document.getElementById('unit').value;
            const reservationDate = document.getElementById('reservation-date').value;
            const reservationTime = document.getElementById('reservation-time').value;
            const serviceHours = document.getElementById('service-hours').value;
            const reservationPerson = document.getElementById('reservation-person').value;
            const contactPhone = document.getElementById('contact-phone').value;
            
            if (!unit || !reservationDate || !reservationTime || !serviceHours || !reservationPerson || !contactPhone) {
                alert('請填寫所有必填欄位！');
                return;
            }
            
            // 收集表單資料
            const formData = {
                unit: unit,
                reservationDate: reservationDate,
                reservationTime: reservationTime,
                serviceHours: serviceHours,
                maintenancePerson: document.getElementById('maintenance-person').value,
                reservationPerson: reservationPerson,
                contactPhone: contactPhone,
                remarks: document.getElementById('remarks').value
            };
            
            // 在實際應用中，這裡會發送資料到伺服器
            console.log('表單資料:', formData);
            
            // 顯示成功訊息
            if (successModal) {
                successModal.classList.add('active');
            } else {
                alert('預約資料已成功儲存！');
                window.location.href = 'green-reservation.html';
            }
        });
    }
    
    // 關閉成功提示彈窗
    if (closeSuccess) {
        closeSuccess.addEventListener('click', function() {
            if (successModal) successModal.classList.remove('active');
            window.location.href = 'green-reservation.html';
        });
    }
    
    if (confirmSuccess) {
        confirmSuccess.addEventListener('click', function() {
            if (successModal) successModal.classList.remove('active');
            window.location.href = 'green-reservation.html';
        });
    }
    
    // 取消按鈕功能
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('確定要取消嗎？所有已填寫的資料將會清除。')) {
                window.location.href = 'green-reservation.html';
            }
        });
    }
});
