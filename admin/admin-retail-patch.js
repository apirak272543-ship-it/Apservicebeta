(() => {
  'use strict';

  const M = window.APServiceMPA;
  if (!M) return;

  const esc = value => M.ui.escapeHtml(String(value ?? ''));
  const request = (path, options = {}) => M.request(path, { private: true, ...options });
  const money = value => M.ui.baht(Number(value || 0));
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const state = { stores: [], storeId: '', products: [], search: '' };

  const retailStyles = `
    <style id="admin-retail-management-style">
      .admin-retail-layout{display:grid;gap:18px}.admin-retail-toolbar{display:grid;grid-template-columns:minmax(210px,1fr) minmax(220px,2fr) auto;gap:10px;align-items:end}.admin-retail-toolbar .mpa-field{margin:0}.admin-retail-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}.admin-retail-product{display:grid;gap:11px;min-height:100%}.admin-retail-product__top{display:flex;gap:12px;align-items:center}.admin-retail-product__image{width:62px;height:62px;object-fit:cover;border-radius:16px;background:#edf7f4;border:1px solid #d5ebe3}.admin-retail-product__fallback{width:62px;height:62px;display:grid;place-items:center;border-radius:16px;background:#edf7f4;color:#0b8c7c;font-size:25px;font-weight:900}.admin-retail-product h3{margin:0;font-size:16px}.admin-retail-product p{margin:3px 0 0}.admin-retail-stock{display:flex;justify-content:space-between;gap:10px;padding:10px 11px;border-radius:13px;background:#f6fbf9;font-size:13px}.admin-retail-stock strong{color:#075b4d}.admin-retail-actions{display:flex;gap:8px;flex-wrap:wrap}.admin-retail-actions .mpa-button{flex:1;min-width:100px}.admin-retail-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.admin-retail-form-grid .admin-retail-full{grid-column:1/-1}.admin-retail-media{padding:13px;border:1px dashed #a9d9c9;border-radius:15px;background:#fbfffd}.admin-retail-media-actions{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.admin-retail-media img{display:block;width:104px;height:104px;object-fit:cover;border-radius:14px;background:#edf7f4}.admin-retail-caption{font-size:12px;line-height:1.5;color:#58756c}.admin-retail-summary{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}.admin-retail-empty{padding:28px 16px;text-align:center}.admin-retail-empty h2{margin:0 0 6px;font-size:17px}.admin-retail-dialog .mpa-modal{max-width:680px}.admin-retail-dialog .mpa-modal{max-height:calc(100vh - 34px);overflow:auto}@media(max-width:680px){.admin-retail-toolbar{grid-template-columns:1fr}.admin-retail-form-grid{grid-template-columns:1fr}.admin-retail-form-grid .admin-retail-full{grid-column:auto}.admin-retail-actions .mpa-button{flex:auto}.admin-retail-product__image,.admin-retail-product__fallback{width:54px;height:54px}}
    </style>`;

  const pageMarkup = () => `
    ${retailStyles}
    <div class="mpa-page-head"><div><p class="admin-page-eyebrow">RETAIL CONTROL</p><h1>จัดการสินค้าทั่วไปและสต๊อก</h1><p>เพิ่ม แก้ไข และติดตามสต๊อก Retail แยกจากเมนูอาหารเดิมของร้านค้า</p></div><button class="mpa-button" type="button" id="retailAddProduct" disabled>เพิ่มสินค้า</button></div>
    <section class="mpa-card admin-retail-layout" aria-labelledby="retailControlTitle"><div class="admin-retail-summary"><div><h2 id="retailControlTitle" style="margin:0">เลือกร้านค้าเพื่อจัดการ</h2><p class="mpa-muted" style="margin:4px 0 0">ข้อมูลสินค้าจะแสดงจากระบบ Retail ของร้านที่เลือกเท่านั้น</p></div><button class="mpa-button mpa-button-secondary" type="button" id="retailRefresh">รีเฟรช</button></div><div class="admin-retail-toolbar"><label class="mpa-field"><span>ร้านค้า</span><select id="retailStore"><option value="">กำลังโหลดรายชื่อร้าน…</option></select></label><label class="mpa-field"><span>ค้นหาสินค้า</span><input id="retailSearch" type="search" placeholder="ชื่อสินค้า, SKU หรือหมวดหมู่" disabled></label><button class="mpa-button mpa-button-secondary" id="retailSearchButton" type="button" disabled>ค้นหา</button></div></section>
    <section class="admin-retail-layout" aria-live="polite"><div id="retailCatalog">${M.ui.loading('กำลังตรวจสิทธิ์และเตรียมข้อมูล Retail…')}</div></section>`;

  function showEmpty(title, description) {
    const host = document.getElementById('retailCatalog');
    if (host) host.innerHTML = `<section class="mpa-card admin-retail-empty"><h2>${esc(title)}</h2><p class="mpa-muted">${esc(description)}</p></section>`;
  }

  async function identifierModal(product) {
    if (!product?.store_product_id) return M.ui.setNotice('ไม่พบสินค้าของร้านค้าที่เลือก', 'error');
    const typeLabels = { barcode: 'บาร์โค้ด', qr: 'QR Code', external: 'รหัสภายนอก', sku: 'SKU' };
    const { host, close } = createModal(`รหัสสินค้า: ${product.name}`, `<div class="mpa-page-head"><div><h2 style="margin:0">รหัสสินค้า</h2><p class="mpa-muted">เพิ่ม barcode หรือ QR ที่ใช้สแกนเข้าตะกร้า POS โดยต้องไม่ซ้ำกับสินค้าอื่น</p></div><button class="mpa-button mpa-button-secondary" type="button" data-retail-close>ปิด</button></div><div data-retail-identifiers style="display:grid;gap:8px;margin:12px 0"></div><form data-retail-identifier-form><div class="admin-retail-form-grid"><label class="mpa-field"><span>ชนิดรหัส</span><select name="identifier_type"><option value="barcode">บาร์โค้ด</option><option value="qr">QR Code</option><option value="external">รหัสภายนอก</option><option value="sku">SKU</option></select></label><label class="mpa-field"><span>ค่ารหัส</span><input name="identifier_value" required maxlength="160" autocomplete="off" placeholder="เช่น 8851234567890"></label></div><div class="admin-modal-actions"><button class="mpa-button" type="submit">เพิ่มรหัส</button></div><p class="mpa-muted" data-retail-identifier-status role="status" aria-live="polite"></p></form>`);
    const list = host.querySelector('[data-retail-identifiers]');
    const form = host.querySelector('[data-retail-identifier-form]');
    const status = host.querySelector('[data-retail-identifier-status]');
    const draw = rows => { list.innerHTML = rows.length ? rows.map(row => `<div class="mpa-card" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px"><div><strong>${esc(typeLabels[row.identifier_type] || row.identifier_type)}</strong><div class="mpa-muted" style="word-break:break-all">${esc(row.identifier_value)}</div></div><button class="mpa-button mpa-button-secondary" type="button" data-delete-identifier="${esc(row.id)}">ลบ</button></div>`).join('') : '<p class="mpa-muted">ยังไม่มี barcode หรือ QR ที่ผูกกับสินค้านี้</p>'; list.querySelectorAll('[data-delete-identifier]').forEach(button => button.onclick = async () => { if (!window.confirm('ยืนยันลบรหัสสินค้านี้หรือไม่')) return; button.disabled = true; try { await request('rpc/retail_admin_delete_product_identifier', { method: 'POST', body: JSON.stringify({ p_identifier_id: button.dataset.deleteIdentifier }) }); status.textContent = 'ลบรหัสแล้ว'; await load(); } catch (error) { button.disabled = false; status.textContent = error?.message || 'ลบรหัสไม่สำเร็จ'; } }); };
    const load = async () => { try { const rows = await request('rpc/retail_admin_list_product_identifiers', { method: 'POST', body: JSON.stringify({ p_store_product_id: product.store_product_id }) }); draw(Array.isArray(rows) ? rows : []); } catch (error) { list.innerHTML = `<p class="mpa-muted">โหลดรหัสสินค้าไม่สำเร็จ: ${esc(error?.message || '')}</p>`; } };
    form.onsubmit = async event => { event.preventDefault(); const submit = form.querySelector('[type="submit"]'); submit.disabled = true; status.textContent = 'กำลังบันทึกรหัส…'; try { await request('rpc/retail_admin_upsert_product_identifier', { method: 'POST', body: JSON.stringify({ p_store_product_id: product.store_product_id, p_identifier_type: form.elements.identifier_type.value, p_identifier_value: form.elements.identifier_value.value.trim() }) }); form.reset(); status.textContent = 'เพิ่มรหัสแล้ว'; await load(); } catch (error) { status.textContent = error?.message || 'เพิ่มรหัสไม่สำเร็จ'; } finally { submit.disabled = false; } };
    await load();
  }

  function renderProducts() {
    const host = document.getElementById('retailCatalog');
    if (!host) return;
    if (!state.storeId) return showEmpty('เลือกร้านค้าที่ต้องการจัดการ', 'เลือกชื่อร้านด้านบนเพื่อดูสินค้าทั่วไปและยอดสต๊อกจริง');
    if (!state.products.length) return showEmpty('ยังไม่มีสินค้าทั่วไปในร้านนี้', 'เริ่มต้นด้วยการกด “เพิ่มสินค้า” ระบบจะไม่แสดงข้อมูลตัวอย่างแทนข้อมูลจริง');
    host.innerHTML = `<div class="admin-retail-grid">${state.products.map(row => {
      const stock = number(row.on_hand_quantity), reserved = number(row.reserved_quantity), minimum = number(row.minimum_quantity);
      const image = row.image_url ? `<img class="admin-retail-product__image" src="${esc(row.image_url)}" alt="${esc(row.name)}">` : '<div class="admin-retail-product__fallback" aria-hidden="true">▣</div>';
      return `<article class="mpa-card admin-retail-product"><div class="admin-retail-product__top">${image}<div><h3>${esc(row.name)}</h3><p class="mpa-muted">${esc(row.brand_name || row.category_name || 'ยังไม่ระบุแบรนด์หรือหมวดหมู่')}</p><p class="mpa-muted">${esc(row.sku || 'ไม่มี SKU')} · ${esc(row.unit_name)}</p></div></div><div class="admin-retail-stock"><span>คงเหลือ <strong>${esc(stock)}</strong></span><span>จองแล้ว ${esc(reserved)}</span><span>ขั้นต่ำ ${esc(minimum)}</span></div><div class="admin-retail-summary"><strong>${money(row.selling_price)}</strong><span class="mpa-muted">${row.active ? 'พร้อมขาย' : 'ปิดการขาย'}</span></div><div class="admin-retail-actions"><button class="mpa-button mpa-button-secondary" type="button" data-retail-action="edit" data-product-id="${esc(row.store_product_id)}">แก้ไขสินค้า</button><button class="mpa-button" type="button" data-retail-action="stock" data-product-id="${esc(row.store_product_id)}">ปรับสต๊อก</button><button class="mpa-button mpa-button-secondary" type="button" data-retail-action="identifiers" data-product-id="${esc(row.store_product_id)}">บาร์โค้ด/QR</button></div></article>`;
    }).join('')}</div>`;
  }

  async function loadStores() {
    const select = document.getElementById('retailStore');
    if (!select) return;
    select.disabled = true;
    try {
      state.stores = await request('stores?select=id,name,active,moderation_status&order=name.asc&limit=500', { cacheTtlMs: 15_000, cacheKey: 'admin-retail:stores' });
      const activeStores = state.stores.filter(row => row?.id && row?.name);
      select.innerHTML = `<option value="">${activeStores.length ? 'เลือกร้านค้า' : 'ยังไม่มีร้านค้าที่จัดการได้'}</option>${activeStores.map(row => `<option value="${esc(row.id)}">${esc(row.name)}${row.active === false ? ' · ปิดอยู่' : ''}</option>`).join('')}`;
      select.disabled = !activeStores.length;
      if (!activeStores.length) showEmpty('ยังไม่มีร้านค้าที่จัดการได้', 'เพิ่มหรือเปิดใช้งานร้านค้าจากเมนูร้านค้าก่อน แล้วจึงกลับมาจัดการสินค้า Retail');
    } catch (error) {
      select.innerHTML = '<option value="">โหลดรายชื่อร้านค้าไม่สำเร็จ</option>';
      showEmpty('โหลดรายชื่อร้านค้าไม่สำเร็จ', error?.message || 'กรุณาลองใหม่อีกครั้ง');
      M.ui.setNotice(error?.message || 'โหลดรายชื่อร้านค้าไม่สำเร็จ', 'error');
    } finally { select.disabled = !state.stores.length; }
  }

  async function loadCatalog() {
    const add = document.getElementById('retailAddProduct');
    const search = document.getElementById('retailSearch');
    const searchButton = document.getElementById('retailSearchButton');
    if (!state.storeId) { state.products = []; if (add) add.disabled = true; if (search) search.disabled = true; if (searchButton) searchButton.disabled = true; return renderProducts(); }
    if (add) add.disabled = false; if (search) search.disabled = false; if (searchButton) searchButton.disabled = false;
    const host = document.getElementById('retailCatalog');
    if (host) host.innerHTML = M.ui.loading('กำลังโหลดสินค้าและยอดสต๊อกจริง…');
    try {
      state.products = await request('rpc/retail_admin_list_store_catalog', { method: 'POST', body: JSON.stringify({ p_store_id: state.storeId, p_search: state.search }) });
      renderProducts();
    } catch (error) {
      state.products = [];
      showEmpty('โหลดรายการสินค้าไม่สำเร็จ', error?.message || 'กรุณาลองใหม่อีกครั้ง');
      M.ui.setNotice(error?.message || 'โหลดรายการสินค้าไม่สำเร็จ', 'error');
    }
  }

  function createModal(label, inner) {
    const host = document.createElement('div');
    host.className = 'mpa-modal-backdrop admin-retail-dialog';
    host.innerHTML = `<section class="mpa-card mpa-modal" role="dialog" aria-modal="true" aria-label="${esc(label)}">${inner}</section>`;
    document.body.append(host);
    const close = () => host.remove();
    host.tabIndex = -1;
    host.querySelectorAll('[data-retail-close]').forEach(button => { button.onclick = close; });
    host.addEventListener('click', event => { if (event.target === host) close(); });
    host.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
    host.focus();
    return { host, close };
  }

  function productModal(product = null) {
    if (!state.storeId) return M.ui.setNotice('กรุณาเลือกร้านค้าก่อนเพิ่มสินค้า', 'error');
    const current = product || { id: '', name: '', brand_name: '', category_name: '', unit_name: '', sku: '', selling_price: '', active: true, image_url: '' };
    const title = product ? `แก้ไขสินค้า: ${product.name}` : 'เพิ่มสินค้าทั่วไป';
    const { host, close } = createModal(title, `<div class="mpa-page-head"><div><h2 style="margin:0">${esc(title)}</h2><p class="mpa-muted">รูปสินค้าเลือกได้จากกล้องหรือคลังภาพเท่านั้น และต้องผ่านการบีบอัดก่อนบันทึก</p></div><button class="mpa-button mpa-button-secondary" type="button" data-retail-close>ปิด</button></div><form id="retailProductForm"><div class="admin-retail-form-grid"><label class="mpa-field"><span>ชื่อสินค้า</span><input name="name" required maxlength="180" value="${esc(current.name)}"></label><label class="mpa-field"><span>หน่วยนับ</span><input name="unit_name" required maxlength="60" placeholder="เช่น ชิ้น, ขวด, แพ็ก" value="${esc(current.unit_name)}"></label><label class="mpa-field"><span>แบรนด์</span><input name="brand_name" maxlength="120" value="${esc(current.brand_name || '')}"></label><label class="mpa-field"><span>หมวดหมู่</span><input name="category_name" maxlength="120" value="${esc(current.category_name || '')}"></label><label class="mpa-field"><span>SKU</span><input name="sku" maxlength="100" value="${esc(current.sku || '')}"></label><label class="mpa-field"><span>ราคาขาย (บาท)</span><input name="price" type="number" min="0" step="0.01" required value="${esc(current.selling_price)}"></label><label class="mpa-field"><span>สถานะการขาย</span><select name="active"><option value="true" ${current.active ? 'selected' : ''}>พร้อมขาย</option><option value="false" ${!current.active ? 'selected' : ''}>ปิดการขาย</option></select></label><div class="admin-retail-media admin-retail-full"><b>รูปสินค้า</b><div class="admin-retail-media-actions"><label class="mpa-button mpa-button-secondary">เลือกจากคลังภาพ<input hidden type="file" accept="image/jpeg,image/png,image/webp" data-retail-image></label><label class="mpa-button mpa-button-secondary">ถ่ายรูป<input hidden type="file" accept="image/jpeg,image/png,image/webp" capture="environment" data-retail-image></label></div><input name="image_url" type="hidden" value="${esc(current.image_url || '')}"><div data-retail-image-preview>${current.image_url ? `<img src="${esc(current.image_url)}" alt="ตัวอย่างรูปสินค้า">` : '<span class="mpa-muted">ยังไม่มีรูปสินค้า</span>'}</div><p class="admin-retail-caption" data-retail-image-status>ไม่มีช่องกรอก URL รูปภาพ ระบบรับเฉพาะรูปจากกล้องหรือคลังภาพ และบีบอัดเป็น JPEG คุณภาพ 0.82 ขนาดไม่เกิน 1200px</p></div></div><div class="admin-modal-actions"><button class="mpa-button mpa-button-secondary" type="button" data-retail-close>ยกเลิก</button><button class="mpa-button" type="submit">${product ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</button></div></form>`);
    const form = host.querySelector('#retailProductForm');
    const preview = host.querySelector('[data-retail-image-preview]');
    const status = host.querySelector('[data-retail-image-status]');
    host.querySelectorAll('[data-retail-image]').forEach(input => { input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      try {
        const session = await M.auth.refreshSession(false);
        if (!session?.access_token || !session?.user?.id) throw new Error('เซสชัน Admin หมดอายุ กรุณาเข้าสู่ระบบใหม่ก่อนอัปโหลดรูป');
        if (!window.APServiceMedia?.uploadPublicCatalogImage) throw new Error('ระบบอัปโหลดรูปภาพยังโหลดไม่พร้อม กรุณารีเฟรชแล้วลองใหม่');
        status.textContent = 'กำลังบีบอัดและอัปโหลดรูปสินค้า…';
        const uploaded = await window.APServiceMedia.uploadPublicCatalogImage(file, { url: M.config.url, publishableKey: M.config.publishableKey, accessToken: session.access_token, actorId: session.user.id, scope: `retail-product-${state.storeId}`, mediaType: 'RETAIL_PRODUCT_IMAGE', ownerType: 'admin' });
        form.elements.image_url.value = uploaded.publicUrl;
        preview.innerHTML = `<img src="${esc(uploaded.publicUrl)}" alt="ตัวอย่างรูปสินค้า">`;
        status.textContent = `อัปโหลดแล้ว · JPEG คุณภาพ 0.82 · ${uploaded.width}×${uploaded.height}px · ${Math.ceil(uploaded.bytes / 1024)} KB`;
      } catch (error) { input.value = ''; status.textContent = error?.message || 'อัปโหลดรูปสินค้าไม่สำเร็จ'; M.ui.setNotice(status.textContent, 'error'); }
    }; });
    form.onsubmit = async event => {
      event.preventDefault();
      const submit = form.querySelector('[type="submit"]');
      try {
        const price = Number(form.elements.price.value);
        if (!Number.isFinite(price) || price < 0) throw new Error('กรุณากรอกราคาขายเป็นจำนวนไม่ติดลบ');
        submit.disabled = true;
        await request('rpc/retail_admin_upsert_store_product', { method: 'POST', body: JSON.stringify({ p_store_id: state.storeId, p_product: { id: current.store_product_id || '', name: form.elements.name.value.trim(), unit_name: form.elements.unit_name.value.trim(), brand_name: form.elements.brand_name.value.trim(), category_name: form.elements.category_name.value.trim(), sku: form.elements.sku.value.trim(), price, active: form.elements.active.value === 'true', image_url: form.elements.image_url.value.trim() } }) });
        M.ui.setNotice(product ? 'บันทึกการแก้ไขสินค้าแล้ว' : 'เพิ่มสินค้า Retail แล้ว');
        close(); await loadCatalog();
      } catch (error) { submit.disabled = false; M.ui.setNotice(error?.message || 'บันทึกสินค้าไม่สำเร็จ', 'error'); }
    };
  }

  function stockModal(product) {
    if (!product) return;
    const { host, close } = createModal(`ปรับสต๊อก: ${product.name}`, `<div class="mpa-page-head"><div><h2 style="margin:0">ปรับสต๊อก: ${esc(product.name)}</h2><p class="mpa-muted">คงเหลือ ${esc(product.on_hand_quantity)} ${esc(product.unit_name)} · จองแล้ว ${esc(product.reserved_quantity)}</p></div><button class="mpa-button mpa-button-secondary" type="button" data-retail-close>ปิด</button></div><form id="retailStockForm"><div class="admin-retail-form-grid"><label class="mpa-field"><span>ประเภทการเคลื่อนไหว</span><select name="movement_type"><option value="receipt">รับเข้า</option><option value="adjustment">ปรับยอด</option><option value="damage">สินค้าชำรุด</option><option value="loss">สูญหาย</option><option value="return">รับคืน</option></select></label><label class="mpa-field"><span>จำนวน</span><input name="quantity" type="number" required step="0.001" placeholder="ใช้ค่าลบได้เฉพาะ “ปรับยอด”"></label><label class="mpa-field admin-retail-full"><span>เหตุผล</span><textarea name="reason" required rows="3" maxlength="500" placeholder="ระบุสาเหตุเพื่อให้ระบบบันทึก audit trail"></textarea></label></div><div class="admin-modal-actions"><button class="mpa-button mpa-button-secondary" type="button" data-retail-close>ยกเลิก</button><button class="mpa-button" type="submit">บันทึกการปรับสต๊อก</button></div></form>`);
    const form = host.querySelector('#retailStockForm');
    form.onsubmit = async event => {
      event.preventDefault();
      const submit = form.querySelector('[type="submit"]');
      try {
        const movementType = form.elements.movement_type.value;
        let quantity = Number(form.elements.quantity.value);
        if (!Number.isFinite(quantity) || quantity === 0) throw new Error('กรุณาระบุจำนวนสต๊อกที่ไม่เป็นศูนย์');
        if (movementType !== 'adjustment') quantity = Math.abs(quantity);
        submit.disabled = true;
        await request('rpc/retail_admin_record_inventory_movement', { method: 'POST', body: JSON.stringify({ p_store_id: state.storeId, p_store_product_id: product.store_product_id, p_movement_type: movementType, p_quantity: quantity, p_reason: form.elements.reason.value.trim() }) });
        M.ui.setNotice('บันทึกการปรับสต๊อกและ audit trail แล้ว');
        close(); await loadCatalog();
      } catch (error) { submit.disabled = false; M.ui.setNotice(error?.message || 'ปรับสต๊อกไม่สำเร็จ', 'error'); }
    };
  }

  async function init() {
    const R = window.APServiceAdminRuntime;
    if (!R?.gate) return M.ui.setNotice('Admin runtime ยังโหลดไม่พร้อม กรุณารีเฟรชหน้าเว็บแล้วลองใหม่', 'error');
    const access = await R.gate('retail', pageMarkup());
    if (!access) return;
    const select = document.getElementById('retailStore');
    const search = document.getElementById('retailSearch');
    document.getElementById('retailRefresh').onclick = async () => { await loadStores(); await loadCatalog(); };
    document.getElementById('retailAddProduct').onclick = () => productModal();
    document.getElementById('retailSearchButton').onclick = () => { state.search = search.value.trim(); loadCatalog(); };
    search.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); state.search = search.value.trim(); loadCatalog(); } };
    select.onchange = () => { state.storeId = select.value; state.search = ''; search.value = ''; loadCatalog(); };
    document.getElementById('retailCatalog').onclick = event => {
      const button = event.target.closest('[data-retail-action]'); if (!button) return;
      const product = state.products.find(row => String(row.store_product_id) === String(button.dataset.productId));
      if (!product) return M.ui.setNotice('ไม่พบข้อมูลสินค้า กรุณารีเฟรชรายการก่อน', 'error');
      if (button.dataset.retailAction === 'edit') productModal(product);
      if (button.dataset.retailAction === 'stock') stockModal(product);
      if (button.dataset.retailAction === 'identifiers') identifierModal(product);
    };
    await loadStores();
    renderProducts();
  }

  window.APServiceAdminPatch = window.APServiceAdminPatch || {};
  window.APServiceAdminPatch.retail = init;
})();
