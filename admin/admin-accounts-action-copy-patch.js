(() => {
  'use strict';
  const apply = () => {
    document.querySelectorAll('[data-account-action="identity"]').forEach(button => {
      if (button.textContent !== 'ชื่อและรหัสเข้าสู่ระบบ') button.textContent = 'ชื่อและรหัสเข้าสู่ระบบ';
    });
  };
  const mount = () => {
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(apply, 250);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
