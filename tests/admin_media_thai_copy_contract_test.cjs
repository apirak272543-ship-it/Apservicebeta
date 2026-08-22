const assert = require('node:assert');
const fs = require('node:fs');

const source = fs.readFileSync('admin/customer-content-studio-patch.js', 'utf8');
const entrypoint = fs.readFileSync('admin/media.html', 'utf8');
const loginMediaTab = fs.readFileSync('admin/admin-login-media-tab.js', 'utf8');

assert.match(source, /ศูนย์จัดการเนื้อหาหน้าลูกค้า/, 'Media hero must use Thai task language');
assert.match(source, /ตั้งค่าข้อความ ปุ่ม ไอคอน ภาพพื้นหลัง การ์ดบริการ และแบนเนอร์โฆษณา/, 'Media hero must describe visible work, not internal plumbing');
assert.match(source, /localizeContentStudioCopy\(host\)/, 'Rendered content tabs and labels must be localized before interaction binding');
assert.match(source, /\['Media registry', 'คลังสื่อ'\]/, 'Media registry tab must be localized');
assert.match(source, /\['Banner โฆษณา', 'แบนเนอร์โฆษณา'\]/, 'Banner tab must be localized');
assert.match(source, /\['Eyebrow', 'ข้อความกำกับ'\]/, 'Form labels must be localized');
assert.match(source, /\['พื้นหลังหน้า Login', 'พื้นหลังหน้าลงชื่อเข้าใช้'\]/, 'Login-background tab must use Thai task language');
assert.match(entrypoint, /content-studio-v7-deep-labels/, 'Media entrypoint must cache-bust the current Thai Content Studio copy');
assert.match(entrypoint, /login-media-tab-v2-thai-copy/, 'Post-render login-media tab must cache-bust the Thai copy');
assert.match(loginMediaTab, /button\.textContent = 'พื้นหลังหน้าลงชื่อเข้าใช้'/, 'Post-render tab label must be Thai');
assert.match(loginMediaTab, /ภาพพื้นหลังและภาพเคลื่อนไหวตามเทศกาล/, 'Post-render panel heading must be Thai task language');
assert.match(source, /copy\.set\('ข้อความบน Header และตะกร้า', 'ข้อความส่วนบนและตะกร้า'\)/, 'Navigation panel heading must be fully Thai');
assert.match(source, /localizePromotionCopy\(host\)/, 'Dynamic promotion labels must be localized after rendering');
console.log('admin_media_thai_copy_contract_test: PASS');
