const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../supabase/functions/role-access/index.ts'), 'utf8');
const storeUi = fs.readFileSync(path.resolve(__dirname, '../admin/admin-control-plane-completeness.js'), 'utf8');

assert.match(source, /const secureTemporaryPassword/, 'Credential workflow must use a shared temporary-password policy');
assert.match(source, /body\.action === 'reset_rider_password'/, 'Role access must expose a Rider credential reset action');
assert.match(source, /body\.action === 'reset_store_password'/, 'Role access must preserve a Merchant credential reset action');
assert.match(source, /body\.action === 'provision_store_owner'/, 'Store creation must use a supported atomic provision action');
assert.match(source, /admin\.auth\.admin\.deleteUser\(userId\)/, 'Failed store provisioning must clean up the newly-created auth user');
assert.match(storeUi, /field\('password'.*minlength="12"/, 'Visible Merchant create form must require the backend password length');
assert.match(storeUi, /เงื่อนไขรหัสผ่าน/, 'Visible Merchant create form must explain the password policy');
assert.match(source, /admin\.auth\.admin\.updateUserById\(rider\.user_id, \{ password \}\)/, 'Rider reset must update only the rider account bound to the selected entity');
assert.match(source, /action: 'rider_password_reset', after_state: \{ rider_id: entityId \}/, 'Rider password reset audit must contain only the entity ID, never the password');
assert.match(source, /action: 'store_password_reset', after_state: \{ store_id: entityId \}/, 'Merchant password reset audit must contain only the entity ID, never the password');

console.log('admin merchant/rider credential contract: PASS');
