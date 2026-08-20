(() => {
  'use strict';
  const page = document.body.dataset.page;
  if (!['stores', 'finance'].includes(page)) return;

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const runtime = () => window.APServiceAdminRuntime;
  const notice = (message, state = 'success') => runtime()?.M?.ui?.setNotice(message, state);
  const invoke = async payload => {
    const R = runtime();
    const session = await R?.M?.auth?.refreshSession(false);
    if (!session?.access_token) throw new Error('เซสชัน Admin หมดอายุ กรุณาเข้าสู่ระบบใหม่');
    const response = await fetch(`${R.M.config.url}/functions/v1/role-access`, { method: 'POST', headers: { apikey: R.M.config.publishableKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error || 'ดำเนินการไม่สำเร็จ');
    return result;
  };
  const close = modal => modal.remove();
  const modal = (title, description, content, submitLabel, onSubmit) => {
    const node = document.createElement('div');
    node.className = 'mpa-modal-backdrop';
    node.innerHTML = `<section class="mpa-card mpa-modal admin-store-modal" role="dialog" aria-modal="true"><div class="mpa-page-head"><div><h2 style="margin:0">${esc(title)}</h2><p class="mpa-muted">${esc(description)}</p></div><button type="button" class="mpa-button mpa-button-secondary" data-close>ปิด</button></div><form data-form>${content}<div class="admin-modal-actions"><button type="button" class="mpa-button mpa-button-secondary" data-close>ยกเลิก</button><button type="submit" class="mpa-button">${esc(submitLabel)}</button></div></form></section>`;
    document.body.append(node);
    node.querySelectorAll('[data-close]').forEach(button => button.onclick = () => close(node));
    node.querySelector('[data-form]').onsubmit = async event => {
      event.preventDefault(); const form = event.currentTarget; const submit = form.querySelector('[type="submit"]');
      try { submit.disabled = true; await onSubmit(form, node); close(node); notice('บันทึกเฉพาะข้อมูลในหมวดที่เลือกแล้ว'); location.reload(); }
      catch (error) { submit.disabled = false; notice(error.message || 'บันทึกข้อมูลไม่สำเร็จ', 'error'); }
    };
    return node;
  };
  const storeSelect = 'id,name,phone,category_id,location,legal_name,registration_number,contact_name,contact_email,registered_address,pickup_address,delivery_address,registration_document_url,settlement_gp_percent';
  const loadStore = async id => {
    const rows = await runtime().M.request(`stores?select=${storeSelect}&id=eq.${encodeURIComponent(id)}&limit=1`, { private: true });
    if (!rows?.[0]) throw new Error('ไม่พบข้อมูลร้านค้า');
    return rows[0];
  };
  const field = (name, label, value = '', type = 'text', extra = '') => type === 'textarea'
    ? `<label class="mpa-field admin-form-full">${label}<textarea name="${name}" rows="3" ${extra}>${esc(value)}</textarea></label>`
    : `<label class="mpa-field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
  const saveStoreSection = async (id, section, data) => invoke({ action: 'update_store_section', entity_id: id, section, data });
  const openStoreIdentity = async id => {
    const row = await loadStore(id);
    modal(`ข้อมูลนิติบุคคลและติดต่อ: ${row.name}`, 'แก้เฉพาะชื่อจดทะเบียน เลขทะเบียน ผู้ติดต่อ อีเมล เบอร์โทร และประเภทร้าน', `<div class="admin-form-grid">${field('legal_name', 'ชื่อจดทะเบียน / ชื่อธุรกิจ', row.legal_name)}${field('registration_number', 'เลขทะเบียน / เลขประจำตัวผู้เสียภาษี', row.registration_number)}${field('contact_name', 'ชื่อผู้ติดต่อหลัก', row.contact_name)}${field('contact_email', 'อีเมลติดต่อร้าน', row.contact_email, 'email')}${field('phone', 'เบอร์โทรศัพท์ร้าน', row.phone, 'tel')}${field('category_id', 'ประเภทร้านสำหรับหน้าลูกค้า', row.category_id)}</div>`, 'บันทึกข้อมูลร้าน', async form => {
      const data = {}; ['legal_name', 'registration_number', 'contact_name', 'contact_email', 'phone', 'category_id'].forEach(key => { const value = form.elements[key].value.trim(); if (String(value) !== String(row[key] || '')) data[key] = value; });
      if (!Object.keys(data).length) throw new Error('ยังไม่มีข้อมูลในหมวดนี้ที่เปลี่ยน');
      await saveStoreSection(id, 'identity', data);
    });
  };
  const openStoreAddresses = async id => {
    const row = await loadStore(id); const location = row.location || {};
    modal(`ที่อยู่และพิกัด: ${row.name}`, 'แยกที่อยู่จดทะเบียน จุดรับสินค้า และที่อยู่รับเอกสาร เพื่อไม่เขียนทับพิกัดปฏิบัติการ', `<div class="admin-form-grid">${field('registered_address', 'ที่อยู่จดทะเบียน', row.registered_address, 'textarea')}${field('pickup_address', 'ที่อยู่จุดรับสินค้า / สาขาปฏิบัติการ', row.pickup_address, 'textarea')}${field('delivery_address', 'ที่อยู่รับเอกสาร / ที่อยู่จัดส่ง', row.delivery_address, 'textarea')}${field('location_lat', 'ละติจูดหมุดร้าน', location.lat ?? '', 'number', 'step="any"')}${field('location_lng', 'ลองจิจูดหมุดร้าน', location.lng ?? '', 'number', 'step="any"')}</div>`, 'บันทึกที่อยู่และพิกัด', async form => {
      const data = {}; ['registered_address', 'pickup_address', 'delivery_address'].forEach(key => { const value = form.elements[key].value.trim(); if (value !== String(row[key] || '')) data[key] = value; });
      const lat = Number(form.elements.location_lat.value), lng = Number(form.elements.location_lng.value);
      if (form.elements.location_lat.value || form.elements.location_lng.value) {
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error('พิกัดร้านไม่ถูกต้อง');
        const nextLocation = { ...location, lat, lng, source: 'admin', capturedAt: new Date().toISOString() };
        if (JSON.stringify(nextLocation) !== JSON.stringify(location)) data.location = nextLocation;
      }
      if (!Object.keys(data).length) throw new Error('ยังไม่มีข้อมูลในหมวดนี้ที่เปลี่ยน');
      await saveStoreSection(id, 'addresses', data);
    });
  };
  const openStoreDocument = async id => {
    const row = await loadStore(id);
    modal(`เอกสารร้าน: ${row.name}`, 'อัปโหลดรูปเอกสารจดทะเบียนผ่าน Shared Media Service แบบส่วนตัว จำกัดผลลัพธ์ไม่เกิน 1 MB', `<div class="admin-form-grid">${field('registration_number', 'เลขทะเบียน / เลขประจำตัวผู้เสียภาษี', row.registration_number)}<label class="mpa-field admin-form-full">ภาพเอกสารจดทะเบียน<input name="registration_document" type="file" accept="image/jpeg,image/png,image/webp"></label><p class="mpa-muted admin-form-full">${row.registration_document_url ? 'มีเอกสารเดิมเก็บในพื้นที่ส่วนตัวแล้ว สามารถเลือกไฟล์ใหม่เพื่อแทนที่ได้' : 'ยังไม่มีเอกสารที่อัปโหลด'}</p></div>`, 'บันทึกเอกสารร้าน', async form => {
      const data = {}; const registrationNumber = form.elements.registration_number.value.trim(); if (registrationNumber !== String(row.registration_number || '')) data.registration_number = registrationNumber;
      const file = form.elements.registration_document.files?.[0];
      if (file) { const R = runtime(); const session = await R.M.auth.refreshSession(false); if (!session?.access_token || !session?.user?.id) throw new Error('เซสชัน Admin หมดอายุ'); const uploaded = await window.APServiceMedia.uploadPrivateImage(file, { url: R.M.config.url, publishableKey: R.M.config.publishableKey, accessToken: session.access_token, actorId: session.user.id, bucket: 'store-documents', scope: `store-${id}-registration`, mediaType: 'IDENTITY_DOCUMENT', ownerType: 'store' }); data.registration_document_url = uploaded.storageRef; }
      if (!Object.keys(data).length) throw new Error('กรุณาแก้เลขทะเบียนหรือเลือกเอกสารก่อนบันทึก');
      if (Object.prototype.hasOwnProperty.call(data, 'registration_number')) await saveStoreSection(id, 'identity', { registration_number: data.registration_number });
      if (data.registration_document_url) await saveStoreSection(id, 'documents', { registration_document_url: data.registration_document_url });
    });
  };
  const openStoreGp = async id => {
    const row = await loadStore(id); const history = await runtime().M.request(`store_gp_rate_history?select=previous_gp_percent,gp_percent,effective_at,reason&store_id=eq.${encodeURIComponent(id)}&order=effective_at.desc&limit=12`, { private: true }).catch(() => []);
    const list = history.length ? `<div class="mpa-table-wrap"><table class="mpa-table"><thead><tr><th>เดิม</th><th>ใหม่</th><th>มีผลเมื่อ</th><th>เหตุผล</th></tr></thead><tbody>${history.map(item => `<tr><td>${esc(item.previous_gp_percent)}%</td><td>${esc(item.gp_percent)}%</td><td>${item.effective_at ? new Date(item.effective_at).toLocaleString('th-TH') : '-'}</td><td>${esc(item.reason)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="mpa-muted">ยังไม่มีประวัติการเปลี่ยน GP ระบบจะเริ่มบันทึกจากการเปลี่ยนครั้งนี้</p>';
    modal(`GP และประวัติอัตรา: ${row.name}`, 'GP ใหม่ใช้กับ settlement ที่สร้างหลังจากเปลี่ยนเท่านั้น ไม่ย้อนแก้รอบสรุปยอดเดิม', `<div class="admin-form-grid">${field('gp_percent', 'GP แพลตฟอร์ม (%)', row.settlement_gp_percent ?? 0, 'number', 'min="0" max="100" step="0.01" required')}${field('reason', 'เหตุผลการเปลี่ยน GP', '', 'textarea', 'required maxlength="500"')}</div><section class="mpa-card" style="box-shadow:none;border:1px solid var(--ap-line);margin-top:14px"><h3 style="margin-top:0">ประวัติ GP ล่าสุด</h3>${list}</section>`, 'บันทึกอัตรา GP', async form => {
      await invoke({ action: 'update_store_gp_rate', store_id: id, gp_percent: Number(form.elements.gp_percent.value), reason: form.elements.reason.value.trim() });
    });
  };
  const openFullStoreCreate = () => modal('เพิ่มร้านค้าและบัญชี Merchant', 'เก็บข้อมูลเป็นหมวดเพื่อให้ Admin แก้ไขภายหลังได้โดยไม่เขียนทับข้อมูลธุรกิจส่วนอื่น', `<div class="admin-form-grid">${field('name', 'ชื่อร้านสำหรับแสดงลูกค้า', '', 'text', 'required')}${field('legal_name', 'ชื่อจดทะเบียน / ชื่อธุรกิจ')}${field('registration_number', 'เลขทะเบียน / เลขประจำตัวผู้เสียภาษี')}${field('category_id', 'ประเภทร้านสำหรับหน้าลูกค้า')}${field('phone', 'เบอร์โทรศัพท์ร้าน', '', 'tel', 'required')}${field('contact_name', 'ชื่อผู้ติดต่อหลัก')}${field('contact_email', 'อีเมลติดต่อร้าน', '', 'email')}${field('registered_address', 'ที่อยู่จดทะเบียน', '', 'textarea')}${field('pickup_address', 'ที่อยู่จุดรับสินค้า / สาขาปฏิบัติการ', '', 'textarea')}${field('delivery_address', 'ที่อยู่รับเอกสาร / ที่อยู่จัดส่ง', '', 'textarea')}${field('display_name', 'ชื่อเจ้าของร้าน / Merchant', '', 'text', 'required')}${field('email', 'อีเมลสำหรับเข้าสู่ระบบ Merchant', '', 'email', 'required')}${field('login_id', 'Login ID Merchant', '', 'text', 'required pattern="[A-Za-z0-9._-]{3,32}"')}${field('password', 'รหัสผ่านเริ่มต้น', '', 'password', 'required minlength="8"')}${field('location_lat', 'ละติจูดหมุดร้าน', '', 'number', 'step="any"')}${field('location_lng', 'ลองจิจูดหมุดร้าน', '', 'number', 'step="any"')}</div>`, 'สร้างร้านและบัญชี', async form => {
    const id = `store-${typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Date.now()}`; const latRaw = form.elements.location_lat.value, lngRaw = form.elements.location_lng.value; let location = null;
    if (latRaw || lngRaw) { const lat = Number(latRaw), lng = Number(lngRaw); if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error('พิกัดร้านไม่ถูกต้อง'); location = { lat, lng, source: 'admin', capturedAt: new Date().toISOString() }; }
    const values = key => form.elements[key].value.trim();
    await invoke({ action: 'provision', role: 'store_owner', entity_id: id, email: values('email'), login_id: values('login_id'), display_name: values('display_name'), password: form.elements.password.value, phone: values('phone'), entity: { id, name: values('name'), phone: values('phone'), active: true, legal_name: values('legal_name'), registration_number: values('registration_number'), contact_name: values('contact_name'), contact_email: values('contact_email'), registered_address: values('registered_address'), pickup_address: values('pickup_address'), delivery_address: values('delivery_address'), category_id: values('category_id'), location } });
  });
  const enhanceStores = () => {
    const host = document.getElementById('stores'); if (!host) return;
    const create = document.getElementById('createStore');
    if (create && !create.dataset.fullCreateReady) { create.dataset.fullCreateReady = 'true'; create.addEventListener('click', event => { event.preventDefault(); event.stopImmediatePropagation(); openFullStoreCreate(); }, true); }
    host.querySelectorAll('.admin-store-card').forEach(card => {
      if (card.dataset.completenessReady) return;
      const id = card.querySelector('[data-store-general]')?.dataset.storeGeneral; const actions = card.querySelector('.admin-store-card-actions');
      if (!id || !actions) return;
      card.dataset.completenessReady = 'true';
      [['identity', 'ข้อมูลธุรกิจ/ติดต่อ'], ['addresses', 'ที่อยู่/พิกัด'], ['documents', 'เอกสารร้าน'], ['gp', 'GP/ประวัติอัตรา']].forEach(([kind, label]) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'mpa-button mpa-button-secondary'; button.dataset.storeComplete = `${kind}:${id}`; button.textContent = label; actions.insertBefore(button, actions.firstChild); });
      actions.querySelectorAll('[data-store-complete]').forEach(button => button.onclick = () => { const [kind, storeId] = button.dataset.storeComplete.split(':'); ({ identity: openStoreIdentity, addresses: openStoreAddresses, documents: openStoreDocument, gp: openStoreGp }[kind])(storeId).catch(error => notice(error.message || 'เปิดข้อมูลร้านไม่สำเร็จ', 'error')); });
    });
  };
  const payoutRows = host => [...host.querySelectorAll('[data-withdrawal-approve],[data-withdrawal-pay],[data-withdrawal-reject],[data-withdrawal-proof]')].map(button => ({ id: button.dataset.withdrawalApprove || button.dataset.withdrawalPay || button.dataset.withdrawalReject || button.dataset.withdrawalProof, actionBox: button.parentElement })).filter(row => row.id);
  const money = value => runtime()?.M?.ui?.baht(value || 0) || `${value || 0} บาท`;
  const openWithdrawalDetail = async (id, continueButton) => {
    const detail = await invoke({ action: 'get_withdrawal_review_detail', request_id: id }); const w = detail.withdrawal || {}; const r = detail.recipient || {}; const payout = w.payout_snapshot && typeof w.payout_snapshot === 'object' ? w.payout_snapshot : {};
    const rows = [['ผู้รับเงิน', r.name || w.recipient_name || '-'], ['โทรศัพท์', r.phone || '-'], ['อีเมล', r.email || '-'], ['ที่อยู่', r.address || '-'], ['ประเภทรายการ', w.recipient_type || '-'], ['ยอดที่ขอถอน', money(w.amount)], ['ชื่อบัญชี/ผู้รับ', payout.account_name || payout.accountName || payout.recipient_name || '-'], ['ธนาคาร/ช่องทาง', payout.bank_name || payout.bank || payout.channel || '-'], ['เลขบัญชี/พร้อมเพย์', payout.account_number || payout.accountNumber || payout.promptpay || '-'], ['QR ที่ลงทะเบียน', payout.qr_url || payout.qrUrl || '-'], ['หมายเหตุผู้ขอ', w.recipient_note || '-']];
    const node = document.createElement('div'); node.className = 'mpa-modal-backdrop'; node.innerHTML = `<section class="mpa-card mpa-modal admin-store-modal" role="dialog" aria-modal="true"><div class="mpa-page-head"><div><h2 style="margin:0">ตรวจผู้รับและช่องทางรับเงิน</h2><p class="mpa-muted">ตรวจข้อมูล snapshot ณ เวลาส่งคำขอ ก่อนอนุมัติหรือบันทึกการโอน</p></div><button type="button" class="mpa-button mpa-button-secondary" data-close>ปิด</button></div><dl class="admin-withdrawal-review-grid">${rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${payout.qr_url || payout.qrUrl ? `<img src="${esc(payout.qr_url || payout.qrUrl)}" alt="QR ผู้รับเงิน" class="admin-withdrawal-qr">` : ''}<div class="admin-modal-actions"><button type="button" class="mpa-button mpa-button-secondary" data-close>กลับ</button>${continueButton ? '<button type="button" class="mpa-button" data-continue>ยืนยันข้อมูลแล้ว ดำเนินการต่อ</button>' : ''}</div></section>`; document.body.append(node); node.querySelectorAll('[data-close]').forEach(button => button.onclick = () => close(node)); node.querySelector('[data-continue]')?.addEventListener('click', () => { close(node); continueButton.dataset.withdrawalReviewAccepted = 'true'; continueButton.click(); });
  };
  const refundLabel = status => ({ requested: 'รอตรวจสอบ', approved: 'อนุมัติแล้ว รอโอน', rejected: 'ปฏิเสธ', paid: 'โอนคืนแล้ว', cancelled: 'ยกเลิก' }[String(status || '').toLowerCase()] || String(status || '-'));
  const refundMoney = value => runtime()?.M?.ui?.baht(value || 0) || `${Number(value || 0).toFixed(2)} บาท`;
  const refundIdempotency = action => `refund-${action}-${typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
  const refundRows = async () => {
    const R = runtime();
    const [refunds, orders] = await Promise.all([
      R.M.request('order_refunds?select=id,order_id,customer_id,requested_amount,approved_amount,paid_amount,currency,status,reason,approved_at,paid_at,payment_reference,proof_image_url,created_at&order=created_at.desc&limit=500', { private: true, forceFresh: true }),
      R.M.request('delivery_orders?select=id,customer_name,store_name,status,payable,payment_method&order=ordered_at.desc&limit=1000', { private: true, cacheTtlMs: 15_000 }),
    ]);
    const byOrder = new Map((orders || []).map(row => [String(row.id), row]));
    return (refunds || []).map(row => ({ ...row, order: byOrder.get(String(row.order_id)) || {} }));
  };
  const openRefundProof = async row => {
    const stored = String(row.proof_image_url || '');
    if (!stored) return notice('รายการนี้ยังไม่มีหลักฐานการโอนคืน', 'error');
    try {
      const R = runtime(); const session = await R.M.auth.refreshSession(false); if (!session?.access_token) throw new Error('เซสชัน Admin หมดอายุ');
      const parts = stored.split('/'); const bucket = parts.shift(); const path = parts.join('/');
      if (!bucket || !path) throw new Error('ตำแหน่งหลักฐานคืนเงินไม่ถูกต้อง');
      const url = await window.APServiceMedia.createSignedImageUrl({ url: R.M.config.url, publishableKey: R.M.config.publishableKey, accessToken: session.access_token, bucket, path });
      const node = document.createElement('div'); node.className = 'mpa-modal-backdrop'; node.innerHTML = `<section class="mpa-card mpa-modal" role="dialog" aria-modal="true"><div class="mpa-page-head"><div><h2 style="margin:0">หลักฐานการโอนคืน</h2><p class="mpa-muted">ออร์เดอร์ ${esc(row.order_id)}</p></div><button type="button" class="mpa-button mpa-button-secondary" data-close>ปิด</button></div><img src="${esc(url)}" alt="หลักฐานการโอนคืนออร์เดอร์ ${esc(row.order_id)}" style="display:block;width:100%;max-height:70vh;object-fit:contain;border:1px solid var(--ap-line);border-radius:12px;background:#f8faf9" referrerpolicy="no-referrer"></section>`;
      node.querySelector('[data-close]').onclick = () => node.remove(); document.body.append(node);
    } catch (error) { notice(error.message || 'เปิดหลักฐานคืนเงินไม่สำเร็จ', 'error'); }
  };
  const openRefundAction = async (row, afterSave) => {
    const isRequested = row.status === 'requested'; const isApproved = row.status === 'approved';
    if (!isRequested && !isApproved) return notice('รายการนี้ไม่อยู่ในสถานะที่ดำเนินการต่อได้', 'error');
    const action = isRequested ? 'approve' : 'mark_paid';
    const title = action === 'approve' ? `พิจารณาคืนเงิน · ${row.order_id}` : `บันทึกการโอนคืน · ${row.order_id}`;
    const amountLabel = action === 'approve' ? 'ยอดอนุมัติคืนเงิน' : 'ยอดที่โอนคืน';
    const defaultAmount = action === 'approve' ? row.requested_amount : row.approved_amount;
    const content = `${action === 'approve' ? `<label class="mpa-field"><span>${amountLabel}</span><input name="amount" type="number" min="0.01" max="${esc(row.requested_amount)}" step="0.01" value="${esc(defaultAmount)}" required></label><label class="mpa-field"><span>ผลพิจารณา</span><select name="decision"><option value="approve">อนุมัติคำขอคืนเงิน</option><option value="reject">ปฏิเสธคำขอคืนเงิน</option></select></label>` : `<label class="mpa-field"><span>${amountLabel}</span><input name="amount" type="number" min="0.01" max="${esc(row.approved_amount)}" step="0.01" value="${esc(defaultAmount)}" required></label><label class="mpa-field"><span>เลขอ้างอิงการโอน</span><input name="reference" maxlength="120" placeholder="เช่น TXN-20260820-001"></label><label class="mpa-field"><span>หลักฐานการโอนคืน (ถ้ามี)</span><input name="proof" type="file" accept="image/jpeg,image/png,image/webp"><small class="mpa-muted">ต้องมีเลขอ้างอิงหรือหลักฐานอย่างน้อยหนึ่งอย่าง</small></label>`}<label class="mpa-field admin-form-full"><span>เหตุผล / หมายเหตุ</span><textarea name="reason" rows="3" minlength="10" maxlength="1000" required placeholder="ระบุข้อมูลที่ตรวจสอบและเหตุผลอย่างน้อย 10 ตัวอักษร">${action === 'approve' ? esc(row.reason || '') : ''}</textarea></label><dl class="admin-withdrawal-review-grid"><div><dt>ออร์เดอร์</dt><dd>${esc(row.order_id)}</dd></div><div><dt>ลูกค้า</dt><dd>${esc(row.order.customer_name || row.customer_id || '-')}</dd></div><div><dt>ร้านค้า</dt><dd>${esc(row.order.store_name || '-')}</dd></div><div><dt>สถานะคำขอ</dt><dd>${esc(refundLabel(row.status))}</dd></div><div><dt>ยอดที่ขอ</dt><dd>${refundMoney(row.requested_amount)}</dd></div>${row.approved_amount !== null && row.approved_amount !== undefined ? `<div><dt>ยอดที่อนุมัติ</dt><dd>${refundMoney(row.approved_amount)}</dd></div>` : ''}</dl>`;
    modal(title, 'การดำเนินการนี้จะบันทึก Audit และแจ้ง Customer ตามสถานะจริงของ Server', content, action === 'approve' ? 'บันทึกผลพิจารณา' : 'บันทึกว่าโอนคืนแล้ว', async form => {
      const reason = form.elements.reason.value.trim(); const amount = Number(form.elements.amount.value); const decision = form.elements.decision?.value || action;
      if (reason.length < 10) throw new Error('กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร');
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('กรุณาระบุยอดเงินที่ถูกต้อง');
      let proofImageUrl = null;
      if (action === 'mark_paid') {
        const reference = form.elements.reference.value.trim(); const file = form.elements.proof.files?.[0];
        if (!reference && !file) throw new Error('กรุณาระบุเลขอ้างอิงหรือเลือกหลักฐานการโอนอย่างน้อยหนึ่งอย่าง');
        if (file) {
          const R = runtime(); const session = await R.M.auth.refreshSession(false); if (!session?.access_token || !session?.user?.id) throw new Error('เซสชัน Admin หมดอายุ');
          const uploaded = await window.APServiceMedia.uploadPrivateImage(file, { url: R.M.config.url, publishableKey: R.M.config.publishableKey, accessToken: session.access_token, actorId: session.user.id, bucket: 'refund-proofs', scope: `refund-${row.id}`, mediaType: 'REFUND_PROOF', ownerType: 'order_refund' });
          proofImageUrl = uploaded.storageRef;
        }
        await invoke({ action: 'process_order_refund', refund_id: row.id, refund_action: 'mark_paid', paid_amount: amount, payment_reference: reference || null, proof_image_url: proofImageUrl, reason, idempotency_key: refundIdempotency('paid') });
      } else {
        await invoke({ action: 'process_order_refund', refund_id: row.id, refund_action: decision, approved_amount: decision === 'approve' ? amount : null, reason, idempotency_key: refundIdempotency(decision) });
      }
      await afterSave();
    });
  };
  const enhanceRefundQueue = async host => {
    if (!host || host.querySelector('[data-refund-queue]') || host.dataset.refundQueueLoading === 'true') return;
    host.dataset.refundQueueLoading = 'true';
    try {
      const rows = await refundRows();
      const section = document.createElement('section'); section.dataset.refundQueue = 'true'; section.style.marginTop = '24px';
      const actionable = rows.filter(row => ['requested', 'approved'].includes(row.status)).length;
      section.innerHTML = `<div class="admin-section-head"><div><h2 style="margin:0">คิวคืนเงินออร์เดอร์</h2><p class="mpa-muted">ตรวจคำขอจาก Cancellation และบันทึกผลการโอนคืนใน State Machine เดิม · งานค้าง ${actionable} รายการ</p></div><button type="button" class="mpa-button mpa-button-secondary" data-refund-refresh>รีเฟรชคิวคืนเงิน</button></div>${rows.length ? `<div class="mpa-table-wrap"><table class="mpa-table"><thead><tr><th>สร้างเมื่อ</th><th>ออร์เดอร์/ลูกค้า</th><th>ยอด</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>${rows.map(row => `<tr><td>${row.created_at ? new Date(row.created_at).toLocaleString('th-TH') : '-'}</td><td><b>${esc(row.order_id)}</b><br><span class="mpa-muted">${esc(row.order.customer_name || row.customer_id || '-')}</span></td><td>${refundMoney(row.requested_amount)}${row.approved_amount !== null && row.approved_amount !== undefined ? `<br><small>อนุมัติ ${refundMoney(row.approved_amount)}</small>` : ''}${row.paid_amount !== null && row.paid_amount !== undefined ? `<br><small>โอน ${refundMoney(row.paid_amount)}</small>` : ''}</td><td><span class="mpa-badge">${esc(refundLabel(row.status))}</span></td><td><div style="display:flex;gap:7px;flex-wrap:wrap">${row.status === 'requested' || row.status === 'approved' ? `<button type="button" class="mpa-button" data-refund-action="${esc(row.id)}">${row.status === 'requested' ? 'พิจารณา' : 'บันทึกโอนคืน'}</button>` : ''}${row.proof_image_url ? `<button type="button" class="mpa-button mpa-button-secondary" data-refund-proof="${esc(row.id)}">ดูหลักฐาน</button>` : ''}</div></td></tr>`).join('')}</tbody></table></div>` : '<p class="mpa-muted">ยังไม่มีคำขอคืนเงิน</p>'}`;
      host.append(section);
      delete host.dataset.refundQueueLoading;
      section.querySelector('[data-refund-refresh]').onclick = () => { section.remove(); delete host.dataset.refundQueueLoading; enhanceRefundQueue(host); };
      section.querySelectorAll('[data-refund-action]').forEach(button => { const row = rows.find(item => item.id === button.dataset.refundAction); button.onclick = () => openRefundAction(row, async () => { section.remove(); await enhanceRefundQueue(host); location.reload(); }).catch(error => notice(error.message || 'เปิดงานคืนเงินไม่สำเร็จ', 'error')); });
      section.querySelectorAll('[data-refund-proof]').forEach(button => { const row = rows.find(item => item.id === button.dataset.refundProof); button.onclick = () => openRefundProof(row); });
    } catch (error) { delete host.dataset.refundQueueLoading; const section = document.createElement('section'); section.dataset.refundQueue = 'true'; section.style.marginTop = '24px'; section.innerHTML = `<p class="mpa-muted">โหลดคิวคืนเงินไม่สำเร็จ: ${esc(error.message)}</p>`; host.append(section); }
  };
  const enhanceFinance = () => {
    const host = document.getElementById('finance'); if (!host) return;
    enhanceRefundQueue(host);
    payoutRows(host).forEach(({ id, actionBox }) => {
      if (actionBox.querySelector(`[data-withdrawal-detail="${CSS.escape(id)}"]`)) return;
      const detail = document.createElement('button'); detail.type = 'button'; detail.className = 'mpa-button mpa-button-secondary'; detail.dataset.withdrawalDetail = id; detail.textContent = 'ตรวจผู้รับ'; actionBox.prepend(detail);
      detail.onclick = () => openWithdrawalDetail(id).catch(error => notice(error.message || 'โหลดข้อมูลผู้รับเงินไม่สำเร็จ', 'error'));
    });
    host.querySelectorAll('[data-withdrawal-approve],[data-withdrawal-pay],[data-withdrawal-reject]').forEach(button => {
      if (button.dataset.withdrawalReviewGuardReady) return;
      button.dataset.withdrawalReviewGuardReady = 'true'; button.addEventListener('click', event => { if (button.dataset.withdrawalReviewAccepted === 'true') { delete button.dataset.withdrawalReviewAccepted; return; } event.preventDefault(); event.stopImmediatePropagation(); const id = button.dataset.withdrawalApprove || button.dataset.withdrawalPay || button.dataset.withdrawalReject; openWithdrawalDetail(id, button).catch(error => notice(error.message || 'โหลดข้อมูลผู้รับเงินไม่สำเร็จ', 'error')); }, true);
    });
  };
  const observer = new MutationObserver(() => requestAnimationFrame(() => { enhanceStores(); enhanceFinance(); }));
  observer.observe(document.body, { childList: true, subtree: true });
  enhanceStores(); enhanceFinance();
  addEventListener('pagehide', () => observer.disconnect(), { once: true });
})();
