const fs = require('fs');
const source = fs.readFileSync('admin/admin-notifications-thai-copy-patch.js', 'utf8');
const entrypoint = fs.readFileSync('admin/notifications.html', 'utf8');
for (const snippet of ["rider: 'ไรเดอร์'", "customer: 'ลูกค้า'", "store_owner: 'เจ้าของร้าน'", 'ข้อมูลจากระบบส่วนกลาง', 'สถานะเป็นผลการส่งแจ้งเตือน', 'สถานะการอ่านอ้างอิงจากข้อมูลการอ่าน']) {
  if (!source.includes(snippet)) throw new Error(`Missing Notification Thai copy: ${snippet}`);
}
if (!entrypoint.includes('admin-notifications-thai-copy-patch.js?v=notifications-thai-v2-dynamic')) throw new Error('Notifications entrypoint must load current Thai copy patch');
console.log('admin_notifications_thai_copy_contract_test: PASS');
