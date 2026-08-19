export type ProductLoopStep = {
  id: "earn" | "allocate" | "grow" | "collect";
  label: string;
  title: string;
};

export const demoTenant = {
  slug: "demo-bank",
  displayName: "Growthmore Bank",
  primaryColor: "#0F172A"
} as const;

export const productLoopSteps: ProductLoopStep[] = [
  { id: "earn", label: "01", title: "完成任务" },
  { id: "allocate", label: "02", title: "配置成长金" },
  { id: "grow", label: "03", title: "运行学习周期" },
  { id: "collect", label: "04", title: "领取活动奖励" }
];

