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
