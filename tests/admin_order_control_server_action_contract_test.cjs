const assert = require('node:assert');
const fs = require('node:fs');

const source = fs.readFileSync('admin/admin-control-plane-patch.js', 'utf8');
const groupPayment = fs.readFileSync('admin/admin-checkout-group-payment.js', 'utf8');
assert.match(source, /function manageOrder\(/, 'Admin order UI must use a shared server-action helper');
assert.match(source, /action: 'manage_delivery_order'/, 'Admin must invoke the allow-listed Order Control Plane action');
assert.match(source, /manageOrder\(order, 'items'/, 'item edits must not write direct REST mutations');
assert.match(source, /manageOrder\(order, 'assign_rider'/, 'Rider assignment must not write direct REST mutations');
assert.match(source, /manageOrder\(order, 'status'/, 'status changes must not write direct REST mutations');
assert.match(source, /เปลี่ยนสถานะตามขั้นตอนที่ได้รับอนุญาต/, 'Order hero must explain permitted workflow in Thai');
assert.doesNotMatch(source, /เปลี่ยนสถานะผ่าน Shared Core/, 'Order hero must not expose implementation terminology');
assert.match(groupPayment, /บันทึกผลให้ทุกออร์เดอร์ในกลุ่มพร้อมกัน/, 'Group-payment explanation must describe the business outcome in Thai');
assert.doesNotMatch(groupPayment, /payment record.*ผ่าน server/, 'Group-payment explanation must not expose implementation terminology');
console.log('admin_order_control_server_action_contract_test: PASS');
