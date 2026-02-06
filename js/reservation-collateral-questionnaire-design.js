// js/reservation-collateral-questionnaire-design.js

document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    // 渲染共用元件 (Header + Sidebar)

    if (typeof initCRMLayout === 'function') {

        initCRMLayout();

    }

    

    const sidebarManager = new SidebarManager();
    let currentEditCard = null; // Track currently edited card
    let currentEditLocationCard = null; // Track currently edited location card

    // 取得 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('name');
    if (projectName) {
        document.getElementById('projectNameDisplay').textContent = decodeURIComponent(projectName);
    }

    // ====================================== 
    // 銀行 Modal 邏輯
    // ======================================
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

    // ====================================== 
    // 對保地址 Modal 邏輯
    // ======================================
    const sectionCollateralLocation = document.getElementById('sectionCollateralLocation');
    const locationCardsGrid = document.querySelector('.location-cards-grid');

    if (sectionCollateralLocation) {
        const btnAddLocation = sectionCollateralLocation.querySelector('.btn-add-location');
        if (btnAddLocation) {
            btnAddLocation.addEventListener('click', function() {
                currentEditLocationCard = null;
                openLocationModal('add');
            });
        }
    }

    // 使用事件委派綁定地點編輯/刪除按鈕
    if (locationCardsGrid) {
        locationCardsGrid.addEventListener('click', function(e) {
            // 編輯地點
            if (e.target.closest('.btn-edit-location')) {
                e.preventDefault();
                currentEditLocationCard = e.target.closest('.location-card');
                const name = currentEditLocationCard.querySelector('.location-name').textContent;
                const addressEl = currentEditLocationCard.querySelector('.location-address');
                // 移除圖示文字，只取地址
                const address = addressEl ? addressEl.textContent.trim().replace(/^.*?\s/, '') : '';
                
                openLocationModal('edit', { name, address });
            }
            
            // 刪除地點
            if (e.target.closest('.btn-delete-location')) {
                e.preventDefault();
                if(confirm('確定要刪除此對保地點嗎？')) {
                    e.target.closest('.location-card').remove();
                }
            }
        });
    }

    // 儲存設定按鈕
    document.getElementById('btnSaveConfig').addEventListener('click', function() {
        alert('設定已儲存！');
        window.location.href = 'crm-project.html';
    });

    // ====================================== 
    // 銀行 Modal 元素與功能
    // ======================================
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

    // ====================================== 
    // 對保地址 Modal 元素與功能
    // ======================================
    const locationModal = document.getElementById('locationModal');
    const locationModalCloseBtn = locationModal ? locationModal.querySelector('.modal-close') : null;
    const locationModalCancelBtn = document.getElementById('btnLocationCancel');
    const locationModalSaveBtn = document.getElementById('btnLocationSave');

    // 關閉地點 Modal
    function closeLocationModal() {
        if (locationModal) {
            locationModal.classList.remove('active');
        }
        currentEditLocationCard = null;
    }
    
    if (locationModalCloseBtn) locationModalCloseBtn.addEventListener('click', closeLocationModal);
    if (locationModalCancelBtn) locationModalCancelBtn.addEventListener('click', closeLocationModal);

    // 打開地點 Modal
    function openLocationModal(mode, data = null) {
        const title = document.getElementById('locationModalTitle');
        const form = document.getElementById('locationForm');
        
        if (form) form.reset();
        
        if (mode === 'add') {
            title.textContent = '新增對保地點';
        } else {
            title.textContent = '編輯對保地點';
            if (data) {
                document.getElementById('locationName').value = data.name;
                document.getElementById('locationAddress').value = data.address;
            }
        }
        
        if (locationModal) {
            locationModal.classList.add('active');
        }
    }

    // 儲存地點
    if (locationModalSaveBtn) {
        locationModalSaveBtn.addEventListener('click', function() {
            const name = document.getElementById('locationName').value;
            const address = document.getElementById('locationAddress').value;
            
            if (!name) {
                alert('請輸入地點名稱');
                return;
            }
            if (!address) {
                alert('請輸入地址');
                return;
            }

            if (currentEditLocationCard) {
                // 更新現有地點
                currentEditLocationCard.querySelector('.location-name').textContent = name;
                currentEditLocationCard.querySelector('.location-address').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${address}`;
            } else {
                // 新增地點卡片（插入在「其他」卡片之前）
                const otherCard = locationCardsGrid.querySelector('.location-card-other');
                const card = document.createElement('div');
                card.className = 'location-card';
                
                const locationId = 'location_' + Date.now();

                card.innerHTML = `
                    <div class="location-card-header">
                        <input type="radio" name="collateralLocation" value="${locationId}" disabled>
                        <h4 class="location-name">${name}</h4>
                    </div>
                    <div class="location-card-body">
                        <p class="location-address"><i class="fa-solid fa-location-dot"></i> ${address}</p>
                    </div>
                    <div class="card-overlay-actions">
                        <button class="btn-sm btn-edit-location">編輯</button>
                        <button class="btn-sm btn-delete-location">刪除</button>
                    </div>
                `;
                
                // 插入在「其他」選項之前
                if (otherCard) {
                    locationCardsGrid.insertBefore(card, otherCard);
                } else {
                    locationCardsGrid.appendChild(card);
                }
            }

            closeLocationModal();
        });
    }
});
