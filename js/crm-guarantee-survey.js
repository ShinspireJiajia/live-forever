/* ============================================
   對保問卷頁面互動邏輯
   根據 Figma 設計稿 (node-id: 29:1534)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- 已有暫存資料時回填 ---
  var savedSurvey = JSON.parse(localStorage.getItem('crmGuaranteeSurvey') || 'null');

  // ===========================================
  // ① 基本貸款意願
  // ===========================================
  var loanIntentOptions = document.getElementById('loanIntentOptions');
  var intentCards = loanIntentOptions ? loanIntentOptions.querySelectorAll('.intent-option') : [];
  var loanConditionalSections = document.querySelectorAll('.loan-conditional');
  var selectedLoanIntent = savedSurvey ? savedSurvey.loanIntent : '';

  /** 更新貸款意願選項狀態 & 控制條件區塊顯示 */
  function updateLoanIntent(value) {
    selectedLoanIntent = value;
    intentCards.forEach(function (card) {
      var radio = card.querySelector('.radio-btn');
      if (card.getAttribute('data-value') === value) {
        card.classList.add('selected');
        radio.classList.add('checked');
      } else {
        card.classList.remove('selected');
        radio.classList.remove('checked');
      }
    });
    // 條件區塊(②③④)：選擇「需辦理房屋貸款」時顯示
    loanConditionalSections.forEach(function (sec) {
      sec.style.display = (value === 'loan') ? '' : 'none';
    });
  }

  // 設定初始狀態
  if (selectedLoanIntent) updateLoanIntent(selectedLoanIntent);

  intentCards.forEach(function (card) {
    card.addEventListener('click', function () {
      updateLoanIntent(card.getAttribute('data-value'));
    });
  });

  // ===========================================
  // ② 銀行選擇
  // ===========================================
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

  // ===========================================
  // ③ 對保地址
  // ===========================================
  var addressOptions = document.getElementById('addressOptions');
  var addressCards = addressOptions ? addressOptions.querySelectorAll('.address-card') : [];
  var otherAddressInput = document.getElementById('otherAddressInput');
  var selectedAddress = savedSurvey ? savedSurvey.address : '';

  function updateAddressSelection(value) {
    selectedAddress = value;
    addressCards.forEach(function (card) {
      var radio = card.querySelector('.radio-btn');
      if (card.getAttribute('data-value') === value) {
        card.classList.add('selected');
        radio.classList.add('checked');
      } else {
        card.classList.remove('selected');
        radio.classList.remove('checked');
      }
    });
    // 選擇「其他」時顯示自行輸入地址欄位
    if (otherAddressInput) {
      otherAddressInput.style.display = (value === 'other-address') ? '' : 'none';
    }
  }

  if (selectedAddress) updateAddressSelection(selectedAddress);

  addressCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.other-address-input')) return;
      updateAddressSelection(card.getAttribute('data-value'));
    });
  });

  // 回填已儲存的其他地址
  if (savedSurvey && savedSurvey.otherAddress) {
    var otherAddressNameEl = document.getElementById('otherAddressName');
    if (otherAddressNameEl) otherAddressNameEl.value = savedSurvey.otherAddress;
  }

  // ===========================================
  // ④ 貸款需求細節 — 名下是否有其他房貸
  // ===========================================
  var otherMortgageOptions = document.getElementById('otherMortgageOptions');
  var mortgageCards = otherMortgageOptions ? otherMortgageOptions.querySelectorAll('.inline-radio-option') : [];
  var selectedMortgage = savedSurvey ? savedSurvey.otherMortgage : '';

  function updateMortgageSelection(value) {
    selectedMortgage = value;
    mortgageCards.forEach(function (card) {
      var radio = card.querySelector('.radio-btn');
      if (card.getAttribute('data-value') === value) {
        card.classList.add('selected');
        radio.classList.add('checked');
      } else {
        card.classList.remove('selected');
        radio.classList.remove('checked');
      }
    });
  }

  if (selectedMortgage) updateMortgageSelection(selectedMortgage);

  mortgageCards.forEach(function (card) {
    card.addEventListener('click', function () {
      updateMortgageSelection(card.getAttribute('data-value'));
    });
  });

  // 回填貸款需求細節欄位
  if (savedSurvey) {
    var loanRatio = document.getElementById('loanRatio');
    var occupationType = document.getElementById('occupationType');
    if (loanRatio && savedSurvey.loanRatio) loanRatio.value = savedSurvey.loanRatio;
    if (occupationType && savedSurvey.occupationType) occupationType.value = savedSurvey.occupationType;
  }

  // ===========================================
  // ⑤ 產權登記資訊
  // ===========================================
  var propertyOwnerOptions = document.getElementById('propertyOwnerOptions');
  var propertyCards = propertyOwnerOptions ? propertyOwnerOptions.querySelectorAll('.inline-radio-option') : [];
  var designatedOwnerGroup = document.getElementById('designatedOwnerGroup');
  var selectedPropertyOwner = savedSurvey ? savedSurvey.propertyOwner : '';

  function updatePropertyOwnerSelection(value) {
    selectedPropertyOwner = value;
    propertyCards.forEach(function (card) {
      var radio = card.querySelector('.radio-btn');
      if (card.getAttribute('data-value') === value) {
        card.classList.add('selected');
        radio.classList.add('checked');
      } else {
        card.classList.remove('selected');
        radio.classList.remove('checked');
      }
    });
    // 選「否」→ 顯示「指定登記人姓名」欄位
    if (designatedOwnerGroup) {
      designatedOwnerGroup.style.display = (value === 'no') ? '' : 'none';
    }
  }

  if (selectedPropertyOwner) updatePropertyOwnerSelection(selectedPropertyOwner);

  propertyCards.forEach(function (card) {
    card.addEventListener('click', function () {
      updatePropertyOwnerSelection(card.getAttribute('data-value'));
    });
  });

  // 回填指定登記人姓名
  if (savedSurvey && savedSurvey.designatedOwnerName) {
    var designatedOwnerNameEl = document.getElementById('designatedOwnerName');
    if (designatedOwnerNameEl) designatedOwnerNameEl.value = savedSurvey.designatedOwnerName;
  }

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
      var loanRatioEl = document.getElementById('loanRatio');
      var occupationTypeEl = document.getElementById('occupationType');
      var designatedOwnerNameEl = document.getElementById('designatedOwnerName');
      var otherAddressNameEl = document.getElementById('otherAddressName');

      // 清除先前的錯誤提示
      var prevErrors = document.querySelectorAll('.form-error-msg');
      prevErrors.forEach(function (el) { el.remove(); });
      var prevErrorGroups = document.querySelectorAll('.has-error');
      prevErrorGroups.forEach(function (el) { el.classList.remove('has-error'); });

      var hasError = false;

      // 輔助：建立錯誤訊息
      function addError(container, message) {
        hasError = true;
        if (container) {
          container.classList.add('has-error');
          var msg = document.createElement('p');
          msg.className = 'form-error-msg';
          msg.textContent = message;
          container.appendChild(msg);
        }
      }

      // 驗證：基本貸款意願必填
      if (!selectedLoanIntent) {
        addError(document.querySelector('#sectionLoanIntent .section-block'), '請選擇貸款意願');
      }

      // 以下驗證僅在選擇「需辦理房屋貸款」時才執行
      if (selectedLoanIntent === 'loan') {
        // 驗證：對保銀行必填
        if (!selectedBank) {
          addError(bankOptions ? bankOptions.closest('.section-block') : null, '請選擇對保的銀行');
        }

        // 驗證：選擇「其他」時銀行名稱必填
        if (selectedBank === 'other' && otherBankNameEl && !otherBankNameEl.value.trim()) {
          hasError = true;
          otherBankNameEl.style.borderColor = '#e06060';
          var msg2 = document.createElement('p');
          msg2.className = 'form-error-msg';
          msg2.textContent = '請輸入銀行名稱';
          otherBankInput.appendChild(msg2);
        }
      }

      // 驗證：產權登記人選「否」時，指定登記人姓名必填
      if (selectedPropertyOwner === 'no' && designatedOwnerNameEl && !designatedOwnerNameEl.value.trim()) {
        addError(document.getElementById('designatedOwnerGroup'), '請填寫指定登記人姓名');
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
        loanIntent: selectedLoanIntent,
        bank: selectedLoanIntent === 'loan' ? selectedBank : '',
        otherBankName: selectedLoanIntent === 'loan' && selectedBank === 'other' && otherBankNameEl ? otherBankNameEl.value.trim() : '',
        address: selectedLoanIntent === 'loan' ? selectedAddress : '',
        otherAddress: selectedLoanIntent === 'loan' && selectedAddress === 'other-address' && otherAddressNameEl ? otherAddressNameEl.value.trim() : '',
        loanRatio: selectedLoanIntent === 'loan' && loanRatioEl ? loanRatioEl.value : '',
        loanAmount: selectedLoanIntent === 'loan' && loanAmount ? loanAmount.value : '',
        occupationType: selectedLoanIntent === 'loan' && occupationTypeEl ? occupationTypeEl.value : '',
        otherMortgage: selectedLoanIntent === 'loan' ? selectedMortgage : '',
        propertyOwner: selectedPropertyOwner,
        designatedOwnerName: selectedPropertyOwner === 'no' && designatedOwnerNameEl ? designatedOwnerNameEl.value.trim() : '',
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
