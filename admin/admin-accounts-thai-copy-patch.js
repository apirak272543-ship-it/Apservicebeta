(() => {
  'use strict';

  const exact = new Map([
    ['Login ID', 'รหัสเข้าสู่ระบบ'],
    ['Admin', 'ผู้ดูแล'],
    ['Rider', 'ไรเดอร์'],
    ['Merchant', 'ร้านค้า'],
    ['Customer', 'ลูกค้า'],
    ['customer', 'ลูกค้า'],
    ['rider', 'ไรเดอร์'],
    ['store_owner', 'เจ้าของร้าน'],
    ['admin', 'ผู้ดูแล'],
    ['Account Control Plane', 'ข้อมูลบัญชี'],
    ['audit log', 'ประวัติการดำเนินการ'],
  ]);

  const translateText = value => {
    let next = String(value ?? '');
    exact.forEach((thai, english) => { next = next.replaceAll(english, thai); });
    return next
      .replace(/\bkey สำคัญ/g, 'ข้อมูลสำคัญ')
      .replace(/\bserver\b/g, 'ระบบ')
      .replace(/\bworkflow\b/g, 'ขั้นตอนการดำเนินงาน')
      .replace(/\brole\b/g, 'บทบาท');
  };

  const localize = root => {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const translated = translateText(node.nodeValue);
      if (translated !== node.nodeValue) node.nodeValue = translated;
    });
    root.querySelectorAll?.('input[placeholder]').forEach(input => {
      const translated = translateText(input.placeholder);
      if (translated !== input.placeholder) input.placeholder = translated;
    });
  };

  const mount = () => {
    localize(document.body);
    const observer = new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'characterData') localize(record.target.parentElement);
        record.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE) localize(node); });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
