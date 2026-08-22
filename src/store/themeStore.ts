import { signal } from "@preact/signals-react";

import type { ThemePreference } from "../types.ts";
import { DEFAULT_THEME, loadPrefs, nextTheme, persistPrefs } from "./prefs.ts";

export const theme$ = signal<ThemePreference>(DEFAULT_THEME);

const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

let systemThemeMedia: MediaQueryList | undefined;

export const resolveTheme = (
  preference: ThemePreference,
  prefersDark: boolean,
): "light" | "dark" => {
  if (preference === "system") {
    return prefersDark ? "dark" : "light";
  }

  return preference;
};

const prefersDarkScheme = (
  media: Pick<MediaQueryList, "matches"> | undefined = globalThis.matchMedia?.(
    SYSTEM_DARK_QUERY,
  ),
): boolean => Boolean(media?.matches);

type ThemeRoot = {
  readonly classList: {
    toggle: (token: string, force?: boolean) => void;
  };
};

export const applyThemeClass = (
  resolved: "light" | "dark",
  root: ThemeRoot | null | undefined = globalThis.document?.documentElement,
): void => {
  root?.classList.toggle("dark", resolved === "dark");
};

const applyFromPreference = (preference: ThemePreference): void => {
  applyThemeClass(resolveTheme(preference, prefersDarkScheme()));
};

const handleSystemThemeChange = (): void => {
  if (theme$.value === "system") {
    applyFromPreference("system");
  }
};

const commitTheme = (theme: ThemePreference): void => {
  theme$.value = theme;
  persistPrefs({ theme });
  applyFromPreference(theme);
};

export const setTheme = (theme: ThemePreference): void => {
  commitTheme(theme);
};

export const cycleTheme = (): void => {
  commitTheme(nextTheme(theme$.value));
};

export const hydrateTheme = (): void => {
  const stored = loadPrefs().theme ?? DEFAULT_THEME;
  theme$.value = stored;
  applyFromPreference(stored);

  systemThemeMedia?.removeEventListener("change", handleSystemThemeChange);
  systemThemeMedia = globalThis.matchMedia?.(SYSTEM_DARK_QUERY);
  systemThemeMedia?.addEventListener("change", handleSystemThemeChange);
};

export const resetTheme = (): void => {
  systemThemeMedia?.removeEventListener("change", handleSystemThemeChange);
  systemThemeMedia = undefined;
  theme$.value = DEFAULT_THEME;
  applyThemeClass("light");
};
