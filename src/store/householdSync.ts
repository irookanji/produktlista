import { signal } from "@preact/signals-react";

import type { HouseholdSnapshot } from "../types.ts";
import { userDb } from "./db.ts";
import {
  applyHouseholdSnapshot,
  customProducts$,
  householdToken$,
  isCustomProduct,
  isShoppingItem,
  shoppingItems$,
} from "./groceryStore.ts";
import {
  createHouseholdToken,
  HOUSEHOLD_POLL_MS,
  householdSharePath,
  isHouseholdToken,
  mergeHouseholdSnapshots,
  parseHouseholdTokenFromPath,
} from "./household.ts";
import { householdApi } from "./householdApi.ts";

export type ShareFeedback = "copied" | "error" | null;

export const shareFeedback$ = signal<ShareFeedback>(null);

let lastPushedAt = 0;
let syncWriteChain = Promise.resolve();
let pollTimer: ReturnType<typeof setInterval> | undefined;
let feedbackTimer: ReturnType<typeof setTimeout> | undefined;
let syncStarted = false;

const enqueueSync = (work: () => Promise<void>): Promise<void> => {
  const run = syncWriteChain.then(work, work);
  syncWriteChain = run.catch(() => undefined);
  return run;
};

const snapshotFromLocal = (): HouseholdSnapshot => ({
  items: shoppingItems$.value,
  customProducts: customProducts$.value,
  updatedAt: Date.now(),
});

const setShareFeedback = (feedback: ShareFeedback): void => {
  shareFeedback$.value = feedback;
  if (feedbackTimer !== undefined) {
    clearTimeout(feedbackTimer);
  }
  if (feedback) {
    feedbackTimer = setTimeout(() => {
      shareFeedback$.value = null;
    }, 2000);
  }
};

const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      return copied;
    } catch {
      return false;
    }
  }
};

const shareUrlForToken = (token: string): string => {
  const origin = globalThis.location?.origin ?? "";
  return `${origin}${householdSharePath(token)}`;
};

const bindToken = async (token: string): Promise<void> => {
  householdToken$.value = token;
  await userDb.setHouseholdToken(token);
};

export const pushHousehold = (): Promise<void> => {
  const token = householdToken$.value;
  if (!token) {
    return Promise.resolve();
  }

  return enqueueSync(async () => {
    const snapshot = snapshotFromLocal();
    const result = await householdApi.put(token, snapshot);
    if (result.ok) {
      lastPushedAt = snapshot.updatedAt;
    }
  });
};

const pullHousehold = async (token: string): Promise<void> => {
  const result = await householdApi.get(token);
  if (!result.ok || !result.snapshot) {
    return;
  }

  if (result.snapshot.updatedAt <= lastPushedAt) {
    return;
  }

  applyHouseholdSnapshot(result.snapshot);
  lastPushedAt = result.snapshot.updatedAt;
};

const joinHousehold = async (token: string): Promise<boolean> => {
  const result = await householdApi.get(token);
  if (!result.ok || !result.snapshot) {
    return false;
  }

  const local: HouseholdSnapshot = {
    items: shoppingItems$.value.filter(isShoppingItem),
    customProducts: customProducts$.value.filter(isCustomProduct),
    updatedAt: Date.now(),
  };

  const merged = mergeHouseholdSnapshots(local, result.snapshot);
  applyHouseholdSnapshot(merged);
  await bindToken(token);
  const stored = await householdApi.put(token, merged);
  if (stored.ok) {
    lastPushedAt = merged.updatedAt;
  }
  return true;
};

const pollHousehold = (): void => {
  const token = householdToken$.value;
  if (!token) {
    return;
  }

  if (
    typeof document !== "undefined" &&
    document.visibilityState === "hidden"
  ) {
    return;
  }

  void pullHousehold(token);
};

const startHouseholdSync = (): void => {
  if (syncStarted || typeof window === "undefined") {
    return;
  }

  syncStarted = true;
  pollTimer = setInterval(pollHousehold, HOUSEHOLD_POLL_MS);
  document.addEventListener("visibilitychange", pollHousehold);
};

const stopHouseholdSync = (): void => {
  syncStarted = false;
  if (pollTimer !== undefined) {
    clearInterval(pollTimer);
    pollTimer = undefined;
  }
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", pollHousehold);
  }
};

export const hydrateHousehold = async (
  pathname: string = globalThis.location?.pathname ?? "/",
): Promise<void> => {
  const urlToken = parseHouseholdTokenFromPath(pathname);
  const storedToken = await userDb.getHouseholdToken();
  const stored = isHouseholdToken(storedToken) ? storedToken : null;

  if (urlToken) {
    const joined = await joinHousehold(urlToken);
    if (joined) {
      startHouseholdSync();
      return;
    }
  }

  if (!stored) {
    return;
  }

  await bindToken(stored);
  await pullHousehold(stored);
  startHouseholdSync();
};

export const shareHousehold = async (): Promise<string | null> => {
  const existing = householdToken$.value;
  if (existing) {
    const url = shareUrlForToken(existing);
    const copied = await copyText(url);
    setShareFeedback(copied ? "copied" : "error");
    return copied ? url : null;
  }

  const token = createHouseholdToken();
  const snapshot = snapshotFromLocal();
  const result = await householdApi.put(token, snapshot);
  if (!result.ok) {
    setShareFeedback("error");
    return null;
  }

  lastPushedAt = snapshot.updatedAt;
  await bindToken(token);
  startHouseholdSync();

  const url = shareUrlForToken(token);
  const copied = await copyText(url);
  setShareFeedback(copied ? "copied" : "error");
  return copied ? url : null;
};

export const waitForHouseholdPushes = (): Promise<void> => syncWriteChain;

export const resetHouseholdSync = (): void => {
  stopHouseholdSync();
  lastPushedAt = 0;
  shareFeedback$.value = null;
  if (feedbackTimer !== undefined) {
    clearTimeout(feedbackTimer);
    feedbackTimer = undefined;
  }
};
