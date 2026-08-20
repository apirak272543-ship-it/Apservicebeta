const fs = require('fs');
const assert = require('assert');

const media = fs.readFileSync('admin/media.html', 'utf8');
const studio = fs.readFileSync('admin/customer-content-studio-patch.js', 'utf8');
const featurePatch = fs.readFileSync('admin/featured-store-management-patch.js', 'utf8');
const featureCss = fs.readFileSync('admin/featured-store-management.css', 'utf8');

assert.match(media, /featured-store-management\.css\?v=featured-store-v1/, 'Admin Media ต้องโหลด CSS ของส่วนร้านค้าเด่น');
assert.match(media, /featured-store-management-patch\.js\?v=featured-store-v1/, 'Admin Media ต้องโหลด runtime ของส่วนร้านค้าเด่น');
assert.match(featurePatch, /tab\.dataset\.contentTab = 'featured-stores'/, 'ร้านค้าเด่นต้องเป็นแท็บ additive ภายใน Content Studio');
assert.match(featurePatch, /tab\.textContent = 'ร้านค้าเด่น'/, 'แท็บใหม่ต้องมีชื่อที่ผู้ดูแลเข้าใจได้');
assert.match(featurePatch, /key: 'customer_promotions'/, 'โหมดการแสดงผลต้องใช้ config เดิมของ Customer');
assert.match(featurePatch, /featuredStores: \{ mode, limit, fallbackToAuto \}/, 'config ร้านค้าเด่นต้องเก็บโหมด จำนวน และ fallback');
assert.match(featurePatch, /campaign_type: 'store_sponsored'/, 'การสร้างพื้นที่โปรโมตต้องใช้ campaign เดิม');
assert.match(featurePatch, /campaign_stores\?on_conflict=campaign_id,store_id/, 'ร้านที่เลือกต้องเชื่อมด้วย campaign_stores เดิม');
assert.match(featurePatch, /MAX_FEATURED_STORES = 5/, 'จำนวนร้านเด่นต้องจำกัดไม่เกินห้าร้าน');
assert.match(featurePatch, /ยังไม่มีร้านที่พร้อมเลือกจาก catalog/, 'Admin ต้องเห็น empty state เมื่อ catalog ไม่มีร้านจริง');
assert.match(featureCss, /@media \(max-width:620px\)/, 'หน้าจัดการร้านค้าเด่นต้องมี layout สำหรับมือถือ');
assert.match(studio, /promotionConfig = safeJson\(promotionRows\?\.\[0\]\?\.value\)/, 'Content Studio ต้องเก็บ config banner เดิมก่อน merge');
assert.match(studio, /value: \{ \.\.\.promotionConfig, items: next\.promotions \}/, 'การบันทึก Banner ต้องไม่ลบ config ร้านค้าเด่น');

console.log('admin featured store management contract: PASS');
