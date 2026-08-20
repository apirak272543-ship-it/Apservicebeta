(() => {
  'use strict';
  const M = window.APServiceMPA;
  if (!M) return;
  const esc = value => M.ui.escapeHtml(String(value ?? ''));
  const format = value => value ? new Date(value).toLocaleString('th-TH') : '-';

  async function signedEvidence(path) {
    if (!path) return '';
    const [bucket, ...segments] = String(path).split('/');
    const session = await M.auth.refreshSession(false);
    if (!bucket || !segments.length || !session?.access_token) throw new Error('ไม่สามารถเปิดหลักฐานได้');
    return window.APServiceMedia.createSignedImageUrl({ url: M.config.url, publishableKey: M.config.publishableKey, accessToken: session.access_token, bucket, path: segments.join('/') });
  }

  async function mount() {
    const R = window.APServiceAdminRuntime;
    if (!R?.gate || !R?.app) return;
    const access = await R.gate('audit-log', `<div class="mpa-page-head"><div><p class="admin-page-eyebrow">GOVERNANCE</p><h1>Audit Log การ Override</h1><p>ประวัติการแก้ปัญหาโดย Admin ที่ค้นย้อนกลับได้ พร้อมเหตุผล หลักฐาน และลิงก์ไปยังข้อมูลที่เกี่ยวข้อง</p></div><button class="mpa-button mpa-button-secondary" id="refreshAuditLog">รีเฟรช</button></div><section class="mpa-card"><div class="admin-filter-row"><label class="mpa-field"><span>ประเภท action</span><input id="auditAction" placeholder="เช่น wallet_adjusted"></label><label class="mpa-field"><span>ค้นหาเป้าหมาย</span><input id="auditTarget" placeholder="ชื่อหรือรหัสเป้าหมาย"></label><label class="mpa-field"><span>ตั้งแต่วันที่</span><input id="auditFrom" type="date"></label><label class="mpa-field"><span>ถึงวันที่</span><input id="auditTo" type="date"></label><button class="mpa-button" id="filterAuditLog">ค้นหา</button></div></section><section id="auditLogRows" class="mpa-card" style="margin-top:16px">${M.ui.loading('กำลังโหลด Audit Log…')}</section>`);
    if (!access) return;
    R.user = access.user;
    const host = document.querySelector('#auditLogRows');
    const load = async () => {
      host.innerHTML = M.ui.loading('กำลังโหลด Audit Log…');
      const action = document.querySelector('#auditAction')?.value.trim() || '';
      const target = document.querySelector('#auditTarget')?.value.trim() || '';
      const from = document.querySelector('#auditFrom')?.value || null;
      const to = document.querySelector('#auditTo')?.value || null;
      try {
        const rows = await M.request('rpc/admin_list_override_audit', { method: 'POST', private: true, body: JSON.stringify({ p_action: action, p_target_query: target, p_from: from, p_to: to, p_limit: 200 }) });
        host.innerHTML = rows?.length ? `<div class="mpa-table-wrap"><table class="mpa-table"><thead><tr><th>เวลา</th><th>Admin</th><th>Action</th><th>เป้าหมาย</th><th>เหตุผล</th><th>หลักฐาน</th></tr></thead><tbody>${rows.map(row => `<tr><td>${esc(format(row.created_at))}</td><td>${esc(row.actor_name || row.actor_id || '-')}</td><td><span class="mpa-badge">${esc(row.action)}</span></td><td>${esc(row.target_name || row.target_id || '-')}<small class="mpa-muted">${esc(row.target_type || '')}</small></td><td>${esc(row.reason || '-')}</td><td>${row.evidence_path ? `<button class="mpa-button mpa-button-secondary" type="button" data-audit-evidence="${esc(row.evidence_path)}">เปิดรูป</button>` : '-'}</td></tr>`).join('')}</tbody></table></div>` : M.ui.empty('ไม่พบ Audit Log ตามตัวกรองที่เลือก');
        host.querySelectorAll('[data-audit-evidence]').forEach(button => button.onclick = async () => { try { const url = await signedEvidence(button.dataset.auditEvidence); const popup = window.open(url, '_blank', 'noopener,noreferrer'); if (!popup) M.ui.setNotice('เบราว์เซอร์บล็อกหน้าต่างหลักฐาน กรุณาอนุญาต pop-up', 'error'); } catch (error) { M.ui.setNotice(error.message || 'เปิดหลักฐานไม่สำเร็จ', 'error'); } });
      } catch (error) { host.innerHTML = M.ui.error('โหลด Audit Log ไม่สำเร็จ', error.message); }
    };
    document.querySelector('#refreshAuditLog').onclick = load;
    document.querySelector('#filterAuditLog').onclick = load;
    await load();
  }

  window.APServiceAdminAuditLog = Object.freeze({ mount });
})();
