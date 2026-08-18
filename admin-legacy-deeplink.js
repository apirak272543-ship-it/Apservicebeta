(() => {
  'use strict';
  const allowed = new Set(['overview', 'orders', 'stores', 'riders', 'customers', 'finance', 'settings', 'content', 'inventory', 'support', 'admins', 'errors', 'mapping', 'rider-applications', 'settlements', 'ai-workspace']);
  const requested = new URLSearchParams(location.search).get('admin');
  if (!allowed.has(requested || '')) return;
  const openRequestedSection = () => {
    if (typeof window.switchAdmin !== 'function' || !document.getElementById(`admin-${requested}`)) return false;
    window.switchAdmin(requested);
    if (requested === 'ai-workspace') window.APServiceModulePages?.adminAIWorkspace?.activate?.();
    return true;
  };
  addEventListener('load', () => { if (!openRequestedSection()) setTimeout(openRequestedSection, 180); }, { once: true });
})();
