/// <reference types="bun" />
import { describe, expect, test } from "bun:test";

import {
  DEFAULT_THEME,
  loadPrefs,
  nextTheme,
  PREFS_STORAGE_KEY,
  persistPrefs,
} from "./prefs.ts";

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

describe("prefs", () => {
  test("returns empty prefs when nothing is stored", () => {
    expect(loadPrefs(createMemoryStorage())).toEqual({});
  });

  test("loads a valid theme preference", () => {
    const storage = createMemoryStorage({
      [PREFS_STORAGE_KEY]: JSON.stringify({ theme: "dark" }),
    });

    expect(loadPrefs(storage)).toEqual({ theme: "dark" });
  });

  test("ignores invalid theme values", () => {
    const storage = createMemoryStorage({
      [PREFS_STORAGE_KEY]: JSON.stringify({ theme: "midnight" }),
    });

    expect(loadPrefs(storage)).toEqual({});
  });

  test("ignores invalid JSON", () => {
    const storage = createMemoryStorage({
      [PREFS_STORAGE_KEY]: "{not-json",
    });

    expect(loadPrefs(storage)).toEqual({});
  });

  test("persists theme next to other prefs keys", () => {
    const storage = createMemoryStorage({
      [PREFS_STORAGE_KEY]: JSON.stringify({ locale: "sv" }),
    });

    persistPrefs({ theme: "light" }, storage);

    expect(JSON.parse(storage.getItem(PREFS_STORAGE_KEY) ?? "{}")).toEqual({
      locale: "sv",
      theme: "light",
    });
  });

  test("cycles light → dark → system", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("system");
    expect(nextTheme("system")).toBe("light");
    expect(nextTheme(DEFAULT_THEME)).toBe("light");
  });
});
