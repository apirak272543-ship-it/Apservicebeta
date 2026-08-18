# Admin Application Functional Audit

## Scope

Audit นี้ตรวจ Admin Application ที่ `Apservicebeta/admin/` ซึ่งมีเมนู Dashboard, Orders, Stores, Riders, Customers, Finance, Notifications, Promotions, Media Library, AI Workspace, Settings และเมนูเพิ่มเติมบนโทรศัพท์

## Confirmed defect: Legacy menu navigation

เมนูเดิมใน Admin MPA เคยพาผู้ใช้ไปยัง console เดิมหรือ compatibility route จึงเกิดการข้ามหน้าและทำให้บาง section เปิดไม่ตรงเมนูที่ผู้ใช้กด การส่งผู้ใช้ไปที่ console เดิมไม่สอดคล้องกับข้อกำหนดให้ Admin Application แยกตัวและทำงานภายใน application ของตนเอง

## Fix

เมนูเพิ่มเติมทั้งหมดเปิด `operations.html?feature=<feature>` ภายใน Admin MPA แล้ว โดย route นี้อ่านข้อมูลจากตารางจริงของระบบกลาง ได้แก่ `rider_applications`, `settlements`, `support_messages`, `menu_items`, `user_roles` และ `error_reports` ฟังก์ชัน Content จะพาไปยังหน้า Promotions ภายใน Admin เดียวกัน ส่วน Mapping แสดงสัญญาการเชื่อมข้อมูลหลักระหว่าง Admin, Customer, Merchant, Rider และ Settlement โดยไม่มีลิงก์ navigation จาก Admin runtime ไป legacy console หรือ Customer repository

ใบสมัครไรเดอร์และ error reports สามารถเปลี่ยนสถานะจาก Operations route ได้ โดยใช้ Supabase session ของ Admin และบันทึก audit fields ที่เกี่ยวข้อง ส่วนหน้าอื่นเปิดเป็นรายการข้อมูลจริงพร้อม empty state เพื่อให้ตรวจสอบข้อมูลได้ภายใน Admin Application

## Regression evidence

JavaScript syntax check ผ่าน และ Admin contract suite ทั้งหมดผ่าน รวมถึง `admin_legacy_menu_deeplink_contract_test.cjs`, `admin_route_dispatch_contract_test.cjs`, `admin_native_features_contract_test.cjs`, `admin_payment_slip_mpa_contract_test.cjs`, `admin_withdrawal_workflow_contract_test.cjs`, `admin_image_hard_cap_contract_test.cjs`, `admin_mobile_layout_contract_test.cjs` และ `admin_performance_audit_contract_test.cjs` โดย contract ที่เคยอ้างไฟล์ monolith ได้ถูกย้ายให้ตรวจ Shared Media Service, Admin MPA routes, Supabase role gate และ responsive navigation ที่ใช้งานจริงหลังแยก repository

## Confirmed defect: AI Workspace fallback

หน้า AI Workspace ใน MPA เคยเป็นข้อความ placeholder และปุ่ม compatibility กลับไป `admin.html` โดยไม่มี target จึงกลับ dashboard แทนที่จะเปิดพื้นที่ทำงาน ปัจจุบันย้ายการอ่าน thread, task และข้อความไปอยู่ใน Admin MPA โดยตรง และเพิ่ม responsive workspace layout ที่เปลี่ยนจากสองคอลัมน์เป็นคอลัมน์เดียวบนมือถือ จึงไม่เรียก legacy console หรือ Customer repository อีกต่อไป

## Confirmed defect: Withdrawal actions missing from Finance MPA

Finance MPA เคยแสดง withdrawal requests เป็นตารางอ่านอย่างเดียว แม้ backend มี `admin_review_withdrawal` RPC สำหรับ approve, reject และ paid. จึงเพิ่มปุ่มอนุมัติ/ปฏิเสธสำหรับ `requested`, ปุ่มบันทึกโอนสำหรับ `approved`, form แนบหลักฐาน private ของ `withdrawal-proofs` และปุ่มเปิดหลักฐานด้วย signed URL ภายใน modal เดิม. Workflow ใช้ server RPC จึงรักษา role check, การบังคับแนบหลักฐานก่อน paid และการบันทึก audit timestamps ใน database.

พบข้อมูลหลักฐานการโอนเก่าแบบ `data:image/...;base64` ซึ่งไม่สามารถใช้ signed URL flow เดิมได้ จึงเพิ่ม fallback ที่เปิด data URL เดิมใน modal ได้โดยตรง และแปล network error ที่ผู้ใช้เห็นเป็นข้อความไทยที่ชัดเจน การทดสอบเพิ่ม `admin_withdrawal_workflow_contract_test.cjs` และผ่านร่วมกับ legacy deeplink, business-rules, payment slip, pending badges และ MPA performance contracts.

## Confirmed defect: Store management capability was reduced

หน้า Stores เคยเหลือเพียงการดูรายการและการแก้ GP รายร้าน ทำให้ไม่มีปุ่มเพิ่มร้าน แก้ข้อมูลร้าน รูปและสื่อ เวลาเปิด–ปิด ปิดฉุกเฉิน หรือระงับ/เปิดร้านกลับมาใช้งาน

หน้า Stores ปัจจุบันคืน workflow เหล่านี้เป็น card แบบ mobile-first พร้อมค้นหาร้านและกรองสถานะ เพิ่มร้านใหม่ผ่าน `role-access` Edge Function เพื่อ provision บัญชี `store_owner` ฝั่ง server การแก้ร้านเดิมรองรับข้อมูลติดต่อ เวลาทำการ พิกัด GP รายร้าน และสื่อที่ผ่าน Shared Media Service ปุ่มปิดฉุกเฉินจะบันทึก `emergency_closed` และเหตุผล ส่วนระงับร้านจะตั้ง `active`, `moderation_status`, audit timestamp และเหตุผล

ตรวจ `catalog_stores` แล้วพบว่ากรอง `active IS TRUE` และ `emergency_closed IS FALSE` ฝั่ง database อยู่แล้ว จึงยืนยันว่าปุ่มระงับร้านและปิดฉุกเฉินส่งผลต่อ Customer application ผ่าน backend contract เดิม ไม่ใช่เพียงการเปลี่ยน UI ของ Admin

## Confirmed defect: User/role list did not scale to mobile

Operations route สำหรับผู้ดูแลเดิมใช้ตารางที่แสดง UUID แคบและไม่รวมบทบาทเดียวกัน ทำให้ระบุว่าใครเป็น Customer, Merchant, Rider หรือ Admin ได้ยาก โดยเฉพาะเมื่อจำนวนผู้ใช้เพิ่มขึ้น

จึงเปลี่ยนเป็น User Directory ที่รวม `user_profiles` กับ `user_roles` ตาม `user_id`, ค้นหาจากชื่อ อีเมล เบอร์โทร Login ID หรือรหัสผู้ใช้ และกรองตามบทบาทได้ รายการแสดงเป็น card บนมือถือเพื่อหลีกเลี่ยงข้อความและคอลัมน์ที่ล้นหน้าจอ

## Media Migration Queue and image hard-cap

ตรวจ inventory ของ `media_assets`, `storage.objects` และ data URL ในร้านค้า เมนู และหลักฐานถอนเงินแล้ว ไม่พบไฟล์ที่เกิน 1 MB แต่พบรูป legacy แบบ data URL จำนวน 8 จุด ซึ่งไม่ผ่านมาตรฐาน Storage/Media Registry ปัจจุบัน แม้ขนาดยังอยู่ต่ำกว่าเพดาน

เพิ่ม Media Migration Queue ในหน้า Media Library เพื่ออ่าน data URL เป็น `File`, บีบอัดและตรวจ URL ผ่าน Shared Media Service, บันทึก replacement ใหม่, PATCH record ให้ใช้อ้างอิงใหม่ และจึงนำ data URL เดิมออกจากฐานข้อมูล หากขั้นตอนใดล้มเหลว record เดิมจะไม่ถูกแก้ไข รายละเอียด inventory บันทึกไว้ใน `docs/media-migration-inventory.md`

## Route and deployment audit

ทุก MPA routes ที่เป็นเมนูหลักตอบ HTTP 200 จาก GitHub Pages และมี `data-page`, Shared MPA runtime และ Admin runtime ที่ตรงกัน ได้แก่ Dashboard, Orders, Stores, Riders, Customers, Finance, Notifications, Promotions, Media Library, Operations, AI Workspace และ Settings. เพิ่ม `admin_route_dispatch_contract_test.cjs` เพื่อป้องกัน future regression ที่ route มีไฟล์ HTML แต่ไม่มี handler หรือไม่มี shared runtime.

## Remaining verification

การกดและบันทึกข้อมูลจริงของแต่ละ menu ต้องทดสอบภายใต้ session Admin ที่มีสิทธิ์ RLS จริง โดยเฉพาะการสร้างร้านและบัญชี Merchant, การระงับ/ปิดฉุกเฉิน, การเปลี่ยนสถานะใบสมัครไรเดอร์, error reports, GP รายร้าน, การอัปโหลดสื่อ, Media Migration Queue และการอนุมัติ/บันทึกหลักฐานถอนเงิน การตรวจในรอบนี้ยืนยัน code path, request contract, route isolation และ regression tests แล้ว แต่ไม่ทดแทนการรับรอง end-to-end ด้วยบัญชีจริงบนโทรศัพท์
