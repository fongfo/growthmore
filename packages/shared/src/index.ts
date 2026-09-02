export type HexColor = `#${string}`;

export type TenantTheme = {
  colors: {
    primary: HexColor;
    secondary: HexColor;
    cta: HexColor;
    growth: HexColor;
    learning: HexColor;
    reward: HexColor;
    risk: HexColor;
    background: HexColor;
    surface: HexColor;
    border: HexColor;
    text: HexColor;
    mutedText: HexColor;
  };
  typography: {
    displayName: string;
    fontFamily: string;
    numberFontFamily: string;
  };
  radius: {
    card: number;
    button: number;
  };
};

export type TenantDisclosureCopy = {
  virtualBalanceNotice: string;
  rewardNotice: string;
  simulationNotice: string;
};

export type BankTenant = {
  slug: string;
  displayName: string;
  appName: string;
  supportEmail: string;
  logoUrl: string | null;
  theme: TenantTheme;
  disclosureCopy: TenantDisclosureCopy;
  featureFlags: {
    mockKyc: boolean;
    mockBankAccountLinking: boolean;
    rewardWithdrawal: boolean;
    realProductRedirect: boolean;
  };
};

export type ProductLoopStep = {
  id: "earn" | "allocate" | "grow" | "collect";
  label: string;
  title: string;
};

export type KycStatus = "not_started" | "mock_verified";

export type BankAccountStatus = "not_linked" | "linked" | "verification_required";

export type MockUserSession = {
  user: {
    id: string;
    displayName: string;
    phoneMasked: string;
    tenantSlug: BankTenant["slug"];
    kycStatus: KycStatus;
  };
  auth: {
    accessToken: string;
    tokenType: "Bearer";
    expiresInSeconds: number;
  };
};

export type LinkedBankAccount = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumberMasked: string;
  currency: "CNY";
  status: BankAccountStatus;
  isWithdrawalAccount: boolean;
};

export type TaskCategory = "habit" | "learning" | "banking" | "campaign";

export type TaskStatus =
  | "available"
  | "in_progress"
  | "pending_verification"
  | "completed"
  | "claimed"
  | "rejected"
  | "reversed";

export type TaskAction = "start" | "submit" | "approve" | "reject" | "retry" | "claim" | "reverse";

export type TaskReward = {
  virtualGrowthAmount: number;
  rewardJarAmount: number;
  currency: "CNY";
  badgeLabel?: string;
};

export type TaskDefinition = {
  id: string;
  category: TaskCategory;
  title: string;
  description: string;
  completionCriteria: string;
  riskNotice: string;
  reward: TaskReward;
  expiresAt: string;
  estimatedMinutes: number;
};

export type UserTask = TaskDefinition & {
  userId: MockUserSession["user"]["id"];
  status: TaskStatus;
  availableActions: TaskAction[];
  rejectionReason: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  claimedAt: string | null;
  updatedAt: string;
};

export type TaskBoardSummary = {
  todayAvailableVirtualGrowthAmount: number;
  todayAvailableRewardJarAmount: number;
  completionStreakDays: number;
  totalTaskCount: number;
  statusCounts: Record<TaskStatus, number>;
  categoryFilters: Array<{
    id: "all" | TaskCategory | "completed";
    label: string;
  }>;
};
export type VirtualBalanceLedgerEntryType = "earn" | "allocate" | "release" | "freeze" | "clawback" | "adjust";

export type VirtualBalanceLedgerSourceType = "task" | "simulation_allocation" | "risk_review" | "admin_adjustment";

export type VirtualBalanceSnapshot = {
  availableAmount: number;
  allocatedAmount: number;
  frozenAmount: number;
  totalAmount: number;
  currency: "CNY";
  dailyEarnLimitAmount: number;
  todayEarnedAmount: number;
  expiresAt: string;
  disclosure: string;
};

export type VirtualBalanceLedgerBalanceAfter = Pick<
  VirtualBalanceSnapshot,
  "availableAmount" | "allocatedAmount" | "frozenAmount" | "totalAmount"
>;

export type VirtualBalanceLedgerEntry = {
  id: string;
  userId: MockUserSession["user"]["id"];
  entryType: VirtualBalanceLedgerEntryType;
  amount: number;
  currency: "CNY";
  sourceType: VirtualBalanceLedgerSourceType;
  sourceId: string;
  balanceAfter: VirtualBalanceLedgerBalanceAfter;
  ruleVersion: string;
  description: string;
  createdAt: string;
};
export type SimulationRiskLevel = "low" | "medium_low" | "medium" | "medium_high";

export type SimulationProduct = {
  id: string;
  name: string;
  userLabel: string;
  riskLevel: SimulationRiskLevel;
  riskLabel: string;
  volatilityLabel: string;
  learningGoal: string;
  simulationLogic: string;
  riskDisclosure: string;
};

export type SimulationAllocation = {
  productId: SimulationProduct["id"];
  amount: number;
  percent: number;
};

export type SimulationAllocationExample = {
  id: "conservative" | "balanced" | "growth";
  label: string;
  description: string;
  allocations: Array<Pick<SimulationAllocation, "productId" | "amount">>;
};

export type SimulationAllocationDraft = {
  userId: MockUserSession["user"]["id"];
  availableAmount: number;
  totalAllocatedAmount: number;
  unallocatedAmount: number;
  riskScore: number;
  riskLabel: string;
  riskDisclosure: string;
  allocations: SimulationAllocation[];
  examples: SimulationAllocationExample[];
};

export type SimulationProductCycleResult = {
  productId: SimulationProduct["id"];
  productName: SimulationProduct["name"];
  riskLabel: SimulationProduct["riskLabel"];
  startingAmount: number;
  simulatedChangeAmount: number;
  simulatedChangePercent: number;
  endingAmount: number;
  explanation: string;
};

export type SimulationReflectionQuestion = {
  id: string;
  prompt: string;
  helperText: string;
};

export type SimulationCycleRun = {
  id: string;
  userId: MockUserSession["user"]["id"];
  cycleLabel: string;
  startedAt: string;
  completedAt: string;
  startingVirtualAmount: number;
  simulatedEndingVirtualAmount: number;
  simulatedChangeAmount: number;
  simulatedChangePercent: number;
  rewardActivityAmount: number;
  rewardCalculationBasis: string;
  disclosure: string;
  riskConfirmationRequired: boolean;
  riskConfirmationStatements: string[];
  productResults: SimulationProductCycleResult[];
  reflectionQuestions: SimulationReflectionQuestion[];
};

export type SimulationReflectionSubmission = {
  runId: SimulationCycleRun["id"];
  answers: Array<{
    questionId: SimulationReflectionQuestion["id"];
    answer: string;
  }>;
  riskConfirmationAccepted: boolean;
};

export type SimulationReflectionResult = {
  runId: SimulationCycleRun["id"];
  completed: boolean;
  learningCompletionCoefficient: number;
  acceptedRiskConfirmation: boolean;
  messages: string[];
};
export type RewardStatus = "pending" | "available" | "locked" | "withdrawal_pending" | "paid" | "failed" | "reversed";

export type RewardLedgerSourceType = "task" | "learning_cycle" | "campaign_budget" | "manual_review" | "withdrawal";

export type RewardLedgerEntry = {
  id: string;
  userId: MockUserSession["user"]["id"];
  status: RewardStatus;
  amount: number;
  currency: "CNY";
  sourceType: RewardLedgerSourceType;
  sourceId: string;
  programId: string;
  budgetBatchId: string;
  activityRuleVersion: string;
  description: string;
  lockReason: string | null;
  availableAt: string | null;
  createdAt: string;
};

export type RewardJarSnapshot = {
  userId: MockUserSession["user"]["id"];
  currency: "CNY";
  totalBalanceAmount: number;
  availableAmount: number;
  lockedAmount: number;
  pendingAmount: number;
  thisMonthEstimatedAmount: number;
  thisMonthEarnedAmount: number;
  minimumWithdrawalAmount: number;
  withdrawalWindow: TodayHomeSummary["withdrawalWindow"];
  disclosure: string;
  rewardRuleSummary: string;
  ledger: RewardLedgerEntry[];
  statusCounts: Record<RewardStatus, number>;
};
export type WithdrawalStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "paid"
  | "failed"
  | "cancelled";

export type WithdrawalAccountSnapshot = Pick<
  LinkedBankAccount,
  "id" | "bankName" | "accountName" | "accountNumberMasked" | "currency" | "status"
>;

export type WithdrawalRequest = {
  id: string;
  userId: MockUserSession["user"]["id"];
  amount: number;
  currency: "CNY";
  status: WithdrawalStatus;
  rewardLedgerEntryIds: RewardLedgerEntry["id"][];
  withdrawalAccount: WithdrawalAccountSnapshot;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewerId: string | null;
  estimatedArrivalLabel: string;
  failureReason: string | null;
  rejectionReason: string | null;
  disclosure: string;
  createdAt: string;
  updatedAt: string;
};

export type WithdrawalSubmissionResult = {
  request: WithdrawalRequest | null;
  errors: string[];
};

export type WithdrawalReviewAction = "approve" | "reject" | "retry";

export type WithdrawalReviewResult = {
  request: WithdrawalRequest | null;
  error: string | null;
};

export type DisclosureType = "virtual_balance" | "simulation" | "reward_rule" | "withdrawal" | "real_product_redirect";

export type DisclosureStatus = "active" | "superseded";

export type DisclosureRequiredFor = "onboarding" | "task" | "simulation" | "reward" | "withdrawal" | "real_product";

export type DisclosureVersion = {
  id: string;
  type: DisclosureType;
  version: string;
  title: string;
  body: string;
  requiredFor: DisclosureRequiredFor[];
  status: DisclosureStatus;
  effectiveAt: string;
};

export type DisclosureAcceptanceChannel = "mobile" | "api";

export type DisclosureAcceptance = {
  id: string;
  userId: MockUserSession["user"]["id"];
  disclosureId: DisclosureVersion["id"];
  disclosureType: DisclosureType;
  version: DisclosureVersion["version"];
  acceptedAt: string;
  channel: DisclosureAcceptanceChannel;
  ipAddressMasked: string;
  userAgent: string;
};

export type DisclosureAcceptanceResult = {
  acceptance: DisclosureAcceptance | null;
  auditLog: AuditLogEntry | null;
  error: string | null;
};

export type AuditActorType = "user" | "admin" | "system";

export type AuditAction =
  | "disclosure.accepted"
  | "task.status_changed"
  | "reward.ledger_created"
  | "withdrawal.submitted"
  | "withdrawal.reviewed";

export type AuditEntityType = "disclosure" | "task" | "reward_ledger" | "withdrawal_request";

export type AuditLogEntry = {
  id: string;
  actorType: AuditActorType;
  actorId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  occurredAt: string;
  ipAddressMasked: string;
  userAgent: string;
  summary: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type ComplianceSummary = {
  requiredDisclosureCount: number;
  acceptedDisclosureCount: number;
  pendingDisclosureCount: number;
  requiredDisclosures: DisclosureVersion[];
  acceptedDisclosures: DisclosureAcceptance[];
  pendingDisclosures: DisclosureVersion[];
  latestAuditLogs: AuditLogEntry[];
};

export type TodayTaskType = "daily_check_in" | "learning" | "simulation" | "reward_claim";

export type TodayHomeSummary = {
  userId: MockUserSession["user"]["id"];
  tenantSlug: BankTenant["slug"];
  level: {
    label: string;
    planName: string;
    progressPercent: number;
    remainingTaskCount: number;
  };
  balances: {
    virtualGrowthAmount: number;
    rewardJarAmount: number;
    currency: "CNY";
  };
  recommendedTask: {
    id: string;
    type: TodayTaskType;
    title: string;
    description: string;
    rewardLabel: string;
    estimatedMinutes: number;
    ctaLabel: string;
  };
  withdrawalWindow: {
    label: string;
    opensAt: string;
    closesAt: string;
    status: "upcoming" | "open" | "closed";
  };
  nextActions: Array<{
    id: "portfolio" | "reward" | "learning";
    label: string;
  }>;
};

export const defaultTenantTheme: TenantTheme = {
  colors: {
    primary: "#0F172A",
    secondary: "#1E3A8A",
    cta: "#1E3A8A",
    growth: "#12B886",
    learning: "#6C5CE7",
    reward: "#A16207",
    risk: "#DC2626",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    border: "#E2E8F0",
    text: "#0F172A",
    mutedText: "#64748B"
  },
  typography: {
    displayName: "System Sans",
    fontFamily:
      "System, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    numberFontFamily: "IBM Plex Sans"
  },
  radius: {
    card: 16,
    button: 12
  }
};

export const demoTenant: BankTenant = {
  slug: "demo-bank",
  displayName: "Growthmore Bank",
  appName: "成长金计划",
  supportEmail: "support@growthmore.example",
  logoUrl: null,
  theme: defaultTenantTheme,
  disclosureCopy: {
    virtualBalanceNotice: "虚拟成长金用于投资学习，不是现金，不可直接提现。",
    rewardNotice: "奖励罐中的金额由银行活动预算提供，可按活动规则申请领取。",
    simulationNotice: "模拟投资结果仅用于金融知识学习，不代表真实投资收益。"
  },
  featureFlags: {
    mockKyc: true,
    mockBankAccountLinking: true,
    rewardWithdrawal: true,
    realProductRedirect: false
  }
};

export const productLoopSteps: ProductLoopStep[] = [
  { id: "earn", label: "01", title: "完成任务" },
  { id: "allocate", label: "02", title: "配置成长金" },
  { id: "grow", label: "03", title: "运行学习周期" },
  { id: "collect", label: "04", title: "领取活动奖励" }
];

export const demoMockSession: MockUserSession = {
  user: {
    id: "mock-user-001",
    displayName: "Alex",
    phoneMasked: "138****4288",
    tenantSlug: demoTenant.slug,
    kycStatus: "mock_verified"
  },
  auth: {
    accessToken: "mock-demo-token",
    tokenType: "Bearer",
    expiresInSeconds: 3600
  }
};

export const demoLinkedBankAccount: LinkedBankAccount = {
  id: "mock-account-001",
  bankName: demoTenant.displayName,
  accountName: demoMockSession.user.displayName,
  accountNumberMasked: "**** **** **** 4288",
  currency: "CNY",
  status: "linked",
  isWithdrawalAccount: true
};

export const taskStateTransitions: Record<TaskStatus, Partial<Record<TaskAction, TaskStatus>>> = {
  available: { start: "in_progress" },
  in_progress: { submit: "pending_verification" },
  pending_verification: { approve: "completed", reject: "rejected" },
  completed: { claim: "claimed" },
  claimed: { reverse: "reversed" },
  rejected: { retry: "in_progress" },
  reversed: {}
};

export const taskStatusCopy: Record<
  TaskStatus,
  {
    label: string;
    ctaLabel: string;
  }
> = {
  available: { label: "可完成", ctaLabel: "去完成" },
  in_progress: { label: "进行中", ctaLabel: "提交验证" },
  pending_verification: { label: "验证中", ctaLabel: "等待校验" },
  completed: { label: "已完成", ctaLabel: "领取奖励" },
  claimed: { label: "已领取", ctaLabel: "查看奖励" },
  rejected: { label: "未通过", ctaLabel: "查看原因" },
  reversed: { label: "已撤销", ctaLabel: "查看记录" }
};

export function getAvailableTaskActions(status: TaskStatus): TaskAction[] {
  return Object.keys(taskStateTransitions[status]) as TaskAction[];
}

export function getNextTaskStatus(status: TaskStatus, action: TaskAction): TaskStatus | null {
  return taskStateTransitions[status][action] ?? null;
}

export function canTransitionTask(status: TaskStatus, action: TaskAction): boolean {
  return getNextTaskStatus(status, action) !== null;
}

export function transitionTaskStatus(status: TaskStatus, action: TaskAction): TaskStatus {
  const nextStatus = getNextTaskStatus(status, action);

  if (!nextStatus) {
    throw new Error(`Invalid task transition: ${status} -> ${action}`);
  }

  return nextStatus;
}

const demoNow = "2026-08-25T15:00:00+08:00";
const demoTaskExpiry = "2026-08-31T23:59:59+08:00";

function withUserTaskState(task: TaskDefinition, status: TaskStatus, state?: Partial<UserTask>): UserTask {
  return {
    ...task,
    userId: demoMockSession.user.id,
    status,
    availableActions: getAvailableTaskActions(status),
    rejectionReason: state?.rejectionReason ?? null,
    startedAt: state?.startedAt ?? null,
    submittedAt: state?.submittedAt ?? null,
    completedAt: state?.completedAt ?? null,
    claimedAt: state?.claimedAt ?? null,
    updatedAt: state?.updatedAt ?? demoNow
  };
}

export function applyTaskAction(task: UserTask, action: TaskAction): UserTask {
  const nextStatus = transitionTaskStatus(task.status, action);

  return {
    ...task,
    status: nextStatus,
    availableActions: getAvailableTaskActions(nextStatus),
    rejectionReason: action === "reject" ? "提交记录与任务条件不匹配，请检查后重试。" : null,
    startedAt: action === "start" || action === "retry" ? demoNow : task.startedAt,
    submittedAt: action === "submit" ? demoNow : task.submittedAt,
    completedAt: action === "approve" ? demoNow : task.completedAt,
    claimedAt: action === "claim" ? demoNow : task.claimedAt,
    updatedAt: demoNow
  };
}

const taskDefinitions: TaskDefinition[] = [
  {
    id: "daily-check-in",
    category: "habit",
    title: "完成今日签到",
    description: "打开 App 并确认今日金融健康提醒，建立连续学习习惯。",
    completionCriteria: "每日自然日内只能完成一次签到。",
    riskNotice: "频繁切换设备或账号会触发复核，避免重复领取。",
    reward: { virtualGrowthAmount: 100, rewardJarAmount: 0, currency: "CNY" },
    expiresAt: demoTaskExpiry,
    estimatedMinutes: 1
  },
  {
    id: "risk-lesson",
    category: "learning",
    title: "完成 5 分钟风险分散小课",
    description: "学习为什么模拟组合不该只押注一个行业，然后获得今日成长金。",
    completionCriteria: "完成课程阅读并通过 1 道理解题。",
    riskNotice: "模拟投资结果仅用于学习，不代表真实投资收益。",
    reward: { virtualGrowthAmount: 300, rewardJarAmount: 1.2, currency: "CNY", badgeLabel: "风险认知" },
    expiresAt: demoTaskExpiry,
    estimatedMinutes: 5
  },
  {
    id: "auto-savings-mock",
    category: "banking",
    title: "开启自动储蓄 mock",
    description: "模拟开启每月固定储蓄计划，用于验证银行任务校验流程。",
    completionCriteria: "提交 mock 自动储蓄设置后等待系统校验。",
    riskNotice: "Demo 阶段不会创建真实储蓄计划或扣款。",
    reward: { virtualGrowthAmount: 800, rewardJarAmount: 2.5, currency: "CNY" },
    expiresAt: demoTaskExpiry,
    estimatedMinutes: 3
  },
  {
    id: "profile-kyc-mock",
    category: "banking",
    title: "完成资料补全 mock",
    description: "使用 mock KYC 状态补全基础资料，解锁后续银行任务。",
    completionCriteria: "mock KYC 状态为已验证。",
    riskNotice: "这不代表真实 KYC、真实银行账户查询或真实打款能力。",
    reward: { virtualGrowthAmount: 1200, rewardJarAmount: 0, currency: "CNY" },
    expiresAt: demoTaskExpiry,
    estimatedMinutes: 2
  },
  {
    id: "savings-goal",
    category: "habit",
    title: "设置一个储蓄目标",
    description: "写下本月储蓄目标，让模拟配置有明确学习目标。",
    completionCriteria: "目标名称和金额必须完整。",
    riskNotice: "储蓄目标只是计划记录，不代表收益承诺。",
    reward: { virtualGrowthAmount: 200, rewardJarAmount: 0, currency: "CNY" },
    expiresAt: demoTaskExpiry,
    estimatedMinutes: 2
  },
  {
    id: "bank-account-linked",
    category: "banking",
    title: "绑定提现账户 mock",
    description: "确认已绑定的 mock 银行账户，后续奖励领取会显示该账户。",
    completionCriteria: "账户状态为 linked 且标记为提现账户。",
    riskNotice: "Demo 账户不表示真实银行账户校验或真实打款。",
    reward: { virtualGrowthAmount: 500, rewardJarAmount: 0, currency: "CNY" },
    expiresAt: demoTaskExpiry,
    estimatedMinutes: 1
  }
];

export const demoUserTasks: UserTask[] = [
  withUserTaskState(taskDefinitions[0]!, "available"),
  withUserTaskState(taskDefinitions[1]!, "in_progress", { startedAt: "2026-08-25T14:50:00+08:00" }),
  withUserTaskState(taskDefinitions[2]!, "pending_verification", {
    startedAt: "2026-08-25T14:30:00+08:00",
    submittedAt: "2026-08-25T14:35:00+08:00"
  }),
  withUserTaskState(taskDefinitions[3]!, "completed", {
    startedAt: "2026-08-24T10:00:00+08:00",
    submittedAt: "2026-08-24T10:04:00+08:00",
    completedAt: "2026-08-24T10:05:00+08:00"
  }),
  withUserTaskState(taskDefinitions[4]!, "rejected", {
    startedAt: "2026-08-24T11:00:00+08:00",
    submittedAt: "2026-08-24T11:03:00+08:00",
    rejectionReason: "目标金额缺失，请补充后重新提交。"
  }),
  withUserTaskState(taskDefinitions[5]!, "claimed", {
    startedAt: "2026-08-24T12:00:00+08:00",
    submittedAt: "2026-08-24T12:01:00+08:00",
    completedAt: "2026-08-24T12:02:00+08:00",
    claimedAt: "2026-08-24T12:03:00+08:00"
  })
];

function createEmptyStatusCounts(): Record<TaskStatus, number> {
  return {
    available: 0,
    in_progress: 0,
    pending_verification: 0,
    completed: 0,
    claimed: 0,
    rejected: 0,
    reversed: 0
  };
}

export function createTaskBoardSummary(tasks: UserTask[]): TaskBoardSummary {
  const actionableTasks = tasks.filter((task) => task.status !== "claimed" && task.status !== "reversed");
  const statusCounts = tasks.reduce((counts, task) => {
    counts[task.status] += 1;
    return counts;
  }, createEmptyStatusCounts());

  return {
    todayAvailableVirtualGrowthAmount: actionableTasks.reduce(
      (total, task) => total + task.reward.virtualGrowthAmount,
      0
    ),
    todayAvailableRewardJarAmount: actionableTasks.reduce((total, task) => total + task.reward.rewardJarAmount, 0),
    completionStreakDays: 4,
    totalTaskCount: tasks.length,
    statusCounts,
    categoryFilters: [
      { id: "all", label: "全部" },
      { id: "learning", label: "学习" },
      { id: "banking", label: "银行任务" },
      { id: "campaign", label: "活动" },
      { id: "completed", label: "已完成" }
    ]
  };
}

export const demoTaskBoardSummary = createTaskBoardSummary(demoUserTasks);
export const demoVirtualBalanceLedger: VirtualBalanceLedgerEntry[] = [
  {
    id: "vbl-001",
    userId: demoMockSession.user.id,
    entryType: "earn",
    amount: 1000,
    currency: "CNY",
    sourceType: "task",
    sourceId: "profile-kyc-mock",
    balanceAfter: { availableAmount: 1000, allocatedAmount: 0, frozenAmount: 0, totalAmount: 1000 },
    ruleVersion: "demo-mvp-v1",
    description: "完成资料补全 mock 获得成长金。",
    createdAt: "2026-08-24T10:05:00+08:00"
  },
  {
    id: "vbl-002",
    userId: demoMockSession.user.id,
    entryType: "earn",
    amount: 500,
    currency: "CNY",
    sourceType: "task",
    sourceId: "bank-account-linked",
    balanceAfter: { availableAmount: 1500, allocatedAmount: 0, frozenAmount: 0, totalAmount: 1500 },
    ruleVersion: "demo-mvp-v1",
    description: "绑定提现账户 mock 获得成长金。",
    createdAt: "2026-08-24T12:03:00+08:00"
  },
  {
    id: "vbl-003",
    userId: demoMockSession.user.id,
    entryType: "adjust",
    amount: 500,
    currency: "CNY",
    sourceType: "admin_adjustment",
    sourceId: "opening-demo-bonus",
    balanceAfter: { availableAmount: 2000, allocatedAmount: 0, frozenAmount: 0, totalAmount: 2000 },
    ruleVersion: "demo-mvp-v1",
    description: "Demo 开户活动成长金调整流水。",
    createdAt: "2026-08-25T09:00:00+08:00"
  },
  {
    id: "vbl-004",
    userId: demoMockSession.user.id,
    entryType: "allocate",
    amount: 400,
    currency: "CNY",
    sourceType: "simulation_allocation",
    sourceId: "allocation-001",
    balanceAfter: { availableAmount: 1600, allocatedAmount: 400, frozenAmount: 0, totalAmount: 2000 },
    ruleVersion: "demo-mvp-v1",
    description: "配置成长金到稳健模拟组合。",
    createdAt: "2026-08-25T10:15:00+08:00"
  },
  {
    id: "vbl-005",
    userId: demoMockSession.user.id,
    entryType: "release",
    amount: 150,
    currency: "CNY",
    sourceType: "simulation_allocation",
    sourceId: "allocation-001",
    balanceAfter: { availableAmount: 1750, allocatedAmount: 250, frozenAmount: 0, totalAmount: 2000 },
    ruleVersion: "demo-mvp-v1",
    description: "模拟组合释放未使用成长金。",
    createdAt: "2026-08-25T11:30:00+08:00"
  },
  {
    id: "vbl-006",
    userId: demoMockSession.user.id,
    entryType: "freeze",
    amount: 200,
    currency: "CNY",
    sourceType: "risk_review",
    sourceId: "review-001",
    balanceAfter: { availableAmount: 1550, allocatedAmount: 250, frozenAmount: 200, totalAmount: 2000 },
    ruleVersion: "demo-mvp-v1",
    description: "异常频率触发复核，临时冻结部分成长金。",
    createdAt: "2026-08-25T12:00:00+08:00"
  },
  {
    id: "vbl-007",
    userId: demoMockSession.user.id,
    entryType: "clawback",
    amount: 100,
    currency: "CNY",
    sourceType: "risk_review",
    sourceId: "review-001",
    balanceAfter: { availableAmount: 1550, allocatedAmount: 250, frozenAmount: 100, totalAmount: 1900 },
    ruleVersion: "demo-mvp-v1",
    description: "复核确认部分重复领取，扣回冻结成长金。",
    createdAt: "2026-08-25T13:10:00+08:00"
  }
];

export function createVirtualBalanceSnapshot(ledger: VirtualBalanceLedgerEntry[]): VirtualBalanceSnapshot {
  const latestEntry = ledger.at(-1);
  const todayEarnedAmount = ledger
    .filter((entry) => entry.entryType === "earn" && entry.createdAt.startsWith("2026-08-25"))
    .reduce((total, entry) => total + entry.amount, 0);

  return {
    availableAmount: latestEntry?.balanceAfter.availableAmount ?? 0,
    allocatedAmount: latestEntry?.balanceAfter.allocatedAmount ?? 0,
    frozenAmount: latestEntry?.balanceAfter.frozenAmount ?? 0,
    totalAmount: latestEntry?.balanceAfter.totalAmount ?? 0,
    currency: "CNY",
    dailyEarnLimitAmount: 3000,
    todayEarnedAmount,
    expiresAt: "2026-12-31T23:59:59+08:00",
    disclosure: demoTenant.disclosureCopy.virtualBalanceNotice
  };
}

export const demoVirtualBalance = createVirtualBalanceSnapshot(demoVirtualBalanceLedger);


export const demoSimulationProducts: SimulationProduct[] = [
  {
    id: "term-deposit",
    name: "模拟定存",
    userLabel: "稳健",
    riskLevel: "low",
    riskLabel: "低风险",
    volatilityLabel: "极低波动",
    learningGoal: "理解固定收益和期限",
    simulationLogic: "学习周期内按固定节奏展示小幅变化，帮助理解期限和稳定性。",
    riskDisclosure: "模拟定存只用于教育演示，不代表真实存款产品或利率承诺。"
  },
  {
    id: "money-market",
    name: "模拟货币基金",
    userLabel: "灵活",
    riskLevel: "low",
    riskLabel: "低风险",
    volatilityLabel: "低波动",
    learningGoal: "理解流动性",
    simulationLogic: "学习周期内展示轻微上下波动，突出灵活性和低波动特征。",
    riskDisclosure: "模拟货币基金不代表真实基金收益，真实产品需完成银行风险测评。"
  },
  {
    id: "bond",
    name: "模拟债券",
    userLabel: "票息",
    riskLevel: "medium_low",
    riskLabel: "中低风险",
    volatilityLabel: "低到中波动",
    learningGoal: "理解利率和票息",
    simulationLogic: "用票息和利率变化解释债券价格为什么会有小幅波动。",
    riskDisclosure: "模拟债券可能上涨也可能下跌，不构成真实投资建议。"
  },
  {
    id: "gold",
    name: "模拟黄金",
    userLabel: "避险资产",
    riskLevel: "medium_high",
    riskLabel: "中高风险",
    volatilityLabel: "中高波动",
    learningGoal: "理解商品波动",
    simulationLogic: "通过更明显的涨跌展示商品资产受市场情绪影响的特点。",
    riskDisclosure: "高波动模拟资产可能上涨也可能下跌，真实投资需谨慎。"
  },
  {
    id: "balanced-fund",
    name: "模拟平衡基金",
    userLabel: "成长组合",
    riskLevel: "medium",
    riskLabel: "中风险",
    volatilityLabel: "中波动",
    learningGoal: "理解分散配置",
    simulationLogic: "组合展示股债等资产分散后的中等波动，帮助理解配置。",
    riskDisclosure: "模拟平衡基金只用于学习资产配置，不代表真实基金推荐。"
  }
];

export const demoSimulationAllocationExamples: SimulationAllocationExample[] = [
  {
    id: "conservative",
    label: "稳健示例",
    description: "以低波动资产为主，用于理解本金稳定和流动性。",
    allocations: [
      { productId: "term-deposit", amount: 550 },
      { productId: "money-market", amount: 500 },
      { productId: "bond", amount: 300 },
      { productId: "gold", amount: 50 },
      { productId: "balanced-fund", amount: 150 }
    ]
  },
  {
    id: "balanced",
    label: "均衡示例",
    description: "把成长金分散到多类资产，观察不同资产一起变化。",
    allocations: [
      { productId: "term-deposit", amount: 300 },
      { productId: "money-market", amount: 300 },
      { productId: "bond", amount: 350 },
      { productId: "gold", amount: 200 },
      { productId: "balanced-fund", amount: 400 }
    ]
  },
  {
    id: "growth",
    label: "进取示例",
    description: "增加中高波动资产占比，用于学习波动和风险确认。",
    allocations: [
      { productId: "term-deposit", amount: 150 },
      { productId: "money-market", amount: 150 },
      { productId: "bond", amount: 250 },
      { productId: "gold", amount: 450 },
      { productId: "balanced-fund", amount: 550 }
    ]
  }
];

const demoDefaultSimulationAllocationAmounts: Array<Pick<SimulationAllocation, "productId" | "amount">> = [
  { productId: "term-deposit", amount: 250 },
  { productId: "money-market", amount: 300 },
  { productId: "bond", amount: 300 },
  { productId: "gold", amount: 150 },
  { productId: "balanced-fund", amount: 250 }
];

const riskScoreByLevel: Record<SimulationRiskLevel, number> = {
  low: 1,
  medium_low: 2,
  medium: 3,
  medium_high: 4
};

function getSimulationRiskLabel(score: number): string {
  if (score < 1.8) {
    return "低波动学习组合";
  }
  if (score < 2.6) {
    return "稳健均衡学习组合";
  }
  if (score < 3.2) {
    return "中等波动学习组合";
  }
  return "高波动学习组合";
}

export function createSimulationAllocationDraft(
  availableAmount: number,
  allocationAmounts: Array<Pick<SimulationAllocation, "productId" | "amount">> = demoDefaultSimulationAllocationAmounts
): SimulationAllocationDraft {
  const totalAllocatedAmount = allocationAmounts.reduce((total, allocation) => total + allocation.amount, 0);
  const allocations = allocationAmounts.map((allocation) => ({
    ...allocation,
    percent: totalAllocatedAmount > 0 ? Math.round((allocation.amount / totalAllocatedAmount) * 100) : 0
  }));
  const weightedRisk = allocations.reduce((total, allocation) => {
    const product = demoSimulationProducts.find((item) => item.id === allocation.productId);
    return total + (product ? riskScoreByLevel[product.riskLevel] * allocation.amount : 0);
  }, 0);
  const riskScore = totalAllocatedAmount > 0 ? Number((weightedRisk / totalAllocatedAmount).toFixed(2)) : 0;

  return {
    userId: demoMockSession.user.id,
    availableAmount,
    totalAllocatedAmount,
    unallocatedAmount: availableAmount - totalAllocatedAmount,
    riskScore,
    riskLabel: getSimulationRiskLabel(riskScore),
    riskDisclosure: demoTenant.disclosureCopy.simulationNotice,
    allocations,
    examples: demoSimulationAllocationExamples
  };
}

export function validateSimulationAllocations(
  availableAmount: number,
  allocationAmounts: Array<Pick<SimulationAllocation, "productId" | "amount">>
): string[] {
  const errors: string[] = [];
  const productIds = new Set(demoSimulationProducts.map((product) => product.id));
  const total = allocationAmounts.reduce((sum, allocation) => sum + allocation.amount, 0);

  for (const allocation of allocationAmounts) {
    if (!productIds.has(allocation.productId)) {
      errors.push(`Unknown simulation product: ${allocation.productId}`);
    }
    if (!Number.isFinite(allocation.amount) || allocation.amount < 0) {
      errors.push(`Invalid allocation amount for ${allocation.productId}`);
    }
  }

  if (total > availableAmount) {
    errors.push("Allocated amount cannot exceed available virtual growth balance.");
  }

  return errors;
}

export const demoSimulationAllocationDraft = createSimulationAllocationDraft(demoVirtualBalance.availableAmount);

const demoSimulationCycleChangeByProductId: Record<SimulationProduct["id"], number> = {
  "term-deposit": 0.18,
  "money-market": 0.12,
  bond: -0.35,
  gold: -1.75,
  "balanced-fund": 0.64
};

const demoSimulationCycleExplanationByProductId: Record<SimulationProduct["id"], string> = {
  "term-deposit": "模拟定存本期小幅变化，用来理解期限和固定收益的稳定性。",
  "money-market": "模拟货币基金本期变化较轻，重点观察流动性和低波动。",
  bond: "模拟债券本期受利率情景影响小幅下行，用来理解票息和价格波动。",
  gold: "模拟黄金本期波动更明显，这体现商品资产可能上涨也可能下跌。",
  "balanced-fund": "模拟平衡基金通过分散配置抵消部分波动，用来理解组合管理。"
};

export const demoSimulationReflectionQuestions: SimulationReflectionQuestion[] = [
  {
    id: "highest-volatility",
    prompt: "本期哪个模拟产品波动最明显？",
    helperText: "观察涨跌幅，而不是只看配置金额。"
  },
  {
    id: "allocation-lesson",
    prompt: "这次组合配置让你学到什么？",
    helperText: "可以写下分散配置、低波动资产或高波动资产带来的感受。"
  },
  {
    id: "reward-boundary",
    prompt: "真实奖励金为什么不能按模拟涨跌直接计算？",
    helperText: "请确认奖励来自银行活动规则，不来自模拟投资收益。"
  }
];

export const demoSimulationRiskConfirmationStatements = [
  "我知道这是模拟学习，不代表真实投资收益。",
  "我知道高波动产品可能上涨也可能下跌。",
  "我知道真实投资需要完成银行风险测评和产品适当性流程。"
];

export function createSimulationCycleRun(
  allocationDraft: SimulationAllocationDraft = demoSimulationAllocationDraft
): SimulationCycleRun {
  const productResults = allocationDraft.allocations
    .filter((allocation) => allocation.amount > 0)
    .map((allocation) => {
      const product = demoSimulationProducts.find((item) => item.id === allocation.productId);
      const simulatedChangePercent = demoSimulationCycleChangeByProductId[allocation.productId] ?? 0;
      const simulatedChangeAmount = Number(((allocation.amount * simulatedChangePercent) / 100).toFixed(2));
      const endingAmount = Number((allocation.amount + simulatedChangeAmount).toFixed(2));

      return {
        productId: allocation.productId,
        productName: product?.name ?? allocation.productId,
        riskLabel: product?.riskLabel ?? "未知风险",
        startingAmount: allocation.amount,
        simulatedChangeAmount,
        simulatedChangePercent,
        endingAmount,
        explanation:
          demoSimulationCycleExplanationByProductId[allocation.productId] ??
          "本期模拟变化仅用于解释资产波动，不代表真实表现。"
      };
    });
  const simulatedEndingVirtualAmount = Number(
    productResults.reduce((total, result) => total + result.endingAmount, 0).toFixed(2)
  );
  const simulatedChangeAmount = Number((simulatedEndingVirtualAmount - allocationDraft.totalAllocatedAmount).toFixed(2));
  const simulatedChangePercent =
    allocationDraft.totalAllocatedAmount > 0
      ? Number(((simulatedChangeAmount / allocationDraft.totalAllocatedAmount) * 100).toFixed(2))
      : 0;
  const hasHighVolatilityAllocation = allocationDraft.allocations.some((allocation) => {
    const product = demoSimulationProducts.find((item) => item.id === allocation.productId);
    return allocation.amount > 0 && product?.riskLevel === "medium_high";
  });

  return {
    id: "simulation-run-2026-08-w4",
    userId: allocationDraft.userId,
    cycleLabel: "2026 年 8 月第 4 周学习周期",
    startedAt: "2026-08-25T15:10:00+08:00",
    completedAt: "2026-08-25T15:11:00+08:00",
    startingVirtualAmount: allocationDraft.totalAllocatedAmount,
    simulatedEndingVirtualAmount,
    simulatedChangeAmount,
    simulatedChangePercent,
    rewardActivityAmount: allocationDraft.totalAllocatedAmount > 0 ? 1.8 : 0,
    rewardCalculationBasis: "活动奖励按完成学习周期、复盘问题和风险确认计算，不使用模拟涨跌作为奖励因子。",
    disclosure: "模拟涨跌只用于教育解释，不进入真实奖励计算。奖励金由银行活动预算提供，实际领取以活动规则和审核结果为准。",
    riskConfirmationRequired: hasHighVolatilityAllocation,
    riskConfirmationStatements: demoSimulationRiskConfirmationStatements,
    productResults,
    reflectionQuestions: demoSimulationReflectionQuestions
  };
}

export function validateSimulationReflection(
  run: SimulationCycleRun,
  submission: SimulationReflectionSubmission
): SimulationReflectionResult {
  const messages: string[] = [];
  const answeredQuestionIds = new Set(
    submission.answers.filter((answer) => answer.answer.trim().length > 0).map((answer) => answer.questionId)
  );

  for (const question of run.reflectionQuestions) {
    if (!answeredQuestionIds.has(question.id)) {
      messages.push(`Reflection answer is required: ${question.id}`);
    }
  }

  if (run.riskConfirmationRequired && !submission.riskConfirmationAccepted) {
    messages.push("Risk confirmation is required for high-volatility simulation products.");
  }

  return {
    runId: run.id,
    completed: messages.length === 0,
    learningCompletionCoefficient: messages.length === 0 ? 1 : 0,
    acceptedRiskConfirmation: submission.riskConfirmationAccepted,
    messages
  };
}

export const demoSimulationCycleRun = createSimulationCycleRun(demoSimulationAllocationDraft);

export const demoRewardLedger: RewardLedgerEntry[] = [
  {
    id: "rwd-001",
    userId: demoMockSession.user.id,
    status: "available",
    amount: 1.2,
    currency: "CNY",
    sourceType: "task",
    sourceId: "risk-lesson",
    programId: "demo-program-2026-08",
    budgetBatchId: "budget-2026-08-learning",
    activityRuleVersion: "reward-demo-v1",
    description: "完成风险分散小课获得活动奖励。",
    lockReason: null,
    availableAt: "2026-08-25T15:00:00+08:00",
    createdAt: "2026-08-25T15:00:00+08:00"
  },
  {
    id: "rwd-002",
    userId: demoMockSession.user.id,
    status: "available",
    amount: 2.5,
    currency: "CNY",
    sourceType: "task",
    sourceId: "auto-savings-mock",
    programId: "demo-program-2026-08",
    budgetBatchId: "budget-2026-08-banking",
    activityRuleVersion: "reward-demo-v1",
    description: "完成自动储蓄 mock 校验获得活动奖励。",
    lockReason: null,
    availableAt: "2026-08-25T15:05:00+08:00",
    createdAt: "2026-08-25T15:05:00+08:00"
  },
  {
    id: "rwd-006",
    userId: demoMockSession.user.id,
    status: "available",
    amount: 2,
    currency: "CNY",
    sourceType: "campaign_budget",
    sourceId: "september-growth-campaign",
    programId: "demo-program-2026-09",
    budgetBatchId: "budget-2026-09-campaign",
    activityRuleVersion: "reward-demo-v1",
    description: "9 月成长活动可领取奖励。",
    lockReason: null,
    availableAt: "2026-09-01T09:00:00+08:00",
    createdAt: "2026-09-01T09:00:00+08:00"
  },
  {
    id: "rwd-003",
    userId: demoMockSession.user.id,
    status: "pending",
    amount: demoSimulationCycleRun.rewardActivityAmount,
    currency: "CNY",
    sourceType: "learning_cycle",
    sourceId: demoSimulationCycleRun.id,
    programId: "demo-program-2026-08",
    budgetBatchId: "budget-2026-08-learning-cycle",
    activityRuleVersion: "reward-demo-v1",
    description: "完成学习周期和复盘后产生的待校验活动奖励。",
    lockReason: "等待活动预算与风控校验。",
    availableAt: null,
    createdAt: "2026-08-25T15:12:00+08:00"
  },
  {
    id: "rwd-004",
    userId: demoMockSession.user.id,
    status: "locked",
    amount: 6,
    currency: "CNY",
    sourceType: "campaign_budget",
    sourceId: "august-growth-campaign",
    programId: "demo-program-2026-08",
    budgetBatchId: "budget-2026-08-campaign",
    activityRuleVersion: "reward-demo-v1",
    description: "8 月成长活动奖励，需到提现窗口开放后领取。",
    lockReason: "本月提现窗口尚未开放。",
    availableAt: "2026-08-28T00:00:00+08:00",
    createdAt: "2026-08-25T16:00:00+08:00"
  },
  {
    id: "rwd-005",
    userId: demoMockSession.user.id,
    status: "paid",
    amount: 18.8,
    currency: "CNY",
    sourceType: "withdrawal",
    sourceId: "withdrawal-2026-07",
    programId: "demo-program-2026-07",
    budgetBatchId: "budget-2026-07-paid",
    activityRuleVersion: "reward-demo-v1",
    description: "7 月奖励已按活动规则发放到账。",
    lockReason: null,
    availableAt: "2026-07-30T10:00:00+08:00",
    createdAt: "2026-07-30T10:00:00+08:00"
  }
];

function createEmptyRewardStatusCounts(): Record<RewardStatus, number> {
  return {
    pending: 0,
    available: 0,
    locked: 0,
    withdrawal_pending: 0,
    paid: 0,
    failed: 0,
    reversed: 0
  };
}

export function createRewardJarSnapshot(ledger: RewardLedgerEntry[]): RewardJarSnapshot {
  const activeEntries = ledger.filter((entry) => !["paid", "failed", "reversed"].includes(entry.status));
  const statusCounts = ledger.reduce((counts, entry) => {
    counts[entry.status] += 1;
    return counts;
  }, createEmptyRewardStatusCounts());
  const withdrawalMonthPrefix = demoTodayWithdrawalWindow.opensAt.slice(0, 7);
  const thisMonthEntries = ledger.filter((entry) => entry.createdAt.startsWith(withdrawalMonthPrefix));

  return {
    userId: demoMockSession.user.id,
    currency: "CNY",
    totalBalanceAmount: Number(activeEntries.reduce((total, entry) => total + entry.amount, 0).toFixed(2)),
    availableAmount: Number(
      ledger.filter((entry) => entry.status === "available").reduce((total, entry) => total + entry.amount, 0).toFixed(2)
    ),
    lockedAmount: Number(
      ledger.filter((entry) => entry.status === "locked").reduce((total, entry) => total + entry.amount, 0).toFixed(2)
    ),
    pendingAmount: Number(
      ledger.filter((entry) => entry.status === "pending").reduce((total, entry) => total + entry.amount, 0).toFixed(2)
    ),
    thisMonthEstimatedAmount: Number(thisMonthEntries.reduce((total, entry) => total + entry.amount, 0).toFixed(2)),
    thisMonthEarnedAmount: Number(
      thisMonthEntries
        .filter((entry) => ["available", "locked", "pending"].includes(entry.status))
        .reduce((total, entry) => total + entry.amount, 0)
        .toFixed(2)
    ),
    minimumWithdrawalAmount: 5,
    withdrawalWindow: demoTodayWithdrawalWindow,
    disclosure: demoTenant.disclosureCopy.rewardNotice,
    rewardRuleSummary: "真实奖励只来自任务、学习动作、活动规则和银行预算；模拟投资涨跌不会进入奖励计算。",
    ledger,
    statusCounts
  };
}

const demoTodayWithdrawalWindow = {
  label: "本月提现窗口：9 月 1 日至 9 月 5 日",
  opensAt: "2026-09-01T00:00:00+08:00",
  closesAt: "2026-09-05T23:59:59+08:00",
  status: "open" as const
};

export const demoRewardJar = createRewardJarSnapshot(demoRewardLedger);

export const withdrawalDisclosure =
  "Demo MVP 不接真实打款；提现申请进入人工审核，到账以银行活动规则和审核结果为准。";

function toWithdrawalAccountSnapshot(account: LinkedBankAccount): WithdrawalAccountSnapshot {
  return {
    id: account.id,
    bankName: account.bankName,
    accountName: account.accountName,
    accountNumberMasked: account.accountNumberMasked,
    currency: account.currency,
    status: account.status
  };
}

function getAvailableRewardLedgerEntryIds(rewardJar: RewardJarSnapshot, amount: number): RewardLedgerEntry["id"][] {
  const ids: RewardLedgerEntry["id"][] = [];
  let remainingAmount = amount;

  for (const entry of rewardJar.ledger.filter((item) => item.status === "available")) {
    if (remainingAmount <= 0) {
      break;
    }

    ids.push(entry.id);
    remainingAmount = Number((remainingAmount - entry.amount).toFixed(2));
  }

  return ids;
}

export function validateWithdrawalRequest(
  rewardJar: RewardJarSnapshot,
  account: LinkedBankAccount,
  amount: number
): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push("Withdrawal amount must be greater than 0.");
  }

  if (amount > rewardJar.availableAmount) {
    errors.push("Withdrawal amount cannot exceed available reward balance.");
  }

  if (amount < rewardJar.minimumWithdrawalAmount) {
    errors.push("Withdrawal amount is below the minimum withdrawal amount.");
  }

  if (rewardJar.withdrawalWindow.status !== "open") {
    errors.push("Withdrawal window is not open.");
  }

  if (account.status !== "linked" || !account.isWithdrawalAccount) {
    errors.push("A linked withdrawal bank account is required.");
  }

  return errors;
}

export function createWithdrawalRequest(
  rewardJar: RewardJarSnapshot = demoRewardJar,
  account: LinkedBankAccount = demoLinkedBankAccount,
  amount: number = rewardJar.availableAmount
): WithdrawalSubmissionResult {
  const errors = validateWithdrawalRequest(rewardJar, account, amount);

  if (errors.length > 0) {
    return { request: null, errors };
  }

  const createdAt = "2026-09-01T10:00:00+08:00";

  return {
    request: {
      id: "withdrawal-2026-09-demo",
      userId: rewardJar.userId,
      amount: Number(amount.toFixed(2)),
      currency: rewardJar.currency,
      status: "submitted",
      rewardLedgerEntryIds: getAvailableRewardLedgerEntryIds(rewardJar, amount),
      withdrawalAccount: toWithdrawalAccountSnapshot(account),
      submittedAt: createdAt,
      reviewedAt: null,
      reviewerId: null,
      estimatedArrivalLabel: "审核通过后 T+1 入账",
      failureReason: null,
      rejectionReason: null,
      disclosure: withdrawalDisclosure,
      createdAt,
      updatedAt: createdAt
    },
    errors: []
  };
}

export const demoWithdrawalRequests: WithdrawalRequest[] = [
  {
    id: "withdrawal-2026-09-review",
    userId: demoMockSession.user.id,
    amount: 5,
    currency: "CNY",
    status: "under_review",
    rewardLedgerEntryIds: ["rwd-001", "rwd-002", "rwd-006"],
    withdrawalAccount: toWithdrawalAccountSnapshot(demoLinkedBankAccount),
    submittedAt: "2026-09-01T09:20:00+08:00",
    reviewedAt: null,
    reviewerId: null,
    estimatedArrivalLabel: "审核通过后 T+1 入账",
    failureReason: null,
    rejectionReason: null,
    disclosure: withdrawalDisclosure,
    createdAt: "2026-09-01T09:20:00+08:00",
    updatedAt: "2026-09-01T09:25:00+08:00"
  },
  {
    id: "withdrawal-2026-08-rejected",
    userId: demoMockSession.user.id,
    amount: 8,
    currency: "CNY",
    status: "rejected",
    rewardLedgerEntryIds: ["rwd-004"],
    withdrawalAccount: toWithdrawalAccountSnapshot(demoLinkedBankAccount),
    submittedAt: "2026-08-30T11:00:00+08:00",
    reviewedAt: "2026-08-30T15:30:00+08:00",
    reviewerId: "reviewer-demo-001",
    estimatedArrivalLabel: "审核通过后 T+1 入账",
    failureReason: null,
    rejectionReason: "账户状态需重新确认，请重新绑定提现账户后再申请。",
    disclosure: withdrawalDisclosure,
    createdAt: "2026-08-30T11:00:00+08:00",
    updatedAt: "2026-08-30T15:30:00+08:00"
  },
  {
    id: "withdrawal-2026-08-failed",
    userId: demoMockSession.user.id,
    amount: 5,
    currency: "CNY",
    status: "failed",
    rewardLedgerEntryIds: ["rwd-001", "rwd-002"],
    withdrawalAccount: toWithdrawalAccountSnapshot(demoLinkedBankAccount),
    submittedAt: "2026-08-29T10:10:00+08:00",
    reviewedAt: "2026-08-29T16:00:00+08:00",
    reviewerId: "reviewer-demo-001",
    estimatedArrivalLabel: "审核通过后 T+1 入账",
    failureReason: "银行通道暂时不可用，可重试或转人工处理。",
    rejectionReason: null,
    disclosure: withdrawalDisclosure,
    createdAt: "2026-08-29T10:10:00+08:00",
    updatedAt: "2026-08-29T16:00:00+08:00"
  }
];

export function findDemoWithdrawalRequest(withdrawalId: string): WithdrawalRequest | undefined {
  return demoWithdrawalRequests.find((request) => request.id === withdrawalId);
}

export function applyWithdrawalReviewAction(
  request: WithdrawalRequest,
  action: WithdrawalReviewAction,
  options?: { reason?: string; reviewerId?: string }
): WithdrawalReviewResult {
  const reviewedAt = "2026-09-01T11:00:00+08:00";
  const reviewerId = options?.reviewerId ?? "reviewer-demo-001";

  if (action === "approve" && ["submitted", "under_review"].includes(request.status)) {
    return {
      request: {
        ...request,
        status: "approved",
        reviewedAt,
        reviewerId,
        failureReason: null,
        rejectionReason: null,
        updatedAt: reviewedAt
      },
      error: null
    };
  }

  if (action === "reject" && ["submitted", "under_review"].includes(request.status)) {
    return {
      request: {
        ...request,
        status: "rejected",
        reviewedAt,
        reviewerId,
        failureReason: null,
        rejectionReason: options?.reason ?? "提现申请未通过人工审核，请检查账户与活动资格后重试。",
        updatedAt: reviewedAt
      },
      error: null
    };
  }

  if (action === "retry" && request.status === "failed") {
    return {
      request: {
        ...request,
        status: "under_review",
        reviewedAt: null,
        reviewerId,
        failureReason: null,
        rejectionReason: null,
        updatedAt: reviewedAt
      },
      error: null
    };
  }

  return {
    request: null,
    error: `Invalid withdrawal transition: ${request.status} -> ${action}`
  };
}

export const demoDisclosureVersions: DisclosureVersion[] = [
  {
    id: "disclosure-virtual-balance-v1",
    type: "virtual_balance",
    version: "virtual-balance-2026-09-v1",
    title: "虚拟成长金不是现金",
    body: "虚拟成长金只用于投资学习和模拟配置，不是存款、现金或真实可提现资产。",
    requiredFor: ["onboarding", "task", "simulation"],
    status: "active",
    effectiveAt: "2026-09-01T00:00:00+08:00"
  },
  {
    id: "disclosure-simulation-v1",
    type: "simulation",
    version: "simulation-2026-09-v1",
    title: "模拟变化不代表真实收益",
    body: "模拟组合涨跌只用于教育解释，不构成投资建议，也不会直接决定真实奖励金额。",
    requiredFor: ["simulation"],
    status: "active",
    effectiveAt: "2026-09-01T00:00:00+08:00"
  },
  {
    id: "disclosure-reward-rule-v1",
    type: "reward_rule",
    version: "reward-rule-2026-09-v1",
    title: "真实奖励来自银行活动预算",
    body: "奖励罐金额来自银行活动预算、任务完成和活动资格，不是模拟投资收益或理财分红。",
    requiredFor: ["reward", "withdrawal"],
    status: "active",
    effectiveAt: "2026-09-01T00:00:00+08:00"
  },
  {
    id: "disclosure-withdrawal-v1",
    type: "withdrawal",
    version: "withdrawal-2026-09-v1",
    title: "提现需审核且 Demo 不真实打款",
    body: "提现申请会进入人工审核；Demo MVP 不接真实 KYC、真实银行账户查询或真实打款。",
    requiredFor: ["withdrawal"],
    status: "active",
    effectiveAt: "2026-09-01T00:00:00+08:00"
  },
  {
    id: "disclosure-real-product-v1",
    type: "real_product_redirect",
    version: "real-product-2026-09-v1",
    title: "真实产品需进入银行合规流程",
    body: "如果跳转真实基金、理财、黄金、证券或保险产品，必须完成银行风险测评、适当性和销售披露。",
    requiredFor: ["real_product"],
    status: "active",
    effectiveAt: "2026-09-01T00:00:00+08:00"
  }
];

export const demoDisclosureAcceptances: DisclosureAcceptance[] = [
  {
    id: "acceptance-virtual-balance-001",
    userId: demoMockSession.user.id,
    disclosureId: "disclosure-virtual-balance-v1",
    disclosureType: "virtual_balance",
    version: "virtual-balance-2026-09-v1",
    acceptedAt: "2026-09-01T08:10:00+08:00",
    channel: "mobile",
    ipAddressMasked: "192.0.2.*",
    userAgent: "GrowthmoreMobile/0.1 demo"
  },
  {
    id: "acceptance-simulation-001",
    userId: demoMockSession.user.id,
    disclosureId: "disclosure-simulation-v1",
    disclosureType: "simulation",
    version: "simulation-2026-09-v1",
    acceptedAt: "2026-09-01T08:12:00+08:00",
    channel: "mobile",
    ipAddressMasked: "192.0.2.*",
    userAgent: "GrowthmoreMobile/0.1 demo"
  },
  {
    id: "acceptance-reward-rule-001",
    userId: demoMockSession.user.id,
    disclosureId: "disclosure-reward-rule-v1",
    disclosureType: "reward_rule",
    version: "reward-rule-2026-09-v1",
    acceptedAt: "2026-09-01T08:20:00+08:00",
    channel: "mobile",
    ipAddressMasked: "192.0.2.*",
    userAgent: "GrowthmoreMobile/0.1 demo"
  }
];

export const demoAuditLogs: AuditLogEntry[] = [
  {
    id: "audit-001",
    actorType: "user",
    actorId: demoMockSession.user.id,
    action: "disclosure.accepted",
    entityType: "disclosure",
    entityId: "disclosure-virtual-balance-v1",
    occurredAt: "2026-09-01T08:10:00+08:00",
    ipAddressMasked: "192.0.2.*",
    userAgent: "GrowthmoreMobile/0.1 demo",
    summary: "用户确认虚拟成长金不是现金。",
    metadata: { disclosureVersion: "virtual-balance-2026-09-v1" }
  },
  {
    id: "audit-002",
    actorType: "user",
    actorId: demoMockSession.user.id,
    action: "disclosure.accepted",
    entityType: "disclosure",
    entityId: "disclosure-simulation-v1",
    occurredAt: "2026-09-01T08:12:00+08:00",
    ipAddressMasked: "192.0.2.*",
    userAgent: "GrowthmoreMobile/0.1 demo",
    summary: "用户确认模拟变化不代表真实收益。",
    metadata: { disclosureVersion: "simulation-2026-09-v1" }
  },
  {
    id: "audit-003",
    actorType: "user",
    actorId: demoMockSession.user.id,
    action: "withdrawal.submitted",
    entityType: "withdrawal_request",
    entityId: "withdrawal-2026-09-review",
    occurredAt: "2026-09-01T09:20:00+08:00",
    ipAddressMasked: "192.0.2.*",
    userAgent: "GrowthmoreMobile/0.1 demo",
    summary: "用户提交提现申请，进入人工审核。",
    metadata: { amount: 5, currency: "CNY", realPayout: false }
  },
  {
    id: "audit-004",
    actorType: "admin",
    actorId: "reviewer-demo-001",
    action: "withdrawal.reviewed",
    entityType: "withdrawal_request",
    entityId: "withdrawal-2026-08-rejected",
    occurredAt: "2026-08-30T15:30:00+08:00",
    ipAddressMasked: "198.51.100.*",
    userAgent: "GrowthmoreAdmin/0.1 demo",
    summary: "后台拒绝提现申请并记录账户状态原因。",
    metadata: { status: "rejected", reason: "账户状态需重新确认" }
  },
  {
    id: "audit-005",
    actorType: "system",
    actorId: "reward-engine-demo",
    action: "reward.ledger_created",
    entityType: "reward_ledger",
    entityId: "rwd-006",
    occurredAt: "2026-09-01T09:00:00+08:00",
    ipAddressMasked: "system",
    userAgent: "GrowthmoreRewardEngine/0.1 demo",
    summary: "系统创建 9 月活动奖励流水。",
    metadata: { programId: "demo-program-2026-09", budgetBatchId: "budget-2026-09-campaign" }
  }
];

export function getRequiredDisclosureVersions(requiredFor: DisclosureRequiredFor): DisclosureVersion[] {
  return demoDisclosureVersions.filter(
    (disclosure) => disclosure.status === "active" && disclosure.requiredFor.includes(requiredFor)
  );
}

export function getPendingDisclosureVersions(
  requiredFor: DisclosureRequiredFor,
  acceptances: DisclosureAcceptance[] = demoDisclosureAcceptances
): DisclosureVersion[] {
  const acceptedVersions = new Set(acceptances.map((acceptance) => `${acceptance.disclosureId}:${acceptance.version}`));

  return getRequiredDisclosureVersions(requiredFor).filter(
    (disclosure) => !acceptedVersions.has(`${disclosure.id}:${disclosure.version}`)
  );
}

export function findDisclosureVersion(disclosureId: string): DisclosureVersion | undefined {
  return demoDisclosureVersions.find((disclosure) => disclosure.id === disclosureId);
}

export function createDisclosureAcceptance(
  disclosureId: string,
  options?: { channel?: DisclosureAcceptanceChannel; userAgent?: string; ipAddressMasked?: string }
): DisclosureAcceptanceResult {
  const disclosure = findDisclosureVersion(disclosureId);

  if (!disclosure || disclosure.status !== "active") {
    return {
      acceptance: null,
      auditLog: null,
      error: "Disclosure version is not active or does not exist."
    };
  }

  const acceptedAt = "2026-09-02T09:00:00+08:00";
  const acceptance: DisclosureAcceptance = {
    id: `acceptance-${disclosure.type}-demo`,
    userId: demoMockSession.user.id,
    disclosureId: disclosure.id,
    disclosureType: disclosure.type,
    version: disclosure.version,
    acceptedAt,
    channel: options?.channel ?? "api",
    ipAddressMasked: options?.ipAddressMasked ?? "192.0.2.*",
    userAgent: options?.userAgent ?? "GrowthmoreAPI/0.1 demo"
  };

  return {
    acceptance,
    auditLog: {
      id: `audit-${acceptance.id}`,
      actorType: "user",
      actorId: acceptance.userId,
      action: "disclosure.accepted",
      entityType: "disclosure",
      entityId: disclosure.id,
      occurredAt: acceptedAt,
      ipAddressMasked: acceptance.ipAddressMasked,
      userAgent: acceptance.userAgent,
      summary: `用户确认披露版本：${disclosure.title}`,
      metadata: {
        disclosureType: disclosure.type,
        disclosureVersion: disclosure.version,
        channel: acceptance.channel
      }
    },
    error: null
  };
}

export function createComplianceSummary(requiredFor: DisclosureRequiredFor = "withdrawal"): ComplianceSummary {
  const requiredDisclosures = getRequiredDisclosureVersions(requiredFor);
  const pendingDisclosures = getPendingDisclosureVersions(requiredFor);
  const acceptedIds = new Set(requiredDisclosures.map((disclosure) => disclosure.id));
  const acceptedDisclosures = demoDisclosureAcceptances.filter((acceptance) => acceptedIds.has(acceptance.disclosureId));

  return {
    requiredDisclosureCount: requiredDisclosures.length,
    acceptedDisclosureCount: acceptedDisclosures.length,
    pendingDisclosureCount: pendingDisclosures.length,
    requiredDisclosures,
    acceptedDisclosures,
    pendingDisclosures,
    latestAuditLogs: [...demoAuditLogs].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt)).slice(0, 5)
  };
}

export const demoComplianceSummary = createComplianceSummary("withdrawal");
export const demoTodayHomeSummary: TodayHomeSummary = {
  userId: demoMockSession.user.id,
  tenantSlug: demoTenant.slug,
  level: {
    label: "Level 2",
    planName: "稳健成长计划",
    progressPercent: 0.42,
    remainingTaskCount: 2
  },
  balances: {
    virtualGrowthAmount: demoVirtualBalance.availableAmount,
    rewardJarAmount: demoRewardJar.totalBalanceAmount,
    currency: "CNY"
  },
  recommendedTask: {
    id: "risk-lesson",
    type: "learning",
    title: "完成 5 分钟风险分散小课",
    description: "学习为什么模拟组合不该只押注一个行业，然后获得今日成长金。",
    rewardLabel: "+300 成长金，+¥1.20 奖励罐",
    estimatedMinutes: 5,
    ctaLabel: "开始今日任务"
  },
  withdrawalWindow: demoTodayWithdrawalWindow,
  nextActions: [
    { id: "portfolio", label: "查看模拟组合" },
    { id: "reward", label: "领取奖励" },
    { id: "learning", label: "继续学习" }
  ]
};
