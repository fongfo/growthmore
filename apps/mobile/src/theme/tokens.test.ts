import { describe, expect, it } from "vitest";
import { colors, radius, spacing, touch, typography } from "./tokens";

describe("mobile theme tokens", () => {
  it("keeps the documented bank reward palette stable", () => {
    expect(colors.brand.primaryNavy).toBe("#0F172A");
    expect(colors.brand.bankBlue).toBe("#1E3A8A");
    expect(colors.brand.growthMint).toBe("#12B886");
    expect(colors.brand.learningGrape).toBe("#6C5CE7");
    expect(colors.brand.rewardGold).toBe("#A16207");
    expect(colors.brand.riskCoral).toBe("#DC2626");
  });

  it("uses mobile-friendly sizing foundations", () => {
    expect(touch.minTarget).toBeGreaterThanOrEqual(48);
    expect(touch.minCompactTarget).toBeGreaterThanOrEqual(44);
    expect(spacing.sm).toBe(8);
    expect(radius.sm).toBe(8);
    expect(typography.size.body).toBeGreaterThanOrEqual(16);
  });

  it("defines light and dark semantic surfaces for future theming", () => {
    expect(colors.light.background).toBe("#F8FAFC");
    expect(colors.light.surface).toBe("#FFFFFF");
    expect(colors.dark.background).toBe("#020617");
    expect(colors.dark.surface).toBe("#0F172A");
  });
});
