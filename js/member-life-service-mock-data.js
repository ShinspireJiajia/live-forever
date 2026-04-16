/**
 * 鄰里生活服務管理 — Mock 測試資料
 * 供 member-life-service.js 使用
 */

/* 分類資料 */
let mockCategories = [
    { id: 1, icon: '🧹', name: '家政服務', sort: 1, status: '啟用' },
    { id: 2, icon: '🚗', name: '汽車美容', sort: 2, status: '啟用' },
    { id: 3, icon: '🍽️', name: '餐飲優惠', sort: 3, status: '啟用' }
];

/* 適用案場清單 */
const mockSites = [
    { id: 1, name: '陸府－勤美院' },
    { id: 2, name: '陸府－森之谷' },
    { id: 3, name: '陸府－中央院' },
    { id: 4, name: '陸府－品雅苑' }
];

/* 服務項目資料（含流水號 no、顯示起迄 displayFrom/displayTo、適用案場 siteIds） */
let mockServices = [
    { id: 1,  no: 'SVC-2026-001', categoryId: 1, icon: '🧺', name: '專業乾洗',   discount: '滿 500 打 9 折',   vendor: '潔淨乾洗坊',   vendorPhone: '02-2345-6789', manager: '陳佳玲', offer: '社區住戶免費上門取件，消費滿 500 元享 9 折，送洗完成後 2 工作天送件到府。',                             desc: '提供衣物、床組、羽絨被等精密乾洗服務，採用環保無毒溶劑維護衣物品質。服務流程：預約 → 上門取件 → 送洗 → 送件到府。',              sort: 1, status: '啟用', displayFrom: '2026-01-01', displayTo: '2026-12-31', siteIds: [1, 2] },
    { id: 2,  no: 'SVC-2026-002', categoryId: 1, icon: '🧹', name: '居家清潔',   discount: '首次享 85 折',      vendor: '亮淨居家',     vendorPhone: '02-3456-7890', manager: '林美月', offer: '首次預約享 85 折，3 小時深度清潔，含廚房、衛浴重點清潔項目。',                                           desc: '專業清潔人員提供全室深度清潔，包含廚房除油、衛浴去垢、地板拋光，自備清潔用品，無需擔心化學殘留。',                             sort: 2, status: '啟用', displayFrom: '2026-01-01', displayTo: '2026-12-31', siteIds: [1, 2, 3] },
    { id: 3,  no: 'SVC-2026-003', categoryId: 1, icon: '🔧', name: '家電維修',   discount: '到府免檢查費',      vendor: '萬修便利站',   vendorPhone: '02-4567-8901', manager: '黃家豪', offer: '社區住戶到府診斷免收檢查費，維修費用依廠商報價另計。',                                                   desc: '提供冷氣、洗衣機、冰箱、熱水器等家電維修，師傅均具本科認證，維修後提供 30 天免費保固。',                                       sort: 3, status: '啟用', displayFrom: '2026-01-01', displayTo: '',            siteIds: [1, 2, 3, 4] },
    { id: 4,  no: 'SVC-2026-004', categoryId: 1, icon: '🐾', name: '寵物美容',   discount: '首購折 $100',       vendor: '毛孩美容院',   vendorPhone: '02-5678-9012', manager: '蔡雅芝', offer: '社區住戶首次消費立折 100 元，可在社區中庭服務車預約，免出社區。',                                         desc: '提供小型犬貓洗澡、剪毛、修指甲、耳道清潔等全套美容服務，使用寵物專用低敏洗劑，溫和呵護您的毛孩。',                             sort: 4, status: '啟用', displayFrom: '2026-03-01', displayTo: '2026-06-30', siteIds: [2, 3] },
    { id: 5,  no: 'SVC-2026-005', categoryId: 2, icon: '🚗', name: '到府洗車',   discount: '住戶現折 $200',     vendor: '閃亮汽車美容', vendorPhone: '02-6789-0123', manager: '許志偉', offer: '社區住戶每次基礎洗車現折 200 元，預約制於停車場完成，不影響出行。',                                       desc: '提供車身清洗、輪胎清潔、車窗亮光等基礎洗車服務，採無刷水洗方式，有效降低車漆刮傷風險。',                                       sort: 1, status: '啟用', displayFrom: '2026-01-01', displayTo: '2026-12-31', siteIds: [1, 3, 4] },
    { id: 6,  no: 'SVC-2026-006', categoryId: 2, icon: '✨', name: '打蠟拋光',   discount: '社區專屬 85 折',    vendor: '閃亮汽車美容', vendorPhone: '02-6789-0123', manager: '許志偉', offer: '全車系打蠟拋光享 85 折優惠，施工於社區停車場，安全便利。',                                               desc: '人工研磨拋光去除細微刮痕，施以進口棕櫚蠟保護漆面，增加光澤並延長車漆壽命，完整施工約 2–3 小時。',                             sort: 2, status: '啟用', displayFrom: '2026-01-01', displayTo: '2026-12-31', siteIds: [1, 3, 4] },
    { id: 7,  no: 'SVC-2026-007', categoryId: 2, icon: '🔩', name: '輪胎保養',   discount: '換胎免工本費',      vendor: '穩行輪胎行',   vendorPhone: '02-7890-1234', manager: '盧坤達', offer: '社區住戶更換輪胎免收工本費，僅需支付輪胎本身費用。',                                                     desc: '提供四輪定位、輪胎更換、輪圈清潔、氣嘴更換等服務，師傅至停車場現場作業，全程約 30–60 分鐘。',                                   sort: 3, status: '啟用', displayFrom: '2026-01-01', displayTo: '',            siteIds: [1, 2, 3, 4] },
    { id: 8,  no: 'SVC-2026-008', categoryId: 3, icon: '🍽️', name: '主廚私房菜', discount: '外帶享 9 折',       vendor: '爐藝台式料理', vendorPhone: '02-8901-2345', manager: '吳雅惠', offer: '社區住戶來電或 APP 預訂外帶享 9 折，不限菜色，節假日亦適用。',                                           desc: '精選台灣在地食材，提供傳統台式合菜料理。推薦菜色：三杯雞、客家小炒、滷肉飯，預訂前一日確保食材新鮮。',                         sort: 1, status: '啟用', displayFrom: '2026-01-01', displayTo: '2026-12-31', siteIds: [2, 4] },
    { id: 9,  no: 'SVC-2026-009', categoryId: 3, icon: '🛵', name: '早午餐外送', discount: '首購折 $50',         vendor: '晨光輕食',     vendorPhone: '02-9012-3456', manager: '張宜庭', offer: '首次透過社區管道下單折抵 50 元，且免收外送費（限社區內配送）。',                                         desc: '提供健康輕食早午餐，含三明治、沙拉、優格穀麥碗等選項，平日 07:30–14:00 接受預訂，送達時間約 30 分鐘。',                        sort: 2, status: '啟用', displayFrom: '2026-02-01', displayTo: '2026-08-31', siteIds: [1, 2] },
    { id: 10, no: 'SVC-2026-010', categoryId: 3, icon: '☕', name: '精品咖啡',   discount: '第二杯半價',         vendor: '繁星咖啡',     vendorPhone: '02-0123-4567', manager: '鄭文凱', offer: '憑社區住戶身分，點第二杯享半價，適用單品咖啡及所有義式飲品，每日限量供應。',                               desc: '精選衣索比亞、哥倫比亞等產區單品咖啡豆，現點現磨，提供美式、拿鐵、卡布奇諾等多種選擇，可指定烘焙深度。',                     sort: 3, status: '啟用', displayFrom: '2026-01-01', displayTo: '2026-12-31', siteIds: [1, 2, 3, 4] }
];

/* 預約紀錄資料 */
let mockReservations = [
    { id: 1,  no: 'SVC-20260101-001', serviceId: 1,  unit: 'A3-3', name: '王小明', phone: '0912-345-678', date: '2026-03-15', slot: '上午 09:00–12:00', note: '',             adminNote: '',          status: '待確認', createdAt: '2026-03-12 09:15' },
    { id: 2,  no: 'SVC-20260101-002', serviceId: 5,  unit: 'B2-1', name: '李大華', phone: '0923-456-789', date: '2026-03-16', slot: '下午 13:00–17:00', note: 'SUV 車型',     adminNote: '',          status: '已確認', createdAt: '2026-03-12 10:30' },
    { id: 3,  no: 'SVC-20260101-003', serviceId: 8,  unit: 'C1-5', name: '陳美玲', phone: '0934-567-890', date: '2026-03-17', slot: '傍晚 17:00–20:00', note: '三杯雞 x2、滷肉飯 x3', adminNote: '', status: '已確認', createdAt: '2026-03-11 14:20' },
    { id: 4,  no: 'SVC-20260101-004', serviceId: 2,  unit: 'A1-2', name: '林俊賢', phone: '0945-678-901', date: '2026-03-18', slot: '上午 09:00–12:00', note: '需要清潔陽台',  adminNote: '',          status: '待確認', createdAt: '2026-03-12 11:05' },
    { id: 5,  no: 'SVC-20260101-005', serviceId: 6,  unit: 'D3-4', name: '黃淑芬', phone: '0956-789-012', date: '2026-03-14', slot: '下午 13:00–17:00', note: '',             adminNote: '已完成作業', status: '已完成', createdAt: '2026-03-10 08:45' },
    { id: 6,  no: 'SVC-20260101-006', serviceId: 10, unit: 'B4-2', name: '張偉誠', phone: '0967-890-123', date: '2026-03-13', slot: '上午 09:00–12:00', note: '',             adminNote: '客戶臨時取消', status: '已取消', createdAt: '2026-03-09 16:20' },
    { id: 7,  no: 'SVC-20260101-007', serviceId: 4,  unit: 'A2-6', name: '吳雅茹', phone: '0978-901-234', date: '2026-03-19', slot: '下午 13:00–17:00', note: '柴犬，12 公斤', adminNote: '',          status: '待確認', createdAt: '2026-03-12 13:00' },
    { id: 8,  no: 'SVC-20260101-008', serviceId: 3,  unit: 'C3-1', name: '周建志', phone: '0989-012-345', date: '2026-03-20', slot: '傍晚 17:00–20:00', note: '冷氣不製冷',   adminNote: '',          status: '已確認', createdAt: '2026-03-12 14:50' },
    { id: 9,  no: 'SVC-20260101-009', serviceId: 9,  unit: 'B1-3', name: '蔡怡君', phone: '0912-111-222', date: '2026-03-15', slot: '上午 09:00–12:00', note: '沙拉不加起司', adminNote: '',           status: '待確認', createdAt: '2026-03-12 07:30' },
    { id: 10, no: 'SVC-20260101-010', serviceId: 7,  unit: 'D1-5', name: '許文龍', phone: '0923-222-333', date: '2026-03-21', slot: '下午 13:00–17:00', note: '',             adminNote: '',          status: '待確認', createdAt: '2026-03-12 16:10' }
];

/* 自動遞增 ID */
let nextCategoryId = mockCategories.length + 1;
let nextServiceId  = mockServices.length + 1;

/* 服務項目流水號產生器 */
function generateServiceNo() {
    const year = new Date().getFullYear();
    const seq  = String(nextServiceId).padStart(3, '0');
    return `SVC-${year}-${seq}`;
}
