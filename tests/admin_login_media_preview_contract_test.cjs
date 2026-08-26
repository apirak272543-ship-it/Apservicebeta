const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'admin/login-media.html'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'admin/login-media.js'), 'utf8');
const sharedMediaUi = fs.readFileSync(path.join(root, 'shared/ap-service-mpa.js'), 'utf8');

assert.match(page, /id="login-media-file" type="file" accept="image\/\*"/, 'Login producer must retain the image file input');
assert.match(sharedMediaUi, /data-image-source-choices/, 'Shared MPA UI must provide canonical source-choice controls');
assert.match(sharedMediaUi, /เลือกจากคลังภาพ/, 'Shared MPA UI must provide a library chooser');
assert.match(sharedMediaUi, /ถ่ายรูปด้วยกล้อง/, 'Shared MPA UI must provide a camera chooser');
assert.match(runtime, /const loginMediaFileField = \$\('login-media-file'\)/, 'Preview runtime must bind the existing file input');
assert.match(runtime, /loginMediaSourceChoices\?\.querySelectorAll\('button'\)/, 'Preview runtime must bind existing source buttons');
assert.match(runtime, /loginMediaFileField\.click\(\)/, 'Source buttons must open the existing file chooser');
assert.match(runtime, /URL\.createObjectURL\(file\)/, 'Selecting a file must create a local preview blob');
assert.match(runtime, /loginMediaPreview\.hidden = false/, 'Selecting a file must reveal the preview before submit');
assert.match(runtime, /URL\.revokeObjectURL\(loginMediaPreviewUrl\)/, 'Replacing/leaving the page must revoke the preview blob');
assert.match(runtime, /loginMediaPreview\.hidden = true/, 'Preview cleanup must hide the figure');
assert.match(runtime, /async function save\(event\)/, 'Upload/save must remain an explicit form submit action');
assert.match(runtime, /if \(!file\) return/, 'Submit must not upload when no file is selected');

console.log('Admin Login Media preview/source-choice contract: PASS');
