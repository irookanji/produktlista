# Roadmap

Next features for Handla, in a sensible order. The app stays a mobile-first PWA: React 19, Preact Signals, Tailwind 4, Vite, bun. Local-first until shared lists (3).

## Next

### 1. Search on the Master List

Filter the ~60 staples as you type so you do not have to scroll categories.

- Sticky search field under the Handla header
- Match on name (and later translated names)
- Hide empty categories while filtering
- Client-side only — no extra library

### 2. Language switcher (SV / DE / EN / KZ)

UI and catalog copy in Swedish, German, English, and Kazakh.

- Locale signal (`locale$`), persisted in IndexedDB
- Small JSON dictionaries for chrome (tabs, buttons, empty states)
- Product names as translation maps (or parallel catalogs), not one English string
- No `i18next` unless the file set gets large — a typed `t(key)` helper is enough
- Default: device language if it matches, otherwise English

### 3. Shared shopping list

One list for the household: if she adds milk, you see it on your phone and can add or remove too.

- Join via a short code or link (no accounts to start)
- Sync shopping list both ways: add, remove, bought, reorder
- Custom products created on one device must resolve on the others
- IndexedDB stays the offline cache; a small backend is the source of truth for the shared list
- Master List catalog can stay per-device until we know we want that shared too

## Done

### IndexedDB for user data

User-owned data lives in IndexedDB (`idb`): custom products and the shopping list. Built-in catalog stays in `products.ts`. One-time migrate from `localStorage`. Hydrate custom products before the shopping list so custom `productId`s resolve. Theme stays in `localStorage` for the blocking script.

### Custom Master List items

Round **+** in the Master List header opens a sheet (name, emoji, category). Custom rows save to IndexedDB, merge with the built-in catalog, and can be deleted. Built-in rows stay.
