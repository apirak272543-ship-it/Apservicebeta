# Admin Application Functional Audit

## Scope

Audit นี้ตรวจ Admin Application ที่ `Apservicebeta/admin/` ซึ่งมีเมนู Dashboard, Orders, Stores, Riders, Customers, Finance, Notifications, Promotions, AI Workspace, Settings และ legacy menu ที่แสดงในเมนู “เพิ่มเติม” บนโทรศัพท์

## Confirmed defect: Legacy menu navigation

เมนู legacy ใน Admin MPA เคยสร้าง URL `../admin.html?admin=<section>` แต่ `admin.html` เป็น compatibility page ที่ redirect ไป `./admin/` โดยไม่รักษา query string ส่งผลให้ฟังก์ชันเดิม เช่น Rider Applications, Settlements, Support, Inventory, Content, Admins, Error Center และ Mapping ไม่เปิด section ที่ผู้ใช้กด

## Fix

เมนู legacy ชี้ไป `legacy-admin-console.html?admin=<section>` โดยตรง ซึ่งโหลด `admin-legacy-deeplink.js` และเรียก `switchAdmin(section)` เมื่อ role Admin พร้อมใช้งาน นอกจากนี้ `admin.html?admin=<section>` จาก bookmark เก่าจะ preserve query และเปิด legacy console แทน เพื่อไม่ให้ผู้ใช้ถูก redirect ทิ้ง

## Regression evidence

* JavaScript syntax check ผ่าน
* `admin_legacy_menu_deeplink_contract_test.cjs` ผ่าน
* `admin_business_rules_control_plane_contract_test.cjs` ผ่าน
* `admin_payment_slip_mpa_contract_test.cjs` ผ่าน

## Confirmed defect: AI Workspace fallback

หน้า AI Workspace ใน MPA เคยเป็นข้อความ placeholder และปุ่ม compatibility กลับไป `admin.html` โดยไม่มี target จึงกลับ dashboard แทนที่จะเปิดพื้นที่ทำงาน. แก้ให้ปุ่มเปิด `legacy-admin-console.html?admin=ai-workspace`; deeplink bridge รองรับ target นี้และเรียก module activation หลังเปิด section เพื่อโหลด thread, task, message และ agent status จริง.

## Confirmed defect: Withdrawal actions missing from Finance MPA

Finance MPA เคยแสดง withdrawal requests เป็นตารางอ่านอย่างเดียว แม้ backend มี `admin_review_withdrawal` RPC สำหรับ approve, reject และ paid. จึงเพิ่มปุ่มอนุมัติ/ปฏิเสธสำหรับ `requested`, ปุ่มบันทึกโอนสำหรับ `approved`, form แนบหลักฐาน private ของ `withdrawal-proofs` และปุ่มเปิดหลักฐานด้วย signed URL ภายใน modal เดิม. Workflow ใช้ server RPC จึงรักษา role check, การบังคับแนบหลักฐานก่อน paid และการบันทึก audit timestamps ใน database.

การทดสอบเพิ่ม `admin_withdrawal_workflow_contract_test.cjs` และผ่านร่วมกับ legacy deeplink, business-rules, payment slip, pending badges และ MPA performance contracts.

## Route and deployment audit

ทุก MPA routes ที่เป็นเมนูหลักตอบ HTTP 200 จาก GitHub Pages และมี `data-page`, Shared MPA runtime และ Admin runtime ที่ตรงกัน ได้แก่ Dashboard, Orders, Stores, Riders, Customers, Finance, Notifications, Promotions, AI Workspace และ Settings. เพิ่ม `admin_route_dispatch_contract_test.cjs` เพื่อป้องกัน future regression ที่ route มีไฟล์ HTML แต่ไม่มี handler หรือไม่มี shared runtime.

## Remaining verification

การกดและบันทึกข้อมูลจริงของแต่ละ menu ต้องทดสอบภายใต้ session Admin ที่มีสิทธิ์ RLS จริง เนื่องจาก login browser takeover ใช้งานไม่ได้ในรอบนี้ งาน audit จะตรวจ code/request/policy ของ MPA menu ต่อก่อนสรุปผล
