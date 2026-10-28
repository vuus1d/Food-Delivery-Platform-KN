/* Custom subscription dialog: close, Escape, backdrop, focus trap and restoration. */
(() => {
    const popup = document.getElementById("subscribe-popup");
    if (!popup) return;
    let opener = null;
    const background = [...document.body.children].filter(element =>
        element !== popup && !["SCRIPT"].includes(element.tagName));
    function closePopup() {
        popup.hidden = true;
        document.body.classList.remove("popup-open");
        background.forEach(element => { element.inert = false; });
        opener?.focus();
    }
    document.querySelectorAll("[data-open-popup]").forEach(button => {
        button.addEventListener("click", () => {
            opener = button;
            popup.hidden = false;
            background.forEach(element => { element.inert = true; });
            document.body.classList.add("popup-open");
            document.getElementById("subscribe-name").focus();
        });
    });
    popup.querySelector(".popup-close").addEventListener("click", closePopup);
    popup.addEventListener("click", event => {
        if (event.target === popup) closePopup();
    });
    popup.addEventListener("keydown", event => {
        if (event.key === "Escape") closePopup();
        if (event.key !== "Tab") return;
        const controls = [...popup.querySelectorAll("button, input")];
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
})();
