import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { listenForInstallPrompt, registerServiceWorker } from "./pwaInstall.ts";
import { hydrateShoppingList } from "./store/groceryStore.ts";

listenForInstallPrompt();
registerServiceWorker();
hydrateShoppingList();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
