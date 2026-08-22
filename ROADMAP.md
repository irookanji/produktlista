# Roadmap

Next features for Handla, in a sensible order. The app stays a mobile-first PWA: React 19, Preact Signals, Tailwind 4, Vite, bun. No backend.

## 1. Search on the Master List

Filter the ~60 staples as you type so you do not have to scroll categories.

- Sticky search field under the Handla header
- Match on name (and later translated names)
- Hide empty categories while filtering
- Client-side only — no extra library

## 2. IndexedDB for user data

Move user-owned data off `localStorage` so custom products can grow and survive PWA reinstalls more reliably.

- **IndexedDB** via a small wrapper (`idb`) - native API is too verbose; Dexie is heavier than we need
- Stores: custom products, shopping list (migrate from `localStorage` once)
- Built-in catalog in `products.ts` stays in code; only user changes go in IDB
- Hydrate IDB **before** the shopping list, so custom `productId`s still resolve

## 3. “+” to add custom Master List items

Let the user add (and remove) their own varor on device.

- Round **+** on the Master List (header or above the bottom nav)
- Sheet: name, emoji, category
- Save to IndexedDB, merge with the built-in catalog in the UI
- Custom rows can be deleted; built-in rows stay
- Depends on (2)

## 4. Language switcher (SV / DE / EN / KZ)

UI and catalog copy in Swedish, German, English, and Kazakh.

- Locale signal (`locale$`), persisted in IndexedDB or `localStorage`
- Small JSON dictionaries for chrome (tabs, buttons, empty states)
- Product names as translation maps (or parallel catalogs), not one English string
- No `i18next` unless the file set gets large — a typed `t(key)` helper is enough
- Default: device language if it matches, otherwise English
