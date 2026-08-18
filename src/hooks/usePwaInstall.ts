import { useCallback, useEffect, useState } from "react";

import {
  type BeforeInstallPromptEvent,
  canShowInstallButton,
  clearCapturedInstallPrompt,
  getCapturedInstallPrompt,
  getIsStandalone,
  isAndroidDevice,
  isIosDevice,
} from "../pwaInstall.ts";

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(() => getCapturedInstallPrompt());
  const [isInstalled, setIsInstalled] = useState(() => getIsStandalone());
  const isIos = isIosDevice(navigator.userAgent, navigator.maxTouchPoints);
  const isAndroid = isAndroidDevice(navigator.userAgent);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      clearCapturedInstallPrompt();
      setDeferredPrompt(null);
    };

    const media = window.matchMedia("(display-mode: standalone)");
    const onDisplayModeChange = () => {
      setIsInstalled(getIsStandalone());
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    media.addEventListener("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      media.removeEventListener("change", onDisplayModeChange);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    clearCapturedInstallPrompt();
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    canInstall: canShowInstallButton({
      isInstalled,
      hasNativePrompt: deferredPrompt !== null,
      isIos,
      isAndroid,
    }),
    isIos,
    hasNativePrompt: deferredPrompt !== null,
    install,
  };
};
