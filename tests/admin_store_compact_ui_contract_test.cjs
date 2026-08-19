const fs = require('fs');
const assert = require('assert');

const page = fs.readFileSync('admin/stores.html', 'utf8');
const script = fs.readFileSync('admin/admin-store-compact-ui.js', 'utf8');
const styles = fs.readFileSync('admin/admin-store-compact-ui.css', 'utf8');

assert.match(page, /admin-store-compact-ui\.css/, 'หน้าร้าน Admin ต้องโหลด style สำหรับรายการย่อ');
assert.match(page, /admin-store-compact-ui\.js/, 'หน้าร้าน Admin ต้องโหลด action sheet enhancement');
assert.match(script, /store_categories\?select=id,name,icon/, 'ตัวกรองต้องใช้หมวดประเภทร้านจาก backend กลาง');
assert.match(script, /data-store-manage/, 'การ์ดร้านต้องเปิด action sheet แทนแสดงทุกปุ่มพร้อมกัน');
assert.match(script, /action: 'update_store_section'.*category_id/s, 'การเปลี่ยนประเภทร้านต้องผ่าน role-access server action');
assert.match(script, /showModal\(\)/, 'action sheet ต้องเป็นป๊อปอัปบนบริบทของร้านที่เลือก');
assert.match(styles, /overflow-y:auto/, 'action sheet ต้องเลื่อนแนวตั้งบนมือถือได้');
assert.match(styles, /@media\(max-width:760px\)/, 'Store compact UI ต้องมี mobile layout');

console.log('admin store compact UI contract: PASS');
