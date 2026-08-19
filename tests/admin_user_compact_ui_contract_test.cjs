const fs = require('fs');
const assert = require('assert');

const page = fs.readFileSync('admin/accounts.html', 'utf8');
const script = fs.readFileSync('admin/admin-user-compact-ui.js', 'utf8');
const styles = fs.readFileSync('admin/admin-user-compact-ui.css', 'utf8');
const runtime = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.match(page, /admin-user-compact-ui\.css/, 'Accounts page ต้องโหลด compact UI styles');
assert.match(page, /admin-user-compact-ui\.js/, 'Accounts page ต้องโหลด compact UI enhancement');
assert.match(script, /data-user-manage/, 'บัญชีต้องมีปุ่มจัดการเดียวบนรายการย่อ');
assert.match(script, /showModal\(\)/, 'จัดการบัญชีต้องเปิด action sheet เฉพาะบุคคล');
assert.match(styles, /\.admin-user-card\.is-compact dl\{display:none/, 'รายการบัญชีต้องไม่แสดงรหัส UUID หรือ metadata ยาวบนการ์ด');
assert.match(styles, /overflow-y:auto/, 'action sheet บัญชีต้องเลื่อนได้บนมือถือ');
assert.match(runtime, /update_user_profile_section/, 'การแก้ข้อมูลบัญชียังต้องผ่าน server action');
assert.match(runtime, /set_user_roles/, 'การเปลี่ยนบทบาทยังต้องผ่าน server action');
assert.match(runtime, /set_account_control/, 'การระงับและ feature controls ยังต้องผ่าน server action');
assert.match(runtime, /adjust_customer_wallet/, 'การปรับยอดลูกค้ายังต้องผ่าน server action และ ledger');

console.log('admin user compact UI contract: PASS');
