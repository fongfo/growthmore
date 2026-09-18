import type { AuditLogEntry, CampaignConfiguration, WithdrawalRequest } from "@growthmore/shared";

export type Admin = { id: string; name: string; roles: Array<"operator" | "reviewer" | "auditor"> };
const API_URL = import.meta.env.VITE_API_URL ?? "";

async function call<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(API_URL + path, {
    ...options,
    headers: { "Content-Type": "application/json", "x-admin-token": token, ...options?.headers }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message ?? payload.error ?? "请求失败");
  return payload as T;
}

export const adminApi = {
  session: (token: string) => call<{ admin: Admin }>("/api/admin/session", token),
  overview: (token: string) => call<{ campaign: CampaignConfiguration; withdrawalCounts: Record<string, number>; auditCount: number }>("/api/admin/overview", token),
  campaign: (token: string) => call<{ campaign: CampaignConfiguration; versions: CampaignConfiguration[] }>("/api/admin/campaign", token),
  saveCampaign: (token: string, campaign: CampaignConfiguration) => call<{ campaign: CampaignConfiguration }>("/api/admin/campaign", token, { method: "PUT", body: JSON.stringify(campaign) }),
  publishCampaign: (token: string) => call<{ campaign: CampaignConfiguration }>("/api/admin/campaign/publish", token, { method: "POST" }),
  withdrawals: (token: string) => call<{ withdrawals: WithdrawalRequest[] }>("/api/admin/withdrawals", token),
  review: (token: string, id: string, action: "approve" | "reject", reason: string) => call<{ withdrawal: WithdrawalRequest }>(`/api/admin/withdrawals/${id}/${action}`, token, { method: "POST", body: JSON.stringify({ reason }) }),
  audits: (token: string) => call<{ auditLogs: AuditLogEntry[] }>("/api/admin/audit-logs", token)
};
