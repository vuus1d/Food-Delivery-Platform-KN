/* Theme state is a preference only; forms never write personal data to storage. */
(() => {
    const button = document.getElementById("bg-color-btn");
    if (!button) return;
    function applyTheme(theme) {
        document.documentElement.setAttribute("data-bs-theme", theme);
        button.setAttribute("aria-pressed", String(theme === "dark"));
        button.textContent = theme === "dark" ? "Day theme" : "Night theme";
    }
    let savedTheme = "light";
    try { savedTheme = localStorage.getItem("foodly-theme") || "light"; } catch { /* use default */ }
    applyTheme(savedTheme === "dark" ? "dark" : "light");
    button.addEventListener("click", () => {
        const theme = document.documentElement.dataset.bsTheme === "dark" ? "light" : "dark";
        applyTheme(theme);
        try { localStorage.setItem("foodly-theme", theme); } catch { /* still works on this page */ }
    });
})();
