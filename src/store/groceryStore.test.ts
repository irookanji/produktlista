/// <reference types="bun" />
import { beforeEach, describe, expect, test } from "bun:test";

import type { Product, ShoppingItem } from "../types.ts";
import { userDb } from "./db.ts";
import {
  addCustomProduct,
  addSelectedToShoppingList,
  catalog$,
  catalogByCategory$,
  clearCompleted,
  customProducts$,
  DEFAULT_CUSTOM_ICON,
  hydrateUserData,
  loadShoppingItems,
  removeCustomProduct,
  removeShoppingItem,
  reorderShoppingItems,
  resetStore,
  resolveProduct,
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

const memory: {
  customProducts: Product[];
  shoppingItems: ShoppingItem[] | null;
} = {
  customProducts: [],
  shoppingItems: null,
};

const installMemoryDb = (): void => {
  memory.customProducts = [];
  memory.shoppingItems = null;

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
  userDb.getShoppingItems = async () => memory.shoppingItems;
  userDb.putShoppingItems = async (items) => {
    memory.shoppingItems = items;
    return true;
  };
};

beforeEach(() => {
  resetStore();
  globalThis.localStorage = createMemoryStorage();
  installMemoryDb();
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
    expect(memory.shoppingItems).toEqual([
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

  test("persists and hydrates the shopping list from IndexedDB", async () => {
    memory.shoppingItems = [
      { productId: "bread", bought: false },
      { productId: "milk", bought: true },
    ];

    await hydrateUserData();

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

  test("migrates the shopping list from localStorage once", async () => {
    globalThis.localStorage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify([
        { productId: "bread", bought: false },
        { productId: "milk", bought: true },
      ]),
    });

    await hydrateUserData();

    const migrated: ShoppingItem[] = [
      { productId: "bread", bought: false },
      { productId: "milk", bought: true },
    ];
    expect(shoppingItems$.value).toEqual(migrated);
    expect(memory.shoppingItems).toEqual(migrated);
    expect(globalThis.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test("does not migrate localStorage when IndexedDB already has a list", async () => {
    globalThis.localStorage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify([{ productId: "milk", bought: false }]),
    });
    memory.shoppingItems = [{ productId: "bread", bought: false }];

    await hydrateUserData();

    expect(shoppingItems$.value).toEqual([
      { productId: "bread", bought: false },
    ]);
    expect(globalThis.localStorage.getItem(STORAGE_KEY)).toContain("milk");
  });

  test("adds a custom product to the catalog and persists it", () => {
    const product = addCustomProduct({
      name: "  Halloumi  ",
      icon: "🧀",
      category: "dairy",
    });
    if (!product) {
      throw new Error("Expected custom product");
    }

    expect(product).toEqual({
      id: product.id,
      name: "Halloumi",
      icon: "🧀",
      category: "dairy",
      custom: true,
    });
    expect(product.id.startsWith("custom-")).toBe(true);
    expect(customProducts$.value).toEqual([product]);
    expect(catalog$.value).toContainEqual(product);
    expect(
      catalogByCategory$.value
        .find((category) => category.id === "dairy")
        ?.products.some((entry) => entry.id === product.id),
    ).toBe(true);
    expect(memory.customProducts).toEqual([product]);
  });

  test("uses a default emoji when the icon is blank", () => {
    const product = addCustomProduct({
      name: "Oat milk",
      icon: "  ",
      category: "dairy",
    });

    expect(product?.icon).toBe(DEFAULT_CUSTOM_ICON);
  });

  test("does not add a custom product without a name", () => {
    expect(
      addCustomProduct({ name: "   ", icon: "🧀", category: "dairy" }),
    ).toBeUndefined();
    expect(customProducts$.value).toEqual([]);
    expect(memory.customProducts).toEqual([]);
  });

  test("removes a custom product from the catalog, selection, and shopping list", () => {
    const product = addCustomProduct({
      name: "Halloumi",
      icon: "🧀",
      category: "dairy",
    });
    if (!product) {
      throw new Error("Expected custom product");
    }

    toggleSelected(product.id);
    addSelectedToShoppingList();
    toggleSelected(product.id);

    removeCustomProduct(product.id);

    expect(customProducts$.value).toEqual([]);
    expect(selectedIds$.value).toEqual([]);
    expect(shoppingItems$.value).toEqual([]);
    expect(memory.customProducts).toEqual([]);
    expect(memory.shoppingItems).toEqual([]);
    expect(resolveProduct(product.id)).toBeUndefined();
  });

  test("hydrates custom products before resolving shopping list ids", async () => {
    const custom: Product = {
      id: "custom-halloumi",
      name: "Halloumi",
      icon: "🧀",
      category: "dairy",
      custom: true,
    };
    memory.customProducts = [custom];
    memory.shoppingItems = [{ productId: "custom-halloumi", bought: false }];

    await hydrateUserData();

    expect(customProducts$.value).toEqual([custom]);
    expect(resolveProduct("custom-halloumi")).toEqual(custom);
    expect(shoppingItems$.value).toEqual([
      { productId: "custom-halloumi", bought: false },
    ]);
  });

  test("drops invalid custom products on hydrate", async () => {
    memory.customProducts = [
      {
        id: "bread",
        name: "Fake",
        icon: "x",
        category: "dairy",
        custom: true,
      },
    ];

    await hydrateUserData();

    expect(customProducts$.value).toEqual([]);
  });
});
