#!/usr/bin/env bun
// Copies the built web app (packages/app/dist) into packages/mobile/www --
// Cordova's WebView loads that directory directly off disk. Same static
// assets as the Chrome extension and the plain web build; no separate
// mobile-specific build, no backend server (docs/checklist.md, Part 9).

import { existsSync, rmSync } from "node:fs";
import { cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const distDir = fileURLToPath(new URL("packages/app/dist/", root));
const wwwDir = fileURLToPath(new URL("packages/mobile/www/", root));

if (!existsSync(distDir)) {
  console.error("packages/app/dist not found -- run `bun run build` in packages/app first.");
  process.exit(1);
}

if (existsSync(wwwDir)) {
  rmSync(wwwDir, { recursive: true, force: true });
}

await cp(distDir, wwwDir, { recursive: true });
console.log(`Synced ${distDir} -> ${wwwDir}`);
