/**
 * ============================================
 * 案場活動模組 - Mock 資料
 * ============================================
 * 檔案：site-event-mock-data.js
 * 說明：案場活動管理模擬資料（後台手動建立，住戶限定）
 * ============================================
 */

const SiteEventMockData = {
    /**
     * 案場列表
     */
    sites: [
        { id: 'SITE001', name: '陸府植森' },
        { id: 'SITE002', name: '陸府原森' },
        { id: 'SITE003', name: '陸府臻觀' },
        { id: 'SITE004', name: '陸府日向' },
        { id: 'SITE005', name: '陸府觀微' }
    ],

    /**
     * 案場活動設定表 (Site_Event_Settings)
     * 由後台手動建立，需指定適用案場，僅住戶可參加
     */
    events: [
        {
            event_id: 'SE2026001',
            title: '植森社區春酒聯誼會',
            category: '住戶聯誼',
            description: '歡迎社區住戶共同參與春酒聯誼，增進鄰里情誼。',
            location: '社區交誼廳',
            start_dt: '2026-02-14T18:00:00',
            end_dt: '2026-02-14T21:00:00',
            sites: ['陸府植森'],
            max_slots: 80,
            allow_companion: true,
            max_companion: 1,
            price: 0,
            need_receipt: false,
            remind_days_before: 7,
            registration_deadline: '2026-02-10',
            created_by: 'admin',
            created_at: '2026-01-05T10:00:00',
            updated_at: '2026-01-05T10:00:00'
        },
        {
            event_id: 'SE2026002',
            title: '新春揮毫活動',
            category: '節慶活動',
            description: '邀請書法老師現場揮毫，贈送新春春聯。',
            location: '社區大廳',
            start_dt: '2026-01-25T10:00:00',
            end_dt: '2026-01-25T16:00:00',
            sites: ['陸府植森', '陸府原森', '陸府臻觀'],
            max_slots: 100,
            allow_companion: false,
            max_companion: 0,
            price: 0,
            need_receipt: false,
            remind_days_before: 5,
            registration_deadline: '2026-01-22',
            created_by: 'admin',
            created_at: '2026-01-02T09:30:00',
            updated_at: '2026-01-02T09:30:00'
        },
        {
            event_id: 'SE2026003',
            title: '親子手作DIY工坊',
            category: '親子活動',
            description: '親子同樂，一起製作手工藝品。材料費用另計。',
            location: '社區多功能教室',
            start_dt: '2026-03-08T14:00:00',
            end_dt: '2026-03-08T16:30:00',
            sites: ['陸府日向', '陸府觀微'],
            max_slots: 25,
            allow_companion: true,
            max_companion: 2,
            price: 200,
            need_receipt: true,
            remind_days_before: 3,
            registration_deadline: '2026-03-05',
            created_by: 'admin',
            created_at: '2026-01-08T14:20:00',
            updated_at: '2026-01-08T14:20:00'
        },
        {
            event_id: 'SE2026004',
            title: '社區設備使用說明會',
            category: '設備說明',
            description: '介紹社區公共設施使用方式與注意事項。',
            location: '社區會議室',
            start_dt: '2026-01-18T19:00:00',
            end_dt: '2026-01-18T20:30:00',
            sites: ['陸府臻觀'],
            max_slots: 50,
            allow_companion: false,
            max_companion: 0,
            price: 0,
            need_receipt: false,
            remind_days_before: 2,
            registration_deadline: '2026-01-16',
            created_by: 'manager1',
            created_at: '2026-01-06T11:00:00',
            updated_at: '2026-01-06T11:00:00'
        },
        {
            event_id: 'SE2026005',
            title: '社區電影之夜',
            category: '社區活動',
            description: '社區戶外電影放映，歡迎攜帶野餐墊入場。',
            location: '社區中庭草坪',
            start_dt: '2026-04-15T19:00:00',
            end_dt: '2026-04-15T21:30:00',
            sites: ['陸府植森', '陸府原森'],
            max_slots: 120,
            allow_companion: true,
            max_companion: 3,
            price: 0,
            need_receipt: false,
            remind_days_before: 7,
            registration_deadline: '2026-04-12',
            created_by: 'admin',
            created_at: '2026-01-09T08:45:00',
            updated_at: '2026-01-09T08:45:00'
        },
        {
            event_id: 'SE2025010',
            title: '2025年度住戶大會',
            category: '公告說明',
            description: '年度住戶大會，說明社區財務狀況與未來規劃。',
            location: '社區會議室',
            start_dt: '2025-12-15T14:00:00',
            end_dt: '2025-12-15T16:00:00',
            sites: ['陸府植森', '陸府原森', '陸府臻觀', '陸府日向', '陸府觀微'],
            max_slots: 200,
            allow_companion: false,
            max_companion: 0,
            price: 0,
            need_receipt: false,
            remind_days_before: 14,
            registration_deadline: '2025-12-12',
            created_by: 'admin',
            created_at: '2025-11-01T10:00:00',
            updated_at: '2025-11-15T14:30:00'
        }
    ],

    /**
     * 報名紀錄表 (Site_Event_Registrations)
     * 紀錄住戶報名資訊
     */
    registrations: [
        {
            reg_id: 'SR2026001001',
            event_id: 'SE2026001',
            site_name: '陸府植森',
            unit_no: 'A棟12F-1',
            member_id: 'MBR00125',
            applicant_name: '王大明',
            phone: '0912-345-678',
            companion_count: 1,
            payment_status: '已報名',
            payment_method: '',
            amount: 0,
            has_receipt: false,
            created_at: '2026-01-06T10:30:00'
        },
        {
            reg_id: 'SR2026001002',
            event_id: 'SE2026001',
            site_name: '陸府植森',
            unit_no: 'B棟8F-2',
            member_id: 'MBR00089',
            applicant_name: '李美玲',
            phone: '0923-456-789',
            companion_count: 1,
            payment_status: '已報名',
            payment_method: '',
            amount: 0,
            has_receipt: false,
            created_at: '2026-01-06T14:15:00'
        },
        {
            reg_id: 'SR2026002001',
            event_id: 'SE2026002',
            site_name: '陸府原森',
            unit_no: 'C棟5F-1',
            member_id: 'MBR00201',
            applicant_name: '張志明',
            phone: '0934-567-890',
            companion_count: 0,
            payment_status: '已報名',
            payment_method: '',
            amount: 0,
            has_receipt: false,
            created_at: '2026-01-08T09:00:00'
        },
        {
            reg_id: 'SR2026003001',
            event_id: 'SE2026003',
            site_name: '陸府日向',
            unit_no: 'A棟3F-2',
            member_id: 'MBR00312',
            applicant_name: '陳小芬',
            phone: '0945-678-901',
            companion_count: 2,
            payment_status: '待繳費',
            payment_method: '',
            amount: 600,
            has_receipt: true,
            created_at: '2026-01-09T11:30:00'
        },
        {
            reg_id: 'SR2026004001',
            event_id: 'SE2026004',
            site_name: '陸府臻觀',
            unit_no: 'B棟10F-1',
            member_id: 'MBR00156',
            applicant_name: '林國華',
            phone: '0956-789-012',
            companion_count: 0,
            payment_status: '已報名',
            payment_method: '',
            amount: 0,
            has_receipt: false,
            created_at: '2026-01-07T16:45:00'
        }
    ]
};
