const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const operations = fs.readFileSync('admin/operations.html', 'utf8');
const workspace = fs.readFileSync('admin/ai-workspace.html', 'utf8');
const styles = fs.readFileSync('admin/admin-management.css', 'utf8');

assert.match(admin, /async function operationsV2\(/, 'Operations ต้องมี handler เฉพาะสำหรับ user directory');
assert.match(admin, /feature !== 'admins'/, 'Operations handler ต้องคง route อื่นเดิมไว้และแยกเฉพาะ user directory');
assert.match(admin, /list_user_control_plane/, 'user directory ต้องโหลดข้อมูลจาก server control plane');
assert.match(admin, /update_user_profile_section/, 'user directory ต้องแก้ข้อมูลแบบแยกหมวด');
assert.match(admin, /set_user_roles/, 'user directory ต้องจัดการบทบาทผ่าน server action');
assert.match(admin, /set_account_control/, 'user directory ต้องจัดการสถานะและ feature permission ผ่าน server action');
assert.match(admin, /adjust_customer_wallet/, 'user directory ต้องปรับยอดผ่าน immutable wallet ledger action');
assert.match(admin, /create_managed_account/, 'user directory ต้องสร้างบัญชี Admin/Customer ผ่าน server action');
assert.match(admin, /id="userSearch"/, 'user directory ต้องมีช่องค้นหา');
assert.match(admin, /data-user-role/, 'user directory ต้องมีตัวกรองบทบาท');
assert.match(admin, /admin-user-card/, 'user directory ต้องใช้ card ที่อ่านง่ายแทนตารางแคบบนมือถือ');
assert.match(admin, /cash_on_delivery/, 'user directory ต้องมี control สำหรับสิทธิ์ COD');
assert.match(admin, /admin-workspace-layout/, 'AI Workspace ต้องใช้ layout class แบบ responsive');
assert.doesNotMatch(admin, /grid-template-columns:minmax\(240px,\.75fr\) minmax\(0,1\.5fr\)/, 'AI Workspace ต้องไม่ฝัง desktop grid inline');
assert.match(styles, /\.admin-workspace-layout/, 'ต้องมี responsive workspace layout');
assert.match(styles, /\.admin-role-editor/, 'Account Control Plane ต้องมี role/permission controls ที่อ่านง่าย');
assert.match(styles, /@media\(max-width:760px\).*\.admin-workspace-layout\{grid-template-columns:1fr\}/s, 'AI Workspace ต้องเปลี่ยนเป็นคอลัมน์เดียวบนมือถือ');
assert.match(operations, /admin-management\.css/, 'Operations route ต้องโหลด management styles');
assert.match(workspace, /admin-management\.css/, 'AI Workspace route ต้องโหลด management styles');

console.log('admin user directory and mobile layout contract: PASS');
