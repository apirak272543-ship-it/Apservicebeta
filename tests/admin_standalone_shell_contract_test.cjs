const fs = require('fs');
const assert = require('assert');

const login = fs.readFileSync('admin/index.html', 'utf8');
const dashboard = fs.readFileSync('admin/dashboard.html', 'utf8');
const runtime = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.match(login, /<title>AP Service \| Admin/, 'Admin login shell ต้องมีชื่อหน้าที่ถูกต้อง');
assert.match(login, /data-page="login"/, 'Admin login ต้องเป็น route จริงของ MPA');
assert.match(dashboard, /data-page="dashboard"/, 'Admin dashboard ต้องเป็น route จริงของ MPA');
assert.match(login, /\.\.\/shared\/ap-service-core\.js/, 'Admin shell ต้องโหลด Shared Core');
assert.match(login, /\.\.\/shared\/ap-service-mpa\.js/, 'Admin shell ต้องโหลด Shared MPA runtime');
assert.match(login, /admin-app\.js/, 'Admin shell ต้องโหลด Admin application runtime');
assert.match(runtime, /M\.auth\.requireRole\('admin'/, 'ทุก Admin-native route ต้องใช้ Supabase role gate');
assert.match(runtime, /M\.auth\.rolesFor\(session\.user\.id\)/, 'การเข้าสู่ระบบต้องตรวจ role ของผู้ใช้จากระบบกลาง');
assert.doesNotMatch(runtime, /apcx_user|apcx_admins/, 'Admin MPA ต้องไม่ใช้ localStorage เป็น security boundary');
assert.doesNotMatch(runtime, /legacy-admin-console\.html/, 'Admin MPA shell ต้องไม่พา navigation ไป legacy console');

console.log('admin standalone shell contract: PASS');
