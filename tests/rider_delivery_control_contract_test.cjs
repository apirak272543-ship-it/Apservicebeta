const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '..', 'supabase', 'functions', 'role-access', 'index.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const start = source.indexOf("if (body.action === 'update_rider_delivery')");
const end = source.indexOf("const { data: adminRole }", start);
assert.ok(start >= 0, 'role-access must expose the canonical update_rider_delivery action');
assert.ok(end > start, 'Rider delivery action must remain before the Admin-only branch');
const branch = source.slice(start, end);

assert.match(branch, /body\.action === 'update_rider_delivery'/);
assert.match(branch, /\['status', 'proof'\]\.includes\(operation\)/);
assert.match(branch, /user_roles.*eq\('user_id', caller\.id\).*eq\('role', 'rider'\)/s);
assert.match(branch, /order\.rider_id !== rider\.id/);
assert.match(branch, /compliance_status.*approved/);
assert.match(branch, /ORDER_TRANSITIONS\[String\(order\.status/);
assert.match(branch, /new Set\(\[ORDER_STATUS\.RIDER_PICKUP, ORDER_STATUS\.ARRIVED_STORE, ORDER_STATUS\.COLLECTED, ORDER_STATUS\.DELIVERING, ORDER_STATUS\.COMPLETED\]\)/);
assert.match(branch, /updates\.status = nextStatus/);
assert.match(branch, /updates\.proof_image = proofRef/);
assert.match(branch, /delivery-proofs\/\$\{caller\.id\}\/\$\{orderId\}\//);
assert.match(branch, /delivery-proofs/);
assert.match(branch, /jpg\|jpeg/i, 'proof path must be restricted to JPEG output');
assert.match(branch, /callerDb\.from\('delivery_orders'\)\.update\(updates\)\.eq\('id', orderId\)\.eq\('rider_id', rider\.id\)/);
assert.match(source, /const callerDb = createClient\(supabaseUrl, anonKey/);
assert.match(branch, /select\('id,rider_id,rider_name,status,workflow_state,dispatch_status,proof_image/);
assert.doesNotMatch(branch, /Object\.assign\(updates, input\)/, 'client data must never be spread into protected order fields');
assert.doesNotMatch(branch, /updates\.dispatch_status\s*=/, 'Rider action must not mutate Admin-owned dispatch metadata');

console.log('PASS rider_delivery_control_contract_test');
