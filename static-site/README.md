# PUBLIC RUST — статичная версия

Чистый HTML + CSS + JS, без сборки. Просто откройте `index.html` в браузере
или запустите локальный сервер:

```bash
cd static-site
python3 -m http.server 8080
# http://localhost:8080
```

## Файлы

- `index.html` — магазин (категории, поиск, карточки, наборы, hero-маркиза)
- `profile.html` — профиль (SteamID, баланс, промокод)
- `history.html` — история покупок (хранится в `localStorage`)
- `styles.css` — все стили, токены, светлая и тёмная темы
- `app.js` — рендеринг, состояние, модалки, тосты, маркиза, theme toggle
- `assets/` — фото категорий

Иконки берутся с Iconify (`api.iconify.design/...`), флаги — с
`hatscripts.github.io/circle-flags`, шрифт — Inter с Google Fonts.

Тема и история покупок сохраняются в `localStorage`.
