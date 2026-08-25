import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = relativePath => readFileSync(resolve(root, relativePath), 'utf8');

const adminApp = read('admin/admin-app.js');
const mediaPage = read('admin/media.html');
const loginMediaTab = read('admin/admin-login-media-tab.js');
const loginMediaPage = read('admin/login-media.html');
const loginMediaRuntime = read('admin/login-media.js');

assert.match(adminApp, /สำหรับผู้ดูแลระบบ/, 'Admin Login ต้องใช้คำอธิบายบทบาทสำหรับผู้ใช้');
assert.doesNotMatch(adminApp, /Admin Control Plane/, 'Admin Login ต้องไม่เผยศัพท์ implementation บน public screen');
assert.doesNotMatch(adminApp, /สิทธิ์ Admin จาก Backend/, 'Admin Login ต้องไม่เผยรายละเอียด backend บน public screen');
assert.match(adminApp, /กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบ/, 'Admin Login ต้องแจ้งเมื่อกรอกข้อมูลไม่ครบก่อนเรียก sign-in');
assert.match(adminApp, /ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่/, 'Admin Login ต้อง map provider credential error เป็นภาษาไทย');
assert.match(adminApp, /เข้าสู่ระบบ Admin ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง/, 'Admin Login ต้องมีข้อความ fallback ที่ไม่เผย raw provider error');

assert.ok(existsSync(resolve(root, 'admin/admin-retail.html')), 'Retail management page must exist at admin/admin-retail.html');
assert.match(adminApp, /retail:\s*'admin-retail\.html'/, 'Retail menu must resolve to the published admin-retail.html page');
assert.match(adminApp, /href="\$\{routeFor\(key\)\}"/, 'Admin navigation must use the route resolver');

assert.match(mediaPage, /admin-login-media-tab\.js/, 'Content Studio page must load the Login Media tab runtime');
assert.doesNotMatch(mediaPage, /href="login-media\.html"/, 'Media Center must not expose Login Media as a separate primary navigation link');
assert.match(loginMediaTab, /data-content-tab/, 'Login Media must be installed as a Content Studio tab');
assert.match(loginMediaTab, /src="login-media\.html\?embedded=1"/, 'Content Studio tab must present the existing Login Media management flow');
assert.match(loginMediaPage, /login-media\.js/, 'The embedded Login Media page must retain its existing runtime');
assert.match(loginMediaRuntime, /admin_upsert_login_background_media/, 'Login Media flow must use the existing save RPC');
assert.match(loginMediaRuntime, /admin_disable_login_background_media/, 'Login Media flow must use the existing disable RPC');
assert.match(loginMediaRuntime, /file\.type === 'image\/gif'/, 'GIF files must retain their animation path');
assert.match(loginMediaRuntime, /1200 \/ Math\.max\(bitmap\.width, bitmap\.height\)/, 'Still images must be constrained to 1200px');
assert.match(loginMediaRuntime, /canvas\.toBlob\(resolve, 'image\/jpeg', 0\.82\)/, 'Still images must be compressed as JPEG quality 0.82');
assert.match(loginMediaPage, /type="file" accept="image\/\*"/, 'The panel must only accept image files from the device rather than external URLs');
assert.doesNotMatch(loginMediaPage, /type="url"/, 'The panel must not offer an external image URL input');

console.log('Admin Login, Media + Retail navigation contract: PASS');
