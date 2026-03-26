/* ============================================
   對保問卷頁面互動邏輯
   根據 Figma 設計稿 (node-id: 29:1534)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- 已有暫存資料時回填 ---
  var savedSurvey = JSON.parse(localStorage.getItem('crmGuaranteeSurvey') || 'null');

  // --- 銀行選擇 ---
  var bankOptions = document.getElementById('bankOptions');
  var bankCards = bankOptions ? bankOptions.querySelectorAll('.bank-card') : [];
  var selectedBank = savedSurvey ? savedSurvey.bank : 'cathay';

  // 其他銀行輸入框元素
  var otherBankInput = document.getElementById('otherBankInput');
  var otherBankNameEl = document.getElementById('otherBankName');

  // 初始化銀行選項狀態
  function updateBankSelection(value) {
    selectedBank = value;
    bankCards.forEach(function (card) {
      var radio = card.querySelector('.radio-btn');
      var link = card.querySelector('.bank-link');
      if (card.getAttribute('data-value') === value) {
        card.classList.add('selected');
        radio.classList.add('checked');
      } else {
        card.classList.remove('selected');
        radio.classList.remove('checked');
      }
    });

  }

  // 設定初始選項
  updateBankSelection(selectedBank);

  // 點擊銀行卡片切換選擇
  bankCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      // 避免點擊連結或輸入框時觸發選擇
      if (e.target.closest('.bank-link') || e.target.closest('.other-bank-input')) return;
      updateBankSelection(card.getAttribute('data-value'));
    });
  });

  // --- 星星評分 ---
  var starRating = document.getElementById('starRating');
  var stars = starRating ? starRating.querySelectorAll('.star') : [];
  var currentRating = savedSurvey ? savedSurvey.rating : 4;

  function updateStars(rating) {
    currentRating = rating;
    stars.forEach(function (star) {
      var val = parseInt(star.getAttribute('data-value'));
      if (val <= rating) {
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
      }
    });
  }

  // 設定初始評分
  updateStars(currentRating);

  stars.forEach(function (star) {
    star.addEventListener('click', function () {
      updateStars(parseInt(star.getAttribute('data-value')));
    });
  });

  // --- 回填已儲存的資料 ---
  if (savedSurvey) {
    var loanAmount = document.getElementById('loanAmount');
    var additionalNote = document.getElementById('additionalNote');
    if (loanAmount && savedSurvey.loanAmount) loanAmount.value = savedSurvey.loanAmount;
    if (additionalNote && savedSurvey.additionalNote) additionalNote.value = savedSurvey.additionalNote;
    // 回填其他銀行名稱
    if (savedSurvey.otherBankName && otherBankNameEl) {
      otherBankNameEl.value = savedSurvey.otherBankName;
    }
  }

  // --- 圖片上傳 ---
  var btnUpload = document.getElementById('btnUpload');
  var fileInput = document.getElementById('fileInput');
  var uploadedFiles = document.getElementById('uploadedFiles');
  var uploadedFileList = [];
  var MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  if (btnUpload && fileInput) {
    btnUpload.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      var files = fileInput.files;
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        // 驗證檔案大小
        if (file.size > MAX_FILE_SIZE) {
          alert('檔案「' + file.name + '」超過 5MB 限制');
          continue;
        }
        // 驗證檔案類型
        var ext = file.name.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'mp4'].indexOf(ext) === -1) {
          alert('僅支援 .jpg、.mp4 檔案格式');
          continue;
        }
        uploadedFileList.push(file.name);
        renderUploadedFiles();
      }
      // 重置 input 讓同檔名可再次上傳
      fileInput.value = '';
    });
  }

  function renderUploadedFiles() {
    if (!uploadedFiles) return;
    uploadedFiles.innerHTML = '';
    uploadedFileList.forEach(function (name, index) {
      var item = document.createElement('div');
      item.className = 'uploaded-file-item';
      item.innerHTML = '<span class="file-name">' + name + '</span>' +
        '<button class="btn-remove" data-index="' + index + '">移除</button>';
      uploadedFiles.appendChild(item);
    });

    // 綁定移除按鈕
    var removeBtns = uploadedFiles.querySelectorAll('.btn-remove');
    removeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-index'));
        uploadedFileList.splice(idx, 1);
        renderUploadedFiles();
      });
    });
  }

  // --- 返回按鈕 ---
  var btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'crm-guarantee-reserve.html';
      }
    });
  }

  // --- 確認送出按鈕 ---
  var btnSubmit = document.getElementById('btnSubmit');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', function () {
      var loanAmount = document.getElementById('loanAmount');
      var additionalNote = document.getElementById('additionalNote');

      // 清除先前的錯誤提示
      var prevErrors = document.querySelectorAll('.form-error-msg');
      prevErrors.forEach(function (el) { el.remove(); });
      var prevErrorGroups = document.querySelectorAll('.has-error');
      prevErrorGroups.forEach(function (el) { el.classList.remove('has-error'); });

      var hasError = false;

      // 驗證：對保銀行必填
      if (!selectedBank) {
        hasError = true;
        var bankBlock = bankOptions.closest('.section-block');
        if (bankBlock) {
          bankBlock.classList.add('has-error');
          var msg = document.createElement('p');
          msg.className = 'form-error-msg';
          msg.textContent = '請選擇對保的銀行';
          bankBlock.appendChild(msg);
        }
      }

      // 驗證：選擇「其他」時銀行名稱必填
      if (selectedBank === 'other' && otherBankNameEl && !otherBankNameEl.value.trim()) {
        hasError = true;
        var otherGroup = otherBankInput;
        otherBankNameEl.style.borderColor = '#e06060';
        var msg2 = document.createElement('p');
        msg2.className = 'form-error-msg';
        msg2.textContent = '請輸入銀行名稱';
        otherGroup.appendChild(msg2);
      }

      // 驗證：預計貸款金額必填
      if (loanAmount && !loanAmount.value.trim()) {
        hasError = true;
        var loanGroup = loanAmount.closest('.form-group');
        if (loanGroup) {
          loanGroup.classList.add('has-error');
          var msg3 = document.createElement('p');
          msg3.className = 'form-error-msg';
          msg3.textContent = '請填寫預計貸款金額';
          loanGroup.appendChild(msg3);
        }
      }

      if (hasError) {
        var firstError = document.querySelector('.has-error, .form-error-msg');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // 收集問卷資料
      var surveyData = {
        bank: selectedBank,
        otherBankName: selectedBank === 'other' && otherBankNameEl ? otherBankNameEl.value.trim() : '',
        loanAmount: loanAmount ? loanAmount.value : '',
        rating: currentRating,
        additionalNote: additionalNote ? additionalNote.value : '',
        files: uploadedFileList,
        savedAt: new Date().toISOString()
      };

      // 儲存至 localStorage
      localStorage.setItem('crmGuaranteeSurvey', JSON.stringify(surveyData));

      alert('對保問卷已儲存');

      // 返回預約對保服務表單頁
      window.location.href = 'crm-guarantee-reserve.html';
    });
  }

});
