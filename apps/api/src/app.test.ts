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
        rewardJarAmount: 11.5,
        currency: "CNY"
      },
      recommendedTask: {
        id: "risk-lesson",
        type: "learning",
        ctaLabel: "开始今日任务"
      },
      withdrawalWindow: {
        status: "upcoming"
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
      totalBalanceAmount: 11.5,
      availableAmount: 3.7,
      lockedAmount: 6,
      pendingAmount: 1.8,
      minimumWithdrawalAmount: 5
    });
    expect(response.body.rewardJar.rewardRuleSummary).toContain("模拟投资涨跌不会进入奖励计算");
    expect(response.body.rewardJar.ledger).toHaveLength(5);
  });

  it("returns reward history with source and budget audit fields", async () => {
    const response = await request(createApp()).get("/api/rewards/history");

    expect(response.status).toBe(200);
    expect(response.body.ledger).toHaveLength(5);
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
