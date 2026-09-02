(() => {
  'use strict';

  const M = window.APServiceMPA;
  if (!M) return;

  const esc = value => M.ui.escapeHtml(String(value ?? ''));
  const host = () => document.querySelector('#contentStudioHost');
  const form = () => document.querySelector('#customerContentForm');
  const visualMount = () => document.querySelector('#customerVisualSettingsMount');

  const findImage = selector => document.querySelector(`${selector} img`)?.getAttribute('src') || '';
  const imageOrSymbol = (src, symbol) => src ? `<img src="${esc(src)}" alt="" loading="lazy">` : `<span aria-hidden="true">${esc(symbol)}</span>`;

  const card = ({ key, title, description, meta, symbol, image, disabled = false }) => `<button type="button" class="admin-media-category-card${disabled ? ' is-disabled' : ''}" data-media-entry="${esc(key)}" ${disabled ? 'disabled' : ''}><span class="admin-media-category-card__preview">${imageOrSymbol(image, symbol)}</span><span class="admin-media-category-card__copy"><strong>${esc(title)}</strong><span>${esc(description)}</span><small>${esc(meta)}</small></span><span class="admin-media-category-card__arrow" aria-hidden="true">›</span></button>`;

  const setActivePanel = (contentForm, key) => {
    const tab = contentForm.querySelector(`[data-content-tab="${CSS.escape(key)}"]`);
    if (tab && typeof tab.click === 'function') tab.click();
    contentForm.querySelectorAll('[data-content-panel]').forEach(panel => {
      panel.hidden = panel.dataset.contentPanel !== key;
      panel.classList.toggle('is-active', panel.dataset.contentPanel === key);
    });
  };

  const hideNativeTabs = contentForm => contentForm.querySelector('.admin-content-subnav')?.setAttribute('hidden', '');

  function buildDashboard(contentForm) {
    let dashboard = document.querySelector('#adminMediaDashboard');
    if (!dashboard) {
      dashboard = document.createElement('section');
      dashboard.id = 'adminMediaDashboard';
      dashboard.className = 'admin-media-hub';
      contentForm.parentElement?.insertBefore(dashboard, contentForm);
    }

    const services = contentForm.querySelectorAll('[data-content-panel="services"] .admin-content-card').length;
    const promotions = contentForm.querySelectorAll('[data-content-promotions] .admin-promotion-card, [data-content-promotions] article').length;
    const mediaCount = contentForm.querySelectorAll('[data-content-panel="registry"] tbody tr').length;
    const visual = visualMount();
    const visualImage = findImage('#customerVisualSettingsMount [data-visual-preview="default.backgroundUrl"]');
    const loginReady = Boolean(contentForm.querySelector('[data-content-tab="login-media"]'));
    const featuredReady = Boolean(contentForm.querySelector('[data-content-tab="featured-stores"]'));

    dashboard.innerHTML = `<div class="admin-media-hub__head"><div><span class="admin-kicker">MEDIA CONTROL CENTER</span><h2>เลือกหมวดหมู่ที่ต้องการตั้งค่า</h2><p class="mpa-muted">แตะการ์ดเพื่อเข้าเมนูรองและแก้ไขรายละเอียดเฉพาะส่วนนั้น ไม่ต้องเลื่อนผ่านรายการทั้งหมด</p></div><span class="admin-inline-count">${services || 0} การ์ดบริการ · ${promotions || 0} แบนเนอร์</span></div><div class="admin-media-category-grid">${card({ key: 'hero', title: 'หน้าแรกและ Hero', description: 'ข้อความหลัก ปุ่ม และภาพนำ', meta: 'ตั้งค่าหน้าแรก', symbol: '⌂', image: findImage('[data-media-preview="hero.backgroundUrl"]') || findImage('[data-media-preview="hero.artUrl"]') })}${card({ key: 'services', title: 'การ์ดบริการ', description: 'เพิ่ม/แก้ไขการ์ด ไอคอน ภาพ และลิงก์', meta: `${services || 0} รายการบริการ`, symbol: '✦', image: findImage('[data-media-preview^="card.food."]') || findImage('[data-media-preview^="card.supermarket."]') })}${card({ key: 'navigation', title: 'ส่วนบนและตะกร้า', description: 'ข้อความนำทางและตะกร้าลอย', meta: 'Header · Navigation · Cart', symbol: '≡', image: '' })}${card({ key: 'promotions', title: 'แบนเนอร์โฆษณา', description: 'ภาพ ข้อความ ลิงก์ และสถานะแบนเนอร์', meta: `${promotions || 0} รายการโฆษณา`, symbol: '▣', image: findImage('[data-content-promotions]') })}${card({ key: 'visuals', title: 'พื้นหลังและ Motion', description: 'พื้นหลังทุกหน้า เอฟเฟกต์ และทิศทางการเคลื่อนไหว', meta: visual ? 'ค่าเริ่มต้น · เทศกาล · 21 หน้า' : 'กำลังเตรียมเมนู', symbol: '◌', image: visualImage })}${card({ key: 'login-media', title: 'สื่อหน้าลงชื่อเข้าใช้', description: 'ภาพพื้นหลัง Login ของทุกบทบาท', meta: loginReady ? 'พร้อมตั้งค่า' : 'โหลดเมนูเมื่อเปิด', symbol: '□', image: '' })}${card({ key: 'featured-stores', title: 'ร้านค้าเด่น', description: 'ภาพและช่วงโปรโมตร้านค้าบน Customer', meta: featuredReady ? 'พร้อมตั้งค่า' : 'โหลดเมนูเมื่อเปิด', symbol: '◇', image: '' })}${card({ key: 'registry', title: 'คลังสื่อและประวัติ', description: 'ตรวจสอบไฟล์ที่ลงทะเบียนในระบบ', meta: `${Math.max(0, mediaCount)} รายการล่าสุด`, symbol: '▤', image: '' })}</div>`;
    dashboard.hidden = true;
    return dashboard;
  }

  function detailBar(contentForm, title = 'รายละเอียดการตั้งค่า') {
    let bar = contentForm.querySelector('[data-media-backbar]');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'admin-media-detail-bar';
      bar.dataset.mediaBackbar = 'true';
      bar.innerHTML = '<button type="button" class="mpa-button mpa-button-secondary" data-media-back>‹ กลับไปหน้ารวม Media</button><span data-media-detail-title></span>';
      const nav = contentForm.querySelector('.admin-content-subnav');
      nav?.after(bar);
    }
    const label = bar.querySelector('[data-media-detail-title]');
    if (label) label.textContent = title;
    return bar;
  }

  function openMainEntry(key) {
    const contentForm = form();
    const dashboard = document.querySelector('#adminMediaDashboard');
    const visual = visualMount();
    if (!contentForm || !dashboard) return;
    dashboard.hidden = true;
    contentForm.hidden = true;
    if (visual) { visual.hidden = key !== 'visuals'; visual.dataset.mediaOpen = key === 'visuals' ? 'true' : 'false'; }
    if (key === 'visuals') {
      ensureVisualNavigation();
      visual?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    contentForm.hidden = false;
    hideNativeTabs(contentForm);
    const bar = detailBar(contentForm, ({ hero: 'หน้าแรกและ Hero', services: 'การ์ดบริการ', navigation: 'ส่วนบนและตะกร้า', promotions: 'แบนเนอร์โฆษณา', 'login-media': 'สื่อหน้าลงชื่อเข้าใช้', 'featured-stores': 'ร้านค้าเด่น', registry: 'คลังสื่อและประวัติ' })[key] || 'รายละเอียดการตั้งค่า');
    bar.hidden = false;
    setActivePanel(contentForm, key);
    contentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showDashboard() {
    const contentForm = form();
    const dashboard = document.querySelector('#adminMediaDashboard');
    const visual = visualMount();
    if (contentForm) contentForm.hidden = true;
    if (contentForm) contentForm.querySelectorAll('[data-content-panel]').forEach(panel => { panel.hidden = true; });
    if (contentForm?.querySelector('[data-media-backbar]')) contentForm.querySelector('[data-media-backbar]').hidden = true;
    if (visual) { visual.hidden = true; visual.dataset.mediaOpen = 'false'; }
    if (dashboard) { dashboard.hidden = false; dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }

  function buildVisualIndex(mount) {
    const visualSettings = mount.querySelector('.customer-visual-settings');
    if (!visualSettings) return;
    let index = mount.querySelector('[data-visual-index]');
    if (index && mount.dataset.visualIndexBuilt === 'true') return { visualSettings, index, pages: [...visualSettings.querySelectorAll('[data-visual-form="page"]')] };
    if (!index) {
      index = document.createElement('section');
      index.className = 'admin-media-subhub';
      index.dataset.visualIndex = 'true';
      visualSettings.before(index);
    }
    const defaultImage = findImage('[data-visual-preview="default.backgroundUrl"]');
    const festivalImage = findImage('[data-visual-preview="festival.effectUrl"]');
    const pages = [...visualSettings.querySelectorAll('[data-visual-form="page"]')];
    index.innerHTML = `<div class="admin-media-subhub__head"><div><span class="admin-kicker">CUSTOMER VISUAL SYSTEM</span><h2>พื้นหลังและ Motion</h2><p class="mpa-muted">เลือกชุดการตั้งค่าก่อน แล้วค่อยเข้าไปแก้ไขเฉพาะรายการที่ต้องการ</p></div><button type="button" class="mpa-button mpa-button-secondary" data-visual-back>‹ กลับไปหน้ารวม Media</button></div><div class="admin-media-category-grid admin-media-category-grid--sub">${card({ key: 'visual-default', title: 'ค่าเริ่มต้นทุกหน้า', description: 'พื้นหลังสำรองและ Motion หลัก', meta: 'แก้ไข 1 ชุด', symbol: '◐', image: defaultImage })}${card({ key: 'visual-festival', title: 'เทศกาลและฤดูกาล', description: 'Motion เทศกาล ทิศทาง และช่วงเวลา', meta: 'แก้ไข 1 ชุด', symbol: '✧', image: festivalImage })}${card({ key: 'visual-pages', title: 'พื้นหลังแยกตามหน้า', description: 'เลือกหน้า Customer ที่ต้องการตั้งค่า', meta: `${pages.length} หน้า`, symbol: '▦', image: '' })}</div>`;
    visualSettings.hidden = true;
    index.hidden = false;
    mount.dataset.visualIndexBuilt = 'true';
    return { visualSettings, index, pages };
  }

  function openVisualEntry(key) {
    const mount = visualMount();
    if (!mount) return;
    const built = buildVisualIndex(mount);
    if (!built) return;
    const { visualSettings, index, pages } = built;
    if (key === 'visual-pages') {
      index.hidden = true;
      visualSettings.hidden = false;
      visualSettings.querySelectorAll('[data-visual-form="default"], [data-visual-form="festival"]').forEach(item => { item.hidden = true; });
      const pageSection = visualSettings.querySelector('.customer-visual-page-list')?.closest('section');
      if (pageSection) pageSection.hidden = false;
      pages.forEach(item => { item.hidden = false; });
      let pageMenu = mount.querySelector('[data-visual-page-menu]');
      if (!pageMenu) { pageMenu = document.createElement('section'); pageMenu.className = 'admin-media-page-menu'; pageMenu.dataset.visualPageMenu = 'true'; pageSection?.before(pageMenu); }
      pageMenu.innerHTML = `<div class="admin-media-subhub__head"><div><h3>เลือกหน้าที่ต้องการแก้ไข</h3><p class="mpa-muted">แตะชื่อหน้าเพื่อเปิดฟอร์มเฉพาะหน้านั้น</p></div><button type="button" class="mpa-button mpa-button-secondary" data-visual-index>‹ กลับไปหมวดพื้นหลัง</button></div><div class="admin-media-page-grid">${pages.map(page => { const keyName = page.dataset.visualKey || ''; const title = page.querySelector('h3')?.textContent || keyName; const image = page.querySelector('.admin-content-media-preview img')?.getAttribute('src') || ''; return `<button type="button" class="admin-media-page-card" data-visual-page="${esc(keyName)}"><span class="admin-media-page-card__preview">${imageOrSymbol(image, '◌')}</span><span><strong>${esc(title)}</strong><small>พื้นหลังและ Motion เฉพาะหน้า</small></span><span aria-hidden="true">›</span></button>`; }).join('')}</div>`;
      pageMenu.hidden = false;
      pageSection.hidden = true;
      pages.forEach(page => { page.hidden = true; });
    } else {
      index.hidden = true;
      const pageMenu = mount.querySelector('[data-visual-page-menu]');
      if (pageMenu) pageMenu.hidden = true;
      visualSettings.hidden = false;
      visualSettings.querySelectorAll('[data-visual-form]').forEach(item => { item.hidden = item.dataset.visualForm !== key.replace('visual-', ''); });
      const pageSection = visualSettings.querySelector('.customer-visual-page-list')?.closest('section');
      if (pageSection) pageSection.hidden = true;
      pages.forEach(item => { item.hidden = true; });
    }
    mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function ensureVisualNavigation() {
    const mount = visualMount();
    if (!mount || !mount.querySelector('.customer-visual-settings')) return;
    if (mount.dataset.mediaOpen !== 'true') mount.hidden = true;
    if (!mount.dataset.visualIndexBuilt) buildVisualIndex(mount);
    if (mount.dataset.mediaNavBound === 'true') return;
    mount.dataset.mediaNavBound = 'true';
    mount.addEventListener('click', event => {
      const visualEntry = event.target.closest('[data-media-entry]');
      if (visualEntry?.dataset.mediaEntry.startsWith('visual-')) { openVisualEntry(visualEntry.dataset.mediaEntry); return; }
      if (event.target.closest('[data-visual-back]')) { showDashboard(); return; }
      if (event.target.closest('[data-visual-index]')) { buildVisualIndex(mount); return; }
      const page = event.target.closest('[data-visual-page]');
      if (page) {
        const target = mount.querySelector(`[data-visual-form="page"][data-visual-key="${CSS.escape(page.dataset.visualPage)}"]`);
        const menu = mount.querySelector('[data-visual-page-menu]');
        const section = mount.querySelector('.customer-visual-page-list')?.closest('section');
        if (menu) menu.hidden = true;
        if (section) section.hidden = false;
        mount.querySelectorAll('[data-visual-form]').forEach(item => { item.hidden = item !== target; });
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function bind() {
    const contentForm = form();
    if (!contentForm) return;
    const dashboard = buildDashboard(contentForm);
    if (!dashboard || dashboard.dataset.mediaNavBound === 'true') return;
    dashboard.dataset.mediaNavBound = 'true';
    contentForm.hidden = true;
    contentForm.querySelectorAll('[data-content-panel]').forEach(panel => { panel.hidden = true; });
    hideNativeTabs(contentForm);
    detailBar(contentForm).hidden = true;
    dashboard.addEventListener('click', event => {
      const entry = event.target.closest('[data-media-entry]');
      if (entry && !entry.disabled) openMainEntry(entry.dataset.mediaEntry);
    });
    contentForm.addEventListener('click', event => {
      if (event.target.closest('[data-media-back]')) showDashboard();
    });
    ensureVisualNavigation();
  }

  const observer = new MutationObserver(() => { bind(); ensureVisualNavigation(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  bind();
})();
