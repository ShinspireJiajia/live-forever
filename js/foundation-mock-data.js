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
     * 活動設定表 (Event_Settings)
     * 儲存從外部同步及內部設定的活動規則
     */
    events: [
        {
            event_id: 'EVT2026001',
            title: '2026 春季音樂會',
            category: '藝文活動',
            start_dt: '2026-03-15T14:00:00',
            end_dt: '2026-03-15T17:00:00',
            max_slots: 150,
            is_resident_only: false,
            access_code: 'MUSIC2026',
            allow_companion: true,
            max_companion: 2,
            price: 500,
            resident_adult_price: 300,
            resident_child_price: 150,
            non_resident_adult_price: 500,
            non_resident_child_price: 250,
            need_receipt: true,
            last_sync_at: '2026-01-08T10:30:00'
        },
        {
            event_id: 'EVT2026002',
            title: '住戶專屬親子手作工坊',
            category: '親子活動',
            start_dt: '2026-02-20T09:30:00',
            end_dt: '2026-02-20T12:00:00',
            max_slots: 30,
            is_resident_only: true,
            access_code: 'FAMILY2026',
            allow_companion: true,
            max_companion: 3,
            price: 0,
            resident_adult_price: 0,
            resident_child_price: 0,
            non_resident_adult_price: 0,
            non_resident_child_price: 0,
            need_receipt: false,
            last_sync_at: '2026-01-08T10:30:00'
        },
        {
            event_id: 'EVT2026003',
            title: '健康講座：銀髮族養生之道',
            category: '健康講座',
            start_dt: '2026-01-25T14:00:00',
            end_dt: '2026-01-25T16:00:00',
            max_slots: 80,
            is_resident_only: false,
            access_code: '',
            allow_companion: true,
            max_companion: 1,
            price: 200,
            need_receipt: true,
            remind_days_before: 3,
            last_sync_at: '2026-01-08T10:30:00'
        },
        {
            event_id: 'EVT2026004',
            title: '春節揮毫活動',
            category: '節慶活動',
            start_dt: '2026-01-20T10:00:00',
            end_dt: '2026-01-20T15:00:00',
            max_slots: 100,
            is_resident_only: false,
            access_code: '',
            allow_companion: false,
            max_companion: 0,
            price: 0,
            need_receipt: false,
            remind_days_before: 5,
            last_sync_at: '2026-01-08T10:30:00'
        },
        {
            event_id: 'EVT2026005',
            title: '自然生態導覽：大坑步道健行',
            category: '戶外活動',
            start_dt: '2026-04-10T07:00:00',
            end_dt: '2026-04-10T12:00:00',
            max_slots: 40,
            is_resident_only: true,
            access_code: 'HIKE2026',
            allow_companion: true,
            max_companion: 1,
            price: 300,
            need_receipt: true,
            remind_days_before: 7,
            last_sync_at: '2026-01-08T10:30:00'
        },
        {
            event_id: 'EVT2025012',
            title: '2025 年終感恩晚會',
            category: '社區活動',
            start_dt: '2025-12-20T18:00:00',
            end_dt: '2025-12-20T21:00:00',
            max_slots: 200,
            is_resident_only: true,
            access_code: 'PARTY2025',
            allow_companion: true,
            max_companion: 3,
            price: 0,
            need_receipt: false,
            remind_days_before: 7,
            last_sync_at: '2025-12-15T09:00:00'
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
    }
};
