const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const stores = fs.readFileSync('admin/stores.html', 'utf8');
const styles = fs.readFileSync('admin/admin-management.css', 'utf8');

assert.match(admin, /async function storesV2\(/, 'หน้า Stores ต้องใช้ Store management handler ใหม่');
assert.match(admin, /id="addStore"/, 'หน้า Stores ต้องมีปุ่มเพิ่มร้านค้า');
assert.match(admin, /functions\/v1\/role-access/, 'การสร้างร้านใหม่ต้องใช้ server-side role access สำหรับบัญชี Merchant');
assert.match(admin, /action: 'provision', role: 'store_owner'/, 'เพิ่มร้านต้อง provision สิทธิ์ store_owner ผ่าน server');
assert.match(admin, /emergency_closed/, 'Store management ต้องมีสถานะปิดฉุกเฉิน');
assert.match(admin, /moderation_status/, 'Store management ต้องมีสถานะระงับ/แบนร้าน');
assert.match(admin, /moderation_reason/, 'การระงับร้านต้องเก็บเหตุผล');
assert.match(admin, /open_time/, 'Store management ต้องแก้ไขเวลาเปิดร้านได้');
assert.match(admin, /close_time/, 'Store management ต้องแก้ไขเวลาปิดร้านได้');
assert.match(admin, /order_cutoff_minutes/, 'Store management ต้องกำหนดเวลาตัดรับออร์เดอร์ได้');
assert.match(admin, /settlement_gp_percent/, 'Store management ต้องยังตั้ง GP แยกร้านได้');
assert.match(admin, /data-store-emergency/, 'Store cards ต้องมี action ปิดฉุกเฉิน');
assert.match(admin, /data-store-moderate/, 'Store cards ต้องมี action ระงับ/เปิดร้านกลับมา');
assert.match(admin, /data-store-edit/, 'Store cards ต้องมี action แก้ไขร้าน');
assert.match(admin, /data-store-media/, 'Store cards ต้องมี action รูปและสื่อ');
assert.match(stores, /admin-management\.css/, 'Stores route ต้องโหลด responsive management styles');
assert.match(styles, /\.admin-store-grid/, 'ต้องมี layout card ของ Store management');
assert.match(styles, /@media\(max-width:760px\).*\.admin-store-grid/s, 'Store management ต้องมี mobile breakpoint');

console.log('admin store management contract: PASS');
