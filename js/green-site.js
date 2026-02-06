document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    // 渲染共用元件 (Header + Sidebar)

    if (typeof initCRMLayout === 'function') {
        initCRMLayout();
    }

    const sidebarManager = new SidebarManager();

    // 綁定搜尋表單提交事件
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('執行搜尋...');
            // 實作搜尋邏輯
            const location = document.getElementById('location-filter').value;
            const staff = document.getElementById('staff-filter').value;
            console.log('搜尋條件:', { location, staff });
            // 可在此加入實際篩選邏輯
        });
        
        searchForm.addEventListener('reset', function() {
            console.log('重置搜尋條件');
        });
    }

    // 點擊外部關閉多選下拉
    document.addEventListener('click', function(e) {
        const container = document.getElementById('staffMultiSelect');
        if (container && !container.contains(e.target)) {
            container.classList.remove('active');
        }
    });
    
    // 點擊 Modal 背景關閉
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    });
    
    // ESC 鍵關閉 Modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        }
    });
});

// 模擬後台人員資料
const mockStaffList = [
    { id: '1', name: '王小明' },
    { id: '2', name: '陳大華' },
    { id: '3', name: '林志強' },
    { id: '4', name: '張建國' },
    { id: '5', name: '李美玲' },
    { id: '6', name: '黃志明' }
];

// 多選下拉選單邏輯
function toggleMultiSelect() {
    const container = document.getElementById('staffMultiSelect');
    container.classList.toggle('active');
}

function updateSelectedText() {
    const container = document.getElementById('staffMultiSelect');
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    const textSpan = container.querySelector('.selected-text');
    
    if (checkboxes.length === 0) {
        textSpan.textContent = '請選擇維護人員...';
        textSpan.style.color = '#999';
    } else {
        const names = Array.from(checkboxes).map(cb => cb.nextElementSibling.textContent);
        textSpan.textContent = names.join(', ');
        textSpan.style.color = '#333';
    }
}

// 編輯維護人員 Modal 相關
function openEditModal(siteName, currentStaff) {
    console.log('開啟編輯 Modal:', siteName, currentStaff);
    
    const modal = document.getElementById('editModal');
    const titleSpan = document.getElementById('editSiteName');
    const dropdown = document.querySelector('#staffMultiSelect .select-dropdown');
    const siteIdInput = document.getElementById('editSiteId');
    
    if (!modal || !titleSpan || !dropdown || !siteIdInput) {
        console.error('Modal 元素未找到');
        return;
    }
    
    titleSpan.textContent = siteName;
    siteIdInput.value = siteName; // 暫存案場名稱作為 ID
    
    // 產生選項
    dropdown.innerHTML = mockStaffList.map(staff => `
        <div class="select-option">
            <input type="checkbox" value="${staff.name}" id="staff_${staff.id}" onchange="updateSelectedText()">
            <label for="staff_${staff.id}">${staff.name}</label>
        </div>
    `).join('');

    // 勾選目前的人員
    if (currentStaff && Array.isArray(currentStaff)) {
        currentStaff.forEach(name => {
            const cb = dropdown.querySelector(`input[value="${name}"]`);
            if (cb) cb.checked = true;
        });
    }
    
    updateSelectedText();
    
    // 顯示 Modal
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

function toggleOption(optionDiv) {
    // 點擊 div 時切換 checkbox
    const checkbox = optionDiv.querySelector('input[type="checkbox"]');
    // 如果事件源不是 checkbox 本身，才切換
    if (event.target !== checkbox && event.target.tagName !== 'LABEL') {
        checkbox.checked = !checkbox.checked;
    }
    updateSelectedText();
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.getElementById('staffMultiSelect').classList.remove('active');
}

function saveEdit() {
    const container = document.getElementById('staffMultiSelect');
    const siteName = document.getElementById('editSiteId').value;
    const selectedStaff = [];
    
    container.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        selectedStaff.push(cb.value);
    });
    
    console.log(`儲存案場 [${siteName}] 維護人員:`, selectedStaff);
    
    // 更新表格顯示
    updateTableStaff(siteName, selectedStaff);
    
    closeEditModal();
    alert('儲存成功！');
}

function updateTableStaff(siteName, newStaffList) {
    const table = document.querySelector('.data-table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const nameCell = row.cells[0];
        if (nameCell && nameCell.textContent.trim() === siteName) {
            // 更新維護人員欄位 (第 6 欄，索引 5)
            const staffCell = row.cells[5];
            if (staffCell) {
                staffCell.textContent = newStaffList.join(', ');
            }
            
            // 更新編輯按鈕的 onclick 參數
            const editBtn = row.querySelector('.btn-table-edit');
            if (editBtn && editBtn.getAttribute('onclick')?.includes('openEditModal')) {
                // 重新組裝 onclick 字串: openEditModal('SiteName', ['A', 'B'])
                const staffArrayStr = JSON.stringify(newStaffList);
                editBtn.setAttribute('onclick', `openEditModal('${siteName}', ${staffArrayStr})`);
            }
        }
    });
}

// 維護時段 Modal 相關
function openTimeSlotModal(siteName) {
    const modal = document.getElementById('timeSlotModal');
    const titleSpan = document.getElementById('timeSlotSiteName');
    
    if (!modal || !titleSpan) {
        console.error('維護時段 Modal 元素未找到');
        return;
    }
    
    titleSpan.textContent = siteName;
    // 這裡可以載入該案場目前的設定值
    
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeTimeSlotModal() {
    const modal = document.getElementById('timeSlotModal');
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

function saveTimeSlot() {
    const limit = document.getElementById('dailyLimit').value;
    console.log('儲存維護時段設定, 上限:', limit);
    // 這裡加入實際的儲存邏輯
    
    closeTimeSlotModal();
    alert('維護時段設定已儲存！');
}

// 移除舊的 window.onclick，已在 DOMContentLoaded 中處理
