const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20260826121000_add_login_background_media.sql'), 'utf8');
for (const name of [
  'admin_list_login_background_media',
  'admin_upsert_login_background_media',
  'admin_disable_login_background_media',
  'login_resolve_background_media',
]) {
  assert.match(migration, new RegExp(`CREATE OR REPLACE FUNCTION public\\.${name}`), `${name} migration missing`);
}
assert.match(migration, /ALTER TABLE public\.login_background_media ENABLE ROW LEVEL SECURITY/);
assert.match(migration, /REVOKE ALL ON TABLE public\.login_background_media FROM anon, authenticated/);
assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.login_resolve_background_media\(text\) TO anon, authenticated/);
assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.admin_upsert_login_background_media\(/);
assert.match(migration, /private\.is_platform_owner_or_master\(\)/);

const consumerFiles = [
  ['Apservice-', 'Customer'],
  ['Apservicebeta', 'Admin'],
  ['ap-store-mobile', 'Merchant'],
  ['ap-rider-mobile', 'Rider'],
  ['ap-retail-pos', 'Retail POS'],
];
for (const [repo, label] of consumerFiles) {
  const source = fs.readFileSync(path.join(root, '..', repo, 'shared/ap-login-media.js'), 'utf8');
  assert.match(source, /const headers = \{ apikey: KEY, 'Content-Type': 'application\/json' \}/, `${label} consumer must build public resolver headers`);
  assert.match(source, /if \(token\) headers\.Authorization = `Bearer \$\{token\}`;/, `${label} consumer must preserve authenticated header when available`);
  assert.doesNotMatch(source, /if \(!token\) return \[\];/, `${label} consumer must not block public login media before session`);
}

console.log('Admin Login Media backend and consumer contract: PASS');
