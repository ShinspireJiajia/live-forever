/**
 * ============================================
 * 基金會活動報名管理 - JavaScript
 * ============================================
 * 檔案：foundation-registration.js
 * 說明：基金會活動報名紀錄管理功能
 * ============================================
 */

/**
 * 基金會報名管理類別
 */
class FoundationRegistrationManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.currentEventId = null;
        this.currentEvent = null;
        this.registrations = [];
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 從 URL 取得活動 ID
        const urlParams = new URLSearchParams(window.location.search);
        this.currentEventId = urlParams.get('eventId');
        
        this.loadEventInfo();
        this.loadRegistrations();
        this.initProjectFilter();
        this.bindEvents();
        this.renderTable();
        this.updateStats();
    }

    /**
     * 初始化案場篩選選項
     */
    initProjectFilter() {
        const select = document.getElementById('searchProject');
        if (!select) return;

        const projects = ['植森', '原森', '觀止', '臻綠', '織森'];
        projects.forEach(proj => {
            const option = document.createElement('option');
            option.value = proj;
            option.textContent = proj;
            select.appendChild(option);
        });
    }

    /**
     * 載入活動資訊
     */
    loadEventInfo() {
        if (this.currentEventId) {
            this.currentEvent = FoundationMockData.getEventById(this.currentEventId);
            this.renderEventInfo();
        }
    }

    /**
     * 渲染活動資訊
     */
    renderEventInfo() {
        const event = this.currentEvent;
        const infoEl = document.getElementById('eventInfoCard');
        if (!infoEl) return;

        if (!event) {
            infoEl.style.display = 'none';
            return;
        }

        infoEl.style.display = 'block';
        const totalCapacity = FoundationMockData.getEventTotalCapacity(event.event_id);
        const totalRegistered = FoundationMockData.getEventRegisteredCount(event.event_id);
        const sessions = FoundationMockData.getSessionsByEventId(event.event_id);
        const isFree = event.resident_adult_price === 0 && event.non_resident_adult_price === 0;

        infoEl.innerHTML = `
            <div class="event-info-header">
                <div>
                    <h2 class="event-info-title">${event.title}</h2>
                    ${event.is_resident_only ? '<span class="identity-badge resident" style="margin-left:8px;">住戶限定</span>' : ''}
                </div>
            </div>
            <div class="event-info-grid">
                <div class="event-info-item">
                    <span class="event-info-label">場次數</span>
                    <span class="event-info-value">${sessions.length} 場</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">報名費用</span>
                    <span class="event-info-value">${isFree ? '免費' : '住戶 $' + event.resident_adult_price + ' / 非住戶 $' + event.non_resident_adult_price}</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">總名額 / 已報名</span>
                    <span class="event-info-value">${totalCapacity} 人 / ${totalRegistered} 人</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">攜伴上限</span>
                    <span class="event-info-value">${event.allow_companion ? event.max_companion + ' 人' : '不開放攜伴'}</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">通行碼</span>
                    <span class="event-info-value">${event.access_code || '無'}</span>
                </div>
                <div class="event-info-item">
                    <span class="event-info-label">最後同步時間</span>
                    <span class="event-info-value">${this.formatDateTime(event.last_sync_at)}</span>
                </div>
            </div>
        `;
    }

    /**
     * 載入報名紀錄
     */
    loadRegistrations() {
        if (this.currentEventId) {
            this.registrations = FoundationMockData.getRegistrationsByEventId(this.currentEventId);
        } else {
            this.registrations = FoundationMockData.registrations;
        }
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 查詢表單
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
            searchForm.addEventListener('reset', () => {
                setTimeout(() => {
                    this.currentPage = 1;
                    this.renderTable();
                }, 0);
            });
        }

        // 新增報名
        const btnAdd = document.getElementById('btnAdd');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                if (!this.currentEventId) {
                    alert('此功能僅限於特定活動下使用，請由「活動設定」列表進入「報名管理」頁面操作。');
                    return;
                }
                this.openAddModal();
            });
        }

        // 匯出
        const btnExport = document.getElementById('btnExport');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportData());
        }

        // 發送通知
        const btnNotify = document.getElementById('btnNotify');
        if (btnNotify) {
            btnNotify.addEventListener('click', () => this.sendNotification());
        }
    }

    /**
     * 取得活動狀態
     */
    getEventStatus(event) {
        const now = new Date();
        const startDate = new Date(event.start_dt);
        const endDate = new Date(event.end_dt);
        
        if (now < startDate) return '即將開始';
        if (now >= startDate && now <= endDate) return '進行中';
        return '已結束';
    }

    /**
     * 取得狀態樣式類別
     */
    getStatusClass(status) {
        switch (status) {
            case '即將開始': return 'upcoming';
            case '進行中': return 'active';
            case '已結束': return 'ended';
            default: return '';
        }
    }

    /**
     * 處理查詢
     */
    handleSearch() {
        this.currentPage = 1;
        this.renderTable();
    }

    /**
     * 取得篩選條件
     */
    getFilters() {
        const filters = {};
        
        const searchName = document.getElementById('searchName');
        const searchPhone = document.getElementById('searchPhone');
        const searchIdentity = document.getElementById('searchIdentity');
        const searchPaymentStatus = document.getElementById('searchPaymentStatus');
        const searchProject = document.getElementById('searchProject');
        const searchUnit = document.getElementById('searchUnit');
        
        if (searchName?.value) filters.name = searchName.value;
        if (searchPhone?.value) filters.phone = searchPhone.value;
        if (searchIdentity?.value) filters.identity = searchIdentity.value;
        if (searchPaymentStatus?.value) filters.paymentStatus = searchPaymentStatus.value;
        if (searchProject?.value) filters.project = searchProject.value;
        if (searchUnit?.value) filters.unit = searchUnit.value;
        
        return filters;
    }

    /**
     * 篩選報名紀錄
     */
    filterRegistrations() {
        const filters = this.getFilters();
        let filtered = [...this.registrations];
        
        if (filters.name) {
            filtered = filtered.filter(r => 
                r.applicant_name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }

        if (filters.project) {
            filtered = filtered.filter(r => {
                if (r.user_identity === '住戶' && r.crm_member_id) {
                    const projects = ['植森', '原森', '觀止', '臻綠', '織森'];
                    const idSum = r.crm_member_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    return projects[idSum % projects.length] === filters.project;
                }
                return false;
            });
        }

        if (filters.unit) {
            filtered = filtered.filter(r => {
                if (r.user_identity === '住戶' && r.crm_member_id) {
                    const units = ['A棟-3F', 'A棟-5F', 'A棟-8F', 'B棟-2F', 'B棟-7F', 'B棟-11F', 'C棟-5F', 'C棟-9F', 'C棟-10F'];
                    const idSum = r.crm_member_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    return units[idSum % units.length].toLowerCase().includes(filters.unit.toLowerCase());
                }
                return false;
            });
        }
        
        if (filters.phone) {
            filtered = filtered.filter(r => 
                r.phone.includes(filters.phone)
            );
        }
        
        if (filters.identity) {
            filtered = filtered.filter(r => r.user_identity === filters.identity);
        }
        
        if (filters.paymentStatus) {
            filtered = filtered.filter(r => r.payment_status === filters.paymentStatus);
        }
        
        return filtered;
    }

    /**
     * 渲染表格
     */
    renderTable() {
        const tbody = document.getElementById('registrationTableBody');
        if (!tbody) return;
        
        const filtered = this.filterRegistrations();
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = filtered.slice(start, end);
        
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="14" class="text-center">無符合條件的報名資料</td></tr>';
            return;
        }
        
        tbody.innerHTML = pageData.map((reg, index) => {
            const daysSince = FoundationMockData.getDaysSinceRegistration(reg.created_at);
            const canRefund = FoundationMockData.canRefund(reg.created_at);
            const paymentStatusClass = this.getPaymentStatusClass(reg.payment_status);
            const paymentMethodIcon = this.getPaymentMethodIcon(reg.payment_method);
            
            // Mock Unit Info
            let unitInfo = '-';
            let projectInfo = '-';
            if (reg.user_identity === '住戶' && reg.crm_member_id) {
                const units = ['A棟-3F', 'A棟-5F', 'A棟-8F', 'B棟-2F', 'B棟-7F', 'B棟-11F', 'C棟-5F', 'C棟-9F', 'C棟-10F'];
                const projects = ['植森', '原森', '觀止', '臻綠', '織森'];
                const idSum = reg.crm_member_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                unitInfo = units[idSum % units.length];
                projectInfo = projects[idSum % projects.length];
            }
            
            // 取得場次資訊
            const session = reg.session_id ? FoundationMockData.getSessionById(reg.session_id) : null;
            const sessionText = session ? session.activity_time : '-';

            return `
                <tr>
                    <td>${start + index + 1}</td>
                    <td>${projectInfo}</td>
                    <td>${unitInfo}</td>
                    <td>
                        ${reg.user_identity}
                    </td>
                    <td>
                        ${reg.applicant_name}
                    </td>
                    <td>${reg.phone}</td>
                    <td style="font-size:12px;">${sessionText}</td>
                    <td>${(reg.companion_count || 0) + 1} 人</td>
                    <td>
                        $${reg.final_amount.toLocaleString()}
                        ${reg.original_amount !== reg.final_amount ? 
                            `<br><small style="text-decoration: line-through; color: #888;">$${reg.original_amount.toLocaleString()}</small>` : ''}
                    </td>
                    <td>${reg.payment_method || '-'}</td>
                    <td>${reg.payment_status}</td>
                    <td>${this.formatDate(reg.created_at)}</td>
                    <td>${reg.has_receipt ? '是' : '否'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-success" onclick="registrationManager.viewDetail('${reg.reg_id}')">查看</button>
                            <button class="btn btn-sm btn-outline-success" onclick="registrationManager.editRegistration('${reg.reg_id}')">編輯</button>
                            ${reg.payment_status === '待繳費' ? `
                                <button class="btn btn-sm btn-outline-success" onclick="registrationManager.confirmPayment('${reg.reg_id}')">確認繳費</button>
                            ` : ''}
                            ${reg.payment_status === '已入帳' && canRefund ? `
                                <button class="btn btn-sm btn-outline-danger" onclick="registrationManager.markRefund('${reg.reg_id}')">標記退費</button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // 渲染分頁
        this.renderPagination(filtered.length);
    }

    /**
     * 取得繳費狀態樣式
     */
    getPaymentStatusClass(status) {
        switch (status) {
            case '待繳費': return 'pending';
            case '已入帳': return 'paid';
            case '已取消': return 'cancelled';
            case '退費中': return 'refunding';
            default: return '';
        }
    }

    /**
     * 取得繳費方式圖示
     */
    getPaymentMethodIcon(method) {
        switch (method) {
            case '信用卡': return '<i class="fa-solid fa-credit-card"></i>';
            case '轉帳': return '<i class="fa-solid fa-building-columns"></i>';
            case '現金': return '<i class="fa-solid fa-money-bill-wave"></i>';
            default: return '';
        }
    }

    /**
     * 取得繳費方式樣式
     */
    getPaymentMethodClass(method) {
        switch (method) {
            case '信用卡': return 'credit-card';
            case '轉帳': return 'transfer';
            case '現金': return 'cash';
            default: return '';
        }
    }

    /**
     * 格式化日期時間
     */
    formatDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 格式化日期
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    /**
     * 渲染分頁
     */
    renderPagination(totalItems) {
        const wrapper = document.getElementById('paginationWrapper');
        if (!wrapper) return;
        
        const totalPages = Math.ceil(totalItems / this.pageSize);
        
        if (totalPages <= 1) {
            wrapper.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination">';
        
        // 上一頁
        html += `<button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="registrationManager.goToPage(${this.currentPage - 1})">
            <i class="fa-solid fa-chevron-left"></i>
        </button>`;
        
        // 頁碼
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="registrationManager.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<span class="page-ellipsis">...</span>';
            }
        }
        
        // 下一頁
        html += `<button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="registrationManager.goToPage(${this.currentPage + 1})">
            <i class="fa-solid fa-chevron-right"></i>
        </button>`;
        
        html += '</div>';
        wrapper.innerHTML = html;
    }

    /**
     * 跳轉頁面
     */
    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
    }

    /**
     * 更新統計
     */
    updateStats() {
        const stats = this.currentEventId ? 
            FoundationMockData.getRegistrationStats(this.currentEventId) :
            this.calculateAllStats();
        
        const totalEl = document.getElementById('statTotal');
        const pendingEl = document.getElementById('statPending');
        const paidEl = document.getElementById('statPaid');
        const cancelledEl = document.getElementById('statCancelled');
        const refundingEl = document.getElementById('statRefunding');
        const residentEl = document.getElementById('statResident');
        
        if (totalEl) totalEl.textContent = stats.total;
        if (pendingEl) pendingEl.textContent = stats.pending;
        if (paidEl) paidEl.textContent = stats.paid;
        if (cancelledEl) cancelledEl.textContent = stats.cancelled;
        if (refundingEl) refundingEl.textContent = stats.refunding;
        if (residentEl) residentEl.textContent = stats.resident;
    }

    /**
     * 計算所有統計
     */
    calculateAllStats() {
        const registrations = this.registrations;
        return {
            total: registrations.length,
            pending: registrations.filter(r => r.payment_status === '待繳費').length,
            paid: registrations.filter(r => r.payment_status === '已入帳').length,
            cancelled: registrations.filter(r => r.payment_status === '已取消').length,
            refunding: registrations.filter(r => r.payment_status === '退費中').length,
            resident: registrations.filter(r => r.user_identity === '住戶').length
        };
    }

    /**
     * 查看報名詳情
     */
    viewDetail(regId) {
        window.location.href = `foundation-registration-edit.html?id=${regId}&readonly=true`;
    }

    /**
     * 編輯/稽核報名
     */
    editRegistration(regId) {
        window.location.href = `foundation-registration-edit.html?id=${regId}`;
    }

    /**
     * 確認繳費
     */
    confirmPayment(regId) {
        if (confirm('確定要將此報名標記為「已入帳」嗎？')) {
            this.showToast('success', '繳費確認', '已將報名狀態更新為已入帳');
            this.renderTable();
            this.updateStats();
        }
    }

    /**
     * 標記退費 - 開啟退款彈窗
     */
    markRefund(regId) {
        const reg = this.registrations.find(r => r.reg_id === regId);
        if (!reg) return;
        
        if (!FoundationMockData.canRefund(reg.created_at)) {
            this.showToast('error', '無法退費', '此報名已超過 180 天，依規定不可退費');
            return;
        }
        
        // 儲存當前退款的報名 ID
        this.currentRefundRegId = regId;
        
        // 設定退款金額顯示
        const refundAmountEl = document.getElementById('refundAmount');
        if (refundAmountEl) {
            refundAmountEl.textContent = '$' + reg.final_amount.toLocaleString();
        }
        
        // 清空備註欄位
        const refundNoteEl = document.getElementById('refundNote');
        if (refundNoteEl) {
            refundNoteEl.value = '';
        }
        
        // 開啟退款彈窗
        this.openRefundModal();
    }

    /**
     * 開啟退款彈窗
     */
    openRefundModal() {
        const modal = document.getElementById('refundModal');
        if (modal) {
            modal.classList.add('active');
        }
        
        // 綁定確認按鈕事件 (只綁定一次)
        if (!this.refundModalEventsBound) {
            this.bindRefundModalEvents();
            this.refundModalEventsBound = true;
        }
    }

    /**
     * 關閉退款彈窗
     */
    closeRefundModal() {
        const modal = document.getElementById('refundModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentRefundRegId = null;
    }

    /**
     * 綁定退款彈窗事件
     */
    bindRefundModalEvents() {
        const btnConfirm = document.getElementById('btnConfirmRefund');
        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => this.confirmRefund());
        }
    }

    /**
     * 確認退款
     */
    confirmRefund() {
        const note = document.getElementById('refundNote')?.value;
        if (!note) {
            this.showToast('error', '錯誤', '請輸入退款備註說明');
            return;
        }
        
        const reg = this.registrations.find(r => r.reg_id === this.currentRefundRegId);
        if (reg) {
            // 更新報名狀態為已退費
            reg.payment_status = '已退費';
        }
        
        // 關閉彈窗
        this.closeRefundModal();
        
        // 更新表格與統計
        this.renderTable();
        this.updateStats();
        
        // 顯示成功訊息
        this.showToast('success', '退款申請已執行', '已更新狀態為已退費');
    }

    /**
     * 開啟新增報名彈窗
     */
    openAddModal() {
        const form = document.getElementById('addRegistrationForm');
        if (form) {
            form.reset();
            
            // 設定活動 ID (隱藏欄位)
            const eventInput = document.getElementById('addEvent');
            if (eventInput) {
                if (this.currentEventId) {
                    eventInput.value = this.currentEventId;
                } else {
                    eventInput.value = '';
                    // 若無活動ID環境，因為不允許選擇，可能需要提示或隱藏按鈕 (依需求而定，此處僅處理欄位)
                }
            }

            // 預設檢查一次限制
            this.checkEventRestrictions();

            // 重置收據選項
            const receiptNo = document.querySelector('input[name="needReceipt"][value="no"]');
            if (receiptNo) receiptNo.checked = true;
            
            this.handleIdentityChange();
            this.handlePaymentMethodChange();
        }
        
        const modal = document.getElementById('addRegistrationModal');
        if (modal) {
            modal.classList.add('active');
        }

        // 綁定 Modal 按鈕事件 (如果尚未綁定)
        if (!this.addModalEventsBound) {
            this.bindAddModalEvents();
            this.addModalEventsBound = true;
        }
    }

    /**
     * 檢查活動限制 (住戶限定等)
     */
    checkEventRestrictions() {
        const eventSelect = document.getElementById('addEvent');
        if (!eventSelect) return;

        const eventId = eventSelect.value;
        const selectedEvent = eventId ? FoundationMockData.getEventById(eventId) : this.currentEvent;

        // 重置身分選擇狀態
        const residentRadio = document.querySelector('input[name="identity"][value="resident"]');
        const visitorRadio = document.querySelector('input[name="identity"][value="visitor"]');

        if (!selectedEvent) {
             // 未選活動，預設開放
             if (visitorRadio) visitorRadio.disabled = false;
             return;
        }

        // 檢查是否為住戶限定活動
        if (selectedEvent.is_resident_only) {
            if (residentRadio) residentRadio.checked = true;
            if (visitorRadio) {
                visitorRadio.disabled = true;
                const label = visitorRadio.closest('label');
                if (label) {
                    label.style.opacity = '0.5';
                    label.style.cursor = 'not-allowed';
                    label.title = '此活動為住戶限定，無法接受訪客報名';
                }
            }
        } else {
            if (visitorRadio) {
                visitorRadio.disabled = false;
                const label = visitorRadio.closest('label');
                if (label) {
                    label.style.opacity = '';
                    label.style.cursor = 'pointer';
                    label.title = '';
                }
            }
        }
        this.handleIdentityChange();
    }

    /**
     * 綁定新增 Modal 事件
     */
    bindAddModalEvents() {
        document.getElementById('closeAddModal')?.addEventListener('click', () => {
             document.getElementById('addRegistrationModal').classList.remove('active');
        });
        document.getElementById('cancelAddModal')?.addEventListener('click', () => {
             document.getElementById('addRegistrationModal').classList.remove('active');
        });
        document.getElementById('submitAddModal')?.addEventListener('click', () => {
             this.submitAddRegistration();
        });
        document.getElementById('addPaymentMethod')?.addEventListener('change', () => {
             this.handlePaymentMethodChange();
        });

        // 案場與戶別變更時更新驗證提示
        document.getElementById('addProject')?.addEventListener('change', () => {
            this.updateResidentValidationHint();
        });
        document.getElementById('addUnit')?.addEventListener('change', () => {
            this.updateResidentValidationHint();
        });
    }

    /**
     * 更新住戶驗證提示
     * 選擇案場與戶別後，顯示需輸入的驗證資訊提示
     */
    updateResidentValidationHint() {
        const hintContainer = document.getElementById('residentValidationHint');
        const hintText = document.getElementById('residentHintText');
        
        if (!hintContainer || !hintText) return;

        const projectSelect = document.getElementById('addProject');
        const unitSelect = document.getElementById('addUnit');
        const project = projectSelect ? projectSelect.value : '';
        const unit = unitSelect ? unitSelect.value : '';

        // 如果沒有選擇案場或戶別，隱藏提示
        if (!project || !unit) {
            hintContainer.style.display = 'none';
            return;
        }

        // 取得該戶別的住戶資料
        const resident = FoundationMockData.getResidentInfo(project, unit);
        
        if (!resident) {
            // 找不到住戶資料
            hintContainer.style.display = 'block';
            hintContainer.querySelector('.validation-hint').className = 'validation-hint warning';
            hintText.innerHTML = `<strong>注意：</strong>找不到「${project} ${unit}」的住戶登記資料，請確認案場與戶別是否正確。`;
            return;
        }

        // 顯示驗證提示
        hintContainer.style.display = 'block';
        hintContainer.querySelector('.validation-hint').className = 'validation-hint';
        
        // 部分遮蔽住戶資訊作為提示（保護隱私）
        const maskedName = resident.name.charAt(0) + '○' + resident.name.slice(-1);
        const maskedPhone = resident.phone.substring(0, 4) + '***' + resident.phone.slice(-3);
        
        hintText.innerHTML = `
            <strong>住戶驗證：</strong>請輸入「${project} ${unit}」登記住戶的<strong>姓名</strong>或<strong>聯絡電話</strong>進行驗證。
            <br><small style="color: #666;">提示：登記住戶 ${maskedName}，電話 ${maskedPhone}</small>
        `;
    }

    /**
     * 處理繳費方式變更
     */
    handlePaymentMethodChange() {
        const methodSelect = document.getElementById('addPaymentMethod');
        const deadlineGroup = document.getElementById('paymentDeadlineGroup');
        const deadlineInput = document.getElementById('addPaymentDeadline');
        const noteGroup = document.getElementById('paymentNoteGroup');

        if (!methodSelect || !deadlineGroup || !noteGroup) return;

        const method = methodSelect.value;
        deadlineGroup.style.display = 'none';
        noteGroup.style.display = 'none';
        noteGroup.innerHTML = '';
        if (deadlineInput) deadlineInput.required = false;

        if (method === '現金') {
            deadlineGroup.style.display = 'block';
            if (deadlineInput) deadlineInput.required = true;
            noteGroup.style.display = 'block';
            noteGroup.innerHTML = '<i class="fa-solid fa-circle-info"></i> 將發送繳費通知，需設定繳費期限。';
            // Set min date to today
            if (deadlineInput) deadlineInput.min = new Date().toISOString().split('T')[0];
        } else if (method === '線上繳費') {
            noteGroup.style.display = 'block';
            noteGroup.innerHTML = '<i class="fa-solid fa-circle-info"></i> 將發送線上繳費連結給用戶。';
        }
    }

    /**
     * 處理身分切換
     */
    handleIdentityChange() {
        const identityInput = document.querySelector('input[name="identity"]:checked');
        if (!identityInput) return;

        const identity = identityInput.value;
        const residentFields = document.getElementById('residentFields');
        const projectSelect = document.getElementById('addProject');
        const unitSelect = document.getElementById('addUnit');
        const hintContainer = document.getElementById('residentValidationHint');

        if (residentFields) {
            if (identity === 'resident') {
                residentFields.style.display = 'block';
                if (projectSelect) projectSelect.required = true;
                if (unitSelect) unitSelect.required = true;
                // 更新驗證提示
                this.updateResidentValidationHint();
            } else {
                residentFields.style.display = 'none';
                if (projectSelect) projectSelect.required = false;
                if (unitSelect) unitSelect.required = false;
                // 隱藏驗證提示
                if (hintContainer) hintContainer.style.display = 'none';
            }
        }
    }

    /**
     * 提交新增報名
     */
    submitAddRegistration() {
        const form = document.getElementById('addRegistrationForm');
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const eventSelect = document.getElementById('addEvent');
        const eventId = eventSelect ? eventSelect.value : '';
        if (!eventId) {
            alert('無法確認活動資訊，請先選擇活動');
            return;
        }

        // 再次驗證身分限制
        const currentParamsEvent = FoundationMockData.getEventById(eventId);
        const identityInput = document.querySelector('input[name="identity"]:checked');
        const identity = identityInput ? identityInput.value : 'visitor';

        if (currentParamsEvent && currentParamsEvent.is_resident_only && identity === 'visitor') {
            alert('此活動僅限住戶報名');
            return;
        }

        const nameDetails = document.getElementById('addName');
        const name = nameDetails ? nameDetails.value : '';
        const phoneDetails = document.getElementById('addPhone');
        const phone = phoneDetails ? phoneDetails.value : '';

        // ============================================
        // 住戶身分驗證 - 檢核姓名或電話是否符合所選戶別
        // ============================================
        if (identity === 'resident') {
            const projectSelect = document.getElementById('addProject');
            const unitSelect = document.getElementById('addUnit');
            const project = projectSelect ? projectSelect.value : '';
            const unit = unitSelect ? unitSelect.value : '';

            if (!project || !unit) {
                alert('請選擇案場與戶別');
                return;
            }

            // 呼叫驗證方法
            const validation = FoundationMockData.validateResident(project, unit, name, phone);
            
            if (!validation.valid) {
                // 組合錯誤訊息
                let errorMsg = '住戶驗證失敗！\n\n';
                errorMsg += validation.message + '\n\n';
                errorMsg += '請確認：\n';
                errorMsg += '1. 報名者姓名需與該戶別登記之住戶姓名相符\n';
                errorMsg += '2. 或聯絡電話需與該戶別登記之電話相符\n\n';
                errorMsg += '如需修正住戶資料，請洽系統管理員。';
                
                alert(errorMsg);
                this.showToast('error', '驗證失敗', '報名者資料與該戶別登記資料不符');
                return;
            }

            // 驗證成功，顯示提示
            this.showToast('success', '住戶驗證通過', `已確認 ${validation.matchType} 符合「${project} ${unit}」住戶資料`);
        }
        const receiptInput = document.querySelector('input[name="needReceipt"]:checked');
        const needReceipt = receiptInput ? receiptInput.value : 'no';
        
        const paymentStatusEl = document.getElementById('addPaymentStatus');
        const paymentMethodEl = document.getElementById('addPaymentMethod');
        const paymentDeadlineEl = document.getElementById('addPaymentDeadline');
        const paymentStatus = paymentStatusEl ? paymentStatusEl.value : '待繳費';
        const paymentMethod = paymentMethodEl ? paymentMethodEl.value : '-';
        const paymentDeadline = paymentDeadlineEl ? paymentDeadlineEl.value : '';

        // 模擬API請求
        this.showToast('success', '新增成功', `已建立${identity === 'resident' ? '住戶' : '訪客'}報名資料`);
        
        // 模擬發送通知邏輯
        if (paymentStatus === '待繳費') {
            setTimeout(() => {
                if (paymentMethod === '線上繳費') {
                    alert(`[系統模擬] 已發送線上繳費連結給：${name} (${phone})\n連結：https://lufu.com.tw/pay/online-link-${Date.now()}`);
                } else if (paymentMethod === '現金') {
                    alert(`[系統模擬] 已發送現金繳費通知給：${name} (${phone})\n請於 ${paymentDeadline} 前完成繳費。`);
                } else {
                    alert(`[系統模擬] 已發送繳費通知給：${name} (${phone})`);
                }
            }, 500);
        }

        const modal = document.getElementById('addRegistrationModal');
        if (modal) modal.classList.remove('active');
        
        // 重新整理列表
        if (identity && name) {
            this.registrations.unshift({
                event_id: eventId,
                reg_id: 'MANUAL_' + Date.now(),
                user_identity: identity === 'resident' ? '住戶' : '非住戶',
                applicant_name: name,
                phone: phone,
                companion_count: 0,
                final_amount: paymentStatus === '免費' ? 0 : 500, // 假定價格
                original_amount: 500,
                payment_method: paymentMethod,
                payment_status: paymentStatus,
                created_at: new Date().toISOString(),
                has_receipt: needReceipt === 'yes',
                crm_member_id: identity === 'resident' ? 'MOCK_ID' : null
            });
            this.renderTable();
            this.updateStats();
        }
    }

    /**
     * 匯出資料
     */
    exportData() {
        this.showToast('info', '匯出中', '正在產生報名名單 Excel 檔案...');
        // 實際專案中這裡會實作匯出邏輯
    }

    /**
     * 發送通知
     */
    sendNotification() {
        const modal = document.getElementById('notifyModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * 顯示提示訊息
     */
    showToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        container.appendChild(toast);
        
        setTimeout(() => toast.remove(), 5000);
    }
}

// 全域變數
let registrationManager;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('registrationTableBody')) {
        registrationManager = new FoundationRegistrationManager();
    }
});
