import { describe, expect, it } from "vitest";
import { demoRewardJar, demoTenant, productLoopSteps } from "@growthmore/shared";
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

  it("uses the shared reward jar contract for mobile reward display", () => {
    expect(demoRewardJar.totalBalanceAmount).toBeGreaterThan(0);
    expect(demoRewardJar.availableAmount).toBeLessThan(demoRewardJar.minimumWithdrawalAmount);
    expect(demoRewardJar.rewardRuleSummary).toContain("模拟投资涨跌不会进入奖励计算");
    expect(demoRewardJar.ledger.map((entry) => entry.status)).toContain("locked");
  });
});