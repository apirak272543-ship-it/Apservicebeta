const fs = require('fs');
const assert = require('assert');
const source = fs.readFileSync('admin/admin-control-plane-completeness.js', 'utf8');

assert.match(source, /openStoreGp/, 'Admin ต้องมี action sheet GP history');
assert.match(source, /store_gp_rate_history/, 'Admin ต้องแสดงประวัติ GP');
assert.match(source, /update_store_gp_rate/, 'Admin ต้องสั่งเปลี่ยน GP ผ่าน server action');
assert.match(source, /GP ใหม่ใช้กับ settlement ที่สร้างหลังจากเปลี่ยนเท่านั้น/, 'UI ต้องบอกขอบเขตไม่ย้อนแก้ settlement เดิม');
assert.match(source, /\['gp', 'GP\/ประวัติอัตรา'\]/, 'Store card ต้องมีปุ่ม GP history');
console.log('admin store GP history contract: PASS');
