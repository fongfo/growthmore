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

