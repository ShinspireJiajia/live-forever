/* ============================================
   預約客變服務表單互動邏輯
   根據 Figma 設計稿 (node-id: 1:6213)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- 返回按鈕 ---
  var btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', function () {
      // 返回上一頁（客變服務列表）
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'crm-custom-service.html';
      }
    });
  }

  // --- 首頁按鈕 ---
  var btnHome = document.getElementById('btnHome');
  if (btnHome) {
    btnHome.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'crm-index.html'; ---
  var btnLeave = document.getElementById('btnLeave');
  if (btnLeave) {
    btnLeave.addEventListener('click', function () {
      // 返回客變服務列表頁
      window.location.href = 'crm-custom-service.html';
    });
  }

  // --- 確認建立按鈕 ---
  var btnConfirm = document.getElementById('btnConfirm');
  var reserveForm = document.getElementById('reserveForm');
  if (btnConfirm && reserveForm) {
    btnConfirm.addEventListener('click', function () {
      // 驗證必填欄位（逐欄檢查並顯示提示）
      var project = document.getElementById('project');
      var unit = document.getElementById('unit');
      var floor = document.getElementById('floor');
      var date = document.getElementById('date');
      var timeSlot = document.getElementById('timeSlot');
      var attendees = document.getElementById('attendees');
      var designerAttend = document.querySelector('input[name="designerAttend"]:checked');

      // 清除先前的錯誤提示
      var prevErrors = reserveForm.querySelectorAll('.form-error-msg');
      prevErrors.forEach(function (el) { el.remove(); });
      var prevErrorGroups = reserveForm.querySelectorAll('.has-error');
      prevErrorGroups.forEach(function (el) { el.classList.remove('has-error'); });

      // 必填欄位對應表
      var fields = [
        { el: project, name: '建案' },
        { el: unit, name: '戶別' },
        { el: floor, name: '樓層' },
        { el: date, name: '日期' },
        { el: timeSlot, name: '時段' },
        { el: attendees, name: '出席人數' }
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

      // 設計師出席 Radio 檢查
      if (!designerAttend) {
        hasError = true;
        var radioGroup = document.querySelector('.form-group[data-node-id="1:6245"]');
        if (radioGroup) {
          radioGroup.classList.add('has-error');
          var msg = document.createElement('p');
          msg.className = 'form-error-msg';
          msg.textContent = '請選擇設計師是否出席';
          radioGroup.appendChild(msg);
        }
      }

      if (hasError) {
        // 滾動到第一個錯誤欄位
        var firstError = reserveForm.querySelector('.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // 收集表單資料
      var projectText = project.options[project.selectedIndex].text;
      var unitText = unit.options[unit.selectedIndex].text;
      var floorText = floor.options[floor.selectedIndex].text;
      var dateFormatted = date.value.replace(/-/g, '/');
      var timeText = timeSlot.options[timeSlot.selectedIndex].text;

      // 產生案件編號（以日期為基礎）
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
        floor: floorText,
        date: dateFormatted,
        time: timeText,
        sortDate: date.value + ' ' + timeText
      };

      // 儲存至 localStorage
      var pendingCards = JSON.parse(localStorage.getItem('crmNewCards') || '[]');
      pendingCards.push(newCard);
      localStorage.setItem('crmNewCards', JSON.stringify(pendingCards));

      // 提交成功後返回列表頁
      alert('預約客變服務已建立');
      window.location.href = 'crm-custom-service.html';
    });
  }

});
