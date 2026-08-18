const assert = require('assert');
const fs = require('fs');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const mpa = fs.readFileSync('shared/ap-service-mpa.js', 'utf8');
const dashboard = fs.readFileSync('admin/dashboard.html', 'utf8');
const stores = fs.readFileSync('admin/stores.html', 'utf8');
const operations = fs.readFileSync('admin/operations.html', 'utf8');

assert.match(admin, /async function gate\(active, content\) \{\s*app\(active, content\);\s*const access = await M\.auth\.requireRole/, 'Admin ต้อง render shell ก่อนตรวจสิทธิ์และ network request');
assert.match(admin, /sessionStorage\.getItem\(adminBadgeStorageKey\)/, 'badge ต้องแสดง cached value ก่อน refresh');
assert.match(admin, /setTimeout\(async \(\) =>/, 'badge network refresh ต้องเลื่อนทำงานแบบ asynchronous');
assert.match(admin, /badge failures never block a route/, 'ความล้มเหลวของ badge ต้องไม่ block navigation');
assert.match(admin, /Promise\.all\(\[countRows\('delivery_orders/, 'badge ต้องดึง counters พร้อมกันแบบ background');
assert.match(admin, /const dashboardCounts = async requestCount => Promise\.all/, 'dashboard ต้องโหลด summary counters พร้อมกัน');
assert.match(admin, /createScope\(name\)/, 'route request ต้องผูก scope และยกเลิกเมื่อเปลี่ยนหน้า');
assert.match(admin, /startBackgroundSync\(\{ key: 'admin-dashboard-counts'/, 'การ refresh dashboard ต้องเป็น background sync');
assert.match(admin, /delivery_orders\?select=id,store_name,customer_name,status,total,payable,ordered_at/, 'หน้า Orders ต้อง select เฉพาะ fields ที่ใช้');
assert.match(admin, /stores\?select=id,name,owner_email,phone,rating,eta,active,image_url,background_url,settlement_gp_percent/, 'หน้า Stores ต้อง select เฉพาะ fields ที่ใช้');
assert.match(admin, /ai_workspace_threads\?select=id,title,description,status,created_at,updated_at/, 'AI Workspace ต้อง select เฉพาะ fields ที่ใช้');
assert.doesNotMatch(admin, /select=\*/, 'Admin runtime ต้องไม่ใช้ select=*');
assert.match(mpa, /cacheTtlMs/, 'Shared MPA runtime ต้องรองรับ short-lived request cache');
assert.match(mpa, /AbortController/, 'Shared MPA runtime ต้องยกเลิก request ที่หมดอายุเมื่อเปลี่ยนหน้า');
assert.match(dashboard, /data-page="dashboard"/, 'dashboard ต้องเป็น route จริงของ MPA');
assert.match(stores, /data-page="stores"/, 'stores ต้องเป็น route จริงของ MPA');
assert.match(operations, /data-page="operations"/, 'Operations ต้องเป็น route จริงของ MPA');

console.log('admin performance audit contract: PASS');
