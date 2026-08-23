import { computed, signal } from "@preact/signals-react";

import {
  getProductById,
  isProductCategory,
  products,
  productsByCategory,
} from "../data/products.ts";
import type {
  Product,
  ProductCategory,
  ShoppingItem,
  TabId,
} from "../types.ts";
import { SHOPPING_LIST_STORAGE_KEY, userDb } from "./db.ts";

export const STORAGE_KEY = SHOPPING_LIST_STORAGE_KEY;
export const DEFAULT_CUSTOM_ICON = "🛒";

export const activeTab$ = signal<TabId>("master");
export const selectedIds$ = signal<string[]>([]);
export const shoppingItems$ = signal<ShoppingItem[]>([]);
export const customProducts$ = signal<Product[]>([]);

export const selectedCount$ = computed(() => selectedIds$.value.length);

export const catalog$ = computed(() => [...products, ...customProducts$.value]);

export const catalogByCategory$ = computed(() =>
  productsByCategory.map((category) => {
    const categoryProducts: Product[] = [
      ...category.products,
      ...customProducts$.value.filter(
        (product) => product.category === category.id,
      ),
    ];

    return {
      ...category,
      products: categoryProducts,
    };
  }),
);

export const resolveProduct = (productId: string): Product | undefined =>
  getProductById(productId) ??
  customProducts$.value.find((product) => product.id === productId);

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
    Boolean(resolveProduct(item.productId))
  );
};

const isCustomProduct = (value: unknown): value is Product => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const product = value as Record<string, unknown>;
  return (
    typeof product.id === "string" &&
    product.id.startsWith("custom-") &&
    typeof product.name === "string" &&
    product.name.trim().length > 0 &&
    typeof product.icon === "string" &&
    isProductCategory(product.category) &&
    product.custom === true
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

const commitShoppingItems = (items: ShoppingItem[]): void => {
  shoppingItems$.value = items;
  void userDb.putShoppingItems(items);
};

export const hydrateUserData = async (): Promise<void> => {
  const storedCustom = await userDb.getCustomProducts();
  customProducts$.value = storedCustom.filter(isCustomProduct);

  const storedShopping = await userDb.getShoppingItems();
  if (storedShopping === null) {
    const migrated = loadShoppingItems();
    shoppingItems$.value = migrated;
    const saved = await userDb.putShoppingItems(migrated);
    if (saved) {
      try {
        globalThis.localStorage?.removeItem(STORAGE_KEY);
      } catch {
        // Ignore missing storage.
      }
    }
    return;
  }

  shoppingItems$.value = storedShopping.filter(isShoppingItem);
};

export const resetStore = (): void => {
  activeTab$.value = "master";
  selectedIds$.value = [];
  shoppingItems$.value = [];
  customProducts$.value = [];
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

export const reorderShoppingItems = (
  fromIndex: number,
  toIndex: number,
): void => {
  const items = sortedShoppingItems$.value;
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) {
    return;
  }

  next.splice(toIndex, 0, moved);
  commitShoppingItems(next);
};

export const clearCompleted = (): void => {
  commitShoppingItems(shoppingItems$.value.filter((item) => !item.bought));
};

export type CustomProductInput = {
  readonly name: string;
  readonly icon: string;
  readonly category: ProductCategory;
};

export const addCustomProduct = (
  input: CustomProductInput,
): Product | undefined => {
  const name = input.name.trim();
  if (!name || !isProductCategory(input.category)) {
    return undefined;
  }

  const icon = input.icon.trim() || DEFAULT_CUSTOM_ICON;
  const product: Product = {
    id: `custom-${crypto.randomUUID()}`,
    name,
    icon,
    category: input.category,
    custom: true,
  };

  customProducts$.value = [...customProducts$.value, product];
  void userDb.putCustomProduct(product);
  return product;
};

export const removeCustomProduct = (productId: string): void => {
  if (!customProducts$.value.some((product) => product.id === productId)) {
    return;
  }

  customProducts$.value = customProducts$.value.filter(
    (product) => product.id !== productId,
  );
  selectedIds$.value = selectedIds$.value.filter((id) => id !== productId);

  if (shoppingItems$.value.some((item) => item.productId === productId)) {
    commitShoppingItems(
      shoppingItems$.value.filter((item) => item.productId !== productId),
    );
  }

  void userDb.deleteCustomProduct(productId);
};
