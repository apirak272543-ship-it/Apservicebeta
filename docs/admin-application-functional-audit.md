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

หน้า AI Workspace ใน MPA เคยเป็นข้อความ placeholder และปุ่ม compatibility กลับไป `admin.html` โดยไม่มี target จึงกลับ dashboard แทนที่จะเปิดพื้นที่ทำงาน. แก้ให้ปุ่มเปิด `legacy-admin-console.html?admin=ai-workspace`; deeplink bridge รองรับ target นี้และเรียก module activation หลังเปิด section เพื่อโหลด thread, task, message และ agent status จริง.

## Confirmed defect: Withdrawal actions missing from Finance MPA

Finance MPA เคยแสดง withdrawal requests เป็นตารางอ่านอย่างเดียว แม้ backend มี `admin_review_withdrawal` RPC สำหรับ approve, reject และ paid. จึงเพิ่มปุ่มอนุมัติ/ปฏิเสธสำหรับ `requested`, ปุ่มบันทึกโอนสำหรับ `approved`, form แนบหลักฐาน private ของ `withdrawal-proofs` และปุ่มเปิดหลักฐานด้วย signed URL ภายใน modal เดิม. Workflow ใช้ server RPC จึงรักษา role check, การบังคับแนบหลักฐานก่อน paid และการบันทึก audit timestamps ใน database.

การทดสอบเพิ่ม `admin_withdrawal_workflow_contract_test.cjs` และผ่านร่วมกับ legacy deeplink, business-rules, payment slip, pending badges และ MPA performance contracts.

## Route and deployment audit

ทุก MPA routes ที่เป็นเมนูหลักตอบ HTTP 200 จาก GitHub Pages และมี `data-page`, Shared MPA runtime และ Admin runtime ที่ตรงกัน ได้แก่ Dashboard, Orders, Stores, Riders, Customers, Finance, Notifications, Promotions, Media Library, Operations, AI Workspace และ Settings. เพิ่ม `admin_route_dispatch_contract_test.cjs` เพื่อป้องกัน future regression ที่ route มีไฟล์ HTML แต่ไม่มี handler หรือไม่มี shared runtime.

## Remaining verification

การกดและบันทึกข้อมูลจริงของแต่ละ menu ต้องทดสอบภายใต้ session Admin ที่มีสิทธิ์ RLS จริง โดยเฉพาะการเปลี่ยนสถานะใบสมัครไรเดอร์, error reports, GP รายร้าน, การอัปโหลดสื่อ และการอนุมัติ/บันทึกหลักฐานถอนเงิน การตรวจในรอบนี้ยืนยัน code path, request contract, route isolation และ regression tests แล้ว แต่ไม่ทดแทนการรับรอง end-to-end ด้วยบัญชีจริงบนโทรศัพท์
