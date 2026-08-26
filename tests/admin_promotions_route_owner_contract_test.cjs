const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const patch = fs.readFileSync(path.join(__dirname, '..', 'admin', 'admin-control-plane-patch.js'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '..', 'admin', 'admin-app.js'), 'utf8');

assert.match(patch, /window\.APServiceAdminPatch\s*=\s*\{[^}]*media:\s*mediaCenterPatch\s*\}/s, 'ต้องคง legacy media owner แยกใน media route');
assert.doesNotMatch(patch, /promotions:\s*mediaCenterPatch/, 'ห้ามให้ legacy media patch hijack promotions route');
assert.match(app, /\{ login, dashboard, orders, stores: storesV3, promotions, media: mediaV2,/, 'base app ต้องมี multi-placement promotions owner เป็น fallback');
assert.match(app, /const patchedRoute = window\.APServiceAdminPatch\?\.?\[page\];/, 'route dispatch ต้องตรวจ patched owner ก่อน fallback');
assert.match(app, /\(patchedRoute \|\| \(\{ login, dashboard, orders, stores: storesV3, promotions, media: mediaV2,/, 'เมื่อไม่มี promotions patch ต้องเลือก base promotions owner');

console.log('PASS: Admin promotions route uses canonical multi-placement owner while legacy media route remains isolated');
