(() => {
  'use strict';
  if (document.body.dataset.page !== 'accounts') return;
  let observer;

  const closeSheet = sheet => { if (sheet?.open) sheet.close(); sheet?.remove(); };

  function openSheet(card, title, subtitle) {
    document.getElementById('admin-user-actions-sheet')?.remove();
    const sheet = document.createElement('dialog');
    sheet.id = 'admin-user-actions-sheet';
    sheet.className = 'admin-user-action-sheet';
    sheet.innerHTML = `<div class="admin-user-sheet-content"><div class="admin-user-sheet-heading"><div><h2>${title}</h2><p>${subtitle || 'เลือกหมวดที่ต้องการแก้ไข ระบบจะเปิดเฉพาะคำสั่งนั้นและเก็บ audit log สำหรับสิทธิ์หรือการเงิน'}</p></div><button type="button" class="mpa-button mpa-button-secondary admin-user-sheet-close" data-user-sheet-close>ปิด</button></div><div class="admin-user-sheet-actions" data-user-sheet-actions></div></div>`;
    document.body.append(sheet);
    const actions = sheet.querySelector('[data-user-sheet-actions]');
    card.querySelectorAll('.admin-store-card-actions .mpa-button').forEach(button => {
      const action = button.cloneNode(true);
      action.type = 'button';
      action.addEventListener('click', () => { closeSheet(sheet); button.click(); });
      actions.append(action);
    });
    sheet.querySelectorAll('[data-user-sheet-close]').forEach(button => button.addEventListener('click', () => closeSheet(sheet)));
    sheet.addEventListener('cancel', event => { event.preventDefault(); closeSheet(sheet); });
    sheet.showModal();
  }

  function enhance() {
    const host = document.getElementById('operations');
    if (!host || !host.querySelector('.admin-user-grid')) return;
    host.querySelectorAll('.admin-user-card').forEach(card => {
      if (card.dataset.compactReady === 'true') return;
      const title = card.querySelector('h2')?.textContent?.trim() || 'บัญชีผู้ใช้';
      const subtitle = card.querySelector('p')?.textContent?.trim() || '';
      const actions = card.querySelector('.admin-store-card-actions');
      if (!actions || !actions.querySelector('.mpa-button')) return;
      card.dataset.compactReady = 'true';
      card.classList.add('is-compact');
      actions.innerHTML = '<button class="admin-user-manage-trigger" type="button" data-user-manage aria-label="จัดการบัญชี">จัดการ ⋯</button>';
      actions.querySelector('[data-user-manage]').addEventListener('click', () => openSheet(card, title, subtitle));
    });
  }

  observer = new MutationObserver(() => requestAnimationFrame(enhance));
  observer.observe(document.body, { childList: true, subtree: true });
  enhance();
  addEventListener('pagehide', () => observer?.disconnect(), { once: true });
})();
