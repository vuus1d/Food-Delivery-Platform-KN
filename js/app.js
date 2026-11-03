/* Foodly demo data: sample grocery prices in Kazakhstani tenge.
 * Shared catalog and cart behavior; forms use validation.js and checkout.js.
 * Assignment 6: toasts, catalog/compare filtering and lazy images now live in js/script.js (jQuery). */
const products = {
    Magnum: [
        { name: "Milk 1L", price: 480 },
        { name: "Bread", price: 110 },
        { name: "Rice 1kg", price: 690 },
        { name: "Eggs C1", price: 620 },
        { name: "Butter 200g", price: 1150 },
        { name: "Chicken Fillet 1kg", price: 2490 },
        { name: "Bananas 1kg", price: 850 },
        { name: "Salad Vegetables 1kg", price: 950 }
    ],
    Small: [
        { name: "Milk 1L", price: 495 },
        { name: "Bread", price: 105 },
        { name: "Rice 1kg", price: 720 },
        { name: "Eggs C1", price: 640 },
        { name: "Butter 200g", price: 1190 },
        { name: "Chicken Fillet 1kg", price: 2390 },
        { name: "Bananas 1kg", price: 820 },
        { name: "Salad Vegetables 1kg", price: 890 }
    ],
    Galmart: [
        { name: "Milk 1L", price: 540 },
        { name: "Bread", price: 150 },
        { name: "Rice 1kg", price: 710 },
        { name: "Eggs C1", price: 680 },
        { name: "Butter 200g", price: 1300 },
        { name: "Chicken Fillet 1kg", price: 2750 },
        { name: "Bananas 1kg", price: 990 },
        { name: "Salad Vegetables 1kg", price: 1100 }
    ]
};

const DELIVERY_FEE = 800;
// Product photos live in the shared images/ folder.
const IMAGE_PATH = "images/";
const productDetails = {
    "Milk 1L": { image: "milk", description: "A fresh staple for breakfast, coffee, and cooking." },
    "Bread": { image: "bakery", description: "An everyday loaf for toast and sandwiches." },
    "Rice 1kg": { image: "rice", description: "A pantry essential for your favorite family meals." },
    "Eggs C1": { image: "eggs", description: "A pack of 10 eggs for breakfast and baking." },
    "Butter 200g": { image: "dairy", description: "Creamy 82.5% butter for toast, pastry, and porridge." },
    "Chicken Fillet 1kg": { image: "meat", description: "Lean fillet for quick dinners and meal prep." },
    "Bananas 1kg": { image: "fruits", description: "Sweet fruit for snacks, smoothies, and lunch boxes." },
    "Salad Vegetables 1kg": { image: "vegetables", description: "Crisp seasonal vegetables for an everyday salad." }
};
const formatPrice = amount => `${amount.toLocaleString("en-US")} ₸`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem("cart") || "[]");
        if (!Array.isArray(saved)) return [];
        const clean = [];
        for (const item of saved) {
            const product = item && Object.hasOwn(products, item.store || "")
                ? products[item.store].find(product => product.name === item.name) : null;
            if (!product || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) continue;
            const existing = clean.find(row => row.store === item.store && row.name === item.name);
            if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity);
            else clean.push({ name: product.name, store: item.store, price: product.price, quantity: item.quantity });
        }
        return clean;
    } catch (error) {
        return [];
    }
}

let cart = loadCart();

function saveCart() {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
        const status = document.getElementById("storage-status");
        status.hidden = false;
        status.textContent = "Your browser could not save the cart. Items will stay available on this page until you leave or reload.";
    }
    updateCartCount();
}

function updateCartCount() {
    const count = document.getElementById("cart-count");
    if (!count) return;
    count.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function addToCart(name, price, store) {
    const existing = cart.find(item => item.name === name && item.store === store);
    if (existing?.quantity >= 99) {
        showToast("You can add up to 99 of one product.", "warning");
        return;
    }
    if (existing) existing.quantity += 1;
    else cart.push({ name, price, store, quantity: 1 });
    saveCart();
    renderCart();
    showToast(`${name} added to your cart.`, "success");
    document.dispatchEvent(new CustomEvent("foodly:cart-added"));
}

function changeQuantity(index, change) {
    const item = cart[index];
    if (!item) return;
    if (item.quantity + change > 99) {
        showToast("You can add up to 99 of one product.", "warning");
        return;
    }
    item.quantity += change;
    if (item.quantity <= 0) cart.splice(index, 1);
    saveCart();
    renderCart();
}

function removeFromCart(index) {
    if (!cart[index]) return;
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function clearCart() {
    if (!cart.length || !window.confirm("Are you sure you want to clear your cart?")) return;
    cart = [];
    saveCart();
    renderCart();
}

function showProducts(store) {
    const container = document.getElementById("products");
    const catalog = document.getElementById("product-catalog");
    const title = document.getElementById("catalog-title");
    if (!container || !catalog || !Object.hasOwn(products, store)) return;

    title.textContent = `${store} Product Catalog`;
    container.innerHTML = products[store].map((product, index) => `
        <div class="col" data-order="${index}">
            <article class="card h-100 border-0 rounded-4 overflow-hidden shadow-foodly card-lift">
                <img src="${LAZY_PLACEHOLDER}" data-src="${IMAGE_PATH}${productDetails[product.name].image}.jpg" class="card-img-top product-img lazy-img" alt="${escapeHTML(product.name)}" width="400" height="300">
                <div class="card-body d-flex flex-column p-3">
                    <h3 class="card-title h5 mb-1">${escapeHTML(product.name)}</h3>
                    <p class="card-text small text-body-secondary flex-grow-1 mb-2 product-description">${productDetails[product.name].description}</p>
                    <p class="card-text small mb-1">Store: ${escapeHTML(store)}</p>
                    <strong class="fs-4 text-success-emphasis mb-3">${formatPrice(product.price)}</strong>
                    <button class="btn btn-primary w-100 add-product" type="button" aria-label="Add ${escapeHTML(product.name)} from ${escapeHTML(store)} to cart" data-name="${escapeHTML(product.name)}" data-price="${product.price}" data-store="${escapeHTML(store)}">Add to Cart</button>
                </div>
            </article>
        </div>`).join("");
    catalog.hidden = false;
    filterCatalog(); // js/script.js: jQuery sort, live filter and lazy images
    title.focus({ preventScroll: true });
    catalog.scrollIntoView({ block: "start" });
}

function renderCart() {
    const container = document.getElementById("cart-items");
    if (!container) return;

    if (!cart.length) {
        container.innerHTML = '<div class="empty-cart rounded-4 bg-body-tertiary text-center p-4"><h2 class="h5">Your cart is empty.</h2><p class="text-body-secondary">Add products from the stores page to get started.</p><a href="stores.html" class="btn btn-primary">Go to Stores</a></div>';
    } else {
        container.innerHTML = cart.map((item, index) => `
            <article class="card border rounded-3">
                <div class="card-body d-flex flex-wrap align-items-center justify-content-between gap-3 p-3">
                    <div class="flex-grow-1"><h2 class="card-title h6 mb-1">${escapeHTML(item.name)}</h2><p class="card-text small text-body-secondary mb-0">Store: ${escapeHTML(item.store)} · ${formatPrice(item.price)} × ${item.quantity}</p></div>
                    <div class="d-flex flex-wrap align-items-center gap-2">
                        <div class="btn-group btn-group-sm" role="group" aria-label="Quantity controls for ${escapeHTML(item.name)}">
                            <button class="btn btn-outline-secondary" type="button" data-action="decrease" data-index="${index}" aria-label="Decrease ${escapeHTML(item.name)} quantity">−</button>
                            <span class="btn btn-outline-secondary disabled text-body fw-bold" aria-live="polite">${item.quantity}</span>
                            <button class="btn btn-outline-secondary" type="button" data-action="increase" data-index="${index}" aria-label="Increase ${escapeHTML(item.name)} quantity">+</button>
                        </div>
                        <button class="btn btn-outline-danger btn-sm" type="button" data-action="remove" data-index="${index}" aria-label="Remove ${escapeHTML(item.name)} from ${escapeHTML(item.store)}">Remove</button>
                    </div>
                    <strong class="text-end">${formatPrice(item.price * item.quantity)}</strong>
                </div>
            </article>`).join("");
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal === 0 || subtotal >= 5000 ? 0 : DELIVERY_FEE;
    const total = subtotal + delivery;
    const subtotalElement = document.getElementById("cart-subtotal");
    const deliveryElement = document.getElementById("delivery-fee");
    const totalElement = document.getElementById("cart-total");
    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (deliveryElement) deliveryElement.textContent = formatPrice(delivery);
    if (totalElement) totalElement.textContent = formatPrice(total);
    const checkoutTotal = document.getElementById("checkout-total");
    if (checkoutTotal) checkoutTotal.textContent = formatPrice(total);
    const checkoutButton = document.getElementById("checkout-btn");
    if (checkoutButton) checkoutButton.disabled = cart.length === 0;
    const clearButton = document.getElementById("clear-cart");
    if (clearButton) clearButton.disabled = cart.length === 0;
}

function init() {
    // A persistent live region reports storage errors without interrupting shopping.
    const storageStatus = document.createElement("p");
    storageStatus.id = "storage-status";
    storageStatus.className = "alert alert-warning";
    storageStatus.setAttribute("role", "status");
    storageStatus.hidden = true;
    document.querySelector("main").prepend(storageStatus);

    updateCartCount();
    renderCart();

    document.querySelectorAll(".store-btn").forEach(button => button.addEventListener("click", () => showProducts(button.dataset.store)));
    document.addEventListener("click", event => {
        const addButton = event.target.closest(".add-product");
        if (addButton) addToCart(addButton.dataset.name, Number(addButton.dataset.price), addButton.dataset.store);

        const cartButton = event.target.closest("[data-action]");
        if (cartButton) {
            const index = Number(cartButton.dataset.index);
            if (cartButton.dataset.action === "increase") changeQuantity(index, 1);
            if (cartButton.dataset.action === "decrease") changeQuantity(index, -1);
            if (cartButton.dataset.action === "remove") removeFromCart(index);
            // Rendering replaces the controls; keep keyboard focus near the edited item.
            const nextIndex = Math.min(index, cart.length - 1);
            const nextControl = document.querySelector(`[data-action="${cartButton.dataset.action}"][data-index="${nextIndex}"]`);
            (nextControl || document.querySelector(".empty-cart a"))?.focus();
        }
    });

    document.getElementById("clear-cart")?.addEventListener("click", clearCart);
    // The compare.html search and category filters moved to js/script.js (jQuery, Task 1).

    document.querySelectorAll(".store-filter").forEach(button => button.addEventListener("click", () => {
        document.querySelectorAll(".store-filter").forEach(filter => {
            const active = filter === button;
            filter.classList.toggle("active", active);
            filter.setAttribute("aria-pressed", String(active));
        });
        document.querySelectorAll(".store-card").forEach(card => {
            card.hidden = button.dataset.district !== "all" && card.dataset.district !== button.dataset.district;
        });
    }));
    // Catalog search and sorting events are bound in js/script.js (jQuery, Tasks 1-2).

    const requestedStore = new URLSearchParams(window.location.search).get("store");
    if (requestedStore && Object.hasOwn(products, requestedStore)) showProducts(requestedStore);
}

document.addEventListener("DOMContentLoaded", init);
// Keep the count and totals current when the cart changes in another tab.
window.addEventListener("storage", event => {
    if (event.key === "cart" || event.key === null) {
        cart = loadCart();
        updateCartCount();
        renderCart();
        const dialog = document.getElementById("checkout-dialog");
        if (!cart.length && dialog && window.bootstrap) bootstrap.Modal.getInstance(dialog)?.hide();
    }
});
