/* ============================================
   對保問卷結果頁面互動邏輯（僅供檢視）
   根據 Figma 設計稿 (node-id: 248:1398)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- 銀行名稱對照表 ---
  var bankNameMap = {
    cathay: '國泰世華',
    bot: '台灣銀行',
    'hua-nan': '華南銀行',
    other: '其他'
  };

  // --- 從 localStorage 讀取問卷資料並回填 ---
  var surveyData = JSON.parse(localStorage.getItem('crmGuaranteeSurveyResult') || 'null');

  if (surveyData) {
    // 回填銀行選擇
    var bankOptions = document.getElementById('bankOptions');
    if (bankOptions && surveyData.bank) {
      var bankCards = bankOptions.querySelectorAll('.bank-card');
      bankCards.forEach(function (card) {
        var radio = card.querySelector('.radio-btn');
        if (card.getAttribute('data-value') === surveyData.bank) {
          card.classList.add('selected');
          radio.classList.add('checked');
        } else {
          card.classList.remove('selected');
          radio.classList.remove('checked');
        }
      });

      // 如果選擇「其他」，顯示銀行名稱
      var otherBankName = document.getElementById('otherBankName');
      if (surveyData.bank === 'other' && otherBankName && surveyData.otherBankName) {
        otherBankName.textContent = surveyData.otherBankName;
        otherBankName.classList.add('has-value');
      }
    }

    // 回填貸款金額
    var loanAmountValue = document.getElementById('loanAmountValue');
    if (loanAmountValue && surveyData.loanAmount) {
      loanAmountValue.textContent = surveyData.loanAmount;
      loanAmountValue.classList.add('has-value');
    }

    // 回填星星評分
    var starRating = document.getElementById('starRating');
    if (starRating && surveyData.rating) {
      var stars = starRating.querySelectorAll('.star');
      stars.forEach(function (star) {
        var val = parseInt(star.getAttribute('data-value'));
        if (val <= surveyData.rating) {
          star.classList.add('filled');
        } else {
          star.classList.remove('filled');
        }
      });
    }

    // 回填其他補充
    var additionalNoteValue = document.getElementById('additionalNoteValue');
    if (additionalNoteValue && surveyData.additionalNote) {
      additionalNoteValue.textContent = surveyData.additionalNote;
      additionalNoteValue.classList.add('has-value');
    }

    // 回填已上傳檔案
    var uploadedFilesArea = document.getElementById('uploadedFilesArea');
    if (uploadedFilesArea && surveyData.files && surveyData.files.length > 0) {
      uploadedFilesArea.innerHTML = '';
      surveyData.files.forEach(function (fileName) {
        var item = document.createElement('div');
        item.className = 'attachment-item';
        item.innerHTML = '<p class="file-name">' + escapeHtml(fileName) + '</p>' +
          '<button class="download-btn" data-action="download" data-file="' + escapeHtml(fileName) + '">' +
            '<img src="assets/download-btn.svg" alt="下載">' +
          '</button>';
        uploadedFilesArea.appendChild(item);
      });
    }
  }

  // --- 返回按鈕 ---
  var btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'crm-guarantee-record.html';
      }
    });
  }

  // --- 確認按鈕（返回上一頁） ---
  var btnConfirm = document.getElementById('btnConfirm');
  if (btnConfirm) {
    btnConfirm.addEventListener('click', function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'crm-guarantee-record.html';
      }
    });
  }

  // --- 下載附件按鈕 ---
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action="download"]');
    if (btn) {
      var fileName = btn.getAttribute('data-file');
      console.log('下載附件：' + fileName);
    }
  });

  // HTML 跳脫防止 XSS
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

});
