import { type DBSchema, type IDBPDatabase, openDB } from "idb";

import type { Product, ShoppingItem } from "../types.ts";

export const SHOPPING_LIST_STORAGE_KEY = "grocery-shopping-list";
const HOUSEHOLD_TOKEN_STORAGE_KEY = "handla-household-token";

const DB_NAME = "handla";
const DB_VERSION = 2;
const CUSTOM_PRODUCTS_STORE = "customProducts";
const SHOPPING_LIST_STORE = "shoppingList";
const META_STORE = "meta";
const SHOPPING_LIST_KEY = "items";
const HOUSEHOLD_TOKEN_KEY = "householdToken";

type ProductId = Product["id"];

type Store<K extends IDBValidKey, V> = {
  key: K;
  value: V;
};

interface HandlaDB extends DBSchema {
  customProducts: Store<ProductId, Product>;
  shoppingList: Store<typeof SHOPPING_LIST_KEY, ShoppingItem[]>;
  meta: Store<string, string>;
}

let dbPromise: Promise<IDBPDatabase<HandlaDB> | null> | undefined;
let writeChain = Promise.resolve();

const enqueueWrite = (write: () => Promise<void>): Promise<void> => {
  const run = writeChain.then(write, write);
  writeChain = run.catch(() => undefined);
  return run;
};

const isIndexedDbAvailable = (): boolean => {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
};

const getDb = async (): Promise<IDBPDatabase<HandlaDB> | null> => {
  if (!isIndexedDbAvailable()) {
    return null;
  }

  if (!dbPromise) {
    dbPromise = openDB<HandlaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CUSTOM_PRODUCTS_STORE)) {
          db.createObjectStore(CUSTOM_PRODUCTS_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(SHOPPING_LIST_STORE)) {
          db.createObjectStore(SHOPPING_LIST_STORE);
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE);
        }
      },
    })
      .then((db) => {
        db.addEventListener("close", () => {
          dbPromise = undefined;
        });
        return db;
      })
      .catch(() => {
        dbPromise = undefined;
        return null;
      });
  }

  return dbPromise;
};

let memoryCustomProducts: Product[] = [];

const readFallbackShoppingItems = (): ShoppingItem[] => {
  try {
    const raw = globalThis.localStorage?.getItem(SHOPPING_LIST_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ShoppingItem[]) : [];
  } catch {
    return [];
  }
};

const writeFallbackShoppingItems = (items: ShoppingItem[]): void => {
  try {
    globalThis.localStorage?.setItem(
      SHOPPING_LIST_STORAGE_KEY,
      JSON.stringify(items),
    );
  } catch {
    // Ignore missing storage or quota errors.
  }
};

const getCustomProducts = async (): Promise<Product[]> => {
  const db = await getDb();
  if (!db) {
    return [...memoryCustomProducts];
  }

  try {
    return await db.getAll(CUSTOM_PRODUCTS_STORE);
  } catch {
    return [...memoryCustomProducts];
  }
};

const putCustomProduct = async (product: Product): Promise<boolean> => {
  try {
    await enqueueWrite(async () => {
      const db = await getDb();
      if (!db) {
        memoryCustomProducts = [
          ...memoryCustomProducts.filter((entry) => entry.id !== product.id),
          product,
        ];
        return;
      }

      await db.put(CUSTOM_PRODUCTS_STORE, product);
    });
    return true;
  } catch {
    return false;
  }
};

const deleteCustomProduct = async (id: string): Promise<boolean> => {
  try {
    await enqueueWrite(async () => {
      const db = await getDb();
      if (!db) {
        memoryCustomProducts = memoryCustomProducts.filter(
          (entry) => entry.id !== id,
        );
        return;
      }

      await db.delete(CUSTOM_PRODUCTS_STORE, id);
    });
    return true;
  } catch {
    return false;
  }
};

const getShoppingItems = async (): Promise<ShoppingItem[] | null> => {
  const db = await getDb();
  if (!db) {
    return readFallbackShoppingItems();
  }

  try {
    const stored = await db.get(SHOPPING_LIST_STORE, SHOPPING_LIST_KEY);
    return stored === undefined ? null : stored;
  } catch {
    return readFallbackShoppingItems();
  }
};

const putShoppingItems = async (items: ShoppingItem[]): Promise<boolean> => {
  try {
    await enqueueWrite(async () => {
      const db = await getDb();
      if (!db) {
        writeFallbackShoppingItems(items);
        return;
      }

      await db.put(SHOPPING_LIST_STORE, items, SHOPPING_LIST_KEY);
    });
    return true;
  } catch {
    return false;
  }
};

const replaceCustomProducts = async (products: Product[]): Promise<boolean> => {
  try {
    await enqueueWrite(async () => {
      const db = await getDb();
      if (!db) {
        memoryCustomProducts = [...products];
        return;
      }

      const tx = db.transaction(CUSTOM_PRODUCTS_STORE, "readwrite");
      await tx.store.clear();
      await Promise.all(products.map((product) => tx.store.put(product)));
      await tx.done;
    });
    return true;
  } catch {
    return false;
  }
};

const readFallbackHouseholdToken = (): string | null => {
  try {
    return (
      globalThis.localStorage?.getItem(HOUSEHOLD_TOKEN_STORAGE_KEY) ?? null
    );
  } catch {
    return null;
  }
};

const writeFallbackHouseholdToken = (token: string | null): void => {
  try {
    if (token) {
      globalThis.localStorage?.setItem(HOUSEHOLD_TOKEN_STORAGE_KEY, token);
      return;
    }

    globalThis.localStorage?.removeItem(HOUSEHOLD_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore missing storage or quota errors.
  }
};

let memoryHouseholdToken: string | null = null;

const getHouseholdToken = async (): Promise<string | null> => {
  const db = await getDb();
  if (!db) {
    return memoryHouseholdToken ?? readFallbackHouseholdToken();
  }

  try {
    const stored = await db.get(META_STORE, HOUSEHOLD_TOKEN_KEY);
    return stored ?? null;
  } catch {
    return memoryHouseholdToken ?? readFallbackHouseholdToken();
  }
};

const setHouseholdToken = async (token: string | null): Promise<boolean> => {
  try {
    await enqueueWrite(async () => {
      const db = await getDb();
      if (!db) {
        memoryHouseholdToken = token;
        writeFallbackHouseholdToken(token);
        return;
      }

      if (token) {
        await db.put(META_STORE, token, HOUSEHOLD_TOKEN_KEY);
        return;
      }

      await db.delete(META_STORE, HOUSEHOLD_TOKEN_KEY);
    });
    return true;
  } catch {
    return false;
  }
};

type UserDb = {
  getCustomProducts: () => Promise<Product[]>;
  putCustomProduct: (product: Product) => Promise<boolean>;
  deleteCustomProduct: (id: string) => Promise<boolean>;
  replaceCustomProducts: (products: Product[]) => Promise<boolean>;
  getShoppingItems: () => Promise<ShoppingItem[] | null>;
  putShoppingItems: (items: ShoppingItem[]) => Promise<boolean>;
  getHouseholdToken: () => Promise<string | null>;
  setHouseholdToken: (token: string | null) => Promise<boolean>;
};

export const userDb: UserDb = {
  getCustomProducts,
  putCustomProduct,
  deleteCustomProduct,
  replaceCustomProducts,
  getShoppingItems,
  putShoppingItems,
  getHouseholdToken,
  setHouseholdToken,
};
