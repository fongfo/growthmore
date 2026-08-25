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
        rewardJarAmount: 28.5,
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
