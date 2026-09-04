import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tslOperatorPlugin from "vite-plugin-tsl-operator";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), tslOperatorPlugin({ logs: false })],
});
