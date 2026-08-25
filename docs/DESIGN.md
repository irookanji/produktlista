# Handla design

Token **values** live in [`src/index.css`](../src/index.css). This file is the rules an agent should implement from. Open [`DESIGN.html`](./DESIGN.html) locally (`bun run dev` → `/docs/DESIGN.html`) to see the same tokens and components rendered. The preview is not included in the production build.

Do not copy hex, `rgb()`, or one-off `px` into JSX or into this file. Add a named token in `@theme` first.

Keep splash and install chrome in sync with the CSS:

- `index.html` blocking background → `--color-page` (`#e8e8ed` / `#000`)
- `index.html` and `manifest.webmanifest` `theme_color` → `--color-brand` (`#34C759`)
- `manifest.webmanifest` `background_color` → `--color-surface` light (`#ffffff`)

## Color

Four core colors per theme. Mix roles from those four. **Danger** is the only extra hue.

| Token | Role |
| --- | --- |
| `--color-brand` | Primary actions, selected checkbox, active nav chip |
| `--color-ink` | Body text, icons |
| `--color-surface` | App panel, sheets, rows |
| `--color-page` | Canvas behind the app |
| `--color-on-brand` | Text/icons on a brand fill (same in both themes) |
| `--color-brand-emphasis` | Pressed brand (`brand` mixed toward `ink`) |
| `--color-brand-soft` | Nav chip, empty-state ring |
| `--color-muted` | Secondary copy, inactive tab label |
| `--color-line` | Row dividers, hairlines |
| `--color-line-strong` | Unchecked checkbox, field borders |
| `--color-completed` | Bought-item text and strike |
| `--color-icon-well` | Destructive/utility icon buttons on a row |
| `--color-header` | Frosted sticky header |
| `--color-overlay` | Sheet/modal scrim |
| `--color-danger` | Irreversible actions only (`Clear Completed`) |
| `--color-danger-soft` | Pressed danger |

Light core: brand `#34c759`, ink `#1c1c1e`, surface `#ffffff`, page `#e8e8ed`. Dark overrides those four (ink `#f5f5f7`, surface `#1c1c1e`, page `#000000`); brand and danger stay put. `html.dark` is the dark hook (`@custom-variant dark`).

## Type

System UI stack: `--font-sans`. Use the named text tokens, not ad-hoc `text-[n]`.

| Token / class | Use |
| --- | --- |
| `.kicker` | Section labels, tab captions (`--text-kicker`, uppercase, muted) |
| `--text-step` | Helper labels, install-help numbers |
| `--text-body` | Secondary sentences, counts |
| `--text-item` | Product names |
| `--text-button` | Pill CTAs |
| `--text-emoji` | Product emoji |
| `--text-title` | Sheet titles |
| `--text-heading` | Empty-state heading |
| `--text-display` | Screen titles |

## Spacing, radius, elevation

Spacing tokens drive `p-*`, `gap-*`, `size-*`, `h-*`. Prefer `md` / `lg` / `xl` over new values.

Hit targets: `--spacing-hit` (44px) for row toggles; `--spacing-toolbar` for header icon buttons; `--spacing-button` for full-width CTAs.

Radii: `--radius-checkbox`, `--radius-control` (nav chips, fields), `--radius-sheet`, `--radius-pill` (CTAs, toolbar).

Shadows: `--shadow-app` on the phone shell, `--shadow-brand` on the primary CTA bar, `--shadow-sheet` on dialogs, `--shadow-drag` while reordering.

Z-index: drag `20`, header `30`, overlay `50`.

## Components

Reuse the CSS classes in `src/index.css` and the React components in `src/components/`. Do not invent a parallel button or row.

| Piece | Notes |
| --- | --- |
| App shell | `max-w-app`, `bg-surface`, `shadow-app`, `h-dvh` |
| `MasterList` | Sticky frosted header, category kickers, `ProductRow` |
| `ShoppingList` | Same row; grip to reorder; bought rows show close + check |
| `EmptyShoppingList` | Brand-soft ring + `EmptyCartIcon` |
| `ProductRow` | Checkbox or close; emoji + name; grip / check / delete |
| `BottomNav` | Two tabs, `h-nav`, active chip `bg-brand-soft text-brand` |
| `ThemeSwitcher` | Cycles light → dark → system |
| `InstallAppButton` | Brand toolbar control; hidden when the PWA is installed |
| `AddProductSheet` | Overlay + sheet; Escape and scrim close |
| `.btn-primary` | Brand pill CTA |
| `.btn-primary-shadow` | Add-to-list CTA |
| `.btn-compact` | Shorter primary (sheets) |
| `.btn-danger` | Outlined danger, full width |
| `.btn-toolbar` | Round header control |
| `.cta-bar` | Bottom action padding above the nav |

## Icons

All glyphs are named exports in [`src/icons.tsx`](../src/icons.tsx). Pass `className` for size and color at the call site (`size-icon`, `size-icon-sm`, `text-brand`). Do not inline SVG in components.

| Icon | Default size | Where |
| --- | --- | --- |
| `ChecklistIcon` | `size-icon` | Master List tab |
| `CartIcon` | `size-icon` | Shopping List tab |
| `EmptyCartIcon` | `size-empty-icon` | Empty shopping illustration (`viewBox` 88, not a 24px glyph) |
| `DownloadIcon` | `size-icon` | Install app |
| `ShareIcon` | `size-icon` | iOS install help (add `text-brand`) |
| `PlusIcon` | `size-icon` | Add custom item |
| `CheckIcon` | `size-icon-sm` | Checkbox, mark-not-bought |
| `CloseIcon` | `size-icon-sm` | Remove item |
| `GripIcon` | `size-icon-sm` | Reorder handle |
| `SunIcon` / `MoonIcon` / `DeviceIcon` | `size-icon` | Theme switcher |

Product catalog “icons” are emoji strings on `Product`, not SVGs.
