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
        
        // 標記當前頁面 (指向父層列表)
        const currentLink = greenMenu.querySelector('a[href="green-contract.html"]');
        if (currentLink) {
            currentLink.parentElement.classList.add('active');
        }
    }

    // 檔案上傳模擬
    setupFileUpload('contractFile', 'contractFileDisplay');
    setupFileUpload('inspectionFile', 'inspectionFileDisplay');

    // 處理 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const contractId = urlParams.get('id');
    const mode = urlParams.get('mode');

    if (contractId && (mode === 'view' || mode === 'edit')) {
        loadContractData(contractId, mode);
    }
});

function setupFileUpload(inputId, displayId) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    
    if (input && display) {
        input.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                display.style.display = 'flex';
                display.querySelector('.file-name').textContent = e.target.files[0].name;
            }
        });
    }
}

function loadContractData(id, mode) {
    // 模擬資料
    const mockData = {
        'C-10001': {
            type: '公設',
            contractId: 'C-10001',
            status: '待簽署',
            year: '2025',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            staff: '王小明',
            summary: '年度綠化養護方案第二季',
            amount: '120000',
            maxReservations: '12',
            months: ['1', '4', '7', '10'],
            scope: '中庭花園、頂樓空中花園',
            households: ['A3-3'],
            contacts: ['王小明']
        },
        'C-10002': {
            type: '專戶',
            contractId: 'C-10002',
            status: '已生效',
            year: '2025',
            startDate: '2025-02-01',
            endDate: '2025-11-30',
            staff: '陳大華',
            summary: '季度樹木修剪計畫',
            amount: '45000',
            maxReservations: '4',
            months: ['2', '5', '8'],
            scope: '私人庭院',
            households: ['B2-5'],
            contacts: ['陳大華']
        },
        'C-10003': {
            type: '專戶與公設',
            contractId: 'C-10003',
            status: '草稿',
            year: '2025',
            startDate: '2025-03-01',
            endDate: '2025-12-31',
            staff: '林志強',
            summary: '水景設施維護合約',
            amount: '78500',
            maxReservations: '6',
            months: ['3', '6', '9', '12'],
            scope: '中庭水池、入口噴泉',
            households: ['C1-1'],
            contacts: ['林志強']
        },
        'C-10004': {
            type: '公設',
            contractId: 'C-10004',
            status: '已失效',
            year: '2024',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            staff: '王小明',
            summary: '2024年度綠化養護',
            amount: '110000',
            maxReservations: '12',
            months: ['1', '4', '7', '10'],
            scope: '全社區植栽',
            households: ['D4-9'],
            contacts: ['王小明']
        },
        'C-10005': {
            type: '專戶',
            contractId: 'C-10005',
            status: '作廢',
            year: '2025',
            startDate: '2025-06-01',
            endDate: '2025-12-31',
            staff: '陳大華',
            summary: '臨時樹木移植工程',
            amount: '35000',
            maxReservations: '1',
            months: ['6'],
            scope: '後院',
            households: ['E5-2'],
            contacts: ['陳大華']
        }
    };

    const data = mockData[id];
    if (!data) return;

    // 填入資料
    
    // 合約類型
    const typeRadios = document.querySelectorAll('input[name="contract-type"]');
    typeRadios.forEach(radio => {
        if (radio.value === data.type) radio.checked = true;
    });

    // 合約編號
    const idInput = document.querySelector('input[placeholder="自動生成或手動輸入"]');
    if (idInput) idInput.value = data.contractId;

    // 年度
    const yearSelect = document.getElementById('contractYear') || document.querySelector('select.form-control'); 
    if (yearSelect) yearSelect.value = data.year;

    // 合約狀態
    const statusSelect = document.getElementById('contractStatus'); 
    if (statusSelect && data.status) statusSelect.value = data.status;

    // 合約期間
    const dateInputs = document.querySelectorAll('.contract-period input[type="date"]');
    if (dateInputs.length === 2) {
        dateInputs[0].value = data.startDate;
        dateInputs[1].value = data.endDate;
    }

    // 維護人員
    const staffSelect = document.getElementById('contractStaff') || document.querySelectorAll('select.form-control')[2]; 
    if (staffSelect) staffSelect.value = data.staff;

    // 合約摘要
    const summaryTextarea = document.querySelector('textarea');
    if (summaryTextarea) summaryTextarea.value = data.summary;

    // 費用
    const amountInput = document.querySelector('input[placeholder="請輸入費用金額"]');
    if (amountInput) amountInput.value = data.amount;

    // 最大預約次數
    const maxReservationsInput = document.querySelector('input[placeholder="請輸入數字"]');
    if (maxReservationsInput) maxReservationsInput.value = data.maxReservations;

    // 可預約月份
    const monthCheckboxes = document.querySelectorAll('input[name="month"]');
    monthCheckboxes.forEach(cb => {
        if (data.months.includes(cb.value)) cb.checked = true;
    });

    // 公設範圍
    const scopeInput = document.querySelector('input[placeholder="請輸入公設範圍"]');
    if (scopeInput) scopeInput.value = data.scope;

    // 通知對象
    const contactsCount = document.querySelector('.select-contacts .selected-count');
    if (contactsCount && data.contacts) {
        contactsCount.textContent = `已選擇 ${data.contacts.length} 個通知對象`;
    }

    // 適用戶別
    const householdsCount = document.querySelector('.select-households .selected-count');
    if (householdsCount && data.households) {
        householdsCount.textContent = `已選擇 ${data.households.length} 個戶別`;
    }

    // 根據模式調整 UI
    if (mode === 'view') {
        document.title = '查看合約 - 綠海養護 - 陸府建設 CRM';
        document.querySelector('.page-title').textContent = '查看合約';
        
        // 禁用所有輸入
        const inputs = document.querySelectorAll('input, select, textarea, button:not(.header-toggle):not(.modal-close)');
        inputs.forEach(input => {
            if (input.classList.contains('btn-cancel')) return; // 保留取消按鈕
            input.disabled = true;
        });

        // 隱藏上傳按鈕
        const uploadBtns = document.querySelectorAll('.upload-btn');
        uploadBtns.forEach(btn => btn.style.display = 'none');

        // 顯示模擬的已上傳檔案
        document.getElementById('contractFileDisplay').style.display = 'flex';
        document.getElementById('inspectionFileDisplay').style.display = 'flex';

        // 調整按鈕
        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) submitBtn.style.display = 'none';
        
        const cancelBtn = document.querySelector('.btn-cancel');
        if (cancelBtn) {
            cancelBtn.textContent = '返回列表';
            cancelBtn.disabled = false;
        }

        // 禁用選擇按鈕
        const selectBtns = document.querySelectorAll('.select-contacts-btn, .select-households-btn');
        selectBtns.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        });

    } else if (mode === 'edit') {
        document.title = '編輯合約 - 綠海養護 - 陸府建設 CRM';
        document.querySelector('.page-title').textContent = '編輯合約';
        
        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) submitBtn.textContent = '儲存變更';

        // 顯示模擬的已上傳檔案
        document.getElementById('contractFileDisplay').style.display = 'flex';
        document.getElementById('inspectionFileDisplay').style.display = 'flex';
    }
}
