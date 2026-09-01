# AP Service — Admin Application

รีโพสิตอรีนี้เป็น **Admin Application เท่านั้น** ของ AP Service ใช้สำหรับควบคุมการปฏิบัติงาน บัญชี บทบาท ร้านค้า ไรเดอร์ ออร์เดอร์ การเงิน การแจ้งเตือน โปรโมชัน และการตั้งค่ากลางของแพลตฟอร์ม

| รีโพสิตอรี | บทบาท | Entry point หลัก |
|---|---|---|
| `apservice-admin-app` | Admin Application | `admin/` และ `admin.html` เป็น compatibility route |
| `apservice-customer-app` | Customer Application | `customer/` |
| `apservice-rider-app` | Rider Application | `rider/` |
| `ap-store-mobile` | Merchant Application | `merchant/` |

Admin MPA อยู่ใน `admin/` แต่ละหน้าจะโหลด runtime และข้อมูลที่จำเป็นสำหรับหน้าของตนเอง ระบบใช้ Supabase Authentication, Row Level Security (RLS), Shared Core, data contracts และ Shared Media Service ร่วมกับแอปบทบาทอื่น ขณะที่ source code และ deployment แยกจากกันตามบทบาท

## ขอบเขตฟังก์ชัน

แอพแอดมินมีหน้า Dashboard และการควบคุมออร์เดอร์ ร้านค้า ไรเดอร์ ลูกค้า การเงิน Audit Log การแจ้งเตือน โฆษณา คูปอง คลังสื่อ Retail, AI Workspace, การตั้งค่ากลาง และ Account Control Plane สำหรับจัดการบทบาทและสิทธิ์ การดำเนินการที่มีผลต่อข้อมูลสำคัญต้องผ่าน Auth, RLS, business rules และ audit requirements ของระบบ

`index.html` เป็นหน้าเริ่มต้นของ Admin และ `admin.html` เป็นเส้นทาง compatibility ที่พาไปยัง Admin MPA โดยตรง ส่วนไฟล์ legacy ที่อยู่ระหว่าง migration ไม่ใช่ entry point ปกติ

## การตรวจสอบ

ใช้ `npm test` เพื่อรัน feature-contract tests ที่อยู่ใน `tests/` โดยไม่ต้องติดตั้ง runtime framework เพิ่มเติม
