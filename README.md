# AP Service — Admin Beta

Repository นี้เป็น **Admin Application เท่านั้น** ของ AP Service

| Repository | บทบาท |
|---|---|
| `Apservice-` | Customer Application |
| `Apservicebeta` | Admin Application |
| `ap-store-mobile` | Merchant Application |
| `ap-rider-mobile` | Rider Application |

Admin MPA อยู่ใน `admin/` และหน้าแรกของ repository จะพาไปที่ `admin/` โดยตรง ทุกหน้าใช้ Supabase, Auth, RLS และ business rules ชุดกลางร่วมกับแอปบทบาทอื่น แต่ source code และ deployment แยกตาม repository

`admin.html` ยังคงเป็น legacy fallback ระหว่าง migration และเปิดผ่าน More menu ของ Admin MPA ได้ หน้านี้ไม่มี Customer, Merchant หรือ Rider application entry point
