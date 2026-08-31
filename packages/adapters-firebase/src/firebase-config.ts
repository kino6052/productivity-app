// Firebase project config for productivity-app. Not wired into a
// TPersistence<T> adapter yet (see docs/checklist.md, Part 8) — this
// milestone is in-memory persistence only. Stashed here so it's in one
// place, ready for `persistence-firebase.ts` when that accident is built.
//
// This is a Firebase *web* config, not a secret: it identifies the project
// to Google's client SDK, and access is controlled by Firestore/Storage
// security rules (added alongside the real adapter), not by keeping this
// object private.
export const firebaseConfig = {
  apiKey: "AIzaSyD_hd6KV2HCPGxJr4qRrVgF7M9RW1A-RzI",
  authDomain: "productivity-1be47.firebaseapp.com",
  projectId: "productivity-1be47",
  storageBucket: "productivity-1be47.firebasestorage.app",
  messagingSenderId: "602442215948",
  appId: "1:602442215948:web:d0009bd0d4ac5f10a9f429",
  measurementId: "G-5LCSEBCY9S",
};
