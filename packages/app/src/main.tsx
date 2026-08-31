// The actual mount point for the real app -- part of the view accident,
// not the composition root itself, same as accidents/view/essence/main.ts.
// Vite's entry point (see index.html).
import { render } from "solid-js/web";
import { createRealApp } from "./index";
import "./accidents/view/solid/styles.css";

const root = document.getElementById("root");
if (root) {
  render(createRealApp(), root);
}
