/**
 * ============================================
 * 陸府建設 CRM 系統 - 側邊欄邏輯
 * ============================================
 * 檔案：sidebar.js
 * 說明：處理側邊欄的展開/收合、RWD 行為、選單互動
 * 建立日期：2025-12-03
 * ============================================
 */

class SidebarManager {
    constructor() {
        // DOM 元素
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarToggle = document.querySelector('.header-toggle');
        this.sidebarOverlay = document.querySelector('.sidebar-overlay'); // 如果有的話
        this.menuItems = document.querySelectorAll('.menu-item'); // 所有選單項目 (li)

        // 常數
        this.STORAGE_KEY_COLLAPSED = 'sidebar_collapsed';
        this.STORAGE_KEY_EXPANDED = 'sidebar_expanded_menus';

        // 初始化
        this.init();
    }

    init() {
        if (!this.sidebar) {
            console.warn('Sidebar: 找不到側邊欄元素');
            return;
        }

        this.bindEvents();
        this.restoreState();
        this.setActiveMenu();
        
        console.log('SidebarManager: 初始化完成');
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 漢堡選單按鈕
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.handleToggleClick());
        }

        // 遮罩點擊 (Mobile)
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => this.closeMobileSidebar());
        }

        // 選單項目點擊
        this.menuItems.forEach(item => {
            const link = item.querySelector('a');
            const submenu = item.querySelector('.menu-items'); // 子選單

            if (link) {
                link.addEventListener('click', (e) => {
                    // 如果有子選單，切換展開狀態
                    if (submenu) {
                        e.preventDefault(); // 阻止跳轉
                        this.toggleSubmenu(item);
                    } else {
                        // 如果是連結，且在手機版，點擊後關閉側邊欄
                        if (this.isMobileView()) {
                            this.closeMobileSidebar();
                        }
                    }
                });
            }
        });

        // 視窗大小改變
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * 處理漢堡選單點擊
     */
    handleToggleClick() {
        if (this.isMobileView()) {
            this.toggleMobileSidebar();
        } else {
            this.toggleSidebarCollapse();
        }
    }

    /**
     * 切換手機版側邊欄
     */
    toggleMobileSidebar() {
        this.sidebar.classList.toggle('active');
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.toggle('active');
        }
        document.body.classList.toggle('sidebar-open');
    }

    /**
     * 關閉手機版側邊欄
     */
    closeMobileSidebar() {
        this.sidebar.classList.remove('active');
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.remove('active');
        }
        document.body.classList.remove('sidebar-open');
    }

    /**
     * 切換桌面版側邊欄收合
     */
    toggleSidebarCollapse() {
        const isCollapsed = this.sidebar.classList.toggle('collapsed');
        
        // 更新主內容區域
        // 嘗試尋找 .app-main 或 .app-container
        const appMain = document.querySelector('.app-main') || document.querySelector('.app-container');
        if (appMain) {
            appMain.classList.toggle('sidebar-collapsed', isCollapsed);
        }

        // 儲存狀態
        this.saveCollapsedState(isCollapsed);
    }

    /**
     * 切換子選單
     */
    toggleSubmenu(menuItem) {
        const isExpanded = menuItem.classList.contains('expanded');
        
        if (isExpanded) {
            menuItem.classList.remove('expanded');
        } else {
            // 可選：是否要手風琴效果（展開一個時關閉其他同層級的）
            // this.collapseSiblings(menuItem);
            menuItem.classList.add('expanded');
        }

        this.saveExpandedMenus();
    }

    /**
     * 判斷是否為手機版視圖
     */
    isMobileView() {
        return window.innerWidth < 1024; // 對應 CSS 的 Desktop breakpoint
    }

    /**
     * 處理視窗大小改變
     */
    handleResize() {
        if (!this.isMobileView()) {
            // 切換回桌面版時，移除手機版相關 class
            this.sidebar.classList.remove('active');
            if (this.sidebarOverlay) this.sidebarOverlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    }

    /**
     * 設定當前頁面高亮
     */
    setActiveMenu() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';

        // 頁面映射表：子頁面 -> 父選單連結
        // 當前頁面不在選單中時，指定要高亮的父選單頁面
        const pageMapping = {
            // 綠海養護
            'green-reservation-edit.html': 'green-reservation.html',
            'green-reservation-add.html': 'green-reservation.html',
            'green-reservation-completion.html': 'green-reservation.html',
            'green-reservation-report.html': 'green-reservation.html',
            'green-contract-add.html': 'green-contract.html',
            'green-contract-payment.html': 'green-contract.html',
            'green-site-schedule.html': 'green-site.html',
            'green-case-edit.html': 'green-case-list.html',
            'green-case-quotation.html': 'green-case-list.html',
            
            // 預約服務
            'reservation-collateral-edit.html': 'reservation-collateral.html',
            'reservation-collateral-schedule.html': 'reservation-collateral.html',
            'reservation-collateral-questionnaire-design.html': 'reservation-collateral.html',
            'reservation-inspection-edit.html': 'reservation-inspection.html',
            'reservation-handover-edit.html': 'reservation-handover.html',
            'reservation-handover-schedule.html': 'reservation-handover.html',
            'reservation-handover-survey.html': 'reservation-handover.html',
            'reservation-custom-edit.html': 'reservation-custom.html',
            'reservation-custom-schedule.html': 'reservation-custom.html',
            
            // 房屋健檢
            'house-checkup-activity.html': 'house-checkup-site.html',
            'house-checkup-activity-edit.html': 'house-checkup-site.html',
            'house-checkup-report.html': 'house-checkup-reservation.html',
            
            // 個案單管理
            'case-edit.html': 'case-list.html',
            
            // 活動管理
            'activity-registration-edit.html': 'activity-registration.html',
            
            // 案場活動
            'site-event-add.html': 'site-event-list.html',
            'site-event-category.html': 'site-event-list.html',
            'site-event-registration.html': 'site-event-list.html',
            'site-event-registration-edit.html': 'site-event-list.html',
            
            // 官網活動(基金會)
            'foundation-event-edit.html': 'foundation-event-list.html',
            'foundation-registration-edit.html': 'foundation-registration.html',
            'foundation-receipt-edit.html': 'foundation-registration.html',
            
            // 戶別管理
            'unit-profile.html': 'unit-list.html',
            'unit-appointment.html': 'unit-list.html',
            'resident-profile.html': 'unit-list.html',
            
            // 系統管理
            'system-user-edit.html': 'system-user.html',
            'system-role-edit.html': 'system-role.html'
        };

        // 決定要高亮的目標頁面
        const targetPage = pageMapping[currentPage] || currentPage;

        // 移除所有 active
        document.querySelectorAll('.menu-item > a.active').forEach(el => el.classList.remove('active'));

        // 尋找匹配的連結
        const links = document.querySelectorAll('.menu-item > a');
        let found = false;

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                // 取得 href 的檔名部分 (忽略路徑)
                const hrefFile = href.split('/').pop();
                
                // 比對檔名
                if (hrefFile === targetPage) {
                    link.classList.add('active');
                    found = true;

                    // 展開父選單
                    let parentItem = link.closest('.menu-items');
                    if (parentItem) {
                        let parentMenuItem = parentItem.closest('.menu-item');
                        while (parentMenuItem) {
                            parentMenuItem.classList.add('expanded');
                            // 確保父選單的箭頭方向正確 (如果有的話)
                            const expandIcon = parentMenuItem.querySelector('.expand-state');
                            if (expandIcon) {
                                // 這裡通常由 CSS 控制，但如果需要 JS 輔助可以加
                            }
                            
                            parentItem = parentMenuItem.parentElement.closest('.menu-items');
                            parentMenuItem = parentItem ? parentItem.closest('.menu-item') : null;
                        }
                    }
                }
            }
        });
    }

    /**
     * 儲存收合狀態
     */
    saveCollapsedState(isCollapsed) {
        localStorage.setItem(this.STORAGE_KEY_COLLAPSED, JSON.stringify(isCollapsed));
    }

    /**
     * 儲存展開的選單
     */
    saveExpandedMenus() {
        const expandedIds = [];
        this.menuItems.forEach((item, index) => {
            if (item.classList.contains('expanded')) {
                // 嘗試獲取 ID，如果沒有則使用索引
                const id = item.id || `menu-${index}`;
                expandedIds.push(id);
            }
        });
        localStorage.setItem(this.STORAGE_KEY_EXPANDED, JSON.stringify(expandedIds));
    }

    /**
     * 恢復狀態
     */
    restoreState() {
        // 恢復收合狀態 (僅桌面)
        if (!this.isMobileView()) {
            const isCollapsed = JSON.parse(localStorage.getItem(this.STORAGE_KEY_COLLAPSED));
            if (isCollapsed) {
                this.sidebar.classList.add('collapsed');
                const appMain = document.querySelector('.app-main') || document.querySelector('.app-container');
                if (appMain) appMain.classList.add('sidebar-collapsed');
            }
        }

        // 恢復展開選單
        const expandedIds = JSON.parse(localStorage.getItem(this.STORAGE_KEY_EXPANDED)) || [];
        this.menuItems.forEach((item, index) => {
            const id = item.id || `menu-${index}`;
            if (expandedIds.includes(id)) {
                item.classList.add('expanded');
            }
        });
    }
}

// 將 SidebarManager 暴露到全域
window.SidebarManager = SidebarManager;
