const assert = require('node:assert');
const fs = require('node:fs');

const source = fs.readFileSync('admin/customer-content-studio-patch.js', 'utf8');
const entrypoint = fs.readFileSync('admin/media.html', 'utf8');

assert.match(source, /ศูนย์จัดการเนื้อหาหน้าลูกค้า/, 'Media hero must use Thai task language');
assert.match(source, /ตั้งค่าข้อความ ปุ่ม ไอคอน ภาพพื้นหลัง การ์ดบริการ และแบนเนอร์โฆษณา/, 'Media hero must describe visible work, not internal plumbing');
assert.match(source, /localizeContentStudioCopy\(host\)/, 'Rendered content tabs and labels must be localized before interaction binding');
assert.match(source, /\['Media registry', 'คลังสื่อ'\]/, 'Media registry tab must be localized');
assert.match(source, /\['Banner โฆษณา', 'แบนเนอร์โฆษณา'\]/, 'Banner tab must be localized');
assert.match(source, /\['Eyebrow', 'ข้อความกำกับ'\]/, 'Form labels must be localized');
assert.match(entrypoint, /content-studio-v5-thai-copy/, 'Media entrypoint must cache-bust the Thai Content Studio copy');
console.log('admin_media_thai_copy_contract_test: PASS');
