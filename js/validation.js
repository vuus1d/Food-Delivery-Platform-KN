/* Assignment 4, Task 1: registration form validation (login.html).
 * The browser's built-in validation is turned off with "novalidate",
 * so every check below is done by our own JavaScript. */
function setupRegisterForm() {
    const form = document.getElementById("register-form");
    // Stop here on pages that do not have this form.
    if (!form) return;

    const nameInput = document.getElementById("reg-name");
    const emailInput = document.getElementById("reg-email");
    const passwordInput = document.getElementById("reg-password");
    const confirmInput = document.getElementById("reg-confirm");
    const successMessage = document.getElementById("register-success");

    // Simple email pattern: text, then @, then text, a dot and at least 2 letters (name@mail.kz).
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    // Writes an error under one field (or clears it when message is "").
    // Each error element has the id "<input id>-error", e.g. "reg-name-error".
    function setError(input, message) {
        const errorElement = document.getElementById(`${input.id}-error`);
        errorElement.textContent = message;
        // Bootstrap's is-invalid class only adds the red border.
        input.classList.toggle("is-invalid", message !== "");
    }

    form.addEventListener("submit", event => {
        // Stop the page from reloading so JavaScript can check the data first.
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        // Passwords are not trimmed: a space is a valid password character.
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        let isValid = true;

        // 1. Name must not be empty.
        if (name === "") {
            setError(nameInput, "Please enter your name.");
            isValid = false;
        } else {
            setError(nameInput, "");
        }

        // 2. Email must not be empty and must match the pattern.
        if (email === "") {
            setError(emailInput, "Please enter your email.");
            isValid = false;
        } else if (!emailPattern.test(email)) {
            setError(emailInput, "Please enter a valid email, e.g. name@mail.kz.");
            isValid = false;
        } else {
            setError(emailInput, "");
        }

        // 3. Password must not be empty and must have at least 8 characters.
        if (password === "") {
            setError(passwordInput, "Please enter a password.");
            isValid = false;
        } else if (password.length < 8) {
            setError(passwordInput, "Password must be at least 8 characters long.");
            isValid = false;
        } else {
            setError(passwordInput, "");
        }

        // 4. Confirmation must not be empty and must be the same as the password.
        if (confirmPassword === "") {
            setError(confirmInput, "Please confirm your password.");
            isValid = false;
        } else if (confirmPassword !== password) {
            setError(confirmInput, "Passwords do not match.");
            isValid = false;
        } else {
            setError(confirmInput, "");
        }

        if (!isValid) {
            successMessage.hidden = true;
            // Move the cursor to the first field with an error.
            form.querySelector(".is-invalid").focus();
            return;
        }

        // Everything is valid: show the success message and clear the form.
        successMessage.textContent = `Welcome to Foodly, ${name}! Your account was created (demo only, nothing is saved).`;
        successMessage.hidden = false;
        form.reset();
    });

    // Remove a field's error as soon as the user starts typing in it again.
    form.addEventListener("input", event => setError(event.target, ""));
}

setupRegisterForm();
