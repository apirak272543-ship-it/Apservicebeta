(() => {
  'use strict';
  if (document.body.dataset.page !== 'operations' || new URLSearchParams(location.search).get('feature') !== 'support') return;
  const runtime = () => window.APServiceAdminRuntime;
  const esc = value => runtime()?.h?.(value) || String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const notice = (message, type) => runtime()?.M?.ui?.setNotice(message, type);
  const invoke = async payload => {
    const R = runtime(); const session = await R?.M?.auth?.refreshSession(false);
    if (!session?.access_token) throw new Error('เซสชัน Admin หมดอายุ กรุณาเข้าสู่ระบบใหม่');
    const response = await fetch(`${R.M.config.url}/functions/v1/role-access`, { method: 'POST', headers: { apikey: R.M.config.publishableKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error || 'ไม่สามารถจัดการบทสนทนาได้');
    return result;
  };
  const key = action => `support-${action}-${typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
  let rows = []; let filter = 'open'; let search = ''; let selected = null;
  const loadRows = async () => {
    const R = runtime();
    rows = await R.M.request('support_conversations?select=id,customer_id,customer_name,status,last_message_at,created_at&order=last_message_at.desc&limit=300', { private: true, forceFresh: true });
  };
  const openConversation = async row => {
    selected = row;
    const R = runtime(); const messages = await R.M.request(`support_messages?select=id,sender_id,sender_role,body,created_at&conversation_id=eq.${encodeURIComponent(row.id)}&order=created_at.asc&limit=300`, { private: true, forceFresh: true });
    const detail = document.querySelector('[data-support-detail]'); if (!detail) return;
    detail.innerHTML = `<div class="mpa-page-head"><div><p class="admin-page-eyebrow">SUPPORT INBOX</p><h2 style="margin:0">${esc(row.customer_name || row.customer_id || 'Customer')}</h2><p class="mpa-muted">${esc(row.id)} · ${row.last_message_at ? new Date(row.last_message_at).toLocaleString('th-TH') : '-'}</p></div><span class="mpa-badge">${row.status === 'open' ? 'เปิดอยู่' : 'ปิดแล้ว'}</span></div><div data-support-thread style="min-height:260px;max-height:48vh;overflow:auto;background:var(--ap-surface-muted,#f7fbfa);border:1px solid var(--ap-line);border-radius:15px;padding:12px;display:flex;flex-direction:column;gap:9px">${messages?.length ? messages.map(message => `<article style="max-width:84%;padding:10px 12px;border-radius:14px;background:${message.sender_role === 'admin' ? 'var(--ap-brand)' : '#fff'};color:${message.sender_role === 'admin' ? '#fff' : 'var(--ap-ink)'};border:1px solid ${message.sender_role === 'admin' ? 'var(--ap-brand)' : 'var(--ap-line)'};align-self:${message.sender_role === 'admin' ? 'flex-end' : 'flex-start'}"><div>${esc(message.body)}</div><small style="display:block;margin-top:5px;opacity:.72">${message.created_at ? new Date(message.created_at).toLocaleString('th-TH') : '-'} · ${message.sender_role === 'admin' ? 'Admin' : 'Customer'}</small></article>`).join('') : '<p class="mpa-muted" style="margin:auto">ยังไม่มีข้อความในบทสนทนานี้</p>'}</div><form data-support-reply style="display:flex;gap:8px;margin-top:12px"><textarea name="body" rows="3" maxlength="1500" ${row.status === 'open' ? 'required' : 'disabled'} placeholder="พิมพ์ข้อความตอบกลับ Customer…"></textarea><button class="mpa-button" type="submit" ${row.status === 'open' ? '' : 'disabled'}>ส่ง</button></form><div class="admin-modal-actions" style="justify-content:flex-start;margin-top:10px"><button type="button" class="mpa-button mpa-button-secondary" data-support-toggle>${row.status === 'open' ? 'ปิดบทสนทนา' : 'เปิดบทสนทนาอีกครั้ง'}</button></div>`;
    const thread = detail.querySelector('[data-support-thread]'); if (thread) thread.scrollTop = thread.scrollHeight;
    detail.querySelector('[data-support-reply]')?.addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const body = form.elements.body.value.trim(); if (!body) return; const submit = form.querySelector('[type="submit"]'); submit.disabled = true; try { await invoke({ action: 'support_conversation', conversation_id: row.id, support_action: 'reply', body, idempotency_key: key('reply') }); notice('ส่งข้อความถึง Customer แล้ว'); await load(); render(); await openConversation(rows.find(item => item.id === row.id) || row); } catch (error) { submit.disabled = false; notice(error.message, 'error'); } });
    detail.querySelector('[data-support-toggle]')?.addEventListener('click', async event => { const button = event.currentTarget; const action = row.status === 'open' ? 'close' : 'reopen'; const reason = window.prompt(action === 'close' ? 'ระบุเหตุผลการปิดบทสนทนา' : 'ระบุเหตุผลการเปิดบทสนทนาอีกครั้ง', action === 'close' ? 'ดำเนินการช่วยเหลือเสร็จสิ้น' : 'Customer ต้องการความช่วยเหลือเพิ่มเติม'); if (reason === null || reason.trim().length < 3) return; button.disabled = true; try { await invoke({ action: 'support_conversation', conversation_id: row.id, support_action: action, body: reason.trim(), idempotency_key: key(action) }); notice(action === 'close' ? 'ปิดบทสนทนาแล้ว' : 'เปิดบทสนทนาอีกครั้งแล้ว'); await load(); render(); await openConversation(rows.find(item => item.id === row.id) || row); } catch (error) { button.disabled = false; notice(error.message, 'error'); } });
  };
  const render = () => {
    const host = document.getElementById('operations'); if (!host) return;
    const visible = rows.filter(row => (filter === 'all' || row.status === filter) && (!search || `${row.customer_name || ''} ${row.customer_id || ''} ${row.id || ''}`.toLowerCase().includes(search.toLowerCase())));
    if (selected && !visible.some(row => row.id === selected.id)) selected = null;
    host.innerHTML = `<div class="admin-workspace-layout"><section><div class="admin-section-head"><div><p class="admin-page-eyebrow">SUPPORT INBOX</p><h2 style="margin:0">บทสนทนาลูกค้า</h2><p class="mpa-muted">ตอบกลับจาก Admin โดยบันทึก Audit, สถานะ และ Notification ผ่าน Server</p></div><button type="button" class="mpa-button mpa-button-secondary" data-support-refresh>รีเฟรช</button></div><div class="admin-filter-row" style="margin:12px 0"><button class="mpa-button ${filter === 'open' ? '' : 'mpa-button-secondary'}" data-support-filter="open">เปิดอยู่ (${rows.filter(row => row.status === 'open').length})</button><button class="mpa-button ${filter === 'closed' ? '' : 'mpa-button-secondary'}" data-support-filter="closed">ปิดแล้ว (${rows.filter(row => row.status === 'closed').length})</button><button class="mpa-button ${filter === 'all' ? '' : 'mpa-button-secondary'}" data-support-filter="all">ทั้งหมด (${rows.length})</button></div><label class="mpa-field"><span>ค้นหา Customer หรือ Conversation ID</span><input type="search" data-support-search value="${esc(search)}" placeholder="ชื่อ ลูกค้า หรือรหัสบทสนทนา"></label><div class="admin-workspace-thread-list" style="margin-top:12px">${visible.length ? visible.map(row => `<button type="button" class="mpa-button ${selected?.id === row.id ? '' : 'mpa-button-secondary'}" data-support-row="${esc(row.id)}"><b>${esc(row.customer_name || row.customer_id || 'Customer')}</b><br><small>${esc(row.status === 'open' ? 'เปิดอยู่' : 'ปิดแล้ว')} · ${row.last_message_at ? new Date(row.last_message_at).toLocaleString('th-TH') : '-'}</small></button>`).join('') : '<p class="mpa-muted">ไม่พบบทสนทนาตามตัวกรอง</p>'}</div></section><section data-support-detail class="mpa-card admin-workspace-detail" style="box-shadow:none">${selected ? '<p class="mpa-muted">กำลังโหลดบทสนทนา…</p>' : '<p class="mpa-muted">เลือกบทสนทนาเพื่อดูข้อความและตอบกลับ</p>'}</section></div>`;
    host.querySelector('[data-support-refresh]').onclick = () => load().then(() => { render(); if (selected) openConversation(rows.find(item => item.id === selected.id) || null); }).catch(error => notice(error.message, 'error'));
    host.querySelectorAll('[data-support-filter]').forEach(button => button.onclick = () => { filter = button.dataset.supportFilter; render(); });
    host.querySelector('[data-support-search]').oninput = event => { search = event.target.value.trim(); render(); };
    host.querySelectorAll('[data-support-row]').forEach(button => button.onclick = () => { const row = rows.find(item => item.id === button.dataset.supportRow); if (row) openConversation(row).catch(error => notice(error.message, 'error')); });
    if (selected) openConversation(rows.find(item => item.id === selected.id) || selected).catch(error => notice(error.message, 'error'));
  };
  const mount = async () => {
    const R = runtime(); const host = document.getElementById('operations');     if (!R || !host || host.dataset.supportInboxMounted === 'true') return;
    if (!host.querySelector('table')) return;

    host.dataset.supportInboxMounted = 'true';
    try { await loadRows(); render(); } catch (error) { host.innerHTML = R.M.ui.error('โหลด Support Inbox ไม่สำเร็จ', error.message); }
  };
  const observer = new MutationObserver(() => requestAnimationFrame(() => { void mount(); }));
  observer.observe(document.body, { childList: true, subtree: true });
  const timer = setInterval(() => { void mount(); }, 250);
  addEventListener('pagehide', () => { observer.disconnect(); clearInterval(timer); }, { once: true });
  void mount();
})();
