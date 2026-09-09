import {
  demoComplianceSummary,
  demoRewardJar,
  demoRewardLedger,
  demoSimulationAllocationDraft,
  demoSimulationCycleRun,
  demoSimulationProducts,
  demoUserTasks,
  demoVirtualBalanceLedger,
  demoWithdrawalRequests
} from "@growthmore/shared";
import {
  getTaskStatusCopy,
  t,
  translateProduct,
  translateRiskLabel,
  translateSimulationRun,
  translateTask,
  translateText
} from "./i18n";
import { describe, expect, it } from "vitest";

describe("mobile i18n", () => {
  it("keeps Chinese copy available for the default mobile experience", () => {
    expect(t("zh-CN", "nav.today")).toBe("今日");
    expect(getTaskStatusCopy("zh-CN", "completed").ctaLabel).toBe("领取奖励");
  });

  it("provides English app chrome and task copy", () => {
    const task = demoUserTasks.find((item) => item.id === "risk-lesson");

    expect(t("en-US", "nav.rewards")).toBe("Rewards");
    expect(getTaskStatusCopy("en-US", "completed").ctaLabel).toBe("Claim Reward");
    expect(task ? translateTask("en-US", task).title : "").toBe("Complete a 5-minute diversification lesson");
  });

  it("localizes simulation products and learning cycle copy", () => {
    const gold = demoSimulationProducts.find((product) => product.id === "gold");
    const run = translateSimulationRun("en-US", demoSimulationCycleRun);

    expect(gold ? translateProduct("en-US", gold).name : "").toBe("Simulated Gold");
    expect(run.cycleLabel).toBe("Learning Cycle: Week 4, August 2026");
    expect(run.reflectionQuestions[0]?.prompt).toBe("Which asset showed the highest volatility this cycle?");
  });

  it("does not leave Chinese copy in English display data", () => {
    const hasChinese = /[\p{Script=Han}]/u;
    const translatedRun = translateSimulationRun("en-US", demoSimulationCycleRun);
    const translatedProducts = demoSimulationProducts.map((product) => translateProduct("en-US", product));
    const translatedTasks = demoUserTasks.map((task) => translateTask("en-US", task));
    const displayStrings = [
      ...translatedProducts.flatMap((product) => [
        product.name,
        product.userLabel,
        product.riskLabel,
        product.volatilityLabel,
        product.learningGoal,
        product.simulationLogic
      ]),
      translateRiskLabel("en-US", demoSimulationAllocationDraft.riskLabel),
      ...translatedRun.productResults.flatMap((result) => [result.productName, result.riskLabel, result.explanation]),
      ...translatedRun.reflectionQuestions.flatMap((question) => [question.prompt, question.helperText]),
      ...translatedRun.riskConfirmationStatements,
      translatedRun.rewardCalculationBasis,
      translatedRun.disclosure,
      ...translatedTasks.flatMap((task) => [task.title, task.description, task.rejectionReason ?? ""]),
      ...demoVirtualBalanceLedger.map((entry) => translateText("en-US", entry.description) ?? ""),
      translateText("en-US", demoRewardJar.rewardRuleSummary) ?? "",
      translateText("en-US", demoRewardJar.disclosure) ?? "",
      translateText("en-US", demoRewardJar.withdrawalWindow.label) ?? "",
      ...demoRewardLedger.flatMap((entry) => [
        translateText("en-US", entry.description) ?? "",
        translateText("en-US", entry.lockReason) ?? ""
      ]),
      ...demoComplianceSummary.requiredDisclosures.flatMap((disclosure) => [
        translateText("en-US", disclosure.title) ?? "",
        translateText("en-US", disclosure.body) ?? ""
      ]),
      ...demoComplianceSummary.latestAuditLogs.map((log) => translateText("en-US", log.summary) ?? ""),
      ...demoWithdrawalRequests.flatMap((withdrawal) => [
        translateText("en-US", withdrawal.estimatedArrivalLabel) ?? "",
        translateText("en-US", withdrawal.rejectionReason) ?? "",
        translateText("en-US", withdrawal.failureReason) ?? ""
      ])
    ];

    expect(displayStrings.filter((text) => hasChinese.test(text))).toEqual([]);
  });
});
