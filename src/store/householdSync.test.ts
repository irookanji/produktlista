/// <reference types="bun" />
import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import type { HouseholdSnapshot, Product, ShoppingItem } from "../types.ts";
import { userDb } from "./db.ts";
import {
  addSelectedToShoppingList,
  householdToken$,
  resetStore,
  shoppingItems$,
  toggleSelected,
} from "./groceryStore.ts";
import { parseHouseholdTokenFromPath } from "./household.ts";
import { householdApi } from "./householdApi.ts";
import {
  hydrateHousehold,
  shareHousehold,
  waitForHouseholdPushes,
} from "./householdSync.ts";

const createMemoryStorage = (): Storage => {
  const store: Record<string, string> = {};

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

const memory: {
  customProducts: Product[];
  shoppingItems: ShoppingItem[] | null;
  householdToken: string | null;
} = {
  customProducts: [],
  shoppingItems: null,
  householdToken: null,
};

const blobs = new Map<string, HouseholdSnapshot>();
const originalGet = householdApi.get;
const originalPut = householdApi.put;
let copiedText = "";

const installMemoryDb = (): void => {
  memory.customProducts = [];
  memory.shoppingItems = null;
  memory.householdToken = null;

  userDb.getCustomProducts = async () => [...memory.customProducts];
  userDb.putCustomProduct = async (product) => {
    memory.customProducts = [
      ...memory.customProducts.filter((entry) => entry.id !== product.id),
      product,
    ];
    return true;
  };
  userDb.deleteCustomProduct = async (id) => {
    memory.customProducts = memory.customProducts.filter(
      (entry) => entry.id !== id,
    );
    return true;
  };
  userDb.replaceCustomProducts = async (products) => {
    memory.customProducts = [...products];
    return true;
  };
  userDb.getShoppingItems = async () => memory.shoppingItems;
  userDb.putShoppingItems = async (items) => {
    memory.shoppingItems = items;
    return true;
  };
  userDb.getHouseholdToken = async () => memory.householdToken;
  userDb.setHouseholdToken = async (token) => {
    memory.householdToken = token;
    return true;
  };
};

beforeEach(() => {
  resetStore();
  blobs.clear();
  copiedText = "";
  globalThis.localStorage = createMemoryStorage();
  installMemoryDb();

  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: {
      origin: "http://localhost:5173",
      pathname: "/",
    },
  });

  Object.defineProperty(globalThis.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (text: string) => {
        copiedText = text;
      },
    },
  });

  householdApi.get = async (token) => {
    const snapshot = blobs.get(token);
    return snapshot ? { ok: true, snapshot } : { ok: true, snapshot: null };
  };
  householdApi.put = async (token, snapshot) => {
    blobs.set(token, snapshot);
    return { ok: true, snapshot };
  };
});

afterEach(() => {
  resetStore();
  householdApi.get = originalGet;
  householdApi.put = originalPut;
});

describe("householdSync", () => {
  test("share reuses the same link after the first tap", async () => {
    toggleSelected("milk");
    addSelectedToShoppingList();

    const first = await shareHousehold();
    const second = await shareHousehold();

    if (!first) {
      throw new Error("Expected share URL");
    }

    expect(second).toBe(first);
    expect(copiedText).toBe(first);
    expect(blobs.size).toBe(1);

    const token = parseHouseholdTokenFromPath(new URL(first).pathname);
    expect(token).toBe(householdToken$.value);
    expect(blobs.get(token ?? "")?.items).toEqual([
      { productId: "milk", bought: false },
    ]);
  });

  test("opening a share link loads the same shopping list", async () => {
    toggleSelected("milk");
    toggleSelected("bread");
    addSelectedToShoppingList();

    const url = await shareHousehold();
    const token = parseHouseholdTokenFromPath(new URL(url ?? "").pathname);
    if (!token) {
      throw new Error("Expected share token");
    }

    resetStore();
    memory.customProducts = [];
    memory.shoppingItems = [];
    memory.householdToken = null;

    await hydrateHousehold(`/h/${token}`);

    expect(householdToken$.value).toBe(token);
    expect(shoppingItems$.value).toEqual([
      { productId: "milk", bought: false },
      { productId: "bread", bought: false },
    ]);
  });

  test("does not join a missing share link", async () => {
    await hydrateHousehold("/h/k7Qm2nP9xL4cR8w2");

    expect(householdToken$.value).toBeNull();
    expect(shoppingItems$.value).toEqual([]);
  });

  test("falls back to the stored household when the URL token is missing", async () => {
    toggleSelected("milk");
    addSelectedToShoppingList();

    const url = await shareHousehold();
    const storedToken = parseHouseholdTokenFromPath(
      new URL(url ?? "").pathname,
    );
    if (!storedToken) {
      throw new Error("Expected share token");
    }

    await hydrateHousehold("/h/AAAAAAAAAAAAAAAA");

    expect(householdToken$.value).toBe(storedToken);
    expect(shoppingItems$.value).toEqual([
      { productId: "milk", bought: false },
    ]);
  });

  test("a failed push still allows a newer remote snapshot to apply", async () => {
    let now = 1_000;
    const realNow = Date.now;
    Date.now = () => now;

    try {
      toggleSelected("milk");
      addSelectedToShoppingList();
      const url = await shareHousehold();
      const token = parseHouseholdTokenFromPath(new URL(url ?? "").pathname);
      if (!token) {
        throw new Error("Expected share token");
      }

      householdApi.put = async () => ({ ok: false });
      now = 2_000;
      toggleSelected("bread");
      addSelectedToShoppingList();
      await waitForHouseholdPushes();

      householdApi.put = async (nextToken, snapshot) => {
        blobs.set(nextToken, snapshot);
        return { ok: true, snapshot };
      };
      blobs.set(token, {
        items: [{ productId: "eggs", bought: false }],
        customProducts: [],
        updatedAt: 1_500,
      });

      await hydrateHousehold("/");

      expect(shoppingItems$.value).toEqual([
        { productId: "eggs", bought: false },
      ]);
    } finally {
      Date.now = realNow;
    }
  });
});
