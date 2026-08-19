import { describe, expect, it } from "vitest";
import { demoTenant, productLoopSteps } from "./index";

describe("shared project constants", () => {
  it("exposes the demo tenant and product loop", () => {
    expect(demoTenant.slug).toBe("demo-bank");
    expect(productLoopSteps.map((step) => step.id)).toEqual([
      "earn",
      "allocate",
      "grow",
      "collect"
    ]);
  });
});

