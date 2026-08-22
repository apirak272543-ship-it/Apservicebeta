(() => {
  'use strict';
  const exact = new Map([
    ['เลือกโทนที่สบายตาสำหรับการใช้งาน Admin เป็นเวลานาน ค่านี้บันทึกไว้ในอุปกรณ์นี้', 'เลือกโทนที่สบายตาสำหรับการใช้งานของผู้ดูแลเป็นเวลานาน ค่านี้บันทึกไว้ในอุปกรณ์นี้'],
    ['ค่าทดสอบเริ่มต้นแยก Food, Parcel และ Errand อยู่ในกติกากลางเท่านั้น คุณปรับเปลี่ยนภายหลังได้โดยไม่แก้แอป กฎด้านการเงินยังถูกคำนวณและบังคับใช้ฝั่ง server/RLS', 'ค่าเริ่มต้นของอาหาร ส่งของ A→B และงานรับส่งอยู่ในกติกากลาง คุณปรับเปลี่ยนภายหลังได้โดยไม่แก้แอป ส่วนกฎด้านการเงินจะคำนวณและบังคับใช้โดยระบบส่วนกลาง'],
    ['Food ถูกนำไปคำนวณ checkout แล้ว ส่วน Parcel และ Errand เตรียมไว้ให้ตั้งค่าอิสระก่อนเปิดใช้บริการนั้น ส่วน GP ให้กำหนดแยกตามข้อตกลงของแต่ละร้านที่เมนู ร้านค้า', 'อาหารถูกนำไปคำนวณในขั้นตอนสรุปคำสั่งซื้อแล้ว ส่วนส่งของ A→B และงานรับส่งเตรียมไว้ให้ตั้งค่าแยกก่อนเปิดใช้บริการนั้น ส่วน GP ให้กำหนดตามข้อตกลงของแต่ละร้านที่เมนูร้านค้า'],
    ['Food Delivery', 'ส่งอาหาร'],
    ['Parcel Delivery', 'ส่งของ A→B'],
    ['Errand / ฝากซื้อ', 'งานรับส่ง / ฝากซื้อ'],
    ['Key', 'รายการตั้งค่า'],
    ['Value (JSON)', 'รายละเอียดการตั้งค่า'],
  ]);
  const translate = value => {
    const raw = String(value ?? '');
    if (exact.has(raw.trim())) return raw.replace(raw.trim(), exact.get(raw.trim()));
    return raw.replace(/\bAdmin\b/g, 'ผู้ดูแล').replace(/\bserver\/RLS\b/g, 'ระบบส่วนกลาง');
  };
  const apply = root => {
    const section = root?.querySelector?.('#settings') || (root?.id === 'settings' ? root : document.querySelector('#settings'));
    if (!section) return;
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const parent = node.parentElement;
      if (parent?.closest('textarea,code,pre')) return;
      const next = translate(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  };
  const mount = () => {
    apply(document);
    const observer = new MutationObserver(() => apply(document));
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => apply(document), 300);
    setTimeout(() => apply(document), 1200);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
