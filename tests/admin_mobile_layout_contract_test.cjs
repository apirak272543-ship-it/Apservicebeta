const fs = require('fs');
const assert = require('assert');

const dashboard = fs.readFileSync('admin/dashboard.html', 'utf8');
const navigation = fs.readFileSync('admin/admin-navigation.css', 'utf8');
const runtime = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.match(dashboard, /<meta name="viewport" content="width=device-width,initial-scale=1">/, 'Admin MPA page ต้องมี mobile viewport');
assert.match(dashboard, /admin-navigation\.css/, 'Admin MPA page ต้องโหลด navigation CSS');
assert.match(navigation, /@media\(max-width:760px\)/, 'Admin navigation ต้องมี responsive breakpoint บนมือถือ');
assert.match(navigation, /\.admin-nav-primary \.admin-nav-link:nth-child\(n\+4\)\{display:none/, 'header ต้องเก็บเมนูรองไว้ใน More menu เพื่อลดรายการซ้ำ');
assert.match(navigation, /\.admin-quick-actions\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/, 'ทางลัดหน้า dashboard ต้องเป็นสองคอลัมน์ที่กดง่ายบนมือถือ');
assert.match(navigation, /max-height:calc\(100dvh - 82px\);overflow-y:auto;.*touch-action:pan-y/, 'เมนูเพิ่มเติมต้องเลื่อนแนวตั้งได้จริงและไม่ถูก sticky header ตัดบนมือถือ');
assert.match(navigation, /width:min\(324px,calc\(100vw - 20px\)\)/, 'เมนูเพิ่มเติมต้องมีความกว้างที่กดง่ายและไม่ล้นจอมือถือ');
assert.match(runtime, /const primary = links\.slice\(0, 3\), people = links\.slice\(3, 5\)/, 'header ต้องเหลือเฉพาะทางลัดหลักและย้าย Rider/Customer ไปเมนูรอง');
assert.match(runtime, /navGroup\('บัญชีและบทบาท', people, active\)/, 'เมนูสามจุดต้องเก็บการจัดการบัญชีและบทบาทไว้ครบ');
assert.match(runtime, /mpa-table-wrap/, 'รายการข้อมูล Admin ต้องใช้ table wrapper ที่เลื่อนได้แทนการล้นจอ');
assert.match(runtime, /mpa-button/, 'Admin MPA ต้องใช้ controls มาตรฐานที่แสดงสถานะและกดได้');

console.log('admin mobile layout contract: PASS');
