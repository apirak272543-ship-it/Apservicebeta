const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const patch = fs.readFileSync('admin/admin-control-plane-patch.js', 'utf8');
const storesPage = fs.readFileSync('admin/stores.html', 'utf8');
const storeLocationPicker = fs.readFileSync('admin/admin-store-location-picker.js', 'utf8');
const financePage = fs.readFileSync('admin/finance.html', 'utf8');
const loginPage = fs.readFileSync('admin/index.html', 'utf8');
const completeness = fs.readFileSync('admin/admin-control-plane-completeness.js', 'utf8');
const migrationPath = '../apservice-repo/supabase/migrations/20260819_admin_control_plane_store_profiles.sql';
const roleAccessPath = '../apservice-repo/supabase/functions/role-access/index.ts';
const migration = fs.existsSync(migrationPath) ? fs.readFileSync(migrationPath, 'utf8') : null;
const roleAccess = fs.existsSync(roleAccessPath) ? fs.readFileSync(roleAccessPath, 'utf8') : null;

assert.doesNotMatch(patch, /accounts:\s*accountsPatch/, 'หน้า accounts ต้องใช้ Account Control Plane รุ่นใหม่ ไม่ถูก override ด้วย patch เก่า');
assert.match(admin, /operationsV2\('admins'\)/, 'route accounts ต้องเปิด Account Control Plane รุ่นใหม่');
assert.doesNotMatch(admin, /เข้าสู่ระบบด้วยบัญชีที่ได้รับสิทธิ์ Admin ใน Supabase/, 'หน้า Login ต้องไม่มีข้อความระบบ');
assert.doesNotMatch(admin, /Admin Application นี้ทำงานแยกจาก Customer Application/, 'หน้า Login ต้องไม่มีข้อความระบบด้านล่าง');
assert.match(admin, /aria-label="อีเมล"/, 'หน้า Login ต้องคง label สำหรับ accessibility');
assert.match(storesPage, /admin-control-plane-completeness\.js/, 'หน้าร้านต้องโหลด action sheet ความครบถ้วน');
assert.match(storesPage, /admin-store-location-picker\.js\?v=store-map-v2/, 'หน้าร้านต้องโหลดตัวเลือกตำแหน่งรุ่นล่าสุด');
assert.match(storeLocationPicker, /form\[data-store-form\], form\[data-form\]/, 'ตัวเลือกตำแหน่งต้องรองรับฟอร์ม Store Control Plane ที่สร้างจริง');
assert.match(storeLocationPicker, /form\.elements\.location_lat && form\.elements\.location_lng/, 'ตัวเลือกตำแหน่งต้องติดตั้งเฉพาะฟอร์มที่มีพิกัดร้าน');
assert.match(financePage, /admin-control-plane-completeness\.js/, 'หน้าการเงินต้องโหลด withdrawal review sheet');
assert.match(loginPage, /admin-control-plane-completeness\.css/, 'หน้า Login ต้องโหลด style สำหรับ hidden accessibility labels');
assert.match(completeness, /ข้อมูลนิติบุคคลและติดต่อ/, 'Store ต้องมี action ข้อมูลนิติบุคคลและติดต่อ');
assert.match(completeness, /ที่อยู่และพิกัด/, 'Store ต้องมี action ที่อยู่และพิกัด');
assert.match(completeness, /เอกสารร้าน/, 'Store ต้องมี action เอกสารร้าน');
assert.match(completeness, /uploadPrivateImage[\s\S]*bucket: 'store-documents'/, 'เอกสารร้านต้องผ่าน Shared Media Service ในพื้นที่ private');
assert.match(completeness, /get_withdrawal_review_detail/, 'คำขอถอนต้องอ่านข้อมูลผู้รับผ่าน server action');
assert.match(completeness, /ตรวจผู้รับและช่องทางรับเงิน/, 'ก่อนอนุมัติหรือจ่ายต้องมี sheet ตรวจผู้รับ');
if (roleAccess && migration) {
  assert.match(roleAccess, /get_withdrawal_review_detail/, 'backend ต้องรองรับ withdrawal detail แบบ server-authorized');
  assert.match(roleAccess, /\['general', 'identity', 'addresses', 'documents', 'appearance', 'operations'\]/, 'backend ต้อง allow-list หมวดแก้ข้อมูลร้าน');
  assert.match(roleAccess, /registration_document_url/, 'backend ต้อง validate reference เอกสารร้าน');
  assert.match(roleAccess, /legal_name/, 'backend ต้องรองรับข้อมูลนิติบุคคลร้าน');
  assert.match(migration, /ADD COLUMN IF NOT EXISTS legal_name/, 'migration ต้องเพิ่มข้อมูลนิติบุคคลร้าน');
  assert.match(migration, /store-documents/, 'migration ต้องสร้าง bucket เอกสารร้านส่วนตัว');
  assert.match(migration, /file_size_limit[\s\S]*1048576/, 'เอกสารร้านต้องจำกัดผลลัพธ์ไม่เกิน 1 MB');
} else {
  console.log('backend source assertions: SKIPPED (ตรวจจาก Supabase ที่เผยแพร่จริงแยกต่างหาก)');
}

console.log('admin control plane completeness contract: PASS');
