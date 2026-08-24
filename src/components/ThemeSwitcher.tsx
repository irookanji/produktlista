import { useSignals } from "@preact/signals-react/runtime";
import type { ReactNode } from "react";

import { DeviceIcon, MoonIcon, SunIcon } from "../icons.tsx";
import { nextTheme } from "../store/prefs.ts";
import { cycleTheme, theme$ } from "../store/themeStore.ts";
import type { ThemePreference } from "../types.ts";

const THEME_LABELS: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
  system: "Device",
};

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
      className="btn-toolbar text-ink active:bg-line"
      onClick={cycleTheme}
    >
      {THEME_ICONS[theme]}
    </button>
  );
};
