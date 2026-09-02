import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("api health", () => {
  it("returns service status", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      ok: true,
      service: "growthmore-api",
      tenant: "demo-bank"
    });
  });
});

describe("tenant configuration", () => {
  it("returns the current bank tenant and theme configuration", async () => {
    const response = await request(createApp()).get("/api/tenant/current");

    expect(response.status).toBe(200);
    expect(response.body.tenant).toMatchObject({
      slug: "demo-bank",
      displayName: "Growthmore Bank",
      appName: "成长金计划",
      theme: {
        colors: {
          primary: "#0F172A",
          cta: "#1E3A8A",
          risk: "#DC2626"
        }
      },
      featureFlags: {
        mockKyc: true,
        mockBankAccountLinking: true,
        rewardWithdrawal: true,
        realProductRedirect: false
      }
    });
    expect(response.body.tenant.disclosureCopy.virtualBalanceNotice).toContain("不是现金");
  });
});

describe("mock auth and bank account binding", () => {
  it("creates a mock verified user session", async () => {
    const response = await request(createApp()).post("/api/auth/mock-login").send({
      phone: "13800004288"
    });

    expect(response.status).toBe(201);
    expect(response.body.session).toMatchObject({
      user: {
        id: "mock-user-001",
        displayName: "Alex",
        phoneMasked: "138****4288",
        tenantSlug: "demo-bank",
        kycStatus: "mock_verified"
      },
      auth: {
        accessToken: "mock-demo-token",
        tokenType: "Bearer"
      }
    });
  });

  it("returns the current mock session", async () => {
    const response = await request(createApp()).get("/api/auth/session");

    expect(response.status).toBe(200);
    expect(response.body.session.user.phoneMasked).toBe("138****4288");
    expect(response.body.session.auth.expiresInSeconds).toBeGreaterThan(0);
  });

  it("returns the linked withdrawal bank account", async () => {
    const response = await request(createApp()).get("/api/bank-accounts/current");

    expect(response.status).toBe(200);
    expect(response.body.account).toMatchObject({
      id: "mock-account-001",
      bankName: "Growthmore Bank",
      accountName: "Alex",
      accountNumberMasked: "**** **** **** 4288",
      currency: "CNY",
      status: "linked",
      isWithdrawalAccount: true
    });
  });
});

describe("app home", () => {
  it("returns the Today home summary for the mobile app", async () => {
    const response = await request(createApp()).get("/api/app/home");

    expect(response.status).toBe(200);
    expect(response.body.home).toMatchObject({
      userId: "mock-user-001",
      tenantSlug: "demo-bank",
      level: {
        label: "Level 2",
        planName: "稳健成长计划",
        remainingTaskCount: 2
      },
      balances: {
        virtualGrowthAmount: 1550,
        rewardJarAmount: 13.5,
        currency: "CNY"
      },
      recommendedTask: {
        id: "risk-lesson",
        type: "learning",
        ctaLabel: "开始今日任务"
      },
      withdrawalWindow: {
        status: "open"
      }
    });
    expect(response.body.home.level.progressPercent).toBeGreaterThan(0);
    expect(response.body.home.nextActions).toHaveLength(3);
  });
});


describe("virtual balance", () => {
  it("returns the ledger-derived virtual balance snapshot", async () => {
    const response = await request(createApp()).get("/api/virtual-balance");

    expect(response.status).toBe(200);
    expect(response.body.balance).toMatchObject({
      availableAmount: 1550,
      allocatedAmount: 250,
      frozenAmount: 100,
      totalAmount: 1900,
      currency: "CNY",
      dailyEarnLimitAmount: 3000,
      todayEarnedAmount: 0
    });
    expect(response.body.balance.disclosure).toContain("不是现金");
  });

  it("returns the auditable virtual balance ledger", async () => {
    const response = await request(createApp()).get("/api/virtual-balance/ledger");

    expect(response.status).toBe(200);
    expect(response.body.ledger).toHaveLength(7);
    expect(response.body.ledger[0]).toMatchObject({
      entryType: "earn",
      amount: 1000,
      sourceType: "task",
      sourceId: "profile-kyc-mock",
      ruleVersion: "demo-mvp-v1"
    });
    expect(response.body.ledger.at(-1).balanceAfter).toMatchObject({
      availableAmount: 1550,
      allocatedAmount: 250,
      frozenAmount: 100,
      totalAmount: 1900
    });
  });
});

describe("simulation products and allocations", () => {
  it("returns the MVP simulation product pool", async () => {
    const response = await request(createApp()).get("/api/simulation/products");

    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(5);
    expect(response.body.products.map((product: { name: string }) => product.name)).toContain("模拟黄金");
    expect(response.body.products[0]).toMatchObject({
      id: "term-deposit",
      riskLabel: "低风险",
      learningGoal: "理解固定收益和期限"
    });
  });

  it("returns the current allocation draft", async () => {
    const response = await request(createApp()).get("/api/simulation/allocations");

    expect(response.status).toBe(200);
    expect(response.body.allocationDraft).toMatchObject({
      availableAmount: 1550,
      totalAllocatedAmount: 1250,
      unallocatedAmount: 300,
      riskLabel: "稳健均衡学习组合"
    });
    expect(response.body.allocationDraft.allocations).toHaveLength(5);
    expect(response.body.allocationDraft.examples).toHaveLength(3);
  });

  it("saves a valid allocation draft", async () => {
    const response = await request(createApp()).put("/api/simulation/allocations").send({
      allocations: [
        { productId: "term-deposit", amount: 500 },
        { productId: "money-market", amount: 400 },
        { productId: "bond", amount: 300 }
      ]
    });

    expect(response.status).toBe(200);
    expect(response.body.allocationDraft).toMatchObject({
      totalAllocatedAmount: 1200,
      unallocatedAmount: 350
    });
    expect(response.body.allocationDraft.allocations.map((allocation: { percent: number }) => allocation.percent)).toEqual([
      42,
      33,
      25
    ]);
  });

  it("rejects invalid allocations", async () => {
    const response = await request(createApp()).put("/api/simulation/allocations").send({
      allocations: [
        { productId: "missing-product", amount: 2000 }
      ]
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("invalid_simulation_allocations");
    expect(response.body.messages).toContain("Unknown simulation product: missing-product");
    expect(response.body.messages).toContain("Allocated amount cannot exceed available virtual growth balance.");
  });
});
describe("simulation learning cycle and reflection", () => {
  it("returns the current learning cycle run", async () => {
    const response = await request(createApp()).get("/api/simulation/runs/current");

    expect(response.status).toBe(200);
    expect(response.body.run).toMatchObject({
      id: "simulation-run-2026-08-w4",
      cycleLabel: "2026 年 8 月第 4 周学习周期",
      startingVirtualAmount: 1250,
      rewardActivityAmount: 1.8,
      riskConfirmationRequired: true
    });
    expect(response.body.run.disclosure).toContain("不进入真实奖励计算");
    expect(response.body.run.productResults).toHaveLength(5);
    expect(response.body.run.reflectionQuestions).toHaveLength(3);
  });

  it("runs a learning cycle for submitted allocations", async () => {
    const response = await request(createApp()).post("/api/simulation/run").send({
      allocations: [
        { productId: "term-deposit", amount: 400 },
        { productId: "money-market", amount: 300 }
      ]
    });

    expect(response.status).toBe(201);
    expect(response.body.run).toMatchObject({
      startingVirtualAmount: 700,
      riskConfirmationRequired: false,
      rewardActivityAmount: 1.8
    });
    expect(response.body.run.productResults).toHaveLength(2);
  });

  it("rejects invalid allocations before running a cycle", async () => {
    const response = await request(createApp()).post("/api/simulation/run").send({
      allocations: [{ productId: "missing-product", amount: 50 }]
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("invalid_simulation_allocations");
  });

  it("requires reflection answers and high-volatility confirmation", async () => {
    const response = await request(createApp()).post("/api/simulation/runs/simulation-run-2026-08-w4/reflection").send({
      answers: [{ questionId: "highest-volatility", answer: "模拟黄金" }],
      riskConfirmationAccepted: false
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("incomplete_simulation_reflection");
    expect(response.body.reflection.messages).toContain("Risk confirmation is required for high-volatility simulation products.");
  });

  it("accepts a complete reflection submission", async () => {
    const response = await request(createApp()).post("/api/simulation/runs/simulation-run-2026-08-w4/reflection").send({
      answers: [
        { questionId: "highest-volatility", answer: "模拟黄金" },
        { questionId: "allocation-lesson", answer: "分散配置能降低单一资产波动影响" },
        { questionId: "reward-boundary", answer: "奖励来自银行活动预算，不来自模拟涨跌" }
      ],
      riskConfirmationAccepted: true
    });

    expect(response.status).toBe(201);
    expect(response.body.reflection).toMatchObject({
      completed: true,
      learningCompletionCoefficient: 1,
      acceptedRiskConfirmation: true
    });
  });

  it("returns 404 for unknown simulation runs", async () => {
    const response = await request(createApp()).post("/api/simulation/runs/missing-run/reflection").send({
      answers: [],
      riskConfirmationAccepted: true
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("simulation_run_not_found");
  });
});
describe("reward jar and ledger", () => {
  it("returns the reward jar summary", async () => {
    const response = await request(createApp()).get("/api/rewards/jar");

    expect(response.status).toBe(200);
    expect(response.body.rewardJar).toMatchObject({
      currency: "CNY",
      totalBalanceAmount: 13.5,
      availableAmount: 5.7,
      lockedAmount: 6,
      pendingAmount: 1.8,
      minimumWithdrawalAmount: 5
    });
    expect(response.body.rewardJar.rewardRuleSummary).toContain("模拟投资涨跌不会进入奖励计算");
    expect(response.body.rewardJar.ledger).toHaveLength(6);
  });

  it("returns reward history with source and budget audit fields", async () => {
    const response = await request(createApp()).get("/api/rewards/history");

    expect(response.status).toBe(200);
    expect(response.body.ledger).toHaveLength(6);
    expect(response.body.ledger[0]).toMatchObject({
      id: "rwd-001",
      status: "available",
      sourceType: "task",
      sourceId: "risk-lesson",
      budgetBatchId: "budget-2026-08-learning",
      activityRuleVersion: "reward-demo-v1"
    });
    expect(response.body.ledger.map((entry: { status: string }) => entry.status)).toContain("locked");
  });
});


describe("disclosures and audit logs", () => {
  it("returns active disclosure versions", async () => {
    const response = await request(createApp()).get("/api/disclosures");

    expect(response.status).toBe(200);
    expect(response.body.disclosures).toHaveLength(5);
    expect(response.body.disclosures.map((disclosure: { type: string }) => disclosure.type)).toContain("withdrawal");
    expect(response.body.disclosures.find((disclosure: { type: string }) => disclosure.type === "reward_rule").body).toContain(
      "不是模拟投资收益"
    );
  });

  it("returns required and pending disclosures for withdrawal", async () => {
    const response = await request(createApp()).get("/api/disclosures/required?requiredFor=withdrawal");

    expect(response.status).toBe(200);
    expect(response.body.requiredFor).toBe("withdrawal");
    expect(response.body.disclosures.map((disclosure: { type: string }) => disclosure.type)).toEqual([
      "reward_rule",
      "withdrawal"
    ]);
    expect(response.body.pendingDisclosures.map((disclosure: { type: string }) => disclosure.type)).toEqual(["withdrawal"]);
  });

  it("rejects unknown disclosure contexts", async () => {
    const response = await request(createApp()).get("/api/disclosures/required?requiredFor=unknown");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("invalid_disclosure_context");
  });

  it("accepts a disclosure version and returns an audit log", async () => {
    const response = await request(createApp()).post("/api/disclosures/disclosure-withdrawal-v1/accept").set({
      "User-Agent": "GrowthmoreMobile/0.1 test"
    });

    expect(response.status).toBe(201);
    expect(response.body.acceptance).toMatchObject({
      disclosureId: "disclosure-withdrawal-v1",
      disclosureType: "withdrawal",
      channel: "api"
    });
    expect(response.body.auditLog).toMatchObject({
      action: "disclosure.accepted",
      entityType: "disclosure"
    });
  });

  it("returns current disclosure acceptance summary", async () => {
    const response = await request(createApp()).get("/api/disclosure-acceptances/current");

    expect(response.status).toBe(200);
    expect(response.body.acceptances).toHaveLength(3);
    expect(response.body.compliance).toMatchObject({
      requiredDisclosureCount: 2,
      acceptedDisclosureCount: 1,
      pendingDisclosureCount: 1
    });
  });

  it("returns admin audit logs", async () => {
    const response = await request(createApp()).get("/api/admin/audit-logs");

    expect(response.status).toBe(200);
    expect(response.body.auditLogs).toHaveLength(5);
    expect(response.body.auditLogs.map((log: { action: string }) => log.action)).toContain("withdrawal.reviewed");
    expect(response.body.auditLogs.every((log: { ipAddressMasked: string; userAgent: string }) => log.ipAddressMasked && log.userAgent)).toBe(true);
  });
});
describe("withdrawals", () => {
  it("submits a withdrawal request for manual review", async () => {
    const response = await request(createApp()).post("/api/rewards/withdraw").send({ amount: 5 });

    expect(response.status).toBe(201);
    expect(response.body.withdrawal).toMatchObject({
      amount: 5,
      currency: "CNY",
      status: "submitted",
      estimatedArrivalLabel: "审核通过后 T+1 入账"
    });
    expect(response.body.withdrawal.disclosure).toContain("不接真实打款");
  });

  it("rejects invalid withdrawal requests", async () => {
    const response = await request(createApp()).post("/api/rewards/withdraw").send({ amount: 999 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("invalid_withdrawal_request");
    expect(response.body.messages).toContain("Withdrawal amount cannot exceed available reward balance.");
  });

  it("returns withdrawal requests with failure and rejection reasons", async () => {
    const response = await request(createApp()).get("/api/withdrawals");

    expect(response.status).toBe(200);
    expect(response.body.withdrawals).toHaveLength(3);
    expect(response.body.withdrawals.map((withdrawal: { status: string }) => withdrawal.status)).toEqual([
      "under_review",
      "rejected",
      "failed"
    ]);
    expect(response.body.withdrawals[1].rejectionReason).toContain("账户状态");
    expect(response.body.withdrawals[2].failureReason).toContain("银行通道");
  });

  it("supports admin withdrawal approve, reject, and retry actions", async () => {
    const approved = await request(createApp()).post("/api/admin/withdrawals/withdrawal-2026-09-review/approve").send({
      reviewerId: "ops-demo"
    });
    const rejected = await request(createApp()).post("/api/admin/withdrawals/withdrawal-2026-09-review/reject").send({
      reason: "账户信息不一致"
    });
    const retried = await request(createApp()).post("/api/admin/withdrawals/withdrawal-2026-08-failed/retry");

    expect(approved.status).toBe(200);
    expect(approved.body.withdrawal.status).toBe("approved");
    expect(approved.body.withdrawal.reviewerId).toBe("ops-demo");
    expect(rejected.status).toBe(200);
    expect(rejected.body.withdrawal.status).toBe("rejected");
    expect(rejected.body.withdrawal.rejectionReason).toBe("账户信息不一致");
    expect(retried.status).toBe(200);
    expect(retried.body.withdrawal.status).toBe("under_review");
  });

  it("rejects unknown or invalid admin withdrawal transitions", async () => {
    const missing = await request(createApp()).post("/api/admin/withdrawals/missing/approve");
    const invalid = await request(createApp()).post("/api/admin/withdrawals/withdrawal-2026-08-rejected/retry");

    expect(missing.status).toBe(404);
    expect(missing.body.error).toBe("withdrawal_not_found");
    expect(invalid.status).toBe(409);
    expect(invalid.body.error).toBe("invalid_withdrawal_transition");
  });
});
describe("task system", () => {
  it("returns the task board summary and task list", async () => {
    const response = await request(createApp()).get("/api/tasks");

    expect(response.status).toBe(200);
    expect(response.body.summary).toMatchObject({
      completionStreakDays: 4,
      totalTaskCount: 6,
      statusCounts: {
        available: 1,
        in_progress: 1,
        pending_verification: 1,
        completed: 1,
        claimed: 1,
        rejected: 1,
        reversed: 0
      }
    });
    expect(response.body.tasks.map((task: { id: string }) => task.id)).toContain("risk-lesson");
  });

  it("returns a task detail", async () => {
    const response = await request(createApp()).get("/api/tasks/risk-lesson");

    expect(response.status).toBe(200);
    expect(response.body.task).toMatchObject({
      id: "risk-lesson",
      category: "learning",
      status: "in_progress",
      availableActions: ["submit"]
    });
  });

  it("supports starting an available task", async () => {
    const response = await request(createApp()).post("/api/tasks/daily-check-in/start");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      action: "start",
      task: {
        id: "daily-check-in",
        status: "in_progress",
        availableActions: ["submit"]
      }
    });
  });

  it("supports submitting an in-progress task", async () => {
    const response = await request(createApp()).post("/api/tasks/risk-lesson/submit");

    expect(response.status).toBe(200);
    expect(response.body.task.status).toBe("pending_verification");
    expect(response.body.task.availableActions).toEqual(["approve", "reject"]);
  });

  it("supports approving or rejecting a pending task", async () => {
    const approved = await request(createApp()).post("/api/tasks/auto-savings-mock/verify").send({
      result: "approved"
    });
    const rejected = await request(createApp()).post("/api/tasks/auto-savings-mock/verify").send({
      result: "rejected"
    });

    expect(approved.status).toBe(200);
    expect(approved.body.task.status).toBe("completed");
    expect(rejected.status).toBe(200);
    expect(rejected.body.task.status).toBe("rejected");
    expect(rejected.body.task.rejectionReason).toContain("不匹配");
  });

  it("supports claiming a completed task", async () => {
    const response = await request(createApp()).post("/api/tasks/profile-kyc-mock/claim");

    expect(response.status).toBe(200);
    expect(response.body.task.status).toBe("claimed");
    expect(response.body.task.claimedAt).toBeTruthy();
  });

  it("rejects invalid task transitions", async () => {
    const response = await request(createApp()).post("/api/tasks/bank-account-linked/start");

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("invalid_task_transition");
  });

  it("returns 404 for unknown task ids", async () => {
    const response = await request(createApp()).get("/api/tasks/missing-task");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("task_not_found");
  });
});
