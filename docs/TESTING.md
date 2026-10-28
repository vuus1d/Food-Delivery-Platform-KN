# Verification results - 28 October 2026

## Recorded environment

- Browser: Google Chrome 156.0.8078.49 (headless Chromium engine on macOS).
- Test origin: http://127.0.0.1:8765, served from the submitted source.
- Time zone: Asia/Almaty. Synthetic names, email addresses and order details only.
- Browser assertions: **78 passed**.
- JavaScript runtime/console errors and failed resource responses observed by the main test page: **0**.
- HTML: all **6 pages** pass the configured html-validate 10.0.0 recommended rules.
- JavaScript: all **8 application scripts** pass `node --check`.
- Automated accessibility: axe-core WCAG 2 A/AA and WCAG 2.1 AA checks report **0 violations** on all 6 default pages and the home page in dark mode.
- Page-level horizontal overflow: **0** at 390, 768 and 1440 pixels on all 6 pages. Responsive tables intentionally scroll inside their containers.
- Audio instrumentation: **2 starts, 2 ended events, maximum 1 active oscillator**, including a burst of 10 clicks. No hardware listening test was performed.

## Covered behavior

Required and whitespace-only fields; Unicode names; malformed email; blank and mismatched passwords; confirmation revalidation; clearing passwords after success; stale-success removal; phone digit counting; reset; subscription focus trap and Escape; day/night persistence; arrow-key wraparound; Read More; rating feedback; muted-by-default audio; non-overlapping playback; product search and sorting; empty states; cart persistence and totals; event-triggered animation; reduced-motion behavior; multi-step validation; Back/Next preservation; payment labels; safe text rendering; final consent; clearing the order; canonical stored prices; free-delivery threshold; cross-tab synchronization; corrupt JSON; blocked storage; loaded images; mobile navigation and checkout.

`test-results.json` lists every assertion. `axe-audit.json` and `axe-dark.json` contain the recorded accessibility violations arrays (empty for this run). Screenshots in `screenshots/` were captured from real browser states. `code-*.png` images show excerpts from the actual submitted source, with file names and line numbers; they are not invented code examples.

## Scope and limits

These are automated checks of a static educational frontend, not a guarantee that every browser or assistive technology behaves identically. The axe scans cover the recorded page states, not every possible modal/validation combination. Keyboard flows are tested separately. Sound creation and non-overlap were checked through Web Audio events; audible volume depends on the user's browser and device. No backend, real login, email delivery, payment, real delivery service, LMS deadline or LMS submission was tested. Node packages are development tools; website visitors need no npm installation.

## Commands

```sh
npm ci
npx playwright install chromium
npm run validate:html
python3 -m http.server 8765
# In another terminal:
npm test
```

The actual run selected the installed Chrome using `CHROME_EXECUTABLE`. See the README for running with Playwright's Chromium and for test environment overrides.
