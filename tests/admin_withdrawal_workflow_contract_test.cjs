const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const media = fs.readFileSync('shared/ap-service-media.js', 'utf8');
const migration = fs.readFileSync('../apservice-repo/supabase/migrations/20260814_wallet_withdrawal_requests.sql', 'utf8');

assert.match(admin, /rpc\/admin_review_withdrawal/, 'Finance MPA ต้องเรียก server RPC สำหรับ review withdrawal');
assert.match(admin, /data-withdrawal-approve/, 'คำขอ requested ต้องมีปุ่มอนุมัติ');
assert.match(admin, /data-withdrawal-reject/, 'คำขอ requested ต้องมีปุ่มปฏิเสธ');
assert.match(admin, /data-withdrawal-pay/, 'คำขอ approved ต้องมีปุ่มบันทึกโอน');
assert.match(admin, /uploadPrivateImage/, 'การปิดจ่ายต้องอัปโหลดหลักฐาน private');
assert.match(admin, /data-withdrawal-proof/, 'หลักฐานการโอนต้องเปิดใน Admin App ได้');
assert.match(media, /uploadPrivateImage/, 'Shared Media Service ต้องมี private upload helper');
assert.match(migration, /admin_review_withdrawal/, 'backend ต้องมี review RPC');
assert.match(migration, /Payment proof image is required/, 'server ต้องบังคับหลักฐานก่อนปิดจ่าย');

console.log('admin withdrawal workflow contract: PASS');
