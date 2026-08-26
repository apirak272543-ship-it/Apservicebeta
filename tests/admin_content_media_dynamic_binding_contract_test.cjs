'use strict';

const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'admin', 'customer-content-studio-patch.js');
const source = fs.readFileSync(sourcePath, 'utf8');

function assertContains(pattern, message) {
  if (!pattern.test(source)) throw new Error(message);
}

function assertNotContains(pattern, message) {
  if (pattern.test(source)) throw new Error(message);
}

assertContains(/function attachMediaInputs\(host, access, refresh\)/, 'attachMediaInputs owner function missing');
assertContains(/host\.addEventListener\(['"]change['"], handleMediaChange\)/, 'media changes must use host-level event delegation');
assertContains(/event\.target\?\.closest\?\.\(['"]\[data-media-input\]['"]\)/, 'delegated handler must resolve the actual media input target');
assertContains(/host\.contains\(input\)/, 'delegated handler must be scoped to the current Content Studio host');
assertContains(/if \(host\.__apMediaChangeHandler\) host\.removeEventListener\(['"]change['"], host\.__apMediaChangeHandler\)/, 'rebind must remove the previous delegated listener');
assertContains(/host\.__apMediaChangeHandler = handleMediaChange/, 'delegated listener reference must be retained for idempotent rebind');
assertContains(/data-media-preview/, 'upload must keep preview update behavior');
assertContains(/data-media-status/, 'upload must keep progress/status behavior');
assertContains(/uploadPublicImage/, 'upload must keep the shared media pipeline');
assertNotContains(/host\.querySelectorAll\(['"]\[data-media-input\]['"]\)\.forEach\(input => input\.onchange/, 'per-input binding would miss dynamically added media controls');

console.log('admin_content_media_dynamic_binding_contract_test: PASS');
