const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'admin', 'customer-content-studio-patch.js'), 'utf8');

const normalizedStart = source.indexOf('const normalizePromotions =');
const normalizedEnd = source.indexOf('\n  };', normalizedStart);
assert.ok(normalizedStart >= 0 && normalizedEnd > normalizedStart, 'ต้องพบ normalizePromotions ที่อ่านได้');
const normalized = source.slice(normalizedStart, normalizedEnd);
assert.match(normalized, /placement:\s*row\?\.placement/, 'ต้อง preserve placement ของ promotion เดิม/ใหม่');
assert.match(normalized, /approval_status:\s*row\?\.approval_status/, 'normalize ต้องอ่าน approval_status เดิมเพื่อความเข้ากันได้');

const blankStart = source.indexOf('const blankPromotion =');
const blankEnd = source.indexOf(';', blankStart);
assert.ok(blankStart >= 0 && blankEnd > blankStart, 'ต้องพบ blankPromotion');
const blank = source.slice(blankStart, blankEnd);
assert.match(blank, /placement:\s*'customer_home_sponsored'/, 'promotion ใหม่ต้องอยู่ placement Customer sponsored');
assert.match(blank, /approval_status:\s*'approved'/, 'promotion ใหม่ต้องพร้อมเผยแพร่ตามการควบคุมของ Admin');
assert.match(blank, /active:\s*false/, 'promotion ใหม่ต้องปิดการแสดงผลจนกว่าจะเปิดใช้งาน');

const readFormStart = source.indexOf('function readForm');
const readFormEnd = source.indexOf('\n  function renderCard', readFormStart);
assert.ok(readFormStart >= 0 && readFormEnd > readFormStart, 'ต้องพบ readForm');
const readForm = source.slice(readFormStart, readFormEnd);
assert.match(readForm, /const nextPromotions = promotions\.map/, 'readForm ต้อง serialize promotion state ที่ส่งเข้ามา');
assert.match(readForm, /placement:\s*row\?\.placement/, 'readForm ต้องไม่ตัด placement ทิ้ง');
assert.match(readForm, /approval_status:\s*'approved'/, 'เมื่อ Admin บันทึกต้องกำหนดสถานะเผยแพร่เสมอ');

assert.match(source, /let currentPromotions = \[\];/, 'ต้องประกาศ promotion state ใน module scope อย่างชัดเจน');
assert.match(source, /const form = host\.querySelector\('#customerContentForm'\);[\s\S]*readSection\(form, home, currentPromotions, section\);/, 'submit รายหมวดต้องใช้ form เดียวกันและ serialize state ผ่าน readSection');
assert.match(source, /data-content-save=/, 'แต่ละหมวดต้องมีปุ่มบันทึกแยกของตัวเอง');
assert.match(source, /if \(section !== 'promotions'\)/, 'การบันทึกหมวดทั่วไปต้องเขียนเฉพาะ brand_public');
assert.match(source, /section === 'promotions' \|\| section === 'all'/, 'การบันทึก Banner ต้องเขียน customer_promotions แยก');
assert.doesNotMatch(source, /readForm\(event\.currentTarget, home, currentPromotions\)/, 'ห้ามอ่าน currentTarget โดยตรงใน readForm');
assert.doesNotMatch(source, /readForm\(event\.currentTarget, home, promotions\)/, 'ห้ามย้อนกลับไป serialize promotions array เดิม');

console.log('PASS: Content Studio dynamic promotion state และ safe downstream contract ถูก serialize/preserve ครบ');
