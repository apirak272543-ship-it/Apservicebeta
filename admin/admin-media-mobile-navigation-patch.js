(() => {
  'use strict';

  if (window.__AP_SERVICE_MEDIA_HUB_CONTROLLER__) return;
  const M = window.APServiceMPA;
  if (!M) return;
  window.__AP_SERVICE_MEDIA_HUB_CONTROLLER__ = true;

  const state = {
    route: 'dashboard',
    visualRoute: 'index',
    dashboardSignature: '',
    visualSignature: '',
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => M.ui.escapeHtml(String(value ?? ''));
  const form = () => $('#customerContentForm');
  const visualMount = () => $('#customerVisualSettingsMount');
  const setHidden = (element, hidden) => {
    if (element) element.hidden = Boolean(hidden);
  };
  const isVisible = element => Boolean(element && !element.hidden && getComputedStyle(element).display !== 'none');
  const findImage = selector => $(`${selector} img`)?.getAttribute('src') || '';
  const imageOrSymbol = (src, symbol) => src
    ? `<img src="${esc(src)}" alt="" loading="lazy">`
    : `<span aria-hidden="true">${esc(symbol)}</span>`;

  const card = ({ key, title, description, meta, symbol, image, disabled = false }) => `
    <button type="button" class="admin-media-category-card${disabled ? ' is-disabled' : ''}" data-media-entry="${esc(key)}"${disabled ? ' disabled' : ''}>
      <span class="admin-media-category-card__preview">${imageOrSymbol(image, symbol)}</span>
      <span class="admin-media-category-card__copy">
        <strong>${esc(title)}</strong>
        <span>${esc(description)}</span>
        <small>${esc(meta)}</small>
      </span>
      <span class="admin-media-category-card__arrow" aria-hidden="true">›</span>
    </button>`;

  function getPanel(contentForm, key) {
    return $$('.admin-content-panel', contentForm).find(panel => panel.dataset.contentPanel === key) || null;
  }

  function syncNativeTab(contentForm, key) {
    const panel = getPanel(contentForm, key);
    if (!panel) return false;

    const tab = $$('[data-content-tab]', contentForm).find(item => item.dataset.contentTab === key);
    if (tab && typeof tab.click === 'function') tab.click();

    $$('[data-content-tab]', contentForm).forEach(item => {
      item.classList.toggle('is-active', item === tab);
    });
    $$('.admin-content-panel', contentForm).forEach(item => {
      const active = item === panel;
      setHidden(item, !active);
      item.classList.toggle('is-active', active);
    });
    return true;
  }

  function hideNativeTabs(contentForm) {
    const nav = $('.admin-content-subnav', contentForm);
    if (nav) nav.setAttribute('hidden', '');
  }

  function getMainDetailBar(contentForm) {
    let bar = $('[data-media-backbar]', contentForm);
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'admin-media-detail-bar';
      bar.dataset.mediaBackbar = 'true';
      bar.innerHTML = '<button type="button" class="mpa-button mpa-button-secondary" data-media-back>‹ กลับไปหน้ารวม Media</button><span data-media-detail-title></span>';
      $('.admin-content-subnav', contentForm)?.after(bar);
    }
    return bar;
  }

  function setMainDetailTitle(contentForm, title) {
    const bar = getMainDetailBar(contentForm);
    const label = $('[data-media-detail-title]', bar);
    if (label) label.textContent = title;
    return bar;
  }

  function renderDashboard(contentForm) {
    let dashboard = $('#adminMediaDashboard');
    if (!dashboard) {
      dashboard = document.createElement('section');
      dashboard.id = 'adminMediaDashboard';
      dashboard.className = 'admin-media-hub';
      contentForm.parentElement?.insertBefore(dashboard, contentForm);
    }

    const services = $$('[data-content-panel="services"] .admin-content-card', contentForm).length;
    const promotions = $$('[data-content-promotions] .admin-promotion-card, [data-content-promotions] article', contentForm).length;
    const mediaCount = $$('[data-content-panel="registry"] tbody tr', contentForm).length;
    const visual = visualMount();
    const visualImage = findImage('#customerVisualSettingsMount [data-visual-preview="default.backgroundUrl"]');
    const loginReady = Boolean(getPanel(contentForm, 'login-media'));
    const featuredReady = Boolean(getPanel(contentForm, 'featured-stores'));
    const signature = [services, promotions, mediaCount, Boolean(visual), loginReady, featuredReady, visualImage].join('|');

    if (dashboard.dataset.mediaHubSignature !== signature) {
      dashboard.innerHTML = `<div class="admin-media-hub__head"><div><span class="admin-kicker">MEDIA CONTROL CENTER</span><h2>เลือกหมวดหมู่ที่ต้องการตั้งค่า</h2><p class="mpa-muted">แตะการ์ดเพื่อเข้าเมนูรองและแก้ไขรายละเอียดเฉพาะส่วนนั้น ไม่ต้องเลื่อนผ่านรายการทั้งหมด</p></div><span class="admin-inline-count">${services} การ์ดบริการ · ${promotions} แบนเนอร์</span></div><div class="admin-media-category-grid">${card({ key: 'hero', title: 'หน้าแรกและ Hero', description: 'ข้อความหลัก ปุ่ม และภาพนำ', meta: 'ตั้งค่าหน้าแรก', symbol: '⌂', image: findImage('[data-media-preview="hero.backgroundUrl"]') || findImage('[data-media-preview="hero.artUrl"]') })}${card({ key: 'services', title: 'การ์ดบริการ', description: 'เพิ่ม/แก้ไขการ์ด ไอคอน ภาพ และลิงก์', meta: `${services} รายการบริการ`, symbol: '✦', image: findImage('[data-media-preview^="card.food."]') || findImage('[data-media-preview^="card.supermarket."]') })}${card({ key: 'navigation', title: 'ส่วนบนและตะกร้า', description: 'ข้อความนำทางและตะกร้าลอย', meta: 'Header · Navigation · Cart', symbol: '≡', image: '' })}${card({ key: 'promotions', title: 'แบนเนอร์โฆษณา', description: 'ภาพ ข้อความ ลิงก์ และสถานะแบนเนอร์', meta: `${promotions} รายการโฆษณา`, symbol: '▣', image: findImage('[data-content-promotions]') })}${card({ key: 'visuals', title: 'พื้นหลังและ Motion', description: 'พื้นหลังทุกหน้า เอฟเฟกต์ และทิศทางการเคลื่อนไหว', meta: visual ? 'ค่าเริ่มต้น · เทศกาล · 21 หน้า' : 'กำลังเตรียมเมนู', symbol: '◌', image: visualImage })}${card({ key: 'login-media', title: 'สื่อหน้าลงชื่อเข้าใช้', description: 'ภาพพื้นหลัง Login ของทุกบทบาท', meta: loginReady ? 'พร้อมตั้งค่า' : 'กำลังเตรียมเมนู', symbol: '□', image: '' })}${card({ key: 'featured-stores', title: 'ร้านค้าเด่น', description: 'ภาพและช่วงโปรโมตร้านค้าบน Customer', meta: featuredReady ? 'พร้อมตั้งค่า' : 'กำลังเตรียมเมนู', symbol: '◇', image: '' })}${card({ key: 'registry', title: 'คลังสื่อและประวัติ', description: 'ตรวจสอบไฟล์ที่ลงทะเบียนในระบบ', meta: `${Math.max(0, mediaCount)} รายการล่าสุด`, symbol: '▤', image: '' })}</div>`;
      dashboard.dataset.mediaHubSignature = signature;
    }

    if (state.route === 'dashboard') setHidden(dashboard, false);
    return dashboard;
  }

  function getRouteStatus(contentForm) {
    let status = $('[data-media-route-status]', contentForm);
    if (!status) {
      status = document.createElement('div');
      status.className = 'admin-media-route-status';
      status.dataset.mediaRouteStatus = 'true';
      getMainDetailBar(contentForm).after(status);
    }
    return status;
  }

  function clearRouteStatus(contentForm) {
    $('[data-media-route-status]', contentForm)?.remove();
  }

  function showRouteStatus(contentForm, title, message, retryKey = '') {
    const status = getRouteStatus(contentForm);
    status.innerHTML = `<strong>${esc(title)}</strong><span>${esc(message)}</span>${retryKey ? `<button type="button" class="mpa-button mpa-button-secondary" data-media-retry="${esc(retryKey)}">ลองโหลดอีกครั้ง</button>` : ''}`;
    setHidden(status, false);
  }

  function waitForPanel(contentForm, key, timeout = 7000) {
    const immediate = getPanel(contentForm, key);
    if (immediate) return Promise.resolve(immediate);

    return new Promise(resolve => {
      const started = Date.now();
      let settled = false;
      const observer = new MutationObserver(check);
      const timer = window.setInterval(check, 80);

      function finish(panel) {
        if (settled) return;
        settled = true;
        observer.disconnect();
        window.clearInterval(timer);
        resolve(panel || null);
      }

      function check() {
        const panel = getPanel(contentForm, key);
        if (panel || Date.now() - started >= timeout) finish(panel);
      }

      observer.observe(contentForm, { childList: true, subtree: true });
      check();
    });
  }

  async function openMainEntry(key) {
    const contentForm = form();
    const dashboard = $('#adminMediaDashboard');
    if (!contentForm || !dashboard) return;
    if (key === 'visuals') return openVisualSystem();

    state.route = key;
    state.visualRoute = 'index';
    setHidden(dashboard, true);
    setHidden(visualMount(), true);
    setHidden(contentForm, false);
    hideNativeTabs(contentForm);
    $$('.admin-content-panel', contentForm).forEach(panel => setHidden(panel, true));
    const titles = { hero: 'หน้าแรกและ Hero', services: 'การ์ดบริการ', navigation: 'ส่วนบนและตะกร้า', promotions: 'แบนเนอร์โฆษณา', 'login-media': 'สื่อหน้าลงชื่อเข้าใช้', 'featured-stores': 'ร้านค้าเด่น', registry: 'คลังสื่อและประวัติ' };
    const bar = setMainDetailTitle(contentForm, titles[key] || 'รายละเอียดการตั้งค่า');
    setHidden(bar, false);
    clearRouteStatus(contentForm);

    const panel = await waitForPanel(contentForm, key);
    if (state.route !== key) return;
    if (!panel) {
      showRouteStatus(contentForm, 'กำลังเตรียมเมนูไม่สำเร็จ', 'ระบบยังไม่ได้ mount รายละเอียดของหมวดนี้ จึงไม่ซ่อนหน้าไว้เฉย ๆ คุณสามารถลองโหลดหมวดนี้อีกครั้งได้', key);
      return;
    }

    clearRouteStatus(contentForm);
    syncNativeTab(contentForm, key);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showDashboard() {
    const contentForm = form();
    const dashboard = $('#adminMediaDashboard');
    if (!contentForm || !dashboard) return;
    state.route = 'dashboard';
    state.visualRoute = 'index';
    clearRouteStatus(contentForm);
    setHidden(contentForm, true);
    $$('.admin-content-panel', contentForm).forEach(panel => setHidden(panel, true));
    setHidden($('[data-media-backbar]', contentForm), true);
    setHidden(visualMount(), true);
    setHidden(dashboard, false);
    dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function getVisualDetailBar(mount, title) {
    let bar = $('[data-visual-detailbar]', mount);
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'admin-media-detail-bar';
      bar.dataset.visualDetailbar = 'true';
      bar.innerHTML = '<button type="button" class="mpa-button mpa-button-secondary" data-visual-detail-back>‹ กลับไปเมนูพื้นหลัง</button><span data-visual-detail-title></span>';
      $('.customer-visual-settings', mount)?.before(bar);
    }
    $('[data-visual-detail-title]', bar)?.replaceChildren(document.createTextNode(title || 'รายละเอียดพื้นหลังและ Motion'));
    return bar;
  }

  function buildVisualIndex(mount) {
    const visualSettings = $('.customer-visual-settings', mount);
    if (!visualSettings) return null;
    let index = $('[data-visual-index]', mount);
    if (!index) {
      index = document.createElement('section');
      index.className = 'admin-media-subhub';
      index.dataset.visualIndex = 'true';
      visualSettings.before(index);
    }

    const pages = $$('[data-visual-form="page"]', visualSettings);
    const signature = pages.map(page => page.dataset.visualKey || '').join('|');
    if (index.dataset.mediaHubSignature !== signature) {
      const defaultImage = findImage('[data-visual-preview="default.backgroundUrl"]');
      const festivalImage = findImage('[data-visual-preview="festival.effectUrl"]');
      index.innerHTML = `<div class="admin-media-subhub__head"><div><span class="admin-kicker">CUSTOMER VISUAL SYSTEM</span><h2>พื้นหลังและ Motion</h2><p class="mpa-muted">เลือกชุดการตั้งค่าก่อน แล้วค่อยเข้าไปแก้ไขเฉพาะรายการที่ต้องการ</p></div><button type="button" class="mpa-button mpa-button-secondary" data-visual-back>‹ กลับไปหน้ารวม Media</button></div><div class="admin-media-category-grid admin-media-category-grid--sub">${card({ key: 'visual-default', title: 'ค่าเริ่มต้นทุกหน้า', description: 'พื้นหลังสำรองและ Motion หลัก', meta: 'แก้ไข 1 ชุด', symbol: '◐', image: defaultImage })}${card({ key: 'visual-festival', title: 'เทศกาลและฤดูกาล', description: 'Motion เทศกาล ทิศทาง และช่วงเวลา', meta: 'แก้ไข 1 ชุด', symbol: '✧', image: festivalImage })}${card({ key: 'visual-pages', title: 'พื้นหลังแยกตามหน้า', description: 'เลือกหน้า Customer ที่ต้องการตั้งค่า', meta: `${pages.length} หน้า`, symbol: '▦', image: '' })}</div>`;
      index.dataset.mediaHubSignature = signature;
    }
    return { visualSettings, index, pages };
  }

  function ensurePageMenu(mount, pages) {
    let pageMenu = $('[data-visual-page-menu]', mount);
    if (!pageMenu) {
      pageMenu = document.createElement('section');
      pageMenu.className = 'admin-media-page-menu';
      pageMenu.dataset.visualPageMenu = 'true';
      $('.customer-visual-settings', mount)?.before(pageMenu);
    }
    const signature = pages.map(page => page.dataset.visualKey || '').join('|');
    if (pageMenu.dataset.mediaHubSignature !== signature) {
      pageMenu.innerHTML = `<div class="admin-media-subhub__head"><div><h3>เลือกหน้าที่ต้องการแก้ไข</h3><p class="mpa-muted">แตะชื่อหน้าเพื่อเปิดฟอร์มเฉพาะหน้านั้น</p></div><button type="button" class="mpa-button mpa-button-secondary" data-visual-index>‹ กลับไปหมวดพื้นหลัง</button></div><div class="admin-media-page-grid">${pages.map(page => { const key = page.dataset.visualKey || ''; const title = $('h3', page)?.textContent || key; const image = $('.admin-content-media-preview img', page)?.getAttribute('src') || ''; return `<button type="button" class="admin-media-page-card" data-visual-page="${esc(key)}"><span class="admin-media-page-card__preview">${imageOrSymbol(image, '◌')}</span><span><strong>${esc(title)}</strong><small>พื้นหลังและ Motion เฉพาะหน้า</small></span><span aria-hidden="true">›</span></button>`; }).join('')}</div>`;
      pageMenu.dataset.mediaHubSignature = signature;
    }
    return pageMenu;
  }

  function openVisualSystem() {
    const contentForm = form();
    const dashboard = $('#adminMediaDashboard');
    const mount = visualMount();
    if (!contentForm || !dashboard || !mount) return;
    state.route = 'visuals';
    setHidden(dashboard, true);
    setHidden(contentForm, true);
    setHidden(mount, false);
    ensureVisualNavigation();
    const built = buildVisualIndex(mount);
    if (!built) {
      showVisualStatus(mount, 'กำลังเตรียมระบบพื้นหลังและ Motion', 'รอข้อมูลการตั้งค่าจากระบบสักครู่แล้วลองแตะหมวดนี้อีกครั้ง');
      return;
    }
    showVisualIndex(mount);
  }

  function showVisualStatus(mount, title, message) {
    let status = $('[data-visual-route-status]', mount);
    if (!status) {
      status = document.createElement('div');
      status.className = 'admin-media-route-status';
      status.dataset.visualRouteStatus = 'true';
      mount.prepend(status);
    }
    status.innerHTML = `<strong>${esc(title)}</strong><span>${esc(message)}</span>`;
    setHidden(status, false);
  }

  function clearVisualStatus(mount) {
    $('[data-visual-route-status]', mount)?.remove();
  }

  function showVisualIndex(mount) {
    const built = buildVisualIndex(mount);
    if (!built) return;
    const { visualSettings, index } = built;
    state.route = 'visuals';
    state.visualRoute = 'index';
    clearVisualStatus(mount);
    setHidden(index, false);
    setHidden(visualSettings, true);
    setHidden($('[data-visual-page-menu]', mount), true);
    setHidden($('[data-visual-detailbar]', mount), true);
    mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openVisualEntry(key) {
    const mount = visualMount();
    if (!mount) return;
    const built = buildVisualIndex(mount);
    if (!built) return;
    const { visualSettings, index, pages } = built;
    const detail = getVisualDetailBar(mount, key === 'visual-default' ? 'ค่าเริ่มต้นทุกหน้า' : key === 'visual-festival' ? 'เทศกาลและฤดูกาล' : 'เลือกหน้าที่ต้องการตั้งค่า');
    state.route = 'visuals';
    setHidden(index, true);
    clearVisualStatus(mount);

    if (key === 'visual-pages') {
      state.visualRoute = 'pages';
      const pageMenu = ensurePageMenu(mount, pages);
      setHidden(visualSettings, false);
      setHidden(detail, true);
      setHidden(pageMenu, false);
      $$('[data-visual-form="default"], [data-visual-form="festival"]', visualSettings).forEach(item => setHidden(item, true));
      const pageSection = $('.customer-visual-page-list', visualSettings)?.closest('section');
      setHidden(pageSection, true);
      pages.forEach(page => setHidden(page, true));
      mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    state.visualRoute = key === 'visual-default' ? 'default' : 'festival';
    setHidden(visualSettings, false);
    setHidden($('[data-visual-page-menu]', mount), true);
    setHidden(detail, false);
    $$('[data-visual-form]', visualSettings).forEach(item => setHidden(item, item.dataset.visualForm !== key.replace('visual-', '')));
    const pageSection = $('.customer-visual-page-list', visualSettings)?.closest('section');
    setHidden(pageSection, true);
    pages.forEach(page => setHidden(page, true));
    mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openVisualPage(mount, pageKey) {
    const built = buildVisualIndex(mount);
    if (!built) return;
    const { visualSettings, index, pages } = built;
    const target = pages.find(page => page.dataset.visualKey === pageKey);
    if (!target) return;
    const pageMenu = ensurePageMenu(mount, pages);
    const pageSection = $('.customer-visual-page-list', visualSettings)?.closest('section');
    state.route = 'visuals';
    state.visualRoute = 'page';
    setHidden(index, true);
    setHidden(pageMenu, true);
    setHidden(visualSettings, false);
    setHidden(pageSection, false);
    $$('[data-visual-form]', visualSettings).forEach(item => setHidden(item, item !== target));
    const detail = getVisualDetailBar(mount, $('h3', target)?.textContent || 'พื้นหลังและ Motion เฉพาะหน้า');
    setHidden(detail, false);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function ensureVisualNavigation() {
    const mount = visualMount();
    if (!mount || !$('.customer-visual-settings', mount)) return;
    buildVisualIndex(mount);
    if (state.route !== 'visuals') setHidden(mount, true);
    if (mount.dataset.mediaHubNavigationBound === 'true') return;
    mount.dataset.mediaHubNavigationBound = 'true';
    mount.addEventListener('click', event => {
      const visualEntry = event.target.closest('[data-media-entry]');
      if (visualEntry?.dataset.mediaEntry?.startsWith('visual-')) {
        openVisualEntry(visualEntry.dataset.mediaEntry);
        return;
      }
      if (event.target.closest('[data-visual-back]')) {
        showDashboard();
        return;
      }
      if (event.target.closest('[data-visual-index]')) {
        showVisualIndex(mount);
        return;
      }
      if (event.target.closest('[data-visual-detail-back]')) {
        if (state.visualRoute === 'page') openVisualEntry('visual-pages');
        else showVisualIndex(mount);
        return;
      }
      const page = event.target.closest('[data-visual-page]');
      if (page) openVisualPage(mount, page.dataset.visualPage || '');
    });
  }

  function bind() {
    const contentForm = form();
    if (!contentForm) return;
    const dashboard = renderDashboard(contentForm);
    if (contentForm.dataset.mediaHubBound !== 'true') {
      contentForm.dataset.mediaHubBound = 'true';
      setHidden(contentForm, true);
      $$('.admin-content-panel', contentForm).forEach(panel => setHidden(panel, true));
      hideNativeTabs(contentForm);
      setHidden(getMainDetailBar(contentForm), true);
      contentForm.addEventListener('click', event => {
        if (event.target.closest('[data-media-back]')) {
          showDashboard();
          return;
        }
        const retry = event.target.closest('[data-media-retry]');
        if (retry) openMainEntry(retry.dataset.mediaRetry);
      });
    }
    if (dashboard.dataset.mediaHubBound !== 'true') {
      dashboard.dataset.mediaHubBound = 'true';
      dashboard.addEventListener('click', event => {
        const entry = event.target.closest('[data-media-entry]');
        if (entry && !entry.disabled) openMainEntry(entry.dataset.mediaEntry);
      });
    }
    ensureVisualNavigation();
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      bind();
      ensureVisualNavigation();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  bind();
})();
