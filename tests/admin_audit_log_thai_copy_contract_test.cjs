const fs = require('fs');
const source = fs.readFileSync('admin/admin-audit-log-thai-copy-patch.js', 'utf8');
const entrypoint = fs.readFileSync('admin/audit-log.html', 'utf8');
for (const snippet of ['การกำกับดูแล', 'ประวัติการปรับแก้', 'ประเภทการดำเนินการ', 'ตัวอย่าง: ปรับยอดกระเป๋าเงิน', 'customer_wallet_adjusted', 'rider_password_reset', 'store_password_reset', 'managed_account_created', 'order_dispatch_updated']) {
  if (!source.includes(snippet)) throw new Error(`Missing Audit Log Thai copy: ${snippet}`);
}
if (!entrypoint.includes('admin-audit-log-thai-copy-patch.js?v=audit-thai-v2-actions')) throw new Error('Audit Log entrypoint must load current Thai copy patch');
console.log('admin_audit_log_thai_copy_contract_test: PASS');
