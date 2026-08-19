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

