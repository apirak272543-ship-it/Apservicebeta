const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..', 'admin');
const app = fs.readFileSync(path.join(root, 'admin-app.js'), 'utf8');
const pages = ['dashboard', 'orders', 'stores', 'riders', 'customers', 'finance', 'notifications', 'promotions', 'ai-workspace', 'settings'];

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, `${page}.html`), 'utf8');
  assert.match(html, new RegExp(`data-page=["']${page}["']`), `${page}.html ต้องประกาศ data-page ที่ตรง route`);
  assert.match(html, /\.\.\/shared\/ap-service-mpa\.js/, `${page}.html ต้องโหลด Shared MPA runtime`);
  assert.match(html, /admin-app\.js/, `${page}.html ต้องโหลด Admin runtime`);
  assert.match(app, new RegExp(`async function ${page === 'ai-workspace' ? 'aiWorkspace' : page}\\(`), `${page} ต้องมี handler ใน admin-app.js`);
}

assert.doesNotMatch(app, /href="\.\.\/admin\.html\?admin=/, 'legacy menu ต้องไม่ชี้ compatibility redirect ที่ทิ้ง deeplink');
assert.match(app, /legacy-admin-console\.html\?admin=/, 'legacy menu ต้องชี้ legacy console โดยตรง');

console.log('admin route dispatch contract: PASS');
