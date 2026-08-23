import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { listenForInstallPrompt, registerServiceWorker } from "./pwaInstall.ts";
import { hydrateUserData } from "./store/groceryStore.ts";
import { hydrateTheme } from "./store/themeStore.ts";

const boot = async (): Promise<void> => {
  listenForInstallPrompt();
  registerServiceWorker();
  hydrateTheme();
  await hydrateUserData();

  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("Root element not found");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

void boot();
