const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '../admin/stores.html'), 'utf8');
const patch = fs.readFileSync(path.join(__dirname, '../admin/admin-menu-management-patch.js'), 'utf8');
const ocr = fs.readFileSync(path.join(__dirname, '../admin/local-menu-ocr.js'), 'utf8');

assert.match(html, /shared\/ocr\/tesseract\.min\.js/);
assert.match(html, /local-menu-ocr\.js/);
assert.match(patch, /data-import-menu-image/);
assert.match(patch, /function openLocalOcrImport/);
assert.match(patch, /rpc\/import_menu_drafts/);
assert.match(patch, /p_store_id: store\.id/);
assert.match(patch, /p_source: 'local_ocr'/);
assert.match(patch, /renderItems\(dialog, store\)/);
assert.match(patch, /renderCategories\(dialog, store\)/);
assert.match(ocr, /MAX_BYTES = 1024 \* 1024/);
assert.doesNotMatch(ocr, /https:\/\//);

console.log('admin_local_ocr_menu_import_contract_test: passed');
