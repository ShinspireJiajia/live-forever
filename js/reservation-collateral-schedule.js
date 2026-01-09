/**
 * ============================================
 * 陸府建設 CRM 系統 - 對保時段管理 JavaScript
 * ============================================
 * 檔案：reservation-collateral-schedule.js
 * 說明：處理對保時段管理頁面的互動邏輯
 * 建立日期：2025-12-29
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    const sidebarManager = new SidebarManager();
    
    // 當前顯示的週次
    let currentWeekStart = getWeekStart(new Date());
    
    // 時段資料（模擬）
    let scheduleData = {};
    
    // 初始化頁面
    initSchedule();
    
    /**
     * 初始化時段表格
     */
    function initSchedule() {
        updateDateNavigation();
        generateScheduleTable();
        bindSlotEvents();
    }
    
    /**
     * 取得指定日期所屬週的起始日（週日）
     */
    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    
    /**
     * 更新日期導覽顯示
     */
    function updateDateNavigation() {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const startStr = formatDateShort(currentWeekStart);
        const endStr = formatDateShort(weekEnd);
        
        document.getElementById('dateRange').textContent = `${startStr} - ${endStr}`;
        
        // 更新表頭日期
        updateTableHeaders();
    }
    
    /**
     * 格式化日期（月 日）
     */
    function formatDateShort(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}月 ${day}, ${year}`;
    }
    
    /**
     * 更新表格標頭日期
     */
    function updateTableHeaders() {
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        
        for (let i = 0; i < 7; i++) {
            const headerCell = document.getElementById(`dayHeader${i}`);
            if (headerCell) {
                const date = new Date(currentWeekStart);
                date.setDate(date.getDate() + i);
                const month = date.getMonth() + 1;
                const day = date.getDate();
                headerCell.innerHTML = `星期${weekdays[i]}<br>${month}月 ${day}日`;
            }
        }
    }
    
    /**
     * 生成時段表格
     */
    function generateScheduleTable() {
        const tbody = document.getElementById('scheduleBody');
        if (!tbody) return;
        
        // 時段設定（09:00 - 17:30，每30分鐘）
        const timeSlots = [];
        for (let hour = 9; hour < 18; hour++) {
            timeSlots.push(`${String(hour).padStart(2, '0')}:00`);
            if (hour < 17 || (hour === 17 && true)) {
                timeSlots.push(`${String(hour).padStart(2, '0')}:30`);
            }
        }
        
        let html = '';
        timeSlots.forEach(function(time) {
            html += `<tr>
                <td class="time-cell">${time}</td>`;
            
            for (let day = 0; day < 7; day++) {
                const date = new Date(currentWeekStart);
                date.setDate(date.getDate() + day);
                const dateStr = formatDateKey(date);
                const slotKey = `${dateStr}_${time}`;
                const slotValue = scheduleData[slotKey] || 0;
                const slotClass = getSlotClass(slotValue);
                
                html += `<td>
                    <div class="slot ${slotClass}" data-date="${dateStr}" data-time="${time}" data-value="${slotValue}">
                        ${slotValue}
                    </div>
                </td>`;
            }
            
            html += '</tr>';
        });
        
        tbody.innerHTML = html;
        bindSlotEvents();
    }
    
    /**
     * 格式化日期為 key（YYYY-MM-DD）
     */
    function formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * 取得時段樣式類別
     */
    function getSlotClass(value) {
        switch(value) {
            case 0: return 'slot-available';
            case 1: return 'slot-booked-1';
            case 2: return 'slot-booked-2';
            case 3: return 'slot-booked-3';
            default: return 'slot-available';
        }
    }
    
    /**
     * 綁定時段點擊事件
     */
    function bindSlotEvents() {
        document.querySelectorAll('.slot').forEach(function(slot) {
            slot.addEventListener('click', function() {
                const currentValue = parseInt(this.dataset.value) || 0;
                const newValue = (currentValue + 1) % 4; // 循環 0 -> 1 -> 2 -> 3 -> 0
                
                // 更新顯示
                this.dataset.value = newValue;
                this.textContent = newValue;
                this.className = 'slot ' + getSlotClass(newValue);
                
                // 儲存到資料
                const key = `${this.dataset.date}_${this.dataset.time}`;
                scheduleData[key] = newValue;
            });
        });
    }
    
    // 上一週按鈕
    document.getElementById('btnPrevWeek')?.addEventListener('click', function() {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        updateDateNavigation();
        generateScheduleTable();
    });
    
    // 下一週按鈕
    document.getElementById('btnNextWeek')?.addEventListener('click', function() {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        updateDateNavigation();
        generateScheduleTable();
    });
    
    // 複製上一週設定
    document.getElementById('btnCopyLastWeek')?.addEventListener('click', function() {
        if (confirm('確定要複製上一週的時段設定嗎？')) {
            const lastWeekStart = new Date(currentWeekStart);
            lastWeekStart.setDate(lastWeekStart.getDate() - 7);
            
            // 複製上週資料到本週
            for (let day = 0; day < 7; day++) {
                const lastDate = new Date(lastWeekStart);
                lastDate.setDate(lastDate.getDate() + day);
                const lastDateStr = formatDateKey(lastDate);
                
                const currentDate = new Date(currentWeekStart);
                currentDate.setDate(currentDate.getDate() + day);
                const currentDateStr = formatDateKey(currentDate);
                
                // 複製所有時段
                Object.keys(scheduleData).forEach(function(key) {
                    if (key.startsWith(lastDateStr)) {
                        const time = key.split('_')[1];
                        scheduleData[`${currentDateStr}_${time}`] = scheduleData[key];
                    }
                });
            }
            
            generateScheduleTable();
            showSuccessMessage('已複製上一週設定');
        }
    });
    
    // 儲存按鈕
    document.getElementById('btnSave')?.addEventListener('click', function() {
        // 模擬儲存
        console.log('儲存時段設定：', scheduleData);
        showSuccessMessage('時段設定已成功儲存！');
    });
    
    // 返回列表
    document.getElementById('btnBack')?.addEventListener('click', function() {
        window.location.href = 'reservation-collateral.html';
    });
    
    // 案場切換
    document.getElementById('projectSelect')?.addEventListener('change', function() {
        // 重新載入該案場的時段設定
        scheduleData = {};
        generateScheduleTable();
    });
    
    /**
     * 顯示成功訊息
     */
    function showSuccessMessage(message) {
        const msgEl = document.getElementById('successMessage');
        if (msgEl) {
            msgEl.textContent = message;
            msgEl.classList.add('show');
            setTimeout(function() {
                msgEl.classList.remove('show');
            }, 3000);
        } else {
            alert(message);
        }
    }
});
