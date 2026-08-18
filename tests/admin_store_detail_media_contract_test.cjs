const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const media = fs.readFileSync('shared/ap-service-media.js', 'utf8');

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

console.log('admin store detail media contract: PASS');
