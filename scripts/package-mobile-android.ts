#!/usr/bin/env bun
// Builds packages/app, syncs it into packages/mobile/www, adds the
// Cordova Android platform if it isn't already present, and runs a real
// Cordova/Gradle build to produce an .apk in release/.
//
// The Android SDK (cmdline-tools + platforms;android-36 + build-tools;36.1.0)
// and Gradle 8.14.2 are installed locally on this machine outside the repo
// -- see docs/checklist.md Part 9 for the full story of getting a real
// build working end to end (a genuine APK, verified via `aapt dump
// badging`). This script resolves ANDROID_HOME/JAVA_HOME and puts Gradle
// on PATH automatically (see resolveAndroidToolchain below) so
// `bun run mobile:package-android` works standalone -- no manual
// `export ANDROID_HOME=... && export JAVA_HOME=... && export PATH=...`
// needed first. That resolution is additive: an already-set env var or an
// already-resolvable `gradle`/`java` on PATH always wins, and on a machine
// without this exact local install, the script just leaves the
// environment untouched and Cordova/Gradle fail with their own normal
// "SDK not found" error, same as before this existed -- no new failure
// mode, no CI impact (CI's own workflow never runs this script).

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";
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
  // env explicitly passed through, not left to spawnSync's default
  // inheritance -- resolveAndroidToolchain's process.env mutations
  // (below) were observed *not* reliably reaching this point's child
  // process otherwise (caught live: Cordova reported ANDROID_HOME as
  // undefined and silently fell back to a different, unrelated SDK
  // install at C:\Users\<user>\AppData\Local\Android\sdk instead, not
  // guessed).
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: true, env: process.env });
  if (result.status !== 0) {
    console.error(`\n"${command} ${args.join(" ")}" failed (exit ${result.status}).`);
    process.exit(result.status ?? 1);
  }
}

function commandExistsOnPath(command: string): boolean {
  const checker = process.platform === "win32" ? "where" : "which";
  return spawnSync(checker, [command], { stdio: "ignore", shell: true }).status === 0;
}

// Picks the entry in `dir` whose name starts with `prefix`, preferring the
// lexicographically last (works fine for the single-install case this
// machine actually has; not a real semver comparison, but there's only
// ever been one Gradle/JDK version installed here at a time).
function findLatestMatch(dir: string, prefix: string): string | undefined {
  if (!existsSync(dir)) return undefined;
  const matches = readdirSync(dir)
    .filter((name) => name.startsWith(prefix))
    .sort()
    .reverse();
  return matches[0] ? join(dir, matches[0]) : undefined;
}

// Fills in ANDROID_HOME/JAVA_HOME and prepends Gradle's bin to PATH from
// this machine's known-good local install locations (docs/checklist.md
// Part 9), but only where the environment doesn't already resolve them --
// never overrides an explicit env var or something already found on PATH.
// Gradle specifically needs to be discoverable *before* Cordova's own
// build step runs: Cordova won't attempt its own wrapper bootstrap
// without a system `gradle` already on PATH.
function resolveAndroidToolchain(): void {
  if (process.env.ANDROID_HOME === undefined && process.env.ANDROID_SDK_ROOT === undefined) {
    const candidate = "C:\\Android\\sdk";
    if (existsSync(candidate)) {
      process.env.ANDROID_HOME = candidate;
      process.env.ANDROID_SDK_ROOT = candidate;
      console.log(`Resolved ANDROID_HOME/ANDROID_SDK_ROOT -> ${candidate}`);
    }
  }

  if (process.env.JAVA_HOME === undefined) {
    const candidate = findLatestMatch("C:\\Program Files\\Eclipse Adoptium", "jdk-");
    if (candidate) {
      process.env.JAVA_HOME = candidate;
      console.log(`Resolved JAVA_HOME -> ${candidate}`);
    }
  }

  if (!commandExistsOnPath("gradle")) {
    const gradleHome = findLatestMatch("C:\\Android", "gradle-");
    const gradleBin = gradleHome ? join(gradleHome, "bin") : undefined;
    if (gradleBin && existsSync(gradleBin)) {
      process.env.PATH = `${gradleBin}${delimiter}${process.env.PATH ?? ""}`;
      console.log(`Resolved Gradle -> ${gradleBin}`);
    }
  }
}

resolveAndroidToolchain();

console.log("\nBuilding packages/app...");
run("bun", ["run", "build"], appDir);

console.log("\nSyncing dist/ into packages/mobile/www...");
run("bun", [join(root, "scripts/sync-www.ts")], root);

if (!existsSync(androidPlatformDir)) {
  console.log("\nAdding the Cordova Android platform (first run only)...");
  run("npx", ["--yes", "cordova", "platform", "add", "android"], mobileDir);
} else {
  console.log("\nCordova Android platform already present, skipping platform add.");
}

console.log("\nBuilding the APK...");
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
