(() => {
  'use strict';
  const STORAGE = {
    density: 'apservice-admin-density-v1',
    accent: 'apservice-admin-accent-v1',
  };
  const palettes = [
    { name: 'Rose', value: '#c83f5b', deep: '#812238', soft: '#fff0f3' },
    { name: 'Teal', value: '#1f877d', deep: '#14534e', soft: '#e9f7f5' },
    { name: 'Indigo', value: '#5f5ac7', deep: '#35306e', soft: '#f1f0ff' },
    { name: 'Amber', value: '#c37a22', deep: '#704513', soft: '#fff6e6' },
    { name: 'Plum', value: '#9a4d8b', deep: '#5a2852', soft: '#fff0fb' },
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
  const readStorage = (key, fallback = '') => { try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; } };
  const writeStorage = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
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
    document.querySelectorAll('[data-admin-color-swatch]').forEach(button => button.classList.toggle('is-active', button.dataset.adminColorSwatch.toLowerCase() === hex));
  };
  const restoreAccent = () => {
    const raw = readStorage(STORAGE.accent);
    try {
      const saved = JSON.parse(raw);
      if (saved?.value) {
        document.documentElement.style.setProperty('--admin-accent', saved.value);
        document.documentElement.style.setProperty('--admin-accent-deep', saved.deep || saved.value);
        document.documentElement.style.setProperty('--admin-accent-soft', saved.soft || '#fff0f3');
        return;
      }
    } catch (_) {}
    applyAccent('#c83f5b');
  };
  const getLinks = () => [...document.querySelectorAll('.admin-nav-link, .admin-nav-popover-link, .admin-nav-legacy')]
    .map(link => ({ href: link.getAttribute('href'), label: link.querySelector('span')?.textContent?.trim() || link.textContent.trim(), node: link }))
    .filter(item => item.href && item.label);

  const createColorPanel = () => {
    if (document.querySelector('.admin-color-panel')) return document.querySelector('.admin-color-panel');
    const panel = document.createElement('section');
    panel.className = 'admin-color-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'ปรับสี Admin');
    panel.innerHTML = `<div class="admin-color-control"><div><strong>โทนสีศูนย์ควบคุม</strong><p class="mpa-muted">เลือกสีที่สบายตา ค่านี้จำไว้เฉพาะอุปกรณ์นี้</p></div><div class="admin-color-options">${palettes.map(item => `<button type="button" class="admin-color-swatch" style="--swatch:${item.value}" data-admin-color-swatch="${item.value}" aria-label="สี ${item.name}" title="${item.name}"></button>`).join('')}</div><div class="admin-color-custom"><input type="color" data-admin-color-picker value="#c83f5b" aria-label="เลือกสีเอง"><input type="text" data-admin-color-value value="#c83f5b" maxlength="7" aria-label="รหัสสี HEX" spellcheck="false"><button type="button" class="mpa-button mpa-button-secondary" data-admin-color-reset>คืนค่าเดิม</button></div><div class="admin-color-preview" data-admin-color-preview>ตัวอย่างสีปุ่มและสถานะ</div></div>`;
    document.body.append(panel);
    return panel;
  };
  const toggleColorPanel = force => {
    const panel = createColorPanel();
    const next = typeof force === 'boolean' ? force : !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', next);
    if (next) panel.querySelector('[data-admin-color-value]')?.focus();
  };
  const createCommandPalette = () => {
    if (document.querySelector('.admin-command-backdrop')) return document.querySelector('.admin-command-backdrop');
    const backdrop = document.createElement('div');
    backdrop.className = 'admin-command-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = `<section class="admin-command-dialog" role="dialog" aria-modal="true" aria-label="ค้นหาเมนู Admin"><div class="admin-command-head"><span aria-hidden="true">⌕</span><input type="search" placeholder="ค้นหาเมนูหรือหน้าจัดการ…" autocomplete="off"><button type="button" class="mpa-button mpa-button-secondary" data-command-close>ปิด</button></div><div class="admin-command-list" role="listbox"></div></section>`;
    document.body.append(backdrop);
    const input = backdrop.querySelector('input');
    const list = backdrop.querySelector('.admin-command-list');
    let activeIndex = 0;
    const render = () => {
      const query = input.value.trim().toLowerCase();
      const entries = getLinks().filter(item => !query || `${item.label} ${item.href}`.toLowerCase().includes(query));
      activeIndex = Math.min(activeIndex, Math.max(entries.length - 1, 0));
      list.innerHTML = entries.length ? entries.map((item, index) => `<button type="button" class="admin-command-item${index === activeIndex ? ' is-active' : ''}" data-command-href="${item.href}"><span>${item.label}</span><small>${item.href.split('?')[0]}</small></button>`).join('') : '<div class="admin-command-empty">ไม่พบเมนูที่ตรงกับคำค้น</div>';
    };
    const open = () => { backdrop.hidden = false; requestAnimationFrame(() => backdrop.classList.add('is-open')); input.value = ''; activeIndex = 0; render(); input.focus(); };
    const close = () => { backdrop.classList.remove('is-open'); setTimeout(() => { backdrop.hidden = true; }, 160); };
    backdrop.__adminOpen = open;
    backdrop.querySelector('[data-command-close]').onclick = close;
    backdrop.addEventListener('click', event => { if (event.target === backdrop) close(); });
    input.addEventListener('input', () => { activeIndex = 0; render(); });
    input.addEventListener('keydown', event => {
      const items = [...list.querySelectorAll('[data-command-href]')];
      if (event.key === 'ArrowDown') { event.preventDefault(); activeIndex = Math.min(activeIndex + 1, items.length - 1); render(); }
      if (event.key === 'ArrowUp') { event.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); render(); }
      if (event.key === 'Enter' && items[activeIndex]) { event.preventDefault(); location.href = items[activeIndex].dataset.commandHref; }
      if (event.key === 'Escape') { event.preventDefault(); close(); }
    });
    list.addEventListener('click', event => { const target = event.target.closest('[data-command-href]'); if (target) location.href = target.dataset.commandHref; });
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
    if (!header.querySelector('.admin-color-trigger')) {
      const color = document.createElement('button');
      color.type = 'button'; color.className = 'admin-command-trigger admin-color-trigger'; color.setAttribute('aria-label', 'ปรับสี Admin'); color.innerHTML = '<span aria-hidden="true" class="admin-color-dot"></span><span>สี</span>';
      color.onclick = () => toggleColorPanel();
      header.append(color);
    }
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
    search.addEventListener('input', () => {
      const query = search.value.trim().toLowerCase(); let visible = 0;
      table.querySelectorAll('tbody tr').forEach(row => { const match = !query || row.textContent.toLowerCase().includes(query); row.hidden = !match; if (match) visible += 1; });
      count.textContent = `${visible} รายการ${query ? 'ที่ตรงกับคำค้น' : ''}`;
    });
    toolbar.querySelectorAll('[data-admin-density]').forEach(button => button.addEventListener('click', () => applyDensity(button.dataset.adminDensity)));
    applyDensity(readStorage(STORAGE.density, 'comfortable'));
  };
  const enhance = () => {
    restoreAccent();
    ensureHeaderTools();
    createCommandPalette();
    document.querySelectorAll('.mpa-table-wrap').forEach(ensureTableToolbar);
    document.body.classList.add('admin-ui-ready');
  };
  const handleGlobal = event => {
    if (event.key === 'Escape') { toggleColorPanel(false); document.querySelector('.admin-command-backdrop')?.querySelector('[data-command-close]')?.click(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); createCommandPalette().__adminOpen?.(); }
    if (event.target.matches('[data-admin-color-picker]')) { applyAccent(event.target.value); }
    if (event.target.matches('[data-admin-color-value]') && event.type === 'change') { applyAccent(event.target.value); }
    if (event.target.closest('[data-admin-color-swatch]')) { applyAccent(event.target.closest('[data-admin-color-swatch]').dataset.adminColorSwatch); }
    if (event.target.matches('[data-admin-color-reset]')) { applyAccent('#c83f5b'); }
  };
  document.addEventListener('keydown', handleGlobal);
  document.addEventListener('input', handleGlobal);
  document.addEventListener('change', handleGlobal);
  document.addEventListener('click', event => { if (!event.target.closest('.admin-color-panel, .admin-color-trigger')) toggleColorPanel(false); });
  const observer = new MutationObserver(() => { clearTimeout(observer.__timer); observer.__timer = setTimeout(enhance, 80); });
  observer.observe(document.body, { childList: true, subtree: true });
  restoreAccent();
  setTimeout(enhance, 0);
})();
