/* ============================================
   森林聚落線上支付頁面互動邏輯
   根據 Figma 設計稿 (node-id: 1:4668)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* --- DOM 元素取得 --- */
  var btnConfirm = document.getElementById('btnConfirm');
  var btnCancel = document.getElementById('btnCancel');
  var radioButtons = document.querySelectorAll('input[name="paymentMethod"]');

  /* --- 從 URL 取得預約資料參數 --- */
  var urlParams = new URLSearchParams(window.location.search);
  var eventId = urlParams.get('id') || '';

  /**
   * 取得目前選擇的付款方式
   * @returns {string} 付款方式值
   */
  function getSelectedPayment() {
    var selected = document.querySelector('input[name="paymentMethod"]:checked');
    return selected ? selected.value : '';
  }

  /* --- 確認按鈕 --- */
  if (btnConfirm) {
    btnConfirm.addEventListener('click', function () {
      var method = getSelectedPayment();
      if (!method) {
        alert('請選擇支付方式');
        return;
      }

      // 付款方式名稱對照
      var methodLabels = {
        'credit-card': '信用卡',
        'line-pay': 'LINE PAY',
        'atm': 'ATM 虛擬帳號轉帳'
      };

      // eslint-disable-next-line no-console
      console.log('付款資訊：', {
        eventId: eventId,
        paymentMethod: method,
        paymentLabel: methodLabels[method] || method
      });

      // 此處實際對接金流 API 後，根據交易結果導向對應頁面
      // 模擬交易成功（實際上應由 API 回傳決定 status=success 或 status=fail）
      var resultUrl = 'crm-forest-payment-result.html?status=success';
      if (eventId) {
        resultUrl += '&id=' + encodeURIComponent(eventId);
      }
      window.location.href = resultUrl;
    });
  }

  /* --- 取消按鈕：返回上一頁 --- */
  if (btnCancel) {
    btnCancel.addEventListener('click', function () {
      window.history.back();
    });
  }

  /* --- Radio 選項點擊回饋 --- */
  radioButtons.forEach(function (radio) {
    radio.addEventListener('change', function () {
      // 移除所有選項的選中視覺效果（可擴充用）
      document.querySelectorAll('.payment-option').forEach(function (opt) {
        opt.classList.remove('selected');
      });
      // 為目前選中的選項加上效果
      var parentOption = radio.closest('.payment-option');
      if (parentOption) {
        parentOption.classList.add('selected');
      }
    });

    // 初始化：替預設選中的項目加上效果
    if (radio.checked) {
      var parentOption = radio.closest('.payment-option');
      if (parentOption) {
        parentOption.classList.add('selected');
      }
    }
  });

});
