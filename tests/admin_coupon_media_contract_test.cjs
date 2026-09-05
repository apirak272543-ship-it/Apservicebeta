const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('admin/admin-coupons.js', 'utf8');
const css = fs.readFileSync('admin/admin-coupons.css', 'utf8');

assert.match(source, /data-coupon-upload/, 'ฟอร์มคูปองต้องมี input สำหรับอัปโหลดรูปใหม่');
assert.match(source, /uploadPublicImage\(file/, 'คูปองต้องใช้อัปโหลด Media กลาง');
assert.match(source, /bucket: 'catalog-media'/, 'รูปคูปองต้องอัปโหลดไปยัง catalog-media');
assert.match(source, /mediaType: 'ADVERTISEMENT'/, 'รูปคูปองต้องลงทะเบียนเป็น media advertisement');
assert.match(source, /data-coupon-preview/, 'ฟอร์มคูปองต้องมีพื้นที่พรีวิว');
assert.match(source, /updateImagePreview/, 'การเลือกภาพต้องอัปเดตพรีวิวทันที');
assert.match(source, /new Option\(/, 'รูปที่อัปโหลดใหม่ต้องถูกเพิ่มเป็นตัวเลือกที่เลือกอยู่');
assert.match(source, /data-coupon-edit.*addEventListener\('click'/, 'ปุ่มแก้ไขต้องมี click handler โดยตรง');
assert.match(source, /state\.editing = id/, 'ปุ่มแก้ไขต้องกำหนดรายการที่กำลังแก้ไข');
assert.match(source, /scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\)/, 'หลังเลือกแก้ไขต้องเลื่อนไปยังฟอร์ม');
assert.match(css, /\.coupon-media-preview img/, 'CSS ต้องแสดงรูปจริงในพื้นที่พรีวิว');

console.log('admin_coupon_media_contract_test: PASS');
