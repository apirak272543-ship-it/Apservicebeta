const fs = require('fs');
const source = fs.readFileSync('admin/admin-settings-thai-copy-patch.js', 'utf8');
const entrypoint = fs.readFileSync('admin/settings.html', 'utf8');
for (const snippet of ['ค่าเริ่มต้นของอาหาร ส่งของ A→B และงานรับส่ง', 'ระบบส่วนกลาง', "['Food Delivery', 'ส่งอาหาร']", "['Parcel Delivery', 'ส่งของ A→B']"]) {
  if (!source.includes(snippet)) throw new Error(`Missing Settings Thai copy: ${snippet}`);
}
if (!entrypoint.includes('admin-settings-thai-copy-patch.js?v=settings-thai-v1')) throw new Error('Settings entrypoint must load Thai copy patch');
console.log('admin_settings_thai_copy_contract_test: PASS');
