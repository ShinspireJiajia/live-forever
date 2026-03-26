/* ============================================
   森林聚落列表頁面互動邏輯
   根據 Figma 設計稿 (node-id: 1:4391)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* --- DOM 元素取得 --- */
  var btnBack = document.getElementById('btnBack');
  var btnHome = document.getElementById('btnHome');
  var btnSearch = document.getElementById('btnSearch');
  var searchInput = document.getElementById('searchInput');
  var filterTabs = document.querySelectorAll('.filter-tab');
  var eventCards = document.querySelectorAll('.event-card');
  var eventList = document.querySelector('.event-list:not(.registered-list)');
  var registeredList = document.getElementById('registeredList');
  var regCards = document.querySelectorAll('.reg-card');

  /* --- 返回按鈕 --- */
  if (btnBack) {
    btnBack.addEventListener('click', function () {
      window.history.back();
    });
  }

  /* --- 首頁按鈕 --- */
  if (btnHome) {
    btnHome.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'crm-index.html';
    });
  }

  /* --- URL 參數自動切換頁籤 --- */
  var urlParams = new URLSearchParams(window.location.search);
  var initTab = urlParams.get('tab');
  if (initTab === 'registered') {
    // 自動切換到「我已報名」頁籤
    filterTabs.forEach(function (t) {
      t.classList.remove('active');
      if (t.getAttribute('data-filter') === 'registered') {
        t.classList.add('active');
      }
    });
    if (eventList) eventList.style.display = 'none';
    if (registeredList) registeredList.style.display = '';
  }

  /* --- 篩選標籤切換 --- */
  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      // 移除所有標籤的 active 狀態
      filterTabs.forEach(function (t) {
        t.classList.remove('active');
      });
      // 啟用目前點擊的標籤
      tab.classList.add('active');

      // 取得篩選類型
      var filterType = tab.getAttribute('data-filter');

      if (filterType === 'all') {
        // 顯示「所有活動」列表，隱藏「我已報名」列表
        if (eventList) eventList.style.display = '';
        if (registeredList) registeredList.style.display = 'none';
        // 恢復所有活動卡片
        eventCards.forEach(function (card) {
          card.style.display = '';
        });
      } else if (filterType === 'registered') {
        // 隱藏「所有活動」列表，顯示「我已報名」列表
        if (eventList) eventList.style.display = 'none';
        if (registeredList) registeredList.style.display = '';
      }

      // 清空搜尋框
      if (searchInput) searchInput.value = '';
    });
  });

  /* --- 搜尋功能 --- */
  if (btnSearch) {
    btnSearch.addEventListener('click', function () {
      performSearch();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }

  /**
   * 執行搜尋邏輯
   * 根據輸入的關鍵字篩選活動卡片（同時適用「所有活動」與「我已報名」）
   */
  function performSearch() {
    var keyword = searchInput.value.trim().toLowerCase();

    // 判斷目前顯示的是哪個列表
    var activeFilter = document.querySelector('.filter-tab.active');
    var isRegistered = activeFilter && activeFilter.getAttribute('data-filter') === 'registered';

    if (isRegistered) {
      // 搜尋「我已報名」的卡片
      regCards.forEach(function (card) {
        if (!keyword) {
          card.style.display = '';
          return;
        }
        var title = card.querySelector('.reg-card-title');
        var details = card.querySelectorAll('.detail-row span');
        var cardText = '';
        if (title) cardText += title.textContent.toLowerCase();
        details.forEach(function (span) {
          cardText += span.textContent.toLowerCase();
        });
        card.style.display = cardText.includes(keyword) ? '' : 'none';
      });
    } else {
      // 搜尋「所有活動」的卡片
      eventCards.forEach(function (card) {
        if (!keyword) {
          card.style.display = '';
          return;
        }
        var title = card.querySelector('.event-title');
        var details = card.querySelectorAll('.detail-row span');
        var cardText = '';
        if (title) cardText += title.textContent.toLowerCase();
        details.forEach(function (span) {
          cardText += span.textContent.toLowerCase();
        });
        card.style.display = cardText.includes(keyword) ? '' : 'none';
      });
    }
  }

  /* --- 活動卡片點擊事件 --- */
  eventCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var eventId = card.getAttribute('data-event-id');
      if (eventId) {
        // 導向詳情頁，帶入活動 ID
        window.location.href = 'crm-forest-detail.html?id=' + eventId;
      }
    });

    // 所有卡片增加手型游標
    card.style.cursor = 'pointer';
  });

});
