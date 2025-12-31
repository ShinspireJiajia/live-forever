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
    const property = document.getElementById('propertyFilter').value;
    const contract = document.getElementById('contractFilter').value;
    const status = document.getElementById('statusFilter').value;
    const reservationStatus = document.getElementById('reservationStatusFilter').value;
    const contractType = document.getElementById('contractTypeFilter').value;
    const month = document.getElementById('monthFilter').value;
    
    console.log('套用篩選:', { property, contract, status, reservationStatus, contractType, month });
    
    // 實際專案中這裡會執行 AJAX 請求或 DOM 過濾
    alert('篩選條件已套用');
}

// 重置篩選
function resetFilters() {
    document.getElementById('propertyFilter').value = '';
    document.getElementById('contractFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('reservationStatusFilter').value = '';
    document.getElementById('contractTypeFilter').value = '';
    document.getElementById('monthFilter').value = '';
    
    console.log('篩選已重置');
    alert('篩選條件已重置');
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
});
