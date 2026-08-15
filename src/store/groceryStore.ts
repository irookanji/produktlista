import { computed, signal } from "@preact/signals-react";

import { getProductById } from "../data/products.ts";
import type { ShoppingItem, TabId } from "../types.ts";

export const STORAGE_KEY = "grocery-shopping-list";

export const activeTab$ = signal<TabId>("master");
export const selectedIds$ = signal<string[]>([]);
export const shoppingItems$ = signal<ShoppingItem[]>([]);

export const selectedCount$ = computed(() => selectedIds$.value.length);

export const sortedShoppingItems$ = computed(() => {
  const items = shoppingItems$.value;
  return [
    ...items.filter((item) => !item.bought),
    ...items.filter((item) => item.bought),
  ];
});

export const hasBoughtItems$ = computed(() =>
  shoppingItems$.value.some((item) => item.bought),
);

const isShoppingItem = (value: unknown): value is ShoppingItem => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    typeof item.bought === "boolean" &&
    Boolean(getProductById(item.productId))
  );
};

export const loadShoppingItems = (
  storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage,
): ShoppingItem[] => {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isShoppingItem);
  } catch {
    return [];
  }
};

export const persistShoppingItems = (
  items: ShoppingItem[],
  storage: Pick<Storage, "setItem"> | undefined = globalThis.localStorage,
): void => {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore missing storage or quota errors.
  }
};

const commitShoppingItems = (items: ShoppingItem[]): void => {
  shoppingItems$.value = items;
  persistShoppingItems(items);
};

export const hydrateShoppingList = (): void => {
  shoppingItems$.value = loadShoppingItems();
};

export const resetStore = (): void => {
  activeTab$.value = "master";
  selectedIds$.value = [];
  shoppingItems$.value = [];
};

export const setActiveTab = (tab: TabId): void => {
  activeTab$.value = tab;
};

export const toggleSelected = (productId: string): void => {
  const current = selectedIds$.value;
  selectedIds$.value = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId];
};

export const addSelectedToShoppingList = (): void => {
  const selectedIds = selectedIds$.value;
  if (selectedIds.length === 0) {
    return;
  }

  const existing = new Set(shoppingItems$.value.map((item) => item.productId));
  const additions = selectedIds
    .filter((id) => !existing.has(id))
    .map((id) => ({ productId: id, bought: false }));

  commitShoppingItems([...shoppingItems$.value, ...additions]);
  selectedIds$.value = [];
  activeTab$.value = "shopping";
};

export const toggleBought = (productId: string): void => {
  commitShoppingItems(
    shoppingItems$.value.map((item) =>
      item.productId === productId ? { ...item, bought: !item.bought } : item,
    ),
  );
};

export const removeShoppingItem = (productId: string): void => {
  commitShoppingItems(
    shoppingItems$.value.filter((item) => item.productId !== productId),
  );
};

export const clearCompleted = (): void => {
  commitShoppingItems(shoppingItems$.value.filter((item) => !item.bought));
};
