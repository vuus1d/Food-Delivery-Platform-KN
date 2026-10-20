/* Assignment 4, Task 5: show the current date and time, e.g. "October 21, 2026, 12:54 AM".
 * The text is updated every second with setInterval. */
function setupDateTime() {
    const dateTimeElement = document.getElementById("current-datetime");
    // Stop here on pages without the clock.
    if (!dateTimeElement) return;

    function showCurrentDateTime() {
        const now = new Date();

        // Date part: "October 21, 2026"
        const datePart = now.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" });
        // Time part: "12:54 AM"
        const timePart = now.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        // Two calls joined with ", " — one call with all options gives "October 21, 2026 at 12:54 AM" in modern browsers.
        dateTimeElement.textContent = `${datePart}, ${timePart}`;

        // Machine-readable value for the <time> element.
        dateTimeElement.dateTime = now.toISOString();
    }

    // Show the time right away instead of waiting one second for the first tick.
    showCurrentDateTime();
    setInterval(showCurrentDateTime, 1000);
}

setupDateTime();
