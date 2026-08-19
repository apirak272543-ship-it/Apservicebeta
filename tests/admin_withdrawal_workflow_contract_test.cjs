const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const media = fs.readFileSync('shared/ap-service-media.js', 'utf8');
const deployedBackend = JSON.parse(fs.readFileSync('tests/deployed_supabase_contracts.json', 'utf8'));

assert.match(admin, /rpc\/admin_review_withdrawal/, 'Finance MPA ต้องเรียก server RPC สำหรับ review withdrawal');
assert.match(admin, /data-withdrawal-approve/, 'คำขอ requested ต้องมีปุ่มอนุมัติ');
assert.match(admin, /data-withdrawal-reject/, 'คำขอ requested ต้องมีปุ่มปฏิเสธ');
assert.match(admin, /data-withdrawal-pay/, 'คำขอ approved ต้องมีปุ่มบันทึกโอน');
assert.match(admin, /uploadPrivateImage/, 'การปิดจ่ายต้องอัปโหลดหลักฐาน private');
assert.match(admin, /data-withdrawal-proof/, 'หลักฐานการโอนต้องเปิดใน Admin App ได้');
assert.match(admin, /data:image\\\/\(\?:jpeg\|png\|webp\);base64,/, 'หลักฐานแบบ data URL เดิมต้องเปิดใน Admin ได้โดยไม่พยายามสร้าง signed URL');
assert.match(admin, /เชื่อมต่อระบบจัดเก็บหลักฐานไม่สำเร็จ/, 'ความล้มเหลวจาก network ต้องแสดงข้อความภาษาไทยที่เข้าใจง่าย');
assert.match(admin, /data-proof-error/, 'รูปหลักฐานที่แสดงไม่ได้ต้องมีข้อความใน modal แทน error ดิบ');
assert.match(media, /uploadPrivateImage/, 'Shared Media Service ต้องมี private upload helper');
assert.equal(deployedBackend.projectRef, 'abtsctwfkgzciseppach', 'ต้องยืนยันกับ Supabase หลักของ AP Service');
assert.equal(deployedBackend.migrations.wallet_withdrawal_requests, '20260814034815', 'backend ต้องมี migration คำขอถอนเงินที่เผยแพร่จริง');
assert.equal(deployedBackend.rpcs.admin_review_withdrawal.signature, 'admin_review_withdrawal(uuid,text,text,text,text)', 'backend ต้องมี review RPC ที่เผยแพร่จริง');
assert.equal(deployedBackend.rpcs.admin_review_withdrawal.requiresPaymentProofForPaid, true, 'server ต้องบังคับหลักฐานก่อนปิดจ่าย');

console.log('admin withdrawal workflow contract: PASS');
