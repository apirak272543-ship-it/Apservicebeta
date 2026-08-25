(() => {
  'use strict';
  const M = window.APServiceMPA;
  if (!M) return;
  const esc = value => M.ui.escapeHtml(String(value ?? ''));
  const MIN_REASON = 10;

  const fields = (id, { label = 'เหตุผลการดำเนินการ', placeholder = 'อธิบายสาเหตุและสิ่งที่ตรวจสอบแล้ว', evidenceHint = 'แนบรูปหลักฐานได้ (ไม่บังคับ, JPG/PNG/WebP ไม่เกิน 1 MB)', financial = false } = {}) => `<label class="mpa-field"><span>${esc(label)} <b aria-hidden="true">*</b></span><textarea data-admin-override-reason="${esc(id)}" rows="3" minlength="${MIN_REASON}" maxlength="500" required placeholder="${esc(placeholder)}"></textarea><small class="mpa-muted">อย่างน้อย ${MIN_REASON} ตัวอักษร · ระบบบันทึกพร้อมชื่อและเวลาของ Admin</small></label><label class="mpa-field"><span>หลักฐานรูปภาพ ${financial ? '<b class="mpa-badge">แนะนำสำหรับรายการเงิน</b>' : '<small>(ไม่บังคับ)</small>'}</span><input data-admin-override-evidence="${esc(id)}" type="file" accept="image/jpeg,image/png,image/webp"><span class="mpa-media-preview" data-admin-override-preview="${esc(id)}" hidden><img alt="ตัวอย่างรูปหลักฐานที่เลือก"><small data-admin-override-preview-status></small></span><small class="mpa-muted">${esc(evidenceHint)}</small><output data-admin-override-evidence-status="${esc(id)}" class="mpa-muted"></output></label>`;

  async function upload(root, id) {
    const input = root.querySelector(`[data-admin-override-evidence="${CSS.escape(id)}"]`);
    const status = root.querySelector(`[data-admin-override-evidence-status="${CSS.escape(id)}"]`);
    const file = input?.files?.[0];
    if (!file) return root.dataset[`overrideEvidence${id}`] || '';
    const session = await M.auth.refreshSession(false);
    if (!session?.access_token || !session?.user?.id) throw new Error('เซสชัน Admin หมดอายุ กรุณาเข้าสู่ระบบใหม่');
    if (!window.APServiceMedia?.uploadPrivateImage) throw new Error('Shared Media Service ยังโหลดไม่พร้อม กรุณารีเฟรชหน้าแล้วลองใหม่');
    if (status) status.textContent = 'กำลังเตรียมและอัปโหลดหลักฐาน private…';
    const result = await window.APServiceMedia.uploadPrivateImage(file, {
      url: M.config.url, publishableKey: M.config.publishableKey, accessToken: session.access_token,
      actorId: session.user.id, bucket: 'admin-override-evidence', scope: 'override', mediaType: 'ADMIN_MEDIA', ownerType: 'admin',
      legacySource: { governance: 'admin-override', component: id }
    });
    root.dataset[`overrideEvidence${id}`] = result.storageRef;
    if (status) status.textContent = `แนบหลักฐานแล้ว · ${Math.ceil(result.bytes / 1024)} KB`;
    return result.storageRef;
  }

  async function collect(root, id, summary) {
    const reason = root.querySelector(`[data-admin-override-reason="${CSS.escape(id)}"]`)?.value.trim() || '';
    if (reason.length < MIN_REASON) throw new Error(`กรุณาระบุเหตุผลอย่างน้อย ${MIN_REASON} ตัวอักษร`);
    const evidencePath = await upload(root, id);
    if (summary && !window.confirm(`${summary}\n\nเหตุผล: ${reason}\n\nยืนยันดำเนินการทันทีหรือไม่?`)) throw new Error('ยกเลิกการดำเนินการ');
    return { reason, evidencePath };
  }

  function enhanceAccountModal(modal) {
    const form = modal.querySelector('form[data-control-form]');
    if (!form || form.dataset.adminOverrideEnhanced === 'true') return;
    const heading = modal.querySelector('h2')?.textContent || '';
    if (!/(กำหนดบทบาท|สิทธิ์และสถานะบัญชี|ปรับยอดกระเป๋าเงิน)/.test(heading)) return;
    const reason = form.querySelector('[name="reason"]');
    if (!reason) return;
    form.dataset.adminOverrideEnhanced = 'true';
    reason.required = true; reason.minLength = MIN_REASON; reason.placeholder = 'ระบุสาเหตุและสิ่งที่ตรวจสอบแล้วอย่างน้อย 10 ตัวอักษร';
    const host = reason.closest('label') || reason.parentElement;
    if (!form.querySelector('[data-admin-override-evidence="account"]')) host?.insertAdjacentHTML('afterend', fields('account', { label: 'หลักฐานประกอบ (ไม่บังคับ)', financial: /กระเป๋าเงิน/.test(heading) }));
    const input = form.querySelector('[data-admin-override-evidence="account"]');
    let previewUrl = ''; const preview = form.querySelector('[data-admin-override-preview="account"]'); const clearPreview = () => { if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = ''; } if (preview) { preview.hidden = true; preview.querySelector('img').removeAttribute('src'); preview.querySelector('[data-admin-override-preview-status]').textContent = ''; } }; input?.addEventListener('change', () => { clearPreview(); const file = input.files?.[0]; if (file && preview) { previewUrl = URL.createObjectURL(file); preview.hidden = false; preview.querySelector('img').src = previewUrl; preview.querySelector('[data-admin-override-preview-status]').textContent = `${file.name} · ${Math.ceil(file.size / 1024)} KB · private`; } upload(form, 'account').catch(error => M.ui.setNotice(error.message || 'อัปโหลดหลักฐานไม่สำเร็จ', 'error')); }); modal.addEventListener('close', clearPreview, { once: true });
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    try {
      const target = String(input || '');
      const body = init?.body && typeof init.body === 'string' ? JSON.parse(init.body) : null;
      if (target.includes('/functions/v1/role-access') && body && ['set_account_control', 'set_user_roles', 'adjust_customer_wallet'].includes(body.action)) {
        const form = document.querySelector('form[data-control-form][data-admin-override-enhanced="true"]');
        if (form) body.evidence_path = form.dataset.overrideEvidenceaccount || '';
        init = { ...init, body: JSON.stringify(body) };
      }
    } catch (_) { /* Preserve the existing request when a non-JSON body is used. */ }
    return nativeFetch(input, init);
  };

  const observer = new MutationObserver(() => document.querySelectorAll('.mpa-modal').forEach(enhanceAccountModal));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.dataset.adminOverrideEnhanced !== 'true' || form.dataset.adminOverrideReady === 'true') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const heading = form.closest('.mpa-modal')?.querySelector('h2')?.textContent || 'ดำเนินการกับบัญชี';
    collect(form, 'account', `คุณกำลัง${heading}`).then(() => { form.dataset.adminOverrideReady = 'true'; form.requestSubmit(); }).catch(error => M.ui.setNotice(error.message || 'ยืนยันการดำเนินการไม่สำเร็จ', 'error'));
  }, true);
  addEventListener('pagehide', () => observer.disconnect(), { once: true });

  window.APServiceAdminOverride = Object.freeze({ MIN_REASON, fields, collect, upload });
})();
