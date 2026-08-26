const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('supabase/functions/role-access/index.ts', 'utf8');

assert.match(source, /const metadata = body\.metadata/, 'review action ต้องอ่าน metadata จาก Admin payload');
assert.match(source, /metadata\?\.identity_verified === true/, 'approval ต้องบังคับ identity_verified เป็น true');
assert.match(source, /licenseNumber = text\(metadata\?\.license_number\)/, 'approval ต้องอ่าน license_number จาก metadata');
assert.match(source, /licenseExpiry = text\(metadata\?\.license_expiry\)/, 'approval ต้องอ่าน license expiry จาก metadata');
assert.match(source, /insuranceExpiry = text\(metadata\?\.insurance_expiry\)/, 'approval ต้องอ่าน insurance expiry จาก metadata');
assert.match(source, /Object\.assign\(updates, \{ identity_verified: true, license_number: licenseNumber, license_expiry: licenseExpiry, insurance_expiry: insuranceExpiry \}\)/, 'approval ต้อง persist protected metadata ใน update เดียวกับสถานะ');
assert.match(source, /else \{\s*updates\.ride_available = false; updates\.status = 'ไม่พร้อมรับงาน'/, 'rejected flow ต้องคงการปิด availability');
assert.match(source, /\/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$\/.test\(value\)/, 'วันที่ต้องผ่านรูปแบบ ISO date ก่อน approval');

console.log('role-access rider compliance metadata contract: PASS');
