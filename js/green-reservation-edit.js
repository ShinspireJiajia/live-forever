document.addEventListener('DOMContentLoaded', function() {
    // 初始化側邊欄
    // 渲染共用元件 (Header + Sidebar)

    if (typeof initCRMLayout === 'function') {

        initCRMLayout();

    }

    

    const sidebarManager = new SidebarManager();

    // 取得今天日期
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    
    // 取得初始值以供比對
    const initialDate = document.getElementById('appointmentDate') ? document.getElementById('appointmentDate').value : '';
    const initialTime = document.getElementById('appointmentTime') ? document.getElementById('appointmentTime').value : '';

    // 設定日期最小值為今天
    const appointmentDateInput = document.getElementById('appointmentDate');
    if (appointmentDateInput) {
        appointmentDateInput.min = todayFormatted;
    }
    
    // 表單驗證與提交
    const editForm = document.getElementById('editForm');
    const successModal = document.getElementById('success-modal');
    const closeSuccess = document.getElementById('close-success');
    const confirmSuccess = document.getElementById('confirm-success');
    
    if (editForm) {
        editForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            let isValid = true;
            
            // 驗證日期
            const appointmentDate = appointmentDateInput.value;
            const dateError = document.getElementById('dateError');
            if (appointmentDate < todayFormatted) {
                appointmentDateInput.classList.add('is-invalid');
                if (dateError) dateError.style.display = 'block';
                isValid = false;
            } else {
                appointmentDateInput.classList.remove('is-invalid');
                if (dateError) dateError.style.display = 'none';
            }
            
            // 驗證時間
            const appointmentTimeInput = document.getElementById('appointmentTime');
            const timeError = document.getElementById('timeError');
            if (!appointmentTimeInput.value) {
                appointmentTimeInput.classList.add('is-invalid');
                if (timeError) timeError.style.display = 'block';
                isValid = false;
            } else {
                appointmentTimeInput.classList.remove('is-invalid');
                if (timeError) timeError.style.display = 'none';
            }
            
            // 驗證服務時間
            const serviceHoursInput = document.getElementById('serviceHours');
            const hoursError = document.getElementById('hoursError');
            const serviceHours = parseFloat(serviceHoursInput.value);
            if (isNaN(serviceHours) || serviceHours < 0.5 || serviceHours > 24) {
                serviceHoursInput.classList.add('is-invalid');
                if (hoursError) hoursError.style.display = 'block';
                isValid = false;
            } else {
                serviceHoursInput.classList.remove('is-invalid');
                if (hoursError) hoursError.style.display = 'none';
            }
            
            // 驗證預約人
            const contactPersonInput = document.getElementById('contactPerson');
            const personError = document.getElementById('personError');
            if (!contactPersonInput.value.trim()) {
                contactPersonInput.classList.add('is-invalid');
                if (personError) personError.style.display = 'block';
                isValid = false;
            } else {
                contactPersonInput.classList.remove('is-invalid');
                if (personError) personError.style.display = 'none';
            }
            
            // 驗證聯絡電話
            const contactPhoneInput = document.getElementById('contactPhone');
            const phoneError = document.getElementById('phoneError');
            const phonePattern = /^[0-9]{10}$/;
            if (!phonePattern.test(contactPhoneInput.value)) {
                contactPhoneInput.classList.add('is-invalid');
                if (phoneError) phoneError.style.display = 'block';
                isValid = false;
            } else {
                contactPhoneInput.classList.remove('is-invalid');
                if (phoneError) phoneError.style.display = 'none';
            }
            
            // 如果驗證通過，提交表單
            if (isValid) {
                // 檢查日期是否變更
                const newDate = appointmentDateInput.value;
                const newTime = appointmentTimeInput.value;
                
                if ((newDate !== initialDate || newTime !== initialTime) && typeof receiveMessage === 'function') {
                    const now = new Date();
                    const timeString = now.toLocaleString('zh-TW', { hour12: false });
                    receiveMessage(`[系統訊息] 預約時間已變更。從 ${initialDate} ${initialTime} 改為 ${newDate} ${newTime} (${timeString})`);
                }

                // 在實際應用中，這裡會發送資料到伺服器
                console.log('表單資料已儲存');
                
                // 顯示成功訊息
                if (successModal) {
                    successModal.classList.add('active');
                } else {
                    alert('資料已成功儲存！');
                    window.location.href = 'green-reservation.html';
                }
            }
        });
    }
    
    // 關閉成功提示彈窗
    if (closeSuccess) {
        closeSuccess.addEventListener('click', function() {
            if (successModal) successModal.classList.remove('active');
            window.location.href = 'green-reservation.html';
        });
    }
    
    if (confirmSuccess) {
        confirmSuccess.addEventListener('click', function() {
            if (successModal) successModal.classList.remove('active');
            window.location.href = 'green-reservation.html';
        });
    }

    // 取消按鈕功能
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            // 返回列表，不需確認
            window.location.href = 'green-reservation.html';
        });
    }
    
    // 取消預約相關功能
    const cancelReservationBtn = document.getElementById('cancelReservationBtn');
    const cancelReservationModal = document.getElementById('cancel-reservation-modal');
    const closeCancelReservation = document.getElementById('close-cancel-reservation');
    const abortCancelReservation = document.getElementById('abort-cancel-reservation');
    const confirmCancelReservation = document.getElementById('confirm-cancel-reservation');
    const cancelReasonInput = document.getElementById('cancelReason');
    const cancelReasonError = document.getElementById('cancelReasonError');
    const reservationStatus = document.getElementById('reservationStatus');
    const saveBtn = document.getElementById('saveBtn');

    if (cancelReservationBtn) {
        cancelReservationBtn.addEventListener('click', function() {
            if (cancelReservationModal) {
                cancelReservationModal.classList.add('active');
                if (cancelReasonInput) cancelReasonInput.value = '';
                if (cancelReasonError) cancelReasonError.style.display = 'none';
            }
        });
    }

    function closeCancelModal() {
        if (cancelReservationModal) cancelReservationModal.classList.remove('active');
    }

    if (closeCancelReservation) closeCancelReservation.addEventListener('click', closeCancelModal);
    if (abortCancelReservation) abortCancelReservation.addEventListener('click', closeCancelModal);

    if (confirmCancelReservation) {
        confirmCancelReservation.addEventListener('click', function() {
            const reason = cancelReasonInput.value.trim();
            if (!reason) {
                if (cancelReasonInput) cancelReasonInput.classList.add('is-invalid');
                if (cancelReasonError) cancelReasonError.style.display = 'block';
                return;
            }

            // 更新狀態
            if (reservationStatus) {
                reservationStatus.textContent = '已取消';
                reservationStatus.className = 'status-badge status-badge-cancelled';
            }

            // 記錄到聊天室/系統紀錄
            if (typeof receiveMessage === 'function') {
                const now = new Date();
                const timeString = now.toLocaleString('zh-TW', { hour12: false });
                receiveMessage(`[系統訊息] 預約已取消。原因：${reason} (${timeString})`);
            }

            // 新增到操作紀錄表格
            const historyTable = document.getElementById('historyTable');
            if (historyTable) {
                const tbody = historyTable.querySelector('tbody');
                const now = new Date();
                // 格式化時間 YYYY/MM/DD HH:mm
                const timeString = now.getFullYear() + '/' + 
                                  (now.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                                  now.getDate().toString().padStart(2, '0') + ' ' + 
                                  now.getHours().toString().padStart(2, '0') + ':' + 
                                  now.getMinutes().toString().padStart(2, '0');
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${timeString}</td>
                    <td>系統管理員</td>
                    <td>取消預約</td>
                    <td>${reason}</td>
                `;
                
                // 插入到第一列 (最新的在最上面)
                if (tbody.firstChild) {
                    tbody.insertBefore(row, tbody.firstChild);
                } else {
                    tbody.appendChild(row);
                }
            }

            // 關閉彈窗
            closeCancelModal();
            
            // 禁用表單按鈕
            if (saveBtn) saveBtn.disabled = true;
            if (cancelReservationBtn) cancelReservationBtn.disabled = true;
            
            // 顯示提示
            alert('預約已取消');
        });
    }

    // 預約已確認按鈕功能
    const confirmReservationBtn = document.getElementById('confirmReservationBtn');
    if (confirmReservationBtn) {
        confirmReservationBtn.addEventListener('click', function() {
            // 更新狀態
            if (reservationStatus) {
                reservationStatus.textContent = '預約已確認';
                reservationStatus.className = 'status-badge status-badge-active';
                // 可以根據需要更改樣式，例如使用不同的顏色
                reservationStatus.style.backgroundColor = '#e8f5e9';
                reservationStatus.style.color = '#2e7d32';
                reservationStatus.style.borderColor = '#a5d6a7';
            }

            // 記錄到聊天室/系統紀錄
            if (typeof receiveMessage === 'function') {
                const now = new Date();
                const timeString = now.toLocaleString('zh-TW', { hour12: false });
                receiveMessage(`[系統訊息] 預約狀態已變更為「預約已確認」 (${timeString})`);
            }

            // 新增到操作紀錄表格
            const historyTable = document.getElementById('historyTable');
            if (historyTable) {
                const tbody = historyTable.querySelector('tbody');
                const now = new Date();
                // 格式化時間 YYYY/MM/DD HH:mm
                const timeString = now.getFullYear() + '/' + 
                                  (now.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                                  now.getDate().toString().padStart(2, '0') + ' ' + 
                                  now.getHours().toString().padStart(2, '0') + ':' + 
                                  now.getMinutes().toString().padStart(2, '0');
                
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${timeString}</td>
                    <td>當前使用者</td>
                    <td>確認預約</td>
                    <td>維護人員確認預約</td>
                `;
                
                // 插入到第一列
                if (tbody.firstChild) {
                    tbody.insertBefore(newRow, tbody.firstChild);
                } else {
                    tbody.appendChild(newRow);
                }
            }

            // 隱藏確認按鈕，避免重複點擊
            this.style.display = 'none';

            // 顯示成功訊息
            alert('預約已確認！');
        });
    }
    
    // 取消輸入框的錯誤狀態
    if (cancelReasonInput) {
        cancelReasonInput.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
                if (cancelReasonError) cancelReasonError.style.display = 'none';
            }
        });
    }
    
    // 日期時間驗證 - 即時檢查
    if (appointmentDateInput) {
        appointmentDateInput.addEventListener('change', function() {
            const dateError = document.getElementById('dateError');
            if (this.value < todayFormatted) {
                this.classList.add('is-invalid');
                if (dateError) dateError.style.display = 'block';
            } else {
                this.classList.remove('is-invalid');
                if (dateError) dateError.style.display = 'none';
            }
        });
    }
    
    // 服務時間驗證 - 即時檢查
    const serviceHoursInput = document.getElementById('serviceHours');
    if (serviceHoursInput) {
        serviceHoursInput.addEventListener('input', function() {
            const hoursError = document.getElementById('hoursError');
            const val = parseFloat(this.value);
            if (isNaN(val) || val < 0.5 || val > 24) {
                this.classList.add('is-invalid');
                if (hoursError) hoursError.style.display = 'block';
            } else {
                this.classList.remove('is-invalid');
                if (hoursError) hoursError.style.display = 'none';
            }
        });
    }
    
    // 完工確認單功能
    // viewBtn 已經改為連結，不需要 JS 處理點擊事件，除非需要額外邏輯
    
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // 開啟完工確認單報告頁面
            window.open('green-reservation-report.html', '_blank');
        });
    }
});
