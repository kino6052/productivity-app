#!/usr/bin/env bun
// Builds packages/app and zips the result into a Chrome-extension-ready
// package -- the exact same static dist/ that also serves as the plain
// web build and the Cordova mobile shell's www/ (scripts/sync-www.ts).
// Uses a cross-platform zip library (archiver) rather than shelling out
// to zip/Compress-Archive, since this needs to run on any contributor's
// machine, not just this one.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { createWriteStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { ZipArchive } from "archiver";

const root = new URL("../", import.meta.url);
const appDir = fileURLToPath(new URL("packages/app/", root));
const distDir = fileURLToPath(new URL("packages/app/dist/", root));
const releaseDir = fileURLToPath(new URL("release/", root));
const zipPath = fileURLToPath(new URL("release/productivity-app-extension.zip", root));

console.log("Building packages/app...");
const build = spawnSync("bun", ["run", "build"], { cwd: appDir, stdio: "inherit" });
if (build.status !== 0) {
  console.error("Build failed -- see above.");
  process.exit(build.status ?? 1);
}

if (!existsSync(distDir)) {
  console.error(`${distDir} not found after build.`);
  process.exit(1);
}

mkdirSync(releaseDir, { recursive: true });

const output = createWriteStream(zipPath);
// archiver's v8 rewrite dropped the archiver("zip", {...}) factory
// function documented everywhere online in favor of format-specific
// classes -- ZipArchive is the current API.
const archive = new ZipArchive({ zlib: { level: 9 } });

archive.on("warning", (err) => console.warn(err));
archive.on("error", (err) => {
  throw err;
});

const done = new Promise<void>((resolve) => output.on("close", resolve));

archive.pipe(output);
// Zip the *contents* of dist/, not a wrapping dist/ folder -- manifest.json
// needs to sit at the zip's root for Chrome to find it.
archive.directory(distDir, false);
await archive.finalize();
await done;

console.log(`Packaged ${archive.pointer()} bytes -> ${zipPath}`);
