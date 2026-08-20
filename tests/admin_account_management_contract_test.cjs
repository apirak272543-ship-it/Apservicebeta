const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const accounts = fs.readFileSync('admin/accounts.html', 'utf8');
const profile = fs.readFileSync('admin/profile.html', 'utf8');
const styles = fs.readFileSync('admin/admin-accounts.css', 'utf8');

assert.match(admin, /accounts:\s*\(\)\s*=>\s*operationsV2\('admins'\)/, 'accounts.html ต้อง dispatch เข้า Account Control Plane แทน login fallback');
assert.match(admin, /async function operationsV2\(defaultFeature = 'rider-applications'\)/, 'Account Control Plane ต้องรับ default feature สำหรับ route Accounts');
assert.match(admin, /\['admin','Admin'\],\['customer','ลูกค้า'\],\['store_owner','ร้านค้า'\],\['rider','Rider'\]/, 'ต้องมีเมนูรองแยก Admin, ลูกค้า, ร้านค้า และ Rider');
assert.match(admin, /action: 'list_user_control_plane'/, 'Account Management ต้องอ่านข้อมูลจริงจาก central control plane');
assert.match(admin, /action: 'create_managed_account'/, 'ต้องสร้างบัญชี Admin/Customer ผ่าน central access function');
assert.match(admin, /action: 'set_user_roles'/, 'ต้องแก้ role ผ่าน central access function');
assert.match(admin, /action: 'set_account_control'/, 'ต้องจัดการสถานะ/สิทธิ์ผ่าน central access function');
assert.match(admin, /action: 'adjust_customer_wallet'/, 'การปรับยอด wallet ต้องผ่าน audit-capable central access function');
assert.match(admin, /href="stores\.html"/, 'บัญชีร้านค้าต้องเชื่อมไปยัง Store Control Plane');
assert.match(admin, /href="riders\.html"/, 'บัญชี Rider ต้องเชื่อมไปยัง Rider Control Plane');
assert.match(accounts, /data-page="accounts"/, 'Accounts route ต้องคงเป็น MPA route เดิม');
assert.match(accounts, /admin-accounts\.css\?v=accounts-v1/, 'Accounts route ต้องโหลด style เมนูรองเฉพาะหน้า');
assert.match(accounts, /admin-app\.js\?v=admin-management-v8/, 'Accounts route ต้อง cache-bust runtime Governance ใหม่');
assert.match(profile, /data-page="accounts"/, 'profile route เดิมต้องเปิด Account Control Plane แทนหน้า 404');
assert.match(profile, /admin-app\.js\?v=admin-management-v8/, 'profile route ต้องโหลด runtime Governance เวอร์ชันเดียวกับ Accounts');
assert.match(styles, /\.admin-account-type-menu/, 'ต้องมี responsive style ของเมนูประเภทบัญชี');
assert.match(styles, /@media\(max-width:760px\)/, 'Accounts sub-menu ต้องรองรับหน้าจอมือถือ');

console.log('admin account management contract: PASS');
