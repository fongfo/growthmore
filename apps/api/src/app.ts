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
  type ComplianceSummary,
  type CampaignConfiguration,
  type DisclosureRequiredFor,
  type DisclosureVersion,
  type TodayHomeSummary,
  type VirtualBalanceLedgerEntry,
  type VirtualBalanceSnapshot
} from "@growthmore/shared";
import { DemoStore, type DemoUserState } from "./demoStore.js";

type CreateAppOptions = { databasePath?: string; store?: DemoStore };

type AdminRole = "operator" | "reviewer" | "auditor";
type AdminIdentity = { id: string; name: string; roles: AdminRole[] };

function resolveAdmin(request: Request): AdminIdentity | null {
  const token = request.get("x-admin-token");
  const demoToken = (value: string) => process.env.NODE_ENV === "production" ? "" : value;
  const configured = [
    { token: process.env.ADMIN_OPERATOR_TOKEN ?? demoToken("operator-demo"), identity: { id: "ops-demo", name: "活动运营", roles: ["operator"] as AdminRole[] } },
    { token: process.env.ADMIN_REVIEWER_TOKEN ?? demoToken("reviewer-demo"), identity: { id: "reviewer-demo", name: "提现审核员", roles: ["reviewer"] as AdminRole[] } },
    { token: process.env.ADMIN_AUDITOR_TOKEN ?? demoToken("auditor-demo"), identity: { id: "auditor-demo", name: "审计员", roles: ["auditor"] as AdminRole[] } },
    { token: process.env.ADMIN_FULL_ACCESS_TOKEN ?? demoToken("admin-demo"), identity: { id: "admin-demo", name: "演示管理员", roles: ["operator", "reviewer", "auditor"] as AdminRole[] } }
  ];
  return configured.find((entry) => entry.token && entry.token === token)?.identity ?? null;
}

function requireAdminRole(role: AdminRole) {
  return (_request: Request, response: Response, next: () => void) => {
    const admin = response.locals.admin as AdminIdentity;
    if (!admin.roles.includes(role)) {
      response.status(403).json({ error: "admin_role_required", requiredRole: role });
      return;
    }
    next();
  };
}

function maskedIp(request: Request): string {
  const value = request.ip || "127.0.0.1";
  return value.includes(":") ? "local:*" : value.replace(/\.\d+$/, ".*");
}

function bearerToken(request: Request): string | undefined {
  return request.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
}

function currentSession(response: Response): MockUserSession {
  return response.locals.session as MockUserSession;
}

function currentState(store: DemoStore, response: Response): DemoUserState {
  return store.getState(currentSession(response).user.id);
}

function getPendingDisclosures(state: DemoUserState, contexts: DisclosureRequiredFor[]): DisclosureVersion[] {
  const acceptedVersions = new Set(state.disclosureAcceptances.map(
    (acceptance) => `${acceptance.disclosureId}:${acceptance.version}`
  ));
  const required = contexts.flatMap((context) => getRequiredDisclosureVersions(context));
  return [...new Map(required.map((disclosure) => [disclosure.id, disclosure])).values()].filter(
    (disclosure) => !acceptedVersions.has(`${disclosure.id}:${disclosure.version}`)
  );
}

function createComplianceSummaryForState(state: DemoUserState): ComplianceSummary {
  const requiredDisclosures = demoDisclosureVersions.filter(
    (disclosure) => disclosure.status === "active" && disclosure.requiredFor.some((context) => context !== "real_product")
  );
  const acceptedDisclosures = state.disclosureAcceptances.filter((acceptance) =>
    requiredDisclosures.some((disclosure) => disclosure.id === acceptance.disclosureId && disclosure.version === acceptance.version)
  );
  const pendingDisclosures = requiredDisclosures.filter((disclosure) =>
    !acceptedDisclosures.some((acceptance) => acceptance.disclosureId === disclosure.id && acceptance.version === disclosure.version)
  );
  return {
    requiredDisclosureCount: requiredDisclosures.length,
    acceptedDisclosureCount: acceptedDisclosures.length,
    pendingDisclosureCount: pendingDisclosures.length,
    requiredDisclosures,
    acceptedDisclosures,
    pendingDisclosures,
    latestAuditLogs: [...state.auditLogs].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt)).slice(0, 5)
  };
}

function requireDisclosures(store: DemoStore, response: Response, contexts: DisclosureRequiredFor[]): boolean {
  const pendingDisclosures = getPendingDisclosures(currentState(store, response), contexts);
  if (pendingDisclosures.length === 0) return true;
  response.status(428).json({
    error: "disclosure_required",
    message: "请先确认当前操作所需的最新披露版本。",
    requiredFor: contexts,
    pendingDisclosures
  });
  return false;
}

function createTodayHome(state: DemoUserState): TodayHomeSummary {
  const focusTask = state.tasks.find((task) => task.id === "risk-lesson") ?? state.tasks[0]!;
  const taskComplete = focusTask.status === "claimed";
  const allocationComplete = taskComplete && state.allocationDraft.totalAllocatedAmount > 0;
  const runAllocation = new Map(state.simulationRun.allocationSnapshot.map((item) => [item.productId, item.amount]));
  const runMatchesCurrentAllocation =
    state.allocationDraft.allocations.length === state.simulationRun.allocationSnapshot.length &&
    state.allocationDraft.allocations.every((item) => runAllocation.get(item.productId) === item.amount);
  const reflectionComplete = allocationComplete && runMatchesCurrentAllocation && state.simulationRun.reviewStatus === "completed";
  const waitingForReview = focusTask.status === "pending_verification";

  const primaryAction: TodayHomeSummary["primaryAction"] = !taskComplete
    ? {
        target: "earn",
        title: focusTask.title,
        description: waitingForReview ? "任务已提交，审核完成后即可进入模拟配置。" : "先完成一项具体任务，获得用于模拟配置的成长金。",
        reason: waitingForReview ? "当前任务正在审核中。" : focusTask.status === "completed" ? "任务已完成，奖励尚未领取。" : "这是进入模拟配置前的第一步。",
        ctaLabel: waitingForReview ? "查看审核状态" : focusTask.status === "completed" ? "领取任务奖励" : focusTask.status === "in_progress" ? "继续今日任务" : "开始今日任务",
        state: waitingForReview ? "waiting" : "ready"
      }
    : !allocationComplete
      ? {
          target: state.virtualBalance.availableAmount <= 0 ? "earn" : "allocate",
          title: "配置你的模拟组合",
          description: "把成长金分配到学习产品，观察不同配置的模拟变化。",
          reason: state.virtualBalance.availableAmount <= 0 ? "当前没有可配置的成长金，请先完成任务。" : "任务奖励已领取，下一步是完成模拟配置。",
          ctaLabel: state.virtualBalance.availableAmount <= 0 ? "返回任务" : "开始模拟配置",
          state: state.virtualBalance.availableAmount <= 0 ? "waiting" : "ready"
        }
      : !reflectionComplete
        ? {
            target: "grow",
            title: "完成本期学习复盘",
            description: "查看模拟变化并回答复盘问题，确认你理解风险与奖励边界。",
            reason: "模拟配置已保存，本期复盘尚未完成。",
            ctaLabel: "继续学习复盘",
            state: "ready"
          }
        : {
            target: "rewards",
            title: "今天的学习闭环已完成",
            description: "查看奖励资格、锁定原因和活动流水。",
            reason: state.simulationRun.rewardEligible ? "复盘已完成，奖励资格已按活动规则计算。" : "复盘已完成，本期未产生活动奖励。",
            ctaLabel: "查看奖励记录",
            state: "complete"
          };
  const completedSteps = [taskComplete, allocationComplete, reflectionComplete].filter(Boolean).length;

  return {
    ...state.home,
    balances: {
      virtualGrowthAmount: state.virtualBalance.availableAmount,
      rewardJarAmount: state.rewardJar.totalBalanceAmount,
      currency: "CNY"
    },
    level: {
      ...state.home.level,
      progressPercent: completedSteps / 3,
      remainingTaskCount: 3 - completedSteps
    },
    introduction: { dismissed: state.homeIntroductionDismissed },
    journey: [
      { id: "task", status: taskComplete ? "complete" : "current" },
      { id: "allocation", status: allocationComplete ? "complete" : taskComplete ? "current" : "pending" },
      { id: "reflection", status: reflectionComplete ? "complete" : allocationComplete ? "current" : "pending" }
    ],
    recommendedTask: {
      ...state.home.recommendedTask,
      id: focusTask.id,
      title: focusTask.title,
      description: focusTask.description,
      estimatedMinutes: focusTask.estimatedMinutes
    },
    primaryAction
  };
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
      channel: request.body?.channel === "mobile" ? "mobile" : "api",
      userAgent: request.get("user-agent") ?? "GrowthmoreAPI/0.1 demo",
      ipAddressMasked: "192.0.2.*"
    });

    if (result.error) {
      response.status(404).json({ error: "disclosure_not_found", message: result.error });
      return;
    }

    let acceptance = result.acceptance!;
    let auditLog = result.auditLog!;
    let idempotent = false;
    store.updateState(currentSession(response).user.id, (state) => {
      const existingAcceptance = state.disclosureAcceptances.find(
        (item) => item.disclosureId === result.acceptance!.disclosureId && item.version === result.acceptance!.version
      );
      if (existingAcceptance) {
        acceptance = existingAcceptance;
        idempotent = true;
        return state;
      }
      acceptance = {
        ...result.acceptance!,
        id: store.createId("acceptance"),
        userId: currentSession(response).user.id
      };
      auditLog = {
        ...result.auditLog!,
        id: store.createId("audit"),
        actorId: currentSession(response).user.id
      };
      return {
        ...state,
        disclosureAcceptances: [...state.disclosureAcceptances, acceptance],
        auditLogs: [...state.auditLogs, auditLog]
      };
    });
    response.status(idempotent ? 200 : 201).json({ acceptance, auditLog: idempotent ? null : auditLog, idempotent });
  });

  app.get("/api/disclosure-acceptances/current", (_request, response) => {
    const state = currentState(store, response);
    response.json({
      acceptances: state.disclosureAcceptances,
      compliance: createComplianceSummaryForState(state)
    });
  });

  app.get("/api/campaign/current", (_request, response) => {
    const state = currentState(store, response);
    const publishedCampaign = state.campaign.status === "published"
      ? state.campaign
      : [...state.campaignVersions].reverse().find((item) => item.status === "published") ?? null;
    response.json({ campaign: publishedCampaign });
  });

  app.get("/api/admin/session", (request, response) => {
    const admin = resolveAdmin(request);
    if (!admin) {
      response.status(401).json({ error: "invalid_admin_credentials" });
      return;
    }
    response.json({ admin });
  });

  app.use("/api/admin", (request, response, next) => {
    const admin = resolveAdmin(request);
    if (!admin) {
      response.status(401).json({ error: "invalid_admin_credentials" });
      return;
    }
    response.locals.admin = admin;
    next();
  });

  app.get("/api/admin/overview", (_request, response) => {
    const state = currentState(store, response);
    response.json({
      campaign: state.campaign,
      budget: state.rewardBudget,
      withdrawalCounts: state.withdrawals.reduce<Record<string, number>>((counts, item) => {
        counts[item.status] = (counts[item.status] ?? 0) + 1;
        return counts;
      }, {}),
      auditCount: state.auditLogs.length
    });
  });

  app.get("/api/admin/campaign", requireAdminRole("operator"), (_request, response) => {
    const state = currentState(store, response);
    response.json({ campaign: state.campaign, versions: state.campaignVersions });
  });

  app.put("/api/admin/campaign", requireAdminRole("operator"), (request, response) => {
    const state = currentState(store, response);
    const body = request.body ?? {};
    const values = {
      totalBudgetAmount: Number(body.budget?.totalBudgetAmount),
      dailyBudgetAmount: Number(body.budget?.dailyBudgetAmount),
      userDailyLimitAmount: Number(body.budget?.userDailyLimitAmount),
      userMonthlyLimitAmount: Number(body.budget?.userMonthlyLimitAmount)
    };
    const startsAt = String(body.startsAt ?? "");
    const endsAt = String(body.endsAt ?? "");
    const name = String(body.name ?? "").trim();
    const ruleVersion = String(body.ruleVersion ?? "").trim();
    const tasks = Array.isArray(body.tasks) ? body.tasks : [];
    const validTasks = tasks.length > 0 && tasks.every((task: unknown) => {
      if (!task || typeof task !== "object") return false;
      const item = task as Record<string, unknown>;
      return typeof item.taskId === "string" && state.tasks.some((candidate) => candidate.id === item.taskId) &&
        ["completed", "claimed"].includes(String(item.requiredStatus)) &&
        Number.isFinite(Number(item.rewardAmount)) && Number(item.rewardAmount) > 0;
    });
    const ruleVersionExists = state.campaignVersions.some((item) => item.ruleVersion === ruleVersion);
    if (!name || !ruleVersion || !startsAt || !endsAt || Date.parse(startsAt) >= Date.parse(endsAt) ||
      !validTasks ||
      Object.values(values).some((value) => !Number.isFinite(value) || value <= 0) ||
      values.totalBudgetAmount < state.rewardBudget.reservedAmount ||
      values.dailyBudgetAmount < state.rewardBudget.reservedTodayAmount) {
      response.status(400).json({ error: "invalid_campaign_configuration", message: "请检查活动时间、规则版本和预算；预算不得低于已预留金额。" });
      return;
    }
    if (ruleVersionExists) {
      response.status(409).json({ error: "campaign_rule_version_exists", message: "已发布规则版本不可覆盖，请使用新的规则版本。" });
      return;
    }
    const admin = response.locals.admin as AdminIdentity;
    const now = new Date().toISOString();
    const campaign: CampaignConfiguration = {
      ...state.campaign,
      name,
      startsAt,
      endsAt,
      ruleVersion,
      status: "draft",
      publishedAt: null,
      tasks: tasks.map((task: { taskId: string; requiredStatus: "completed" | "claimed"; rewardAmount: number }) => ({
        taskId: task.taskId,
        requiredStatus: task.requiredStatus,
        rewardAmount: Number(task.rewardAmount)
      })),
      budget: {
        ...state.rewardBudget,
        activityRuleVersion: ruleVersion,
        totalBudgetAmount: values.totalBudgetAmount,
        dailyBudgetAmount: values.dailyBudgetAmount,
        userDailyLimitAmount: values.userDailyLimitAmount,
        userMonthlyLimitAmount: values.userMonthlyLimitAmount
      }
    };
    store.updateState(currentSession(response).user.id, (current) => ({
      ...current,
      campaign,
      auditLogs: [{
        id: store.createId("audit"),
        actorType: "admin",
        actorId: admin.id,
        action: "campaign.configured",
        entityType: "campaign",
        entityId: campaign.id,
        occurredAt: now,
        ipAddressMasked: maskedIp(request),
        userAgent: String(request.get("user-agent") ?? "growthmore-admin").slice(0, 120),
        summary: "运营更新活动配置草稿。",
        metadata: { ruleVersion, totalBudgetAmount: values.totalBudgetAmount }
      }, ...current.auditLogs]
    }));
    response.json({ campaign });
  });

  app.post("/api/admin/campaign/publish", requireAdminRole("operator"), (request, response) => {
    const admin = response.locals.admin as AdminIdentity;
    let campaign = currentState(store, response).campaign;
    const now = new Date().toISOString();
    store.updateState(currentSession(response).user.id, (state) => {
      campaign = { ...state.campaign, status: "published", publishedAt: now };
      const versionExists = state.campaignVersions.some((item) => item.ruleVersion === campaign.ruleVersion);
      return {
        ...state,
        campaign,
        campaignVersions: versionExists ? state.campaignVersions.map((item) => item.ruleVersion === campaign.ruleVersion ? campaign : item) : [...state.campaignVersions, campaign],
        rewardBudget: campaign.budget,
        auditLogs: [{
          id: store.createId("audit"),
          actorType: "admin",
          actorId: admin.id,
          action: "campaign.published",
          entityType: "campaign",
          entityId: campaign.id,
          occurredAt: now,
          ipAddressMasked: maskedIp(request),
          userAgent: String(request.get("user-agent") ?? "growthmore-admin").slice(0, 120),
          summary: "运营发布活动规则 " + campaign.ruleVersion + "。",
          metadata: { ruleVersion: campaign.ruleVersion, totalBudgetAmount: campaign.budget.totalBudgetAmount }
        }, ...state.auditLogs]
      };
    });
    response.json({ campaign });
  });

  app.get("/api/admin/audit-logs", requireAdminRole("auditor"), (_request, response) => {
    response.json({
      auditLogs: currentState(store, response).auditLogs
    });
  });

  app.get("/api/admin/withdrawals", requireAdminRole("reviewer"), (_request, response) => {
    response.json({ withdrawals: currentState(store, response).withdrawals });
  });

  app.get("/api/app/home", (_request, response) => {
    response.json({
      home: createTodayHome(currentState(store, response))
    });
  });

  app.post("/api/app/home/introduction", (request, response) => {
    const dismissed = request.body?.dismissed;
    if (typeof dismissed !== "boolean") {
      response.status(400).json({ error: "invalid_introduction_state" });
      return;
    }
    let home = createTodayHome(currentState(store, response));
    store.updateState(currentSession(response).user.id, (state) => {
      const nextState = { ...state, homeIntroductionDismissed: dismissed };
      home = createTodayHome(nextState);
      return nextState;
    });
    response.json({ home });
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
    if (!requireDisclosures(store, response, ["simulation"])) return;
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
    if (!requireDisclosures(store, response, ["simulation"])) return;
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
    if (!requireDisclosures(store, response, ["simulation", "reward"])) return;
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
      const campaignTask = state.campaign.tasks[0];
      const rewardAmount = campaignTask?.rewardAmount ?? 1.8;
      const todayPrefix = now.slice(0, 10);
      const monthPrefix = now.slice(0, 7);
      const userDailyAmount = state.rewardLedger
        .filter((entry) => entry.programId === state.rewardBudget.programId && entry.createdAt.startsWith(todayPrefix))
        .reduce((total, entry) => total + entry.amount, 0);
      const userMonthlyAmount = state.rewardLedger
        .filter((entry) => entry.programId === state.rewardBudget.programId && entry.createdAt.startsWith(monthPrefix))
        .reduce((total, entry) => total + entry.amount, 0);
      const accountEligible = currentSession(response).user.kycStatus === "mock_verified";
      const configuredTask = campaignTask ? state.tasks.find((item) => item.id === campaignTask.taskId) : undefined;
      const taskEligible = Boolean(configuredTask) && (
        configuredTask!.status === campaignTask!.requiredStatus ||
        (campaignTask!.requiredStatus === "completed" && configuredTask!.status === "claimed")
      );
      const budgetAvailable =
        state.rewardBudget.reservedAmount + rewardAmount <= state.rewardBudget.totalBudgetAmount &&
        state.rewardBudget.reservedTodayAmount + rewardAmount <= state.rewardBudget.dailyBudgetAmount;
      const withinUserLimits =
        userDailyAmount + rewardAmount <= state.rewardBudget.userDailyLimitAmount &&
        userMonthlyAmount + rewardAmount <= state.rewardBudget.userMonthlyLimitAmount;
      const canAward = Boolean(existingReward) || (currentRun.startingVirtualAmount > 0 && taskEligible && accountEligible && budgetAvailable && withinUserLimits);

      if (!taskEligible) lockReason = "尚未达到当前活动的任务条件。";
      else if (!accountEligible) lockReason = "账户尚未满足活动资格。";
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
    if (!requireDisclosures(store, response, ["withdrawal"])) return;
    const amount = Number(request.body?.amount);
    const idempotencyKey = typeof request.body?.idempotencyKey === "string" ? request.body.idempotencyKey.trim().slice(0, 100) : "";
    const userId = currentSession(response).user.id;
    const withdrawalId = store.createId("withdrawal");
    let withdrawal = null as ReturnType<typeof createWithdrawalRequest>["request"];
    let errors: string[] = [];
    let idempotent = false;
    store.updateState(userId, (state) => {
      const existing = idempotencyKey ? state.withdrawals.find((item) => item.idempotencyKey === idempotencyKey) : undefined;
      if (existing) {
        withdrawal = existing;
        idempotent = true;
        return state;
      }
      const result = createWithdrawalRequest(state.rewardJar, state.account, amount);
      if (result.errors.length > 0 || !result.request) {
        errors = result.errors;
        return state;
      }
      let remaining = result.request.amount;
      const heldIds: string[] = [];
      const splitEntries: RewardLedgerEntry[] = [];
      const rewardLedger = state.rewardLedger.map((entry) => {
        if (entry.status !== "available" || remaining <= 0) return entry;
        const heldAmount = Math.min(entry.amount, remaining);
        remaining = Number((remaining - heldAmount).toFixed(2));
        if (heldAmount === entry.amount) {
          heldIds.push(entry.id);
          return { ...entry, status: "withdrawal_pending" as const, sourceId: withdrawalId };
        }
        const heldEntry = {
          ...entry,
          id: store.createId("reward-hold"),
          amount: heldAmount,
          status: "withdrawal_pending" as const,
          sourceType: "withdrawal" as const,
          sourceId: withdrawalId,
          description: "提现申请审核中，奖励已冻结。",
          lockReason: "等待模拟人工审核与结算。"
        };
        heldIds.push(heldEntry.id);
        splitEntries.push(heldEntry);
        return { ...entry, amount: Number((entry.amount - heldAmount).toFixed(2)) };
      });
      if (remaining > 0) {
        errors = ["Withdrawal amount cannot exceed available reward balance."];
        return state;
      }
      const nextLedger = [...rewardLedger, ...splitEntries];
      const rewardJar = createRewardJarSnapshot(nextLedger);
      const now = new Date().toISOString();
      withdrawal = {
        ...result.request,
        id: withdrawalId,
        userId,
        idempotencyKey: idempotencyKey || null,
        fundsStatus: "frozen",
        rewardLedgerEntryIds: heldIds,
        createdAt: now,
        submittedAt: now,
        updatedAt: now
      };
      return {
        ...state,
        rewardLedger: nextLedger,
        rewardJar: { ...rewardJar, userId },
        withdrawals: [withdrawal, ...state.withdrawals],
        auditLogs: [{
          id: store.createId("audit"),
          actorType: "user",
          actorId: userId,
          action: "withdrawal.submitted",
          entityType: "withdrawal_request",
          entityId: withdrawalId,
          occurredAt: now,
          ipAddressMasked: "127.0.*.*",
          userAgent: String(request.get("user-agent") ?? "growthmore-mobile").slice(0, 120),
          summary: "用户提交模拟提现申请，奖励已冻结。",
          metadata: { amount: result.request.amount, idempotencyKey: idempotencyKey || null }
        }, ...state.auditLogs],
        home: { ...state.home, balances: { ...state.home.balances, rewardJarAmount: rewardJar.totalBalanceAmount } }
      };
    });
    if (errors.length > 0 || !withdrawal) {
      response.status(400).json({
        error: "invalid_withdrawal_request",
        messages: errors
      });
      return;
    }
    response.status(idempotent ? 200 : 201).json({ withdrawal, idempotent });
  });

  app.get("/api/withdrawals", (_request, response) => {
    response.json({
      withdrawals: currentState(store, response).withdrawals
    });
  });

  for (const action of ["approve", "reject", "retry", "settle", "fail", "cancel"] as const) {
    app.post(`/api/admin/withdrawals/:withdrawalId/${action}`, requireAdminRole("reviewer"), (request, response) => {
      const userId = currentSession(response).user.id;
      let updatedWithdrawal = null as ReturnType<typeof applyWithdrawalReviewAction>["request"];
      let transitionError: string | null = null;
      let found = false;
      store.updateState(userId, (state) => {
        const withdrawal = state.withdrawals.find((item) => item.id === request.params.withdrawalId);
        if (!withdrawal) return state;
        found = true;
        const result = applyWithdrawalReviewAction(withdrawal, action, {
          reason: request.body?.reason,
          reviewerId: (response.locals.admin as AdminIdentity).id,
          recoverable: request.body?.recoverable
        });
        if (result.error || !result.request) {
          transitionError = result.error;
          return state;
        }
        updatedWithdrawal = result.request;
        const releaseFunds = result.request.fundsStatus === "released" && withdrawal.fundsStatus === "frozen";
        const settleFunds = result.request.fundsStatus === "paid" && withdrawal.fundsStatus === "frozen";
        const rewardLedger = state.rewardLedger.map((entry) => withdrawal.rewardLedgerEntryIds.includes(entry.id)
          ? { ...entry, status: releaseFunds ? "available" as const : settleFunds ? "paid" as const : entry.status, lockReason: releaseFunds || settleFunds ? null : entry.lockReason }
          : entry);
        const rewardJar = createRewardJarSnapshot(rewardLedger);
        const now = new Date().toISOString();
        return {
          ...state,
          rewardLedger,
          rewardJar: { ...rewardJar, userId },
          withdrawals: state.withdrawals.map((item) => item.id === withdrawal.id ? result.request! : item),
          auditLogs: [{
            id: store.createId("audit"),
            actorType: "admin",
            actorId: result.request.reviewerId ?? "reviewer-demo-001",
            action: "withdrawal.reviewed",
            entityType: "withdrawal_request",
            entityId: withdrawal.id,
            occurredAt: now,
            ipAddressMasked: "127.0.*.*",
            userAgent: String(request.get("user-agent") ?? "growthmore-admin").slice(0, 120),
            summary: "模拟提现状态更新为 " + result.request.status + "。",
            metadata: { action, fundsStatus: result.request.fundsStatus }
          }, ...state.auditLogs],
          home: { ...state.home, balances: { ...state.home.balances, rewardJarAmount: rewardJar.totalBalanceAmount } }
        };
      });
      if (!found) {
        response.status(404).json({ error: "withdrawal_not_found" });
        return;
      }
      if (transitionError || !updatedWithdrawal) {
        response.status(409).json({ error: "invalid_withdrawal_transition", message: transitionError });
        return;
      }
      response.json({ action, withdrawal: updatedWithdrawal });
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
    if (!requireDisclosures(store, response, ["task"])) return;
    respondWithTaskAction(store, response, request.params.taskId, "start");
  });

  app.post("/api/tasks/:taskId/submit", (request, response) => {
    if (!requireDisclosures(store, response, ["task"])) return;
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

  app.post("/api/admin/tasks/:taskId/verify", requireAdminRole("reviewer"), (request, response) => {
    respondWithTaskAction(
      store,
      response,
      request.params.taskId!,
      request.body?.result === "rejected" ? "reject" : "approve"
    );
  });

  app.post("/api/tasks/:taskId/retry", (request, response) => {
    if (!requireDisclosures(store, response, ["task"])) return;
    respondWithTaskAction(store, response, request.params.taskId, "retry");
  });

  app.post("/api/tasks/:taskId/claim", (request, response) => {
    if (!requireDisclosures(store, response, ["task"])) return;
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
    if (!requireDisclosures(store, response, ["task"])) return;
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
    if (!requireDisclosures(store, response, ["task"])) return;
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
