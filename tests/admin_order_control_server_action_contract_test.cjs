const assert = require('node:assert');
const fs = require('node:fs');

const source = fs.readFileSync('admin/admin-control-plane-patch.js', 'utf8');
assert.match(source, /function manageOrder\(/, 'Admin order UI must use a shared server-action helper');
assert.match(source, /action: 'manage_delivery_order'/, 'Admin must invoke the allow-listed Order Control Plane action');
assert.match(source, /manageOrder\(order, 'items'/, 'item edits must not write direct REST mutations');
assert.match(source, /manageOrder\(order, 'assign_rider'/, 'Rider assignment must not write direct REST mutations');
assert.match(source, /manageOrder\(order, 'status'/, 'status changes must not write direct REST mutations');
console.log('admin_order_control_server_action_contract_test: PASS');
