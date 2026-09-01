// Firebase project config for productivity-app, read from environment
// variables (see .env.example) rather than hardcoded -- keeps the actual
// values out of source and out of git history, even though a Firebase
// *web* config isn't a secret by Google's own design: it identifies the
// project to the client SDK, and access is controlled by Firestore/Storage
// security rules, not by keeping this object private.
//
// import.meta.env, not process.env: this file now ships in a real browser
// bundle (packages/app's Vite build), where `process` doesn't exist at all
// -- a ReferenceError caught by actually loading the built app, not
// assumed. Vite statically replaces import.meta.env.VITE_* at build time
// (only VITE_-prefixed vars are exposed to client code, by design) from
// whichever .env file its `envDir` points at (vite.config.ts points this
// at the repo root, so there's one shared .env, not a packages/app-local
// copy). Bun also populates import.meta.env (mirroring process.env), so
// this same file works unchanged for bun run/bun test too.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
