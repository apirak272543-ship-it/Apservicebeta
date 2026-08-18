const fs = require('fs');
const assert = require('assert');

const runtime = fs.readFileSync('admin/admin-app.js', 'utf8');
const compatibility = fs.readFileSync('admin.html', 'utf8');
const consoleHtml = fs.readFileSync('legacy-admin-console.html', 'utf8');
const bridge = fs.readFileSync('admin-legacy-deeplink.js', 'utf8');

assert.match(runtime, /\.\.\/legacy-admin-console\.html\?admin=\$\{encodeURIComponent\(key\)\}/, 'เมนู legacy ต้องชี้ไป console ที่ใช้งานได้ ไม่ใช่ compatibility redirect');
assert.match(compatibility, /legacyTarget/, 'admin.html ต้องรักษา legacy query จาก bookmark เก่า');
assert.match(compatibility, /legacy-admin-console\.html\?admin=/, 'admin.html?admin= ต้องเปิด console เดิมพร้อม query');
assert.match(consoleHtml, /admin-legacy-deeplink\.js/, 'legacy console ต้องโหลด deeplink bridge');
assert.match(bridge, /window\.switchAdmin\(requested\)/, 'deeplink bridge ต้องเปิด section ที่ร้องขอ');
assert.match(bridge, /'ai-workspace'/, 'deeplink bridge ต้องรองรับ AI Workspace');
assert.match(runtime, /legacy-admin-console\.html\?admin=ai-workspace/, 'AI Workspace MPA ต้องเปิด workspace จริง ไม่ใช่กลับ dashboard');

console.log('admin legacy menu deeplink contract: PASS');
