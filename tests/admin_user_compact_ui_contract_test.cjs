const fs = require('fs');
const assert = require('assert');

const page = fs.readFileSync('admin/accounts.html', 'utf8');
const styles = fs.readFileSync('admin/admin-accounts.css', 'utf8');
const runtime = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.doesNotMatch(page, /admin-user-compact-ui\.(css|js)/, 'Accounts page ต้องไม่โหลด compact overlay เดิม');
assert.doesNotMatch(page, /admin-accounts-(thai|workflow|action)-copy-patch\.js/, 'Accounts page ต้องไม่โหลด copy patch ซ้ำ');
assert.match(runtime, /data-user-manage/, 'บัญชีต้องมีปุ่มจัดการเดียวจาก source หลัก');
assert.match(runtime, /data-account-menu-action/, 'จัดการบัญชีต้องเปิด action menu จาก source หลัก');
assert.match(runtime, /openAccountActionMenu/, 'action menu ต้องอยู่ใน renderer หลัก ไม่ใช่ runtime overlay');
assert.match(styles, /\.admin-account-action-menu/, 'action menu ต้องใช้ CSS ใน stylesheet Accounts หลัก');
assert.match(styles, /@media\(max-width:760px\)/, 'Accounts ต้องมี responsive source style สำหรับมือถือ');
assert.match(runtime, /update_user_profile_section/, 'การแก้ข้อมูลบัญชียังต้องผ่าน server action');
assert.match(runtime, /set_user_roles/, 'การเปลี่ยนบทบาทยังต้องผ่าน server action');
assert.match(runtime, /set_account_control/, 'การระงับและ feature controls ยังต้องผ่าน server action');
assert.match(runtime, /adjust_customer_wallet/, 'การปรับยอดลูกค้ายังต้องผ่าน server action และ ledger');

console.log('admin account source UI contract: PASS');
