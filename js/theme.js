/* Assignment 4, Task 4: change the page background colour.
 * Every click takes the next colour from the list and starts again after the last one. */
function setupBackgroundButton() {
    const backgroundButton = document.getElementById("bg-color-btn");
    // Stop here on pages without the button.
    if (!backgroundButton) return;

    // Soft light tints: dark text stays readable and they match the Foodly green.
    // The last one is Bootstrap's original light grey, so the cycle returns to the default look.
    const backgroundColors = ["#e9f6ee", "#fff8e6", "#eaf3fb", "#fdeee9", "#f1edf9", "#f8f9fa"];
    let colorIndex = 0;

    backgroundButton.addEventListener("click", () => {
        // Bootstrap's bg-body-tertiary class uses !important, which would beat our inline colour,
        // so we remove that class first.
        document.body.classList.remove("bg-body-tertiary");
        document.body.style.backgroundColor = backgroundColors[colorIndex];

        // Go to the next colour; the % operator wraps back to 0 after the last colour.
        colorIndex = (colorIndex + 1) % backgroundColors.length;
    });
}

setupBackgroundButton();
