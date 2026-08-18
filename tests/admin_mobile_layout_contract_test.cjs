const fs = require('fs');
const assert = require('assert');

const dashboard = fs.readFileSync('admin/dashboard.html', 'utf8');
const navigation = fs.readFileSync('admin/admin-navigation.css', 'utf8');
const runtime = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.match(dashboard, /<meta name="viewport" content="width=device-width,initial-scale=1">/, 'Admin MPA page ต้องมี mobile viewport');
assert.match(dashboard, /admin-navigation\.css/, 'Admin MPA page ต้องโหลด navigation CSS');
assert.match(navigation, /@media\(max-width:760px\)/, 'Admin navigation ต้องมี responsive breakpoint บนมือถือ');
assert.match(navigation, /\.admin-nav-primary \.admin-nav-link:nth-child\(4\),\.admin-nav-primary \.admin-nav-link:nth-child\(5\)\{display:none/, 'จอมือถือต้องลดเมนูหลักและเก็บเมนูรองไว้ใน More menu');
assert.match(navigation, /\.admin-quick-actions\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/, 'ทางลัดหน้า dashboard ต้องเป็นสองคอลัมน์ที่กดง่ายบนมือถือ');
assert.match(navigation, /\.admin-nav-popover\{right:-38px;min-width:216px/, 'เมนูเพิ่มเติมต้องมีความกว้างเพียงพอสำหรับการแตะบนมือถือ');
assert.match(runtime, /mpa-table-wrap/, 'รายการข้อมูล Admin ต้องใช้ table wrapper ที่เลื่อนได้แทนการล้นจอ');
assert.match(runtime, /mpa-button/, 'Admin MPA ต้องใช้ controls มาตรฐานที่แสดงสถานะและกดได้');

console.log('admin mobile layout contract: PASS');
