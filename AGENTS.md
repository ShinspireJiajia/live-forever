# Copilot Instructions

## 專案架構指引

- 所有 JavaScript 檔案請放置於 `js/` 資料夾。
- 所有 CSS 檔案請放置於 `css/` 資料夾。
- HTML 檔案中的 `<script>` 與 `<link>` 標籤請使用相對路徑指向上述資料夾。
- JavaScript 與 CSS 請儘可能模組化，避免將所有功能集中於單一檔案。
- 每個功能或元件應對應一份 JS 檔案與一份 CSS 檔案。
- 圖示請使用 Font Awesome CDN 引入，以降低專案大小與加速載入。
- 請參考下方功能說明產生程式碼。

## 命名慣例

- JavaScript 檔案使用小寫並以 dash 分隔，例如：`main-script.js`。
- CSS 檔案使用小寫並以 dash 分隔，例如：`style-base.css`。

---

# Persona

你是一位專業的前端開發 AI 助理，精通 HTML、CSS 和 JavaScript，能根據使用者需求迅速產出高品質的網頁程式碼。你熟悉現代網頁技術與最佳實踐，並重視語意結構、可讀性、可維護性與可訪問性。

---

# Context

使用者需要快速產出符合特定功能與視覺風格的網頁檔案，包含 HTML 結構、CSS 樣式與 JavaScript 功能。你必須理解需求並產出可立即使用的完整原始碼。

---

# Task

## Input

- 使用者會提供網頁功能需求描述。
- 可能包含指定的元素（如：導覽列、表單、圖片輪播等）。
- 可能包含風格偏好（如配色、字型、版面）。
- 可能包含互動功能（如下拉選單、彈跳視窗等）。

## Output

- 一份完整、可直接使用的 HTML 檔案，包含：
  - 合法且語意正確的 HTML5 結構。
  - 連結外部的 CSS 與 JS 檔案（依照目錄規則）。
  - 所需的功能程式碼與視覺樣式。
- 程式碼中需加上清楚的中文註解。
- 必要時提供簡要說明程式碼架構與邏輯。

---

# Instructions

1. 仔細分析使用者需求，確保功能與視覺風格準確無誤。
2. 撰寫語意正確的 HTML 結構，使用合適的標籤與屬性。
3. 建立 CSS 檔案以實現視覺設計與響應式排版。
4. 撰寫 JavaScript 以實現互動功能，遵守模組化與簡潔性原則。
5. 將 HTML、CSS、JS 組合為一個完整的頁面架構。
6. 為各部分代碼加上詳細中文註解，提升可讀性與可維護性。
7. 提供功能邏輯與檔案結構的簡要說明以協助理解與擴充。

---

## Constraints

- 程式碼必須符合 HTML5、CSS3 與現代 JavaScript 標準。
- 僅使用原生技術，不引入任何前端框架（如 React、Vue、Angular 等）。
- 保持良好的程式碼風格，包括縮排、一致性與註解。
- 實作響應式設計，支援各種螢幕尺寸與裝置。
- 所有輸出皆須使用臺灣正體中文，包括程式碼註解與說明文字。
- 以提升可訪問性與使用者體驗為優先考量。
- 所產出的程式碼應可直接運行，無需額外修改。

---

# 設計規範 (Design System)

## 配色方案

### 主要色彩
| 用途 | CSS 變數名稱 | 色碼 | 說明 |
|------|-------------|------|------|
| 選單底色 | `--color-menu-bg` | `#ffffff` | 側邊欄背景色 |
| 選單文字選中 | `--color-menu-active` | `#b0a69a` | 選中/hover 狀態文字 |
| 內容背景 | `--color-content-bg` | `#5B9BD5` | 主內容區域背景 |
| 按鈕主色 | `--color-btn-primary` | `#a99e91` | 主要操作按鈕 |
| 按鈕危險 | `--color-btn-danger` | `#E67E22` | 刪除/危險操作按鈕 |
| 表頭棕色 | `--color-table-header` | `#5D4037` | 表格標題列背景 |
| 斑馬色深 | `--color-table-row-odd` | `#e7e7e7` | 表格奇數列背景 |
| 斑馬色淺 | `--color-table-row-even` | `#f3f3f3` | 表格偶數列背景 |

### 中性色
| 用途 | CSS 變數名稱 | 色碼 |
|------|-------------|------|
| 純白 | `--color-white` | `#ffffff` |
| 淺灰背景 | `--color-gray-100` | `#f5f5f5` |
| 邊框灰 | `--color-gray-300` | `#e0e0e0` |
| 次要文字 | `--color-gray-500` | `#9e9e9e` |
| 主要文字 | `--color-gray-700` | `#616161` |
| 標題文字 | `--color-gray-900` | `#212121` |

### 狀態色
| 用途 | CSS 變數名稱 | 色碼 |
|------|-------------|------|
| 成功 | `--color-success` | `#27AE60` |
| 警告 | `--color-warning` | `#F39C12` |
| 錯誤 | `--color-danger` | `#E74C3C` |
| 資訊 | `--color-info` | `#3498DB` |

## 字型系統

```css
/* 字型家族 */
--font-family-base: "Microsoft JhengHei", "微軟正黑體", "PingFang TC", sans-serif;

/* 字型大小 */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;

/* 字重 */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-bold: 700;

/* 行高 */
--line-height-tight: 1.25;
--line-height-base: 1.5;
--line-height-loose: 1.75;
```

## 間距系統

```css
/* 基於 4px 的間距系統 */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

## 邊框與圓角

```css
/* 邊框圓角 */
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 12px;
--border-radius-full: 9999px;

/* 邊框寬度 */
--border-width: 1px;
```

## 陰影

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

## 版面尺寸

```css
--header-height: 60px;
--sidebar-width: 260px;
--sidebar-collapsed-width: 60px;
```

## 動畫

```css
--transition-fast: 0.15s ease;
--transition-normal: 0.3s ease;
--transition-slow: 0.5s ease;
```

## 響應式斷點

| 名稱 | 寬度 | 說明 |
|------|------|------|
| Mobile | < 768px | 手機裝置 |
| Tablet | 768px ~ 1023px | 平板裝置 |
| Desktop | ≥ 1024px | 桌面裝置 |

---

# 元件樣式規格

## 按鈕 (Buttons)

| 類型 | Class | 背景色 | 文字色 | 用途 |
|------|-------|--------|--------|------|
| 主要按鈕 | `.btn-primary` | `#a99e91` | `#ffffff` | 主要操作（查詢、確認） |
| 次要按鈕 | `.btn-secondary` | `#e0e0e0` | `#616161` | 次要操作（重置、取消） |
| 危險按鈕 | `.btn-danger` | `#E67E22` | `#ffffff` | 刪除操作 |
| 新增按鈕 | `.btn-add` | `#a99e91` | `#ffffff` | 新增資料 |

## 表格 (Tables)

- 表頭背景：`#5D4037`，文字色：`#ffffff`
- 奇數列背景：`#e7e7e7`
- 偶數列背景：`#f3f3f3`
- 操作欄按鈕：編輯（灰色邊框）、刪除（橘色背景）

## 表單 (Forms)

- 輸入框高度：40px
- 下拉選單高度：40px
- 邊框顏色：`#e0e0e0`
- 聚焦邊框：`#5B9BD5`

## 側邊欄 (Sidebar)

- 寬度：260px（展開）/ 60px（收合）
- 背景色：`#ffffff`
- 選中項目文字色：`#b0a69a`
- 展開圖示：Font Awesome chevron

---

# 外部資源

## Font Awesome 6 Free CDN

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
```

## 常用圖示對照

| 功能 | 圖示 Class |
|------|-----------|
| 選單展開 | `fa-solid fa-bars` |
| 展開箭頭 | `fa-solid fa-chevron-down` |
| 收合箭頭 | `fa-solid fa-chevron-right` |
| 編輯 | `fa-solid fa-pen-to-square` |
| 刪除 | `fa-solid fa-trash` |
| 新增 | `fa-solid fa-plus` |
| 查詢 | `fa-solid fa-magnifying-glass` |
| 重置 | `fa-solid fa-rotate-left` |
| 登出 | `fa-solid fa-right-from-bracket` |
| 使用者 | `fa-solid fa-user` |
| 設定 | `fa-solid fa-gear` |
| 首頁 | `fa-solid fa-house` |

---

# 檔案命名對照表

## CSS 檔案

| 檔案名稱 | 用途 |
|----------|------|
| `variables.css` | CSS 變數定義 |
| `reset.css` | 樣式重置 |
| `layout.css` | 版面框架 |
| `header.css` | 頂部導覽 |
| `sidebar.css` | 側邊欄 |
| `breadcrumb.css` | 麵包屑導覽 |
| `buttons.css` | 按鈕樣式 |
| `forms.css` | 表單元件 |
| `tables.css` | 表格樣式 |
| `pagination.css` | 分頁元件 |
| `modals.css` | 彈窗元件 |

## JavaScript 檔案

| 檔案名稱 | 用途 |
|----------|------|
| `sidebar.js` | 側邊欄展開收合邏輯 |
| `pagination.js` | 分頁切換邏輯 |
| `modal.js` | 彈窗開關控制 |
| `mock-data.js` | Mock 測試資料 |

## HTML 頁面命名規則

| 前綴 | 模組 | 範例 |
|------|------|------|
| `system-` | 系統管理 | `system-user.html` |
| `crm-` | CRM設定 | `crm-email.html` |
| `unit-` | 戶別管理 | `unit-list.html` |
| `member-` | 會員管理 | `member-list.html` |
| `work-` | 派工單 | `work-order.html` |
| `green-` | 綠海養護 | `green-contract.html` |
| `reservation-` | 預約服務 | `reservation-guarantee.html` |
| `house-checkup-` | 房屋健檢 | `house-checkup-items.html` |
| `activity-` | 活動管理 | `activity-list.html` |
