import { describe, expect, it } from "bun:test";
import { renderSidebar } from "./sidebar";

describe("renderSidebar", () => {
  it("renders a button for every named state", () => {
    const html = renderSidebar(["Empty", "One item"], "Empty");

    expect(html).toContain(`data-action="select-state" data-state-name="Empty"`);
    expect(html).toContain(`data-action="select-state" data-state-name="One item"`);
  });

  it("marks the currently selected state", () => {
    const html = renderSidebar(["Empty", "One item"], "One item");

    expect(html).toContain(`data-action="select-state" data-state-name="One item" aria-current="true"`);
    expect(html).not.toContain(`data-action="select-state" data-state-name="Empty" aria-current="true"`);
  });
});
