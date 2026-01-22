#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================
陸府建設 CRM 系統 - 統一 Header 與 Sidebar 腳本
============================================
目的：將所有 HTML 頁面的 Header 與 Sidebar 改為動態渲染方式
執行前會建立備份資料夾確保可回滾
============================================
"""

import os
import re
import shutil
from datetime import datetime

# ============================================
# 設定區
# ============================================

# 專案根目錄
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

# 排除的獨立頁面（沒有標準 sidebar layout）
EXCLUDED_FILES = [
    'green-performance.html',
    'green-quotation-confirm.html',
    'green-reservation-completion.html',
    'green-reservation-report.html',
    'reservation-handover-survey-fill.html',
    'foundation-receipt-edit.html',
    'site-event-my.html',
]

# ============================================
# 工具函式
# ============================================

def create_backup(project_dir):
    """建立備份資料夾"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_dir = os.path.join(project_dir, f'backup_{timestamp}')
    
    print(f"📦 建立備份資料夾: {backup_dir}")
    os.makedirs(backup_dir, exist_ok=True)
    
    # 只備份 HTML 檔案
    html_files = [f for f in os.listdir(project_dir) if f.endswith('.html')]
    for html_file in html_files:
        src = os.path.join(project_dir, html_file)
        dst = os.path.join(backup_dir, html_file)
        shutil.copy2(src, dst)
    
    print(f"✅ 已備份 {len(html_files)} 個 HTML 檔案")
    return backup_dir


def get_html_files(project_dir, excluded_files):
    """取得需要處理的 HTML 檔案清單"""
    html_files = []
    for f in os.listdir(project_dir):
        if f.endswith('.html') and f not in excluded_files:
            html_files.append(f)
    return sorted(html_files)


def process_html_file(filepath):
    """處理單一 HTML 檔案"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes_made = []
    
    # ============================================
    # 1. 替換 Header 區塊
    # ============================================
    # 匹配 <header class="header">...</header>
    header_pattern = re.compile(
        r'<!-- [=\-]+ -->\s*\n\s*<!-- 頂部導覽列 -->\s*\n\s*<!-- [=\-]+ -->\s*\n\s*<header class="header">.*?</header>',
        re.DOTALL
    )
    
    # 也匹配沒有註解的 header
    header_pattern_simple = re.compile(
        r'<header class="header">.*?</header>',
        re.DOTALL
    )
    
    header_replacement = '''<!-- ============================================ -->
        <!-- 頂部導覽列 (動態渲染) -->
        <!-- ============================================ -->
        <div id="header-container"></div>'''
    
    if header_pattern.search(content):
        content = header_pattern.sub(header_replacement, content)
        changes_made.append('Header (含註解)')
    elif header_pattern_simple.search(content):
        # 先檢查是否已經是動態渲染
        if 'id="header-container"' not in content:
            content = header_pattern_simple.sub('<div id="header-container"></div>', content)
            changes_made.append('Header (簡單)')
    
    # ============================================
    # 2. 替換 Sidebar 區塊
    # ============================================
    # 匹配 <aside class="sidebar" id="sidebar">...</aside>
    sidebar_pattern = re.compile(
        r'<!-- [=\-]+ -->\s*\n\s*<!-- 側邊欄選單 -->\s*\n\s*<!-- [=\-]+ -->\s*\n\s*<aside class="sidebar" id="sidebar">.*?</aside>',
        re.DOTALL
    )
    
    sidebar_pattern_simple = re.compile(
        r'<aside class="sidebar" id="sidebar">.*?</aside>',
        re.DOTALL
    )
    
    sidebar_replacement = '''<!-- ============================================ -->
        <!-- 側邊欄選單 (動態渲染) -->
        <!-- ============================================ -->
        <div id="sidebar-container"></div>'''
    
    if sidebar_pattern.search(content):
        content = sidebar_pattern.sub(sidebar_replacement, content)
        changes_made.append('Sidebar (含註解)')
    elif sidebar_pattern_simple.search(content):
        # 先檢查是否已經是動態渲染
        if 'id="sidebar-container"' not in content or '<aside class="sidebar"' in content:
            content = sidebar_pattern_simple.sub('<div id="sidebar-container"></div>', content)
            changes_made.append('Sidebar (簡單)')
    
    # ============================================
    # 3. 確保 JS 載入順序正確
    # ============================================
    # 檢查是否有 menu-component.js
    if 'menu-component.js' not in content:
        # 在 sidebar.js 之前插入 menu-component.js
        sidebar_js_pattern = re.compile(r'(<script src="js/sidebar\.js"></script>)')
        if sidebar_js_pattern.search(content):
            content = sidebar_js_pattern.sub(
                '<script src="js/menu-component.js"></script>\n    \\1',
                content
            )
            changes_made.append('新增 menu-component.js')
        else:
            # 如果沒有 sidebar.js，在 </body> 前插入
            if '</body>' in content:
                content = content.replace(
                    '</body>',
                    '''    <script src="js/menu-component.js"></script>
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
</body>'''
                )
                changes_made.append('新增完整 JS 區塊')
    
    # ============================================
    # 4. 更新初始化腳本
    # ============================================
    # 確保使用 initCRMLayout 或同時呼叫 renderHeader 和 renderSidebar
    if 'renderSidebar()' in content and 'renderHeader()' not in content:
        # 舊版只有 renderSidebar，需要更新為同時呼叫兩者
        content = content.replace(
            "if (typeof renderSidebar === 'function') {\n                renderSidebar();\n            }",
            """if (typeof initCRMLayout === 'function') {
                initCRMLayout();
            } else if (typeof renderSidebar === 'function') {
                if (typeof renderHeader === 'function') renderHeader();
                renderSidebar();
            }"""
        )
        changes_made.append('更新初始化腳本')
    
    # 只有在有變更時才寫入
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return changes_made
    
    return []


def main():
    """主程式"""
    print("=" * 60)
    print("陸府建設 CRM 系統 - 統一 Header 與 Sidebar 腳本")
    print("=" * 60)
    print()
    
    # 1. 建立備份
    backup_dir = create_backup(PROJECT_DIR)
    print()
    
    # 2. 取得檔案清單
    html_files = get_html_files(PROJECT_DIR, EXCLUDED_FILES)
    print(f"📋 找到 {len(html_files)} 個 HTML 檔案需要處理")
    print(f"   排除 {len(EXCLUDED_FILES)} 個獨立頁面: {', '.join(EXCLUDED_FILES)}")
    print()
    
    # 3. 處理每個檔案
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for html_file in html_files:
        filepath = os.path.join(PROJECT_DIR, html_file)
        try:
            changes = process_html_file(filepath)
            if changes:
                print(f"✅ {html_file}: {', '.join(changes)}")
                success_count += 1
            else:
                print(f"⏭️  {html_file}: 無需變更或已是最新格式")
                skip_count += 1
        except Exception as e:
            print(f"❌ {html_file}: 錯誤 - {str(e)}")
            error_count += 1
    
    # 4. 顯示結果
    print()
    print("=" * 60)
    print("執行結果")
    print("=" * 60)
    print(f"✅ 成功更新: {success_count} 個檔案")
    print(f"⏭️  無需變更: {skip_count} 個檔案")
    print(f"❌ 處理失敗: {error_count} 個檔案")
    print(f"📦 備份位置: {backup_dir}")
    print()
    
    if error_count > 0:
        print("⚠️  有檔案處理失敗，請檢查錯誤訊息")
    else:
        print("🎉 全部完成！請檢查頁面是否正常運作")


if __name__ == '__main__':
    main()
