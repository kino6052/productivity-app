import { defineConfig } from "vitest/config";

// Bun's own coverage only reports functions/lines, not branches — so branch
// coverage runs through vitest + istanbul instead. Source stays untouched:
// essence code imports from "bun:test", so we alias that specifier to
// vitest's (API-compatible) exports rather than forking the test files.
// Ported from conduit's vitest.config.mts, adjusted for a packages/* monorepo.
export default defineConfig({
  resolve: {
    alias: {
      "bun:test": "vitest",
    },
  },
  test: {
    include: ["packages/*/src/**/*.test.ts"],
    coverage: {
      provider: "istanbul",
      include: ["packages/*/src/**/*.ts"],
      // Composition roots, real-IO accidents, and pure presentational glue
      // aren't unit-tested — same precedent as conduit. Entries get added
      // here as they're built, same living-document spirit as
      // docs/checklist.md.
      exclude: [
        "packages/*/src/**/*.test.ts",
        // Real browser global (localStorage) -- same category as
        // conduit's navigation-hash.ts. The testable logic (Date
        // round-tripping) lives in json-codec.ts instead, which stays
        // covered.
        "packages/core/src/accidents/persistence/persistence-local-storage.ts",
        // Real network IO (Firestore) -- same category as the line above.
        "packages/adapters-firebase/src/persistence-firebase.ts",
        // Composition root (real DOM) and its mount point -- verified
        // live via the Browser tool, not under bun:test, same precedent
        // as conduit's index.essence.ts / accidents/view/essence/main.ts.
        "packages/app/src/index.essence.ts",
        "packages/app/src/accidents/view/essence/main.ts",
        // Fixture data, not a capability -- same category as conduit's
        // states.ts (no states.test.ts there either).
        "packages/app/src/accidents/view/essence/states.ts",
      ],
      reporter: ["text", "json-summary"],
    },
  },
});
