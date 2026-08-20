const fs = require('fs');
const assert = require('assert');
const html = fs.readFileSync('admin/riders.html', 'utf8');
const source = fs.readFileSync('admin/admin-rider-compliance.js', 'utf8');

assert.match(html, /admin-rider-compliance\.js/, 'หน้า Admin Riders ต้องโหลด compliance module');
assert.match(source, /review_rider_compliance/, 'Admin ต้องใช้ Edge action สำหรับผล compliance');
assert.match(source, /mpa-modal-backdrop/, 'การตรวจ compliance ต้องอยู่ใน action sheet');
assert.match(source, /identity_document_image_url/, 'action sheet ต้องแสดงหลักฐานตัวตน');
assert.match(source, /data-rider-compliance/, 'Admin Rider card ต้องมีปุ่มตรวจ compliance');
console.log('admin rider compliance control contract: PASS');
