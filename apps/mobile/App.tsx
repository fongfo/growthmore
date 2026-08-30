import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import {
  demoLinkedBankAccount,
  demoMockSession,
  createSimulationAllocationDraft,
  demoSimulationAllocationDraft,
  demoSimulationProducts,
  demoTaskBoardSummary,
  demoTenant,
  demoTodayHomeSummary,
  demoUserTasks,
  demoVirtualBalance,
  demoVirtualBalanceLedger,
  taskStatusCopy,
  type SimulationAllocation,
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
const todayAvailableGrowthAmount = taskBoard.todayAvailableVirtualGrowthAmount.toLocaleString("zh-CN");
const todayAvailableRewardAmount = `¥${taskBoard.todayAvailableRewardJarAmount.toFixed(2)}`;

const statusToneByStatus: Record<TaskStatus, "default" | "success" | "learning" | "reward" | "danger"> = {
  available: "learning",
  in_progress: "learning",
  pending_verification: "reward",
  completed: "success",
  claimed: "success",
  rejected: "danger",
  reversed: "danger"
};

export default function App() {
  const [allocationDraft, setAllocationDraft] = useState(demoSimulationAllocationDraft);

  const handleApplyExample = (exampleId: string) => {
    const example = allocationDraft.examples.find((item) => item.id === exampleId);

    if (example) {
      setAllocationDraft(createSimulationAllocationDraft(demoVirtualBalance.availableAmount, example.allocations));
    }
  };

  const handleResetAllocation = () => {
    setAllocationDraft(createSimulationAllocationDraft(demoVirtualBalance.availableAmount, []));
  };

  const getAllocationForProduct = (productId: string): SimulationAllocation =>
    allocationDraft.allocations.find((allocation) => allocation.productId === productId) ?? {
      productId,
      amount: 0,
      percent: 0
    };
  return (
    <>
      <StatusBar style="dark" />
      <Screen>
        <View style={styles.topBar}>
          <View style={styles.identityBlock}>
            <AppText color="textSecondary" variant="label">
              {demoTenant.displayName}
            </AppText>
            <AppText variant="heading">Hi, {demoMockSession.user.displayName}</AppText>
          </View>
          <Badge label="已登录" tone="success" />
        </View>

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
          <Button label={home.recommendedTask.ctaLabel} />
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

        <Card style={styles.withdrawPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">提现窗口</AppText>
              <AppText color="textSecondary" variant="caption">
                {home.withdrawalWindow.label}
              </AppText>
            </View>
            <Badge label="未开放" />
          </View>
          <View style={styles.accountRow}>
            <View style={styles.sectionCopy}>
              <AppText color="textSecondary" variant="label">
                绑定账户
              </AppText>
              <AppText variant="bodyStrong">{demoLinkedBankAccount.accountNumberMasked}</AppText>
            </View>
            <Button label="管理" variant="secondary" />
          </View>
        </Card>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
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
  withdrawPanel: {
    gap: spacing.lg
  },
  accountRow: {
    alignItems: "center",
    backgroundColor: colors.light.surfaceMuted,
    borderRadius: 12,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 72,
    padding: spacing.md
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
