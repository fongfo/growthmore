import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import {
  demoLinkedBankAccount,
  demoMockSession,
  demoTaskBoardSummary,
  demoTenant,
  demoTodayHomeSummary,
  demoUserTasks,
  taskStatusCopy,
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
const progressPercent = Math.round(home.level.progressPercent * 100);
const virtualGrowthAmount = home.balances.virtualGrowthAmount.toLocaleString("zh-CN");
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
          <MetricCard badge="学习资产" helper="仅用于模拟投资学习" label="虚拟成长金" value={virtualGrowthAmount} />
          <MetricCard helper="满足活动规则后可申请领取" label="奖励罐" value={rewardJarAmount} />
        </View>

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
