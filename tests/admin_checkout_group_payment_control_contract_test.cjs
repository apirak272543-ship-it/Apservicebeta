const fs = require('fs');
const assert = require('assert');
const page = fs.readFileSync('admin/orders.html', 'utf8');
const control = fs.readFileSync('admin/admin-checkout-group-payment.js', 'utf8');

assert.match(page, /admin-checkout-group-payment\.js/, 'หน้า Admin Orders ต้องโหลด group payment control');
assert.match(control, /checkout_group_payments\?select=/, 'ต้องโหลดเฉพาะ payment group ที่รอตรวจ');
assert.match(control, /status=eq\.under_review/, 'ต้องแสดงเฉพาะสลิปที่อยู่ในคิวพิจารณา');
assert.match(control, /rpc\/admin_review_checkout_group_payment/, 'ต้องตัดสินผ่าน server RPC');
assert.match(control, /p_idempotency_key/, 'การตัดสินต้องมี idempotency key');
assert.match(control, /mpa-modal-backdrop/, 'การตัดสินต้องเปิดเป็น action sheet');
assert.match(control, /APServiceAdminOverride\.collect/, 'ต้องรวบรวมเหตุผลและหลักฐานผ่าน governance control ก่อนบันทึกผล');
assert.match(control, /p_reason: governance\.reason/, 'ต้องส่งเหตุผลที่ผ่าน governance control ไปยัง server RPC');
assert.doesNotMatch(control, /delivery_orders\?id=eq.*method: 'PATCH'/, 'ห้ามแก้ payment status ผ่าน client direct patch');
console.log('admin checkout group payment control contract: PASS');
