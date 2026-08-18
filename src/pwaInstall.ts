export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export const isIosDevice = (
  userAgent: string,
  maxTouchPoints: number,
): boolean => {
  const ua = userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return true;
  }

  return ua.includes("macintosh") && maxTouchPoints > 1;
};

export const isAndroidDevice = (userAgent: string): boolean =>
  /android/i.test(userAgent);

export const isStandaloneDisplay = (
  matchesStandalone: boolean,
  navigatorStandalone: boolean | undefined,
): boolean => matchesStandalone || Boolean(navigatorStandalone);

let capturedInstallPrompt: BeforeInstallPromptEvent | null = null;

export const listenForInstallPrompt = (): void => {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    capturedInstallPrompt = event as BeforeInstallPromptEvent;
  });
};

export const getCapturedInstallPrompt = (): BeforeInstallPromptEvent | null =>
  capturedInstallPrompt;

export const clearCapturedInstallPrompt = (): void => {
  capturedInstallPrompt = null;
};

export const registerServiceWorker = (): void => {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) {
    return;
  }

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
};

export const canShowInstallButton = ({
  isInstalled,
  hasNativePrompt,
  isIos,
  isAndroid,
}: {
  isInstalled: boolean;
  hasNativePrompt: boolean;
  isIos: boolean;
  isAndroid: boolean;
}): boolean => !isInstalled && (hasNativePrompt || isIos || isAndroid);

export const getIsStandalone = (
  windowLike: Pick<Window, "matchMedia" | "navigator"> = window,
): boolean => {
  const matchesStandalone = windowLike.matchMedia(
    "(display-mode: standalone)",
  ).matches;
  const navigatorStandalone = (
    windowLike.navigator as Navigator & { standalone?: boolean }
  ).standalone;

  return isStandaloneDisplay(matchesStandalone, navigatorStandalone);
};
