/* ============================================
   預約對保服務表單互動邏輯
   根據 Figma 設計稿 (node-id: 29:1464)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- 檢查問卷是否已填寫，更新星星圖示 ---
  var surveyData = JSON.parse(localStorage.getItem('crmGuaranteeSurvey') || 'null');
  var btnQuestionnaire = document.getElementById('btnQuestionnaire');
  var starIcon = document.getElementById('starIcon');
  if (surveyData && btnQuestionnaire && starIcon) {
    // 問卷已填寫 → 實心星星
    starIcon.src = 'assets/star-filled-icon.svg';
    btnQuestionnaire.classList.add('filled');
  }

  // --- 返回按鈕 ---
  var btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'crm-guarantee-service.html';
      }
    });
  }

  // --- 離開按鈕 ---
  var btnLeave = document.getElementById('btnLeave');
  if (btnLeave) {
    btnLeave.addEventListener('click', function () {
      window.location.href = 'crm-guarantee-service.html';
    });
  }

  // --- 填寫對保問卷按鈕 ---
  if (btnQuestionnaire) {
    btnQuestionnaire.addEventListener('click', function () {
      // 導向對保問卷頁面
      window.location.href = 'crm-guarantee-survey.html';
    });
  }

  // --- 確認建立按鈕 ---
  var btnConfirm = document.getElementById('btnConfirm');
  var guaranteeForm = document.getElementById('guaranteeForm');
  if (btnConfirm && guaranteeForm) {
    btnConfirm.addEventListener('click', function () {
      var project = document.getElementById('project');
      var unit = document.getElementById('unit');
      var date = document.getElementById('date');
      var timeSlot = document.getElementById('timeSlot');

      // 清除先前的錯誤提示（表單內及問卷按鈕區）
      var contentArea = guaranteeForm.closest('.reserve-content') || document;
      var prevErrors = contentArea.querySelectorAll('.form-error-msg');
      prevErrors.forEach(function (el) { el.remove(); });
      var prevErrorGroups = contentArea.querySelectorAll('.has-error');
      prevErrorGroups.forEach(function (el) { el.classList.remove('has-error'); });

      // 必填欄位驗證
      var fields = [
        { el: project, name: '建案' },
        { el: unit, name: '戶別' },
        { el: date, name: '日期' },
        { el: timeSlot, name: '時段' }
      ];

      var hasError = false;

      fields.forEach(function (field) {
        if (!field.el.value) {
          hasError = true;
          var group = field.el.closest('.form-group');
          group.classList.add('has-error');
          var msg = document.createElement('p');
          msg.className = 'form-error-msg';
          msg.textContent = '請填寫' + field.name;
          group.appendChild(msg);
        }
      });

      // 驗證：問卷是否已填寫
      var surveyCheck = JSON.parse(localStorage.getItem('crmGuaranteeSurvey') || 'null');
      if (!surveyCheck) {
        hasError = true;
        var qBtn = document.getElementById('btnQuestionnaire');
        if (qBtn) {
          var qWrapper = qBtn.closest('.questionnaire-section') || qBtn.parentElement;
          // 避免重複新增錯誤訊息
          if (!qWrapper.querySelector('.form-error-msg')) {
            var msgQ = document.createElement('p');
            msgQ.className = 'form-error-msg';
            msgQ.textContent = '請先填寫對保問卷';
            msgQ.style.color = '#e06060';
            msgQ.style.fontSize = '14px';
            msgQ.style.marginTop = '8px';
            qWrapper.appendChild(msgQ);
          }
        }
      }

      if (hasError) {
        var firstError = contentArea.querySelector('.has-error, .form-error-msg');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // 收集表單資料
      var projectText = project.options[project.selectedIndex].text;
      var unitText = unit.options[unit.selectedIndex].text;
      var dateFormatted = date.value.replace(/-/g, '/');
      var timeText = timeSlot.options[timeSlot.selectedIndex].text;

      // 產生案件編號
      var now = new Date();
      var caseId = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') + '-' +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0');

      // 組合卡片資料
      var newCard = {
        caseId: caseId,
        status: '預約中',
        project: projectText,
        unit: unitText,
        date: dateFormatted,
        time: timeText,
        sortDate: date.value + ' ' + timeText
      };

      // 儲存至 localStorage
      var pendingCards = JSON.parse(localStorage.getItem('crmGuaranteeCards') || '[]');
      pendingCards.push(newCard);
      localStorage.setItem('crmGuaranteeCards', JSON.stringify(pendingCards));

      // 將問卷資料複製至結果頁專用 key（供檢視紀錄頁查看）
      var surveyForResult = localStorage.getItem('crmGuaranteeSurvey');
      if (surveyForResult) {
        localStorage.setItem('crmGuaranteeSurveyResult', surveyForResult);
      }

      // 清除暫存問卷資料（已隨案件建立）
      localStorage.removeItem('crmGuaranteeSurvey');

      // 提交成功後返回列表頁
      alert('預約對保服務已建立');
      window.location.href = 'crm-guarantee-service.html';
    });
  }

});
