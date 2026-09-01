(() => {
  'use strict';

  const M = window.APServiceMPA;
  if (!M) return;

  const MAX_FEATURED_STORES = 5;
  const esc = value => M.ui.escapeHtml(String(value ?? ''));
  const asObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const asArray = value => Array.isArray(value) ? value : [];
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const request = (path, options = {}) => M.request(path, { private: true, ...options });
  const notify = (message, type) => M.ui.setNotice(message, type);
  const nowIso = () => M.ui.nowIso();

  const formatForDateInput = value => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  };

  const parseDateInput = value => {
    const date = new Date(String(value || '').trim());
    if (!Number.isFinite(date.getTime())) return '';
    return date.toISOString();
  };

  const normaliseConfig = value => {
    const featuredStores = asObject(asObject(value).featuredStores);
    const rawMode = String(featuredStores.mode || 'auto').toLowerCase();
    return {
      mode: rawMode === 'manual' ? 'sponsored' : ['auto', 'sponsored', 'hybrid'].includes(rawMode) ? rawMode : 'auto',
      limit: Math.max(1, Math.min(MAX_FEATURED_STORES, Math.floor(number(featuredStores.limit, MAX_FEATURED_STORES)))),
      fallbackToAuto: featuredStores.fallbackToAuto !== false,
    };
  };

  const campaignRank = campaign => number(asObject(campaign.metadata).featured_rank, 9999);
  const selectedStoreIds = form => Array.from(form.querySelectorAll('select[data-featured-store-picker] option:checked')).map(option => option.value).filter(Boolean);
  const storeOptions = (stores, selected) => stores.map(store => `<option value="${esc(store.id)}" ${selected.has(String(store.id)) ? 'selected' : ''}>${esc(store.name)}${number(store.rating) > 0 ? ` · ★ ${number(store.rating).toFixed(1)}` : ''}</option>`).join('');

  function campaignEditor(campaign, index, stores, linksByCampaign, { isNew = false } = {}) {
    const id = String(campaign?.id || 'new-featured-campaign');
    const metadata = asObject(campaign?.metadata);
    const selected = new Set(asArray(linksByCampaign.get(String(campaign?.id))).map(String));
    const title = isNew ? 'สร้างช่วงโปรโมตใหม่' : `ช่วงโปรโมต #${index + 1}`;
    return `<article class="mpa-card featured-store-campaign" data-featured-campaign="${esc(id)}"><div class="featured-store-campaign__head"><div><h3>${esc(title)}</h3><p class="mpa-muted">${isNew ? 'เลือกเฉพาะร้านจากข้อมูล catalog จริง แล้วกำหนดช่วงเวลาและลำดับ' : `รหัส ${esc(id)}`}</p></div>${isNew ? '' : `<label class="mpa-field featured-store-campaign__active"><span>สถานะ</span><select data-featured-active><option value="true" ${campaign.active !== false ? 'selected' : ''}>เปิด</option><option value="false" ${campaign.active === false ? 'selected' : ''}>ปิด</option></select></label>`}</div><div class="admin-form-grid"><label class="mpa-field"><span>เริ่มแสดง</span><input data-featured-start type="datetime-local" value="${esc(formatForDateInput(campaign?.starts_at))}" required></label><label class="mpa-field"><span>สิ้นสุด</span><input data-featured-end type="datetime-local" value="${esc(formatForDateInput(campaign?.ends_at))}" required></label><label class="mpa-field"><span>ลำดับก่อนหลัง</span><input data-featured-rank type="number" min="1" max="9999" value="${esc(Math.max(1, campaignRank(campaign)))}" required></label><label class="mpa-field admin-form-full"><span>ร้านค้าที่อยู่ในช่วงโปรโมต</span><select data-featured-store-picker multiple size="5" required>${storeOptions(stores, selected)}</select><small class="mpa-muted">แตะเลือกได้หลายร้าน กด Ctrl/⌘ ค้างบนคอมพิวเตอร์เมื่อเลือกมากกว่าหนึ่งร้าน</small></label></div><div class="featured-store-campaign__actions"><button type="button" class="mpa-button" data-featured-save-campaign="${esc(id)}">${isNew ? 'สร้างช่วงโปรโมต' : 'บันทึกช่วงโปรโมต'}</button>${isNew ? '' : '<button type="button" class="mpa-button mpa-button-secondary" data-featured-reload>ยกเลิกการแก้ไข</button>'}</div></article>`;
  }

  function render(panel, state) {
    const { rootConfig, config, stores, campaigns, linksByCampaign, loaded } = state;
    if (!loaded) {
      panel.innerHTML = '<div class="featured-store-management__loading">กำลังโหลดการตั้งค่าร้านค้าเด่น…</div>';
      return;
    }
    const liveCampaigns = campaigns.slice().sort((left, right) => campaignRank(left) - campaignRank(right) || String(left.starts_at || '').localeCompare(String(right.starts_at || '')));
    const hasStores = stores.length > 0;
    panel.innerHTML = `<div class="admin-content-panel-head"><div><span class="admin-kicker">FEATURED STORES</span><h2>ร้านค้าเด่นและพื้นที่โปรโมต</h2><p class="mpa-muted">กำหนดให้หน้า Customer คัดเลือกจากคะแนนและรีวิวจริง หรือแสดงร้านที่ได้รับสิทธิ์โปรโมตตามช่วงเวลาที่ตั้งไว้ ระบบจะไม่สร้างข้อมูลร้านจำลอง</p></div></div><section class="mpa-card featured-store-settings"><div class="featured-store-settings__head"><div><h3>รูปแบบการแสดงผล</h3><p class="mpa-muted">ตั้งค่าพื้นที่ card สี่เหลี่ยมแบบเลื่อนซ้าย–ขวาในหน้าร้าน Customer</p></div><button type="button" class="mpa-button" data-featured-save-config>บันทึกการแสดงผล</button></div><div class="admin-form-grid"><label class="mpa-field"><span>โหมด</span><select data-featured-mode><option value="auto" ${config.mode === 'auto' ? 'selected' : ''}>อัตโนมัติ · คะแนนและรีวิวจริง</option><option value="sponsored" ${config.mode === 'sponsored' ? 'selected' : ''}>เฉพาะร้านที่ได้รับสิทธิ์โปรโมต</option><option value="hybrid" ${config.mode === 'hybrid' ? 'selected' : ''}>ผสม · โปรโมตก่อน แล้วเติมอัตโนมัติ</option></select></label><label class="mpa-field"><span>จำนวนสูงสุด</span><input data-featured-limit type="number" min="1" max="${MAX_FEATURED_STORES}" value="${esc(config.limit)}"></label><label class="mpa-field"><span>เมื่อร้านโปรโมตไม่ครบจำนวน</span><select data-featured-fallback><option value="true" ${config.fallbackToAuto ? 'selected' : ''}>เติมด้วยร้านอัตโนมัติ</option><option value="false" ${!config.fallbackToAuto ? 'selected' : ''}>แสดงเฉพาะร้านที่ตั้งไว้</option></select></label></div></section><section class="featured-store-campaigns"><div class="featured-store-campaigns__head"><div><h3>ช่วงโปรโมตร้านค้า</h3><p class="mpa-muted">สามารถปิดรายการเดิมได้โดยไม่ลบประวัติ และสร้างช่วงใหม่เพื่อรองรับการซื้อโฆษณาในอนาคต</p></div><button type="button" class="mpa-button mpa-button-secondary" data-featured-new ${hasStores ? '' : 'disabled'}>+ เพิ่มช่วงโปรโมต</button></div>${hasStores ? (liveCampaigns.length ? liveCampaigns.map((campaign, index) => campaignEditor(campaign, index, stores, linksByCampaign)).join('') : '<div class="mpa-card featured-store-management__empty">ยังไม่มีช่วงโปรโมตร้านค้า กด “เพิ่มช่วงโปรโมต” เพื่อเริ่มกำหนดร้านและเวลา</div>') : '<div class="mpa-card featured-store-management__empty">ยังไม่มีร้านที่พร้อมเลือกจาก catalog จึงยังสร้างช่วงโปรโมตไม่ได้</div>'}</section>`;
    void rootConfig;
  }

  function wire(panel, state, refresh) {
    const bindOnce = (element, handler) => {
      if (!element || element.dataset.featuredBound === 'true') return;
      element.dataset.featuredBound = 'true';
      element.addEventListener('click', handler);
    };
    bindOnce(panel.querySelector('[data-featured-save-config]'), async () => {
      const mode = panel.querySelector('[data-featured-mode]')?.value || 'auto';
      const limit = Math.max(1, Math.min(MAX_FEATURED_STORES, Math.floor(number(panel.querySelector('[data-featured-limit]')?.value, MAX_FEATURED_STORES))));
      const fallbackToAuto = panel.querySelector('[data-featured-fallback]')?.value !== 'false';
      const nextRoot = { ...state.rootConfig, featuredStores: { mode, limit, fallbackToAuto } };
      try {
        await request('platform_configs?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify([{ key: 'customer_promotions', value: nextRoot, updated_at: nowIso() }]) });
        const saved = await request('platform_configs?select=value&key=eq.customer_promotions&limit=1', { forceFresh: true });
        if (!saved?.[0] || JSON.stringify(saved[0].value) !== JSON.stringify(nextRoot)) throw new Error('บันทึกแล้วแต่ตรวจสอบการตั้งค่าร้านค้าเด่นจากฐานข้อมูลไม่ตรงกัน กรุณาลองใหม่');
        await request('admin_action_audit', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ action: 'featured_stores_config_updated', reason: 'แก้ไขรูปแบบร้านค้าเด่นจาก Customer Content Studio', before_state: { featuredStores: state.config }, after_state: { featuredStores: nextRoot.featuredStores }, created_at: nowIso() }) }).catch(() => {});
        notify('บันทึกการแสดงผลร้านค้าเด่นแล้ว');
        await refresh();
      } catch (error) { notify(`บันทึกการแสดงผลไม่สำเร็จ: ${error.message}`, 'error'); }
    });

    bindOnce(panel.querySelector('[data-featured-new]'), () => {
      const draft = { id: '', starts_at: '', ends_at: '', active: true, metadata: { featured_rank: 1 } };
      panel.querySelector('.featured-store-campaigns')?.insertAdjacentHTML('beforeend', campaignEditor(draft, 0, state.stores, new Map(), { isNew: true }));
      wire(panel, state, refresh);
    });

    panel.querySelectorAll('[data-featured-save-campaign]').forEach(button => bindOnce(button, async () => {
      const card = button.closest('[data-featured-campaign]');
      if (!card) return;
      const start = parseDateInput(card.querySelector('[data-featured-start]')?.value);
      const end = parseDateInput(card.querySelector('[data-featured-end]')?.value);
      const rank = Math.max(1, Math.min(9999, Math.floor(number(card.querySelector('[data-featured-rank]')?.value, 1))));
      const storeIds = selectedStoreIds(card);
      const isNew = button.dataset.featuredSaveCampaign === 'new-featured-campaign';
      const existing = state.campaigns.find(campaign => String(campaign.id) === String(button.dataset.featuredSaveCampaign));
      if (!start || !end || Date.parse(start) > Date.parse(end)) { notify('กรุณาระบุเวลาเริ่มและสิ้นสุดให้ถูกต้อง', 'error'); return; }
      if (!storeIds.length) { notify('กรุณาเลือกร้านอย่างน้อย 1 ร้าน', 'error'); return; }
      try {
        const payload = { campaign_type: 'store_sponsored', active: card.querySelector('[data-featured-active]')?.value !== 'false', starts_at: start, ends_at: end, metadata: { ...asObject(existing?.metadata), featured_rank: rank, featured_source: 'customer-content-studio' } };
        let campaignId = existing?.id;
        if (isNew) {
          const created = await request('campaigns', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload) });
          campaignId = created?.[0]?.id;
          if (!campaignId) throw new Error('ระบบไม่ได้คืนรหัสช่วงโปรโมตหลังสร้างรายการ');
        } else {
          await request(`campaigns?id=eq.${encodeURIComponent(campaignId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(payload) });
          await request(`campaign_stores?campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ active: false }) });
        }
        await request('campaign_stores?on_conflict=campaign_id,store_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(storeIds.map(storeId => ({ campaign_id: campaignId, store_id: storeId, active: true }))) });
        await request('admin_action_audit', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ action: isNew ? 'featured_store_campaign_created' : 'featured_store_campaign_updated', reason: 'จัดการช่วงโปรโมตร้านค้าเด่น', after_state: { campaign_id: campaignId, store_ids: storeIds, ...payload }, created_at: nowIso() }) }).catch(() => {});
        notify(isNew ? 'สร้างช่วงโปรโมตร้านค้าแล้ว' : 'บันทึกช่วงโปรโมตร้านค้าแล้ว');
        await refresh();
      } catch (error) { notify(`บันทึกช่วงโปรโมตไม่สำเร็จ: ${error.message}`, 'error'); }
    }));

    panel.querySelectorAll('[data-featured-reload]').forEach(button => bindOnce(button, () => void refresh()));
  }

  function createController(panel) {
    const state = { rootConfig: {}, config: normaliseConfig({}), stores: [], campaigns: [], linksByCampaign: new Map(), loaded: false };
    const refresh = async () => {
      state.loaded = false;
      render(panel, state);
      try {
        const [configRows, stores, campaigns, links] = await Promise.all([
          request('platform_configs?select=value&key=eq.customer_promotions&limit=1'),
          request('catalog_stores?select=id,name,rating&order=name.asc&limit=500'),
          request('campaigns?select=id,campaign_type,active,starts_at,ends_at,metadata&campaign_type=eq.store_sponsored&order=starts_at.desc&limit=100'),
          request('campaign_stores?select=campaign_id,store_id,active&order=campaign_id.asc&limit=500'),
        ]);
        state.rootConfig = asObject(configRows?.[0]?.value);
        state.config = normaliseConfig(state.rootConfig);
        state.stores = asArray(stores);
        state.campaigns = asArray(campaigns);
        state.linksByCampaign = new Map();
        asArray(links).filter(link => link.active !== false).forEach(link => {
          const key = String(link.campaign_id || '');
          const current = state.linksByCampaign.get(key) || [];
          current.push(link.store_id);
          state.linksByCampaign.set(key, current);
        });
        state.loaded = true;
        render(panel, state);
        wire(panel, state, refresh);
      } catch (error) {
        panel.innerHTML = `<div class="featured-store-management__error">โหลดข้อมูลร้านค้าเด่นไม่สำเร็จ: ${esc(error.message || 'กรุณาลองใหม่')}</div>`;
      }
    };
    return { refresh };
  }

  function mount() {
    const form = document.querySelector('#customerContentForm');
    if (!form || form.querySelector('[data-featured-store-panel]')) return;
    const nav = form.querySelector('.admin-content-subnav');
    if (!nav) return;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'admin-content-tab';
    tab.dataset.contentTab = 'featured-stores';
    tab.textContent = 'ร้านค้าเด่น';
    nav.append(tab);

    const panel = document.createElement('section');
    panel.className = 'admin-content-panel featured-store-management';
    panel.dataset.contentPanel = 'featured-stores';
    panel.dataset.featuredStorePanel = 'true';
    form.append(panel);
    const controller = createController(panel);
    tab.addEventListener('click', () => {
      form.querySelectorAll('[data-content-tab]').forEach(item => item.classList.toggle('is-active', item === tab));
      form.querySelectorAll('[data-content-panel]').forEach(item => item.classList.toggle('is-active', item === panel));
      if (!panel.dataset.featuredLoaded) {
        panel.dataset.featuredLoaded = 'true';
        void controller.refresh();
      }
    });
  }

  const observer = new MutationObserver(mount);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  mount();
})();
