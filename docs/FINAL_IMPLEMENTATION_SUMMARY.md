# Foodly Final Project — Implementation Evidence

Prepared 17 November 2026 from the current source tree. The Final Project requirements and presentation PDFs named in the project brief were not present in the workspace; criterion mapping is based on the complete requirements included in the task.

## Pages

- `index.html` — Foodly home page, Astana store discovery, sample price comparisons, FAQ/feedback, and delivery weather.
- `stores.html` — store and district selection, product catalogue, search/autocomplete, category filtering, sorting and cart actions.
- `compare.html` — searchable and filterable price comparison table.
- `cart.html` — persistent cart, totals and a multi-step simulated checkout.
- `login.html` — browser-only demo account registration.
- `signin.html` — demo credential verification and session creation.
- `profile.html` — authenticated account details and logout.
- `responsive.html` — pure CSS Grid and Media Queries learning page without Bootstrap.

## Technologies and requirements

HTML5, CSS3, Bootstrap 5.3.3, jQuery 4.0.0, vanilla JavaScript, localStorage/sessionStorage, GitHub Pages and Playwright. Custom application logic remains in `js/app.js`; Bootstrap and jQuery are separate libraries.

Existing Assignment 1–6 functionality is retained, including responsive layouts, shared navigation, theme preference, carousel, feedback/rating, FAQ, popup, optional sound, store/product discovery, comparison, cart/checkout, JavaScript form validation, jQuery autocomplete/highlighting, scroll progress, counters, spinners, toasts, clipboard copy and lazy images.

## Authentication flow

Registration validates the name, email, optional Kazakhstan phone number, password and confirmation. Email is trimmed/lowercased before uniqueness checks. Duplicate registration is rejected without changing the saved account. The successful educational demo account, including the password required by the assignment brief, is stored in `localStorage` under `foodly-demo-account`. Sign in verifies that account and creates a `sessionStorage` entry named `foodly-demo-session`. Profile checks for a matching session before writing account details into the DOM. Password is never displayed. Logout removes the session and hides the private profile. **This storage is not secure; never enter a real password or sensitive data.**

## Validation

All implemented forms use `novalidate` and custom JavaScript rules. Native `required`, `pattern`, `minlength`, `maxlength`, `min`, `max` and `type="email"` constraints are not used for validation. Field caps are represented as `data-maxlength` and enforced by `js/app.js`. Errors render beside their fields with `aria-invalid` and `aria-describedby`; first invalid field receives focus. Email syntax validation is not mailbox verification. Phone formatting accepts ten national digits with spaces/parentheses/hyphens and optional `+7` prefix.

## External API

Open-Meteo current forecast, fetched using `fetch()` and async/await over HTTPS:

`https://api.open-meteo.com/v1/forecast?latitude=51.1694&longitude=71.4491&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FAlmaty`

The home-page widget displays current temperature, a WMO weather-code description, wind speed and update time. It has loading, error fallback and retry behavior and attributes the provider. The widget gives delivery-condition context; it does not predict arrival time. The endpoint returned a valid current JSON response from this environment on 17 November 2026. Browser E2E uses mocks for deterministic success, HTTP error/retry, malformed JSON and network failure cases; live browser CORS outcome is recorded in test results.

## Theme, responsive behavior and cart

The existing `foodly-theme` localStorage key preserves light/dark preference across pages and reloads. Shared breakpoints/layouts are checked at 320, 360, 390, 430, 768, 992, 1024, 1280 and 1440 CSS pixels. `responsive.html` retains its Bootstrap-free grid. The cart retains canonical demo prices and quantity validation, 800 ₸ delivery below the 5,000 ₸ free-delivery threshold, and simulated order completion without payment.

## Test evidence

Final Playwright run: **489 assertions passed, 0 failed, 0 skipped**, using Chromium 151.0.7922.34. HTML validation, JavaScript syntax checks and axe accessibility audits passed; there were zero unexplained runtime/console/resource errors and zero axe violations. The live weather API succeeded in the browser. Details are in [`FINAL_TEST_REPORT.md`](FINAL_TEST_REPORT.md) and [`test-results.json`](test-results.json).

Genuine current screenshots include [`home-day.png`](screenshots/home-day.png), [`home-night.png`](screenshots/home-night.png), [`profile-demo.png`](screenshots/profile-demo.png) and [`weather-widget.png`](screenshots/weather-widget.png). The browser suite also refreshed previous Assignment 1–6 evidence shots.

## Known limitations

- Demo account credentials are stored in browser localStorage; there is no backend or production authentication.
- Checkout is a simulation; no payment or delivery is created.
- Product prices/promotions are sample values; external API requires internet access.
- The course-provided Final Project PDF files were absent, so the brief in the development task was the requirements source.
- GitHub Pages has not been updated by this local implementation; no push was performed.
