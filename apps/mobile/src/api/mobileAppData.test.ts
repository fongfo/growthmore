import { describe, expect, it, vi } from "vitest";
import { demoTenant } from "@growthmore/shared";
import { defaultApiBaseUrl, fallbackMobileAppData, loadMobileAppData, railwayApiBaseUrl } from "./mobileAppData";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    json: () => Promise.resolve(body),
    ok,
    status
  } as Response;
}

describe("mobile API data loader", () => {
  it("defaults preview builds to the Railway API", () => {
    expect(defaultApiBaseUrl).toBe(railwayApiBaseUrl);
  });

  it("loads the mobile app aggregate from the Growthmore API", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const path = url.replace(defaultApiBaseUrl, "");
      const fixtures: Record<string, unknown> = {
        "/api/app/home": { home: fallbackMobileAppData.home },
        "/api/auth/session": { session: fallbackMobileAppData.session },
        "/api/bank-accounts/current": { account: fallbackMobileAppData.linkedBankAccount },
        "/api/disclosure-acceptances/current": { compliance: fallbackMobileAppData.complianceSummary },
        "/api/rewards/history": { ledger: fallbackMobileAppData.rewardLedger },
        "/api/rewards/jar": { rewardJar: fallbackMobileAppData.rewardJar },
        "/api/simulation/allocations": { allocationDraft: fallbackMobileAppData.allocationDraft },
        "/api/simulation/products": { products: fallbackMobileAppData.simulationProducts },
        "/api/simulation/runs/current": { run: fallbackMobileAppData.simulationRun },
        "/api/tasks": { summary: fallbackMobileAppData.taskBoard, tasks: fallbackMobileAppData.tasks },
        "/api/tenant/current": { tenant: demoTenant },
        "/api/virtual-balance": { balance: fallbackMobileAppData.virtualBalance },
        "/api/virtual-balance/ledger": { ledger: fallbackMobileAppData.virtualBalanceLedger },
        "/api/withdrawals": { withdrawals: fallbackMobileAppData.withdrawals }
      };

      return jsonResponse(fixtures[path]);
    });

    const data = await loadMobileAppData(defaultApiBaseUrl, fetcher);

    expect(data.tenant.displayName).toBe("Growthmore Bank");
    expect(data.tasks).toHaveLength(fallbackMobileAppData.tasks.length);
    expect(data.rewardJar.availableAmount).toBe(fallbackMobileAppData.rewardJar.availableAmount);
    expect(fetcher).toHaveBeenCalledWith(`${defaultApiBaseUrl}/api/app/home`);
  });

  it("fails fast when an API endpoint is not healthy", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ error: "offline" }, false, 503));

    await expect(loadMobileAppData(defaultApiBaseUrl, fetcher)).rejects.toThrow("GET /api/tenant/current failed with 503");
  });
});
