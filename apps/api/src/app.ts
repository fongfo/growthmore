import cors from "cors";
import express, { type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import {
  applyTaskAction,
  demoLinkedBankAccount,
  demoMockSession,
  demoTaskBoardSummary,
  demoTenant,
  demoTodayHomeSummary,
  demoUserTasks,
  demoVirtualBalance,
  demoVirtualBalanceLedger,
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
