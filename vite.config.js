import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,      // default starting port
    strictPort: false // allow Vite to switch if busy
  }
});