/// <reference types="bun" />
import { beforeEach, describe, expect, test } from "bun:test";

import {
  addSelectedToShoppingList,
  clearCompleted,
  hydrateShoppingList,
  loadShoppingItems,
  persistShoppingItems,
  removeShoppingItem,
  reorderShoppingItems,
  resetStore,
  STORAGE_KEY,
  selectedIds$,
  shoppingItems$,
  sortedShoppingItems$,
  toggleBought,
  toggleSelected,
} from "./groceryStore.ts";

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
  resetStore();
  globalThis.localStorage = createMemoryStorage();
});

describe("groceryStore", () => {
  test("adds selected items to the shopping list without duplicates", () => {
    toggleSelected("bread");
    toggleSelected("milk");
    addSelectedToShoppingList();

    expect(shoppingItems$.value).toEqual([
      { productId: "bread", bought: false },
      { productId: "milk", bought: false },
    ]);
    expect(selectedIds$.value).toEqual([]);

    toggleSelected("bread");
    toggleSelected("eggs");
    addSelectedToShoppingList();

    expect(shoppingItems$.value).toEqual([
      { productId: "bread", bought: false },
      { productId: "milk", bought: false },
      { productId: "eggs", bought: false },
    ]);
  });

  test("unchecks a bought shopping item", () => {
    toggleSelected("bread");
    addSelectedToShoppingList();

    toggleBought("bread");
    expect(shoppingItems$.value).toEqual([
      { productId: "bread", bought: true },
    ]);

    toggleBought("bread");
    expect(shoppingItems$.value).toEqual([
      { productId: "bread", bought: false },
    ]);
  });

  test("moves bought items to the bottom of the list", () => {
    toggleSelected("bread");
    toggleSelected("milk");
    toggleSelected("eggs");
    addSelectedToShoppingList();

    toggleBought("bread");

    expect(sortedShoppingItems$.value.map((item) => item.productId)).toEqual([
      "milk",
      "eggs",
      "bread",
    ]);
    expect(
      sortedShoppingItems$.value.find((item) => item.productId === "bread")
        ?.bought,
    ).toBe(true);
  });

  test("reorders items and persists the new order", () => {
    toggleSelected("bread");
    toggleSelected("milk");
    toggleSelected("eggs");
    addSelectedToShoppingList();

    reorderShoppingItems(0, 2);

    expect(shoppingItems$.value.map((item) => item.productId)).toEqual([
      "milk",
      "eggs",
      "bread",
    ]);
    expect(
      JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY) ?? "[]"),
    ).toEqual([
      { productId: "milk", bought: false },
      { productId: "eggs", bought: false },
      { productId: "bread", bought: false },
    ]);
  });

  test("reorders remaining items without mixing bought items", () => {
    toggleSelected("bread");
    toggleSelected("milk");
    toggleSelected("eggs");
    addSelectedToShoppingList();
    toggleBought("bread");

    reorderShoppingItems(0, 1);

    expect(sortedShoppingItems$.value.map((item) => item.productId)).toEqual([
      "eggs",
      "milk",
      "bread",
    ]);
    expect(
      sortedShoppingItems$.value.find((item) => item.productId === "bread")
        ?.bought,
    ).toBe(true);
  });

  test("ignores out-of-range reorder indices", () => {
    toggleSelected("bread");
    toggleSelected("milk");
    addSelectedToShoppingList();

    const original = shoppingItems$.value;
    reorderShoppingItems(-1, 0);
    reorderShoppingItems(0, 9);
    reorderShoppingItems(0, 0);

    expect(shoppingItems$.value).toEqual(original);
  });

  test("removes a single shopping item", () => {
    toggleSelected("bread");
    toggleSelected("milk");
    addSelectedToShoppingList();

    removeShoppingItem("bread");

    expect(shoppingItems$.value).toEqual([
      { productId: "milk", bought: false },
    ]);
  });

  test("clears completed items", () => {
    toggleSelected("bread");
    toggleSelected("milk");
    addSelectedToShoppingList();
    toggleBought("milk");

    clearCompleted();

    expect(shoppingItems$.value).toEqual([
      { productId: "bread", bought: false },
    ]);
  });

  test("persists and hydrates the shopping list", () => {
    const storage = createMemoryStorage();
    persistShoppingItems(
      [
        { productId: "bread", bought: false },
        { productId: "milk", bought: true },
      ],
      storage,
    );

    expect(storage.getItem(STORAGE_KEY)).toContain("bread");
    expect(loadShoppingItems(storage)).toEqual([
      { productId: "bread", bought: false },
      { productId: "milk", bought: true },
    ]);

    globalThis.localStorage = storage;
    hydrateShoppingList();

    expect(shoppingItems$.value).toEqual([
      { productId: "bread", bought: false },
      { productId: "milk", bought: true },
    ]);
  });

  test("ignores invalid persisted data", () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify([{ productId: "unknown", bought: true }]),
    });

    expect(loadShoppingItems(storage)).toEqual([]);
  });
});
