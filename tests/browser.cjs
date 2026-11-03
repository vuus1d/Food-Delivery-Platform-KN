/* Run against a local HTTP server. All inputs are synthetic demo data.
 * Part A: Assignment 6 jQuery features (Tasks 0-9). Part B: Assignment 4-5 regression checks. */
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.BASE_URL || 'http://127.0.0.1:8765';
const root = path.resolve(__dirname, '..');
const shots = path.join(root, 'docs/screenshots');
fs.mkdirSync(shots, { recursive: true });
const PAGES = ['index.html', 'stores.html', 'compare.html', 'cart.html', 'login.html', 'responsive.html'];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'];
let checks = 0;
const passed = [];
function check(condition, message) { assert.ok(condition, message); checks++; passed.push(message); }
(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}) });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'Asia/Almaty', reducedMotion: 'reduce' });
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
    const errors = [];
    const readyLogs = [];
    // Every page of every context reports runtime errors, console errors and failed requests.
    const watch = page => {
        page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
        page.on('console', message => {
            if (message.type() === 'error') errors.push(`${page.url()}: ${message.text()}`);
            if (message.text() === 'jQuery is ready!') readyLogs.push(page.url());
        });
        page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
        return page;
    };
    const page = watch(await context.newPage());
    const go = (file, target = page) => target.goto(`${base}/${file}`, { waitUntil: 'networkidle' });
    const shot = async (name, selector, target = page) => {
        if (selector) await target.locator(selector).screenshot({ path: path.join(shots, `${name}.png`) });
        else await target.screenshot({ path: path.join(shots, `${name}.png`) });
    };
    const axeStates = [];
    const audit = async (label, target = page) => {
        const result = await new AxeBuilder({ page: target }).withTags(AXE_TAGS).analyze();
        axeStates.push({ state: label, violations: result.violations });
    };
    const isFocused = locator => locator.evaluate(element => element === document.activeElement);

    /* ===================== Part A: Assignment 6 ===================== */

    // Task 0: jQuery 4.0.0 from the CDN in <head>, then js/script.js, on all six pages.
    for (const file of PAGES) {
        await go(file);
        const setup = await page.evaluate(() => {
            const scripts = [...document.head.querySelectorAll('script[src]')].map(script => script.getAttribute('src'));
            return { version: window.jQuery?.fn.jquery, scripts };
        });
        check(setup.version === '4.0.0', `${file}: jQuery 4.0.0 is loaded`);
        check(setup.scripts[0] === 'https://code.jquery.com/jquery-4.0.0.min.js' && setup.scripts[1] === 'js/script.js', `${file}: CDN jQuery then js/script.js in <head>`);
        check(readyLogs.some(url => url.includes(file)), `${file}: console shows "jQuery is ready!"`);
    }

    // Task 1: live filter with .on('keyup input') and .filter() on stores.html.
    await go('stores.html?store=Magnum');
    check(await page.locator('#products .add-product').count() === 8, 'Catalog builds eight products from the data array');
    await page.locator('#catalog-search').pressSequentially('chick');
    check(await page.locator('#products > div:visible').count() === 1 && await page.textContent('#catalog-status') === '1 product shown', 'Task 1: typing filters cards live and updates the counter');
    await page.selectOption('#catalog-sort', 'price-desc');
    check(await page.locator('#products > div:visible h3').first().textContent() === 'Chicken Fillet 1kg', 'Task 1: sorting keeps the active filter');
    await page.fill('#catalog-search', 'zzz');
    check(await page.locator('#catalog-empty').isVisible() && await page.textContent('#catalog-status') === '0 products shown', 'Task 1: "No products match" state is shown');
    await page.fill('#catalog-search', '');
    await page.selectOption('#catalog-sort', 'default');
    check(await page.locator('#products > div:visible').count() === 8 && await page.locator('#catalog-empty').isHidden(), 'Task 1: clearing the search shows all products');

    // Task 1 on compare.html: search combined with category buttons and ?category links.
    await go('compare.html?category=dairy');
    check(await page.locator('.comparison-row:visible').count() === 3 && await page.locator('.category-filter[data-category="dairy"]').getAttribute('aria-pressed') === 'true', 'Task 1: ?category=dairy preselects the dairy filter');
    await page.locator('#search').pressSequentially('butter');
    check(await page.locator('.comparison-row:visible').count() === 1 && (await page.textContent('#comparison-status')).startsWith('1 product'), 'Task 1: compare search filters rows live');
    await page.locator('.category-filter[data-category="meat"]').click();
    check(await page.locator('#comparison-empty').isVisible(), 'Task 1: compare search + category can show the empty state');
    await page.click('#clear-search');
    check(await page.locator('.comparison-row:visible').count() === 1 && await page.inputValue('#search') === '', 'Task 1: Clear empties the search and keeps the category');
    await page.locator('.category-filter[data-category="all"]').click();
    check(await page.locator('.comparison-row:visible').count() === 7, 'Task 1: All category shows every row');
    await shot('a6-compare-filter', '#main-content');

    // Task 2: autocomplete with highlighted match, arrows, Enter, Escape and click outside.
    await go('stores.html?store=Galmart');
    const search = page.locator('#catalog-search');
    await search.pressSequentially('ba');
    check(await page.locator('#catalog-suggestions').isVisible() && await search.getAttribute('aria-expanded') === 'true', 'Task 2: suggestions open while typing (aria-expanded=true)');
    check(await page.locator('#catalog-suggestions [role="option"]').count() === 1 && await page.locator('#catalog-suggestions mark').first().textContent() === 'Ba', 'Task 2: matching part of the suggestion is highlighted');
    await page.keyboard.press('ArrowDown');
    check(await search.getAttribute('aria-activedescendant') === 'catalog-suggestion-0' && await page.locator('#catalog-suggestion-0').getAttribute('aria-selected') === 'true', 'Task 2: ArrowDown moves the active option (aria-activedescendant)');
    await shot('a6-autocomplete', '#product-catalog');
    await page.keyboard.press('Enter');
    check(await search.inputValue() === 'Bananas 1kg' && await page.locator('#catalog-suggestions').isHidden() && await search.getAttribute('aria-expanded') === 'false', 'Task 2: Enter fills the field and closes the list');
    check(await page.locator('#products > div:visible').count() === 1, 'Task 2: chosen suggestion filters the catalog');
    await search.fill('');
    await search.pressSequentially('e');
    const optionCount = await page.locator('#catalog-suggestions [role="option"]').count();
    await page.keyboard.press('ArrowUp');
    check(optionCount > 1 && await search.getAttribute('aria-activedescendant') === `catalog-suggestion-${optionCount - 1}`, 'Task 2: ArrowUp wraps to the last option');
    await page.keyboard.press('Escape');
    check(await page.locator('#catalog-suggestions').isHidden() && await search.inputValue() === 'e', 'Task 2: Escape closes the list and keeps the text');
    await page.keyboard.press('ArrowDown');
    check(await page.locator('#catalog-suggestions').isVisible(), 'Task 2: ArrowDown reopens the list');
    await page.click('#catalog-title');
    check(await page.locator('#catalog-suggestions').isHidden(), 'Task 2: click outside closes the list');
    await search.fill('');
    await search.pressSequentially('mil');
    await page.locator('#catalog-suggestions [role="option"]').first().click();
    check(await search.inputValue() === 'Milk 1L' && await page.locator('#products > div:visible').count() === 1, 'Task 2: clicking a suggestion fills and filters');
    await search.fill('<img src=x onerror=alert(1)>');
    check(await page.locator('#catalog-suggestions img, #products img[src="x"]').count() === 0, 'Task 2: typed HTML is never inserted as markup');
    await search.fill('');

    // Task 3: FAQ highlighting with regex, escaped input, restore and auto-open.
    await go('index.html');
    const faqBefore = await page.locator('#faq .card').innerHTML();
    await page.locator('#faq-search').pressSequentially('deliver');
    check(await page.textContent('#faq-search-status') === 'Found 5 matches' && await page.locator('#faq mark.search-hit').count() === 5, 'Task 3: case-insensitive matches wrapped in <mark> and counted');
    check(await page.locator('#faq .faq-item.open').count() === 2 && await page.locator('#faq-answer-2').isVisible(), 'Task 3: answers with matches open automatically');
    await shot('a6-faq-highlight', '#faq');
    await page.fill('#faq-search', 'COMPARE');
    check(await page.locator('#faq mark.search-hit').count() === 2 && await page.locator('#faq a[href="compare.html"]').count() === 1, 'Task 3: highlighting keeps links and attributes intact');
    await page.fill('#faq-search', '5,000 ₸');
    check(await page.textContent('#faq-search-status') === 'Found 1 match', 'Task 3: numbers and symbols are searchable');
    await page.fill('#faq-search', '(.*');
    check(await page.textContent('#faq-search-status') === 'Found 0 matches', 'Task 3: regex special characters are escaped');
    await page.fill('#faq-search', '<b>x</b>');
    check(await page.locator('#faq b').count() === 0, 'Task 3: typed HTML is not parsed');
    await page.fill('#faq-search', '');
    check(await page.locator('#faq .card').innerHTML() === faqBefore && await page.locator('#faq .faq-item.open').count() === 0, 'Task 3: clearing restores the original HTML and closes auto-opened answers');
    await page.locator('.faq-question').first().click();
    check(await page.locator('.faq-question').first().getAttribute('aria-expanded') === 'true', 'Task 3: accordion still opens on click after a search');
    await page.locator('.faq-question').first().click();

    // Task 4: scroll progress bar width = scrollTop / (document height - window height).
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    const barWidth = () => page.locator('.scroll-progress-bar').evaluate(bar => bar.getBoundingClientRect().width / bar.parentElement.getBoundingClientRect().width * 100);
    check(await page.locator('.scroll-progress').count() === 1 && await barWidth() < 1, 'Task 4: progress bar starts empty at the top');
    await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2));
    await page.waitForTimeout(250);
    const halfWidth = await barWidth();
    check(halfWidth > 45 && halfWidth < 55, `Task 4: half-way scroll fills about half of the bar (${halfWidth.toFixed(1)}%)`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(250);
    check(await barWidth() > 99, 'Task 4: bottom of the page fills the bar');
    await shot('a6-progress-bar');
    await go('responsive.html');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(250);
    check(await page.locator('.scroll-progress-bar').evaluate(bar => getComputedStyle(bar).backgroundImage.includes('gradient')), 'Task 4: responsive.html has its own styled bar');

    // Task 5: counters run once with .animate() when the section scrolls into view.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1440, height: 600 }); // the stats section starts below the fold
    await go('index.html');
    check((await page.locator('.counter').allTextContents()).join('|') === '0|0|0 min|0 ₸', 'Task 5: counters wait at zero until visible');
    await page.locator('#stats').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const midway = Number((await page.locator('.counter').nth(3).textContent()).replace(/\D/g, ''));
    check(midway > 0 && midway < 5000, `Task 5: counter is mid-animation (${midway})`);
    await page.waitForTimeout(1700);
    check((await page.locator('.counter').allTextContents()).join('|') === '3|24|60 min|5,000 ₸', 'Task 5: counters finish on the real values');
    await shot('a6-counters', '#stats');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('#stats').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    check(await page.locator('.counter').nth(3).textContent() === '5,000 ₸', 'Task 5: counting runs only once');
    await page.setViewportSize({ width: 1440, height: 1000 });

    // Task 9: lazy loading with data-src, offset() and scrollTop(), plus the carousel event.
    await go('index.html');
    check(await page.locator('img.lazy-img[loading]').count() === 0 && await page.locator('noscript').count() === 13, 'Task 9: native loading="lazy" removed, <noscript> fallbacks present');
    check(await page.locator('.team-portrait img[data-src]').count() === 2 && await page.locator('#foodCarousel .carousel-item:not(.active) img[data-src]').count() === 8, 'Task 9: off-screen images still wait in data-src');
    const firstSlide = await page.locator('#foodCarousel .carousel-item.active img').getAttribute('src');
    check(firstSlide === 'images/fruits.jpg', 'Task 9: first carousel image loads normally');
    const teamBox = await page.locator('#team .card').first().boundingBox();
    await page.locator('#team').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelectorAll('.team-portrait img[data-src]').length === 0);
    await page.waitForFunction(() => [...document.querySelectorAll('.team-portrait img')].every(image => image.complete && image.naturalWidth > 1));
    const teamBoxAfter = await page.locator('#team .card').first().boundingBox();
    check(Math.abs(teamBox.height - teamBoxAfter.height) < 1, 'Task 9: scrolled images load without layout shift');
    await page.locator('.carousel-control-next').click();
    await page.waitForFunction(() => document.querySelector('#foodCarousel .carousel-item:nth-child(2) img').getAttribute('src') === 'images/vegetables.jpg');
    check(true, 'Task 9: carousel slide event loads the next hidden slide');
    for (let index = 0; index < 8; index++) {
        await page.locator('.carousel-control-next').click();
        await page.waitForTimeout(700);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    check(await page.locator('img[data-src]').count() === 0 && await page.evaluate(() => lazyHandlerBound === false), 'Task 9: all images loaded and the scroll handler removed');

    // Task 8: Copy button (Clipboard API), checkmark, tooltip, toast and reset after 2 s.
    await go('index.html');
    const copyButton = page.locator('[data-copy-target="#promo-foodly10"]');
    await copyButton.click();
    check(await page.evaluate(() => navigator.clipboard.readText()) === 'FOODLY10', 'Task 8: Copy writes the code to the clipboard');
    check(await copyButton.evaluate(button => button.classList.contains('is-copied')) && await copyButton.locator('.copy-label').textContent() === 'Copied' && await copyButton.locator('.copy-icon path').getAttribute('d').then(d => d.startsWith('M13.485')), 'Task 8: icon changes to a checkmark');
    check(await page.locator('.copy-tooltip').textContent() === 'Copied to clipboard!' && await page.locator('.foodly-toast', { hasText: 'Copied to clipboard!' }).count() === 1, 'Task 8: tooltip and toast confirm the copy');
    await page.locator('#promo-codes').scrollIntoViewIfNeeded();
    await shot('a6-copy');
    await page.waitForTimeout(2400);
    check(await page.locator('.copy-tooltip').count() === 0 && await copyButton.locator('.copy-label').textContent() === 'Copy', 'Task 8: button and tooltip reset after 2 seconds');
    await page.locator('#promo-astana500').selectText();
    await page.keyboard.press('Control+C');
    check(await page.locator('.foodly-toast', { hasText: 'Copied to clipboard!' }).count() >= 1 && await page.evaluate(() => navigator.clipboard.readText()) === 'ASTANA500', "Task 8: .on('copy') reacts to manual Ctrl+C");
    const fallbackContext = await browser.newContext();
    await fallbackContext.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: undefined }); });
    const fallback = watch(await fallbackContext.newPage());
    await go('index.html', fallback);
    await fallback.evaluate(() => { window.copyEvents = 0; document.addEventListener('copy', () => { window.copyEvents++; }); });
    await fallback.locator('[data-copy-target="#promo-freedelivery"]').click();
    check(await fallback.evaluate(() => window.copyEvents) === 1 && await fallback.locator('.copy-tooltip').isVisible() && await fallback.locator('textarea[readonly]').count() === 0, 'Task 8: textarea + execCommand fallback works and cleans up');
    await fallbackContext.close();

    // Task 7: toast system (stack, role=status, close button, automatic fade-out).
    await go('stores.html?store=Magnum');
    for (let index = 0; index < 3; index++) await page.locator('.add-product[data-name="Bread"]').click();
    check(await page.locator('#toast-stack .foodly-toast').count() === 3 && await page.locator('#toast-stack .foodly-toast[role="status"]').count() === 3, 'Task 7: several toasts stack with role="status"');
    check((await page.locator('.foodly-toast .toast-body').first().textContent()) === 'Bread added to your cart.', 'Task 7: "Item added to cart" message');
    await shot('a6-toasts');
    for (let index = 0; index < 3; index++) await page.locator('.add-product[data-name="Bread"]').click();
    check(await page.locator('#toast-stack .foodly-toast:not(.is-closing)').count() === 4, 'Task 7: stack is limited to four toasts');
    await page.waitForTimeout(400);
    check(await page.locator('#toast-stack .foodly-toast').count() === 4, 'Task 7: the oldest toasts faded out and were removed');
    await page.locator('.foodly-toast .btn-close').last().click();
    await page.waitForTimeout(400);
    check(await page.locator('#toast-stack .foodly-toast').count() <= 3, 'Task 7: close button removes a toast');
    await page.mouse.move(0, 0);
    await page.waitForTimeout(4000);
    check(await page.locator('#toast-stack .foodly-toast').count() === 0, 'Task 7: toasts fade out automatically');
    await page.evaluate(() => showToast('<img src=x onerror=alert(1)>', 'info'));
    check(await page.locator('.foodly-toast img').count() === 0, 'Task 7: toast text is inserted as text');
    await page.evaluate(() => localStorage.removeItem('cart'));

    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Task 6: spinner only after successful validation; disabled during the simulated server call.
    await go('index.html');
    const feedbackButton = page.locator('#contact-form button[type=submit]');
    await feedbackButton.click();
    check(await page.locator('#contact-form .spinner-border').count() === 0 && await feedbackButton.isEnabled(), 'Task 6: invalid form shows errors, no spinner');
    await page.fill('#feedback-name', 'Test Student');
    await page.fill('#feedback-email', 'student@mail.kz');
    await page.selectOption('#feedback-topic', { label: 'Other' });
    await page.fill('#feedback-message', 'A spinner test message.');
    await page.check('#feedback-consent');
    await feedbackButton.click();
    check(await feedbackButton.isDisabled() && await feedbackButton.locator('.spinner-border').count() === 1 && (await feedbackButton.textContent()).includes('Please wait…'), 'Task 6: valid submit shows spinner + "Please wait…" and disables the button');
    await feedbackButton.evaluate(button => button.click());
    check(await page.locator('#feedback-status').isHidden(), 'Task 6: success waits for the simulated server');
    await shot('a6-spinner', '#contact-form');
    await page.waitForFunction(() => !document.querySelector('#contact-form button[type=submit]').disabled, null, { timeout: 4000 });
    check(await feedbackButton.textContent() === 'Send feedback' && await page.locator('#feedback-status').isVisible(), 'Task 6: button restored, then success message shown');
    check(await page.locator('.foodly-toast', { hasText: 'Feedback submitted successfully' }).count() === 1, 'Task 7: form success toast');

    /* ===================== Part B: regression (Assignments 4-5) ===================== */

    await go('login.html');
    await page.click('#register-form button[type=submit]');
    check(await page.locator('#register-form .is-invalid').count() === 4, 'Registration: four required-field errors');
    check(await isFocused(page.locator('#reg-name')), 'Registration focuses first error');
    await page.fill('#reg-name', '   ');
    check(await page.locator('#reg-name').getAttribute('aria-invalid') === 'true', 'Whitespace name remains invalid while typing');
    await page.fill('#reg-name', 'Айдана Омар');
    await page.fill('#reg-email', 'name..test@mail.kz');
    await page.fill('#reg-password', '        ');
    await page.fill('#reg-confirm', 'different');
    await page.click('#register-form button[type=submit]');
    check(await page.locator('#register-form .is-invalid').count() === 3, 'Malformed email, blank password and mismatch rejected');
    await shot('validation-errors', '#register-form');
    await page.fill('#reg-email', 'student+demo@mail.kz');
    await page.fill('#reg-password', 'Foodly123');
    await page.fill('#reg-confirm', 'Foodly123');
    await page.fill('#reg-password', 'Foodly456');
    check(await page.locator('#reg-confirm').getAttribute('aria-invalid') === 'true', 'Changing password rechecks confirmation');
    await page.fill('#reg-confirm', 'Foodly456');
    await page.click('#register-form button[type=submit]');
    check(await page.locator('#register-form button[type=submit] .spinner-border').count() === 1, 'Task 6: registration shows the spinner');
    await page.locator('#register-success').waitFor({ state: 'visible', timeout: 4000 });
    check(await page.locator('#register-success').isVisible(), 'Valid registration shows demo success');
    check(await page.inputValue('#reg-password') === '', 'Successful registration clears password');
    await shot('validation-success', '#register-form');
    await page.fill('#reg-name', 'New Name');
    check(await page.locator('#register-success').isHidden(), 'Editing hides stale success');

    await go('index.html');
    await shot('home-day');
    await page.click('#bg-color-btn');
    check(await page.locator('html').getAttribute('data-bs-theme') === 'dark', 'Day/night theme toggles');
    await page.reload({ waitUntil: 'networkidle' });
    check(await page.locator('html').getAttribute('data-bs-theme') === 'dark', 'Theme persists after reload');
    await shot('home-night');
    check(await page.locator('.scroll-progress-bar').evaluate(bar => getComputedStyle(bar).backgroundImage.includes('rgb(123, 227, 166)')), 'Task 4: night theme uses the brighter bar gradient');
    await page.fill('#faq-search', 'pay');
    await audit('index.html night theme, FAQ highlighted');
    await page.fill('#faq-search', '');
    await page.click('#bg-color-btn');
    const nav = page.locator('nav[aria-label="Main navigation"] li a');
    await nav.first().focus();
    await page.keyboard.press('ArrowRight');
    check(await isFocused(nav.nth(1)), 'ArrowRight moves navigation focus');
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowLeft');
    check(await isFocused(nav.last()), 'ArrowLeft wraps navigation focus');
    await shot('keyboard-navigation', 'header');
    await page.click('#read-more');
    check(await page.locator('#shopping-details').isVisible(), 'Read more shows extra content');
    await page.click('[data-rating="4"]');
    check(await page.locator('.rating-star.selected').count() === 4, 'Rating selects four stars');
    check((await page.textContent('#rating-status')).includes('4 out of 5'), 'Rating updates DOM text');
    await shot('dom-rating', '#experience-card');
    await page.click('#read-more');
    check(await page.locator('#shopping-details').isHidden(), 'Read less hides extra content');
    check(await page.locator('#sound-test').isDisabled(), 'Audio starts muted');
    await page.evaluate(() => {
        window.audioEvidence = { starts: 0, ends: 0, active: 0, maxActive: 0 };
        const original = AudioContext.prototype.createOscillator;
        AudioContext.prototype.createOscillator = function (...args) {
            const tone = original.apply(this, args);
            const start = tone.start.bind(tone);
            tone.start = (...startArgs) => {
                window.audioEvidence.starts++; window.audioEvidence.active++;
                window.audioEvidence.maxActive = Math.max(window.audioEvidence.maxActive, window.audioEvidence.active);
                return start(...startArgs);
            };
            tone.addEventListener('ended', () => { window.audioEvidence.ends++; window.audioEvidence.active--; });
            return tone;
        };
    });
    await page.click('#sound-toggle');
    await page.click('#sound-test');
    // Wait for the tone's "ended" event (audio start-up latency differs between machines).
    await page.waitForFunction(() => window.audioEvidence.ends === 1, null, { timeout: 5000 });
    await page.evaluate(() => { for (let i = 0; i < 10; i++) document.getElementById('sound-test').click(); });
    await page.waitForFunction(() => window.audioEvidence.ends === window.audioEvidence.starts, null, { timeout: 5000 });
    await page.waitForTimeout(350);
    const audio = await page.evaluate(() => window.audioEvidence);
    check(audio.starts === 2 && audio.ends === 2 && audio.maxActive === 1, `Web Audio starts and ends; rapid clicks never overlap ${JSON.stringify(audio)}`);
    await shot('sound-controls', 'header');
    await page.click('#sound-toggle');
    check(await page.locator('#sound-test').isDisabled(), 'Mute disables sound test');
    await page.click('[data-open-popup]');
    await page.click('#subscribe-form button[type=submit]');
    check(await page.locator('#subscribe-form .is-invalid').count() === 2, 'Subscription validates empty fields');
    await page.fill('#subscribe-name', 'Test Student');
    await page.fill('#subscribe-email', 'student@mail.kz');
    await page.click('#subscribe-form button[type=submit]');
    check(await page.locator('#subscribe-form button[type=submit]').isDisabled(), 'Task 6: subscription button is disabled while waiting');
    await page.locator('#subscribe-success').waitFor({ state: 'visible', timeout: 4000 });
    check(await page.locator('#subscribe-success').isVisible(), 'Subscription demo succeeds');
    await shot('subscription', '.popup-window');
    await page.locator('#subscribe-form button[type=submit]').focus();
    await page.keyboard.press('Tab');
    check(await isFocused(page.locator('.popup-close')), 'Popup traps Tab focus');
    await page.keyboard.press('Escape');
    check(await isFocused(page.locator('[data-open-popup]')), 'Popup Escape restores focus');
    await page.fill('#feedback-name', 'Test Student');
    await page.fill('#feedback-email', 'student@mail.kz');
    await page.fill('#feedback-phone', '----------');
    await page.selectOption('#feedback-topic', { label: 'Store suggestion' });
    await page.fill('#feedback-message', '          ');
    await page.check('#feedback-consent');
    await page.click('#contact-form button[type=submit]');
    check(await page.locator('#feedback-phone').getAttribute('aria-invalid') === 'true', 'Phone separators without digits rejected');
    check(await page.locator('#feedback-message').getAttribute('aria-invalid') === 'true', 'Whitespace feedback rejected');
    await page.fill('#feedback-phone', '700 000 00 00');
    await page.fill('#feedback-message', 'Please add more local stores.');
    await page.click('#contact-form button[type=submit]');
    await page.locator('#feedback-status').waitFor({ state: 'visible', timeout: 4000 });
    check(await page.locator('#feedback-status').isVisible(), 'Feedback accepts valid formatted phone');
    await page.click('#contact-form button[type=reset]');
    check(await page.locator('#feedback-status').isHidden() && await page.locator('#contact-form .is-invalid').count() === 0, 'Reset clears feedback errors and stale success');
    await page.locator('.faq-question').first().click();
    check(await page.locator('.faq-question').first().getAttribute('aria-expanded') === 'true', 'FAQ opens on click');
    await shot('faq', '#faq');

    await go('stores.html?store=Magnum');
    await page.selectOption('#catalog-sort', 'price-asc');
    check(await page.locator('#products h3').first().textContent() === 'Bread', 'Switch sorts by ascending price');
    await page.fill('#catalog-search', 'milk');
    check(await page.locator('#products > div:visible').count() === 1, 'Search filters catalog');
    await page.fill('#catalog-search', 'no such product');
    check(await page.locator('#catalog-empty').isVisible(), 'Empty search state is shown');
    await page.fill('#catalog-search', '');
    await page.selectOption('#catalog-sort', 'default');
    await page.locator('#product-catalog').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelectorAll('#products img[data-src]').length === 0);
    await shot('catalog', '#product-catalog');
    await page.locator('.add-product[data-name="Milk 1L"]').click();
    check(await page.textContent('#cart-count') === '1', 'Adding product updates cart count');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('.add-product[data-name="Milk 1L"]').click();
    await page.waitForTimeout(80);
    const slideIn = await page.locator('.foodly-toast').last().evaluate(toast => Number(getComputedStyle(toast).opacity));
    check(slideIn > 0 && slideIn < 1, `Task 7: toast fades and slides in with jQuery .animate() (opacity ${slideIn.toFixed(2)})`);
    await page.waitForTimeout(300);
    await shot('cart-toast');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.add-product[data-name="Bread"]').click();
    check(await page.locator('.foodly-toast').last().evaluate(toast => getComputedStyle(toast).opacity === '1'), 'Reduced motion: jQuery animations jump to the end ($.fx.off)');
    await page.locator('.add-product[data-name="Bread"]').click();
    await go('cart.html');
    check((await page.textContent('#cart-total')).includes('1,980'), 'Cart persists and total includes delivery');
    await page.click('#checkout-btn');
    await page.click('#checkout-next');
    check(await page.locator('[data-checkout-step="0"]').isVisible() && await page.locator('#checkout-form .is-invalid').count() === 3, 'Wizard blocks empty delivery step');
    await page.fill('#customer-name', 'Test Student');
    await page.fill('#customer-phone', '700000000');
    await page.fill('#customer-address', 'Astana, Demo Street 10');
    await page.click('#checkout-next');
    check(await page.locator('#customer-phone').getAttribute('aria-invalid') === 'true', 'Checkout rejects nine-digit phone');
    await shot('checkout-errors', '.modal-content');
    await page.fill('#customer-phone', '(700) 000-00-00');
    await page.click('#checkout-next');
    check(await page.locator('[data-checkout-step="1"]').isVisible(), 'Valid delivery proceeds to options');
    await page.check('#pay-cash');
    await page.fill('#order-note', '<img src=x onerror=alert(1)>');
    await page.click('#checkout-back');
    check(await page.inputValue('#customer-name') === 'Test Student', 'Back preserves delivery input');
    await page.click('#checkout-next');
    check(await page.locator('#pay-cash').isChecked(), 'Back/Next preserves payment choice');
    await shot('checkout-options', '.modal-content');
    await page.click('#checkout-next');
    check((await page.textContent('#checkout-review')).includes('Cash on delivery'), 'Object method maps payment choice');
    check(await page.locator('#checkout-review img').count() === 0, 'Review renders user input as text, not HTML');
    await page.click('#checkout-submit');
    check(await page.locator('#checkout-terms').getAttribute('aria-invalid') === 'true' && await page.locator('#checkout-submit .spinner-border').count() === 0, 'Final consent is required (no spinner while invalid)');
    await page.check('#checkout-terms');
    await shot('checkout-review', '.modal-content');
    await page.click('#checkout-submit');
    check(await page.locator('#checkout-submit').isDisabled() && await page.locator('#checkout-submit .spinner-border').count() === 1 && await page.locator('#checkout-back').isDisabled(), 'Task 6: checkout shows the spinner and locks the buttons');
    await shot('a6-checkout-spinner', '.modal-content');
    await page.keyboard.press('Escape');
    check(await page.locator('#checkout-dialog').isVisible(), 'Task 6: dialog cannot close during the simulated server call');
    await page.locator('#order-status').waitFor({ state: 'visible', timeout: 4000 });
    await page.locator('#checkout-dialog').waitFor({ state: 'hidden' });
    check(await page.locator('#checkout-btn').isDisabled() && await page.textContent('#cart-count') === '0', 'Order succeeds once, clears cart and disables checkout');
    const orderNumber = await page.textContent('#order-number');
    check(/^FD-[0-9A-Z]{6}$/.test(orderNumber) && await page.locator('.foodly-toast', { hasText: orderNumber }).count() === 1, 'Task 7: demo order toast with the order number');
    await page.locator('[data-copy-target="#order-number"]').click();
    check(await page.evaluate(() => navigator.clipboard.readText()) === orderNumber, 'Task 8: order number can be copied');
    await shot('checkout-success', '#main-content');
    await page.evaluate(() => localStorage.setItem('cart', JSON.stringify([{ name: 'Milk 1L', store: 'Magnum', price: 1, quantity: 11 }, { name: '<script>', store: 'Fake', price: 1, quantity: 2 }])));
    await page.reload({ waitUntil: 'networkidle' });
    check((await page.textContent('#cart-subtotal')).includes('5,280'), 'Cart reload restores canonical price and rejects fake products');
    check((await page.textContent('#delivery-fee')).trim() === '0 ₸', 'Delivery is free above threshold');
    const other = watch(await context.newPage());
    await other.goto(`${base}/stores.html?store=Magnum`);
    await other.locator('.add-product[data-name="Bread"]').click();
    await page.waitForFunction(() => document.getElementById('cart-count').textContent === '12');
    check(await page.textContent('#cart-count') === '12', 'Cart synchronizes across browser tabs');
    await other.close();
    await page.evaluate(() => localStorage.setItem('cart', '{broken'));
    await page.reload({ waitUntil: 'networkidle' });
    check(await page.locator('.empty-cart').isVisible(), 'Corrupt storage recovers to empty cart');
    await go('compare.html');
    await page.locator('.category-filter[data-category="dairy"]').click();
    check(await page.locator('.comparison-row:visible').count() > 0, 'Comparison category filter works');
    await shot('comparison', '#main-content');

    // Accessibility (default state of every page + Assignment 6 states), loaded images, overflow.
    const audits = [];
    for (const file of PAGES) {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await go(file);
        const axe = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
        audits.push({ file, violations: axe.violations });
        // Scroll through the page so lazy images load, then check every image file decoded.
        await page.evaluate(async () => {
            for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 60)); }
        });
        await page.evaluate(() => document.querySelectorAll('#foodCarousel img[data-src]').forEach(image => { image.src = image.dataset.src; image.removeAttribute('data-src'); }));
        await page.waitForTimeout(400);
        check(await page.locator('img').evaluateAll(async images => {
            await Promise.all(images.map(image => image.decode().catch(() => {})));
            return images.every(image => image.complete && image.naturalWidth > 1);
        }), `${file}: all images load`);
        for (const width of [375, 390, 768, 1440]) {
            await page.setViewportSize({ width, height: 900 });
            check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${file}: no page overflow at ${width}px`);
        }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go('stores.html?store=Magnum');
    await page.locator('#catalog-search').pressSequentially('e');
    await page.keyboard.press('ArrowDown');
    await audit('stores.html autocomplete open');
    await go('index.html');
    await page.locator('[data-copy-target="#promo-foodly10"]').click();
    await audit('index.html copy tooltip and toast');
    fs.writeFileSync(path.join(root, 'docs/axe-audit.json'), JSON.stringify(audits, null, 2));
    fs.writeFileSync(path.join(root, 'docs/axe-dark.json'), JSON.stringify(axeStates[0].violations, null, 2));

    // Mobile (375 px): navigation, catalog search, toast and checkout in night theme.
    await page.setViewportSize({ width: 375, height: 812 });
    await go('index.html');
    await page.click('.navbar-toggler');
    check(await page.locator('#mainNav').isVisible(), 'Mobile navigation expands');
    await shot('mobile-home');
    await page.click('.navbar-toggler');
    await page.click('#bg-color-btn');
    await page.locator('#faq-search').fill('order');
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile night theme: FAQ search fits at 375px');
    await shot('a6-mobile-faq-night', '#faq');
    await go('stores.html?store=Magnum');
    await page.locator('#catalog-search').pressSequentially('ri');
    check(await page.locator('#catalog-suggestions').evaluate(list => list.getBoundingClientRect().right <= innerWidth), 'Mobile: autocomplete list stays inside the screen');
    await page.keyboard.press('Escape');
    await page.locator('.add-product:visible').first().click();
    check(await page.locator('.foodly-toast').evaluate(toast => toast.getBoundingClientRect().left >= 0), 'Mobile: toast fits inside the screen');
    await shot('a6-mobile-stores-night');
    await page.click('#bg-color-btn');
    await go('cart.html');
    await page.click('#checkout-btn');
    await page.locator('#checkout-next').waitFor({ state: 'visible' });
    check(await page.locator('#checkout-next').isVisible(), 'Mobile checkout controls are visible');
    await shot('mobile-checkout');

    const deniedContext = await browser.newContext();
    await deniedContext.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage denied'); }; });
    const denied = watch(await deniedContext.newPage());
    await denied.goto(`${base}/stores.html?store=Magnum`);
    await denied.locator('.add-product').first().click();
    check(await denied.locator('#storage-status').isVisible(), 'Blocked storage shows a nonfatal warning');
    await deniedContext.close();

    check(errors.length === 0, `No console, runtime or failed-resource errors: ${errors.join('; ')}`);
    const violations = [...axeStates.flatMap(state => state.violations), ...audits.flatMap(entry => entry.violations)];
    fs.writeFileSync(path.join(root, 'docs/test-results.json'), JSON.stringify({ date: new Date().toISOString(), checks, passed, errors, accessibilityViolations: violations.length, axeStates: axeStates.map(state => ({ state: state.state, violations: state.violations.length })), audio, browser: browser.version() }, null, 2));
    console.log(JSON.stringify({ checks, errors, accessibilityViolations: violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), browser: browser.version() }, null, 2));
    await browser.close();
    assert.equal(violations.length, 0, 'Accessibility audits must pass');
})().catch(error => { console.error(error); process.exit(1); });
