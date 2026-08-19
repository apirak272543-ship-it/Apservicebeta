# Admin Legacy-Only Contract Classification

The following checks target the retired single-page console or require historical cross-repository fixtures. They are intentionally excluded from the default Admin MPA regression suite and exit successfully with an explicit `SKIP` message unless `RUN_LEGACY_CONTRACTS=1` is set.

| Contract | Reason | Current MPA coverage |
|---|---|---|
| `admin_mobile_layout_contract_check.mjs` | Asserts `admin_contact_ui_patch.js` in the root legacy shell, which now redirects to `admin/`. | `admin_mobile_layout_contract_test.cjs` |
| `ap_console_contract_check.mjs` | Reads Customer/Rider/Store legacy entrypoints and a historical migration not carried into this repository. | Application-owned MPA and backend contracts |
| `modular_contract_check.mjs` | Requires 116 legacy inline `onclick` globals and `modules/boot.js`; Admin MPA uses route-specific runtime instead. | `admin_route_dispatch_contract_test.cjs` and page contracts |
| `withdrawal_payment_reliability_contract_test.cjs` | Requires sibling `/tmp/legacy-rider` payout-proof fixture. | Rider withdrawal and proof contracts in `ap-rider-mobile` |

Do not delete the historical tests or their legacy entrypoints. Run this audit profile only in an isolated workspace with the required historical fixtures; it is not evidence that the current MPA needs old redirect/runtime behavior restored.
