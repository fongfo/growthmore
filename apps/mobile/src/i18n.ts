import {
  type DisclosureType,
  type RewardStatus,
  type SimulationAllocationExample,
  type SimulationCycleRun,
  type SimulationProduct,
  type TaskBoardSummary,
  type TaskStatus,
  type UserTask,
  type WithdrawalStatus
} from "@growthmore/shared";

export type Locale = "zh-CN" | "en-US";

type Messages = Record<string, string>;

export const localeOptions: Array<{ label: string; value: Locale }> = [
  { label: "中文", value: "zh-CN" },
  { label: "EN", value: "en-US" }
];

const messages: Record<Locale, Messages> = {
  "zh-CN": {
    "a11y.planProgress": "当前计划进度 {percent}%",
    "a11y.tabPage": "{label}页面",
    "action.completeReflection": "完成复盘与风险确认",
    "action.confirmDisclosures": "确认必要披露",
    "action.disclosuresConfirmed": "必要披露已确认",
    "action.reflectionComplete": "复盘已完成",
    "action.resetAllocation": "重置配置",
    "action.retryConnection": "重试连接",
    "action.runCycle": "运行周期",
    "action.startTodayTask": "开始今日任务",
    "action.submitWithdrawal": "提交申请",
    "api.error.body": "API 暂时不可用，页面已自动回退到内置 Demo 数据。{error}",
    "api.error.title": "当前使用演示数据",
    "api.loading.body": "移动端会优先读取 Growthmore API。",
    "api.loading.title": "正在连接 API 数据",
    "api.status.connected": "API 已连接",
    "api.status.demo": "演示数据",
    "api.status.loading": "连接中",
    "badge.allocationLedger": "流水推导",
    "badge.canSubmit": "可提交",
    "badge.disclosuresMet": "已满足",
    "badge.disclosuresPending": "待确认",
    "badge.notConfirmed": "未确认",
    "badge.confirmed": "已确认",
    "badge.reflectionDone": "已复盘",
    "badge.reflectionPending": "待复盘",
    "badge.ruleRequired": "需满足规则",
    "badge.withdrawalClosed": "窗口未开放",
    "badge.withdrawalOpen": "窗口开放",
    "compliance.count": "已确认 {accepted} / {required} 个提现前必要披露",
    "compliance.heading": "必要披露与确认",
    "disclosure.funds.title": "资金性质提醒",
    "disclosure.reward.title": "奖励来源提醒",
    "disclosure.run.title": "学习周期提醒",
    "earn.heading": "赚成长金",
    "earn.summary": "连续完成 {days} 天，今日可赚 {growth} 成长金和 {reward}",
    "label.available": "可用",
    "label.availableReward": "可领取 {amount}，最低领取 {minimum}",
    "label.availableWithdrawal": "可提现金额",
    "label.allocated": "已配置",
    "label.currentCycle": "当前学习周期",
    "label.estimatedMinutes": "{minutes} 分钟",
    "label.frozen": "冻结",
    "label.pendingValidation": "待校验",
    "label.rewardJarBalance": "奖励罐余额",
    "label.rewardTaskCount": "{count} 个任务",
    "label.thisMonthEstimate": "本月预计",
    "label.withdrawalRequest": "提现申请",
    "metric.reward.helper": "满足活动规则后可申请领取",
    "metric.reward.label": "奖励罐",
    "metric.virtual.badge": "可用",
    "metric.virtual.helper": "不可直接提现",
    "metric.virtual.label": "虚拟成长金",
    "nav.allocate": "配置",
    "nav.earn": "任务",
    "nav.grow": "成长",
    "nav.rewards": "奖励",
    "nav.today": "今日",
    "portfolio.allocationAmount": "配置 {amount} 成长金",
    "portfolio.heading": "模拟配置",
    "portfolio.riskA11y": "组合风险分 {score}",
    "portfolio.riskConfirm": "我知道这是模拟学习；高波动产品可能上涨也可能下跌；真实投资需要完成银行风险测评。",
    "portfolio.unallocated": "未配置 {amount} 成长金，只用于投资学习",
    "rewards.heading": "奖励罐",
    "rewards.intro": "真实奖励来自银行活动预算，按规则进入 reward_ledger",
    "rewards.reviewedArrival": "审核通过后 T+1 入账；Demo MVP 不接真实打款。",
    "rewards.withdrawalTitle": "{amount} 提现申请",
    "run.changeSummary": "模拟变化 {percent}，活动奖励 {reward}",
    "run.heading": "投资学习",
    "run.prompt": "运行一个学习周期，查看模拟变化并完成复盘确认",
    "run.virtualChange": "{amount} 成长金",
    "run.waiting": "等待运行",
    "tabs.language": "语言",
    "today.balanceHeading": "成长金余额",
    "today.earned": "今日已赚 {earned} / {limit}",
    "today.progress": "计划进度 {percent}%，今天还剩 {count} 个任务。",
    "unit.virtualGrowth": "成长金"
  },
  "en-US": {
    "a11y.planProgress": "Current plan progress {percent}%",
    "a11y.tabPage": "{label} tab",
    "action.completeReflection": "Complete Review and Risk Check",
    "action.confirmDisclosures": "Confirm Required Disclosures",
    "action.disclosuresConfirmed": "Required Disclosures Confirmed",
    "action.reflectionComplete": "Review Complete",
    "action.resetAllocation": "Reset Allocation",
    "action.retryConnection": "Retry Connection",
    "action.runCycle": "Run Cycle",
    "action.startTodayTask": "Start Today's Task",
    "action.submitWithdrawal": "Submit Request",
    "api.error.body": "The API is temporarily unavailable, so the app is using built-in demo data. {error}",
    "api.error.title": "Using Demo Data",
    "api.loading.body": "The mobile app is connecting to the Growthmore API.",
    "api.loading.title": "Connecting to API Data",
    "api.status.connected": "API Connected",
    "api.status.demo": "Demo Data",
    "api.status.loading": "Connecting",
    "badge.allocationLedger": "Ledger-Based",
    "badge.canSubmit": "Ready",
    "badge.disclosuresMet": "Met",
    "badge.disclosuresPending": "Pending",
    "badge.notConfirmed": "Not Confirmed",
    "badge.confirmed": "Confirmed",
    "badge.reflectionDone": "Reviewed",
    "badge.reflectionPending": "Review Due",
    "badge.ruleRequired": "Rules Required",
    "badge.withdrawalClosed": "Window Closed",
    "badge.withdrawalOpen": "Window Open",
    "compliance.count": "{accepted} of {required} withdrawal disclosures confirmed",
    "compliance.heading": "Required Disclosures",
    "disclosure.funds.title": "Funds Notice",
    "disclosure.reward.title": "Reward Source Notice",
    "disclosure.run.title": "Learning Cycle Notice",
    "earn.heading": "Earn Growth Credits",
    "earn.summary": "{days}-day streak. Earn up to {growth} growth credits and {reward} today.",
    "label.available": "Available",
    "label.availableReward": "{amount} available, {minimum} minimum",
    "label.availableWithdrawal": "Available to Withdraw",
    "label.allocated": "Allocated",
    "label.currentCycle": "Current Learning Cycle",
    "label.estimatedMinutes": "{minutes} min",
    "label.frozen": "Frozen",
    "label.pendingValidation": "Pending",
    "label.rewardJarBalance": "Reward Jar Balance",
    "label.rewardTaskCount": "{count} tasks",
    "label.thisMonthEstimate": "This Month",
    "label.withdrawalRequest": "Withdrawal Request",
    "metric.reward.helper": "Can be claimed after campaign rules are met",
    "metric.reward.label": "Reward Jar",
    "metric.virtual.badge": "Available",
    "metric.virtual.helper": "Not directly withdrawable",
    "metric.virtual.label": "Growth Credits",
    "nav.allocate": "Allocate",
    "nav.earn": "Earn",
    "nav.grow": "Grow",
    "nav.rewards": "Rewards",
    "nav.today": "Today",
    "portfolio.allocationAmount": "Allocated {amount} credits",
    "portfolio.heading": "Simulation Allocation",
    "portfolio.riskA11y": "Portfolio risk score {score}",
    "portfolio.riskConfirm": "I understand this is simulated learning; higher-volatility products can rise or fall; real investing requires a bank risk assessment.",
    "portfolio.unallocated": "{amount} credits unallocated, for investment learning only",
    "rewards.heading": "Reward Jar",
    "rewards.intro": "Real rewards come from the bank campaign budget and are recorded in reward_ledger.",
    "rewards.reviewedArrival": "Arrives T+1 after approval. Demo MVP does not make real payouts.",
    "rewards.withdrawalTitle": "{amount} withdrawal request",
    "run.changeSummary": "Simulated change {percent}, campaign reward {reward}",
    "run.heading": "Investment Learning",
    "run.prompt": "Run a learning cycle, review simulated changes, and complete the reflection.",
    "run.virtualChange": "{amount} credits",
    "run.waiting": "Waiting to Run",
    "tabs.language": "Language",
    "today.balanceHeading": "Growth Credit Balance",
    "today.earned": "Earned today {earned} / {limit}",
    "today.progress": "{percent}% plan progress with {count} tasks left today.",
    "unit.virtualGrowth": "growth credits"
  }
};

const taskCopy: Record<string, Partial<Record<Locale, Pick<UserTask, "title" | "description"> & { rejectionReason?: string }>>> = {
  "auto-savings-mock": {
    "en-US": {
      title: "Turn on auto-savings mock",
      description: "Simulate a monthly savings plan to validate the bank task flow."
    }
  },
  "bank-account-linked": {
    "en-US": {
      title: "Link withdrawal account mock",
      description: "Confirm the linked mock bank account for future reward withdrawals."
    }
  },
  "daily-check-in": {
    "en-US": {
      title: "Complete today's check-in",
      description: "Open the app and confirm today's financial health reminder to build a learning habit."
    }
  },
  "profile-kyc-mock": {
    "en-US": {
      title: "Complete profile mock",
      description: "Use the mock KYC status to complete your profile and unlock later bank tasks."
    }
  },
  "risk-lesson": {
    "en-US": {
      title: "Complete a 5-minute diversification lesson",
      description: "Learn why a simulated portfolio should not bet on one sector, then earn today's credits."
    }
  },
  "savings-goal": {
    "en-US": {
      title: "Set a savings goal",
      description: "Add this month's savings goal so your simulation has a clear learning target.",
      rejectionReason: "Target amount is missing. Add an amount and try again."
    }
  }
};

const productCopy: Record<string, Partial<Record<Locale, Pick<SimulationProduct, "name" | "userLabel" | "riskLabel" | "volatilityLabel" | "learningGoal" | "simulationLogic">>>> = {
  balanced_fund: {
    "en-US": {
      name: "Simulated Balanced Fund",
      userLabel: "Growth Mix",
      riskLabel: "Medium Risk",
      volatilityLabel: "Medium volatility",
      learningGoal: "Understand diversification",
      simulationLogic: "A balanced mix demonstrates how diversification can smooth, but not remove, volatility."
    }
  },
  bond: {
    "en-US": {
      name: "Simulated Bond",
      userLabel: "Coupon",
      riskLabel: "Medium-Low Risk",
      volatilityLabel: "Low to medium volatility",
      learningGoal: "Understand rates and coupons",
      simulationLogic: "Bond values can move when interest-rate assumptions change."
    }
  },
  deposit: {
    "en-US": {
      name: "Simulated Time Deposit",
      userLabel: "Stable",
      riskLabel: "Low Risk",
      volatilityLabel: "Very low volatility",
      learningGoal: "Understand fixed income and terms",
      simulationLogic: "This mock deposit changes slowly to show term-based, stable learning outcomes."
    }
  },
  gold: {
    "en-US": {
      name: "Simulated Gold",
      userLabel: "Hedge Asset",
      riskLabel: "Medium Risk",
      volatilityLabel: "Medium-high volatility",
      learningGoal: "Understand commodity volatility",
      simulationLogic: "Gold can rise or fall more sharply, showing commodity price swings."
    }
  },
  money_market: {
    "en-US": {
      name: "Simulated Money Market Fund",
      userLabel: "Flexible",
      riskLabel: "Low Risk",
      volatilityLabel: "Low volatility",
      learningGoal: "Understand liquidity",
      simulationLogic: "Money market simulations focus on liquidity and modest changes."
    }
  }
};

const exactEnglishCopy: Record<string, string> = {
  "API 数据加载失败": "API data load failed.",
  "本月提现窗口：9 月 1 日至 9 月 5 日": "This month's withdrawal window: September 1 to September 5",
  "7 月奖励已按活动规则发放到账。": "July reward was paid according to campaign rules.",
  "8 月成长活动奖励，需到提现窗口开放后领取。": "August growth campaign reward, claimable when the withdrawal window opens.",
  "9 月成长活动奖励，已进入奖励罐。": "September growth campaign reward has entered the reward jar.",
  "Demo MVP 不接真实打款；提现申请进入人工审核，到账以银行活动规则和审核结果为准。": "Demo MVP does not make real payouts. Withdrawal requests enter manual review, and arrival depends on bank campaign rules and review results.",
  "今日签到成长金入账。": "Today's check-in growth credits posted.",
  "后台拒绝提现申请并记录账户状态原因。": "Admin rejected the withdrawal request and recorded the account-status reason.",
  "奖励罐中的金额由银行活动预算提供，可按活动规则申请领取。": "Reward jar amounts are funded by the bank campaign budget and can be claimed under campaign rules.",
  "学习周期完成后，按活动规则进入奖励罐。": "After the learning cycle, the campaign reward enters the reward jar under campaign rules.",
  "客户完成风险分散学习任务后获得活动奖励。": "Campaign reward earned after completing the diversification lesson.",
  "审核通过后 T+1 入账": "Arrives T+1 after approval",
  "提现申请会进入人工审核；Demo MVP 不接真实 KYC、真实银行账户查询或真实打款。": "Withdrawal requests enter manual review. Demo MVP does not connect real KYC, real bank-account lookup, or real payouts.",
  "提交记录与任务条件不匹配，请检查后重试。": "Submitted records do not match the task requirements. Check and try again.",
  "模拟投资结果仅用于金融知识学习，不代表真实投资收益。": "Simulation results are for financial education only and do not represent real investment returns.",
  "模拟变化不代表真实收益": "Simulated changes are not real returns",
  "模拟组合涨跌只用于教育解释，不构成投资建议，也不会直接决定真实奖励金额。": "Simulated portfolio changes are educational, are not investment advice, and do not directly determine real reward amounts.",
  "模拟黄金本期波动较大，说明商品资产可能上涨也可能下跌。": "Simulated gold moved more this cycle, showing commodity assets can rise or fall.",
  "模拟配置扣减可用成长金。": "Simulation allocation reduced available growth credits.",
  "用户提交提现申请，进入人工审核。": "User submitted a withdrawal request for manual review.",
  "用户确认披露版本：虚拟成长金不是现金": "User confirmed disclosure version: growth credits are not cash.",
  "用户确认模拟变化不代表真实收益。": "User confirmed simulated changes are not real returns.",
  "用户确认虚拟成长金不是现金。": "User confirmed growth credits are not cash.",
  "真实产品需进入银行合规流程": "Real products require the bank's compliant process",
  "真实奖励只来自任务、学习动作、活动规则和银行预算；模拟投资涨跌不会进入奖励计算。": "Real rewards come only from tasks, learning actions, campaign rules, and the bank budget. Simulated investment changes are not used in reward calculation.",
  "真实奖励来自银行活动预算": "Real rewards come from the bank campaign budget",
  "系统创建 9 月活动奖励流水。": "System created the September campaign reward ledger entry.",
  "账户状态需重新确认，请重新绑定提现账户后再申请。": "Account status must be reconfirmed. Relink the withdrawal account before applying again.",
  "这笔奖励暂不可领取，等待预算复核。": "This reward is temporarily unavailable pending budget review.",
  "金额不够最低领取门槛。": "Amount is below the minimum claim threshold.",
  "银行通道暂时不可用，可重试或转人工处理。": "The bank channel is temporarily unavailable. Retry or route to manual handling.",
  "风险分散任务活动奖励，已通过预算校验。": "Diversification task campaign reward passed budget validation.",
  "高波动资产在模拟中波动更明显，配置前需确认理解风险。": "Higher-volatility assets move more in simulation. Confirm your risk understanding before allocating."
};

const runCopy = {
  cycleLabel: {
    "2026 年 8 月第 4 周学习周期": "Learning Cycle: Week 4, August 2026"
  },
  explanations: {
    balanced_fund: "The balanced fund shows how a mixed allocation can smooth part of the portfolio movement.",
    bond: "The bond simulation shows how rate assumptions and coupon learning affect a stable asset.",
    deposit: "The time-deposit simulation changes slowly, highlighting term-based stability.",
    gold: "Gold moved more this cycle, showing that commodity assets can rise or fall.",
    money_market: "The money-market simulation stayed steady, highlighting liquidity and modest movement."
  },
  questions: {
    "highest-volatility": {
      prompt: "Which asset showed the highest volatility this cycle?",
      helperText: "Volatility is normal in simulation. The goal is to understand the risk source."
    },
    "reward-source": {
      prompt: "Why is the campaign reward separate from simulated performance?",
      helperText: "Real rewards come from campaign rules and budget checks, not investment returns."
    }
  },
  riskStatements: {
    "我知道这是模拟学习，不是投资建议。": "I understand this is simulated learning, not investment advice.",
    "我知道高波动产品可能上涨也可能下跌。": "I understand higher-volatility products can rise or fall.",
    "我知道真实投资需要完成银行风险测评和销售披露。": "I understand real investing requires the bank's risk assessment and sales disclosures."
  }
};

export function t(locale: Locale, key: string, values: Record<string, string | number> = {}): string {
  const template = messages[locale][key] ?? messages["en-US"][key] ?? key;

  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

export function formatInteger(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCurrency(locale: Locale, amount: number): string {
  return new Intl.NumberFormat(locale, {
    currency: "CNY",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  }).format(amount);
}

export function formatSignedPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatSignedAmount(locale: Locale, amount: number): string {
  return `${amount >= 0 ? "+" : ""}${formatInteger(locale, Number(amount.toFixed(0)))}`;
}

export function translateText(locale: Locale, text: string | null | undefined): string | null {
  if (!text) {
    return text ?? null;
  }

  return locale === "en-US" ? exactEnglishCopy[text] ?? text : text;
}

export function getDisclosureTypeLabel(locale: Locale, type: DisclosureType): string {
  const labels: Record<Locale, Record<DisclosureType, string>> = {
    "zh-CN": {
      real_product_redirect: "真实产品",
      reward_rule: "奖励规则",
      simulation: "模拟学习",
      virtual_balance: "虚拟成长金",
      withdrawal: "提现规则"
    },
    "en-US": {
      real_product_redirect: "Real Products",
      reward_rule: "Reward Rules",
      simulation: "Simulation Learning",
      virtual_balance: "Growth Credits",
      withdrawal: "Withdrawal Rules"
    }
  };

  return labels[locale][type];
}

export function getRewardStatusLabel(locale: Locale, status: RewardStatus): string {
  const labels: Record<Locale, Record<RewardStatus, string>> = {
    "zh-CN": {
      available: "可领取",
      failed: "发放失败",
      locked: "暂锁定",
      paid: "已到账",
      pending: "待校验",
      reversed: "已撤销",
      withdrawal_pending: "提现中"
    },
    "en-US": {
      available: "Available",
      failed: "Failed",
      locked: "Locked",
      paid: "Paid",
      pending: "Pending",
      reversed: "Reversed",
      withdrawal_pending: "Withdrawing"
    }
  };

  return labels[locale][status];
}

export function getWithdrawalStatusLabel(locale: Locale, status: WithdrawalStatus): string {
  const labels: Record<Locale, Record<WithdrawalStatus, string>> = {
    "zh-CN": {
      approved: "已通过",
      cancelled: "已取消",
      draft: "草稿",
      failed: "处理失败",
      paid: "已到账",
      rejected: "未通过",
      submitted: "已提交",
      under_review: "审核中"
    },
    "en-US": {
      approved: "Approved",
      cancelled: "Cancelled",
      draft: "Draft",
      failed: "Failed",
      paid: "Paid",
      rejected: "Rejected",
      submitted: "Submitted",
      under_review: "In Review"
    }
  };

  return labels[locale][status];
}

export function getTaskStatusCopy(locale: Locale, status: TaskStatus): { label: string; ctaLabel: string } {
  const labels: Record<Locale, Record<TaskStatus, { label: string; ctaLabel: string }>> = {
    "zh-CN": {
      available: { ctaLabel: "去完成", label: "可完成" },
      claimed: { ctaLabel: "查看奖励", label: "已领取" },
      completed: { ctaLabel: "领取奖励", label: "已完成" },
      in_progress: { ctaLabel: "提交验证", label: "进行中" },
      pending_verification: { ctaLabel: "等待校验", label: "验证中" },
      rejected: { ctaLabel: "查看原因", label: "未通过" },
      reversed: { ctaLabel: "查看记录", label: "已撤销" }
    },
    "en-US": {
      available: { ctaLabel: "Start", label: "Available" },
      claimed: { ctaLabel: "View Reward", label: "Claimed" },
      completed: { ctaLabel: "Claim Reward", label: "Complete" },
      in_progress: { ctaLabel: "Submit", label: "In Progress" },
      pending_verification: { ctaLabel: "Waiting", label: "Verifying" },
      rejected: { ctaLabel: "View Reason", label: "Rejected" },
      reversed: { ctaLabel: "View Record", label: "Reversed" }
    }
  };

  return labels[locale][status];
}

export function translateTask(locale: Locale, task: UserTask): UserTask {
  const localized = taskCopy[task.id]?.[locale];

  return {
    ...task,
    description: localized?.description ?? task.description,
    rejectionReason: localized?.rejectionReason ?? translateText(locale, task.rejectionReason),
    title: localized?.title ?? task.title
  };
}

export function translateTaskFilter(locale: Locale, filter: TaskBoardSummary["categoryFilters"][number]): string {
  if (locale === "zh-CN") {
    return filter.label;
  }

  const labels: Record<string, string> = {
    all: "All",
    banking: "Bank Tasks",
    campaign: "Campaigns",
    completed: "Completed",
    habit: "Habits",
    learning: "Learning"
  };

  return labels[filter.id] ?? filter.label;
}

export function translateProduct(locale: Locale, product: SimulationProduct): SimulationProduct {
  const localized = productCopy[product.id]?.[locale];

  return {
    ...product,
    learningGoal: localized?.learningGoal ?? product.learningGoal,
    name: localized?.name ?? product.name,
    riskLabel: localized?.riskLabel ?? product.riskLabel,
    simulationLogic: localized?.simulationLogic ?? product.simulationLogic,
    userLabel: localized?.userLabel ?? product.userLabel,
    volatilityLabel: localized?.volatilityLabel ?? product.volatilityLabel
  };
}

export function translateAllocationExample(locale: Locale, example: SimulationAllocationExample): SimulationAllocationExample {
  if (locale === "zh-CN") {
    return example;
  }

  const labels: Record<SimulationAllocationExample["id"], string> = {
    balanced: "Balanced",
    conservative: "Conservative",
    growth: "Growth"
  };

  return {
    ...example,
    label: labels[example.id]
  };
}

export function translateRiskLabel(locale: Locale, label: string): string {
  if (locale === "zh-CN") {
    return label;
  }

  const labels: Record<string, string> = {
    中低风险: "Medium-Low Risk",
    中等风险: "Medium Risk",
    低风险: "Low Risk",
    偏高风险: "Medium-High Risk",
    均衡组合: "Balanced Portfolio",
    成长组合: "Growth Portfolio",
    稳健组合: "Conservative Portfolio"
  };

  return labels[label] ?? label;
}

export function translateSimulationRun(locale: Locale, run: SimulationCycleRun): SimulationCycleRun {
  if (locale === "zh-CN") {
    return run;
  }

  return {
    ...run,
    cycleLabel: runCopy.cycleLabel[run.cycleLabel as keyof typeof runCopy.cycleLabel] ?? run.cycleLabel,
    disclosure: translateText(locale, run.disclosure) ?? run.disclosure,
    productResults: run.productResults.map((result) => ({
      ...result,
      explanation: runCopy.explanations[result.productId as keyof typeof runCopy.explanations] ?? result.explanation,
      productName: productCopy[result.productId]?.["en-US"]?.name ?? result.productName,
      riskLabel: translateRiskLabel(locale, result.riskLabel)
    })),
    reflectionQuestions: run.reflectionQuestions.map((question) => ({
      ...question,
      helperText: runCopy.questions[question.id as keyof typeof runCopy.questions]?.helperText ?? question.helperText,
      prompt: runCopy.questions[question.id as keyof typeof runCopy.questions]?.prompt ?? question.prompt
    })),
    rewardCalculationBasis: translateText(locale, run.rewardCalculationBasis) ?? run.rewardCalculationBasis,
    riskConfirmationStatements: run.riskConfirmationStatements.map(
      (statement) => runCopy.riskStatements[statement as keyof typeof runCopy.riskStatements] ?? statement
    )
  };
}
