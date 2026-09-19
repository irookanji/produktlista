import { isProductCategory } from "../data/products.ts";
import type { HouseholdSnapshot, Product, ShoppingItem } from "../types.ts";

export const HOUSEHOLD_TOKEN_LENGTH = 16;
const HOUSEHOLD_TOKEN_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const HOUSEHOLD_TOKEN_PATTERN = /^[A-Za-z0-9]{16}$/;
const HOUSEHOLD_PATH_PREFIX = "/h/";
const HOUSEHOLD_API_PREFIX = "/api/household/";
export const HOUSEHOLD_POLL_MS = 2000;

export const isHouseholdToken = (value: unknown): value is string =>
  typeof value === "string" && HOUSEHOLD_TOKEN_PATTERN.test(value);

export const createHouseholdToken = (
  randomValues: (size: number) => Uint8Array = (size) =>
    crypto.getRandomValues(new Uint8Array(size)),
): string => {
  const bytes = randomValues(HOUSEHOLD_TOKEN_LENGTH);
  const alphabetSize = HOUSEHOLD_TOKEN_ALPHABET.length;
  let token = "";

  for (const byte of bytes) {
    token += HOUSEHOLD_TOKEN_ALPHABET[byte % alphabetSize];
  }

  return token;
};

export const parseHouseholdTokenFromPath = (
  pathname: string,
): string | null => {
  const match = pathname.match(/^\/h\/([A-Za-z0-9]{16})\/?$/);
  return match?.[1] ?? null;
};

export const householdSharePath = (token: string): string =>
  `${HOUSEHOLD_PATH_PREFIX}${token}`;

export const householdApiPath = (token: string): string =>
  `${HOUSEHOLD_API_PREFIX}${token}`;

const isShoppingItemShape = (value: unknown): value is ShoppingItem => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return typeof item.productId === "string" && typeof item.bought === "boolean";
};

const isCustomProductShape = (value: unknown): value is Product => {
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

export const isHouseholdSnapshot = (
  value: unknown,
): value is HouseholdSnapshot => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const snapshot = value as Record<string, unknown>;
  return (
    Array.isArray(snapshot.items) &&
    snapshot.items.every(isShoppingItemShape) &&
    Array.isArray(snapshot.customProducts) &&
    snapshot.customProducts.every(isCustomProductShape) &&
    typeof snapshot.updatedAt === "number" &&
    Number.isFinite(snapshot.updatedAt)
  );
};

export const mergeHouseholdSnapshots = (
  local: HouseholdSnapshot,
  remote: HouseholdSnapshot,
): HouseholdSnapshot => {
  const customProducts = new Map<string, Product>();
  for (const product of remote.customProducts) {
    customProducts.set(product.id, product);
  }
  for (const product of local.customProducts) {
    if (!customProducts.has(product.id)) {
      customProducts.set(product.id, product);
    }
  }

  const items = new Map<string, ShoppingItem>();
  for (const item of remote.items) {
    items.set(item.productId, item);
  }
  for (const item of local.items) {
    const existing = items.get(item.productId);
    if (!existing) {
      items.set(item.productId, item);
      continue;
    }

    if (item.bought && !existing.bought) {
      items.set(item.productId, { ...existing, bought: true });
    }
  }

  return {
    customProducts: [...customProducts.values()],
    items: [...items.values()],
    updatedAt: Math.max(local.updatedAt, remote.updatedAt, Date.now()),
  };
};
