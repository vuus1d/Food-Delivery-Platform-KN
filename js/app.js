let cart = JSON.parse(localStorage.getItem("cart")) || [];


/* =========================
   PRODUCTS
========================= */

const products = {

    Magnum: [
        {
            name: "Milk 1L",
            price: 480
        },
        {
            name: "Bread",
            price: 110
        },
        {
            name: "Rice 1kg",
            price: 690
        },
        {
            name: "Eggs C1",
            price: 620
        }
    ],

    Small: [
        {
            name: "Milk 1L",
            price: 495
        },
        {
            name: "Bread",
            price: 105
        },
        {
            name: "Rice 1kg",
            price: 720
        },
        {
            name: "Eggs C1",
            price: 640
        }
    ],

    Galmart: [
        {
            name: "Milk 1L",
            price: 540
        },
        {
            name: "Bread",
            price: 150
        },
        {
            name: "Rice 1kg",
            price: 710
        },
        {
            name: "Eggs C1",
            price: 680
        }
    ]

};


/* =========================
   SAVE CART
========================= */

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    updateCartCount();
}


/* =========================
   CART COUNT
========================= */

function updateCartCount() {

    const countElement =
        document.getElementById("cart-count");

    if (!countElement) {
        return;
    }

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    countElement.textContent = totalQuantity;
}


/* =========================
   ADD TO CART
========================= */

function addToCart(
    name,
    price,
    store
) {

    const existingProduct = cart.find(
        item =>
            item.name === name &&
            item.store === store
    );

    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({
            name: name,
            price: price,
            store: store,
            quantity: 1
        });

    }

    saveCart();

    renderCart();

    alert(`${name} was added to your cart.`);
}


/* =========================
   CHANGE QUANTITY
========================= */

function changeQuantity(
    index,
    change
) {

    if (!cart[index]) {
        return;
    }

    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }

    saveCart();

    renderCart();
}


/* =========================
   REMOVE FROM CART
========================= */

function removeFromCart(index) {

    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);

    saveCart();

    renderCart();
}


/* =========================
   CLEAR CART
========================= */

function clearCart() {

    if (cart.length === 0) {
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to clear your cart?"
    );

    if (!confirmed) {
        return;
    }

    cart = [];

    saveCart();

    renderCart();
}


/* =========================
   SHOW PRODUCTS
========================= */

function showProducts(store) {

    const container =
        document.getElementById("products");

    const catalog =
        document.getElementById("product-catalog");

    const title =
        document.getElementById("catalog-title");

    if (!container || !catalog) {
        return;
    }

    const storeProducts =
        products[store];

    if (!storeProducts) {
        return;
    }

    container.innerHTML = "";

    if (title) {
        title.textContent =
            `${store} Product Catalog`;
    }

    storeProducts.forEach(product => {

        container.innerHTML += `

            <div class="product-card">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    Store: ${store}
                </p>

                <h2>
                    ${product.price} ₸
                </h2>

                <button
                    class="btn add-product"
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-store="${store}"
                >
                    Add to Cart
                </button>

            </div>

        `;
    });

    catalog.hidden = false;

    catalog.scrollIntoView({
        behavior: "smooth"
    });
}


/* =========================
   RENDER CART
========================= */

function renderCart() {

    const container =
        document.getElementById("cart-items");

    const totalElement =
        document.getElementById("cart-total");

    if (!container || !totalElement) {
        return;
    }

    container.innerHTML = "";

    if (cart.length === 0) {

        container.innerHTML = `

            <div class="empty-cart">

                <h3>
                    Your cart is empty.
                </h3>

                <p>
                    Add products from the stores page.
                </p>

                <br>

                <a
                    href="stores.html"
                    class="btn"
                >
                    Go to Stores
                </a>

            </div>

        `;

        totalElement.textContent = "0 ₸";

        return;
    }


    let total = 0;


    cart.forEach((item, index) => {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;


        container.innerHTML += `

            <div class="cart-item">

                <div>

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        Store: ${item.store}
                    </p>

                    <p>
                        ${item.price} ₸ × ${item.quantity}
                    </p>

                </div>


                <div class="quantity-controls">

                    <button
                        class="quantity-btn"
                        data-action="decrease"
                        data-index="${index}"
                    >
                        −
                    </button>

                    <strong>
                        ${item.quantity}
                    </strong>

                    <button
                        class="quantity-btn"
                        data-action="increase"
                        data-index="${index}"
                    >
                        +
                    </button>

                    <button
                        class="danger-btn"
                        data-action="remove"
                        data-index="${index}"
                    >
                        Remove
                    </button>

                </div>


                <strong>
                    ${itemTotal} ₸
                </strong>

            </div>

        `;
    });


    totalElement.textContent =
        `${total} ₸`;
}


/* =========================
   SEARCH PRODUCTS
========================= */

function compareProducts() {

    const searchInput =
        document.getElementById("search");

    if (!searchInput) {
        return;
    }

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const rows =
        document.querySelectorAll(
            ".comparison-row"
        );


    rows.forEach(row => {

        const text =
            row.textContent.toLowerCase();

        if (text.includes(search)) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });
}


/* =========================
   CHECKOUT
========================= */

function checkout() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;
    }


    const total = cart.reduce(
        (sum, item) =>
            sum + item.price * item.quantity,
        0
    );


    alert(
        `Order created successfully!\n\nTotal: ${total} ₸`
    );


    cart = [];

    saveCart();

    renderCart();
}


/* =========================
   EVENT HANDLERS
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* Store buttons */

        document
            .querySelectorAll(".store-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const store =
                            button.dataset.store;

                        showProducts(store);

                    }
                );

            });


        /* Add to cart */

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".add-product"
                    );

                if (!button) {
                    return;
                }

                const name =
                    button.dataset.name;

                const price =
                    Number(button.dataset.price);

                const store =
                    button.dataset.store;

                addToCart(
                    name,
                    price,
                    store
                );

            }
        );


        /* Cart controls */

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );

                if (!button) {
                    return;
                }

                const action =
                    button.dataset.action;

                const index =
                    Number(button.dataset.index);


                if (action === "increase") {

                    changeQuantity(
                        index,
                        1
                    );

                }


                if (action === "decrease") {

                    changeQuantity(
                        index,
                        -1
                    );

                }


                if (action === "remove") {

                    removeFromCart(index);

                }

            }
        );


        /* Clear cart */

        const clearButton =
            document.getElementById(
                "clear-cart"
            );

        if (clearButton) {

            clearButton.addEventListener(
                "click",
                clearCart
            );

        }


        /* Checkout */

        const checkoutButton =
            document.getElementById(
                "checkout-btn"
            );

        if (checkoutButton) {

            checkoutButton.addEventListener(
                "click",
                checkout
            );

        }


        /* Search */

        const searchButton =
            document.getElementById(
                "search-btn"
            );

        if (searchButton) {

            searchButton.addEventListener(
                "click",
                compareProducts
            );

        }


        const searchInput =
            document.getElementById(
                "search"
            );

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                compareProducts
            );

        }


        /* Initial state */

        updateCartCount();

        renderCart();

    }
);