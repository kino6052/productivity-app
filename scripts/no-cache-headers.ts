// Ported from conduit's no-cache-headers.ts -- applied by every serve
// script so a rebuilt main.js is never served stale during manual
// verification.
export const noCacheHeaders = {
  "Cache-Control": "no-store",
};
