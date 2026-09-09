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
  type LinkedBankAccount,
  type MockUserSession,
  type RewardJarSnapshot,
  type RewardLedgerEntry,
  type SimulationAllocationDraft,
  type SimulationCycleRun,
  type SimulationProduct,
  type TaskBoardSummary,
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

type Fetcher = typeof fetch;

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

async function fetchJson<T>(baseUrl: string, path: string, fetcher: Fetcher): Promise<T> {
  const response = await fetcher(`${baseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function loadMobileAppData(
  apiBaseUrl = defaultApiBaseUrl,
  fetcher: Fetcher = fetch
): Promise<MobileAppData> {
  const baseUrl = apiBaseUrl.replace(/\/$/, "");
  const [
    tenantResponse,
    sessionResponse,
    accountResponse,
    homeResponse,
    tasksResponse,
    balanceResponse,
    balanceLedgerResponse,
    productsResponse,
    allocationResponse,
    simulationRunResponse,
    rewardJarResponse,
    rewardHistoryResponse,
    withdrawalResponse,
    complianceResponse
  ] = await Promise.all([
    fetchJson<{ tenant: BankTenant }>(baseUrl, "/api/tenant/current", fetcher),
    fetchJson<{ session: MockUserSession }>(baseUrl, "/api/auth/session", fetcher),
    fetchJson<{ account: LinkedBankAccount }>(baseUrl, "/api/bank-accounts/current", fetcher),
    fetchJson<{ home: TodayHomeSummary }>(baseUrl, "/api/app/home", fetcher),
    fetchJson<{ summary: TaskBoardSummary; tasks: UserTask[] }>(baseUrl, "/api/tasks", fetcher),
    fetchJson<{ balance: VirtualBalanceSnapshot }>(baseUrl, "/api/virtual-balance", fetcher),
    fetchJson<{ ledger: VirtualBalanceLedgerEntry[] }>(baseUrl, "/api/virtual-balance/ledger", fetcher),
    fetchJson<{ products: SimulationProduct[] }>(baseUrl, "/api/simulation/products", fetcher),
    fetchJson<{ allocationDraft: SimulationAllocationDraft }>(baseUrl, "/api/simulation/allocations", fetcher),
    fetchJson<{ run: SimulationCycleRun }>(baseUrl, "/api/simulation/runs/current", fetcher),
    fetchJson<{ rewardJar: RewardJarSnapshot }>(baseUrl, "/api/rewards/jar", fetcher),
    fetchJson<{ ledger: RewardLedgerEntry[] }>(baseUrl, "/api/rewards/history", fetcher),
    fetchJson<{ withdrawals: WithdrawalRequest[] }>(baseUrl, "/api/withdrawals", fetcher),
    fetchJson<{ compliance: ComplianceSummary }>(baseUrl, "/api/disclosure-acceptances/current", fetcher)
  ]);

  return {
    allocationDraft: allocationResponse.allocationDraft,
    complianceSummary: complianceResponse.compliance,
    home: homeResponse.home,
    linkedBankAccount: accountResponse.account,
    rewardJar: rewardJarResponse.rewardJar,
    rewardLedger: rewardHistoryResponse.ledger,
    session: sessionResponse.session,
    simulationProducts: productsResponse.products,
    simulationRun: simulationRunResponse.run,
    taskBoard: tasksResponse.summary,
    tasks: tasksResponse.tasks,
    tenant: tenantResponse.tenant,
    virtualBalance: balanceResponse.balance,
    virtualBalanceLedger: balanceLedgerResponse.ledger,
    withdrawals: withdrawalResponse.withdrawals
  };
}
