import { describe, expect, it } from "vitest";
import { demoUserTasks } from "@growthmore/shared";
import { filterTasks, getTaskAction } from "./taskFlow";

describe("mobile task flow", () => {
  it("filters complete and claimed tasks together", () => {
    expect(filterTasks(demoUserTasks, "completed").map((task) => task.status)).toEqual(["completed", "claimed"]);
  });

  it("maps actionable task states to API actions", () => {
    expect(getTaskAction(demoUserTasks.find((task) => task.status === "available")!)).toBe("start");
    expect(getTaskAction(demoUserTasks.find((task) => task.status === "in_progress")!)).toBe("submit");
    expect(getTaskAction(demoUserTasks.find((task) => task.status === "completed")!)).toBe("claim");
    expect(getTaskAction(demoUserTasks.find((task) => task.status === "rejected")!)).toBe("retry");
    expect(getTaskAction(demoUserTasks.find((task) => task.status === "claimed")!)).toBeNull();
  });
});
