# Проверка Foodly Fixed Assignment 6

Проверено локально 17 ноября 2026 года на актуальной версии main, полученной из GitHub: коммит 79334ebcd2efa05e81f063f1ec57fc982b3f0b04. Изменения не публиковались.

## Результат

- HTML: html-validate — PASS, все 6 страниц.
- JavaScript: node --check для js/app.js и tests/browser.cjs — PASS.
- Playwright E2E: 357 assertions — PASS.
- Ошибки runtime, console и ответов HTTP 4xx/5xx — 0.
- npm audit: 0 уязвимостей после обновления html-validate; production audit также 0.
- Axe WCAG 2 A/AA и WCAG 2.1 AA: 0 нарушений в базовых состояниях шести страниц и проверенных интерактивных состояниях.
- Горизонтальное переполнение: PASS для каждой страницы в светлой и тёмной темах на 360, 390, 768, 992, 1024 и 1440 px. Также проверены 320 px для Responsive CSS Grid.
- Шапка и её размеры: сравниваются между всеми страницами на каждом тестовом размере. Панель часов и кнопок, а также заголовок таблицы Compare проверяются в тёмной теме.
- Assignment 6: jQuery 4.0.0 загружена на всех страницах; каждая содержит ровно один собственный JS bundle js/app.js.
- Проверены каталог, поиск, сортировка, категории, autocomplete, FAQ-подсветка, тосты, clipboard, lazy loading, счётчики, анимация submit, формы, валидация, checkout, popup, корзина, localStorage, тема, звук, клавиатурная навигация и Responsive CSS Grid.
- Регистрация и Feedback: протестированы разрешённые/запрещённые email, Unicode-имена, требования к паролю, live-валидация, Enter-submit, блокировка записи при ошибке и demo-сохранение без пароля.

Браузер: Google Chrome 157.0.8103.79 через Playwright. Проверки шли с локального HTTP-сервера и синтетическими данными. Протокол assertions записан в test-results.json, отчёты axe — в axe-audit.json и axe-dark.json; тесты сохраняют скриншоты в screenshots/.

## Запуск

Из папки проекта:

    npm ci
    npm run validate:html
    node --check js/app.js
    node --check tests/browser.cjs
    python3 -m http.server 8765

Во втором терминале:

    CHROME_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm test

Либо установите браузер Playwright командой npx playwright install chromium. Для работы jQuery во время просмотра нужен интернет, поскольку Assignment 6 требует официальную CDN-версию jQuery 4.0.0.

Проверены статические страницы, а не реальные платежи, аккаунты, email или доставка. Деморегистрация сохраняет только имя и email локально и создаёт браузерную demo-сессию; пароль не сохраняется, backend/email verification отсутствуют. Тесты не доказывают одинаковое поведение во всех браузерах и вспомогательных технологиях. Страница Responsive продолжает работать без Bootstrap и сохраняет учебные CSS Grid и Media Queries.
