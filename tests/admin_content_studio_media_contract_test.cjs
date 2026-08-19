const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '..', 'admin', 'customer-content-studio-patch.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const mediaInputStart = source.indexOf('const mediaInput =');
const mediaInputEnd = source.indexOf(';', mediaInputStart);

assert.ok(mediaInputStart >= 0, 'Content Studio ต้องมี media input renderer');
assert.ok(mediaInputEnd > mediaInputStart, 'ต้องอ่าน markup ของ media input ได้');

const mediaMarkup = source.slice(mediaInputStart, mediaInputEnd);

assert.match(mediaMarkup, /data-media-input/, 'ต้องคง file input สำหรับเลือกภาพ');
assert.match(mediaMarkup, /capture="environment"/, 'ต้องคง file input สำหรับถ่ายรูปจากกล้อง');
assert.match(mediaMarkup, /type="hidden"/, 'URL ที่ได้จากระบบต้องเก็บเป็นค่า internal แบบ hidden');
assert.doesNotMatch(mediaMarkup, /admin-content-media-url/, 'ห้ามแสดงช่อง URL รูปภาพแก่ผู้ใช้');
assert.doesNotMatch(mediaMarkup, /type="url"/, 'media renderer ต้องไม่มี URL input สำหรับรูปภาพ');
assert.match(source, /APServiceMedia\.uploadPublicImage/, 'การบันทึกภาพต้องยังใช้ shared media pipeline กลาง');
assert.match(source, /bucket:\s*'catalog-media'/, 'การอัปโหลดต้องใช้ catalog-media ที่ควบคุมโดยระบบ');
assert.match(source, /mediaType:\s*input\.dataset\.mediaType/, 'การอัปโหลดต้องเก็บชนิดสื่อจาก media input');

console.log('PASS: Admin Content Studio media input รองรับกล้อง/คลังและไม่มี URL input สำหรับรูปภาพ');
