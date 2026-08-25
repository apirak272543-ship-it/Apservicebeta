const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const page = read('admin/creator-hub.html');
const script = read('admin/creator-hub.js');
const style = read('admin/creator-hub.css');
const adminApp = read('admin/admin-app.js');

assert.match(page, /data-page="creator-hub"/, 'Creator Hub ต้องมี page identity');
assert.match(page, /creator-hub\.css/, 'Creator Hub ต้องโหลด stylesheet ของตัวเอง');
assert.match(page, /creator-hub\.js/, 'Creator Hub ต้องโหลด script ของตัวเอง');
assert.ok(page.indexOf('creator-hub.js') < page.indexOf('admin-app.js'), 'Creator Hub patch ต้องโหลดก่อน admin-app dispatcher');
assert.match(adminApp, /\['creator-hub','Creator Hub','creator'\]/, 'Admin navigation ต้องมี Creator Hub');
assert.match(adminApp, /creator-hub/, 'Admin app ต้องรู้จัก Creator Hub route');
assert.match(script, /gate\('creator-hub'/, 'Creator Hub ต้องตรวจ role ผ่าน Admin gate');
assert.match(script, /private: true/, 'Creator Hub requests ต้องเป็น private requests');
for (const table of ['creators', 'creator_campaigns', 'creator_campaign_stores', 'creator_content_rights', 'creator_referral_sessions', 'creator_order_attributions', 'creator_commissions']) {
  assert.match(script, new RegExp(table), `Creator Hub ต้องใช้ตาราง ${table} ที่ตรวจพบจริง`);
}
assert.match(script, /status: data\.status/, 'Creator status update ต้องส่งสถานะจาก form');
assert.match(script, /creator_commissions\?id=eq\./, 'Commission action ต้องเจาะจง record ด้วย id');
assert.match(script, /creator_content_rights\?id=eq\./, 'Content review ต้องเจาะจง record ด้วย id');
assert.match(script, /creator_campaign_stores\?campaign_id=eq\./, 'Campaign store mapping ต้องลบ/เขียนด้วย campaign id');
assert.doesNotMatch(`${page}\n${script}\n${style}`, /service_role|GEMINI_API_KEY|DROP TABLE|ALTER ROLE/i, 'ห้ามมี secret หรือ destructive SQL ใน Admin feature');
assert.match(style, /@media\(max-width:620px\)/, 'Creator Hub ต้องมี responsive mobile state');
console.log('Creator Hub contract: passed');
