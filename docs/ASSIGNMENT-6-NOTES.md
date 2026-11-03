# Assignment 6 (jQuery): заметки для отчёта и защиты

**Команда:** KN (Foodly) · **Участники:** Kakhar Nassyrkhan, Nurasyl Raiskaliev · **Группа:** SE-2506
**Live:** https://vuus1d.github.io/Food-Delivery-Platform-KN/ · **Repo:** https://github.com/vuus1d/Food-Delivery-Platform-KN

Весь jQuery-код Assignment 6 лежит в одном файле **`js/script.js`** (594 строки). Он поделён на секции с заголовками `/* ===== Task N ===== */`. Номера строк ниже соответствуют финальной версии файлов в этом коммите.

Как всё связано:
- `index.html`, `stores.html`, `compare.html`, `cart.html`, `login.html`, `responsive.html` — в `<head>` (строки 11–13) подключены jQuery 4.0.0 с CDN и `js/script.js`.
- Старые скрипты (`app.js`, `validation.js`, `checkout.js`) подключены с `defer` и вызывают четыре общие функции из `script.js`: `showToast`, `filterCatalog`, `simulateServerRequest`, `checkLazyImages`.
- Стили всех новых элементов: `css/style.css`, строки 244–351, блок `Assignment 6`. Прогресс-бар для `responsive.html`: `css/media-queries.css`, строки 196–211.

Общие помощники (`js/script.js`, строки 6–43):
- `$("html").removeClass("no-js")` (стр. 9) включает lazy-картинки; без JS остаётся `<noscript>`.
- `$.fx.off = reducedMotion.matches` (стр. 12–14): при `prefers-reduced-motion` все jQuery-анимации сразу прыгают в конечное состояние.
- `$.easing.foodlyEaseOut` (стр. 17) — своя функция плавности (в jQuery core есть только `swing` и `linear`).
- `escapeRegExp` (20–22), `throttle` (25–38), `revealWithFade` (41–43).

---

## Task 0. Setup

**Где видно:** любая страница → DevTools → Console: `jQuery is ready!`. В Elements → `<head>` видны два `<script>`.

**Файлы:** все 6 HTML (строки 11–13); `js/script.js`, строки 582–594 (`$(document).ready`).

**Как сделано:**
1. В `<head>` добавлен `<script src="https://code.jquery.com/jquery-4.0.0.min.js" integrity="sha256-…" crossorigin="anonymous">`. Хэш SRI посчитан по скачанному файлу.
2. Сразу после него идёт `<script src="js/script.js"></script>` (без `defer`), поэтому `$` доступен всем остальным скриптам.
3. В `script.js` на верхнем уровне объявлены только функции и константы. `body` там не трогается, потому что `<head>` выполняется до появления `<body>`.
4. `$(document).ready(function () { console.log("jQuery is ready!"); … })` запускает все `init…()`.
5. Порядок проверен: callback из `.ready()` в jQuery 3/4 выполняется асинхронно, после всех обработчиков `DOMContentLoaded`. К этому моменту `app.js` уже отрисовал каталог, а `validation.js` подключил формы.

**jQuery:** `$(document).ready()`, `$()`.

**Скриншот:** открыть `index.html`, F12 → Console; плюс Elements со строками 11–13 в `<head>`.

---

## Part 1. jQuery Search

### Task 1. Real-time Search & Live Filter

**Где видно:** `stores.html` → «View Products» у любого магазина → поле «Search products». Дополнительно: `compare.html` → поле «Find an everyday essential» + кнопки категорий.

**Файлы:** `js/script.js`:
- `filterCatalog()` 97–131;
- `initCatalogSearch()` 133–138;
- `initCompareSearch()` 141–177.

Из `app.js` удалены старые ванильные `filterCatalog`, `compareProducts` и их `addEventListener`, чтобы не было двух конфликтующих обработчиков. `app.js:155` теперь вызывает jQuery-версию `filterCatalog()` после отрисовки магазина. Каталог расширен с 4 до 8 товаров на магазин (`app.js` 4–35, `productDetails` 40–49), цены взяты из таблицы compare.

**Как сделано:**
1. `$("#catalog-search").on("keyup input", filterCatalog)`. `input` ловит ввод, вставку и крестик поля search, `keyup` — классическое событие из подсказки PDF. Фильтр идемпотентный, поэтому двойной вызов безвреден.
2. Сортировка: `$container.children().get().sort(...)` со `switch` по `#catalog-sort`, затем `$container.append(sortedCards)` переставляет те же DOM-элементы.
3. Фильтр: `$cards.filter(function () { return $(this).find("h3, .product-description").text().toLowerCase().includes(query); })`.
4. Скрытие: `$cards.not($matches).prop("hidden", true)`. Появление: `revealWithFade()` → `.stop(true, true).hide().prop("hidden", false).fadeIn(200)` (только для ранее скрытых).
5. Счётчик и пустое состояние: `$("#catalog-status").text(...)`, `$("#catalog-empty").prop("hidden", count !== 0)`.
6. Compare: то же через `.filter()` по тексту строки и активной категории. Кнопки категорий: `.removeClass/.addClass("active")` и `.attr("aria-pressed")`. Ссылка `?category=dairy` выбирает категорию через `.trigger("click")`.

**jQuery:** `.on()`, `.val()`, `.children()`, `.get()`, `.append()`, `.find()`, `.text()`, `.filter()`, `.not()`, `.prop()`, `.hide()`, `.fadeIn()`, `.stop()`, `.attr()`, `.addClass/.removeClass()`, `.trigger()`.

**Скриншот:** Stores → View Products (Magnum) → ввести `chick` → видна 1 карточка и «1 product shown». Второй: Compare → Dairy → ввести `butter`.

### Task 2. Autocomplete Search Suggestions

**Где видно:** `stores.html` → View Products → начать вводить в «Search products», под полем выпадает список.

**Файлы:** `stores.html` 119–128 (обёртка `.autocomplete`, `role="combobox"`, `aria-expanded`, `aria-controls`, `<ul role="listbox">`, скрытый live-статус); `js/script.js` `initAutocomplete()` 181–306; CSS `style.css` 270–295.

**Как сделано:**
1. Источник подсказок: `catalogItems()` собирает `data-name`/`data-price` с кнопок `.add-product` текущего каталога через `.map(...).get()`.
2. `renderSuggestions()` на `input`: фильтрует названия по подстроке (сначала те, что начинаются с запроса), максимум 6, затем `$list.empty()`.
3. Подсветка без `.html()`: имя делится на три куска `$("<span>").text(before)`, `$("<mark>").text(match)`, `$("<span>").text(after)`. Пользовательский ввод не может стать HTML.
4. Каждая опция: `$("<li>", { id, role: "option", "aria-selected": "false" }).data("value", name)`. Список открывается через `.prop("hidden", false)` и `aria-expanded="true"`.
5. Клавиатура (`keydown` + `switch`): ↓/↑ двигают `activeIndex` по кругу. `setActive()` ставит класс `.is-active`, `aria-selected` и `aria-activedescendant` на input. Enter → `choose()`. Escape закрывает список с `preventDefault()`, иначе поле search само стирает текст.
6. Мышь: `mousedown` → `preventDefault()` (фокус остаётся в поле), `click` → `choose()`. Клик вне `.autocomplete` (`$(document).on("click")` + `.closest()`) и `blur` закрывают список. `choose()` подставляет значение и вызывает `filterCatalog()`.

**jQuery:** `.on("input"/"keydown"/"mousedown"/"click"/"blur")`, делегирование `.on(event, ".autocomplete-option", …)`, `.map().get()`, `$("<li>", {...})`, `.data()`, `.text()`, `.append()`, `.appendTo()`, `.empty()`, `.eq()`, `.attr()`, `.removeAttr()`, `.closest()`.

**Скриншот:** Stores → View Products (Galmart) → ввести `ba` → нажать ↓ (подсвечена строка «**Ba**nanas 1kg 990 ₸»). Для наглядности можно ввести `e`, чтобы получить несколько подсказок.

### Task 3. Search Highlighting

**Где видно:** `index.html` → секция «Frequently Asked Questions» → поле «Search the FAQ» над вопросами.

**Файлы:** `index.html` 388–396 (поле + `#faq-search-status` с `aria-live`); `js/script.js`: `highlightMatches()` 312–326, `initFaqSearch()` 328–378; CSS `.search-hit` в `style.css` 293–295.

**Как сделано:**
1. При загрузке исходный HTML каждого вопроса и ответа сохраняется: `$(this).data("originalHtml", $(this).html())`.
2. На каждый `input` сначала всё восстанавливается: `$(this).html(originalHtml)`. Это наш собственный доверенный HTML, и старые `<mark>` исчезают.
3. Запрос экранируется `escapeRegExp()`, из него строится `new RegExp("(" + escaped + ")", "gi")`: `g` — все совпадения, `i` — без учёта регистра.
4. `highlightMatches()` рекурсивно обходит `.contents()` и меняет только текстовые узлы. `split(pattern)` с группой захвата кладёт совпадения на нечётные позиции. Узел заменяется через `.replaceWith(textNodes)`, совпадения оборачиваются `.wrap('<mark class="search-hit"></mark>')`. Теги и атрибуты (например, `href="compare.html"`) не меняются.
5. Ответы с совпадениями раскрываются существующим аккордеоном: `.find(".faq-question").trigger("click")`. Флаг `.data("openedBySearch")` нужен, чтобы при очистке закрыть только то, что открыл поиск.
6. Счётчик: `$("#faq .search-hit").length` → `Found N matches`.

**jQuery:** `.data()`, `.html()`, `.contents()`, `.each()`, `.replaceWith()`, `.wrap()`, `.find()`, `.hasClass()`, `.trigger("click")`, `.removeData()`, `.text()`.

**Скриншот:** Home → прокрутить к FAQ → ввести `deliver` → «Found 5 matches», раскрыты 2 ответа с жёлтыми `<mark>`. Для тёмной темы нажать «Night theme».

---

## Part 2. UX Engagement

### Task 4. Scroll Progress Bar

**Где видно:** все 6 страниц, тонкая градиентная полоса у верхнего края окна.

**Файлы:** `js/script.js` `initScrollProgress()` 382–397; `style.css` 252–268 (день и ночь); `media-queries.css` 196–211 (копия для responsive.html, где Bootstrap и `style.css` не подключены).

**Как сделано:**
1. jQuery создаёт разметку: `$('<div class="scroll-progress" aria-hidden="true"><div class="scroll-progress-bar"></div></div>').prependTo("body")`. Полоса декоративная, поэтому `aria-hidden`.
2. `updateProgress()`: `scrollable = $(document).height() - $(window).height()`; `percent = $(window).scrollTop() / scrollable * 100`.
3. `$bar.css("width", percent + "%")`. Если прокручивать нечего, `.toggleClass("is-idle")` прячет полосу.
4. `$(window).on("scroll resize", updateProgress)` + первый вызов при загрузке.
5. Стиль: `position: fixed`, градиент Foodly (тёмно-зелёный → зелёный → жёлтый → оранжевый), `background-size: 100vw`, чтобы тёплые цвета открывались по мере прокрутки. Плюс свечение `box-shadow` и скруглённый конец. В тёмной теме градиент светлее и свечение ярче.

**Решение по responsive.html:** полоса там есть. Страница тоже подключает наши скрипты, а на телефоне (375 px) она прокручивается через три карточки магазинов один под другим, так что индикатор полезен. Стили лежат в `media-queries.css`, потому что эта страница специально работает без Bootstrap и `style.css`. Тёмной темы на ней нет (так было задумано ещё в Assignment 3).

**jQuery:** `$(window).scrollTop()`, `$(document).height()`, `$(window).height()`, `.css()`, `.toggleClass()`, `.prependTo()`, `.children()`, `.on("scroll resize")`.

**Скриншот:** Home → прокрутить до середины (полоса около 50%). Второй — в Night theme.

### Task 5. Animated Number Counter

**Где видно:** `index.html` → секция «Foodly in numbers» сразу под hero.

**Файлы:** `index.html` 107–141; `js/script.js` `initCounters()` 401–432; CSS `style.css` 297–302.

**Цифры честные и взяты из данных демо:** 3 магазина-партнёра, 24 товара в демо-каталоге (8 × 3), 60 min (в FAQ «около часа»), 5,000 ₸ — порог бесплатной доставки. Подпись: «Sample figures taken from this demo's own data».

**Как сделано:**
1. В HTML у `.counter` есть `data-count-to` и `data-suffix`. Реальное значение продублировано в `.visually-hidden` для экранных читалок, а анимированная цифра имеет `aria-hidden`.
2. При старте все счётчики ставятся в 0.
3. `startWhenVisible()`: `$section.offset().top` сравнивается с `$(window).scrollTop() + $(window).height()`. Если секция видна, `$(window).off("scroll.counters resize.counters")` снимает обработчики, поэтому счёт запускается один раз (namespace `.counters`).
4. `$({ value: 0 }).animate({ value: target }, { duration: 1800, easing: "foodlyEaseOut", step, complete })`: jQuery анимирует свойство обычного объекта, а `step` печатает `Math.round(now).toLocaleString("en-US") + suffix`.
5. `complete` ставит точное финальное значение. При reduced motion `$.fx.off` сразу даёт финальные цифры.

**jQuery:** `.animate()` (с `step`/`complete`/easing), `$.easing`, `.offset()`, `.scrollTop()`, `.height()`, `.on/.off` с namespace, `.attr()`, `.text()`, `.each()`.

**Скриншот:** обновить Home и медленно прокрутить к «Foodly in numbers». Поймать середину счёта (например «2,8xx ₸») или итог `3 / 24 / 60 min / 5,000 ₸`.

### Task 6. Loading Spinner on Submit

**Где видно:**
- `index.html` → форма «Send us feedback» (`#contact-form`) и попап Subscribe (`#subscribe-form`);
- `login.html` → `#register-form`;
- `cart.html` → Checkout → шаг 3 → «Place demo order».

**Файлы:** `js/script.js` `simulateServerRequest()` 439–452 (`SERVER_DELAY = 1600` на строке 436); `js/validation.js` 110–129; `js/checkout.js` 104–141 (`setPending` 113–116, `hide.bs.modal` 118–120, `completeOrder` 122–141).

**Как сделано:**
1. Спиннер не обходит валидацию. `FoodlyValidation.attach()` вызывает success-callback только после успешного `validate()`. Если есть ошибки, callback не вызывается и спиннера нет.
2. В callback (`validation.js` 118–129) вызывается `simulateServerRequest(form.querySelector('[type="submit"]'), done)`.
3. `simulateServerRequest`: запоминает `$button.html()`, фиксирует ширину `.css("min-width", $button.outerWidth())`, ставит `.prop("disabled", true)`, `aria-busy="true"` и `.html('<span class="spinner-border spinner-border-sm">…</span>Please wait…')` (статичная разметка Bootstrap, без пользовательского ввода).
4. Через `setTimeout(..., 1600)` («ответ сервера») кнопка возвращается в исходный вид, и вызывается `onDone()`, который показывает прежнее success-сообщение и тост.
5. Повторные клики невозможны: кнопка `disabled`, а Enter в поле тоже не отправляет форму, если кнопка по умолчанию выключена.
6. Checkout: `setPending(true)` выключает Back/Cancel/×, а обработчик `hide.bs.modal` с `event.preventDefault()` не даёт закрыть окно, пока идёт «запрос». Затем `completeOrder()`.

**jQuery:** `.html()`, `.prop("disabled")`, `.attr/.removeAttr("aria-busy")`, `.css()`, `.outerWidth()`.

**Скриншот:** Home → заполнить Feedback валидными данными (имя, `student@mail.kz`, тема, сообщение ≥ 10 символов, галочка) → «Send feedback» → сразу сделать снимок (≈1.6 с). Второй: Cart → Checkout → дойти до Review → галочка → «Place demo order».

---

## Part 3. Web App Functionality

### Task 7. Notification System

**Где видно:** правый нижний угол на Stores (Add to Cart), Home (формы, копирование), Cart (заказ), Login.

**Файлы:** `js/script.js`: константы 47–49, `dismissToast()` 51–56, `startToastTimer()` 58–61, `showToast(message, type)` 63–92; CSS `style.css` 334–351. Старый ванильный `showToast` удалён из `app.js`. Вызовы:
- `app.js` 96, 103, 111 (добавление в корзину, лимит 99);
- `validation.js` 126 (успех формы);
- `checkout.js` 137 (демо-заказ);
- `script.js` 513–518 (копирование).

**Как сделано:**
1. Контейнер `#toast-stack` создаётся один раз через `.appendTo("body")`. Тосты складываются в стек.
2. Тост собирается через jQuery: иконка по типу (`success/info/warning/danger`), `.text(message)` (сообщение не парсится как HTML), кнопка закрытия `.btn-close` с `aria-label`. Атрибуты `role="status"` и `aria-atomic="true"`.
3. Появление: `.css({ opacity: 0, left: "2rem" }).appendTo($stack).animate({ opacity: 1, left: 0 }, 250)`, то есть одновременно fade и slide справа.
4. Исчезновение: таймер 3.5 с → `dismissToast()` → `.fadeOut(300, () => $toast.remove())`. Наведение мыши или фокус ставят таймер на паузу (`mouseenter focusin` / `mouseleave focusout`).
5. В стеке не больше 4 активных тостов: самый старый закрывается. Исчезающие помечаются `.is-closing` и не считаются.

**jQuery:** `.appendTo()`, `.append()`, `.addClass()`, `.text()`, `.css()`, `.animate()`, `.fadeOut()`, `.remove()`, `.on()`, `.data()`, `.children()`, `.first()`, `.hasClass()`.

**Скриншот:** Stores → View Products → нажать «Add to Cart» 3 раза подряд → виден стек из трёх тостов «… added to your cart.».

### Task 8. Copy to Clipboard

**Где видно:**
1. `index.html` → секция «Weekly promo codes»: три кода `FOODLY10`, `FREEDELIVERY`, `ASTANA500` с пометкой «demo». В тексте прямо сказано, что скидки не применяются.
2. `cart.html` → после демо-заказа номер вида `FD-XXXXXX` с кнопкой Copy.

**Файлы:** `index.html` 222–255; `cart.html` 99–107; `js/script.js`:
- иконки 456–458;
- `copyWithTextarea()` 461–472;
- `copyText()` 474–479;
- `showCopied()` 482–503;
- `initCopyButtons()` 505–521.

CSS `style.css` 304–332. Номер заказа генерирует `checkout.js` 126–127.

**Как сделано:**
1. Делегированный клик `$(document).on("click", ".copy-btn", …)` (работает и для кнопки в корзине). Текст берётся из элемента в `data-copy-target`: `$(...).text().trim()`.
2. `copyText()`: если есть `navigator.clipboard` и `window.isSecureContext` (https или localhost), используется `navigator.clipboard.writeText(text)`. Иначе или при ошибке — fallback.
3. Fallback `copyWithTextarea()`: временный `<textarea readonly>` вне экрана → `.val(text)` → `select()` → `document.execCommand("copy")` → `.remove()`.
4. `showCopied()`: класс `.is-copied`, иконка меняется на галочку `.find(".copy-icon").html(ICON_CHECK)` (SVG-константа, не пользовательский ввод), подпись «Copied». Тултип «Copied to clipboard!» ставится над кнопкой по `$button.offset()`, `.outerWidth()` и `.outerHeight()` и не выходит за край экрана на 375 px. Он появляется через `.fadeIn(150)`. Тост показывает `showToast`.
5. Через 2 с (`COPY_RESET_DELAY`) тултип уходит через `.fadeOut()`, и кнопка возвращается к иконке-буферу и «Copy».
6. `.on('copy')` из подсказки: `$(document).on("copy", ".copy-snippet-code", …)`. Если выделить код мышкой и нажать Ctrl+C, тоже появится тост «Copied to clipboard!». `execCommand("copy")` в fallback тоже порождает настоящее событие `copy`.

**jQuery:** `.on("click")`/`.on("copy")` (делегирование), `.attr()`, `.text()`, `.val()`, `.appendTo()`, `.remove()`, `.addClass/.removeClass()`, `.find()`, `.html()`, `.offset()`, `.outerWidth/.outerHeight()`, `.css()`, `.fadeIn/.fadeOut()`, `.data()`.

**Скриншот:** Home → «Weekly promo codes» → нажать Copy у `FREEDELIVERY` → в кадре галочка, «Copied», тултип и тост.

### Task 9. Image Lazy Loading

**Где видно:**
- `index.html`: 3 карточки магазинов, 8 скрытых слайдов карусели, 2 фото команды;
- `stores.html`: 3 карточки магазинов и все фото товаров в каталоге.

Первый слайд карусели грузится обычно, потому что он сразу на экране.

**Файлы:**
- `index.html` / `stores.html`: у картинок `src` = прозрачный GIF 1×1, `data-src` = реальное фото, класс `lazy-img`; нативный `loading="lazy"` убран; за каждой картинкой идёт `<noscript>` с обычным `<img>`; у `<html>` класс `no-js`.
- `app.js:144`: шаблон фото товара.
- `js/script.js`: `LAZY_PLACEHOLDER` 526, `LAZY_MARGIN` 527, `loadLazyImage()` 530–540, `checkLazyImages()` 542–567, `initLazyImages()` 569–580.
- CSS `style.css` 246–250.

**Как сделано:**
1. `checkLazyImages()` берёт `$("img.lazy-img[data-src]")`, кроме скрытых слайдов карусели (`.closest(".carousel-item:not(.active)")`). Для каждой видимой (`.is(":visible")`) картинки считает `$img.offset().top` и `top + $img.outerHeight()`. Затем сравнивает с окном `$(window).scrollTop()` … `scrollTop() + $(window).height()` с запасом 200 px.
2. `loadLazyImage()`: `.removeAttr("data-src")`, затем `.one("load", …)` (обработчик вешается до смены `src`, чтобы не пропустить кэш), затем `.attr("src", source)`. По загрузке: `.css("opacity", 0).animate({ opacity: 1 }, 400)` — плавное появление.
3. Обработчик `$(window).on("scroll.lazy resize.lazy", throttle(checkLazyImages, 150))` срабатывает не чаще раза в 150 мс. Когда ждущих картинок не осталось, он снимается: `$(window).off("scroll.lazy resize.lazy")`. Если каталог потом отрисует новые, он ставится снова.
4. Карусель Bootstrap: скрытые слайды имеют `display: none`, и `offset()` для них бесполезен. Поэтому `$("#foodCarousel").on("slide.bs.carousel", e => loadLazyImage($(e.relatedTarget).find(...)))` грузит входящий слайд до его показа, а `slid.bs.carousel` заранее подгружает следующий. Bootstrap 5 сам вызывает jQuery-события, если на странице есть jQuery.
5. Layout shift отсутствует: `alt`, `width`, `height` сохранены, а высоту задаёт CSS (`.card-img-cover 190px`, `.product-img 160px`, `.carousel-img`, `.team-portrait 128px`). Пока фото грузится, на месте серый пульсирующий плейсхолдер `.lazy-img.is-loading`.
6. Без JavaScript: `.no-js .lazy-img { display: none }`, и показывается `<noscript>`-копия. Первая строка `script.js` снимает `no-js`.

**jQuery:** `.offset()`, `.scrollTop()`, `.height()`, `.outerHeight()`, `.attr("src")`, `.removeAttr()`, `.one("load")`, `.animate()`, `.is(":visible")`, `.closest()`, `.filter()`, `.on/.off` с namespace, событие Bootstrap `slide.bs.carousel`.

**Скриншот:** Home → F12 → Network → фильтр Img → обновить страницу (`team`/`vegetables.jpg` и др. не загружены) → прокрутить вниз (появляются по одной) → нажать Next в карусели. Второй кадр: Elements у фото команды до прокрутки (`src="data:image/gif…" data-src="images/…"`).

---

## Part 4. Deploy

**README.md:**
- заголовок «Assignment 6: jQuery»;
- таблица «Assignment 6 requirement map»: Requirement → файл/функция → как показать;
- исправлен абзац про CDN: jQuery 4.0.0 грузится с code.jquery.com с SRI, Bootstrap по-прежнему локальный;
- обновлено дерево файлов, добавлено примечание о `.gitattributes`.

**package.json / package-lock.json:** `foodly-assignment-6`, `6.0.0`, новое описание.

**Статус деплоя:** см. раздел «Live URL и статус деплоя» в конце (заполнено после push).

---

## Challenges & solutions (реальные проблемы)

1. **Bootstrap не загружался локально на Windows.** Git с `core.autocrlf=true` переписал `vendor/bootstrap.min.css` и `.bundle.min.js` на CRLF. Байты изменились, и SRI-хэш в `integrity` перестал совпадать, поэтому браузер блокировал Bootstrap (карусель растянулась на 5000 px). Это было и в исходной версии. Решение: `.gitattributes` (`* text=auto eol=lf`, `vendor/** -text`) и рабочая копия, возвращённая к LF. ZIP для LMS собран из LF-файлов, хэши проверены.
2. **Два обработчика на одном поле поиска.** В `app.js` уже был ванильный фильтр. Он полностью удалён, остался один jQuery `filterCatalog()`, который `app.js` вызывает после отрисовки.
3. **Порядок загрузки.** jQuery и `script.js` стоят синхронно в `<head>`, остальные скрипты — с `defer`. Общие функции объявлены на верхнем уровне `script.js`, чтобы `app.js` мог их вызывать. Код, работающий с DOM, запускается в `.ready()`, который в jQuery 4 выполняется после `DOMContentLoaded`-обработчиков старых скриптов.
4. **Подсветка через `.html().replace()` ломала бы ссылки.** Поиск «compare» попал бы в `href="compare.html"`. Решение: обход только текстовых узлов + `.wrap('<mark>')`. Восстановление идёт из сохранённого оригинала через `.html()`.
5. **`fadeIn` против `[hidden] { display: none !important }`.** jQuery не может показать элемент с атрибутом `hidden`. Решение: `.hide()` → снять `hidden` → `.fadeIn()`.
6. **Escape в `type="search"` стирал текст**, а клик по подсказке терял фокус раньше `click`. Решение: `preventDefault()` на Escape при открытом списке и на `mousedown` опции.
7. **Лимит стека тостов не срабатывал при быстрых кликах** (нашёл автотест). Исчезающий тост ещё в DOM и считался повторно. Решение: класс `.is-closing` и подсчёт `:not(.is-closing)`.
8. **Скрытые слайды карусели.** У элементов с `display:none` `offset()` равен 0. Решение: грузить по событию Bootstrap `slide.bs.carousel` (`relatedTarget`).
9. **Спиннер и существующая логика.** `FoodlyValidation` делает `form.reset()` перед success, а reset прячет статус. Поэтому сообщение показывается в колбэке после задержки. В checkout окно могли закрыть во время «запроса» — решено через `hide.bs.modal` + `preventDefault()`.
10. **Тест звука зависел от машины.** На Windows Web Audio стартует дольше 350 мс (и в исходном коде тоже). Тест теперь ждёт событие `ended`, а не фиксированную паузу.

---

## Результаты тестов (реальные, 4 ноября 2026)

Полный отчёт: `docs/TESTING.md`, все утверждения: `docs/test-results.json`.

- `tests/browser.cjs` (Playwright 1.56.1, Chrome 156.0.8078.80 headless, Windows 11): **172 проверки пройдено, 0 провалено**.
- Ошибок консоли, runtime-ошибок и ответов ≥ 400 на всех страницах и контекстах: **0**.
- html-validate: **6/6** страниц без ошибок.
- `node --check`: **9/9** скриптов + тест.
- axe-core WCAG 2.1 AA: **0 нарушений** на 6 страницах и в трёх новых состояниях (тёмная тема + подсветка FAQ, открытый autocomplete, тултип копирования + тост).
- Горизонтальный overflow: **0** на 375/390/768/1440 px на всех 6 страницах.
- Скриншоты новых состояний: `docs/screenshots/a6-*.png` (autocomplete, compare-filter, faq-highlight, progress-bar, counters, copy, toasts, spinner, checkout-spinner, mobile-faq-night, mobile-stores-night).

---

## Короткие ответы на вероятные вопросы на защите

- **Почему `$(document).ready`, если скрипты с `defer`?** `script.js` стоит в `<head>` без `defer`, и в момент его выполнения `<body>` ещё нет. `.ready()` ждёт готовности DOM.
- **`keyup` vs `input`?** `keyup` срабатывает на отпускание клавиши (в том числе стрелок). `input` — на любое изменение значения (вставка мышью, крестик, автозаполнение). Слушаем оба, фильтр идемпотентный.
- **Почему `.text()`, а не `.html()` для ввода?** `.html()` парсит строку как разметку, и `<img onerror>` выполнился бы (XSS). `.text()` вставляет текстовый узел.
- **Зачем экранировать регулярку?** Символы `. * + ? ( ) [ ]` имеют особый смысл. Запрос `(` без экранирования дал бы `SyntaxError`, а `.` совпадал бы с любым символом.
- **Что изменилось в jQuery 4?** Удалены `$.trim`, `$.isArray`, `$.parseJSON`, `.size()` и др. Мы используем `String.prototype.trim`, `Array.isArray`, `.length`.
- **Как уважается reduced motion?** `$.fx.off = matchMedia("(prefers-reduced-motion: reduce)").matches` (с подпиской на изменение). Все `.animate/.fadeIn/.fadeOut` мгновенно доходят до конца, а CSS-анимации отключает существующий `@media (prefers-reduced-motion: reduce)`.

---

## Live URL и статус деплоя

https://vuus1d.github.io/Food-Delivery-Platform-KN/ — статус проверки после push записан ниже.
