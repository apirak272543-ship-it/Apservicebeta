const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'admin', 'admin-app.js'), 'utf8');
const page = fs.readFileSync(path.join(root, 'admin', 'dashboard.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'admin', 'admin-management.css'), 'utf8');

assert.match(app, /const dashboardFinance = async/);
assert.match(app, /Promise\.allSettled/);
assert.match(app, /delivery_orders\?select=id,status,total,payable,payment_received/);
assert.match(app, /rider_earnings\?select=order_id,rider_share,platform_share/);
assert.match(app, /cash_ledger\?select=id,entry_type,amount/);
assert.match(app, /ยังไม่พบรายการในสมุดเงินสด/);
assert.match(app, /ไม่พร้อมใช้งาน/);
assert.match(app, /ทางลัดเพิ่มเติม/);
assert.match(app, /admin-dashboard-counts/);
assert.match(app, /sessionStorage/);
assert.match(page, /admin-app\.js\?v=admin-source-v12/);
assert.match(page, /admin-management\.css\?v=admin-management-v2/);
assert.match(css, /\.admin-finance-grid/);
assert.match(css, /@media\(max-width:760px\)/);
assert.doesNotMatch(app, /orderValueToday:\s*(?:100|999|1234)/);
assert.doesNotMatch(app, /platformToday:\s*(?:100|999|1234)/);
assert.doesNotMatch(app, /withdrawals:\s*\{\s*available:\s*true,\s*amount:\s*(?:100|999|1234)/);

console.log('admin dashboard finance contract: PASS');
