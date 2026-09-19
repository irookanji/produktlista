import type { HouseholdSnapshot } from "../types.ts";
import {
  householdApiPath,
  isHouseholdSnapshot,
  isHouseholdToken,
} from "./household.ts";

type HouseholdGetResult =
  | { readonly ok: true; readonly snapshot: HouseholdSnapshot }
  | { readonly ok: true; readonly snapshot: null }
  | { readonly ok: false };

type HouseholdPutResult =
  | { readonly ok: true; readonly snapshot: HouseholdSnapshot }
  | { readonly ok: false };

const readSnapshot = async (
  response: Response,
): Promise<HouseholdSnapshot | null> => {
  try {
    const parsed: unknown = await response.json();
    return isHouseholdSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const getHousehold = async (token: string): Promise<HouseholdGetResult> => {
  if (!isHouseholdToken(token)) {
    return { ok: false };
  }

  try {
    const response = await fetch(householdApiPath(token), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (response.status === 404) {
      return { ok: true, snapshot: null };
    }

    if (!response.ok) {
      return { ok: false };
    }

    const snapshot = await readSnapshot(response);
    return snapshot ? { ok: true, snapshot } : { ok: false };
  } catch {
    return { ok: false };
  }
};

const putHousehold = async (
  token: string,
  snapshot: HouseholdSnapshot,
): Promise<HouseholdPutResult> => {
  if (!isHouseholdToken(token)) {
    return { ok: false };
  }

  try {
    const response = await fetch(householdApiPath(token), {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(snapshot),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false };
    }

    const stored = await readSnapshot(response);
    return stored ? { ok: true, snapshot: stored } : { ok: true, snapshot };
  } catch {
    return { ok: false };
  }
};

type HouseholdApi = {
  get: typeof getHousehold;
  put: typeof putHousehold;
};

export const householdApi: HouseholdApi = {
  get: getHousehold,
  put: putHousehold,
};
