const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const entry = fs.readFileSync(path.join(root, 'admin', 'index.html'), 'utf8');
const patch = fs.readFileSync(path.join(root, 'admin', 'admin-login-validation-patch.js'), 'utf8');

assert.match(entry, /admin-login-validation-patch\.js\?v=admin-login-validation-v1/, 'Admin Login must load its submit-validation runtime patch');
assert.match(patch, /form\.noValidate = true/, 'Admin Login must let its Thai validation handler receive empty-submit events');
assert.match(patch, /new MutationObserver/, 'Async Admin Login render must receive the validation patch after its form is inserted');

console.log('admin login submit validation contract: PASS');
