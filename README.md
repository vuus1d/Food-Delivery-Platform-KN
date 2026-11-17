# Foodly — Grocery Delivery & Price Comparison

Foodly is a static grocery shopping demonstration for comparing sample prices at supermarkets in Astana, building a cart, and practicing a demo checkout. It is the Team KN continuation of Assignments 1–6.

**Team:** KN · **Group:** SE-2506
**Members:** Kakhar Nassyrkhan and Nurasyl Raiskaliev
**Live site:** https://vuus1d.github.io/Food-Delivery-Platform-KN/
**Repository:** https://github.com/vuus1d/Food-Delivery-Platform-KN

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Store discovery, price examples, carousel, FAQ, feedback and Astana weather |
| `stores.html` | Store selection, product search, autocomplete, filters, sorting and add to cart |
| `compare.html` | Search and filter a grocery price comparison |
| `cart.html` | Persistent sample cart and multi-step demo checkout |
| `login.html` | Create an educational demo account |
| `signin.html` | Verify demo credentials and start a browser session |
| `profile.html` | Show the signed-in demo account and log out |
| `responsive.html` | CSS Grid and media-query demonstration; Bootstrap-free |

## Technologies and features

- HTML5, CSS3, Bootstrap 5.3.3, vanilla JavaScript and jQuery 4.0.0.
- One application script: `js/app.js`; Bootstrap and jQuery remain separate libraries.
- Responsive layout, shared navigation, keyboard support, focus states and persisted light/dark theme.
- Product search, autocomplete, category/store filtering, sorting, price comparison and safe text rendering.
- Cart quantities, totals, delivery fee/free-delivery threshold, storage persistence and demo checkout.
- Assignment 6 features: FAQ search/highlighting, scroll progress, counters, spinners, toast messages, clipboard copy and lazy images.
- Open-Meteo current weather for Astana with loading, error fallback and retry. The widget shows temperature, WMO weather condition, wind speed and update time; it does not estimate delivery time. Data source: [Open-Meteo Forecast API](https://open-meteo.com/en/docs).

## Demo authentication and privacy limits

Registration validates full name, email, optional Kazakhstan phone number, password and confirmation. Email comparisons are case-insensitive. A repeated email is rejected. For this coursework requirement, the demo account including its password is stored in this browser's `localStorage`; a successful login creates a `sessionStorage` session. The profile requires a matching session and never displays the password. Logging out clears the session.

**This is not secure authentication. Never use a real password or sensitive personal information.** Browser storage can be read or changed by the user and has no server-side protection. There is no backend, real email verification, payment, delivery booking or account recovery.

Feedback and subscriptions are demonstrations and do not send or save submitted content. Product prices and promotions are sample data.

## Form validation

Forms use JavaScript validation with `novalidate`, linked inline errors, `aria-invalid`, and focus on the first invalid input. Email syntax checks do not verify that a mailbox exists. Passwords must have at least 8 characters with uppercase, lowercase, a number and a special character. Phone input accepts ten national digits with reasonable separators and an optional `+7` prefix.

## Run locally

Node.js 22 or newer is recommended for the supplied development tools. From the project folder:

```sh
npm ci
python3 -m http.server 8000
```

Visit http://localhost:8000/. Bootstrap assets are included locally. jQuery 4.0.0 is loaded from its official CDN, so jQuery features require internet access. The weather widget also needs internet access. No build step or backend is used.

## Run checks

Install the Playwright browser once if it is not already available, then run:

```sh
npm run validate:html
node --check js/app.js
node --check tests/browser.cjs
npm test
```

The browser suite uses synthetic demo data and writes test results and genuine browser screenshots to `docs/`. It mocks Open-Meteo responses for deterministic success/error/retry checks; the actual public API is a separate live integration. See `docs/FINAL_TEST_REPORT.md` and `docs/FINAL_IMPLEMENTATION_SUMMARY.md` for the implementation evidence and limits.

## Deployment

GitHub Pages is configured for the `main` branch and repository root. Source changes in this local checkout are not live until a separately authorized push and successful Pages deployment. Relative links support the project subpath `/Food-Delivery-Platform-KN/`.
