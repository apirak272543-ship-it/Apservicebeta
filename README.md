# AP Service — Admin Beta

Repository นี้เป็น **Admin Application เท่านั้น** ของ AP Service

| Repository | บทบาท |
|---|---|
| `Apservice-` | Customer Application |
| `Apservicebeta` | Admin Application |
| `ap-store-mobile` | Merchant Application |
| `ap-rider-mobile` | Rider Application |

Admin MPA อยู่ใน `admin/` และหน้าแรกของ repository จะพาไปที่ `admin/` โดยตรง ทุกหน้าใช้ Supabase, Auth, RLS และ business rules ชุดกลางร่วมกับแอปบทบาทอื่น แต่ source code และ deployment แยกตาม repository

`admin.html` เป็น compatibility route ที่พาไป `admin/` โดยตรง เพื่อให้ทุก URL ปกติเปิด Admin MPA เท่านั้น ส่วน `legacy-admin-console.html` ถูกเก็บไว้เป็นไฟล์กู้คืนระหว่าง migration และไม่ใช่ entry point ปกติ
