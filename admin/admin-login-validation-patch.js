(() => {
  'use strict';
  const apply = () => {
    const form = document.querySelector('#loginForm');
    if (!form) return false;
    form.noValidate = true;
    return true;
  };
  if (apply()) return;
  const observer = new MutationObserver(() => {
    if (apply()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
