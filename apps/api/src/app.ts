import cors from "cors";
import express, { type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import {
  applyTaskAction,
  applyWithdrawalReviewAction,
  createSimulationCycleRun,
  demoLinkedBankAccount,
  demoMockSession,
  demoRewardJar,
  demoRewardLedger,
  demoWithdrawalRequests,
  createSimulationAllocationDraft,
  demoSimulationAllocationDraft,
  demoSimulationCycleRun,
  demoSimulationProducts,
  demoTaskBoardSummary,
  demoTenant,
  demoTodayHomeSummary,
  demoUserTasks,
  demoVirtualBalance,
  demoVirtualBalanceLedger,
  findDemoWithdrawalRequest,
  createWithdrawalRequest,
  validateSimulationAllocations,
  validateSimulationReflection,
  type SimulationAllocation,
  type SimulationReflectionSubmission,
  type TaskAction,
  type UserTask
} from "@growthmore/shared";

function findDemoTask(taskId: string): UserTask | undefined {
  return demoUserTasks.find((task) => task.id === taskId);
}

function respondWithTaskAction(response: Response, task: UserTask, action: TaskAction) {
  try {
    response.json({
      action,
      task: applyTaskAction(task, action)
    });
  } catch (error) {
    response.status(409).json({
      error: "invalid_task_transition",
      message: error instanceof Error ? error.message : "Task transition is not allowed."
    });
  }
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/health", (_request, response) => {
    response.json({
      ok: true,
      service: "growthmore-api",
      tenant: demoTenant.slug
    });
  });

  app.get("/api/tenant/current", (_request, response) => {
    response.json({
      tenant: demoTenant
    });
  });

  app.post("/api/auth/mock-login", (_request, response) => {
    response.status(201).json({
      session: demoMockSession
    });
  });

  app.get("/api/auth/session", (_request, response) => {
    response.json({
      session: demoMockSession
    });
  });

  app.get("/api/bank-accounts/current", (_request, response) => {
    response.json({
      account: demoLinkedBankAccount
    });
  });

  app.get("/api/app/home", (_request, response) => {
    response.json({
      home: demoTodayHomeSummary
    });
  });

  app.get("/api/virtual-balance", (_request, response) => {
    response.json({
      balance: demoVirtualBalance
    });
  });

  app.get("/api/virtual-balance/ledger", (_request, response) => {
    response.json({
      ledger: demoVirtualBalanceLedger
    });
  });

  app.get("/api/simulation/products", (_request, response) => {
    response.json({
      products: demoSimulationProducts
    });
  });

  app.get("/api/simulation/allocations", (_request, response) => {
    response.json({
      allocationDraft: demoSimulationAllocationDraft
    });
  });

  app.put("/api/simulation/allocations", (request, response) => {
    const allocations = Array.isArray(request.body?.allocations)
      ? (request.body.allocations as Array<Pick<SimulationAllocation, "productId" | "amount">>)
      : [];
    const errors = validateSimulationAllocations(demoVirtualBalance.availableAmount, allocations);

    if (errors.length > 0) {
      response.status(400).json({
        error: "invalid_simulation_allocations",
        messages: errors
      });
      return;
    }

    response.json({
      allocationDraft: createSimulationAllocationDraft(demoVirtualBalance.availableAmount, allocations)
    });
  });

  app.get("/api/simulation/runs/current", (_request, response) => {
    response.json({
      run: demoSimulationCycleRun
    });
  });

  app.post("/api/simulation/run", (request, response) => {
    const allocations = Array.isArray(request.body?.allocations)
      ? (request.body.allocations as Array<Pick<SimulationAllocation, "productId" | "amount">>)
      : demoSimulationAllocationDraft.allocations;
    const errors = validateSimulationAllocations(demoVirtualBalance.availableAmount, allocations);

    if (errors.length > 0) {
      response.status(400).json({
        error: "invalid_simulation_allocations",
        messages: errors
      });
      return;
    }

    response.status(201).json({
      run: createSimulationCycleRun(createSimulationAllocationDraft(demoVirtualBalance.availableAmount, allocations))
    });
  });

  app.post("/api/simulation/runs/:runId/reflection", (request, response) => {
    const run = request.params.runId === demoSimulationCycleRun.id ? demoSimulationCycleRun : null;

    if (!run) {
      response.status(404).json({ error: "simulation_run_not_found" });
      return;
    }

    const submission: SimulationReflectionSubmission = {
      runId: request.params.runId,
      answers: Array.isArray(request.body?.answers) ? request.body.answers : [],
      riskConfirmationAccepted: request.body?.riskConfirmationAccepted === true
    };
    const result = validateSimulationReflection(run, submission);

    if (!result.completed) {
      response.status(400).json({
        error: "incomplete_simulation_reflection",
        reflection: result
      });
      return;
    }

    response.status(201).json({
      reflection: result
    });
  });
  app.get("/api/rewards/jar", (_request, response) => {
    response.json({
      rewardJar: demoRewardJar
    });
  });

  app.get("/api/rewards/history", (_request, response) => {
    response.json({
      ledger: demoRewardLedger
    });
  });
  app.post("/api/rewards/withdraw", (request, response) => {
    const amount = Number(request.body?.amount);
    const result = createWithdrawalRequest(demoRewardJar, demoLinkedBankAccount, amount);

    if (result.errors.length > 0) {
      response.status(400).json({
        error: "invalid_withdrawal_request",
        messages: result.errors
      });
      return;
    }

    response.status(201).json({
      withdrawal: result.request
    });
  });

  app.get("/api/withdrawals", (_request, response) => {
    response.json({
      withdrawals: demoWithdrawalRequests
    });
  });

  app.post("/api/admin/withdrawals/:withdrawalId/approve", (request, response) => {
    const withdrawal = findDemoWithdrawalRequest(request.params.withdrawalId);

    if (!withdrawal) {
      response.status(404).json({ error: "withdrawal_not_found" });
      return;
    }

    const result = applyWithdrawalReviewAction(withdrawal, "approve", { reviewerId: request.body?.reviewerId });

    if (result.error) {
      response.status(409).json({ error: "invalid_withdrawal_transition", message: result.error });
      return;
    }

    response.json({ action: "approve", withdrawal: result.request });
  });

  app.post("/api/admin/withdrawals/:withdrawalId/reject", (request, response) => {
    const withdrawal = findDemoWithdrawalRequest(request.params.withdrawalId);

    if (!withdrawal) {
      response.status(404).json({ error: "withdrawal_not_found" });
      return;
    }

    const result = applyWithdrawalReviewAction(withdrawal, "reject", {
      reason: request.body?.reason,
      reviewerId: request.body?.reviewerId
    });

    if (result.error) {
      response.status(409).json({ error: "invalid_withdrawal_transition", message: result.error });
      return;
    }

    response.json({ action: "reject", withdrawal: result.request });
  });

  app.post("/api/admin/withdrawals/:withdrawalId/retry", (request, response) => {
    const withdrawal = findDemoWithdrawalRequest(request.params.withdrawalId);

    if (!withdrawal) {
      response.status(404).json({ error: "withdrawal_not_found" });
      return;
    }

    const result = applyWithdrawalReviewAction(withdrawal, "retry", { reviewerId: request.body?.reviewerId });

    if (result.error) {
      response.status(409).json({ error: "invalid_withdrawal_transition", message: result.error });
      return;
    }

    response.json({ action: "retry", withdrawal: result.request });
  });
  app.get("/api/tasks", (_request, response) => {
    response.json({
      summary: demoTaskBoardSummary,
      tasks: demoUserTasks
    });
  });

  app.get("/api/tasks/:taskId", (request, response) => {
    const task = findDemoTask(request.params.taskId);

    if (!task) {
      response.status(404).json({ error: "task_not_found" });
      return;
    }

    response.json({ task });
  });

  app.post("/api/tasks/:taskId/start", (request, response) => {
    const task = findDemoTask(request.params.taskId);

    if (!task) {
      response.status(404).json({ error: "task_not_found" });
      return;
    }

    respondWithTaskAction(response, task, "start");
  });

  app.post("/api/tasks/:taskId/submit", (request, response) => {
    const task = findDemoTask(request.params.taskId);

    if (!task) {
      response.status(404).json({ error: "task_not_found" });
      return;
    }

    respondWithTaskAction(response, task, "submit");
  });

  app.post("/api/tasks/:taskId/verify", (request, response) => {
    const task = findDemoTask(request.params.taskId);

    if (!task) {
      response.status(404).json({ error: "task_not_found" });
      return;
    }

    respondWithTaskAction(response, task, request.body?.result === "rejected" ? "reject" : "approve");
  });

  app.post("/api/tasks/:taskId/claim", (request, response) => {
    const task = findDemoTask(request.params.taskId);

    if (!task) {
      response.status(404).json({ error: "task_not_found" });
      return;
    }

    respondWithTaskAction(response, task, "claim");
  });

  return app;
}
