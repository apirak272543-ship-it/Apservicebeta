const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'admin', 'customer-content-studio-patch.js'), 'utf8');

const normalizedStart = source.indexOf('const normalizePromotions =');
const normalizedEnd = source.indexOf('\n  };', normalizedStart);
assert.ok(normalizedStart >= 0 && normalizedEnd > normalizedStart, 'ต้องพบ normalizePromotions ที่อ่านได้');
const normalized = source.slice(normalizedStart, normalizedEnd);
assert.match(normalized, /placement:\s*row\?\.placement/, 'ต้อง preserve placement ของ promotion เดิม/ใหม่');
assert.match(normalized, /approval_status:\s*row\?\.approval_status/, 'ต้อง preserve approval_status ของ promotion เดิม/ใหม่');

const blankStart = source.indexOf('const blankPromotion =');
const blankEnd = source.indexOf(';', blankStart);
assert.ok(blankStart >= 0 && blankEnd > blankStart, 'ต้องพบ blankPromotion');
const blank = source.slice(blankStart, blankEnd);
assert.match(blank, /placement:\s*'customer_home_sponsored'/, 'promotion ใหม่ต้องอยู่ placement Customer sponsored');
assert.match(blank, /approval_status:\s*'draft'/, 'promotion ใหม่ต้องเริ่มเป็น draft');
assert.match(blank, /active:\s*false/, 'promotion ใหม่ต้องปิดการแสดงผลจนกว่าจะอนุมัติ');

const readFormStart = source.indexOf('function readForm');
const readFormEnd = source.indexOf('\n  function renderCard', readFormStart);
assert.ok(readFormStart >= 0 && readFormEnd > readFormStart, 'ต้องพบ readForm');
const readForm = source.slice(readFormStart, readFormEnd);
assert.match(readForm, /const nextPromotions = promotions\.map/, 'readForm ต้อง serialize promotion state ที่ส่งเข้ามา');
assert.match(readForm, /placement:\s*row\?\.placement/, 'readForm ต้องไม่ตัด placement ทิ้ง');
assert.match(readForm, /approval_status:\s*row\?\.approval_status/, 'readForm ต้องไม่ตัด approval_status ทิ้ง');

assert.match(source, /const next = readForm\(event\.currentTarget, home, currentPromotions\);/, 'submit ต้อง serialize currentPromotions หลัง add/remove/reorder');
assert.doesNotMatch(source, /const next = readForm\(event\.currentTarget, home, promotions\);/, 'ห้ามย้อนกลับไป serialize promotions array เดิม');

console.log('PASS: Content Studio dynamic promotion state และ safe downstream contract ถูก serialize/preserve ครบ');
