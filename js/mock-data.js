/**
 * ============================================
 * 陸府建設 CRM 系統 - Mock 測試資料
 * ============================================
 * 檔案：mock-data.js
 * 說明：提供各模組的假資料，用於前端開發與測試
 * 建立日期：2025-12-03
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // Mock 資料集合
    // ============================================
    
    const MockData = {
        
        // ============================================
        // 1.0 系統管理
        // ============================================
        
        /**
         * 使用者資料
         */
        users: [
            { id: 1, name: '王大明', account: 'wang.dm', email: 'wang.dm@lufu.com.tw', role: '系統管理員', status: '啟用', lineBindStatus: '已綁定', createDate: '2024-01-15' },
            { id: 2, name: '李小華', account: 'li.xh', email: 'li.xh@lufu.com.tw', role: '案場主任', status: '啟用', lineBindStatus: '已綁定', createDate: '2024-02-20' },
            { id: 3, name: '張美玲', account: 'zhang.ml', email: 'zhang.ml@lufu.com.tw', role: '客服人員', status: '啟用', lineBindStatus: '未綁定', createDate: '2024-03-10' },
            { id: 4, name: '陳志偉', account: 'chen.zw', email: 'chen.zw@lufu.com.tw', role: '案場主任', status: '停用', lineBindStatus: '已綁定', createDate: '2024-04-05' },
            { id: 5, name: '林雅婷', account: 'lin.yt', email: 'lin.yt@lufu.com.tw', role: '客服人員', status: '啟用', lineBindStatus: '已綁定', createDate: '2024-05-18' }
        ],

        /**
         * 角色資料
         */
        roles: [
            { id: 1, name: '系統管理員', description: '擁有所有系統權限', userCount: 2, status: '啟用' },
            { id: 2, name: '案場主任', description: '管理指定案場相關功能', userCount: 5, status: '啟用' },
            { id: 3, name: '客服人員', description: '處理客戶服務相關業務', userCount: 8, status: '啟用' },
            { id: 4, name: '財務人員', description: '處理財務相關業務', userCount: 3, status: '啟用' },
            { id: 5, name: '訪客', description: '僅有檢視權限', userCount: 0, status: '停用' }
        ],

        /**
         * 操作紀錄
         */
        operationLogs: [
            { id: 1, userName: '王大明', action: '登入系統', module: '系統管理', ip: '192.168.1.100', datetime: '2025-12-03 09:15:23' },
            { id: 2, userName: '李小華', action: '新增會員', module: '會員管理', ip: '192.168.1.101', datetime: '2025-12-03 10:30:45' },
            { id: 3, userName: '張美玲', action: '編輯戶別資料', module: '戶別管理', ip: '192.168.1.102', datetime: '2025-12-03 11:22:18' },
            { id: 4, userName: '王大明', action: '刪除派工單', module: '派工單管理', ip: '192.168.1.100', datetime: '2025-12-03 14:05:32' },
            { id: 5, userName: '李小華', action: '匯出報表', module: '報表管理', ip: '192.168.1.101', datetime: '2025-12-03 15:48:56' }
        ],

        // ============================================
        // 2.0 CRM 設定
        // ============================================
        
        /**
         * 案場資料
         */
        projects: [
            { id: 1, name: '陸府原森', address: '台中市西屯區市政北二路282號', manager: '李小華', totalUnits: 120, status: '銷售中', warrantyDays: 365 },
            { id: 2, name: '陸府觀微', address: '台中市南屯區文心南五路一段331號', manager: '陳志偉', totalUnits: 85, status: '已完銷', warrantyDays: 365 },
            { id: 3, name: '陸府植森', address: '台中市北屯區崇德路三段631號', manager: '李小華', totalUnits: 200, status: '興建中', warrantyDays: 365 },
            { id: 4, name: '陸府築觀', address: '台中市西區台灣大道二段285號', manager: '張美玲', totalUnits: 66, status: '銷售中', warrantyDays: 730 }
        ],

        /**
         * 廠商資料
         */
        vendors: [
            { id: 1, name: '永信水電工程', contact: '林永信', phone: '04-2345-6789', email: 'yongxin@example.com', category: '水電', status: '啟用' },
            { id: 2, name: '大同冷氣', contact: '陳大同', phone: '04-2456-7890', email: 'tatung@example.com', category: '空調', status: '啟用' },
            { id: 3, name: '台灣電梯', contact: '王台電', phone: '04-2567-8901', email: 'elevator@example.com', category: '電梯', status: '啟用' },
            { id: 4, name: '美麗園藝', contact: '李美麗', phone: '04-2678-9012', email: 'garden@example.com', category: '園藝', status: '停用' }
        ],

        /**
         * 郵件設定
         */
        emailSettings: [
            { id: 1, type: '每日摘要', email: 'kenny.zheng@shinda.com.tw', isEnabled: true },
            { id: 2, type: '維修個案新增通知', email: 'JIA.LIU@shinda.com.tw', isEnabled: true },
            { id: 3, type: '清潔個案新增通知', email: 'kenny.zheng@shinda.com.tw', isEnabled: true },
            { id: 4, type: '客服個案新增通知', email: 'jia.liu@shinda.com.tw', isEnabled: true },
            { id: 5, type: '個案客服回應通知', email: 'kenny.zheng@shinda.com.tw', isEnabled: true },
            { id: 6, type: '客服個案未達標通知', email: 'kenny.zheng@shinda.com.tw', isEnabled: true },
            { id: 7, type: '維修個案未達標通知', email: 'kenny.zheng@shinda.com.tw', isEnabled: true },
            { id: 8, type: '清潔個案未達標通知', email: 'kenny.zheng@shinda.com.tw', isEnabled: true },
            { id: 9, type: '維養個案未達標通知', email: 'kenny.zheng@shinda.com.tw', isEnabled: true },
            { id: 10, type: '用戶滿意度調查回覆通知', email: 'kenny.zheng@shinda.com.tw', isEnabled: true }
        ],

        /**
         * 里程碑資料
         */
        milestones: [
            { id: 1, projectId: 1, name: '對保', sortOrder: 1, status: '啟用' },
            { id: 2, projectId: 1, name: '客變', sortOrder: 2, status: '啟用' },
            { id: 3, projectId: 1, name: '驗屋', sortOrder: 3, status: '啟用' },
            { id: 4, projectId: 1, name: '交屋', sortOrder: 4, status: '啟用' },
            { id: 5, projectId: 1, name: '保固', sortOrder: 5, status: '啟用' }
        ],

        /**
         * 保固項目
         */
        warrantyItems: [
            { id: 1, name: '防水工程', warrantyDays: 730, description: '屋頂、外牆、浴室防水' },
            { id: 2, name: '結構安全', warrantyDays: 5475, description: '主體結構、基礎' },
            { id: 3, name: '機電設備', warrantyDays: 365, description: '電梯、發電機、消防設備' },
            { id: 4, name: '門窗五金', warrantyDays: 365, description: '大門、窗戶、五金配件' },
            { id: 5, name: '廚衛設備', warrantyDays: 365, description: '廚具、衛浴設備' }
        ],

        // ============================================
        // 3.0 戶別管理
        // ============================================
        
        /**
         * 戶別資料
         */
        units: [
            { 
                id: 1, 
                projectId: 1, 
                projectName: '陸府原森', 
                building: 'A棟', 
                floor: '12F', 
                doorNumber: '12A', 
                area: 45.5, 
                owner: '王小明', 
                ownerPhone: '0912-345-678', 
                status: '已交屋', 
                contractDate: '2024-06-15',
                // Extended fields
                type: '3房2廳',
                direction: '坐北朝南',
                decoration: '精裝修',
                address: '台中市西屯區市政北二路282號12樓A戶',
                salesRep: '陳銷售',
                handoverDate: '2024-08-01',
                warrantyStartDate: '2024-08-01',
                warrantyEndDate: '2026-08-01',
                mainArea: 25.5,
                balconyArea: 5.0,
                publicArea: 15.0,
                parkingSpace: 'B2-101',
                parkingArea: 8.5,
                parkingPrice: 2000000,
                salePrice: 25000000,
                loanAmount: 20000000,
                totalAmount: 27000000
            },
            { 
                id: 2, 
                projectId: 1, 
                projectName: '陸府原森', 
                building: 'A棟', 
                floor: '12F', 
                doorNumber: '12B', 
                area: 38.2, 
                owner: '李美華', 
                ownerPhone: '0923-456-789', 
                status: '已交屋', 
                contractDate: '2024-07-20',
                // Extended fields
                type: '2房2廳',
                direction: '坐南朝北',
                decoration: '標準配備',
                address: '台中市西屯區市政北二路282號12樓B戶',
                salesRep: '林銷售',
                handoverDate: '2024-09-01',
                warrantyStartDate: '2024-09-01',
                warrantyEndDate: '2026-09-01',
                mainArea: 20.0,
                balconyArea: 4.2,
                publicArea: 14.0,
                parkingSpace: 'B2-102',
                parkingArea: 8.5,
                parkingPrice: 1800000,
                salePrice: 18000000,
                loanAmount: 14000000,
                totalAmount: 19800000
            },
            { 
                id: 3, 
                projectId: 1, 
                projectName: '陸府原森', 
                building: 'B棟', 
                floor: '8F', 
                doorNumber: '8A', 
                area: 52.3, 
                owner: '張大偉', 
                ownerPhone: '0934-567-890', 
                status: '待驗屋', 
                contractDate: '2024-08-10',
                // Extended fields
                type: '4房2廳',
                direction: '坐東朝西',
                decoration: '毛胚屋',
                address: '台中市西屯區市政北二路282號8樓A戶',
                salesRep: '陳銷售',
                handoverDate: '',
                warrantyStartDate: '',
                warrantyEndDate: '',
                mainArea: 30.0,
                balconyArea: 6.0,
                publicArea: 16.3,
                parkingSpace: 'B1-005',
                parkingArea: 9.0,
                parkingPrice: 2200000,
                salePrice: 32000000,
                loanAmount: 0,
                totalAmount: 34200000
            },
            { 
                id: 4, 
                projectId: 2, 
                projectName: '陸府觀微', 
                building: 'A棟', 
                floor: '15F', 
                doorNumber: '15A', 
                area: 68.5, 
                owner: '陳雅芳', 
                ownerPhone: '0945-678-901', 
                status: '已交屋', 
                contractDate: '2024-05-05',
                // Extended fields
                type: '4房3廳',
                direction: '坐北朝南',
                decoration: '精裝修',
                address: '台中市南屯區文心南五路一段331號15樓A戶',
                salesRep: '黃銷售',
                handoverDate: '2024-06-01',
                warrantyStartDate: '2024-06-01',
                warrantyEndDate: '2026-06-01',
                mainArea: 40.0,
                balconyArea: 8.5,
                publicArea: 20.0,
                parkingSpace: 'B1-001, B1-002',
                parkingArea: 18.0,
                parkingPrice: 4000000,
                salePrice: 45000000,
                loanAmount: 30000000,
                totalAmount: 49000000
            },
            { 
                id: 5, 
                projectId: 2, 
                projectName: '陸府觀微', 
                building: 'A棟', 
                floor: '15F', 
                doorNumber: '15B', 
                area: 42.8, 
                owner: '林志明', 
                ownerPhone: '0956-789-012', 
                status: '待交屋', 
                contractDate: '2024-09-18',
                // Extended fields
                type: '3房2廳',
                direction: '坐南朝北',
                decoration: '標準配備',
                address: '台中市南屯區文心南五路一段331號15樓B戶',
                salesRep: '黃銷售',
                handoverDate: '',
                warrantyStartDate: '',
                warrantyEndDate: '',
                mainArea: 24.0,
                balconyArea: 4.8,
                publicArea: 14.0,
                parkingSpace: 'B2-055',
                parkingArea: 8.5,
                parkingPrice: 1900000,
                salePrice: 22000000,
                loanAmount: 15000000,
                totalAmount: 23900000
            }
        ],

        /**
         * 繳款紀錄
         */
        payments: [
            { id: 1, unitId: 1, unitName: 'A棟12A', itemName: '訂金', amount: 500000, dueDate: '2024-01-15', paidDate: '2024-01-10', status: '已繳納' },
            { id: 2, unitId: 1, unitName: 'A棟12A', itemName: '簽約金', amount: 2000000, dueDate: '2024-02-15', paidDate: '2024-02-12', status: '已繳納' },
            { id: 3, unitId: 1, unitName: 'A棟12A', itemName: '開工款', amount: 1500000, dueDate: '2024-04-15', paidDate: '2024-04-15', status: '已繳納' },
            { id: 4, unitId: 2, unitName: 'A棟12B', itemName: '訂金', amount: 400000, dueDate: '2024-02-20', paidDate: '2024-02-18', status: '已繳納' },
            { id: 5, unitId: 3, unitName: 'B棟8A', itemName: '交屋款', amount: 3000000, dueDate: '2024-12-15', paidDate: null, status: '待繳納' }
        ],

        // ============================================
        // 4.0 會員管理
        // ============================================
        
        /**
         * 會員資料
         */
        members: (function() {
            try {
                const stored = localStorage.getItem('crm_members');
                if (stored) return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to load members from localStorage', e);
            }
            return [
                { id: 1, name: '王小明', phone: '0912-345-678', email: 'wang.xm@email.com', identity: '屋主', projectName: '陸府原森', unitName: 'A棟12A', lineBindStatus: '已綁定', bindDate: '2024-06-20', registerDate: '2024-06-15' },
                { id: 2, name: '李美華', phone: '0923-456-789', email: 'li.mh@email.com', identity: '屋主', projectName: '陸府原森', unitName: 'A棟12B', lineBindStatus: '已綁定', bindDate: '2024-07-25', registerDate: '2024-07-20' },
                { id: 3, name: '張大偉', phone: '0934-567-890', email: 'zhang.dw@email.com', identity: '屋主', projectName: '陸府原森', unitName: 'B棟8A', lineBindStatus: '未綁定', bindDate: null, registerDate: '2024-08-10' },
                { id: 4, name: '陳小芬', phone: '0945-678-901', email: 'chen.xf@email.com', identity: '住戶', projectName: '陸府觀微', unitName: 'A棟15A', lineBindStatus: '已綁定', bindDate: '2024-09-05', registerDate: '2024-09-01' },
                { id: 5, name: '林家豪', phone: '0956-789-012', email: 'lin.jh@email.com', identity: '租戶', projectName: '陸府觀微', unitName: 'A棟15B', lineBindStatus: '未綁定', bindDate: null, registerDate: '2024-10-15' }
            ];
        })(),

        /**
         * 會員活動歷程
         */
        memberHistory: [
            { id: 1, memberId: 1, memberName: '王小明', action: 'Line 綁定', description: '完成 Line 帳號綁定', datetime: '2024-06-20 14:30:00' },
            { id: 2, memberId: 1, memberName: '王小明', action: '參加活動', description: '報名參加「夏日親子烘焙課程」', datetime: '2024-07-15 10:20:00' },
            { id: 3, memberId: 1, memberName: '王小明', action: '報修', description: '提報浴室漏水問題', datetime: '2024-08-05 09:15:00' },
            { id: 4, memberId: 2, memberName: '李美華', action: 'Line 綁定', description: '完成 Line 帳號綁定', datetime: '2024-07-25 16:45:00' },
            { id: 5, memberId: 2, memberName: '李美華', action: '房屋健檢', description: '預約年度房屋健檢服務', datetime: '2024-09-10 11:30:00' }
        ],

        // ============================================
        // 5.0 派工單管理
        // ============================================
        
        /**
         * 派工單資料
         */
        workOrders: [
            { id: 1, orderNo: 'WO202512001', projectName: '陸府原森', unitName: 'A棟12A', type: '維修', category: '水電', description: '浴室漏水', assignee: '永信水電工程', status: '處理中', priority: '高', createDate: '2025-12-01', dueDate: '2025-12-05' },
            { id: 2, orderNo: 'WO202512002', projectName: '陸府原森', unitName: 'B棟8A', type: '清潔', category: '公區清潔', description: '大廳地板清潔', assignee: '美麗清潔', status: '待派工', priority: '中', createDate: '2025-12-02', dueDate: '2025-12-08' },
            { id: 3, orderNo: 'WO202512003', projectName: '陸府觀微', unitName: 'A棟15A', type: '維修', category: '空調', description: '冷氣不冷', assignee: '大同冷氣', status: '已完成', priority: '中', createDate: '2025-11-28', dueDate: '2025-12-03' },
            { id: 4, orderNo: 'WO202512004', projectName: '陸府原森', unitName: 'A棟12B', type: '客服', category: '諮詢', description: '管理費查詢', assignee: '張美玲', status: '已完成', priority: '低', createDate: '2025-11-30', dueDate: '2025-12-02' },
            { id: 5, orderNo: 'WO202512005', projectName: '陸府植森', unitName: 'C棟5A', type: '維修', category: '電梯', description: '電梯異響', assignee: '台灣電梯', status: '待派工', priority: '高', createDate: '2025-12-03', dueDate: '2025-12-06' }
        ],

        // ============================================
        // 6.0 綠海養護
        // ============================================
        
        /**
         * 養護合約
         */
        greenContracts: [
            { id: 1, contractNo: 'GC2025001', projectName: '陸府原森', unitName: 'A棟12A', year: 2025, items: '室內植栽養護、陽台綠化', fee: 36000, plan: '標準方案', startDate: '2025-01-01', endDate: '2025-12-31', status: '生效中' },
            { id: 2, contractNo: 'GC2025002', projectName: '陸府原森', unitName: 'A棟12B', year: 2025, items: '室內植栽養護', fee: 24000, plan: '基礎方案', startDate: '2025-01-01', endDate: '2025-12-31', status: '生效中' },
            { id: 3, contractNo: 'GC2025003', projectName: '陸府觀微', unitName: 'A棟15A', year: 2025, items: '室內植栽養護、陽台綠化、庭院維護', fee: 48000, plan: '尊榮方案', startDate: '2025-01-01', endDate: '2025-12-31', status: '生效中' },
            { id: 4, contractNo: 'GC2024001', projectName: '陸府原森', unitName: 'B棟8A', year: 2024, items: '室內植栽養護', fee: 24000, plan: '基礎方案', startDate: '2024-01-01', endDate: '2024-12-31', status: '已到期' }
        ],

        /**
         * 養護服務紀錄
         */
        greenServices: [
            { id: 1, contractId: 1, serviceDate: '2025-12-01', technician: '李園藝', items: '澆水、施肥、修剪', notes: '植栽狀況良好', nextServiceDate: '2025-12-15', status: '已完成' },
            { id: 2, contractId: 1, serviceDate: '2025-11-15', technician: '李園藝', items: '澆水、施肥、換盆', notes: '更換2盆植栽', nextServiceDate: '2025-12-01', status: '已完成' },
            { id: 3, contractId: 2, serviceDate: '2025-12-02', technician: '王綠手', items: '澆水、施肥', notes: '建議增加光照', nextServiceDate: '2025-12-16', status: '已完成' },
            { id: 4, contractId: 3, serviceDate: '2025-12-05', technician: '李園藝', items: '澆水、施肥、修剪、除蟲', notes: '發現蚜蟲，已處理', nextServiceDate: '2025-12-19', status: '待執行' }
        ],

        // ============================================
        // 7.0~10.0 預約服務
        // ============================================
        
        /**
         * 預約資料（通用）
         */
        reservations: [
            // 對保預約
            { id: 1, type: '對保', projectName: '陸府原森', unitName: 'B棟8A', memberName: '張大偉', phone: '0934-567-890', date: '2025-12-10', timeSlot: '10:00-11:00', status: '已確認', createDate: '2025-12-01' },
            { id: 2, type: '對保', projectName: '陸府植森', unitName: 'C棟5A', memberName: '黃志明', phone: '0967-890-123', date: '2025-12-11', timeSlot: '14:00-15:00', status: '待確認', createDate: '2025-12-02' },
            // 驗屋預約
            { id: 3, type: '驗屋', projectName: '陸府原森', unitName: 'B棟8A', memberName: '張大偉', phone: '0934-567-890', date: '2025-12-15', timeSlot: '09:00-12:00', status: '已確認', createDate: '2025-12-03' },
            { id: 4, type: '驗屋', projectName: '陸府觀微', unitName: 'A棟15B', memberName: '林志明', phone: '0956-789-012', date: '2025-12-16', timeSlot: '14:00-17:00', status: '待確認', createDate: '2025-12-03' },
            // 交屋預約
            { id: 5, type: '交屋', projectName: '陸府原森', unitName: 'B棟8A', memberName: '張大偉', phone: '0934-567-890', date: '2025-12-20', timeSlot: '10:00-12:00', status: '待確認', createDate: '2025-12-05' },
            // 客變預約
            { id: 6, type: '客變', projectName: '陸府植森', unitName: 'C棟5A', memberName: '黃志明', phone: '0967-890-123', date: '2025-12-08', timeSlot: '15:00-16:00', status: '已完成', signStatus: '已簽署', createDate: '2025-11-28' },
            { id: 7, type: '客變', projectName: '陸府植森', unitName: 'D棟3B', memberName: '吳美玲', phone: '0978-901-234', date: '2025-12-12', timeSlot: '10:00-11:00', status: '已確認', signStatus: '待簽署', createDate: '2025-12-01' }
        ],

        /**
         * 交屋預約資料
         */
        handoverReservations: (function() {
            try {
                const stored = localStorage.getItem('crm_handoverReservations');
                if (stored) return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to load handoverReservations from localStorage', e);
            }
            return [
            // 已預約 - 今日交屋
            { id: 1, projectName: '陸府原森', unitName: 'A棟10F', memberName: '王大明', phone: '0912-111-222', bookableStartDate: '2025-12-20', bookableEndDate: '2026-01-20', reservationDate: '2025-12-30', timeSlot: '09:00-10:00', inspectionStatus: '已完成', status: '已預約', remark: '客戶要求早上時段', inCharge: '王大明' },
            // 已預約 - 明日交屋
            { id: 2, projectName: '陸府原森', unitName: 'A棟11A', memberName: '林小華', phone: '0923-222-333', bookableStartDate: '2025-12-25', bookableEndDate: '2026-01-25', reservationDate: '2025-12-31', timeSlot: '10:00-11:00', inspectionStatus: '已完成', status: '已預約', remark: '', inCharge: '李小華' },
            // 已預約 - 近期交屋（3天內）
            { id: 3, projectName: '陸府觀微', unitName: 'B棟5A', memberName: '陳志偉', phone: '0934-333-444', bookableStartDate: '2025-12-28', bookableEndDate: '2026-01-28', reservationDate: '2026-01-02', timeSlot: '14:00-15:00', inspectionStatus: '已完成', status: '已預約', remark: '需準備車位鑰匙', inCharge: '張志豪' },
            { id: 4, projectName: '陸府原森', unitName: 'A棟8B', memberName: '張美玲', phone: '0945-444-555', bookableStartDate: '2025-12-30', bookableEndDate: '2026-01-30', reservationDate: '2026-01-03', timeSlot: '15:00-16:00', inspectionStatus: '處理中', status: '已預約', remark: '缺失修繕中', inCharge: '陳淑芬' },
            // 已預約 - 即將到來（3-7天）
            { id: 5, projectName: '陸府植森', unitName: 'C棟3A', memberName: '黃志明', phone: '0956-555-666', bookableStartDate: '2026-01-01', bookableEndDate: '2026-02-01', reservationDate: '2026-01-05', timeSlot: '09:00-10:00', inspectionStatus: '已完成', status: '已預約', remark: '', inCharge: '王大明' },
            { id: 6, projectName: '陸府觀微', unitName: 'B棟12B', memberName: '李雅婷', phone: '0967-666-777', bookableStartDate: '2026-01-02', bookableEndDate: '2026-02-02', reservationDate: '2026-01-06', timeSlot: '11:00-12:00', inspectionStatus: '已完成', status: '已預約', remark: '' },
            // 已預約 - 未來預約（7天以上）
            { id: 7, projectName: '陸府原森', unitName: 'A棟15A', memberName: '吳美玲', phone: '0978-777-888', bookableStartDate: '2026-01-05', bookableEndDate: '2026-02-05', reservationDate: '2026-01-10', timeSlot: '10:00-11:00', inspectionStatus: '處理中', status: '已預約', remark: '驗屋缺失3項待修' },
            { id: 8, projectName: '陸府植森', unitName: 'C棟6B', memberName: '周大偉', phone: '0989-888-999', bookableStartDate: '2026-01-10', bookableEndDate: '2026-02-10', reservationDate: '2026-01-15', timeSlot: '14:00-15:00', inspectionStatus: '已完成', status: '已預約', remark: '' },
            { id: 9, projectName: '陸府觀微', unitName: 'B棟8A', memberName: '蔡小芬', phone: '0910-999-000', bookableStartDate: '2026-01-15', bookableEndDate: '2026-02-15', reservationDate: '2026-01-20', timeSlot: '16:00-17:00', inspectionStatus: '已完成', status: '已預約', remark: '' },
            // 待預約 - 可預約時段即將到期（尚未選擇日期）
            { id: 10, projectName: '陸府原森', unitName: 'A棟9C', memberName: '鄭家豪', phone: '0921-000-111', bookableStartDate: '2025-12-25', bookableEndDate: '2026-01-05', reservationDate: '', timeSlot: '', inspectionStatus: '已完成', status: '待預約', remark: '客戶尚未回覆時間' },
            { id: 11, projectName: '陸府植森', unitName: 'C棟2A', memberName: '許志明', phone: '0932-111-222', bookableStartDate: '2025-12-28', bookableEndDate: '2026-01-10', reservationDate: '', timeSlot: '', inspectionStatus: '處理中', status: '待預約', remark: '驗屋尚未完成' },
            { id: 12, projectName: '陸府觀微', unitName: 'A棟7B', memberName: '林志玲', phone: '0943-333-444', bookableStartDate: '2026-01-01', bookableEndDate: '2026-01-20', reservationDate: '', timeSlot: '', inspectionStatus: '已完成', status: '待預約', remark: '' },
            // 已完成
            { id: 13, projectName: '陸府原森', unitName: 'A棟12A', memberName: '王小明', phone: '0912-345-678', bookableStartDate: '2025-12-01', bookableEndDate: '2025-12-31', reservationDate: '2025-12-15', timeSlot: '09:00-10:00', inspectionStatus: '已完成', status: '已完成', remark: '順利完成交屋' },
            { id: 14, projectName: '陸府原森', unitName: 'A棟12B', memberName: '李美華', phone: '0923-456-789', bookableStartDate: '2025-12-05', bookableEndDate: '2025-12-31', reservationDate: '2025-12-20', timeSlot: '10:00-11:00', inspectionStatus: '已完成', status: '已完成', remark: '' },
            { id: 15, projectName: '陸府觀微', unitName: 'A棟15A', memberName: '陳雅芳', phone: '0945-678-901', bookableStartDate: '2025-12-10', bookableEndDate: '2025-12-31', reservationDate: '2025-12-18', timeSlot: '14:00-15:00', inspectionStatus: '已完成', status: '已完成', remark: '加購車位1個' }
            ];
        })(),

        // ============================================
        // 7.0 預約服務(對保)
        // ============================================

        /**
         * 對保預約資料
         */
        collateralReservations: (function() {
            try {
                const stored = localStorage.getItem('crm_collateralReservations');
                if (stored) return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to load collateralReservations from localStorage', e);
            }
            return [
            {  
                id: 1, 
                projectName: '陸府原森', 
                unitName: 'A棟8F', 
                memberName: '王大明', 
                phone: '0912-345-678', 
                bookableStartDate: '2025-10-01',
                bookableEndDate: '2025-10-31',
                reservationDate: '2025-10-15', 
                timeSlot: '10:00-11:00', 
                bank: '台新銀行',
                peopleCount: 2,
                status: '已預約', 
                hasUnread: true,
                checkList: { bank: true, location: true, documents: true },
                notes: '希望能盡快完成手續'
            },
            { 
                id: 2, 
                projectName: '陸府原森', 
                unitName: 'B棟12F', 
                memberName: '張美玲', 
                phone: '0922-333-444', 
                bookableStartDate: '2025-10-01',
                bookableEndDate: '2025-10-31',
                reservationDate: '2025-10-16', 
                timeSlot: '14:00-15:00', 
                bank: '玉山銀行',
                peopleCount: 1,
                status: '已完成', 
                hasUnread: false,
                checkList: { bank: true, location: true, documents: true },
                notes: ''
            },
            { 
               id: 3, 
               projectName: '陸府觀微', 
               unitName: 'C棟5F', 
               memberName: '李小華', 
               phone: '0933-555-666', 
               bookableStartDate: '2025-11-01',
               bookableEndDate: '2025-11-30',
               reservationDate: '2025-11-05', 
               timeSlot: '09:00-10:00', 
               bank: '國泰世華', 
               peopleCount: 3,
               status: '已取消', 
               hasUnread: false,
               checkList: { bank: false, location: false, documents: false },
               notes: '臨時有事改期'
           },
            { 
               id: 4, 
               projectName: '陸府原森', 
               unitName: 'A棟15F', 
               memberName: '陳志偉', 
               phone: '0911-222-333', 
               bookableStartDate: '2025-10-01',
               bookableEndDate: '2025-10-31',
               reservationDate: '', 
               timeSlot: '', 
               bank: '', 
               peopleCount: 0,
               status: '待確認', 
               hasUnread: false,
               checkList: { bank: false, location: false, documents: false },
               notes: '尚未預約'
           }
        ];
        })(),

        // ============================================
        // 11.0 房屋健檢
        // ============================================
        
        /**
         * 健檢排程
         */
        checkupSchedules: [
            { id: 1, projectName: '陸府原森', date: '2025-12-10', timeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'], maxGroups: 3, bookedGroups: 2, manager: '李小華' },
            { id: 2, projectName: '陸府原森', date: '2025-12-11', timeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'], maxGroups: 3, bookedGroups: 1, manager: '李小華' },
            { id: 3, projectName: '陸府觀微', date: '2025-12-12', timeSlots: ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'], maxGroups: 4, bookedGroups: 4, manager: '陳志偉' }
        ],

        /**
         * 健檢項目
         */
        checkupItems: [
            { id: 1, category: '結構檢查', name: '牆面裂縫檢查', description: '檢查內外牆是否有裂縫', sortOrder: 1 },
            { id: 2, category: '結構檢查', name: '地板平整度', description: '檢查地板是否平整', sortOrder: 2 },
            { id: 3, category: '水電檢查', name: '給水管路', description: '檢查給水管是否漏水', sortOrder: 3 },
            { id: 4, category: '水電檢查', name: '排水管路', description: '檢查排水是否順暢', sortOrder: 4 },
            { id: 5, category: '水電檢查', name: '電路檢查', description: '檢查插座、開關是否正常', sortOrder: 5 },
            { id: 6, category: '門窗檢查', name: '門扇開關', description: '檢查門是否順暢開關', sortOrder: 6 },
            { id: 7, category: '門窗檢查', name: '窗戶密封', description: '檢查窗戶密封性', sortOrder: 7 },
            { id: 8, category: '設備檢查', name: '空調運作', description: '檢查冷氣是否正常運作', sortOrder: 8 },
            { id: 9, category: '設備檢查', name: '熱水器', description: '檢查熱水器是否正常', sortOrder: 9 }
        ],

        // ============================================
        // 12.0 活動管理（基金會）
        // ============================================
        
        /**
         * 活動資料
         */
        activities: [
            { id: 1, name: '聖誕親子烘焙課程', date: '2025-12-20', time: '14:00-17:00', location: '陸府原森交誼廳', description: '親子一起動手做聖誕餅乾', maxParticipants: 20, currentParticipants: 15, fee: 500, status: '報名中', registrationDeadline: '2025-12-15' },
            { id: 2, name: '新年音樂會', date: '2026-01-01', time: '19:00-21:00', location: '陸府觀微大廳', description: '迎接新年的古典音樂會', maxParticipants: 100, currentParticipants: 68, fee: 0, status: '報名中', registrationDeadline: '2025-12-28' },
            { id: 3, name: '園藝療癒工作坊', date: '2025-12-15', time: '10:00-12:00', location: '陸府原森花園', description: '學習植栽照顧，放鬆身心', maxParticipants: 15, currentParticipants: 15, fee: 300, status: '已額滿', registrationDeadline: '2025-12-10' },
            { id: 4, name: '住戶聯誼茶會', date: '2025-11-30', time: '15:00-17:00', location: '陸府觀微交誼廳', description: '住戶交流聯誼活動', maxParticipants: 30, currentParticipants: 25, fee: 0, status: '已結束', registrationDeadline: '2025-11-25' }
        ],

        /**
         * 活動報名資料
         */
        activityRegistrations: [
            { id: 1, activityId: 1, activityName: '聖誕親子烘焙課程', memberName: '王小明', phone: '0912-345-678', participants: 2, totalFee: 1000, paymentStatus: '已付款', paymentMethod: '信用卡', receiptNo: 'R202512001', registerDate: '2025-12-01' },
            { id: 2, activityId: 1, activityName: '聖誕親子烘焙課程', memberName: '李美華', phone: '0923-456-789', participants: 3, totalFee: 1500, paymentStatus: '已付款', paymentMethod: '虛擬帳號', receiptNo: 'R202512002', registerDate: '2025-12-02' },
            { id: 3, activityId: 2, activityName: '新年音樂會', memberName: '陳雅芳', phone: '0945-678-901', participants: 4, totalFee: 0, paymentStatus: '免費活動', paymentMethod: '-', receiptNo: '-', registerDate: '2025-12-03' },
            { id: 4, activityId: 3, activityName: '園藝療癒工作坊', memberName: '張大偉', phone: '0934-567-890', participants: 1, totalFee: 300, paymentStatus: '待付款', paymentMethod: '-', receiptNo: '-', registerDate: '2025-12-05' }
        ],

        // ============================================
        // 通用選項資料
        // ============================================
        
        /**
         * 狀態選項
         */
        statusOptions: {
            general: ['啟用', '停用'],
            unit: ['待簽約', '已簽約', '待對保', '待驗屋', '待交屋', '已交屋'],
            workOrder: ['待派工', '處理中', '已完成', '已取消'],
            reservation: ['待確認', '已確認', '已完成', '已取消'],
            payment: ['待繳納', '已繳納', '逾期'],
            activity: ['草稿', '報名中', '已額滿', '已結束', '已取消']
        },

        /**
         * 個案類型選項
         */
        caseTypeOptions: [
            '每日摘要',
            '維修個案新增通知',
            '清潔個案新增通知',
            '客服個案新增通知',
            '個案客服回應通知',
            '客服個案未達標通知',
            '維修個案未達標通知',
            '清潔個案未達標通知',
            '維養個案未達標通知',
            '用戶滿意度調查回覆通知'
        ],

        /**
         * 會員身份選項
         */
        memberIdentityOptions: ['屋主', '住戶', '租戶', '物業人員'],

        /**
         * 派工單類型選項
         */
        workOrderTypeOptions: ['維修', '清潔', '客服', '保養'],

        /**
         * 優先等級選項
         */
        priorityOptions: ['高', '中', '低']
    };

    // ============================================
    // 工具方法
    // ============================================
    
    /**
     * 根據 ID 取得資料
     * @param {string} dataKey - 資料集名稱
     * @param {number} id - ID
     * @returns {Object|null}
     */
    MockData.getById = function(dataKey, id) {
        const data = this[dataKey];
        if (!data || !Array.isArray(data)) return null;
        return data.find(function(item) {
            return item.id === id;
        }) || null;
    };

    /**
     * 根據條件篩選資料
     * @param {string} dataKey - 資料集名稱
     * @param {Object} filters - 篩選條件
     * @returns {Array}
     */
    MockData.filter = function(dataKey, filters) {
        const data = this[dataKey];
        if (!data || !Array.isArray(data)) return [];
        
        return data.filter(function(item) {
            for (var key in filters) {
                if (filters.hasOwnProperty(key)) {
                    if (item[key] !== filters[key]) {
                        return false;
                    }
                }
            }
            return true;
        });
    };

    /**
     * 模擬分頁取得資料
     * @param {string} dataKey - 資料集名稱
     * @param {number} page - 頁碼
     * @param {number} pageSize - 每頁筆數
     * @param {Object} filters - 篩選條件（選用）
     * @returns {Object}
     */
    MockData.getPaged = function(dataKey, page, pageSize, filters) {
        let data = this[dataKey];
        if (!data || !Array.isArray(data)) {
            return { items: [], total: 0, page: page, pageSize: pageSize };
        }
        
        // 套用篩選
        if (filters) {
            data = data.filter(function(item) {
                for (var key in filters) {
                    if (filters.hasOwnProperty(key) && filters[key]) {
                        if (item[key] !== filters[key]) {
                            return false;
                        }
                    }
                }
                return true;
            });
        }
        
        const total = data.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const items = data.slice(start, end);
        
        return {
            items: items,
            total: total,
            page: page,
            pageSize: pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    };

    /**
     * 儲存資料到 LocalStorage
     */
    MockData.save = function() {
        try {
            localStorage.setItem('crm_members', JSON.stringify(this.members));
            localStorage.setItem('crm_handoverReservations', JSON.stringify(this.handoverReservations));
            localStorage.setItem('crm_collateralReservations', JSON.stringify(this.collateralReservations));
        } catch (e) {
            console.error('Failed to save members to localStorage', e);
        }
    };

    // ============================================
    // 匯出
    // ============================================
    window.CRMMockData = MockData;

})();
