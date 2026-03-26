/* ============================================
   對保服務 - 檢視紀錄頁面互動邏輯
   根據 Figma 設計稿 (node-id: 29:1665)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

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

  // --- 首頁按鈕 ---
  var btnHome = document.getElementById('btnHome');
  if (btnHome) {
    btnHome.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'crm-index.html';
    });
  }

  // --- 查看已填寫的問卷連結 ---
  var surveyLink = document.getElementById('surveyLink');
  if (surveyLink) {
    surveyLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'crm-guarantee-survey-result.html';
    });
  }

  // --- 全螢幕橫向簽名功能 ---
  var signaturePad = document.getElementById('signaturePad');
  var signatureOverlay = document.getElementById('signatureOverlay');
  var signatureCanvas = document.getElementById('signatureCanvas');
  var signaturePlaceholder = document.getElementById('signaturePlaceholder');
  var signatureResult = document.getElementById('signatureResult');
  var btnClearSign = document.getElementById('btnClearSign');
  var btnConfirmSign = document.getElementById('btnConfirmSign');
  var btnClearSignInline = document.getElementById('btnClearSignInline');
  var btnConfirmSignInline = document.getElementById('btnConfirmSignInline');
  var canvasWrap = signatureCanvas ? signatureCanvas.parentElement : null;
  var isDrawing = false;
  var ctx = null;
  var hasStrokes = false;

  // 初始化 Canvas 尺寸
  function initCanvas() {
    if (!signatureCanvas || !canvasWrap) return;
    signatureCanvas.width = canvasWrap.offsetWidth;
    signatureCanvas.height = canvasWrap.offsetHeight;
    ctx = signatureCanvas.getContext('2d');
    ctx.strokeStyle = '#3a4246';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    hasStrokes = false;
  }

  // 開啟全螢幕簽名遮罩
  function openSignatureOverlay() {
    if (!signatureOverlay) return;
    signatureOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(initCanvas, 50);
  }

  // 關閉全螢幕簽名遮罩
  function closeSignatureOverlay() {
    if (!signatureOverlay) return;
    signatureOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 點擊簽名區域 → 開啟橫向全螢幕簽名
  if (signaturePad) {
    signaturePad.addEventListener('click', function () {
      openSignatureOverlay();
    });
  }

  // 卡片內的「確認簽名」按鈕也開啟全螢幕簽名
  if (btnConfirmSignInline) {
    btnConfirmSignInline.addEventListener('click', function () {
      openSignatureOverlay();
    });
  }

  // 卡片內的「清除簽名」按鈕
  if (btnClearSignInline) {
    btnClearSignInline.addEventListener('click', function () {
      if (signatureResult) {
        signatureResult.src = '';
        signatureResult.style.display = 'none';
      }
      if (signaturePlaceholder) {
        signaturePlaceholder.style.display = '';
      }
      if (signaturePad) {
        signaturePad.classList.remove('has-signature');
      }
      try {
        localStorage.removeItem('crmGuaranteeSignature');
      } catch (e) {
        console.warn('簽名清除失敗', e);
      }
    });
  }

  // 取得觸控/滑鼠座標（處理 CSS rotate(90deg) 座標轉換）
  function getPos(e) {
    var touch = e.touches ? e.touches[0] : e;
    var sx = touch.clientX;
    var sy = touch.clientY;
    var rect = signatureCanvas.getBoundingClientRect();
    var isPortrait = window.matchMedia('(orientation: portrait)').matches;

    if (isPortrait) {
      var bcx = rect.left + rect.width / 2;
      var bcy = rect.top + rect.height / 2;
      var ecx = signatureCanvas.width / 2;
      var ecy = signatureCanvas.height / 2;
      var dx = sx - bcx;
      var dy = sy - bcy;
      return {
        x: ecx + dy,
        y: ecy - dx
      };
    } else {
      return {
        x: (sx - rect.left) / rect.width * signatureCanvas.width,
        y: (sy - rect.top) / rect.height * signatureCanvas.height
      };
    }
  }

  if (signatureCanvas) {
    // 滑鼠事件
    signatureCanvas.addEventListener('mousedown', function (e) {
      if (!ctx) return;
      isDrawing = true;
      hasStrokes = true;
      var pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    });
    signatureCanvas.addEventListener('mousemove', function (e) {
      if (!isDrawing || !ctx) return;
      var pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    });
    signatureCanvas.addEventListener('mouseup', function () { isDrawing = false; });
    signatureCanvas.addEventListener('mouseleave', function () { isDrawing = false; });

    // 觸控事件
    signatureCanvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      if (!ctx) return;
      isDrawing = true;
      hasStrokes = true;
      var pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    });
    signatureCanvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      if (!isDrawing || !ctx) return;
      var pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    });
    signatureCanvas.addEventListener('touchend', function () { isDrawing = false; });
  }

  // 遮罩內清除簽名
  if (btnClearSign) {
    btnClearSign.addEventListener('click', function () {
      if (ctx && signatureCanvas) {
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        hasStrokes = false;
      }
    });
  }

  // 遮罩內確認簽名 → 存下簽名圖片並關閉遮罩
  if (btnConfirmSign) {
    btnConfirmSign.addEventListener('click', function () {
      if (!hasStrokes) {
        alert('請先進行簽名');
        return;
      }
      var dataUrl = signatureCanvas.toDataURL('image/png');
      if (signatureResult) {
        signatureResult.src = dataUrl;
        signatureResult.style.display = 'block';
      }
      if (signaturePlaceholder) {
        signaturePlaceholder.style.display = 'none';
      }
      if (signaturePad) {
        signaturePad.classList.add('has-signature');
      }
      try {
        localStorage.setItem('crmGuaranteeSignature', dataUrl);
      } catch (e) {
        console.warn('簽名儲存失敗', e);
      }
      closeSignatureOverlay();
    });
  }

  // 頁面載入時恢復已儲存的簽名
  var savedSignature = localStorage.getItem('crmGuaranteeSignature');
  if (savedSignature && signatureResult && signaturePlaceholder && signaturePad) {
    signatureResult.src = savedSignature;
    signatureResult.style.display = 'block';
    signaturePlaceholder.style.display = 'none';
    signaturePad.classList.add('has-signature');
  }

  // --- 根據狀態控制簽名區塊顯示 ---
  var signatureSection = document.getElementById('signatureSection');
  var urlParams = new URLSearchParams(window.location.search);
  var currentStatus = urlParams.get('status') || '預約中';
  if (currentStatus !== '已完成') {
    // 預約中：隱藏簽名區塊與分隔線
    if (signatureSection) signatureSection.style.display = 'none';
    var cardDivider = document.querySelector('.card-divider');
    if (cardDivider) cardDivider.style.display = 'none';
  }

  // --- 下載附件按鈕 ---
  document.querySelectorAll('[data-action="download"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var fileName = btn.getAttribute('data-file');
      console.log('下載附件：' + fileName);
    });
  });

  // --- 我要留言功能 ---
  var btnLeaveMessage = document.getElementById('btnLeaveMessage');
  var messageModalOverlay = document.getElementById('messageModalOverlay');
  var messageTextarea = document.getElementById('messageTextarea');
  var messageFileInput = document.getElementById('messageFileInput');
  var selectedFileEl = document.getElementById('selectedFile');
  var selectedFileName = document.getElementById('selectedFileName');
  var btnRemoveFile = document.getElementById('btnRemoveFile');
  var btnMsgCancel = document.getElementById('btnMsgCancel');
  var btnMsgSend = document.getElementById('btnMsgSend');
  var chatMessages = document.querySelector('.chat-messages');
  var chatArea = document.querySelector('.chat-area');
  var attachedFile = null;

  // 開啟留言彈窗
  if (btnLeaveMessage) {
    btnLeaveMessage.addEventListener('click', function () {
      if (messageModalOverlay) {
        messageModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // 關閉留言彈窗（重置表單）
  function closeMessageModal() {
    if (messageModalOverlay) {
      messageModalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (messageTextarea) messageTextarea.value = '';
    if (messageFileInput) messageFileInput.value = '';
    if (selectedFileEl) selectedFileEl.style.display = 'none';
    attachedFile = null;
  }

  // 取消按鈕
  if (btnMsgCancel) {
    btnMsgCancel.addEventListener('click', closeMessageModal);
  }

  // 點擊遮罩外部關閉
  if (messageModalOverlay) {
    messageModalOverlay.addEventListener('click', function (e) {
      if (e.target === messageModalOverlay) {
        closeMessageModal();
      }
    });
  }

  // 選擇檔案
  if (messageFileInput) {
    messageFileInput.addEventListener('change', function () {
      if (this.files && this.files.length > 0) {
        var file = this.files[0];
        // 檢查檔案大小（5MB）
        if (file.size > 5 * 1024 * 1024) {
          alert('檔案大小不可超過 5MB');
          this.value = '';
          return;
        }
        attachedFile = file;
        if (selectedFileName) selectedFileName.textContent = file.name;
        if (selectedFileEl) selectedFileEl.style.display = 'flex';
      }
    });
  }

  // 移除已選檔案
  if (btnRemoveFile) {
    btnRemoveFile.addEventListener('click', function () {
      attachedFile = null;
      if (messageFileInput) messageFileInput.value = '';
      if (selectedFileEl) selectedFileEl.style.display = 'none';
    });
  }

  // 發送訊息
  if (btnMsgSend) {
    btnMsgSend.addEventListener('click', function () {
      var msgText = messageTextarea ? messageTextarea.value.trim() : '';
      if (!msgText && !attachedFile) {
        alert('請輸入訊息或選擇附件');
        return;
      }

      // 產生時間戳
      var now = new Date();
      var y = now.getFullYear();
      var m = String(now.getMonth() + 1).padStart(2, '0');
      var d = String(now.getDate()).padStart(2, '0');
      var hh = now.getHours();
      var mm = String(now.getMinutes()).padStart(2, '0');
      var ampm = hh >= 12 ? 'PM' : 'AM';
      var h12 = hh % 12 || 12;
      var timeStr = y + '/' + m + '/' + d + ' ' + h12 + ':' + mm + ' ' + ampm;

      // 建立訊息 HTML
      var msgHtml = '<div class="chat-msg-user">';
      if (msgText) {
        msgHtml += '<div class="msg-bubble">' + escapeHtml(msgText) + '</div>';
      }
      if (attachedFile) {
        msgHtml += '<div class="attachment-item">' +
          '<p class="file-name">' + escapeHtml(attachedFile.name) + '</p>' +
          '<button class="download-btn" data-action="download" data-file="' + escapeHtml(attachedFile.name) + '">' +
            '<img src="assets/download-btn.svg" alt="下載">' +
          '</button>' +
        '</div>';
      }
      msgHtml += '<p class="msg-time">' + timeStr + '</p>';
      msgHtml += '</div>';

      // 插入新訊息到聊天區
      if (chatMessages) {
        chatMessages.insertAdjacentHTML('beforeend', msgHtml);
      }

      // 捲動至底部
      if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
      }

      // 關閉彈窗
      closeMessageModal();
    });
  }

  // HTML 跳脫防止 XSS
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

});
