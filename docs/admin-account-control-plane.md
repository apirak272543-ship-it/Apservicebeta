# Admin Account Control Plane

เอกสารนี้บันทึกผลตรวจและขอบเขต control plane ที่ deploy แล้วเมื่อ 18 สิงหาคม 2026 สำหรับ Supabase project `abtsctwfkgzciseppach`

## Server-side controls

| ความสามารถ | Backend contract | การบังคับใช้ |
|---|---|---|
| สถานะบัญชีและ feature overrides | `account_controls` | `status` มีค่า `active` หรือ `suspended`; สิทธิ์เก็บใน `feature_overrides` JSONB |
| Audit trail | `admin_action_audit` | บันทึกผู้กระทำ เป้าหมาย action เหตุผล และ before/after state |
| บทบาท | `admin_set_user_roles` | ป้องกันถอด admin ของบัญชีตนเอง และป้องกันการลบ admin คนสุดท้าย |
| กระเป๋าเงินลูกค้า | `admin_adjust_customer_wallet` | เพิ่ม immutable row ใน `wallet_transactions` เป็น `admin_credit` หรือ `admin_debit`; ไม่เขียนยอดคงเหลือลอย |
| ระงับบัญชี Merchant/Rider | `role-access` login | Edge Function ปฏิเสธ login เมื่อ `account_controls.status = suspended` |
| ห้าม COD / สั่งซื้อ | `create_food_order` | RPC ตรวจ `private.account_feature_enabled` ก่อนสร้าง order; ไม่พึ่งการซ่อนปุ่มฝั่ง client |
| Merchant account | `update_store_account_section` | อีเมล Login ID ชื่อ โทรศัพท์ และรหัสผ่านแก้ผ่าน Edge Function ที่ตรวจสิทธิ์ Admin |

## UI sections

หน้า **ผู้ใช้และบทบาท** ใช้ Account Control Plane เพื่อค้นหา กรองบทบาท สร้างบัญชี Customer/Admin แก้ข้อมูล identity/contact/auth เป็นคนละการบันทึก กำหนดบทบาท ระงับบัญชี ตั้ง feature controls และปรับ wallet ledger ของ Customer

หน้า **ร้านค้าและ Merchant** แยกการจัดการเป็นข้อมูลร้าน เวลาและพิกัด รูปและสื่อ เมนู/สต็อก บัญชี Merchant ปิดฉุกเฉิน และระงับ/เปิดร้านอีกครั้ง หน้า **การแจ้งเตือน** แยกงานวันนี้ งานที่ต้องติดตาม และประวัติ ส่วนหน้า **การเงิน** โหลดเฉพาะ withdrawal status `requested` และ `approved` เป็นค่าเริ่มต้น

## Deployment evidence

Migration `admin_account_control_plane` ถูกนำไปใช้สำเร็จ และ Edge Function `role-access` เป็น version 12 สถานะ ACTIVE พร้อม `verify_jwt=true` การตรวจ contract `admin_account_control_plane_contract_test.cjs` และ Admin contract suite ผ่านครบ
