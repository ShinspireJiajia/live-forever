/**
 * 桌面版共用簽名畫布元件 (DesktopSignatureCanvas)
 * 適用於後台管理頁面 — 全螢幕橫向簽名模式
 * 點擊簽名區域或按鈕即開啟全螢幕遮罩，於橫向畫布上完成簽名
 * 支援「此次無需簽名」核取方塊、簽名預覽、清除/確認簽名
 *
 * 使用方式：
 *   DesktopSignatureCanvas.init({
 *     onConfirm: function(dataUrl) { ... },
 *     onClear: function() { ... }
 *   });
 */
var DesktopSignatureCanvas = (function () {
  'use strict';

  /**
   * 建立全螢幕遮罩 DOM 結構
   * @param {string} title - 遮罩標題文字
   * @returns {Object} 遮罩 DOM 元素集合
   */
  function createOverlayDOM(title) {
    var root = document.createElement('div');
    root.className = 'signature-fullscreen-overlay';

    var inner = document.createElement('div');
    inner.className = 'signature-fullscreen-inner';

    var titleEl = document.createElement('h3');
    titleEl.className = 'signature-fullscreen-title';
    titleEl.textContent = title || '請在此處簽名';

    var canvasWrap = document.createElement('div');
    canvasWrap.className = 'signature-fullscreen-canvas-wrap';

    var canvas = document.createElement('canvas');
    canvas.style.touchAction = 'none';
    canvasWrap.appendChild(canvas);

    var actions = document.createElement('div');
    actions.className = 'signature-fullscreen-actions';

    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn-sig-cancel';
    cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> 取消';

    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'btn-sig-clear';
    clearBtn.innerHTML = '<i class="fa-solid fa-eraser"></i> 清除';

    var confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'btn-sig-confirm';
    confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i> 確認簽名';

    actions.appendChild(cancelBtn);
    actions.appendChild(clearBtn);
    actions.appendChild(confirmBtn);

    inner.appendChild(titleEl);
    inner.appendChild(canvasWrap);
    inner.appendChild(actions);
    root.appendChild(inner);

    return {
      root: root,
      inner: inner,
      canvasWrap: canvasWrap,
      canvas: canvas,
      cancelBtn: cancelBtn,
      clearBtn: clearBtn,
      confirmBtn: confirmBtn
    };
  }

  /**
   * 初始化桌面版簽名元件（全螢幕橫向模式）
   * @param {Object} options - 設定選項
   * @param {string} [options.canvasId='signatureCanvas'] - 原始行內畫布元素 ID（將被隱藏）
   * @param {string} [options.placeholderId='signaturePlaceholder'] - 占位提示元素 ID
   * @param {string} [options.clearBtnId='btnClearSign'] - 清除簽名按鈕 ID
   * @param {string} [options.confirmBtnId='btnConfirmSign'] - 確認/開啟簽名按鈕 ID
   * @param {string} [options.signatureAreaId='signatureArea'] - 簽名區域容器 ID
   * @param {string} [options.skipCheckboxId='skipSignature'] - 「無需簽名」核取方塊 ID
   * @param {string} [options.disabledOverlayId='signatureDisabledOverlay'] - 停用遮罩 ID
   * @param {Function} [options.onConfirm] - 確認簽名回呼，接收 dataUrl 參數
   * @param {Function} [options.onClear] - 清除簽名回呼
   * @param {Function} [options.onDraw] - 簽名完成時額外回呼
   * @param {string} [options.overlayTitle='請在此處簽名'] - 全螢幕遮罩標題
   * @returns {Object} 簽名元件實例
   */
  function init(options) {
    var opts = Object.assign({
      canvasId: 'signatureCanvas',
      placeholderId: 'signaturePlaceholder',
      clearBtnId: 'btnClearSign',
      confirmBtnId: 'btnConfirmSign',
      signatureAreaId: 'signatureArea',
      skipCheckboxId: 'skipSignature',
      disabledOverlayId: 'signatureDisabledOverlay',
      onConfirm: null,
      onClear: null,
      onDraw: null,
      overlayTitle: '請在此處簽名'
    }, options || {});

    // 取得現有 DOM 元素
    var inlineCanvas = document.getElementById(opts.canvasId);
    if (!inlineCanvas) return null;

    var placeholder = document.getElementById(opts.placeholderId);
    var clearBtn = opts.clearBtnId ? document.getElementById(opts.clearBtnId) : null;
    var confirmBtn = opts.confirmBtnId ? document.getElementById(opts.confirmBtnId) : null;
    var signatureArea = document.getElementById(opts.signatureAreaId);
    var skipCheckbox = document.getElementById(opts.skipCheckboxId);
    var disabledOverlay = document.getElementById(opts.disabledOverlayId);

    // 若無 signatureAreaId 對應元素，使用畫布的父元素作為簽名觸發區
    if (!signatureArea) {
      signatureArea = inlineCanvas.parentElement;
    }

    var savedDataUrl = null;
    var hasSignature = false;

    // ============================
    // 隱藏行內畫布，建立預覽圖片
    // ============================
    inlineCanvas.style.display = 'none';

    var previewImg = document.createElement('img');
    previewImg.className = 'signature-preview-img';
    previewImg.style.display = 'none';
    previewImg.alt = '簽名預覽';
    signatureArea.insertBefore(previewImg, inlineCanvas);

    // ============================
    // 建立全螢幕遮罩 DOM 並附加至 body
    // ============================
    var overlay = createOverlayDOM(opts.overlayTitle);
    document.body.appendChild(overlay.root);

    var overlayCanvas = overlay.canvas;
    var overlayCtx = null;
    var isDrawing = false;
    var hasStrokes = false;

    /** 初始化遮罩畫布尺寸與畫筆 */
    function initOverlayCanvas() {
      var wrap = overlay.canvasWrap;
      overlayCanvas.width = wrap.offsetWidth;
      overlayCanvas.height = wrap.offsetHeight;
      overlayCtx = overlayCanvas.getContext('2d');
      overlayCtx.strokeStyle = '#333';
      overlayCtx.lineWidth = 2.5;
      overlayCtx.lineCap = 'round';
      overlayCtx.lineJoin = 'round';
      hasStrokes = false;
    }

    /** 開啟全螢幕簽名遮罩 */
    function openOverlay() {
      if (skipCheckbox && skipCheckbox.checked) return;
      overlay.root.classList.add('active');
      document.body.style.overflow = 'hidden';

      // 嘗試進入全螢幕並鎖定橫向（繞過手機端鎖定旋轉）
      var el = overlay.root;
      var requestFs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (requestFs) {
        requestFs.call(el).then(function () {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(function () { /* 忽略不支援 */ });
          }
        }).catch(function () { /* 忽略不支援 */ });
      }

      // 延遲初始化確保遮罩 DOM 完成渲染
      setTimeout(initOverlayCanvas, 60);
    }

    /** 關閉全螢幕簽名遮罩 */
    function closeOverlay() {
      overlay.root.classList.remove('active');
      document.body.style.overflow = '';

      // 解鎖螢幕方向並退出全螢幕
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        var exitFs = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (exitFs) exitFs.call(document).catch(function () {});
      }
    }

    // 監聽全螢幕狀態變化（使用者從外部退出全螢幕時同步關閉遮罩）
    function onDesktopFullscreenChange() {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (overlay.root.classList.contains('active')) {
          overlay.root.classList.remove('active');
          document.body.style.overflow = '';
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
        }
      }
    }
    document.addEventListener('fullscreenchange', onDesktopFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onDesktopFullscreenChange);

    // 螢幕方向改變時重新初始化畫布尺寸
    window.addEventListener('orientationchange', function () {
      if (overlay.root.classList.contains('active')) {
        setTimeout(initOverlayCanvas, 150);
      }
    });

    // ============================
    // 座標計算（處理直向螢幕旋轉 90°）
    // ============================
    function getPos(e) {
      var touch = e.touches ? e.touches[0] : e;
      var sx = touch.clientX;
      var sy = touch.clientY;
      var rect = overlayCanvas.getBoundingClientRect();
      var isPortrait = window.matchMedia('(orientation: portrait)').matches;

      if (isPortrait) {
        // CSS rotate(90deg) 下的座標轉換
        var bcx = rect.left + rect.width / 2;
        var bcy = rect.top + rect.height / 2;
        var ecx = overlayCanvas.width / 2;
        var ecy = overlayCanvas.height / 2;
        var dx = sx - bcx;
        var dy = sy - bcy;
        return { x: ecx + dy, y: ecy - dx };
      } else {
        return {
          x: (sx - rect.left) / rect.width * overlayCanvas.width,
          y: (sy - rect.top) / rect.height * overlayCanvas.height
        };
      }
    }

    // ============================
    // 遮罩畫布繪圖事件
    // ============================
    overlayCanvas.addEventListener('mousedown', function (e) {
      if (!overlayCtx) return;
      isDrawing = true;
      hasStrokes = true;
      var pos = getPos(e);
      overlayCtx.beginPath();
      overlayCtx.moveTo(pos.x, pos.y);
    });
    overlayCanvas.addEventListener('mousemove', function (e) {
      if (!isDrawing || !overlayCtx) return;
      var pos = getPos(e);
      overlayCtx.lineTo(pos.x, pos.y);
      overlayCtx.stroke();
    });
    overlayCanvas.addEventListener('mouseup', function () { isDrawing = false; });
    overlayCanvas.addEventListener('mouseleave', function () { isDrawing = false; });

    overlayCanvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      if (!overlayCtx) return;
      isDrawing = true;
      hasStrokes = true;
      var pos = getPos(e);
      overlayCtx.beginPath();
      overlayCtx.moveTo(pos.x, pos.y);
    });
    overlayCanvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      if (!isDrawing || !overlayCtx) return;
      var pos = getPos(e);
      overlayCtx.lineTo(pos.x, pos.y);
      overlayCtx.stroke();
    });
    overlayCanvas.addEventListener('touchend', function () { isDrawing = false; });

    // ============================
    // 遮罩按鈕事件
    // ============================

    // 清除遮罩畫布
    overlay.clearBtn.addEventListener('click', function () {
      if (overlayCtx && overlayCanvas) {
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        hasStrokes = false;
      }
    });

    // 取消 → 關閉遮罩，不儲存
    overlay.cancelBtn.addEventListener('click', function () {
      closeOverlay();
    });

    // 確認簽名 → 儲存並關閉遮罩
    overlay.confirmBtn.addEventListener('click', function () {
      if (!hasStrokes) {
        alert('請先進行簽名');
        return;
      }
      savedDataUrl = overlayCanvas.toDataURL('image/png');
      hasSignature = true;

      // 更新行內預覽
      previewImg.src = savedDataUrl;
      previewImg.style.display = 'block';
      if (placeholder) placeholder.classList.add('hidden');
      if (signatureArea) signatureArea.classList.add('has-signed');

      closeOverlay();

      // 觸發回呼
      if (opts.onConfirm) opts.onConfirm(savedDataUrl);
      if (opts.onDraw) opts.onDraw();
    });

    // ============================
    // 行內按鈕事件
    // ============================

    // 點擊簽名區域 → 開啟全螢幕簽名
    if (signatureArea) {
      signatureArea.style.cursor = 'pointer';
      signatureArea.addEventListener('click', function (e) {
        // 避免點擊停用遮罩或清除按鈕時觸發
        if (e.target.closest('.signature-disabled-overlay') || e.target.closest('button')) return;
        openOverlay();
      });
    }

    // 「確認簽名」按鈕 → 改為開啟全螢幕簽名遮罩
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openOverlay();
      });
    }

    // 「清除簽名」按鈕 → 清除已儲存的簽名預覽
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        savedDataUrl = null;
        hasSignature = false;
        previewImg.src = '';
        previewImg.style.display = 'none';
        if (placeholder) placeholder.classList.remove('hidden');
        if (signatureArea) signatureArea.classList.remove('has-signed');
        if (opts.onClear) opts.onClear();
      });
    }

    // ============================
    // 「此次無需簽名」核取方塊
    // ============================
    if (skipCheckbox) {
      skipCheckbox.addEventListener('change', function () {
        var isSkipped = this.checked;

        if (isSkipped) {
          if (signatureArea) signatureArea.classList.add('disabled');
          if (disabledOverlay) disabledOverlay.style.display = 'flex';
          if (clearBtn) clearBtn.disabled = true;
          if (confirmBtn) confirmBtn.disabled = true;
          // 清除已有簽名
          savedDataUrl = null;
          hasSignature = false;
          previewImg.src = '';
          previewImg.style.display = 'none';
          if (placeholder) placeholder.style.display = 'none';
          if (signatureArea) signatureArea.classList.remove('has-signed');
        } else {
          if (signatureArea) signatureArea.classList.remove('disabled');
          if (disabledOverlay) disabledOverlay.style.display = 'none';
          if (clearBtn) clearBtn.disabled = false;
          if (confirmBtn) confirmBtn.disabled = false;
          if (placeholder) placeholder.style.display = '';
        }
      });

      // 初始化時觸發一次
      skipCheckbox.dispatchEvent(new Event('change'));
    }

    // ============================
    // 公開 API
    // ============================
    return {
      /** 清除簽名 */
      clear: function () {
        savedDataUrl = null;
        hasSignature = false;
        previewImg.src = '';
        previewImg.style.display = 'none';
        if (placeholder) placeholder.classList.remove('hidden');
        if (signatureArea) signatureArea.classList.remove('has-signed');
      },
      /** 取得簽名圖片 Base64 資料 */
      getDataUrl: function () {
        return savedDataUrl || '';
      },
      /** 是否已完成簽名 */
      hasSignature: function () {
        return hasSignature;
      },
      /** 手動開啟全螢幕簽名遮罩 */
      open: function () {
        openOverlay();
      }
    };
  }

  return { init: init };
})();
