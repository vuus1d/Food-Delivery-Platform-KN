/* Assignment 5: an object with methods, callbacks, loops and a three-step form. */
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("checkout-form");
    const dialog = document.getElementById("checkout-dialog");
    if (!form || !window.bootstrap) return;
    const modal = bootstrap.Modal.getOrCreateInstance(dialog);
    const validator = FoodlyValidation.attach(form);
    const steps = [...form.querySelectorAll("[data-checkout-step]")];
    const next = document.getElementById("checkout-next");
    const back = document.getElementById("checkout-back");
    const submit = document.getElementById("checkout-submit");
    const checkout = {
        step: 0,
        totals() {
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const delivery = subtotal > 0 && subtotal < 5000 ? DELIVERY_FEE : 0;
            return { subtotal, delivery, total: subtotal + delivery };
        },
        paymentLabel() {
            switch (form.elements.payment.value) {
                case "kaspi": return "Kaspi Pay (demo)";
                case "card": return "Bank card (demo)";
                case "cash": return "Cash on delivery (demo)";
                default: return "Choose a payment method";
            }
        },
        // The caller supplies the rendering callback. Inputs remain in the DOM.
        move(direction, onChange) {
            if (direction > 0 && !validator.validate(steps[this.step])) return;
            this.step = Math.max(0, Math.min(steps.length - 1, this.step + direction));
            onChange(this.step);
        }
    };

    function renderReview() {
        const review = document.getElementById("checkout-review");
        const totals = checkout.totals();
        const details = [
            ["Customer", form.elements.name.value.trim()],
            ["Phone", `+7 ${form.elements.phone.value.trim()}`],
            ["Address", form.elements.address.value.trim()],
            ["Payment", checkout.paymentLabel()],
            ["Delivery time", form.elements.deliveryTime.selectedOptions[0].textContent],
            ["Courier note", form.elements.note.value.trim() || "None"],
            ...cart.map(item => [`${item.name} × ${item.quantity} (${item.store})`, formatPrice(item.price * item.quantity)]),
            ["Delivery fee", formatPrice(totals.delivery)],
            ["Total", formatPrice(totals.total)]
        ];
        review.replaceChildren();
        for (const [label, value] of details) {
            const term = document.createElement("dt");
            const description = document.createElement("dd");
            term.textContent = label;
            description.textContent = value; // Personal input is never parsed as HTML.
            review.append(term, description);
        }
    }

    function renderStep(index, focus = true) {
        steps.forEach((step, position) => { step.hidden = position !== index; });
        form.querySelectorAll("[data-step-marker]").forEach((marker, position) => {
            if (position === index) marker.setAttribute("aria-current", "step");
            else marker.removeAttribute("aria-current");
        });
        back.hidden = index === 0;
        next.hidden = index === steps.length - 1;
        submit.hidden = index !== steps.length - 1;
        document.getElementById("checkout-step-status").textContent = `Step ${index + 1} of ${steps.length}`;
        if (index === 2) renderReview();
        if (focus) steps[index].querySelector("h3").focus();
    }

    next.addEventListener("click", () => checkout.move(1, renderStep));
    back.addEventListener("click", () => checkout.move(-1, renderStep));
    document.getElementById("checkout-btn").addEventListener("click", () => {
        if (!cart.length) return;
        checkout.step = 0;
        renderCart();
        renderStep(0, false);
        modal.show();
    });
    dialog.addEventListener("shown.bs.modal", () => steps[checkout.step].querySelector("h3").focus());
    dialog.addEventListener("hidden.bs.modal", () => {
        const target = cart.length ? document.getElementById("checkout-btn") : document.querySelector(".empty-cart a");
        target?.focus();
    });
    form.addEventListener("submit", event => {
        event.preventDefault();
        if (checkout.step < 2) {
            checkout.move(1, renderStep);
            return;
        }
        if (!cart.length) { modal.hide(); return; }
        // Revalidate every step, including fields hidden by the wizard.
        for (let index = 0; index < steps.length; index += 1) {
            if (!validator.validate(steps[index])) {
                checkout.step = index;
                renderStep(index, false);
                steps[index].querySelector(".is-invalid")?.focus();
                return;
            }
        }
        const status = document.getElementById("order-status");
        status.textContent = `Thanks, ${form.elements.name.value.trim()}! Your demo order totals ${formatPrice(checkout.totals().total)}. No payment was taken and no delivery was booked.`;
        status.hidden = false;
        cart = [];
        saveCart();
        renderCart();
        form.reset();
        checkout.step = 0;
        modal.hide();
    });
    window.addEventListener("storage", () => {
        if (checkout.step === 2) renderReview();
    });
});
