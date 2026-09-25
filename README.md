# Foodly – Food Delivery Platform

## Authors

- Kakhar Nassyrkhan
- Nurasyl Raiskaliev

## Project Description

Foodly is a university Web Technologies project for browsing grocery stores in Astana, comparing sample prices, and building a delivery basket. The existing four-page website uses vanilla HTML, CSS, and JavaScript, with no UI frameworks, build step, or backend.

Prices, promotions, delivery options, and store districts are demonstration data. Store photographs are illustrative. Checkout does not charge money or book deliveries, and feedback is not sent or saved.

## Pages

- **Home** (`index.html`): introduction, shopping steps, featured stores, sample comparison, food gallery, team, and feedback.
- **Stores** (`stores.html`): district filters and store catalogs with search, sorting, and add-to-cart buttons.
- **Compare** (`compare.html`): price comparison with product search and category filters.
- **Cart** (`cart.html`): quantities, removal, subtotal, delivery fee, total, and demo checkout.

## Features

- Store browsing and product cards with local photos
- Price comparison with search and category filters
- Shopping cart with quantity controls and total calculation
- LocalStorage persistence using the existing `cart` key
- Cart updates across tabs and a visible message when saving is blocked
- Catalog search and sorting, including restoring the recommended order
- Demo payment choices: Kaspi Pay, bank card, and cash on delivery
- Responsive Flexbox navigation, store cards, and product cards
- CSS Grid page layout with named areas
- Nine-image food and delivery gallery
- Team section for both authors
- Labeled contact/feedback and delivery forms
- Keyboard focus styles, skip links, live status messages, and reduced-motion support

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Flexbox
- CSS Grid

## Assignment Requirements Implemented

| Requirement | Where to demonstrate it |
| --- | --- |
| Flexbox header and navigation | Every page; `#main-header` and `.nav-links` use `display: flex`, alignment, justification, and gaps. |
| Flexbox cards | Home and Stores; `.cards-container` wraps cards, with three equal-height cards per row on desktop. |
| Grid page layout | Every page; `.page-container` uses columns, rows, and `grid-template-areas` for header, sidebar, main, and footer. |
| Useful sidebar | Store district filters, comparison category filters, and shopping navigation. |
| Grid image gallery | Home → Food Gallery (`#gallery`); nine local images, captions, hover effects, and responsive columns. |
| Team cards | Home → Meet the Team (`#team`); both authors, roles, descriptions, and their real photos in matching circular frames. |
| Headings, paragraphs, images, links | Integrated throughout all pages. |
| Unordered and ordered lists | Navigation/category lists and the Home “How Foodly works” steps. |
| Table | Compare and Home; five columns, caption, `thead`, `tbody`, scoped headings, row hover, and `:nth-child(even)`. The table region scrolls horizontally and is keyboard focusable. |
| Form | Home (`#contact-form`): name, email, topic dropdown, message, submit button, validation, and confirmation. Cart also has a delivery form. |
| Four CSS selector types | Element: `body`, `h1`, `p`; class: `.card`; ID: `#main-header`, `#contact-form`; descendant: `.nav-links a`, `.team-card img`. |
| Responsive design | Media queries at 1050px, 760px, and 540px adapt sidebars, navigation, cards, gallery, forms, and tables. Mobile layouts use CSS. |
| Shared footer | Every page credits Kakhar Nassyrkhan and Nurasyl Raiskaliev and links to all four pages. |

## Project Structure

```text
index.html       Home, gallery, team, and feedback
stores.html      Store directory and product catalog
compare.html     Searchable price comparison
cart.html        Shopping cart and demo checkout
css/style.css    Shared styles, organized by section
js/app.js        Demo data, cart, catalog, filters, and forms
images/          Local food/store photos, both author portraits, and source notes
```

## Author Photos

Both real author photos are included in the Meet the Team section with the confirmed mapping:

1. **Image #1 → Nurasyl Raiskaliev → `images/nurasyl.jpg`** (glasses, hackalem.ai event).
2. **Image #2 → Kakhar Nassyrkhan → `images/kakhar.jpg`** (white shirt, black vest, and tie).

The original JPEGs are preserved and load directly from HTML, including when JavaScript is disabled. CSS frames each face in a matching 128 × 128 pixel circle with `border-radius: 50%`, `object-fit: cover`, and individual zoom/position settings. No placeholder files or missing-photo requests remain.

See [image sources and portrait mapping](images/README.md). All images are included; no manual downloads are needed.

## Run Locally

From the repository folder:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html`. A local server gives the four pages a consistent origin for LocalStorage. No package installation or build is required. JavaScript must be enabled for shopping and filtering.

## GitHub Pages

After reviewing and committing the changes, publish the repository root through GitHub Pages (branch: `main`, folder: `/`). All internal page, image, stylesheet, and script links are relative, so they also work under the repository's project URL. No deployment or push is performed as part of these edits.

## Checks

Completed locally in Chrome: all four pages at 1440, 1024, 768, 390, and 320 pixels; no horizontal page overflow or JavaScript runtime errors. Verified home-to-catalog navigation, three desktop store cards, nine gallery images, image decoding, district/category filters, search and empty states, sorting reset, cart totals and reload persistence, cross-tab updates, invalid/blocked storage, feedback, and demo checkout. Desktop and mobile Home screenshots were also visually reviewed. Static checks passed for HTML nesting, unique IDs, labels, internal links/fragments, CSS/JS paths, and displayed image paths.

Review all four pages at desktop, tablet, and mobile widths. Open each store catalog, search and sort products, add products from different stores, change quantities, reload the cart, and try the demo checkout. Delivery costs 800 ₸ below 5,000 ₸ and is free from 5,000 ₸; an empty basket has no delivery charge. Also try category filters, searches with no results, and the feedback form.

Before submitting the assignment, review the site on your published GitHub Pages URL.
