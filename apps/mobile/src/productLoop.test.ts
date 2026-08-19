import { describe, expect, it } from "vitest";
import { demoTenant, productLoopSteps } from "@growthmore/shared";
import { touch } from "./theme";

describe("mobile scaffold", () => {
  it("uses the shared demo tenant and product loop", () => {
    expect(demoTenant.displayName).toBe("Growthmore Bank");
    expect(productLoopSteps).toHaveLength(4);
  });

  it("keeps primary mobile actions touch friendly", () => {
    expect(touch.minTarget).toBeGreaterThanOrEqual(48);
    expect(touch.minCompactTarget).toBeGreaterThanOrEqual(44);
  });
});

