/* ============================================
   森林聚落款項明細結果頁面互動邏輯
   根據 Figma 設計稿
   付款完成 node-id: 1:4722
   付款失敗 node-id: 1:4700
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* --- DOM 元素取得 --- */
  var btnBack = document.getElementById('btnBack');
  var btnConfirm = document.getElementById('btnConfirm');
  var resultIcon = document.getElementById('resultIcon');
  var resultTitle = document.getElementById('resultTitle');
  var resultMessage = document.getElementById('resultMessage');

  /* --- 從 URL 取得參數 --- */
  var urlParams = new URLSearchParams(window.location.search);
  var status = urlParams.get('status') || 'success'; // success | fail
  var eventId = urlParams.get('id') || '';

  /* --- 根據交易狀態渲染頁面 --- */
  if (status === 'fail') {
    // 付款失敗
    if (resultIcon) {
      resultIcon.src = 'assets/icon-payment-fail.svg';
      resultIcon.alt = '付款失敗';
    }
    if (resultTitle) {
      resultTitle.textContent = '付款失敗';
    }
    if (resultMessage) {
      resultMessage.textContent = '發生未預期的錯誤訊息(0011)';
      resultMessage.style.display = '';
    }
  } else {
    // 付款完成（預設）
    if (resultIcon) {
      resultIcon.src = 'assets/icon-payment-success.svg';
      resultIcon.alt = '付款完成';
    }
    if (resultTitle) {
      resultTitle.textContent = '付款完成';
    }
    if (resultMessage) {
      resultMessage.style.display = 'none';
    }
  }

  /* --- 確認按鈕 --- */
  if (btnConfirm) {
    btnConfirm.addEventListener('click', function () {
      if (status === 'fail') {
        // 付款失敗 → 返回付款方式選擇頁，讓用戶重新選擇
        window.location.href = 'crm-forest-payment.html' + (eventId ? '?id=' + encodeURIComponent(eventId) : '');
      } else {
        // 付款完成 → 導向已報名紀錄列表（切換到「我已報名」頁籤）
        window.location.href = 'crm-forest-list.html?tab=registered';
      }
    });
  }

  /* --- 返回按鈕 --- */
  if (btnBack) {
    btnBack.addEventListener('click', function () {
      window.history.back();
    });
  }

});
