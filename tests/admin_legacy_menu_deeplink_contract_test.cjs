const fs = require('fs');
const assert = require('assert');

const runtime = fs.readFileSync('admin/admin-app.js', 'utf8');
const compatibility = fs.readFileSync('admin.html', 'utf8');
const consoleHtml = fs.readFileSync('legacy-admin-console.html', 'utf8');
const bridge = fs.readFileSync('admin-legacy-deeplink.js', 'utf8');

assert.doesNotMatch(runtime, /legacy-admin-console\.html/, 'Admin MPA ต้องไม่พาเมนูไป legacy console อีก');
assert.doesNotMatch(runtime, /\.\.\/admin\.html\?admin=/, 'Admin MPA ต้องไม่พาเมนูไป compatibility redirect');
assert.match(runtime, /ฟังก์ชันกำลังย้ายเข้า Admin App/, 'เมนูที่ยังย้ายไม่เสร็จต้องแจ้งสถานะอย่างชัดเจนแทนการพาไปเว็บอื่น');
assert.match(runtime, /async function aiWorkspace\(/, 'AI Workspace ต้องเป็น native handler ใน Admin MPA');
assert.match(runtime, /ai_workspace_threads/, 'AI Workspace native handler ต้องอ่าน workspace data โดยตรง');
assert.match(compatibility, /legacyTarget/, 'admin.html ต้องยังรักษา legacy query สำหรับ bookmark เก่า');
assert.match(compatibility, /legacy-admin-console\.html\?admin=/, 'bookmark admin.html?admin= เก่ายังเปิด console เดิมได้');
assert.match(consoleHtml, /admin-legacy-deeplink\.js/, 'legacy console เดิมต้องคง deeplink bridge สำหรับ bookmark เก่า');
assert.match(bridge, /window\.switchAdmin\(requested\)/, 'deeplink bridge ต้องเปิด section ที่ร้องขอ');

console.log('admin legacy menu deeplink contract: PASS');
