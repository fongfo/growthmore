import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { demoTenant, productLoopSteps } from "@growthmore/shared";
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

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <Screen>
        <Card style={styles.heroPanel}>
          <View style={styles.heroHeader}>
            <AppText color="primary" variant="eyebrow">
              {demoTenant.displayName}
            </AppText>
            <Badge label="Mobile App MVP" tone="learning" />
          </View>
          <AppText variant="title">成长金计划</AppText>
          <AppText color="textSecondary" variant="body">
            先跑通任务奖励、模拟学习、奖励罐和提现审核闭环，后续开发全部从 Jira BGM
            任务和 development 分支推进。
          </AppText>
          <View style={styles.heroActions}>
            <Button label="开始今日任务" />
            <Button label="查看规则" variant="secondary" />
          </View>
        </Card>

        <View style={styles.metrics}>
          <MetricCard badge="可配置" helper="不是现金，不可直接提现" label="虚拟成长金" value="12,800" />
          <MetricCard helper="按活动规则领取" label="奖励罐" value="¥28.50" />
        </View>

        <DisclosureBanner
          body="虚拟成长金只用于投资学习；奖励罐中的金额才可按活动规则申请提现。"
          title="资金性质提醒"
        />

        <Card style={styles.loopPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">Product Loop</AppText>
              <AppText color="textSecondary" variant="caption">
                Earn, Allocate, Grow, Collect 的移动端基础组件样式
              </AppText>
            </View>
            <Badge label="4 steps" />
          </View>
          <ProgressBar accessibilityLabel="当前产品闭环完成度 25%" value={0.25} />
          {productLoopSteps.map((step) => (
            <View key={step.id} style={styles.loopRow}>
              <View style={styles.stepIndex}>
                <AppText color="primary" variant="label">
                  {step.label}
                </AppText>
              </View>
              <View style={styles.stepCopy}>
                <AppText variant="bodyStrong">{step.title}</AppText>
                <AppText color="textSecondary" variant="caption">
                  {step.id}
                </AppText>
              </View>
            </View>
          ))}
        </Card>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    gap: spacing.lg
  },
  heroHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  heroActions: {
    gap: spacing.md
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.md
  },
  loopPanel: {
    gap: spacing.lg
  },
  sectionHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between"
  },
  sectionCopy: {
    flex: 1,
    gap: spacing.xs
  },
  loopRow: {
    alignItems: "center",
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 56,
    padding: spacing.md
  },
  stepIndex: {
    alignItems: "center",
    backgroundColor: colors.light.surfaceMuted,
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  stepCopy: {
    flex: 1,
    gap: spacing.xs
  }
});

