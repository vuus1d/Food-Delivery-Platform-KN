/* Foodly demo data: sample grocery prices in Kazakhstani tenge. */
const products = {
    Magnum: [
        { name: "Milk 1L", price: 480 },
        { name: "Bread", price: 110 },
        { name: "Rice 1kg", price: 690 },
        { name: "Eggs C1", price: 620 }
    ],
    Small: [
        { name: "Milk 1L", price: 495 },
        { name: "Bread", price: 105 },
        { name: "Rice 1kg", price: 720 },
        { name: "Eggs C1", price: 640 }
    ],
    Galmart: [
        { name: "Milk 1L", price: 540 },
        { name: "Bread", price: 150 },
        { name: "Rice 1kg", price: 710 },
        { name: "Eggs C1", price: 680 }
    ]
};

const DELIVERY_FEE = 800;
const productDetails = {
    "Milk 1L": { image: "milk", description: "A fresh staple for breakfast, coffee, and cooking." },
    "Bread": { image: "bakery", description: "An everyday loaf for toast and sandwiches." },
    "Rice 1kg": { image: "rice", description: "A pantry essential for your favorite family meals." },
    "Eggs C1": { image: "eggs", description: "A pack of 10 eggs for breakfast and baking." }
};
const formatPrice = amount => `${amount.toLocaleString("en-US")} ₸`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem("cart") || "[]");
        if (!Array.isArray(saved)) return [];
        return saved.filter(item => item && typeof item.name === "string" && typeof item.store === "string" &&
            Number.isFinite(Number(item.price)) && Number(item.price) >= 0 && Number.isSafeInteger(Number(item.quantity)) && Number(item.quantity) > 0)
            .map(item => ({ name: item.name, store: item.store, price: Number(item.price), quantity: Math.floor(Number(item.quantity)) }));
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

function showToast(message) {
    document.querySelector(".toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.append(toast);
    window.setTimeout(() => toast.remove(), 2600);
}

function addToCart(name, price, store) {
    const existing = cart.find(item => item.name === name && item.store === store);
    if (existing) existing.quantity += 1;
    else cart.push({ name, price, store, quantity: 1 });
    saveCart();
    renderCart();
    showToast(`${name} added to your cart.`);
}

function changeQuantity(index, change) {
    const item = cart[index];
    if (!item) return;
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
        <article class="product-card" data-order="${index}">
            <img src="images/${productDetails[product.name].image}.jpg" alt="${escapeHTML(product.name)}" width="400" height="300" loading="lazy">
            <h3>${escapeHTML(product.name)}</h3>
            <p class="product-description">${productDetails[product.name].description}</p>
            <p>Store: ${escapeHTML(store)}</p>
            <strong class="product-price">${formatPrice(product.price)}</strong>
            <button class="btn add-product" type="button" aria-label="Add ${escapeHTML(product.name)} from ${escapeHTML(store)} to cart" data-name="${escapeHTML(product.name)}" data-price="${product.price}" data-store="${escapeHTML(store)}">Add to Cart</button>
        </article>`).join("");
    catalog.hidden = false;
    filterCatalog();
    title.focus({ preventScroll: true });
    catalog.scrollIntoView({ block: "start" });
}

function filterCatalog() {
    const input = document.getElementById("catalog-search");
    const sort = document.getElementById("catalog-sort");
    const container = document.getElementById("products");
    const empty = document.getElementById("catalog-empty");
    if (!input || !sort || !container) return;

    const query = input.value.trim().toLowerCase();
    const cards = [...container.children];
    cards.sort((first, second) => {
        if (sort.value === "price-asc") return Number(first.querySelector(".add-product").dataset.price) - Number(second.querySelector(".add-product").dataset.price);
        if (sort.value === "price-desc") return Number(second.querySelector(".add-product").dataset.price) - Number(first.querySelector(".add-product").dataset.price);
        if (sort.value === "name") return first.querySelector("h3").textContent.localeCompare(second.querySelector("h3").textContent);
        return Number(first.dataset.order) - Number(second.dataset.order);
    });

    let visible = 0;
    cards.forEach(card => {
        const matches = card.textContent.toLowerCase().includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
        container.append(card);
    });
    if (empty) empty.hidden = visible !== 0;
    document.getElementById("catalog-status").textContent = `${visible} product${visible === 1 ? "" : "s"} shown`;
}

function renderCart() {
    const container = document.getElementById("cart-items");
    if (!container) return;

    if (!cart.length) {
        container.innerHTML = '<div class="empty-cart"><h3>Your cart is empty.</h3><p>Add products from the stores page to get started.</p><a href="stores.html" class="btn">Go to Stores</a></div>';
    } else {
        container.innerHTML = cart.map((item, index) => `
            <article class="cart-item">
                <div class="cart-item-info"><h3>${escapeHTML(item.name)}</h3><p>Store: ${escapeHTML(item.store)}</p><p>${formatPrice(item.price)} × ${item.quantity}</p></div>
                <div class="quantity-controls" aria-label="Quantity controls for ${escapeHTML(item.name)}">
                    <button class="quantity-btn" type="button" data-action="decrease" data-index="${index}" aria-label="Decrease ${escapeHTML(item.name)} quantity">−</button>
                    <strong aria-live="polite">${item.quantity}</strong>
                    <button class="quantity-btn" type="button" data-action="increase" data-index="${index}" aria-label="Increase ${escapeHTML(item.name)} quantity">+</button>
                    <button class="remove-btn" type="button" data-action="remove" data-index="${index}" aria-label="Remove ${escapeHTML(item.name)} from ${escapeHTML(item.store)}">Remove</button>
                </div>
                <strong>${formatPrice(item.price * item.quantity)}</strong>
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

function compareProducts() {
    const search = document.getElementById("search");
    const rows = [...document.querySelectorAll(".comparison-row")];
    if (!search || !rows.length) return;
    const query = search.value.trim().toLowerCase();
    const selectedCategory = document.querySelector(".category-filter.is-active")?.dataset.category || "all";
    let visible = 0;
    rows.forEach(row => {
        const matchesQuery = row.textContent.toLowerCase().includes(query);
        const matchesCategory = selectedCategory === "all" || row.dataset.category === selectedCategory;
        row.hidden = !(matchesQuery && matchesCategory);
        if (!row.hidden) visible += 1;
    });
    const empty = document.getElementById("comparison-empty");
    if (empty) empty.hidden = visible !== 0;
    const status = document.getElementById("comparison-status");
    if (status) status.textContent = `${visible} product${visible === 1 ? "" : "s"} shown`;
}

function init() {
    // A persistent live region reports storage errors without interrupting shopping.
    const storageStatus = document.createElement("p");
    storageStatus.id = "storage-status";
    storageStatus.className = "order-status";
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
    const checkoutButton = document.getElementById("checkout-btn");
    const checkoutDialog = document.getElementById("checkout-dialog");
    const checkoutForm = document.getElementById("checkout-form");
    checkoutButton?.addEventListener("click", () => {
        if (!cart.length) return;
        renderCart();
        if (checkoutDialog?.showModal) checkoutDialog.showModal();
    });
    document.getElementById("close-checkout")?.addEventListener("click", () => checkoutDialog?.close());
    checkoutForm?.addEventListener("submit", event => {
        event.preventDefault();
        if (!checkoutForm.reportValidity() || !cart.length) return;
        const name = checkoutForm.elements.name.value.trim();
        const orderStatus = document.getElementById("order-status");
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const amountDue = total + (total > 0 && total < 5000 ? DELIVERY_FEE : 0);
        if (orderStatus) {
            orderStatus.textContent = `Thanks, ${name}! Your demo order totals ${formatPrice(amountDue)}. No payment was taken and no delivery was booked.`;
            orderStatus.hidden = false;
        }
        cart = [];
        saveCart();
        renderCart();
        checkoutForm.reset();
        checkoutDialog?.close();
    });

    document.getElementById("search")?.addEventListener("input", compareProducts);
    document.getElementById("search-btn")?.addEventListener("click", compareProducts);
    document.getElementById("clear-search")?.addEventListener("click", () => {
        const input = document.getElementById("search");
        if (input) input.value = "";
        compareProducts();
    });
    document.querySelectorAll(".category-filter").forEach(button => button.addEventListener("click", () => {
        document.querySelectorAll(".category-filter").forEach(filter => {
            const active = filter === button;
            filter.classList.toggle("is-active", active);
            filter.setAttribute("aria-pressed", String(active));
        });
        compareProducts();
    }));

    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    if (requestedCategory) {
        const categoryButton = [...document.querySelectorAll(".category-filter")]
            .find(button => button.dataset.category === requestedCategory);
        categoryButton?.click();
    }

    document.querySelectorAll(".store-filter").forEach(button => button.addEventListener("click", () => {
        document.querySelectorAll(".store-filter").forEach(filter => {
            const active = filter === button;
            filter.classList.toggle("is-active", active);
            filter.setAttribute("aria-pressed", String(active));
        });
        document.querySelectorAll(".store-card").forEach(card => {
            card.hidden = button.dataset.district !== "all" && card.dataset.district !== button.dataset.district;
        });
    }));
    document.getElementById("catalog-search")?.addEventListener("input", filterCatalog);
    document.getElementById("catalog-sort")?.addEventListener("change", filterCatalog);

    const requestedStore = params.get("store");
    if (requestedStore && Object.hasOwn(products, requestedStore)) showProducts(requestedStore);

    document.getElementById("contact-form")?.addEventListener("submit", event => {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;
        const status = document.getElementById("feedback-status");
        if (status) {
            status.textContent = "Thanks for your feedback. This demo form does not send data to a server.";
            status.hidden = false;
        }
        event.currentTarget.reset();
    });

    compareProducts();
}

document.addEventListener("DOMContentLoaded", init);
// Keep the count and totals current when the cart changes in another tab.
window.addEventListener("storage", event => {
    if (event.key === "cart" || event.key === null) {
        cart = loadCart();
        updateCartCount();
        renderCart();
        if (!cart.length) document.getElementById("checkout-dialog")?.close();
    }
});
