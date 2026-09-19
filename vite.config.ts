import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { householdApiPlugin } from "./vite/householdApiPlugin.ts";

export default defineConfig({
  plugins: [react(), tailwindcss(), householdApiPlugin()],
});
