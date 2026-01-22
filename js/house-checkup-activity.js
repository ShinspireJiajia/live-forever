/**
 * house-checkup-activity.js
 * 健診活動管理頁面 JavaScript
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

    // 取得 URL 參數中的案場名稱
    const urlParams = new URLSearchParams(window.location.search);
    const siteName = urlParams.get('site') || '陸府原森';

    // 更新頁面顯示
    document.getElementById('pageSiteName').textContent = siteName;
    document.getElementById('breadcrumbSite').textContent = siteName + ' - 健診活動管理';

    // ========================================
    // Mock 資料
    // ========================================
    const mockActivities = [
        {
            id: 1,
            name: '2025年度第一期房屋健檢',
            displayStartDate: '2025-02-15',
            displayEndDate: '2025-04-15',
            regStartDate: '2025-03-01',
            regEndDate: '2025-03-31',
            maxUnits: 50,
            registeredUnits: 45,
            completedCount: 30,
            incompleteCount: 15,
            manualFileName: '2025年度房屋健檢手冊.pdf',
            manualFileType: 'application/pdf',
            description: '2025年度第一期房屋健檢活動，歡迎住戶踴躍報名參加。本次活動將針對建物外觀、室內設備、水電管線等進行全面檢查。',
            createdAt: '2025-01-15'
        },
        {
            id: 2,
            name: '2025年度第二期房屋健檢',
            displayStartDate: '2025-05-15',
            displayEndDate: '2025-07-15',
            regStartDate: '2025-06-01',
            regEndDate: '2025-06-30',
            maxUnits: 60,
            registeredUnits: 12,
            completedCount: 0,
            incompleteCount: 12,
            manualFileName: '2025年度房屋健檢手冊.pdf',
            manualFileType: 'application/pdf',
            description: '2025年度第二期房屋健檢活動。',
            createdAt: '2025-02-01'
        },
        {
            id: 3,
            name: '2024年度第四期房屋健檢',
            displayStartDate: '2024-11-15',
            displayEndDate: '2024-01-15',
            regStartDate: '2024-12-01',
            regEndDate: '2024-12-31',
            maxUnits: 50,
            registeredUnits: 48,
            completedCount: 48,
            incompleteCount: 0,
            manualFileName: '2024年度房屋健檢手冊.pdf',
            manualFileType: 'application/pdf',
            description: '2024年度最後一期房屋健檢活動。',
            createdAt: '2024-10-15'
        },
        {
            id: 4,
            name: '2024年度特別健檢活動',
            displayStartDate: '2024-08-15',
            displayEndDate: '2024-09-30',
            regStartDate: '2024-09-01',
            regEndDate: '2024-09-15',
            maxUnits: 30,
            registeredUnits: 5,
            completedCount: 5,
            incompleteCount: 0,
            manualFileName: '防水檢查補充說明.jpg',
            manualFileType: 'image/jpeg',
            description: '因應部分住戶反映滲水問題，特別舉辦防水專項健檢。',
            createdAt: '2024-08-20'
        }
    ];

    // 可用手冊列表 (已移除，改為檔案上傳)

    let activities = [...mockActivities];
    let editingActivityId = null;

    // ========================================
    // 初始化
    // ========================================
    loadActivityData();
    // loadManualOptions(); // 移除
    bindEvents();

    // ========================================
    // 載入活動資料
    // ========================================
    function loadActivityData() {
        const searchName = document.getElementById('searchName').value.toLowerCase();
        // const searchStatus = document.getElementById('searchStatus').value;
        const searchDateFrom = document.getElementById('searchDateFrom').value;
        const searchDateTo = document.getElementById('searchDateTo').value;

        // 篩選資料
        let filteredData = activities.filter(activity => {
            if (searchName && !activity.name.toLowerCase().includes(searchName)) return false;
            // if (searchStatus && activity.status !== searchStatus) return false;
            if (searchDateFrom && activity.displayStartDate < searchDateFrom) return false;
            if (searchDateTo && activity.displayEndDate > searchDateTo) return false;
            return true;
        });

        renderActivityTable(filteredData);
    }

    // ========================================
    // 渲染活動表格
    // ========================================
    function renderActivityTable(data) {
        const tbody = document.getElementById('activityTableBody');
        
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--color-gray-500);">
                        <i class="fa-solid fa-calendar-xmark" style="font-size: 36px; margin-bottom: 10px; display: block;"></i>
                        查無符合條件的活動
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map(activity => {
            return `
                <tr>
                    <td class="col-1">${activity.name}</td>
                    <td class="col-1">${activity.regStartDate} ~ ${activity.regEndDate}</td>
                    <td class="col-1">${activity.maxUnits} 戶</td>
                    <td class="col-1">${activity.registeredUnits} 戶</td>
                    <td class="col-1">${activity.completedCount || 0} 戶</td>
                    <td class="col-1">${activity.incompleteCount || 0} 戶</td>
                    <td class="col-1">${activity.manualFileName || '-'}</td>
                    <td class="col-1">
                        <div class="table-actions">
                            <button class="btn-table-edit" onclick="goToActivityEdit(${activity.id})">
                                <i class="fa-solid fa-pen"></i> 編輯
                            </button>
                            <button class="btn-table-delete" onclick="deleteActivity(${activity.id})">
                                <i class="fa-solid fa-trash"></i> 刪除
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ========================================
    // 取得狀態 CSS Class (已移除)
    // ========================================
    /*
    function getStatusClass(status) {
        switch (status) {
            case '草稿': return 'status-draft';
            case '進行中': return 'status-active';
            case '已結束': return 'status-completed';
            case '已取消': return 'status-cancelled';
            default: return '';
        }
    }
    */

    // ========================================
    // 事件綁定
    // ========================================
    function bindEvents() {
        // 查詢表單
        document.getElementById('searchForm').addEventListener('submit', function(e) {
            e.preventDefault();
            loadActivityData();
        });

        // 重置按鈕
        document.getElementById('searchForm').addEventListener('reset', function() {
            setTimeout(loadActivityData, 0);
        });

        // 新增活動按鈕
        document.getElementById('btnAddActivity').addEventListener('click', function() {
            openActivityModal();
        });

        // 檔案上傳 (健診維護清單)
        const fileInput = document.getElementById('checklistFile');
        const uploadArea = document.getElementById('checklistUploadArea');

        fileInput.addEventListener('change', handleFileSelect);

        // 拖曳上傳 (健診維護清單)
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
                handleChecklistFile(files[0]);
            }
        });

        // 檔案上傳 (使用手冊)
        const manualInput = document.getElementById('manualFile');
        const manualArea = document.getElementById('manualUploadArea');

        manualInput.addEventListener('change', handleManualFileSelect);

        // 拖曳上傳 (使用手冊)
        manualArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            manualArea.classList.add('dragover');
        });

        manualArea.addEventListener('dragleave', function() {
            manualArea.classList.remove('dragover');
        });

        manualArea.addEventListener('drop', function(e) {
            e.preventDefault();
            manualArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleManualFile(files[0]);
            }
        });

        // Modal 背景點擊關閉
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeActivityModal();
                }
            });
        });
    }

    // ========================================
    // 活動 Modal 功能
    // ========================================
    function openActivityModal(activityId = null) {
        editingActivityId = activityId;
        
        if (activityId) {
            // 編輯模式
            const activity = activities.find(a => a.id === activityId);
            if (!activity) return;

            document.getElementById('activityModalTitle').textContent = '編輯健診活動';
            document.getElementById('editActivityId').value = activityId;
            document.getElementById('activityName').value = activity.name;
            document.getElementById('displayStartDate').value = activity.displayStartDate;
            document.getElementById('displayEndDate').value = activity.displayEndDate;
            document.getElementById('regStartDate').value = activity.regStartDate;
            document.getElementById('regEndDate').value = activity.regEndDate;
            document.getElementById('activityMaxUnits').value = activity.maxUnits;
            // document.getElementById('activityManual').value = activity.manualId; // Removed
            document.getElementById('activityDescription').value = activity.description || '';
            
            // 設定使用手冊檔案顯示
            if (activity.manualFileName) {
                document.getElementById('manualFileName').textContent = activity.manualFileName;
                document.getElementById('manualPreview').style.display = 'block';
                document.querySelector('#manualUploadArea .file-upload-placeholder').style.display = 'none';
                
                const icon = document.querySelector('#manualPreview .file-icon');
                if (activity.manualFileType === 'application/pdf') {
                    icon.className = 'fa-solid fa-file-pdf file-icon';
                    icon.style.color = '#dc3545';
                } else {
                    icon.className = 'fa-solid fa-file-image file-icon';
                    icon.style.color = '#28a745'; // Set image color or keep default
                }
                // Store type for save
                document.getElementById('manualUploadArea').dataset.fileType = activity.manualFileType;
            } else {
                removeManual();
            }

            // 設定狀態 radio (已移除)
        } else {
            // 新增模式
            document.getElementById('activityModalTitle').textContent = '新增健診活動';
            document.getElementById('activityForm').reset();
            document.getElementById('checklistPreview').style.display = 'none';
            document.querySelector('#checklistUploadArea .file-upload-placeholder').style.display = 'flex';
            
            // 重置使用手冊
            removeManual();
        }

        document.getElementById('activityModal').classList.add('active');
    }

    window.closeActivityModal = function() {
        document.getElementById('activityModal').classList.remove('active');
        editingActivityId = null;
    };

    window.saveActivity = function() {
        const name = document.getElementById('activityName').value.trim();
        const displayStartDate = document.getElementById('displayStartDate').value;
        const displayEndDate = document.getElementById('displayEndDate').value;
        const regStartDate = document.getElementById('regStartDate').value;
        const regEndDate = document.getElementById('regEndDate').value;
        const maxUnits = parseInt(document.getElementById('activityMaxUnits').value);
        // const manualId = document.getElementById('activityManual').value; // Removed
        const manualFileName = document.getElementById('manualFileName').textContent;
        const manualFileType = document.getElementById('manualUploadArea').dataset.fileType;
        const description = document.getElementById('activityDescription').value.trim();
        // const status = document.querySelector('input[name="activityStatus"]:checked').value;

        // 驗證
        if (!name) {
            alert('請輸入活動名稱');
            return;
        }
        if (!displayStartDate || !displayEndDate || !regStartDate || !regEndDate) {
            alert('請選擇所有起訖日期');
            return;
        }
        if (displayStartDate > displayEndDate) {
            alert('顯示起始日期不可晚於結束日期');
            return;
        }
        if (regStartDate > regEndDate) {
            alert('報名起始日期不可晚於結束日期');
            return;
        }
        if (!maxUnits || maxUnits < 1) {
            alert('請輸入有效的報名戶數上限');
            return;
        }
        if (!manualFileName) {
            alert('請上傳使用手冊');
            return;
        }

        if (editingActivityId) {
            // 編輯模式
            const index = activities.findIndex(a => a.id === editingActivityId);
            if (index !== -1) {
                activities[index] = {
                    ...activities[index],
                    name,
                    displayStartDate,
                    displayEndDate,
                    regStartDate,
                    regEndDate,
                    maxUnits,
                    manualFileName,
                    manualFileType,
                    description
                };
            }
            alert('活動已更新');
        } else {
            // 新增模式
            const newActivity = {
                id: Date.now(),
                name,
                displayStartDate,
                displayEndDate,
                regStartDate,
                regEndDate,
                maxUnits,
                registeredUnits: 0,
                manualFileName,
                manualFileType,
                description,
                createdAt: new Date().toISOString().split('T')[0]
            };
            activities.unshift(newActivity);
            alert('活動已新增');
        }

        loadActivityData();
        closeActivityModal();
    };

    // ========================================
    // 刪除活動
    // ========================================
    window.deleteActivity = function(activityId) {
        const activity = activities.find(a => a.id === activityId);
        if (!activity) return;

        if (activity.registeredUnits > 0) {
            if (!confirm(`此活動已有 ${activity.registeredUnits} 戶報名，確定要刪除嗎？`)) return;
        } else {
            if (!confirm('確定要刪除此活動嗎？')) return;
        }

        const index = activities.findIndex(a => a.id === activityId);
        if (index !== -1) {
            activities.splice(index, 1);
            loadActivityData();
            alert('活動已刪除');
        }
    };

    // ========================================
    // 導航到活動編輯頁面
    // ========================================
    window.goToActivityEdit = function(activityId) {
        window.location.href = `house-checkup-activity-edit.html?site=${encodeURIComponent(siteName)}&id=${activityId}`;
    };

    // ========================================
    // 檔案處理
    // ========================================
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleChecklistFile(file);
        }
    }

    function handleChecklistFile(file) {
        const allowedTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!allowedTypes.includes(file.type)) {
            alert('僅支援 PDF、Excel 格式');
            return;
        }

        document.getElementById('checklistFileName').textContent = file.name;
        document.getElementById('checklistPreview').style.display = 'block';
        document.querySelector('#checklistUploadArea .file-upload-placeholder').style.display = 'none';

        // 更新檔案圖示
        const icon = document.querySelector('#checklistPreview .file-icon');
        if (file.type === 'application/pdf') {
            icon.className = 'fa-solid fa-file-pdf file-icon';
            icon.style.color = '#dc3545';
        } else {
            icon.className = 'fa-solid fa-file-excel file-icon';
            icon.style.color = '#28a745';
        }
    }

    window.removeChecklist = function() {
        document.getElementById('checklistFile').value = '';
        document.getElementById('checklistFileName').textContent = '';
        document.getElementById('checklistPreview').style.display = 'none';
        document.querySelector('#checklistUploadArea .file-upload-placeholder').style.display = 'flex';
    };

    // ========================================
    // 使用手冊檔案處理
    // ========================================
    function handleManualFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleManualFile(file);
        }
    }

    function handleManualFile(file) {
        // 檢查檔案類型: application/pdf 或 image/*
        if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
            alert('僅支援 PDF 或圖片 (.jpg, .png) 格式');
            return;
        }

        document.getElementById('manualFileName').textContent = file.name;
        document.getElementById('manualPreview').style.display = 'block';
        document.querySelector('#manualUploadArea .file-upload-placeholder').style.display = 'none';
        
        // 儲存檔案類型到 dataset
        document.getElementById('manualUploadArea').dataset.fileType = file.type;

        // 更新檔案圖示
        const icon = document.querySelector('#manualPreview .file-icon');
        if (file.type === 'application/pdf') {
            icon.className = 'fa-solid fa-file-pdf file-icon';
            icon.style.color = '#dc3545';
        } else {
            icon.className = 'fa-solid fa-file-image file-icon';
            icon.style.color = '#28a745';
        }
    }

    window.removeManual = function() {
        document.getElementById('manualFile').value = '';
        document.getElementById('manualFileName').textContent = '';
        document.getElementById('manualPreview').style.display = 'none';
        document.querySelector('#manualUploadArea .file-upload-placeholder').style.display = 'flex';
        document.getElementById('manualUploadArea').dataset.fileType = '';
    };
});
