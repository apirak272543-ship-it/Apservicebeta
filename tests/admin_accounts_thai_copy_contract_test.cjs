const fs = require('fs');
const source = fs.readFileSync('admin/admin-accounts-thai-copy-patch.js', 'utf8');
const entrypoint = fs.readFileSync('admin/accounts.html', 'utf8');
for (const [english, thai] of [['Login ID', 'รหัสเข้าสู่ระบบ'], ['store_owner', 'เจ้าของร้าน'], ['customer', 'ลูกค้า'], ['rider', 'ไรเดอร์'], ['admin', 'ผู้ดูแล']]) {
  if (!source.includes(`['${english}', '${thai}']`)) throw new Error(`Missing Account localization: ${english}`);
}
if (!source.includes("replace(/\\bkey สำคัญ/g, 'ข้อมูลสำคัญ')")) throw new Error('Missing key localization');
if (!entrypoint.includes('admin-accounts-thai-copy-patch.js?v=accounts-thai-v1')) throw new Error('Accounts entrypoint must load Thai copy patch');
console.log('admin_accounts_thai_copy_contract_test: PASS');
