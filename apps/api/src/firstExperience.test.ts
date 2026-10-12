import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request, { type Test } from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

const reflection = {
  answers: [
    { questionId: "highest-volatility", answer: "模拟黄金" },
    { questionId: "allocation-lesson", answer: "分散配置降低集中风险" },
    { questionId: "reward-boundary", answer: "奖励来自活动预算和规则" }
  ],
  riskConfirmationAccepted: true
};

describe("first experience acceptance regression", () => {
  it("derives an ordered demo funnel from persisted business facts and isolates users", async () => {
    const directory = mkdtempSync(join(tmpdir(), "growthmore-first-experience-"));
    const databasePath = join(directory, "demo.sqlite");
    let activeStore: { close: () => void } | null = null;
    let restartedStore: { close: () => void } | null = null;
    try {
      const app = createApp({ databasePath });
      activeStore = app.locals.demoStore;
      const login = await request(app).post("/api/auth/mock-login").send({ phone: "13900003434" }).expect(201);
      const otherLogin = await request(app).post("/api/auth/mock-login").send({ phone: "13900003435" }).expect(201);
      const token = login.body.session.auth.accessToken as string;
      const otherToken = otherLogin.body.session.auth.accessToken as string;
      const auth = (call: Test) => call.set("Authorization", `Bearer ${token}`);

      const initial = await auth(request(app).get("/api/app/first-experience-funnel")).expect(200);
      expect(initial.body.funnel).toMatchObject({ environment: "demo", completedStageCount: 0, nextStage: "task" });
      const initialBalance = await auth(request(app).get("/api/virtual-balance")).expect(200);
      expect(initialBalance.body.balance.totalAmount).toBe(0);
      const taskDisclosures = await auth(request(app).get("/api/disclosures/required?requiredFor=task")).expect(200);
      for (const disclosure of taskDisclosures.body.pendingDisclosures as Array<{ id: string }>) {
        await auth(request(app).post(`/api/disclosures/${disclosure.id}/accept`)).send({ channel: "mobile" }).expect(201);
      }
      await auth(request(app).post("/api/tasks/daily-check-in/start")).expect(200);
      await auth(request(app).post("/api/tasks/daily-check-in/submit")).expect(200);
      await auth(request(app).post("/api/tasks/daily-check-in/claim")).expect(200);
      await auth(request(app).post("/api/tasks/profile-kyc-mock/start")).expect(200);
      await auth(request(app).post("/api/tasks/profile-kyc-mock/submit")).send({
        eventId: "first-experience-profile",
        values: { fullName: "Demo User", identityLast4: "3434", confirmMock: true }
      }).expect(200);
      const afterTask = await auth(request(app).get("/api/app/first-experience-funnel")).expect(200);
      expect(afterTask.body.funnel).toMatchObject({ completedStageCount: 1, nextStage: "allocation" });

      const simulationDisclosures = await auth(request(app).get("/api/disclosures/required?requiredFor=simulation")).expect(200);
      for (const disclosure of simulationDisclosures.body.pendingDisclosures as Array<{ id: string }>) {
        await auth(request(app).post(`/api/disclosures/${disclosure.id}/accept`)).send({ channel: "mobile" }).expect(201);
      }
      await auth(request(app).put("/api/simulation/allocations")).send({ allocations: [{ productId: "term-deposit", amount: 100 }] }).expect(200);
      const run = await auth(request(app).post("/api/simulation/run")).send({}).expect(201);
      const rewardDisclosures = await auth(request(app).get("/api/disclosures/required?requiredFor=reward")).expect(200);
      for (const disclosure of rewardDisclosures.body.pendingDisclosures as Array<{ id: string }>) {
        await auth(request(app).post(`/api/disclosures/${disclosure.id}/accept`)).send({ channel: "mobile" }).expect(201);
      }
      await auth(request(app).post(`/api/simulation/runs/${run.body.run.id}/reflection`)).send(reflection).expect(201);
      await auth(request(app).post("/api/disclosures/disclosure-withdrawal-v1/accept")).send({ channel: "mobile" }).expect(201);
      const withdrawalPayload = { amount: 5, idempotencyKey: "first-experience-withdrawal" };
      const [first, repeated] = await Promise.all([
        auth(request(app).post("/api/rewards/withdraw")).send(withdrawalPayload),
        auth(request(app).post("/api/rewards/withdraw")).send(withdrawalPayload)
      ]);
      expect([first.status, repeated.status].sort()).toEqual([400, 400]);
      expect(first.body.messages).toContain("Withdrawal amount cannot exceed available reward balance.");
      expect(repeated.body.messages).toContain("Withdrawal amount cannot exceed available reward balance.");

      const complete = await auth(request(app).get("/api/app/first-experience-funnel")).expect(200);
      expect(complete.body.funnel).toMatchObject({ environment: "demo", completed: false, completedStageCount: 3, nextStage: "reward" });

      const isolated = await request(app).get("/api/app/first-experience-funnel").set("Authorization", `Bearer ${otherToken}`).expect(200);
      expect(isolated.body.funnel.completed).toBe(false);
      expect(isolated.body.funnel.stages.at(-1).evidenceId).toBeNull();
      app.locals.demoStore.close();
      activeStore = null;

      const restarted = createApp({ databasePath });
      restartedStore = restarted.locals.demoStore;
      const restored = await request(restarted).get("/api/app/first-experience-funnel").set("Authorization", `Bearer ${token}`).expect(200);
      expect(restored.body.funnel).toMatchObject({ completed: false, completedStageCount: 3, nextStage: "reward" });
    } finally {
      activeStore?.close();
      restartedStore?.close();
      rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  });
});
