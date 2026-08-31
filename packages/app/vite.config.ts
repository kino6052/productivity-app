import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  // Explicit IPv4 -- Vite's default host resolution otherwise binds
  // ::1 (IPv6 loopback) only, which this environment's browser/curl
  // can't reach ("Bad access" on connect).
  server: { port: 5322, host: "127.0.0.1" },
});
