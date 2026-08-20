(() => {
  'use strict';
  const M = window.APServiceMPA;
  if (!M || document.body.dataset.page !== 'orders') return;

  const esc = value => M.ui.escapeHtml(String(value ?? ''));
  const notice = (message, type) => M.ui.setNotice(message, type);
  const modal = (title, body) => {
    const node = document.createElement('div');
    node.className = 'mpa-modal-backdrop';
    node.innerHTML = `<section class="mpa-card mpa-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mpa-page-head"><h2 style="margin:0">${esc(title)}</h2><button class="mpa-button mpa-button-secondary" type="button" data-close>ปิด</button></div>${body}</section>`;
    document.body.append(node);
    const close = () => node.remove();
    node.querySelectorAll('[data-close]').forEach(button => { button.onclick = close; });
    return { node, close };
  };

  async function loadPending() {
    const payments = await M.request('checkout_group_payments?select=checkout_group_id,expected_amount,status,slip_path,created_at&status=eq.under_review&order=created_at.desc&limit=50', { private: true, forceFresh: true });
    return payments || [];
  }

  async function review(payment) {
    const groups = await M.request(`checkout_groups?select=id,order_count,payable_amount,payment_status&id=eq.${encodeURIComponent(payment.checkout_group_id)}&limit=1`, { private: true, forceFresh: true });
    const group = groups?.[0];
    if (!group) throw new Error('ไม่พบกลุ่มคำสั่งซื้อที่ต้องตรวจสอบ');
    const body = `<dl class="admin-withdrawal-review-grid"><div><dt>กลุ่มคำสั่งซื้อ</dt><dd>${esc(group.id)}</dd></div><div><dt>จำนวนร้าน/ออร์เดอร์</dt><dd>${esc(group.order_count || 0)} รายการ</dd></div><div><dt>ยอดที่ต้องตรวจ</dt><dd>${esc(M.ui.baht(payment.expected_amount ?? group.payable_amount))}</dd></div><div><dt>สถานะปัจจุบัน</dt><dd>${esc(payment.status)}</dd></div><div style="grid-column:1/-1"><dt>สลิปส่วนตัว</dt><dd>${esc(payment.slip_path || '-')}</dd></div></dl><label class="mpa-field"><span>ผลพิจารณา</span><select id="groupPaymentDecision"><option value="verify">ยืนยันการชำระเงิน</option><option value="reject">ปฏิเสธและแจ้งให้ลูกค้าแก้ไข</option></select></label><label class="mpa-field"><span>เหตุผลผลพิจารณา</span><textarea id="groupPaymentReason" rows="3" required placeholder="ลูกค้าจะเห็นเหตุผลนี้ในสถานะการชำระเงิน"></textarea></label><div class="admin-modal-actions"><button class="mpa-button mpa-button-secondary" type="button" data-close>ยกเลิก</button><button class="mpa-button" type="button" id="saveGroupPaymentReview">บันทึกผล</button></div>`;
    const dialog = modal('ตรวจการชำระเงินกลุ่มคำสั่งซื้อ', body);
    dialog.node.querySelector('#saveGroupPaymentReview').onclick = async () => {
      const decision = dialog.node.querySelector('#groupPaymentDecision').value;
      const reason = dialog.node.querySelector('#groupPaymentReason').value.trim();
      if (reason.length < 3) return notice('กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร', 'error');
      const button = dialog.node.querySelector('#saveGroupPaymentReview');
      button.disabled = true;
      try {
        await M.request('rpc/admin_review_checkout_group_payment', { method: 'POST', private: true, body: JSON.stringify({ p_checkout_group_id: group.id, p_decision: decision, p_reason: reason, p_idempotency_key: `admin-group-payment-${crypto.randomUUID()}` }) });
        notice(decision === 'verify' ? 'ยืนยันการชำระเงินทั้งกลุ่มแล้ว' : 'ปฏิเสธสลิปและแจ้งลูกค้าแล้ว');
        dialog.close();
        window.dispatchEvent(new CustomEvent('apservice:checkout-group-payment-reviewed'));
        await enhance();
      } catch (error) {
        button.disabled = false;
        notice(error.message || 'ไม่สามารถบันทึกผลการตรวจสอบได้', 'error');
      }
    };
  }

  async function enhance() {
    const host = document.querySelector('#orders');
    if (!host) return;
    const old = document.querySelector('#checkoutGroupPaymentQueue');
    old?.remove();
    let payments;
    try { payments = await loadPending(); } catch (_) { return; }
    const queue = document.createElement('section');
    queue.id = 'checkoutGroupPaymentQueue';
    queue.className = 'mpa-card';
    queue.style.marginBottom = '16px';
    queue.innerHTML = `<div class="mpa-page-head"><div><h2 style="margin:0">การชำระเงินกลุ่มคำสั่งซื้อ</h2><p class="mpa-muted">ตรวจสลิปหนึ่งครั้งต่อกลุ่ม แล้วระบบอัปเดต payment record ของทุกออร์เดอร์ในกลุ่มผ่าน server</p></div><span class="mpa-badge">รอตรวจ ${payments.length}</span></div>${payments.length ? `<div class="mpa-table-wrap"><table class="mpa-table"><thead><tr><th>เวลา</th><th>กลุ่ม</th><th>ยอด</th><th></th></tr></thead><tbody>${payments.map(payment => `<tr><td>${new Date(payment.created_at).toLocaleString('th-TH')}</td><td>${esc(payment.checkout_group_id)}</td><td>${esc(M.ui.baht(payment.expected_amount))}</td><td><button class="mpa-button" type="button" data-group-payment-review="${esc(payment.checkout_group_id)}">ตรวจสลิป</button></td></tr>`).join('')}</tbody></table></div>` : `<p class="mpa-muted" style="margin-bottom:0">ไม่มีสลิปกลุ่มคำสั่งซื้อที่รอตรวจ</p>`}`;
    host.parentElement?.insertBefore(queue, host);
    queue.querySelectorAll('[data-group-payment-review]').forEach(button => {
      button.onclick = () => review(payments.find(payment => payment.checkout_group_id === button.dataset.groupPaymentReview)).catch(error => notice(error.message || 'โหลดข้อมูลกลุ่มคำสั่งซื้อไม่สำเร็จ', 'error'));
    });
  }

  const observer = new MutationObserver(() => requestAnimationFrame(enhance));
  observer.observe(document.body, { childList: true, subtree: true });
  enhance();
  addEventListener('apservice:checkout-group-payment-reviewed', enhance);
  addEventListener('pagehide', () => observer.disconnect(), { once: true });
})();
