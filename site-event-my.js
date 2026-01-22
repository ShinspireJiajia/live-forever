/**
 * ============================================
 * 我的活動紀錄（使用者）
 * 檔案：js/site-event-my.js
 * 說明：依據 site-event-registration 的規則，顯示個人報名紀錄、繳費狀態與活動資訊。
 * - 來源資料：SiteEventMockData（events, registrations）
 * - 過濾條件：案場、報名狀態
 * - 使用者識別：URL 參數 member_id（未提供則示範用固定值）
 * ============================================
 */

(function () {
  /** 解析 URL 參數取得 member_id */
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  /**
   * 友善時間格式化：YYYY/MM/DD HH:mm
   * 中文註解：輸入 ISO 字串，輸出精簡的年月日時分
   */
  function fmtDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${day} ${hh}:${mm}`;
  }

  /**
   * 時間區段顯示（精簡不換行）：
   * - 若同一天：YYYY/MM/DD HH:mm–HH:mm
   * - 若跨天：YYYY/MM/DD HH:mm – YYYY/MM/DD HH:mm
   * 中文註解：避免過長導致換行，採用更短的格式呈現
   */
  function renderTimeRange(startIso, endIso) {
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (isNaN(s) || isNaN(e)) return '';
    const sameDay = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth() && s.getDate() === e.getDate();
    const y = s.getFullYear();
    const m = String(s.getMonth() + 1).padStart(2, '0');
    const day = String(s.getDate()).padStart(2, '0');
    const sh = String(s.getHours()).padStart(2, '0');
    const sm = String(s.getMinutes()).padStart(2, '0');
    const eh = String(e.getHours()).padStart(2, '0');
    const em = String(e.getMinutes()).padStart(2, '0');
    if (sameDay) {
      return `${y}/${m}/${day} ${sh}:${sm}–${eh}:${em}`;
    }
    const ey = e.getFullYear();
    const emon = String(e.getMonth() + 1).padStart(2, '0');
    const eday = String(e.getDate()).padStart(2, '0');
    return `${y}/${m}/${day} ${sh}:${sm} – ${ey}/${emon}/${eday} ${eh}:${em}`;
  }

  /** 顯示簡易 Toast 提示 */
  function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="icon"><i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-circle-xmark' : 'fa-info-circle'}"></i></span>
      <span class="msg">${message}</span>
      <button class="close" aria-label="關閉" style="margin-left:auto;background:none;border:none;cursor:pointer;color:#999;">\u00D7</button>
    `;
    const closeBtn = toast.querySelector('.close');
    closeBtn.addEventListener('click', () => container.removeChild(toast));
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 3500);
  }

  /** 狀態正規化：舊值對映到新狀態 */
  function normalizeStatus(s) {
    if (!s) return '';
    if (s === '待繳費' || s === '未繳費') return '未繳費';
    if (s === '已報名' || s === '已繳費') return '已繳費';
    if (s === '已退費') return '已退費';
    if (s === '已取消') return '已取消';
    return s;
  }

  /** 依狀態回傳徽章 HTML（採用新四態） */
  function renderStatusBadge(statusRaw) {
    const status = normalizeStatus(statusRaw);
    const map = {
      '已繳費': { cls: 'badge-paid', icon: 'fa-check-circle' },
      '未繳費': { cls: 'badge-pending', icon: 'fa-clock' },
      '已退費': { cls: 'badge-refund', icon: 'fa-rotate-left' },
      '已取消': { cls: 'badge-cancelled', icon: 'fa-ban' }
    };
    const m = map[status] || { cls: 'badge-cancelled', icon: 'fa-ban' };
    return `<span class="badge ${m.cls}" aria-label="${status}"><i class="fa-solid ${m.icon}"></i>${status}</span>`;
  }

  /** 建立事件索引方便查詢 */
  const eventIndex = {};
  (SiteEventMockData.events || []).forEach(ev => { eventIndex[ev.event_id] = ev; });

  /** 畫面初始化 */
  document.addEventListener('DOMContentLoaded', () => {
    const memberId = getQueryParam('member_id') || 'MBR00312'; // 示範：預設成一位使用者
    const registrations = (SiteEventMockData.registrations || []).filter(r => r.member_id === memberId);

    // 初始化案場選單（中文註解：本頁未提供案場篩選則跳過）
    const siteSelect = document.getElementById('filterSite');
    const sites = SiteEventMockData.sites || [];
    if (siteSelect) {
      siteSelect.innerHTML = `<option value="">全部案場</option>` + sites.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }

    // 綁定查詢表單（本頁已移除表單，以下為防禦性寫法）
    const form = document.getElementById('filterForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        renderList();
      });
      form.addEventListener('reset', () => {
        // 中文註解：重置下拉後，同步 chips 狀態回「全部」
        setTimeout(() => {
          setActiveChip('');
          renderList();
        }, 0);
      });
    }

    // 狀態 chips 快速篩選
    const chipsWrap = document.getElementById('statusChips');
    function setActiveChip(statusVal) {
      // 同步下拉選單值
      const sel = document.getElementById('filterStatus');
      if (sel) sel.value = statusVal;
      if (!chipsWrap) return;
      chipsWrap.querySelectorAll('.status-chip').forEach(btn => {
        const v = btn.getAttribute('data-status') || '';
        const isActive = v === statusVal;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }
    if (chipsWrap) {
      chipsWrap.addEventListener('click', (e) => {
        const btn = e.target.closest('.status-chip');
        if (!btn) return;
        const statusVal = btn.getAttribute('data-status') || '';
        setActiveChip(statusVal);
        renderList();
      });
    }

    // 產生列表與統計
    function renderStats(list) {
      const total = list.length;
      const paid = list.filter(x => normalizeStatus(x.payment_status) === '已繳費').length;
      const pending = list.filter(x => normalizeStatus(x.payment_status) === '未繳費').length;
      const refunded = list.filter(x => normalizeStatus(x.payment_status) === '已退費').length;
      const cancelled = list.filter(x => normalizeStatus(x.payment_status) === '已取消').length;
      const t = document.getElementById('statTotal');
      const p = document.getElementById('statPaid');
      const pend = document.getElementById('statPending');
      const r = document.getElementById('statRefund');
      const c = document.getElementById('statCancelled');
      if (t) t.textContent = total;
      if (p) p.textContent = paid;
      if (pend) pend.textContent = pending;
      if (r) r.textContent = refunded;
      if (c) c.textContent = cancelled;
    }

    function renderList() {
      const site = siteSelect ? (siteSelect.value || '') : '';
      // 由 chips 取得目前狀態，若無 chips 再嘗試下拉（容錯）
      let status = '';
      if (chipsWrap) {
        const active = chipsWrap.querySelector('.status-chip.active');
        status = active ? (active.getAttribute('data-status') || '') : '';
      }
      if (!status) {
        const sel = document.getElementById('filterStatus');
        status = sel ? (sel.value || '') : '';
      }
      const container = document.getElementById('myEventList');

      let list = registrations.slice();
      if (site) list = list.filter(x => x.site_name === site);
      if (status) list = list.filter(x => normalizeStatus(x.payment_status) === status);

      // 更新統計
      renderStats(list);

      if (!list.length) {
        container.innerHTML = `<div class="event-card" role="status">目前沒有符合條件的活動紀錄</div>`;
        return;
      }

      container.innerHTML = list.map(reg => {
        const ev = eventIndex[reg.event_id] || {};
        const timeRange = (ev.start_dt && ev.end_dt) ? renderTimeRange(ev.start_dt, ev.end_dt) : '';
        const amount = typeof reg.amount === 'number' ? reg.amount : 0;
        const amountText = amount.toLocaleString('zh-TW');
        // 中文註解：報名人數 = 本人 + 攜伴人數
        const compCount = typeof reg.companion_count === 'number' ? reg.companion_count : 0;
        const totalPeople = compCount + 1;
        const title = ev.title || '—';
        const location = ev.location || '—';

        const normalized = normalizeStatus(reg.payment_status);
        const canCancelFree = (amount === 0) && normalized !== '已取消' && normalized !== '已退費';

        return `
          <article class="event-card" aria-label="${title}">
            <div class="event-header">
              <h3 class="event-title">${title}</h3>
              ${renderStatusBadge(reg.payment_status)}
            </div>
            <div class="event-meta">
              <div class="meta-row" aria-label="地點">
                <i class="fa-solid fa-location-dot meta-icon" aria-hidden="true"></i>
                <span class="meta-label">地點：</span>
                <span class="meta-value">${location}</span>
              </div>
              <div class="meta-row" aria-label="時間">
                <i class="fa-solid fa-calendar-days meta-icon" aria-hidden="true"></i>
                <span class="meta-label">時間：</span>
                <span class="meta-value time-inline">${timeRange}</span>
              </div>
              <div class="meta-row" aria-label="報名人數">
                <i class="fa-solid fa-user-group meta-icon" aria-hidden="true"></i>
                <span class="meta-label">報名人數：</span>
                <span class="meta-value">${totalPeople} 人</span>
              </div>
              <div class="meta-row" aria-label="金額">
                <i class="fa-solid fa-dollar-sign meta-icon" aria-hidden="true"></i>
                <span class="meta-label">金額：</span>
                <span class="meta-value">$${amountText}</span>
              </div>
            </div>
            <div class="event-actions">
              ${normalized === '未繳費' && amount > 0 ? `
                <button class="btn btn-primary" data-action="pay" data-reg="${reg.reg_id}">
                  <i class="fa-solid fa-credit-card"></i> 前往繳費
                </button>
              ` : ''}
              ${canCancelFree ? `
                <button class="btn btn-danger" data-action="cancel" data-reg="${reg.reg_id}">
                  <i class="fa-solid fa-ban"></i> 取消報名
                </button>
              ` : ''}
              <button class="btn btn-secondary" data-action="detail" data-reg="${reg.reg_id}">
                <i class="fa-solid fa-circle-info"></i> 活動詳情
              </button>
            </div>
          </article>
        `;
      }).join('');

      // 綁定卡片按鈕事件
      container.querySelectorAll('button[data-action="pay"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const regId = btn.getAttribute('data-reg');
          const reg = registrations.find(r => r.reg_id === regId);
          const ev = reg ? eventIndex[reg.event_id] || {} : {};
          openPaymentModal({ reg, event: ev });
        });
      });
      container.querySelectorAll('button[data-action="detail"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const regId = btn.getAttribute('data-reg');
          const reg = registrations.find(r => r.reg_id === regId);
          const ev = eventIndex[reg.event_id] || {};
          const msg = `${ev.title || ''}\n地點：${ev.location || ''}\n時間：${fmtDateTime(ev.start_dt)} - ${fmtDateTime(ev.end_dt)}`;
          showToast('success', msg);
        });
      });

      // 免費活動取消報名
      container.querySelectorAll('button[data-action="cancel"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const regId = btn.getAttribute('data-reg');
          Modal.confirm({
            title: '取消報名確認',
            message: '確認要取消此免費活動的報名嗎？',
            type: 'warning',
            confirmText: '確認取消',
            cancelText: '返回'
          }).then(confirmed => {
            if (confirmed) {
              const reg = registrations.find(r => r.reg_id === regId);
              if (reg) {
                reg.payment_status = '已取消';
                renderList();
                showToast('success', '已取消報名');
              }
            }
          });
        });
      });
    }

    // 初次渲染
    setActiveChip('');
    renderList();

    /**
     * 開啟「線上支付」彈窗
     * 中文註解：依附件樣式，提供支付方式/是否需要收據/金額/下一步
     */
    function openPaymentModal(ctx) {
      const amount = (ctx?.reg?.amount || 0);
      const amountText = amount.toLocaleString('zh-TW');

      const content = `
        <div class="required-note">* 為必填</div>
        <form id="payForm" class="payment-form">
          <div class="form-group">
            <div class="section-title">請選擇支付方式</div>
            <div class="payment-methods">
              <label class="payment-option">
                <input type="radio" name="payMethod" value="credit" checked aria-label="信用卡">
                <span class="label">信用卡</span>
                <span class="brand" aria-hidden="true"><i class="fa-brands fa-cc-visa"></i></span>
              </label>
              <label class="payment-option">
                <input type="radio" name="payMethod" value="transfer" aria-label="轉帳">
                <span class="label">轉帳</span>
                <span class="brand" aria-hidden="true"><i class="fa-solid fa-building-columns"></i></span>
              </label>
            </div>
          </div>

          <div class="form-group" style="margin-top:16px;">
            <div class="section-title">是否需要索取收據</div>
            <div class="receipt-group">
              <label class="form-check">
                <input class="form-check-input" type="radio" name="receipt" value="need" checked>
                <span class="form-check-label">需要</span>
              </label>
              <label class="form-check">
                <input class="form-check-input" type="radio" name="receipt" value="none">
                <span class="form-check-label">不需要</span>
              </label>
            </div>
          </div>

          <div class="amount-row">應支付金額: NT$${amountText}</div>
        </form>
      `;

      const modal = new CRMModal({
        title: '線上支付',
        content,
        size: 'sm',
        showHeader: true,
        showFooter: true,
        footerButtons: [
          { text: '<i class="fa-solid fa-arrow-right"></i> 下一步', class: 'btn-primary btn-next', action: 'confirm' }
        ],
        onConfirm: function() {
          const form = document.getElementById('payForm');
          const method = form.querySelector('input[name="payMethod"]:checked')?.value || 'credit';
          const receipt = form.querySelector('input[name="receipt"]:checked')?.value || 'need';
          showToast('info', `支付方式：${method === 'credit' ? '信用卡' : '轉帳'}；收據：${receipt === 'need' ? '需要' : '不需要'}`);
        },
        onOpen: function() {
          modal.element.classList.add('payment-modal');
        },
        onClose: function() {
          // 關閉後銷毀（避免殘留）
          setTimeout(() => modal.destroy(), 200);
        }
      });

      modal.open();
    }
  });
})();
