import { useSignals } from "@preact/signals-react/runtime";
import type { ReactNode } from "react";

import { nextTheme } from "../store/prefs.ts";
import { cycleTheme, theme$ } from "../store/themeStore.ts";
import type { ThemePreference } from "../types.ts";

const THEME_LABELS: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
  system: "Device",
};

const SunIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
    <path
      d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const DeviceIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
    <rect
      x="7"
      y="3"
      width="10"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M10 18h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const THEME_ICONS: Record<ThemePreference, ReactNode> = {
  light: <SunIcon />,
  dark: <MoonIcon />,
  system: <DeviceIcon />,
};

export const ThemeSwitcher = () => {
  useSignals();

  const theme = theme$.value;
  const next = nextTheme(theme);

  return (
    <button
      type="button"
      title={THEME_LABELS[theme]}
      aria-label={`Theme: ${THEME_LABELS[theme]}. Switch to ${THEME_LABELS[next]}`}
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink active:bg-line"
      onClick={cycleTheme}
    >
      {THEME_ICONS[theme]}
    </button>
  );
};
