import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [solid()],
  // Explicit IPv4 -- Vite's default host resolution otherwise binds
  // ::1 (IPv6 loopback) only, which this environment's browser/curl
  // can't reach ("Bad access" on connect).
  server: { port: 5322, host: "127.0.0.1" },
  // Relative asset paths -- the same dist/ build doubles as the Chrome
  // extension's page (opened as a full tab, not a popup, from a
  // chrome-extension:// origin) and as a normal static web deploy that
  // might not be served from a domain root; "./" works for both, "/"
  // only reliably for the latter.
  base: "./",
  // One shared .env at the monorepo root, not a packages/app-local copy
  // -- same file Bun already loads for bun run/bun test.
  envDir: fileURLToPath(new URL("../../", import.meta.url)),
  // firebase/auth is newly imported (persistence-firebase.ts) and lives
  // deep in a workspace package, not packages/app's own direct
  // dependencies -- Vite's dev-server dependency scanner can miss it on
  // cold start and only discover it once the page actually imports it,
  // triggering a live re-optimization + forced page reload mid-session.
  // That reload raced with Firebase's own module-level component
  // registration and produced a real, reproducible "Component auth has
  // not been registered yet" error, caught live, not guessed -- listing
  // it here makes Vite pre-bundle it upfront instead.
  optimizeDeps: {
    include: ["firebase/app", "firebase/firestore", "firebase/auth"],
  },
});
