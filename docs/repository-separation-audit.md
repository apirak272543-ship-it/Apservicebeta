# AP Service Repository Separation Audit — Final State

**Audit date:** 20 August 2026
**Scope:** GitHub repositories, published GitHub Pages destinations, Android WebView shell targets, and regression results following the cleanup of cross-role legacy files.

> The approved architecture is **five independent static web applications** and **four independent Android WebView-shell applications**. Native Android source must not remain in a web repository, and a web repository must not retain a standalone console belonging to another role.

## Final repository mapping

| Product role | Web repository | Published entry point | Dedicated Android repository | WebView destination |
|---|---|---|---|---|
| Customer | [`Apservice-`](https://github.com/apirak272543-ship-it/Apservice-) | [Customer web](https://apirak272543-ship-it.github.io/Apservice-/customer/) | — | — |
| Admin | [`Apservicebeta`](https://github.com/apirak272543-ship-it/Apservicebeta) | [Admin web](https://apirak272543-ship-it.github.io/Apservicebeta/admin/) | [`ApserviceAddMinAppAndroid`](https://github.com/apirak272543-ship-it/ApserviceAddMinAppAndroid) | `https://apirak272543-ship-it.github.io/Apservicebeta/admin/` |
| Merchant | [`ap-store-mobile`](https://github.com/apirak272543-ship-it/ap-store-mobile) | [Merchant web](https://apirak272543-ship-it.github.io/ap-store-mobile/merchant/) | [`ApserviceMerchantAppAndroid`](https://github.com/apirak272543-ship-it/ApserviceMerchantAppAndroid) | `https://apirak272543-ship-it.github.io/ap-store-mobile/merchant/` |
| Rider | [`ap-rider-mobile`](https://github.com/apirak272543-ship-it/ap-rider-mobile) | [Rider web](https://apirak272543-ship-it.github.io/ap-rider-mobile/rider/) | [`ApserviceRiderAppAndroid`](https://github.com/apirak272543-ship-it/ApserviceRiderAppAndroid) | `https://apirak272543-ship-it.github.io/ap-rider-mobile/rider/` |
| AP Retail POS | [`ap-retail-pos`](https://github.com/apirak272543-ship-it/ap-retail-pos) | [Retail POS web](https://apirak272543-ship-it.github.io/ap-retail-pos/) | [`ApserviceRetailPOSAppAndroid`](https://github.com/apirak272543-ship-it/ApserviceRetailPOSAppAndroid) | `https://apirak272543-ship-it.github.io/ap-retail-pos/` |

## Cleanup decisions and impact analysis

| Repository | Verified condition | Cleanup performed | Impact control |
|---|---|---|---|
| `Apservice-` | The `admin/` directory and root-level `admin.html` workflow were a stale Admin workspace. Their pages duplicated the Admin role, while current Customer pages did not reference them. | Removed the legacy `admin/` tree, its dedicated bootstrap, associated Admin-only root patches, associated Admin-only contract tests, and the obsolete Admin test commands. Commit: [`94c6050`](https://github.com/apirak272543-ship-it/Apservice-/commit/94c6050). | Customer-specific tests were retained and the package command now runs Customer-only regression checks. No Customer entry URL or Customer runtime asset was changed. |
| `Apservicebeta` | Root-level `rider.html` and `store.html` were standalone Rider and Merchant consoles. The canonical web applications already exist in their dedicated repositories and the Admin runtime had no references to these files. | Removed only `rider.html` and `store.html`. Commit: [`8ef97da`](https://github.com/apirak272543-ship-it/Apservicebeta/commit/8ef97da). | The `/admin/` workspace and all Admin functionality remain in place. No Admin URL or Android WebView target changed. |
| `ap-store-mobile`, `ap-rider-mobile`, `ap-retail-pos` | Each web repository had previously contained Android shell source. | Native shell source had already been copied, tested, pushed to its dedicated Android repository, and removed from the web repository. | Published web URLs remain the canonical runtime destination for the corresponding Android WebView shell. |

## Android shell boundary verification

| Shell repository | Boundary verified | Test result |
|---|---|---|
| `ApserviceAddMinAppAndroid` | Opens only the published Admin URL and retains a mobile recovery path. | 2 passing tests. |
| `ApserviceMerchantAppAndroid` | Opens only the Merchant URL and retains foreground location support. | 2 passing tests. |
| `ApserviceRiderAppAndroid` | Opens only the Rider URL, retains foreground location support, and satisfies the shell-presence contract. | 3 passing tests. |
| `ApserviceRetailPOSAppAndroid` | Opens only the Retail POS URL and retains its Expo/EAS Android identity checks. | 3 passing tests. |

All four Android shells therefore preserve the required WebView-to-web mapping. Their target addresses above are unchanged by this cleanup.

## Regression evidence

| Area | Verification performed | Result |
|---|---|---|
| Customer web | Customer flow, location picker, and image Golden Rule contract tests. | Passed. |
| Admin web | Admin control-plane completeness and account-management contract tests. | Passed. |
| Merchant web | Direct Node contract checks in `tests/`. | Passed. |
| Rider web | Direct Node contract checks in `tests/`. | Passed. |
| Retail POS web | Checkout, logout, login shell, Thai-first shell, runtime, and schema contract checks. | Passed. |
| Published URLs | Fresh fetch of all five GitHub Pages entry points. | All five responded with the expected role-specific sign-in or Customer landing content. |

## Published web checks

| Product role | Fresh published response observed |
|---|---|
| Customer | AP Service landing content, service cards, marketplace and order entry points. |
| Admin | Thai email/password sign-in entry. |
| Merchant | Thai sign-in entry. |
| Rider | Thai sign-in entry. |
| AP Retail POS | AP sign-in entry. |

## Preserved operating constraints

The following constraints remain unchanged by repository cleanup: use Supabase as the central backend; provide explicit empty states rather than synthetic data; retain camera/gallery-only image input; compress non-GIF images to a maximum of 1200 px at JPEG quality 0.82; do not compress GIF files; and treat the five published web addresses above as the canonical destinations for their Android WebView shells.

## Conclusion

The repository boundary is now explicit and operational: **5 role-specific web repositories plus 4 role-specific Android shell repositories**. The cleanup removed only confirmed cross-role or obsolete Admin copies. It did not change published URLs, Supabase configuration, role routes, or the Android WebView destinations.
