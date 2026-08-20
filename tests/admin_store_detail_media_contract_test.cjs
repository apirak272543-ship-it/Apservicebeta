const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const media = fs.readFileSync('shared/ap-service-media.js', 'utf8');
const menuManagement = fs.readFileSync('admin/admin-menu-management-patch.js', 'utf8');

assert.match(admin, /const openMediaEditor = row =>/, 'หน้า Stores ต้องมี native media editor');
assert.match(admin, /data-media="image_url"/, 'media editor ต้องมีช่องอัปโหลดไอคอนร้าน');
assert.match(admin, /data-media="background_url"/, 'media editor ต้องมีช่องอัปโหลดภาพพื้นหลังร้าน');
assert.match(admin, /accept="image\/jpeg,image\/png,image\/webp"/, 'media editor ต้องจำกัดไฟล์เป็น JPG, PNG หรือ WebP');
assert.match(admin, /uploadPublicCatalogImage\(file/, 'รูปไอคอนและพื้นหลังร้านต้องผ่าน Shared Media Service');
assert.match(admin, /scope: `store-\$\{row\.id\}-\$\{field\}`/, 'การอัปโหลดร้านต้องแยก scope ตามร้านและ field');
assert.match(admin, /draft\[field\] = uploaded\.publicUrl/, 'media editor ต้องบันทึก storage URL ที่ตรวจสอบแล้ว ไม่ใช่ preview URL');
assert.match(admin, /body: JSON\.stringify\(\{ \.\.\.draft, updated_at: M\.ui\.nowIso\(\) \}\)/, 'media editor ต้อง persist URL ลง stores table');
assert.match(media, /prepareImage\(file/, 'Shared Media Service ต้องเตรียมและบีบอัดรูปก่อนอัปโหลด');
assert.match(media, /DEFAULT_OUTPUT_MAX_BYTES = 1_000_000/, 'รูปที่จะอัปโหลดต้องถูกจำกัดไม่เกิน 1 MB');
assert.match(media, /verifyRenderableUrl\(publicUrl\)/, 'รูป public ต้องถูกตรวจ URL ก่อนบันทึก');
assert.match(menuManagement, /libraryInput\.dataset\.menuMediaSource = 'library'/, 'ปุ่มเลือกจากคลังต้องใช้ input ต้นทางคลังภาพแยกต่างหาก');
assert.match(menuManagement, /cameraInput\.dataset\.menuMediaSource = 'camera'/, 'ปุ่มถ่ายรูปต้องใช้ input ต้นทางกล้องแยกต่างหาก');
assert.match(menuManagement, /libraryInput\.removeAttribute\('capture'\)/, 'input คลังภาพต้องไม่มี capture เพื่อไม่บังคับเปิดกล้อง');
assert.match(menuManagement, /cameraInput\.setAttribute\('capture', 'environment'\)/, 'มีเฉพาะ input กล้องที่ร้องขอกล้องหลังผู้ใช้กดถ่ายรูปใหม่');
assert.match(menuManagement, /libraryTrigger\.onclick = \(\) => libraryInput\.click\(\)/, 'ปุ่มคลังภาพต้องเรียก input คลังภาพโดยตรง');
assert.match(menuManagement, /cameraTrigger\.onclick = \(\) => cameraInput\.click\(\)/, 'ปุ่มถ่ายรูปต้องเรียก input กล้องโดยตรง');

console.log('admin store detail media contract: PASS');
