import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  // Explicit IPv4 -- Vite's default host resolution otherwise binds
  // ::1 (IPv6 loopback) only, which this environment's browser/curl
  // can't reach ("Bad access" on connect).
  server: { port: 5322, host: "127.0.0.1" },
  // Relative asset paths -- the same dist/ build doubles as the Chrome
  // extension's popup (loaded from a chrome-extension:// origin) and as
  // a normal static web deploy that might not be served from a domain
  // root; "./" works for both, "/" only reliably for the latter.
  base: "./",
});
