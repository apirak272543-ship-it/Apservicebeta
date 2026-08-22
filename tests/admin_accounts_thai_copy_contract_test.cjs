const fs = require('fs');
const source = fs.readFileSync('admin/admin-accounts-thai-copy-patch.js', 'utf8');
const entrypoint = fs.readFileSync('admin/accounts.html', 'utf8');
const workflowPatch = fs.readFileSync('admin/admin-accounts-workflow-copy-patch.js', 'utf8');
for (const [english, thai] of [['Login ID', 'รหัสเข้าสู่ระบบ'], ['store_owner', 'เจ้าของร้าน'], ['customer', 'ลูกค้า'], ['rider', 'ไรเดอร์'], ['admin', 'ผู้ดูแล']]) {
  if (!source.includes(`['${english}', '${thai}']`)) throw new Error(`Missing Account localization: ${english}`);
}
if (!source.includes("replace(/\\bkey สำคัญ/g, 'ข้อมูลสำคัญ')")) throw new Error('Missing key localization');
if (!source.includes('การเพิ่ม/ผูกบัญชีไรเดอร์ต้องทำจาก')) throw new Error('Workflow copy must describe the Rider management destination once');
if (!source.includes('href="riders.html"')) throw new Error('Workflow copy must preserve Rider management href');
if (!workflowPatch.includes('การเพิ่ม/ผูกบัญชีไรเดอร์ต้องทำจาก <a href="riders.html">หน้าจัดการไรเดอร์</a>')) throw new Error('Workflow patch must provide the final Thai workflow copy');
if (!entrypoint.includes('admin-accounts-workflow-copy-patch.js?v=accounts-workflow-v1')) throw new Error('Accounts entrypoint must load workflow patch');
if (!entrypoint.includes('admin-accounts-thai-copy-patch.js?v=accounts-thai-v2-workflow')) throw new Error('Accounts entrypoint must cache-bust Thai workflow copy');
console.log('admin_accounts_thai_copy_contract_test: PASS');
