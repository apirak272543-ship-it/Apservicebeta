(() => {
  'use strict';
  const exact = new Map([
    ['AI Collaboration Workspace', 'ศูนย์บริบทงาน AI'],
    ['สร้างบริบทงาน เก็บข้อความ และติดตามงานโดยไม่ออกจาก Admin Application', 'สร้างบริบทงาน เก็บข้อความ และติดตามงานจากศูนย์ผู้ดูแล'],
    ['กำลังโหลดพื้นที่ทำงาน AI…', 'กำลังโหลดศูนย์บริบทงาน AI…'],
    ['โหลด AI Workspace ไม่สำเร็จ', 'โหลดศูนย์บริบทงาน AI ไม่สำเร็จ'],
    ['โหลดรายละเอียด AI Workspace ไม่สำเร็จ', 'โหลดรายละเอียดบริบทงาน AI ไม่สำเร็จ'],
    ['open', 'เปิดอยู่'],
    ['draft', 'ฉบับร่าง'],
    ['owner', 'ผู้ดูแล'],
    ['instruction', 'คำสั่งงาน'],
  ]);
  const translate = value => exact.get(String(value || '').trim()) || String(value || '');
  const apply = () => {
    const page = document.querySelector('[data-page-content]') || document.body;
    const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT); const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const parent = node.parentElement;
      if (parent?.closest('input,textarea,code,pre')) return;
      const next = translate(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  };
  const mount = () => {
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    setTimeout(apply, 300); setTimeout(apply, 1200);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
})();
