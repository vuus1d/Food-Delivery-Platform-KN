let cart = JSON.parse(localStorage.getItem("cart")) || [];

const products = {
    Magnum: [
        {name: "Milk 1L", price: 850},
        {name: "Bread", price: 250},
        {name: "Rice 1kg", price: 690}
    ],

    Small: [
        {name: "Milk 1L", price: 790},
        {name: "Bread", price: 230},
        {name: "Rice 1kg", price: 720}
    ],

    Arbuz: [
        {name: "Milk 1L", price: 820},
        {name: "Bread", price: 260},
        {name: "Rice 1kg", price: 710}
    ],

    Metro: [
        {name: "Milk 1L", price: 870},
        {name: "Bread", price: 240},
        {name: "Rice 1kg", price: 680}
    ]
};

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = document.getElementById("cart-count");

    if (count) {
        count.textContent = cart.length;
    }
}

function addToCart(name, price) {

    cart.push({
        name: name,
        price: price
    });

    saveCart();

    alert(name + " added to cart");
}

function showProducts(store) {

    const container = document.getElementById("products");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    products[store].forEach(product => {

        container.innerHTML += `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p>${store}</p>
                <h2>${product.price} ₸</h2>

                <button
                    class="btn"
                    onclick="addToCart('${product.name}', ${product.price})">
                    Add to cart
                </button>
            </div>
        `;
    });
}

function renderCart() {

    const container = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {

        total += item.price;

        container.innerHTML += `
            <div class="cart-item">
                <div>
                    <h3>${item.name}</h3>
                    <p>${item.price} ₸</p>
                </div>

                <button onclick="removeFromCart(${index})">
                    Remove
                </button>
            </div>
        `;
    });

    totalElement.textContent = total + " ₸";
}

function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();

    renderCart();
}

function compareProducts() {

    const search = document
        .getElementById("search")
        .value
        .toLowerCase();

    const cards = document.querySelectorAll(".comparison-card");

    cards.forEach(card => {

        const text = card.textContent.toLowerCase();

        if (text.includes(search)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

function checkout() {

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    alert("Order created successfully!");

    cart = [];

    saveCart();

    renderCart();
}

updateCartCount();
renderCart();