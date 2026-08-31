#!/usr/bin/env bun
// Serves packages/app/src/accidents/view/essence (the essence-view
// accident; its composition root lives at packages/app/src/index.essence.ts)
// so it can be opened in a real browser and clicked through after each TDD
// cycle. main.ts is rebuilt fresh on every request to /main.js -- no watch
// process, just refresh the page. Ported from conduit's
// scripts/serve-essence-view.ts.

import { fileURLToPath } from "node:url";
import { noCacheHeaders } from "./no-cache-headers";

const viewDir = new URL("../packages/app/src/accidents/view/essence/", import.meta.url);
const port = 5321;

Bun.serve({
  port,
  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (pathname === "/" || pathname === "/index.html") {
      return new Response(Bun.file(new URL("index.html", viewDir)), {
        headers: noCacheHeaders,
      });
    }

    if (pathname === "/main.js") {
      const result = await Bun.build({
        entrypoints: [fileURLToPath(new URL("main.ts", viewDir))],
        format: "esm",
      });
      if (!result.success) {
        console.error(result.logs.join("\n"));
        return new Response("Build failed — see terminal.", { status: 500 });
      }
      const [output] = result.outputs;
      return new Response(await output.text(), {
        headers: { "Content-Type": "application/javascript", ...noCacheHeaders },
      });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Essence view: http://localhost:${port}`);
