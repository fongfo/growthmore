import { Component, useEffect, useState, type ReactNode } from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import {
  createSimulationAllocationDraft,
  createSimulationCycleRun,
  validateWithdrawalRequest,
  type SimulationAllocation,
  type SimulationCycleRun,
  type RewardStatus,
  type WithdrawalStatus,
  type TaskStatus
} from "@growthmore/shared";
import {
  AppIcon,
  AppText,
  Badge,
  Button,
  Card,
  DisclosureBanner,
  MetricCard,
  ProgressBar,
  Screen
} from "./src/components";
import { fallbackMobileAppData } from "./src/api/mobileAppData";
import { useMobileAppData } from "./src/api/useMobileAppData";
import {
  formatCurrency,
  formatInteger,
  formatSignedAmount,
  formatSignedPercent,
  getDisclosureTypeLabel,
  getRewardStatusLabel,
  getTaskStatusCopy,
  getWithdrawalStatusLabel,
  localeOptions,
  t,
  translateAllocationExample,
  translateProduct,
  translateRiskLabel,
  translateSimulationRun,
  translateTask,
  translateTaskFilter,
  translateText,
  type Locale
} from "./src/i18n";
import { colors, spacing } from "./src/theme";
import { type IconName } from "./src/components";

const statusToneByStatus: Record<TaskStatus, "default" | "success" | "learning" | "reward" | "danger"> = {
  available: "learning",
  in_progress: "learning",
  pending_verification: "reward",
  completed: "success",
  claimed: "success",
  rejected: "danger",
  reversed: "danger"
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

type TabId = "today" | "earn" | "allocate" | "grow" | "rewards";

const tabs: Array<{ id: TabId; iconName: IconName; labelKey: string }> = [
  { id: "today", iconName: "calendar-today", labelKey: "nav.today" },
  { id: "earn", iconName: "clipboard-check-outline", labelKey: "nav.earn" },
  { id: "allocate", iconName: "chart-donut", labelKey: "nav.allocate" },
  { id: "grow", iconName: "trending-up", labelKey: "nav.grow" },
  { id: "rewards", iconName: "gift-outline", labelKey: "nav.rewards" }
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
const taskStatusIcon: Record<TaskStatus, IconName> = {
  available: "play-circle-outline",
  in_progress: "progress-clock",
  pending_verification: "clock-outline",
  completed: "check-circle-outline",
  claimed: "check-decagram-outline",
  rejected: "alert-circle-outline",
  reversed: "undo-variant"
};

const rewardStatusIcon: Record<RewardStatus, IconName> = {
  pending: "clock-outline",
  available: "gift-open-outline",
  locked: "lock-outline",
  withdrawal_pending: "bank-transfer-out",
  paid: "check-circle-outline",
  failed: "alert-circle-outline",
  reversed: "undo-variant"
};

const withdrawalStatusIcon: Record<WithdrawalStatus, IconName> = {
  draft: "file-document-outline",
  submitted: "send-outline",
  under_review: "shield-search",
  approved: "check-circle-outline",
  rejected: "alert-circle-outline",
  paid: "bank-check",
  failed: "alert-circle-outline",
  cancelled: "close-circle-outline"
};
type AppErrorBoundaryState = {
  errorMessage: string | null;
};

class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { errorMessage: null };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return { errorMessage: error instanceof Error ? error.message : "Unknown startup error" };
  }

  override componentDidCatch(error: unknown) {
    console.error("Growthmore mobile render failed", error);
  }

  override render() {
    if (this.state.errorMessage) {
      return (
        <View style={styles.appRoot}>
          <StatusBar style="dark" />
          <SafeAreaView style={styles.errorSafeArea}>
            <View style={styles.errorScreen}>
              <Card style={styles.apiStatusPanel}>
                <View style={styles.sectionCopy}>
                  <AppText variant="bodyStrong">App startup issue</AppText>
                  <AppText color="textSecondary" variant="caption">{this.state.errorMessage}</AppText>
                </View>
              </Card>
            </View>
          </SafeAreaView>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <MobileApp />
    </AppErrorBoundary>
  );
}

function MobileApp() {
  const { data, errorMessage, isFallback, refresh, status } = useMobileAppData();
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [allocationDraft, setAllocationDraft] = useState(fallbackMobileAppData.allocationDraft);
  const [locale, setLocale] = useState<Locale>("zh-CN");
  const [simulationRun, setSimulationRun] = useState<SimulationCycleRun | null>(fallbackMobileAppData.simulationRun);
  const [reflectionComplete, setReflectionComplete] = useState(false);

  useEffect(() => {
    setAllocationDraft(data.allocationDraft);
    setSimulationRun(data.simulationRun);
    setReflectionComplete(false);
  }, [data.allocationDraft, data.simulationRun]);

  const home = data.home;
  const taskBoard = data.taskBoard;
  const taskList = data.tasks.slice(0, 5).map((task) => translateTask(locale, task));
  const recentLedger = data.virtualBalanceLedger.slice(-3).reverse();
  const progressPercent = Math.round(home.level.progressPercent * 100);
  const virtualGrowthAmount = formatInteger(locale, data.virtualBalance.availableAmount);
  const rewardJarAmount = formatCurrency(locale, home.balances.rewardJarAmount);
  const rewardJar = data.rewardJar;
  const recentRewardLedger = data.rewardLedger.slice(0, 4);
  const withdrawalRequests = data.withdrawals.slice(0, 3);
  const withdrawalErrors = validateWithdrawalRequest(rewardJar, data.linkedBankAccount, rewardJar.availableAmount);
  const canSubmitWithdrawal = withdrawalErrors.length === 0;
  const complianceSummary = data.complianceSummary;
  const complianceAuditLogs = complianceSummary.latestAuditLogs.slice(0, 3);
  const todayAvailableGrowthAmount = formatInteger(locale, taskBoard.todayAvailableVirtualGrowthAmount);
  const todayAvailableRewardAmount = formatCurrency(locale, taskBoard.todayAvailableRewardJarAmount);
  const localizedAllocationExamples = allocationDraft.examples.map((example) => translateAllocationExample(locale, example));
  const localizedSimulationProducts = data.simulationProducts.map((product) => translateProduct(locale, product));
  const localizedSimulationRun = simulationRun ? translateSimulationRun(locale, simulationRun) : null;

  const handleApplyExample = (exampleId: string) => {
    const example = allocationDraft.examples.find((item) => item.id === exampleId);

    if (example) {
      const nextDraft = createSimulationAllocationDraft(data.virtualBalance.availableAmount, example.allocations);
      setAllocationDraft(nextDraft);
      setSimulationRun(createSimulationCycleRun(nextDraft));
      setReflectionComplete(false);
    }
  };

  const handleResetAllocation = () => {
    const nextDraft = createSimulationAllocationDraft(data.virtualBalance.availableAmount, []);
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
              {data.tenant.displayName}
            </AppText>
            <AppText variant="heading">Hi, {data.session.user.displayName}</AppText>
          </View>
          <View style={styles.topActions}>
            <Badge iconName={status === "loading" ? "cloud-sync-outline" : isFallback ? "database-eye-outline" : "cloud-check-outline"} label={status === "loading" ? t(locale, "api.status.loading") : isFallback ? t(locale, "api.status.demo") : t(locale, "api.status.connected")} tone={isFallback ? "learning" : "success"} />
            <View accessibilityLabel={t(locale, "tabs.language")} style={styles.languageSwitch}>
              {localeOptions.map((option) => {
                const selected = locale === option.value;

                return (
                  <Pressable
                    accessibilityLabel={option.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={option.value}
                    onPress={() => setLocale(option.value)}
                    style={[styles.languageOption, selected ? styles.languageOptionActive : undefined]}
                  >
                    <AppText color={selected ? "inverseText" : "textSecondary"} variant="label">{option.label}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {status === "loading" ? (
          <Card style={styles.apiStatusPanel}>
            <AppText variant="bodyStrong">{t(locale, "api.loading.title")}</AppText>
            <AppText color="textSecondary" variant="caption">{t(locale, "api.loading.body")}</AppText>
          </Card>
        ) : null}

        {status === "error" ? (
          <Card style={styles.apiStatusPanel}>
            <View style={styles.sectionCopy}>
              <AppText variant="bodyStrong">{t(locale, "api.error.title")}</AppText>
              <AppText color="textSecondary" variant="caption">
                {t(locale, "api.error.body", { error: errorMessage ? ` ${errorMessage}` : "" })}
              </AppText>
            </View>
            <Button label={t(locale, "action.retryConnection")} onPress={refresh} variant="secondary" />
          </Card>
        ) : null}

        {activeTab === "rewards" ? (
        <Card style={styles.compliancePanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">{t(locale, "compliance.heading")}</AppText>
              <AppText color="textSecondary" variant="caption">
                {t(locale, "compliance.count", { accepted: complianceSummary.acceptedDisclosureCount, required: complianceSummary.requiredDisclosureCount })}
              </AppText>
            </View>
            <Badge iconName={complianceSummary.pendingDisclosureCount === 0 ? "shield-check-outline" : "shield-alert-outline"} label={complianceSummary.pendingDisclosureCount === 0 ? t(locale, "badge.disclosuresMet") : t(locale, "badge.disclosuresPending")} tone={complianceSummary.pendingDisclosureCount === 0 ? "success" : "reward"} />
          </View>

          <View style={styles.complianceChecklist}>
            {complianceSummary.requiredDisclosures.map((disclosure) => {
              const accepted = complianceSummary.acceptedDisclosures.some(
                (acceptance) => acceptance.disclosureId === disclosure.id && acceptance.version === disclosure.version
              );

              return (
                <View key={disclosure.id} style={styles.disclosureRow}>
                  <View style={[styles.disclosureMarker, accepted ? styles.disclosureMarkerAccepted : styles.disclosureMarkerPending]}>
                    <AppIcon color={accepted ? "success" : "reward"} name={accepted ? "check" : "alert-outline"} size="xs" />
                  </View>
                  <View style={styles.sectionCopy}>
                    <AppText variant="bodyStrong">{translateText(locale, disclosure.title)}</AppText>
                    <AppText color="textSecondary" variant="caption">
                      {getDisclosureTypeLabel(locale, disclosure.type)} · {disclosure.version}
                    </AppText>
                    <AppText color="textSecondary" variant="caption">{translateText(locale, disclosure.body)}</AppText>
                  </View>
                  <Badge iconName={accepted ? "check-circle-outline" : "clock-outline"} label={accepted ? t(locale, "badge.confirmed") : t(locale, "badge.notConfirmed")} tone={accepted ? "success" : "reward"} />
                </View>
              );
            })}
          </View>

          <View style={styles.auditList}>
            {complianceAuditLogs.map((log) => (
              <View key={log.id} style={styles.auditRow}>
                <View style={styles.sectionCopy}>
                  <AppText variant="bodyStrong">{translateText(locale, log.summary)}</AppText>
                  <AppText color="textSecondary" variant="caption">
                    {log.action} · {log.actorType} · {log.occurredAt.slice(0, 10)}
                  </AppText>
                </View>
              </View>
            ))}
          </View>

          <Button
            disabled={complianceSummary.pendingDisclosureCount === 0}
            label={complianceSummary.pendingDisclosureCount === 0 ? t(locale, "action.disclosuresConfirmed") : t(locale, "action.confirmDisclosures")}
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
              <AppText variant="title">{locale === "en-US" ? "Steady Growth Plan" : home.level.planName}</AppText>
            </View>
            <Badge iconName="seed-outline" label={home.level.label} tone="learning" />
          </View>
          <AppText color="textSecondary" variant="body">
            {t(locale, "today.progress", { percent: progressPercent, count: home.level.remainingTaskCount })}
          </AppText>
          <ProgressBar accessibilityLabel={t(locale, "a11y.planProgress", { percent: progressPercent })} value={home.level.progressPercent} />
          <Button label={t(locale, "action.startTodayTask")} onPress={() => setActiveTab("earn")} />
        </Card>

        <View style={styles.metrics}>
          <MetricCard badge={t(locale, "metric.virtual.badge")} helper={t(locale, "metric.virtual.helper")} iconName="sprout-outline" label={t(locale, "metric.virtual.label")} value={virtualGrowthAmount} />
          <MetricCard helper={t(locale, "metric.reward.helper")} iconName="gift-outline" label={t(locale, "metric.reward.label")} value={rewardJarAmount} />
        </View>
        <Card style={styles.balancePanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">{t(locale, "today.balanceHeading")}</AppText>
              <AppText color="textSecondary" variant="caption">
                {t(locale, "today.earned", { earned: formatInteger(locale, data.virtualBalance.todayEarnedAmount), limit: formatInteger(locale, data.virtualBalance.dailyEarnLimitAmount) })}
              </AppText>
            </View>
            <Badge iconName="book-check-outline" label={t(locale, "badge.allocationLedger")} tone="success" />
          </View>
          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceBucket}>
              <AppText color="textSecondary" variant="label">{t(locale, "label.available")}</AppText>
              <AppText variant="bodyStrong">{formatInteger(locale, data.virtualBalance.availableAmount)}</AppText>
            </View>
            <View style={styles.balanceBucket}>
              <AppText color="textSecondary" variant="label">{t(locale, "label.allocated")}</AppText>
              <AppText variant="bodyStrong">{formatInteger(locale, data.virtualBalance.allocatedAmount)}</AppText>
            </View>
            <View style={styles.balanceBucket}>
              <AppText color="textSecondary" variant="label">{t(locale, "label.frozen")}</AppText>
              <AppText variant="bodyStrong">{formatInteger(locale, data.virtualBalance.frozenAmount)}</AppText>
            </View>
          </View>
          <View style={styles.ledgerList}>
            {recentLedger.map((entry) => (
              <View key={entry.id} style={styles.ledgerRow}>
                <View style={styles.sectionCopy}>
                  <AppText variant="bodyStrong">{translateText(locale, entry.description)}</AppText>
                  <AppText color="textSecondary" variant="caption">
                    {entry.ruleVersion} · {entry.sourceType}
                  </AppText>
                </View>
                <AppText color={entry.entryType === "clawback" || entry.entryType === "freeze" ? "danger" : "success"} variant="label">
                  {entry.entryType === "allocate" || entry.entryType === "freeze" || entry.entryType === "clawback" ? "-" : "+"}{formatInteger(locale, entry.amount)}
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
              <AppText variant="heading">{t(locale, "portfolio.heading")}</AppText>
              <AppText color="textSecondary" variant="caption">
                {t(locale, "portfolio.unallocated", { amount: formatInteger(locale, allocationDraft.unallocatedAmount) })}
              </AppText>
            </View>
            <Badge iconName="shield-half-full" label={translateRiskLabel(locale, allocationDraft.riskLabel)} tone="learning" />
          </View>

          <View style={styles.riskTrack} accessibilityLabel={t(locale, "portfolio.riskA11y", { score: allocationDraft.riskScore })}>
            <View style={[styles.riskFill, { width: `${Math.min(allocationDraft.riskScore * 25, 100)}%` }]} />
          </View>

          <View style={styles.exampleRow}>
            {localizedAllocationExamples.map((example) => (
              <Button key={example.id} label={example.label} onPress={() => handleApplyExample(example.id)} style={styles.exampleButton} variant="secondary" />
            ))}
          </View>
          <Button label={t(locale, "action.resetAllocation")} onPress={handleResetAllocation} variant="ghost" />

          <View style={styles.productList}>
            {localizedSimulationProducts.map((product) => {
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
                    <Badge iconName={product.riskLevel === "medium_high" ? "alert-circle-outline" : "shield-outline"} label={product.riskLabel} tone={product.riskLevel === "medium_high" ? "danger" : "learning"} />
                  </View>
                  <View style={styles.allocationTrack}>
                    <View style={[styles.allocationFill, { width: `${allocation.percent}%` }]} />
                  </View>
                  <View style={styles.taskMetaRow}>
                    <AppText color="textSecondary" variant="caption">
                      {t(locale, "portfolio.allocationAmount", { amount: formatInteger(locale, allocation.amount) })}
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
              {t(locale, "portfolio.riskConfirm")}
            </AppText>
          </View>
        </Card>
        ) : null}

        {activeTab === "grow" ? (
        <Card style={styles.learningPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">{t(locale, "run.heading")}</AppText>
              <AppText color="textSecondary" variant="caption">
                {t(locale, "run.prompt")}
              </AppText>
            </View>
            <Badge iconName={reflectionComplete ? "check-circle-outline" : "comment-question-outline"} label={reflectionComplete ? t(locale, "badge.reflectionDone") : t(locale, "badge.reflectionPending")} tone={reflectionComplete ? "success" : "reward"} />
          </View>

          <View style={styles.runSummary}>
            <View style={styles.sectionCopy}>
              <AppText color="textSecondary" variant="label">
                {localizedSimulationRun?.cycleLabel ?? t(locale, "label.currentCycle")}
              </AppText>
              <AppText variant="title">
                {localizedSimulationRun ? t(locale, "run.virtualChange", { amount: formatSignedAmount(locale, localizedSimulationRun.simulatedChangeAmount) }) : t(locale, "run.waiting")}
              </AppText>
              <AppText color="textSecondary" variant="caption">
                {t(locale, "run.changeSummary", { percent: localizedSimulationRun ? formatSignedPercent(localizedSimulationRun.simulatedChangePercent) : "--", reward: formatCurrency(locale, localizedSimulationRun?.rewardActivityAmount ?? 0) })}
              </AppText>
            </View>
            <Button label={t(locale, "action.runCycle")} onPress={handleRunLearningCycle} style={styles.runButton} />
          </View>

          <View style={styles.resultList}>
            {localizedSimulationRun?.productResults.map((result) => (
              <View key={result.productId} style={styles.resultRow}>
                <View style={styles.sectionCopy}>
                  <View style={styles.taskRowHeader}>
                    <AppText variant="bodyStrong">{result.productName}</AppText>
                    <View style={[styles.changePill, result.simulatedChangeAmount < 0 ? styles.changePillDown : styles.changePillUp]}>
                      <AppIcon color={result.simulatedChangeAmount < 0 ? "danger" : "success"} name={result.simulatedChangeAmount < 0 ? "trending-down" : "trending-up"} size="xs" />
                      <AppText color={result.simulatedChangeAmount < 0 ? "danger" : "success"} variant="label">
                        {formatSignedPercent(result.simulatedChangePercent)}
                      </AppText>
                    </View>
                  </View>
                  <AppText color="textSecondary" variant="caption">
                    {formatInteger(locale, result.startingAmount)} {"->"} {formatInteger(locale, result.endingAmount)} {t(locale, "unit.virtualGrowth")}
                  </AppText>
                  <AppText color="textSecondary" variant="caption">
                    {result.explanation}
                  </AppText>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.reflectionList}>
            {localizedSimulationRun?.reflectionQuestions.map((question, index) => (
              <View key={question.id} style={styles.reflectionItem}>
                <AppText variant="bodyStrong">{index + 1}. {question.prompt}</AppText>
                <AppText color="textSecondary" variant="caption">
                  {question.helperText}
                </AppText>
              </View>
            ))}
          </View>

          {localizedSimulationRun?.riskConfirmationRequired ? (
            <View style={styles.confirmationList}>
              {localizedSimulationRun.riskConfirmationStatements.map((statement) => (
                <View key={statement} style={styles.confirmationItem}>
                  <AppIcon color="danger" name="shield-alert-outline" size="sm" />
                  <AppText color="textSecondary" variant="caption">{statement}</AppText>
                </View>
              ))}
            </View>
          ) : null}

          <DisclosureBanner body={localizedSimulationRun?.disclosure ?? translateText(locale, data.tenant.disclosureCopy.simulationNotice) ?? data.tenant.disclosureCopy.simulationNotice} title={t(locale, "disclosure.run.title")} />
          <AppText color="textSecondary" variant="caption">
            {localizedSimulationRun?.rewardCalculationBasis}
          </AppText>
          <Button label={reflectionComplete ? t(locale, "action.reflectionComplete") : t(locale, "action.completeReflection")} onPress={handleCompleteReflection} variant={reflectionComplete ? "secondary" : "primary"} />
        </Card>
        ) : null}

        {activeTab === "earn" ? (
        <>
        <Card style={styles.taskBoardPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">{t(locale, "earn.heading")}</AppText>
              <AppText color="textSecondary" variant="caption">
                {t(locale, "earn.summary", { days: taskBoard.completionStreakDays, growth: todayAvailableGrowthAmount, reward: todayAvailableRewardAmount })}
              </AppText>
            </View>
            <Badge iconName="clipboard-list-outline" label={t(locale, "label.rewardTaskCount", { count: taskBoard.totalTaskCount })} tone="learning" />
          </View>

          <View style={styles.filterRow}>
            {taskBoard.categoryFilters.map((filter) => (
              <View key={filter.id} style={styles.filterChip}>
                <AppText color="primary" variant="label">
                  {translateTaskFilter(locale, filter)}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.taskList}>
            {taskList.map((task) => {
              const statusCopy = getTaskStatusCopy(locale, task.status);
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
                    <Badge iconName={taskStatusIcon[task.status]} label={statusCopy.label} tone={statusToneByStatus[task.status]} />
                  </View>
                  <View style={styles.taskMetaRow}>
                    <AppText color="textSecondary" variant="caption">
                      +{formatInteger(locale, task.reward.virtualGrowthAmount)} {t(locale, "unit.virtualGrowth")}
                      {task.reward.rewardJarAmount > 0 ? `, +${formatCurrency(locale, task.reward.rewardJarAmount)} ${t(locale, "metric.reward.label")}` : ""}
                    </AppText>
                    <AppText color="textSecondary" variant="caption">
                      {t(locale, "label.estimatedMinutes", { minutes: task.estimatedMinutes })}
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

        <DisclosureBanner body={translateText(locale, data.tenant.disclosureCopy.virtualBalanceNotice) ?? data.tenant.disclosureCopy.virtualBalanceNotice} title={t(locale, "disclosure.funds.title")} />
        </>
        ) : null}

        {activeTab === "rewards" ? (
        <Card style={styles.rewardPanel}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <AppText variant="heading">{t(locale, "rewards.heading")}</AppText>
              <AppText color="textSecondary" variant="caption">
                {t(locale, "rewards.intro")}
              </AppText>
            </View>
            <Badge iconName={rewardStatusIcon.available} label={getRewardStatusLabel(locale, "available")} tone="success" />
          </View>

          <View style={styles.rewardHero}>
            <View style={styles.sectionCopy}>
              <AppText color="textSecondary" variant="label">{t(locale, "label.rewardJarBalance")}</AppText>
              <AppText variant="title">{formatCurrency(locale, rewardJar.totalBalanceAmount)}</AppText>
              <AppText color="textSecondary" variant="caption">
                {t(locale, "label.availableReward", { amount: formatCurrency(locale, rewardJar.availableAmount), minimum: formatCurrency(locale, rewardJar.minimumWithdrawalAmount) })}
              </AppText>
            </View>
            <Badge iconName={rewardJar.withdrawalWindow.status === "open" ? "calendar-check-outline" : "calendar-clock-outline"} label={rewardJar.withdrawalWindow.status === "open" ? t(locale, "badge.withdrawalOpen") : t(locale, "badge.withdrawalClosed")} tone={rewardJar.withdrawalWindow.status === "open" ? "success" : "learning"} />
          </View>

          <View style={styles.rewardBreakdown}>
            <View style={styles.rewardBucket}>
              <AppText color="textSecondary" variant="label">{t(locale, "label.pendingValidation")}</AppText>
              <AppText variant="bodyStrong">{formatCurrency(locale, rewardJar.pendingAmount)}</AppText>
            </View>
            <View style={styles.rewardBucket}>
              <AppText color="textSecondary" variant="label">{getRewardStatusLabel(locale, "locked")}</AppText>
              <AppText variant="bodyStrong">{formatCurrency(locale, rewardJar.lockedAmount)}</AppText>
            </View>
            <View style={styles.rewardBucket}>
              <AppText color="textSecondary" variant="label">{t(locale, "label.thisMonthEstimate")}</AppText>
              <AppText variant="bodyStrong">{formatCurrency(locale, rewardJar.thisMonthEstimatedAmount)}</AppText>
            </View>
          </View>

          <View style={styles.rewardRuleBox}>
            <AppText color="textSecondary" variant="caption">
              {translateText(locale, rewardJar.rewardRuleSummary)}
            </AppText>
          </View>

          <View style={styles.withdrawalBox}>
            <View style={styles.taskRowHeader}>
              <View style={styles.sectionCopy}>
                <AppText variant="bodyStrong">{t(locale, "label.withdrawalRequest")}</AppText>
                <AppText color="textSecondary" variant="caption">
                  {translateText(locale, rewardJar.withdrawalWindow.label) ?? rewardJar.withdrawalWindow.label} · {data.linkedBankAccount.bankName} {data.linkedBankAccount.accountNumberMasked}
                </AppText>
              </View>
              <Badge iconName={canSubmitWithdrawal ? "bank-check" : "clipboard-alert-outline"} label={canSubmitWithdrawal ? t(locale, "badge.canSubmit") : t(locale, "badge.ruleRequired")} tone={canSubmitWithdrawal ? "success" : "learning"} />
            </View>
            <View style={styles.withdrawalSummaryRow}>
              <View style={styles.sectionCopy}>
                <AppText color="textSecondary" variant="label">{t(locale, "label.availableWithdrawal")}</AppText>
                <AppText variant="title">{formatCurrency(locale, rewardJar.availableAmount)}</AppText>
              </View>
              <Button disabled={!canSubmitWithdrawal} label={t(locale, "action.submitWithdrawal")} style={styles.withdrawalButton} />
            </View>
            {withdrawalErrors.length > 0 ? (
              <View style={styles.withdrawalReasonBox}>
                {withdrawalErrors.map((error) => (
                  <AppText key={error} color="textSecondary" variant="caption">{translateText(locale, error)}</AppText>
                ))}
              </View>
            ) : (
              <AppText color="textSecondary" variant="caption">{t(locale, "rewards.reviewedArrival")}</AppText>
            )}
            <View style={styles.withdrawalList}>
              {withdrawalRequests.map((withdrawal) => (
                <View key={withdrawal.id} style={styles.withdrawalRow}>
                  <View style={styles.sectionCopy}>
                    <AppText variant="bodyStrong">{t(locale, "rewards.withdrawalTitle", { amount: formatCurrency(locale, withdrawal.amount) })}</AppText>
                    <AppText color="textSecondary" variant="caption">
                      {translateText(locale, withdrawal.estimatedArrivalLabel)} · {withdrawal.withdrawalAccount.accountNumberMasked}
                    </AppText>
                    {withdrawal.rejectionReason || withdrawal.failureReason ? (
                      <AppText color="danger" variant="caption">{translateText(locale, withdrawal.rejectionReason ?? withdrawal.failureReason)}</AppText>
                    ) : null}
                  </View>
                  <Badge iconName={withdrawalStatusIcon[withdrawal.status]} label={getWithdrawalStatusLabel(locale, withdrawal.status)} tone={withdrawalStatusTone[withdrawal.status]} />
                </View>
              ))}
            </View>
          </View>
          <View style={styles.rewardLedgerList}>
            {recentRewardLedger.map((entry) => (
              <View key={entry.id} style={styles.rewardLedgerRow}>
                <View style={styles.sectionCopy}>
                  <AppText variant="bodyStrong">{translateText(locale, entry.description)}</AppText>
                  <AppText color="textSecondary" variant="caption">
                    {entry.sourceType} · {entry.activityRuleVersion} · {entry.budgetBatchId}
                  </AppText>
                  {entry.lockReason ? (
                    <AppText color="textSecondary" variant="caption">{translateText(locale, entry.lockReason)}</AppText>
                  ) : null}
                </View>
                <View style={styles.rewardLedgerAmount}>
                  <AppText color={entry.status === "reversed" ? "danger" : "success"} variant="label">
                    {formatCurrency(locale, entry.amount)}
                  </AppText>
                  <Badge iconName={rewardStatusIcon[entry.status]} label={getRewardStatusLabel(locale, entry.status)} tone={rewardStatusTone[entry.status]} />
                </View>
              </View>
            ))}
          </View>

          <DisclosureBanner body={translateText(locale, rewardJar.disclosure) ?? rewardJar.disclosure} title={t(locale, "disclosure.reward.title")} />
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
                accessibilityLabel={t(locale, "a11y.tabPage", { label: t(locale, tab.labelKey) })}
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
                <View style={[styles.tabIconShell, selected ? styles.tabIconShellActive : undefined]}>
                  <AppIcon color={selected ? "primary" : "textSecondary"} name={tab.iconName} size="sm" />
                </View>
                <AppText color={selected ? "primary" : "textSecondary"} variant="caption">
                  {t(locale, tab.labelKey)}
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
  errorSafeArea: {
    backgroundColor: colors.light.background,
    flex: 1
  },
  errorScreen: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
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
  tabIconShell: {
    alignItems: "center",
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    width: 36
  },
  tabIconShellActive: {
    backgroundColor: colors.light.learningSoft
  },
  tabScreenContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl
  },
  apiStatusPanel: {
    alignItems: "flex-start",
    gap: spacing.md
  },
  topBar: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between"
  },
  topActions: {
    alignItems: "flex-end",
    gap: spacing.sm
  },
  languageSwitch: {
    backgroundColor: colors.light.surfaceMuted,
    borderColor: colors.light.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    padding: 2
  },
  languageOption: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 28,
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  languageOptionActive: {
    backgroundColor: colors.light.primary
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
    alignItems: "center",
    borderRadius: 999,
    height: 24,
    justifyContent: "center",
    marginTop: 2,
    width: 24
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
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
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
