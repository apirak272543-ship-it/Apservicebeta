const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.match(source, /CUSTOMER HOME · SPONSORED PLACEMENT/);
assert.match(source, /พื้นที่สปอนเซอร์แทนร้านค้ายอดนิยม/);
assert.match(source, /placement: 'customer_home_sponsored'/);
assert.match(source, /approval_status/);
assert.match(source, /starts_at/);
assert.match(source, /ends_at/);
assert.match(source, /link_url/);
assert.match(source, /data-sponsored-move/);
assert.match(source, /โฆษณาที่อนุมัติให้แสดงต้องมีรูป ลิงก์ปลายทาง และเวลาเริ่ม–สิ้นสุดที่ถูกต้อง/);
assert.match(source, /admin_action_audit/);

console.log('admin_customer_home_sponsored_placement_contract_test: PASS');
