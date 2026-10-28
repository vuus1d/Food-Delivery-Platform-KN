/* Shared client-side rules for all Foodly demo forms. No personal data is stored. */
const FoodlyValidation = (() => {
    const rules = {
        name: value => /^[\p{L}\p{M}][\p{L}\p{M} .’'-]*$/u.test(value.trim()) && value.trim().length >= 2
            ? "" : "Enter a name of at least 2 letters (spaces, apostrophes and hyphens are allowed).",
        email: value => /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/.test(value.trim())
            ? "" : "Enter a valid email, for example name@mail.kz.",
        phone: value => /^[0-9 ()-]+$/.test(value.trim()) && value.replace(/\D/g, "").length === 10
            ? "" : "Enter exactly 10 digits after +7, for example 700 000 00 00.",
        password: value => value.trim().length > 0 && value.length >= 8
            ? "" : "Use at least 8 characters; a password cannot contain only spaces.",
        confirm: (value, field) => value === field.form.querySelector('[data-validate="password"]').value
            ? "" : "Passwords do not match.",
        address: value => value.trim().length >= 5 && /[\p{L}\p{N}]/u.test(value)
            ? "" : "Enter a delivery address of at least 5 characters.",
        message: value => value.trim().length >= 10
            ? "" : "Write at least 10 characters, excluding outer spaces."
    };

    function attach(form, onSuccess) {
        const fields = [...form.querySelectorAll("input, select, textarea")];
        const touched = new Set();
        const status = form.querySelector('[role="status"]');
        for (const field of fields) {
            let error = document.getElementById(`${field.id}-error`);
            if (!error) {
                error = document.createElement("p");
                error.id = `${field.id}-error`;
                field.closest(".input-group")?.classList.add("has-validation");
                const anchor = field.type === "checkbox" || field.type === "radio"
                    ? form.querySelector(`label[for="${field.id}"]`) : field;
                anchor.insertAdjacentElement("afterend", error);
            }
            error.className = "field-error";
            error.setAttribute("aria-live", "polite");
            const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(" ").filter(Boolean));
            describedBy.add(error.id);
            field.setAttribute("aria-describedby", [...describedBy].join(" "));
        }

        function validateField(field) {
            field.setCustomValidity("");
            const value = field.value;
            let message = "";
            if (field.required && ((field.type === "checkbox" && !field.checked) ||
                (field.type !== "checkbox" && !value.trim()))) {
                message = field.type === "checkbox" ? "Please confirm this option." : "This field is required.";
            } else if (value.trim() || field.required) {
                message = rules[field.dataset.validate]?.(value, field) || "";
            }
            if (!message && field.maxLength > 0 && value.length > field.maxLength) {
                message = `Use no more than ${field.maxLength} characters.`;
            }
            if (!message && !field.validity.valid) message = "Please choose or enter a valid value.";
            field.setCustomValidity(message);
            field.classList.toggle("is-invalid", Boolean(message));
            field.setAttribute("aria-invalid", String(Boolean(message)));
            document.getElementById(`${field.id}-error`).textContent = message;
            touched.add(field);
            return !message;
        }

        function validate(scope = form) {
            let firstInvalid = null;
            for (const field of fields.filter(field => scope.contains(field))) {
                if (!validateField(field) && !firstInvalid) firstInvalid = field;
            }
            firstInvalid?.focus();
            return !firstInvalid;
        }

        function clear() {
            touched.clear();
            form.classList.remove("was-validated");
            for (const field of fields) {
                field.setCustomValidity("");
                field.classList.remove("is-invalid");
                field.removeAttribute("aria-invalid");
                document.getElementById(`${field.id}-error`).textContent = "";
            }
            if (status) status.hidden = true;
        }

        function recheck(event) {
            const field = event.target;
            if (!fields.includes(field)) return;
            if (status) status.hidden = true;
            if (touched.has(field)) validateField(field);
            if (field.dataset.validate === "password") {
                const confirmation = fields.find(input => input.dataset.validate === "confirm");
                if (confirmation && touched.has(confirmation)) validateField(confirmation);
            }
        }
        form.addEventListener("input", recheck);
        form.addEventListener("change", recheck);
        form.addEventListener("reset", clear);
        if (onSuccess) form.addEventListener("submit", event => {
            event.preventDefault();
            if (!validate()) return;
            const values = Object.fromEntries(new FormData(form));
            form.reset();
            onSuccess(values);
        });
        return { validate, clear };
    }
    return { attach };
})();

document.addEventListener("DOMContentLoaded", () => {
    const demos = [
        ["register-form", "register-success", values => `Welcome, ${values.name.trim()}! Registration validated. This demo does not create or save an account.`],
        ["subscribe-form", "subscribe-success", values => `Thanks, ${values.name.trim()}! Subscription validated for ${values.email.trim()}. Nothing was sent or saved.`],
        ["contact-form", "feedback-status", () => "Thanks! Your feedback passed validation. This demo does not send or save your message."]
    ];
    for (const [formId, statusId, message] of demos) {
        const form = document.getElementById(formId);
        if (!form) continue;
        FoodlyValidation.attach(form, values => {
            const status = document.getElementById(statusId);
            status.textContent = message(values);
            status.hidden = false;
        });
    }
});
