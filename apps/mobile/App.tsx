import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { demoLinkedBankAccount, demoMockSession, demoTenant, productLoopSteps } from "@growthmore/shared";
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
          <AppText variant="title">{demoTenant.appName}</AppText>
          <AppText color="textSecondary" variant="body">
            先跑通任务奖励、模拟学习、奖励罐和提现审核闭环，后续开发全部从 Jira BGM
            任务和 development 分支推进。
          </AppText>
          <View style={styles.themeSwatchRow} accessibilityLabel="当前银行主题色">
            <View style={[styles.themeSwatch, { backgroundColor: demoTenant.theme.colors.primary }]} />
            <View style={[styles.themeSwatch, { backgroundColor: demoTenant.theme.colors.cta }]} />
            <View style={[styles.themeSwatch, { backgroundColor: demoTenant.theme.colors.growth }]} />
            <View style={[styles.themeSwatch, { backgroundColor: demoTenant.theme.colors.reward }]} />
          </View>
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
        <Card style={styles.accountPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">Mock 登录与绑卡</AppText>
              <AppText color="textSecondary" variant="caption">
                BGM-5 的移动端状态入口，后续接入真实登录和银行账户校验
              </AppText>
            </View>
            <Badge label="已验证" tone="success" />
          </View>
          <View style={styles.accountRows}>
            <View style={styles.accountRow}>
              <AppText color="textSecondary" variant="label">
                用户
              </AppText>
              <AppText variant="bodyStrong">{demoMockSession.user.displayName}</AppText>
            </View>
            <View style={styles.accountRow}>
              <AppText color="textSecondary" variant="label">
                手机
              </AppText>
              <AppText variant="bodyStrong">{demoMockSession.user.phoneMasked}</AppText>
            </View>
            <View style={styles.accountRow}>
              <AppText color="textSecondary" variant="label">
                提现账户
              </AppText>
              <AppText variant="bodyStrong">{demoLinkedBankAccount.accountNumberMasked}</AppText>
            </View>
          </View>
          <Button label="管理绑定账户" variant="secondary" />
        </Card>

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
  themeSwatchRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  themeSwatch: {
    borderColor: colors.light.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    width: 28
  },
  loopPanel: {
    gap: spacing.lg
  },
  accountPanel: {
    gap: spacing.lg
  },
  accountRows: {
    gap: spacing.md
  },
  accountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between"
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
