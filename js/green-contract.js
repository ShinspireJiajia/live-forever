document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
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
});

function bindActionButtons() {
    const table = document.querySelector('.data-table');
    if (!table) return;

    table.addEventListener('click', function(e) {
        const target = e.target;
        if (target.classList.contains('action-link')) {
            const row = target.closest('tr');
            const contractId = row.cells[0].textContent.trim();
            const actionText = target.textContent.trim();

            if (actionText === '查看') {
                window.location.href = `green-contract-add.html?id=${contractId}&mode=view`;
            } else if (actionText === '編輯') {
                window.location.href = `green-contract-add.html?id=${contractId}&mode=edit`;
            } else if (actionText === '款項維護') {
                window.location.href = `green-contract-payment.html?id=${contractId}`;
            }
        }
    });
}

