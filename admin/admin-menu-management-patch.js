(() => {
  'use strict';
  const M = window.APServiceMPA;
  if (!M) return;

  const esc = value => M.ui.escapeHtml(String(value ?? ''));
  const money = value => M.ui.baht(Number(value || 0));
  const iso = () => M.ui.nowIso();
  const req = (path, options = {}) => M.request(path, { private: true, ...options });
  const notice = (message, type) => M.ui.setNotice(message, type);
  const safeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const safeId = value => encodeURIComponent(String(value || ''));
  const newId = prefix => `${prefix}-${typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`}`;
  const validImageUrl = value => {
    const raw = String(value || '').trim();
    if (!raw) return null;
    try {
      const url = new URL(raw, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? raw : null;
    } catch (_) { return null; }
  };

  const state = { stores: [], categories: [], items: [], storeId: '', editingItemId: '', editingCategoryId: '' };

  function modalShell(store) {
    const backdrop = document.createElement('div');
    backdrop.className = 'mpa-modal-backdrop ap-menu-admin-backdrop';
    backdrop.innerHTML = `<section class="mpa-card mpa-modal ap-menu-admin-modal" role="dialog" aria-modal="true" aria-label="จัดการเมนูร้าน ${esc(store.name || store.id)}">
      <div class="mpa-page-head"><div><h2 style="margin:0">จัดการเมนู · ${esc(store.name || store.id)}</h2><p class="mpa-muted">กำหนดหมวดหมู่ เมนู ราคา รูปภาพ รายละเอียด และสถานะพร้อมขายให้หน้าลูกค้า</p></div><button class="mpa-button mpa-button-secondary" type="button" data-menu-close>ปิด</button></div>
      <div class="ap-menu-admin-tabs"><button class="mpa-button" type="button" data-menu-tab="items">รายการเมนู</button><button class="mpa-button mpa-button-secondary" type="button" data-menu-tab="categories">หมวดหมู่เมนู</button></div>
      <div data-menu-panel="items"><div class="ap-menu-admin-toolbar"><div><strong>เมนูของร้าน</strong><p class="mpa-muted" style="margin:3px 0 0">เมนูที่ปิดการขายจะยังเก็บข้อมูลไว้เพื่อไม่กระทบออเดอร์เก่า</p></div><div class="ap-menu-admin-actions"><button class="mpa-button mpa-button-secondary" type="button" data-import-menu-image>นำเข้าจากภาพ</button><button class="mpa-button" type="button" data-add-menu>เพิ่มเมนู</button></div></div><div data-menu-local-ocr></div><div data-menu-notice></div><div data-menu-items>${M.ui.loading('กำลังโหลดเมนู…')}</div></div>
      <div data-menu-panel="categories" hidden><div class="ap-menu-admin-toolbar"><div><strong>หมวดหมู่เมนู</strong><p class="mpa-muted" style="margin:3px 0 0">ใช้หมวดกลางหรือสร้างหมวดเฉพาะร้านได้</p></div><button class="mpa-button" type="button" data-add-category>เพิ่มหมวดหมู่</button></div><div data-menu-categories>${M.ui.loading('กำลังโหลดหมวดหมู่…')}</div></div>
    </section>`;
    document.body.append(backdrop);
    backdrop.tabIndex = -1;
    const close = () => backdrop.remove();
    backdrop.querySelectorAll('[data-menu-close]').forEach(button => button.onclick = close);
    backdrop.addEventListener('click', event => { if (event.target === backdrop) close(); });
    backdrop.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
    backdrop.focus();
    backdrop.querySelectorAll('[data-menu-tab]').forEach(button => button.onclick = () => {
      const tab = button.dataset.menuTab;
      backdrop.querySelectorAll('[data-menu-tab]').forEach(item => item.classList.toggle('mpa-button-secondary', item !== button));
      backdrop.querySelectorAll('[data-menu-panel]').forEach(panel => { panel.hidden = panel.dataset.menuPanel !== tab; });
    });
    return { backdrop, close };
  }

  async function loadData(storeId) {
    const [stores, items, globalCategories, localCategories] = await Promise.all([
      req(`stores?id=eq.${safeId(storeId)}&select=id,name&limit=1`),
      req(`menu_items?store_id=eq.${safeId(storeId)}&select=id,store_id,name,emoji,image_url,description,price,cost,stock,available,promo,category_id,updated_at&order=updated_at.desc&limit=500`),
      req('menu_categories?store_id=is.null&select=id,store_id,name,description,icon,sort_order,active&order=sort_order.asc,name.asc&limit=250'),
      req(`menu_categories?store_id=eq.${safeId(storeId)}&select=id,store_id,name,description,icon,sort_order,active&order=sort_order.asc,name.asc&limit=250`)
    ]);
    state.stores = Array.isArray(stores) ? stores : [];
    state.items = Array.isArray(items) ? items : [];
    const merged = [...(Array.isArray(globalCategories) ? globalCategories : []), ...(Array.isArray(localCategories) ? localCategories : [])];
    state.categories = [...new Map(merged.map(row => [String(row.id), row])).values()];
  }

  function categoryName(categoryId) {
    return state.categories.find(row => String(row.id) === String(categoryId))?.name || 'ยังไม่จัดหมวด';
  }

  function renderItems(dialog, store) {
    const host = dialog.backdrop.querySelector('[data-menu-items]');
    if (!host) return;
    const rows = [...state.items].sort((a, b) => categoryName(a.category_id).localeCompare(categoryName(b.category_id), 'th') || String(a.name || '').localeCompare(String(b.name || ''), 'th'));
    host.innerHTML = rows.length ? `<div class="mpa-table-wrap"><table class="mpa-table ap-menu-admin-table"><thead><tr><th>เมนู</th><th>หมวด</th><th>ราคา</th><th>สต็อก</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>${rows.map(row => `<tr><td><div class="ap-menu-admin-name"><span class="ap-menu-admin-thumb">${row.image_url ? `<img src="${esc(row.image_url)}" alt="">` : esc(row.emoji || '🍽️')}</span><span><b>${esc(row.name)}</b><small>${esc(row.description || 'ไม่มีรายละเอียด')}</small></span></div></td><td>${esc(categoryName(row.category_id))}</td><td>${money(row.price)}</td><td>${safeNumber(row.stock)}</td><td><span class="mpa-badge ${row.available === false || safeNumber(row.stock) <= 0 ? 'ap-menu-off' : ''}">${row.available === false ? 'ปิดการขาย' : safeNumber(row.stock) <= 0 ? 'หมดสต็อก' : 'พร้อมขาย'}${row.promo ? ' · โปรโมชัน' : ''}</span></td><td><div class="ap-menu-admin-actions"><button class="mpa-button mpa-button-secondary" type="button" data-edit-menu="${esc(row.id)}">แก้ไข</button><button class="mpa-button mpa-button-secondary" type="button" data-toggle-menu="${esc(row.id)}" ${safeNumber(row.stock) <= 0 ? 'disabled' : ''}>${row.available === false ? 'เปิดขาย' : 'ปิดขาย'}</button></div></td></tr>`).join('')}</tbody></table></div>` : `<div class="ap-menu-empty"><div class="ap-menu-empty-icon">🍽️</div><h3>ร้านนี้ยังไม่มีเมนู</h3><p>เพิ่มเมนูแรกเพื่อให้ลูกค้าเห็นรายการอาหาร ราคา และรายละเอียดในหน้า Customer</p><button class="mpa-button" type="button" data-add-menu>เพิ่มเมนูแรก</button></div>`;
    host.querySelectorAll('[data-edit-menu]').forEach(button => button.onclick = () => openItemForm(dialog, store, state.items.find(row => String(row.id) === String(button.dataset.editMenu))));
    host.querySelectorAll('[data-toggle-menu]').forEach(button => button.onclick = async () => {
      const row = state.items.find(item => String(item.id) === String(button.dataset.toggleMenu));
      if (!row) return;
      button.disabled = true;
      try {
        if (safeNumber(row.stock) <= 0) throw new Error('สต็อกเป็น 0 จึงยังเปิดขายไม่ได้');
        await req(`menu_items?id=eq.${safeId(row.id)}&store_id=eq.${safeId(store.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ available: row.available === false, updated_at: iso() }) });
        row.available = row.available === false;
        renderItems(dialog, store);
        notice(`${row.name} ${row.available ? 'เปิดขายแล้ว' : 'ปิดการขายแล้ว'}`);
      } catch (error) { button.disabled = false; notice(`อัปเดตสถานะเมนูไม่สำเร็จ: ${error.message}`, 'error'); }
    });
    dialog.backdrop.querySelectorAll('[data-add-menu]').forEach(button => button.onclick = () => openItemForm(dialog, store, null));
    dialog.backdrop.querySelectorAll('[data-import-menu-image]').forEach(button => button.onclick = () => openLocalOcrImport(dialog, store));
  }

  function openLocalOcrImport(dialog, store) {
    const host = dialog.backdrop.querySelector('[data-menu-local-ocr]');
    if (!host) return;
    if (!window.APServiceLocalMenuOCR?.mount) {
      notice('ชุด OCR ในเครื่องยังโหลดไม่พร้อม กรุณารีเฟรชหน้า Admin แล้วลองใหม่', 'error');
      return;
    }
    host.hidden = false;
    if (host.dataset.localOcrMounted === 'true') {
      host.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.APServiceLocalMenuOCR.mount({
      host,
      getCategories: () => state.categories,
      onCommit: async rows => {
        const result = await req('rpc/import_menu_drafts', {
          method: 'POST',
          body: JSON.stringify({ p_store_id: store.id, p_rows: rows, p_source: 'local_ocr' })
        });
        await loadData(store.id);
        renderItems(dialog, store);
        renderCategories(dialog, store);
        const summary = Array.isArray(result) ? result[0] : result;
        return { message: `นำเข้าแบบร่าง ${Number(summary?.inserted_count || rows.length)} รายการแล้ว · ยังไม่เปิดขาย` };
      }
    });
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openItemForm(dialog, store, item) {
    const editing = Boolean(item);
    const formWrap = document.createElement('div');
    formWrap.className = 'mpa-modal-backdrop ap-menu-form-backdrop';
    const categoryOptions = state.categories.map(row => `<option value="${esc(row.id)}" ${String(row.id) === String(item?.category_id || 'menu-other') ? 'selected' : ''}>${esc(row.icon || '🍴')} ${esc(row.name)}${row.store_id ? ' · เฉพาะร้าน' : ' · กลาง'}</option>`).join('');
    formWrap.innerHTML = `<section class="mpa-card mpa-modal ap-menu-item-form" role="dialog" aria-modal="true" aria-label="${editing ? 'แก้ไขเมนู' : 'เพิ่มเมนู'}"><div class="mpa-page-head"><div><h2 style="margin:0">${editing ? 'แก้ไขเมนู' : 'เพิ่มเมนู'}</h2><p class="mpa-muted">ข้อมูลนี้จะถูกส่งให้หน้า Customer อ่านจาก Supabase</p></div><button class="mpa-button mpa-button-secondary" type="button" data-form-close>ปิด</button></div><form data-item-form><div class="admin-form-grid"><label class="mpa-field"><span>ชื่อเมนู *</span><input name="name" required maxlength="160" value="${esc(item?.name || '')}"></label><label class="mpa-field"><span>ไอคอน / Emoji</span><input name="emoji" maxlength="16" value="${esc(item?.emoji || '🍽️')}"></label><label class="mpa-field"><span>หมวดหมู่</span><select name="category_id">${categoryOptions || '<option value="menu-other">อื่น ๆ</option>'}</select></label><label class="mpa-field"><span>ราคา (บาท) *</span><input name="price" type="number" min="0" step="0.01" required value="${safeNumber(item?.price)}"></label><label class="mpa-field"><span>ต้นทุน (เฉพาะ Admin)</span><input name="cost" type="number" min="0" step="0.01" value="${safeNumber(item?.cost)}"></label><label class="mpa-field"><span>จำนวนคงเหลือ</span><input name="stock" type="number" min="0" step="1" value="${safeNumber(item?.stock, 0)}"></label><label class="mpa-field"><span>สถานะขาย</span><select name="available"><option value="true" ${item?.available === false ? '' : 'selected'}>พร้อมขาย</option><option value="false" ${item?.available === false ? 'selected' : ''}>ปิดการขาย</option></select></label><label class="mpa-field"><span>โปรโมชัน</span><select name="promo"><option value="false" ${item?.promo ? '' : 'selected'}>ไม่ใช่</option><option value="true" ${item?.promo ? 'selected' : ''}>แสดงเป็นโปรโมชัน</option></select></label><label class="mpa-field admin-form-full"><span>รูปภาพเมนู</span><div style="display:flex;gap:8px;flex-wrap:wrap"><label class="mpa-button mpa-button-secondary">เลือกจากคลังภาพ<input hidden type="file" accept="image/jpeg,image/png,image/webp" data-menu-media-input></label><label class="mpa-button mpa-button-secondary">ถ่ายรูป<input hidden type="file" accept="image/jpeg,image/png,image/webp" capture="environment" data-menu-media-input></label></div><div class="ap-menu-media-preview-wrap" data-menu-media-preview-wrap ${item?.image_url ? '' : 'hidden'}><img data-menu-media-preview ${item?.image_url ? `src="${esc(item.image_url)}"` : ''} alt="ตัวอย่างรูปเมนู" ${item?.image_url ? '' : 'hidden'}></div><input name="image_url" type="url" placeholder="URL เดิม (ถ้ามี)" value="${esc(item?.image_url || '')}"><small class="mpa-muted" data-menu-media-status aria-live="polite">เลือกรูปจากคลังหรือกล้อง ระบบจะบีบอัด ตรวจ URL และลงทะเบียน media_assets ก่อนบันทึก</small></label><label class="mpa-field admin-form-full"><span>รายละเอียดเมนู</span><textarea name="description" rows="3" maxlength="500">${esc(item?.description || '')}</textarea></label></div><div class="admin-modal-actions"><button class="mpa-button mpa-button-secondary" type="button" data-form-close>ยกเลิก</button><button class="mpa-button" type="submit">${editing ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู'}</button></div></form></section>`;
    document.body.append(formWrap);
    formWrap.tabIndex = -1;
    let previewBlobUrl = ''; const clearPreviewBlob = () => { if (previewBlobUrl) { URL.revokeObjectURL(previewBlobUrl); previewBlobUrl = ''; } }; const close = () => { clearPreviewBlob(); formWrap.remove(); };
    formWrap.querySelectorAll('[data-form-close]').forEach(button => button.onclick = close);
    formWrap.addEventListener('click', event => { if (event.target === formWrap) close(); });
    formWrap.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
    formWrap.focus();
    const itemForm = formWrap.querySelector('[data-item-form]');
    const mediaStatus = formWrap.querySelector('[data-menu-media-status]');
    const mediaPreview = formWrap.querySelector('[data-menu-media-preview]');
    const mediaPreviewWrap = formWrap.querySelector('[data-menu-media-preview-wrap]');
    const setMediaPreview = (src, source) => { if (!mediaPreview || !src) return; mediaPreview.src = src; mediaPreview.hidden = false; if (mediaPreviewWrap) mediaPreviewWrap.hidden = false; mediaPreview.dataset.previewSource = source; };
    const restorePersistedPreview = () => { clearPreviewBlob(); const currentUrl = validImageUrl(String(itemForm.elements.image_url?.value || item?.image_url || '').trim()); if (currentUrl) setMediaPreview(currentUrl, 'remote'); else if (mediaPreview) { mediaPreview.removeAttribute('src'); mediaPreview.hidden = true; mediaPreview.removeAttribute('data-preview-source'); if (mediaPreviewWrap) mediaPreviewWrap.hidden = true; } };
    if (item?.image_url) setMediaPreview(item.image_url, 'remote');
    let mediaUploading = false;
    const [libraryInput, cameraInput] = itemForm.querySelectorAll('[data-menu-media-input]');
    const mediaActions = libraryInput?.closest('div');
    if (libraryInput && cameraInput && mediaActions) {
      libraryInput.accept = 'image/*';
      libraryInput.removeAttribute('capture');
      libraryInput.dataset.menuMediaSource = 'library';
      cameraInput.accept = 'image/*';
      cameraInput.setAttribute('capture', 'environment');
      cameraInput.dataset.menuMediaSource = 'camera';
      const libraryTrigger = document.createElement('button');
      libraryTrigger.type = 'button';
      libraryTrigger.className = 'mpa-button mpa-button-secondary';
      libraryTrigger.dataset.menuLibraryTrigger = '';
      libraryTrigger.textContent = 'เลือกจากคลังภาพ';
      const cameraTrigger = document.createElement('button');
      cameraTrigger.type = 'button';
      cameraTrigger.className = 'mpa-button mpa-button-secondary';
      cameraTrigger.dataset.menuCameraTrigger = '';
      cameraTrigger.textContent = 'ถ่ายรูปใหม่';
      mediaActions.className = 'ap-menu-media-actions';
      mediaActions.replaceChildren(libraryTrigger, cameraTrigger, libraryInput, cameraInput);
      libraryTrigger.onclick = () => libraryInput.click();
      cameraTrigger.onclick = () => cameraInput.click();
      if (mediaStatus) mediaStatus.textContent = 'คลังภาพและกล้องเป็นคนละปุ่ม ระบบจะบีบอัดเฉพาะรูปภาพเป็น JPEG คุณภาพ 0.82 (สูงสุด 1200px) โดยคง GIF เดิมก่อนอัปโหลด';
    }
    itemForm.querySelectorAll('[data-menu-media-input]').forEach(input => input.onchange = async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      mediaUploading = true;
      clearPreviewBlob();
      previewBlobUrl = URL.createObjectURL(file);
      setMediaPreview(previewBlobUrl, 'local');
      if (mediaStatus) mediaStatus.textContent = 'ตัวอย่างรูปเมนูพร้อมแล้ว · กำลังบีบอัด อัปโหลด ตรวจสอบ URL และลงทะเบียน media_assets…';
      try {
        const session = M.auth.getSession?.();
        const actorId = session?.user?.id || window.APServiceAdminRuntime?.user?.id;
        if (!session?.access_token || !actorId) throw new Error('เซสชันแอดมินหมดอายุ กรุณาเข้าสู่ระบบใหม่ก่อนอัปโหลด');
        const uploaded = await window.APServiceMedia.uploadPublicCatalogImage(file, { ...M.config, accessToken: session.access_token, actorId, pathPrefix: 'admin', scope: `store-${store.id}-menu-${item?.id || 'new'}`, mediaType: 'MENU_IMAGE', ownerType: 'admin', variant: 'menu-image', legacySource: { storeId: store.id, itemId: item?.id || null, source: 'admin-menu-management' } });
        const imageField = itemForm.elements.image_url;
        if (imageField) imageField.value = uploaded.publicUrl;
        clearPreviewBlob();
        setMediaPreview(uploaded.publicUrl, 'remote');
        if (mediaStatus) mediaStatus.textContent = `อัปโหลดและตรวจสอบแล้ว · ${Math.ceil(Number(uploaded.bytes || 0) / 1024)} KB`;
        notice('อัปโหลดรูปเมนูแล้ว กดบันทึกเมนูเพื่อยืนยัน');
      } catch (error) {
        event.target.value = '';
        restorePersistedPreview();
        if (mediaStatus) mediaStatus.textContent = `อัปโหลดไม่สำเร็จ: ${error.message}`;
        notice(error.message || 'อัปโหลดรูปเมนูไม่สำเร็จ', 'error');
      } finally { mediaUploading = false; event.target.value = ''; }
    });
    itemForm.onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const value = name => String(form.elements[name]?.value || '').trim();
      const name = value('name'), price = Number(value('price')), cost = Number(value('cost') || 0), stock = Number(value('stock') || 0);
      if (mediaUploading) return notice('กรุณารอให้การอัปโหลดรูปภาพเสร็จก่อนบันทึก', 'error');
      if (!name || !Number.isFinite(price) || price < 0 || !Number.isFinite(cost) || cost < 0 || !Number.isInteger(stock) || stock < 0) return notice('กรุณากรอกชื่อ ราคา ต้นทุน และสต็อกให้ถูกต้อง', 'error');
      const image = validImageUrl(value('image_url'));
      if (value('image_url') && !image) return notice('URL รูปภาพต้องเป็น http หรือ https เท่านั้น', 'error');
      const payload = { id: item?.id || newId('menu'), store_id: store.id, name, emoji: value('emoji') || '🍽️', image_url: image, description: value('description'), price, cost, stock, available: value('available') === 'true' && stock > 0, promo: value('promo') === 'true', category_id: value('category_id') || 'menu-other', updated_at: iso() };
      const save = form.querySelector('[type="submit"]'); save.disabled = true;
      try {
        if (editing) await req(`menu_items?id=eq.${safeId(item.id)}&store_id=eq.${safeId(store.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(payload) });
        else await req('menu_items', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(payload) });
        await loadData(store.id); close(); renderItems(dialog, store); notice(stock > 0 && value('available') === 'true' ? (editing ? `แก้ไขเมนู ${name} และเปิดขายแล้ว` : `เพิ่มเมนู ${name} และเปิดขายแล้ว`) : (editing ? `แก้ไขเมนู ${name} แล้ว แต่สต็อกเป็น 0 จึงปิดขายอัตโนมัติ` : `เพิ่มเมนู ${name} แล้ว แต่สต็อกเป็น 0 จึงปิดขายอัตโนมัติ`));
      } catch (error) { save.disabled = false; notice(`บันทึกเมนูไม่สำเร็จ: ${error.message}`, 'error'); }
    };
  }

  function renderCategories(dialog, store) {
    const host = dialog.backdrop.querySelector('[data-menu-categories]');
    if (!host) return;
    const rows = [...state.categories].sort((a, b) => safeNumber(a.sort_order) - safeNumber(b.sort_order) || String(a.name || '').localeCompare(String(b.name || ''), 'th'));
    host.innerHTML = `<div class="mpa-table-wrap"><table class="mpa-table"><thead><tr><th>หมวด</th><th>ขอบเขต</th><th>ลำดับ</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>${rows.map(row => `<tr><td><b>${esc(row.icon || '🍴')} ${esc(row.name)}</b><br><small class="mpa-muted">${esc(row.description || '')}</small></td><td>${row.store_id ? 'เฉพาะร้านนี้' : 'หมวดกลาง'}</td><td>${safeNumber(row.sort_order)}</td><td><span class="mpa-badge ${row.active === false ? 'ap-menu-off' : ''}">${row.active === false ? 'ปิดใช้งาน' : 'ใช้งาน'}</span></td><td><div class="ap-menu-admin-actions"><button class="mpa-button mpa-button-secondary" type="button" data-edit-category="${esc(row.id)}">แก้ไข</button>${row.store_id ? `<button class="mpa-button mpa-button-secondary" type="button" data-toggle-category="${esc(row.id)}">${row.active === false ? 'เปิดใช้' : 'ปิดใช้'}</button>` : '<small class="mpa-muted">หมวดกลาง</small>'}</div></td></tr>`).join('')}</tbody></table></div>`;
    host.querySelectorAll('[data-edit-category]').forEach(button => button.onclick = () => openCategoryForm(dialog, store, state.categories.find(row => String(row.id) === String(button.dataset.editCategory))));
    host.querySelectorAll('[data-toggle-category]').forEach(button => button.onclick = async () => {
      const row = state.categories.find(item => String(item.id) === String(button.dataset.toggleCategory));
      if (!row) return;
      try { await req(`menu_categories?id=eq.${safeId(row.id)}&store_id=eq.${safeId(store.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ active: row.active === false, updated_at: iso() }) }); await loadData(store.id); renderCategories(dialog, store); notice(`${row.name} ${row.active === false ? 'เปิดใช้แล้ว' : 'ปิดใช้งานแล้ว'}`); } catch (error) { notice(`อัปเดตหมวดไม่สำเร็จ: ${error.message}`, 'error'); }
    });
    host.querySelectorAll('[data-add-category]').forEach(button => button.onclick = () => openCategoryForm(dialog, store, null));
  }

  function openCategoryForm(dialog, store, category) {
    if (category && !category.store_id) return notice('หมวดกลางใช้ร่วมกันหลายร้าน จึงแก้จากหน้าร้านเฉพาะร้านไม่ได้', 'error');
    const editing = Boolean(category);
    const backdrop = document.createElement('div');
    backdrop.className = 'mpa-modal-backdrop ap-menu-form-backdrop';
    backdrop.innerHTML = `<section class="mpa-card mpa-modal ap-menu-category-form" role="dialog" aria-modal="true" aria-label="${editing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}"><div class="mpa-page-head"><div><h2 style="margin:0">${editing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่เฉพาะร้าน'}</h2><p class="mpa-muted">หมวดกลางแก้ไขได้เฉพาะข้อมูลของหมวดนั้น แต่หมวดใหม่จะผูกกับร้านนี้</p></div><button class="mpa-button mpa-button-secondary" type="button" data-category-close>ปิด</button></div><form data-category-form><div class="admin-form-grid"><label class="mpa-field"><span>ชื่อหมวด *</span><input name="name" required maxlength="80" value="${esc(category?.name || '')}"></label><label class="mpa-field"><span>ไอคอน</span><input name="icon" maxlength="16" value="${esc(category?.icon || '🍽️')}"></label><label class="mpa-field"><span>ลำดับการแสดง</span><input name="sort_order" type="number" step="1" value="${safeNumber(category?.sort_order, 0)}"></label><label class="mpa-field"><span>สถานะ</span><select name="active"><option value="true" ${category?.active === false ? '' : 'selected'}>ใช้งาน</option><option value="false" ${category?.active === false ? 'selected' : ''}>ปิดใช้งาน</option></select></label><label class="mpa-field admin-form-full"><span>คำอธิบาย</span><textarea name="description" rows="2" maxlength="280">${esc(category?.description || '')}</textarea></label></div><div class="admin-modal-actions"><button class="mpa-button mpa-button-secondary" type="button" data-category-close>ยกเลิก</button><button class="mpa-button" type="submit">${editing ? 'บันทึกหมวดหมู่' : 'เพิ่มหมวดหมู่'}</button></div></form></section>`;
    document.body.append(backdrop);
    backdrop.tabIndex = -1;
    const close = () => backdrop.remove();
    backdrop.querySelectorAll('[data-category-close]').forEach(button => button.onclick = close);
    backdrop.addEventListener('click', event => { if (event.target === backdrop) close(); });
    backdrop.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
    backdrop.focus();
    backdrop.querySelector('[data-category-form]').onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const value = name => String(form.elements[name]?.value || '').trim();
      const name = value('name'), sortOrder = Number(value('sort_order') || 0);
      if (!name || !Number.isInteger(sortOrder)) return notice('กรุณากรอกชื่อหมวดและลำดับให้ถูกต้อง', 'error');
      const payload = { id: category?.id || newId('category'), store_id: category?.store_id || store.id, name, description: value('description'), icon: value('icon') || '🍽️', sort_order: sortOrder, active: value('active') === 'true', updated_at: iso() };
      const save = form.querySelector('[type="submit"]'); save.disabled = true;
      try {
        if (editing) await req(`menu_categories?id=eq.${safeId(category.id)}&store_id=eq.${safeId(store.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(payload) });
        else await req('menu_categories', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(payload) });
        await loadData(store.id); close(); renderCategories(dialog, store); renderItems(dialog, store); notice(editing ? `แก้ไขหมวด ${name} แล้ว` : `เพิ่มหมวด ${name} แล้ว`);
      } catch (error) { save.disabled = false; notice(`บันทึกหมวดไม่สำเร็จ: ${error.message}`, 'error'); }
    };
  }

  async function openMenuManager(storeId) {
    const store = { id: storeId, ...(state.stores.find(row => String(row.id) === String(storeId)) || {}) };
    const dialog = modalShell(store);
    try { await loadData(storeId); renderItems(dialog, store); renderCategories(dialog, store); }
    catch (error) { dialog.backdrop.querySelector('[data-menu-items]').innerHTML = M.ui.error('โหลดเมนูไม่สำเร็จ', error.message); notice(`โหลดเมนูไม่สำเร็จ: ${error.message}`, 'error'); }
  }

  function enhanceStoreTable() {
    const host = document.querySelector('#stores');
    if (!host) return;
    host.querySelectorAll('[data-store-menu]').forEach(button => {
      const storeId = button.dataset.storeMenu;
      if (!storeId || button.dataset.menuManagerBound === 'true') return;
      button.dataset.menuManagerBound = 'true';
      button.textContent = 'เมนู/หมวดหมู่';
      button.title = 'จัดการเมนู หมวดหมู่ ราคา รูปภาพ และสถานะขายของร้าน';
      button.onclick = () => openMenuManager(storeId);
    });
    host.querySelectorAll('tbody tr').forEach(row => {
      const toggle = row.querySelector('[data-toggle]');
      const cell = row.cells?.[row.cells.length - 1];
      const storeId = toggle?.dataset.toggle;
      if (!cell || !storeId || cell.querySelector('[data-menu-manager]')) return;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'mpa-button mpa-button-secondary'; button.dataset.menuManager = storeId; button.textContent = 'เมนูและหมวด'; button.title = 'จัดการเมนูและหมวดหมู่ของร้าน';
      button.onclick = () => openMenuManager(storeId);
      cell.append(button);
    });
  }

  const style = document.createElement('style');
  style.textContent = `.ap-menu-admin-backdrop{z-index:1100}.ap-menu-form-backdrop{z-index:1200}.ap-menu-admin-modal{width:min(1120px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto}.ap-menu-item-form,.ap-menu-category-form{width:min(760px,calc(100vw - 24px))}.ap-menu-admin-tabs{display:flex;gap:8px;margin:12px 0 18px;flex-wrap:wrap}.ap-menu-admin-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:4px 0 12px}.ap-menu-admin-table td{vertical-align:middle}.ap-menu-admin-name{display:flex;gap:10px;align-items:center;min-width:210px}.ap-menu-admin-name small{display:block;color:var(--ap-muted,#71838b);max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ap-menu-admin-thumb{width:46px;height:46px;border-radius:12px;background:#edf8f6;display:grid;place-items:center;font-size:25px;overflow:hidden;flex:0 0 46px}.ap-menu-admin-thumb img{width:100%;height:100%;object-fit:cover}.ap-menu-admin-actions{display:flex;gap:6px;flex-wrap:wrap}.ap-menu-off{background:#fff1f1!important;color:#a13737!important}.ap-menu-empty{text-align:center;padding:42px 18px;border:1px dashed var(--ap-line,#dbe7e6);border-radius:16px;background:#fbfefd}.ap-menu-empty-icon{font-size:42px}.ap-menu-empty h3{margin:10px 0 4px}.ap-menu-empty p{color:var(--ap-muted,#71838b);margin:0 auto 16px;max-width:520px}.ap-menu-media-preview-wrap{width:min(240px,100%);margin:10px 0}.ap-menu-media-preview{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;border:1px solid var(--ap-line,#dbe7e6);border-radius:14px;background:#f4fbfa}.ap-menu-media-preview[hidden],.ap-menu-media-preview-wrap[hidden]{display:none}@media(max-width:720px){.ap-menu-admin-table{min-width:720px}.ap-menu-admin-modal{padding:14px}.ap-menu-admin-name{min-width:170px}.ap-menu-admin-actions{flex-direction:column}.ap-menu-admin-actions .mpa-button{width:100%}}`;
  document.head.append(style);

  const observer = new MutationObserver(enhanceStoreTable);
  const start = () => { if (document.body) observer.observe(document.body, { childList: true, subtree: true }); enhanceStoreTable(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();

/* Loaded before admin-app.js; observes the stores route after its auth gate renders. */
