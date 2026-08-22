import type { ThemePreference } from "../types.ts";

/** Keep in sync with the blocking script in `index.html`. */
export const PREFS_STORAGE_KEY = "grocery-prefs";

export type Prefs = {
  readonly theme?: ThemePreference;
};

export const DEFAULT_THEME: ThemePreference = "system";

const THEME_ORDER: readonly ThemePreference[] = ["light", "dark", "system"];

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

const parsePrefsRecord = (raw: string | null): Record<string, unknown> => {
  if (!raw) {
    return {};
  }

  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {};
  }

  return parsed as Record<string, unknown>;
};

export const loadPrefs = (
  storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage,
): Prefs => {
  try {
    const record = parsePrefsRecord(
      storage?.getItem(PREFS_STORAGE_KEY) ?? null,
    );

    if (isThemePreference(record.theme)) {
      return { theme: record.theme };
    }

    return {};
  } catch {
    return {};
  }
};

export const persistPrefs = (
  patch: Prefs,
  storage:
    | Pick<Storage, "getItem" | "setItem">
    | undefined = globalThis.localStorage,
): void => {
  try {
    const record = parsePrefsRecord(
      storage?.getItem(PREFS_STORAGE_KEY) ?? null,
    );
    storage?.setItem(
      PREFS_STORAGE_KEY,
      JSON.stringify({ ...record, ...patch }),
    );
  } catch {
    // Ignore missing storage or quota errors.
  }
};

export const nextTheme = (current: ThemePreference): ThemePreference => {
  const index = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(index + 1) % THEME_ORDER.length] ?? DEFAULT_THEME;
};
