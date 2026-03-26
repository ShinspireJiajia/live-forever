/* ============================================
   對保服務頁面互動邏輯
   根據 Figma 設計稿 (node-id: 246:954)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- 服務狀態設定 ---
  // serviceOpen: 服務是否已開放（true = 已開放可預約，false = 尚未開放）
  var serviceOpen = false;

  // --- DOM 元素 ---
  var stateLocked = document.getElementById('stateLocked');
  var stateEmpty = document.getElementById('stateEmpty');
  var stateHasRecords = document.getElementById('stateHasRecords');
  var cardList = stateHasRecords ? stateHasRecords.querySelector('.card-list') : null;

  // --- 從 localStorage 載入新建立的卡片 ---
  var pendingCards = JSON.parse(localStorage.getItem('crmGuaranteeCards') || '[]');
  if (pendingCards.length > 0 && cardList) {
    pendingCards.forEach(function (card) {
      var cardHtml = '<div class="service-card" data-sort-date="' + card.sortDate + '">' +
        '<div class="card-header">' +
          '<span class="status-badge status-pending">' + card.status + '</span>' +
          '<span class="card-number">' + card.caseId + '</span>' +
        '</div>' +
        '<div class="card-info">' +
          '<p><span class="label">建　　案</span>｜' + card.project + ' (' + card.unit + ')</p>' +
          '<p><span class="label">預約日期</span>｜' + card.date + ' ' + card.time + '</p>' +
        '</div>' +
        '<div class="card-actions">' +
          '<button class="btn btn-disabled" disabled>檢視紀錄</button>' +
          '<button class="btn btn-gold" data-action="contact">聯絡專員</button>' +
        '</div>' +
      '</div>';
      cardList.insertAdjacentHTML('beforeend', cardHtml);
    });
    // 清除已讀取的暫存資料
    localStorage.removeItem('crmGuaranteeCards');
  }

  // --- 計算卡片數量以判斷是否有紀錄 ---
  var totalCards = cardList ? cardList.querySelectorAll('.service-card').length : 0;

  // --- 根據狀態切換顯示 ---
  if (totalCards > 0) {
    // 狀態三：有紀錄 → 顯示卡片列表
    stateHasRecords.style.display = 'flex';
  } else if (serviceOpen) {
    // 狀態二：已開放但無紀錄 → 顯示空狀態 + 預約按鈕
    stateEmpty.style.display = 'flex';
  } else {
    // 狀態一：尚未開放且無紀錄 → 顯示鎖定提示
    stateLocked.style.display = 'block';
  }

  // --- 依預約日期排序卡片（近到遠） ---
  if (cardList && totalCards > 0) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('.service-card'));
    cards.forEach(function (card) {
      if (!card.getAttribute('data-sort-date')) {
        var dateP = card.querySelector('.card-info p:last-child');
        if (dateP) {
          var match = dateP.textContent.match(/(\d{4}\/\d{2}\/\d{2})\s*(\d{2}:\d{2})/);
          if (match) {
            card.setAttribute('data-sort-date', match[1].replace(/\//g, '-') + ' ' + match[2]);
          }
        }
      }
    });
    cards.sort(function (a, b) {
      var dateA = a.getAttribute('data-sort-date') || '';
      var dateB = b.getAttribute('data-sort-date') || '';
      return dateB.localeCompare(dateA);
    });
    cards.forEach(function (card) {
      cardList.appendChild(card);
    });
  }

  // --- 返回按鈕 ---
  var btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', function () {
      if (window.history.length > 1) {
        window.history.back();
      }
    });
  }

  // --- 預約對保服務按鈕（狀態二：空狀態） ---
  var btnReserveEmpty = document.getElementById('btnReserveEmpty');
  if (btnReserveEmpty) {
    btnReserveEmpty.addEventListener('click', function () {
      window.location.href = 'crm-guarantee-reserve.html';
    });
  }

  // --- 預約對保服務按鈕（狀態三：有紀錄） ---
  var btnReserve = document.getElementById('btnReserve');
  if (btnReserve) {
    btnReserve.addEventListener('click', function () {
      window.location.href = 'crm-guarantee-reserve.html';
    });
  }

  // --- 首頁按鈕 ---
  var btnHome = document.getElementById('btnHome');
  if (btnHome) {
    btnHome.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'crm-index.html';
    });
  }

  // --- 卡片操作按鈕事件委派 ---
  if (cardList) {
    cardList.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;

      var action = btn.getAttribute('data-action');
      var card = btn.closest('.service-card');
      var cardNumber = card ? card.querySelector('.card-number') : null;
      var caseId = cardNumber ? cardNumber.textContent.trim() : '';

      switch (action) {
        case 'contact':
          console.log('聯絡專員，案件編號：' + caseId);
          break;

        case 'view-record':
          var cardStatus = card ? (card.getAttribute('data-status') || '預約中') : '預約中';
          window.location.href = 'crm-guarantee-record.html?status=' + encodeURIComponent(cardStatus);
          break;

        case 'survey':
          console.log('滿意度問卷，案件編號：' + caseId);
          break;
      }
    });
  }

});
