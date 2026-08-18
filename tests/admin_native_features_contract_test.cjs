const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.doesNotMatch(app, /mobile_notifications\?select=[^']*read_at/, 'Notifications ต้องไม่ query column read_at ที่ไม่มีใน schema');
assert.match(app, /mobile_notifications\?select=id,title,body,recipient_role,status,created_at,sent_at/, 'Notifications ต้อง query fields ตาม schema จริง');
assert.match(app, /status=eq\.pending/, 'Notification badge ต้องนับสถานะ pending ตาม schema จริง');
assert.match(app, /ยังไม่มีข้อมูลการแจ้งเตือนในขณะนี้/, 'Notifications ต้องมี empty state ที่อ่านง่าย');
assert.match(app, /async function media\(/, 'Admin ต้องมี Media Library native handler');
assert.match(app, /media_assets\?select=id,owner_id/, 'Media Library ต้องอ่าน registry เพื่อแสดงรายการที่อัปโหลดแล้ว');
assert.match(app, /data-media-preview/, 'Media Library ต้องเปิด preview ของรายการสื่อได้');
assert.match(app, /async function aiWorkspace\(/, 'AI Workspace ต้องอยู่ใน Admin MPA');
assert.match(app, /ai_workspace_threads/, 'AI Workspace ต้องเชื่อม workspace tables โดยตรง');
assert.doesNotMatch(app, /legacy-admin-console\.html/, 'Admin MPA ต้องไม่เปิด legacy console');
assert.match(app, /data-store-gp/, 'Stores ต้องมี input GP แยกร้าน');
assert.match(app, /settlement_gp_percent: gp/, 'Stores ต้องบันทึก GP รายร้าน');
assert.doesNotMatch(app, /data-rule="settlement:gp_rate_percent"/, 'Settings ต้องไม่ใช้ GP รวมทุกร้าน');

console.log('admin native features contract: PASS');
