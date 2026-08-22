(() => {
  'use strict';
  const STORAGE = {
    density: 'apservice-admin-density-v1',
    accent: 'apservice-admin-accent-v1',
    bannerText: 'apservice-admin-banner-text-v1',
    recentSearches: 'apservice-admin-recent-searches-v1',
  };
  const palettes = [
    { name: 'Rose', value: '#c83f5b', deep: '#812238', soft: '#fff0f3' },
    { name: 'Teal', value: '#1f877d', deep: '#14534e', soft: '#e9f7f5' },
    { name: 'Indigo', value: '#5f5ac7', deep: '#35306e', soft: '#f1f0ff' },
    { name: 'Amber', value: '#c37a22', deep: '#704513', soft: '#fff6e6' },
    { name: 'Plum', value: '#9a4d8b', deep: '#5a2852', soft: '#fff0fb' },
  ];
  const bannerPalettes = [
    { name: 'ขาว', value: '#ffffff' },
    { name: 'กรมท่า', value: '#17313b' },
    { name: 'ทองอุ่น', value: '#ffd166' },
    { name: 'เขียวมิ้นต์', value: '#bff7ef' },
    { name: 'ชมพูอ่อน', value: '#ffd6df' },
  ];
  const quickActions = [
    { label: 'ไปคิวออร์เดอร์', hint: 'ตรวจงานใหม่และงานกำลังดำเนินการ', href: 'orders.html', symbol: '↗' },
    { label: 'จัดการร้านค้า', hint: 'ค้นหา แก้ไข และดูสถานะร้าน', href: 'stores.html', symbol: '▦' },
    { label: 'ตรวจการเงิน', hint: 'คำขอถอนเงินและรายการที่ต้องอนุมัติ', href: 'finance.html', symbol: '฿' },
    { label: 'จัดการสื่อ', hint: 'รูปภาพ โฆษณา และ media registry', href: 'media.html', symbol: '▧' },
    { label: 'เปิดแจ้งเตือน', hint: 'ติดตาม follow-up และการแจ้งเตือน', href: 'notifications.html', symbol: '!' },
  ];
  const routeLabel = href => {
    const key = String(href || '').split('/').pop()?.split('?')[0] || '';
    return ({
      'dashboard.html': 'ภาพรวม', 'orders.html': 'ออร์เดอร์', 'stores.html': 'ร้านค้า',
      'riders.html': 'ไรเดอร์', 'customers.html': 'ลูกค้า', 'finance.html': 'การเงิน',
      'audit-log.html': 'Audit Log', 'notifications.html': 'แจ้งเตือน', 'promotions.html': 'โฆษณา',
      'media.html': 'คลังสื่อ', 'admin-retail.html': 'จัดการ Retail', 'ai-workspace.html': 'AI Workspace',
      'settings.html': 'ตั้งค่ากลาง', 'accounts.html': 'บัญชีทุกบทบาท', 'operations.html': 'ฟังก์ชันเพิ่มเติม',
    }[key] || key);
  };
  const safeText = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const readStorage = (key, fallback = '') => { try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; } };
  const writeStorage = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const readRecentSearches = () => { try { const value = JSON.parse(readStorage(STORAGE.recentSearches, '[]')); return Array.isArray(value) ? value.filter(Boolean).slice(0, 5) : []; } catch (_) { return []; } };
  const recordRecentSearch = value => { const query = String(value || '').trim(); if (!query) return; writeStorage(STORAGE.recentSearches, JSON.stringify([query, ...readRecentSearches().filter(item => item !== query)].slice(0, 5))); };
  const applyDensity = value => {
    const next = value === 'compact' ? 'compact' : 'comfortable';
    document.body.classList.toggle('admin-density-compact', next === 'compact');
    writeStorage(STORAGE.density, next);
    document.querySelectorAll('[data-admin-density]').forEach(button => button.classList.toggle('is-active', button.dataset.adminDensity === next));
  };
  const applyAccent = value => {
    const clean = String(value || '').trim().match(/^#[0-9a-f]{6}$/i)?.[0];
    if (!clean) return;
    const preset = palettes.find(item => item.value.toLowerCase() === clean.toLowerCase());
    const hex = clean.toLowerCase();
    document.documentElement.style.setProperty('--admin-accent', hex);
    document.documentElement.style.setProperty('--admin-accent-deep', preset?.deep || hex);
    document.documentElement.style.setProperty('--admin-accent-soft', preset?.soft || '#fff0f3');
    writeStorage(STORAGE.accent, JSON.stringify({ value: hex, deep: preset?.deep || hex, soft: preset?.soft || '#fff0f3' }));
    document.querySelectorAll('[data-admin-color-value]').forEach(input => { input.value = hex; });
    document.querySelectorAll('[data-admin-color-picker]').forEach(input => { input.value = hex; });
    document.querySelectorAll('[data-admin-color-swatch]').forEach(button => button.classList.toggle('is-active', button.dataset.adminColorSwatch.toLowerCase() === hex));
  };
  const restoreAccent = () => {
    const raw = readStorage(STORAGE.accent);
    try { const saved = JSON.parse(raw); if (saved?.value) { applyAccent(saved.value); return; } } catch (_) {}
    applyAccent('#c83f5b');
  };
  const luminance = hex => {
    const values = hex.slice(1).match(/.{2}/g)?.map(value => parseInt(value, 16) / 255) || [1, 1, 1];
    const linear = values.map(value => value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
  };
  const applyBannerText = value => {
    const clean = String(value || '').trim().match(/^#[0-9a-f]{6}$/i)?.[0]?.toLowerCase();
    if (!clean) return;
    const light = luminance(clean) > .58;
    const muted = light ? 'rgba(255,255,255,.78)' : 'rgba(23,49,59,.72)';
    document.documentElement.style.setProperty('--admin-banner-text', clean);
    document.documentElement.style.setProperty('--admin-banner-muted', muted);
    writeStorage(STORAGE.bannerText, JSON.stringify({ value: clean, muted }));
    document.querySelectorAll('[data-admin-banner-value]').forEach(input => { input.value = clean; });
    document.querySelectorAll('[data-admin-banner-picker]').forEach(input => { input.value = clean; });
    document.querySelectorAll('[data-admin-banner-swatch]').forEach(button => button.classList.toggle('is-active', button.dataset.adminBannerSwatch.toLowerCase() === clean));
  };
  const restoreBannerText = () => {
    const raw = readStorage(STORAGE.bannerText);
    try { const saved = JSON.parse(raw); if (saved?.value) { applyBannerText(saved.value); return; } } catch (_) {}
    applyBannerText('#ffffff');
  };
  const getLinks = () => [...document.querySelectorAll('.admin-nav-link, .admin-nav-popover-link, .admin-nav-legacy')]
    .map(link => ({ href: link.getAttribute('href'), label: link.querySelector('span')?.textContent?.trim() || link.textContent.trim(), node: link }))
    .filter(item => item.href && item.label);

  const createColorPanel = () => {
    if (document.querySelector('.admin-color-panel')) return document.querySelector('.admin-color-panel');
    const panel = document.createElement('section');
    panel.className = 'admin-color-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'ปรับสีการแสดงผล Admin');
    panel.innerHTML = `<div class="admin-color-control"><div><strong>ปรับสีการแสดงผล</strong><p class="mpa-muted">แยกสีข้อความบน Banner ออกจากสีปุ่มและสถานะอย่างชัดเจน</p></div><div class="admin-color-scope" role="tablist" aria-label="ประเภทสี"><button type="button" class="admin-color-scope-button is-active" data-color-scope="banner" role="tab">ข้อความบน Banner</button><button type="button" class="admin-color-scope-button" data-color-scope="accent" role="tab">ปุ่มและสถานะ</button></div><div class="admin-color-section is-active" data-color-section="banner"><strong>สีข้อความบน Banner</strong><p class="mpa-muted">ใช้กับหัวข้อ/คำอธิบายบน hero ของทุกหน้า ไม่เปลี่ยนสีปุ่ม</p><div class="admin-color-options">${bannerPalettes.map(item => `<button type="button" class="admin-color-swatch admin-banner-swatch" style="--swatch:${item.value}" data-admin-banner-swatch="${item.value}" aria-label="สีข้อความ ${item.name}" title="${item.name}"></button>`).join('')}</div><div class="admin-color-custom"><input type="color" data-admin-banner-picker value="#ffffff" aria-label="เลือกสีข้อความบน Banner"><input type="text" data-admin-banner-value value="#ffffff" maxlength="7" aria-label="รหัสสีข้อความบน Banner" spellcheck="false"><button type="button" class="mpa-button mpa-button-secondary" data-admin-banner-reset>คืนค่าสีข้อความ</button></div><div class="admin-banner-color-preview" data-admin-banner-preview><strong>หัวข้อ Banner ตัวอย่าง</strong><span>คำอธิบายจะใช้สีรองที่อ่านง่ายโดยอัตโนมัติ</span></div></div><div class="admin-color-section" data-color-section="accent" hidden><strong>สีปุ่มและสถานะ</strong><p class="mpa-muted">ใช้กับ action, badge และ state ของศูนย์ควบคุม</p><div class="admin-color-options">${palettes.map(item => `<button type="button" class="admin-color-swatch" style="--swatch:${item.value}" data-admin-color-swatch="${item.value}" aria-label="สี ${item.name}" title="${item.name}"></button>`).join('')}</div><div class="admin-color-custom"><input type="color" data-admin-color-picker value="#c83f5b" aria-label="เลือกสีปุ่มและสถานะ"><input type="text" data-admin-color-value value="#c83f5b" maxlength="7" aria-label="รหัสสีปุ่มและสถานะ" spellcheck="false"><button type="button" class="mpa-button mpa-button-secondary" data-admin-color-reset>คืนค่าสีปุ่ม</button></div><div class="admin-color-preview" data-admin-color-preview>ตัวอย่างสีปุ่มและสถานะ</div></div></div>`;
    document.body.append(panel);
    return panel;
  };
  const setColorScope = scope => {
    const panel = createColorPanel();
    panel.querySelectorAll('[data-color-scope]').forEach(button => { const active = button.dataset.colorScope === scope; button.classList.toggle('is-active', active); button.setAttribute('aria-selected', String(active)); });
    panel.querySelectorAll('[data-color-section]').forEach(section => { const active = section.dataset.colorSection === scope; section.hidden = !active; section.classList.toggle('is-active', active); });
  };
  const toggleColorPanel = force => {
    const panel = createColorPanel();
    const next = typeof force === 'boolean' ? force : !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', next);
    if (next) { setColorScope('banner'); panel.querySelector('[data-admin-banner-value]')?.focus(); }
  };

  const createQuickActions = () => {
    if (document.querySelector('.admin-quick-backdrop')) return document.querySelector('.admin-quick-backdrop');
    const backdrop = document.createElement('div');
    backdrop.className = 'admin-quick-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = `<section class="admin-quick-dialog" role="dialog" aria-modal="true" aria-label="ทางลัดงาน Admin"><div class="admin-quick-head"><div><strong>ทางลัดงาน Admin</strong><p class="mpa-muted">เลือกงานที่ต้องทำบ่อยโดยไม่ต้องเปิดเมนูหลายชั้น</p></div><button type="button" class="mpa-button mpa-button-secondary" data-quick-close>ปิด</button></div><div class="admin-quick-grid">${quickActions.map(item => `<a class="admin-quick-card" href="${item.href}"><span class="admin-quick-symbol" aria-hidden="true">${item.symbol}</span><span><strong>${item.label}</strong><small>${item.hint}</small></span><span aria-hidden="true">›</span></a>`).join('')}</div></section>`;
    document.body.append(backdrop);
    const close = () => { backdrop.classList.remove('is-open'); setTimeout(() => { backdrop.hidden = true; }, 160); };
    backdrop.querySelector('[data-quick-close]').onclick = close;
    backdrop.addEventListener('click', event => { if (event.target === backdrop) close(); });
    backdrop.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    backdrop.__adminOpen = () => { backdrop.hidden = false; requestAnimationFrame(() => backdrop.classList.add('is-open')); backdrop.querySelector('a')?.focus(); };
    backdrop.__adminClose = close;
    return backdrop;
  };

  const createCommandPalette = () => {
    if (document.querySelector('.admin-command-backdrop')) return document.querySelector('.admin-command-backdrop');
    const backdrop = document.createElement('div');
    backdrop.className = 'admin-command-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = `<section class="admin-command-dialog" role="dialog" aria-modal="true" aria-label="ค้นหาเมนู Admin"><div class="admin-command-head"><span aria-hidden="true">⌕</span><input type="search" placeholder="ค้นหาเมนูหรือหน้าจัดการ…" autocomplete="off"><button type="button" class="mpa-button mpa-button-secondary" data-command-close>ปิด</button></div><div class="admin-command-recent" data-command-recent></div><div class="admin-command-list" role="listbox"></div></section>`;
    document.body.append(backdrop);
    const input = backdrop.querySelector('input');
    const list = backdrop.querySelector('.admin-command-list');
    const recentHost = backdrop.querySelector('[data-command-recent]');
    let activeIndex = 0;
    const render = () => {
      const query = input.value.trim().toLowerCase();
      const entries = getLinks().filter(item => !query || `${item.label} ${item.href}`.toLowerCase().includes(query));
      activeIndex = Math.min(activeIndex, Math.max(entries.length - 1, 0));
      recentHost.innerHTML = !query && readRecentSearches().length ? `<div class="admin-command-recent-label">ค้นหาล่าสุด</div>${readRecentSearches().map(value => `<button type="button" class="admin-recent-chip" data-recent-query="${safeText(value)}">${safeText(value)}</button>`).join('')}` : '';
      list.innerHTML = entries.length ? entries.map((item, index) => `<button type="button" class="admin-command-item${index === activeIndex ? ' is-active' : ''}" data-command-href="${item.href}"><span>${item.label}</span><small>${item.href.split('?')[0]}</small></button>`).join('') : '<div class="admin-command-empty">ไม่พบเมนูที่ตรงกับคำค้น</div>';
    };
    const open = () => { backdrop.hidden = false; requestAnimationFrame(() => backdrop.classList.add('is-open')); input.value = ''; activeIndex = 0; render(); input.focus(); };
    const close = () => { backdrop.classList.remove('is-open'); setTimeout(() => { backdrop.hidden = true; }, 160); };
    const go = href => { recordRecentSearch(input.value); location.href = href; };
    backdrop.__adminOpen = open;
    backdrop.__adminClose = close;
    backdrop.querySelector('[data-command-close]').onclick = close;
    backdrop.addEventListener('click', event => { if (event.target === backdrop) close(); const recent = event.target.closest('[data-recent-query]'); if (recent) { input.value = recent.dataset.recentQuery; render(); input.focus(); } });
    input.addEventListener('input', () => { activeIndex = 0; render(); });
    input.addEventListener('keydown', event => {
      const items = [...list.querySelectorAll('[data-command-href]')];
      if (event.key === 'ArrowDown') { event.preventDefault(); activeIndex = Math.min(activeIndex + 1, items.length - 1); render(); }
      if (event.key === 'ArrowUp') { event.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); render(); }
      if (event.key === 'Enter' && items[activeIndex]) { event.preventDefault(); go(items[activeIndex].dataset.commandHref); }
      if (event.key === 'Escape') { event.preventDefault(); close(); }
    });
    list.addEventListener('click', event => { const target = event.target.closest('[data-command-href]'); if (target) go(target.dataset.commandHref); });
    return backdrop;
  };
  const ensureHeaderTools = () => {
    const header = document.querySelector('.admin-topbar-inner');
    if (!header) return;
    if (!header.querySelector('.admin-command-trigger')) {
      const command = document.createElement('button');
      command.type = 'button'; command.className = 'admin-command-trigger'; command.setAttribute('aria-label', 'ค้นหาเมนู Admin'); command.setAttribute('aria-keyshortcuts', 'Control+K');
      command.innerHTML = '<span aria-hidden="true">⌕</span><span>ค้นหาเมนู</span><kbd>Ctrl K</kbd>';
      command.onclick = () => createCommandPalette().__adminOpen?.();
      header.append(command);
    }
    if (!header.querySelector('.admin-quick-trigger')) {
      const quick = document.createElement('button');
      quick.type = 'button'; quick.className = 'admin-command-trigger admin-quick-trigger'; quick.setAttribute('aria-label', 'เปิดทางลัดงาน Admin');
      quick.innerHTML = '<span aria-hidden="true">＋</span><span>ทางลัด</span>';
      quick.onclick = () => createQuickActions().__adminOpen?.();
      header.append(quick);
    }
    if (!header.querySelector('.admin-color-trigger')) {
      const color = document.createElement('button');
      color.type = 'button'; color.className = 'admin-command-trigger admin-color-trigger'; color.setAttribute('aria-label', 'ปรับสีข้อความแบนเนอร์'); color.innerHTML = '<span aria-hidden="true" class="admin-color-dot"></span><span>สีข้อความ</span>';
      color.onclick = () => toggleColorPanel();
      header.append(color);
    }
  };
  const ensureMobileNav = () => {
    if (document.querySelector('.admin-mobile-nav') || !document.querySelector('.admin-topbar')) return;
    const nav = document.createElement('nav');
    nav.className = 'admin-mobile-nav';
    nav.setAttribute('aria-label', 'เมนูหลักบนมือถือ');
    nav.innerHTML = `<a href="dashboard.html" data-mobile-route="dashboard.html"><span aria-hidden="true">⌂</span><small>ภาพรวม</small></a><a href="orders.html" data-mobile-route="orders.html"><span aria-hidden="true">≡</span><small>คิวงาน</small></a><button type="button" data-mobile-quick><span aria-hidden="true">＋</span><small>เพิ่ม</small></button><a href="notifications.html" data-mobile-route="notifications.html"><span aria-hidden="true">!</span><small>แจ้งเตือน</small></a><a href="profile.html" data-mobile-route="profile.html"><span aria-hidden="true">○</span><small>โปรไฟล์</small></a>`;
    document.body.append(nav);
    const current = location.pathname.split('/').pop() || 'dashboard.html';
    nav.querySelectorAll('[data-mobile-route]').forEach(link => link.classList.toggle('is-active', link.dataset.mobileRoute === current));
    nav.querySelector('[data-mobile-quick]').onclick = () => createQuickActions().__adminOpen?.();
  };
  const ensureTableToolbar = wrapper => {
    if (wrapper.dataset.adminToolbarReady === 'true') return;
    const table = wrapper.querySelector('table');
    const rows = table?.querySelectorAll('tbody tr');
    if (!table || !rows?.length || wrapper.closest('.admin-command-dialog')) return;
    wrapper.dataset.adminToolbarReady = 'true';
    const toolbar = document.createElement('div');
    toolbar.className = 'admin-table-toolbar';
    toolbar.innerHTML = `<input class="admin-table-search" type="search" placeholder="ค้นหาในตาราง…" aria-label="ค้นหาในตาราง"><div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap"><span class="admin-last-refreshed" data-admin-row-count>${rows.length} รายการ</span><div class="admin-density-toggle" role="group" aria-label="ความหนาแน่นของตาราง"><button type="button" data-admin-density="comfortable">สบายตา</button><button type="button" data-admin-density="compact">กระชับ</button></div></div>`;
    wrapper.parentNode.insertBefore(toolbar, wrapper);
    const search = toolbar.querySelector('.admin-table-search');
    const count = toolbar.querySelector('[data-admin-row-count]');
    search.addEventListener('input', () => { const query = search.value.trim().toLowerCase(); let visible = 0; table.querySelectorAll('tbody tr').forEach(row => { const match = !query || row.textContent.toLowerCase().includes(query); row.hidden = !match; if (match) visible += 1; }); count.textContent = `${visible} รายการ${query ? 'ที่ตรงกับคำค้น' : ''}`; recordRecentSearch(query); });
    toolbar.querySelectorAll('[data-admin-density]').forEach(button => button.addEventListener('click', () => applyDensity(button.dataset.adminDensity)));
    applyDensity(readStorage(STORAGE.density, 'comfortable'));
  };
  const closeOverlays = () => { toggleColorPanel(false); document.querySelector('.admin-command-backdrop')?.__adminClose?.(); document.querySelector('.admin-quick-backdrop')?.__adminClose?.(); };
  const enhance = () => {
    restoreAccent();
    restoreBannerText();
    ensureHeaderTools();
    if (document.querySelector('.admin-topbar')) { createCommandPalette(); ensureMobileNav(); }
    document.querySelectorAll('.mpa-table-wrap').forEach(ensureTableToolbar);
    document.body.classList.add('admin-ui-ready');
  };
  const handleGlobal = event => {
    if (event.key === 'Escape') closeOverlays();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); createCommandPalette().__adminOpen?.(); }
    if (event.target.matches?.('[data-admin-color-picker]')) applyAccent(event.target.value);
    if (event.target.matches?.('[data-admin-color-value]') && event.type === 'change') applyAccent(event.target.value);
    if (event.target.matches?.('[data-admin-banner-picker]')) applyBannerText(event.target.value);
    if (event.target.matches?.('[data-admin-banner-value]') && event.type === 'change') applyBannerText(event.target.value);
  };
  document.addEventListener('keydown', handleGlobal);
  document.addEventListener('input', handleGlobal);
  document.addEventListener('change', handleGlobal);
  document.addEventListener('click', event => {
    const scope = event.target.closest?.('[data-color-scope]');
    if (scope) { setColorScope(scope.dataset.colorScope); return; }
    const accentSwatch = event.target.closest?.('[data-admin-color-swatch]');
    if (accentSwatch) { applyAccent(accentSwatch.dataset.adminColorSwatch); return; }
    const bannerSwatch = event.target.closest?.('[data-admin-banner-swatch]');
    if (bannerSwatch) { applyBannerText(bannerSwatch.dataset.adminBannerSwatch); return; }
    if (event.target.closest?.('[data-admin-color-reset]')) { applyAccent('#c83f5b'); return; }
    if (event.target.closest?.('[data-admin-banner-reset]')) { applyBannerText('#ffffff'); return; }
    if (!event.target.closest?.('.admin-color-panel, .admin-color-trigger')) toggleColorPanel(false);
  });
  const observer = new MutationObserver(() => { clearTimeout(observer.__timer); observer.__timer = setTimeout(enhance, 80); });
  observer.observe(document.body, { childList: true, subtree: true });
  restoreAccent();
  restoreBannerText();
  setTimeout(enhance, 0);
})();
