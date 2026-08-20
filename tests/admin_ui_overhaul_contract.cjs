const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('admin/admin-app.js', 'utf8');
const css = fs.readFileSync('admin/admin-ui-overhaul.css', 'utf8');
const js = fs.readFileSync('admin/admin-ui-overhaul.js', 'utf8');

assert.match(app, /admin-ui-overhaul\.css\?v=admin-ui-overhaul-v1/);
assert.match(app, /admin-ui-overhaul\.js\?v=admin-ui-overhaul-v1/);
assert.match(css, /\.admin-command-backdrop/);
assert.match(css, /\.admin-color-panel/);
assert.match(css, /\.admin-table-search/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /\.mpa-button:active/);
assert.match(js, /Control\+K/);
assert.match(js, /data-admin-color-swatch/);
assert.match(js, /data-admin-density/);
assert.match(js, /MutationObserver/);
assert.match(js, /localStorage/);
console.log('admin UI overhaul contract: PASS');
