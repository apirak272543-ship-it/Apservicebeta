# Admin Application TODO

- [x] คืนฟังก์ชันเพิ่มร้านค้า แก้ไขข้อมูลร้าน ปิดร้านฉุกเฉิน และระงับร้านในหน้า Stores
- [x] เพิ่มการค้นหา กรองตามบทบาท และรูปแบบรายการที่อ่านง่ายบนมือถือในหน้าผู้ดูแล/ผู้ใช้
- [x] แก้ปุ่มดูหลักฐานคำขอถอนเงินให้เปิดได้ และแปล error ที่ผู้ใช้เห็นเป็นภาษาไทยที่เข้าใจง่าย
- [x] ปรับ layout หน้า AI Workspace และตาราง/รายการ Admin ให้ mobile-first โดยไม่เกิดคอลัมน์แคบหรือข้อความล้น
- [x] เพิ่มและรัน regression contracts สำหรับ Store management, user directory, finance proof และ mobile layout
- [x] ตรวจ inventory ภาพเดิมและจุดอ้างอิงที่เกินมาตรฐาน Shared Media Service
- [x] เพิ่ม Media Migration Queue ที่บีบอัด ตรวจ URL และสลับ reference แบบ rollback-safe
- [ ] บีบอัดและอัปโหลดภาพ replacement ไม่เกิน 1 MB พร้อมตรวจว่า URL ใช้งานได้จริง
- [ ] สลับข้อมูลให้ใช้ภาพ replacement ก่อนลบไฟล์เดิม และบันทึกผล migration เพื่อตรวจสอบย้อนหลัง
- [x] ตรวจ schema/RPC/RLS สำหรับการจัดการบัญชี บทบาท สิทธิ์ กระเป๋าเงิน และบัญชี Merchant แบบปลอดภัย
- [x] สร้าง User Control Plane ที่แก้ข้อมูลแยกรายหมวด เพิ่ม/ลบบทบาท ระงับบัญชี และจัดการสิทธิ์ feature-level ได้
- [x] สร้าง Wallet Control Plane พร้อม audit log และ server-side approval สำหรับการปรับยอด
- [x] ปรับ Store Control Plane ให้บันทึกชื่อ การปฏิบัติงาน สื่อ เมนู และบัญชี Merchant แยกรายหมวด พร้อม reset password ผ่าน server
- [x] แยกหน้าปฏิบัติงานเป็นงานวันนี้/ต้องจัดการ และประวัติสำหรับ notifications กับ withdrawal requests
- [x] เพิ่ม contract tests สำหรับ field-level updates, privileged actions, wallet audit และ mobile Admin sections
