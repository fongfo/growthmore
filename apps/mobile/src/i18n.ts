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
    "compliance.count": "已确认 {accepted} / {required} 项当前披露",
    "compliance.heading": "必要披露与确认",
    "compliance.selectAll": "请逐项勾选待确认披露后继续。",
    "compliance.success": "披露版本已保存，相关操作现已解锁。",
    "compliance.error": "披露确认未保存，请重试。",
    "compliance.appliesTo": "适用于：{contexts}",
    "compliance.context.onboarding": "首次体验",
    "compliance.context.task": "任务",
    "compliance.context.simulation": "模拟学习",
    "compliance.context.reward": "活动奖励",
    "compliance.context.withdrawal": "奖励申请",
    "disclosure.funds.title": "资金性质提醒",
    "disclosure.reward.title": "奖励来源提醒",
    "disclosure.run.title": "学习周期提醒",
    "earn.heading": "赚成长金",
    "earn.summary": "连续完成 {days} 天，今日可赚 {growth} 成长金和 {reward}",
    "task.action.allocate": "去配置成长金",
    "task.action.details": "查看详情",
    "task.criteria": "完成条件",
    "task.empty": "这个分类暂时没有任务。",
    "task.error.action": "任务操作失败，请重试。",
    "task.error.demoMode": "当前使用离线演示数据，连接 API 后才能保存任务进度。",
    "task.riskNotice": "任务说明",
    "task.success.claimed": "已领取 {amount} 成长金，余额和流水已更新。",
    "task.success.updated": "任务状态已更新。",
    "learning.label": "入门课程",
    "learning.progress": "已读 {read}/{total}",
    "learning.read": "已阅读",
    "learning.markRead": "读完本节",
    "learning.quiz": "风险认知测验",
    "learning.submit": "提交答案",
    "learning.attempts": "已尝试 {count} 次，可继续复习并重试。",
    "learning.error.load": "课程加载失败，请重试。",
    "learning.error.save": "阅读进度保存失败，请重试。",
    "learning.error.answer": "请选择一个答案。",
    "learning.error.submit": "答案提交失败，请重试。",
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
    "portfolio.amountLabel": "配置金额",
    "portfolio.amountA11y": "{product}配置金额",
    "portfolio.confirmRequired": "保存前请确认模拟学习与风险说明。",
    "portfolio.saveError": "配置保存失败，请检查金额后重试。",
    "portfolio.save": "保存模拟配置",
    "portfolio.saved": "配置已保存，成长金余额和流水已更新。",
    "portfolio.continueLearning": "继续运行学习周期",
    "portfolio.riskA11y": "组合风险分 {score}",
    "portfolio.riskConfirm": "我知道这是模拟学习；高波动产品可能上涨也可能下跌；真实投资需要完成银行风险测评。",
    "portfolio.unallocated": "未配置 {amount} 成长金，只用于投资学习",
    "rewards.heading": "奖励罐",
    "rewards.intro": "真实奖励来自银行活动预算，按规则进入 reward_ledger",
    "rewards.reviewedArrival": "审核通过后 T+1 入账；Demo MVP 不接真实打款。",
    "rewards.amountLabel": "申请金额",
    "rewards.confirmSimulation": "我确认这是模拟提现申请；提交后对应奖励会冻结，审核完成前不可再次使用。",
    "rewards.withdrawalSuccess": "申请已提交，编号 {id}。当前为模拟人工审核，预计审核通过后 T+1 模拟到账。",
    "rewards.withdrawalError": "申请未提交，请检查金额与资格后重试。",
    "rewards.withdrawalTitle": "{amount} 提现申请",
    "run.changeSummary": "模拟变化 {percent}，活动奖励 {reward}",
    "run.heading": "投资学习",
    "run.prompt": "运行一个学习周期，查看模拟变化并完成复盘确认",
    "run.virtualChange": "{amount} 成长金",
    "run.waiting": "等待运行",
    "run.answerPlaceholder": "输入你的回答",
    "run.confirmRisk": "我已阅读并确认以上风险说明",
    "run.error": "学习周期运行失败，请重试。",
    "run.reflectionError": "复盘未通过，请根据提示补充答案并确认风险。",
    "tabs.language": "语言",
    "today.balanceHeading": "成长金余额",
    "today.earned": "今日已赚 {earned} / {limit}",
    "today.progress": "计划进度 {percent}%，今天还剩 {count} 个任务。",
    "today.intro.eyebrow": "第一次来到 Growthmore？",
    "today.intro.title": "完成任务，配置模拟组合，再用复盘理解风险",
    "today.intro.body": "这里是金融学习 Demo。成长金只能用于模拟配置；奖励罐来自银行活动预算，满足规则后才可能领取。",
    "today.intro.dismiss": "知道了，开始使用",
    "today.intro.review": "重看使用说明",
    "today.journey.title": "今天的三步学习路径",
    "today.step.task": "1  完成任务",
    "today.step.allocation": "2  模拟配置",
    "today.step.reflection": "3  学习复盘",
    "today.step.pending": "未开始",
    "today.step.current": "进行中",
    "today.step.complete": "已完成",
    "today.next.eyebrow": "你的下一步",
    "today.next.reason": "为什么：{reason}",
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
    "compliance.count": "{accepted} of {required} current disclosures confirmed",
    "compliance.heading": "Required Disclosures",
    "compliance.selectAll": "Select each pending disclosure before continuing.",
    "compliance.success": "Disclosure versions saved. Related actions are now unlocked.",
    "compliance.error": "Disclosure confirmation was not saved. Try again.",
    "compliance.appliesTo": "Applies to: {contexts}",
    "compliance.context.onboarding": "Getting started",
    "compliance.context.task": "Tasks",
    "compliance.context.simulation": "Simulation learning",
    "compliance.context.reward": "Campaign rewards",
    "compliance.context.withdrawal": "Reward requests",
    "disclosure.funds.title": "Funds Notice",
    "disclosure.reward.title": "Reward Source Notice",
    "disclosure.run.title": "Learning Cycle Notice",
    "earn.heading": "Earn Growth Credits",
    "earn.summary": "{days}-day streak. Earn up to {growth} growth credits and {reward} today.",
    "task.action.allocate": "Allocate Growth Credits",
    "task.action.details": "View Details",
    "task.criteria": "Completion Criteria",
    "task.empty": "There are no tasks in this category yet.",
    "task.error.action": "Task action failed. Please try again.",
    "task.error.demoMode": "Offline demo data cannot save progress. Connect to the API to continue.",
    "task.riskNotice": "Task Notice",
    "task.success.claimed": "{amount} growth credits claimed. Your balance and ledger are updated.",
    "task.success.updated": "Task status updated.",
    "learning.label": "Intro Lesson",
    "learning.progress": "{read}/{total} read",
    "learning.read": "Read",
    "learning.markRead": "Mark as Read",
    "learning.quiz": "Risk Knowledge Check",
    "learning.submit": "Submit Answer",
    "learning.attempts": "{count} attempts. Review the lesson and try again.",
    "learning.error.load": "The lesson could not be loaded. Try again.",
    "learning.error.save": "Reading progress could not be saved. Try again.",
    "learning.error.answer": "Select an answer.",
    "learning.error.submit": "The answer could not be submitted. Try again.",
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
    "portfolio.amountLabel": "Allocation Amount",
    "portfolio.amountA11y": "Allocation amount for {product}",
    "portfolio.confirmRequired": "Confirm the simulation and risk notice before saving.",
    "portfolio.saveError": "The allocation could not be saved. Check the amounts and try again.",
    "portfolio.save": "Save Simulation Allocation",
    "portfolio.saved": "Allocation saved. Your growth-credit balance and ledger are updated.",
    "portfolio.continueLearning": "Continue to Learning Cycle",
    "portfolio.riskA11y": "Portfolio risk score {score}",
    "portfolio.riskConfirm": "I understand this is simulated learning; higher-volatility products can rise or fall; real investing requires a bank risk assessment.",
    "portfolio.unallocated": "{amount} credits unallocated, for investment learning only",
    "rewards.heading": "Reward Jar",
    "rewards.intro": "Real rewards come from the bank campaign budget and are recorded in reward_ledger.",
    "rewards.reviewedArrival": "Arrives T+1 after approval. Demo MVP does not make real payouts.",
    "rewards.amountLabel": "Request amount",
    "rewards.confirmSimulation": "I confirm this is a simulated withdrawal request. The matching rewards will be frozen until review finishes.",
    "rewards.withdrawalSuccess": "Request {id} submitted for simulated manual review. Simulated arrival is T+1 after approval.",
    "rewards.withdrawalError": "The request was not submitted. Check the amount and eligibility, then try again.",
    "rewards.withdrawalTitle": "{amount} withdrawal request",
    "run.changeSummary": "Simulated change {percent}, campaign reward {reward}",
    "run.heading": "Investment Learning",
    "run.prompt": "Run a learning cycle, review simulated changes, and complete the reflection.",
    "run.virtualChange": "{amount} credits",
    "run.waiting": "Waiting to Run",
    "run.answerPlaceholder": "Enter your answer",
    "run.confirmRisk": "I have read and accept the risk statements above",
    "run.error": "The learning cycle could not run. Try again.",
    "run.reflectionError": "The review did not pass. Update your answers and confirm the risk statements.",
    "tabs.language": "Language",
    "today.balanceHeading": "Growth Credit Balance",
    "today.earned": "Earned today {earned} / {limit}",
    "today.progress": "{percent}% plan progress with {count} tasks left today.",
    "today.intro.eyebrow": "New to Growthmore?",
    "today.intro.title": "Complete a task, build a simulated allocation, then review what you learned",
    "today.intro.body": "This is a financial-learning demo. Growth credits are only for simulation. Reward Jar amounts come from bank campaign budgets and may be claimed only when rules are met.",
    "today.intro.dismiss": "Got It, Start",
    "today.intro.review": "Review How It Works",
    "today.journey.title": "Today's three-step learning path",
    "today.step.task": "1  Complete a Task",
    "today.step.allocation": "2  Simulate Allocation",
    "today.step.reflection": "3  Learning Review",
    "today.step.pending": "Not started",
    "today.step.current": "In progress",
    "today.step.complete": "Complete",
    "today.next.eyebrow": "Your Next Step",
    "today.next.reason": "Why: {reason}",
    "unit.virtualGrowth": "growth credits"
  }
};

const taskCopy: Record<string, Partial<Record<Locale, Pick<UserTask, "title" | "description" | "completionCriteria" | "riskNotice"> & { rejectionReason?: string }>>> = {
  "auto-savings-mock": {
    "en-US": {
      title: "Turn on auto-savings mock",
      description: "Simulate a monthly savings plan to validate the bank task flow.",
      completionCriteria: "Submit the mock auto-savings setup and wait for system verification.",
      riskNotice: "The Demo does not create a real savings plan or debit your account."
    }
  },
  "bank-account-linked": {
    "en-US": {
      title: "Link withdrawal account mock",
      description: "Confirm the linked mock bank account for future reward withdrawals.",
      completionCriteria: "The account must be linked and marked as the withdrawal account.",
      riskNotice: "The Demo account does not represent real bank-account verification or payout."
    }
  },
  "daily-check-in": {
    "en-US": {
      title: "Complete today's check-in",
      description: "Open the app and confirm today's financial health reminder to build a learning habit.",
      completionCriteria: "The check-in can be completed once per calendar day.",
      riskNotice: "Frequent device or account switching may trigger a duplicate-claim review."
    }
  },
  "profile-kyc-mock": {
    "en-US": {
      title: "Complete profile mock",
      description: "Use the mock KYC status to complete your profile and unlock later bank tasks.",
      completionCriteria: "The mock KYC status must be verified.",
      riskNotice: "This does not represent real KYC, bank-account lookup, or payout capability."
    }
  },
  "risk-lesson": {
    "en-US": {
      title: "Complete a 5-minute diversification lesson",
      description: "Learn why a simulated portfolio should not bet on one sector, then earn today's credits.",
      completionCriteria: "Finish the lesson and pass one knowledge check.",
      riskNotice: "Simulation results are educational and do not represent real investment returns."
    }
  },
  "savings-goal": {
    "en-US": {
      title: "Set a savings goal",
      description: "Add this month's savings goal so your simulation has a clear learning target.",
      completionCriteria: "Provide both a goal name and amount.",
      riskNotice: "A savings goal is a planning record and does not promise returns.",
      rejectionReason: "Target amount is missing. Add an amount and try again."
    }
  }
};

const productCopy: Record<string, Partial<Record<Locale, Pick<SimulationProduct, "name" | "userLabel" | "riskLabel" | "volatilityLabel" | "learningGoal" | "simulationLogic">>>> = {
  "balanced-fund": {
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
  "term-deposit": {
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
      riskLabel: "Medium-High Risk",
      volatilityLabel: "Medium-high volatility",
      learningGoal: "Understand commodity volatility",
      simulationLogic: "Gold can rise or fall more sharply, showing commodity price swings."
    }
  },
  "money-market": {
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
  "完成 5 分钟风险分散小课": "Complete the 5-minute diversification lesson",
  "先完成一项具体任务，获得用于模拟配置的成长金。": "Complete one concrete task first to earn growth credits for simulation.",
  "任务已提交，审核完成后即可进入模拟配置。": "Your task is submitted. You can continue to simulation after review.",
  "当前任务正在审核中。": "Your current task is under review.",
  "任务已完成，奖励尚未领取。": "The task is complete and its reward is ready to claim.",
  "这是进入模拟配置前的第一步。": "This is the first step before simulation allocation.",
  "开始今日任务": "Start Today's Task",
  "继续今日任务": "Continue Today's Task",
  "查看审核状态": "View Review Status",
  "领取任务奖励": "Claim Task Reward",
  "配置你的模拟组合": "Build Your Simulated Allocation",
  "把成长金分配到学习产品，观察不同配置的模拟变化。": "Allocate growth credits to learning products and observe how different allocations change.",
  "当前没有可配置的成长金，请先完成任务。": "You do not have growth credits to allocate yet. Complete a task first.",
  "任务奖励已领取，下一步是完成模拟配置。": "The task reward is claimed. Your next step is simulation allocation.",
  "返回任务": "Return to Tasks",
  "开始模拟配置": "Start Simulation Allocation",
  "完成本期学习复盘": "Complete This Cycle's Learning Review",
  "查看模拟变化并回答复盘问题，确认你理解风险与奖励边界。": "Review the simulated changes and answer the reflection questions to confirm the risk and reward boundaries.",
  "模拟配置已保存，本期复盘尚未完成。": "Your simulated allocation is saved, and this cycle's review is still due.",
  "继续学习复盘": "Continue Learning Review",
  "今天的学习闭环已完成": "Today's Learning Loop Is Complete",
  "查看奖励资格、锁定原因和活动流水。": "Review reward eligibility, lock reasons, and campaign history.",
  "复盘已完成，奖励资格已按活动规则计算。": "The review is complete, and reward eligibility was calculated under campaign rules.",
  "复盘已完成，本期未产生活动奖励。": "The review is complete. This cycle did not generate a campaign reward.",
  "查看奖励记录": "View Reward History",
  "成长金与活动奖励入门": "Growth Credits and Campaign Rewards",
  "先分清两类余额，再认识模拟学习中的波动风险。阅读全部内容后完成测验。": "Learn the difference between the two balances, then understand risk in simulated learning. Read every section before taking the quiz.",
  "虚拟成长金用于学习": "Growth Credits Are for Learning",
  "虚拟成长金来自任务，只能用于模拟配置和金融知识学习。它不是现金、存款或真实资产，不能直接提现。": "Growth credits come from tasks and can only be used for simulated allocation and financial learning. They are not cash, deposits, or real assets and cannot be withdrawn directly.",
  "活动奖励来自银行预算": "Campaign Rewards Come from the Bank Budget",
  "奖励罐中的活动奖励来自银行活动预算。是否可领取取决于任务、学习动作、活动资格和审核规则，不由模拟涨跌决定。": "Campaign rewards in the reward jar come from the bank budget. Eligibility depends on tasks, learning actions, campaign rules, and review, not simulated gains or losses.",
  "模拟变化也有风险含义": "Simulated Changes Explain Risk",
  "不同模拟资产的波动不同，分散配置可以降低集中风险，但不能消除风险。模拟结果不构成投资建议。": "Simulated assets move differently. Diversification can reduce concentration risk but cannot remove risk. Simulation results are not investment advice.",
  "下面哪项说法正确？": "Which statement is correct?",
  "虚拟成长金等同现金，可以直接提现": "Growth credits are cash and can be withdrawn directly.",
  "模拟组合涨得越多，活动奖励一定越高": "A higher simulated gain always means a larger campaign reward.",
  "活动奖励来自银行预算，并按任务和活动规则确定": "Campaign rewards come from the bank budget and follow task and campaign rules.",
  "回答正确。活动奖励来自银行预算，并按任务和活动规则确定。": "Correct. Campaign rewards come from the bank budget and follow task and campaign rules.",
  "虚拟成长金不是现金，只能用于模拟配置和学习。请复习第一节后重试。": "Growth credits are not cash. They are for simulation and learning. Review section one and try again.",
  "模拟涨跌不会直接决定活动奖励。请复习第二节后重试。": "Simulated gains and losses do not directly determine campaign rewards. Review section two and try again.",
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
  "高波动资产在模拟中波动更明显，配置前需确认理解风险。": "Higher-volatility assets move more in simulation. Confirm your risk understanding before allocating.",
  "绑定提现账户 mock 获得成长金。": "Growth credits earned for linking the mock withdrawal account.",
  "Demo 开户活动成长金调整流水。": "Demo onboarding campaign growth-credit adjustment.",
  "复核确认部分重复领取，扣回冻结成长金。": "Review confirmed duplicate claims; frozen growth credits were clawed back.",
  "配置成长金到稳健模拟组合。": "Growth credits allocated to a conservative simulation portfolio.",
  "模拟组合释放未使用成长金。": "Unused growth credits were released from the simulation portfolio.",
  "完成资料补全 mock 获得成长金。": "Growth credits earned for completing the profile mock.",
  "异常频率触发复核，临时冻结部分成长金。": "Unusual activity triggered a review, temporarily freezing some growth credits.",
  "虚拟成长金不是现金": "Growth Credits Are Not Cash",
  "虚拟成长金只用于投资学习和模拟配置，不是存款、现金或真实可提现资产。": "Growth credits are only for investment learning and simulation allocation. They are not deposits, cash, or real withdrawable assets.",
  "奖励罐金额来自银行活动预算、任务完成和活动资格，不是模拟投资收益或理财分红。": "Reward jar amounts come from the bank campaign budget, task completion, and campaign eligibility. They are not simulated investment gains or wealth-management dividends.",
  "提现需审核且 Demo 不真实打款": "Withdrawals Require Review; Demo Does Not Pay Out",
  "如果跳转真实基金、理财、黄金、证券或保险产品，必须完成银行风险测评、适当性和销售披露。": "If users continue to real funds, wealth-management products, gold, securities, or insurance, they must complete the bank's risk assessment, suitability process, and sales disclosures.",
  "模拟定存本期小幅变化，用来理解期限和固定收益的稳定性。": "The simulated time deposit changed slightly this cycle, showing term-based fixed-income stability.",
  "模拟货币基金本期变化较轻，重点观察流动性和低波动。": "The simulated money market fund moved lightly this cycle, highlighting liquidity and low volatility.",
  "模拟债券本期受利率情景影响小幅下行，用来理解票息和价格波动。": "The simulated bond moved slightly down under the rate scenario, illustrating coupons and price movement.",
  "模拟平衡基金通过分散配置抵消部分波动，用来理解组合管理。": "The simulated balanced fund offset part of the movement through diversification, illustrating portfolio management.",
  "本期模拟变化仅用于解释资产波动，不代表真实表现。": "This cycle's simulated change only explains asset movement and does not represent real performance.",
  "活动奖励按完成学习周期、复盘问题和风险确认计算，不使用模拟涨跌作为奖励因子。": "Campaign rewards are calculated from learning-cycle completion, reflection answers, and risk confirmation. Simulated gains or losses are not reward factors.",
  "模拟涨跌只用于教育解释，不进入真实奖励计算。奖励金由银行活动预算提供，实际领取以活动规则和审核结果为准。": "Simulated gains and losses are only for education and are not used in real reward calculation. Rewards are funded by the bank campaign budget, with claiming subject to campaign rules and review results.",
  "我知道这是模拟学习，不代表真实投资收益。": "I understand this is simulated learning and does not represent real investment returns.",
  "我知道真实投资需要完成银行风险测评和产品适当性流程。": "I understand real investing requires the bank's risk assessment and product suitability process.",
  "完成风险分散小课获得活动奖励。": "Campaign reward earned for completing the diversification lesson.",
  "完成自动储蓄 mock 校验获得活动奖励。": "Campaign reward earned after completing the auto-savings mock verification.",
  "9 月成长活动可领取奖励。": "September growth campaign reward is available to claim.",
  "完成学习周期和复盘后产生的待校验活动奖励。": "Pending campaign reward generated after completing the learning cycle and reflection.",
  "等待活动预算与风控校验。": "Waiting for campaign budget and risk-control validation.",
  "本月提现窗口尚未开放。": "This month's withdrawal window is not open yet."

};

const runCopy = {
  cycleLabel: {
    "2026 年 8 月第 4 周学习周期": "Learning Cycle: Week 4, August 2026"
  },
  explanations: {
    "balanced-fund": "The balanced fund shows how a mixed allocation can smooth part of the portfolio movement.",
    bond: "The bond simulation shows how rate assumptions and coupon learning affect a stable asset.",
    "term-deposit": "The time-deposit simulation changes slowly, highlighting term-based stability.",
    gold: "Gold moved more this cycle, showing that commodity assets can rise or fall.",
    "money-market": "The money-market simulation stayed steady, highlighting liquidity and modest movement."
  },
  questions: {
    "highest-volatility": {
      prompt: "Which asset showed the highest volatility this cycle?",
      helperText: "Volatility is normal in simulation. The goal is to understand the risk source."
    },
    "allocation-lesson": {
      prompt: "What did this portfolio allocation teach you?",
      helperText: "You can note how diversification, low-volatility assets, or higher-volatility assets affected the portfolio."
    },
    "reward-boundary": {
      prompt: "Why can't real rewards be calculated directly from simulated gains and losses?",
      helperText: "Confirm that rewards come from bank campaign rules, not simulated investment returns."
    }
  },
  riskStatements: {
    "我知道这是模拟学习，不代表真实投资收益。": "I understand this is simulated learning and does not represent real investment returns.",
    "我知道高波动产品可能上涨也可能下跌。": "I understand higher-volatility products can rise or fall.",
    "我知道真实投资需要完成银行风险测评和产品适当性流程。": "I understand real investing requires the bank's risk assessment and product suitability process.",
  "完成风险分散小课获得活动奖励。": "Campaign reward earned for completing the diversification lesson.",
  "完成自动储蓄 mock 校验获得活动奖励。": "Campaign reward earned after completing the auto-savings mock verification.",
  "9 月成长活动可领取奖励。": "September growth campaign reward is available to claim.",
  "完成学习周期和复盘后产生的待校验活动奖励。": "Pending campaign reward generated after completing the learning cycle and reflection.",
  "等待活动预算与风控校验。": "Waiting for campaign budget and risk-control validation.",
  "本月提现窗口尚未开放。": "This month's withdrawal window is not open yet."

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
      rejected: { ctaLabel: "修改后重试", label: "未通过" },
      reversed: { ctaLabel: "查看记录", label: "已撤销" }
    },
    "en-US": {
      available: { ctaLabel: "Start", label: "Available" },
      claimed: { ctaLabel: "View Reward", label: "Claimed" },
      completed: { ctaLabel: "Claim Reward", label: "Complete" },
      in_progress: { ctaLabel: "Submit", label: "In Progress" },
      pending_verification: { ctaLabel: "Waiting", label: "Verifying" },
      rejected: { ctaLabel: "Fix and Retry", label: "Rejected" },
      reversed: { ctaLabel: "View Record", label: "Reversed" }
    }
  };

  return labels[locale][status];
}

export function translateTask(locale: Locale, task: UserTask): UserTask {
  const localized = taskCopy[task.id]?.[locale];

  return {
    ...task,
    completionCriteria: localized?.completionCriteria ?? task.completionCriteria,
    description: localized?.description ?? task.description,
    rejectionReason: localized?.rejectionReason ?? translateText(locale, task.rejectionReason),
    riskNotice: localized?.riskNotice ?? task.riskNotice,
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
    中风险: "Medium Risk",
    中高风险: "Medium-High Risk",
    低波动学习组合: "Low-Volatility Learning Portfolio",
    稳健均衡学习组合: "Conservative Balanced Learning Portfolio",
    中等波动学习组合: "Medium-Volatility Learning Portfolio",
    高波动学习组合: "High-Volatility Learning Portfolio",
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
