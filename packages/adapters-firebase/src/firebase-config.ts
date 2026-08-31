// Firebase project config for productivity-app, read from environment
// variables (see .env.example) rather than hardcoded -- keeps the actual
// values out of source and out of git history, even though a Firebase
// *web* config isn't a secret by Google's own design: it identifies the
// project to the client SDK, and access is controlled by Firestore/Storage
// security rules, not by keeping this object private. Bun loads .env
// automatically for `bun run`/`bun test`; a future bundler-based
// composition root will need its own equivalent (e.g. Vite's define/env
// handling) when Part 7 gets built.
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
