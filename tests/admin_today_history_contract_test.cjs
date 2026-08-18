const fs = require('fs');
const assert = require('assert');

const runtime = fs.readFileSync('admin/admin-app.js', 'utf8');
const dashboard = fs.readFileSync('admin/dashboard.html', 'utf8');
const orders = fs.readFileSync('admin/orders.html', 'utf8');
const finance = fs.readFileSync('admin/finance.html', 'utf8');

assert.match(dashboard, /data-page="dashboard"/, 'ภาพรวมต้องเป็น Admin MPA route จริง');
assert.match(orders, /data-page="orders"/, 'ออร์เดอร์ต้องเป็น Admin MPA route จริง');
assert.match(finance, /data-page="finance"/, 'การเงินต้องเป็น Admin MPA route จริง');
assert.match(runtime, /delivery_orders\?select=id,store_name,customer_name,status,total,payable,ordered_at&order=ordered_at\.desc&limit=150/, 'หน้า Orders ต้องแสดงรายการล่าสุดตามวันสั่ง');
assert.match(runtime, /status=neq\.สำเร็จแล้ว/, 'Dashboard ต้องนับออร์เดอร์ที่ยังไม่ปิดเป็นงานค้าง');
assert.match(runtime, /payment_slip_reviews\?select=id,order_id,slip_path,expected_amount,status,preliminary_status,preliminary_result,uploaded_at/, 'Finance ต้องโหลดคิวตรวจสลิปพร้อมประวัติเวลาส่ง');
assert.match(runtime, /withdrawal_requests\?select=id,recipient_type,recipient_name,amount,status,admin_note,proof_image_url,payment_reference,requested_at,reviewed_at,paid_at,proof_available/, 'Finance ต้องโหลดคำขอถอนพร้อมสถานะและช่วงเวลาการอนุมัติ/จ่ายเงิน');
assert.match(runtime, /M\.ui\.empty\('ยังไม่มีออร์เดอร์'\)/, 'ต้องมี empty state สำหรับออร์เดอร์');
assert.match(runtime, /M\.ui\.empty\('ยังไม่มีสลิปรอตรวจสอบ'\)/, 'ต้องมี empty state สำหรับสลิปรอตรวจ');
assert.match(runtime, /M\.ui\.empty\('ไม่มีคำขอถอนเงินที่ต้องจัดการ'\)/, 'ต้องมี empty state สำหรับคำขอถอน');
assert.doesNotMatch(runtime, /admin_today_history_patch\.js/, 'Admin MPA ต้องไม่พึ่ง patch ของ monolith เดิม');

console.log('admin today/history contract: PASS');
