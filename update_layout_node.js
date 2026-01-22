#!/usr/bin/env node
/**
 * ============================================
 * 陸府建設 CRM 系統 - 統一 Header 與 Sidebar 腳本 (Node.js 版)
 * ============================================
 * 目的：將所有 HTML 頁面的 Header 與 Sidebar 改為動態渲染方式
 * 執行前會建立備份資料夾確保可回滾
 * ============================================
 */

const fs = require('fs');
const path = require('path');

// ============================================
// 設定區
// ============================================

// 專案根目錄
const PROJECT_DIR = __dirname;

// 排除的獨立頁面（沒有標準 sidebar layout）
const EXCLUDED_FILES = [
    'green-performance.html',
    'green-quotation-confirm.html',
    'green-reservation-completion.html',
    'green-reservation-report.html',
    'reservation-handover-survey-fill.html',
    'foundation-receipt-edit.html',
    'site-event-my.html',
];

// ============================================
// 工具函式
// ============================================

/**
 * 建立備份資料夾
 */
function createBackup(projectDir) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    const backupDir = path.join(projectDir, `backup_${timestamp}`);
    
    console.log(`📦 建立備份資料夾: ${backupDir}`);
    fs.mkdirSync(backupDir, { recursive: true });
    
    // 只備份 HTML 檔案
    const htmlFiles = fs.readdirSync(projectDir)
        .filter(f => f.endsWith('.html'));
    
    for (const htmlFile of htmlFiles) {
        const src = path.join(projectDir, htmlFile);
        const dst = path.join(backupDir, htmlFile);
        fs.copyFileSync(src, dst);
    }
    
    console.log(`✅ 已備份 ${htmlFiles.length} 個 HTML 檔案`);
    return backupDir;
}

/**
 * 取得需要處理的 HTML 檔案清單
 */
function getHtmlFiles(projectDir, excludedFiles) {
    return fs.readdirSync(projectDir)
        .filter(f => f.endsWith('.html') && !excludedFiles.includes(f))
        .sort();
}

/**
 * 處理單一 HTML 檔案
 */
function processHtmlFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');
    const originalContent = content;
    const changesMade = [];

    // ============================================
    // 1. 替換 Header 區塊
    // ============================================
    // 匹配 <header class="header">...</header>（含註解）
    const headerPatternWithComment = /<!-- [=\-]+ -->\s*\n\s*<!-- 頂部導覽列 -->\s*\n\s*<!-- [=\-]+ -->\s*\n\s*<header class="header">[\s\S]*?<\/header>/;
    
    // 簡單匹配
    const headerPatternSimple = /<header class="header">[\s\S]*?<\/header>/;
    
    const headerReplacement = `<!-- ============================================ -->
        <!-- 頂部導覽列 (動態渲染) -->
        <!-- ============================================ -->
        <div id="header-container"></div>`;
    
    if (headerPatternWithComment.test(content)) {
        content = content.replace(headerPatternWithComment, headerReplacement);
        changesMade.push('Header (含註解)');
    } else if (headerPatternSimple.test(content) && !content.includes('id="header-container"')) {
        content = content.replace(headerPatternSimple, '<div id="header-container"></div>');
        changesMade.push('Header (簡單)');
    }

    // ============================================
    // 2. 替換 Sidebar 區塊
    // ============================================
    // 匹配 <aside class="sidebar" id="sidebar">...</aside>（含註解）
    const sidebarPatternWithComment = /<!-- [=\-]+ -->\s*\n\s*<!-- 側邊欄選單 -->\s*\n\s*<!-- [=\-]+ -->\s*\n\s*<aside class="sidebar" id="sidebar">[\s\S]*?<\/aside>/;
    
    // 簡單匹配
    const sidebarPatternSimple = /<aside class="sidebar" id="sidebar">[\s\S]*?<\/aside>/;
    
    const sidebarReplacement = `<!-- ============================================ -->
        <!-- 側邊欄選單 (動態渲染) -->
        <!-- ============================================ -->
        <div id="sidebar-container"></div>`;
    
    if (sidebarPatternWithComment.test(content)) {
        content = content.replace(sidebarPatternWithComment, sidebarReplacement);
        changesMade.push('Sidebar (含註解)');
    } else if (sidebarPatternSimple.test(content)) {
        content = content.replace(sidebarPatternSimple, '<div id="sidebar-container"></div>');
        changesMade.push('Sidebar (簡單)');
    }

    // ============================================
    // 3. 確保 JS 載入順序正確
    // ============================================
    // 檢查是否有 menu-component.js
    if (!content.includes('menu-component.js')) {
        // 在 sidebar.js 之前插入 menu-component.js
        const sidebarJsPattern = /(<script src="js\/sidebar\.js"><\/script>)/;
        if (sidebarJsPattern.test(content)) {
            content = content.replace(
                sidebarJsPattern,
                '<script src="js/menu-component.js"></script>\n    $1'
            );
            changesMade.push('新增 menu-component.js');
        } else if (content.includes('</body>') && !content.includes('sidebar.js')) {
            // 如果沒有 sidebar.js，在 </body> 前插入完整 JS 區塊
            content = content.replace(
                '</body>',
                `    <script src="js/menu-component.js"></script>
    <script src="js/sidebar.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof initCRMLayout === 'function') {
                initCRMLayout();
            }
            if (typeof SidebarManager !== 'undefined') {
                new SidebarManager();
            }
        });
    </script>
</body>`
            );
            changesMade.push('新增完整 JS 區塊');
        }
    }

    // ============================================
    // 4. 更新初始化腳本
    // ============================================
    // 確保使用 initCRMLayout 或同時呼叫 renderHeader 和 renderSidebar
    if (content.includes("renderSidebar()") && !content.includes("renderHeader()")) {
        const oldInit = `if (typeof renderSidebar === 'function') {
                renderSidebar();
            }`;
        const newInit = `if (typeof initCRMLayout === 'function') {
                initCRMLayout();
            } else if (typeof renderSidebar === 'function') {
                if (typeof renderHeader === 'function') renderHeader();
                renderSidebar();
            }`;
        
        if (content.includes(oldInit)) {
            content = content.replace(oldInit, newInit);
            changesMade.push('更新初始化腳本');
        }
    }

    // ============================================
    // 5. 確保 SidebarManager 之前有 initCRMLayout
    // ============================================
    // 對於有 new SidebarManager() 但沒有 initCRMLayout 的頁面
    if (content.includes('new SidebarManager()') && !content.includes('initCRMLayout')) {
        // 在 new SidebarManager() 之前插入 initCRMLayout
        const sidebarManagerPattern = /(const sidebarManager = new SidebarManager\(\);|new SidebarManager\(\);)/;
        if (sidebarManagerPattern.test(content)) {
            content = content.replace(
                sidebarManagerPattern,
                `// 渲染共用元件
            if (typeof initCRMLayout === 'function') {
                initCRMLayout();
            }
            
            // 初始化側邊欄
            $1`
            );
            changesMade.push('新增 initCRMLayout 呼叫');
        }
    }

    // 只有在有變更時才寫入
    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf-8');
        return changesMade;
    }
    
    return [];
}

/**
 * 主程式
 */
function main() {
    console.log('='.repeat(60));
    console.log('陸府建設 CRM 系統 - 統一 Header 與 Sidebar 腳本');
    console.log('='.repeat(60));
    console.log();
    
    // 1. 建立備份
    const backupDir = createBackup(PROJECT_DIR);
    console.log();
    
    // 2. 取得檔案清單
    const htmlFiles = getHtmlFiles(PROJECT_DIR, EXCLUDED_FILES);
    console.log(`📋 找到 ${htmlFiles.length} 個 HTML 檔案需要處理`);
    console.log(`   排除 ${EXCLUDED_FILES.length} 個獨立頁面: ${EXCLUDED_FILES.join(', ')}`);
    console.log();
    
    // 3. 處理每個檔案
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const htmlFile of htmlFiles) {
        const filepath = path.join(PROJECT_DIR, htmlFile);
        try {
            const changes = processHtmlFile(filepath);
            if (changes.length > 0) {
                console.log(`✅ ${htmlFile}: ${changes.join(', ')}`);
                successCount++;
            } else {
                console.log(`⏭️  ${htmlFile}: 無需變更或已是最新格式`);
                skipCount++;
            }
        } catch (e) {
            console.log(`❌ ${htmlFile}: 錯誤 - ${e.message}`);
            errorCount++;
        }
    }
    
    // 4. 顯示結果
    console.log();
    console.log('='.repeat(60));
    console.log('執行結果');
    console.log('='.repeat(60));
    console.log(`✅ 成功更新: ${successCount} 個檔案`);
    console.log(`⏭️  無需變更: ${skipCount} 個檔案`);
    console.log(`❌ 處理失敗: ${errorCount} 個檔案`);
    console.log(`📦 備份位置: ${backupDir}`);
    console.log();
    
    if (errorCount > 0) {
        console.log('⚠️  有檔案處理失敗，請檢查錯誤訊息');
    } else {
        console.log('🎉 全部完成！請檢查頁面是否正常運作');
    }
}

main();
