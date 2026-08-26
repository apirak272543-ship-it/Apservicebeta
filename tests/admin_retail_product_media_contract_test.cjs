const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const retail = fs.readFileSync(path.join(root, 'admin', 'admin-retail-patch.js'), 'utf8');
const media = fs.readFileSync(path.join(root, 'shared', 'ap-service-media.js'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', '20260826133000_allow_retail_product_image_media_type.sql'), 'utf8');

assert.match(retail, /mediaType:\s*'RETAIL_PRODUCT_IMAGE'/, 'Admin Retail uploader must use the dedicated Retail product media type');
assert.match(retail, /form\.elements\.image_url\.value\s*=\s*uploaded\.publicUrl/, 'Admin Retail uploader must stage the verified public URL before product save');
assert.match(retail, /preview\.innerHTML\s*=\s*`<img src=\"\$\{esc\(uploaded\.publicUrl\)\}\"/, 'Admin Retail uploader must render a visible staged preview');
assert.match(media, /RETAIL_PRODUCT_IMAGE:\s*Object\.freeze\(\{[^}]*maxDimension:\s*1200[^}]*outputMimeType:\s*'image\/jpeg'[^}]*quality:\s*0\.82/s, 'Shared media helper must retain the dedicated Retail product compression profile');
assert.match(migration, /'PRODUCT_IMAGE'::text,\s*'RETAIL_PRODUCT_IMAGE'::text/s, 'Canonical migration must preserve PRODUCT_IMAGE and allow RETAIL_PRODUCT_IMAGE');
assert.match(migration, /media_assets_media_type_check/, 'Canonical migration must replace the shared media type check');

console.log('admin_retail_product_media_contract_test: PASS');
