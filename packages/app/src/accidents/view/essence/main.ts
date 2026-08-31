// The actual mount point for the essence view -- part of the view accident,
// not the composition root itself. Mirrors conduit's own main.ts: thin, no
// logic of its own, just wires the composition root (../../../index.essence)
// to the real DOM.
import { handleClick, render } from "../../../index.essence";

document.addEventListener("click", handleClick);
render();
