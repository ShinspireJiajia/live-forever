/**
 * 綠海養護 - 履約總表功能腳本
 */

// 返回上一頁
function goBack() {
    // 如果有歷史紀錄則返回，否則回到首頁或列表頁
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.href = 'green-site.html';
    }
}

// 切換頁籤
function switchTab(tabId) {
    // 隱藏所有內容
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // 取消所有按鈕激活狀態
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // 顯示選中內容
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // 激活對應按鈕
    // 這裡假設按鈕的 onclick 屬性包含 tabId
    const targetBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabId));
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
}

// 開啟新增預約視窗
function openAddReservationModal() {
    const modal = document.getElementById('addReservationModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.warn('找不到新增預約視窗元素 (addReservationModal)');
        alert('開啟新增預約視窗');
    }
}

// 關閉新增預約視窗
function closeAddReservationModal() {
    const modal = document.getElementById('addReservationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 套用篩選
function applyFilters() {
    const propertyFilter = document.getElementById('propertyFilter').value;
    const contractFilter = document.getElementById('contractFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const reservationStatusFilter = document.getElementById('reservationStatusFilter').value;
    const contractTypeFilter = document.getElementById('contractTypeFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;
    
    // 取得表格中所有資料列
    const tableBody = document.querySelector('#reservationTab table tbody');
    const rows = tableBody.querySelectorAll('tr');
    
    // 用於統計篩選結果
    let visibleCount = 0;
    let pendingCount = 0;
    let completedCount = 0;
    
    rows.forEach(row => {
        let shouldShow = true;
        
        // 1. 戶別篩選
        if (propertyFilter) {
            const unitTagsCell = row.querySelector('.unit-tags');
            if (unitTagsCell) {
                const unitTags = unitTagsCell.querySelectorAll('.unit-tag');
                const unitTexts = Array.from(unitTags).map(tag => tag.textContent.trim());
                
                if (propertyFilter === 'F') {
                    // 公設篩選 - 檢查是否有 F- 開頭的標籤
                    const hasFacility = unitTexts.some(text => text.startsWith('F-'));
                    if (!hasFacility) shouldShow = false;
                } else {
                    // 一般戶別區域篩選 - 檢查是否有對應區域開頭的標籤
                    const hasArea = unitTexts.some(text => text.startsWith(propertyFilter));
                    if (!hasArea) shouldShow = false;
                }
            }
        }
        
        // 2. 合約編號篩選
        if (shouldShow && contractFilter) {
            const contractCell = row.querySelector('.contract-id');
            if (contractCell) {
                const contractText = contractCell.textContent.trim();
                // 比對合約編號（value 是舊編號，顯示是新編號）
                if (!contractText.includes(contractFilter.replace('CT-2023', 'CT-2025')) && 
                    !contractText.includes(contractFilter)) {
                    shouldShow = false;
                }
            }
        }
        
        // 3. 合約狀態篩選
        if (shouldShow && statusFilter) {
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                const hasActiveClass = statusBadge.classList.contains('status-active');
                const hasExpiringClass = statusBadge.classList.contains('status-expiring');
                const hasExpiredClass = statusBadge.classList.contains('status-expired');
                
                if (statusFilter === 'active' && !hasActiveClass) shouldShow = false;
                if (statusFilter === 'expiring' && !hasExpiringClass) shouldShow = false;
                if (statusFilter === 'expired' && !hasExpiredClass) shouldShow = false;
            }
        }
        
        // 4. 預約狀態篩選
        if (shouldShow && reservationStatusFilter) {
            const reservationInfos = row.querySelectorAll('.reservation-info');
            if (reservationInfos.length > 0) {
                const hasPending = Array.from(reservationInfos).some(info => 
                    info.classList.contains('reservation-pending'));
                const hasCompleted = Array.from(reservationInfos).some(info => 
                    info.classList.contains('reservation-completed'));
                
                // 只顯示包含指定狀態預約的列
                if (reservationStatusFilter === 'pending' && !hasPending) shouldShow = false;
                if (reservationStatusFilter === 'completed' && !hasCompleted) shouldShow = false;
            } else {
                // 該列無任何預約記錄，不符合預約狀態篩選
                shouldShow = false;
            }
        }
        
        // 5. 合約類型篩選
        if (shouldShow && contractTypeFilter) {
            const isFacilityRow = row.classList.contains('facility-row');
            if (contractTypeFilter === 'facility' && !isFacilityRow) shouldShow = false;
            if (contractTypeFilter === 'single' && isFacilityRow) shouldShow = false;
        }
        
        // 6. 月份篩選
        if (shouldShow && monthFilter) {
            // 取得月份對應的儲存格（第7欄開始是1月，索引從0開始所以是6）
            const monthIndex = parseInt(monthFilter) - 1 + 6; // 1月對應索引6
            const cells = row.querySelectorAll('td');
            
            if (cells.length > monthIndex) {
                const monthCell = cells[monthIndex];
                const reservationInfo = monthCell.querySelector('.reservation-info');
                
                // 若有預約狀態篩選條件
                if (reservationStatusFilter) {
                    // 該月份必須有對應狀態的預約才顯示
                    if (!reservationInfo) {
                        shouldShow = false;
                    } else {
                        const isPending = reservationInfo.classList.contains('reservation-pending');
                        const isCompleted = reservationInfo.classList.contains('reservation-completed');
                        
                        if (reservationStatusFilter === 'pending' && !isPending) shouldShow = false;
                        if (reservationStatusFilter === 'completed' && !isCompleted) shouldShow = false;
                    }
                } else {
                    // 沒有預約狀態篩選時，只要該月份有預約或可預約即可
                    if (!reservationInfo && !monthCell.classList.contains('reservation-available')) {
                        shouldShow = false;
                    }
                }
            }
        }
        
        // 設定列的顯示狀態
        row.style.display = shouldShow ? '' : 'none';
        
        // 根據預約狀態篩選，隱藏/顯示個別預約格子
        if (shouldShow && reservationStatusFilter) {
            const reservationInfos = row.querySelectorAll('.reservation-info');
            reservationInfos.forEach(info => {
                const isPending = info.classList.contains('reservation-pending');
                const isCompleted = info.classList.contains('reservation-completed');
                
                // 根據篩選條件隱藏不符合的預約
                if (reservationStatusFilter === 'pending' && isCompleted) {
                    info.style.display = 'none';
                } else if (reservationStatusFilter === 'completed' && isPending) {
                    info.style.display = 'none';
                } else {
                    info.style.display = '';
                }
            });
        } else if (shouldShow) {
            // 沒有預約狀態篩選時，顯示所有預約
            const reservationInfos = row.querySelectorAll('.reservation-info');
            reservationInfos.forEach(info => {
                info.style.display = '';
            });
        }
        
        // 統計顯示的資料
        if (shouldShow) {
            visibleCount++;
            
            // 如果有月份篩選，只計算該月份的預約狀態
            if (monthFilter) {
                const monthIndex = parseInt(monthFilter) - 1 + 6;
                const cells = row.querySelectorAll('td');
                if (cells.length > monthIndex) {
                    const monthCell = cells[monthIndex];
                    const reservationInfo = monthCell.querySelector('.reservation-info');
                    if (reservationInfo && reservationInfo.style.display !== 'none') {
                        if (reservationInfo.classList.contains('reservation-pending')) pendingCount++;
                        if (reservationInfo.classList.contains('reservation-completed')) completedCount++;
                    }
                }
            } else {
                // 沒有月份篩選，計算可見的預約狀態
                const reservationInfos = row.querySelectorAll('.reservation-info');
                reservationInfos.forEach(info => {
                    // 只計算可見的預約
                    if (info.style.display !== 'none') {
                        if (info.classList.contains('reservation-pending')) pendingCount++;
                        if (info.classList.contains('reservation-completed')) completedCount++;
                    }
                });
            }
        }
    });
    
    // 更新統計區塊
    updateSummary(visibleCount, pendingCount, completedCount);
    
    console.log('篩選完成:', { 
        visibleRows: visibleCount,
        pendingReservations: pendingCount,
        completedReservations: completedCount
    });
}

// 更新統計區塊
function updateSummary(total, pending, completed) {
    // 計算即將到期和已逾期合約
    const tableBody = document.querySelector('#reservationTab table tbody');
    const rows = tableBody.querySelectorAll('tr');
    
    let expiringContracts = 0;
    let expiredContracts = 0;
    const countedContracts = new Set();
    
    rows.forEach(row => {
        // 只計算可見的列
        if (row.style.display === 'none') return;
        
        const contractId = row.querySelector('.contract-id');
        const statusBadge = row.querySelector('.status-badge');
        
        if (contractId && statusBadge && !countedContracts.has(contractId.textContent)) {
            countedContracts.add(contractId.textContent);
            
            if (statusBadge.classList.contains('status-expiring')) {
                expiringContracts++;
            }
            if (statusBadge.classList.contains('status-expired')) {
                expiredContracts++;
            }
        }
    });
    
    const summaryCards = document.querySelectorAll('.summary-card');
    if (summaryCards.length >= 5) {
        // 本月預約總數
        const totalValue = summaryCards[0].querySelector('.value');
        if (totalValue) totalValue.textContent = pending + completed;
        
        // 待執行
        const pendingValue = summaryCards[1].querySelector('.value');
        if (pendingValue) pendingValue.textContent = pending;
        
        // 已完成
        const completedValue = summaryCards[2].querySelector('.value');
        if (completedValue) completedValue.textContent = completed;
        
        // 即將到期合約
        const expiringValue = summaryCards[3].querySelector('.value');
        if (expiringValue) expiringValue.textContent = expiringContracts;
        
        // 已逾期合約
        const expiredValue = summaryCards[4].querySelector('.value');
        if (expiredValue) expiredValue.textContent = expiredContracts;
    }
}

// 重置篩選
function resetFilters() {
    document.getElementById('propertyFilter').value = '';
    document.getElementById('contractFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('reservationStatusFilter').value = '';
    document.getElementById('contractTypeFilter').value = '';
    document.getElementById('monthFilter').value = '';
    
    // 顯示所有列
    const tableBody = document.querySelector('#reservationTab table tbody');
    const rows = tableBody.querySelectorAll('tr');
    
    let pendingCount = 0;
    let completedCount = 0;
    
    rows.forEach(row => {
        row.style.display = '';
        
        // 重新統計所有預約數量，並重置預約格子的顯示狀態
        const reservationInfos = row.querySelectorAll('.reservation-info');
        reservationInfos.forEach(info => {
            // 重置預約格子的顯示狀態
            info.style.display = '';
            
            if (info.classList.contains('reservation-pending')) pendingCount++;
            if (info.classList.contains('reservation-completed')) completedCount++;
        });
    });
    
    // 更新統計區塊
    updateSummary(rows.length, pendingCount, completedCount);
    
    console.log('篩選已重置');
}

// 查看合約詳情
function viewContract(contractId) {
    console.log('查看合約:', contractId);
    // 實際專案中可能會跳轉或開啟 Modal
    alert('查看合約詳情: ' + contractId);
}

// 查看公設詳情
function openFacilityInfo(facilityId) {
    console.log('查看公設:', facilityId);
    alert('查看公設詳情: ' + facilityId);
}

// 點擊視窗外部關閉 Modal
window.onclick = function(event) {
    const modal = document.getElementById('addReservationModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 可以在這裡做一些初始化工作
    console.log('履約總表頁面已載入');
    
    // 初始化統計資料
    initializeSummary();
    
    // 綁定篩選條件的即時篩選事件
    const filterIds = [
        'propertyFilter',
        'contractFilter',
        'statusFilter',
        'reservationStatusFilter',
        'contractTypeFilter',
        'monthFilter'
    ];
    
    filterIds.forEach(id => {
        const filterElement = document.getElementById(id);
        if (filterElement) {
            filterElement.addEventListener('change', function() {
                applyFilters();
            });
        }
    });
});

// 初始化統計資料
function initializeSummary() {
    const tableBody = document.querySelector('#reservationTab table tbody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    
    let pendingCount = 0;
    let completedCount = 0;
    let expiringContracts = 0;
    let expiredContracts = 0;
    
    // 用 Set 避免重複計算相同合約
    const countedContracts = new Set();
    
    rows.forEach(row => {
        const reservationInfos = row.querySelectorAll('.reservation-info');
        reservationInfos.forEach(info => {
            if (info.classList.contains('reservation-pending')) pendingCount++;
            if (info.classList.contains('reservation-completed')) completedCount++;
        });
        
        // 統計即將到期和已逾期合約
        const contractId = row.querySelector('.contract-id');
        const statusBadge = row.querySelector('.status-badge');
        
        if (contractId && statusBadge && !countedContracts.has(contractId.textContent)) {
            countedContracts.add(contractId.textContent);
            
            if (statusBadge.classList.contains('status-expiring')) {
                expiringContracts++;
            }
            if (statusBadge.classList.contains('status-expired')) {
                expiredContracts++;
            }
        }
    });
    
    // 更新統計區塊
    const summaryCards = document.querySelectorAll('.summary-card');
    if (summaryCards.length >= 5) {
        // 本月預約總數
        const totalValue = summaryCards[0].querySelector('.value');
        if (totalValue) totalValue.textContent = pendingCount + completedCount;
        
        // 待執行
        const pendingValue = summaryCards[1].querySelector('.value');
        if (pendingValue) pendingValue.textContent = pendingCount;
        
        // 已完成
        const completedValue = summaryCards[2].querySelector('.value');
        if (completedValue) completedValue.textContent = completedCount;
        
        // 即將到期合約
        const expiringValue = summaryCards[3].querySelector('.value');
        if (expiringValue) expiringValue.textContent = expiringContracts;
        
        // 已逾期合約
        const expiredValue = summaryCards[4].querySelector('.value');
        if (expiredValue) expiredValue.textContent = expiredContracts;
    }
    
    console.log('統計初始化完成:', {
        total: pendingCount + completedCount,
        pending: pendingCount,
        completed: completedCount,
        expiring: expiringContracts,
        expired: expiredContracts
    });
}
