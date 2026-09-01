# AP Service — Repository Map

เอกสารนี้เป็นแผนผังอ้างอิงของ application repositories ที่ตรวจสอบเมื่อวันที่ **2 กันยายน 2026** หลังเปลี่ยนชื่อรีโพสิตอรีบน GitHub แล้ว

## Canonical repositories

| รีโพสิตอรี | บทบาท | Source หลัก | Entry point | ลักษณะโครงการที่ตรวจพบ |
|---|---|---|---|---|
| [`apservice-admin-app`][1] | Admin Application / Control Plane | `admin/` | root `index.html` → `admin/`; `admin.html` เป็น compatibility route | Static Multi-Page Application; JavaScript, CSS, HTML และ contract tests |
| [`apservice-customer-app`][2] | Customer Application | `customer/` | root `index.html` → `customer/` | Static Multi-Page Application สำหรับผู้ใช้บริการและการสั่งซื้อ |
| [`apservice-rider-app`][3] | Rider Application | `rider/` | root `index.html` → `rider/` | Static Multi-Page Rider console ที่มี HTML, JavaScript, CSS และ contract tests; ใน `main` ที่ตรวจไม่พบ `App.tsx` หรือ `package.json` ของ Expo shell |
| `ap-store-mobile` | Merchant Application | ไม่ได้รวมอยู่ในงานตรวจสอบนี้ | ไม่ได้รวมอยู่ในงานตรวจสอบนี้ | ชื่อดังกล่าวปรากฏในเอกสาร/contract เก่าของระบบ |

## ขอบเขตแต่ละแอพ

### Admin Application

Admin เป็นศูนย์ควบคุมหลังบ้านและเป็นเจ้าของการตั้งค่ากลางของแพลตฟอร์ม ไม่ใช่เพียง repository รุ่น beta หน้าหลักรองรับภาพรวมการปฏิบัติงาน การเงิน ออร์เดอร์ ร้านค้า ไรเดอร์ ลูกค้า Audit Log การแจ้งเตือน โฆษณา คูปอง คลังสื่อ Retail, AI Workspace, การตั้งค่ากลาง และ Account Control Plane สำหรับบทบาท/สิทธิ์

การดำเนินการที่สำคัญ เช่น การเปลี่ยนสถานะออร์เดอร์ การจัดการร้านค้า/ไรเดอร์ บัญชี และการเงิน ต้องถือว่า UI เป็นเพียง client ของกติกา ไม่ใช่ authorization boundary การอนุญาตจริงต้องผ่าน Supabase Auth, RLS, server/RPC contract และ audit requirements

### Customer Application

Customer เป็นแอพสำหรับผู้ใช้บริการ ตั้งแต่หน้าแรก เลือกบริการ ร้านค้า หมวดหมู่ เมนู ตะกร้า checkout แบบหลายร้าน อาหาร Retail/Supermarket Parcel และ Marketplace ไปจนถึงการติดตามออร์เดอร์ การจัดการที่อยู่ โปรไฟล์ การแจ้งเตือน การช่วยเหลือ และการแนบสลิป

Checkout ใช้ที่อยู่และพิกัดที่ยืนยันแล้ว แบ่งรายการตามร้าน ใช้ idempotency key และสร้างกลุ่มคำสั่งซื้อผ่าน RPC กลาง การคำนวณค่าส่งและยอดที่ยืนยันต้องมาจาก server/business rules ไม่รับตัวเลขสำคัญจาก browser เพียงอย่างเดียว

### Rider Application

Rider เป็น console สำหรับบัญชีไรเดอร์ที่ Admin สร้างและผูกสิทธิ์ไว้ มี login, dashboard, งานใหม่/งานที่รับ, รายละเอียดการจัดส่ง, การอัปเดตสถานะ, หลักฐานการส่ง, รายได้, กระเป๋าเงิน, การถอนเงิน, โปรไฟล์, compliance documents, availability, location/presence, notifications และ settings

Rider ใช้ server action `role-access` สำหรับการเปลี่ยนแปลงสำคัญ เช่น presence, profile, availability, documents และ delivery proof ส่วนข้อมูลที่อ่านเป็นของไรเดอร์ที่กำลังเข้าสู่ระบบตาม RLS/role gate เท่านั้น การตรวจสอบครั้งนี้พบว่าโค้ดที่อยู่ใน branch `main` เป็น static MPA เป็นหลัก แม้เอกสารเก่าบางส่วนจะกล่าวถึง Expo mobile shell

## Shared architecture

ทั้งสามแอพใช้ Supabase project เดียวกันสำหรับ Authentication, Database, RLS และ Storage และแชร์แนวคิดของ Shared Core, MPA runtime, media pipeline และ data contracts แต่ไม่ควรถือว่าไฟล์ shared ทุกไฟล์เหมือนกันทั้งหมด ควรตรวจ diff/hash ก่อนแก้ shared runtime เพราะ `ap-service-mpa.js`, `ap-service-media.js` และ Supabase client มีความแตกต่างระหว่างบทบาท ขณะที่ `ap-service-core.js` และ design system ที่ตรวจพบมีเนื้อหาเดียวกันในสาม checkout นี้

| ข้อมูล/กติกากลาง | แหล่งหลัก |
|---|---|
| ผู้ใช้ โปรไฟล์ และบทบาท | `user_profiles`, `user_roles` |
| ร้านค้าและเมนู | `stores`, `menu_items`, `menu_categories` |
| ไรเดอร์และรายได้ | `riders`, `rider_earnings` |
| ออร์เดอร์และเหตุการณ์สถานะ | `delivery_orders`, `order_status_events` |
| การชำระเงิน | `payment_slip_reviews`, `wallet_transactions` |
| Settlement และ withdrawal | `settlements`, `settlement_items`, `withdrawal_requests` |
| การแจ้งเตือน | `mobile_notifications`, `mobile_device_tokens` |
| รูปภาพและหลักฐาน | Supabase Storage ตาม bucket/path ownership และ RLS |

Order lifecycle ที่ Shared Core กำหนดเริ่มจาก payment review/credit review ไปยังร้านรับออร์เดอร์, เตรียมสินค้า, ไรเดอร์กำลังไปรับ, ถึงร้านค้า, รับสินค้าแล้ว, กำลังไปส่ง, สำเร็จแล้ว หรือยกเลิก โดยแต่ละ actor มีชุด transition ที่อนุญาตต่างกัน ห้ามสร้างคำสถานะใหม่เฉพาะแอพ

## Working rules for future changes

เมื่อแก้ Auth, role, order status, payment, delivery fee, media upload หรือ notification ให้ตรวจ `shared/`, contract documents, migrations/functions และ consumer ทั้งสามแอพก่อนเสมอ เมื่อแก้หน้าจอเฉพาะบทบาท ให้เริ่มที่ runtime และ HTML/CSS ของบทบาทนั้น แล้วตรวจว่าไม่มีการโหลด runtime ของบทบาทอื่นเกินขอบเขต MPA

ทุกการอัปโหลดไฟล์ต้องผ่านการตรวจชนิดและขนาด บีบอัด/ปรับขนาด อัปโหลดใน bucket ที่ถูกต้อง บันทึก path/URL ด้วย authorization และ render แบบปลอดภัย ห้ามใส่ Service Role Key, Secret Key, password หรือ token ลงใน repository หรือเอกสาร

การตรวจสอบด้วย contract tests เป็นหลักฐานระดับ source contract เท่านั้น งานที่เปลี่ยนข้อมูลจริง การเงิน สิทธิ์ หรือการส่งออร์เดอร์ต้องมี authenticated browser/E2E verification แยกต่างหาก และต้องไม่ใช้ข้อมูลจำลองแทนผลจริง

## Verification snapshot

| รีโพสิตอรี | Commit ล่าสุดที่ตรวจหลังการปรับชื่อ | ขนาดโครงสร้างโดยประมาณ | Contract tests ที่พบ |
|---|---:|---:|---:|
| `apservice-admin-app` | `b4b101b` | 184 files | 70 |
| `apservice-customer-app` | `e042761` | 344 files | 106 |
| `apservice-rider-app` | `23bcc9b` | 50 files | 18 |

Admin และ Customer มี npm manifest สำหรับ contract tests ส่วน Rider branch ที่ตรวจไม่มี `package.json` จึงไม่มี npm test script ใน repository นั้น การทดสอบ Rider ต้องเรียก test files โดยตรงหรือเพิ่ม runner ในงานแยกต่างหาก

## References

[1]: https://github.com/apirak272543-ship-it/apservice-admin-app "AP Service Admin Application"
[2]: https://github.com/apirak272543-ship-it/apservice-customer-app "AP Service Customer Application"
[3]: https://github.com/apirak272543-ship-it/apservice-rider-app "AP Service Rider Application"
[4]: https://github.com/apirak272543-ship-it/apservice-customer-app/blob/main/ARCHITECTURE_CONTRACT.md "AP Service Architecture Contract"
[5]: https://github.com/apirak272543-ship-it/apservice-customer-app/blob/main/DATA_CONTRACTS.md "AP Service Data Contracts"
