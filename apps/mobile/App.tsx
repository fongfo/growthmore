import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import {
  demoMockSession,
  demoComplianceSummary,
  demoLinkedBankAccount,
  demoRewardJar,
  demoWithdrawalRequests,
  createSimulationAllocationDraft,
  demoSimulationAllocationDraft,
  createSimulationCycleRun,
  demoSimulationCycleRun,
  demoSimulationProducts,
  demoTaskBoardSummary,
  demoTenant,
  demoTodayHomeSummary,
  demoUserTasks,
  demoVirtualBalance,
  demoVirtualBalanceLedger,
  taskStatusCopy,
  validateWithdrawalRequest,
  type DisclosureType,
  type SimulationAllocation,
  type SimulationCycleRun,
  type RewardStatus,
  type WithdrawalStatus,
  type TaskStatus
} from "@growthmore/shared";
import {
  AppText,
  Badge,
  Button,
  Card,
  DisclosureBanner,
  MetricCard,
  ProgressBar,
  Screen
} from "./src/components";
import { colors, spacing } from "./src/theme";

const home = demoTodayHomeSummary;
const taskBoard = demoTaskBoardSummary;
const taskList = demoUserTasks.slice(0, 5);
const recentLedger = demoVirtualBalanceLedger.slice(-3).reverse();
const progressPercent = Math.round(home.level.progressPercent * 100);
const virtualGrowthAmount = demoVirtualBalance.availableAmount.toLocaleString("zh-CN");
const rewardJarAmount = `¥${home.balances.rewardJarAmount.toFixed(2)}`;
const rewardJar = demoRewardJar;
const recentRewardLedger = rewardJar.ledger.slice(0, 4);
const withdrawalRequests = demoWithdrawalRequests.slice(0, 3);
const withdrawalErrors = validateWithdrawalRequest(rewardJar, demoLinkedBankAccount, rewardJar.availableAmount);
const canSubmitWithdrawal = withdrawalErrors.length === 0;
const complianceSummary = demoComplianceSummary;
const complianceAuditLogs = complianceSummary.latestAuditLogs.slice(0, 3);
const todayAvailableGrowthAmount = taskBoard.todayAvailableVirtualGrowthAmount.toLocaleString("zh-CN");
const todayAvailableRewardAmount = `¥${taskBoard.todayAvailableRewardJarAmount.toFixed(2)}`;


const disclosureTypeCopy: Record<DisclosureType, string> = {
  virtual_balance: "虚拟成长金",
  simulation: "模拟学习",
  reward_rule: "奖励规则",
  withdrawal: "提现规则",
  real_product_redirect: "真实产品"
};

const statusToneByStatus: Record<TaskStatus, "default" | "success" | "learning" | "reward" | "danger"> = {
  available: "learning",
  in_progress: "learning",
  pending_verification: "reward",
  completed: "success",
  claimed: "success",
  rejected: "danger",
  reversed: "danger"
};

const rewardStatusCopy: Record<RewardStatus, string> = {
  pending: "待校验",
  available: "可领取",
  locked: "暂锁定",
  withdrawal_pending: "提现中",
  paid: "已到账",
  failed: "发放失败",
  reversed: "已撤销"
};

const rewardStatusTone: Record<RewardStatus, "default" | "success" | "learning" | "reward" | "danger"> = {
  pending: "reward",
  available: "success",
  locked: "learning",
  withdrawal_pending: "reward",
  paid: "success",
  failed: "danger",
  reversed: "danger"
};

const withdrawalStatusCopy: Record<WithdrawalStatus, string> = {
  draft: "草稿",
  submitted: "已提交",
  under_review: "审核中",
  approved: "已通过",
  rejected: "未通过",
  paid: "已到账",
  failed: "处理失败",
  cancelled: "已取消"
};

type TabId = "today" | "earn" | "allocate" | "grow" | "rewards";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "today", label: "今日" },
  { id: "earn", label: "任务" },
  { id: "allocate", label: "配置" },
  { id: "grow", label: "成长" },
  { id: "rewards", label: "奖励" }
];
const withdrawalStatusTone: Record<WithdrawalStatus, "default" | "success" | "learning" | "reward" | "danger"> = {
  draft: "default",
  submitted: "reward",
  under_review: "reward",
  approved: "success",
  rejected: "danger",
  paid: "success",
  failed: "danger",
  cancelled: "default"
};
export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [allocationDraft, setAllocationDraft] = useState(demoSimulationAllocationDraft);
  const [simulationRun, setSimulationRun] = useState<SimulationCycleRun | null>(demoSimulationCycleRun);
  const [reflectionComplete, setReflectionComplete] = useState(false);

  const handleApplyExample = (exampleId: string) => {
    const example = allocationDraft.examples.find((item) => item.id === exampleId);

    if (example) {
      const nextDraft = createSimulationAllocationDraft(demoVirtualBalance.availableAmount, example.allocations);
      setAllocationDraft(nextDraft);
      setSimulationRun(createSimulationCycleRun(nextDraft));
      setReflectionComplete(false);
    }
  };

  const handleResetAllocation = () => {
    const nextDraft = createSimulationAllocationDraft(demoVirtualBalance.availableAmount, []);
    setAllocationDraft(nextDraft);
    setSimulationRun(createSimulationCycleRun(nextDraft));
    setReflectionComplete(false);
  };

  const getAllocationForProduct = (productId: string): SimulationAllocation =>
    allocationDraft.allocations.find((allocation) => allocation.productId === productId) ?? {
      productId,
      amount: 0,
      percent: 0
    };
  const handleRunLearningCycle = () => {
    setSimulationRun(createSimulationCycleRun(allocationDraft));
    setReflectionComplete(false);
  };

  const handleCompleteReflection = () => {
    setReflectionComplete(true);
  };
  return (
    <View style={styles.appRoot}>
      <StatusBar style="dark" />
      <View style={styles.scene}>
        <Screen contentStyle={styles.tabScreenContent}>
        <View style={styles.topBar}>
          <View style={styles.identityBlock}>
            <AppText color="textSecondary" variant="label">
              {demoTenant.displayName}
            </AppText>
            <AppText variant="heading">Hi, {demoMockSession.user.displayName}</AppText>
          </View>
          <Badge label="已登录" tone="success" />
        </View>


        {activeTab === "rewards" ? (
        <Card style={styles.compliancePanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">必要披露与确认</AppText>
              <AppText color="textSecondary" variant="caption">
                已确认 {complianceSummary.acceptedDisclosureCount} / {complianceSummary.requiredDisclosureCount} 个提现前必要披露
              </AppText>
            </View>
            <Badge label={complianceSummary.pendingDisclosureCount === 0 ? "已满足" : "待确认"} tone={complianceSummary.pendingDisclosureCount === 0 ? "success" : "reward"} />
          </View>

          <View style={styles.complianceChecklist}>
            {complianceSummary.requiredDisclosures.map((disclosure) => {
              const accepted = complianceSummary.acceptedDisclosures.some(
                (acceptance) => acceptance.disclosureId === disclosure.id && acceptance.version === disclosure.version
              );

              return (
                <View key={disclosure.id} style={styles.disclosureRow}>
                  <View style={[styles.disclosureMarker, accepted ? styles.disclosureMarkerAccepted : styles.disclosureMarkerPending]} />
                  <View style={styles.sectionCopy}>
                    <AppText variant="bodyStrong">{disclosure.title}</AppText>
                    <AppText color="textSecondary" variant="caption">
                      {disclosureTypeCopy[disclosure.type]} · {disclosure.version}
                    </AppText>
                    <AppText color="textSecondary" variant="caption">{disclosure.body}</AppText>
                  </View>
                  <Badge label={accepted ? "已确认" : "未确认"} tone={accepted ? "success" : "reward"} />
                </View>
              );
            })}
          </View>

          <View style={styles.auditList}>
            {complianceAuditLogs.map((log) => (
              <View key={log.id} style={styles.auditRow}>
                <View style={styles.sectionCopy}>
                  <AppText variant="bodyStrong">{log.summary}</AppText>
                  <AppText color="textSecondary" variant="caption">
                    {log.action} · {log.actorType} · {log.occurredAt.slice(0, 10)}
                  </AppText>
                </View>
              </View>
            ))}
          </View>

          <Button
            disabled={complianceSummary.pendingDisclosureCount === 0}
            label={complianceSummary.pendingDisclosureCount === 0 ? "必要披露已确认" : "确认必要披露"}
            variant={complianceSummary.pendingDisclosureCount === 0 ? "secondary" : "primary"}
          />
        </Card>
        ) : null}

        {activeTab === "today" ? (
        <>
        <Card style={styles.todayPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText color="primary" variant="eyebrow">
                Today
              </AppText>
              <AppText variant="title">{home.level.planName}</AppText>
            </View>
            <Badge label={home.level.label} tone="learning" />
          </View>
          <AppText color="textSecondary" variant="body">
            计划进度 {progressPercent}%，今天还剩 {home.level.remainingTaskCount} 个任务。
          </AppText>
          <ProgressBar accessibilityLabel={`当前计划进度 ${progressPercent}%`} value={home.level.progressPercent} />
          <Button label="开始今日任务" onPress={() => setActiveTab("earn")} />
        </Card>

        <View style={styles.metrics}>
          <MetricCard badge="可用" helper="不可直接提现" label="虚拟成长金" value={virtualGrowthAmount} />
          <MetricCard helper="满足活动规则后可申请领取" label="奖励罐" value={rewardJarAmount} />
        </View>
        <Card style={styles.balancePanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">成长金余额</AppText>
              <AppText color="textSecondary" variant="caption">
                今日已赚 {demoVirtualBalance.todayEarnedAmount.toLocaleString("zh-CN")} / {demoVirtualBalance.dailyEarnLimitAmount.toLocaleString("zh-CN")}
              </AppText>
            </View>
            <Badge label="流水推导" tone="success" />
          </View>
          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceBucket}>
              <AppText color="textSecondary" variant="label">可用</AppText>
              <AppText variant="bodyStrong">{demoVirtualBalance.availableAmount.toLocaleString("zh-CN")}</AppText>
            </View>
            <View style={styles.balanceBucket}>
              <AppText color="textSecondary" variant="label">已配置</AppText>
              <AppText variant="bodyStrong">{demoVirtualBalance.allocatedAmount.toLocaleString("zh-CN")}</AppText>
            </View>
            <View style={styles.balanceBucket}>
              <AppText color="textSecondary" variant="label">冻结</AppText>
              <AppText variant="bodyStrong">{demoVirtualBalance.frozenAmount.toLocaleString("zh-CN")}</AppText>
            </View>
          </View>
          <View style={styles.ledgerList}>
            {recentLedger.map((entry) => (
              <View key={entry.id} style={styles.ledgerRow}>
                <View style={styles.sectionCopy}>
                  <AppText variant="bodyStrong">{entry.description}</AppText>
                  <AppText color="textSecondary" variant="caption">
                    {entry.ruleVersion} · {entry.sourceType}
                  </AppText>
                </View>
                <AppText color={entry.entryType === "clawback" || entry.entryType === "freeze" ? "danger" : "success"} variant="label">
                  {entry.entryType === "allocate" || entry.entryType === "freeze" || entry.entryType === "clawback" ? "-" : "+"}{entry.amount.toLocaleString("zh-CN")}
                </AppText>
              </View>
            ))}
          </View>
        </Card>


        </>
        ) : null}

        {activeTab === "allocate" ? (
        <Card style={styles.allocationPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">模拟配置</AppText>
              <AppText color="textSecondary" variant="caption">
                未配置 {allocationDraft.unallocatedAmount.toLocaleString("zh-CN")} 成长金，只用于投资学习
              </AppText>
            </View>
            <Badge label={allocationDraft.riskLabel} tone="learning" />
          </View>

          <View style={styles.riskTrack} accessibilityLabel={`组合风险分 ${allocationDraft.riskScore}`}>
            <View style={[styles.riskFill, { width: `${Math.min(allocationDraft.riskScore * 25, 100)}%` }]} />
          </View>

          <View style={styles.exampleRow}>
            {allocationDraft.examples.map((example) => (
              <Button key={example.id} label={example.label} onPress={() => handleApplyExample(example.id)} style={styles.exampleButton} variant="secondary" />
            ))}
          </View>
          <Button label="重置配置" onPress={handleResetAllocation} variant="ghost" />

          <View style={styles.productList}>
            {demoSimulationProducts.map((product) => {
              const allocation = getAllocationForProduct(product.id);

              return (
                <View key={product.id} style={styles.productConfigCard}>
                  <View style={styles.taskRowHeader}>
                    <View style={styles.sectionCopy}>
                      <AppText variant="bodyStrong">{product.name}</AppText>
                      <AppText color="textSecondary" variant="caption">
                        {product.userLabel} · {product.volatilityLabel} · {product.learningGoal}
                      </AppText>
                    </View>
                    <Badge label={product.riskLabel} tone={product.riskLevel === "medium_high" ? "danger" : "learning"} />
                  </View>
                  <View style={styles.allocationTrack}>
                    <View style={[styles.allocationFill, { width: `${allocation.percent}%` }]} />
                  </View>
                  <View style={styles.taskMetaRow}>
                    <AppText color="textSecondary" variant="caption">
                      配置 {allocation.amount.toLocaleString("zh-CN")} 成长金
                    </AppText>
                    <AppText color="textSecondary" variant="caption">
                      {allocation.percent}%
                    </AppText>
                  </View>
                  <AppText color="textSecondary" variant="caption">
                    {product.simulationLogic}
                  </AppText>
                </View>
              );
            })}
          </View>

          <View style={styles.riskConfirmBox}>
            <AppText color="textSecondary" variant="caption">
              我知道这是模拟学习；高波动产品可能上涨也可能下跌；真实投资需要完成银行风险测评。
            </AppText>
          </View>
        </Card>
        ) : null}

        {activeTab === "grow" ? (
        <Card style={styles.learningPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">投资学习</AppText>
              <AppText color="textSecondary" variant="caption">
                运行一个学习周期，查看模拟变化并完成复盘确认
              </AppText>
            </View>
            <Badge label={reflectionComplete ? "已复盘" : "待复盘"} tone={reflectionComplete ? "success" : "reward"} />
          </View>

          <View style={styles.runSummary}>
            <View style={styles.sectionCopy}>
              <AppText color="textSecondary" variant="label">
                {simulationRun?.cycleLabel ?? "当前学习周期"}
              </AppText>
              <AppText variant="title">
                {simulationRun ? `${simulationRun.simulatedChangeAmount >= 0 ? "+" : ""}${simulationRun.simulatedChangeAmount.toFixed(2)} 成长金` : "等待运行"}
              </AppText>
              <AppText color="textSecondary" variant="caption">
                模拟变化 {simulationRun ? `${simulationRun.simulatedChangePercent >= 0 ? "+" : ""}${simulationRun.simulatedChangePercent.toFixed(2)}%` : "--"}，活动奖励 ¥{(simulationRun?.rewardActivityAmount ?? 0).toFixed(2)}
              </AppText>
            </View>
            <Button label="运行周期" onPress={handleRunLearningCycle} style={styles.runButton} />
          </View>

          <View style={styles.resultList}>
            {simulationRun?.productResults.map((result) => (
              <View key={result.productId} style={styles.resultRow}>
                <View style={styles.sectionCopy}>
                  <View style={styles.taskRowHeader}>
                    <AppText variant="bodyStrong">{result.productName}</AppText>
                    <View style={[styles.changePill, result.simulatedChangeAmount < 0 ? styles.changePillDown : styles.changePillUp]}>
                      <AppText color={result.simulatedChangeAmount < 0 ? "danger" : "success"} variant="label">
                        {result.simulatedChangePercent >= 0 ? "+" : ""}{result.simulatedChangePercent.toFixed(2)}%
                      </AppText>
                    </View>
                  </View>
                  <AppText color="textSecondary" variant="caption">
                    {result.startingAmount.toLocaleString("zh-CN")} 至 {result.endingAmount.toLocaleString("zh-CN")} 成长金
                  </AppText>
                  <AppText color="textSecondary" variant="caption">
                    {result.explanation}
                  </AppText>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.reflectionList}>
            {simulationRun?.reflectionQuestions.map((question, index) => (
              <View key={question.id} style={styles.reflectionItem}>
                <AppText variant="bodyStrong">{index + 1}. {question.prompt}</AppText>
                <AppText color="textSecondary" variant="caption">
                  {question.helperText}
                </AppText>
              </View>
            ))}
          </View>

          {simulationRun?.riskConfirmationRequired ? (
            <View style={styles.confirmationList}>
              {simulationRun.riskConfirmationStatements.map((statement) => (
                <View key={statement} style={styles.confirmationItem}>
                  <View style={styles.confirmationDot} />
                  <AppText color="textSecondary" variant="caption">{statement}</AppText>
                </View>
              ))}
            </View>
          ) : null}

          <DisclosureBanner body={simulationRun?.disclosure ?? demoTenant.disclosureCopy.simulationNotice} title="学习周期提醒" />
          <AppText color="textSecondary" variant="caption">
            {simulationRun?.rewardCalculationBasis}
          </AppText>
          <Button label={reflectionComplete ? "复盘已完成" : "完成复盘与风险确认"} onPress={handleCompleteReflection} variant={reflectionComplete ? "secondary" : "primary"} />
        </Card>
        ) : null}

        {activeTab === "earn" ? (
        <>
        <Card style={styles.taskBoardPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">赚成长金</AppText>
              <AppText color="textSecondary" variant="caption">
                连续完成 {taskBoard.completionStreakDays} 天，今日可赚 {todayAvailableGrowthAmount} 成长金和 {todayAvailableRewardAmount}
              </AppText>
            </View>
            <Badge label={`${taskBoard.totalTaskCount} 个任务`} tone="learning" />
          </View>

          <View style={styles.filterRow}>
            {taskBoard.categoryFilters.map((filter) => (
              <View key={filter.id} style={styles.filterChip}>
                <AppText color="primary" variant="label">
                  {filter.label}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.taskList}>
            {taskList.map((task) => {
              const statusCopy = taskStatusCopy[task.status];
              const isPassiveState = task.status === "pending_verification" || task.status === "claimed" || task.status === "reversed";

              return (
                <View key={task.id} style={styles.taskRow}>
                  <View style={styles.taskRowHeader}>
                    <View style={styles.sectionCopy}>
                      <AppText variant="bodyStrong">{task.title}</AppText>
                      <AppText color="textSecondary" variant="caption">
                        {task.description}
                      </AppText>
                    </View>
                    <Badge label={statusCopy.label} tone={statusToneByStatus[task.status]} />
                  </View>
                  <View style={styles.taskMetaRow}>
                    <AppText color="textSecondary" variant="caption">
                      +{task.reward.virtualGrowthAmount} 成长金
                      {task.reward.rewardJarAmount > 0 ? `，+¥${task.reward.rewardJarAmount.toFixed(2)} 奖励罐` : ""}
                    </AppText>
                    <AppText color="textSecondary" variant="caption">
                      {task.estimatedMinutes} 分钟
                    </AppText>
                  </View>
                  {task.rejectionReason ? (
                    <View style={styles.rejectBox}>
                      <AppText color="danger" variant="caption">
                        {task.rejectionReason}
                      </AppText>
                    </View>
                  ) : null}
                  <Button disabled={isPassiveState} label={statusCopy.ctaLabel} variant={task.status === "completed" ? "primary" : "secondary"} />
                </View>
              );
            })}
          </View>
        </Card>

        <DisclosureBanner body={demoTenant.disclosureCopy.virtualBalanceNotice} title="资金性质提醒" />
        </>
        ) : null}

        {activeTab === "rewards" ? (
        <Card style={styles.rewardPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">奖励罐</AppText>
              <AppText color="textSecondary" variant="caption">
                真实奖励来自银行活动预算，按规则进入 reward_ledger
              </AppText>
            </View>
            <Badge label={rewardStatusCopy.available} tone="success" />
          </View>

          <View style={styles.rewardHero}>
            <View style={styles.sectionCopy}>
              <AppText color="textSecondary" variant="label">奖励罐余额</AppText>
              <AppText variant="title">¥{rewardJar.totalBalanceAmount.toFixed(2)}</AppText>
              <AppText color="textSecondary" variant="caption">
                可领取 ¥{rewardJar.availableAmount.toFixed(2)}，最低领取 ¥{rewardJar.minimumWithdrawalAmount.toFixed(2)}
              </AppText>
            </View>
            <Badge label={rewardJar.withdrawalWindow.status === "open" ? "窗口开放" : "窗口未开放"} tone={rewardJar.withdrawalWindow.status === "open" ? "success" : "learning"} />
          </View>

          <View style={styles.rewardBreakdown}>
            <View style={styles.rewardBucket}>
              <AppText color="textSecondary" variant="label">待校验</AppText>
              <AppText variant="bodyStrong">¥{rewardJar.pendingAmount.toFixed(2)}</AppText>
            </View>
            <View style={styles.rewardBucket}>
              <AppText color="textSecondary" variant="label">锁定</AppText>
              <AppText variant="bodyStrong">¥{rewardJar.lockedAmount.toFixed(2)}</AppText>
            </View>
            <View style={styles.rewardBucket}>
              <AppText color="textSecondary" variant="label">本月预计</AppText>
              <AppText variant="bodyStrong">¥{rewardJar.thisMonthEstimatedAmount.toFixed(2)}</AppText>
            </View>
          </View>

          <View style={styles.rewardRuleBox}>
            <AppText color="textSecondary" variant="caption">
              {rewardJar.rewardRuleSummary}
            </AppText>
          </View>

          <View style={styles.withdrawalBox}>
            <View style={styles.taskRowHeader}>
              <View style={styles.sectionCopy}>
                <AppText variant="bodyStrong">提现申请</AppText>
                <AppText color="textSecondary" variant="caption">
                  {rewardJar.withdrawalWindow.label} · {demoLinkedBankAccount.bankName} {demoLinkedBankAccount.accountNumberMasked}
                </AppText>
              </View>
              <Badge label={canSubmitWithdrawal ? "可提交" : "需满足规则"} tone={canSubmitWithdrawal ? "success" : "learning"} />
            </View>
            <View style={styles.withdrawalSummaryRow}>
              <View style={styles.sectionCopy}>
                <AppText color="textSecondary" variant="label">可提现金额</AppText>
                <AppText variant="title">¥{rewardJar.availableAmount.toFixed(2)}</AppText>
              </View>
              <Button disabled={!canSubmitWithdrawal} label="提交申请" style={styles.withdrawalButton} />
            </View>
            {withdrawalErrors.length > 0 ? (
              <View style={styles.withdrawalReasonBox}>
                {withdrawalErrors.map((error) => (
                  <AppText key={error} color="textSecondary" variant="caption">{error}</AppText>
                ))}
              </View>
            ) : (
              <AppText color="textSecondary" variant="caption">审核通过后 T+1 入账；Demo MVP 不接真实打款。</AppText>
            )}
            <View style={styles.withdrawalList}>
              {withdrawalRequests.map((withdrawal) => (
                <View key={withdrawal.id} style={styles.withdrawalRow}>
                  <View style={styles.sectionCopy}>
                    <AppText variant="bodyStrong">¥{withdrawal.amount.toFixed(2)} 提现申请</AppText>
                    <AppText color="textSecondary" variant="caption">
                      {withdrawal.estimatedArrivalLabel} · {withdrawal.withdrawalAccount.accountNumberMasked}
                    </AppText>
                    {withdrawal.rejectionReason || withdrawal.failureReason ? (
                      <AppText color="danger" variant="caption">{withdrawal.rejectionReason ?? withdrawal.failureReason}</AppText>
                    ) : null}
                  </View>
                  <Badge label={withdrawalStatusCopy[withdrawal.status]} tone={withdrawalStatusTone[withdrawal.status]} />
                </View>
              ))}
            </View>
          </View>
          <View style={styles.rewardLedgerList}>
            {recentRewardLedger.map((entry) => (
              <View key={entry.id} style={styles.rewardLedgerRow}>
                <View style={styles.sectionCopy}>
                  <AppText variant="bodyStrong">{entry.description}</AppText>
                  <AppText color="textSecondary" variant="caption">
                    {entry.sourceType} · {entry.activityRuleVersion} · {entry.budgetBatchId}
                  </AppText>
                  {entry.lockReason ? (
                    <AppText color="textSecondary" variant="caption">{entry.lockReason}</AppText>
                  ) : null}
                </View>
                <View style={styles.rewardLedgerAmount}>
                  <AppText color={entry.status === "reversed" ? "danger" : "success"} variant="label">
                    ¥{entry.amount.toFixed(2)}
                  </AppText>
                  <Badge label={rewardStatusCopy[entry.status]} tone={rewardStatusTone[entry.status]} />
                </View>
              </View>
            ))}
          </View>

          <DisclosureBanner body={rewardJar.disclosure} title="奖励来源提醒" />
        </Card>
        ) : null}
        </Screen>
      </View>
      <SafeAreaView style={styles.tabSafeArea}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;

            return (
              <Pressable
                accessibilityLabel={`${tab.label}页面`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={({ pressed }) => [
                  styles.tabItem,
                  selected ? styles.tabItemActive : undefined,
                  pressed ? styles.tabItemPressed : undefined
                ]}
              >
                <View style={[styles.tabIndicator, selected ? styles.tabIndicatorActive : undefined]} />
                <AppText color={selected ? "primary" : "textSecondary"} variant="caption">
                  {tab.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    backgroundColor: colors.light.background,
    flex: 1
  },
  scene: {
    flex: 1
  },
  tabSafeArea: {
    backgroundColor: colors.light.surface
  },
  tabBar: {
    alignItems: "center",
    backgroundColor: colors.light.surface,
    borderTopColor: colors.light.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm
  },
  tabItem: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 48,
    paddingVertical: spacing.xs
  },
  tabItemActive: {
    backgroundColor: colors.light.surfaceMuted
  },
  tabItemPressed: {
    opacity: 0.72
  },
  tabIndicator: {
    backgroundColor: colors.light.borderStrong,
    borderRadius: 999,
    height: 4,
    width: 18
  },
  tabIndicatorActive: {
    backgroundColor: colors.light.primary,
    width: 28
  },
  tabScreenContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between"
  },
  identityBlock: {
    flex: 1,
    gap: spacing.xs
  },
  compliancePanel: {
    gap: spacing.lg
  },
  complianceChecklist: {
    gap: spacing.md
  },
  disclosureRow: {
    alignItems: "flex-start",
    borderColor: colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md
  },
  disclosureMarker: {
    borderRadius: 6,
    height: 12,
    marginTop: 4,
    width: 12
  },
  disclosureMarkerAccepted: {
    backgroundColor: colors.light.success
  },
  disclosureMarkerPending: {
    backgroundColor: colors.light.reward
  },
  auditList: {
    gap: spacing.sm
  },
  auditRow: {
    backgroundColor: colors.light.surfaceMuted,
    borderRadius: 10,
    padding: spacing.md
  },
  todayPanel: {
    gap: spacing.lg
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.md
  },
  balancePanel: {
    gap: spacing.lg
  },
  balanceBreakdown: {
    flexDirection: "row",
    gap: spacing.md
  },
  balanceBucket: {
    backgroundColor: colors.light.surfaceMuted,
    borderRadius: 12,
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
    padding: spacing.md
  },
  ledgerList: {
    gap: spacing.md
  },
  ledgerRow: {
    alignItems: "center",
    borderColor: colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: spacing.md
  },
  allocationPanel: {
    gap: spacing.lg
  },
  riskTrack: {
    backgroundColor: colors.light.surfaceMuted,
    borderRadius: 999,
    height: 10,
    overflow: "hidden"
  },
  riskFill: {
    backgroundColor: colors.light.learning,
    borderRadius: 999,
    height: 10
  },
  exampleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  exampleButton: {
    flexGrow: 1,
    minWidth: 104
  },
  productList: {
    gap: spacing.md
  },
  productConfigCard: {
    backgroundColor: colors.light.surface,
    borderColor: colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  allocationTrack: {
    backgroundColor: colors.light.surfaceMuted,
    borderRadius: 999,
    height: 8,
    overflow: "hidden"
  },
  allocationFill: {
    backgroundColor: colors.light.success,
    borderRadius: 999,
    height: 8
  },
  riskConfirmBox: {
    backgroundColor: colors.light.learningSoft,
    borderRadius: 12,
    padding: spacing.md
  },
  learningPanel: {
    gap: spacing.lg
  },
  runSummary: {
    alignItems: "center",
    backgroundColor: colors.light.surfaceMuted,
    borderRadius: 12,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 88,
    padding: spacing.md
  },
  runButton: {
    minWidth: 104
  },
  resultList: {
    gap: spacing.md
  },
  resultRow: {
    backgroundColor: colors.light.surface,
    borderColor: colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md
  },
  changePill: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  changePillUp: {
    backgroundColor: colors.light.successSoft
  },
  changePillDown: {
    backgroundColor: colors.light.dangerSoft
  },
  reflectionList: {
    gap: spacing.md
  },
  reflectionItem: {
    backgroundColor: colors.light.learningSoft,
    borderRadius: 12,
    gap: spacing.xs,
    padding: spacing.md
  },
  confirmationList: {
    backgroundColor: colors.light.dangerSoft,
    borderRadius: 12,
    gap: spacing.sm,
    padding: spacing.md
  },
  confirmationItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm
  },
  confirmationDot: {
    backgroundColor: colors.light.danger,
    borderRadius: 4,
    height: 8,
    marginTop: 5,
    width: 8
  },
  taskBoardPanel: {
    gap: spacing.lg
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  filterChip: {
    backgroundColor: colors.light.surfaceMuted,
    borderColor: colors.light.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  taskList: {
    gap: spacing.md
  },
  taskRow: {
    backgroundColor: colors.light.surface,
    borderColor: colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  taskRowHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  taskMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  rejectBox: {
    backgroundColor: colors.light.dangerSoft,
    borderRadius: 8,
    padding: spacing.md
  },
  rewardPanel: {
    gap: spacing.lg
  },
  rewardHero: {
    alignItems: "center",
    backgroundColor: colors.light.successSoft,
    borderRadius: 12,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 88,
    padding: spacing.md
  },
  rewardBreakdown: {
    flexDirection: "row",
    gap: spacing.md
  },
  rewardBucket: {
    backgroundColor: colors.light.surfaceMuted,
    borderRadius: 12,
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
    padding: spacing.md
  },
  rewardRuleBox: {
    backgroundColor: colors.light.rewardSoft,
    borderRadius: 12,
    padding: spacing.md
  },
  withdrawalBox: {
    borderColor: colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  withdrawalSummaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  withdrawalButton: {
    minWidth: 104
  },
  withdrawalReasonBox: {
    backgroundColor: colors.light.surfaceMuted,
    borderRadius: 8,
    gap: spacing.xs,
    padding: spacing.md
  },
  withdrawalList: {
    gap: spacing.sm
  },
  withdrawalRow: {
    alignItems: "flex-start",
    borderTopColor: colors.light.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingTop: spacing.md
  },
  rewardLedgerList: {
    gap: spacing.md
  },
  rewardLedgerRow: {
    alignItems: "flex-start",
    backgroundColor: colors.light.surface,
    borderColor: colors.light.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: spacing.md
  },
  rewardLedgerAmount: {
    alignItems: "flex-end",
    gap: spacing.sm,
    minWidth: 88
  },
  sectionHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between"
  },
  sectionCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0
  }
});
