const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '..', 'admin', 'customer-visual-settings-patch.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'admin', 'media.html'), 'utf8');

for (const token of [
  'const directionChoices',
  'default.direction',
  'festival.direction',
  'page.${key}.direction',
  'direction: value(`page.${key}.direction`)',
  'direction: value(\'default.direction\')',
  'customer-visual-settings-patch.js?v=motion-direction-v1'
]) {
  if (!source.includes(token) && !html.includes(token)) throw new Error(`Missing direction contract token: ${token}`);
}
const pageCards = (source.match(/pageCard\(/g) || []).length;
if (pageCards < 1) throw new Error('Missing page card renderer');
console.log('customer_motion_direction_contract_test: PASS');
