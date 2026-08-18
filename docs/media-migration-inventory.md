# Media Migration Inventory

ตรวจเมื่อ 18 สิงหาคม 2026 สำหรับ Supabase project `abtsctwfkgzciseppach` ตามกฎผลลัพธ์ภาพไม่เกิน **1 MB** ของ Shared Media Service

| แหล่งข้อมูล | รายการที่พบ | เกิน 1 MB | ขนาดสูงสุดที่ตรวจพบ |
|---|---:|---:|---:|
| `media_assets` / `catalog-media` | 1 | 0 | 34,314 bytes |
| `storage.objects` / `catalog-media` | 1 | 0 | 34,314 bytes |
| `stores.image_url` แบบ data URL | 3 | 0 | 519,903 characters |
| `stores.background_url` แบบ data URL | 3 | 0 | 504,923 characters |
| `menu_items.image_url` แบบ data URL | 1 | 0 | 129,247 characters |
| `withdrawal_requests.proof_image_url` แบบ data URL | 1 | 0 | 789,299 characters |

> ยังไม่พบไฟล์ Storage หรือ media registry ที่เกิน 1 MB แต่พบภาพ legacy ฝังเป็น `data:image/...;base64` รวม 8 จุด ซึ่งไม่เป็นไปตามมาตรฐาน Storage/Media Registry ปัจจุบัน แม้ขนาดโดยประมาณยังไม่เกินเพดาน

## ขั้นตอน migration ที่บังคับใช้

Media Migration Queue ใน Admin จะอ่าน data URL เป็น `File`, ส่งผ่าน Shared Media Service เพื่อบีบอัดไม่เกิน 1 MB และตรวจ URL ก่อนสลับ field อ้างอิงของ record เดิม รูปสาธารณะจะย้ายเข้า `catalog-media` ส่วนหลักฐานการถอนเงินจะย้ายเข้า `withdrawal-proofs` แบบ private แล้วเก็บ storage reference ใหม่ หลัง PATCH สำเร็จจึงนำ data URL เดิมออกจาก database โดยไม่มีการลบข้อมูลล่วงหน้า

## Integration ที่ยืนยันแล้ว

`catalog_stores` ส่งเฉพาะร้านที่ `active IS TRUE` และ `emergency_closed IS FALSE` ดังนั้นปุ่มระงับร้านและปิดฉุกเฉินใน Admin ส่งผลต่อการแสดงผลฝั่ง Customer ผ่าน backend contract เดิม
