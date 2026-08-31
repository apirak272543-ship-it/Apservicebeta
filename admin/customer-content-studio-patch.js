(() => {
  'use strict';

  const M = window.APServiceMPA; const stableJson = value => JSON.stringify(value, (_, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.keys(item).sort().reduce((out, key) => { out[key] = item[key]; return out; }, {}) : item);
  if (!M) return;

  const esc = value => M.ui.escapeHtml(String(value ?? ''));
  const iso = () => M.ui.nowIso();
  const notice = (message, type) => M.ui.setNotice(message, type);
  const request = (path, options = {}) => M.request(path, { private: true, ...options });
  const safeJson = value => value && typeof value === 'object' ? value : {};
  const clamp = (value, min, max, fallback) => { const number = Number(value); return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback; };
  const safeColor = (value, fallback = '') => /^#[0-9a-f]{6}$/i.test(String(value || '').trim()) ? String(value).trim() : fallback;
  const safeHref = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const url = new URL(raw, location.href);
      if (url.protocol === 'https:' || url.origin === location.origin) return raw;
    } catch (_) {}
    return '';
  };

  const defaultCards = [
    { id: 'food', enabled: true, sortOrder: 10, icon: '🍜', title: 'สั่งอาหาร', description: 'เลือกจากร้านเด็ดใกล้ตัว พร้อมเมนูยอดนิยม', href: 'stores.html', actionLabel: 'เปิดบริการ', altText: 'สั่งอาหาร', textColor: '#102a2a', backgroundColor: '#ffffff' },
    { id: 'supermarket', enabled: true, sortOrder: 20, icon: '🛒', title: 'ซูเปอร์มาร์เก็ต', description: 'เลือกซื้อจากร้านใกล้คุณในหน้าเดียว', href: 'stores.html', actionLabel: 'เลือกซื้อสินค้า', altText: 'ซูเปอร์มาร์เก็ต', textColor: '#102a2a', backgroundColor: '#ffffff' },
    { id: 'orders', enabled: true, sortOrder: 30, icon: '🧺', title: 'ออเดอร์ของฉัน', description: 'ติดตามสถานะและดูประวัติการใช้บริการ', href: 'orders.html', actionLabel: 'ดูออเดอร์', altText: 'ออเดอร์ของฉัน', textColor: '#102a2a', backgroundColor: '#ffffff' },
    { id: 'marketplace', enabled: true, sortOrder: 40, icon: '🛍️', title: 'ตลาดชุมชน', description: 'เลือกซื้อ ขาย และแชตกับสมาชิก AP Service', href: 'marketplace.html', actionLabel: 'เข้าสู่ตลาดชุมชน', altText: 'ตลาดชุมชน', textColor: '#102a2a', backgroundColor: '#ffffff' },
  ];

  const defaultHome = {
    hero: { eyebrow: 'AP SERVICE · DELIVERY & EVERYDAY SERVICES', title: 'อร่อยถึงบ้าน ทุกบริการถึงใจ', description: 'สั่งอาหารจากร้านโปรด ติดตามออเดอร์ และเลือกบริการของ AP Service ได้ในไม่กี่ขั้นตอน', backgroundUrl: '', artUrl: '', overlay: 'rgba(3, 91, 84, .34)', textColor: '#ffffff', primaryAction: { label: 'เริ่มสั่งอาหาร →', href: 'stores.html', enabled: true }, secondaryAction: { label: 'เลือกซูเปอร์มาร์เก็ต', href: 'stores.html', enabled: true } },
    serviceSection: { eyebrow: '', title: 'เลือกบริการ', description: 'ครบทุกความต้องการในวันของคุณ', enabled: true },
    serviceCards: defaultCards,
    storeSection: { title: 'ร้านค้ายอดนิยม', description: 'ดีลดี อาหารอร่อย ส่งตรงถึงมือ', viewAllLabel: 'ดูทั้งหมด', viewAllHref: 'stores.html', enabled: true },
    floatingCart: { enabled: true, icon: '🛒', label: 'ตะกร้าสินค้า', href: 'checkout.html' },
    navigation: { supportLabel: 'แชตช่วยเหลือ', notificationLabel: 'การแจ้งเตือน', profileLabel: 'โปรไฟล์' },
    mediaSlots: [],
  };

  const mergeCard = (fallback, value) => ({ ...fallback, ...(value && typeof value === 'object' ? value : {}), id: fallback.id });
  const normalizeHome = value => {
    const source = safeJson(value);
    const hero = { ...defaultHome.hero, ...safeJson(source.hero), primaryAction: { ...defaultHome.hero.primaryAction, ...safeJson(source.hero?.primaryAction) }, secondaryAction: { ...defaultHome.hero.secondaryAction, ...safeJson(source.hero?.secondaryAction) } };
    const byId = new Map((Array.isArray(source.serviceCards) ? source.serviceCards : []).map(row => [String(row?.id || ''), row]));
    return {
      ...defaultHome,
      ...source,
      hero,
      serviceSection: { ...defaultHome.serviceSection, ...safeJson(source.serviceSection) },
      serviceCards: defaultCards.map(card => mergeCard(card, byId.get(card.id))),
      storeSection: { ...defaultHome.storeSection, ...safeJson(source.storeSection) },
      floatingCart: { ...defaultHome.floatingCart, ...safeJson(source.floatingCart) },
      navigation: { ...defaultHome.navigation, ...safeJson(source.navigation) },
      mediaSlots: Array.isArray(source.mediaSlots) ? source.mediaSlots : [],
    };
  };

  const normalizePromotions = value => {
    const items = Array.isArray(value) ? value : (Array.isArray(value?.items) ? value.items : []);
    return items.map((row, index) => ({
      id: String(row?.id || `promotion-${index + 1}`), placement: row?.placement, approval_status: row?.approval_status, active: row?.active !== false, starts_at: row?.starts_at || '', ends_at: row?.ends_at || '', badge: row?.badge || '', eyebrow: row?.eyebrow || '', title: row?.title || '', description: row?.description || '', image_url: row?.image_url || '', alt_text: row?.alt_text || row?.title || `Banner ${index + 1}`, fit: row?.fit || 'cover', position: row?.position || 'center', overlay: row?.overlay || 'rgba(3, 50, 45, .42)', background_color: safeColor(row?.background_color, '#0b8c7c'), text_color: safeColor(row?.text_color, '#ffffff'), border_color: safeColor(row?.border_color, ''), button_enabled: row?.button_enabled !== false, button_label: row?.button_label || 'ดูรายละเอียด', link_url: row?.link_url || '', open_in_new_tab: row?.open_in_new_tab === true, priority: clamp(row?.priority, 0, 999, index + 1), max_width: clamp(row?.max_width, 280, 1200, 720), min_height: clamp(row?.min_height, 160, 720, 300),
    }));
  };

  const help = text => text ? `<details class="admin-field-help"><summary aria-label="คำอธิบายเพิ่มเติม">?</summary><p>${esc(text)}</p></details>` : '';
  const field = (label, name, value, type = 'text', extra = '', helpText = '') => `<label class="mpa-field"><span>${esc(label)}${help(helpText)}</span><input name="${esc(name)}" data-content-field="${esc(name)}" type="${type}" value="${esc(value)}" ${extra}></label>`;
  const area = (label, name, value, rows = 3, extra = '') => `<label class="mpa-field admin-form-full"><span>${esc(label)}</span><textarea name="${esc(name)}" data-content-field="${esc(name)}" rows="${rows}" ${extra}>${esc(value)}</textarea></label>`;
  const toggle = (label, name, checked) => `<label class="mpa-field"><span>${esc(label)}</span><select name="${esc(name)}" data-content-field="${esc(name)}"><option value="true" ${checked ? 'selected' : ''}>เปิด</option><option value="false" ${!checked ? 'selected' : ''}>ปิด</option></select></label>`;
  const routeChoices = [
    ['stores.html', 'ร้านค้าและเมนู'],
    ['orders.html', 'ออเดอร์ของลูกค้า'],
    ['checkout.html', 'ตะกร้าและสรุปคำสั่งซื้อ'],
    ['marketplace.html', 'ตลาดชุมชน'],
    ['index.html', 'หน้าแรก Customer'],
  ];
  const routeField = (label, name, value, helpText = 'เลือกหน้าที่ลูกค้าจะเห็นหลังจากกดปุ่ม ระบบจะบันทึกเส้นทางเดิมไว้โดยไม่เปลี่ยนการทำงานของหน้าอื่น') => {
    const current = String(value || '').trim();
    const options = routeChoices.some(([href]) => href === current) ? routeChoices : [[current, `ลิงก์ปัจจุบัน: ${current || '-'}`], ...routeChoices];
    return `<label class="mpa-field"><span>${esc(label)}${help(helpText)}</span><select name="${esc(name)}" data-content-field="${esc(name)}">${options.map(([href, text]) => `<option value="${esc(href)}" ${href === current ? 'selected' : ''}>${esc(text)}</option>`).join('')}</select></label>`;
  };
  const mediaInput = (label, name, value, mediaType = 'ADMIN_MEDIA', alt = '') => `<div class="admin-content-media-field"><span class="admin-content-media-label">${esc(label)}</span><div class="admin-media-source-actions"><label class="mpa-button mpa-button-secondary">เลือกจากคลังภาพ<input hidden type="file" accept="image/jpeg,image/png,image/webp" data-media-input data-media-field="${esc(name)}" data-media-type="${esc(mediaType)}"></label><label class="mpa-button mpa-button-secondary">ถ่ายรูป<input hidden type="file" accept="image/jpeg,image/png,image/webp" capture="environment" data-media-input data-media-field="${esc(name)}" data-media-type="${esc(mediaType)}"></label></div><input hidden name="${esc(name)}" data-content-field="${esc(name)}" type="hidden" value="${esc(value)}"><input name="${esc(`${name}__alt`)}" data-content-field="${esc(`${name}__alt`)}" type="text" value="${esc(alt)}" placeholder="คำอธิบายรูปสำหรับการเข้าถึง"><div class="admin-content-media-preview" data-media-preview="${esc(name)}">${value ? `<img src="${esc(value)}" alt="${esc(alt || label)}">` : '<span class="mpa-muted">ยังไม่มีรูปภาพ</span>'}</div><small class="mpa-muted" data-media-status="${esc(name)}">รูปจะถูกบีบอัด ตรวจ URL และลงทะเบียนใน media_assets ก่อนบันทึก config</small></div>`;

  const saveButton = (section, label) => `<button type="button" class="mpa-button admin-content-save-section" data-content-save="${esc(section)}">${esc(label)}</button>`;

  function readForm(form, home, promotions) {
    if (!form?.elements) throw new Error('ไม่พบฟอร์ม Content Studio กรุณารีเฟรชหน้าแล้วลองใหม่');
    const control = name => form.querySelector(`[name="${CSS.escape(name)}"]`); const value = name => String(control(name)?.value || '').trim();
    const bool = name => value(name) === 'true';
    const next = typeof structuredClone === 'function' ? structuredClone(home) : JSON.parse(JSON.stringify(home));
    next.hero = { ...next.hero, eyebrow: value('hero.eyebrow'), title: value('hero.title'), description: value('hero.description'), backgroundUrl: value('hero.backgroundUrl'), artUrl: value('hero.artUrl'), overlay: value('hero.overlay'), textColor: safeColor(value('hero.textColor'), '#ffffff'), primaryAction: { label: value('hero.primaryAction.label'), href: safeHref(value('hero.primaryAction.href')) || 'stores.html', enabled: bool('hero.primaryAction.enabled') }, secondaryAction: { label: value('hero.secondaryAction.label'), href: safeHref(value('hero.secondaryAction.href')) || 'stores.html', enabled: bool('hero.secondaryAction.enabled') } };
    next.serviceSection = { eyebrow: value('serviceSection.eyebrow'), title: value('serviceSection.title'), description: value('serviceSection.description'), enabled: bool('serviceSection.enabled') };
    next.serviceCards = next.serviceCards.map(card => ({ ...card, enabled: bool(`card.${card.id}.enabled`), sortOrder: clamp(value(`card.${card.id}.sortOrder`), 0, 999, card.sortOrder), icon: value(`card.${card.id}.icon`), iconUrl: value(`card.${card.id}.iconUrl`), backgroundUrl: value(`card.${card.id}.backgroundUrl`), title: value(`card.${card.id}.title`), description: value(`card.${card.id}.description`), href: safeHref(value(`card.${card.id}.href`)) || card.href, actionLabel: value(`card.${card.id}.actionLabel`), altText: value(`card.${card.id}.altText`), textColor: safeColor(value(`card.${card.id}.textColor`), '#102a2a'), backgroundColor: safeColor(value(`card.${card.id}.backgroundColor`), '#ffffff') }));
    next.storeSection = { title: value('storeSection.title'), description: value('storeSection.description'), viewAllLabel: value('storeSection.viewAllLabel'), viewAllHref: safeHref(value('storeSection.viewAllHref')) || 'stores.html', enabled: bool('storeSection.enabled') };
    next.floatingCart = { enabled: bool('floatingCart.enabled'), icon: value('floatingCart.icon'), label: value('floatingCart.label'), href: safeHref(value('floatingCart.href')) || 'checkout.html' };
    next.navigation = { supportLabel: value('navigation.supportLabel'), notificationLabel: value('navigation.notificationLabel'), profileLabel: value('navigation.profileLabel') };
    const nextPromotions = promotions.map((row, index) => ({ ...row, placement: row?.placement, approval_status: row?.approval_status, active: bool(`promo.${index}.active`), starts_at: value(`promo.${index}.starts_at`), ends_at: value(`promo.${index}.ends_at`), badge: value(`promo.${index}.badge`), eyebrow: value(`promo.${index}.eyebrow`), title: value(`promo.${index}.title`), description: value(`promo.${index}.description`), image_url: value(`promo.${index}.image_url`), alt_text: value(`promo.${index}.alt_text`), fit: value(`promo.${index}.fit`) || 'cover', position: value(`promo.${index}.position`) || 'center', overlay: value(`promo.${index}.overlay`), background_color: safeColor(value(`promo.${index}.background_color`), '#0b8c7c'), text_color: safeColor(value(`promo.${index}.text_color`), '#ffffff'), border_color: safeColor(value(`promo.${index}.border_color`), ''), button_enabled: bool(`promo.${index}.button_enabled`), button_label: value(`promo.${index}.button_label`), link_url: safeHref(value(`promo.${index}.link_url`)), open_in_new_tab: bool(`promo.${index}.open_in_new_tab`), priority: clamp(value(`promo.${index}.priority`), 0, 999, index + 1), max_width: clamp(value(`promo.${index}.max_width`), 280, 1200, 720), min_height: clamp(value(`promo.${index}.min_height`), 160, 720, 300) }));
    return { home: next, promotions: nextPromotions };
  }

  function readSection(form, home, promotions, section) {
    const next = readForm(form, home, promotions);
    if (section === 'all') return next;
    if (section === 'hero') return { home: { ...home, hero: next.home.hero }, promotions: promotions.slice() };
    if (section === 'services') return { home: { ...home, serviceSection: next.home.serviceSection, serviceCards: next.home.serviceCards, storeSection: next.home.storeSection }, promotions: promotions.slice() };
    if (section === 'navigation') return { home: { ...home, navigation: next.home.navigation, floatingCart: next.home.floatingCart }, promotions: promotions.slice() };
    if (section === 'promotions') return { home: { ...home }, promotions: next.promotions };
    return { home: { ...home }, promotions: promotions.slice() };
  }

  function renderCard(card) {
    return `<article class="mpa-card admin-content-card"><div class="mpa-page-head"><div><h3 style="margin:0">${esc(card.title || card.id)}</h3><p class="mpa-muted">${esc(card.id)} · จัดการไอคอน ภาพพื้นหลัง ข้อความ และการเปิดหน้าปลายทาง</p></div>${toggle('แสดงผล', `card.${card.id}.enabled`, card.enabled)}</div><div class="admin-form-grid">${field('ลำดับ', `card.${card.id}.sortOrder`, card.sortOrder, 'number', 'min="0" max="999"')}${field('ไอคอนสำรอง', `card.${card.id}.icon`, card.icon)}${field('หัวข้อ', `card.${card.id}.title`, card.title)}${field('ข้อความบนปุ่ม', `card.${card.id}.actionLabel`, card.actionLabel)}${routeField('เมื่อลูกค้ากดการ์ด ให้ไปที่', `card.${card.id}.href`, card.href)}${field('สีข้อความ', `card.${card.id}.textColor`, card.textColor, 'color', '', 'แตะเพื่อเลือกสีข้อความ')}${field('สีพื้นหลังสำรอง', `card.${card.id}.backgroundColor`, card.backgroundColor, 'color', '', 'แตะเพื่อเลือกสีพื้นหลัง')}${area('รายละเอียด', `card.${card.id}.description`, card.description, 2)}${mediaInput('รูปไอคอน (เลือกได้)', `card.${card.id}.iconUrl`, card.iconUrl, 'ADMIN_MEDIA', card.altText)}${mediaInput('รูปพื้นหลังการ์ด (รูปที่ 1)', `card.${card.id}.backgroundUrl`, card.backgroundUrl, 'ADMIN_MEDIA', card.altText)}</div></article>`;
  }

  let currentPromotions = [];
  function localizePromotionCopy(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      node.nodeValue = node.nodeValue
        .replace(/\bBanner\b/g, 'แบนเนอร์')
        .replace(/\bcarousel\b/g, 'แสดงสลับกัน')
        .replace(/รูป\s+แบนเนอร์/g, 'รูปแบนเนอร์');
    });
  }
  const blankPromotion = index => normalizePromotions([{ id: `promotion-${Date.now()}-${index + 1}`, placement: 'customer_home_sponsored', approval_status: 'draft', active: false, badge: 'AD', title: '', description: '', image_url: '', alt_text: '', button_enabled: true, button_label: 'ดูรายละเอียด', link_url: '', priority: index + 1 }])[0];

  function renderPromotion(row, index) {
    return `<article class="mpa-card admin-content-card admin-promotion-card"><div class="admin-promotion-preview" style="background:${esc(row.background_color)};min-height:${row.min_height}px">${row.image_url ? `<img src="${esc(row.image_url)}" alt="${esc(row.alt_text)}">` : '<span class="mpa-muted">ยังไม่มีรูป Banner</span>'}<div><b>${esc(row.badge || 'AD')}</b><h3>${esc(row.title || `Banner ${index + 1}`)}</h3><p>${esc(row.description)}</p></div></div><div class="mpa-page-head"><div><h3 style="margin:0">Banner รายการที่ ${index + 1}</h3><p class="mpa-muted">จัดลำดับ ${row.priority} · ${row.active ? 'กำลังแสดง' : 'ปิดการแสดงผล'}</p></div><div class="admin-promotion-actions"><button type="button" class="mpa-button mpa-button-secondary" data-promotion-action="up" data-promotion-index="${index}" ${index === 0 ? 'disabled' : ''}>ขึ้น</button><button type="button" class="mpa-button mpa-button-secondary" data-promotion-action="down" data-promotion-index="${index}" ${index === currentPromotions.length - 1 ? 'disabled' : ''}>ลง</button><button type="button" class="mpa-button mpa-button-danger" data-promotion-action="remove" data-promotion-index="${index}">ลบ Banner</button>${toggle('แสดงผล', `promo.${index}.active`, row.active)}</div></div><div class="admin-form-grid">${field('รหัสรายการ', `promo.${index}.id`, row.id)}${field('ป้ายกำกับ', `promo.${index}.badge`, row.badge)}${field('ข้อความเหนือหัวข้อ', `promo.${index}.eyebrow`, row.eyebrow)}${field('หัวข้อ', `promo.${index}.title`, row.title)}${area('รายละเอียด', `promo.${index}.description`, row.description, 3)}${field('คำอธิบายรูปภาพ', `promo.${index}.alt_text`, row.alt_text)}${field('เริ่มแสดง', `promo.${index}.starts_at`, row.starts_at, 'datetime-local')}${field('สิ้นสุด', `promo.${index}.ends_at`, row.ends_at, 'datetime-local')}${field('การวางภาพ', `promo.${index}.fit`, row.fit)}${field('ตำแหน่งภาพ', `promo.${index}.position`, row.position)}${field('สีทับภาพ', `promo.${index}.overlay`, row.overlay, 'text', '', 'ใช้เพื่อทำให้ข้อความบนรูปอ่านง่าย')}${field('สีพื้นหลัง', `promo.${index}.background_color`, row.background_color, 'color', '', 'แตะเพื่อเลือกสีพื้นหลัง')}${field('สีข้อความ', `promo.${index}.text_color`, row.text_color, 'color', '', 'แตะเพื่อเลือกสีข้อความ')}${field('สีกรอบ', `promo.${index}.border_color`, row.border_color, 'color', '', 'แตะเพื่อเลือกสีกรอบ')}${toggle('มีปุ่ม', `promo.${index}.button_enabled`, row.button_enabled)}${field('ข้อความปุ่ม', `promo.${index}.button_label`, row.button_label)}${routeField('เมื่อกดปุ่ม ให้ไปที่', `promo.${index}.link_url`, row.link_url)}${toggle('เปิดลิงก์แท็บใหม่', `promo.${index}.open_in_new_tab`, row.open_in_new_tab)}${field('ลำดับความสำคัญ', `promo.${index}.priority`, row.priority, 'number', 'min="0" max="999"')}${field('ความกว้างสูงสุด', `promo.${index}.max_width`, row.max_width, 'number', 'min="280" max="1200"')}${field('ความสูงขั้นต่ำ', `promo.${index}.min_height`, row.min_height, 'number', 'min="160" max="720"')}${mediaInput('รูป Banner', `promo.${index}.image_url`, row.image_url, 'PROMOTION', row.alt_text)}</div></article>`;
  }

  function renderPromotionManager(host, promotions) {
    currentPromotions = promotions.slice();
    queueMicrotask(() => localizePromotionCopy(host));
    host.innerHTML = `<div class="admin-promotion-toolbar"><div><strong>Banner ชุดสไลด์</strong><span class="mpa-muted">เพิ่มได้ไม่จำกัดจำนวน · มีมากกว่า 1 ใบจะแสดงเป็น carousel ที่หน้า Customer</span></div><button type="button" class="mpa-button" data-promotion-action="add">+ เพิ่ม Banner ใหม่</button></div><div class="admin-promotion-list">${currentPromotions.length ? currentPromotions.map(renderPromotion).join('') : '<div class="mpa-card"><p class="mpa-muted">ยังไม่มี Banner กด “เพิ่ม Banner ใหม่” เพื่อสร้างรายการแรก</p></div>'}</div>`;
    host.querySelectorAll('[data-promotion-action]').forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.promotionAction;
      const index = Number(button.dataset.promotionIndex);
      if (action === 'add') currentPromotions.push(blankPromotion(currentPromotions.length));
      if (action === 'remove' && Number.isInteger(index)) currentPromotions.splice(index, 1);
      if (action === 'up' && index > 0) [currentPromotions[index - 1], currentPromotions[index]] = [currentPromotions[index], currentPromotions[index - 1]];
      if (action === 'down' && index >= 0 && index < currentPromotions.length - 1) [currentPromotions[index], currentPromotions[index + 1]] = [currentPromotions[index + 1], currentPromotions[index]];
      if (!['add', 'remove', 'up', 'down'].includes(action)) return;
      renderPromotionManager(host, currentPromotions);
    }));
  }

  function attachMediaInputs(host, access, refresh) {
    if (host.__apMediaChangeHandler) host.removeEventListener('change', host.__apMediaChangeHandler);
    const handleMediaChange = async event => {
      const input = event.target?.closest?.('[data-media-input]');
      if (!input || !host.contains(input)) return;
      const file = input.files?.[0];
      if (!file) return;
      const name = input.dataset.mediaField;
      const status = host.querySelector(`[data-media-status="${CSS.escape(name)}"]`);
      const preview = host.querySelector(`[data-media-preview="${CSS.escape(name)}"]`);
      const value = host.querySelector(`[data-content-field="${CSS.escape(name)}"]`);
      if (status) status.textContent = 'กำลังบีบอัด อัปโหลด ตรวจสอบ URL และลงทะเบียน media_assets…';
      try {
        const session = await M.auth.refreshSession(false);
        const accessToken = session?.access_token || M.auth.getSession?.()?.access_token;
        const actorId = session?.user?.id || access.user.id;
        if (!accessToken || !actorId) throw new Error('เซสชัน Admin ไม่พร้อมสำหรับอัปโหลดรูปภาพ กรุณาเข้าสู่ระบบใหม่');
        const previousUrl = value?.value || ''; const uploaded = await window.APServiceMedia.uploadPublicImage(file, { ...M.config, accessToken, actorId, bucket: 'catalog-media', scope: 'customer-home', pathPrefix: 'admin', mediaType: input.dataset.mediaType || 'ADMIN_MEDIA', ownerType: 'admin', variant: name, legacySource: { field: name, source: 'customer-content-studio' } });
        if (value) { if (previousUrl && previousUrl !== uploaded.publicUrl) value.dataset.previousMediaUrl = previousUrl; value.dataset.pendingMediaPath = uploaded.path || ''; value.value = uploaded.publicUrl; }
        if (preview) preview.innerHTML = `<img src="${esc(uploaded.publicUrl)}" alt="ตัวอย่างสื่อที่ตรวจแล้ว">`;
        if (status) status.textContent = `อัปโหลดและตรวจสอบแล้ว · ${Math.ceil(Number(uploaded.bytes || 0) / 1024)} KB · ${uploaded.mediaId}`;
        notice('อัปโหลดและเตรียมรูปภาพแล้ว กดบันทึก Content เพื่อเผยแพร่');
      } catch (error) {
        if (status) status.textContent = `อัปโหลดไม่สำเร็จ: ${error.message}`;
        notice(error.message, 'error');
      } finally {
        event.target.value = '';
      }
    };
    host.addEventListener('change', handleMediaChange);
    host.__apMediaChangeHandler = handleMediaChange;
    host.querySelectorAll('[data-content-field]').forEach(input => {
      if (input.type !== 'url') return;
      input.oninput = () => { const preview = host.querySelector(`[data-media-preview="${CSS.escape(input.dataset.contentField)}"]`); if (preview && /^https:\/\//i.test(input.value.trim())) preview.innerHTML = `<img src="${esc(input.value.trim())}" alt="ตัวอย่างรูป">`; };
    });
    void refresh;
  }

  async function cleanupPendingMedia(root, access) { const token = M.auth.getSession?.()?.access_token; const actorId = access?.user?.id; if (!token || !actorId || !window.APServiceMedia?.cleanupReplacedPublicMedia) return; for (const input of root.querySelectorAll('[data-content-field][data-previous-media-url]')) { const oldUrl = input.dataset.previousMediaUrl; const newUrl = input.value; try { await window.APServiceMedia.cleanupReplacedPublicMedia({ ...M.config, accessToken: token, oldUrl, newUrl, bucket: 'catalog-media', pathPrefix: 'admin' }); } catch (error) { console.warn('ลบสื่อเก่าหลังแทนที่ไม่สำเร็จ', error); } delete input.dataset.previousMediaUrl; delete input.dataset.pendingMediaPath; } }

  function localizeContentStudioCopy(root) {
    const copy = new Map([
      ['Hero และหน้าแรก', 'พื้นที่นำและหน้าแรก'], ['Header และตะกร้า', 'ส่วนบนและตะกร้า'], ['พื้นหลังหน้า Login', 'พื้นหลังหน้าลงชื่อเข้าใช้'], ['Banner โฆษณา', 'แบนเนอร์โฆษณา'], ['Media registry', 'คลังสื่อ'], ['CUSTOMER HOME', 'หน้าแรกของลูกค้า'], ['Hero หน้าแรก · พื้นหลังและข้อความหลัก', 'หน้าแรก · ภาพพื้นหลังและข้อความหลัก'], ['ควบคุมข้อความ ปุ่ม สี และภาพพื้นหลังหน้า Customer โดยไม่เปลี่ยน route guard หรือ business logic', 'ตั้งค่าข้อความ ปุ่ม สี และภาพพื้นหลังที่หน้าลูกค้าเห็น โดยคงการทำงานเดิมของระบบ'], ['Eyebrow', 'ข้อความกำกับ'], ['Overlay', 'ชั้นสีทับภาพ'], ['Primary label', 'ข้อความปุ่มหลัก'], ['Primary href', 'ปลายทางปุ่มหลัก'], ['เปิด Primary', 'แสดงปุ่มหลัก'], ['Secondary label', 'ข้อความปุ่มรอง'], ['Secondary href', 'ปลายทางปุ่มรอง'], ['เปิด Secondary', 'แสดงปุ่มรอง'], ['Hero background (รูปที่ 3)', 'ภาพพื้นหลังหน้าแรก (รูปที่ 3)'], ['Hero art/ภาพประกอบ', 'ภาพประกอบหน้าแรก'], ['SERVICE CATALOG', 'บริการและร้านค้า'], ['บริการ ร้านค้า และการ์ด Action', 'บริการ ร้านค้า และการ์ดการใช้งาน'], ['APP NAVIGATION', 'การนำทาง'], ['ปรับข้อความนำทางและ floating cart โดยไม่รวมกับส่วนแก้ไขสื่อ', 'ปรับข้อความนำทางและตะกร้าลอย โดยแยกจากการแก้ไขสื่อ'], ['PROMOTIONS', 'โฆษณา'], ['Banner โฆษณา · แก้ไขละเอียดทุกองค์ประกอบ', 'แบนเนอร์โฆษณา · ตั้งค่ารายละเอียดแต่ละรายการ'], ['แก้ทีละ Banner พร้อม preview, สถานะเปิด/ปิด และอัปโหลดผ่าน shared media pipeline', 'แก้ไขแบนเนอร์แต่ละรายการ พร้อมภาพตัวอย่าง สถานะเปิด/ปิด และอัปโหลดรูปภาพ'], ['MEDIA REGISTRY', 'คลังสื่อ'], ['Media registry ที่ตรวจพบ', 'คลังสื่อที่ตรวจพบ'], ['รายการนี้เป็นหลักฐานจาก media_assets จริง ไม่ได้หมายความว่าจะโหลดทุกไฟล์มาใช้ในหน้า Customer', 'แสดงรายการสื่อที่ลงทะเบียนไว้ในระบบ โดยไม่เปลี่ยนการแสดงผลหน้าลูกค้าจนกว่าจะบันทึกการตั้งค่า'], ['ยังไม่มี media registry', 'ยังไม่มีรายการสื่อ'], ['บันทึก Content และ Banner ทั้งหมด', 'บันทึกเนื้อหาและแบนเนอร์ทั้งหมด']
    ]);
    copy.set('ข้อความบน Header และตะกร้า', 'ข้อความส่วนบนและตะกร้า');
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const raw = node.nodeValue;
      const translated = copy.get(raw.trim());
      if (translated) node.nodeValue = raw.replace(raw.trim(), translated);
    });
  }

  function contentStudio() {
    const R = window.APServiceAdminRuntime;
    if (!R) return;
    const content = `<div class="mpa-page-head"><div><h1>ศูนย์จัดการเนื้อหาหน้าลูกค้า</h1><p>ตั้งค่าข้อความ ปุ่ม ไอคอน ภาพพื้นหลัง การ์ดบริการ และแบนเนอร์โฆษณาที่แสดงในหน้าลูกค้า</p></div><button class="mpa-button mpa-button-secondary" id="refreshCustomerContent">รีเฟรช</button></div><section class="mpa-card" id="contentStudioHost">${M.ui.loading('กำลังโหลดการตั้งค่าหน้าลูกค้า…')}</section>`;
    R.gate('media', content).then(async access => {
      if (!access) return;
      R.user = access.user;
      const host = document.querySelector('#contentStudioHost');
      let sourceBrand = {};
      let home = normalizeHome({});
      let promotions = [];
      let promotionConfig = {};
      let assets = [];
      const load = async () => {
        const [brandRows, promotionRows, assetRows] = await Promise.all([
          request('platform_configs?select=key,value,updated_at&key=eq.brand_public&limit=1').catch(() => []),
          request('platform_configs?select=key,value,updated_at&key=eq.customer_promotions&limit=1').catch(() => []),
          request('media_assets?select=id,media_type,bucket_id,storage_path,status,byte_size,width,height,created_at&order=created_at.desc&limit=50').catch(() => []),
        ]);
        sourceBrand = safeJson(brandRows?.[0]?.value);
        home = normalizeHome(sourceBrand.customerHome);
        promotionConfig = safeJson(promotionRows?.[0]?.value);
        promotions = normalizePromotions(promotionConfig);
        assets = assetRows || [];
        host.innerHTML = `<form id="customerContentForm"><nav class="admin-content-subnav" aria-label="หมวด Content Studio"><button type="button" class="admin-content-tab is-active" data-content-tab="hero">Hero และหน้าแรก</button><button type="button" class="admin-content-tab" data-content-tab="services">บริการและร้านค้า</button><button type="button" class="admin-content-tab" data-content-tab="navigation">Header และตะกร้า</button><button type="button" class="admin-content-tab" data-content-tab="promotions">Banner โฆษณา</button><button type="button" class="admin-content-tab" data-content-tab="registry">Media registry</button></nav><section class="admin-content-panel is-active" data-content-panel="hero"><div class="admin-content-panel-head"><div><span class="admin-kicker">CUSTOMER HOME</span><h2>Hero หน้าแรก · พื้นหลังและข้อความหลัก</h2><p class="mpa-muted">ควบคุมข้อความ ปุ่ม สี และภาพพื้นหลังหน้า Customer โดยไม่เปลี่ยน route guard หรือ business logic</p></div>${saveButton('hero', 'บันทึกหน้าแรก')}</div><div class="admin-form-grid">${field('Eyebrow', 'hero.eyebrow', home.hero.eyebrow)}${field('หัวข้อหลัก', 'hero.title', home.hero.title)}${area('คำอธิบาย', 'hero.description', home.hero.description, 3)}${field('Overlay', 'hero.overlay', home.hero.overlay)}${field('สีข้อความ', 'hero.textColor', home.hero.textColor)}${field('Primary label', 'hero.primaryAction.label', home.hero.primaryAction.label)}${field('Primary href', 'hero.primaryAction.href', home.hero.primaryAction.href)}${toggle('เปิด Primary', 'hero.primaryAction.enabled', home.hero.primaryAction.enabled)}${field('Secondary label', 'hero.secondaryAction.label', home.hero.secondaryAction.label)}${field('Secondary href', 'hero.secondaryAction.href', home.hero.secondaryAction.href)}${toggle('เปิด Secondary', 'hero.secondaryAction.enabled', home.hero.secondaryAction.enabled)}${mediaInput('Hero background (รูปที่ 3)', 'hero.backgroundUrl', home.hero.backgroundUrl, 'ADMIN_MEDIA', 'ภาพพื้นหลังหน้า Customer')}${mediaInput('Hero art/ภาพประกอบ', 'hero.artUrl', home.hero.artUrl, 'ADMIN_MEDIA', 'ภาพประกอบ Hero')}</div></section><section class="admin-content-panel" data-content-panel="services"><div class="admin-content-panel-head"><div><span class="admin-kicker">SERVICE CATALOG</span><h2>บริการ ร้านค้า และการ์ด Action</h2><p class="mpa-muted">จัดการข้อความ ไอคอน ภาพ และการแสดงผลของบริการที่ลูกค้าเห็น</p></div>${saveButton('services', 'บันทึกบริการและร้านค้า')}</div><div class="admin-form-grid">${field('Eyebrow', 'serviceSection.eyebrow', home.serviceSection.eyebrow)}${field('หัวข้อ', 'serviceSection.title', home.serviceSection.title)}${area('คำอธิบาย', 'serviceSection.description', home.serviceSection.description, 2)}${toggle('แสดงส่วนบริการ', 'serviceSection.enabled', home.serviceSection.enabled)}</div>${home.serviceCards.slice().sort((a,b) => a.sortOrder - b.sortOrder).map(renderCard).join('')}<div class="admin-form-grid" style="margin-top:16px">${field('หัวข้อร้านค้า', 'storeSection.title', home.storeSection.title)}${field('คำอธิบายร้านค้า', 'storeSection.description', home.storeSection.description)}${field('ปุ่มดูทั้งหมด', 'storeSection.viewAllLabel', home.storeSection.viewAllLabel)}${field('ลิงก์ดูทั้งหมด', 'storeSection.viewAllHref', home.storeSection.viewAllHref)}${toggle('แสดงร้านค้ายอดนิยม', 'storeSection.enabled', home.storeSection.enabled)}</div></section><section class="admin-content-panel" data-content-panel="navigation"><div class="admin-content-panel-head"><div><span class="admin-kicker">APP NAVIGATION</span><h2>ข้อความบน Header และตะกร้า</h2><p class="mpa-muted">ปรับข้อความนำทางและ floating cart โดยไม่รวมกับส่วนแก้ไขสื่อ</p></div>${saveButton('navigation', 'บันทึก Header และตะกร้า')}</div><div class="admin-form-grid">${field('ช่วยเหลือ', 'navigation.supportLabel', home.navigation.supportLabel)}${field('การแจ้งเตือน', 'navigation.notificationLabel', home.navigation.notificationLabel)}${field('โปรไฟล์', 'navigation.profileLabel', home.navigation.profileLabel)}${field('ไอคอนตะกร้า', 'floatingCart.icon', home.floatingCart.icon)}${field('ข้อความตะกร้า', 'floatingCart.label', home.floatingCart.label)}${field('ลิงก์ตะกร้า', 'floatingCart.href', home.floatingCart.href)}${toggle('แสดงตะกร้า', 'floatingCart.enabled', home.floatingCart.enabled)}</div></section><section class="admin-content-panel" data-content-panel="promotions"><div class="admin-content-panel-head"><div><span class="admin-kicker">PROMOTIONS</span><h2>Banner โฆษณา · แก้ไขละเอียดทุกองค์ประกอบ</h2><p class="mpa-muted">แก้ทีละ Banner พร้อม preview, สถานะเปิด/ปิด และอัปโหลดผ่าน shared media pipeline</p></div>${saveButton('promotions', 'บันทึกแบนเนอร์')}</div><div data-content-promotions></div></section><section class="admin-content-panel" data-content-panel="registry"><div class="admin-content-panel-head"><div><span class="admin-kicker">MEDIA REGISTRY</span><h2>Media registry ที่ตรวจพบ</h2><p class="mpa-muted">รายการนี้เป็นหลักฐานจาก media_assets จริง ไม่ได้หมายความว่าจะโหลดทุกไฟล์มาใช้ในหน้า Customer</p></div><strong class="admin-inline-count">${assets.length} รายการล่าสุด</strong></div><div class="mpa-table-wrap"><table class="mpa-table"><thead><tr><th>ประเภท</th><th>สถานะ</th><th>ขนาด</th><th>สร้างเมื่อ</th></tr></thead><tbody>${assets.slice(0, 20).map(row => `<tr><td>${esc(row.media_type || '-')}</td><td>${esc(row.status || '-')}</td><td>${esc(row.byte_size ? `${Math.ceil(row.byte_size / 1024)} KB` : '-')}</td><td>${esc(row.created_at ? new Date(row.created_at).toLocaleString('th-TH') : '-')}</td></tr>`).join('') || '<tr><td colspan="4">ยังไม่มี media registry</td></tr>'}</tbody></table></div></section><div class="admin-modal-actions" style="margin-top:16px"><button class="mpa-button" type="submit">บันทึก Content และ Banner ทั้งหมด</button></div></form>`;
        localizeContentStudioCopy(host);
        host.querySelectorAll('[data-content-tab]').forEach(button => button.onclick = () => { const tab = button.dataset.contentTab; host.querySelectorAll('[data-content-tab]').forEach(item => item.classList.toggle('is-active', item === button)); host.querySelectorAll('[data-content-panel]').forEach(panel => panel.classList.toggle('is-active', panel.dataset.contentPanel === tab)); });
        const promotionsHost = host.querySelector('[data-content-promotions]');
        if (promotionsHost) renderPromotionManager(promotionsHost, promotions);
        attachMediaInputs(host, access, load);
        const form = host.querySelector('#customerContentForm');
        const saveSection = async (section, button) => {
          const submit = button || form?.querySelector('button[type="submit"]');
          const originalSubmitLabel = submit?.textContent || 'บันทึกเนื้อหาและแบนเนอร์ทั้งหมด';
          if (!form?.elements) return notice('บันทึก Content ไม่สำเร็จ: ไม่พบฟอร์ม กรุณารีเฟรชหน้าแล้วลองใหม่', 'error');
          if (submit) { submit.disabled = true; submit.textContent = 'กำลังบันทึก…'; }
          try {
            const next = readSection(form, home, currentPromotions, section);
            if (section !== 'promotions') {
              await request('platform_configs?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify([{ key: 'brand_public', value: { ...sourceBrand, customerHome: next.home }, updated_at: iso() }]) });
            }
            if (section === 'promotions' || section === 'all') {
              await request('platform_configs?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify([{ key: 'customer_promotions', value: { ...promotionConfig, items: next.promotions }, updated_at: iso() }]) });
            }
            await request('admin_action_audit', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ actor_id: access.user.id, action: `customer_content_${section}_updated`, reason: `แก้ไข Customer Content Studio หมวด ${section}`, before_state: { customerHome: home, promotions }, after_state: next, created_at: iso() }) }).catch(error => console.warn('บันทึก audit ไม่สำเร็จ', error));
            const verifyKeys = section === 'promotions' ? ['customer_promotions'] : section === 'all' ? ['brand_public', 'customer_promotions'] : ['brand_public'];
            const verified = await Promise.all(verifyKeys.map(key => request(`platform_configs?select=key,value&key=eq.${key}&limit=1`, { forceFresh: true })));
            if (verified.some((rows, index) => !rows?.[0] || stableJson(rows[0].value) !== stableJson(index === 0 && section === 'promotions' ? { ...promotionConfig, items: next.promotions } : index === 0 && section !== 'promotions' ? { ...sourceBrand, customerHome: next.home } : { ...promotionConfig, items: next.promotions }))) throw new Error('บันทึกแล้วแต่ตรวจสอบข้อมูลจากฐานข้อมูลไม่ตรงกัน กรุณาลองใหม่');
            await cleanupPendingMedia(host, access);
            notice(section === 'all' ? 'บันทึก Customer Content และ Banner แล้ว' : `บันทึกหมวด ${section} แล้ว`);
            await load();
          } catch (error) { notice(`บันทึก Content ไม่สำเร็จ: ${error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'}`, 'error'); }
          finally { if (submit) { submit.disabled = false; submit.textContent = originalSubmitLabel; } }
        };
        host.querySelectorAll('[data-content-save]').forEach(button => button.onclick = () => saveSection(button.dataset.contentSave, button));
        form.onsubmit = event => { event.preventDefault(); saveSection('all', event.submitter || form.querySelector('button[type="submit"]')); };
      };
      document.querySelector('#refreshCustomerContent').onclick = () => load().catch(error => notice(`รีเฟรชไม่สำเร็จ: ${error.message}`, 'error'));
      try { await load(); } catch (error) { host.innerHTML = M.ui.error('โหลด Customer Content ไม่สำเร็จ', error.message); }
    }).catch(error => notice(error.message, 'error'));
  }

  window.APServiceAdminPatch = window.APServiceAdminPatch || {};
  window.APServiceAdminPatch.media = contentStudio;
  window.APServiceAdminPatch.promotions = contentStudio;
})();
