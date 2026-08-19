import { describe, expect, it } from "vitest";
import { demoTenant, productLoopSteps } from "@growthmore/shared";

describe("mobile scaffold", () => {
  it("uses the shared demo tenant and product loop", () => {
    expect(demoTenant.displayName).toBe("Growthmore Bank");
    expect(productLoopSteps).toHaveLength(4);
  });
});

