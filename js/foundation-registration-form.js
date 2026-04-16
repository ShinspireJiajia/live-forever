/**
 * ============================================
 * 前台報名表單模組 - JavaScript
 * ============================================
 * 檔案：foundation-registration-form.js
 * 說明：步驟式報名表單邏輯（前台會員使用）
 * ============================================
 */

class FoundationRegistrationFormManager {
    constructor() {
        /** 目前步驟 (1-5) */
        this.currentStep = 1;
        this.totalSteps = 5;

        /** 活動與場次 */
        this.event = null;
        this.sessions = [];
        this.selectedSessionId = null;

        /** 報名資料 */
        this.identity = ''; // '住戶' | '非住戶'
        this.companionCount = 0;

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('event_id');

        if (!eventId) {
            this.showError('缺少活動 ID 參數');
            return;
        }

        this.event = FoundationMockData.getEventById(eventId);
        if (!this.event) {
            this.showError('找不到對應的活動資料');
            return;
        }

        this.sessions = FoundationMockData.getSessionsByEventId(eventId)
            .filter(s => s.is_visible);

        this.renderStep1();
        this.renderStep2();
        this.renderStep3Setup();
        this.updateProgress();
        this.bindStepNavigation();
    }

    /**
     * 顯示錯誤（無活動）
     */
    showError(msg) {
        const container = document.getElementById('regFormContent');
        if (container) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px 20px;color:#999;">
                    <i class="fa-solid fa-exclamation-triangle" style="font-size:48px;margin-bottom:16px;display:block;"></i>
                    <p style="font-size:18px;">${msg}</p>
                    <a href="foundation-event-list.html" class="btn btn-primary" style="margin-top:16px;">返回活動列表</a>
                </div>`;
        }
    }

    /* ============================================
     * Step 1：活動資訊
     * ============================================ */
    renderStep1() {
        const ev = this.event;
        const container = document.getElementById('step1Content');
        if (!container) return;

        // 計算價格是否全部免費
        const isFree = ev.resident_adult_price === 0 && ev.non_resident_adult_price === 0
                     && ev.resident_child_price === 0 && ev.non_resident_child_price === 0;

        // 場次摘要
        const totalCapacity = FoundationMockData.getEventTotalCapacity(ev.event_id);
        const totalRegistered = FoundationMockData.getEventRegisteredCount(ev.event_id);

        const priceHtml = isFree
            ? `<span class="price-free">免費活動</span>`
            : `<table class="pricing-table">
                    <thead><tr><th>票種</th><th>住戶</th><th>非住戶</th></tr></thead>
                    <tbody>
                        <tr>
                            <td>成人</td>
                            <td class="price">${ev.resident_adult_price === 0 ? '<span class="price-free">免費</span>' : '$' + ev.resident_adult_price.toLocaleString()}</td>
                            <td class="price">${ev.non_resident_adult_price === 0 ? '<span class="price-free">免費</span>' : '$' + ev.non_resident_adult_price.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>孩童</td>
                            <td class="price">${ev.resident_child_price === 0 ? '<span class="price-free">免費</span>' : '$' + ev.resident_child_price.toLocaleString()}</td>
                            <td class="price">${ev.non_resident_child_price === 0 ? '<span class="price-free">免費</span>' : '$' + ev.non_resident_child_price.toLocaleString()}</td>
                        </tr>
                    </tbody>
               </table>`;

        container.innerHTML = `
            <div class="event-summary">
                <h2 class="event-summary-title">${ev.title}</h2>
                <div class="event-summary-meta">
                    <div class="meta-item">
                        <span class="meta-label">上架日期</span>
                        <span class="meta-value">${ev.publish_date || '-'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">場次數</span>
                        <span class="meta-value">${this.sessions.length} 場</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">總名額</span>
                        <span class="meta-value">${totalCapacity} 人（已報名 ${totalRegistered} 人）</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">報名限制</span>
                        <span class="meta-value">${ev.is_resident_only ? '住戶限定' : '不限'} ${ev.allow_companion ? '| 可攜伴（上限 ' + ev.max_companion + ' 人）' : '| 不可攜伴'}</span>
                    </div>
                </div>
                <div>
                    <h3 style="font-size:16px;margin:0 0 8px 0;">費用資訊</h3>
                    ${priceHtml}
                </div>
                ${ev.access_code ? '<div class="alert-box alert-warning"><i class="fa-solid fa-key"></i> 此活動需要輸入通行碼才能完成報名</div>' : ''}
                ${ev.is_resident_only ? '<div class="alert-box alert-info"><i class="fa-solid fa-house-user"></i> 此活動僅限住戶報名，報名時需驗證住戶身分</div>' : ''}
            </div>
        `;
    }

    /* ============================================
     * Step 2：選擇場次
     * ============================================ */
    renderStep2() {
        const container = document.getElementById('step2Content');
        if (!container) return;

        if (this.sessions.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">目前沒有可報名的場次</p>';
            return;
        }

        container.innerHTML = `
            <div class="session-list" id="sessionList">
                ${this.sessions.map(s => {
                    const registered = FoundationMockData.getSessionRegisteredCount(s.session_id);
                    const remaining = FoundationMockData.getSessionRemainingSlots(s.session_id);
                    const isFull = remaining <= 0;
                    const isDeadlinePassed = new Date(s.registration_deadline) < new Date();
                    const disabled = isFull || isDeadlinePassed;

                    let slotClass = 'ok';
                    if (remaining <= 5 && remaining > 0) slotClass = 'low';
                    if (isFull) slotClass = 'full';

                    return `
                        <div class="session-card ${disabled ? 'disabled' : ''}" data-session-id="${s.session_id}">
                            <div class="session-radio"></div>
                            <div class="session-info">
                                <div class="session-time">${s.activity_time}</div>
                                <div class="session-deadline">
                                    報名截止：${s.registration_deadline}
                                    ${isDeadlinePassed ? ' <span style="color:var(--color-danger);">(已截止)</span>' : ''}
                                </div>
                            </div>
                            <div class="session-slots">
                                <div class="slots-count ${slotClass}">
                                    ${isFull ? '已額滿' : remaining + ' 人'}
                                </div>
                                <div class="slots-label">剩餘名額</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // 綁定場次選擇
        container.querySelectorAll('.session-card:not(.disabled)').forEach(card => {
            card.addEventListener('click', () => {
                container.querySelectorAll('.session-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedSessionId = card.dataset.sessionId;
            });
        });
    }

    /* ============================================
     * Step 3：填寫報名資料
     * ============================================ */
    renderStep3Setup() {
        const ev = this.event;
        const container = document.getElementById('step3Content');
        if (!container) return;

        // 身分選擇器（若住戶限定則只顯示住戶）
        const showVisitor = !ev.is_resident_only;

        container.innerHTML = `
            <div class="identity-selector" id="identitySelector">
                <div class="identity-option" data-identity="住戶">
                    <i class="fa-solid fa-house-user"></i>
                    <span class="identity-option-label">住戶</span>
                </div>
                ${showVisitor ? `
                <div class="identity-option" data-identity="非住戶">
                    <i class="fa-solid fa-user"></i>
                    <span class="identity-option-label">訪客</span>
                </div>` : ''}
            </div>

            <!-- 住戶表單 -->
            <div id="residentFields" style="display:none;">
                <div class="reg-form-fields">
                    <div class="form-group">
                        <label class="form-label">案場 <span style="color:var(--color-danger);">*</span></label>
                        <select class="form-input" id="regProject">
                            <option value="">請選擇案場</option>
                            <option value="陸府天母">陸府天母</option>
                            <option value="陸府臻藏">陸府臻藏</option>
                            <option value="陸府植境">陸府植境</option>
                            <option value="陸府觀森海">陸府觀森海</option>
                            <option value="陸府森美">陸府森美</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">戶別 <span style="color:var(--color-danger);">*</span></label>
                        <input type="text" class="form-input" id="regUnit" placeholder="例：A10-2F">
                    </div>
                    <div class="form-group">
                        <label class="form-label">姓名 <span style="color:var(--color-danger);">*</span></label>
                        <input type="text" class="form-input" id="regResidentName" placeholder="請輸入姓名">
                    </div>
                    <div class="form-group">
                        <label class="form-label">聯絡電話 <span style="color:var(--color-danger);">*</span></label>
                        <input type="tel" class="form-input" id="regResidentPhone" placeholder="0912-345-678">
                    </div>
                </div>
            </div>

            <!-- 訪客表單 -->
            <div id="visitorFields" style="display:none;">
                <div class="reg-form-fields">
                    <div class="form-group">
                        <label class="form-label">姓名 <span style="color:var(--color-danger);">*</span></label>
                        <input type="text" class="form-input" id="regVisitorName" placeholder="請輸入姓名">
                    </div>
                    <div class="form-group">
                        <label class="form-label">聯絡電話 <span style="color:var(--color-danger);">*</span></label>
                        <input type="tel" class="form-input" id="regVisitorPhone" placeholder="0912-345-678">
                    </div>
                    <div class="form-group full-width">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" id="regVisitorEmail" placeholder="example@mail.com">
                    </div>
                </div>
            </div>

            <!-- 攜伴人數 -->
            ${ev.allow_companion ? `
            <div class="companion-section" id="companionSection" style="display:none;">
                <div class="companion-row">
                    <label>攜伴人數（上限 ${ev.max_companion} 人）</label>
                    <div class="companion-counter">
                        <button type="button" id="btnCompanionMinus" disabled><i class="fa-solid fa-minus"></i></button>
                        <span class="companion-count-display" id="companionCountDisplay">0</span>
                        <button type="button" id="btnCompanionPlus"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>` : ''}

            <!-- 通行碼 -->
            ${ev.access_code ? `
            <div class="access-code-section" id="accessCodeSection" style="display:none;">
                <div class="form-group">
                    <label class="form-label"><i class="fa-solid fa-key"></i> 通行碼 <span style="color:var(--color-danger);">*</span></label>
                    <input type="text" class="form-input" id="regAccessCode" placeholder="請輸入活動通行碼">
                    <span class="form-hint">此活動需要通行碼才能完成報名</span>
                </div>
            </div>` : ''}
        `;

        // 身分選擇綁定
        container.querySelectorAll('.identity-option').forEach(opt => {
            opt.addEventListener('click', () => {
                container.querySelectorAll('.identity-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                this.identity = opt.dataset.identity;
                this.showIdentityFields();
            });
        });

        // 攜伴人數增減綁定
        if (ev.allow_companion) {
            const btnMinus = document.getElementById('btnCompanionMinus');
            const btnPlus = document.getElementById('btnCompanionPlus');
            const display = document.getElementById('companionCountDisplay');

            if (btnMinus && btnPlus && display) {
                btnPlus.addEventListener('click', () => {
                    if (this.companionCount < ev.max_companion) {
                        this.companionCount++;
                        display.textContent = this.companionCount;
                        btnMinus.disabled = false;
                        if (this.companionCount >= ev.max_companion) btnPlus.disabled = true;
                    }
                });
                btnMinus.addEventListener('click', () => {
                    if (this.companionCount > 0) {
                        this.companionCount--;
                        display.textContent = this.companionCount;
                        btnPlus.disabled = false;
                        if (this.companionCount <= 0) btnMinus.disabled = true;
                    }
                });
            }
        }
    }

    /**
     * 顯示對應身分的表單欄位
     */
    showIdentityFields() {
        const residentFields = document.getElementById('residentFields');
        const visitorFields = document.getElementById('visitorFields');
        const companionSection = document.getElementById('companionSection');
        const accessCodeSection = document.getElementById('accessCodeSection');

        if (residentFields) residentFields.style.display = this.identity === '住戶' ? 'block' : 'none';
        if (visitorFields) visitorFields.style.display = this.identity === '非住戶' ? 'block' : 'none';
        if (companionSection) companionSection.style.display = this.identity ? 'block' : 'none';
        if (accessCodeSection) accessCodeSection.style.display = this.identity ? 'block' : 'none';
    }

    /* ============================================
     * Step 4：確認付款
     * ============================================ */
    renderStep4() {
        const ev = this.event;
        const session = FoundationMockData.getSessionById(this.selectedSessionId);
        const container = document.getElementById('step4Content');
        if (!container || !session) return;

        // 收集報名資料
        const formData = this.collectFormData();

        // 計算金額
        const isResident = this.identity === '住戶';
        const adultPrice = isResident ? ev.resident_adult_price : ev.non_resident_adult_price;
        const totalPeople = 1 + this.companionCount;
        const totalAmount = adultPrice * totalPeople;
        const isFree = totalAmount === 0;

        const paymentHtml = isFree
            ? `<div class="free-event-note">
                    <i class="fa-solid fa-check-circle"></i>
                    此為免費活動，無需付款<br>
                    <span style="font-size:14px;">點擊「確認報名」即可完成</span>
               </div>`
            : `<div class="payment-mock-section">
                    <h4 class="payment-mock-title">選擇付款方式</h4>
                    <div class="payment-method-tabs">
                        <div class="payment-method-tab active" data-method="credit">
                            <i class="fa-solid fa-credit-card"></i> 信用卡
                        </div>
                        <div class="payment-method-tab" data-method="transfer">
                            <i class="fa-solid fa-building-columns"></i> 轉帳
                        </div>
                    </div>
                    <div id="paymentMethodContent">
                        <div class="mock-card-form" id="creditCardForm">
                            <div class="form-group full-width">
                                <label class="form-label">卡號</label>
                                <input type="text" class="form-input" placeholder="1234 5678 9012 3456" maxlength="19">
                            </div>
                            <div class="form-group">
                                <label class="form-label">有效期限</label>
                                <input type="text" class="form-input" placeholder="MM/YY" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label class="form-label">安全碼</label>
                                <input type="text" class="form-input" placeholder="CVV" maxlength="3">
                            </div>
                        </div>
                        <div class="mock-transfer-info" id="transferForm" style="display:none;">
                            <p><strong>匯款帳戶資訊</strong></p>
                            <p>銀行：台灣銀行 台中分行 (004)</p>
                            <p>帳號：000-12-345678-9</p>
                            <p>戶名：財團法人陸府生活美學教育基金會</p>
                            <p style="color:var(--color-warning);margin-top:8px;">
                                <i class="fa-solid fa-exclamation-triangle"></i>
                                請於 3 日內完成匯款，逾期將自動取消報名
                            </p>
                        </div>
                    </div>
               </div>`;

        // 收據選項
        const receiptHtml = ev.need_receipt && !isFree
            ? `<div class="receipt-option">
                    <input type="checkbox" id="wantReceipt">
                    <label for="wantReceipt">我需要收據</label>
               </div>`
            : '';

        container.innerHTML = `
            <div class="order-summary">
                <h3 style="font-size:16px;margin:0 0 12px 0;">報名摘要</h3>
                <table class="order-summary-table">
                    <tr><td>活動名稱</td><td>${ev.title}</td></tr>
                    <tr><td>場次時間</td><td>${session.activity_time}</td></tr>
                    <tr><td>報名者</td><td>${formData.name}（${this.identity}）</td></tr>
                    <tr><td>聯絡電話</td><td>${formData.phone}</td></tr>
                    <tr><td>報名人數</td><td>${totalPeople} 人（含攜伴 ${this.companionCount} 人）</td></tr>
                    <tr><td>單價</td><td>${isFree ? '免費' : '$' + adultPrice.toLocaleString() + ' /人'}</td></tr>
                    <tr class="order-total-row"><td>應付金額</td><td>${isFree ? '免費' : '$' + totalAmount.toLocaleString()}</td></tr>
                </table>
            </div>
            ${paymentHtml}
            ${receiptHtml}
        `;

        // 綁定付款方式切換
        if (!isFree) {
            container.querySelectorAll('.payment-method-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    container.querySelectorAll('.payment-method-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const method = tab.dataset.method;
                    document.getElementById('creditCardForm').style.display = method === 'credit' ? 'grid' : 'none';
                    document.getElementById('transferForm').style.display = method === 'transfer' ? 'block' : 'none';
                });
            });
        }

        // 更新「確認報名」按鈕文字
        const btnNext = document.getElementById('btnStepNext');
        if (btnNext) {
            btnNext.innerHTML = isFree
                ? '<i class="fa-solid fa-check"></i> 確認報名'
                : '<i class="fa-solid fa-credit-card"></i> 確認付款';
        }
    }

    /* ============================================
     * Step 5：完成頁
     * ============================================ */
    renderStep5() {
        const ev = this.event;
        const session = FoundationMockData.getSessionById(this.selectedSessionId);
        const container = document.getElementById('step5Content');
        if (!container) return;

        const formData = this.collectFormData();
        const regId = 'REG' + Date.now().toString().slice(-10);
        const isResident = this.identity === '住戶';
        const adultPrice = isResident ? ev.resident_adult_price : ev.non_resident_adult_price;
        const totalPeople = 1 + this.companionCount;
        const totalAmount = adultPrice * totalPeople;

        // 寫入 Mock 資料
        FoundationMockData.registrations.push({
            reg_id: regId,
            event_id: ev.event_id,
            session_id: this.selectedSessionId,
            user_identity: this.identity,
            crm_member_id: isResident ? 'MBR-NEW' : '',
            applicant_name: formData.name,
            phone: formData.phone,
            companion_count: this.companionCount,
            payment_status: totalAmount === 0 ? '已入帳' : '待繳費',
            payment_method: totalAmount === 0 ? '免費' : '',
            original_amount: totalAmount,
            final_amount: totalAmount,
            has_receipt: document.getElementById('wantReceipt')?.checked || false,
            created_at: new Date().toISOString(),
            is_manual_audit: false
        });

        container.innerHTML = `
            <div class="completion-page">
                <div class="completion-icon">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <h2 class="completion-title">報名成功！</h2>
                <p class="completion-subtitle">您已成功報名此活動，以下為報名資訊</p>
                <div class="completion-details">
                    <div class="detail-row">
                        <span class="detail-label">報名編號</span>
                        <span class="detail-value">${regId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">活動名稱</span>
                        <span class="detail-value">${ev.title}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">場次時間</span>
                        <span class="detail-value">${session ? session.activity_time : '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">報名者</span>
                        <span class="detail-value">${formData.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">報名人數</span>
                        <span class="detail-value">${totalPeople} 人</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">付款金額</span>
                        <span class="detail-value">${totalAmount === 0 ? '免費' : '$' + totalAmount.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">報名時間</span>
                        <span class="detail-value">${new Date().toLocaleString('zh-TW')}</span>
                    </div>
                </div>
            </div>
        `;

        // 隱藏步驟按鈕、顯示底部連結
        const actions = document.getElementById('stepActions');
        if (actions) {
            actions.innerHTML = `
                <div></div>
                <a href="${ev.cms_url}" class="btn btn-primary">
                    <i class="fa-solid fa-arrow-left"></i> 返回活動頁面
                </a>
            `;
        }
    }

    /* ============================================
     * 收集表單資料
     * ============================================ */
    collectFormData() {
        if (this.identity === '住戶') {
            return {
                name: document.getElementById('regResidentName')?.value?.trim() || '',
                phone: document.getElementById('regResidentPhone')?.value?.trim() || '',
                project: document.getElementById('regProject')?.value || '',
                unit: document.getElementById('regUnit')?.value?.trim() || '',
                email: ''
            };
        } else {
            return {
                name: document.getElementById('regVisitorName')?.value?.trim() || '',
                phone: document.getElementById('regVisitorPhone')?.value?.trim() || '',
                project: '',
                unit: '',
                email: document.getElementById('regVisitorEmail')?.value?.trim() || ''
            };
        }
    }

    /* ============================================
     * 步驟驗證
     * ============================================ */
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return true; // 活動資訊只是顯示
            case 2:
                if (!this.selectedSessionId) {
                    this.showToast('error', '請選擇場次', '請選擇一個可報名的場次');
                    return false;
                }
                return true;
            case 3:
                return this.validateStep3();
            case 4:
                return true; // 付款模擬，直接通過
            default:
                return true;
        }
    }

    /**
     * 驗證 Step 3 表單
     */
    validateStep3() {
        if (!this.identity) {
            this.showToast('error', '請選擇身分', '請選擇「住戶」或「訪客」身分');
            return false;
        }

        const data = this.collectFormData();

        if (!data.name) {
            this.showToast('error', '請填寫姓名', '姓名為必填欄位');
            return false;
        }
        if (!data.phone) {
            this.showToast('error', '請填寫電話', '聯絡電話為必填欄位');
            return false;
        }

        // 住戶需驗證案場與戶別
        if (this.identity === '住戶') {
            if (!data.project) {
                this.showToast('error', '請選擇案場', '住戶報名需選擇案場');
                return false;
            }
            if (!data.unit) {
                this.showToast('error', '請填寫戶別', '住戶報名需填寫戶別');
                return false;
            }
            // 住戶身分驗證
            if (typeof FoundationMockData.validateResident === 'function') {
                const valid = FoundationMockData.validateResident(data.project, data.unit, data.name, data.phone);
                if (!valid) {
                    this.showToast('error', '住戶驗證失敗', '查無此住戶資料，請確認案場、戶別、姓名與電話是否正確');
                    return false;
                }
            }
        }

        // 通行碼驗證
        if (this.event.access_code) {
            const inputCode = document.getElementById('regAccessCode')?.value?.trim();
            if (!inputCode) {
                this.showToast('error', '請輸入通行碼', '此活動需要通行碼才能報名');
                return false;
            }
            if (inputCode !== this.event.access_code) {
                this.showToast('error', '通行碼錯誤', '請確認通行碼是否正確');
                return false;
            }
        }

        // 名額檢查
        const remaining = FoundationMockData.getSessionRemainingSlots(this.selectedSessionId);
        const totalPeople = 1 + this.companionCount;
        if (totalPeople > remaining) {
            this.showToast('error', '名額不足', `此場次僅剩 ${remaining} 個名額，無法容納 ${totalPeople} 人`);
            return false;
        }

        return true;
    }

    /* ============================================
     * 步驟導航
     * ============================================ */
    bindStepNavigation() {
        const btnPrev = document.getElementById('btnStepPrev');
        const btnNext = document.getElementById('btnStepNext');

        if (btnPrev) {
            btnPrev.addEventListener('click', () => this.prevStep());
        }
        if (btnNext) {
            btnNext.addEventListener('click', () => this.nextStep());
        }
    }

    nextStep() {
        if (!this.validateCurrentStep()) return;

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;

            // Step 4 需動態渲染（依賴前面的選擇）
            if (this.currentStep === 4) this.renderStep4();
            // Step 5 完成頁
            if (this.currentStep === 5) this.renderStep5();

            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();

            // 還原按鈕文字
            const btnNext = document.getElementById('btnStepNext');
            if (btnNext && this.currentStep < 4) {
                btnNext.innerHTML = '下一步 <i class="fa-solid fa-arrow-right"></i>';
            }
        }
    }

    showStep(step) {
        document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(`step${step}`);
        if (target) target.classList.add('active');

        // 控制按鈕顯示
        const btnPrev = document.getElementById('btnStepPrev');
        if (btnPrev) btnPrev.style.display = step === 1 || step === 5 ? 'none' : '';
    }

    updateProgress() {
        document.querySelectorAll('.step-item').forEach((item, idx) => {
            const stepNum = idx + 1;
            item.classList.remove('active', 'completed');
            if (stepNum === this.currentStep) item.classList.add('active');
            if (stepNum < this.currentStep) item.classList.add('completed');
        });
    }

    /* ============================================
     * Toast 提示
     * ============================================ */
    showToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
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

// 全域初始化
window.regFormManager = null;
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('regFormContent')) {
        window.regFormManager = new FoundationRegistrationFormManager();
    }
});
