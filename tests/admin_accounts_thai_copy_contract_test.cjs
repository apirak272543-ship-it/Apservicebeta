const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('admin/admin-app.js', 'utf8');
const entrypoint = fs.readFileSync('admin/accounts.html', 'utf8');

for (const [english, thai] of [['customer', 'ลูกค้า'], ['rider', 'ไรเดอร์'], ['store_owner', 'เจ้าของร้าน'], ['admin', 'ผู้ดูแล']]) {
  assert.match(source, new RegExp(`${english}: '${thai}'`), `Missing Account role localization: ${english}`);
}
assert.match(source, /รหัสเข้าสู่ระบบ/, 'Account source must use Thai Login ID wording');
assert.match(source, /ข้อมูลสำคัญ/, 'Account source must use Thai sensitive-data wording');
assert.match(source, /การเพิ่ม\/ผูกบัญชีไรเดอร์ต้องทำจาก/, 'Workflow copy must describe the Rider management destination once');
assert.match(source, /href="riders\.html"/, 'Workflow copy must preserve Rider management href');
assert.match(source, /หน้าจัดการร้านค้า/, 'Workflow copy must describe the Store management destination');
assert.doesNotMatch(entrypoint, /admin-accounts-(thai|workflow|action)-copy-patch\.js/, 'Accounts entrypoint must not load copy patches');
assert.match(source, /ชื่อและรหัสเข้าสู่ระบบ/, 'Deep identity action must use Thai login wording');

console.log('admin_accounts_thai_copy_contract_test: PASS');
