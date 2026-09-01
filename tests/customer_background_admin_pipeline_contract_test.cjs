const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const media = fs.readFileSync(path.join(root, 'shared/ap-service-media.js'), 'utf8');
const visual = fs.readFileSync(path.join(root, 'admin/customer-visual-settings-patch.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'admin/media.html'), 'utf8');
assert.match(media, /CUSTOMER_BACKGROUND:\s*Object\.freeze/);
assert.match(visual, /key=eq\.customer_visuals/);
assert.match(visual, /scope: 'customer-visuals'/);
assert.match(visual, /bucket: 'catalog-media'/);
assert.match(visual, /mediaType: 'CUSTOMER_BACKGROUND'/);
assert.match(visual, /uploaded\.publicUrl/);
assert.match(visual, /platform_configs\?select=value&key=eq\.customer_visuals/);
assert.match(visual, /stableJson\(saved\) !== stableJson\(next\)/);
assert.match(html, /ap-service-media\.js\?v=shared-media-v8-customer-background-contract/);
console.log('customer_background_admin_pipeline_contract_test: PASS');
