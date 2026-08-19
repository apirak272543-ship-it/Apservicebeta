const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.match(app, /const updateField = async/, 'Store V3 ต้องมี helper สำหรับ field update');
assert.match(app, /action: 'update_store_section'/, 'Store V3 ต้องเรียก server control-plane action');
assert.match(app, /settlement_gp_percent/, 'Store V3 ต้องส่ง GP รายร้านผ่าน server action');
assert.match(app, /\['image_url', 'background_url'\]/, 'Store V3 ต้องจัด media เป็น appearance section');
assert.doesNotMatch(app, /const updateField = async \(row, field, value, message\) => \{ await M\.request\(`stores/, 'Store V3 ห้าม PATCH field ผ่าน table โดยตรง');

console.log('admin store section server action contract: PASS');
