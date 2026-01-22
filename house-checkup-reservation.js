/**
 * ============================================
 * 房屋健檢預約紀錄頁面 JavaScript
 * 檔案：js/house-checkup-reservation.js
 * ============================================
 */

// ============================================
// Mock 資料
// ============================================
const mockReservations = [
    {
        id: 'chk250315001',
        siteName: '陸府原森',
        activity: '2025春季房屋健檢',
        unit: 'A棟5F',
        residentName: '王大明',
        phone: '0912-345-678',
        date: '2025-03-15',
        time: '09:00 - 10:00',
        status: '已完成',
        hasReport: true,
        reportFileName: '房屋健檢報告_A棟5F_20250315.pdf',
        reportDate: '2025-03-15 11:30',
        messages: [
            { date: '2025-03-01 10:00', author: '王大明', content: '請問那天可以改下午嗎？' },
            { date: '2025-03-01 14:00', author: '客服', content: '好的，幫您安排下午時段。' }
        ]
    },
    {
        id: 'chk250316002',
        siteName: '陸府原森',
        activity: '2025春季房屋健檢',
        unit: 'B棟3F',
        residentName: '李小華',
        phone: '0923-456-789',
        date: '2025-03-16',
        time: '10:00 - 11:00',
        status: '已確認',
        hasReport: false,
        messages: []
    },
    {
        id: 'chk250316003',
        siteName: '陸府植森',
        activity: '2025年度定期檢查',
        unit: 'C棟8F',
        residentName: '張美玲',
        phone: '0934-567-890',
        date: '2025-03-16',
        time: '14:00 - 15:00',
        status: '待確認',
        hasReport: false,
        messages: [
             { date: '2025-03-02 09:30', author: '張美玲', content: '希望能檢查一下陽台漏水問題。' }
        ]
    },
    {
        id: 'chk250317004',
        siteName: '陸府沐夏',
        activity: '2025春季房屋健檢',
        unit: 'A棟2F',
        residentName: '陳志明',
        phone: '0945-678-901',
        date: '2025-03-17',
        time: '09:00 - 10:00',
        status: '已取消',
        hasReport: false,
        cancelReason: '住戶臨時有事',
        messages: []
    },
    {
        id: 'chk250318005',
        siteName: '陸府原森',
        activity: '2025年度定期檢查',
        unit: 'A棟12F',
        residentName: '林雅婷',
        phone: '0956-789-012',
        date: '2025-03-18',
        time: '15:00 - 16:00',
        status: '已確認',
        hasReport: false
    },
    {
        id: 'chk250320006',
        siteName: '陸府植森',
        activity: '2025春季房屋健檢',
        unit: 'B棟6F',
        residentName: '黃建國',
        phone: '0967-890-123',
        date: '2025-03-20',
        time: '10:00 - 11:00',
        status: '已完成',
        hasReport: true,
        reportFileName: '房屋健檢報告_B棟6F_20250320.pdf',
        reportDate: '2025-03-20 12:15'
    },
    {
        id: 'chk250322007',
        siteName: '陸府原森',
        activity: '2025春季房屋健檢',
        unit: 'C棟10F',
        residentName: '吳小美',
        phone: '0978-901-234',
        date: '2025-03-22',
        time: '14:00 - 15:00',
        status: '已完成(未簽名)',
        hasReport: true,
        reportFileName: '房屋健檢報告_C棟10F_20250322.pdf',
        reportDate: '2025-03-22 15:00'
    }
];

// 分頁設定
let currentPage = 1;
const pageSize = 10;
let filteredData = [...mockReservations];
let currentReservationId = null;

// ============================================
// 頁面初始化
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // 初始化共用元件 (Header & Sidebar)
    if (typeof initCRMLayout === 'function') {
        initCRMLayout();
    }
    
    // 初始化側邊欄邏輯
    if (typeof SidebarManager !== 'undefined') {
        new SidebarManager();
    }

    // 載入資料
    loadReservationData();
    
    // 初始化事件監聽器
    initEventListeners();
});

/**
 * 初始化事件監聯器
 */
function initEventListeners() {
    // 搜尋表單
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            currentPage = 1;
            filterData();
        });
        
        searchForm.addEventListener('reset', function() {
            setTimeout(() => {
                currentPage = 1;
                filteredData = [...mockReservations];
                renderTable();
            }, 10);
        });
    }
    
    // 分頁按鈕
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    
    if (prevPage) {
        prevPage.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
    }
    
    if (nextPage) {
        nextPage.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredData.length / pageSize);
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
    }
    
    // 儲存編輯按鈕
    const btnSaveEdit = document.getElementById('btnSaveEdit');
    if (btnSaveEdit) {
        btnSaveEdit.addEventListener('click', saveReservation);
    }

    // 新增預約相關
    const btnAddReservation = document.getElementById('btnAddReservation');
    if (btnAddReservation) {
        btnAddReservation.addEventListener('click', openAddModal);
    }
    
    const btnSaveAdd = document.getElementById('btnSaveAdd');
    if (btnSaveAdd) {
        btnSaveAdd.addEventListener('click', saveNewReservation);
    }

    // ============================================
    // 資料連動邏輯 (新增預約)
    // ============================================
    
    // Mock 住戶資料 (用於連動)
    const mockResidentData = {
        '陸府原森': [
            { unit: 'A棟5F', name: '王大明', phone: '0912-345-678' },
            { unit: 'A棟12F', name: '林雅婷', phone: '0956-789-012' },
            { unit: 'B棟3F', name: '李小華', phone: '0923-456-789' }
        ],
        '陸府植森': [
            { unit: 'C棟8F', name: '張美玲', phone: '0934-567-890' },
            { unit: 'B棟6F', name: '黃建國', phone: '0967-890-123' },
            { unit: 'A棟10F', name: '吳志豪', phone: '0911-222-333' }
        ],
        '陸府沐夏': [
            { unit: 'A棟2F', name: '陳志明', phone: '0945-678-901' },
            { unit: 'B棟5F', name: '劉曉雲', phone: '0988-777-666' }
        ]
    };

    const addSiteSelect = document.getElementById('addSite');
    const addUnitSelect = document.getElementById('addUnit');
    const addResidentInput = document.getElementById('addResident');
    const addPhoneInput = document.getElementById('addPhone');

    if (addSiteSelect && addUnitSelect) {
        addSiteSelect.addEventListener('change', function() {
            const site = this.value;
            // 清空並重置戶別選項
            addUnitSelect.innerHTML = '<option value="">請選擇戶別</option>';
            // 清空住戶資訊
            if(addResidentInput) addResidentInput.value = '';
            if(addPhoneInput) addPhoneInput.value = '';

            if (site && mockResidentData[site]) {
                mockResidentData[site].forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.unit;
                    option.textContent = item.unit;
                    addUnitSelect.appendChild(option);
                });
            }
        });
    }

    if (addUnitSelect) {
        addUnitSelect.addEventListener('change', function() {
            const site = addSiteSelect.value;
            const unit = this.value;
            
            if (site && unit && mockResidentData[site]) {
                const resident = mockResidentData[site].find(r => r.unit === unit);
                if (resident) {
                    if(addResidentInput) addResidentInput.value = resident.name;
                    if(addPhoneInput) addPhoneInput.value = resident.phone;
                }
            } else {
                 if(addResidentInput) addResidentInput.value = '';
                 if(addPhoneInput) addPhoneInput.value = '';
            }
        });
    }
    
    // 綁定聊天室發送按鈕
    const btnSendMessage = document.getElementById('btnSendMessage');
    if (btnSendMessage) {
        btnSendMessage.addEventListener('click', sendChatMessage);
    }

    // 綁定聊天室輸入框 Enter 發送
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if(e.key === 'Enter') sendChatMessage();
        });
    }

    // 綁定附加檔案按鈕
    const btnAttachFile = document.getElementById('btnAttachFile');
    if (btnAttachFile) {
        btnAttachFile.addEventListener('click', function() {
            document.getElementById('chatFileInput').click();
        });
    }
}

/**
 * 載入預約資料
 */
function loadReservationData() {
    filteredData = [...mockReservations];
    renderTable();
}

/**
 * 篩選資料
 */
function filterData() {
    const searchNo = document.getElementById('searchNo').value.trim().toLowerCase();
    const searchSite = document.getElementById('searchSite').value;
    const searchName = document.getElementById('searchName').value.trim();
    const searchStatus = document.getElementById('searchStatus').value;
    const searchDateStart = document.getElementById('searchDateStart').value;
    const searchDateEnd = document.getElementById('searchDateEnd').value;
    
    filteredData = mockReservations.filter(item => {
        // 預約編號
        if (searchNo && !item.id.toLowerCase().includes(searchNo)) {
            return false;
        }
        
        // 案場名稱
        if (searchSite && item.siteName !== searchSite) {
            return false;
        }
        
        // 住戶姓名
        if (searchName && !item.residentName.includes(searchName)) {
            return false;
        }
        
        // 預約狀態
        if (searchStatus && item.status !== searchStatus) {
            return false;
        }
        
        // 日期範圍
        if (searchDateStart && item.date < searchDateStart) {
            return false;
        }
        if (searchDateEnd && item.date > searchDateEnd) {
            return false;
        }
        
        return true;
    });
    
    renderTable();
}

/**
 * 渲染表格
 */
function renderTable() {
    const tbody = document.getElementById('reservationTableBody');
    if (!tbody) return;
    
    // 計算分頁
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredData.length);
    const pageData = filteredData.slice(startIndex, endIndex);
    
    // 更新總筆數
    document.getElementById('totalCount').textContent = filteredData.length;
    
    // 渲染表格內容
    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px; color: var(--color-gray-500);">
                    <i class="fa-solid fa-inbox" style="font-size: 32px; margin-bottom: 8px;"></i>
                    <p>目前沒有符合條件的預約紀錄</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = pageData.map(item => `
            <tr>
                <td data-label="預約編號">${item.id}</td>
                <td data-label="案場">${item.siteName}</td>
                <td data-label="活動名稱">${item.activity || '-'}</td>
                <td data-label="戶別">${item.unit}</td>
                <td data-label="住戶">${item.residentName}</td>
                <td data-label="預約日期">${item.date}</td>
                <td data-label="時段">${item.time}</td>
                <td data-label="狀態">
                    <span class="status-badge ${getStatusClass(item.status)}">${item.status}</span>
                </td>
                <td data-label="報告">
                    ${item.hasReport 
                        ? `<a href="#" class="report-link" onclick="downloadReport('${item.id}')"><i class="fa-solid fa-file-pdf"></i> 下載</a>`
                        : '<span class="no-report">-</span>'
                    }
                </td>
                <td data-label="操作">
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm" onclick="openEditModal('${item.id}')">
                            編輯
                        </button>
                        <button class="btn btn-info btn-sm" onclick="viewDetail('${item.id}')">
                            詳情
                        </button>
                        ${item.status === '已確認' 
                            ? `<button class="btn btn-success btn-sm" onclick="goToReport('${item.id}')">
                                填寫報告
                               </button>`
                            : ''
                        }
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // 渲染分頁
    renderPagination(totalPages);
}

/**
 * 取得狀態樣式類別
 * @param {string} status - 狀態
 * @returns {string} 樣式類別
 */
function getStatusClass(status) {
    const statusMap = {
        '待確認': 'status-pending',
        '已確認': 'status-confirmed',
        '已完成(未簽名)': 'status-unsigned',
        '已完成': 'status-completed',
        '已取消': 'status-cancelled'
    };
    return statusMap[status] || '';
}

/**
 * 渲染分頁
 * @param {number} totalPages - 總頁數
 */
function renderPagination(totalPages) {
    const pageNumbers = document.getElementById('pageNumbers');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    
    // 更新上下頁按鈕狀態
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages || totalPages === 0;
    
    // 渲染頁碼
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            html += `<span class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="page-ellipsis">...</span>';
        }
    }
    pageNumbers.innerHTML = html;
}

/**
 * 跳轉到指定頁面
 * @param {number} page - 頁碼
 */
function goToPage(page) {
    currentPage = page;
    renderTable();
}

// ============================================
// 操作功能
// ============================================

/**
 * 檢視詳情
 * @param {string} id - 預約編號
 */
function viewDetail(id) {
    const reservation = mockReservations.find(r => r.id === id);
    if (!reservation) return;
    
    currentReservationId = id;
    
    // 填入基本資訊
    document.getElementById('detailNo').textContent = reservation.id;
    document.getElementById('detailSite').textContent = reservation.siteName;
    document.getElementById('detailUnit').textContent = reservation.unit;
    document.getElementById('detailName').textContent = reservation.residentName;
    document.getElementById('detailPhone').textContent = reservation.phone;
    document.getElementById('detailStatus').innerHTML = `<span class="status-badge ${getStatusClass(reservation.status)}">${reservation.status}</span>`;
    document.getElementById('detailDate').textContent = reservation.date;
    document.getElementById('detailTime').textContent = reservation.time;
    
    // 渲染留言板 (唯讀)
    renderReservationChat(reservation.id, 'detailChatMessages');

    // 報告區塊
    const reportSection = document.getElementById('reportSection');
    if (reservation.hasReport) {
        reportSection.style.display = 'block';
        document.getElementById('reportFileName').textContent = reservation.reportFileName;
        document.getElementById('reportFileMeta').textContent = `生成時間：${reservation.reportDate}`;
    } else {
        reportSection.style.display = 'none';
    }
    
    // 開啟彈窗
    openModal('detailModal');
}





/**
 * 前往填寫報告頁面
 * @param {string} id - 預約編號
 */
function goToReport(id) {
    window.location.href = `house-checkup-report.html?id=${id}`;
}

/**
 * 確認預約
 * @param {string} id - 預約編號
 */
function confirmReservation(id) {
    if (!confirm(`確定要確認預約編號 ${id} 嗎？`)) {
        return;
    }
    
    // 更新狀態
    const reservation = mockReservations.find(r => r.id === id);
    if (reservation) {
        reservation.status = '已確認';
        renderTable();
        alert('預約已確認！');
    }
}

/**
 * 下載報告
 * @param {string} id - 預約編號
 */
function downloadReport(id) {
    const reservation = mockReservations.find(r => r.id === id);
    if (reservation && reservation.hasReport) {
        // 實際環境會從後端下載 PDF
        alert(`開始下載：${reservation.reportFileName}`);
    }
}

/**
 * 開啟編輯視窗
 * @param {string} id - 預約編號
 */
function openEditModal(id) {
    const reservation = mockReservations.find(r => r.id === id);
    if (!reservation) return;

    document.getElementById('editId').value = reservation.id;
    
    // 設定預約編號顯示
    const editNoInput = document.getElementById('editNo');
    if (editNoInput) editNoInput.value = reservation.id;

    document.getElementById('editDate').value = reservation.date;
    // 下拉選單值需與 html option value 匹配
    // 假設 mock data 的 time 格式是 "09:00 - 10:00"
    const timeSelect = document.getElementById('editTime');
    timeSelect.value = reservation.time;
    
    // 如果找不到匹配的 option (例如格式不同)，設為預設或新增 option
    // 這裡簡單處理，如果不匹配就保留原值(可能變成空)
    
    document.getElementById('editStatus').value = reservation.status;
    
    // 設定備註
    const editRemarkInput = document.getElementById('editRemark');
    if (editRemarkInput) editRemarkInput.value = reservation.remark || '';
    
    // 初始化並顯示預約資訊頁籤
    switchTab('info');
    
    // 渲染留言板
    renderReservationChat(reservation.id, 'chatMessages');
    document.getElementById('chatInput').value = '';

    openModal('editModal');
}

/**
 * 頁籤切換功能
 * @param {string} tab - 頁籤 ID ('info' 或 'chat')
 */
function switchTab(tab) {
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const activeTabBtn = document.querySelector(`.modal-tab[data-tab="${tab}"]`);
    const activeContent = document.getElementById(`tab-${tab}`);
    
    if (activeTabBtn) activeTabBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
    
    // 如果是留言板，捲動到底部
    if (tab === 'chat') {
        const container = document.getElementById('chatMessages');
        if (container) container.scrollTop = container.scrollHeight;
    }
}

/**
 * 渲染留言內容
 * @param {string} reservationId - 預約 ID
 * @param {string} targetId - 目標容器 ID
 */
function renderReservationChat(reservationId, targetId = 'chatMessages') {
    const reservation = mockReservations.find(r => r.id === reservationId);
    const messages = reservation ? (reservation.messages || []) : [];
    
    const container = document.getElementById(targetId);
    if (!container) return;

    if (messages.length === 0) {
        container.innerHTML = `<div style="text-align:center; color: var(--color-gray-500); padding-top: 50px;">尚無留言</div>`;
    } else {
        container.innerHTML = messages.map(msg => `
            <div class="message ${msg.author === '客服' || msg.author === '管理員' ? 'message-right' : 'message-left'}">
                <div class="message-content">${msg.content}</div>
                <div class="message-info">${msg.author} ${msg.date}</div>
            </div>
        `).join('');
    }
    
    container.scrollTop = container.scrollHeight;
}

/**
 * 發送聊天訊息
 */
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    if(!content) return;

    const id = document.getElementById('editId').value;
    const reservation = mockReservations.find(r => r.id === id);
    if (!reservation) return;

    if (!reservation.messages) {
        reservation.messages = [];
    }

    // 當前時間
    const now = new Date();
    const timeString = `${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getDate().toString().padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    reservation.messages.push({
        author: '管理員', // 假設當前登入者
        date: timeString,
        content: content
    });

    input.value = '';
    renderReservationChat(id, 'chatMessages');
}


/**
 * 儲存預約編輯
 */
function saveReservation() {
    const id = document.getElementById('editId').value;
    const date = document.getElementById('editDate').value;
    const time = document.getElementById('editTime').value;
    const status = document.getElementById('editStatus').value;
    const remark = document.getElementById('editRemark').value;
    
    if (!date || !time || !status) {
        alert('請填寫完整資訊');
        return;
    }

    // 更新資料
    const index = mockReservations.findIndex(r => r.id === id);
    if (index !== -1) {
        mockReservations[index].date = date;
        mockReservations[index].time = time;
        mockReservations[index].status = status;
        mockReservations[index].remark = remark;
    }
    
    closeModal('editModal');
    
    // 重新載入並過濾 (更新畫面)
    if (typeof filterData === 'function') {
        filterData(); 
    } else {
        renderTable();
    }
    
    alert('儲存成功');
}

/**
 * 開啟新增預約視窗
 */
function openAddModal() {
    // 重置表單
    const form = document.getElementById('addForm');
    if (form) form.reset();
    
    // 重置戶別選項
    const addUnitSelect = document.getElementById('addUnit');
    if (addUnitSelect) {
        addUnitSelect.innerHTML = '<option value="">請先選擇案場</option>';
    }

    // 設定預設日期 (明日)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('addDate');
    if (dateInput) dateInput.valueAsDate = tomorrow;
    
    openModal('addModal');
}

/**
 * 儲存新增預約
 */
function saveNewReservation() {
    const site = document.getElementById('addSite').value;
    const activity = document.getElementById('addActivity').value;
    const unit = document.getElementById('addUnit').value.trim();
    const resident = document.getElementById('addResident').value.trim();
    const phone = document.getElementById('addPhone').value.trim();
    const status = document.getElementById('addStatus').value;
    const date = document.getElementById('addDate').value;
    const time = document.getElementById('addTime').value;
    
    // 簡單驗證
    if (!site || !activity || !unit || !resident || !phone || !date || !time) {
        alert('請填寫所有欄位');
        return;
    }
    
    // 產生新ID (chk + 年月日 + 3碼流水號)
    const dateObj = new Date();
    const dateStr = dateObj.getFullYear().toString().substr(2,2) + 
                    (dateObj.getMonth()+1).toString().padStart(2,'0') + 
                    dateObj.getDate().toString().padStart(2,'0');
    
    const randomSuffix = Math.floor(Math.random() * 900) + 100;
    const newId = `chk${dateStr}${randomSuffix}`;
    
    const newReservation = {
        id: newId,
        siteName: site,
        activity: activity,
        unit: unit,
        residentName: resident,
        phone: phone,
        date: date,
        time: time,
        status: status,
        hasReport: false,
        messages: []
    };
    
    // 加到資料首端
    mockReservations.unshift(newReservation);
    
    // 關閉視窗
    closeModal('addModal');
    
    // 刷新列表 (重置搜尋條件以顯示最新資料)
    const searchForm = document.getElementById('searchForm');
    if(searchForm) searchForm.reset();
    
    loadReservationData();
    
    alert('預約新增成功！');
}

// ============================================
// 彈窗控制
// ============================================

/**
 * 開啟彈窗
 * @param {string} modalId - 彈窗 ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * 關閉彈窗
 * @param {string} modalId - 彈窗 ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// 將函數掛載到全域
window.viewDetail = viewDetail;
window.goToReport = goToReport;
window.confirmReservation = confirmReservation;
window.downloadReport = downloadReport;
window.goToPage = goToPage;
window.openModal = openModal;
window.closeModal = closeModal;
window.switchTab = switchTab;
window.sendChatMessage = sendChatMessage;
