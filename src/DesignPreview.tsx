import { type ReactNode, StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { ProductRow } from "./components/ProductRow.tsx";
import {
  CartIcon,
  CheckIcon,
  ChecklistIcon,
  CloseIcon,
  DeviceIcon,
  DownloadIcon,
  EmptyCartIcon,
  GripIcon,
  MoonIcon,
  PlusIcon,
  ShareIcon,
  SunIcon,
} from "./icons.tsx";
import "./index.css";
import type { Product } from "./types.ts";

const COLOR_SWATCHES = [
  {
    token: "--color-brand",
    role: "Actions, selected states",
    fill: "bg-brand",
  },
  { token: "--color-ink", role: "Body text, icons", fill: "bg-ink" },
  {
    token: "--color-surface",
    role: "App panel, sheets, rows",
    fill: "bg-surface",
  },
  { token: "--color-page", role: "Canvas behind the app", fill: "bg-page" },
  {
    token: "--color-on-brand",
    role: "Label on brand fills",
    fill: "bg-on-brand",
  },
  {
    token: "--color-brand-emphasis",
    role: "Pressed brand",
    fill: "bg-brand-emphasis",
  },
  {
    token: "--color-brand-soft",
    role: "Nav chip, empty-state ring",
    fill: "bg-brand-soft",
  },
  { token: "--color-muted", role: "Secondary copy", fill: "bg-muted" },
  { token: "--color-line", role: "Row dividers", fill: "bg-line" },
  {
    token: "--color-line-strong",
    role: "Unchecked checkbox, fields",
    fill: "bg-line-strong",
  },
  {
    token: "--color-completed",
    role: "Bought-item text",
    fill: "bg-completed",
  },
  {
    token: "--color-icon-well",
    role: "Row utility buttons",
    fill: "bg-icon-well",
  },
  { token: "--color-header", role: "Frosted sticky header", fill: "bg-header" },
  { token: "--color-overlay", role: "Sheet scrim", fill: "bg-overlay" },
  { token: "--color-danger", role: "Irreversible actions", fill: "bg-danger" },
  {
    token: "--color-danger-soft",
    role: "Pressed danger",
    fill: "bg-danger-soft",
  },
] as const;

const TYPE_SAMPLES = [
  { label: ".kicker", className: "kicker", sample: "Shopping List" },
  {
    label: "text-step",
    className: "text-step text-ink",
    sample: "Helper label",
  },
  {
    label: "text-body",
    className: "text-body text-ink",
    sample: "62 varor du brukar köpa",
  },
  {
    label: "text-item",
    className: "text-item font-medium text-ink",
    sample: "Milk (1 Litre) - Oatly",
  },
  {
    label: "text-button",
    className: "text-button font-semibold text-ink",
    sample: "Add 1 Item to Shopping List",
  },
  { label: "text-emoji", className: "text-emoji", sample: "🥛" },
  {
    label: "text-title",
    className: "text-title font-bold text-ink",
    sample: "Add item",
  },
  {
    label: "text-heading",
    className: "text-heading font-bold tracking-tight text-ink",
    sample: "List is Empty",
  },
  {
    label: "text-display",
    className: "text-display font-bold tracking-tight text-ink",
    sample: "Shopping List",
  },
] as const;

const SPACING_BARS = [
  { token: "2xs", className: "w-2xs" },
  { token: "xs", className: "w-xs" },
  { token: "sm", className: "w-sm" },
  { token: "md", className: "w-md" },
  { token: "lg", className: "w-lg" },
  { token: "xl", className: "w-xl" },
  { token: "2xl", className: "w-2xl" },
  { token: "3xl", className: "w-3xl" },
] as const;

const noop = () => undefined;

const ICONS = [
  { name: "ChecklistIcon", node: <ChecklistIcon />, note: "Master List tab" },
  { name: "CartIcon", node: <CartIcon />, note: "Shopping List tab" },
  {
    name: "EmptyCartIcon",
    node: <EmptyCartIcon className="size-icon" />,
    note: "Empty shopping illustration",
  },
  { name: "DownloadIcon", node: <DownloadIcon />, note: "Install app" },
  {
    name: "ShareIcon",
    node: <ShareIcon className="size-icon text-brand" />,
    note: "iOS install help",
  },
  { name: "PlusIcon", node: <PlusIcon />, note: "Add custom item" },
  { name: "SunIcon", node: <SunIcon />, note: "Theme light" },
  { name: "MoonIcon", node: <MoonIcon />, note: "Theme dark" },
  { name: "DeviceIcon", node: <DeviceIcon />, note: "Theme system" },
  { name: "CheckIcon", node: <CheckIcon />, note: "Checkbox / unbuy" },
  { name: "CloseIcon", node: <CloseIcon />, note: "Remove item" },
  { name: "GripIcon", node: <GripIcon />, note: "Reorder" },
] as const;

const DEMO_PRODUCT: Product = {
  id: "demo-milk",
  name: "Milk (1 Litre) - Oatly",
  icon: "🥛",
  category: "dairy",
};

const DEMO_CUSTOM: Product = {
  id: "demo-custom",
  name: "Oat milk",
  icon: "🌾",
  category: "dairy",
  custom: true,
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="mt-3xl">
    <p className="kicker">{title}</p>
    <div className="mt-md">{children}</div>
  </section>
);

const DesignPreview = () => {
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [resolved, setResolved] = useState<Record<string, string>>({});

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);

    const styles = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    for (const swatch of COLOR_SWATCHES) {
      next[swatch.token] = styles.getPropertyValue(swatch.token).trim();
    }
    setResolved(next);
  }, [dark]);

  const themeLabel = dark ? "Dark" : "Light";

  return (
    <div className="min-h-dvh bg-page">
      <div className="mx-auto w-full max-w-app bg-surface px-xl pt-3xl pb-3xl shadow-app">
        <header className="flex items-start justify-between gap-md">
          <div>
            <p className="kicker">Handla</p>
            <h1 className="mt-sm text-display font-bold tracking-tight text-ink">
              Design
            </h1>
            <p className="mt-sm text-body leading-snug text-muted">
              Live tokens from <code className="text-step">src/index.css</code>.
              Rules in <code className="text-step">docs/DESIGN.md</code>.
            </p>
          </div>
          <button
            type="button"
            className="btn-toolbar shrink-0 text-ink active:bg-line"
            aria-pressed={dark}
            aria-label={`Theme: ${themeLabel}. Switch to ${dark ? "Light" : "Dark"}`}
            onClick={() => setDark((value) => !value)}
          >
            {dark ? <MoonIcon /> : <SunIcon />}
          </button>
        </header>

        <Section title="Color">
          <ul className="divide-y divide-line">
            {COLOR_SWATCHES.map((swatch) => (
              <li key={swatch.token} className="flex items-center gap-md py-md">
                <span
                  className={`h-button-sm w-button-sm shrink-0 rounded-control border border-line ${swatch.fill}`}
                />
                <span className="min-w-0">
                  <span className="block truncate text-item font-medium text-ink">
                    {swatch.token}
                  </span>
                  <span className="block text-step text-muted">
                    {swatch.role}
                  </span>
                  <span className="block truncate text-step text-muted">
                    {resolved[swatch.token] || "…"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Type">
          <ul className="space-y-lg">
            {TYPE_SAMPLES.map((entry) => (
              <li key={entry.label}>
                <p className="text-step text-muted">{entry.label}</p>
                <p className={`mt-2xs ${entry.className}`}>{entry.sample}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Spacing">
          <ul className="space-y-sm">
            {SPACING_BARS.map((bar) => (
              <li key={bar.token} className="flex items-center gap-md">
                <span className="w-3xl text-step text-muted">{bar.token}</span>
                <span className={`h-sm bg-brand ${bar.className}`} />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-col gap-md">
            <button type="button" className="btn-primary btn-primary-shadow">
              Add 1 Item to Shopping List +
            </button>
            <button type="button" className="btn-primary btn-compact">
              Save
            </button>
            <button type="button" className="btn-danger">
              Clear Completed
            </button>
            <div className="flex gap-sm">
              <button
                type="button"
                aria-label="Add custom item"
                className="btn-toolbar bg-brand text-on-brand"
              >
                <PlusIcon />
              </button>
              <button
                type="button"
                aria-label="Install app"
                className="btn-toolbar bg-brand text-on-brand"
              >
                <DownloadIcon />
              </button>
              <button
                type="button"
                aria-label="Theme"
                className="btn-toolbar text-ink active:bg-line"
              >
                <DeviceIcon />
              </button>
            </div>
          </div>
        </Section>

        <Section title="Navigation">
          <div className="grid grid-cols-2 border-t border-b border-line">
            <div className="flex h-nav flex-col items-center justify-center gap-2xs">
              <span className="flex size-toolbar items-center justify-center rounded-control bg-brand-soft text-brand">
                <ChecklistIcon />
              </span>
              <span className="text-kicker font-semibold text-ink">
                Master List
              </span>
            </div>
            <div className="flex h-nav flex-col items-center justify-center gap-2xs">
              <span className="flex size-toolbar items-center justify-center rounded-control text-ink">
                <CartIcon />
              </span>
              <span className="text-kicker font-medium text-muted">
                Shopping List
              </span>
            </div>
          </div>
        </Section>

        <Section title="Rows">
          <ul className="-mx-xl">
            <li>
              <ProductRow
                product={DEMO_PRODUCT}
                selected={false}
                onToggle={noop}
              />
            </li>
            <li>
              <ProductRow product={DEMO_PRODUCT} selected onToggle={noop} />
            </li>
            <li>
              <ProductRow
                product={DEMO_CUSTOM}
                selected={false}
                onToggle={noop}
                onDelete={noop}
              />
            </li>
            <li>
              <ProductRow
                product={DEMO_PRODUCT}
                bought={false}
                onToggle={noop}
                onRemove={noop}
                onReorderPointerDown={noop}
              />
            </li>
            <li>
              <ProductRow
                product={DEMO_PRODUCT}
                bought
                onToggle={noop}
                onRemove={noop}
              />
            </li>
          </ul>
        </Section>

        <Section title="Empty state">
          <div className="flex flex-col items-center py-xl">
            <div className="flex size-empty-ring items-center justify-center rounded-pill bg-brand-soft">
              <EmptyCartIcon className="size-empty-icon text-ink" />
            </div>
            <h2 className="mt-3xl text-heading font-bold tracking-tight text-ink">
              List is Empty
            </h2>
            <p className="mt-sm max-w-empty-copy text-center text-body leading-snug text-muted">
              Inga varor ännu! Lägg till från listan.
            </p>
          </div>
        </Section>

        <Section title="Icons">
          <ul className="grid grid-cols-2 gap-md">
            {ICONS.map((icon) => (
              <li
                key={icon.name}
                className="flex items-center gap-md rounded-control border border-line px-md py-md text-ink"
              >
                <span className="flex size-toolbar items-center justify-center">
                  {icon.node}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-step font-medium">
                    {icon.name}
                  </span>
                  <span className="block truncate text-step text-muted">
                    {icon.note}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <DesignPreview />
  </StrictMode>,
);
