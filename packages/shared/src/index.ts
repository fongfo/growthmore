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
    virtualGrowthAmount: 12800,
    rewardJarAmount: 28.5,
    currency: "CNY"
  },
  recommendedTask: {
    id: "today-task-001",
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
