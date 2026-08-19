(() => {
  'use strict';
  if (document.body.dataset.page !== 'stores') return;

  const M = window.APServiceMPA;
  if (!M) return;
  const esc = M.ui.escapeHtml;
  const categoryByStore = new Map();
  const categories = new Map();
  let observer;

  const closeSheet = sheet => { if (sheet?.open) sheet.close(); sheet?.remove(); };
  const categoryLabel = id => categories.get(id) || { id: 'store-other', name: 'อื่น ๆ', icon: '🏪' };

  async function loadCategoryData() {
    const [catalog, assignments] = await Promise.all([
      M.request('store_categories?select=id,name,icon&active=eq.true&order=sort_order.asc', { private: true, cacheTtlMs: 30_000, cacheKey: 'admin-store-compact:categories' }),
      M.request('stores?select=id,category_id&order=name.asc&limit=1000', { private: true, cacheTtlMs: 15_000, cacheKey: 'admin-store-compact:assignments' }),
    ]);
    categories.clear();
    (catalog || []).forEach(row => categories.set(row.id, row));
    categoryByStore.clear();
    (assignments || []).forEach(row => categoryByStore.set(row.id, row.category_id || 'store-other'));
  }

  async function saveCategory(storeId, categoryId, sheet) {
    const session = await M.auth.refreshSession(false);
    if (!session?.access_token) throw new Error('เซสชัน Admin หมดอายุ กรุณาเข้าสู่ระบบใหม่');
    const response = await fetch(`${M.config.url}/functions/v1/role-access`, {
      method: 'POST',
      headers: { apikey: M.config.publishableKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_store_section', entity_id: storeId, section: 'general', data: { category_id: categoryId } }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error || 'บันทึกประเภทร้านไม่สำเร็จ');
    categoryByStore.set(storeId, categoryId);
    M.ui.setNotice('บันทึกประเภทร้านแล้ว ระบบจะแสดงหมวดใหม่ที่หน้าลูกค้าตามข้อมูลส่วนกลาง');
    closeSheet(sheet);
    enhance();
  }

  function createSheet(card, storeId, title) {
    document.getElementById(`store-actions-${storeId}`)?.remove();
    const category = categoryLabel(categoryByStore.get(storeId));
    const sheet = document.createElement('dialog');
    sheet.id = `store-actions-${storeId}`;
    sheet.className = 'admin-store-action-sheet';
    sheet.innerHTML = `<div class="admin-store-sheet-content"><div class="admin-store-sheet-heading"><div><h2>${esc(title)}</h2><p>เลือกงานที่ต้องการ ระบบจะเปิดเฉพาะหมวดนั้นและบันทึกตามสิทธิ์ Control Plane</p></div><button type="button" class="mpa-button mpa-button-secondary admin-store-sheet-close" data-store-sheet-close>ปิด</button></div><div class="admin-store-sheet-actions" data-store-sheet-actions></div><form class="admin-store-category-editor"><label>ประเภทสำหรับการแสดงผลลูกค้า<select name="category_id">${[...categories.values()].map(item => `<option value="${esc(item.id)}" ${item.id === category.id ? 'selected' : ''}>${esc(item.icon || '🏪')} ${esc(item.name)}</option>`).join('')}</select></label><button class="mpa-button" type="submit">บันทึกประเภทร้าน</button></form></div>`;
    document.body.append(sheet);
    const actions = sheet.querySelector('[data-store-sheet-actions]');
    card.querySelectorAll('.admin-store-card-actions .mpa-button').forEach(button => {
      const action = button.cloneNode(true);
      action.type = 'button';
      action.addEventListener('click', () => { closeSheet(sheet); button.click(); });
      actions.append(action);
    });
    sheet.querySelectorAll('[data-store-sheet-close]').forEach(button => button.addEventListener('click', () => closeSheet(sheet)));
    sheet.addEventListener('cancel', event => { event.preventDefault(); closeSheet(sheet); });
    sheet.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const button = event.currentTarget.querySelector('[type="submit"]');
      try { button.disabled = true; await saveCategory(storeId, event.currentTarget.elements.category_id.value, sheet); }
      catch (error) { button.disabled = false; M.ui.setNotice(error.message || 'บันทึกประเภทร้านไม่สำเร็จ', 'error'); }
    });
    return sheet;
  }

  function applyFilter() {
    const select = document.getElementById('storeCategoryFilter');
    if (!select) return;
    document.querySelectorAll('.admin-store-card.is-compact').forEach(card => { card.hidden = select.value !== 'all' && card.dataset.storeCategory !== select.value; });
  }

  function enhance() {
    const host = document.getElementById('stores');
    if (!host || !host.querySelector('.admin-store-grid')) return;
    const toolbar = host.querySelector('.admin-store-toolbar');
    if (toolbar && !toolbar.querySelector('#storeCategoryFilter')) {
      toolbar.insertAdjacentHTML('beforeend', `<label class="mpa-field admin-store-compact-filter"><span>ประเภทร้าน</span><select id="storeCategoryFilter"><option value="all">ทุกประเภท</option>${[...categories.values()].map(item => `<option value="${esc(item.id)}">${esc(item.icon || '🏪')} ${esc(item.name)}</option>`).join('')}</select></label>`);
      toolbar.querySelector('#storeCategoryFilter').addEventListener('change', applyFilter);
    }
    host.querySelectorAll('.admin-store-card').forEach(card => {
      if (card.dataset.compactReady === 'true') return;
      const sourceButton = card.querySelector('[data-store-general]');
      const storeId = sourceButton?.dataset.storeGeneral;
      if (!storeId) return;
      const title = card.querySelector('h2')?.textContent?.trim() || 'ร้านค้า';
      const category = categoryLabel(categoryByStore.get(storeId));
      card.dataset.compactReady = 'true';
      card.dataset.storeCategory = category.id;
      card.classList.add('is-compact');
      card.querySelector('.admin-store-card-head > div:nth-child(2)')?.insertAdjacentHTML('beforeend', `<span class="admin-store-category-chip">${esc(category.icon || '🏪')} ${esc(category.name)}</span>`);
      const meta = card.querySelector('.admin-store-meta');
      if (meta) meta.classList.add('admin-store-compact-meta');
      const actions = card.querySelector('.admin-store-card-actions');
      if (actions) {
        actions.innerHTML = `<button class="admin-store-manage-trigger" type="button" data-store-manage>จัดการร้าน ${esc(title)} <span aria-hidden="true">⋯</span></button>`;
        actions.querySelector('[data-store-manage]').addEventListener('click', () => createSheet(card, storeId, title).showModal());
      }
    });
    applyFilter();
  }

  async function init() {
    try { await loadCategoryData(); }
    catch (error) { M.ui.setNotice('ยังโหลดหมวดประเภทร้านไม่ครบ จึงแสดงรายการร้านตามข้อมูลที่มีอยู่', 'error'); }
    observer = new MutationObserver(() => requestAnimationFrame(enhance));
    observer.observe(document.body, { childList: true, subtree: true });
    enhance();
    addEventListener('pagehide', () => observer?.disconnect(), { once: true });
  }

  init();
})();
