const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const stores = fs.readFileSync('admin/stores.html', 'utf8');
const styles = fs.readFileSync('admin/admin-management.css', 'utf8');

assert.match(admin, /async function storesV3\(/, 'หน้า Stores ต้องใช้ Store Control Plane handler ที่ dispatcher เรียกใช้จริง');
assert.match(admin, /stores: storesV3/, 'dispatcher ของ stores.html ต้องชี้ไปยัง Store Control Plane handler');
assert.match(admin, /id="createStore"/, 'หน้า Stores ต้องมีปุ่มเพิ่มร้านค้า');
assert.match(admin, /functions\/v1\/role-access/, 'การสร้างร้านใหม่ต้องใช้ server-side role access สำหรับบัญชี Merchant');
assert.match(admin, /action: 'provision', role: 'store_owner'/, 'เพิ่มร้านต้อง provision สิทธิ์ store_owner ผ่าน server');
assert.match(admin, /emergency_closed/, 'Store management ต้องมีสถานะปิดฉุกเฉิน');
assert.match(admin, /action: 'moderate_store'/, 'Store Control Plane ต้องระงับ/เปิดร้านผ่าน central role access');
assert.match(admin, /moderation_action: next, reason:/, 'การระงับร้านต้องส่งเหตุผลไปยัง central business rule');
assert.match(admin, /open_time/, 'Store management ต้องแก้ไขเวลาเปิดร้านได้');
assert.match(admin, /close_time/, 'Store management ต้องแก้ไขเวลาปิดร้านได้');
assert.match(admin, /order_cutoff_minutes/, 'Store management ต้องกำหนดเวลาตัดรับออร์เดอร์ได้');
assert.match(admin, /settlement_gp_percent/, 'Store management ต้องยังตั้ง GP แยกร้านได้');
assert.match(admin, /data-store-emergency/, 'Store cards ต้องมี action ปิดฉุกเฉิน');
assert.match(admin, /data-store-moderate/, 'Store cards ต้องมี action ระงับ/เปิดร้านกลับมา');
assert.match(admin, /data-store-general/, 'Store cards ต้องมีเมนูรองสำหรับแก้ไขข้อมูลร้าน');
assert.match(admin, /data-store-operations/, 'Store cards ต้องมีเมนูรองสำหรับเวลาและพิกัดบริการ');
assert.match(admin, /data-store-media/, 'Store cards ต้องมี action รูปและสื่อ');
assert.match(admin, /data-store-menu/, 'Store cards ต้องมีเมนูรองสำหรับจัดการเมนูและสต็อก');
assert.match(admin, /data-store-account/, 'Store cards ต้องมีเมนูรองสำหรับจัดการบัญชี Merchant');
assert.match(admin, /admin-store-card/, 'Store Control Plane ต้อง render ร้านค้าเป็น card workspace');
assert.match(admin, /let searchTimer = 0/, 'Stores search ต้อง debounce การ re-render เพื่อไม่ตัดข้อความระหว่างพิมพ์');
assert.match(admin, /window\.setTimeout\(\(\) => \{/, 'Stores search ต้องเลื่อน render หลัง input event เพื่อรองรับ paste/typing');
assert.match(admin, /host\.querySelector\('#storeSearch'\)\.oninput = event =>/, 'storesV3 search path ต้องใช้ debounced input handler');
assert.match(admin, /data-store-search=/, 'Stores cards ต้องมี search index สำหรับกรองแบบ in-place');
assert.match(admin, /card\.hidden = !visible/, 'Stores search ต้องซ่อน/แสดง card โดยไม่สร้าง input ใหม่ทุก keystroke');
assert.match(stores, /admin-management\.css/, 'Stores route ต้องโหลด responsive management styles');
assert.match(styles, /\.admin-store-grid/, 'ต้องมี layout card ของ Store management');
assert.match(styles, /@media\(max-width:760px\).*\.admin-store-grid/s, 'Store management ต้องมี mobile breakpoint');

console.log('admin store management contract: PASS');
