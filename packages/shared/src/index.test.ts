import { describe, expect, it } from "vitest";
import {
  applyTaskAction,
  applyWithdrawalReviewAction,
  canTransitionTask,
  createTaskBoardSummary,
  createWithdrawalRequest,
  createSimulationAllocationDraft,
  createSimulationCycleRun,
  createComplianceSummary,
  createDisclosureAcceptance,
  createRewardJarSnapshot,
  createVirtualBalanceSnapshot,
  defaultTenantTheme,
  demoAuditLogs,
  demoComplianceSummary,
  demoDisclosureAcceptances,
  demoDisclosureVersions,
  demoLinkedBankAccount,
  demoMockSession,
  demoRewardJar,
  demoRewardLedger,
  demoWithdrawalRequests,
  demoSimulationAllocationDraft,
  demoSimulationCycleRun,
  demoSimulationProducts,
  demoTaskBoardSummary,
  demoTenant,
  demoTodayHomeSummary,
  demoUserTasks,
  demoVirtualBalance,
  demoVirtualBalanceLedger,
  getAvailableTaskActions,
  getPendingDisclosureVersions,
  getRequiredDisclosureVersions,
  getNextTaskStatus,
  productLoopSteps,
  taskStatusCopy,
  transitionTaskStatus,
  validateSimulationAllocations,
  validateSimulationReflection,
  validateWithdrawalRequest
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

describe("simulation learning cycle and reflection", () => {
  it("runs a deterministic learning cycle with explanations for allocated products", () => {
    expect(demoSimulationCycleRun.productResults).toHaveLength(5);
    expect(demoSimulationCycleRun.startingVirtualAmount).toBe(demoSimulationAllocationDraft.totalAllocatedAmount);
    expect(demoSimulationCycleRun.simulatedEndingVirtualAmount).not.toBe(demoSimulationCycleRun.startingVirtualAmount);
    expect(demoSimulationCycleRun.productResults.find((result) => result.productId === "gold")?.explanation).toContain("可能上涨也可能下跌");
    expect(demoSimulationCycleRun.reflectionQuestions).toHaveLength(3);
  });

  it("keeps simulated changes out of reward activity calculation", () => {
    expect(demoSimulationCycleRun.disclosure).toContain("不进入真实奖励计算");
    expect(demoSimulationCycleRun.rewardCalculationBasis).toContain("不使用模拟涨跌");
    expect(demoSimulationCycleRun.rewardActivityAmount).toBe(1.8);
  });

  it("requires high-volatility confirmation when gold is allocated", () => {
    expect(demoSimulationCycleRun.riskConfirmationRequired).toBe(true);
    expect(demoSimulationCycleRun.riskConfirmationStatements.join(" ")).toContain("银行风险测评");
  });

  it("validates reflection answers and risk confirmation", () => {
    const incomplete = validateSimulationReflection(demoSimulationCycleRun, {
      runId: demoSimulationCycleRun.id,
      answers: [{ questionId: "highest-volatility", answer: "模拟黄金" }],
      riskConfirmationAccepted: false
    });
    const complete = validateSimulationReflection(demoSimulationCycleRun, {
      runId: demoSimulationCycleRun.id,
      answers: demoSimulationCycleRun.reflectionQuestions.map((question) => ({
        questionId: question.id,
        answer: "已理解"
      })),
      riskConfirmationAccepted: true
    });

    expect(incomplete.completed).toBe(false);
    expect(incomplete.messages).toContain("Risk confirmation is required for high-volatility simulation products.");
    expect(complete).toMatchObject({
      completed: true,
      learningCompletionCoefficient: 1,
      acceptedRiskConfirmation: true
    });
  });

  it("supports an empty allocation learning cycle without reward activity", () => {
    const emptyRun = createSimulationCycleRun(createSimulationAllocationDraft(demoVirtualBalance.availableAmount, []));

    expect(emptyRun.productResults).toHaveLength(0);
    expect(emptyRun.rewardActivityAmount).toBe(0);
    expect(emptyRun.riskConfirmationRequired).toBe(false);
  });
  it("opens the current withdrawal window for mobile withdrawal flow", () => {
    expect(demoTodayHomeSummary.withdrawalWindow.status).toBe("open");
    expect(demoTodayHomeSummary.withdrawalWindow.label).toContain("9 月");
  });

  it("validates and creates withdrawal requests without real payouts", () => {
    const invalid = validateWithdrawalRequest(demoRewardJar, demoLinkedBankAccount, demoRewardJar.minimumWithdrawalAmount - 1);
    const result = createWithdrawalRequest(demoRewardJar, demoLinkedBankAccount, 5);

    expect(invalid).toContain("Withdrawal amount is below the minimum withdrawal amount.");
    expect(result.errors).toHaveLength(0);
    expect(result.request).toMatchObject({
      amount: 5,
      currency: "CNY",
      status: "submitted",
      withdrawalAccount: {
        accountNumberMasked: demoLinkedBankAccount.accountNumberMasked
      }
    });
    expect(result.request?.rewardLedgerEntryIds).toContain("rwd-006");
    expect(result.request?.disclosure).toContain("不接真实打款");
  });

  it("supports approve, reject, and retry transitions for withdrawal review", () => {
    const reviewRequest = demoWithdrawalRequests.find((request) => request.status === "under_review");
    const failedRequest = demoWithdrawalRequests.find((request) => request.status === "failed");
    const approved = applyWithdrawalReviewAction(reviewRequest!, "approve");
    const rejected = applyWithdrawalReviewAction(reviewRequest!, "reject", { reason: "账户信息不一致" });
    const retried = applyWithdrawalReviewAction(failedRequest!, "retry");
    const invalid = applyWithdrawalReviewAction(approved.request!, "retry");

    expect(approved.request?.status).toBe("approved");
    expect(rejected.request?.status).toBe("rejected");
    expect(rejected.request?.rejectionReason).toBe("账户信息不一致");
    expect(retried.request?.status).toBe("under_review");
    expect(invalid.error).toContain("Invalid withdrawal transition");
  });
});
describe("reward jar and ledger", () => {
  it("derives the reward jar from auditable reward ledger states", () => {
    expect(demoRewardLedger.map((entry) => entry.status)).toEqual([
      "available",
      "available",
      "available",
      "pending",
      "locked",
      "paid"
    ]);
    expect(demoRewardJar.totalBalanceAmount).toBe(13.5);
    expect(demoRewardJar.availableAmount).toBe(5.7);
    expect(demoRewardJar.pendingAmount).toBe(1.8);
    expect(demoRewardJar.lockedAmount).toBe(6);
    expect(demoRewardJar.statusCounts).toMatchObject({
      available: 3,
      pending: 1,
      locked: 1,
      paid: 1
    });
  });

  it("keeps reward funding separate from simulated investment changes", () => {
    expect(demoRewardJar.disclosure).toContain("银行活动预算");
    expect(demoRewardJar.rewardRuleSummary).toContain("模拟投资涨跌不会进入奖励计算");
    expect(demoRewardLedger.find((entry) => entry.sourceType === "learning_cycle")?.sourceId).toBe(demoSimulationCycleRun.id);
    expect(demoRewardLedger.find((entry) => entry.sourceType === "learning_cycle")?.description).toContain("活动奖励");
  });

  it("supports recalculating reward jar snapshots from a subset of entries", () => {
    const snapshot = createRewardJarSnapshot(demoRewardLedger.slice(0, 2));

    expect(snapshot.totalBalanceAmount).toBe(3.7);
    expect(snapshot.availableAmount).toBe(3.7);
    expect(snapshot.lockedAmount).toBe(0);
    expect(snapshot.minimumWithdrawalAmount).toBe(5);
  });

  it("uses the reward jar balance on the Today home summary", () => {
    expect(demoTodayHomeSummary.balances.rewardJarAmount).toBe(demoRewardJar.totalBalanceAmount);
    expect(demoTodayHomeSummary.withdrawalWindow).toEqual(demoRewardJar.withdrawalWindow);
  });
});
describe("disclosures and audit logs", () => {
  it("publishes active disclosure versions for regulated product boundaries", () => {
    expect(demoDisclosureVersions.map((disclosure) => disclosure.type)).toEqual([
      "virtual_balance",
      "simulation",
      "reward_rule",
      "withdrawal",
      "real_product_redirect"
    ]);
    expect(demoDisclosureVersions.every((disclosure) => disclosure.status === "active")).toBe(true);
    expect(demoDisclosureVersions.find((disclosure) => disclosure.type === "virtual_balance")?.body).toContain("不是存款、现金");
    expect(demoDisclosureVersions.find((disclosure) => disclosure.type === "reward_rule")?.body).toContain("不是模拟投资收益");
  });

  it("tracks accepted and pending disclosure versions by required context", () => {
    const withdrawalRequired = getRequiredDisclosureVersions("withdrawal");
    const withdrawalPending = getPendingDisclosureVersions("withdrawal");

    expect(withdrawalRequired.map((disclosure) => disclosure.type)).toEqual(["reward_rule", "withdrawal"]);
    expect(demoDisclosureAcceptances.map((acceptance) => acceptance.disclosureType)).toContain("reward_rule");
    expect(withdrawalPending.map((disclosure) => disclosure.type)).toEqual(["withdrawal"]);
    expect(demoComplianceSummary).toMatchObject({
      requiredDisclosureCount: 2,
      acceptedDisclosureCount: 1,
      pendingDisclosureCount: 1
    });
  });

  it("creates acceptance records with matching audit logs", () => {
    const result = createDisclosureAcceptance("disclosure-withdrawal-v1", {
      channel: "mobile",
      userAgent: "GrowthmoreMobile/0.1 test"
    });

    expect(result.error).toBeNull();
    expect(result.acceptance).toMatchObject({
      disclosureId: "disclosure-withdrawal-v1",
      disclosureType: "withdrawal",
      version: "withdrawal-2026-09-v1",
      channel: "mobile"
    });
    expect(result.auditLog).toMatchObject({
      action: "disclosure.accepted",
      entityType: "disclosure",
      entityId: "disclosure-withdrawal-v1"
    });
  });

  it("keeps admin and system operations visible in audit logs", () => {
    const summary = createComplianceSummary("withdrawal");

    expect(demoAuditLogs.map((log) => log.action)).toContain("withdrawal.reviewed");
    expect(demoAuditLogs.map((log) => log.action)).toContain("reward.ledger_created");
    expect(summary.latestAuditLogs.length).toBeGreaterThanOrEqual(3);
    expect(summary.latestAuditLogs.every((log) => log.ipAddressMasked && log.userAgent)).toBe(true);
  });
});
