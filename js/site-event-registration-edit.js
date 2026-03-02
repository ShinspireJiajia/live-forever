/**
 * 案場活動報名紀錄審核 - 頁面專用邏輯
 * 包含：報名資訊渲染、繳費狀態管理、退款流程、附件上傳、操作日誌
 */

document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // 渲染共用元件與側邊欄
    // ============================================
    if (typeof initCRMLayout === 'function') {
        initCRMLayout();
    }
    const sidebarManager = new SidebarManager();

    // ============================================
    // 取得資料
    // ============================================
    const urlParams = new URLSearchParams(window.location.search);
    const regId = urlParams.get('id');

    // 取得報名資料
    const registration = regId
        ? SiteEventMockData.registrations.find(r => r.reg_id === regId)
        : SiteEventMockData.registrations[3]; // 預設帶有費用的資料做示範

    // 取得活動資料
    const event = registration
        ? SiteEventMockData.events.find(e => e.event_id === registration.event_id)
        : null;

    // 產生模擬稽核日誌
    const auditLogs = registration ? [
        {
            action: '建立報名',
            changed_at: registration.created_at,
            changed_by: registration.applicant_name,
            note: '自行報名'
        }
    ] : [];

    if (registration && registration.payment_status === '已繳費' && registration.amount > 0) {
        auditLogs.unshift({
            action: '完成繳費',
            changed_at: new Date(new Date(registration.created_at).getTime() + 3600000).toISOString(),
            changed_by: '系統',
            note: '信用卡支付成功'
        });
    }

    // ============================================
    // 初始化頁面內容
    // ============================================
    if (registration && event) {
        renderRegistrantInfo(registration, event);
        renderEventInfo(event, registration);
        renderPaymentSection(registration, event);
        renderAuditTimeline(auditLogs);

        // 設定退款金額與彈窗內容
        const amount = registration.amount || 0;
        const isPaidReg = registration.payment_status === '已繳費' && amount > 0;
        document.getElementById('refundAmount').textContent = isPaidReg ? '$' + amount.toLocaleString() : '$0';

        // 更新彈窗標題與確認按鈕文字
        const modalTitle = document.querySelector('#refundModal .modal-title');
        const confirmBtn = document.getElementById('btnConfirmRefund');
        const refundAmountSection = document.querySelector('#refundModal .form-group:has(#refundAmount)');

        if (isPaidReg) {
            if (modalTitle) modalTitle.textContent = '取消報名與退款';
            if (confirmBtn) confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i> 確認取消並申請退款';
            if (refundAmountSection) refundAmountSection.style.display = 'block';
        } else {
            if (modalTitle) modalTitle.textContent = '取消報名';
            if (confirmBtn) confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i> 確認取消報名';
            if (refundAmountSection) refundAmountSection.style.display = 'none';
        }

        // 如果報名狀態已是取消，隱藏取消按鈕
        if (registration.registration_status === '已取消') {
            document.getElementById('btnRefundRequest').style.display = 'none';
        }

        // 處理唯讀模式
        handleReadonlyMode(urlParams);
    }

    // ============================================
    // 初始化附件上傳
    // ============================================
    initRefundFileUpload();

    // ============================================
    // 事件綁定
    // ============================================
    bindCancelRegistrationButton(registration, event, auditLogs);
    bindSaveButton();
    bindRefundCompleteButton(registration, event, auditLogs);

    // ============================================
    // 唯讀模式處理
    // ============================================
    function handleReadonlyMode(params) {
        const isReadonly = params.get('readonly') === 'true';
        if (!isReadonly) return;

        // 修改標題
        document.querySelector('.page-title').textContent = '報名紀錄詳情';
        document.querySelector('.breadcrumb-item.active').textContent = '報名詳情';

        // 隱藏操作按鈕
        var btnSave = document.getElementById('btnSave');
        var btnRefundRequest = document.getElementById('btnRefundRequest');
        if (btnSave) btnSave.style.display = 'none';
        if (btnRefundRequest) btnRefundRequest.style.display = 'none';

        // 禁用主內容區的表單元素（排除彈窗內的元素）
        setTimeout(function () {
            var mainContent = document.querySelector('.main-content');
            if (mainContent) {
                var inputs = mainContent.querySelectorAll('input, select, textarea, button');
                inputs.forEach(function (input) {
                    if (input.classList.contains('btn-secondary')) return;
                    if (input.closest('.header') || input.closest('.sidebar')) return;
                    if (input.closest('.modal')) return;
                    input.disabled = true;
                });
            }
        }, 0);
    }

    // ============================================
    // 取消報名按鈕
    // ============================================
    function bindCancelRegistrationButton(reg, evt, logs) {
        document.getElementById('btnRefundRequest').addEventListener('click', function () {
            openModal('refundModal');
        });

        document.getElementById('btnConfirmRefund').addEventListener('click', function () {
            var note = document.getElementById('refundNote').value;
            if (!note) {
                showToast('error', '錯誤', '請輸入取消原因/備註說明');
                return;
            }
            closeModal('refundModal');

            var isPaid = reg.payment_status === '已繳費' && reg.amount > 0;
            var isFree = reg.amount === 0 || reg.payment_status === '免費';
            var isUnpaid = !isPaid && !isFree && reg.amount > 0;

            // 更新報名狀態為已取消
            var oldRegStatus = reg.registration_status;
            reg.registration_status = '已取消';

            // 新增取消報名日誌
            logs.unshift({
                action: '取消報名',
                changed_at: new Date().toISOString(),
                changed_by: '系統管理員',
                old_value: oldRegStatus,
                new_value: '已取消',
                note: note
            });

            // 根據繳費狀態處理退款邏輯
            var oldPaymentStatus = reg.payment_status || '未繳費';

            if (isPaid) {
                reg.payment_status = '待退款';
                logs.unshift({
                    action: '申請退款',
                    changed_at: new Date().toISOString(),
                    changed_by: '系統管理員',
                    old_value: '已繳費',
                    new_value: '待退款',
                    note: '因取消報名申請退款'
                });
                showToast('success', '取消報名成功', '報名已取消，繳費狀態已更新為待退款');
            } else if (isUnpaid) {
                reg.payment_status = '已取消';
                logs.unshift({
                    action: '繳費取消',
                    changed_at: new Date().toISOString(),
                    changed_by: '系統管理員',
                    old_value: oldPaymentStatus,
                    new_value: '已取消',
                    note: '因取消報名，繳費狀態同步取消'
                });
                showToast('success', '取消報名成功', '報名已取消，繳費狀態已更新為已取消');
            } else {
                showToast('success', '取消報名成功', '報名已取消');
            }

            renderAuditTimeline(logs);
            renderPaymentSection(reg, evt);
            renderRegistrantInfo(reg, evt);

            // 隱藏取消報名按鈕
            document.getElementById('btnRefundRequest').style.display = 'none';
        });
    }

    // ============================================
    // 儲存按鈕
    // ============================================
    function bindSaveButton() {
        document.getElementById('btnSave').addEventListener('click', function () {
            var message = '資料已儲存';
            var fileInput = document.getElementById('evidenceFile');
            if (fileInput && fileInput.files.length > 0) {
                message += '，附件已上傳';
            }
            showToast('success', '儲存成功', message);
        });
    }

    // ============================================
    // 退款完成確認按鈕
    // ============================================
    function bindRefundCompleteButton(reg, evt, logs) {
        document.getElementById('btnConfirmRefundComplete').addEventListener('click', function () {
            var uploadedFiles = window.getRefundCompleteUploadedFiles ? window.getRefundCompleteUploadedFiles() : [];
            var note = document.getElementById('refundCompleteNote').value;

            if (uploadedFiles.length === 0) {
                showToast('error', '錯誤', '請上傳退款證明');
                return;
            }

            closeModal('refundCompleteModal');

            var oldPaymentStatus = reg.payment_status;
            reg.payment_status = '退款完成';

            var fileNames = uploadedFiles.map(function (f) { return f.name; }).join('、');

            logs.unshift({
                action: '退款完成',
                changed_at: new Date().toISOString(),
                changed_by: '財務人員',
                old_value: oldPaymentStatus,
                new_value: '退款完成',
                note: note ? note + '（附件：' + fileNames + '）' : '已上傳退款證明（附件：' + fileNames + '）'
            });

            renderAuditTimeline(logs);
            renderPaymentSection(reg, evt);
            showToast('success', '退款完成', '繳費狀態已更新為退款完成，退款證明已上傳');
        });
    }

    // ============================================
    // 全域函數：彈窗、Toast、繳費操作
    // ============================================
    window.openModal = function (id) {
        document.getElementById(id).classList.add('active');
    };

    window.closeModal = function (id) {
        document.getElementById(id).classList.remove('active');
    };

    window.showToast = function (type, title, message) {
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML =
            '<div class="toast-icon">' +
                '<i class="fa-solid ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-exclamation-circle') + '"></i>' +
            '</div>' +
            '<div class="toast-content">' +
                '<div class="toast-title">' + title + '</div>' +
                '<div class="toast-message">' + message + '</div>' +
            '</div>' +
            '<button class="toast-close" onclick="this.parentElement.remove()">' +
                '<i class="fa-solid fa-times"></i>' +
            '</button>';

        var container = document.querySelector('.toast-container');
        container.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 5000);
    };

    window.confirmPayment = function () {
        if (confirm('確定要手動確認此筆報名已繳費嗎？')) {
            registration.payment_status = '已繳費';

            auditLogs.unshift({
                action: '完成繳費',
                changed_at: new Date().toISOString(),
                changed_by: '系統管理員',
                old_value: '未繳費',
                new_value: '已繳費',
                note: '手動確認繳費'
            });

            renderAuditTimeline(auditLogs);
            renderPaymentSection(registration, event);
            showToast('success', '繳費確認成功', '報名狀態已更新為已繳費');
        }
    };

    /**
     * 列印收據功能
     */
    window.printReceipt = function () {
        var amount = registration.amount || 0;
        var paymentMethod = registration.payment_method || '';
        var transactionTime = registration.transaction_complete_time;

        var receiptData = {
            regId: registration.reg_id,
            applicantName: registration.applicant_name,
            phone: registration.phone,
            siteName: registration.site_name,
            unitNo: registration.unit_no,
            eventTitle: event.title,
            eventDate: formatDateTime(event.start_dt),
            amount: amount,
            paymentMethod: paymentMethod,
            transactionTime: transactionTime ? formatDateTime(transactionTime) : '-',
            printDate: new Date().toLocaleString('zh-TW')
        };

        var printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(buildReceiptHTML(receiptData));
        printWindow.document.write('<scr' + 'ipt>window.onload = function() { window.print(); }</scr' + 'ipt>');
        printWindow.document.close();
        showToast('success', '列印收據', '收據列印視窗已開啟');
    };

    /**
     * 處理現金繳費狀態變更
     */
    window.handleCashStatusChange = function (newStatus) {
        var oldStatus = registration.payment_status;
        if (newStatus === oldStatus) return;

        if (confirm('確定要將繳費狀態從「' + oldStatus + '」變更為「' + newStatus + '」嗎？')) {
            registration.payment_status = newStatus;

            auditLogs.unshift({
                action: '繳費狀態變更',
                changed_at: new Date().toISOString(),
                changed_by: '系統管理員',
                old_value: oldStatus,
                new_value: newStatus,
                note: '現金繳費狀態人工變更'
            });

            renderAuditTimeline(auditLogs);
            renderPaymentSection(registration, event);
            showToast('success', '狀態變更成功', '繳費狀態已更新為「' + newStatus + '」');
        } else {
            document.getElementById('cashPaymentStatus').value = oldStatus;
        }
    };

    /**
     * 打開退款完成彈窗
     */
    window.openRefundCompleteModal = function () {
        var amount = registration.amount || 0;
        document.getElementById('refundCompleteAmount').textContent = '$' + amount.toLocaleString();
        document.getElementById('refundCompleteNote').value = '';
        document.getElementById('refundCompleteUploadedFiles').innerHTML = '';
        initRefundCompleteFileUpload();
        openModal('refundCompleteModal');
    };

    // ============================================
    // 渲染函數
    // ============================================

    /**
     * 渲染報名者資訊
     */
    function renderRegistrantInfo(reg, evt) {
        var container = document.getElementById('registrantInfo');
        var eventPrice = evt.price || 0;
        var amount = reg.amount || 0;
        var isFreeEvent = eventPrice === 0 || amount === 0;
        var showReceiptOption = !isFreeEvent && reg.has_receipt;

        var identityDisplay =
            '<div class="detail-value" style="display: flex; align-items: center; gap: 8px;">' +
                '<span class="identity-badge resident"><i class="fa-solid fa-home"></i> 住戶</span>' +
                '<span class="text-muted" style="font-size: 0.9em;">(' + reg.site_name + ' ' + reg.unit_no + ')</span>' +
            '</div>';

        var regStatusClass = reg.registration_status === '已取消' ? 'cancelled' : 'registered';
        var regStatusIcon = reg.registration_status === '已取消' ? 'fa-ban' : 'fa-check-circle';
        var regStatusDisplay =
            '<span class="reg-status-badge ' + regStatusClass + '">' +
                '<i class="fa-solid ' + regStatusIcon + '"></i> ' +
                (reg.registration_status || '已報名') +
            '</span>';

        var paymentMethodDisplay = '';
        if (isFreeEvent) {
            paymentMethodDisplay = '免費活動';
        } else if (reg.payment_method) {
            paymentMethodDisplay = reg.payment_method;
        } else {
            paymentMethodDisplay = '待繳費';
        }

        var receiptLink = '';
        if (showReceiptOption) {
            receiptLink =
                ' <a href="foundation-receipt-edit.html?receiptNo=' + (reg.receipt_no || '') +
                '&donorName=' + encodeURIComponent(reg.applicant_name) +
                '&donorId=' + (reg.user_id || '') +
                '&amount=' + reg.amount +
                '&payMethod=' + encodeURIComponent(reg.payment_method || '') +
                '&eventDate=' + encodeURIComponent(evt.start_dt ? evt.start_dt.split('T')[0] : '') +
                '" class="btn btn-sm btn-outline" style="margin-left: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">' +
                    '<i class="fa-solid fa-file-invoice-dollar"></i> 編輯收據' +
                '</a>';
        }

        // 匯款繳費截止日
        var deadlineDisplay = '';
        if (!isFreeEvent && reg.payment_method === '匯款' && reg.payment_deadline) {
            var deadlineDate = new Date(reg.payment_deadline);
            var now = new Date();
            var isOverdue = now > deadlineDate && reg.payment_status !== '已繳費';
            deadlineDisplay =
                '<div class="detail-item"><span class="detail-label">繳費截止日</span>' +
                '<span class="detail-value" style="' + (isOverdue ? 'color: var(--color-danger); font-weight: 600;' : '') + '">' +
                formatDateTime(reg.payment_deadline) +
                (isOverdue ? ' <i class="fa-solid fa-exclamation-circle" style="color: var(--color-danger);"></i> 已逾期' : '') +
                '</span></div>';
        }

        container.innerHTML =
            '<div class="detail-item"><span class="detail-label">報名編號</span><span class="detail-value">' + reg.reg_id + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">報名狀態</span><span class="detail-value">' + regStatusDisplay + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">報名者姓名</span><span class="detail-value">' + reg.applicant_name + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">身分識別</span>' + identityDisplay + '</div>' +
            '<div class="detail-item"><span class="detail-label">會員編號</span><span class="detail-value">' + (reg.member_id || '-') + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">聯絡電話</span><span class="detail-value">' + reg.phone + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">繳費方式</span><span class="detail-value">' + paymentMethodDisplay + '</span></div>' +
            deadlineDisplay +
            '<div class="detail-item"><span class="detail-label">報名人數</span><span class="detail-value">' + (reg.companion_count + 1) + ' 人（本人 + ' + reg.companion_count + ' 位同行）</span></div>' +
            '<div class="detail-item"><span class="detail-label">報名時間</span><span class="detail-value">' + formatDateTime(reg.created_at) + '</span></div>' +
            (!isFreeEvent
                ? '<div class="detail-item"><span class="detail-label">需要收據</span><span class="detail-value">' + (reg.has_receipt ? '是' : '否') + receiptLink + '</span></div>'
                : '');
    }

    /**
     * 渲染活動資訊
     */
    function renderEventInfo(evt, reg) {
        var container = document.getElementById('eventInfo');
        var price = evt.price || 0;
        var totalAmount = reg.amount || 0;

        container.innerHTML =
            '<div class="detail-item"><span class="detail-label">活動名稱</span><span class="detail-value">' + evt.title + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">活動時間</span><span class="detail-value">' + formatDateTime(evt.start_dt) + ' ~ ' + formatDateTime(evt.end_dt) + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">活動地點</span><span class="detail-value">' + evt.location + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">活動費用</span><span class="detail-value">' + (price > 0 ? '$' + price.toLocaleString() : '免費') + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">應付金額</span><span class="detail-value" style="font-weight: 600; color: var(--color-info);">$' + totalAmount.toLocaleString() + '</span></div>';
    }

    /**
     * 渲染繳費狀態區塊
     */
    function renderPaymentSection(reg, evt) {
        var container = document.getElementById('paymentSection');
        var amount = reg.amount || 0;
        var eventPrice = evt.price || 0;
        var isFreeEvent = eventPrice === 0 || amount === 0;

        // 決定繳費狀態顯示
        var displayStatus = reg.payment_status;
        if (isFreeEvent) {
            displayStatus = '免費';
        } else {
            if (!displayStatus || displayStatus === '待繳費') {
                displayStatus = '未繳費';
            } else if (displayStatus === '已入帳' || displayStatus === '已付款') {
                displayStatus = '已繳費';
            }
        }

        var statusClass = getPaymentStatusClass(displayStatus);
        var paymentMethod = reg.payment_method || '';
        var isCreditCard = paymentMethod === '信用卡';
        var isCash = paymentMethod === '現金';
        var isTransfer = paymentMethod === '匯款';
        var transactionTime = reg.transaction_complete_time;
        var paymentDeadline = reg.payment_deadline || null;

        var html =
            '<div class="payment-card">' +
                '<div class="payment-card-header">' +
                    '<div class="payment-status-info">' +
                        '<span class="payment-status ' + statusClass + '">' + displayStatus + '</span>' +
                        (!isFreeEvent ? '<span class="payment-amount">$' + amount.toLocaleString() + '</span>' : '') +
                    '</div>' +
                '</div>' +
                '<div class="payment-card-body">';

        if (displayStatus === '免費') {
            html += '<p class="payment-hint"><i class="fa-solid fa-gift" style="color: var(--color-success);"></i> 此為免費活動，無須繳費</p>';
        } else if (displayStatus === '未繳費') {
            // 顯示繳費方式
            if (paymentMethod) {
                html += '<div class="payment-detail"><span class="payment-detail-label">繳費方式</span><span class="payment-detail-value">' + paymentMethod + '</span></div>';
            }
            // 匯款：顯示繳費截止日
            if (isTransfer && paymentDeadline) {
                var deadlineDate = new Date(paymentDeadline);
                var now = new Date();
                var isOverdue = now > deadlineDate;
                html +=
                    '<div class="payment-detail"><span class="payment-detail-label">繳費截止日</span>' +
                    '<span class="payment-detail-value" style="color: ' + (isOverdue ? 'var(--color-danger)' : 'var(--color-gray-700)') + '; font-weight: 600;">' +
                    formatDateTime(paymentDeadline) +
                    (isOverdue ? ' <i class="fa-solid fa-exclamation-circle" style="color: var(--color-danger);"></i> 已逾期' : '') +
                    '</span></div>';
            }
            html +=
                '<p class="payment-hint" style="color: var(--color-warning); margin-top: 8px;"><i class="fa-solid fa-clock"></i> 報名者尚未完成繳費</p>' +
                '<div class="payment-actions"><button class="btn btn-outline btn-sm" onclick="confirmPayment()"><i class="fa-solid fa-check"></i> 手動確認繳費</button></div>';
        } else if (displayStatus === '已繳費') {
            html += '<div class="payment-detail"><span class="payment-detail-label">繳費方式</span><span class="payment-detail-value">' + (paymentMethod || '-') + '</span></div>';

            // 信用卡：顯示交易完成時間
            if (isCreditCard && transactionTime) {
                html += '<div class="payment-detail"><span class="payment-detail-label">交易完成時間</span><span class="payment-detail-value">' + formatDateTime(transactionTime) + '</span></div>';
            }

            // 匯款：顯示繳費截止日與入帳時間
            if (isTransfer) {
                if (paymentDeadline) {
                    html += '<div class="payment-detail"><span class="payment-detail-label">繳費截止日</span><span class="payment-detail-value">' + formatDateTime(paymentDeadline) + '</span></div>';
                }
                if (transactionTime) {
                    html += '<div class="payment-detail"><span class="payment-detail-label">入帳確認時間</span><span class="payment-detail-value">' + formatDateTime(transactionTime) + '</span></div>';
                }
            }

            // 現金：可手動變更繳費狀態
            if (isCash) {
                html +=
                    '<div class="form-group" style="margin-top: 16px;">' +
                        '<label class="form-label">變更繳費狀態</label>' +
                        '<select class="form-select" id="cashPaymentStatus" onchange="handleCashStatusChange(this.value)">' +
                            '<option value="已繳費" selected>已繳費</option>' +
                            '<option value="未繳費">未繳費</option>' +
                        '</select>' +
                        '<p class="text-muted" style="font-size: 12px; margin-top: 4px;">現金繳費狀態可由管理者手動變更</p>' +
                    '</div>';
            }

            html +=
                '<div class="form-group" style="margin-top: 16px;"><label class="form-label">佐證資料附件</label><input type="file" class="form-control" id="evidenceFile"><p class="text-muted" style="font-size: 12px; margin-top: 4px;">支援格式：JPG, PNG, PDF</p></div>' +
                '<div class="form-group" style="margin-top: 16px;"><label class="form-label">備註說明</label><textarea class="form-textarea" id="paymentRemarks" rows="3" placeholder="請輸入備註..."></textarea></div>';
        } else if (displayStatus === '待退款') {
            html +=
                '<div class="payment-detail"><span class="payment-detail-label">繳費方式</span><span class="payment-detail-value">' + (paymentMethod || '-') + '</span></div>' +
                '<div class="payment-detail"><span class="payment-detail-label">應退金額</span><span class="payment-detail-value" style="color: var(--color-warning); font-weight: 600;">$' + amount.toLocaleString() + '</span></div>';

            if (transactionTime) {
                html += '<div class="payment-detail"><span class="payment-detail-label">原交易完成時間</span><span class="payment-detail-value">' + formatDateTime(transactionTime) + '</span></div>';
            }

            html +=
                '<p class="text-muted" style="margin-top: 12px;"><i class="fa-solid fa-hourglass-half" style="color: var(--color-warning);"></i> 已申請退款，等待財務處理</p>' +
                '<div class="payment-actions" style="margin-top: 12px;"><button class="btn btn-primary btn-sm" onclick="openRefundCompleteModal()"><i class="fa-solid fa-check"></i> 退款完成</button></div>';
        } else if (displayStatus === '退款完成' || displayStatus === '已退費') {
            html +=
                '<div class="payment-detail"><span class="payment-detail-label">繳費方式</span><span class="payment-detail-value">' + (paymentMethod || '-') + '</span></div>' +
                '<div class="payment-detail"><span class="payment-detail-label">退款金額</span><span class="payment-detail-value">$' + amount.toLocaleString() + '</span></div>';

            if (transactionTime) {
                html += '<div class="payment-detail"><span class="payment-detail-label">原交易完成時間</span><span class="payment-detail-value">' + formatDateTime(transactionTime) + '</span></div>';
            }

            html += '<p class="text-muted" style="margin-top: 12px;"><i class="fa-solid fa-check-circle" style="color: var(--color-success);"></i> 已完成退費程序</p>';
        } else if (displayStatus === '已取消') {
            html += '<p class="text-muted" style="margin-top: 0px;"><i class="fa-solid fa-ban" style="color: var(--color-danger);"></i> 報名已取消</p>';
        }

        html += '</div></div>';
        container.innerHTML = html;
    }

    /**
     * 渲染稽核時間軸
     */
    function renderAuditTimeline(logs) {
        var container = document.getElementById('auditTimeline');

        if (logs.length === 0) {
            container.innerHTML = '<p class="text-muted">尚無操作紀錄</p>';
            return;
        }

        container.innerHTML = logs.map(function (log) {
            var changeHtml = '';
            if (log.old_value || log.new_value) {
                changeHtml =
                    '<p><strong>變更內容：</strong></p>' +
                    '<div class="change-comparison">' +
                        (log.old_value ? '<span class="old-value">' + log.old_value + '</span>' : '') +
                        (log.old_value && log.new_value ? '<i class="fa-solid fa-arrow-right"></i>' : '') +
                        (log.new_value ? '<span class="new-value">' + log.new_value + '</span>' : '') +
                    '</div>';
            }

            return (
                '<div class="timeline-item">' +
                    '<div class="timeline-marker ' + getActionClass(log.action) + '">' +
                        '<i class="fa-solid ' + getActionIcon(log.action) + '"></i>' +
                    '</div>' +
                    '<div class="timeline-content">' +
                        '<div class="timeline-header">' +
                            '<span class="timeline-action">' + log.action + '</span>' +
                            '<span class="timeline-time">' + formatDateTime(log.changed_at) + '</span>' +
                        '</div>' +
                        '<div class="timeline-body">' +
                            '<p><strong>操作者：</strong>' + log.changed_by + '</p>' +
                            changeHtml +
                            (log.note ? '<p style="margin-top:8px;"><strong>備註：</strong>' + log.note + '</p>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
        }).join('');
    }

    // ============================================
    // 輔助函數
    // ============================================

    function getPaymentStatusClass(status) {
        var map = {
            '免費': 'free',
            '待繳費': 'pending',
            '待付款': 'pending',
            '未繳費': 'pending',
            '已入帳': 'paid',
            '已付款': 'paid',
            '已繳費': 'paid',
            '待退款': 'refund-pending',
            '已退費': 'refunded',
            '退款完成': 'refunded',
            '已取消': 'cancelled'
        };
        return map[status] || '';
    }

    function getActionClass(action) {
        if (action.includes('報名')) return 'action-register';
        if (action.includes('繳費')) return 'action-payment';
        if (action.includes('退款')) return 'action-refund';
        if (action.includes('通知')) return 'action-notify';
        return 'action-other';
    }

    function getActionIcon(action) {
        if (action.includes('報名')) return 'fa-user-plus';
        if (action.includes('繳費')) return 'fa-dollar-sign';
        if (action.includes('退款')) return 'fa-rotate-left';
        if (action.includes('通知')) return 'fa-paper-plane';
        return 'fa-edit';
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '-';
        var date = new Date(dateStr);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // ============================================
    // 附件上傳功能
    // ============================================

    /**
     * 初始化退款附件上傳
     */
    function initRefundFileUpload() {
        var dropZone = document.getElementById('refundFileDropZone');
        var fileInput = document.getElementById('refundFileInput');
        var fileListContainer = document.getElementById('refundUploadedFiles');
        var uploadedFiles = [];

        if (!dropZone || !fileInput || !fileListContainer) return;

        dropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', function (e) {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', function (e) {
            handleFiles(e.target.files);
        });

        function handleFiles(files) {
            var validExtensions = ['.jpg', '.jpeg', '.pdf'];
            var maxSize = 10 * 1024 * 1024;

            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var ext = '.' + file.name.split('.').pop().toLowerCase();

                if (!validExtensions.includes(ext)) {
                    showToast('error', '格式錯誤', '檔案 "' + file.name + '" 格式不支援，僅支援 JPG、PDF');
                    continue;
                }
                if (file.size > maxSize) {
                    showToast('error', '檔案過大', '檔案 "' + file.name + '" 超過 10MB 限制');
                    continue;
                }
                var isDuplicate = uploadedFiles.some(function (f) { return f.name === file.name && f.size === file.size; });
                if (isDuplicate) {
                    showToast('warning', '重複檔案', '檔案 "' + file.name + '" 已存在');
                    continue;
                }
                uploadedFiles.push(file);
            }

            renderFileList();
            fileInput.value = '';
        }

        function renderFileList() {
            if (uploadedFiles.length === 0) {
                fileListContainer.innerHTML = '';
                return;
            }
            fileListContainer.innerHTML = uploadedFiles.map(function (file, index) {
                var ext = file.name.split('.').pop().toLowerCase();
                var icon = ext === 'pdf' ? 'fa-file-pdf' : 'fa-file-image';
                var size = formatFileSize(file.size);
                return (
                    '<div class="uploaded-file-item" data-index="' + index + '">' +
                        '<div class="uploaded-file-info">' +
                            '<i class="fa-solid ' + icon + '"></i>' +
                            '<span class="uploaded-file-name">' + file.name + '</span>' +
                            '<span class="uploaded-file-size">(' + size + ')</span>' +
                        '</div>' +
                        '<button type="button" class="btn-remove-file" onclick="removeRefundFile(' + index + ')" title="移除檔案">' +
                            '<i class="fa-solid fa-times"></i>' +
                        '</button>' +
                    '</div>'
                );
            }).join('');
        }

        window.removeRefundFile = function (index) {
            uploadedFiles.splice(index, 1);
            renderFileList();
        };

        window.getRefundUploadedFiles = function () {
            return uploadedFiles;
        };
    }

    /**
     * 退款完成附件上傳功能
     */
    function initRefundCompleteFileUpload() {
        var dropZone = document.getElementById('refundCompleteFileDropZone');
        var fileInput = document.getElementById('refundCompleteFileInput');
        var fileListContainer = document.getElementById('refundCompleteUploadedFiles');
        var uploadedFiles = [];

        if (!dropZone || !fileInput || !fileListContainer) return;

        var newDropZone = dropZone.cloneNode(true);
        dropZone.parentNode.replaceChild(newDropZone, dropZone);
        var newFileInput = newDropZone.querySelector('#refundCompleteFileInput');

        newDropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            newDropZone.classList.add('dragover');
        });

        newDropZone.addEventListener('dragleave', function (e) {
            e.preventDefault();
            newDropZone.classList.remove('dragover');
        });

        newDropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            newDropZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        newFileInput.addEventListener('change', function (e) {
            handleFiles(e.target.files);
        });

        function handleFiles(files) {
            var validExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
            var maxSize = 10 * 1024 * 1024;

            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var ext = '.' + file.name.split('.').pop().toLowerCase();

                if (!validExtensions.includes(ext)) {
                    showToast('error', '格式錯誤', '檔案 "' + file.name + '" 格式不支援，僅支援 JPG、PNG、PDF');
                    continue;
                }
                if (file.size > maxSize) {
                    showToast('error', '檔案過大', '檔案 "' + file.name + '" 超過 10MB 限制');
                    continue;
                }
                var isDuplicate = uploadedFiles.some(function (f) { return f.name === file.name && f.size === file.size; });
                if (isDuplicate) {
                    showToast('warning', '重複檔案', '檔案 "' + file.name + '" 已存在');
                    continue;
                }
                uploadedFiles.push(file);
            }

            renderFileList();
            newFileInput.value = '';
        }

        function renderFileList() {
            if (uploadedFiles.length === 0) {
                fileListContainer.innerHTML = '';
                return;
            }
            fileListContainer.innerHTML = uploadedFiles.map(function (file, index) {
                var ext = file.name.split('.').pop().toLowerCase();
                var icon = ext === 'pdf' ? 'fa-file-pdf' : 'fa-file-image';
                var size = formatFileSize(file.size);
                return (
                    '<div class="uploaded-file-item" data-index="' + index + '">' +
                        '<div class="uploaded-file-info">' +
                            '<i class="fa-solid ' + icon + '"></i>' +
                            '<span class="uploaded-file-name">' + file.name + '</span>' +
                            '<span class="uploaded-file-size">(' + size + ')</span>' +
                        '</div>' +
                        '<button type="button" class="btn-remove-file" onclick="removeRefundCompleteFile(' + index + ')" title="移除檔案">' +
                            '<i class="fa-solid fa-times"></i>' +
                        '</button>' +
                    '</div>'
                );
            }).join('');
        }

        window.removeRefundCompleteFile = function (index) {
            uploadedFiles.splice(index, 1);
            renderFileList();
        };

        window.getRefundCompleteUploadedFiles = function () {
            return uploadedFiles;
        };
    }

    /**
     * 格式化檔案大小
     */
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /**
     * 建立收據列印 HTML
     */
    function buildReceiptHTML(data) {
        return (
            '<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8">' +
            '<title>繳費收據 - ' + data.regId + '</title>' +
            '<style>' +
                'body { font-family: "Microsoft JhengHei", sans-serif; padding: 40px; }' +
                '.receipt { max-width: 600px; margin: 0 auto; border: 2px solid #333; padding: 30px; }' +
                '.receipt-header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 20px; margin-bottom: 20px; }' +
                '.receipt-header h1 { margin: 0; font-size: 24px; }' +
                '.receipt-header p { margin: 5px 0; color: #666; }' +
                '.receipt-body { margin-bottom: 20px; }' +
                '.receipt-row { display: flex; margin-bottom: 10px; }' +
                '.receipt-label { width: 120px; font-weight: bold; color: #333; }' +
                '.receipt-value { flex: 1; }' +
                '.receipt-amount { font-size: 24px; color: #5B9BD5; font-weight: bold; text-align: center; padding: 20px; border: 2px dashed #5B9BD5; margin: 20px 0; }' +
                '.receipt-footer { text-align: center; font-size: 12px; color: #999; border-top: 1px solid #ccc; padding-top: 20px; }' +
                '@media print { body { padding: 0; } .receipt { border: none; } }' +
            '</style></head><body><div class="receipt">' +
            '<div class="receipt-header"><h1>陸府建設 活動繳費收據</h1><p>報名編號：' + data.regId + '</p></div>' +
            '<div class="receipt-body">' +
                '<div class="receipt-row"><span class="receipt-label">報名者姓名</span><span class="receipt-value">' + data.applicantName + '</span></div>' +
                '<div class="receipt-row"><span class="receipt-label">聯絡電話</span><span class="receipt-value">' + data.phone + '</span></div>' +
                '<div class="receipt-row"><span class="receipt-label">案場/戶別</span><span class="receipt-value">' + data.siteName + ' ' + data.unitNo + '</span></div>' +
                '<div class="receipt-row"><span class="receipt-label">活動名稱</span><span class="receipt-value">' + data.eventTitle + '</span></div>' +
                '<div class="receipt-row"><span class="receipt-label">活動時間</span><span class="receipt-value">' + data.eventDate + '</span></div>' +
                '<div class="receipt-row"><span class="receipt-label">繳費方式</span><span class="receipt-value">' + data.paymentMethod + '</span></div>' +
                (data.transactionTime !== '-'
                    ? '<div class="receipt-row"><span class="receipt-label">交易完成時間</span><span class="receipt-value">' + data.transactionTime + '</span></div>'
                    : '') +
            '</div>' +
            '<div class="receipt-amount">繳費金額：NT$ ' + data.amount.toLocaleString() + '</div>' +
            '<div class="receipt-footer"><p>列印時間：' + data.printDate + '</p><p>此收據僅供參考，實際金額以系統記錄為準</p></div>' +
            '</div></body></html>'
        );
    }
});
