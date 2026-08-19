const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const riderRoot = path.resolve(root, '..', 'legacy-rider');
const readRider = file => fs.readFileSync(path.join(riderRoot, file), 'utf8');
if (!fs.existsSync(riderRoot)) {
  console.log('withdrawal_payment_reliability_contract_test: SKIP (legacy-only audit fixture /tmp/legacy-rider is unavailable; current MPA coverage belongs to the Rider repository contracts)');
  process.exit(0);
}
const adminPatch = read('withdrawal_payment_reliability_patch.js');
const riderPatch = readRider('rider_payout_proof_patch.js');
const deployedBackend = JSON.parse(fs.readFileSync(path.join(__dirname, 'deployed_supabase_contracts.json'), 'utf8'));
const adminConsole = read('legacy-admin-console.html');
const rider = readRider('rider.html');

assert.match(adminPatch, /withdrawal-proofs/, 'ต้องกำหนด bucket หลักฐานการจ่าย');
assert.match(adminPatch, /storage\/v1\/object\/\$\{BUCKET\}/, 'ต้องอัปโหลดรูปผ่าน Storage object endpoint');
assert.match(adminPatch, /p_proof_image_url: storagePath/, 'RPC ต้องรับ storage path แทน Base64');
assert.match(adminPatch, /createImageBitmap/, 'ต้องบีบอัดรูปด้วย ImageBitmap สำหรับ Android');
assert.match(adminPatch, /MAX_SOURCE_BYTES = 5 \* 1024 \* 1024/, 'ต้องจำกัดรูปต้นทางไม่เกิน 5 MB');
assert.match(adminPatch, /MAX_PROOF_BYTES = 420 \* 1024/, 'ต้องจำกัดรูปหลังบีบอัดสำหรับมือถือ');
assert.doesNotMatch(adminPatch, /clearSession\(\)/, 'เส้นทาง refresh session ใหม่ต้องไม่ล้าง session หรือบังคับ logout');
assert.match(adminPatch, /งานและหน้าปัจจุบันจะไม่ถูกปิด/, 'ต้องแจ้งชัดว่าหน้าปัจจุบันยังอยู่เมื่อ session หมดอายุ');
assert.match(adminPatch, /select=id,recipient_type,store_id,rider_id/, 'รายการคำขอฝั่ง Admin ต้องไม่ดึง Base64 ด้วย select=*');
assert.match(riderPatch, /proof_available/, 'Rider ต้องรับ metadata ว่าหลักฐานพร้อมดู');
assert.match(riderPatch, /viewRiderWithdrawalProof/, 'Rider ต้องมี action เปิดหลักฐานแบบ on-demand');
assert.match(riderPatch, /storage\/v1\/object/, 'Rider ต้องเปิดหลักฐานผ่าน Private Storage');
assert.doesNotMatch(riderPatch, /select=\*.*withdrawal_requests/, 'Rider ต้องไม่ดึง Base64 ทั้งรายการคำขอ');
assert.equal(deployedBackend.projectRef, 'abtsctwfkgzciseppach', 'ต้องยืนยันกับ Supabase หลักของ AP Service');
assert.equal(deployedBackend.migrations.withdrawal_proof_storage, '20260817011456', 'ต้องมี migration Private Storage ที่เผยแพร่จริง');
assert.equal(deployedBackend.rpcs.admin_review_withdrawal.setsProofAvailableWhenPaid, true, 'backend ต้องเปิด metadata หลักฐานเมื่อบันทึกการจ่าย');
assert.match(adminConsole, /withdrawal_payment_reliability_patch\.js/, 'Admin console runtime ต้องโหลดแพตช์ความเสถียร');
assert.match(rider, /rider_payout_proof_patch\.js/, 'Rider runtime ต้องโหลดแพตช์หลักฐานการจ่ายจาก repository Rider');

console.log('withdrawal_payment_reliability_contract_test: PASS');
