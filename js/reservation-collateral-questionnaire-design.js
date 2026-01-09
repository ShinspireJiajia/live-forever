// js/reservation-collateral-questionnaire-design.js

document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    const sidebarManager = new SidebarManager();
    let currentEditCard = null; // Track currently edited card

    // 取得 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('name');
    if (projectName) {
        document.getElementById('projectNameDisplay').textContent = decodeURIComponent(projectName);
    }

    // Modal 與操作邏輯
    const sectionBank = document.getElementById('sectionBank');
    const bankCardsGrid = document.querySelector('.bank-cards-grid');

    if (sectionBank) {
        const btnAddBank = sectionBank.querySelector('.btn-add-bank');
        if (btnAddBank) {
            btnAddBank.addEventListener('click', function() {
                currentEditCard = null;
                openBankModal('add');
            });
        }
    }

    // 使用事件委派綁定編輯/刪除按鈕
    if (bankCardsGrid) {
        bankCardsGrid.addEventListener('click', function(e) {
            // 編輯
            if (e.target.closest('.btn-edit-card')) {
                e.preventDefault();
                currentEditCard = e.target.closest('.bank-card');
                const name = currentEditCard.querySelector('.bank-name').textContent;
                const desc = currentEditCard.querySelector('.bank-desc').textContent;
                const linkEl = currentEditCard.querySelector('.bank-link');
                const link = (linkEl && linkEl.getAttribute('href') !== '#') ? linkEl.getAttribute('href') : '';
                
                openBankModal('edit', { name, desc, link });
            }
            
            // 刪除
            if (e.target.closest('.btn-delete-card')) {
                e.preventDefault();
                if(confirm('確定要刪除此銀行嗎？')) {
                    e.target.closest('.bank-card').remove();
                }
            }
        });
    }

    // 儲存設定按鈕
    document.getElementById('btnSaveConfig').addEventListener('click', function() {
        alert('設定已儲存！');
        window.location.href = 'crm-project.html';
    });

    // Modal 元素
    const modal = document.getElementById('bankModal');
    const modalCloseBtn = modal.querySelector('.modal-close');
    const modalCancelBtn = document.getElementById('btnBankCancel');
    const modalSaveBtn = document.getElementById('btnBankSave');

    // 關閉 Modal
    function closeBankModal() {
        modal.classList.remove('active');
        currentEditCard = null;
    }
    
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeBankModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeBankModal);

    // 打開 Modal
    function openBankModal(mode, data = null) {
        const title = document.getElementById('bankModalTitle');
        const form = document.getElementById('bankForm');
        
        form.reset();
        
        if (mode === 'add') {
            title.textContent = '新增銀行';
        } else {
            title.textContent = '編輯銀行';
            if (data) {
                document.getElementById('bankName').value = data.name;
                document.getElementById('bankDesc').value = data.desc;
                document.getElementById('bankLink').value = data.link;
            }
        }
        
        modal.classList.add('active');
    }

    // 儲存銀行
    if (modalSaveBtn) {
        modalSaveBtn.addEventListener('click', function() {
            const name = document.getElementById('bankName').value;
            const desc = document.getElementById('bankDesc').value;
            const link = document.getElementById('bankLink').value;
            
            if (!name) {
                alert('請輸入銀行名稱');
                return;
            }

            if (currentEditCard) {
                // Update existing
                currentEditCard.querySelector('.bank-name').textContent = name;
                currentEditCard.querySelector('.bank-desc').textContent = desc;
                
                const footer = currentEditCard.querySelector('.bank-card-footer');
                if (link && link.trim() !== '') {
                    footer.innerHTML = `<a href="${link}" class="bank-link" target="_blank">前往官網了解更多</a>`;
                } else {
                    footer.innerHTML = '';
                }
            } else {
                // Add new
                const card = document.createElement('div');
                card.className = 'bank-card';
                
                let footerContent = '';
                if (link && link.trim() !== '') {
                    footerContent = `<a href="${link}" class="bank-link" target="_blank">前往官網了解更多</a>`;
                }

                card.innerHTML = `
                    <div class="bank-card-header">
                        <h4 class="bank-name">${name}</h4>
                        <input type="radio" name="bank" disabled>
                    </div>
                    <div class="bank-card-body">
                        <p class="bank-desc">${desc}</p>
                    </div>
                    <div class="bank-card-footer">
                        ${footerContent}
                    </div>
                    <div class="card-overlay-actions">
                        <button class="btn-sm btn-edit-card">編輯</button>
                        <button class="btn-sm btn-delete-card">刪除</button>
                    </div>
                `;
                bankCardsGrid.appendChild(card);
            }

            closeBankModal();
        });
    }
});
