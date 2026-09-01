# Customer Background live Browser findings

Source URL: https://apirak272543-ship-it.github.io/Apservicebeta/admin/media.html?background-fix=89fd298-reload

วันที่ตรวจ: 2026-09-01

- Live Admin rendered 21 page cards plus 1 default card: 22 Background fields total.
- Before the fix, each hidden input had a boolean `data-visual-url` attribute with an empty value. The upload handler queried `[data-visual-url="default.backgroundUrl"]`, so it could update the preview but could not find the hidden URL input. Consequently, Save read an empty URL and reload showed no preview.
- After commit 89fd298, live Browser inspection reported `visualUrlInputs: 22`, `namedInputs: 22`, `emptyAttr: 0`, `pageCards: 21`, and page keys: home, stores, store, orders, order, checkout, profile, notifications, support, parcel, retail, retail-checkout, marketplace, marketplace-item, marketplace-new, marketplace-profile, marketplace-chat, register, recover, update-password, privacy.
- Post-fix live upload of `Screenshot_20260901-223240.jpg` to default Background completed. The preview URL was `https://abtsctwfkgzciseppach.supabase.co/storage/v1/object/public/catalog-media/admin-customer-visuals/5c4cc9a0-49d0-457b-a8e8-f71fcfd2d185/customer-visuals/0fd5e721-df5f-48de-89dc-c9b56a6e779f.webp?v=1`.
- After Save, Browser console reported the same non-empty URL in the hidden field, preview image source, upload status `อัปโหลดแล้ว · 87 KB · กดบันทึกการ์ดนี้เพื่อยืนยัน`, and save status `บันทึกชุดนี้แล้ว`.
- After reloading Admin Media, the page showed `ตัวอย่างพื้นหลัง พื้นหลังเริ่มต้นทุกหน้า` with the same Storage URL, proving preview persistence for the default card.
- Production database migration allowing `CUSTOMER_BACKGROUND` had already been applied to Supabase project `abtsctwfkgzciseppach`; constraint definition includes `CUSTOMER_BACKGROUND`.
- Admin migration/code commits: `051b572` (database migration), `89fd298` (hidden URL binding, cache-busting, 22-field contract test). Pages deployments for both commits completed successfully.

Important limitation: the live Browser test directly exercised the default Background card; all 21 page cards share the same `backgroundInput`, upload handler, save handler, and contract validation. The 22-card DOM mapping was checked live, but a separate upload was not performed for all 21 pages to avoid creating 21 unnecessary storage files.


## Customer live render verification

Customer URL: https://apirak272543-ship-it.github.io/Apservice-/customer/index.html?background-live-test=89fd298

After the Admin default Background was saved and Admin was reloaded, Customer live Browser computed style reported `body::before.backgroundImage` as `linear-gradient(rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.86)), url("https://abtsctwfkgzciseppach.supabase.co/storage/v1/object/public/catalog-media/admin-customer-visuals/5c4cc9a0-49d0-457b-a8e8-f71fcfd2d185/customer-visuals/0fd5e721-df5f-48de-89dc-c9b56a6e779f.webp?v=1")`, `body::before.zIndex = 0`, and 7 page images loaded successfully. The screenshot visibly showed the uploaded image as a washed/white-overlay page canvas behind the Customer UI. This confirms the full default chain: Admin upload → Save → Admin reload preview → customer_visuals → Customer body background layer.

The `--customer-background-url` CSS variable itself was empty because the runtime applies the final CSS shorthand directly to `body::before`; the computed pseudo-element is the authoritative render check and contains the Storage URL.
