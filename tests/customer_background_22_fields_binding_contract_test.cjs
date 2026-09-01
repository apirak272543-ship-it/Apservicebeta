const fs = require('fs');
const path = require('path');

const file = fs.readFileSync(path.join(__dirname, '..', 'admin', 'customer-visual-settings-patch.js'), 'utf8');

if (!file.includes('data-visual-url="${esc(name)}"')) {
  throw new Error('Background hidden URL input must bind data-visual-url to the field name');
}
if (!file.includes('const pageChoices = [')) {
  throw new Error('Background page choices are missing');
}
const pageChoices = file.match(/\['[^']+',\s*'[^']+'\]/g) || [];
if (pageChoices.length < 22) {
  throw new Error(`Expected default plus 21 page Background fields, found ${pageChoices.length}`);
}
for (const key of ['home', 'stores', 'store', 'orders', 'order', 'checkout', 'profile', 'notifications', 'support', 'parcel', 'retail', 'retail-checkout', 'marketplace', 'marketplace-item', 'marketplace-new', 'marketplace-profile', 'marketplace-chat', 'register', 'recover', 'update-password', 'privacy']) {
  if (!file.includes(`['${key}',`)) throw new Error(`Missing Background page key: ${key}`);
}
if (!file.includes('mediaType: \'CUSTOMER_BACKGROUND\'')) {
  throw new Error('Background upload must use CUSTOMER_BACKGROUND media type');
}
if (!file.includes("key: 'customer_visuals'")) {
  throw new Error('Background save must target customer_visuals');
}
console.log('customer_background_22_fields_binding_contract_test: PASS');
