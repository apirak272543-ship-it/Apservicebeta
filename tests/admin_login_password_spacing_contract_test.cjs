const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'shared', 'ap-login-media.css'), 'utf8');
const index = fs.readFileSync(path.join(root, 'admin', 'index.html'), 'utf8');
const media = fs.readFileSync(path.join(root, 'admin', 'login-media.html'), 'utf8');
const login = fs.readFileSync(path.join(root, 'admin', 'login.html'), 'utf8');

assert.match(css, /\.ap-login-field \.ap-login-control input \{ padding: 0 52px 0 62px; \}/, 'Password input with lock and reveal icon must reserve left and right text space');
for (const [entry, source] of Object.entries({ index, media, login })) {
  assert.match(source, /ap-login-media\.css\?v=auth-ui-v2-input-spacing/, `${entry} must request the password spacing stylesheet revision`);
}

console.log('admin login password spacing contract: PASS');
