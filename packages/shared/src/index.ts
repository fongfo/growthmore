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
    rewardJarAmount: 28.5,
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
  withdrawalWindow: {
    label: "本月提现窗口：8 月 28 日至 8 月 31 日",
    opensAt: "2026-08-28T00:00:00+08:00",
    closesAt: "2026-08-31T23:59:59+08:00",
    status: "upcoming"
  },
  nextActions: [
    { id: "portfolio", label: "查看模拟组合" },
    { id: "reward", label: "领取奖励" },
    { id: "learning", label: "继续学习" }
  ]
};
