# Foodly Final Project — Test Report

**Run date:** 17 November 2026

**Result:** PASS — 489 assertions passed, 0 failed, 0 skipped.

**Browser:** Playwright Chromium 151.0.7922.34.

**Structured evidence:** [`test-results.json`](test-results.json)

**Accessibility:** 0 axe violations across all audited states.

## Commands and results

| Command | Result |
| --- | --- |
| `npm ci` | PASS — installed 19 development packages from lockfile |
| `npm run validate:html` | PASS — all eight HTML pages validate |
| `node --check js/app.js` | PASS |
| `node --check tests/browser.cjs` | PASS |
| `BASE_URL=http://127.0.0.1:8766 CHROME_EXECUTABLE=/Users/kaharnasyrhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell npm test` | PASS — 489 assertions, 0 failures, 0 skipped, 0 unexplained console/runtime/resource errors |
| Open-Meteo live endpoint request | PASS — real HTTPS JSON response returned current Astana conditions |
| `git diff --check` | PASS before commit |

The Playwright browser could not start inside the restricted sandbox because macOS denied Chromium's bootstrap rendezvous. The same official Playwright suite was therefore run outside the sandbox with the locally installed Playwright Chromium; no test logic was disabled.

## E2E coverage

- All eight pages load and local HTML links resolve.
- Shared jQuery 4.0.0 and the one `js/app.js` application bundle load on each page.
- Responsive overflow, shared header geometry and light/dark states at 320, 360, 390, 430, 768, 992, 1024, 1280 and 1440 CSS pixels.
- Mobile navigation open, `aria-expanded`, Escape close and focus restoration.
- Sign Up valid/invalid data, email syntax cases, Unicode names, password rules, optional phone formats, duplicate normalized email and JavaScript length caps.
- Log In unknown-account/wrong-password failures, valid login, profile access control, reload persistence, logout and login again.
- Product search, category/store filtering, sorting, autocomplete keyboard behavior, FAQ highlight, clipboard, counters, spinner/toast, lazy images, animations and reduced-motion behavior.
- Cart persistence, cross-tab changes, quantity changes/caps, totals, delivery threshold, checkout validation and demo order completion.
- Open-Meteo live response in the browser plus mocked response success, HTTP 503, retry success, malformed JSON, invalid field values and network failure fallback.
- Image loading, accessibility scans, mobile layouts and browser console/runtime/resource failures.

No scenarios were skipped. Expected API failures are deliberately injected in two assertions and are recorded separately in `expectedWeatherErrors`; the final unexplained `errors` array is empty.

## Findings fixed during verification

1. Fast page jumps could leave three earlier lazy images on placeholders. The scroll handler now loads skipped images above the viewport as the user moves down. The regression confirms all lazy images resolve and the event handler unbinds.
2. `profile.html` had a one-character Bootstrap JavaScript integrity hash typo. Chromium blocked the asset; the hash now matches the bundled library.
3. Open-Meteo attribution links in dark theme used a dark link RGB value despite the light dark-mode link token. The dark RGB token was added; axe now reports zero contrast violations.
4. The initial test diagnostic compared lazy pending state as a number after changing it to an array; the assertion now checks the array length.

## API result and limits

The actual endpoint returned valid JSON from this environment with a current timestamp, temperature, WMO code and wind speed. Playwright confirmed the browser widget reaches its success state. Mocked HTTP/network failures show the documented fallback and retry behavior. API availability still depends on the user's internet connection.

Authentication, checkout, prices and deliveries remain educational frontend simulations. The demo password is stored in localStorage because the assignment explicitly requires credentials for verification; this is not secure storage. No payment, server login, delivery booking, email delivery or backend data persistence is implemented.

The Final Project requirements and presentation PDFs named in the task were not in the workspace; the implementation and criteria in the user-supplied task were used as the source.
