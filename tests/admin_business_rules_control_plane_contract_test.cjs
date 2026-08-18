const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.match(app, /id="businessRules"/, 'Admin ต้องมี structured business rules form');
assert.match(app, /data-rule="\$\{service\}:\$\{key\}"/, 'Admin ต้องกำหนดค่าราคาตาม service type ได้');
assert.match(app, /pricingForm\('food', 'Food Delivery'\)/, 'Admin ต้องกำหนด Food delivery rate ได้');
assert.match(app, /pricingForm\('parcel', 'Parcel Delivery'\)/, 'Admin ต้องกำหนด Parcel delivery rate ได้');
assert.match(app, /pricingForm\('errand', 'Errand \/ ฝากซื้อ'\)/, 'Admin ต้องกำหนด Errand rate ได้');
assert.match(app, /data-rule="settlement:gp_rate_percent"/, 'Admin ต้องกำหนด GP ได้');
assert.match(app, /service_fee/, 'Admin ต้องกำหนดค่าบริการได้');
assert.match(app, /key: 'business_rules'/, 'กติกากลางต้องบันทึกที่ central platform_configs');
assert.match(app, /key === 'gp_rate_percent' && number > 100/, 'GP ต้องมี client validation ขั้นพื้นฐาน');
assert.match(app, /window\.confirm\('ยืนยันบันทึกกติกาธุรกิจกลาง/, 'ต้องขอยืนยันก่อนเปลี่ยน business rules');

console.log('admin business rules control-plane contract: PASS');
