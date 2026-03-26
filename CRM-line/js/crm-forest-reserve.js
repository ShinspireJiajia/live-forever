/* ============================================
   森林聚落報名預約頁面互動邏輯
   根據 Figma 設計稿
   付費版 node-id: 1:4606
   免費版 node-id: 197:1813
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* --- Mock 活動資料 --- */
  var eventData = {
    'event-forest': {
      image: 'assets/event-image-forest.png',
      title: '打開植深館｜Into the Forest Living',
      date: '2025/12/05 - 2026/03/31',
      location: '陸府植深館1',
      unitPrice: 600,
      priceLabel: '＄600元 / 人',
      isFree: false,
      maxCount: 2,
      notice: '一戶僅可報名 2 位'
    },
    'event-nature': {
      image: 'assets/event-image-nature.png',
      title: '人．造自然',
      date: '2025/12/05 - 2026/03/31',
      location: '陸府植深館1',
      unitPrice: 0,
      priceLabel: '免費 / 人',
      isFree: true,
      maxCount: 2,
      notice: '一戶僅可報名 2 位'
    },
    'event-nature-free': {
      image: 'assets/event-image-nature.png',
      title: '人．造自然',
      date: '2025/12/05 - 2026/03/31',
      location: '陸府植深館1',
      unitPrice: 0,
      priceLabel: '免費 / 人',
      isFree: true,
      maxCount: 2,
      notice: '一戶僅可報名 2 位'
    }
  };

  /* --- DOM 元素取得 --- */
  var btnBack = document.getElementById('btnBack');
  var btnHome = document.getElementById('btnHome');
  var btnSubmit = document.getElementById('btnSubmit');
  var reserveImage = document.getElementById('reserveImage');
  var reserveTitle = document.getElementById('reserveTitle');
  var reserveDate = document.getElementById('reserveDate');
  var reserveLocation = document.getElementById('reserveLocation');
  var reservePrice = document.getElementById('reservePrice');
  var reserveNotice = document.getElementById('reserveNotice');
  var reserveCount = document.getElementById('reserveCount');
  var receiptGroup = document.getElementById('receiptGroup');
  var summaryUnitPrice = document.getElementById('summaryUnitPrice');
  var summaryTotalRow = document.getElementById('summaryTotalRow');
  var summaryTotal = document.getElementById('summaryTotal');

  /* --- 取得 URL 參數中的活動 ID --- */
  var urlParams = new URLSearchParams(window.location.search);
  var eventId = urlParams.get('id') || 'event-forest';

  /* --- 根據活動 ID 載入資料 --- */
  var currentEvent = eventData[eventId];
  if (currentEvent) {
    renderReservation(currentEvent);
  }

  /**
   * 根據活動資料渲染預約頁面
   * @param {Object} event - 活動資料物件
   */
  function renderReservation(event) {
    // 設定活動圖片
    if (reserveImage) {
      reserveImage.src = event.image;
      reserveImage.alt = event.title;
    }

    // 設定活動名稱
    if (reserveTitle) {
      reserveTitle.textContent = event.title;
    }

    // 設定日期
    if (reserveDate) {
      reserveDate.textContent = event.date;
    }

    // 設定地點
    if (reserveLocation) {
      reserveLocation.textContent = event.location;
    }

    // 設定費用
    if (reservePrice) {
      reservePrice.textContent = event.priceLabel;
    }

    // 設定限制提示
    if (reserveNotice) {
      reserveNotice.textContent = event.notice;
    }

    // 設定報名人數下拉選單選項
    if (reserveCount) {
      reserveCount.innerHTML = '';
      for (var i = 1; i <= event.maxCount; i++) {
        var option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === event.maxCount) {
          option.selected = true;
        }
        reserveCount.appendChild(option);
      }
    }

    // 依據是否免費，控制收據選項顯示
    if (receiptGroup) {
      receiptGroup.style.display = event.isFree ? 'none' : '';
    }

    // 設定費用摘要
    if (event.isFree) {
      // 免費：僅顯示「報名費用 - 免費」
      if (summaryUnitPrice) {
        summaryUnitPrice.textContent = '免費';
      }
      if (summaryTotalRow) {
        summaryTotalRow.style.display = 'none';
      }
    } else {
      // 付費：顯示單價與共計
      if (summaryUnitPrice) {
        summaryUnitPrice.textContent = event.priceLabel;
      }
      if (summaryTotalRow) {
        summaryTotalRow.style.display = '';
      }
      updateTotal(event);
    }
  }

  /**
   * 更新付費活動的共計金額
   * @param {Object} event - 活動資料物件
   */
  function updateTotal(event) {
    if (!reserveCount || !summaryTotal || event.isFree) return;
    var count = parseInt(reserveCount.value, 10) || 1;
    var total = event.unitPrice * count;
    summaryTotal.textContent = '＄' + total + ' 元';
  }

  /* --- 報名人數變更 → 重新計算共計 --- */
  if (reserveCount) {
    reserveCount.addEventListener('change', function () {
      if (currentEvent && !currentEvent.isFree) {
        updateTotal(currentEvent);
      }
    });
  }

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

  /* --- 確認提交預約按鈕 --- */
  if (btnSubmit) {
    btnSubmit.addEventListener('click', function () {
      if (!currentEvent) return;

      var count = parseInt(reserveCount.value, 10) || 1;
      var receiptValue = '';

      // 取得收據選項（僅付費活動）
      if (!currentEvent.isFree) {
        var checkedRadio = document.querySelector('input[name="receipt"]:checked');
        receiptValue = checkedRadio ? checkedRadio.value : 'no';
      }

      // 組成預約資料（此處僅做 console 輸出，實際需對接 API）
      var reservationData = {
        eventId: eventId,
        title: currentEvent.title,
        count: count,
        isFree: currentEvent.isFree,
        total: currentEvent.isFree ? 0 : currentEvent.unitPrice * count,
        receipt: receiptValue
      };

      // eslint-disable-next-line no-console
      console.log('預約資料：', reservationData);

      // 付費活動：導向線上支付頁面選擇付款方式
      if (!currentEvent.isFree) {
        window.location.href = 'crm-forest-payment.html?id=' + encodeURIComponent(eventId);
        return;
      }

      // 免費活動：直接提交完成
      alert('已提交預約！');
    });
  }

});
