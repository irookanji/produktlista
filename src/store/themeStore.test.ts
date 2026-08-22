import { beforeEach, describe, expect, test } from "bun:test";

import { PREFS_STORAGE_KEY } from "./prefs.ts";
import {
  applyThemeClass,
  cycleTheme,
  hydrateTheme,
  resetTheme,
  resolveTheme,
  setTheme,
  theme$,
} from "./themeStore.ts";

const createMemoryStorage = (initial: Record<string, string> = {}): Storage => {
  const store = { ...initial };

  return {
    get length() {
      return Object.keys(store).length;
    },
    clear: () => {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    },
    getItem: (key: string) => store[key] ?? null,
    key: (index: number) => Object.keys(store)[index] ?? null,
    removeItem: (key: string) => {
      delete store[key];
    },
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
  };
};

beforeEach(() => {
  resetTheme();
  globalThis.localStorage = createMemoryStorage();
});

describe("themeStore", () => {
  test("resolves system theme from prefers-color-scheme", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
  });

  test("toggles the dark class on the root element", () => {
    const tokens = new Set<string>();
    const root = {
      classList: {
        toggle: (token: string, force?: boolean) => {
          if (force) {
            tokens.add(token);
          } else {
            tokens.delete(token);
          }
        },
      },
    };

    applyThemeClass("dark", root);
    expect(tokens.has("dark")).toBe(true);

    applyThemeClass("light", root);
    expect(tokens.has("dark")).toBe(false);
  });

  test("hydrates the stored theme preference", () => {
    globalThis.localStorage = createMemoryStorage({
      [PREFS_STORAGE_KEY]: JSON.stringify({ theme: "dark" }),
    });

    hydrateTheme();

    expect(theme$.value).toBe("dark");
  });

  test("defaults to system when nothing is stored", () => {
    hydrateTheme();

    expect(theme$.value).toBe("system");
  });

  test("persists theme changes", () => {
    setTheme("dark");

    expect(theme$.value).toBe("dark");
    expect(
      JSON.parse(globalThis.localStorage.getItem(PREFS_STORAGE_KEY) ?? "{}"),
    ).toEqual({ theme: "dark" });
  });

  test("cycles and persists the next theme", () => {
    cycleTheme();

    expect(theme$.value).toBe("light");
    expect(
      JSON.parse(globalThis.localStorage.getItem(PREFS_STORAGE_KEY) ?? "{}"),
    ).toEqual({ theme: "light" });
  });
});
