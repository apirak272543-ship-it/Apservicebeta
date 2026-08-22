(() => {
  'use strict';
  const exact = new Map([
    ['ดูและแก้ไขสื่อที่ใช้บนหน้า Customer แยกเป็น Logo, Background, Banner และคลังสื่อ โดยรายการเดิมแก้ไขได้ทีละรายการ', 'ดูและแก้ไขสื่อที่ใช้บนหน้าลูกค้า แยกเป็นโลโก้ ภาพพื้นหลัง แบนเนอร์ และคลังสื่อ โดยรายการเดิมแก้ไขได้ทีละรายการ'],
    ['แบรนด์หน้า Customer', 'แบรนด์หน้าลูกค้า'], ['Banner หน้า Customer', 'แบนเนอร์หน้าลูกค้า'],
    ['Logo', 'โลโก้'], ['Background', 'ภาพพื้นหลัง'], ['Banner รูปภาพ (หนึ่ง URL ต่อบรรทัด)', 'ภาพแบนเนอร์ (หนึ่งที่อยู่รูปต่อบรรทัด)'],
    ['URL เดิม (ถ้ามี)', 'ที่อยู่รูปเดิม (ถ้ามี)'], ['รูปจะถูกบีบอัด ตรวจ URL และลงทะเบียนก่อนบันทึก', 'รูปจะถูกบีบอัด ตรวจที่อยู่รูป และลงทะเบียนก่อนบันทึก'],
    ['ระบบจะใส่ URL หลังอัปโหลดและตรวจสอบแล้ว', 'ระบบจะเพิ่มที่อยู่รูปหลังอัปโหลดและตรวจสอบแล้ว'],
    ['อัปโหลดได้หลายรูป ระบบจะบีบอัดและเพิ่ม URL ที่ตรวจสอบแล้วลงในรายการ', 'อัปโหลดได้หลายรูป ระบบจะบีบอัดและเพิ่มที่อยู่รูปที่ตรวจสอบแล้วลงในรายการ'],
    ['Logo ปัจจุบัน', 'โลโก้ปัจจุบัน'], ['Background ปัจจุบัน', 'ภาพพื้นหลังปัจจุบัน'], ['ยังไม่มี Logo', 'ยังไม่มีโลโก้'], ['ยังไม่มี Background', 'ยังไม่มีภาพพื้นหลัง'], ['บันทึกแบรนด์และ Banner', 'บันทึกแบรนด์และแบนเนอร์'],
  ]);
  const translate = value => exact.get(String(value || '').trim()) || String(value || '');
  const apply = () => {
    const root = document.querySelector('[data-page-content]') || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => { if (node.parentElement?.closest('input,textarea,code,pre')) return; const next = translate(node.nodeValue); if (next !== node.nodeValue) node.nodeValue = next; });
    root.querySelectorAll('input[name="logo_url"], input[name="background_url"]').forEach(input => { input.placeholder = 'ที่อยู่รูปเดิม (ถ้ามี)'; });
    root.querySelectorAll('textarea[name="banner_urls"]').forEach(input => { input.placeholder = 'ระบบจะเพิ่มที่อยู่รูปหลังอัปโหลดและตรวจสอบแล้ว'; });
    root.querySelectorAll('img[alt="Logo ปัจจุบัน"]').forEach(image => { image.alt = 'โลโก้ปัจจุบัน'; });
    root.querySelectorAll('img[alt="Background ปัจจุบัน"]').forEach(image => { image.alt = 'ภาพพื้นหลังปัจจุบัน'; });
  };
  const mount = () => { apply(); const observer = new MutationObserver(apply); observer.observe(document.body, { childList: true, subtree: true, characterData: true }); setTimeout(apply, 300); setTimeout(apply, 1200); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
})();
