const fs = require('fs');
const admin = fs.readFileSync('/home/ubuntu/Apservicebeta/admin/customer-content-studio-patch.js', 'utf8');
const customer = fs.readFileSync('/home/ubuntu/Apservice-/customer/customer-content-runtime.js', 'utf8');
const expected = [
  ['Admin default Parcel card', admin, "id: 'parcel'"],
  ['Admin add card action', admin, 'data-card-action="add"'],
  ['Admin external URL field', admin, 'type="url"'],
  ['Admin target selector', admin, 'targetField'],
  ['Customer extras resolver', customer, 'const extras'],
  ['Customer external target', customer, 'noopener noreferrer'],
  ['Customer card background', customer, 'backgroundUrl'],
];
for (const [label, text, token] of expected) {
  if (!text.includes(token)) throw new Error(`Missing ${label}: ${token}`);
}
console.log('customer_card_catalog_contract_test: PASS');
