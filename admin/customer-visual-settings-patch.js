(() => {
  'use strict';
  const M = window.APServiceMPA;
  if (!M) return;
  const runtime = () => window.APServiceAdminRuntime;

  const esc = value => M.ui.escapeHtml(String(value ?? ''));
  const cleanUrl = value => /^https:\/\//i.test(String(value || '').trim()) ? String(value).trim() : '';
  const pageChoices = [
    ['default', 'ค่าเริ่มต้นทุกหน้า'], ['home', 'หน้าแรก'], ['stores', 'ร้านค้า'], ['store', 'รายละเอียดร้านค้า'],
    ['orders', 'รายการออร์เดอร์'], ['order', 'รายละเอียดออร์เดอร์'], ['checkout', 'ชำระเงิน'], ['profile', 'โปรไฟล์'],
    ['notifications', 'แจ้งเตือน'], ['support', 'ช่วยเหลือ'], ['parcel', 'พัสดุ'], ['retail', 'Retail'],
    ['retail-checkout', 'Retail Checkout'], ['marketplace', 'ตลาดชุมชน'], ['marketplace-item', 'รายละเอียดสินค้า'],
    ['marketplace-new', 'ลงประกาศสินค้า'], ['marketplace-profile', 'โปรไฟล์ตลาด'], ['marketplace-chat', 'แชตตลาด'],
    ['register', 'สมัครสมาชิก'], ['recover', 'กู้คืนบัญชี'], ['update-password', 'ตั้งรหัสผ่านใหม่'], ['privacy', 'นโยบายความเป็นส่วนตัว'],
  ];
  const motionChoices = [
    ['none', 'ไม่ใช้ Motion'], ['summer', 'ฤดูร้อน · แสงอุ่นเบา ๆ'], ['rainy', 'ฤดูฝน · หยดฝน'],
    ['spring', 'ฤดูใบไม้ผลิ · กลีบดอกไม้'], ['songkran', 'สงกรานต์ · ละอองน้ำ'], ['loy_krathong', 'ลอยกระทง · แสงเทียนและประกาย'],
    ['christmas', 'คริสต์มาส · หิมะและประกายไฟ'], ['new_year', 'ปีใหม่ · พลุและแสงเฉลิมฉลอง'],
    ['valentines', 'วาเลนไทน์ · หัวใจลอย'], ['halloween', 'ฮาโลวีน · หมอกและค้างคาว'],
    ['lunar_new_year', 'ตรุษจีน · โคมไฟและประกายทอง'], ['ramadan_eid', 'รอมฎอน/อีด · ดาวและแสงจันทร์'],
    ['diwali', 'ดิวาลี · แสงประทีป'], ['winter', 'ฤดูหนาว · หิมะบาง ๆ'],
  ];
  const festivalChoices = [
    ['', 'ไม่ผูกกับเทศกาล'], ['songkran', 'สงกรานต์'], ['loy_krathong', 'ลอยกระทง'], ['christmas', 'คริสต์มาส'],
    ['new_year', 'ปีใหม่สากล'], ['valentines', 'วาเลนไทน์'], ['halloween', 'ฮาโลวีน'], ['lunar_new_year', 'ตรุษจีน'],
    ['ramadan_eid', 'รอมฎอนและอีด'], ['diwali', 'ดิวาลี'], ['summer', 'ฤดูร้อน'], ['rainy', 'ฤดูฝน'], ['winter', 'ฤดูหนาว'],
  ];
  const defaults = () => ({ version: 1, default: { backgroundUrl: '', overlay: 0.86, position: 'center', size: 'cover', motion: 'none' }, festival: { key: '', motion: 'none', active: false, startsAt: '', endsAt: '' }, pages: {} });
  const normalize = value => {
    const base = defaults(); const source = value && typeof value === 'object' ? value : {};
    return { ...base, ...source, default: { ...base.default, ...(source.default || {}) }, festival: { ...base.festival, ...(source.festival || {}) }, pages: source.pages && typeof source.pages === 'object' ? source.pages : {} };
  };
  const labelFor = (choices, key) => choices.find(([value]) => value === key)?.[1] || key || '-';
  const select = (name, value, choices, extra = '') => `<select name="${esc(name)}" ${extra}>${choices.map(([key, label]) => `<option value="${esc(key)}" ${key === value ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>`;
  const field = (label, name, value, type = 'text', extra = '') => `<label class="mpa-field"><span>${esc(label)}</span><input name="${esc(name)}" type="${type}" value="${esc(value)}" ${extra}></label>`;

  const backgroundInput = (name, value, label) => `<div class="admin-content-media-field customer-visual-media-field"><span class="admin-content-media-label">${esc(label)}</span><div class="admin-media-source-actions"><label class="mpa-button mpa-button-secondary">เลือกจากคลังภาพ<input hidden type="file" accept="image/jpeg,image/png,image/webp" data-visual-file data-visual-field="${esc(name)}"></label><label class="mpa-button mpa-button-secondary">ถ่ายรูปด้วยกล้อง<input hidden type="file" accept="image/jpeg,image/png,image/webp" capture="environment" data-visual-file data-visual-field="${esc(name)}"></label></div><input hidden name="${esc(name)}" data-visual-url value="${esc(value)}"><div class="admin-content-media-preview" data-visual-preview="${esc(name)}">${value ? `<img src="${esc(value)}" alt="ตัวอย่างพื้นหลัง ${esc(label)}">` : '<span class="mpa-muted">ยังไม่มีภาพพื้นหลัง</span>'}</div><small class="mpa-muted" data-visual-status="${esc(name)}">รองรับ JPG/PNG/WebP · ระบบบีบอัดก่อนอัปโหลดและตรวจขนาดไม่เกิน 1 MB</small></div>`;

  function render(host, config) {
    const value = normalize(config); const pageRows = pageChoices.filter(([key]) => key !== 'default').map(([key, label]) => {
      const page = { backgroundUrl: '', overlay: value.default.overlay, position: value.default.position, size: value.default.size, motion: 'inherit', ...(value.pages[key] || {}) };
      return `<article class="mpa-card customer-visual-page-card"><div class="mpa-page-head"><div><span class="admin-kicker">CUSTOMER PAGE</span><h3>${esc(label)}</h3><p class="mpa-muted">หน้านี้จะใช้พื้นหลังของตัวเอง ถ้าไม่มีภาพจะย้อนกลับไปใช้ค่าเริ่มต้น</p></div>${select(`page.${key}.motion`, page.motion, [['inherit', 'ใช้ Motion เทศกาล/ค่าเริ่มต้น'], ...motionChoices])}</div><div class="admin-form-grid">${backgroundInput(`page.${key}.backgroundUrl`, cleanUrl(page.backgroundUrl), label)}${field('ความเข้มชั้นขาวทับภาพ 0–1', `page.${key}.overlay`, page.overlay, 'number', 'min="0" max="1" step="0.01"')}${field('ตำแหน่งภาพ', `page.${key}.position`, page.position)}${field('ขนาดภาพ', `page.${key}.size`, page.size)}</div></article>`;
    }).join('');
    host.innerHTML = `<form id="customerVisualSettingsForm"><div class="mpa-page-head"><div><span class="admin-kicker">CUSTOMER VISUAL SYSTEM</span><h2 style="margin:0">พื้นหลังและ Motion ของ Customer App</h2><p class="mpa-muted">อัปโหลดภาพแล้วเลือกให้แสดงแยกแต่ละหน้าได้ ระบบนี้เปลี่ยนเฉพาะภาพพื้นหลังและเอฟเฟกต์ ไม่แตะ route guard, Login/PIN หรือกติกาออร์เดอร์</p></div></div><section class="mpa-card"><h3>ค่าเริ่มต้นและเทศกาล</h3><p class="mpa-muted">ค่าเริ่มต้นใช้กับทุกหน้าที่ไม่ได้ตั้งภาพเฉพาะหน้า ส่วน Motion เป็นเอฟเฟกต์ CSS ที่ทำงานเหนือพื้นหลังและเคารพโหมดลดการเคลื่อนไหวของอุปกรณ์</p><div class="admin-form-grid">${backgroundInput('default.backgroundUrl', cleanUrl(value.default.backgroundUrl), 'พื้นหลังเริ่มต้นทุกหน้า')}${field('ความเข้มชั้นขาวทับภาพ 0–1', 'default.overlay', value.default.overlay, 'number', 'min="0" max="1" step="0.01"')}${field('ตำแหน่งภาพ', 'default.position', value.default.position)}${field('ขนาดภาพ', 'default.size', value.default.size)}<label class="mpa-field"><span>Motion ค่าเริ่มต้น</span>${select('default.motion', value.default.motion, motionChoices)}</label><label class="mpa-field"><span>เทศกาลที่กำลังเลือก</span>${select('festival.key', value.festival.key, festivalChoices)}</label><label class="mpa-field"><span>Motion ของเทศกาล</span>${select('festival.motion', value.festival.motion, motionChoices)}</label><label class="mpa-field"><span>เปิดใช้ Motion เทศกาล</span>${select('festival.active', String(value.festival.active), [['true', 'เปิด'], ['false', 'ปิด']])}</label>${field('เริ่มใช้เทศกาล (ไม่บังคับ)', 'festival.startsAt', value.festival.startsAt, 'datetime-local')}${field('สิ้นสุดเทศกาล (ไม่บังคับ)', 'festival.endsAt', value.festival.endsAt, 'datetime-local')}</div></section><section class="mpa-card"><div class="mpa-page-head"><div><h3>พื้นหลังแยกตามหน้า</h3><p class="mpa-muted">เลือกภาพและ Motion ให้หน้า Profile, Home, ร้านค้า, Checkout และหน้าอื่น ๆ ได้อิสระ</p></div><span class="admin-inline-count">${pageChoices.length - 1} หน้า</span></div>${pageRows}</section><div class="admin-modal-actions"><button class="mpa-button" type="submit">บันทึกพื้นหลังและ Motion</button></div></form>`;
    attach(host);
  }

  function read(form, current) {
    const value = name => String(form.elements[name]?.value || '').trim();
    const number = name => { const n = Number(value(name)); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.86; };
    const next = normalize(current);
    next.default = { backgroundUrl: cleanUrl(value('default.backgroundUrl')), overlay: number('default.overlay'), position: value('default.position') || 'center', size: value('default.size') || 'cover', motion: value('default.motion') || 'none' };
    next.festival = { key: value('festival.key'), motion: value('festival.motion') || 'none', active: value('festival.active') === 'true', startsAt: value('festival.startsAt'), endsAt: value('festival.endsAt') };
    next.pages = {};
    pageChoices.filter(([key]) => key !== 'default').forEach(([key]) => { next.pages[key] = { backgroundUrl: cleanUrl(value(`page.${key}.backgroundUrl`)), overlay: number(`page.${key}.overlay`), position: value(`page.${key}.position`) || 'center', size: value(`page.${key}.size`) || 'cover', motion: value(`page.${key}.motion`) || 'inherit' }; });
    return next;
  }

  function attach(host) {
    host.querySelectorAll('[data-visual-file]').forEach(input => input.addEventListener('change', async event => {
      const file = event.target.files?.[0]; if (!file) return; const name = input.dataset.visualField; const preview = host.querySelector(`[data-visual-preview="${CSS.escape(name)}"]`); const status = host.querySelector(`[data-visual-status="${CSS.escape(name)}"]`); const url = host.querySelector(`[data-visual-url="${CSS.escape(name)}"]`); const local = URL.createObjectURL(file);
      if (preview) preview.innerHTML = `<img src="${esc(local)}" alt="ตัวอย่างภาพก่อนอัปโหลด">`; if (status) status.textContent = `กำลังบีบอัดและอัปโหลด ${file.name}…`;
      try { const session = await M.auth.refreshSession(false); const accessToken = session?.access_token || M.auth.getSession?.()?.access_token; const adminRuntime = runtime(); if (!accessToken || !adminRuntime?.user?.id) throw new Error('เซสชัน Admin ไม่พร้อมสำหรับอัปโหลด'); const uploaded = await window.APServiceMedia.uploadPublicImage(file, { ...M.config, accessToken, actorId: adminRuntime.user.id, bucket: 'catalog-media', scope: 'customer-visuals', pathPrefix: 'admin/customer-visuals', mediaType: 'CUSTOMER_BACKGROUND', ownerType: 'admin', variant: name, legacySource: { field: name, source: 'customer-visual-settings' } }); if (url) url.value = uploaded.publicUrl; if (preview) preview.innerHTML = `<img src="${esc(uploaded.publicUrl)}" alt="ตัวอย่างภาพที่อัปโหลดแล้ว">`; if (status) status.textContent = `อัปโหลดแล้ว · ${Math.ceil(Number(uploaded.bytes || 0) / 1024)} KB`; M.ui.setNotice('อัปโหลดพื้นหลังและสร้างพรีวิวแล้ว'); } catch (error) { if (status) status.textContent = error.message || 'อัปโหลดไม่สำเร็จ'; M.ui.setNotice(error.message || 'อัปโหลดไม่สำเร็จ', 'error'); } finally { URL.revokeObjectURL(local); event.target.value = ''; }
    }));
    host.querySelector('#customerVisualSettingsForm').onsubmit = async event => { event.preventDefault(); const button = event.currentTarget.querySelector('[type="submit"]'); button.disabled = true; try { const currentRows = await M.request('platform_configs?select=value&key=eq.customer_visuals&limit=1', { private: true, forceFresh: true }); const next = read(event.currentTarget, currentRows?.[0]?.value); await M.request('platform_configs?on_conflict=key', { method: 'POST', private: true, headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ key: 'customer_visuals', value: next, updated_at: M.ui.nowIso() }) }); await M.request('admin_action_audit', { method: 'POST', private: true, headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ actor_id: runtime()?.user?.id, action: 'customer_visual_settings_updated', reason: 'ตั้งค่าพื้นหลังและ Motion Customer App', before_state: currentRows?.[0]?.value || {}, after_state: next, created_at: M.ui.nowIso() }) }).catch(() => null); M.ui.setNotice('บันทึกพื้นหลังและ Motion ของ Customer แล้ว'); render(host, next); } catch (error) { M.ui.setNotice(error.message || 'บันทึกการตั้งค่าไม่สำเร็จ', 'error'); } finally { button.disabled = false; } };
  }

  function mountWhenReady() {
    const mount = () => { if (!runtime()) return; const host = document.querySelector('#contentStudioHost'); if (!host || document.querySelector('#customerVisualSettingsMount') || !host.querySelector('#customerContentForm')) return; const section = document.createElement('section'); section.id = 'customerVisualSettingsMount'; section.className = 'customer-visual-settings-mount'; section.innerHTML = M.ui.loading('กำลังโหลดระบบพื้นหลังและ Motion…'); host.parentElement?.append(section); M.request('platform_configs?select=value&key=eq.customer_visuals&limit=1', { private: true, forceFresh: true }).then(rows => render(section, rows?.[0]?.value)).catch(error => { section.innerHTML = M.ui.error('โหลดการตั้งค่าพื้นหลังไม่สำเร็จ', error.message); }); };
    const observer = new MutationObserver(mount); observer.observe(document.body, { childList: true, subtree: true }); mount();
  }
  mountWhenReady();
})();
