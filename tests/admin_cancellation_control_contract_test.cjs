const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('admin/admin-control-plane-patch.js', 'utf8');

assert.match(source, /function cancellationReview/, 'Admin ต้องมี action sheet สำหรับพิจารณาคำขอยกเลิก');
assert.match(source, /resolve_order_cancellation/, 'Admin action ต้องส่งผลพิจารณาเข้า Edge Function');
assert.match(source, /order_cancellation_requests/, 'Admin ต้องโหลดคำขอยกเลิกจาก backend');
assert.match(source, /order_payments/, 'Admin ต้องตรวจ payment snapshot ก่อนตัดสินใจ');
assert.match(source, /approve_refund_pending/, 'Admin ต้องเลือกเปิด refund pending ได้อย่างชัดเจน');
assert.match(source, /พิจารณายกเลิก/, 'Order card ต้องมีทางเปิด action sheet โดยไม่แสดง form ใต้หน้า');
assert.match(source, /mpa-modal-backdrop/, 'การพิจารณาต้องเปิดเป็น popup/action sheet');
assert.match(source, /idempotency_key/, 'คำสั่ง Admin ต้องมี idempotency key');

console.log('admin cancellation control contract: PASS');
