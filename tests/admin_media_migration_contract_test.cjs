const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const styles = fs.readFileSync('admin/admin-management.css', 'utf8');
const mediaPage = fs.readFileSync('admin/media.html', 'utf8');

assert.match(admin, /async function mediaV2\(/, 'Media route ต้องใช้ migration-aware handler');
assert.match(admin, /data:image\\\/\(\?:jpeg\|png\|webp\);base64,/, 'migration queue ต้องตรวจ legacy data URL ชนิดรูปที่อนุญาต');
assert.match(admin, /fileFromDataUrl/, 'migration queue ต้องอ่านภาพ data URL เป็น File ก่อนส่งเข้า Shared Media Service');
assert.match(admin, /uploadPublicCatalogImage/, 'รูป public legacy ต้องผ่าน Shared Media Service');
assert.match(admin, /uploadPrivateImage/, 'หลักฐาน private legacy ต้องผ่าน Shared Media Service');
assert.match(admin, /ตรวจ URL ใหม่ให้สำเร็จก่อนเปลี่ยน reference/, 'ต้องสื่อสารลำดับปลอดภัย: ตรวจ replacement ก่อนเปลี่ยน reference');
assert.match(admin, /proof_image_url: replacement/, 'withdrawal proof ต้องสลับเป็น storage reference ใหม่หลัง upload สำเร็จ');
assert.match(admin, /\[item\.field\]: replacement/, 'รูป public ต้องสลับ field reference หลัง upload สำเร็จ');
assert.match(admin, /ข้อมูลเดิมยังไม่ได้ถูกลบ/, 'หาก migration ล้มเหลวต้องยืนยันว่าข้อมูลเดิมยังคงอยู่');
assert.match(admin, /data-migrate-image/, 'UI ต้องให้ดำเนิน migration เป็นรายรูปได้');
assert.match(styles, /\.admin-media-legacy-grid/, 'Media queue ต้องมี card layout');
assert.match(styles, /@media\(max-width:760px\).*\.admin-media-legacy-grid\{grid-template-columns:1fr\}/s, 'Media queue ต้องอ่านง่ายบนมือถือ');
assert.match(mediaPage, /admin-management\.css/, 'Media route ต้องโหลด styles ของ migration queue');

console.log('admin media migration contract: PASS');
