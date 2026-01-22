/**
 * ============================================
 * 案場活動類別管理 - JavaScript
 * ============================================
 * 檔案：site-event-category.js
 * 說明：管理活動類別（CRUD），並儲存於 localStorage
 * ============================================
 */

class SiteEventCategoryManager {
    constructor() {
        this.storageKey = 'site_event_categories';
        this.categories = [];
        this.editingId = null;
        this.deleteId = null;
        
        // 預設類別資料
        this.defaultCategories = [
            { id: 'CAT001', name: '住戶聯誼', status: true },
            { id: 'CAT002', name: '親子活動', status: true },
            { id: 'CAT003', name: '節慶活動', status: true },
            { id: 'CAT004', name: '社區活動', status: true },
            { id: 'CAT005', name: '講座課程', status: true },
            { id: 'CAT006', name: '設備說明', status: true },
            { id: 'CAT007', name: '公告說明', status: true }
        ];

        this.init();
    }

    init() {
        this.loadCategories();
        this.bindEvents();
        this.renderTable();
    }

    /**
     * 載入類別資料
     */
    loadCategories() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.categories = JSON.parse(stored);
        } else {
            this.categories = [...this.defaultCategories];
            this.saveToStorage();
        }
    }

    /**
     * 儲存至 localStorage
     */
    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.categories));
        // 同步更新 Mock Data 物件中的資料，以便其他頁面若有引用時能讀到(雖然通常跨頁面是靠 localStorage)
        if (typeof SiteEventMockData !== 'undefined') {
            SiteEventMockData.categories = this.categories;
        }
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 搜尋表單
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.renderTable();
            });
            searchForm.addEventListener('reset', () => {
                setTimeout(() => this.renderTable(), 0);
            });
        }

        // 新增按鈕
        const btnAdd = document.getElementById('btnAdd');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openModal());
        }
    }

    /**
     * 渲染表格
     */
    renderTable() {
        const tbody = document.getElementById('categoryTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        const searchName = document.getElementById('searchCategoryName')?.value.trim().toLowerCase();

        let displayData = [...this.categories];

        if (searchName) {
            displayData = displayData.filter(item => item.name.toLowerCase().includes(searchName));
        }

        if (displayData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">查無資料</td></tr>';
            return;
        }

        displayData.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${this.escapeHtml(item.name)}</td>
                <td>
                    <span class="status-badge ${item.status ? 'status-active' : 'status-inactive'}">
                        ${item.status ? '啟用' : '停用'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" title="編輯" onclick="categoryManager.openModal('${item.id}')">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon btn-delete" title="刪除" onclick="categoryManager.openDeleteModal('${item.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    /**
     * 開啟編輯/新增視窗
     */
    openModal(id = null) {
        const modal = document.getElementById('categoryModal');
        const form = document.getElementById('categoryForm');
        const title = document.getElementById('modalTitle');
        
        // 重置表單
        form.reset();
        this.editingId = id;

        if (id) {
            const item = this.categories.find(c => c.id === id);
            if (item) {
                title.textContent = '編輯活動類別';
                document.getElementById('categoryId').value = item.id;
                document.getElementById('formCategoryName').value = item.name;
                document.getElementById('formStatus').checked = item.status;
            }
        } else {
            title.textContent = '新增活動類別';
        }

        modal.classList.add('active');
    }

    /**
     * 關閉視窗
     */
    closeModal() {
        document.getElementById('categoryModal').classList.remove('active');
        this.editingId = null;
    }

    /**
     * 儲存類別
     */
    saveCategory() {
        const form = document.getElementById('categoryForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const name = document.getElementById('formCategoryName').value.trim();
        const status = document.getElementById('formStatus').checked;

        if (this.editingId) {
            // 編輯
            const index = this.categories.findIndex(c => c.id === this.editingId);
            if (index !== -1) {
                this.categories[index] = {
                    ...this.categories[index],
                    name,
                    status
                };
                this.showToast('更新成功', 'success');
            }
        } else {
            // 新增
            const newId = 'CAT' + String(Date.now()).slice(-6); // 簡易 ID 產生
            this.categories.push({
                id: newId,
                name,
                status
            });
            this.showToast('新增成功', 'success');
        }

        this.saveToStorage();
        this.renderTable();
        this.closeModal();
    }

    /**
     * 開啟刪除確認框
     */
    openDeleteModal(id) {
        this.deleteId = id;
        document.getElementById('deleteModal').classList.add('active');
    }

    /**
     * 關閉刪除確認框
     */
    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('active');
        this.deleteId = null;
    }

    /**
     * 確認刪除
     */
    confirmDelete() {
        if (this.deleteId) {
            this.categories = this.categories.filter(c => c.id !== this.deleteId);
            this.saveToStorage();
            this.renderTable();
            this.showToast('刪除成功', 'success');
        }
        this.closeDeleteModal();
    }

    /**
     * 顯示 Toast 提示
     */
    showToast(message, type = 'info') {
        const container = document.querySelector('.toast-container');
        if (!container) return; // 確保容器存在

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-times-circle';

        toast.innerHTML = `
            <div class="toast-icon"><i class="fa-solid ${icon}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${type === 'success' ? '成功' : (type === 'error' ? '錯誤' : '提示')}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close"><i class="fa-solid fa-times"></i></button>
        `;

        container.appendChild(toast);

        // 移除事件
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.onclick = () => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        };

        // 自動移除
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
    }
    
    // HTML 轉義
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// 供全域使用
const categoryManager = new SiteEventCategoryManager();
