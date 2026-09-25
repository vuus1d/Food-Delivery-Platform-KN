# 🥬 Foodly – Food Delivery Platform

Foodly is a university **Web Technologies** project for browsing grocery stores in Astana, comparing sample prices, and building a delivery basket.

The website is built with vanilla **HTML, CSS, and JavaScript** without UI frameworks, a backend, or a build step.

Prices, promotions, delivery options, and store districts are demonstration data. Store photographs are illustrative. Checkout does not charge money or book real deliveries, and feedback is not sent or saved.

---

## 🌐 Live Demo

The project is deployed using **GitHub Pages**.

**Live Website:**  
https://vuus1d.github.io/Food-Delivery-Platform-KN/

**GitHub Repository:**  
https://github.com/vuus1d/Food-Delivery-Platform-KN

---

## 👨‍💻 Authors

- **Kakhar Nassyrkhan** — Front-End Developer / Project Author
- **Nurasyl Raiskaliev** — Front-End Developer / Project Author

---

## 🛠️ Tech Stack & Development Tools

<p align="left">
  <img src="https://skillicons.dev/icons?i=html,css,js,git,github,webstorm" alt="HTML, CSS, JavaScript, Git, GitHub and WebStorm" />
</p>

### Technologies

- **HTML5** — semantic structure and website content
- **CSS3** — styling, responsive design, hover effects and animations
- **Vanilla JavaScript** — cart, search, filters, sorting and LocalStorage
- **Flexbox** — navigation and card layouts
- **CSS Grid** — main page layout and image gallery
- **LocalStorage** — shopping cart persistence

### Development Tools

- **WebStorm** — main development environment
- **Git** — version control
- **GitHub** — repository hosting and collaboration
- **GitHub Pages** — deployment and website hosting
- **Chrome DevTools** — debugging and responsive design testing

---

## 📄 Pages

### Home — `index.html`

The main page contains:

- Introduction and hero section
- Shopping steps
- Popular stores
- Sample price comparison
- Food gallery
- Meet the Team section
- Contact and feedback form

### Stores — `stores.html`

The Stores page contains:

- Store cards
- District filters
- Product catalog
- Product search
- Product sorting
- Add-to-cart functionality

### Compare — `compare.html`

The Compare page contains:

- Grocery price comparison
- Product search
- Category filters
- Responsive comparison table

### Cart — `cart.html`

The Cart page contains:

- Added products
- Quantity controls
- Product removal
- Subtotal calculation
- Delivery fee calculation
- Total price
- Demo checkout
- Payment method selection

---

## ✨ Features

- Store browsing and product cards with local photos
- Price comparison with search and category filters
- Shopping cart with quantity controls
- Automatic total calculation
- LocalStorage cart persistence
- Cart updates across browser tabs
- Catalog search and sorting
- Recommended-order restoration
- Demo checkout
- Kaspi Pay payment option
- Bank card payment option
- Cash on delivery option
- Responsive navigation
- Responsive product and store cards
- CSS Grid page layout
- Nine-image food and delivery gallery
- Meet the Team section
- Real author photos
- Contact and feedback form
- Delivery form
- Keyboard focus styles
- Skip links
- Live status messages
- Reduced-motion support

---

## 📐 Assignment Requirements Implemented

| Requirement | Where to demonstrate it |
| --- | --- |
| **Flexbox Header & Navigation** | Every page. `#main-header` and `.nav-links` use `display: flex`, alignment, justification and gaps. |
| **Flexbox Cards** | Home and Stores. `.cards-container` wraps cards with three equal-height cards per row on desktop. |
| **CSS Grid Page Layout** | Every page. `.page-container` uses columns, rows and `grid-template-areas` for header, sidebar, main and footer. |
| **Useful Sidebar** | Store district filters, comparison category filters and shopping navigation. |
| **Grid Image Gallery** | Home → Food Gallery (`#gallery`) with nine local images, captions, hover effects and responsive columns. |
| **Team Cards** | Home → Meet the Team (`#team`) with both authors, roles, descriptions and real photos in circular frames. |
| **Headings & Paragraphs** | Used throughout all pages. |
| **Images & Links** | Used throughout the project with meaningful alt attributes. |
| **Unordered Lists** | Navigation, categories and sidebar sections. |
| **Ordered List** | Home → “How Foodly works”. |
| **Table** | Home and Compare pages. Uses `thead`, `tbody`, headings, hover effects and `:nth-child(even)`. |
| **Form** | Home → `#contact-form`. Includes name, email, topic dropdown, message and submit button. |
| **Additional Form** | Cart → delivery and payment form. |
| **Element Selectors** | `body`, `h1`, `p`, etc. |
| **Class Selectors** | `.card`, `.product-card`, `.team-card`, etc. |
| **ID Selectors** | `#main-header`, `#contact-form`, etc. |
| **Descendant Selectors** | `.nav-links a`, `.team-card img`, `.sidebar a`, etc. |
| **Responsive Design** | Media queries adapt navigation, sidebar, cards, gallery, forms and tables. |
| **Shared Footer** | Every page credits Kakhar Nassyrkhan and Nurasyl Raiskaliev. |

---

## 🖼️ Food Gallery

The Home page contains a responsive **CSS Grid gallery with nine images**.

Gallery categories include:

- Fruits
- Vegetables
- Bakery
- Dairy products
- Meat
- Groceries
- Delivery
- Milk
- Other grocery products

The gallery uses:

```css
display: grid;
grid-template-columns: repeat(...);
gap: ...;
```

Images include hover effects and captions.

---

## 👥 Meet the Team

The Home page contains a **Meet the Team** section with both project authors.

### Kakhar Nassyrkhan

**Front-End Developer / Project Author**

Worked on the interface, responsive layout, and project functionality.

### Nurasyl Raiskaliev

**Front-End Developer / Project Author**

Worked on page structure, product sections, and the user experience.

The author portraits are stored in:

```text
images/kakhar.jpg
images/nurasyl.jpg
```

The portraits use circular frames with:

```css
border-radius: 50%;
object-fit: cover;
```

---

## 🛒 Shopping Cart

The shopping cart is implemented with **Vanilla JavaScript**.

Users can:

- Add products to the cart
- Add products from different stores
- Increase quantity
- Decrease quantity
- Remove products
- Clear the cart
- View subtotal
- View delivery cost
- View total price
- Reload the page without losing the cart

Cart information is stored using:

```javascript
localStorage
```

The project uses the existing `cart` LocalStorage key.

---

## 💳 Demo Checkout

The Cart page contains a demonstration checkout.

Available payment methods:

- Kaspi Pay
- Bank Card
- Cash on Delivery

The checkout is for demonstration purposes only.

**No real payment is processed and no real delivery is booked.**

---

## 💰 Delivery Calculation

Delivery costs:

```text
800 ₸
```

for orders below:

```text
5,000 ₸
```

Delivery becomes free when the basket total reaches:

```text
5,000 ₸
```

An empty basket has no delivery charge.

---

## 📁 Project Structure

```text
Food-Delivery-Platform-KN/
│
├── index.html
├── stores.html
├── compare.html
├── cart.html
│
├── css/
│   └── style.css
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

## 📱 Responsive Design

Foodly is designed for:

- Desktop
- Laptop
- Tablet
- Mobile

Responsive layouts are implemented with CSS media queries.

The project was checked at:

```text
1440px
1024px
768px
390px
320px
```

On smaller screens:

- Navigation adapts to the available space
- Sidebar moves above the main content
- Cards change to fewer columns
- Product cards become one column on mobile
- Gallery reduces its number of columns
- Forms adapt to one column
- Tables remain horizontally scrollable

---

## ♿ Accessibility

The project includes several accessibility improvements:

- Semantic HTML
- Meaningful image `alt` attributes
- Form labels
- Accessible buttons
- Keyboard focus styles
- Skip links
- Live status messages
- Sufficient contrast
- Reduced-motion support

---

## ▶️ Run Locally

Clone the repository:

```sh
git clone https://github.com/vuus1d/Food-Delivery-Platform-KN.git
```

Open the project directory:

```sh
cd Food-Delivery-Platform-KN
```

Start a local HTTP server:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

or:

```text
http://localhost:8000/index.html
```

No package installation or build process is required.

JavaScript must be enabled for shopping, filtering and LocalStorage functionality.

---

## 🚀 Deployment

The project is deployed using **GitHub Pages** from the `main` branch.

### Live Website

https://vuus1d.github.io/Food-Delivery-Platform-KN/

### GitHub Repository

https://github.com/vuus1d/Food-Delivery-Platform-KN

### Deployment Configuration

```text
Branch: main
Folder: / (root)
Hosting: GitHub Pages
```

All internal HTML pages, images, stylesheets and JavaScript files use relative paths, making the project compatible with GitHub Pages.

---

## ✅ Testing & Checks

The project was tested locally in Google Chrome.

The following were checked:

- All four pages
- Desktop layout
- Tablet layout
- Mobile layout
- Navigation
- Internal links
- Image loading
- Author portraits
- Store filters
- Category filters
- Product search
- Empty search states
- Product sorting
- Recommended sorting reset
- Add to cart
- Increase quantity
- Decrease quantity
- Remove from cart
- Clear cart
- LocalStorage persistence
- Cross-tab cart updates
- Cart totals
- Delivery calculation
- Checkout validation
- Payment choices
- Feedback form
- Responsive tables
- JavaScript runtime errors
- Horizontal page overflow

The website was checked at widths from **320px to 1440px**.

No JavaScript runtime errors or horizontal page overflow were found during the final checks.

---

## 🎓 Project Purpose

This project was developed as part of a university **Web Technologies** assignment.

The main purpose of the project is to demonstrate practical knowledge of:

- HTML5
- CSS3
- JavaScript
- Flexbox
- CSS Grid
- Responsive Web Design
- Forms
- Tables
- LocalStorage
- Git
- GitHub
- GitHub Pages
- WebStorm
- Browser Developer Tools

---

## 👨‍💻 Authors

**Kakhar Nassyrkhan**  
Front-End Developer / Project Author

**Nurasyl Raiskaliev**  
Front-End Developer / Project Author

---

## 🔗 Links

**Live Website:**  
https://vuus1d.github.io/Food-Delivery-Platform-KN/

**GitHub Repository:**  
https://github.com/vuus1d/Food-Delivery-Platform-KN/
