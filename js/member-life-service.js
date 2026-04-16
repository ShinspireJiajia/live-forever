/**
 * 鄰里生活服務管理 — 後台維護邏輯
 * 依賴：member-life-service-mock-data.js、modal.js、sidebar.js、menu-component.js
 */

/* ============================================================
 * 工具函式
 * ============================================================ */

function getCategoryName(id) {
    const c = mockCategories.find(c => c.id === id);
    return c ? c.name : '—';
}

function getServiceById(id) {
    return mockServices.find(s => s.id === id);
}

function statusClass(status) {
    const map = {
        '啟用': 'status-active', '停用': 'status-inactive',
        '待確認': 'status-pending', '已確認': 'status-confirmed',
        '已完成': 'status-completed', '已取消': 'status-cancelled'
    };
    return map[status] || '';
}

/* 分頁 HTML 產生器（共用） */
function buildPaginationHTML(current, total, totalPages) {
    let btns = '';
    for (let i = 1; i <= totalPages; i++) {
        btns += `<button class="pagination-btn${i === current ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }
    return `
        <div class="pagination">
            <span class="pagination-info">共 ${total} 筆，第 ${current} / ${totalPages} 頁</span>
            <div class="pagination-buttons">
                <button class="pagination-btn" ${current === 1 ? 'disabled' : ''} data-page="${current - 1}">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                ${btns}
                <button class="pagination-btn" ${current === totalPages ? 'disabled' : ''} data-page="${current + 1}">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </div>`;
}

function bindPaginationEvents(wrapperId, onPageChange) {
    document.getElementById(wrapperId).querySelectorAll('.pagination-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function () { onPageChange(parseInt(this.dataset.page)); });
    });
}

/* ============================================================
 * 填充 <select> 選項
 * ============================================================ */
function populateCategorySelects() {
    // 分類 select（用於服務項目查詢、服務項目表單）
    ['searchServiceCategory', 'serviceCategory'].forEach(selId => {
        const el = document.getElementById(selId);
        if (!el) return;
        const current = el.value;
        while (el.options.length > 1) el.remove(1);
        mockCategories.forEach(c => el.appendChild(new Option(c.name, c.id)));
        el.value = current;
    });

    // 服務項目 select（用於預約紀錄查詢）
    const resSel = document.getElementById('searchResService');
    if (!resSel) return;
    const cur = resSel.value;
    while (resSel.options.length > 1) resSel.remove(1);
    mockServices.forEach(s => resSel.appendChild(new Option(s.name, s.id)));
    resSel.value = cur;
}

/* ============================================================
 * 頁籤切換
 * ============================================================ */
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });
}

/* ============================================================
 * Tab 1：分類管理
 * ============================================================ */
function renderCategories() {
    const tbody = document.getElementById('categoryTableBody');
    tbody.innerHTML = mockCategories.length === 0
        ? '<tr><td colspan="5" style="text-align:center">尚無資料</td></tr>'
        : mockCategories.map((c, i) => `
        <tr>
            <td class="col-1">${i + 1}</td>
            <td class="col-2">${c.name}</td>
            <td class="col-1">${c.sort}</td>
            <td class="col-1"><span class="status-badge ${statusClass(c.status)}">${c.status}</span></td>
            <td class="col-1">
                <div class="action-buttons">
                    <button class="btn-action btn-edit" data-id="${c.id}" title="編輯">編輯</button>
                    <button class="btn-action btn-delete" data-id="${c.id}" title="刪除">刪除</button>
                </div>
            </td>
        </tr>`).join('');

    tbody.querySelectorAll('.btn-edit').forEach(btn =>
        btn.addEventListener('click', function () { openCategoryModal(parseInt(this.dataset.id)); }));
    tbody.querySelectorAll('.btn-delete').forEach(btn =>
        btn.addEventListener('click', function () { deleteCategory(parseInt(this.dataset.id)); }));
}

function openCategoryModal(id) {
    const isAdd = !id;
    document.getElementById('categoryModalTitle').textContent = isAdd ? '新增分類' : '編輯分類';
    document.getElementById('categoryId').value = isAdd ? '' : id;
    if (!isAdd) {
        const c = mockCategories.find(c => c.id === id);
        document.getElementById('categoryName').value   = c.name;
        document.getElementById('categoryIcon').value   = c.icon;
        document.getElementById('categorySort').value   = c.sort;
        document.getElementById('categoryStatus').value = c.status;
    } else {
        document.getElementById('categoryForm').reset();
    }
    categoryModal.open();
}

function deleteCategory(id) {
    if (!confirm('確定要刪除此分類？\n（該分類下的服務項目將同步停用）')) return;
    mockCategories = mockCategories.filter(c => c.id !== id);
    mockServices.forEach(s => { if (s.categoryId === id) s.status = '停用'; });
    renderCategories();
    renderServices();
    populateCategorySelects();
}

function saveCategoryModal() {
    const name   = document.getElementById('categoryName').value.trim();
    const icon   = document.getElementById('categoryIcon').value.trim();
    const sort   = parseInt(document.getElementById('categorySort').value) || 1;
    const status = document.getElementById('categoryStatus').value;
    const id     = parseInt(document.getElementById('categoryId').value) || null;
    if (!name || !icon) { alert('請填寫分類名稱與圖示'); return; }
    if (id) {
        Object.assign(mockCategories.find(c => c.id === id), { name, icon, sort, status });
    } else {
        mockCategories.push({ id: nextCategoryId++, icon, name, sort, status });
    }
    categoryModal.close();
    renderCategories();
    populateCategorySelects();
}

/* ============================================================
 * Tab 2：服務項目管理
 * ============================================================ */
let serviceCurrentPage = 1;
const SERVICE_PAGE_SIZE = 10;

function getFilteredServices() {
    const catId  = parseInt(document.getElementById('searchServiceCategory').value) || null;
    const name   = document.getElementById('searchServiceName').value.trim().toLowerCase();
    const mgr    = document.getElementById('searchServiceManager').value.trim().toLowerCase();
    const status = document.getElementById('searchServiceStatus').value;
    return mockServices.filter(s => {
        if (catId  && s.categoryId !== catId) return false;
        if (name   && !s.name.toLowerCase().includes(name)) return false;
        if (mgr    && !s.manager.toLowerCase().includes(mgr)) return false;
        if (status && s.status !== status) return false;
        return true;
    });
}

function renderServices() {
    const filtered = getFilteredServices();
    const start    = (serviceCurrentPage - 1) * SERVICE_PAGE_SIZE;
    const items    = filtered.slice(start, start + SERVICE_PAGE_SIZE);
    const tbody    = document.getElementById('serviceTableBody');

    tbody.innerHTML = items.length === 0
        ? '<tr><td colspan="11" style="text-align:center">尚無資料</td></tr>'
        : items.map((s, i) => {
            const sitesText = s.siteIds && s.siteIds.length
                ? s.siteIds.map(sid => { const site = mockSites.find(ms => ms.id === sid); return site ? site.name : ''; }).join('、')
                : '—';
            const periodText = s.displayFrom
                ? `${s.displayFrom}${s.displayTo ? ' ~ ' + s.displayTo : ' 起'}`
                : '—';
            return `
            <tr>
                <td class="col-1">${start + i + 1}</td>
                <td class="col-1 res-no">${s.no || '—'}</td>
                <td class="col-2">${s.name}</td>
                <td class="col-1">${getCategoryName(s.categoryId)}</td>
                <td class="col-2">${s.discount}</td>
                <td class="col-1">${s.vendor}</td>
                <td class="col-1">${s.vendorPhone || '—'}</td>
                <td class="col-1">${s.manager}</td>
                <td class="col-1 text-muted-sm">${sitesText}</td>
                <td class="col-1 text-muted-sm nowrap">${periodText}</td>
                <td class="col-1"><span class="status-badge ${statusClass(s.status)}">${s.status}</span></td>
                <td class="col-1">
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" data-id="${s.id}" title="編輯">編輯</button>
                        <button class="btn-action btn-delete" data-id="${s.id}" title="刪除">刪除</button>
                    </div>
                </td>
            </tr>`;
        }).join('');

    tbody.querySelectorAll('.btn-edit').forEach(btn =>
        btn.addEventListener('click', function () { openServiceModal(parseInt(this.dataset.id)); }));
    tbody.querySelectorAll('.btn-delete').forEach(btn =>
        btn.addEventListener('click', function () { deleteService(parseInt(this.dataset.id)); }));

    const totalPages = Math.ceil(filtered.length / SERVICE_PAGE_SIZE);
    const wrapper = document.getElementById('servicePaginationWrapper');
    if (totalPages <= 1) { wrapper.innerHTML = ''; return; }
    wrapper.innerHTML = buildPaginationHTML(serviceCurrentPage, filtered.length, totalPages);
    bindPaginationEvents('servicePaginationWrapper', page => { serviceCurrentPage = page; renderServices(); });
}

/* ──────────────────────────────
 * 服務圖示上傳輔助函式
 * ────────────────────────────── */

/**
 * 根據 iconValue（data URL 或 emoji）設定預覽狀態。
 * 若為 data URL 則顯示圖片；否則清空預覽。
 */
function setServiceIconPreview(iconValue) {
    const preview     = document.getElementById('serviceIconPreview');
    const placeholder = document.getElementById('serviceIconPlaceholder');
    const clearBtn    = document.getElementById('serviceIconClearBtn');
    const dataField   = document.getElementById('serviceIconData');
    dataField.value   = iconValue || '';
    if (iconValue && iconValue.startsWith('data:image')) {
        // 已上傳圖片（data URL）
        preview.src              = iconValue;
        preview.style.display    = 'block';
        placeholder.style.display = 'none';
        clearBtn.style.display   = 'flex';
    } else {
        // emoji 或空值 → 顯示佔位提示
        clearServiceIconPreview();
    }
}

/** 清除圖示預覽並重設所有相關元素 */
function clearServiceIconPreview() {
    const preview     = document.getElementById('serviceIconPreview');
    const placeholder = document.getElementById('serviceIconPlaceholder');
    const clearBtn    = document.getElementById('serviceIconClearBtn');
    const dataField   = document.getElementById('serviceIconData');
    const fileInput   = document.getElementById('serviceIconFile');
    preview.src               = '';
    preview.style.display     = 'none';
    placeholder.style.display = 'flex';
    clearBtn.style.display    = 'none';
    dataField.value           = '';
    if (fileInput) fileInput.value = '';
}

function openServiceModal(id) {
    const isAdd = !id;
    document.getElementById('serviceModalTitle').textContent = isAdd ? '新增服務項目' : '編輯服務項目';
    document.getElementById('serviceId').value = isAdd ? '' : id;

    // 顯示或隱藏流水號列
    const noRow = document.getElementById('serviceNoRow');
    if (!isAdd) {
        noRow.style.display = '';
    } else {
        noRow.style.display = 'none';
    }

    // 重新建立案場複選框
    const siteGroup = document.getElementById('serviceSiteGroup');
    siteGroup.innerHTML = mockSites.map(site => `
        <label class="site-checkbox-item">
            <input type="checkbox" name="serviceSite" value="${site.id}">
            <span>${site.name}</span>
        </label>`).join('');

    // 重新填充分類 select
    const sel = document.getElementById('serviceCategory');
    while (sel.options.length > 1) sel.remove(1);
    mockCategories.forEach(c => sel.appendChild(new Option(c.name, c.id)));

    if (!isAdd) {
        const s = getServiceById(id);
        document.getElementById('serviceNo').value           = s.no || '';
        document.getElementById('serviceName').value         = s.name;
        setServiceIconPreview(s.icon);
        document.getElementById('serviceCategory').value     = s.categoryId;
        document.getElementById('serviceDiscount').value     = s.discount;
        document.getElementById('serviceVendor').value       = s.vendor;
        document.getElementById('serviceVendorPhone').value  = s.vendorPhone || '';
        document.getElementById('serviceManager').value      = s.manager;
        // Rich text 欄位
        document.getElementById('serviceOffer').innerHTML    = s.offer || '';
        document.getElementById('serviceDesc').innerHTML     = s.desc  || '';
        document.getElementById('serviceSort').value         = s.sort;
        document.getElementById('serviceStatus').value       = s.status;
        document.getElementById('serviceDisplayFrom').value  = s.displayFrom || '';
        document.getElementById('serviceDisplayTo').value    = s.displayTo   || '';
        // 案場複選
        const checkedSites = s.siteIds || [];
        siteGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = checkedSites.includes(parseInt(cb.value));
        });
    } else {
        document.getElementById('serviceName').value         = '';
        document.getElementById('serviceCategory').value     = '';
        document.getElementById('serviceDiscount').value     = '';
        document.getElementById('serviceVendor').value       = '';
        document.getElementById('serviceVendorPhone').value  = '';
        document.getElementById('serviceManager').value      = '';
        document.getElementById('serviceOffer').innerHTML    = '';
        document.getElementById('serviceDesc').innerHTML     = '';
        document.getElementById('serviceSort').value         = '1';
        document.getElementById('serviceStatus').value       = '啟用';
        document.getElementById('serviceDisplayFrom').value  = '';
        document.getElementById('serviceDisplayTo').value    = '';
        clearServiceIconPreview();
    }
    serviceModal.open();
}

function deleteService(id) {
    if (!confirm('確定要刪除此服務項目？')) return;
    mockServices = mockServices.filter(s => s.id !== id);
    renderServices();
    populateCategorySelects();
}

function saveServiceModal() {
    const categoryId  = parseInt(document.getElementById('serviceCategory').value) || null;
    const name        = document.getElementById('serviceName').value.trim();
    const icon        = document.getElementById('serviceIconData').value.trim();
    const discount    = document.getElementById('serviceDiscount').value.trim();
    const vendor      = document.getElementById('serviceVendor').value.trim();
    const vendorPhone = document.getElementById('serviceVendorPhone').value.trim();
    const manager     = document.getElementById('serviceManager').value.trim();
    // Rich text：取得 innerHTML（含格式標籤），純文字用 innerText 做必填驗證
    const offerEl     = document.getElementById('serviceOffer');
    const descEl      = document.getElementById('serviceDesc');
    const offer       = offerEl.innerHTML.trim();
    const offerText   = offerEl.innerText.trim();
    const desc        = descEl.innerHTML.trim();
    const descText    = descEl.innerText.trim();
    const sort        = parseInt(document.getElementById('serviceSort').value) || 1;
    const status      = document.getElementById('serviceStatus').value;
    const displayFrom = document.getElementById('serviceDisplayFrom').value;
    const displayTo   = document.getElementById('serviceDisplayTo').value;
    const id          = parseInt(document.getElementById('serviceId').value) || null;

    // 收集已選案場
    const siteIds = Array.from(
        document.querySelectorAll('#serviceSiteGroup input[type="checkbox"]:checked')
    ).map(cb => parseInt(cb.value));

    if (!categoryId || !name || !discount || !vendor || !manager || !offerText || !descText) {
        alert('請填寫所有必填欄位'); return;
    }
    if (id) {
        Object.assign(getServiceById(id), { categoryId, name, icon, discount, vendor, vendorPhone, manager, offer, desc, sort, status, displayFrom, displayTo, siteIds });
    } else {
        const no = generateServiceNo();
        mockServices.push({ id: nextServiceId++, no, categoryId, icon, name, discount, vendor, vendorPhone, manager, offer, desc, sort, status, displayFrom, displayTo, siteIds });
    }
    serviceModal.close();
    renderServices();
    populateCategorySelects();
}

/* ============================================================
 * Tab 3：預約紀錄
 * ============================================================ */
let resCurrentPage = 1;
const RES_PAGE_SIZE = 10;

function getFilteredReservations() {
    const svcId    = parseInt(document.getElementById('searchResService').value) || null;
    const unit     = document.getElementById('searchResUnit').value.trim().toLowerCase();
    const dateFrom = document.getElementById('searchResDateFrom').value;
    const dateTo   = document.getElementById('searchResDateTo').value;
    const status   = document.getElementById('searchResStatus').value;
    return mockReservations.filter(r => {
        if (svcId    && r.serviceId !== svcId) return false;
        if (unit     && !r.unit.toLowerCase().includes(unit)) return false;
        if (dateFrom && r.date < dateFrom) return false;
        if (dateTo   && r.date > dateTo) return false;
        if (status   && r.status !== status) return false;
        return true;
    });
}

function renderReservations() {
    const filtered = getFilteredReservations();
    const start    = (resCurrentPage - 1) * RES_PAGE_SIZE;
    const items    = filtered.slice(start, start + RES_PAGE_SIZE);
    const tbody    = document.getElementById('reservationTableBody');

    tbody.innerHTML = items.length === 0
        ? '<tr><td colspan="14" style="text-align:center">尚無預約紀錄</td></tr>'
        : items.map((r, i) => {
            const svc     = getServiceById(r.serviceId);
            const catName = svc ? getCategoryName(svc.categoryId) : '—';
            return `
                <tr>
                    <td class="col-1">${start + i + 1}</td>
                    <td class="col-2 res-no">${r.no}</td>
                    <td class="col-2">${svc ? svc.name : '—'}</td>
                    <td class="col-1">${catName}</td>
                    <td class="col-1">${r.unit}</td>
                    <td class="col-1">${r.name}</td>
                    <td class="col-1">${r.phone}</td>
                    <td class="col-1">${r.date}</td>
                    <td class="col-1 nowrap">${r.slot}</td>
                    <td class="col-2 text-muted-sm">${r.note || '—'}</td>
                    <td class="col-1">${svc ? svc.manager : '—'}</td>
                    <td class="col-1"><span class="status-badge ${statusClass(r.status)}">${r.status}</span></td>
                    <td class="col-1 text-muted-sm">${r.createdAt}</td>
                    <td class="col-1">
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" data-id="${r.id}" title="處理">處理</button>
                        </div>
                    </td>
                </tr>`;
        }).join('');

    tbody.querySelectorAll('.btn-edit').forEach(btn =>
        btn.addEventListener('click', function () { openReservationModal(parseInt(this.dataset.id)); }));

    const totalPages = Math.ceil(filtered.length / RES_PAGE_SIZE);
    const wrapper = document.getElementById('reservationPaginationWrapper');
    if (totalPages <= 1) { wrapper.innerHTML = ''; return; }
    wrapper.innerHTML = buildPaginationHTML(resCurrentPage, filtered.length, totalPages);
    bindPaginationEvents('reservationPaginationWrapper', page => { resCurrentPage = page; renderReservations(); });
}

function openReservationModal(id) {
    const r   = mockReservations.find(r => r.id === id);
    const svc = getServiceById(r.serviceId);
    const rows = [
        ['預約編號', r.no],
        ['服務項目', svc ? svc.name : '—'],
        ['所屬分類', svc ? getCategoryName(svc.categoryId) : '—'],
        ['負責人',   svc ? `${svc.manager}　${svc.managerPhone}` : '—'],
        ['戶別',     r.unit],
        ['姓名',     r.name],
        ['聯絡電話', r.phone],
        ['預約日期', r.date],
        ['預約時段', r.slot],
        ['住戶備注', r.note || '—'],
        ['申請時間', r.createdAt]
    ];
    document.getElementById('reservationDetailBody').innerHTML = rows.map(([label, val]) =>
        `<tr><td class="detail-label">${label}</td><td>${val}</td></tr>`
    ).join('');
    document.getElementById('resNewStatus').value = r.status;
    document.getElementById('resAdminNote').value = r.adminNote || '';
    document.getElementById('resEditId').value    = r.id;
    reservationModal.open();
}

function saveReservationModal() {
    const id     = parseInt(document.getElementById('resEditId').value);
    const r      = mockReservations.find(r => r.id === id);
    r.status     = document.getElementById('resNewStatus').value;
    r.adminNote  = document.getElementById('resAdminNote').value.trim();
    reservationModal.close();
    renderReservations();
}

/* ============================================================
 * 頁面初始化（DOMContentLoaded）
 * ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof initCRMLayout === 'function') initCRMLayout();
    if (typeof SidebarManager !== 'undefined') new SidebarManager();

    window.categoryModal    = new Modal('categoryModal');
    window.serviceModal     = new Modal('serviceModal');
    window.reservationModal = new Modal('reservationModal');

    initTabs();
    populateCategorySelects();
    renderCategories();
    renderServices();
    renderReservations();

    // ── 分類彈窗 ──
    document.getElementById('btnAddCategory').addEventListener('click',   () => openCategoryModal(null));
    document.getElementById('categoryBtnSave').addEventListener('click',   saveCategoryModal);
    document.getElementById('categoryBtnCancel').addEventListener('click', () => categoryModal.close());
    document.getElementById('categoryModalClose').addEventListener('click', () => categoryModal.close());

    // ── 服務項目彈窗 ──
    document.getElementById('btnAddService').addEventListener('click',    () => openServiceModal(null));
    document.getElementById('serviceBtnSave').addEventListener('click',    saveServiceModal);
    document.getElementById('serviceBtnCancel').addEventListener('click',  () => serviceModal.close());
    document.getElementById('serviceModalClose').addEventListener('click', () => serviceModal.close());
    document.getElementById('serviceSearchForm').addEventListener('submit', e => { e.preventDefault(); serviceCurrentPage = 1; renderServices(); });
    document.getElementById('btnServiceReset').addEventListener('click',   () => { document.getElementById('serviceSearchForm').reset(); serviceCurrentPage = 1; renderServices(); });

    // ── Rich Text Toolbar（優惠說明、服務說明） ──
    document.querySelectorAll('.richtext-toolbar .rt-btn').forEach(btn => {
        btn.addEventListener('mousedown', function (e) {
            e.preventDefault(); // 避免 contenteditable 失焦
            const cmd    = this.dataset.cmd;
            const target = this.closest('.richtext-toolbar').dataset.target;
            const editor = document.getElementById(target);
            editor.focus();
            document.execCommand(cmd, false, null);
        });
    });

    // ── 服務圖示上傳 ──
    // 點擊上傳區域觸發檔案選擇（忽略清除按鈕點擊）
    document.getElementById('serviceIconUploadArea').addEventListener('click', function (e) {
        if (e.target.closest('#serviceIconClearBtn')) return;
        document.getElementById('serviceIconFile').click();
    });
    // 選取檔案後讀取並預覽
    document.getElementById('serviceIconFile').addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
        // 限制檔案大小 2MB
        if (file.size > 2 * 1024 * 1024) {
            alert('圖片大小不可超過 2MB，請重新選擇。');
            this.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function (ev) {
            setServiceIconPreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    });
    // 清除按鈕
    document.getElementById('serviceIconClearBtn').addEventListener('click', function (e) {
        e.stopPropagation();
        clearServiceIconPreview();
    });

    // ── 預約紀錄彈窗 ──
    document.getElementById('reservationBtnSave').addEventListener('click',    saveReservationModal);
    document.getElementById('reservationBtnCancel').addEventListener('click',  () => reservationModal.close());
    document.getElementById('reservationModalClose').addEventListener('click', () => reservationModal.close());
    document.getElementById('reservationSearchForm').addEventListener('submit', e => { e.preventDefault(); resCurrentPage = 1; renderReservations(); });
    document.getElementById('btnResReset').addEventListener('click',           () => { document.getElementById('reservationSearchForm').reset(); resCurrentPage = 1; renderReservations(); });
});
