const fs = require('fs');
const assert = require('assert');

const override = fs.readFileSync('admin/admin-override-governance.js', 'utf8');
const audit = fs.readFileSync('admin/admin-audit-log.js', 'utf8');
const runtime = fs.readFileSync('admin/admin-app.js', 'utf8');
const orders = fs.readFileSync('admin/admin-control-plane-patch.js', 'utf8');
const payment = fs.readFileSync('admin/admin-checkout-group-payment.js', 'utf8');
const auditHtml = fs.readFileSync('admin/audit-log.html', 'utf8');

for (const token of ['MIN_REASON = 10', 'uploadPrivateImage', "bucket: 'admin-override-evidence'", 'collect(root, id, summary)', 'ยืนยันดำเนินการทันทีหรือไม่?', 'enhanceAccountModal', 'form.requestSubmit()']) assert.ok(override.includes(token), `missing reusable override token: ${token}`);
for (const token of ['admin_list_override_audit', 'createSignedImageUrl', 'data-audit-evidence']) assert.ok(audit.includes(token), `missing audit log token: ${token}`);
for (const token of ["['audit-log','Audit Log','legacy']", "'audit-log': () => window.APServiceAdminAuditLog?.mount?.() || login()"] ) assert.ok(runtime.includes(token), `missing audit route token: ${token}`);
for (const token of ["override().fields('order-items'", "override().fields('cancellation'", "override().fields('rider-assignment'", "override().fields('order-status'", 'evidence_path: evidencePath || \'\'']) assert.ok(orders.includes(token), `missing order governance token: ${token}`);
for (const token of ["APServiceAdminOverride.collect", 'p_evidence_path: governance.evidencePath || null']) assert.ok(payment.includes(token), `missing payment governance token: ${token}`);
assert.ok(auditHtml.includes('admin-audit-log.js') && auditHtml.includes('admin-override-governance.js'), 'audit page must load governance dependencies');
console.log('Admin override governance UI contract passed');
