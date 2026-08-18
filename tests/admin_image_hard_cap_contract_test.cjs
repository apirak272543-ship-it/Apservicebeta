const fs = require('fs');
const assert = require('assert');

const media = fs.readFileSync('shared/ap-service-media.js', 'utf8');
const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const mediaPage = fs.readFileSync('admin/media.html', 'utf8');

assert.match(media, /DEFAULT_OUTPUT_MAX_BYTES = 1_000_000/, 'Shared Media Service ต้องบังคับ output ไม่เกิน 1 MB');
assert.match(media, /ACCEPTED_IMAGE_TYPES/, 'Shared Media Service ต้องตรวจ MIME type ก่อนบีบอัด');
assert.match(media, /SOURCE_IMAGE_MAX_BYTES/, 'Shared Media Service ต้องจำกัดไฟล์ต้นฉบับก่อนประมวลผล');
assert.match(media, /verifyRenderableUrl/, 'Shared Media Service ต้องตรวจว่า URL ของรูปที่อัปโหลดแสดงผลได้จริง');
assert.match(media, /uploadPublicCatalogImage\(file, options = \{\}\).*bucket: 'catalog-media'/, 'Catalog API ต้องจำกัด bucket เป็น catalog-media');
assert.match(media, /uploadPrivateImage/, 'หลักฐานส่วนตัวต้องอัปโหลดผ่าน private image API');
assert.match(media, /PAYMENT_SLIP[\s\S]*DEFAULT_OUTPUT_MAX_BYTES/, 'ภาพสลิปต้องใช้ media profile ที่ไม่เกิน 1 MB');
assert.match(admin, /uploadPublicCatalogImage\(file/, 'รูปไอคอนร้าน ภาพพื้นหลัง และโฆษณาต้องใช้ Shared Media Service');
assert.match(admin, /uploadPrivateImage\(file/, 'หลักฐานการโอนต้องใช้ Shared Media Service แบบ private');
assert.match(admin, /bucket: 'withdrawal-proofs'/, 'หลักฐานการโอนต้องใช้ bucket ที่แยกจากรูปสาธารณะ');
assert.match(admin, /createSignedImageUrl/, 'รูปส่วนตัวต้องเปิดด้วย signed URL');
assert.match(mediaPage, /data-page="media"/, 'คลังสื่อต้องเป็น Admin-native route');

console.log('admin image 1 MB hard-cap contract: PASS');
