const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const profile = fs.readFileSync(path.join(root, 'admin', 'profile.html'), 'utf8');
const patch = fs.readFileSync(path.join(root, 'admin', 'admin-control-plane-patch.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'admin', 'admin-app.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'admin', 'admin-profile.css'), 'utf8');
const dashboard = fs.readFileSync(path.join(root, 'admin', 'dashboard.html'), 'utf8');

assert.match(profile, /<body data-page="profile">/, 'Bottom Profile route must render a current-admin profile page, not the account directory');
assert.match(profile, /admin-app\.js\?v=admin-source-v12/, 'Profile entrypoint must request the canonical runtime revision');
assert.match(runtime, /async function profile\(\)/, 'Admin runtime must own the current-admin profile route');
assert.doesNotMatch(patch, /profile: profilePatch/, 'Control-plane patch must not own the current-admin profile route');
assert.match(runtime, /id="profileSignOut"/, 'Profile must expose an intentional logout action');
assert.match(runtime, /href="accounts\.html">บัญชีทุกบทบาท/, 'Profile must offer a correctly labelled route to the all-account directory');
assert.match(patch, /document\.querySelector\('#signOut'\)\?\.remove\(\)/, 'Dashboard hero must remove logout instead of promoting it as a primary CTA');
assert.match(dashboard, /admin-control-plane-patch\.js\?v=control-plane-v5-dashboard-feature-fit/, 'Dashboard must request the logout-placement patch revision');
assert.match(styles, /admin-profile-signout/, 'Logout presentation must remain scoped to the current-admin profile');

console.log('admin current profile and logout placement contract: PASS');
