const assert = require('node:assert/strict');
const fs = require('node:fs');

const runtime = fs.readFileSync('shared/ap-service-mpa.js', 'utf8');
const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const mediaPage = fs.readFileSync('admin/media.html', 'utf8');
const loginPage = fs.readFileSync('admin/login-media.html', 'utf8');
const mediaTab = fs.readFileSync('admin/admin-login-media-tab.js', 'utf8');

assert.match(runtime, /data-confirm data-logout-bypass="true"/, 'Confirm logout action must bypass the global logout click trap');
assert.match(runtime, /control\.closest\?\.\('#mpa-signout-confirm'\)/, 'Logout click trap must ignore controls inside its own confirmation modal');
assert.match(admin, /const routeFor = key => \(\{ retail: 'admin-retail\.html' \}\[key\]/, 'Retail nav must route to the implemented Admin entrypoint');
assert.match(mediaPage, /admin-login-media-tab\.js/, 'Media page must load the inline Login media tab');
assert.doesNotMatch(mediaPage, /จัดการพื้นหลังหน้า Login \/ GIF เทศกาล/, 'Login media must not remain as a detached footer link');
assert.match(mediaTab, /button\.dataset\.contentTab = tab/, 'Content Studio must create a Login media tab');
assert.match(mediaTab, /src="login-media\.html\?embedded=1"/, 'Login media workflow must stay available inside the media tab');
assert.match(loginPage, /data-embedded/, 'Login media page must support embedded mode for the Content Studio tab');
assert.ok(fs.existsSync('admin/admin-retail.html'), 'Retail Admin entrypoint must exist');

const adminRoutes = ['dashboard', 'orders', 'stores', 'riders', 'customers', 'finance', 'notifications', 'promotions', 'media', 'retail', 'ai-workspace', 'settings'];
adminRoutes.forEach((route) => {
  const entrypoint = route === 'retail' ? 'admin/admin-retail.html' : `admin/${route}.html`;
  assert.ok(fs.existsSync(entrypoint), `Admin menu route ${route} must resolve to an existing entrypoint`);
});
console.log('admin screenshot-verified fixes contract: PASS');
