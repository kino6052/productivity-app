#!/usr/bin/env bun
// Builds packages/app, syncs it into packages/mobile/www, adds the
// Cordova Android platform if it isn't already present, and runs a real
// Cordova/Gradle build to produce an .apk in release/.
//
// This needs the Android SDK (cmdline-tools + a platform + build-tools)
// and Gradle available -- neither is installed in the environment this
// script was written in, so that part is untested end-to-end here. What
// IS verified: `cordova platform add android` succeeds and produces a
// real platforms/android Gradle project (see docs/checklist.md, Part 9,
// for the workspace/npm fix that was needed to get this far), and
// `cordova build android` gets exactly as far as Gradle/the SDK being
// missing -- the real, unavoidable wall, not a bug in this script.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const appDir = join(root, "packages/app");
const mobileDir = join(root, "packages/mobile");
const releaseDir = join(root, "release");
const androidPlatformDir = join(mobileDir, "platforms/android");
const outputsDir = join(androidPlatformDir, "app/build/outputs/apk/debug");

function run(command: string, args: string[], cwd: string): void {
  console.log(`$ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`\n"${command} ${args.join(" ")}" failed (exit ${result.status}).`);
    process.exit(result.status ?? 1);
  }
}

console.log("Building packages/app...");
run("bun", ["run", "build"], appDir);

console.log("\nSyncing dist/ into packages/mobile/www...");
run("bun", [join(root, "scripts/sync-www.ts")], root);

if (!existsSync(androidPlatformDir)) {
  console.log("\nAdding the Cordova Android platform (first run only)...");
  run("npx", ["--yes", "cordova", "platform", "add", "android"], mobileDir);
} else {
  console.log("\nCordova Android platform already present, skipping platform add.");
}

console.log("\nBuilding the APK (needs the Android SDK + Gradle -- see this file's header comment)...");
run("npx", ["--yes", "cordova", "build", "android"], mobileDir);

if (!existsSync(outputsDir)) {
  console.error(`\nBuild reported success but ${outputsDir} wasn't found -- check Cordova's output above.`);
  process.exit(1);
}

const apkFile = readdirSync(outputsDir).find((name) => name.endsWith(".apk"));
if (!apkFile) {
  console.error(`\nNo .apk found in ${outputsDir}.`);
  process.exit(1);
}

mkdirSync(releaseDir, { recursive: true });
const destPath = join(releaseDir, "productivity-app.apk");
copyFileSync(join(outputsDir, apkFile), destPath);
console.log(`\nCopied ${apkFile} -> ${destPath}`);
