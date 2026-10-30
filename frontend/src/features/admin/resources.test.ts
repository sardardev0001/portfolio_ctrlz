import { describe, expect, it } from "vitest";
import { adminNav, resources } from "./resources";
import { translate } from "@/i18n/core";
describe("admin dictionary coverage", () => {
  it("translates every registered label and choice", () => {
    const labels = [
      ...adminNav.map((item) => item.label),
      ...Object.values(resources).flatMap((resource) => [
        resource.label,
        ...resource.fields.flatMap((field) => [
          field.label,
          ...(field.options || []).map(([, label]) => label),
        ]),
      ]),
    ];
    for (const label of labels)
      expect(translate(label, "en"), label).not.toMatch(/[\u0600-\u06ff]/);
    for (const resource of Object.values(resources))
      for (const column of resource.columns)
        expect(translate(`column.${column}`, "en")).not.toContain("column.");
  });
});
