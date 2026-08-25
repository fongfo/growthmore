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
