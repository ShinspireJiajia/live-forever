/**
 * ============================================
 * 陸府建設 CRM 系統 - 共用選單模組
 * 目的：統一管理 Header 與側邊欄選單結構，避免各頁面重複維護
 * ============================================
 */

/**
 * 頂部導覽列 HTML
 */
const CRM_HEADER_HTML = `
    <header class="header">
        <div class="header-left">
            <!-- 側邊欄切換按鈕 -->
            <button class="header-toggle" id="sidebarToggle" title="展開/收合選單">
                <i class="fa-solid fa-bars"></i>
            </button>
            <!-- Logo/系統名稱 -->
            <div class="header-brand">
                <span class="header-title">CRM</span>
            </div>
        </div>
        <div class="header-right">
            <!-- 隱藏右側內容 -->
        </div>
    </header>
`;

/**
 * 側邊欄選單 HTML
 */
const CRM_SIDEBAR_HTML = `
        <aside class="sidebar" id="sidebar">
            <div class="main-container main-container-fixed">
                <div class="scrollable">
                    <ul class="menu-items">
                        <!-- 首頁 -->
                        <li class="menu-item" data-menu-id="home">
                            <a href="index.html" title="首頁">
                                <i class="menu-icon fa-solid fa-house"></i>
                                <span class="menu-title">首頁</span>
                            </a>
                        </li>

                        <!-- 系統管理 -->
                        <li class="menu-item" data-menu-id="system">
                            <a href="javascript:void(0)" title="系統管理">
                                <i class="menu-icon fa-solid fa-gear"></i>
                                <span class="menu-title">系統管理</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="system-user.html" title="使用者管理"><span class="menu-title">使用者管理</span></a></li>
                                <li class="menu-item"><a href="system-role.html" title="角色權限管理"><span class="menu-title">角色權限管理</span></a></li>
                                <li class="menu-item"><a href="system-log.html" title="操作紀錄查詢"><span class="menu-title">操作紀錄查詢</span></a></li>
                                <li class="menu-item"><a href="#" title="APP使用者管理 (未完成)"><span class="menu-title">APP使用者管理 (未完成)</span></a></li>
                            </ul>
                        </li>

                        <!-- CRM設定 -->
                        <li class="menu-item" data-menu-id="crm">
                            <a href="javascript:void(0)" title="CRM設定">
                                <i class="menu-icon fa-solid fa-sliders"></i>
                                <span class="menu-title">CRM設定</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="crm-vendor.html" title="廠商管理"><span class="menu-title">廠商管理</span></a></li>
                                <li class="menu-item"><a href="crm-project.html" title="案場管理"><span class="menu-title">案場管理</span></a></li>
                                <li class="menu-item"><a href="crm-milestone.html" title="里程碑管理"><span class="menu-title">里程碑管理</span></a></li>
                                <li class="menu-item"><a href="crm-warranty.html" title="案場保固設定"><span class="menu-title">案場保固設定</span></a></li>
                                <li class="menu-item"><a href="#" title="LINE頁面管理 (未完成)"><span class="menu-title">LINE頁面管理 (未完成)</span></a></li>
                                <li class="menu-item"><a href="crm-email.html" title="郵件管理"><span class="menu-title">郵件管理</span></a></li>
                                <li class="menu-item"><a href="#" title="驗屋項目管理 (未完成)"><span class="menu-title">驗屋項目管理 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="巡檢項目管理 (未完成)"><span class="menu-title">巡檢項目管理 (未完成)</span></a></li>
                            </ul>
                        </li>

                        <!-- 戶別管理 -->
                        <li class="menu-item" data-menu-id="unit">
                            <a href="javascript:void(0)" title="戶別管理">
                                <i class="menu-icon fa-solid fa-building"></i>
                                <span class="menu-title">戶別管理</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="unit-list.html" title="戶別管理"><span class="menu-title">戶別管理</span></a></li>
                                <li class="menu-item"><a href="#" title="驗屋戶別管理 (未完成)"><span class="menu-title">驗屋戶別管理 (未完成)</span></a></li>
                                <li class="menu-item"><a href="unit-payment.html" title="繳款紀錄"><span class="menu-title">繳款紀錄</span></a></li>
                                <li class="menu-item"><a href="#" title="合約附件 (未完成)"><span class="menu-title">合約附件 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="戶別預約設定 (未完成)"><span class="menu-title">戶別預約設定 (未完成)</span></a></li>
                            </ul>
                        </li>

                        <!-- 會員管理 -->
                        <li class="menu-item" data-menu-id="member">
                            <a href="javascript:void(0)" title="會員管理">
                                <i class="menu-icon fa-solid fa-users"></i>
                                <span class="menu-title">會員管理</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="member-list.html" title="會員管理"><span class="menu-title">會員管理</span></a></li>
                                <li class="menu-item"><a href="member-bindline.html" title="Line 綁定"><span class="menu-title">Line 綁定</span></a></li>
                                <li class="menu-item"><a href="#" title="活動歷程 (未完成)"><span class="menu-title">活動歷程 (未完成)</span></a></li>
                            </ul>
                        </li>

                        <!-- 個案單管理 -->
                        <li class="menu-item" data-menu-id="case">
                            <a href="javascript:void(0)" title="個案單管理">
                                <i class="menu-icon fa-solid fa-file-invoice"></i>
                                <span class="menu-title">個案單管理</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="case-list.html" title="個案單"><span class="menu-title">個案單</span></a></li>
                                <li class="menu-item"><a href="green-case-list.html" title="綠海報修個案單"><span class="menu-title">綠海報修個案單</span></a></li>
                                <li class="menu-item"><a href="#" title="驗屋修繕紀錄 (未完成)"><span class="menu-title">驗屋修繕紀錄 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="巡檢紀錄 (未完成)"><span class="menu-title">巡檢紀錄 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="驗屋個案單 (未完成)"><span class="menu-title">驗屋個案單 (未完成)</span></a></li>
                            </ul>
                        </li>

                        <!-- 派工單管理 -->
                        <li class="menu-item" data-menu-id="dispatch">
                            <a href="javascript:void(0)" title="派工單管理">
                                <i class="menu-icon fa-solid fa-clipboard-list"></i>
                                <span class="menu-title">派工單管理</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="work-order.html" title="派工單管理"><span class="menu-title">派工單管理</span></a></li>
                            </ul>
                        </li>

                        <!-- 綠海養護 -->
                        <li class="menu-item" data-menu-id="green">
                            <a href="javascript:void(0)" title="綠海養護">
                                <i class="menu-icon fa-solid fa-leaf"></i>
                                <span class="menu-title">綠海養護</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="green-site.html" title="案場管理(綠海)"><span class="menu-title">案場管理(綠海)</span></a></li>
                                <li class="menu-item"><a href="green-contract.html" title="養護合約"><span class="menu-title">養護合約</span></a></li>
                                <li class="menu-item"><a href="green-reservation.html" title="服務紀錄"><span class="menu-title">服務紀錄</span></a></li>
                            </ul>
                        </li>

                        <!-- 預約服務 -->
                        <li class="menu-item" data-menu-id="reservation">
                            <a href="javascript:void(0)" title="預約服務">
                                <i class="menu-icon fa-solid fa-calendar-check"></i>
                                <span class="menu-title">預約服務</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="reservation-collateral.html" title="對保預約"><span class="menu-title">對保預約</span></a></li>
                                <li class="menu-item"><a href="reservation-inspection.html" title="驗屋預約"><span class="menu-title">驗屋預約</span></a></li>
                                <li class="menu-item"><a href="reservation-handover.html" title="交屋預約"><span class="menu-title">交屋預約</span></a></li>
                                <li class="menu-item"><a href="reservation-custom.html" title="客變預約"><span class="menu-title">客變預約</span></a></li>
                            </ul>
                        </li>

                        <!-- 房屋健檢 -->
                        <li class="menu-item" data-menu-id="checkup">
                            <a href="javascript:void(0)" title="房屋健檢">
                                <i class="menu-icon fa-solid fa-stethoscope"></i>
                                <span class="menu-title">房屋健檢</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="house-checkup-site.html" title="案場管理"><span class="menu-title">案場管理</span></a></li>
                                <li class="menu-item"><a href="house-checkup-reservation.html" title="預約紀錄"><span class="menu-title">預約紀錄</span></a></li>
                            </ul>
                        </li>

                        <!-- 活動管理 -->
                        <li class="menu-item" data-menu-id="activity">
                            <a href="javascript:void(0)" title="活動管理">
                                <i class="menu-icon fa-solid fa-calendar-days"></i>
                                <span class="menu-title">活動管理</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="site-event-list.html" title="活動清單"><span class="menu-title">活動清單</span></a></li>
                                <li class="menu-item"><a href="site-event-registration.html" title="報名管理"><span class="menu-title">報名管理</span></a></li>
                            </ul>
                        </li>

                        <!-- 官網活動(基金會) -->
                        <li class="menu-item" data-menu-id="foundation">
                            <a href="javascript:void(0)" title="官網活動(基金會)">
                                <i class="menu-icon fa-solid fa-landmark"></i>
                                <span class="menu-title">官網活動(基金會)</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="foundation-event-list.html" title="活動設定"><span class="menu-title">活動設定</span></a></li>
                                <li class="menu-item"><a href="foundation-registration.html" title="報名紀錄"><span class="menu-title">報名紀錄</span></a></li>
                                <li class="menu-item"><a href="foundation-audit-log.html" title="稽核日誌"><span class="menu-title">稽核日誌</span></a></li>
                            </ul>
                        </li>

                        <!-- 報表管理 -->
                        <li class="menu-item" data-menu-id="report">
                            <a href="javascript:void(0)" title="報表管理">
                                <i class="menu-icon fa-solid fa-chart-pie"></i>
                                <span class="menu-title">報表管理</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="#" title="售後服務管制總表 (未完成)"><span class="menu-title">售後服務管制總表 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="未結案個案單 (未完成)"><span class="menu-title">未結案個案單 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="全部建案維修類統計表 (未完成)"><span class="menu-title">全部建案維修類統計表 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="全部建案維修部品統計表 (未完成)"><span class="menu-title">全部建案維修部品統計表 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="全部建案維修位置統計表 (未完成)"><span class="menu-title">全部建案維修位置統計表 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="滿意度調查統計 (未完成)"><span class="menu-title">滿意度調查統計 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="客戶滿意度明細表 (未完成)"><span class="menu-title">客戶滿意度明細表 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="全部建案維修狀態統計表 (未完成)"><span class="menu-title">全部建案維修狀態統計表 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="案件數量統計表 (未完成)"><span class="menu-title">案件數量統計表 (未完成)</span></a></li>
                                <li class="menu-item"><a href="#" title="任務完成統計表 (未完成)"><span class="menu-title">任務完成統計表 (未完成)</span></a></li>
                            </ul>
                        </li>

                        <!-- 推播管理 -->
                        <li class="menu-item" data-menu-id="push">
                            <a href="javascript:void(0)" title="推播管理">
                                <i class="menu-icon fa-solid fa-bell"></i>
                                <span class="menu-title">推播管理</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="#" title="推播管理 (未完成)"><span class="menu-title">推播管理 (未完成)</span></a></li>
                            </ul>
                        </li>

                        <!-- 問卷管理 -->
                        <li class="menu-item" data-menu-id="questionnaire">
                            <a href="javascript:void(0)" title="問卷管理">
                                <i class="menu-icon fa-solid fa-clipboard-question"></i>
                                <span class="menu-title">問卷管理</span>
                                <i class="expand-state fa-solid fa-chevron-right"></i>
                            </a>
                            <ul class="menu-items">
                                <li class="menu-item"><a href="#" title="題目管理 (未完成)"><span class="menu-title">題目管理 (未完成)</span></a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
`;

/**
 * 渲染頂部導覽列
 * @param {string} containerId - 容器 ID (預設 'header-container')
 */
function renderHeader(containerId = 'header-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = CRM_HEADER_HTML;
    } else {
        console.warn('Header container not found:', containerId);
    }
}

/**
 * 渲染側邊欄
 * @param {string} containerId - 容器 ID (預設 'sidebar-container')
 */
function renderSidebar(containerId = 'sidebar-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = CRM_SIDEBAR_HTML;
    } else {
        console.warn('Sidebar container not found:', containerId);
    }
}

/**
 * 初始化共用元件（Header + Sidebar）
 * 在 DOMContentLoaded 時呼叫
 */
function initCRMLayout() {
    renderHeader();
    renderSidebar();
}

