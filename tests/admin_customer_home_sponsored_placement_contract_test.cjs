const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.match(source, /CUSTOMER · MEDIA PLACEMENTS/);
assert.match(source, /customer_home_sponsored/);
assert.match(source, /customer_parcel_hero/);
assert.match(source, /customer_parcel_sponsored/);
assert.match(source, /ส่งของ A → B › ภาพพื้นหลัง Hero/);
assert.match(source, /ส่งของ A → B › พื้นที่สปอนเซอร์/);
assert.match(source, /approval_status/);
assert.match(source, /starts_at/);
assert.match(source, /ends_at/);
assert.match(source, /link_url/);
assert.match(source, /data-placement-move/);
assert.match(source, /สื่อที่อนุมัติให้แสดงต้องมีรูป ลิงก์ปลายทาง และเวลาเริ่ม–สิ้นสุดที่ถูกต้อง/);
assert.match(source, /capture="environment"/);
assert.match(fs.readFileSync('shared/ap-service-mpa.js', 'utf8'), /installImageSourceChoices/);
assert.match(source, /admin_action_audit/);

console.log('admin_customer_home_sponsored_placement_contract_test: PASS');
