import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { demoLinkedBankAccount, demoMockSession, demoTenant, demoTodayHomeSummary } from "@growthmore/shared";
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
const progressPercent = Math.round(home.level.progressPercent * 100);
const virtualGrowthAmount = home.balances.virtualGrowthAmount.toLocaleString("zh-CN");
const rewardJarAmount = `¥${home.balances.rewardJarAmount.toFixed(2)}`;

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

        <Card style={styles.taskPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">今日推荐任务</AppText>
              <AppText color="textSecondary" variant="caption">
                预计 {home.recommendedTask.estimatedMinutes} 分钟
              </AppText>
            </View>
            <Badge label="推荐" tone="reward" />
          </View>
          <View style={styles.taskBody}>
            <AppText variant="bodyStrong">{home.recommendedTask.title}</AppText>
            <AppText color="textSecondary" variant="body">
              {home.recommendedTask.description}
            </AppText>
            <View style={styles.rewardPill}>
              <AppText color="reward" variant="label">
                {home.recommendedTask.rewardLabel}
              </AppText>
            </View>
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

        <View style={styles.quickActions}>
          {home.nextActions.map((action) => (
            <Button key={action.id} label={action.label} style={styles.quickActionButton} variant="secondary" />
          ))}
        </View>
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
  taskPanel: {
    gap: spacing.lg
  },
  taskBody: {
    gap: spacing.md
  },
  rewardPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.light.rewardSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
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
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  quickActionButton: {
    flexGrow: 1,
    minWidth: 148
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
