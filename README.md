# 🥬 Foodly – Food Delivery Platform

Foodly is a website for browsing grocery stores in Astana, comparing everyday prices, and building a delivery basket.

Prices, promotions, store districts, and delivery options are demonstration data. Store photos are illustrative. Checkout does not charge money or book a real delivery, and the feedback form does not send or save messages.

---

## 🌐 Live Demo

**Live Website:**  
https://vuus1d.github.io/Food-Delivery-Platform-KN/

**GitHub Repository:**  
https://github.com/vuus1d/Food-Delivery-Platform-KN

---

## 👨‍💻 Authors

- **Kakhar Nassyrkhan** — Front-End Developer
- **Nurasyl Raiskaliev** — Front-End Developer

---

## 🛠️ Tech Stack

- **HTML5** — semantic page structure
- **CSS3** — brand colours, custom styles, and media queries
- **Bootstrap 5.3** — grid, spacing utilities, navbar, cards, carousel, forms, and modal (loaded from the jsDelivr CDN)
- **JavaScript** — cart, filters, search, sorting, and checkout
- **LocalStorage** — keeps the cart between visits
- **Git & GitHub Pages** — version control and hosting

---

## 📄 Pages

| Page | What it contains |
| --- | --- |
| `index.html` | Hero, "How Foodly works" steps, popular stores, a sample price table, a food photo carousel, the team, and a feedback form |
| `stores.html` | Store cards with a district filter, and a product catalog with search, sorting, and Add to Cart |
| `compare.html` | Price comparison table for Magnum, Small, and Galmart with category filters and search |
| `cart.html` | Cart items with quantity controls, subtotal, delivery fee, total, and a checkout form in a modal window |
| `responsive.html` | Responsive typography and store cards built with plain CSS media queries (no Bootstrap) |

---

## ✨ Features

- Shopping cart saved in LocalStorage and kept in sync across browser tabs
- Quantity controls, item removal, and Clear Cart
- Delivery fee of 800 ₸, free for orders from 5,000 ₸
- Store filter by district and product filter by category
- Product search and sorting by price or name
- Price comparison with the lowest price highlighted
- Food photo carousel with captions and controls
- Demo checkout with Kaspi Pay, bank card, or cash on delivery, plus form validation
- Responsive layout for phones, tablets, and desktops, with a collapsible navigation menu
- Accessibility: skip link, labelled controls, image alt text, visible focus styles, and reduced-motion support

---

## 📁 Project Structure

```text
Food-Delivery-Platform-KN/
│
├── index.html
├── stores.html
├── compare.html
├── cart.html
├── responsive.html
│
├── css/
│   ├── style.css            # brand styles on top of Bootstrap
│   └── media-queries.css    # styles for responsive.html
│
├── js/
│   └── app.js
│
├── images/
│   ├── bakery.jpg
│   ├── dairy.jpg
│   ├── delivery.jpg
│   ├── eggs.jpg
│   ├── fruits.jpg
│   ├── galmart.jpg
│   ├── groceries.jpg
│   ├── kakhar.jpg
│   ├── magnum.jpg
│   ├── meat.jpg
│   ├── milk.jpg
│   ├── nurasyl.jpg
│   ├── rice.jpg
│   ├── small.jpg
│   ├── vegetables.jpg
│   └── README.md
│
└── README.md
```

---

## ▶️ Run Locally

Clone the repository and open the project folder:

```sh
git clone https://github.com/vuus1d/Food-Delivery-Platform-KN.git
cd Food-Delivery-Platform-KN
```

Start a local HTTP server:

```sh
python -m http.server 8000
```

Then open http://localhost:8000/ in your browser.

No installation or build step is needed. An internet connection is required to load Bootstrap from the CDN, and JavaScript must be enabled for the cart and filters.

---

## 🚀 Deployment

The site is deployed with **GitHub Pages** from the `main` branch (root folder). All pages, styles, scripts, and images use relative paths.

https://vuus1d.github.io/Food-Delivery-Platform-KN/
