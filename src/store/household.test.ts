/// <reference types="bun" />
import { describe, expect, test } from "bun:test";

import {
  createHouseholdToken,
  HOUSEHOLD_TOKEN_LENGTH,
  isHouseholdSnapshot,
  mergeHouseholdSnapshots,
  parseHouseholdTokenFromPath,
} from "./household.ts";

describe("household", () => {
  test("creates a 16-character alphanumeric token", () => {
    const token = createHouseholdToken();

    expect(token).toHaveLength(HOUSEHOLD_TOKEN_LENGTH);
    expect(token).toMatch(/^[A-Za-z0-9]{16}$/);
  });

  test("parses a household token from a share path", () => {
    expect(parseHouseholdTokenFromPath("/h/k7Qm2nP9xL4cR8w2")).toBe(
      "k7Qm2nP9xL4cR8w2",
    );
    expect(parseHouseholdTokenFromPath("/h/k7Qm2nP9xL4cR8w2/")).toBe(
      "k7Qm2nP9xL4cR8w2",
    );
    expect(parseHouseholdTokenFromPath("/h/short")).toBeNull();
    expect(parseHouseholdTokenFromPath("/")).toBeNull();
  });

  test("rejects an invalid snapshot", () => {
    expect(isHouseholdSnapshot({ items: [], customProducts: [] })).toBe(false);
    expect(
      isHouseholdSnapshot({
        items: [{ productId: "milk", bought: false }],
        customProducts: [],
        updatedAt: 1,
      }),
    ).toBe(true);
  });

  test("merges local extras into the remote household", () => {
    const merged = mergeHouseholdSnapshots(
      {
        items: [
          { productId: "bread", bought: true },
          { productId: "eggs", bought: false },
        ],
        customProducts: [
          {
            id: "custom-halloumi",
            name: "Halloumi",
            icon: "🧀",
            category: "dairy",
            custom: true,
          },
        ],
        updatedAt: 10,
      },
      {
        items: [{ productId: "bread", bought: false }],
        customProducts: [],
        updatedAt: 20,
      },
    );

    expect(merged.items).toEqual([
      { productId: "bread", bought: true },
      { productId: "eggs", bought: false },
    ]);
    expect(merged.customProducts).toEqual([
      {
        id: "custom-halloumi",
        name: "Halloumi",
        icon: "🧀",
        category: "dairy",
        custom: true,
      },
    ]);
    expect(merged.updatedAt).toBeGreaterThanOrEqual(20);
  });
});
