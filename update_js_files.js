#!/usr/bin/env node
/**
 * ============================================
 * 陸府建設 CRM 系統 - 更新外部 JS 檔案腳本
 * ============================================
 * 目的：為所有外部 JS 檔案的 SidebarManager 初始化前加入 initCRMLayout
 * ============================================
 */

const fs = require('fs');
const path = require('path');

const JS_DIR = path.join(__dirname, 'js');

// 排除的檔案
const EXCLUDED_FILES = [
    'sidebar.js',
    'menu-component.js',
    'mock-data.js',
    'pagination.js',
    'modal.js',
    'site-event-mock-data.js',
    'green-performance.js',
    'green-quotation-confirm.js',
    'green-reservation-completion.js',
    'green-reservation-report.js',
    'site-event-my.js',
];

function processJsFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');
    const originalContent = content;
    const changesMade = [];

    // 檢查是否有 SidebarManager 但沒有 initCRMLayout
    if (content.includes('SidebarManager') && !content.includes('initCRMLayout')) {
        
        // 模式 1: const sidebarManager = new SidebarManager();
        const pattern1 = /(\s*)(const sidebarManager = new SidebarManager\(\);)/g;
        if (pattern1.test(content)) {
            content = content.replace(pattern1, `$1// 渲染共用元件 (Header + Sidebar)
$1if (typeof initCRMLayout === 'function') {
$1    initCRMLayout();
$1}
$1
$1$2`);
            changesMade.push('模式1');
        }

        // 模式 2: if (typeof SidebarManager !== 'undefined') { const sidebarManager = new SidebarManager(); }
        const pattern2 = /if \(typeof SidebarManager !== 'undefined'\) \{\s*\n\s*(const sidebarManager = new SidebarManager\(\);)\s*\n\s*\}/g;
        if (pattern2.test(content)) {
            content = content.replace(pattern2, `// 渲染共用元件 (Header + Sidebar)
    if (typeof initCRMLayout === 'function') {
        initCRMLayout();
    }
    
    // 初始化側邊欄
    if (typeof SidebarManager !== 'undefined') {
        $1
    }`);
            changesMade.push('模式2');
        }

        // 模式 3: new SidebarManager(); (直接呼叫)
        if (content.includes('new SidebarManager();') && !content.includes('initCRMLayout')) {
            content = content.replace(
                /([\s]*)(new SidebarManager\(\);)/,
                `$1// 渲染共用元件 (Header + Sidebar)
$1if (typeof initCRMLayout === 'function') {
$1    initCRMLayout();
$1}
$1
$1$2`
            );
            changesMade.push('模式3');
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf-8');
        return changesMade;
    }

    return [];
}

function main() {
    console.log('='.repeat(60));
    console.log('更新外部 JS 檔案 - 加入 initCRMLayout');
    console.log('='.repeat(60));
    console.log();

    const jsFiles = fs.readdirSync(JS_DIR)
        .filter(f => f.endsWith('.js') && !EXCLUDED_FILES.includes(f));

    console.log(`📋 找到 ${jsFiles.length} 個 JS 檔案需要檢查`);
    console.log();

    let successCount = 0;
    let skipCount = 0;

    for (const jsFile of jsFiles) {
        const filepath = path.join(JS_DIR, jsFile);
        try {
            const changes = processJsFile(filepath);
            if (changes.length > 0) {
                console.log(`✅ ${jsFile}: ${changes.join(', ')}`);
                successCount++;
            } else {
                skipCount++;
            }
        } catch (e) {
            console.log(`❌ ${jsFile}: ${e.message}`);
        }
    }

    console.log();
    console.log('='.repeat(60));
    console.log(`✅ 更新: ${successCount} 個檔案`);
    console.log(`⏭️  略過: ${skipCount} 個檔案`);
    console.log('='.repeat(60));
}

main();
