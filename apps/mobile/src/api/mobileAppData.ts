import {
  demoComplianceSummary,
  demoLinkedBankAccount,
  demoMockSession,
  demoRewardJar,
  demoRewardLedger,
  demoSimulationAllocationDraft,
  demoSimulationCycleRun,
  demoSimulationProducts,
  demoTaskBoardSummary,
  demoTenant,
  demoTodayHomeSummary,
  demoUserTasks,
  demoVirtualBalance,
  demoVirtualBalanceLedger,
  demoWithdrawalRequests,
  type BankTenant,
  type ComplianceSummary,
  type DisclosureAcceptance,
  type LinkedBankAccount,
  type LearningLesson,
  type LearningProgress,
  type MockUserSession,
  type RewardJarSnapshot,
  type RewardLedgerEntry,
  type SimulationAllocation,
  type SimulationAllocationDraft,
  type SimulationCycleRun,
  type SimulationReflectionSubmission,
  type SimulationReflectionResult,
  type SimulationProduct,
  type TaskBoardSummary,
  type TaskAction,
  type TodayHomeSummary,
  type UserTask,
  type VirtualBalanceLedgerEntry,
  type VirtualBalanceSnapshot,
  type WithdrawalRequest
} from "@growthmore/shared";

declare const process: {
  env: {
    EXPO_PUBLIC_API_BASE_URL?: string;
  };
};

export const railwayApiBaseUrl = "https://growthmore-production.up.railway.app";

type ApiEnvironment = {
  env?: {
    EXPO_PUBLIC_API_BASE_URL?: string;
  };
};

export function resolveApiBaseUrl(envSource?: ApiEnvironment): string {
  return envSource?.env?.EXPO_PUBLIC_API_BASE_URL || railwayApiBaseUrl;
}

const runtimeProcess = typeof process !== "undefined" ? process : undefined;
export const defaultApiBaseUrl = resolveApiBaseUrl(runtimeProcess);

export type MobileAppData = {
  allocationDraft: SimulationAllocationDraft;
  complianceSummary: ComplianceSummary;
  home: TodayHomeSummary;
  linkedBankAccount: LinkedBankAccount;
  rewardJar: RewardJarSnapshot;
  rewardLedger: RewardLedgerEntry[];
  session: MockUserSession;
  simulationProducts: SimulationProduct[];
  simulationRun: SimulationCycleRun;
  taskBoard: TaskBoardSummary;
  tasks: UserTask[];
  tenant: BankTenant;
  virtualBalance: VirtualBalanceSnapshot;
  virtualBalanceLedger: VirtualBalanceLedgerEntry[];
  withdrawals: WithdrawalRequest[];
};

export type Fetcher = typeof fetch;
export type MobileDataModule = "account" | "home" | "tasks" | "simulation" | "rewards" | "compliance";
export type MobileDataLoadResult = {
  data: MobileAppData;
  errors: Partial<Record<MobileDataModule, string>>;
};

export type MobileTaskAction = Extract<TaskAction, "start" | "submit" | "retry" | "claim">;

export type TaskActionResponse = {
  action: MobileTaskAction;
  autoVerified?: boolean;
  balance?: VirtualBalanceSnapshot;
  idempotent?: boolean;
  ledgerEntry?: VirtualBalanceLedgerEntry | null;
  task: UserTask;
};

export type LearningLessonResponse = { lesson: LearningLesson; progress: LearningProgress };
export type LearningQuizResponse = { passed: boolean; feedback: string; progress: LearningProgress; task: UserTask };

export function acceptDisclosure(disclosureId: string, apiBaseUrl = defaultApiBaseUrl, fetcher: Fetcher = fetch) {
  return postJson<{ acceptance: DisclosureAcceptance; idempotent: boolean }>(
    apiBaseUrl,
    "/api/disclosures/" + encodeURIComponent(disclosureId) + "/accept",
    { channel: "mobile" },
    fetcher
  );
}

export class MobileApiError extends Error {
  constructor(message: string, readonly status: number | null, readonly retryable: boolean) {
    super(message);
    this.name = "MobileApiError";
  }
}

async function requestJson<T>(baseUrl: string, path: string, options: RequestInit, fetcher: Fetcher): Promise<T> {
  let response: Response;
  try {
    response = await fetcher(baseUrl.replace(/\/$/, "") + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers }
    });
  } catch {
    throw new MobileApiError("网络连接失败，操作未完成。请检查网络后重试。", null, true);
  }
  let payload: T & { error?: string; message?: string; messages?: string[]; reflection?: { messages?: string[] } };
  try {
    payload = await response.json() as typeof payload;
  } catch {
    throw new MobileApiError("服务响应无法读取，请稍后重试。", response.status, response.status >= 500);
  }
  if (!response.ok) {
    const message = payload.message ?? payload.error ?? payload.messages?.join(" ") ?? payload.reflection?.messages?.join(" ") ??
      (response.status >= 500 ? "服务暂时不可用，请稍后重试。" : "请求未完成，请检查后重试。");
    throw new MobileApiError(message, response.status, response.status >= 500 || response.status === 429);
  }
  return payload;
}

async function postJson<T>(baseUrl: string, path: string, body: unknown, fetcher: Fetcher): Promise<T> {
  return requestJson<T>(baseUrl, path, {
    method: "POST",
    body: JSON.stringify(body)
  }, fetcher);
}

export function loadLearningLesson(lessonId: string, apiBaseUrl = defaultApiBaseUrl, fetcher: Fetcher = fetch) {
  return fetchJson<LearningLessonResponse>(apiBaseUrl.replace(/\/$/, ""), "/api/learning/lessons/" + encodeURIComponent(lessonId), fetcher);
}

export function markLessonSectionRead(lessonId: string, sectionId: string, apiBaseUrl = defaultApiBaseUrl, fetcher: Fetcher = fetch) {
  return postJson<{ progress: LearningProgress }>(apiBaseUrl, "/api/learning/lessons/" + encodeURIComponent(lessonId) + "/read", { sectionId }, fetcher);
}

export function submitLearningQuiz(quizId: string, answerId: string, apiBaseUrl = defaultApiBaseUrl, fetcher: Fetcher = fetch) {
  return postJson<LearningQuizResponse>(apiBaseUrl, "/api/learning/quizzes/" + encodeURIComponent(quizId) + "/submit", { answerId }, fetcher);
}

export function updateHomeIntroduction(dismissed: boolean, apiBaseUrl = defaultApiBaseUrl, fetcher: Fetcher = fetch) {
  return postJson<{ home: TodayHomeSummary }>(apiBaseUrl, "/api/app/home/introduction", { dismissed }, fetcher);
}

export function submitWithdrawal(
  amount: number,
  idempotencyKey: string,
  apiBaseUrl = defaultApiBaseUrl,
  fetcher: Fetcher = fetch
) {
  return postJson<{ withdrawal: WithdrawalRequest; idempotent: boolean }>(
    apiBaseUrl,
    "/api/rewards/withdraw",
    { amount, idempotencyKey },
    fetcher
  );
}

export async function saveSimulationAllocations(
  allocations: Array<Pick<SimulationAllocation, "productId" | "amount">>,
  apiBaseUrl = defaultApiBaseUrl,
  fetcher: Fetcher = fetch
): Promise<{ allocationDraft: SimulationAllocationDraft }> {
  const path = "/api/simulation/allocations";
  return requestJson<{ allocationDraft: SimulationAllocationDraft }>(apiBaseUrl, path, {
    method: "PUT",
    body: JSON.stringify({ allocations })
  }, fetcher);
}

export async function runSimulationCycle(apiBaseUrl = defaultApiBaseUrl, fetcher: Fetcher = fetch): Promise<{ run: SimulationCycleRun }> {
  return postJson<{ run: SimulationCycleRun }>(apiBaseUrl, "/api/simulation/run", {}, fetcher);
}

export async function submitSimulationReflection(
  submission: SimulationReflectionSubmission,
  apiBaseUrl = defaultApiBaseUrl,
  fetcher: Fetcher = fetch
): Promise<{ reflection: SimulationReflectionResult; run: SimulationCycleRun; idempotent: boolean }> {
  return postJson(apiBaseUrl, "/api/simulation/runs/" + encodeURIComponent(submission.runId) + "/reflection", submission, fetcher);
}

export const fallbackMobileAppData: MobileAppData = {
  allocationDraft: demoSimulationAllocationDraft,
  complianceSummary: demoComplianceSummary,
  home: demoTodayHomeSummary,
  linkedBankAccount: demoLinkedBankAccount,
  rewardJar: demoRewardJar,
  rewardLedger: demoRewardLedger,
  session: demoMockSession,
  simulationProducts: demoSimulationProducts,
  simulationRun: demoSimulationCycleRun,
  taskBoard: demoTaskBoardSummary,
  tasks: demoUserTasks,
  tenant: demoTenant,
  virtualBalance: demoVirtualBalance,
  virtualBalanceLedger: demoVirtualBalanceLedger,
  withdrawals: demoWithdrawalRequests
};

export const emptyMobileAppData: MobileAppData = {
  ...fallbackMobileAppData,
  session: {
    user: { ...fallbackMobileAppData.session.user, id: "unavailable", displayName: "用户", phoneMasked: "", kycStatus: "not_started" },
    auth: { ...fallbackMobileAppData.session.auth, accessToken: "" }
  },
  linkedBankAccount: {
    ...fallbackMobileAppData.linkedBankAccount,
    id: "unavailable",
    accountName: "",
    accountNumberMasked: "",
    status: "not_linked",
    isWithdrawalAccount: false
  },
  allocationDraft: { ...fallbackMobileAppData.allocationDraft, allocations: [], totalAllocatedAmount: 0, unallocatedAmount: 0 },
  complianceSummary: { ...fallbackMobileAppData.complianceSummary, acceptedDisclosureCount: 0, acceptedDisclosures: [], latestAuditLogs: [] },
  home: {
    ...fallbackMobileAppData.home,
    balances: { ...fallbackMobileAppData.home.balances, virtualGrowthAmount: 0, rewardJarAmount: 0 }
  },
  rewardJar: {
    ...fallbackMobileAppData.rewardJar,
    totalBalanceAmount: 0,
    availableAmount: 0,
    lockedAmount: 0,
    pendingAmount: 0,
    thisMonthEstimatedAmount: 0,
    thisMonthEarnedAmount: 0,
    ledger: [],
    statusCounts: { pending: 0, available: 0, locked: 0, withdrawal_pending: 0, paid: 0, failed: 0, reversed: 0 }
  },
  rewardLedger: [],
  simulationProducts: [],
  taskBoard: { ...fallbackMobileAppData.taskBoard, todayAvailableVirtualGrowthAmount: 0, todayAvailableRewardJarAmount: 0, totalTaskCount: 0 },
  tasks: [],
  virtualBalance: { ...fallbackMobileAppData.virtualBalance, availableAmount: 0, allocatedAmount: 0, frozenAmount: 0, totalAmount: 0, todayEarnedAmount: 0 },
  virtualBalanceLedger: [],
  withdrawals: []
};

async function fetchJson<T>(baseUrl: string, path: string, fetcher: Fetcher): Promise<T> {
  return requestJson<T>(baseUrl, path, { method: "GET" }, fetcher);
}

export async function runTaskAction(
  taskId: string,
  action: MobileTaskAction,
  apiBaseUrl = defaultApiBaseUrl,
  fetcher: Fetcher = fetch
): Promise<TaskActionResponse> {
  const baseUrl = apiBaseUrl.replace(/\/$/, "");
  const path = "/api/tasks/" + encodeURIComponent(taskId) + "/" + action;
  return requestJson<TaskActionResponse>(baseUrl, path, {
    method: "POST",
  }, fetcher);
}

const moduleCache = new Map<string, MobileAppData>();
export function clearMobileDataCache(userId?: string) {
  if (userId) moduleCache.delete(userId);
  else moduleCache.clear();
}

export async function loadMobileAppData(
  apiBaseUrl = defaultApiBaseUrl,
  fetcher: Fetcher = fetch,
  previousData: MobileAppData = emptyMobileAppData,
  onlyModule?: MobileDataModule
): Promise<MobileDataLoadResult> {
  const baseUrl = apiBaseUrl.replace(/\/$/, "");
  const loaders: Record<MobileDataModule, () => Promise<Partial<MobileAppData>>> = {
    account: async () => {
      const [tenant, session, account] = await Promise.all([
        fetchJson<{ tenant: BankTenant }>(baseUrl, "/api/tenant/current", fetcher),
        fetchJson<{ session: MockUserSession }>(baseUrl, "/api/auth/session", fetcher),
        fetchJson<{ account: LinkedBankAccount }>(baseUrl, "/api/bank-accounts/current", fetcher)
      ]);
      return { tenant: tenant.tenant, session: session.session, linkedBankAccount: account.account };
    },
    home: async () => ({ home: (await fetchJson<{ home: TodayHomeSummary }>(baseUrl, "/api/app/home", fetcher)).home }),
    tasks: async () => {
      const value = await fetchJson<{ summary: TaskBoardSummary; tasks: UserTask[] }>(baseUrl, "/api/tasks", fetcher);
      return { taskBoard: value.summary, tasks: value.tasks };
    },
    simulation: async () => {
      const [products, allocation, run, balance, ledger] = await Promise.all([
        fetchJson<{ products: SimulationProduct[] }>(baseUrl, "/api/simulation/products", fetcher),
        fetchJson<{ allocationDraft: SimulationAllocationDraft }>(baseUrl, "/api/simulation/allocations", fetcher),
        fetchJson<{ run: SimulationCycleRun }>(baseUrl, "/api/simulation/runs/current", fetcher),
        fetchJson<{ balance: VirtualBalanceSnapshot }>(baseUrl, "/api/virtual-balance", fetcher),
        fetchJson<{ ledger: VirtualBalanceLedgerEntry[] }>(baseUrl, "/api/virtual-balance/ledger", fetcher)
      ]);
      return { simulationProducts: products.products, allocationDraft: allocation.allocationDraft, simulationRun: run.run, virtualBalance: balance.balance, virtualBalanceLedger: ledger.ledger };
    },
    rewards: async () => {
      const [jar, history, withdrawals] = await Promise.all([
        fetchJson<{ rewardJar: RewardJarSnapshot }>(baseUrl, "/api/rewards/jar", fetcher),
        fetchJson<{ ledger: RewardLedgerEntry[] }>(baseUrl, "/api/rewards/history", fetcher),
        fetchJson<{ withdrawals: WithdrawalRequest[] }>(baseUrl, "/api/withdrawals", fetcher)
      ]);
      return { rewardJar: jar.rewardJar, rewardLedger: history.ledger, withdrawals: withdrawals.withdrawals };
    },
    compliance: async () => ({ complianceSummary: (await fetchJson<{ compliance: ComplianceSummary }>(baseUrl, "/api/disclosure-acceptances/current", fetcher)).compliance })
  };
  const modules = onlyModule ? [onlyModule] : Object.keys(loaders) as MobileDataModule[];
  const results = await Promise.allSettled(modules.map((module) => loaders[module]()));
  const accountIndex = modules.indexOf("account");
  const accountResult = accountIndex >= 0 ? results[accountIndex] : undefined;
  const loadedUserId = accountResult?.status === "fulfilled" ? accountResult.value.session?.user.id : previousData.session.user.id;
  const accountChanged = loadedUserId && loadedUserId !== "unavailable" && loadedUserId !== previousData.session.user.id;
  let data = accountChanged ? (moduleCache.get(loadedUserId) ?? emptyMobileAppData) : previousData;
  const errors: Partial<Record<MobileDataModule, string>> = {};
  results.forEach((result, index) => {
    const module = modules[index]!;
    if (result.status === "fulfilled") data = { ...data, ...result.value };
    else errors[module] = result.reason instanceof Error ? result.reason.message : "模块暂时不可用，请重试。";
  });
  if (data.session.user.id !== "unavailable") moduleCache.set(data.session.user.id, data);
  return { data, errors };
}
