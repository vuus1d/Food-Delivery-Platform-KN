/* Assignment 5: keyboard navigation, DOM attributes, rating, audio and animation. */
(() => {
    document.querySelectorAll('nav[aria-label="Main navigation"]').forEach(nav => {
        nav.addEventListener("keydown", event => {
            const links = [...nav.querySelectorAll("li a")].filter(link => link.getClientRects().length);
            const current = links.indexOf(document.activeElement);
            if (current < 0) return;
            let next = current;
            switch (event.key) {
                case "ArrowRight": case "ArrowDown": next = (current + 1) % links.length; break;
                case "ArrowLeft": case "ArrowUp": next = (current - 1 + links.length) % links.length; break;
                case "Home": next = 0; break;
                case "End": next = links.length - 1; break;
                default: return;
            }
            event.preventDefault();
            links[next].focus();
        });
    });

    const moreButton = document.getElementById("read-more");
    moreButton?.addEventListener("click", () => {
        const content = document.getElementById("shopping-details");
        const expanded = moreButton.getAttribute("aria-expanded") !== "true";
        content.style.display = expanded ? "block" : "none";
        content.hidden = !expanded;
        moreButton.setAttribute("aria-expanded", String(expanded));
        moreButton.textContent = expanded ? "Read less" : "Read more";
    });

    const stars = document.querySelectorAll(".rating-star");
    stars.forEach(star => star.addEventListener("click", () => {
        const rating = Number(star.dataset.rating);
        stars.forEach(button => {
            button.classList.toggle("selected", Number(button.dataset.rating) <= rating);
            button.setAttribute("aria-pressed", String(button === star));
        });
        document.getElementById("rating-status").textContent = `You rated Foodly ${rating} out of 5. Thank you! (This visit only.)`;
        const card = document.getElementById("experience-card");
        card.classList.remove("celebrate");
        void card.offsetWidth; // Restart the animation when another rating is selected.
        card.classList.add("celebrate");
    }));

    const soundButton = document.getElementById("sound-toggle");
    const testButton = document.getElementById("sound-test");
    const soundStatus = document.getElementById("sound-status");
    if (!soundButton || !testButton) return;
    let soundEnabled = false;
    let context;
    let busy = false;
    let activeTone;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    async function playNotification() {
        if (!soundEnabled || busy) return;
        busy = true; // Lock before awaiting resume, so rapid clicks cannot overlap.
        try {
            context ||= new AudioContextClass();
            await context.resume();
            if (!soundEnabled) { busy = false; return; }
            const oscillator = context.createOscillator();
            activeTone = oscillator;
            const volume = context.createGain();
            const now = context.currentTime;
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(660, now);
            oscillator.frequency.setValueAtTime(880, now + 0.09);
            volume.gain.setValueAtTime(0, now);
            volume.gain.linearRampToValueAtTime(0.12, now + 0.02);
            volume.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
            oscillator.connect(volume);
            volume.connect(context.destination);
            oscillator.onended = () => {
                oscillator.disconnect();
                volume.disconnect();
                busy = false;
                activeTone = null;
            };
            oscillator.start(now);
            oscillator.stop(now + 0.25);
            soundStatus.textContent = "Notification sound played.";
        } catch {
            busy = false;
            soundStatus.textContent = "Sound is unavailable in this browser. Visual feedback is still active.";
        }
    }
    if (!AudioContextClass) {
        soundButton.disabled = true;
        testButton.disabled = true;
        soundStatus.textContent = "Sound is unavailable in this browser.";
    }
    soundButton.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundButton.textContent = soundEnabled ? "Sound: on" : "Sound: off";
        soundButton.setAttribute("aria-pressed", String(soundEnabled));
        testButton.disabled = !soundEnabled;
        soundStatus.textContent = soundEnabled ? "Sound enabled for this page." : "Sound muted.";
        if (!soundEnabled && activeTone) activeTone.stop();
    });
    testButton.addEventListener("click", playNotification);
    document.addEventListener("foodly:cart-added", playNotification);
})();
