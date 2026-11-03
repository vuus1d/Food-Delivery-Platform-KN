# Foodly - Assignment 6: jQuery

Foodly is a static grocery delivery demonstration for comparing Astana stores, browsing products and practicing checkout. It continues the previous Team KN project (Assignments 1-5) without replacing its theme or six-page structure. Assignment 6 adds jQuery search, UX and web-app features on top of the existing site.

**Team:** KN (Foodly)

**Members:** Kakhar Nassyrkhan, Nurasyl Raiskaliev

**Group:** SE-2506

**Live website:** https://vuus1d.github.io/Food-Delivery-Platform-KN/

**Repository:** https://github.com/vuus1d/Food-Delivery-Platform-KN

Prices, promotions and delivery options are sample data. Registration does not create an account. Feedback and subscriptions do not send or store personal data. Checkout neither charges money nor books a delivery. Do not enter real passwords or payment information.

## Run the submitted project

Extract the ZIP, open a terminal in the project folder and run:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/. On Windows, `python -m http.server 8000` is also suitable. There is no build step or runtime package installation. Bootstrap 5.3.3 and all images are included locally. **jQuery 4.0.0 is loaded from the official CDN** (`https://code.jquery.com/jquery-4.0.0.min.js`, with a Subresource Integrity hash), exactly as the Assignment 6 PDF asks, so the jQuery features need an internet connection. There is no other CDN or remote API. JavaScript must be enabled. Use an HTTP server for consistent storage behavior rather than relying on `file://` URLs.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home, stores, carousel, team, FAQ, Read More, rating, subscription and feedback |
| `stores.html` | District filters, product catalog, search, sorting and Add to Cart |
| `compare.html` | Category filters, search and a sample price comparison table |
| `cart.html` | Basket quantities and totals, then Delivery / Options / Review checkout |
| `login.html` | Demo registration with name, email, password and confirmation validation |
| `responsive.html` | Previous pure-CSS responsive demonstration (no Bootstrap); has its own Day/Night theme button |

## Assignment 6 requirement map (jQuery)

Every page loads jQuery 4.0.0 from the CDN in `<head>`, followed by `js/script.js`, the single file with all Assignment 6 jQuery code. Only APIs that exist in jQuery 4 are used (no `$.trim`, `$.isArray`, `$.parseJSON` or `.size()`). Older scripts call four shared functions from it: `showToast`, `filterCatalog`, `simulateServerRequest` and `checkLazyImages`. Line-by-line notes for the report and defense are in `docs/ASSIGNMENT-6-NOTES.md`.

| Requirement | File / function | How to demonstrate |
| --- | --- | --- |
| Task 0. Setup | `<head>` of all 6 pages; `js/script.js`: `$(document).ready(...)` logs `jQuery is ready!` | Open DevTools Console on any page |
| Task 1. Real-time search and live filter | `js/script.js`: `filterCatalog()` (`.on('keyup input')`, `.filter()`, `.not()`, `.fadeIn()`), `initCompareSearch()` | Stores → View Products → type `chick`; Compare → type `butter`, change category |
| Task 2. Autocomplete suggestions | `js/script.js`: `initAutocomplete()`; ARIA combobox + `role="listbox"` in `stores.html` | Stores → View Products → type `ba`, press ↓ then Enter; Escape or click outside closes |
| Task 3. Search highlighting | `js/script.js`: `initFaqSearch()`, `highlightMatches()` (escaped `RegExp`, `.html()`, `.wrap('<mark>')`) | Home → FAQ → type `deliver`: `Found 5 matches`, answers open; clear to restore |
| Task 4. Scroll progress bar | `js/script.js`: `initScrollProgress()` (`scrollTop()`, `$(document).height()`, `$(window).height()`); `css/style.css`, `css/media-queries.css` | Scroll any page; switch Night theme for the brighter gradient |
| Task 5. Animated number counter | `js/script.js`: `initCounters()` (`.animate()` with custom `foodlyEaseOut` easing, starts once via `.offset()`) | Home → scroll to "Foodly in numbers" |
| Task 6. Loading spinner on submit | `js/script.js`: `simulateServerRequest()`; called from `js/validation.js` (success callback) and `js/checkout.js` | Submit valid feedback, registration, subscription or the final checkout step |
| Task 7. Notification system | `js/script.js`: `showToast(message, type)`, `dismissToast()` (slide/fade in with `.animate()`, `.fadeOut()`, stack of 4, close button, `role="status"`) | Add products on Stores; submit a form; copy a code; place a demo order |
| Task 8. Copy to clipboard | `js/script.js`: `initCopyButtons()`, `copyText()`, `copyWithTextarea()`, `showCopied()`, `.on('copy')` | Home → Weekly promo codes → Copy; Cart → after checkout copy the demo order number |
| Task 9. Image lazy loading | `js/script.js`: `checkLazyImages()`, `loadLazyImage()`, `initLazyImages()` (`.offset()`, `scrollTop()`, `.attr('src')`, throttled scroll/resize, Bootstrap `slide.bs.carousel`) | DevTools Network → Img, then scroll Home; click carousel Next |
| Part 4. Deploy | GitHub Pages from `main` / root | Open the live URL above |

Accessibility and safety: user text is inserted with `.text()` (never `.html()`), the search regex is escaped, the autocomplete uses `aria-expanded` and `aria-activedescendant`, toasts use `role="status"` and pause on hover/focus, and `$.fx.off` follows `prefers-reduced-motion`. `responsive.html` stays the pure-CSS demo without Bootstrap, but it now has the same Day/Night button (`js/theme.js`, shared saved preference) with dark colours in `media-queries.css`. Because it also loads our scripts it gets jQuery and the progress bar, styled in `media-queries.css` (at 375 px that page scrolls through three stacked store cards). Its images keep native `loading="lazy"`, because that page deliberately stays the unchanged Assignment 3 demonstration.

## Assignment 5 requirement map

The PDF offers alternative implementations for some requirements. This project chooses Read More / rating, a multi-step form callback, and switch-based catalog sorting / payment labels. It does not claim to implement a real asynchronous contact POST.

| Requirement | Actual implementation | How to demonstrate |
| --- | --- | --- |
| Select individual and grouped DOM elements | `js/interactions.js`: `getElementById`, `querySelectorAll`; `js/app.js`: catalog DOM | Home: choose a rating star |
| Dynamically update content | Rating status uses `textContent`; catalog renders trusted templates with escaped values; checkout creates DOM nodes | Choose 4 stars; open a store; review checkout |
| Dynamic styles / day and night | `js/theme.js`: `data-bs-theme`, button text, `aria-pressed`, saved preference; `css/style.css` supplies both palettes | Click Night theme, reload, then Day theme |
| Attribute manipulation alternative | Read More updates `style.display`, `hidden`, `aria-expanded`; stars update classes and `aria-pressed` | Home: open and close shopping advice |
| Button event listeners | All custom controls use `addEventListener` | Read More, stars, theme, sound, cart buttons |
| Keyboard navigation | `js/interactions.js`: arrow-key `keydown`, Home/End, wraparound and focus | Tab to Home in the top navigation; press arrows |
| Callback-driven interaction | `js/checkout.js`: `checkout.move(direction, onChange)` calls `renderStep`; validates Next and preserves inputs on Back | Add a product; complete Delivery; go Back from Options |
| `switch` statements | `js/app.js`: catalog sorting; `js/checkout.js`: payment labels; `js/interactions.js`: keyboard actions | Sort by price; select Cash and view Review |
| Objects and methods | `checkout` object has `step`, `totals()`, `paymentLabel()` and `move()` | Review displays computed delivery and total |
| Arrays and explicit loops | Product arrays; `for...of` creates review terms and values; cart restore loops through saved rows | Show products and review line items |
| Higher-order functions | `map`, `filter`, `reduce`, `forEach` with callback functions | Search products and calculate cart totals |
| Sound effects without overlap | `js/interactions.js`: Web Audio oscillator, gain envelope, busy guard, cleanup | Sound: on -> Test sound; on Stores, add products |
| Event-triggered animations | `css/style.css`: star/card pulse, popup entry; toasts now animate with jQuery (Assignment 6) | Rate Foodly or add a product; reduced-motion preference disables motion |
| Separation and clean functions | Six HTML pages, external CSS, external application scripts; no inline event handlers or inline script blocks | Inspect the files and external script links |
| Theme and engagement | Grocery advice, rating, sound controls, shopping filters and guided demo checkout | Complete a grocery-shopping demonstration |
| Deployment | GitHub Pages, `main` branch, repository root | Open the live URL above; compare with report evidence |

## Validation rules and fixes

All four forms use `FoodlyValidation.attach()` in `js/validation.js`. Registration, subscription and feedback provide success callbacks; checkout validates each step and checks every step again before completion.

- Required text cannot be empty or whitespace-only. Names need at least two characters and allow Unicode letters, spaces, periods, apostrophes and hyphens.
- Email uses a documented practical format check: an ASCII local part, valid domain labels and a dotted alphabetic suffix. Consecutive dots in the local part and malformed domains are rejected. This is not mailbox verification or complete internationalized-email support.
- A phone is optional in feedback and required at checkout. The visible `+7` prefix is fixed; the field accepts exactly **10 national digits**, with spaces, parentheses and hyphens. Nine/eleven digits, letters and separator-only input are rejected. Do not type the `+7` prefix again.
- Passwords require 8-128 characters and cannot be only spaces. Passwords are compared exactly, without trimming; confirmation is rechecked when the password changes.
- Addresses need at least five trimmed characters and a letter or digit. Feedback messages need at least ten trimmed characters. Explicit maximum lengths also apply.
- Consent is required for feedback and final checkout. Optional notes are limited to 200 characters.
- After submission, errors appear beside fields with `aria-invalid` and linked, live error messages. The first invalid field receives focus. Editing a previously checked field revalidates it, rather than simply hiding its error.
- Reset clears custom validity, visual errors and stale success. Success clears form data and states explicitly that nothing was sent or saved.

Client-side validation improves this educational frontend; a production service would still need backend validation and authentication.

## Cart, storage, accessibility and sound

The cart uses the existing `cart` localStorage key. Saved rows are checked against the catalog; stored prices are replaced with canonical demo prices. Invalid rows and malformed JSON are rejected. Quantities are limited to 99 per product/store. Subtotal below 5,000 ₸ costs an additional 800 ₸; empty baskets and baskets from 5,000 ₸ have no delivery charge. Changes synchronize across tabs. If storage writes fail, the current page continues with an in-memory cart and a visible warning.

Only the cart and day/night preference are stored. Rating lasts for the current page visit. Sound is off initially and must be enabled separately on each page. No audio file or network call is required. A short two-tone Web Audio notification follows Test sound or Add to Cart when enabled; the busy guard blocks overlap and ended oscillators are disconnected.

The subscription popup traps focus, makes background content inert, closes with Escape/backdrop/close button and restores focus. Checkout uses Bootstrap's modal focus management and restores focus to checkout or the empty-cart link. Existing skip links, labels and focus outlines are retained. Main-navigation arrows work on all six pages. The responsive demonstration keeps its original pure-CSS layout and supports the same day/night theme.

## Files

```text
Food-Delivery-Platform-KN/
├── index.html, stores.html, compare.html, cart.html, login.html, responsive.html
├── css/
│   ├── style.css                 # Bootstrap customization, themes, interactive states
│   └── media-queries.css         # Plain-CSS responsive page
├── js/
│   ├── script.js                 # Assignment 6: all jQuery features (Tasks 0-9)
│   ├── app.js                    # Catalog data, cart, storage
│   ├── validation.js             # Shared validation and three demo-form callbacks
│   ├── checkout.js               # Three-step checkout, review and order completion
│   ├── interactions.js           # Keyboard, Read More, rating, sound
│   ├── theme.js                  # Persistent day/night preference
│   ├── accordion.js              # Existing FAQ behavior
│   ├── popup.js                  # Subscription dialog behavior
│   └── datetime.js               # Existing live clock
├── images/                       # Existing local photos
├── vendor/                       # Bootstrap 5.3.3 CSS/JS and MIT license
├── tests/browser.cjs             # Assignment 6 checks + regression checks and screenshots
├── docs/
│   ├── ASSIGNMENT-6-NOTES.md      # Task-by-task notes for the Assignment 6 report and defense
│   ├── Assignment-5-Report.pdf    # Illustrated submission report
│   ├── DEFENSE-RU.md              # Short explanation and demonstration guide
│   ├── TESTING.md                 # Results and scope of verification
│   ├── test-results.json          # Actual browser assertions
│   ├── axe-audit.json, axe-dark.json
│   └── screenshots/              # Real webpage and source-code screenshots
├── package.json, package-lock.json  # Optional development checks only
├── .gitattributes                # Keeps LF line endings so the vendor SRI hashes stay valid
└── .htmlvalidate.json
```

## Reproduce the checks

The website itself does not need Node.js. For development checks, use Node.js 22.17 or newer:

```sh
npm ci
npx playwright install chromium
npm run validate:html
python3 -m http.server 8765
```

In a second terminal, in the same folder:

```sh
npm test
```

`BASE_URL` can point to another HTTP origin. `CHROME_EXECUTABLE` can select a locally installed Chrome executable. Tests use synthetic input, overwrite local test-origin storage, and refresh the screenshots and JSON evidence in `docs/`. They check errors and successful paths, not real payments, email delivery or accounts. See `docs/TESTING.md` for the recorded browser version, assertions and limitations.

## Deployment and submission

GitHub Pages is configured for the `main` branch and `/` root. After editing and testing, commit and push the source to that shared repository, then wait for the Pages deployment to finish. Relative URLs keep the project working under `/Food-Delivery-Platform-KN/`.

Submit **both** the project ZIP and the PDF report. Every team member must submit separately in LMS and attend the defense. The LMS deadline was not provided in the project and must be checked in the course. `docs/ASSIGNMENT-6-NOTES.md` maps the implementation to the supplied Assignment 6 PDF; it does not claim that an LMS submission or defense has been completed.

Windows note: `.gitattributes` keeps LF line endings. Without it, Git with `core.autocrlf=true` rewrites `vendor/*` with CRLF, the SRI `integrity` hashes stop matching, and the browser blocks Bootstrap. Build the LMS ZIP from an LF checkout.

Bootstrap is distributed under the MIT license included in `vendor/BOOTSTRAP-LICENSE.txt`. Existing image provenance is retained in `images/README.md`.
