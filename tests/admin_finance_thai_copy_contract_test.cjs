const assert = require('node:assert');
const fs = require('node:fs');

const app = fs.readFileSync('admin/admin-app.js', 'utf8');
const entrypoint = fs.readFileSync('admin/finance.html', 'utf8');

assert.match(app, /ตรวจสลิปการชำระเงินและติดตามคำขอถอนเงินตามสิทธิ์ผู้ดูแล/, 'Finance hero must use Thai task language');
assert.doesNotMatch(app, /ตรวจสลิปแบบ in-app/, 'Finance hero must not expose implementation wording');
assert.doesNotMatch(app, /คำขอถอนเงินตามสิทธิ์ Admin/, 'Finance hero must not expose role implementation wording');
assert.match(entrypoint, /admin-source-v13/, 'Finance entrypoint must cache-bust the current Admin source');
console.log('admin_finance_thai_copy_contract_test: PASS');
