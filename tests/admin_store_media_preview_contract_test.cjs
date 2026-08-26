const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const ownerStart = admin.indexOf('const openStoreMedia = row => {');
const ownerEnd = admin.indexOf('const openMerchantAccount', ownerStart);
assert(ownerStart >= 0 && ownerEnd > ownerStart, 'ต้องพบ Store media owner ใน storesV3');
const owner = admin.slice(ownerStart, ownerEnd);
const submitStart = owner.indexOf("'อัปโหลดและบันทึกรูป'");
const localPreviewStart = owner.indexOf('const setLocalPreview');
const localPreviewEnd = owner.indexOf('mediaModal = modal', localPreviewStart);

assert.match(owner, /const localPreviewUrls = new Map\(\)/, 'ต้องเก็บ local blob URL แยกตาม field');
assert.match(owner, /URL\.createObjectURL\(file\)/, 'ต้องสร้าง local preview จากไฟล์ที่เลือกก่อน Save');
assert.match(owner, /URL\.revokeObjectURL\(previousUrl\)/, 'ต้อง revoke blob เดิมเมื่อเลือกไฟล์ใหม่');
assert.match(owner, /preview\.hidden = false/, 'ต้องแสดง preview หลังเลือกไฟล์');
assert.match(owner, /data-media-status aria-live="polite"/, 'ต้องมี status ที่อ่านได้และแจ้งสถานะ preview/upload');
assert.match(owner, /input\.addEventListener\('change'/, 'ต้อง bind change handler ให้ Store media file inputs');
assert.match(owner, /setLocalPreview\(input\.name, file\)/, 'change handler ต้องผูก preview กับ field ที่เลือก');
assert.match(owner, /mediaModal\.querySelectorAll\('\[data-preview\]'\)\.forEach\(preview => \{ if \(preview\.getAttribute\('src'\)\) preview\.hidden = false; \}\)/, 'ต้องแสดง persisted preview เมื่อเปิด modal');
assert.match(owner, /mediaModal\.__beforeClose = \(\) =>/, 'ต้องมี cleanup hook ก่อน modal ปิด');
assert.match(owner, /for \(const url of localPreviewUrls\.values\(\)\) URL\.revokeObjectURL\(url\)/, 'ต้อง revoke blob URL ทั้งหมดเมื่อปิด modal');
assert.match(owner, /return mediaModal;/, 'Store media owner ต้องเก็บ modal node เพื่อผูก lifecycle');
assert.match(admin, /node\.querySelector\('\[data-media-status\],\[data-status\]'\)/, 'generic Store modal ต้องแสดง error ใน modal และเปิดทาง retry');
assert(submitStart > localPreviewStart, 'explicit submit ต้องอยู่หลัง local preview setup');
assert(localPreviewEnd > localPreviewStart, 'ต้องแยก local preview block ได้');
assert(!owner.slice(localPreviewStart, localPreviewEnd).includes('uploadPublicCatalogImage'), 'การเลือกไฟล์ต้องไม่ upload backend ก่อน explicit Save');
assert.match(owner, /uploadPublicCatalogImage\(file/, 'explicit Save ต้องยังใช้ shared media upload pipeline');
assert.match(owner, /form\.elements\[field\]\.files\?\.\[0\]/, 'submit ต้องอ่านไฟล์จาก form ตอน Save เท่านั้น');

console.log('admin store media preview contract: PASS');
