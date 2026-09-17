import { describe, expect, it, vi } from "vitest";
import { demoTenant } from "@growthmore/shared";
import { acceptDisclosure, defaultApiBaseUrl, fallbackMobileAppData, loadMobileAppData, markLessonSectionRead, railwayApiBaseUrl, resolveApiBaseUrl, runSimulationCycle, runTaskAction, saveSimulationAllocations, submitLearningQuiz, submitSimulationReflection, updateHomeIntroduction } from "./mobileAppData";

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

  it("falls back to the Railway API when no runtime env is available", () => {
    expect(resolveApiBaseUrl(undefined)).toBe(railwayApiBaseUrl);
  });

  it("uses an Expo public API URL when it is provided", () => {
    expect(resolveApiBaseUrl({ env: { EXPO_PUBLIC_API_BASE_URL: "https://api.example.test" } })).toBe(
      "https://api.example.test"
    );
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

  it("posts a task action and returns the updated task", async () => {
    const updatedTask = { ...fallbackMobileAppData.tasks[0]!, status: "in_progress" as const };
    const fetcher = vi.fn(async () => jsonResponse({ action: "start", task: updatedTask }));

    const result = await runTaskAction("daily-check-in", "start", defaultApiBaseUrl, fetcher);

    expect(result.task.status).toBe("in_progress");
    expect(fetcher).toHaveBeenCalledWith(
      defaultApiBaseUrl + "/api/tasks/daily-check-in/start",
      { method: "POST", headers: { "Content-Type": "application/json" } }
    );
  });

  it("updates the independent Today introduction preference", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ home: { ...fallbackMobileAppData.home, introduction: { dismissed: true } } }));
    const result = await updateHomeIntroduction(true, defaultApiBaseUrl, fetcher);
    expect(result.home.introduction.dismissed).toBe(true);
    expect(fetcher).toHaveBeenCalledWith(defaultApiBaseUrl + "/api/app/home/introduction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissed: true })
    });
  });

  it("accepts a specific disclosure version through the mobile channel", async () => {
    const acceptance = fallbackMobileAppData.complianceSummary.acceptedDisclosures[0]!;
    const fetcher = vi.fn(async () => jsonResponse({ acceptance, idempotent: false }, true, 201));
    const result = await acceptDisclosure(acceptance.disclosureId, defaultApiBaseUrl, fetcher);
    expect(result.acceptance.disclosureId).toBe(acceptance.disclosureId);
    expect(fetcher).toHaveBeenCalledWith(defaultApiBaseUrl + "/api/disclosures/" + acceptance.disclosureId + "/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "mobile" })
    });
  });

  it("surfaces the API message when a task action fails", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ message: "Task is already claimed." }, false, 409));

    await expect(runTaskAction("daily-check-in", "claim", defaultApiBaseUrl, fetcher)).rejects.toThrow(
      "Task is already claimed."
    );
  });

  it("sends lesson progress and quiz answers to the server", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ progress: { readSectionIds: ["virtual-growth"] } }));

    await markLessonSectionRead("growth-and-reward-basics", "virtual-growth", defaultApiBaseUrl, fetcher);
    await submitLearningQuiz("growth-reward-check", "reward-follows-rules", defaultApiBaseUrl, fetcher);

    expect(fetcher).toHaveBeenNthCalledWith(1, defaultApiBaseUrl + "/api/learning/lessons/growth-and-reward-basics/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: "virtual-growth" })
    });
    expect(fetcher).toHaveBeenNthCalledWith(2, defaultApiBaseUrl + "/api/learning/quizzes/growth-reward-check/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerId: "reward-follows-rules" })
    });
  });

  it("saves edited simulation allocations", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ allocationDraft: fallbackMobileAppData.allocationDraft }));
    const allocations = [{ productId: "bond", amount: 500 }];
    await saveSimulationAllocations(allocations, defaultApiBaseUrl, fetcher);
    expect(fetcher).toHaveBeenCalledWith(defaultApiBaseUrl + "/api/simulation/allocations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allocations })
    });
  });

  it("runs and submits a persisted learning-cycle review", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ run: fallbackMobileAppData.simulationRun, reflection: { completed: true } }));
    await runSimulationCycle(defaultApiBaseUrl, fetcher);
    await submitSimulationReflection({
      runId: fallbackMobileAppData.simulationRun.id,
      answers: [{ questionId: "highest-volatility", answer: "gold" }],
      riskConfirmationAccepted: true
    }, defaultApiBaseUrl, fetcher);
    expect(fetcher).toHaveBeenNthCalledWith(1, defaultApiBaseUrl + "/api/simulation/run", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{}"
    });
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      defaultApiBaseUrl + "/api/simulation/runs/" + fallbackMobileAppData.simulationRun.id + "/reflection",
      expect.objectContaining({ method: "POST" })
    );
  });
});
