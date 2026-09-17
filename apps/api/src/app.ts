import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import {
  applyTaskAction,
  applyWithdrawalReviewAction,
  createDisclosureAcceptance,
  createRewardJarSnapshot,
  createSimulationCycleRun,
  demoDisclosureVersions,
  createSimulationAllocationDraft,
  demoSimulationProducts,
  createTaskBoardSummary,
  demoIntroLesson,
  demoTenant,
  getRequiredDisclosureVersions,
  createWithdrawalRequest,
  validateSimulationAllocations,
  validateSimulationReflection,
  type SimulationAllocation,
  type SimulationReflectionSubmission,
  type MockUserSession,
  type TaskAction,
  type UserTask,
  type RewardLedgerEntry,
  type VirtualBalanceLedgerEntry,
  type VirtualBalanceSnapshot
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

type TaskClaimResult = {
  balance: VirtualBalanceSnapshot;
  idempotent: boolean;
  ledgerEntry: VirtualBalanceLedgerEntry | null;
  task: UserTask;
};

function claimTaskReward(store: DemoStore, userId: string, taskId: string): TaskClaimResult {
  let claimResult: TaskClaimResult | null = null;

  store.updateState(userId, (state) => {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) throw new Error("task_not_found");

    const existingEntry = state.virtualBalanceLedger.find(
      (entry) => entry.entryType === "earn" && entry.sourceType === "task" && entry.sourceId === taskId
    );
    if (task.status === "claimed" && existingEntry) {
      claimResult = { balance: state.virtualBalance, idempotent: true, ledgerEntry: existingEntry, task };
      return state;
    }
    if (task.status !== "completed") throw new Error(`Invalid task transition: ${task.status} -> claim`);

    if (existingEntry) {
      const claimedTask = applyTaskAction(task, "claim");
      claimResult = {
        balance: state.virtualBalance,
        idempotent: true,
        ledgerEntry: existingEntry,
        task: claimedTask
      };
      return {
        ...state,
        tasks: state.tasks.map((item) => item.id === taskId ? claimedTask : item)
      };
    }

    const rewardAmount = task.reward.virtualGrowthAmount;
    if (state.virtualBalance.todayEarnedAmount + rewardAmount > state.virtualBalance.dailyEarnLimitAmount) {
      throw new Error("Daily virtual growth limit exceeded.");
    }

    const claimedTask = applyTaskAction(task, "claim");
    const balance: VirtualBalanceSnapshot = {
      ...state.virtualBalance,
      availableAmount: state.virtualBalance.availableAmount + rewardAmount,
      totalAmount: state.virtualBalance.totalAmount + rewardAmount,
      todayEarnedAmount: state.virtualBalance.todayEarnedAmount + rewardAmount
    };
    const ledgerEntry: VirtualBalanceLedgerEntry = {
      id: store.createId("vbl"),
      userId,
      entryType: "earn",
      amount: rewardAmount,
      currency: "CNY",
      sourceType: "task",
      sourceId: taskId,
      balanceAfter: {
        availableAmount: balance.availableAmount,
        allocatedAmount: balance.allocatedAmount,
        frozenAmount: balance.frozenAmount,
        totalAmount: balance.totalAmount
      },
      ruleVersion: "demo-mvp-v1",
      description: `完成任务“${task.title}”获得成长金。`,
      createdAt: new Date().toISOString()
    };
    claimResult = { balance, idempotent: false, ledgerEntry, task: claimedTask };
    return {
      ...state,
      tasks: state.tasks.map((item) => item.id === taskId ? claimedTask : item),
      virtualBalance: balance,
      virtualBalanceLedger: [...state.virtualBalanceLedger, ledgerEntry]
    };
  });

  if (!claimResult) throw new Error("task_claim_failed");
  return claimResult;
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
    const capacity = state.virtualBalance.availableAmount + state.allocationDraft.totalAllocatedAmount;
    const errors = validateSimulationAllocations(capacity, allocations);

    if (errors.length > 0) {
      response.status(400).json({
        error: "invalid_simulation_allocations",
        messages: errors
      });
      return;
    }

    let allocationDraft = state.allocationDraft;
    let balance = state.virtualBalance;
    let ledgerEntry: VirtualBalanceLedgerEntry | null = null;
    store.updateState(currentSession(response).user.id, (value) => {
      const currentCapacity = value.virtualBalance.availableAmount + value.allocationDraft.totalAllocatedAmount;
      const currentErrors = validateSimulationAllocations(currentCapacity, allocations);
      if (currentErrors.length > 0) throw new Error(currentErrors.join("|"));
      const nextTotal = allocations.reduce((sum, item) => sum + item.amount, 0);
      const delta = nextTotal - value.allocationDraft.totalAllocatedAmount;
      balance = {
        ...value.virtualBalance,
        availableAmount: value.virtualBalance.availableAmount - delta,
        allocatedAmount: value.virtualBalance.allocatedAmount + delta
      };
      allocationDraft = {
        ...createSimulationAllocationDraft(currentCapacity, allocations),
        availableAmount: balance.availableAmount,
        unallocatedAmount: balance.availableAmount,
        userId: currentSession(response).user.id
      };
      if (delta !== 0) {
        ledgerEntry = {
          id: store.createId("vbl"),
          userId: currentSession(response).user.id,
          entryType: delta > 0 ? "allocate" : "release",
          amount: Math.abs(delta),
          currency: "CNY",
          sourceType: "simulation_allocation",
          sourceId: "allocation-draft",
          balanceAfter: {
            availableAmount: balance.availableAmount,
            allocatedAmount: balance.allocatedAmount,
            frozenAmount: balance.frozenAmount,
            totalAmount: balance.totalAmount
          },
          ruleVersion: "demo-mvp-v1",
          description: delta > 0 ? "保存模拟配置，成长金转入学习配置。" : "调整模拟配置，成长金释放回可用余额。",
          createdAt: new Date().toISOString()
        };
      }
      return {
        ...value,
        allocationDraft,
        virtualBalance: balance,
        virtualBalanceLedger: ledgerEntry ? [...value.virtualBalanceLedger, ledgerEntry] : value.virtualBalanceLedger
      };
    });
    response.json({ allocationDraft, balance, ledgerEntry });
  });

  app.get("/api/simulation/runs/current", (_request, response) => {
    response.json({
      run: currentState(store, response).simulationRun
    });
  });

  app.get("/api/simulation/runs", (_request, response) => {
    response.json({ runs: currentState(store, response).simulationRuns });
  });

  app.get("/api/simulation/runs/:runId", (request, response) => {
    const run = currentState(store, response).simulationRuns.find((item) => item.id === request.params.runId);
    if (!run) { response.status(404).json({ error: "simulation_run_not_found" }); return; }
    response.json({ run });
  });

  app.post("/api/simulation/run", (request, response) => {
    const allocations = Array.isArray(request.body?.allocations)
      ? (request.body.allocations as Array<Pick<SimulationAllocation, "productId" | "amount">>)
      : currentState(store, response).allocationDraft.allocations;
    const runState = currentState(store, response);
    const balance = runState.virtualBalance;
    const errors = validateSimulationAllocations(balance.availableAmount + runState.allocationDraft.totalAllocatedAmount, allocations);

    if (errors.length > 0) {
      response.status(400).json({
        error: "invalid_simulation_allocations",
        messages: errors
      });
      return;
    }

    const run = {
      ...createSimulationCycleRun(createSimulationAllocationDraft(balance.availableAmount + runState.allocationDraft.totalAllocatedAmount, allocations)),
      id: store.createId("simulation-run"),
      userId: currentSession(response).user.id,
      cycleLabel: new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Shanghai" }).format(new Date()),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
    store.updateState(currentSession(response).user.id, (state) => ({ ...state, simulationRun: run, simulationRuns: [...state.simulationRuns, run] }));
    response.status(201).json({ run });
  });

  app.post("/api/simulation/runs/:runId/reflection", (request, response) => {
    const storedState = currentState(store, response);
    const run = storedState.simulationRuns.find((item) => item.id === request.params.runId) ?? null;

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

    let completedRun = run;
    let rewardLedgerEntry: RewardLedgerEntry | null = null;
    let idempotent = false;
    let lockReason: string | null = null;
    let newRewardReserved = false;
    store.updateState(currentSession(response).user.id, (state) => {
      const currentRun = state.simulationRuns.find((item) => item.id === run.id)!;
      const existingReward = state.rewardLedger.find((entry) => entry.sourceType === "learning_cycle" && entry.sourceId === run.id);
      if (currentRun.reviewStatus === "completed" && currentRun.reflectionResult) {
        completedRun = currentRun;
        rewardLedgerEntry = existingReward ?? null;
        idempotent = true;
        return state;
      }

      const now = new Date().toISOString();
      const rewardAmount = 1.8;
      const todayPrefix = now.slice(0, 10);
      const monthPrefix = now.slice(0, 7);
      const userDailyAmount = state.rewardLedger
        .filter((entry) => entry.programId === state.rewardBudget.programId && entry.createdAt.startsWith(todayPrefix))
        .reduce((total, entry) => total + entry.amount, 0);
      const userMonthlyAmount = state.rewardLedger
        .filter((entry) => entry.programId === state.rewardBudget.programId && entry.createdAt.startsWith(monthPrefix))
        .reduce((total, entry) => total + entry.amount, 0);
      const accountEligible = currentSession(response).user.kycStatus === "mock_verified";
      const budgetAvailable =
        state.rewardBudget.reservedAmount + rewardAmount <= state.rewardBudget.totalBudgetAmount &&
        state.rewardBudget.reservedTodayAmount + rewardAmount <= state.rewardBudget.dailyBudgetAmount;
      const withinUserLimits =
        userDailyAmount + rewardAmount <= state.rewardBudget.userDailyLimitAmount &&
        userMonthlyAmount + rewardAmount <= state.rewardBudget.userMonthlyLimitAmount;
      const canAward = Boolean(existingReward) || (currentRun.startingVirtualAmount > 0 && accountEligible && budgetAvailable && withinUserLimits);

      if (!accountEligible) lockReason = "账户尚未满足活动资格。";
      else if (!budgetAvailable) lockReason = "活动预算不足，本周期不产生奖励。";
      else if (!withinUserLimits) lockReason = "已达到用户日或月奖励上限。";
      else if (currentRun.startingVirtualAmount <= 0) lockReason = "本周期没有有效学习配置。";

      if (existingReward) {
        rewardLedgerEntry = existingReward;
      } else if (canAward) {
        rewardLedgerEntry = {
          id: store.createId("rwd"),
          userId: currentSession(response).user.id,
          status: "pending",
          amount: rewardAmount,
          currency: "CNY",
          sourceType: "learning_cycle",
          sourceId: currentRun.id,
          programId: state.rewardBudget.programId,
          budgetBatchId: state.rewardBudget.budgetBatchId,
          activityRuleVersion: state.rewardBudget.activityRuleVersion,
          description: "完成学习周期和复盘，活动预算已预留。",
          lockReason: "预算已预留，等待活动结算校验。",
          availableAt: null,
          createdAt: now
        };
        newRewardReserved = true;
      }
      completedRun = {
        ...currentRun,
        reviewStatus: "completed",
        reviewCompletedAt: now,
        rewardEligible: canAward,
        rewardActivityAmount: canAward ? existingReward?.amount ?? rewardAmount : 0,
        reflectionResult: result
      };
      const rewardLedger = newRewardReserved && rewardLedgerEntry ? [...state.rewardLedger, rewardLedgerEntry] : state.rewardLedger;
      const rewardJar = createRewardJarSnapshot(rewardLedger);
      return {
        ...state,
        simulationRun: state.simulationRun.id === completedRun.id ? completedRun : state.simulationRun,
        simulationRuns: state.simulationRuns.map((item) => item.id === completedRun.id ? completedRun : item),
        rewardLedger,
        rewardJar: { ...rewardJar, userId: currentSession(response).user.id },
        rewardBudget: newRewardReserved ? {
          ...state.rewardBudget,
          reservedAmount: state.rewardBudget.reservedAmount + rewardAmount,
          reservedTodayAmount: state.rewardBudget.reservedTodayAmount + rewardAmount
        } : state.rewardBudget,
        home: {
          ...state.home,
          balances: { ...state.home.balances, rewardJarAmount: rewardJar.totalBalanceAmount }
        }
      };
    });
    response.status(idempotent ? 200 : 201).json({
      reflection: completedRun.reflectionResult,
      run: completedRun,
      rewardLedgerEntry,
      rewardDecision: {
        eligible: completedRun.rewardEligible,
        amount: completedRun.rewardActivityAmount,
        lockReason,
        ruleVersion: currentState(store, response).rewardBudget.activityRuleVersion
      },
      idempotent
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
  app.get("/api/tasks", (request, response) => {
    const allTasks = currentState(store, response).tasks;
    const category = typeof request.query.type === "string" ? request.query.type : null;
    const status = typeof request.query.status === "string" ? request.query.status : null;
    const tasks = allTasks.filter((task) => {
      const categoryMatches = !category || category === "all" || task.category === category;
      const statusMatches = !status || (status === "completed" ? ["completed", "claimed"].includes(task.status) : task.status === status);
      return categoryMatches && statusMatches;
    });
    response.json({
      summary: createTaskBoardSummary(allTasks),
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
    const taskId = request.params.taskId;
    if (taskId === demoIntroLesson.taskId) {
      response.status(409).json({ error: "learning_required", message: "请阅读全部课程内容并通过知识测验后完成任务。" });
      return;
    }
    if (taskId !== "daily-check-in") {
      respondWithTaskAction(store, response, taskId, "submit");
      return;
    }
    const task = currentState(store, response).tasks.find((item) => item.id === taskId);
    if (!task) {
      response.status(404).json({ error: "task_not_found" });
      return;
    }
    try {
      const completedTask = applyTaskAction(applyTaskAction(task, "submit"), "approve");
      store.updateState(currentSession(response).user.id, (state) => ({
        ...state,
        tasks: state.tasks.map((item) => item.id === taskId ? completedTask : item)
      }));
      response.json({ action: "submit", autoVerified: true, task: completedTask });
    } catch (error) {
      response.status(409).json({
        error: "invalid_task_transition",
        message: error instanceof Error ? error.message : "Task transition is not allowed."
      });
    }
  });

  app.post("/api/admin/tasks/:taskId/verify", (request, response) => {
    respondWithTaskAction(
      store,
      response,
      request.params.taskId,
      request.body?.result === "rejected" ? "reject" : "approve"
    );
  });

  app.post("/api/tasks/:taskId/retry", (request, response) => {
    respondWithTaskAction(store, response, request.params.taskId, "retry");
  });

  app.post("/api/tasks/:taskId/claim", (request, response) => {
    try {
      const result = claimTaskReward(store, currentSession(response).user.id, request.params.taskId);
      response.json({ action: "claim", ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Task claim failed.";
      if (message === "task_not_found") {
        response.status(404).json({ error: "task_not_found" });
        return;
      }
      response.status(409).json({ error: "invalid_task_transition", message });
    }
  });

  app.get("/api/learning/lessons/:lessonId", (request, response) => {
    if (request.params.lessonId !== demoIntroLesson.id) {
      response.status(404).json({ error: "lesson_not_found" });
      return;
    }
    const progress = currentState(store, response).learningProgress.find((item) => item.lessonId === demoIntroLesson.id);
    response.json({ lesson: demoIntroLesson, progress });
  });

  app.post("/api/learning/lessons/:lessonId/read", (request, response) => {
    if (request.params.lessonId !== demoIntroLesson.id) {
      response.status(404).json({ error: "lesson_not_found" });
      return;
    }
    const sectionId = typeof request.body?.sectionId === "string" ? request.body.sectionId : "";
    if (!demoIntroLesson.sections.some((section) => section.id === sectionId)) {
      response.status(400).json({ error: "invalid_section", message: "课程章节不存在。" });
      return;
    }
    let savedProgress = currentState(store, response).learningProgress[0]!;
    store.updateState(currentSession(response).user.id, (state) => {
      const progress = state.learningProgress.find((item) => item.lessonId === demoIntroLesson.id)!;
      savedProgress = { ...progress, readSectionIds: Array.from(new Set([...progress.readSectionIds, sectionId])), updatedAt: new Date().toISOString() };
      return { ...state, learningProgress: state.learningProgress.map((item) => item.lessonId === demoIntroLesson.id ? savedProgress : item) };
    });
    response.json({ progress: savedProgress });
  });

  app.post("/api/learning/quizzes/:quizId/submit", (request, response) => {
    if (request.params.quizId !== demoIntroLesson.quiz.id) {
      response.status(404).json({ error: "quiz_not_found" });
      return;
    }
    const answerId = typeof request.body?.answerId === "string" ? request.body.answerId : "";
    if (!demoIntroLesson.quiz.options.some((option) => option.id === answerId)) {
      response.status(400).json({ error: "invalid_answer", message: "请选择一个答案后提交。" });
      return;
    }
    const state = currentState(store, response);
    const progress = state.learningProgress.find((item) => item.lessonId === demoIntroLesson.id)!;
    if (progress.readSectionIds.length < demoIntroLesson.sections.length) {
      response.status(409).json({ error: "lesson_incomplete", message: "请先阅读全部课程章节，再提交测验。" });
      return;
    }
    const passed = answerId === "reward-follows-rules";
    const feedback = passed
      ? "回答正确。活动奖励来自银行预算，并按任务和活动规则确定。"
      : answerId === "growth-is-cash"
        ? "虚拟成长金不是现金，只能用于模拟配置和学习。请复习第一节后重试。"
        : "模拟涨跌不会直接决定活动奖励。请复习第二节后重试。";
    let savedProgress = progress;
    let savedTask = state.tasks.find((item) => item.id === demoIntroLesson.taskId)!;
    store.updateState(currentSession(response).user.id, (current) => {
      const currentProgress = current.learningProgress.find((item) => item.lessonId === demoIntroLesson.id)!;
      savedProgress = {
        ...currentProgress,
        quizAttemptCount: currentProgress.quizAttemptCount + 1,
        quizPassed: passed,
        score: passed ? 100 : 0,
        feedback,
        completedAt: passed ? currentProgress.completedAt ?? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      };
      if (passed && savedTask.status === "in_progress") savedTask = applyTaskAction(applyTaskAction(savedTask, "submit"), "approve");
      return {
        ...current,
        learningProgress: current.learningProgress.map((item) => item.lessonId === demoIntroLesson.id ? savedProgress : item),
        tasks: current.tasks.map((item) => item.id === savedTask.id ? savedTask : item)
      };
    });
    response.json({ passed, feedback, progress: savedProgress, task: savedTask });
  });

  return app;
}
