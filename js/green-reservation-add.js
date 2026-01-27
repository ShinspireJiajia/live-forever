document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    // 渲染共用元件 (Header + Sidebar)

    if (typeof initCRMLayout === 'function') {

        initCRMLayout();

    }

    

    const sidebarManager = new SidebarManager();

    // ============================================
    // 模擬合約資料 (實際應用中應從後端 API 獲取)
    // ============================================
    const mockContracts = [
        {
            id: 'C-10001',
            type: '公設',
            unit: 'A3-3',
            status: '已生效',
            totalTimes: 12,
            usedTimes: 3,
            remainingTimes: 9,
            summary: '年度綠化養護方案',
            startDate: '2025-01-01',
            endDate: '2025-12-31'
        },
        {
            id: 'C-10002',
            type: '專戶',
            unit: 'A3-3',
            status: '已生效',
            totalTimes: 6,
            usedTimes: 2,
            remainingTimes: 4,
            summary: '季度樹木修剪計畫',
            startDate: '2025-03-01',
            endDate: '2025-08-31'
        },
        {
            id: 'C-10003',
            type: '專戶與公設',
            unit: 'A3-3',
            status: '已失效',
            totalTimes: 4,
            usedTimes: 4,
            remainingTimes: 0,
            summary: '水景設施維護合約',
            startDate: '2024-01-01',
            endDate: '2024-12-31'
        },
        {
            id: 'C-10004',
            type: '專戶',
            unit: 'B2-5',
            status: '已生效',
            totalTimes: 8,
            usedTimes: 1,
            remainingTimes: 7,
            summary: '花園維護服務',
            startDate: '2025-02-01',
            endDate: '2026-01-31'
        },
        {
            id: 'C-10005',
            type: '公設',
            unit: 'C1-1',
            status: '草稿',
            totalTimes: 10,
            usedTimes: 0,
            remainingTimes: 10,
            summary: '景觀植栽保養',
            startDate: '2025-06-01',
            endDate: '2026-05-31'
        }
    ];

    // ============================================
    // 合約選擇功能
    // ============================================
    const unitInput = document.getElementById('unit');
    const contractSelect = document.getElementById('contract');
    const contractHint = document.getElementById('contract-hint');
    let debounceTimer = null;

    // 監聽戶別輸入，自動查詢有效合約
    if (unitInput && contractSelect) {
        unitInput.addEventListener('input', function() {
            // 使用防抖機制，避免頻繁查詢
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const unitValue = unitInput.value.trim();
                updateContractOptions(unitValue);
            }, 300);
        });

        // 監聽合約選擇變更
        contractSelect.addEventListener('change', function() {
            const selectedContract = getContractById(this.value);
            if (selectedContract) {
                contractHint.innerHTML = `<i class="fa-solid fa-circle-info"></i> 合約期間：${selectedContract.startDate} ~ ${selectedContract.endDate}`;
                contractHint.style.color = 'var(--color-info)';
            } else {
                contractHint.textContent = '';
            }
        });
    }

    /**
     * 根據戶別更新合約下拉選單
     * @param {string} unit - 戶別名稱
     */
    function updateContractOptions(unit) {
        // 清空並重置下拉選單
        contractSelect.innerHTML = '';
        contractHint.textContent = '';
        
        if (!unit) {
            contractSelect.innerHTML = '<option value="">請先輸入戶別</option>';
            contractSelect.disabled = true;
            return;
        }

        // 查詢該戶別的有效合約（排除已失效、草稿、待簽署的合約）
        const validContracts = mockContracts.filter(contract => {
            return contract.unit.toLowerCase() === unit.toLowerCase() && 
                   contract.status === '已生效' &&
                   contract.remainingTimes > 0;
        });

        if (validContracts.length === 0) {
            contractSelect.innerHTML = '<option value="">此戶別無可用合約</option>';
            contractSelect.disabled = true;
            contractHint.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> 此戶別目前沒有有效合約或合約次數已用完';
            contractHint.style.color = 'var(--color-warning)';
            return;
        }

        // 填入有效合約選項
        contractSelect.innerHTML = '<option value="">請選擇合約</option>';
        validContracts.forEach(contract => {
            const option = document.createElement('option');
            option.value = contract.id;
            option.textContent = `${contract.id} - ${contract.type} - ${contract.summary} (剩餘 ${contract.remainingTimes} 次)`;
            contractSelect.appendChild(option);
        });
        
        contractSelect.disabled = false;
        contractHint.innerHTML = `<i class="fa-solid fa-circle-check"></i> 找到 ${validContracts.length} 個有效合約`;
        contractHint.style.color = 'var(--color-success)';
    }

    /**
     * 根據合約編號取得合約資料
     * @param {string} contractId - 合約編號
     * @returns {Object|null} 合約資料
     */
    function getContractById(contractId) {
        return mockContracts.find(c => c.id === contractId) || null;
    }

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
            const contract = document.getElementById('contract').value;
            const reservationDate = document.getElementById('reservation-date').value;
            const reservationTime = document.getElementById('reservation-time').value;
            const serviceHours = document.getElementById('service-hours').value;
            const reservationPerson = document.getElementById('reservation-person').value;
            const contactPhone = document.getElementById('contact-phone').value;
            
            if (!unit || !contract || !reservationDate || !reservationTime || !serviceHours || !reservationPerson || !contactPhone) {
                alert('請填寫所有必填欄位！');
                return;
            }
            
            // 驗證合約是否有效
            const selectedContract = getContractById(contract);
            if (!selectedContract || selectedContract.remainingTimes <= 0) {
                alert('所選合約已無可用次數，請選擇其他合約！');
                return;
            }
            
            // 收集表單資料
            const formData = {
                unit: unit,
                contractId: contract,
                contractType: selectedContract.type,
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
