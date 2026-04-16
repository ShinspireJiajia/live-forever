/**
 * ============================================
 * 基金會活動模組 - Mock 資料
 * ============================================
 * 檔案：foundation-mock-data.js
 * 說明：基金會活動管理模擬資料
 * ============================================
 */

const FoundationMockData = {
    /**
     * 活動主檔表 (Event_Master)
     * CMS 同步欄位（唯讀）+ CRM 管理欄位（可編輯）
     */
    events: [
        {
            // === CMS 同步欄位（唯讀）===
            event_id: 'EVT2026001',
            cms_event_id: 'CMS-EVT-20260315-001',
            title: '2026 春季音樂會',
            publish_date: '2026-01-08',
            cms_url: 'https://www.lufu-foundation.org.tw/events/20260315-001',
            is_frontend_visible: true,
            is_pinned: true,
            is_form_visible: true,
            created_at: '2026-01-08T10:30:00',
            last_sync_at: '2026-04-10T09:00:00',
            // === CRM 管理欄位（可編輯）===
            is_resident_only: false,
            access_code: 'MUSIC2026',
            allow_companion: true,
            max_companion: 2,
            resident_adult_price: 300,
            resident_child_price: 150,
            non_resident_adult_price: 500,
            non_resident_child_price: 250,
            need_receipt: true,
            cancellation_days: 7,
            refund_fee: 50
        },
        {
            // === CMS 同步欄位（唯讀）===
            event_id: 'EVT2026002',
            cms_event_id: 'CMS-EVT-20260220-001',
            title: '住戶專屬親子手作工坊',
            publish_date: '2026-01-10',
            cms_url: 'https://www.lufu-foundation.org.tw/events/20260220-001',
            is_frontend_visible: true,
            is_pinned: false,
            is_form_visible: true,
            created_at: '2026-01-10T14:00:00',
            last_sync_at: '2026-04-10T09:00:00',
            // === CRM 管理欄位（可編輯）===
            is_resident_only: true,
            access_code: 'FAMILY2026',
            allow_companion: true,
            max_companion: 3,
            resident_adult_price: 0,
            resident_child_price: 0,
            non_resident_adult_price: 0,
            non_resident_child_price: 0,
            need_receipt: false,
            cancellation_days: 3,
            refund_fee: 0
        },
        {
            // === CMS 同步欄位（唯讀）===
            event_id: 'EVT2026003',
            cms_event_id: 'CMS-EVT-20260125-001',
            title: '健康講座：銀髮族養生之道',
            publish_date: '2026-01-05',
            cms_url: 'https://www.lufu-foundation.org.tw/events/20260125-001',
            is_frontend_visible: true,
            is_pinned: false,
            is_form_visible: true,
            created_at: '2026-01-05T08:00:00',
            last_sync_at: '2026-04-10T09:00:00',
            // === CRM 管理欄位（可編輯）===
            is_resident_only: false,
            access_code: '',
            allow_companion: true,
            max_companion: 1,
            resident_adult_price: 150,
            resident_child_price: 0,
            non_resident_adult_price: 200,
            non_resident_child_price: 100,
            need_receipt: true,
            cancellation_days: 3,
            refund_fee: 0
        },
        {
            // === CMS 同步欄位（唯讀）===
            event_id: 'EVT2026004',
            cms_event_id: 'CMS-EVT-20260120-001',
            title: '春節揮毫活動',
            publish_date: '2025-12-20',
            cms_url: 'https://www.lufu-foundation.org.tw/events/20260120-001',
            is_frontend_visible: true,
            is_pinned: false,
            is_form_visible: false,
            created_at: '2025-12-20T10:00:00',
            last_sync_at: '2026-04-10T09:00:00',
            // === CRM 管理欄位（可編輯）===
            is_resident_only: false,
            access_code: '',
            allow_companion: false,
            max_companion: 0,
            resident_adult_price: 0,
            resident_child_price: 0,
            non_resident_adult_price: 0,
            non_resident_child_price: 0,
            need_receipt: false,
            cancellation_days: 5,
            refund_fee: 0
        },
        {
            // === CMS 同步欄位（唯讀）===
            event_id: 'EVT2026005',
            cms_event_id: 'CMS-EVT-20260410-001',
            title: '自然生態導覽：大坑步道健行',
            publish_date: '2026-03-01',
            cms_url: 'https://www.lufu-foundation.org.tw/events/20260410-001',
            is_frontend_visible: true,
            is_pinned: false,
            is_form_visible: true,
            created_at: '2026-03-01T09:00:00',
            last_sync_at: '2026-04-10T09:00:00',
            // === CRM 管理欄位（可編輯）===
            is_resident_only: true,
            access_code: 'HIKE2026',
            allow_companion: true,
            max_companion: 1,
            resident_adult_price: 300,
            resident_child_price: 150,
            non_resident_adult_price: 0,
            non_resident_child_price: 0,
            need_receipt: true,
            cancellation_days: 7,
            refund_fee: 50
        },
        {
            // === CMS 同步欄位（唯讀）===
            event_id: 'EVT2025012',
            cms_event_id: 'CMS-EVT-20251220-001',
            title: '2025 年終感恩晚會',
            publish_date: '2025-11-15',
            cms_url: 'https://www.lufu-foundation.org.tw/events/20251220-001',
            is_frontend_visible: false,
            is_pinned: false,
            is_form_visible: false,
            created_at: '2025-11-15T09:00:00',
            last_sync_at: '2025-12-15T09:00:00',
            // === CRM 管理欄位（可編輯）===
            is_resident_only: true,
            access_code: 'PARTY2025',
            allow_companion: true,
            max_companion: 3,
            resident_adult_price: 0,
            resident_child_price: 0,
            non_resident_adult_price: 0,
            non_resident_child_price: 0,
            need_receipt: false,
            cancellation_days: 7,
            refund_fee: 0
        }
    ],

    /**
     * 活動場次表 (Event_Sessions)
     * 由 CMS 同步，CRM 唯讀顯示
     */
    sessions: [
        // EVT2026001 - 2026 春季音樂會（2 場次）
        {
            session_id: 'CMS-SS-001',
            event_id: 'EVT2026001',
            registration_deadline: '2026-03-01',
            activity_time: '2026.03.15(六) 14:00-17:00',
            capacity_limit: 80,
            is_visible: true
        },
        {
            session_id: 'CMS-SS-002',
            event_id: 'EVT2026001',
            registration_deadline: '2026-03-20',
            activity_time: '2026.03.22(六) 14:00-17:00',
            capacity_limit: 70,
            is_visible: true
        },
        // EVT2026002 - 住戶專屬親子手作工坊（1 場次）
        {
            session_id: 'CMS-SS-003',
            event_id: 'EVT2026002',
            registration_deadline: '2026-02-15',
            activity_time: '2026.02.20(五) 09:30-12:00',
            capacity_limit: 30,
            is_visible: true
        },
        // EVT2026003 - 健康講座（2 場次）
        {
            session_id: 'CMS-SS-004',
            event_id: 'EVT2026003',
            registration_deadline: '2026-01-20',
            activity_time: '2026.01.25(日) 14:00-16:00',
            capacity_limit: 40,
            is_visible: true
        },
        {
            session_id: 'CMS-SS-005',
            event_id: 'EVT2026003',
            registration_deadline: '2026-02-10',
            activity_time: '2026.02.15(日) 14:00-16:00',
            capacity_limit: 40,
            is_visible: true
        },
        // EVT2026004 - 春節揮毫活動（1 場次）
        {
            session_id: 'CMS-SS-006',
            event_id: 'EVT2026004',
            registration_deadline: '2026-01-15',
            activity_time: '2026.01.20(二) 10:00-15:00',
            capacity_limit: 100,
            is_visible: true
        },
        // EVT2026005 - 自然生態導覽（1 場次）
        {
            session_id: 'CMS-SS-007',
            event_id: 'EVT2026005',
            registration_deadline: '2026-04-05',
            activity_time: '2026.04.10(五) 07:00-12:00',
            capacity_limit: 40,
            is_visible: true
        },
        // EVT2025012 - 2025 年終感恩晚會（1 場次）
        {
            session_id: 'CMS-SS-008',
            event_id: 'EVT2025012',
            registration_deadline: '2025-12-15',
            activity_time: '2025.12.20(六) 18:00-21:00',
            capacity_limit: 200,
            is_visible: true
        }
    ],

    /**
     * 報名紀錄表 (Registration_Records)
     * 紀錄前台用戶報名資訊與當前狀態
     */
    registrations: [
        {
            reg_id: 'REG2026001001',
            event_id: 'EVT2026001',
            session_id: 'CMS-SS-001',
            user_identity: '住戶',
            crm_member_id: 'MBR00125',
            applicant_name: '王大明',
            phone: '0912-345-678',
            companion_count: 2,
            payment_status: '已入帳',
            payment_method: '信用卡',
            original_amount: 1500,
            final_amount: 1500,
            has_receipt: true,
            created_at: '2026-01-05T14:30:00',
            is_manual_audit: false
        },
        {
            reg_id: 'REG2026001002',
            event_id: 'EVT2026001',
            session_id: 'CMS-SS-001',
            user_identity: '非住戶',
            crm_member_id: '',
            applicant_name: '李小華',
            phone: '0923-456-789',
            companion_count: 1,
            payment_status: '待繳費',
            payment_method: '',
            original_amount: 1000,
            final_amount: 1000,
            has_receipt: false,
            created_at: '2026-01-06T09:15:00',
            is_manual_audit: false
        },
        {
            reg_id: 'REG2026001003',
            event_id: 'EVT2026001',
            session_id: 'CMS-SS-002',
            user_identity: '住戶',
            crm_member_id: 'MBR00089',
            applicant_name: '張美玲',
            phone: '0934-567-890',
            companion_count: 0,
            payment_status: '已入帳',
            payment_method: '轉帳',
            original_amount: 500,
            final_amount: 400,
            has_receipt: true,
            created_at: '2026-01-04T16:45:00',
            is_manual_audit: true
        },
        {
            reg_id: 'REG2026001004',
            event_id: 'EVT2026001',
            session_id: 'CMS-SS-002',
            user_identity: '非住戶',
            crm_member_id: '',
            applicant_name: '陳志強',
            phone: '0945-678-901',
            companion_count: 2,
            payment_status: '已取消',
            payment_method: '',
            original_amount: 1500,
            final_amount: 0,
            has_receipt: false,
            created_at: '2026-01-03T11:20:00',
            is_manual_audit: false
        },
        {
            reg_id: 'REG2026001005',
            event_id: 'EVT2026001',
            session_id: 'CMS-SS-001',
            user_identity: '住戶',
            crm_member_id: 'MBR00156',
            applicant_name: '林佳慧',
            phone: '0956-789-012',
            companion_count: 1,
            payment_status: '退費中',
            payment_method: '信用卡',
            original_amount: 1000,
            final_amount: 1000,
            has_receipt: true,
            created_at: '2025-06-15T10:00:00',
            is_manual_audit: false
        },
        {
            reg_id: 'REG2026002001',
            event_id: 'EVT2026002',
            session_id: 'CMS-SS-003',
            user_identity: '住戶',
            crm_member_id: 'MBR00078',
            applicant_name: '黃雅婷',
            phone: '0967-890-123',
            companion_count: 2,
            payment_status: '已入帳',
            payment_method: '現金',
            original_amount: 0,
            final_amount: 0,
            has_receipt: false,
            created_at: '2026-01-07T13:00:00',
            is_manual_audit: false
        },
        {
            reg_id: 'REG2026003001',
            event_id: 'EVT2026003',
            session_id: 'CMS-SS-004',
            user_identity: '非住戶',
            crm_member_id: '',
            applicant_name: '吳明達',
            phone: '0978-901-234',
            companion_count: 1,
            payment_status: '待繳費',
            payment_method: '',
            original_amount: 400,
            final_amount: 400,
            has_receipt: true,
            created_at: '2026-01-08T08:30:00',
            is_manual_audit: false
        },
        {
            reg_id: 'REG2026003002',
            event_id: 'EVT2026003',
            session_id: 'CMS-SS-005',
            user_identity: '住戶',
            crm_member_id: 'MBR00201',
            applicant_name: '周淑芬',
            phone: '0989-012-345',
            companion_count: 0,
            payment_status: '已入帳',
            payment_method: '信用卡',
            original_amount: 200,
            final_amount: 200,
            has_receipt: false,
            created_at: '2026-01-07T15:45:00',
            is_manual_audit: false
        }
    ],

    /**
     * 稽核與帳務日誌表 (Audit_Financial_Logs)
     * 紀錄身分變更、價差紀錄及管理員操作軌跡
     */
    auditLogs: [
        {
            log_id: 1,
            reg_id: 'REG2026001003',
            admin_user: 'admin01',
            action_type: '身分變更',
            before_value: '非住戶',
            after_value: '住戶',
            cash_adjustment: 0,
            reason: '經查證為陸府天母住戶，提供通行碼驗證成功',
            operated_at: '2026-01-04T17:00:00'
        },
        {
            log_id: 2,
            reg_id: 'REG2026001003',
            admin_user: 'admin01',
            action_type: '金額調整',
            before_value: '$500',
            after_value: '$400',
            cash_adjustment: -100,
            reason: '住戶優惠價差，現金退還 $100',
            operated_at: '2026-01-04T17:05:00'
        },
        {
            log_id: 3,
            reg_id: 'REG2026001005',
            admin_user: 'admin02',
            action_type: '退費標記',
            before_value: '已入帳',
            after_value: '退費中',
            cash_adjustment: 0,
            reason: '報名者因個人因素申請退費，報名未滿180天',
            operated_at: '2026-01-06T09:30:00'
        },
        {
            log_id: 4,
            reg_id: 'REG2026002001',
            admin_user: 'admin01',
            action_type: '繳費確認',
            before_value: '待繳費',
            after_value: '已入帳',
            cash_adjustment: 0,
            reason: '現場收取現金繳費',
            operated_at: '2026-01-07T14:00:00'
        },
        {
            log_id: 5,
            reg_id: 'REG2026001004',
            admin_user: 'admin02',
            action_type: '取消報名',
            before_value: '待繳費',
            after_value: '已取消',
            cash_adjustment: 0,
            reason: '逾期未繳費，系統自動取消',
            operated_at: '2026-01-05T00:00:00'
        }
    ],

    /**
     * 活動類別選項
     */
    categories: [
        '藝文活動',
        '親子活動',
        '健康講座',
        '節慶活動',
        '戶外活動',
        '社區活動',
        '教育課程',
        '公益活動'
    ],

    /**
     * 繳費狀態選項
     */
    paymentStatuses: [
        '待繳費',
        '已入帳',
        '已取消',
        '退費中'
    ],

    /**
     * 繳費方式選項
     */
    paymentMethods: [
        '信用卡',
        '轉帳',
        '現金'
    ],

    /**
     * 根據活動 ID 取得報名紀錄
     */
    getRegistrationsByEventId(eventId) {
        return this.registrations.filter(r => r.event_id === eventId);
    },

    /**
     * 根據活動 ID 取得場次列表
     */
    getSessionsByEventId(eventId) {
        return this.sessions.filter(s => s.event_id === eventId);
    },

    /**
     * 根據場次 ID 取得場次資訊
     */
    getSessionById(sessionId) {
        return this.sessions.find(s => s.session_id === sessionId);
    },

    /**
     * 取得場次已報名人數（排除已取消）
     */
    getSessionRegisteredCount(sessionId) {
        return this.registrations
            .filter(r => r.session_id === sessionId && r.payment_status !== '已取消')
            .reduce((sum, r) => sum + 1 + r.companion_count, 0);
    },

    /**
     * 取得場次剩餘名額
     */
    getSessionRemainingSlots(sessionId) {
        const session = this.getSessionById(sessionId);
        if (!session) return 0;
        return session.capacity_limit - this.getSessionRegisteredCount(sessionId);
    },

    /**
     * 取得活動總已報名人數（所有場次加總，排除已取消）
     */
    getEventRegisteredCount(eventId) {
        return this.registrations
            .filter(r => r.event_id === eventId && r.payment_status !== '已取消')
            .reduce((sum, r) => sum + 1 + r.companion_count, 0);
    },

    /**
     * 取得活動總名額上限（所有場次加總）
     */
    getEventTotalCapacity(eventId) {
        return this.getSessionsByEventId(eventId)
            .filter(s => s.is_visible)
            .reduce((sum, s) => sum + s.capacity_limit, 0);
    },

    /**
     * 根據報名 ID 取得稽核日誌
     */
    getAuditLogsByRegId(regId) {
        return this.auditLogs.filter(log => log.reg_id === regId);
    },

    /**
     * 根據活動 ID 取得活動資訊
     */
    getEventById(eventId) {
        return this.events.find(e => e.event_id === eventId);
    },

    /**
     * 根據 CMS 活動 ID 取得活動資訊
     */
    getEventByCmsId(cmsEventId) {
        return this.events.find(e => e.cms_event_id === cmsEventId);
    },

    /**
     * 取得報名統計
     */
    getRegistrationStats(eventId) {
        const registrations = this.getRegistrationsByEventId(eventId);
        return {
            total: registrations.length,
            pending: registrations.filter(r => r.payment_status === '待繳費').length,
            paid: registrations.filter(r => r.payment_status === '已入帳').length,
            cancelled: registrations.filter(r => r.payment_status === '已取消').length,
            refunding: registrations.filter(r => r.payment_status === '退費中').length,
            resident: registrations.filter(r => r.user_identity === '住戶').length,
            nonResident: registrations.filter(r => r.user_identity === '非住戶').length
        };
    },

    /**
     * 計算報名距今天數
     * 用於 180 天退費卡控
     */
    getDaysSinceRegistration(createdAt) {
        const regDate = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - regDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    /**
     * 檢查是否可退費
     * 超過 180 天不可退費
     */
    canRefund(createdAt) {
        return this.getDaysSinceRegistration(createdAt) <= 180;
    },

    /**
     * 住戶資料（用於手動報名驗證）
     * 模擬各案場戶別的住戶姓名與聯絡電話
     */
    residents: {
        '植森': {
            'A棟-3F': { name: '王大明', phone: '0912-345-678', altPhone: '0912345678' },
            'A棟-5F': { name: '李小華', phone: '0923-456-789', altPhone: '0923456789' },
            'A棟-8F': { name: '張美玲', phone: '0934-567-890', altPhone: '0934567890' },
            'B棟-2F': { name: '陳志偉', phone: '0945-678-901', altPhone: '0945678901' },
            'B棟-7F': { name: '林雅婷', phone: '0956-789-012', altPhone: '0956789012' },
            'B棟-11F': { name: '黃建國', phone: '0967-890-123', altPhone: '0967890123' }
        },
        '原森': {
            'A棟-3F': { name: '吳美麗', phone: '0912-111-222', altPhone: '0912111222' },
            'A棟-5F': { name: '周大為', phone: '0923-222-333', altPhone: '0923222333' },
            'A棟-8F': { name: '鄭小琳', phone: '0934-333-444', altPhone: '0934333444' },
            'B棟-2F': { name: '蔡文傑', phone: '0945-444-555', altPhone: '0945444555' },
            'B棟-7F': { name: '許雅芳', phone: '0956-555-666', altPhone: '0956555666' },
            'B棟-11F': { name: '楊志明', phone: '0967-666-777', altPhone: '0967666777' }
        },
        '觀止': {
            'A棟-3F': { name: '劉家豪', phone: '0912-777-888', altPhone: '0912777888' },
            'A棟-5F': { name: '趙淑芬', phone: '0923-888-999', altPhone: '0923888999' },
            'A棟-8F': { name: '孫小美', phone: '0934-999-000', altPhone: '0934999000' },
            'B棟-2F': { name: '曾志豪', phone: '0945-000-111', altPhone: '0945000111' },
            'B棟-7F': { name: '謝美芳', phone: '0956-111-222', altPhone: '0956111222' },
            'B棟-11F': { name: '郭建宏', phone: '0967-222-333', altPhone: '0967222333' }
        },
        '臻綠': {
            'A棟-3F': { name: '何小明', phone: '0912-333-444', altPhone: '0912333444' },
            'A棟-5F': { name: '高美華', phone: '0923-444-555', altPhone: '0923444555' },
            'A棟-8F': { name: '葉志偉', phone: '0934-555-666', altPhone: '0934555666' },
            'B棟-2F': { name: '宋雅婷', phone: '0945-666-777', altPhone: '0945666777' },
            'B棟-7F': { name: '梁建國', phone: '0956-777-888', altPhone: '0956777888' },
            'B棟-11F': { name: '潘小琳', phone: '0967-888-999', altPhone: '0967888999' }
        },
        '織森': {
            'A棟-3F': { name: '方大為', phone: '0912-999-111', altPhone: '0912999111' },
            'A棟-5F': { name: '施淑芬', phone: '0923-111-333', altPhone: '0923111333' },
            'A棟-8F': { name: '姜家豪', phone: '0934-222-444', altPhone: '0934222444' },
            'B棟-2F': { name: '范文傑', phone: '0945-333-555', altPhone: '0945333555' },
            'B棟-7F': { name: '彭雅芳', phone: '0956-444-666', altPhone: '0956444666' },
            'B棟-11F': { name: '魏志明', phone: '0967-555-777', altPhone: '0967555777' }
        }
    },

    /**
     * 驗證住戶身分
     * 根據案場、戶別，檢核姓名或電話是否符合
     * @param {string} project - 案場名稱
     * @param {string} unit - 戶別
     * @param {string} name - 報名者姓名
     * @param {string} phone - 聯絡電話
     * @returns {object} - { valid: boolean, message: string, resident: object|null }
     */
    validateResident(project, unit, name, phone) {
        // 檢查案場是否存在
        if (!this.residents[project]) {
            return {
                valid: false,
                message: `找不到案場「${project}」的住戶資料`,
                resident: null
            };
        }

        // 檢查戶別是否存在
        if (!this.residents[project][unit]) {
            return {
                valid: false,
                message: `找不到「${project}」案場中「${unit}」戶別的住戶資料`,
                resident: null
            };
        }

        const resident = this.residents[project][unit];
        
        // 標準化電話格式（移除連字號）
        const normalizePhone = (p) => p ? p.replace(/-/g, '').trim() : '';
        const inputPhone = normalizePhone(phone);
        const residentPhone = normalizePhone(resident.phone);

        // 檢查姓名是否符合
        const nameMatch = name && resident.name === name.trim();
        
        // 檢查電話是否符合（支援有無連字號的格式）
        const phoneMatch = inputPhone && (inputPhone === residentPhone || inputPhone === resident.altPhone);

        if (nameMatch || phoneMatch) {
            return {
                valid: true,
                message: '住戶身分驗證成功',
                resident: resident,
                matchType: nameMatch ? '姓名' : '電話'
            };
        }

        return {
            valid: false,
            message: `驗證失敗：所輸入的姓名「${name}」或電話「${phone}」與「${project} ${unit}」的住戶資料不符`,
            resident: resident
        };
    },

    /**
     * 取得指定戶別的住戶資訊
     * @param {string} project - 案場名稱
     * @param {string} unit - 戶別
     * @returns {object|null} - 住戶資料或 null
     */
    getResidentInfo(project, unit) {
        if (this.residents[project] && this.residents[project][unit]) {
            return this.residents[project][unit];
        }
        return null;
    }
};
