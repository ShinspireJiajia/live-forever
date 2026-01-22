/**
 * house-checkup-activity-edit.js
 * 健診活動編輯頁面 JavaScript
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

    // 取得 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const siteName = urlParams.get('site') || '陸府原森';
    const activityId = urlParams.get('id') || '1';

    // 更新導航連結
    document.getElementById('breadcrumbActivity').href = `house-checkup-activity.html?site=${encodeURIComponent(siteName)}`;
    document.getElementById('btnBack').href = `house-checkup-activity.html?site=${encodeURIComponent(siteName)}`;

    // ========================================
    // Mock 資料
    // ========================================
    let currentActivity = {
        id: 1,
        name: '2025年度第一期房屋健檢',
        siteName: siteName,
        displayStartDate: '2025-02-15',
        displayEndDate: '2025-04-15',
        regStartDate: '2025-03-01',
        regEndDate: '2025-03-31',
        maxUnits: 50,
        registeredUnits: 45,
        manualName: '2025年度房屋健檢手冊.pdf',
        checklistName: '2025年度房屋健檢檢查清單.xlsx',
        description: '2025年度第一期房屋健檢活動，歡迎住戶踴躍報名參加。本次活動將針對建物外觀、室內設備、水電管線等進行全面檢查。',
        registerUrl: 'https://example.com/register/chk2025001'
    };

    // 預約時段 (僅供預約編輯時選用)
    let timeslots = [
        { id: 1, date: '2025-03-15', startTime: '09:00', endTime: '10:00', capacity: 3, booked: 2 },
        { id: 2, date: '2025-03-15', startTime: '10:00', endTime: '11:00', capacity: 3, booked: 3 },
        { id: 3, date: '2025-03-15', startTime: '14:00', endTime: '15:00', capacity: 3, booked: 1 },
        { id: 4, date: '2025-03-16', startTime: '09:00', endTime: '10:00', capacity: 3, booked: 0 },
        { id: 5, date: '2025-03-16', startTime: '10:00', endTime: '11:00', capacity: 3, booked: 2 }
    ];

    // 預約清單
    let reservations = [
        { id: 1, serial: 'chk26011501', unit: 'A棟5F', name: '王大明', phone: '0912-345-678', date: '2025-03-15', time: '09:00-10:00', status: '待確認', note: '', message: '' },
        { id: 2, serial: 'chk26011502', unit: 'A棟8F', name: '李美玲', phone: '0922-333-444', date: '2025-03-15', time: '09:00-10:00', status: '已確認', note: '有些許壁癌', message: '已安排專業技師' },
        { id: 3, serial: 'chk26011503', unit: 'B棟3F', name: '張志偉', phone: '0933-555-666', date: '2025-03-15', time: '10:00-11:00', status: '已完成', note: '', message: '' },
        { id: 4, serial: 'chk26011504', unit: 'B棟10F', name: '陳小華', phone: '0944-777-888', date: '2025-03-15', time: '10:00-11:00', status: '已確認', note: '', message: '' },
        { id: 5, serial: 'chk26011505', unit: 'C棟2F', name: '林志玲', phone: '0955-999-000', date: '2025-03-15', time: '14:00-15:00', status: '待確認', note: '', message: '' }
    ];

    // 住戶列表（用於發送邀請）
    const residents = [
        { id: 1, unit: 'A棟3F', name: '王大明', phone: '0912-345-678', hasLine: true, lastSent: '2025/01/10 10:00' },
        { id: 2, unit: 'A棟5F', name: '李美玲', phone: '0922-333-444', hasLine: true, lastSent: '2025/01/12 14:30' },
        { id: 3, unit: 'A棟8F', name: '張志偉', phone: '0933-555-666', hasLine: true, lastSent: null },
        { id: 4, unit: 'B棟3F', name: '陳小華', phone: '0944-777-888', hasLine: false, lastSent: null },
        { id: 5, unit: 'B棟10F', name: '林志玲', phone: '0955-999-000', hasLine: true, lastSent: '2025/01/10 10:05' },
        { id: 6, unit: 'C棟2F', name: '黃建國', phone: '0966-111-222', hasLine: true, lastSent: null },
        { id: 7, unit: 'C棟5F', name: '周杰倫', phone: '0977-333-444', hasLine: true, lastSent: '2025/01/15 09:00' },
        { id: 8, unit: 'C棟8F', name: '蔡依林', phone: '0988-555-666', hasLine: false, lastSent: null }
    ];

    let selectedResidents = new Set();

    // ========================================
    // 初始化
    // ========================================
    // 定義全局函數以便在 HTML onclick 或其他地方調用
    window.openActivityEditModal = openActivityEditModal;
    window.closeActivityEditModal = closeActivityEditModal;
    window.saveActivityInfo = saveActivityInfo;
    window.openReservationEditModal = openReservationEditModal;
    window.closeReservationEditModal = closeReservationEditModal;
    window.saveReservationInfo = saveReservationInfo;
    window.closeInviteModal = closeInviteModal;
    window.toggleResident = toggleResident;
    window.sendLineInvite = sendLineInvite;
    window.goToReport = goToReport;


    renderActivityInfo();
    // renderTimeslots(); // 已移除
    renderReservations();
    // renderLinePreview(); // 已移除
    initInviteMessage(); // 初始化邀請文字
    bindEvents();

    // ========================================
    // 渲染活動資訊
    // ========================================
    function renderActivityInfo() {
        document.getElementById('pageTitle').textContent = currentActivity.name;
        
        // Status Badge removed from HTML

        document.getElementById('activityInfo').innerHTML = `
            <div class="info-item">
                <span class="info-label">案場名稱</span>
                <span class="info-value">${currentActivity.siteName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">顯示期間</span>
                <span class="info-value">${currentActivity.displayStartDate} ~ ${currentActivity.displayEndDate}</span>
            </div>
            <div class="info-item">
                <span class="info-label">報名期間</span>
                <span class="info-value">${currentActivity.regStartDate} ~ ${currentActivity.regEndDate}</span>
            </div>
            <div class="info-item">
                <span class="info-label">報名上限</span>
                <span class="info-value">${currentActivity.maxUnits} 戶</span>
            </div>
            <div class="info-item">
                <span class="info-label">已報名</span>
                <span class="info-value">${currentActivity.registeredUnits} 戶</span>
            </div>
            <div class="info-item">
                <span class="info-label">使用手冊</span>
                <span class="info-value">${currentActivity.manualName || '尚未上傳'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">檢查清單</span>
                <span class="info-value">${currentActivity.checklistName || '尚未上傳'}</span>
            </div>
            <div class="info-item full-width">
                <span class="info-label">活動說明</span>
                <span class="info-value">${currentActivity.description}</span>
            </div>
        `;
    }

    // ========================================
    // 初始化邀請文字 (從活動資訊預填)
    // ========================================
    function initInviteMessage() {
        const inviteTextarea = document.getElementById('inviteMessage');
        // 如果 HTML 中沒有預填或想確保最新資料，可以在此更新 
        // 這裡僅示範若為空則填入預設值
        if (inviteTextarea && !inviteTextarea.value.trim()) {
            inviteTextarea.value = `【房屋健檢活動邀請】\n${currentActivity.name}\n\n活動期間: ${currentActivity.displayStartDate} ~ ${currentActivity.displayEndDate}\n\n${currentActivity.description}\n\n立即預約: ${currentActivity.registerUrl}`;
        }
    }


    // ========================================
    // 渲染預約清單
    // ========================================
    function renderReservations() {
        const tbody = document.getElementById('reservationTableBody');
        
        if (reservations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--color-gray-500);">
                        <i class="fa-solid fa-inbox" style="font-size: 36px; margin-bottom: 10px; display: block;"></i>
                        尚無預約紀錄
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = reservations.map(r => {
            const statusClass = getReservationStatusClass(r.status);
            return `
                <tr>
                    <td class="col-1">
                        ${r.serial}
                    </td>
                    <td class="col-1">${r.unit}</td>
                    <td class="col-1">${r.name}</td>
                    <td class="col-1">${r.phone}</td>
                    <td class="col-1">${r.date}</td>
                    <td class="col-1">${r.time}</td>
                    <td class="col-1">
                        <span class="status-badge ${statusClass}">${r.status}</span>
                    </td>
                    <td class="col-1">
                        <div class="table-actions">
                            <button class="btn-table-edit" onclick="openReservationEditModal(${r.id})">
                                <i class="fa-solid fa-pen"></i> 編輯
                            </button>
                            <button class="btn-table-edit" onclick="goToReport(${r.id})">
                                <i class="fa-solid fa-clipboard-check"></i> 填寫報告
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ========================================
    // 狀態 CSS Class
    // ========================================
    function getReservationStatusClass(status) {
        switch (status) {
            case '待確認': return 'status-pending';
            case '已確認': return 'status-confirmed';
            case '已完成': return 'status-completed';
            case '已取消': return 'status-cancelled';
            default: return '';
        }
    }

    // ========================================
    // 事件綁定
    // ========================================
    function bindEvents() {
        // 編輯活動按鈕
        const btnEditActivity = document.getElementById('btnEditActivity');
        if (btnEditActivity) {
            btnEditActivity.addEventListener('click', openActivityEditModal);
        }
        
        // 發送 LINE 邀請按鈕
        const btnSendInvite = document.getElementById('btnSendInvite');
        if (btnSendInvite) {
            btnSendInvite.addEventListener('click', openInviteModal);
        }
        
        // 邀請 Modal 功能
        const btnSelectAll = document.getElementById('btnSelectAll');
        if (btnSelectAll) btnSelectAll.addEventListener('click', selectAllResidents);
        const btnDeselectAll = document.getElementById('btnDeselectAll');
        if (btnDeselectAll) btnDeselectAll.addEventListener('click', deselectAllResidents);
        const filterResident = document.getElementById('filterResident');
        if (filterResident) filterResident.addEventListener('input', filterResidents);

        // Modal 背景點擊關閉
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // ========================================
    // 編輯活動 Modal
    // ========================================
    function openActivityEditModal() {
        document.getElementById('editActivityName').value = currentActivity.name;
        document.getElementById('editDisplayStartDate').value = currentActivity.displayStartDate;
        document.getElementById('editDisplayEndDate').value = currentActivity.displayEndDate;
        document.getElementById('editRegStartDate').value = currentActivity.regStartDate;
        document.getElementById('editRegEndDate').value = currentActivity.regEndDate;
        document.getElementById('editMaxUnits').value = currentActivity.maxUnits;
        document.getElementById('editDescription').value = currentActivity.description;
        
        // 設定目前檔案名稱
        document.getElementById('currentManualName').textContent = currentActivity.manualName || '無';
        document.getElementById('currentChecklistName').textContent = currentActivity.checklistName || '無';
        // 清空檔案輸入框
        document.getElementById('editManualFile').value = '';
        document.getElementById('editChecklistFile').value = '';

        document.getElementById('activityEditModal').classList.add('active');
    };

    function closeActivityEditModal() {
        document.getElementById('activityEditModal').classList.remove('active');
    };

    function saveActivityInfo() {
        const name = document.getElementById('editActivityName').value.trim();
        const displayStartDate = document.getElementById('editDisplayStartDate').value;
        const displayEndDate = document.getElementById('editDisplayEndDate').value;
        const regStartDate = document.getElementById('editRegStartDate').value;
        const regEndDate = document.getElementById('editRegEndDate').value;
        const maxUnits = parseInt(document.getElementById('editMaxUnits').value);
        const description = document.getElementById('editDescription').value.trim();
        
        const manualFileInput = document.getElementById('editManualFile');
        const checklistFileInput = document.getElementById('editChecklistFile');

        if (!name || !displayStartDate || !displayEndDate || !regStartDate || !regEndDate || !maxUnits) {
            alert('請填寫所有必填欄位');
            return;
        }

        currentActivity = {
            ...currentActivity,
            name,
            displayStartDate,
            displayEndDate,
            regStartDate,
            regEndDate,
            maxUnits,
            description
        };

        // 更新檔案名稱 (如果有的話)
        if (manualFileInput.files.length > 0) {
            currentActivity.manualName = manualFileInput.files[0].name;
        }
        if (checklistFileInput.files.length > 0) {
            currentActivity.checklistName = checklistFileInput.files[0].name;
        }

        renderActivityInfo();
        closeActivityEditModal();
        alert('活動資訊已更新');
    };

    // ========================================
    // 編輯預約 Modal
    // ========================================
    function openReservationEditModal(id) {
        const reservation = reservations.find(r => r.id === id);
        if (!reservation) return;

        document.getElementById('editReservationId').value = id;
        document.getElementById('resEditName').textContent = reservation.name;
        document.getElementById('resEditUnit').textContent = reservation.unit;
        
        // 設定狀態
        document.getElementById('resEditStatus').value = reservation.status;

        // 產生時段選項 (簡單範例)
        const timeslotSelect = document.getElementById('resEditTimeslot');
        timeslotSelect.innerHTML = timeslots.map(slot => 
            `<option value="${slot.id}" ${reservation.date === slot.date && reservation.time.includes(slot.startTime) ? 'selected' : ''}>
                ${slot.date} ${slot.startTime}-${slot.endTime} (剩餘 ${slot.capacity - slot.booked})
            </option>`
        ).join('');
        
        document.getElementById('resEditNote').value = reservation.note || '';
        document.getElementById('resEditMessage').value = reservation.message || '';

        document.getElementById('reservationEditModal').classList.add('active');
    };

    function closeReservationEditModal() {
        document.getElementById('reservationEditModal').classList.remove('active');
    };

    function saveReservationInfo() {
        const id = parseInt(document.getElementById('editReservationId').value);
        const reservation = reservations.find(r => r.id === id);
        
        if (reservation) {
            const slotId = document.getElementById('resEditTimeslot').value;
            const status = document.getElementById('resEditStatus').value;
            const note = document.getElementById('resEditNote').value;
            const message = document.getElementById('resEditMessage').value;
            
            // 更新時段邏輯 (略)
            const slot = timeslots.find(s => s.id == slotId);
            if (slot) {
                reservation.date = slot.date;
                reservation.time = `${slot.startTime}-${slot.endTime}`;
            }

            reservation.status = status;
            reservation.note = note;
            reservation.message = message;
            
            renderReservations();
            closeReservationEditModal();
            alert('預約資訊已更新');
        }
    };

    // ========================================
    // LINE 邀請 Modal
    // ========================================
    function openInviteModal() {
        selectedResidents.clear();
        renderResidentList();
        updateSelectedCount();
        document.getElementById('inviteModal').classList.add('active');
    }

    function closeInviteModal() {
        document.getElementById('inviteModal').classList.remove('active');
    };

    function renderResidentList(filter = '') {
        const container = document.getElementById('residentList');
        const filteredResidents = residents.filter(r => {
            if (!filter) return true;
            return r.unit.toLowerCase().includes(filter.toLowerCase()) || 
                   r.name.toLowerCase().includes(filter.toLowerCase());
        });

        container.innerHTML = filteredResidents.map(r => `
            <div class="resident-item ${selectedResidents.has(r.id) ? 'selected' : ''}" 
                 onclick="toggleResident(${r.id})" data-id="${r.id}">
                <div class="resident-checkbox">
                    <input type="checkbox" ${selectedResidents.has(r.id) ? 'checked' : ''} ${!r.hasLine ? 'disabled' : ''}>
                </div>
                <div class="resident-info">
                    <span class="resident-unit">${r.unit}</span>
                    <span class="resident-name">${r.name}</span>
                </div>
                <div class="resident-status">
                     ${r.lastSent ? 
                        `<span style="color: #6c757d; font-size: 13px;">上次發送: ${r.lastSent}</span>` : 
                        `<span style="color: #adb5bd; font-size: 13px;">尚未發送</span>`}
                </div>
                <div class="resident-line">
                    ${r.hasLine ? 
                        '<i class="fa-brands fa-line" style="color: #06C755;"></i>' : 
                        '<span class="no-line">未綁定</span>'}
                </div>
            </div>
        `).join('');
    }

    function toggleResident(id) {
        const resident = residents.find(r => r.id === id);
        if (!resident || !resident.hasLine) return;

        if (selectedResidents.has(id)) {
            selectedResidents.delete(id);
        } else {
            selectedResidents.add(id);
        }
        renderResidentList(document.getElementById('filterResident').value);
        updateSelectedCount();
    };

    function selectAllResidents() {
        residents.forEach(r => {
            if (r.hasLine) selectedResidents.add(r.id);
        });
        renderResidentList(document.getElementById('filterResident').value);
        updateSelectedCount();
    }

    function deselectAllResidents() {
        selectedResidents.clear();
        renderResidentList(document.getElementById('filterResident').value);
        updateSelectedCount();
    }

    function filterResidents() {
        const filter = document.getElementById('filterResident').value;
        renderResidentList(filter);
    }

    function updateSelectedCount() {
        document.getElementById('selectedCount').textContent = selectedResidents.size;
    }

    function sendLineInvite() {
        if (selectedResidents.size === 0) {
            alert('請選擇至少一位住戶');
            return;
        }

        const inviteMessage = document.getElementById('inviteMessage').value.trim();
        if(!inviteMessage) {
            alert('請輸入邀請文案內容');
            return;
        }
        
        const selectedNames = Array.from(selectedResidents).map(id => {
            const r = residents.find(res => res.id === id);
            return r ? r.name : '';
        }).filter(n => n).join('、');

        if (confirm(`確定要發送 LINE 邀請給以下 ${selectedResidents.size} 位住戶嗎？\n\n${selectedNames}\n\n(將使用當前設定的邀請文案)`)) {
            closeInviteModal();
            alert('LINE 邀請已發送！');
        }
    };



    // ========================================
    // 導航到報告頁面
    // ========================================
    function goToReport(reservationId) {
        window.location.href = `house-checkup-report.html?id=${reservationId}`;
    };
});
