const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const profile = fs.readFileSync(path.join(root, 'admin', 'profile.html'), 'utf8');
const patch = fs.readFileSync(path.join(root, 'admin', 'admin-control-plane-patch.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'admin', 'admin-profile.css'), 'utf8');

assert.match(profile, /<body data-page="profile">/, 'Bottom Profile route must render a current-admin profile page, not the account directory');
assert.match(profile, /admin-control-plane-patch\.js\?v=control-plane-v4-profile/, 'Profile entrypoint must request the current profile patch revision');
assert.match(patch, /profile: profilePatch/, 'Admin runtime must register the current-admin profile route');
assert.match(patch, /id="profileSignOut"/, 'Profile must expose an intentional logout action');
assert.match(patch, /href="accounts\.html">บัญชีทุกบทบาท/, 'Profile must offer a correctly labelled route to the all-account directory');
assert.match(styles, /body\[data-page="dashboard"\] #signOut \{ display:none; \}/, 'Dashboard hero must not promote logout as its primary CTA');

console.log('admin current profile and logout placement contract: PASS');
