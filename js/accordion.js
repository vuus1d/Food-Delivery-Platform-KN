/* Assignment 4, Task 2: FAQ accordion (index.html).
 * JavaScript only adds or removes the "open" class.
 * The smooth opening is done in CSS with a max-height transition. */
function setupFaqAccordion() {
    const questions = document.querySelectorAll(".faq-question");
    // Stop here on pages without a FAQ block.
    if (questions.length === 0) return;

    questions.forEach(question => {
        question.addEventListener("click", () => {
            const item = question.closest(".faq-item");
            // toggle() adds the class if it is missing, removes it if it is there,
            // and returns true when the class is now present (the answer is open).
            const isOpen = item.classList.toggle("open");

            // Tell screen readers whether the answer is shown.
            question.setAttribute("aria-expanded", String(isOpen));
            // Switch the icon between plus and minus.
            question.querySelector(".faq-icon").textContent = isOpen ? "−" : "+";
        });
    });
}

setupFaqAccordion();
