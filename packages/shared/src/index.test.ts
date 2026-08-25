import { describe, expect, it } from "vitest";
import {
  defaultTenantTheme,
  demoLinkedBankAccount,
  demoMockSession,
  demoTenant,
  productLoopSteps
} from "./index";

describe("shared project constants", () => {
  it("exposes the demo tenant and product loop", () => {
    expect(demoTenant.slug).toBe("demo-bank");
    expect(demoTenant.appName).toBe("成长金计划");
    expect(productLoopSteps.map((step) => step.id)).toEqual([
      "earn",
      "allocate",
      "grow",
      "collect"
    ]);
  });

  it("keeps tenant theming inside the approved semantic palette", () => {
    expect(demoTenant.theme.colors.primary).toBe("#0F172A");
    expect(demoTenant.theme.colors.cta).toBe("#1E3A8A");
    expect(defaultTenantTheme.colors.risk).toBe("#DC2626");
    expect(defaultTenantTheme.radius.card).toBeGreaterThanOrEqual(8);
    expect(defaultTenantTheme.radius.button).toBeGreaterThanOrEqual(10);
  });

  it("keeps disclosures separate from theme customization", () => {
    expect(demoTenant.disclosureCopy.virtualBalanceNotice).toContain("不是现金");
    expect(demoTenant.disclosureCopy.rewardNotice).toContain("银行活动预算");
    expect(demoTenant.disclosureCopy.simulationNotice).toContain("不代表真实投资收益");
  });
  it("provides a mock verified user session and linked bank account", () => {
    expect(demoMockSession.user.tenantSlug).toBe(demoTenant.slug);
    expect(demoMockSession.user.kycStatus).toBe("mock_verified");
    expect(demoMockSession.auth.tokenType).toBe("Bearer");
    expect(demoLinkedBankAccount.status).toBe("linked");
    expect(demoLinkedBankAccount.isWithdrawalAccount).toBe(true);
    expect(demoLinkedBankAccount.accountNumberMasked).toContain("****");
  });
});
