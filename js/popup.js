/* Assignment 4, Task 3: "Subscribe" popup form (index.html).
 * A custom modal window, not the Bootstrap modal.
 * It closes with the × button, a click on the dark background, or the Escape key. */
function setupSubscribePopup() {
    const popup = document.getElementById("subscribe-popup");
    const openButtons = document.querySelectorAll("[data-open-popup]");
    // Stop here on pages without the popup.
    if (!popup || openButtons.length === 0) return;

    const closeButton = popup.querySelector(".popup-close");
    const form = document.getElementById("subscribe-form");
    const nameInput = document.getElementById("subscribe-name");
    const emailInput = document.getElementById("subscribe-email");
    const nameError = document.getElementById("subscribe-name-error");
    const emailError = document.getElementById("subscribe-email-error");
    const successMessage = document.getElementById("subscribe-success");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    // Remember which button opened the popup so focus can go back to it.
    let lastOpenButton = null;

    function clearErrors() {
        nameError.textContent = "";
        emailError.textContent = "";
        nameInput.classList.remove("is-invalid");
        emailInput.classList.remove("is-invalid");
    }

    function openPopup(event) {
        lastOpenButton = event.currentTarget;
        popup.hidden = false;
        // Stop the page behind the popup from scrolling.
        document.body.classList.add("popup-open");
        nameInput.focus();
    }

    function closePopup() {
        popup.hidden = true;
        document.body.classList.remove("popup-open");
        clearErrors();
        successMessage.hidden = true;
        if (lastOpenButton) lastOpenButton.focus();
    }

    openButtons.forEach(button => button.addEventListener("click", openPopup));

    // Way 1: the × button.
    closeButton.addEventListener("click", closePopup);

    // Way 2: a click on the dark overlay. Clicks inside the white window
    // have a different event.target, so they do not close the popup.
    popup.addEventListener("click", event => {
        if (event.target === popup) closePopup();
    });

    // Way 3: the Escape key, only while the popup is visible.
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !popup.hidden) closePopup();
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        clearErrors();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        let isValid = true;

        if (name === "") {
            nameError.textContent = "Please enter your name.";
            nameInput.classList.add("is-invalid");
            isValid = false;
        }
        if (email === "") {
            emailError.textContent = "Please enter your email.";
            emailInput.classList.add("is-invalid");
            isValid = false;
        } else if (!emailPattern.test(email)) {
            emailError.textContent = "Please enter a valid email, e.g. name@mail.kz.";
            emailInput.classList.add("is-invalid");
            isValid = false;
        }
        if (!isValid) {
            successMessage.hidden = true;
            return;
        }

        successMessage.textContent = `Thanks, ${name}! Weekly deals will go to ${email} (demo only, nothing is sent).`;
        successMessage.hidden = false;
        form.reset();
    });
}

setupSubscribePopup();
