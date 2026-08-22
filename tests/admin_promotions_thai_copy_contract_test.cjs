const fs = require('fs');
const source = fs.readFileSync('admin/admin-promotions-thai-copy-patch.js', 'utf8');
const renderer = fs.readFileSync('admin/admin-control-plane-patch.js', 'utf8');
const entrypoint = fs.readFileSync('admin/promotions.html', 'utf8');
for (const snippet of ['แบรนด์หน้าลูกค้า', 'ภาพพื้นหลัง', 'ภาพแบนเนอร์', 'ที่อยู่รูปเดิม (ถ้ามี)']) {
  if (!source.includes(snippet)) throw new Error(`Missing Promotions Thai copy/media control: ${snippet}`);
}
for (const snippet of ['เลือกจากคลังภาพ', 'ถ่ายรูป', 'capture="environment"']) if (!renderer.includes(snippet)) throw new Error(`Missing Promotions media control: ${snippet}`);
if (!entrypoint.includes('admin-promotions-thai-copy-patch.js?v=promotions-thai-v1')) throw new Error('Promotions entrypoint must load Thai copy patch');
console.log('admin_promotions_thai_copy_contract_test: PASS');
