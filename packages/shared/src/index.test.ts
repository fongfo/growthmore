import { describe, expect, it } from "vitest";
import {
  applyTaskAction,
  canTransitionTask,
  createTaskBoardSummary,
  createSimulationAllocationDraft,
  createVirtualBalanceSnapshot,
  defaultTenantTheme,
  demoLinkedBankAccount,
  demoMockSession,
  demoSimulationAllocationDraft,
  demoSimulationProducts,
  demoTaskBoardSummary,
  demoTenant,
  demoTodayHomeSummary,
  demoUserTasks,
  demoVirtualBalance,
  demoVirtualBalanceLedger,
  getAvailableTaskActions,
  getNextTaskStatus,
  productLoopSteps,
  taskStatusCopy,
  transitionTaskStatus,
  validateSimulationAllocations
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

  it("provides the Today home summary required by the mobile app", () => {
    expect(demoTodayHomeSummary.userId).toBe(demoMockSession.user.id);
    expect(demoTodayHomeSummary.tenantSlug).toBe(demoTenant.slug);
    expect(demoTodayHomeSummary.level.progressPercent).toBeGreaterThan(0);
    expect(demoTodayHomeSummary.level.progressPercent).toBeLessThanOrEqual(1);
    expect(demoTodayHomeSummary.balances.virtualGrowthAmount).toBeGreaterThan(0);
    expect(demoTodayHomeSummary.balances.rewardJarAmount).toBeGreaterThan(0);
    expect(demoTodayHomeSummary.recommendedTask.id).toBe("risk-lesson");
    expect(demoTodayHomeSummary.recommendedTask.ctaLabel).toBe("开始今日任务");
    expect(demoTodayHomeSummary.withdrawalWindow.label).toContain("本月提现窗口");
    expect(demoTodayHomeSummary.nextActions.map((action) => action.id)).toEqual([
      "portfolio",
      "reward",
      "learning"
    ]);
  });
});

describe("task state machine", () => {
  it("exposes every MVP task status with user-facing copy", () => {
    expect(Object.keys(taskStatusCopy)).toEqual([
      "available",
      "in_progress",
      "pending_verification",
      "completed",
      "claimed",
      "rejected",
      "reversed"
    ]);
    expect(taskStatusCopy.completed.ctaLabel).toBe("领取奖励");
  });

  it("allows only documented transitions", () => {
    expect(getNextTaskStatus("available", "start")).toBe("in_progress");
    expect(getNextTaskStatus("in_progress", "submit")).toBe("pending_verification");
    expect(getNextTaskStatus("pending_verification", "approve")).toBe("completed");
    expect(getNextTaskStatus("pending_verification", "reject")).toBe("rejected");
    expect(getNextTaskStatus("completed", "claim")).toBe("claimed");
    expect(getNextTaskStatus("claimed", "reverse")).toBe("reversed");
    expect(getNextTaskStatus("rejected", "retry")).toBe("in_progress");
    expect(canTransitionTask("claimed", "start")).toBe(false);
    expect(() => transitionTaskStatus("claimed", "start")).toThrow("Invalid task transition");
  });

  it("applies actions and refreshes available actions", () => {
    const availableTask = demoUserTasks.find((task) => task.status === "available");

    expect(availableTask).toBeDefined();
    const startedTask = applyTaskAction(availableTask!, "start");

    expect(startedTask.status).toBe("in_progress");
    expect(startedTask.availableActions).toEqual(["submit"]);
    expect(startedTask.startedAt).toBeTruthy();
  });

  it("keeps rejected task retry paths visible", () => {
    const rejectedTask = demoUserTasks.find((task) => task.status === "rejected");

    expect(rejectedTask?.rejectionReason).toContain("目标金额缺失");
    expect(getAvailableTaskActions("rejected")).toEqual(["retry"]);
  });

  it("builds the task board summary from demo user tasks", () => {
    const summary = createTaskBoardSummary(demoUserTasks);

    expect(summary).toEqual(demoTaskBoardSummary);
    expect(summary.totalTaskCount).toBe(6);
    expect(summary.statusCounts).toMatchObject({
      available: 1,
      in_progress: 1,
      pending_verification: 1,
      completed: 1,
      claimed: 1,
      rejected: 1,
      reversed: 0
    });
    expect(summary.todayAvailableVirtualGrowthAmount).toBeGreaterThan(0);
    expect(summary.categoryFilters.map((filter) => filter.id)).toContain("banking");
  });
});

describe("virtual balance ledger", () => {
  it("derives the virtual balance snapshot from the latest ledger entry", () => {
    const snapshot = createVirtualBalanceSnapshot(demoVirtualBalanceLedger);
    const latestEntry = demoVirtualBalanceLedger.at(-1);

    expect(snapshot).toEqual(demoVirtualBalance);
    expect(latestEntry).toBeDefined();
    expect(snapshot.availableAmount).toBe(latestEntry!.balanceAfter.availableAmount);
    expect(snapshot.allocatedAmount).toBe(latestEntry!.balanceAfter.allocatedAmount);
    expect(snapshot.frozenAmount).toBe(latestEntry!.balanceAfter.frozenAmount);
    expect(snapshot.totalAmount).toBe(latestEntry!.balanceAfter.totalAmount);
  });

  it("keeps all required audit fields on every ledger entry", () => {
    expect(demoVirtualBalanceLedger).toHaveLength(7);

    for (const entry of demoVirtualBalanceLedger) {
      expect(entry.entryType).toBeTruthy();
      expect(entry.amount).toBeGreaterThan(0);
      expect(entry.sourceType).toBeTruthy();
      expect(entry.sourceId).toBeTruthy();
      expect(entry.balanceAfter.totalAmount).toBe(
        entry.balanceAfter.availableAmount + entry.balanceAfter.allocatedAmount + entry.balanceAfter.frozenAmount
      );
      expect(entry.ruleVersion).toBe("demo-mvp-v1");
      expect(entry.createdAt).toContain("+08:00");
    }
  });

  it("keeps virtual balance separate from cash reward language", () => {
    expect(demoVirtualBalance.disclosure).toContain("不是现金");
    expect(demoVirtualBalance.availableAmount).toBe(demoTodayHomeSummary.balances.virtualGrowthAmount);
    expect(demoVirtualBalance.todayEarnedAmount).toBe(0);
    expect(demoVirtualBalance.dailyEarnLimitAmount).toBeGreaterThan(demoVirtualBalance.todayEarnedAmount);
  });
});

describe("simulation products and allocations", () => {
  it("provides the five MVP simulation products with risk education copy", () => {
    expect(demoSimulationProducts.map((product) => product.name)).toEqual([
      "模拟定存",
      "模拟货币基金",
      "模拟债券",
      "模拟黄金",
      "模拟平衡基金"
    ]);
    expect(demoSimulationProducts.every((product) => product.riskLabel && product.simulationLogic)).toBe(true);
    expect(demoSimulationProducts.find((product) => product.id === "gold")?.riskDisclosure).toContain("高波动");
  });

  it("creates an allocation draft with unallocated balance and percentages", () => {
    expect(demoSimulationAllocationDraft.availableAmount).toBe(demoVirtualBalance.availableAmount);
    expect(demoSimulationAllocationDraft.totalAllocatedAmount).toBe(1250);
    expect(demoSimulationAllocationDraft.unallocatedAmount).toBe(300);
    expect(demoSimulationAllocationDraft.allocations.reduce((sum, allocation) => sum + allocation.percent, 0)).toBe(100);
    expect(demoSimulationAllocationDraft.riskDisclosure).toContain("不代表真实投资收益");
    expect(demoSimulationAllocationDraft.examples.map((example) => example.id)).toEqual([
      "conservative",
      "balanced",
      "growth"
    ]);
  });

  it("supports educational examples and reset allocations", () => {
    const growthExample = demoSimulationAllocationDraft.examples.find((example) => example.id === "growth");
    const growthDraft = createSimulationAllocationDraft(demoVirtualBalance.availableAmount, growthExample!.allocations);
    const resetDraft = createSimulationAllocationDraft(demoVirtualBalance.availableAmount, []);

    expect(growthDraft.totalAllocatedAmount).toBe(demoVirtualBalance.availableAmount);
    expect(growthDraft.riskScore).toBeGreaterThan(demoSimulationAllocationDraft.riskScore);
    expect(resetDraft.totalAllocatedAmount).toBe(0);
    expect(resetDraft.unallocatedAmount).toBe(demoVirtualBalance.availableAmount);
  });

  it("validates unknown, negative, and over-budget allocations", () => {
    expect(validateSimulationAllocations(demoVirtualBalance.availableAmount, [
      { productId: "gold", amount: 100 },
      { productId: "missing-product", amount: 50 },
      { productId: "bond", amount: -1 }
    ])).toEqual([
      "Unknown simulation product: missing-product",
      "Invalid allocation amount for bond"
    ]);
    expect(validateSimulationAllocations(demoVirtualBalance.availableAmount, [
      { productId: "gold", amount: demoVirtualBalance.availableAmount + 1 }
    ])).toContain("Allocated amount cannot exceed available virtual growth balance.");
  });
});
