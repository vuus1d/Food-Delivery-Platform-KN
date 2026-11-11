# Verification results - Assignment 6 (jQuery), 4 November 2026

## Independent audit - 10 November 2026

- Source: clean shallow clone of the public `main` branch at `9ddde3c` (Assignment 6).
- Before local edits, 19 deployed HTML/CSS/JS/Bootstrap files matched that source byte for byte, and the browser suite passed 187 checks against the live URL.
- Final local source: Google Chrome 157.0.8103.39 on macOS; local HTTP server at `http://127.0.0.1:8765`.
- `npm run validate:html`: passed for all 6 pages. `node --check` passed for all 9 application scripts and `tests/browser.cjs`.
- Final `npm test`: **212 browser assertions passed**, 0 runtime/console/failed-resource errors, and 0 axe violations.
- Horizontal overflow: none on all 6 pages at 320, 375, 390, 768, 1024, and 1440 px.
- This run added a nine-image CSS Grid gallery with one/two/three-column breakpoint checks, plus coverage for named CSS Grid areas, district filters, quantity +/- controls, Remove, Clear Cart confirmation/cancellation, empty-cart delivery, and the 99-item limit. Popup close/backdrop/content behavior, rapid accordion clicks, and the live clock were also checked. It fixed the Mac copy-shortcut assertion and two dark-theme contrast defects: the success-subtle sidebar card and the copied button's hover/active colors.
- Local fixes are uncommitted and were not deployed; the live check above is of the pre-edit source.

## Recorded environment

- Browser: Google Chrome 156.0.8078.80 (headless), selected with `CHROME_EXECUTABLE`, on Windows 11 Pro.
- Test runner: Node.js 24.22.2, Playwright 1.56.1, @axe-core/playwright 4.11.0, html-validate 10.0.0 (versions from `package-lock.json`).
- Test origin: http://127.0.0.1:8765, served with `python -m http.server` from the submitted source.
- Time zone: Asia/Almaty. Synthetic names, email addresses and order details only.
- Browser assertions in `tests/browser.cjs`: **175 passed, 0 failed** (`test-results.json` lists every one).
- JavaScript runtime errors, console errors and failed resource responses (HTTP ≥ 400), recorded on every page of every browser context: **0**.
- HTML: all **6 pages** pass the configured html-validate recommended rules.
- JavaScript: all **9 application scripts** (including the new `js/script.js`) and the test file pass `node --check`.
- Automated accessibility: axe-core WCAG 2 A/AA and WCAG 2.1 AA report **0 violations** on all 6 pages, plus four extra states: responsive.html in night theme, night theme with FAQ highlights, the open autocomplete list, and the copy tooltip with a toast.
- Page-level horizontal overflow: **0** at 375, 390, 768 and 1440 px on all 6 pages in the recorded 4 November run. The independent 10 November run additionally covered 320 and 1024 px.

## Live deployment check

After commit `2b84633` was pushed, the GitHub Pages build succeeded. The same `tests/browser.cjs` was then run with `BASE_URL=https://vuus1d.github.io/Food-Delivery-Platform-KN`: **175 passed, 0 errors, 0 axe violations**. The 14 key HTML/CSS/JS/vendor files served live are byte-identical (SHA-256) to the local source. See `deployment.json`.

## Assignment 6 coverage (Part A of the test file)

| Task | What is asserted |
| --- | --- |
| 0. Setup | All 6 pages load jQuery **4.0.0**; `<head>` lists the CDN file first and `js/script.js` second; every page logs `jQuery is ready!`. |
| 1. Live filter | Typing filters the 8 catalog cards and updates "N products shown"; sorting keeps the filter; empty state; clearing restores all cards. Compare: `?category=dairy` preselection, live search, search + category empty state, Clear, All. |
| 2. Autocomplete | List opens with `aria-expanded="true"`; the match is wrapped in `<mark>`; ↓/↑ (with wraparound) update `aria-activedescendant` and `aria-selected`; Enter and click fill the field and filter; Escape keeps the text; click outside closes; typed HTML is never inserted. |
| 3. Highlighting | `deliver` gives `Found 5 matches` and opens the 2 answers that match; link `href` stays intact; `5,000 ₸` is found; `(.*` is escaped (0 matches, no error); typed HTML is not parsed; clearing restores the exact original HTML and closes only auto-opened answers; the accordion still works. |
| 4. Progress bar | Empty at the top, about 50% half-way, full at the bottom; responsive.html has its own styled bar; night theme uses the brighter gradient. |
| 5. Counters | Start at 0 below the fold; mid-animation value after 0.5 s; final `3 / 24 / 60 min / 5,000 ₸`; never restarts. |
| 6. Spinner | Invalid submit shows no spinner; valid submit disables the button with spinner + `Please wait…`; success appears only after the simulated delay; feedback, registration, subscription and checkout are covered; the checkout dialog cannot close during the wait. |
| 7. Toasts | 3 stacked toasts with `role="status"`; "added to your cart" text; at most 4 active toasts; close button; automatic fade-out; message inserted as text; form-success and demo-order toasts. |
| 8. Clipboard | Copy writes `FOODLY10` to the clipboard (read back with `navigator.clipboard.readText()`); checkmark icon, `Copied` label, tooltip and toast; reset after 2 s; manual Ctrl+C triggers `.on('copy')`; the textarea + `execCommand('copy')` fallback works with the Clipboard API removed; the demo order number can be copied. |
| 9. Lazy loading | No native `loading="lazy"` on managed images; 13 `<noscript>` fallbacks; off-screen and hidden-slide images wait in `data-src`; the first slide loads normally; scrolling loads the team photos without layout shift; carousel Next loads the next slide; after everything loads, the scroll handler is removed (`lazyHandlerBound === false`). |

## Regression coverage (Part B)

Required and whitespace-only fields; Unicode names; malformed email; blank and mismatched passwords; confirmation revalidation; clearing passwords after success; stale-success removal; phone digit counting; reset; subscription focus trap and Escape; day/night persistence (including the Day/Night button on responsive.html); arrow-key wraparound; Read More; rating feedback; muted-by-default audio; non-overlapping playback; product search and sorting; empty states; cart persistence and totals; reduced-motion behavior (`$.fx.off`); multi-step validation; Back/Next preservation; payment labels; safe text rendering; final consent; clearing the order; canonical stored prices; free-delivery threshold; cross-tab synchronization; corrupt JSON; blocked storage; all images load; mobile navigation and checkout at 375 px (including night theme).

Screenshots in `screenshots/` come from these real browser states. `a6-*.png` files are the new Assignment 6 states. The older `code-*.png` images are Assignment 5 source excerpts; their line numbers predate the Assignment 6 changes.

## Changes to the test file and why

- Assignment 6 checks were added before the regression part. Old assertions that described replaced behavior were updated: the catalog now has 8 products, toasts animate with jQuery instead of a CSS keyframe, and form or checkout success now appears after the 1.6 s simulated server call.
- The Web Audio check now waits for the oscillator's `ended` event instead of a fixed 350 ms. On this Windows machine, audio start-up took longer than 350 ms, in both the original Assignment 5 code and the new code. The assertion itself (2 starts, 2 ends, at most 1 active tone) is unchanged.

## Scope and limits

These are automated checks of a static educational frontend, not a guarantee that every browser or assistive technology behaves identically. The axe scans cover the recorded page states. Sound creation and non-overlap were checked through Web Audio events, not by listening. jQuery comes from code.jquery.com, so the jQuery features need network access. No backend, real login, email delivery, payment, delivery service, LMS deadline or LMS submission was tested.

## Commands

```sh
npm ci
npx playwright install chromium        # or set CHROME_EXECUTABLE to an installed Chrome
npm run validate:html
python3 -m http.server 8765
# In another terminal:
npm test
```

On Windows: `set CHROME_EXECUTABLE=C:\Program Files\Google\Chrome\Application\chrome.exe` before `npm test`.
