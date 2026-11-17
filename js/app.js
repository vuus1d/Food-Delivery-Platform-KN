
/* ===== Bundled from script.js; retained for Assignment 6 traceability. ===== */
/* Foodly — Assignment 6: all jQuery features in one external file.
 * Loaded in <head> right after jQuery 4.0.0, before the deferred project scripts.
 * Top-level functions (showToast, filterCatalog, simulateServerRequest, checkLazyImages)
 * are shared with app.js, validation.js and checkout.js; everything else starts in $(document).ready. */

/* ==================== Shared helpers ==================== */

// JavaScript is running, so the <noscript> image fallback is not needed (see .no-js in style.css).
$("html").removeClass("no-js");

// Respect "reduce motion": $.fx.off makes every jQuery animation jump straight to its end state.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
$.fx.off = reducedMotion.matches;
reducedMotion.addEventListener("change", event => { $.fx.off = event.matches; });

// jQuery core only ships "swing" and "linear"; this ease-out starts fast and settles gently.
$.easing.foodlyEaseOut = progress => 1 - Math.pow(1 - progress, 3);

// Escape characters that have a special meaning in regular expressions (".", "(", "+", ...).
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Run a handler at most once per `wait` ms, plus one trailing call so the last position is handled.
function throttle(handler, wait) {
    let lastRun = 0;
    let timer = null;
    return function () {
        const remaining = wait - (Date.now() - lastRun);
        clearTimeout(timer);
        if (remaining <= 0) {
            lastRun = Date.now();
            handler();
        } else {
            timer = setTimeout(() => { lastRun = Date.now(); handler(); }, remaining);
        }
    };
}

// Unhide elements; only the ones that were hidden fade in, visible ones are left alone.
function revealWithFade($elements) {
    $elements.filter("[hidden]").stop(true, true).hide().prop("hidden", false).fadeIn(200);
}

/* ==================== Task 7: notification system ==================== */

const TOAST_ICONS = { success: "✓", info: "i", warning: "!", danger: "×" };
const TOAST_LIFETIME = 3500;
const MAX_TOASTS = 4;

function dismissToast($toast) {
    if ($toast.hasClass("is-closing")) return;
    $toast.addClass("is-closing"); // still fading out, no longer counted in the stack
    clearTimeout($toast.data("timer"));
    $toast.fadeOut(300, () => $toast.remove());
}

function startToastTimer($toast) {
    clearTimeout($toast.data("timer"));
    $toast.data("timer", setTimeout(() => dismissToast($toast), TOAST_LIFETIME));
}

function showToast(message, type = "success") {
    const kind = Object.hasOwn(TOAST_ICONS, type) ? type : "info";
    let $stack = $("#toast-stack");
    if (!$stack.length) {
        $stack = $('<div id="toast-stack" class="toast-stack toast-container position-fixed bottom-0 end-0 p-3"></div>').appendTo("body");
    }
    // The oldest toast leaves first, so the stack never covers the page.
    const $current = $stack.children(".foodly-toast:not(.is-closing)");
    if ($current.length >= MAX_TOASTS) dismissToast($current.first());

    // .text() inserts the message as plain text, never as HTML.
    const $toast = $('<div class="toast show foodly-toast" role="status" aria-atomic="true"></div>').addClass(`toast-${kind}`);
    const $close = $('<button type="button" class="btn-close me-2 m-auto" aria-label="Close notification"></button>');
    $toast.append(
        $('<div class="d-flex align-items-center"></div>').append(
            $('<span class="toast-icon" aria-hidden="true"></span>').text(TOAST_ICONS[kind]),
            $('<div class="toast-body"></div>').text(message),
            $close
        )
    );

    // Slide in from the right while fading in, then fade out automatically.
    $toast.css({ opacity: 0, left: "2rem" }).appendTo($stack).animate({ opacity: 1, left: 0 }, 250);
    $close.on("click", () => dismissToast($toast));
    // Pause while the pointer or keyboard focus is on the toast, so it can be read.
    $toast.on("mouseenter focusin", () => clearTimeout($toast.data("timer")))
        .on("mouseleave focusout", () => startToastTimer($toast));
    startToastTimer($toast);
    return $toast;
}

/* ==================== Task 1: real-time search and live filter ==================== */

// Sorts and filters the product cards on stores.html. app.js calls it after rendering a store.
function filterCatalog() {
    const $container = $("#products");
    const $search = $("#catalog-search");
    if (!$container.length || !$search.length) return;

    const query = $search.val().trim().toLowerCase();
    const sortBy = $("#catalog-sort").val();
    const priceOf = card => Number($(card).find(".add-product").attr("data-price"));
    const nameOf = card => $(card).find("h3").text();

    // 1. Sort with a switch, then .append() moves the same card elements into the new order.
    const sortedCards = $container.children().get().sort((first, second) => {
        switch (sortBy) {
            case "price-asc": return priceOf(first) - priceOf(second);
            case "price-desc": return priceOf(second) - priceOf(first);
            case "name": return nameOf(first).localeCompare(nameOf(second));
            default: return Number($(first).attr("data-order")) - Number($(second).attr("data-order"));
        }
    });
    $container.append(sortedCards);

    // 2. .filter() keeps the cards whose name or description contains the query.
    const $cards = $container.children();
    const $matches = $cards.filter(function () {
        return $(this).find("h3, .product-description").text().toLowerCase().includes(query);
    });
    $cards.not($matches).prop("hidden", true);
    revealWithFade($matches);

    // 3. Update the counter and the "No products match" message.
    const count = $matches.length;
    $("#catalog-empty").prop("hidden", count !== 0);
    $("#catalog-status").text(`${count} product${count === 1 ? "" : "s"} shown`);
    checkLazyImages(); // cards that became visible may need their photos
}

function initCatalogSearch() {
    // "input" catches typing, paste and the search field's × button; "keyup" is the classic key event.
    // Both may fire for one key press, which is harmless because filtering is idempotent.
    $("#catalog-search").on("keyup input", filterCatalog);
    $("#catalog-sort").on("change", filterCatalog);
}

// The same live filter for the price table on compare.html, combined with the category buttons.
function initCompareSearch() {
    const $rows = $(".comparison-row");
    if (!$rows.length) return;
    const $search = $("#search");

    function filterComparison() {
        const query = $search.val().trim().toLowerCase();
        const category = $(".category-filter.active").attr("data-category") || "all";
        const $matches = $rows.filter(function () {
            const $row = $(this);
            const inCategory = category === "all" || $row.attr("data-category") === category;
            return inCategory && $row.text().toLowerCase().includes(query);
        });
        $rows.not($matches).prop("hidden", true);
        revealWithFade($matches);
        const count = $matches.length;
        $("#comparison-empty").prop("hidden", count !== 0);
        $("#comparison-status").text(`${count} product${count === 1 ? "" : "s"} shown`);
    }

    $search.on("keyup input", filterComparison);
    $("#search-btn").on("click", filterComparison);
    $("#clear-search").on("click", () => {
        $search.val("").trigger("focus");
        filterComparison();
    });
    $(".category-filter").on("click", function () {
        $(".category-filter").removeClass("active").attr("aria-pressed", "false");
        $(this).addClass("active").attr("aria-pressed", "true");
        filterComparison();
    });

    // Links such as compare.html?category=dairy on the home page preselect a category.
    const requested = new URLSearchParams(window.location.search).get("category");
    $(".category-filter").filter((index, button) => $(button).attr("data-category") === requested).trigger("click");
    filterComparison();
}

/* ==================== Task 2: autocomplete suggestions ==================== */

function initAutocomplete() {
    const $input = $("#catalog-search");
    const $list = $("#catalog-suggestions");
    if (!$input.length || !$list.length) return;
    const $status = $("#catalog-suggestions-status");
    const MAX_SUGGESTIONS = 6;
    let activeIndex = -1;

    // Suggestions come from the catalog data that app.js rendered for the selected store.
    function catalogItems() {
        return $("#products .add-product").map(function () {
            return { name: $(this).attr("data-name"), price: Number($(this).attr("data-price")) };
        }).get();
    }

    function closeList() {
        activeIndex = -1;
        $list.prop("hidden", true).empty();
        $input.attr("aria-expanded", "false").removeAttr("aria-activedescendant");
    }

    // Move the visual and screen-reader "active" option (focus itself stays in the input).
    function setActive(index) {
        const $options = $list.children();
        activeIndex = index;
        $options.removeClass("is-active").attr("aria-selected", "false");
        if (index < 0) {
            $input.removeAttr("aria-activedescendant");
            return;
        }
        const $active = $options.eq(index).addClass("is-active").attr("aria-selected", "true");
        $input.attr("aria-activedescendant", $active.attr("id"));
        $active[0].scrollIntoView({ block: "nearest" });
    }

    function renderSuggestions() {
        const query = $input.val().trim();
        const lowerQuery = query.toLowerCase();
        if (!query) {
            closeList();
            return;
        }
        // Matching names, the ones that start with the query first.
        const matches = catalogItems()
            .filter(item => item.name.toLowerCase().includes(lowerQuery))
            .sort((a, b) => a.name.toLowerCase().indexOf(lowerQuery) - b.name.toLowerCase().indexOf(lowerQuery))
            .slice(0, MAX_SUGGESTIONS);
        if (!matches.length) {
            closeList();
            $status.text("No suggestions.");
            return;
        }

        $list.empty();
        matches.forEach((item, index) => {
            const start = item.name.toLowerCase().indexOf(lowerQuery);
            const end = start + query.length;
            // Three .text() pieces: before, <mark>match</mark>, after. Nothing is parsed as HTML.
            const $name = $('<span class="suggestion-name"></span>').append(
                $("<span></span>").text(item.name.slice(0, start)),
                $("<mark></mark>").text(item.name.slice(start, end)),
                $("<span></span>").text(item.name.slice(end))
            );
            $("<li></li>", { id: `catalog-suggestion-${index}`, role: "option", "aria-selected": "false", class: "autocomplete-option" })
                .data("value", item.name)
                .append($name, $('<span class="suggestion-price"></span>').text(formatPrice(item.price)))
                .appendTo($list);
        });
        $list.prop("hidden", false);
        $input.attr("aria-expanded", "true");
        setActive(-1);
        $status.text(`${matches.length} suggestion${matches.length === 1 ? "" : "s"}. Use the up and down arrows to choose.`);
    }

    // Put the chosen name into the field and filter the catalog with it.
    function choose(value) {
        $input.val(value).trigger("focus");
        closeList();
        filterCatalog();
    }

    $input.on("input", renderSuggestions);
    $input.on("keydown", event => {
        const isOpen = !$list.prop("hidden");
        switch (event.key) {
            case "ArrowDown": {
                event.preventDefault();
                if (!isOpen) renderSuggestions();
                const count = $list.children().length;
                if (count) setActive((activeIndex + 1) % count);
                break;
            }
            case "ArrowUp": {
                event.preventDefault();
                if (!isOpen) renderSuggestions();
                const count = $list.children().length;
                if (count) setActive(activeIndex <= 0 ? count - 1 : activeIndex - 1);
                break;
            }
            case "Enter":
                if (isOpen && activeIndex >= 0) {
                    event.preventDefault();
                    choose($list.children().eq(activeIndex).data("value"));
                }
                break;
            case "Escape":
                // Close the list but keep the typed text (a search field clears itself on Escape).
                if (isOpen) {
                    event.preventDefault();
                    closeList();
                }
                break;
            default:
                break;
        }
    });

    // mousedown would move focus out of the input before the click; prevent that.
    $list.on("mousedown", ".autocomplete-option", event => event.preventDefault());
    $list.on("click", ".autocomplete-option", function () { choose($(this).data("value")); });
    // A click anywhere outside the search box, or Tab away from it, closes the list.
    $(document).on("click", event => {
        if (!$(event.target).closest(".autocomplete").length) closeList();
    });
    $input.on("blur", closeList);
}

/* ==================== Task 3: FAQ search highlighting ==================== */

// Wrap every match inside the text nodes of `element` in <mark>. Tags and attributes
// (for example href="compare.html") are never touched, so links keep working.
function highlightMatches(element, pattern) {
    $(element).contents().each(function () {
        if (this.nodeType === Node.ELEMENT_NODE) {
            highlightMatches(this, pattern);
            return;
        }
        if (this.nodeType !== Node.TEXT_NODE) return;
        // split() with a capturing group keeps the matches at the odd positions.
        const parts = this.nodeValue.split(pattern);
        if (parts.length < 2) return;
        const textNodes = parts.map(part => document.createTextNode(part));
        $(this).replaceWith(textNodes);
        $(textNodes.filter((node, index) => index % 2 === 1)).wrap('<mark class="search-hit"></mark>');
    });
}

function initFaqSearch() {
    const $input = $("#faq-search");
    if (!$input.length) return;
    const $items = $("#faq .faq-item");
    const $status = $("#faq-search-status");
    // Searchable parts: each question's text and each answer. Save their original HTML.
    const $targets = $items.find(".faq-question > span:first-child, .faq-answer p");
    $targets.each(function () { $(this).data("originalHtml", $(this).html()); });

    // Open or close an item through the existing accordion (js/accordion.js) by "clicking" it.
    function setOpen($item, open) {
        if ($item.hasClass("open") !== open) $item.find(".faq-question").trigger("click");
    }

    $input.on("input", function () {
        const query = $(this).val().trim();
        // 1. Restore the original markup: removes the old <mark> tags (our own trusted HTML).
        $targets.each(function () { $(this).html($(this).data("originalHtml")); });

        if (!query) {
            // 2a. Cleared: close only the answers that the search opened.
            $items.each(function () {
                const $item = $(this);
                if ($item.data("openedBySearch")) setOpen($item, false);
                $item.removeData("openedBySearch");
            });
            $status.text("");
            return;
        }

        // 2b. Escaped, case-insensitive ("i") pattern that finds every match ("g").
        const pattern = new RegExp(`(${escapeRegExp(query)})`, "gi");
        $targets.each(function () { highlightMatches(this, pattern); });

        // 3. Answers with a match open automatically; ones opened earlier by the search close again.
        $items.each(function () {
            const $item = $(this);
            const answerMatches = $item.find(".faq-answer .search-hit").length > 0;
            if (answerMatches && !$item.hasClass("open")) {
                setOpen($item, true);
                $item.data("openedBySearch", true);
            } else if (!answerMatches && $item.data("openedBySearch")) {
                setOpen($item, false);
                $item.removeData("openedBySearch");
            }
        });

        const total = $("#faq .search-hit").length;
        $status.text(`Found ${total} match${total === 1 ? "" : "es"}`);
    });
}

/* ==================== Task 4: scroll progress bar ==================== */

function initScrollProgress() {
    const $track = $('<div class="scroll-progress" aria-hidden="true"><div class="scroll-progress-bar"></div></div>').prependTo("body");
    const $bar = $track.children();
    const $window = $(window);

    function updateProgress() {
        // How far the page can scroll, and how much of that has been scrolled.
        const scrollable = $(document).height() - $window.height();
        const percent = scrollable > 0 ? Math.min(100, ($window.scrollTop() / scrollable) * 100) : 0;
        $bar.css("width", `${percent}%`);
        $track.toggleClass("is-idle", scrollable <= 0); // nothing to scroll: hide the track
    }

    $window.on("scroll resize", updateProgress);
    updateProgress();
}

/* ==================== Task 5: animated number counter ==================== */

function initCounters() {
    const $section = $("#stats");
    if (!$section.length) return;
    const $window = $(window);
    const $counters = $section.find(".counter");
    const formatCount = ($counter, value) => `${$counter.attr("data-prefix") || ""}${Math.round(value).toLocaleString("en-US")}${$counter.attr("data-suffix") || ""}`;

    // Start from zero; the real values from the HTML stay in the visually hidden text for screen readers.
    $counters.each(function () { $(this).text(formatCount($(this), 0)); });

    function startWhenVisible() {
        const sectionTop = $section.offset().top;
        const viewBottom = $window.scrollTop() + $window.height();
        if (viewBottom < sectionTop + 80) return; // not visible yet
        $window.off("scroll.counters resize.counters"); // count only once

        $counters.each(function () {
            const $counter = $(this);
            const target = Number($counter.attr("data-count-to"));
            // .animate() on a plain object: jQuery tweens "value" and step() prints each frame.
            $({ value: 0 }).animate({ value: target }, {
                duration: 1800,
                easing: "foodlyEaseOut",
                step: now => $counter.text(formatCount($counter, now)),
                complete: () => $counter.text(formatCount($counter, target))
            });
        });
    }

    $window.on("scroll.counters resize.counters", startWhenVisible);
    startWhenVisible();
}

/* ==================== Task 6: loading spinner on submit ==================== */

const SERVER_DELAY = 1600; // simulated server response time, ms

// Called by validation.js / checkout.js only AFTER validation has passed.
function simulateServerRequest(button, onDone) {
    const $button = $(button);
    if ($button.prop("disabled")) return;
    const originalHtml = $button.html(); // our own button markup, restored later
    $button.css("min-width", $button.outerWidth()) // keep the width while the label changes
        .prop("disabled", true)
        .attr("aria-busy", "true")
        .html('<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait…');

    setTimeout(() => {
        $button.html(originalHtml).prop("disabled", false).removeAttr("aria-busy").css("min-width", "");
        onDone();
    }, SERVER_DELAY);
}

/* ==================== Task 8: copy to clipboard ==================== */

const ICON_COPY = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M13.485 3.929a1 1 0 0 1 0 1.414l-6.364 6.364a1 1 0 0 1-1.414 0L2.515 8.515a1 1 0 1 1 1.414-1.414l2.485 2.485 5.657-5.657a1 1 0 0 1 1.414 0"/></svg>';
const COPY_RESET_DELAY = 2000;

// Fallback for browsers or pages without the async Clipboard API (e.g. plain http:// hosts).
function copyWithTextarea(text) {
    return new Promise((resolve, reject) => {
        const $temp = $("<textarea readonly></textarea>").val(text)
            .css({ position: "fixed", top: 0, left: 0, opacity: 0 })
            .appendTo("body");
        $temp[0].select();
        const copied = document.execCommand("copy"); // fires a real "copy" event
        $temp.remove();
        if (copied) resolve();
        else reject(new Error("The copy command was rejected."));
    });
}

function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).catch(() => copyWithTextarea(text));
    }
    return copyWithTextarea(text);
}

// Checkmark icon + "Copied to clipboard!" tooltip above the button, all reset after 2 s.
function showCopied($button) {
    clearTimeout($button.data("resetTimer"));
    $button.data("tooltip")?.remove();
    $button.addClass("is-copied");
    $button.find(".copy-icon").html(ICON_CHECK);
    $button.find(".copy-label").text("Copied");

    const $tooltip = $('<span class="copy-tooltip" aria-hidden="true">Copied to clipboard!</span>').appendTo("body");
    const offset = $button.offset(); // position in page coordinates
    const left = offset.left + ($button.outerWidth() - $tooltip.outerWidth()) / 2;
    const maxLeft = $(window).width() - $tooltip.outerWidth() - 8;
    $tooltip.css({ top: offset.top - $tooltip.outerHeight() - 10, left: Math.max(8, Math.min(left, maxLeft)) })
        .hide().fadeIn(150);
    $button.data("tooltip", $tooltip);

    $button.data("resetTimer", setTimeout(() => {
        $tooltip.fadeOut(200, () => $tooltip.remove());
        $button.removeClass("is-copied");
        $button.find(".copy-icon").html(ICON_COPY);
        $button.find(".copy-label").text("Copy");
    }, COPY_RESET_DELAY));
}

function initCopyButtons() {
    $(".copy-btn .copy-icon").html(ICON_COPY);

    // Delegated, so buttons added later (e.g. the order number on cart.html) work too.
    $(document).on("click", ".copy-btn", function () {
        const $button = $(this);
        const text = $($button.attr("data-copy-target")).text().trim();
        if (!text) return;
        copyText(text).then(() => {
            showCopied($button);
            showToast("Copied to clipboard!", "success");
        }, () => showToast("Copy failed. Select the code and press Ctrl+C.", "danger"));
    });

    // The "copy" event also covers manual copying: select a code and press Ctrl+C (or use the menu).
    $(document).on("copy", ".copy-snippet-code", () => showToast("Copied to clipboard!", "success"));
}

/* ==================== Task 9: image lazy loading ==================== */

// A 1×1 transparent GIF: the real photo URL waits in data-src until the image is near the viewport.
const LAZY_PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const LAZY_MARGIN = 200; // start loading 200px before the image reaches the screen
let lazyHandlerBound = false;

function loadLazyImage($img) {
    const source = $img.attr("data-src");
    if (!source) return;
    $img.removeAttr("data-src").addClass("is-loading")
        // Bind before setting src, so a cached image cannot finish before we listen.
        .one("load", () => {
            $img.removeClass("is-loading").addClass("is-loaded").css("opacity", 0).animate({ opacity: 1 }, 400);
        })
        .one("error", () => $img.removeClass("is-loading"))
        .attr("src", source);
}

function checkLazyImages() {
    // Slides that are not active yet are display:none; the carousel event below loads them.
    const $pending = $("img.lazy-img[data-src]").filter(function () {
        return !$(this).closest(".carousel-item:not(.active)").length;
    });
    const $window = $(window);
    if (!$pending.length) {
        $window.off("scroll.lazy resize.lazy"); // everything loaded: stop listening
        lazyHandlerBound = false;
        return;
    }
    if (!lazyHandlerBound) {
        $window.on("scroll.lazy resize.lazy", throttle(checkLazyImages, 150));
        lazyHandlerBound = true;
    }

    const viewTop = $window.scrollTop();
    const viewBottom = viewTop + $window.height();
    $pending.each(function () {
        const $img = $(this);
        if (!$img.is(":visible")) return; // e.g. a filtered-out product card
        const top = $img.offset().top;
        const bottom = top + $img.outerHeight();
        if (top < viewBottom + LAZY_MARGIN && bottom > viewTop - LAZY_MARGIN) loadLazyImage($img);
    });
}

function initLazyImages() {
    // Bootstrap fires slide.bs.carousel before a slide appears; relatedTarget is the incoming slide.
    $("#foodCarousel").on("slide.bs.carousel", event => {
        loadLazyImage($(event.relatedTarget).find("img.lazy-img[data-src]"));
    });
    // After a slide, also preload the next one so "Next" never shows an empty frame.
    $("#foodCarousel").on("slid.bs.carousel", event => {
        loadLazyImage($(event.relatedTarget).next(".carousel-item").find("img.lazy-img[data-src]"));
    });
    checkLazyImages();
    $(window).on("load", checkLazyImages); // layout can still move while fonts and styles settle
}

/* ==================== Task 0: start everything when the DOM is ready ==================== */

$(document).ready(function () {
    console.log("jQuery is ready!");
    initScrollProgress();
    initCatalogSearch();
    initAutocomplete();
    initCompareSearch();
    initFaqSearch();
    initCounters();
    initCopyButtons();
    initLazyImages();
});

/* ===== Bundled from app.js; retained for Assignment 6 traceability. ===== */
/* Foodly demo data: sample grocery prices in Kazakhstani tenge.
 * Shared catalog and cart behavior; forms use validation.js and checkout.js.
 * Assignment 6: toasts, catalog/compare filtering and lazy images now live in js/script.js (jQuery). */
const products = {
    Magnum: [
        { name: "Milk 1L", price: 480 },
        { name: "Bread", price: 110 },
        { name: "Rice 1kg", price: 690 },
        { name: "Eggs C1", price: 620 },
        { name: "Butter 200g", price: 1150 },
        { name: "Chicken Fillet 1kg", price: 2490 },
        { name: "Bananas 1kg", price: 850 },
        { name: "Salad Vegetables 1kg", price: 950 }
    ],
    Small: [
        { name: "Milk 1L", price: 495 },
        { name: "Bread", price: 105 },
        { name: "Rice 1kg", price: 720 },
        { name: "Eggs C1", price: 640 },
        { name: "Butter 200g", price: 1190 },
        { name: "Chicken Fillet 1kg", price: 2390 },
        { name: "Bananas 1kg", price: 820 },
        { name: "Salad Vegetables 1kg", price: 890 }
    ],
    Galmart: [
        { name: "Milk 1L", price: 540 },
        { name: "Bread", price: 150 },
        { name: "Rice 1kg", price: 710 },
        { name: "Eggs C1", price: 680 },
        { name: "Butter 200g", price: 1300 },
        { name: "Chicken Fillet 1kg", price: 2750 },
        { name: "Bananas 1kg", price: 990 },
        { name: "Salad Vegetables 1kg", price: 1100 }
    ]
};

const DELIVERY_FEE = 800;
// Product photos live in the shared images/ folder.
const IMAGE_PATH = "images/";
const productDetails = {
    "Milk 1L": { image: "milk", description: "A fresh staple for breakfast, coffee, and cooking." },
    "Bread": { image: "bakery", description: "An everyday loaf for toast and sandwiches." },
    "Rice 1kg": { image: "rice", description: "A pantry essential for your favorite family meals." },
    "Eggs C1": { image: "eggs", description: "A pack of 10 eggs for breakfast and baking." },
    "Butter 200g": { image: "dairy", description: "Creamy 82.5% butter for toast, pastry, and porridge." },
    "Chicken Fillet 1kg": { image: "meat", description: "Lean fillet for quick dinners and meal prep." },
    "Bananas 1kg": { image: "fruits", description: "Sweet fruit for snacks, smoothies, and lunch boxes." },
    "Salad Vegetables 1kg": { image: "vegetables", description: "Crisp seasonal vegetables for an everyday salad." }
};
const formatPrice = amount => `${amount.toLocaleString("en-US")} ₸`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem("cart") || "[]");
        if (!Array.isArray(saved)) return [];
        const clean = [];
        for (const item of saved) {
            const product = item && Object.hasOwn(products, item.store || "")
                ? products[item.store].find(product => product.name === item.name) : null;
            if (!product || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) continue;
            const existing = clean.find(row => row.store === item.store && row.name === item.name);
            if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity);
            else clean.push({ name: product.name, store: item.store, price: product.price, quantity: item.quantity });
        }
        return clean;
    } catch (error) {
        return [];
    }
}

let cart = loadCart();

function saveCart() {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
        const status = document.getElementById("storage-status");
        status.hidden = false;
        status.textContent = "Your browser could not save the cart. Items will stay available on this page until you leave or reload.";
    }
    updateCartCount();
}

function updateCartCount() {
    const count = document.getElementById("cart-count");
    if (!count) return;
    count.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function addToCart(name, price, store) {
    const existing = cart.find(item => item.name === name && item.store === store);
    if (existing?.quantity >= 99) {
        showToast("You can add up to 99 of one product.", "warning");
        return;
    }
    if (existing) existing.quantity += 1;
    else cart.push({ name, price, store, quantity: 1 });
    saveCart();
    renderCart();
    showToast(`${name} added to your cart.`, "success");
    document.dispatchEvent(new CustomEvent("foodly:cart-added"));
}

function changeQuantity(index, change) {
    const item = cart[index];
    if (!item) return;
    if (item.quantity + change > 99) {
        showToast("You can add up to 99 of one product.", "warning");
        return;
    }
    item.quantity += change;
    if (item.quantity <= 0) cart.splice(index, 1);
    saveCart();
    renderCart();
}

function removeFromCart(index) {
    if (!cart[index]) return;
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function clearCart() {
    if (!cart.length || !window.confirm("Are you sure you want to clear your cart?")) return;
    cart = [];
    saveCart();
    renderCart();
}

function showProducts(store) {
    const container = document.getElementById("products");
    const catalog = document.getElementById("product-catalog");
    const title = document.getElementById("catalog-title");
    if (!container || !catalog || !Object.hasOwn(products, store)) return;

    title.textContent = `${store} Product Catalog`;
    container.innerHTML = products[store].map((product, index) => `
        <div class="col" data-order="${index}">
            <article class="card h-100 border-0 rounded-4 overflow-hidden shadow-foodly card-lift">
                <img src="${LAZY_PLACEHOLDER}" data-src="${IMAGE_PATH}${productDetails[product.name].image}.jpg" class="card-img-top product-img lazy-img" alt="${escapeHTML(product.name)}" width="400" height="300">
                <div class="card-body d-flex flex-column p-3">
                    <h3 class="card-title h5 mb-1">${escapeHTML(product.name)}</h3>
                    <p class="card-text small text-body-secondary flex-grow-1 mb-2 product-description">${productDetails[product.name].description}</p>
                    <p class="card-text small mb-1">Store: ${escapeHTML(store)}</p>
                    <strong class="fs-4 text-success-emphasis mb-3">${formatPrice(product.price)}</strong>
                    <button class="btn btn-primary w-100 add-product" type="button" aria-label="Add ${escapeHTML(product.name)} from ${escapeHTML(store)} to cart" data-name="${escapeHTML(product.name)}" data-price="${product.price}" data-store="${escapeHTML(store)}">Add to Cart</button>
                </div>
            </article>
        </div>`).join("");
    catalog.hidden = false;
    filterCatalog(); // js/script.js: jQuery sort, live filter and lazy images
    title.focus({ preventScroll: true });
    catalog.scrollIntoView({ block: "start" });
}

function renderCart() {
    const container = document.getElementById("cart-items");
    if (!container) return;

    if (!cart.length) {
        container.innerHTML = '<div class="empty-cart rounded-4 bg-body-tertiary text-center p-4"><h2 class="h5">Your cart is empty.</h2><p class="text-body-secondary">Add products from the stores page to get started.</p><a href="stores.html" class="btn btn-primary">Go to Stores</a></div>';
    } else {
        container.innerHTML = cart.map((item, index) => `
            <article class="card border rounded-3">
                <div class="card-body d-flex flex-wrap align-items-center justify-content-between gap-3 p-3">
                    <div class="flex-grow-1"><h2 class="card-title h6 mb-1">${escapeHTML(item.name)}</h2><p class="card-text small text-body-secondary mb-0">Store: ${escapeHTML(item.store)} · ${formatPrice(item.price)} × ${item.quantity}</p></div>
                    <div class="d-flex flex-wrap align-items-center gap-2">
                        <div class="btn-group btn-group-sm" role="group" aria-label="Quantity controls for ${escapeHTML(item.name)}">
                            <button class="btn btn-outline-secondary" type="button" data-action="decrease" data-index="${index}" aria-label="Decrease ${escapeHTML(item.name)} quantity">−</button>
                            <span class="btn btn-outline-secondary disabled text-body fw-bold" aria-live="polite">${item.quantity}</span>
                            <button class="btn btn-outline-secondary" type="button" data-action="increase" data-index="${index}" aria-label="Increase ${escapeHTML(item.name)} quantity">+</button>
                        </div>
                        <button class="btn btn-outline-danger btn-sm" type="button" data-action="remove" data-index="${index}" aria-label="Remove ${escapeHTML(item.name)} from ${escapeHTML(item.store)}">Remove</button>
                    </div>
                    <strong class="text-end">${formatPrice(item.price * item.quantity)}</strong>
                </div>
            </article>`).join("");
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal === 0 || subtotal >= 5000 ? 0 : DELIVERY_FEE;
    const total = subtotal + delivery;
    const subtotalElement = document.getElementById("cart-subtotal");
    const deliveryElement = document.getElementById("delivery-fee");
    const totalElement = document.getElementById("cart-total");
    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (deliveryElement) deliveryElement.textContent = formatPrice(delivery);
    if (totalElement) totalElement.textContent = formatPrice(total);
    const checkoutTotal = document.getElementById("checkout-total");
    if (checkoutTotal) checkoutTotal.textContent = formatPrice(total);
    const checkoutButton = document.getElementById("checkout-btn");
    if (checkoutButton) checkoutButton.disabled = cart.length === 0;
    const clearButton = document.getElementById("clear-cart");
    if (clearButton) clearButton.disabled = cart.length === 0;
}

function init() {
    // A persistent live region reports storage errors without interrupting shopping.
    const storageStatus = document.createElement("p");
    storageStatus.id = "storage-status";
    storageStatus.className = "alert alert-warning";
    storageStatus.setAttribute("role", "status");
    storageStatus.hidden = true;
    document.querySelector("main").prepend(storageStatus);

    updateCartCount();
    renderCart();

    document.querySelectorAll(".store-btn").forEach(button => button.addEventListener("click", () => showProducts(button.dataset.store)));
    document.addEventListener("click", event => {
        const addButton = event.target.closest(".add-product");
        if (addButton) addToCart(addButton.dataset.name, Number(addButton.dataset.price), addButton.dataset.store);

        const cartButton = event.target.closest("[data-action]");
        if (cartButton) {
            const index = Number(cartButton.dataset.index);
            if (cartButton.dataset.action === "increase") changeQuantity(index, 1);
            if (cartButton.dataset.action === "decrease") changeQuantity(index, -1);
            if (cartButton.dataset.action === "remove") removeFromCart(index);
            // Rendering replaces the controls; keep keyboard focus near the edited item.
            const nextIndex = Math.min(index, cart.length - 1);
            const nextControl = document.querySelector(`[data-action="${cartButton.dataset.action}"][data-index="${nextIndex}"]`);
            (nextControl || document.querySelector(".empty-cart a"))?.focus();
        }
    });

    document.getElementById("clear-cart")?.addEventListener("click", clearCart);
    // The compare.html search and category filters moved to js/script.js (jQuery, Task 1).

    document.querySelectorAll(".store-filter").forEach(button => button.addEventListener("click", () => {
        document.querySelectorAll(".store-filter").forEach(filter => {
            const active = filter === button;
            filter.classList.toggle("active", active);
            filter.setAttribute("aria-pressed", String(active));
        });
        document.querySelectorAll(".store-card").forEach(card => {
            card.hidden = button.dataset.district !== "all" && card.dataset.district !== button.dataset.district;
        });
    }));
    // Catalog search and sorting events are bound in js/script.js (jQuery, Tasks 1-2).

    const requestedStore = new URLSearchParams(window.location.search).get("store");
    if (requestedStore && Object.hasOwn(products, requestedStore)) showProducts(requestedStore);
}

document.addEventListener("DOMContentLoaded", init);
// Keep the count and totals current when the cart changes in another tab.
window.addEventListener("storage", event => {
    if (event.key === "cart" || event.key === null) {
        cart = loadCart();
        updateCartCount();
        renderCart();
        const dialog = document.getElementById("checkout-dialog");
        if (!cart.length && dialog && window.bootstrap) bootstrap.Modal.getInstance(dialog)?.hide();
    }
});

/* ===== Bundled from validation.js; retained for Assignment 6 traceability. ===== */
/* Shared client-side rules for all Foodly demo forms. */
const FoodlyValidation = (() => {
    const emailPattern = /^[A-Za-z0-9_+-]+(?:\.[A-Za-z0-9_+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;
    const rules = {
        name: value => {
            const name = value.trim();
            const letters = name.match(/\p{L}/gu) || [];
            return letters.length >= 2 && /^\p{L}[\p{L}\p{M}]*(?:[ '\u2019-]\p{L}[\p{L}\p{M}]*)*$/u.test(name)
                ? "" : "Enter your full name using letters, spaces, hyphens or apostrophes. Please use at least 2 letters.";
        },
        email: value => {
            const email = value.trim();
            if (email.length > 254 || !emailPattern.test(email)) {
                return /[^A-Za-z0-9._+@-]/.test(email)
                    ? "Email contains unsupported characters."
                    : "Please enter a valid email address.";
            }
            const [local, domain] = email.split("@");
            const labels = domain.split(".");
            return local.length <= 64 && labels.every(label => label.length <= 63)
                ? "" : "Please enter a valid email address.";
        },
        phone: value => /^[0-9 ()-]+$/.test(value.trim()) && value.replace(/\D/g, "").length === 10
            ? "" : "Enter exactly 10 digits after +7, for example 700 000 00 00.",
        password: value => value.trim().length > 0 && value.length >= 8 && /\p{Lu}/u.test(value) &&
            /\p{Ll}/u.test(value) && /\p{N}/u.test(value) && /[^\p{L}\p{M}\p{N}\s]/u.test(value)
            ? "" : "Password must be at least 8 characters and contain uppercase, lowercase, number and special character.",
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
            const required = field.dataset.required === "true";
            if (required && ((field.type === "checkbox" && !field.checked) ||
                (field.type === "radio" && !form.querySelector(`input[type="radio"][name="${CSS.escape(field.name)}"]:checked`)) ||
                (field.type !== "checkbox" && !value.trim()))) {
                message = field.type === "checkbox" ? "Please confirm this option." : "This field is required.";
            } else if (value.trim() || required) {
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
            if (field.dataset.validate || field.dataset.required === "true" || touched.has(field)) validateField(field);
            if (field.dataset.validate === "password") {
                const confirmation = fields.find(input => input.dataset.validate === "confirm");
                if (confirmation && touched.has(confirmation)) validateField(confirmation);
            }
        }
        form.addEventListener("input", recheck);
        form.addEventListener("change", recheck);
        form.addEventListener("blur", recheck, true);
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
        ["register-form", "register-success", values => `Welcome, ${values.name.trim()}! Your demo account was saved in this browser.`, "Demo account created successfully."],
        ["subscribe-form", "subscribe-success", values => `Thanks, ${values.name.trim()}! Subscription validated for ${values.email.trim()}. Nothing was sent or saved.`, "Subscribed to weekly deals (demo)."],
        ["contact-form", "feedback-status", () => "Thanks! Your feedback passed validation. This demo does not send or save your message.", "Feedback submitted successfully (demo)."]
    ];
    for (const [formId, statusId, message, toastText] of demos) {
        const form = document.getElementById(formId);
        if (!form) continue;
        FoodlyValidation.attach(form, values => {
            const status = document.getElementById(statusId);
            const text = message(values);
            if (form.id === "register-form") {
                try {
                    localStorage.setItem("foodly-demo-account", JSON.stringify({
                        name: values.name.trim(),
                        email: values.email.trim().toLowerCase(),
                        createdAt: new Date().toISOString()
                    }));
                    sessionStorage.setItem("foodly-demo-session", JSON.stringify({
                        email: values.email.trim().toLowerCase(),
                        createdAt: new Date().toISOString()
                    }));
                } catch {
                    status.textContent = "Your details passed validation, but this browser could not save the demo account.";
                    status.hidden = false;
                    return;
                }
            }
            // Assignment 6, Task 6: validation passed, so the button shows a spinner while a
            // server call is simulated (js/script.js). The success message and toast come after it.
            simulateServerRequest(form.querySelector('[type="submit"]'), () => {
                status.textContent = text;
                status.hidden = false;
                showToast(toastText, "success");
            });
        });
    }
});

/* ===== Bundled from checkout.js; retained for Assignment 6 traceability. ===== */
/* Assignment 5: an object with methods, callbacks, loops and a three-step form. */
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("checkout-form");
    const dialog = document.getElementById("checkout-dialog");
    if (!form || !window.bootstrap) return;
    const modal = bootstrap.Modal.getOrCreateInstance(dialog);
    const validator = FoodlyValidation.attach(form);
    const steps = [...form.querySelectorAll("[data-checkout-step]")];
    const next = document.getElementById("checkout-next");
    const back = document.getElementById("checkout-back");
    const submit = document.getElementById("checkout-submit");
    const checkout = {
        step: 0,
        pending: false, // true while the simulated server call runs (Assignment 6)
        totals() {
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const delivery = subtotal > 0 && subtotal < 5000 ? DELIVERY_FEE : 0;
            return { subtotal, delivery, total: subtotal + delivery };
        },
        paymentLabel() {
            switch (form.elements.payment.value) {
                case "kaspi": return "Kaspi Pay (demo)";
                case "card": return "Bank card (demo)";
                case "cash": return "Cash on delivery (demo)";
                default: return "Choose a payment method";
            }
        },
        // The caller supplies the rendering callback. Inputs remain in the DOM.
        move(direction, onChange) {
            if (direction > 0 && !validator.validate(steps[this.step])) return;
            this.step = Math.max(0, Math.min(steps.length - 1, this.step + direction));
            onChange(this.step);
        }
    };

    function renderReview() {
        const review = document.getElementById("checkout-review");
        const totals = checkout.totals();
        const details = [
            ["Customer", form.elements.name.value.trim()],
            ["Phone", `+7 ${form.elements.phone.value.trim()}`],
            ["Address", form.elements.address.value.trim()],
            ["Payment", checkout.paymentLabel()],
            ["Delivery time", form.elements.deliveryTime.selectedOptions[0].textContent],
            ["Courier note", form.elements.note.value.trim() || "None"],
            ...cart.map(item => [`${item.name} × ${item.quantity} (${item.store})`, formatPrice(item.price * item.quantity)]),
            ["Delivery fee", formatPrice(totals.delivery)],
            ["Total", formatPrice(totals.total)]
        ];
        review.replaceChildren();
        for (const [label, value] of details) {
            const term = document.createElement("dt");
            const description = document.createElement("dd");
            term.textContent = label;
            description.textContent = value; // Personal input is never parsed as HTML.
            review.append(term, description);
        }
    }

    function renderStep(index, focus = true) {
        steps.forEach((step, position) => { step.hidden = position !== index; });
        form.querySelectorAll("[data-step-marker]").forEach((marker, position) => {
            if (position === index) marker.setAttribute("aria-current", "step");
            else marker.removeAttribute("aria-current");
        });
        back.hidden = index === 0;
        next.hidden = index === steps.length - 1;
        submit.hidden = index !== steps.length - 1;
        document.getElementById("checkout-step-status").textContent = `Step ${index + 1} of ${steps.length}`;
        if (index === 2) renderReview();
        if (focus) steps[index].querySelector("h3").focus();
    }

    next.addEventListener("click", () => checkout.move(1, renderStep));
    back.addEventListener("click", () => checkout.move(-1, renderStep));
    document.getElementById("checkout-btn").addEventListener("click", () => {
        if (!cart.length) return;
        checkout.step = 0;
        renderCart();
        renderStep(0, false);
        modal.show();
    });
    dialog.addEventListener("shown.bs.modal", () => steps[checkout.step].querySelector("h3").focus());
    dialog.addEventListener("hidden.bs.modal", () => {
        const target = cart.length ? document.getElementById("checkout-btn") : document.querySelector(".empty-cart a");
        target?.focus();
    });
    form.addEventListener("submit", event => {
        event.preventDefault();
        if (checkout.step < 2) {
            checkout.move(1, renderStep);
            return;
        }
        if (!cart.length) { modal.hide(); return; }
        // Revalidate every step, including fields hidden by the wizard.
        for (let index = 0; index < steps.length; index += 1) {
            if (!validator.validate(steps[index])) {
                checkout.step = index;
                renderStep(index, false);
                steps[index].querySelector(".is-invalid")?.focus();
                return;
            }
        }
        // Assignment 6, Task 6: spinner on "Place demo order" while a server call is simulated.
        // The dialog cannot be closed until the simulated response arrives.
        setPending(true);
        simulateServerRequest(submit, () => {
            setPending(false);
            completeOrder();
        });
    });

    function setPending(pending) {
        checkout.pending = pending;
        back.disabled = pending;
        dialog.querySelectorAll('[data-bs-dismiss="modal"]').forEach(button => { button.disabled = pending; });
    }
    dialog.addEventListener("hide.bs.modal", event => {
        if (checkout.pending) event.preventDefault();
    });

    function completeOrder() {
        if (!cart.length) { modal.hide(); return; } // the cart was emptied in another tab meanwhile
        const status = document.getElementById("order-status");
        const total = formatPrice(checkout.totals().total);
        // A short demo order number for the Copy button (Task 8), e.g. FD-K3J9QZ.
        const orderNumber = `FD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
        document.getElementById("order-message").textContent = `Thanks, ${form.elements.name.value.trim()}! Your demo order totals ${total}. No payment was taken and no delivery was booked.`;
        document.getElementById("order-number").textContent = orderNumber;
        status.hidden = false;
        cart = [];
        saveCart();
        renderCart();
        form.reset();
        checkout.step = 0;
        modal.hide();
        showToast(`Demo order ${orderNumber} placed. Nothing was charged.`, "success");
    }
    window.addEventListener("storage", () => {
        if (checkout.step === 2) renderReview();
    });
});

/* ===== Bundled from theme.js; retained for Assignment 6 traceability. ===== */
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

/* ===== Bundled from datetime.js; retained for Assignment 6 traceability. ===== */
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

/* ===== Bundled from accordion.js; retained for Assignment 6 traceability. ===== */
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

/* ===== Bundled from popup.js; retained for Assignment 6 traceability. ===== */
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

/* ===== Bundled from interactions.js; retained for Assignment 6 traceability. ===== */
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


/* Shared responsive navigation: one accessible menu behavior across all pages. */
document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".foodly-menu-toggle");
    const menu = document.getElementById("mainNav");
    if (!toggle || !menu) return;
    const closeMenu = () => { menu.hidden = true; toggle.setAttribute("aria-expanded", "false"); };
    toggle.addEventListener("click", () => {
        const opening = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(opening));
        menu.hidden = !opening;
        if (opening) menu.querySelector("a")?.focus();
    });
    menu.addEventListener("click", event => { if (event.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !menu.hidden) { closeMenu(); toggle.focus(); } });
    document.addEventListener("click", event => { if (!event.target.closest(".foodly-navbar") && !menu.hidden && matchMedia("(max-width: 767px)").matches) closeMenu(); });
});
