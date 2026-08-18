/// <reference types="bun" />
import { describe, expect, test } from "bun:test";

import {
  canShowInstallButton,
  isAndroidDevice,
  isIosDevice,
  isStandaloneDisplay,
} from "./pwaInstall.ts";

describe("isIosDevice", () => {
  test("detects iPhone Safari", () => {
    expect(
      isIosDevice(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        5,
      ),
    ).toBe(true);
  });

  test("detects iPadOS which reports as Macintosh", () => {
    expect(
      isIosDevice(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        5,
      ),
    ).toBe(true);
  });

  test("does not treat desktop Mac Safari as iOS", () => {
    expect(
      isIosDevice(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        0,
      ),
    ).toBe(false);
  });

  test("does not treat Android Chrome as iOS", () => {
    expect(
      isIosDevice(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
        5,
      ),
    ).toBe(false);
  });
});

describe("isAndroidDevice", () => {
  test("detects Android Chrome", () => {
    expect(
      isAndroidDevice(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
      ),
    ).toBe(true);
  });

  test("does not treat iPhone as Android", () => {
    expect(
      isAndroidDevice(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(false);
  });
});

describe("isStandaloneDisplay", () => {
  test("is true when display-mode is standalone", () => {
    expect(isStandaloneDisplay(true, undefined)).toBe(true);
  });

  test("is true when iOS navigator.standalone is set", () => {
    expect(isStandaloneDisplay(false, true)).toBe(true);
  });

  test("is false in a regular browser tab", () => {
    expect(isStandaloneDisplay(false, false)).toBe(false);
  });
});

describe("canShowInstallButton", () => {
  test("shows on iOS until the app is installed", () => {
    expect(
      canShowInstallButton({
        isInstalled: false,
        hasNativePrompt: false,
        isIos: true,
        isAndroid: false,
      }),
    ).toBe(true);
  });

  test("shows on Android until the app is installed", () => {
    expect(
      canShowInstallButton({
        isInstalled: false,
        hasNativePrompt: false,
        isIos: false,
        isAndroid: true,
      }),
    ).toBe(true);
  });

  test("shows when the browser offers a native install prompt", () => {
    expect(
      canShowInstallButton({
        isInstalled: false,
        hasNativePrompt: true,
        isIos: false,
        isAndroid: false,
      }),
    ).toBe(true);
  });

  test("hides after the app is installed", () => {
    expect(
      canShowInstallButton({
        isInstalled: true,
        hasNativePrompt: true,
        isIos: true,
        isAndroid: true,
      }),
    ).toBe(false);
  });

  test("hides in browsers that cannot install yet", () => {
    expect(
      canShowInstallButton({
        isInstalled: false,
        hasNativePrompt: false,
        isIos: false,
        isAndroid: false,
      }),
    ).toBe(false);
  });
});
