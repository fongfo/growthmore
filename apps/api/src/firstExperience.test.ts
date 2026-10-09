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
      expect(initial.body.funnel).toMatchObject({ environment: "demo", completedStageCount: 2, nextStage: "reflection" });

      await auth(request(app).put("/api/simulation/allocations")).send({ allocations: [{ productId: "term-deposit", amount: 1000 }] }).expect(200);
      const run = await auth(request(app).post("/api/simulation/run")).send({}).expect(201);
      await auth(request(app).post(`/api/simulation/runs/${run.body.run.id}/reflection`)).send(reflection).expect(201);
      await auth(request(app).post("/api/disclosures/disclosure-withdrawal-v1/accept")).send({ channel: "mobile" }).expect(201);
      const withdrawalPayload = { amount: 5, idempotencyKey: "first-experience-withdrawal" };
      const [first, repeated] = await Promise.all([
        auth(request(app).post("/api/rewards/withdraw")).send(withdrawalPayload),
        auth(request(app).post("/api/rewards/withdraw")).send(withdrawalPayload)
      ]);
      expect([first.status, repeated.status].sort()).toEqual([200, 201]);

      const complete = await auth(request(app).get("/api/app/first-experience-funnel")).expect(200);
      expect(complete.body.funnel).toMatchObject({ environment: "demo", completed: true, completedStageCount: 5, nextStage: null });
      expect(complete.body.funnel.stages.map((stage: { status: string }) => stage.status)).toEqual(Array(5).fill("complete"));

      const isolated = await request(app).get("/api/app/first-experience-funnel").set("Authorization", `Bearer ${otherToken}`).expect(200);
      expect(isolated.body.funnel.completed).toBe(false);
      expect(isolated.body.funnel.stages.at(-1).evidenceId).toBeNull();
      app.locals.demoStore.close();
      activeStore = null;

      const restarted = createApp({ databasePath });
      restartedStore = restarted.locals.demoStore;
      const restored = await request(restarted).get("/api/app/first-experience-funnel").set("Authorization", `Bearer ${token}`).expect(200);
      expect(restored.body.funnel).toMatchObject({ completed: true, completedStageCount: 5 });
    } finally {
      activeStore?.close();
      restartedStore?.close();
      rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  });
});
