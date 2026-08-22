(() => {
  'use strict';
  const copy = '<b>การจัดการแยกตามประเภท:</b> เพิ่มผู้ดูแลและลูกค้าได้จากหน้านี้; การเพิ่ม/ผูกบัญชีร้านค้าต้องทำจาก <a href="stores.html">หน้าจัดการร้านค้า</a> และการเพิ่ม/ผูกบัญชีไรเดอร์ต้องทำจาก <a href="riders.html">หน้าจัดการไรเดอร์</a> เพื่อให้ความสัมพันธ์กับร้านหรืองานจัดส่งถูกบันทึกจากกฎกลาง';
  const apply = () => {
    document.querySelectorAll('.admin-account-flow-note').forEach(note => {
      if (note.innerHTML !== copy) note.innerHTML = copy;
    });
  };
  const mount = () => {
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(apply, 300);
    setTimeout(apply, 1200);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
