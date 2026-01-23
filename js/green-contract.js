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
        
        // 標記當前頁面
        const currentLink = greenMenu.querySelector('a[href="green-contract.html"]');
        if (currentLink) {
            currentLink.parentElement.classList.add('active');
        }
    }

    // 綁定查看與編輯按鈕事件
    bindActionButtons();
    // 初始化推播 Modal
    initPushModal();
});

function bindActionButtons() {
    const table = document.querySelector('.data-table');
    if (!table) return;

    table.addEventListener('click', function(e) {
        const target = e.target;
        // 支援 btn-table-edit 或 action-link
        if (target.classList.contains('btn-table-edit') || target.classList.contains('action-link')) {
            const row = target.closest('tr');
            if (!row) return;
            
            const contractId = row.cells[0].textContent.trim();
            const actionText = target.textContent.trim();

            if (actionText === '查看') {
                window.location.href = `green-contract-add.html?id=${contractId}&mode=view`;
            } else if (actionText === '編輯') {
                window.location.href = `green-contract-add.html?id=${contractId}&mode=edit`;
            } else if (actionText === '款項維護') {
                window.location.href = `green-contract-payment.html?id=${contractId}`;
            } else if (actionText === '推播' || target.classList.contains('btn-push')) {
                openPushModal(contractId, row);
            }
        }
    });
}

// ============================================
// 推播 Modal 相關邏輯
// ============================================
let currentPushRow = null;

function initPushModal() {
    const pushModal = document.getElementById('pushModal');
    if (!pushModal) return;

    // 關閉按鈕
    const closeBtns = pushModal.querySelectorAll('.close-modal, .close-modal-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closePushModal);
    });

    // 確認發送按鈕
    const confirmBtn = document.getElementById('confirmPushBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handlePushSend);
    }

    // 點擊外部關閉
    pushModal.addEventListener('click', function(e) {
        if (e.target === pushModal) {
            closePushModal();
        }
    });
}

function openPushModal(contractId, row) {
    const pushModal = document.getElementById('pushModal');
    if (!pushModal) return;
    
    currentPushRow = row;
    
    // 填充資料
    const idInput = document.getElementById('pushContractId');
    if (idInput) idInput.value = contractId;
    
    // 預設推播內容
    const messageInput = document.getElementById('pushMessage');
    if (messageInput) {
        const defaultMessage = `親愛的住戶您好：\n\n您的合約 ${contractId} 已經建立，請點擊下方連結進行確認。\n\n感謝您的配合。`;
        messageInput.value = defaultMessage;
    }

    // 顯示 Modal
    pushModal.classList.add('active');
    document.body.classList.add('modal-open');
    
    // 處理 Backdrop
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        document.body.appendChild(backdrop);
    }
    // 讓瀏覽器有時間渲染 backdrop 初始狀態，以便 transition 生效
    requestAnimationFrame(() => {
        backdrop.classList.add('active');
    });
}

function closePushModal() {
    const pushModal = document.getElementById('pushModal');
    if (!pushModal) return;
    
    pushModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.classList.remove('active');
        // 如果是動態生成的 backdrop，可以考慮移除，但這裡保留復用
    }
    currentPushRow = null;
}

function handlePushSend() {
    const contractId = document.getElementById('pushContractId').value;
    const message = document.getElementById('pushMessage').value;

    if (!message.trim()) {
        alert('請輸入推播內容！');
        return;
    }

    // 模擬發送請求
    console.log('Sending push for contract:', contractId);
    console.log('Message:', message);
    
    // 更新介面
    alert('推播發送成功！');
    
    if (currentPushRow) {
        // 更新 "最近推播時間" 欄位
        // 欄位索引: 0:編號, 1:摘要, 2:類型, 3:金額, 4:戶別, 5:日期, 6:月份, 7:狀態, 8:人員, 9:推播時間
        if (currentPushRow.cells.length > 9) {
            const now = new Date();
            const timeString = now.getFullYear() + '-' + 
                              String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(now.getDate()).padStart(2, '0') + ' ' + 
                              String(now.getHours()).padStart(2, '0') + ':' + 
                              String(now.getMinutes()).padStart(2, '0');
            currentPushRow.cells[9].textContent = timeString;
        }
    }

    closePushModal();
}

