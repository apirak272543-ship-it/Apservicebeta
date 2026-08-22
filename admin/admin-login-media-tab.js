(() => {
  'use strict';

  const tab = 'login-media';

  function activate(form, key) {
    form.querySelectorAll('[data-content-tab]').forEach(button => button.classList.toggle('is-active', button.dataset.contentTab === key));
    form.querySelectorAll('[data-content-panel]').forEach(panel => panel.classList.toggle('is-active', panel.dataset.contentPanel === key));
  }

  function mount() {
    const host = document.querySelector('#contentStudioHost');
    const form = host?.querySelector('#customerContentForm');
    const nav = form?.querySelector('.admin-content-subnav');
    const registry = form?.querySelector('[data-content-panel="registry"]');
    if (!form || !nav || !registry || form.dataset.loginMediaTabMounted === 'true') return;
    form.dataset.loginMediaTabMounted = 'true';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'admin-content-tab';
    button.dataset.contentTab = tab;
    button.textContent = 'พื้นหลังหน้าลงชื่อเข้าใช้';
    button.onclick = () => activate(form, tab);
    nav.insertBefore(button, nav.querySelector('[data-content-tab="registry"]') || null);

    const panel = document.createElement('section');
    panel.className = 'admin-content-panel';
    panel.dataset.contentPanel = tab;
    panel.innerHTML = '<div class="admin-content-panel-head"><div><span class="admin-kicker">สื่อหน้าลงชื่อเข้าใช้</span><h2>ภาพพื้นหลังและภาพเคลื่อนไหวตามเทศกาล</h2><p class="mpa-muted">จัดการสื่อสำหรับหน้าลงชื่อเข้าใช้ของลูกค้า ผู้ดูแล ร้านค้า ไรเดอร์ และจุดขาย โดยใช้คลังสื่อเดียวกันและคงข้อมูลเดิมไว้</p></div></div><iframe class="admin-login-media-frame" title="จัดการสื่อพื้นหลังหน้าลงชื่อเข้าใช้" src="login-media.html?embedded=1" loading="lazy"></iframe>';
    registry.before(panel);
  }

  const observer = new MutationObserver(mount);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
