/**
 * house-checkup-site.js
 * 房屋健檢案場管理頁面 JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    if (typeof renderSidebar === 'function') {
        renderSidebar();
    }
    // 渲染共用元件 (Header + Sidebar)

    if (typeof initCRMLayout === 'function') {

        initCRMLayout();

    }

    

    const sidebarManager = new SidebarManager();

    // ========================================
    // Mock 資料
    // ========================================
    const mockSites = [
        {
            id: 1,
            name: '陸府原森',
            totalUnits: 150,
            licenseDate: '2023-01-15',
            handoverDate: '2023-03-01',
            activeActivities: 2,
            status: '啟用'
        },
        {
            id: 2,
            name: '陸府觀微',
            totalUnits: 80,
            licenseDate: '2023-05-20',
            handoverDate: '2023-07-10',
            activeActivities: 1,
            status: '啟用'
        },
        {
            id: 3,
            name: '陸府植森',
            totalUnits: 120,
            licenseDate: '2022-11-05',
            handoverDate: '2023-01-15',
            activeActivities: 0,
            status: '停用'
        }
    ];

    // 健診手冊 Mock 資料
    const mockManuals = {
        '陸府原森': [
            {
                id: 1,
                name: '2025年度房屋健檢手冊',
                startDate: '2025-01-01',
                endDate: '2025-12-31',
                fileType: 'pdf',
                fileName: '2025_health_check_manual.pdf',
                fileUrl: '#',
                status: '啟用'
            },
            {
                id: 2,
                name: '2024年度房屋健檢手冊',
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                fileType: 'pdf',
                fileName: '2024_health_check_manual.pdf',
                fileUrl: '#',
                status: '停用'
            },
            {
                id: 3,
                name: '防水檢查補充說明',
                startDate: '2025-06-01',
                endDate: '',
                fileType: 'image',
                fileName: 'waterproof_guide.jpg',
                fileUrl: '#',
                status: '啟用'
            }
        ],
        '陸府觀微': [
            {
                id: 4,
                name: '2025年度房屋健檢手冊',
                startDate: '2025-01-01',
                endDate: '',
                fileType: 'pdf',
                fileName: 'guanwei_2025_manual.pdf',
                fileUrl: '#',
                status: '啟用'
            },
            {
                id: 5,
                name: '電氣設備檢查指南',
                startDate: '2025-03-01',
                endDate: '',
                fileType: 'pdf',
                fileName: 'electrical_guide.pdf',
                fileUrl: '#',
                status: '啟用'
            }
        ],
        '陸府植森': [
            {
                id: 6,
                name: '2025年度房屋健檢手冊',
                startDate: '2025-01-01',
                endDate: '',
                fileType: 'pdf',
                fileName: 'zhisen_2025_manual.pdf',
                fileUrl: '#',
                status: '啟用'
            }
        ]
    };

    let currentSiteName = '';
    let currentManuals = [];
    let editingManualId = null;

    // ========================================
    // 初始化
    // ========================================
    loadSiteData();
    bindEvents();

    // ========================================
    // 載入案場資料
    // ========================================
    function loadSiteData() {
        const searchProject = document.getElementById('searchProject').value;

        // 篩選資料
        let filteredData = mockSites.filter(site => {
            if (searchProject && site.name !== searchProject) return false;
            return true;
        });

        renderSiteTable(filteredData);
    }

    // ========================================
    // 渲染案場表格
    // ========================================
    function renderSiteTable(data) {
        const tbody = document.getElementById('siteTableBody');
        
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-gray-500);">
                        <i class="fa-solid fa-inbox" style="font-size: 36px; margin-bottom: 10px; display: block;"></i>
                        查無符合條件的資料
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map(site => `
            <tr>
                <td class="col-1">${site.name}</td>
                <td class="col-1">${site.licenseDate}</td>
                <td class="col-1">${site.handoverDate}</td>
                <td class="col-1">${site.totalUnits}</td>
                <td class="col-1">${site.activeActivities}</td>
                <td class="col-1">
                    <div class="table-actions">
                        <button class="btn-table-edit" onclick="goToActivity('${site.name}')">
                            <i class="fa-solid fa-calendar-check"></i> 活動管理
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ========================================
    // 事件綁定
    // ========================================
    function bindEvents() {
        // 查詢表單
        document.getElementById('searchForm').addEventListener('submit', function(e) {
            e.preventDefault();
            loadSiteData();
        });

        // 重置按鈕
        document.getElementById('searchForm').addEventListener('reset', function() {
            setTimeout(loadSiteData, 0);
        });

        // 檔案上傳
        const fileInput = document.getElementById('manualFile');
        const uploadArea = document.getElementById('fileUploadArea');

        fileInput.addEventListener('change', handleFileSelect);

        // 拖曳上傳
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', function() {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        // Modal 背景點擊關閉
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeAllModals();
                }
            });
        });
    }

    // ========================================
    // 健診手冊 Modal 功能
    // ========================================
    window.openManualModal = function(siteName) {
        currentSiteName = siteName;
        document.getElementById('manualSiteName').textContent = siteName;
        currentManuals = mockManuals[siteName] || [];
        renderManualList();
        document.getElementById('manualModal').classList.add('active');
    };

    window.closeManualModal = function() {
        document.getElementById('manualModal').classList.remove('active');
        currentSiteName = '';
        currentManuals = [];
    };

    function renderManualList() {
        const listContainer = document.getElementById('manualList');

        if (currentManuals.length === 0) {
            listContainer.innerHTML = `
                <div class="manual-empty">
                    <i class="fa-solid fa-book-open"></i>
                    <p>尚無健診手冊</p>
                    <p>點擊「新增手冊」開始建立</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = currentManuals.map(manual => `
            <div class="manual-item" data-id="${manual.id}">
                <div class="manual-info">
                    <div class="manual-icon ${manual.fileType === 'image' ? 'icon-image' : ''}">
                        <i class="fa-solid ${manual.fileType === 'pdf' ? 'fa-file-pdf' : 'fa-file-image'}"></i>
                    </div>
                    <div class="manual-details">
                        <div class="manual-name">${manual.name}</div>
                        <div class="manual-meta">
                            <span><i class="fa-regular fa-calendar"></i> ${manual.startDate} ~ ${manual.endDate || '永久'}</span>
                            <span><i class="fa-solid fa-file"></i> ${manual.fileName}</span>
                        </div>
                    </div>
                    <div class="manual-status">
                        <span class="status-badge ${manual.status === '啟用' ? 'status-active' : 'status-inactive'}">
                            ${manual.status}
                        </span>
                    </div>
                </div>
                <div class="manual-actions">
                    <button class="btn btn-info btn-sm" onclick="previewManual(${manual.id})">
                        <i class="fa-solid fa-eye"></i> 預覽
                    </button>
                    <button class="btn btn-info btn-sm" onclick="editManual(${manual.id})">
                        <i class="fa-solid fa-pen"></i> 編輯
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteManual(${manual.id})">
                        <i class="fa-solid fa-trash"></i> 刪除
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ========================================
    // 新增/編輯手冊 Modal
    // ========================================
    window.showAddManualForm = function() {
        editingManualId = null;
        document.getElementById('manualEditTitle').textContent = '新增健診手冊';
        document.getElementById('manualEditForm').reset();
        document.getElementById('filePreview').style.display = 'none';
        document.querySelector('.file-upload-placeholder').style.display = 'flex';
        document.getElementById('manualEditModal').classList.add('active');
    };

    window.editManual = function(manualId) {
        const manual = currentManuals.find(m => m.id === manualId);
        if (!manual) return;

        editingManualId = manualId;
        document.getElementById('manualEditTitle').textContent = '編輯健診手冊';
        document.getElementById('editManualId').value = manualId;
        document.getElementById('manualName').value = manual.name;
        document.getElementById('manualStartDate').value = manual.startDate;
        document.getElementById('manualEndDate').value = manual.endDate || '';
        
        // 設定狀態 radio
        document.querySelectorAll('input[name="manualStatus"]').forEach(radio => {
            radio.checked = radio.value === manual.status;
        });

        // 顯示已上傳檔案
        document.getElementById('fileName').textContent = manual.fileName;
        document.getElementById('filePreview').style.display = 'block';
        document.querySelector('.file-upload-placeholder').style.display = 'none';

        document.getElementById('manualEditModal').classList.add('active');
    };

    window.closeManualEditModal = function() {
        document.getElementById('manualEditModal').classList.remove('active');
        editingManualId = null;
    };

    window.saveManual = function() {
        const name = document.getElementById('manualName').value.trim();
        const startDate = document.getElementById('manualStartDate').value;
        const endDate = document.getElementById('manualEndDate').value;
        const status = document.querySelector('input[name="manualStatus"]:checked').value;

        if (!name) {
            alert('請輸入手冊名稱');
            return;
        }

        if (!startDate) {
            alert('請選擇啟用日期');
            return;
        }

        if (editingManualId) {
            // 編輯模式
            const index = currentManuals.findIndex(m => m.id === editingManualId);
            if (index !== -1) {
                currentManuals[index] = {
                    ...currentManuals[index],
                    name,
                    startDate,
                    endDate,
                    status
                };
            }
            alert('手冊已更新');
        } else {
            // 新增模式
            const newManual = {
                id: Date.now(),
                name,
                startDate,
                endDate,
                fileType: 'pdf',
                fileName: document.getElementById('fileName').textContent || 'new_manual.pdf',
                fileUrl: '#',
                status
            };
            currentManuals.push(newManual);
            alert('手冊已新增');
        }

        renderManualList();
        closeManualEditModal();
    };

    window.deleteManual = function(manualId) {
        if (!confirm('確定要刪除此手冊嗎？')) return;

        const index = currentManuals.findIndex(m => m.id === manualId);
        if (index !== -1) {
            currentManuals.splice(index, 1);
            renderManualList();
            alert('手冊已刪除');
        }
    };

    // ========================================
    // 檔案處理
    // ========================================
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    function handleFile(file) {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            alert('僅支援 PDF、JPG、PNG 格式');
            return;
        }

        document.getElementById('fileName').textContent = file.name;
        document.getElementById('filePreview').style.display = 'block';
        document.querySelector('.file-upload-placeholder').style.display = 'none';

        // 更新檔案圖示
        const icon = document.querySelector('.file-info .file-icon');
        if (file.type === 'application/pdf') {
            icon.className = 'fa-solid fa-file-pdf file-icon';
            icon.style.color = '#dc3545';
        } else {
            icon.className = 'fa-solid fa-file-image file-icon';
            icon.style.color = '#17a2b8';
        }
    }

    window.removeFile = function() {
        document.getElementById('manualFile').value = '';
        document.getElementById('fileName').textContent = '';
        document.getElementById('filePreview').style.display = 'none';
        document.querySelector('.file-upload-placeholder').style.display = 'flex';
    };

    // ========================================
    // 檔案預覽
    // ========================================
    window.previewManual = function(manualId) {
        const manual = currentManuals.find(m => m.id === manualId);
        if (!manual) return;

        document.getElementById('previewFileName').textContent = manual.fileName;
        document.getElementById('downloadBtn').href = manual.fileUrl;

        const container = document.getElementById('previewContainer');
        
        if (manual.fileType === 'pdf') {
            container.innerHTML = `
                <iframe src="${manual.fileUrl}" style="width: 100%; height: 70vh;"></iframe>
            `;
        } else {
            container.innerHTML = `
                <img src="${manual.fileUrl}" alt="${manual.name}" style="max-width: 100%; height: auto;">
            `;
        }

        document.getElementById('previewModal').classList.add('active');
    };

    window.closePreviewModal = function() {
        document.getElementById('previewModal').classList.remove('active');
    };

    // ========================================
    // 導航功能
    // ========================================
    window.goToActivity = function(siteName) {
        window.location.href = `house-checkup-activity.html?site=${encodeURIComponent(siteName)}`;
    };

    // ========================================
    // 關閉所有 Modal
    // ========================================
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});
