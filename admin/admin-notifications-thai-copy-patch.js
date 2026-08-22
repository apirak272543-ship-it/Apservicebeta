(() => {
  'use strict';
  const roleLabels = { rider: 'ไรเดอร์', customer: 'ลูกค้า', store_owner: 'เจ้าของร้าน', admin: 'ผู้ดูแล' };
  const roleText = value => roleLabels[String(value || '').trim()] || String(value || '');
  const apply = () => {
    const host = document.querySelector('#notifications');
    if (!host) return;
    host.querySelectorAll('[data-notice-role]').forEach(button => {
      const label = button.dataset.noticeRole === 'all' ? 'ทุกประเภท' : roleText(button.dataset.noticeRole);
      if (button.textContent !== label) button.textContent = label;
    });
    host.querySelectorAll('.admin-notice-card dl dd:first-of-type').forEach(cell => {
      const label = roleText(cell.textContent);
      if (cell.textContent !== label) cell.textContent = label;
    });
    const status = document.querySelector('#notificationLastRefresh');
    if (status) {
      const next = status.textContent
        .replace('สถานะเป็นผลการส่ง event', 'สถานะเป็นผลการส่งแจ้งเตือน')
        .replace('อ่านแล้ว/ยังไม่อ่านอ้างอิงจาก read_at', 'สถานะการอ่านอ้างอิงจากข้อมูลการอ่าน');
      if (next !== status.textContent) status.textContent = next;
    }
  };
  const mount = () => {
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    setTimeout(apply, 300);
    setTimeout(apply, 1200);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
