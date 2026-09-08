import {
  demoSimulationCycleRun,
  demoSimulationProducts,
  demoUserTasks
} from "@growthmore/shared";
import {
  getTaskStatusCopy,
  t,
  translateProduct,
  translateSimulationRun,
  translateTask
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
});
