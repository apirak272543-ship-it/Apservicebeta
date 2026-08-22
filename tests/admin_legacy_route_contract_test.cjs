const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('admin/admin-app.js', 'utf8');
const operations = fs.readFileSync('admin/operations.html', 'utf8');

assert.match(source, /\['content','เนื้อหาเดิม','promotions\.html'\]/, 'legacy content link must point to canonical Promotions');
assert.match(source, /\['admins','ผู้ใช้และบทบาท','accounts\.html'\]/, 'legacy admins link must point to canonical Accounts');
assert.match(source, /page === 'operations' && feature === 'content'/, 'direct legacy content route must be handled');
assert.match(source, /location\.replace\('promotions\.html'\)/, 'legacy content route must redirect to Promotions');
assert.match(source, /page === 'operations' && feature === 'admins'/, 'direct legacy admins route must be handled');
assert.match(source, /location\.replace\(`accounts\.html\$\{role\}`\)/, 'legacy admins route must redirect to Accounts and preserve validated role filter');
assert.match(source, /\['admin','customer','store_owner','rider'\]\.includes\(params\.get\('role'\)\)/, 'legacy role filter must be allowlisted before redirect');
assert.match(source, /inventory: \{ title: 'รายงานสินค้าและสต็อก'/, 'inventory must be explicitly labeled as a report');
assert.match(source, /const inventoryCallout = feature === 'inventory'/, 'inventory route must render the read-only callout');
assert.match(source, /href="admin-retail\.html">เปิด Admin Retail/, 'inventory report must link to the canonical Admin Retail editor');
assert.match(source, /menu_items\?select=id,store_id,name,price,cost,stock,available/, 'inventory report must retain read-only data visibility');
assert.match(operations, /data-page="operations"/, 'legacy Operations entry remains available for compatibility');

console.log('admin_legacy_route_contract_test: PASS');
