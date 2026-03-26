/* ============================================
   CRM 首頁互動邏輯
   根據 Figma 設計稿 (node-id: 1:2610)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- 服務九宮格展開 / 收合邏輯 ---
  var gridInner = document.getElementById('serviceGridInner');
  var btnExpand = document.getElementById('btnExpand');
  var expandText = btnExpand ? btnExpand.querySelector('.expand-text') : null;
  var expandArrow = btnExpand ? btnExpand.querySelector('.expand-arrow') : null;
  var rowExtra = document.getElementById('serviceRowExtra');
  var isExpanded = false;

  // 初始狀態：收合
  if (gridInner) {
    gridInner.classList.add('collapsed');
  }
  if (btnExpand) {
    btnExpand.classList.add('has-gradient');
  }
  if (rowExtra) {
    rowExtra.style.display = 'none';
  }

  if (btnExpand) {
    btnExpand.addEventListener('click', function () {
      isExpanded = !isExpanded;

      if (isExpanded) {
        // 展開
        gridInner.classList.remove('collapsed');
        gridInner.classList.add('expanded');
        btnExpand.classList.remove('has-gradient');
        if (rowExtra) rowExtra.style.display = 'flex';
        if (expandText) expandText.textContent = '收合';
        if (expandArrow) expandArrow.classList.add('rotated');
      } else {
        // 收合
        gridInner.classList.remove('expanded');
        gridInner.classList.add('collapsed');
        btnExpand.classList.add('has-gradient');
        if (rowExtra) rowExtra.style.display = 'none';
        if (expandText) expandText.textContent = '查看更多';
        if (expandArrow) expandArrow.classList.remove('rotated');
      }
    });
  }

  // --- 頁面導航 ---

  // 客變服務
  var btnCustom = document.getElementById('btnCustom');
  if (btnCustom) {
    btnCustom.addEventListener('click', function () {
      window.location.href = 'crm-custom-service.html';
    });
  }

  // 交屋服務
  var btnHandover = document.getElementById('btnHandover');
  if (btnHandover) {
    btnHandover.addEventListener('click', function () {
      window.location.href = 'crm-handover-service.html';
    });
  }

  // 對保服務
  var btnGuarantee = document.getElementById('btnGuarantee');
  if (btnGuarantee) {
    btnGuarantee.addEventListener('click', function () {
      window.location.href = 'crm-guarantee-service.html';
    });
  }

  // 森林聚落
  var btnForest = document.getElementById('btnForest');
  if (btnForest) {
    btnForest.addEventListener('click', function () {
      window.location.href = 'crm-forest-list.html';
    });
  }

  // --- 其他按鈕（預留 console.log） ---

  // 我要報修
  var btnRepair = document.getElementById('btnRepair');
  if (btnRepair) {
    btnRepair.addEventListener('click', function () {
      console.log('前往我要報修');
    });
  }

  // 會員中心
  var btnMember = document.getElementById('btnMember');
  if (btnMember) {
    btnMember.addEventListener('click', function () {
      console.log('前往會員中心');
    });
  }

  // 綠海養護
  var btnGreenCare = document.getElementById('btnGreenCare');
  if (btnGreenCare) {
    btnGreenCare.addEventListener('click', function () {
      console.log('前往綠海養護');
    });
  }

  // 綁定新身分
  var btnBind = document.getElementById('btnBind');
  if (btnBind) {
    btnBind.addEventListener('click', function () {
      console.log('前往綁定新身分');
    });
  }

  // 款項資訊
  var btnPayment = document.getElementById('btnPayment');
  if (btnPayment) {
    btnPayment.addEventListener('click', function () {
      console.log('前往款項資訊');
    });
  }

  // 戶別資訊
  var btnUnit = document.getElementById('btnUnit');
  if (btnUnit) {
    btnUnit.addEventListener('click', function () {
      console.log('前往戶別資訊');
    });
  }

  // 房屋健檢
  var btnCheckup = document.getElementById('btnCheckup');
  if (btnCheckup) {
    btnCheckup.addEventListener('click', function () {
      console.log('前往房屋健檢');
    });
  }

  // 驗屋服務
  var btnInspection = document.getElementById('btnInspection');
  if (btnInspection) {
    btnInspection.addEventListener('click', function () {
      console.log('前往驗屋服務');
    });
  }

  // --- 報修卡片「內容查看」按鈕 ---
  var viewButtons = document.querySelectorAll('.btn-view-order');
  viewButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.repair-order-card');
      var orderNum = card ? card.querySelector('.order-number') : null;
      console.log('查看報修單：' + (orderNum ? orderNum.textContent : ''));
    });
  });

});
