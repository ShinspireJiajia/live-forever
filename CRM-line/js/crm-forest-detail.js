/* ============================================
   森林聚落活動內頁互動邏輯
   根據 Figma 設計稿
   可預約(付費) node-id: 1:4541
   已額滿(免費) node-id: 1:4575
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* --- Mock 活動資料 --- */
  var eventData = {
    'event-forest': {
      status: 'available',
      image: 'assets/event-image-forest.png',
      title: '打開植深館｜Into the Forest Living',
      date: '2025/12/05 - 2026/03/31',
      location: '陸府植深館1',
      price: '＄600元 / 人',
      description: [
        '沿著深邃的入口廊道前行，在步移景異間經歷中國林園式設計的「一阻、二引、三通」空間遞進。流動的風輕拂肌膚，光線穿透樹梢在地面交織成毯，長廊盡頭迎來的是由玻璃帷幕包圍的開闊視野。',
        '',
        '整座建築宛如一座日晷，紀錄著日光的東升西落，捕捉時間的維度。望向窗外，那面銹蝕金屬牆上斑駁翹曲的鐵繡，如同東方繪畫的肌理，靜靜展現歲月積累的詩意。',
        '',
        '空間，是生活流動之地。在這裡，物件不僅承載了功能與美學，更包容了多重想像。我們邀請您走進植深館，在四季更迭中找一個角落落座，打開對生命的感知，讓藝術與自然流動成你我的日常生活。'
      ]
    },
    'event-nature': {
      status: 'full',
      image: 'assets/event-image-nature.png',
      title: '人．造自然',
      date: '2025/04/19 - 2025/08/31',
      location: '陸府植深館1',
      price: '免費',
      description: [
        '如果我們能夠理解林木生長、土石交疊、河匯成海是無需詮釋的自然法則，那麼當這些法則在人的感受裡起到移情（Empathy）作用時，它們就具備了文化性的意涵。在我們理解世界的經驗裡，自然除了自身的客觀存在外，更是從人類視角再造的「第二自然」。',
        '',
        '藝術在當代語境中所擔負的質疑與批判角色，讓人介入自然的合法性被重新評估；創作者重新省思人與自然的關係，並且用個人性的觀點再造了自然。這些觀點不僅僅侷限於環境生態的領域，而是更大範圍牽涉到了文化的、社會的與造型美學的範疇，說明了「自然」被藝術賦予身體之後的多樣性。'
      ]
    },
    'event-nature-free': {
      status: 'available',
      image: 'assets/event-image-nature.png',
      title: '人．造自然',
      date: '2025/12/05 - 2026/03/31',
      location: '陸府植深館1',
      price: '免費',
      description: [
        '如果我們能夠理解林木生長、土石交疊、河匯成海是無需詮釋的自然法則，那麼當這些法則在人的感受裡起到移情（Empathy）作用時，它們就具備了文化性的意涵。在我們理解世界的經驗裡，自然除了自身的客觀存在外，更是從人類視角再造的「第二自然」。',
        '',
        '藝術在當代語境中所擔負的質疑與批判角色，讓人介入自然的合法性被重新評估；創作者重新省思人與自然的關係，並且用個人性的觀點再造了自然。這些觀點不僅僅侷限於環境生態的領域，而是更大範圍牽涉到了文化的、社會的與造型美學的範疇，說明了「自然」被藝術賦予身體之後的多樣性。'
      ]
    }
  };

  /* --- DOM 元素取得 --- */
  var btnBack = document.getElementById('btnBack');
  var btnHome = document.getElementById('btnHome');
  var btnAction = document.getElementById('btnAction');
  var detailBannerImg = document.querySelector('#detailBannerImg img');
  var detailTitle = document.getElementById('detailTitle');
  var detailDate = document.getElementById('detailDate');
  var detailLocation = document.getElementById('detailLocation');
  var detailPrice = document.getElementById('detailPrice');
  var detailDescription = document.getElementById('detailDescription');

  /* --- 取得 URL 參數中的活動 ID --- */
  var urlParams = new URLSearchParams(window.location.search);
  var eventId = urlParams.get('id') || 'event-forest';

  /* --- 根據活動 ID 載入資料 --- */
  var currentEvent = eventData[eventId];
  if (currentEvent) {
    renderEvent(currentEvent);
  }

  /**
   * 根據活動資料渲染頁面內容
   * @param {Object} event - 活動資料物件
   */
  function renderEvent(event) {
    // 設定活動圖片
    if (detailBannerImg) {
      detailBannerImg.src = event.image;
      detailBannerImg.alt = event.title;
    }

    // 設定活動名稱
    if (detailTitle) {
      detailTitle.textContent = event.title;
    }

    // 設定日期
    if (detailDate) {
      detailDate.textContent = event.date;
    }

    // 設定地點
    if (detailLocation) {
      detailLocation.textContent = event.location;
    }

    // 設定費用
    if (detailPrice) {
      detailPrice.textContent = event.price;
    }

    // 設定描述內容
    if (detailDescription && event.description) {
      detailDescription.innerHTML = '';
      event.description.forEach(function (paragraph) {
        var p = document.createElement('p');
        if (paragraph === '') {
          p.innerHTML = '&nbsp;';
        } else {
          p.textContent = paragraph;
        }
        detailDescription.appendChild(p);
      });
    }

    // 設定底部按鈕狀態
    if (btnAction) {
      if (event.status === 'available') {
        btnAction.textContent = '我要預約';
        btnAction.className = 'btn-action btn-action-available';
        btnAction.disabled = false;
      } else if (event.status === 'full') {
        btnAction.textContent = '已額滿';
        btnAction.className = 'btn-action btn-action-full';
        btnAction.disabled = true;
      }
    }
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

  /* --- 預約按鈕點擊事件 --- */
  if (btnAction) {
    btnAction.addEventListener('click', function () {
      if (currentEvent && currentEvent.status === 'available') {
        // 導向預約表單頁
        window.location.href = 'crm-forest-reserve.html?id=' + eventId;
      }
    });
  }

});
