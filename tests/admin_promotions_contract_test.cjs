const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'admin', 'admin-app.js'), 'utf8');
const promotions = app.slice(app.indexOf('async function legacyPromotions()'), app.indexOf('async function customers()'));

assert.ok(promotions.includes("platform_configs?select=key,value&key=eq.customer_promotions&limit=1"), 'Promotions ต้องอ่านรายการจาก central platform config');
assert.ok(promotions.includes("key: 'customer_promotions'"), 'Promotions ต้องบันทึกรายการลง central platform config เดียวกับ Customer');
assert.ok(promotions.includes('data-add-promotion'), 'Admin ต้องเพิ่ม banner ได้มากกว่าหนึ่งรายการ');
assert.ok(promotions.includes('data-delete-promotion'), 'Admin ต้องลบ banner รายการที่ไม่ใช้ได้');
assert.ok(promotions.includes('data-promotion-move'), 'Admin ต้องจัดลำดับ banner ที่จะเข้า carousel ได้');
assert.ok(promotions.includes('data-promotion-direction'), 'ปุ่มจัดลำดับต้องระบุทิศทางโดยไม่พึ่ง index จำลอง');
assert.ok(promotions.includes('normalizePriorities'), 'รายการ banner ต้องเขียน priority ใหม่ทุกครั้งหลังเพิ่ม ลบ หรือย้าย');
assert.ok(promotions.includes('priority: items.length + 1'), 'banner ใหม่ต้องมีลำดับเริ่มต้นชัดเจน');
assert.ok(promotions.includes('type="file" accept="image/jpeg,image/png,image/webp"'), 'อัปโหลด banner ต้องรับเฉพาะไฟล์ภาพ ไม่เปิด URL input');
assert.ok(promotions.includes('APServiceMedia.uploadPublicCatalogImage'), 'อัปโหลด banner ต้องผ่าน shared media pipeline');
assert.ok(!/type="url"/.test(promotions), 'Promotions ต้องไม่มี URL input ที่ขัดกฎ media upload');

console.log('admin promotions contract: PASS');
