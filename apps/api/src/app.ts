import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import {
  applyTaskAction,
  applyWithdrawalReviewAction,
  createDisclosureAcceptance,
  createSimulationCycleRun,
  demoDisclosureVersions,
  createSimulationAllocationDraft,
  demoSimulationProducts,
  createTaskBoardSummary,
  demoTenant,
  getRequiredDisclosureVersions,
  createWithdrawalRequest,
  validateSimulationAllocations,
  validateSimulationReflection,
  type SimulationAllocation,
  type SimulationReflectionSubmission,
  type MockUserSession,
  type TaskAction
} from "@growthmore/shared";
import { DemoStore, type DemoUserState } from "./demoStore.js";

type CreateAppOptions = { databasePath?: string; store?: DemoStore };

function bearerToken(request: Request): string | undefined {
  return request.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
}

function currentSession(response: Response): MockUserSession {
  return response.locals.session as MockUserSession;
}

function currentState(store: DemoStore, response: Response): DemoUserState {
  return store.getState(currentSession(response).user.id);
}

function respondWithTaskAction(store: DemoStore, response: Response, taskId: string, action: TaskAction) {
  const task = currentState(store, response).tasks.find((item) => item.id === taskId);
  if (!task) {
    response.status(404).json({ error: "task_not_found" });
    return;
  }
  try {
    const updatedTask = applyTaskAction(task, action);
    store.updateState(currentSession(response).user.id, (state) => ({
      ...state,
      tasks: state.tasks.map((item) => item.id === taskId ? updatedTask : item)
    }));
    response.json({ action, task: updatedTask });
  } catch (error) {
    response.status(409).json({
      error: "invalid_task_transition",
      message: error instanceof Error ? error.message : "Task transition is not allowed."
    });
  }
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const store = options.store ?? new DemoStore(options.databasePath);
  app.locals.demoStore = store;

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

  app.post("/api/auth/mock-login", (request, response) => {
    response.status(201).json({
      session: store.login(request.body?.phone)
    });
  });

  app.use("/api", (request, response, next) => {
    const session = store.getSession(bearerToken(request));
    if (!session) {
      response.status(401).json({ error: "invalid_demo_session" });
      return;
    }
    response.locals.session = session;
    next();
  });

  app.get("/api/auth/session", (_request, response) => {
    response.json({
      session: currentSession(response)
    });
  });

  app.get("/api/bank-accounts/current", (_request, response) => {
    response.json({
      account: currentState(store, response).account
    });
  });


  app.get("/api/disclosures", (_request, response) => {
    response.json({
      disclosures: demoDisclosureVersions
    });
  });

  app.get("/api/disclosures/required", (request, response) => {
    const requiredFor = String(request.query.requiredFor ?? "withdrawal");

    if (!["onboarding", "task", "simulation", "reward", "withdrawal", "real_product"].includes(requiredFor)) {
      response.status(400).json({ error: "invalid_disclosure_context" });
      return;
    }

    const disclosureContext = requiredFor as Parameters<typeof getRequiredDisclosureVersions>[0];

    const acceptedVersions = new Set(currentState(store, response).disclosureAcceptances.map(
      (acceptance) => `${acceptance.disclosureId}:${acceptance.version}`
    ));
    const disclosures = getRequiredDisclosureVersions(disclosureContext);
    response.json({
      requiredFor,
      disclosures,
      pendingDisclosures: disclosures.filter(
        (disclosure) => !acceptedVersions.has(`${disclosure.id}:${disclosure.version}`)
      )
    });
  });

  app.post("/api/disclosures/:disclosureId/accept", (request, response) => {
    const result = createDisclosureAcceptance(request.params.disclosureId, {
      channel: "api",
      userAgent: request.get("user-agent") ?? "GrowthmoreAPI/0.1 demo",
      ipAddressMasked: "192.0.2.*"
    });

    if (result.error) {
      response.status(404).json({ error: "disclosure_not_found", message: result.error });
      return;
    }

    const acceptance = {
      ...result.acceptance!,
      id: store.createId("acceptance"),
      userId: currentSession(response).user.id
    };
    const auditLog = {
      ...result.auditLog!,
      id: store.createId("audit"),
      actorId: currentSession(response).user.id
    };
    store.updateState(currentSession(response).user.id, (state) => ({
      ...state,
      disclosureAcceptances: [...state.disclosureAcceptances, acceptance],
      auditLogs: [...state.auditLogs, auditLog]
    }));
    response.status(201).json({ acceptance, auditLog });
  });

  app.get("/api/disclosure-acceptances/current", (_request, response) => {
    response.json({
      acceptances: currentState(store, response).disclosureAcceptances,
      compliance: currentState(store, response).complianceSummary
    });
  });

  app.get("/api/admin/audit-logs", (_request, response) => {
    response.json({
      auditLogs: currentState(store, response).auditLogs
    });
  });

  app.get("/api/app/home", (_request, response) => {
    response.json({
      home: currentState(store, response).home
    });
  });

  app.get("/api/virtual-balance", (_request, response) => {
    response.json({
      balance: currentState(store, response).virtualBalance
    });
  });

  app.get("/api/virtual-balance/ledger", (_request, response) => {
    response.json({
      ledger: currentState(store, response).virtualBalanceLedger
    });
  });

  app.get("/api/simulation/products", (_request, response) => {
    response.json({
      products: demoSimulationProducts
    });
  });

  app.get("/api/simulation/allocations", (_request, response) => {
    response.json({
      allocationDraft: currentState(store, response).allocationDraft
    });
  });

  app.put("/api/simulation/allocations", (request, response) => {
    const allocations = Array.isArray(request.body?.allocations)
      ? (request.body.allocations as Array<Pick<SimulationAllocation, "productId" | "amount">>)
      : [];
    const state = currentState(store, response);
    const errors = validateSimulationAllocations(state.virtualBalance.availableAmount, allocations);

    if (errors.length > 0) {
      response.status(400).json({
        error: "invalid_simulation_allocations",
        messages: errors
      });
      return;
    }

    const allocationDraft = {
      ...createSimulationAllocationDraft(state.virtualBalance.availableAmount, allocations),
      userId: currentSession(response).user.id
    };
    store.updateState(currentSession(response).user.id, (value) => ({ ...value, allocationDraft }));
    response.json({ allocationDraft });
  });

  app.get("/api/simulation/runs/current", (_request, response) => {
    response.json({
      run: currentState(store, response).simulationRun
    });
  });

  app.post("/api/simulation/run", (request, response) => {
    const allocations = Array.isArray(request.body?.allocations)
      ? (request.body.allocations as Array<Pick<SimulationAllocation, "productId" | "amount">>)
      : currentState(store, response).allocationDraft.allocations;
    const balance = currentState(store, response).virtualBalance;
    const errors = validateSimulationAllocations(balance.availableAmount, allocations);

    if (errors.length > 0) {
      response.status(400).json({
        error: "invalid_simulation_allocations",
        messages: errors
      });
      return;
    }

    const run = {
      ...createSimulationCycleRun(createSimulationAllocationDraft(balance.availableAmount, allocations)),
      id: store.createId("simulation-run"),
      userId: currentSession(response).user.id
    };
    store.updateState(currentSession(response).user.id, (state) => ({ ...state, simulationRun: run }));
    response.status(201).json({ run });
  });

  app.post("/api/simulation/runs/:runId/reflection", (request, response) => {
    const storedRun = currentState(store, response).simulationRun;
    const run = request.params.runId === storedRun.id ? storedRun : null;

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
      rewardJar: currentState(store, response).rewardJar
    });
  });

  app.get("/api/rewards/history", (_request, response) => {
    response.json({
      ledger: currentState(store, response).rewardLedger
    });
  });
  app.post("/api/rewards/withdraw", (request, response) => {
    const amount = Number(request.body?.amount);
    const state = currentState(store, response);
    const result = createWithdrawalRequest(state.rewardJar, state.account, amount);

    if (result.errors.length > 0) {
      response.status(400).json({
        error: "invalid_withdrawal_request",
        messages: result.errors
      });
      return;
    }

    const withdrawal = {
      ...result.request!,
      id: store.createId("withdrawal"),
      userId: currentSession(response).user.id
    };
    store.updateState(currentSession(response).user.id, (value) => ({
      ...value,
      withdrawals: [withdrawal, ...value.withdrawals]
    }));
    response.status(201).json({ withdrawal });
  });

  app.get("/api/withdrawals", (_request, response) => {
    response.json({
      withdrawals: currentState(store, response).withdrawals
    });
  });

  for (const action of ["approve", "reject", "retry"] as const) {
    app.post(`/api/admin/withdrawals/:withdrawalId/${action}`, (request, response) => {
      const withdrawal = currentState(store, response).withdrawals.find(
        (item) => item.id === request.params.withdrawalId
      );
      if (!withdrawal) {
        response.status(404).json({ error: "withdrawal_not_found" });
        return;
      }
      const result = applyWithdrawalReviewAction(withdrawal, action, {
        reason: request.body?.reason,
        reviewerId: request.body?.reviewerId
      });
      if (result.error || !result.request) {
        response.status(409).json({ error: "invalid_withdrawal_transition", message: result.error });
        return;
      }
      store.updateState(currentSession(response).user.id, (state) => ({
        ...state,
        withdrawals: state.withdrawals.map((item) => item.id === withdrawal.id ? result.request! : item)
      }));
      response.json({ action, withdrawal: result.request });
    });
  }
  app.get("/api/tasks", (_request, response) => {
    const tasks = currentState(store, response).tasks;
    response.json({
      summary: createTaskBoardSummary(tasks),
      tasks
    });
  });

  app.get("/api/tasks/:taskId", (request, response) => {
    const task = currentState(store, response).tasks.find((item) => item.id === request.params.taskId);

    if (!task) {
      response.status(404).json({ error: "task_not_found" });
      return;
    }

    response.json({ task });
  });

  app.post("/api/tasks/:taskId/start", (request, response) => {
    respondWithTaskAction(store, response, request.params.taskId, "start");
  });

  app.post("/api/tasks/:taskId/submit", (request, response) => {
    respondWithTaskAction(store, response, request.params.taskId, "submit");
  });

  app.post("/api/tasks/:taskId/verify", (request, response) => {
    respondWithTaskAction(
      store,
      response,
      request.params.taskId,
      request.body?.result === "rejected" ? "reject" : "approve"
    );
  });

  app.post("/api/tasks/:taskId/claim", (request, response) => {
    respondWithTaskAction(store, response, request.params.taskId, "claim");
  });

  return app;
}
