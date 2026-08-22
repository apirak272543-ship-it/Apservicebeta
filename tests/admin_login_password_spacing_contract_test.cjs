const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'shared', 'ap-login-media.css'), 'utf8');
const index = fs.readFileSync(path.join(root, 'admin', 'index.html'), 'utf8');
const media = fs.readFileSync(path.join(root, 'admin', 'login-media.html'), 'utf8');
const login = fs.readFileSync(path.join(root, 'admin', 'login.html'), 'utf8');

assert.match(css, /\.ap-login-field \.ap-login-control input \{ padding: 0 52px 0 62px; \}/, 'Shared login input with icon controls must reserve left and right text space');
const polish = fs.readFileSync(path.join(root, 'admin', 'admin-ui-polish.css'), 'utf8');
assert.match(polish, /#loginForm \.ap-login-control > input \{ padding-left: 62px !important; padding-right: 52px !important; \}/, 'Admin Login must enforce input spacing against later cascade overrides');
assert.match(index, /admin-ui-polish\.css\?v=admin-ui-polish-v2-login-control-spacing/, 'Admin index must request the login spacing polish revision');
for (const [entry, source] of Object.entries({ index, media, login })) {
  assert.match(source, /ap-login-media\.css\?v=auth-ui-v2-input-spacing/, `${entry} must request the password spacing stylesheet revision`);
}

console.log('admin login password spacing contract: PASS');
