import type { TaskBoardSummary, UserTask } from "@growthmore/shared";
import type { MobileTaskAction } from "./api/mobileAppData";

export type TaskFilterId = TaskBoardSummary["categoryFilters"][number]["id"];

export function filterTasks(tasks: UserTask[], filterId: TaskFilterId): UserTask[] {
  if (filterId === "all") return tasks;
  if (filterId === "completed") {
    return tasks.filter((task) => task.status === "completed" || task.status === "claimed");
  }
  return tasks.filter((task) => task.category === filterId);
}

export function getTaskAction(task: UserTask): MobileTaskAction | null {
  if (task.status === "available") return "start";
  if (task.status === "in_progress") return "submit";
  if (task.status === "completed") return "claim";
  if (task.status === "rejected") return "retry";
  return null;
}
