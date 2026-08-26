'use strict';

const assert = require('assert');
const fs = require('fs');

const owner = fs.readFileSync('admin/admin-menu-management-patch.js', 'utf8');
const stores = fs.readFileSync('admin/stores.html', 'utf8');

assert.match(owner, /data-menu-media-preview-wrap/, 'ฟอร์มเมนูต้องมี wrapper สำหรับ preview ที่ซ่อน/แสดงได้');
assert.match(owner, /data-menu-media-preview/, 'ฟอร์มเมนูต้องมี image preview ก่อนกดบันทึก');
assert.match(owner, /alt="ตัวอย่างรูปเมนู"/, 'preview รูปเมนูต้องมี accessible alt text');
assert.match(owner, /data-menu-media-status aria-live="polite"/, 'สถานะสื่อเมนูต้องประกาศให้ assistive technology ทราบ');
assert.match(owner, /URL\.createObjectURL\(file\)/, 'เมื่อเลือกไฟล์ต้องสร้าง local blob preview');
assert.match(owner, /previewBlobUrl = URL\.createObjectURL\(file\)/, 'ต้องเก็บ transient blob URL เพื่อ cleanup');
assert.match(owner, /URL\.revokeObjectURL\(previewBlobUrl\)/, 'ต้อง revoke transient blob เมื่อเปลี่ยน/ปิดฟอร์ม');
assert.match(owner, /setMediaPreview\(previewBlobUrl, 'local'\)/, 'preview ก่อน save ต้องระบุ source เป็น local');
assert.match(owner, /setMediaPreview\(uploaded\.publicUrl, 'remote'\)/, 'หลัง shared upload สำเร็จต้องเปลี่ยน preview เป็น remote URL');
assert.match(owner, /restorePersistedPreview\(\)/, 'upload error ต้องคืน preview เดิมแทนปล่อย blob ค้าง');
assert.match(owner, /uploadPublicCatalogImage\(file/, 'รูปเมนูต้องผ่าน shared media pipeline');
assert.match(owner, /mediaType: 'MENU_IMAGE'/, 'รูปเมนูต้องลงทะเบียนด้วย media type ที่ถูกต้อง');
assert.match(owner, /ownerType: 'admin'/, 'Admin menu media ต้องรักษา owner boundary');
assert.match(owner, /itemForm\.onsubmit = async event =>/, 'เมนูต้องยังมี explicit form Save แยกจาก file selection');
assert.match(owner, /dialog\.backdrop\.querySelectorAll\('\[data-add-menu\]'\)/, 'ปุ่มเพิ่มเมนูทั้ง header และ empty-state ต้อง bind ภายใน menu dialog');
assert.ok(owner.indexOf("dialog.backdrop.querySelectorAll('[data-add-menu]')") < owner.indexOf("dialog.backdrop.querySelectorAll('[data-import-menu-image]')"), 'Add menu binding ต้องอยู่ใน renderItems ก่อน import binding');
assert.ok(owner.indexOf("setMediaPreview(previewBlobUrl, 'local')") < owner.indexOf('const uploaded = await window.APServiceMedia.uploadPublicCatalogImage'), 'local preview ต้องถูกตั้งก่อนรอ shared upload');
assert.ok(owner.indexOf('clearPreviewBlob();\n        setMediaPreview(uploaded.publicUrl, \'remote\')') > owner.indexOf('const uploaded = await window.APServiceMedia.uploadPublicCatalogImage'), 'remote preview ต้องตั้งหลัง shared upload สำเร็จ');

const patchTag = '<script src="admin-menu-management-patch.js?v=menu-management-v2"></script>';
const adminTag = '<script src="admin-app.js?v=admin-source-v12';
assert.ok(stores.indexOf(patchTag) >= 0, 'Stores route ต้องโหลด dedicated menu owner');
assert.ok(stores.indexOf(patchTag) < stores.indexOf(adminTag), 'dedicated menu owner ต้องโหลดก่อน admin-app เพื่อ bind route อย่าง canonical');

console.log('admin menu media preview contract: PASS');
