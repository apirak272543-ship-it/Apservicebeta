(() => {
  'use strict';
  const exact = new Map([
    ['GOVERNANCE', 'การกำกับดูแล'],
    ['Audit Log การ Override', 'ประวัติการปรับแก้'],
    ['ประวัติการแก้ปัญหาโดย Admin ที่ค้นย้อนกลับได้ พร้อมเหตุผล หลักฐาน และลิงก์ไปยังข้อมูลที่เกี่ยวข้อง', 'ประวัติการปรับแก้โดยผู้ดูแลที่ค้นย้อนกลับได้ พร้อมเหตุผล หลักฐาน และลิงก์ไปยังข้อมูลที่เกี่ยวข้อง'],
    ['ประเภท action', 'ประเภทการดำเนินการ'],
    ['ตัวอย่าง: wallet_adjusted', 'ตัวอย่าง: ปรับยอดกระเป๋าเงิน'],
    ['กำลังโหลด Audit Log…', 'กำลังโหลดประวัติการดำเนินการ…'],
    ['Admin', 'ผู้ดูแล'],
    ['Action', 'การดำเนินการ'],
    ['ไม่พบ Audit Log ตามตัวกรองที่เลือก', 'ไม่พบประวัติการดำเนินการตามตัวกรองที่เลือก'],
    ['โหลด Audit Log ไม่สำเร็จ', 'โหลดประวัติการดำเนินการไม่สำเร็จ'],
  ]);
  const actions = {
    customer_wallet_adjusted: 'ปรับยอดกระเป๋าเงินลูกค้า',
    user_profile_identity_updated: 'แก้ไขชื่อและรหัสเข้าสู่ระบบ',
    user_profile_contact_updated: 'แก้ไขข้อมูลติดต่อ',
    user_profile_auth_updated: 'แก้ไขอีเมลหรือรหัสผ่าน',
    user_roles_updated: 'แก้ไขบทบาทบัญชี',
    account_control_updated: 'แก้ไขสิทธิ์หรือสถานะบัญชี',
    account_suspended: 'ระงับบัญชี',
    account_reactivated: 'เปิดใช้งานบัญชี',
    provision_store_owner: 'สร้างร้านค้าและบัญชีเจ้าของร้าน',
    reset_rider_password: 'ตั้งรหัสผ่านไรเดอร์ใหม่',
  };
  const translateText = value => exact.get(String(value || '').trim()) || String(value || '');
  const apply = () => {
    const page = document.querySelector('[data-page-content]') || document.body;
    const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT); const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const parent = node.parentElement;
      if (parent?.closest('input,textarea,code,pre')) return;
      const next = translateText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
    document.querySelectorAll('#auditAction').forEach(input => { input.placeholder = 'ตัวอย่าง: ปรับยอดกระเป๋าเงิน'; });
    document.querySelectorAll('#auditLogRows .mpa-badge').forEach(badge => {
      const label = actions[String(badge.textContent || '').trim()];
      if (label && badge.textContent !== label) badge.textContent = label;
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
