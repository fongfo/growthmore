import { useEffect, useState } from "react";
import type { AuditLogEntry, CampaignConfiguration, WithdrawalRequest } from "@growthmore/shared";
import { adminApi, type Admin } from "./api";

type Page = "overview" | "campaign" | "withdrawals" | "audit";
const money = (value: number) => new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(value);
const date = (value: string | null) => value ? new Date(value).toLocaleString("zh-CN") : "未发布";

export function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("adminToken") ?? "");
  const [draftToken, setDraftToken] = useState("admin-demo");
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [page, setPage] = useState<Page>("overview");
  const [campaign, setCampaign] = useState<CampaignConfiguration | null>(null);
  const [versions, setVersions] = useState<CampaignConfiguration[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [audits, setAudits] = useState<AuditLogEntry[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load(activeToken = token) {
    const session = await adminApi.session(activeToken);
    setAdmin(session.admin);
    const overview = await adminApi.overview(activeToken);
    setCampaign(overview.campaign);
    if (session.admin.roles.includes("operator")) {
      const data = await adminApi.campaign(activeToken); setCampaign(data.campaign); setVersions(data.versions);
    }
    if (session.admin.roles.includes("reviewer")) setWithdrawals((await adminApi.withdrawals(activeToken)).withdrawals);
    if (session.admin.roles.includes("auditor")) setAudits((await adminApi.audits(activeToken)).auditLogs);
  }

  useEffect(() => { if (token) load().catch((reason) => { setError(reason.message); setToken(""); }); }, [token]);

  async function login(event: React.FormEvent) {
    event.preventDefault(); setError("");
    try { await adminApi.session(draftToken); sessionStorage.setItem("adminToken", draftToken); setToken(draftToken); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "登录失败"); }
  }

  async function act(action: () => Promise<unknown>, success: string) {
    setError(""); setMessage("");
    try { await action(); await load(); setMessage(success); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "操作失败"); }
  }

  if (!admin) return <main className="login-shell"><form className="login-card" onSubmit={login}>
    <div className="brand-mark">G</div><p className="eyebrow">GROWTHMORE</p><h1>运营控制台</h1>
    <p className="muted">配置活动预算、审核模拟提现，并保留每一次操作记录。</p>
    <label>演示访问码<input value={draftToken} onChange={(event) => setDraftToken(event.target.value)} autoComplete="current-password" /></label>
    {error && <p className="error" role="alert">{error}</p>}<button className="primary">进入控制台</button>
    <p className="hint">完整权限演示码：admin-demo</p>
  </form></main>;

  const nav: Array<[Page, string, string]> = [["overview", "总览", "⌂"], ["campaign", "活动与预算", "◎"], ["withdrawals", "提现审核", "⇄"], ["audit", "操作审计", "▤"]];
  return <div className="app-shell">
    <aside><div className="brand"><span className="brand-mark small">G</span><div><strong>Growthmore</strong><small>运营控制台</small></div></div>
      <nav>{nav.map(([id, label, icon]) => <button key={id} className={page === id ? "active" : ""} onClick={() => setPage(id)}><span>{icon}</span>{label}</button>)}</nav>
      <div className="profile"><strong>{admin.name}</strong><small>{admin.roles.join(" · ")}</small><button onClick={() => { sessionStorage.removeItem("adminToken"); setAdmin(null); setToken(""); }}>退出</button></div>
    </aside>
    <main className="content"><header><div><p className="eyebrow">DEMO OPERATIONS</p><h1>{nav.find(([id]) => id === page)?.[1]}</h1></div><span className="demo-pill">演示环境 · 不连接真实资金</span></header>
      {message && <div className="notice success">{message}</div>}{error && <div className="notice error">{error}</div>}
      {page === "overview" && campaign && <Overview campaign={campaign} withdrawals={withdrawals} audits={audits} />}
      {page === "campaign" && campaign && (admin.roles.includes("operator") ? <CampaignEditor campaign={campaign} versions={versions} onChange={setCampaign} onSave={() => act(() => adminApi.saveCampaign(token, campaign), "草稿已保存。")} onPublish={() => act(() => adminApi.publishCampaign(token), "活动已发布，用户端将读取新规则。")} /> : <NoAccess />)}
      {page === "withdrawals" && (admin.roles.includes("reviewer") ? <WithdrawalQueue items={withdrawals} onReview={(id, action, reason) => act(() => adminApi.review(token, id, action, reason), "审核结果已保存。")} /> : <NoAccess />)}
      {page === "audit" && (admin.roles.includes("auditor") ? <AuditTable items={audits} /> : <NoAccess />)}
    </main>
  </div>;
}

function Overview({ campaign, withdrawals, audits }: { campaign: CampaignConfiguration; withdrawals: WithdrawalRequest[]; audits: AuditLogEntry[] }) {
  const pending = withdrawals.filter((item) => ["submitted", "under_review"].includes(item.status)).length;
  const percent = Math.round(campaign.budget.reservedAmount / campaign.budget.totalBudgetAmount * 100);
  return <><section className="stats"><article><span>活动状态</span><strong>{campaign.status === "published" ? "已发布" : "草稿"}</strong><small>{campaign.ruleVersion}</small></article><article><span>预算使用</span><strong>{percent}%</strong><small>{money(campaign.budget.reservedAmount)} / {money(campaign.budget.totalBudgetAmount)}</small></article><article><span>待审核提现</span><strong>{pending}</strong><small>仅模拟审核，不触发打款</small></article><article><span>审计记录</span><strong>{audits.length}</strong><small>配置与审核全程留痕</small></article></section>
    <section className="panel hero"><div><p className="eyebrow">CURRENT CAMPAIGN</p><h2>{campaign.name}</h2><p>{date(campaign.startsAt)} 至 {date(campaign.endsAt)}</p></div><div className="budget-ring" style={{ "--progress": `${percent * 3.6}deg` } as React.CSSProperties}><strong>{percent}%</strong><small>已预留</small></div></section></>;
}

function CampaignEditor({ campaign, versions, onChange, onSave, onPublish }: { campaign: CampaignConfiguration; versions: CampaignConfiguration[]; onChange: (value: CampaignConfiguration) => void; onSave: () => void; onPublish: () => void }) {
  const set = (key: keyof CampaignConfiguration, value: string) => onChange({ ...campaign, [key]: value });
  const budget = (key: keyof CampaignConfiguration["budget"], value: string) => onChange({ ...campaign, budget: { ...campaign.budget, [key]: Number(value) } });
  const task = campaign.tasks[0]!;
  const updateTask = (key: "requiredStatus" | "rewardAmount", value: string) => onChange({
    ...campaign,
    tasks: [{ ...task, [key]: key === "rewardAmount" ? Number(value) : value as "completed" | "claimed" }, ...campaign.tasks.slice(1)]
  });
  return <div className="two-column"><section className="panel"><div className="section-head"><div><h2>活动规则</h2><p>保存为草稿后发布；发布时才影响用户端。</p></div><span className={"status " + campaign.status}>{campaign.status === "published" ? "已发布" : "草稿"}</span></div>
    <div className="form-grid"><label className="wide">活动名称<input value={campaign.name} onChange={(e) => set("name", e.target.value)} /></label><label>开始时间<input type="datetime-local" value={campaign.startsAt.slice(0,16)} onChange={(e) => set("startsAt", e.target.value)} /></label><label>结束时间<input type="datetime-local" value={campaign.endsAt.slice(0,16)} onChange={(e) => set("endsAt", e.target.value)} /></label><label className="wide">规则版本<input value={campaign.ruleVersion} onChange={(e) => set("ruleVersion", e.target.value)} /></label></div>
    <h3>任务条件</h3><div className="form-grid"><label>任务 ID<input value={task.taskId} disabled /></label><label>达标状态<select value={task.requiredStatus} onChange={(e) => updateTask("requiredStatus", e.target.value)}><option value="completed">已完成</option><option value="claimed">已领取成长金</option></select></label><label>活动奖励金额<input type="number" step="0.1" value={task.rewardAmount} onChange={(e) => updateTask("rewardAmount", e.target.value)} /></label></div>
    <h3>预算限制</h3><div className="form-grid"><label>总预算<input type="number" value={campaign.budget.totalBudgetAmount} onChange={(e) => budget("totalBudgetAmount", e.target.value)} /></label><label>每日预算<input type="number" value={campaign.budget.dailyBudgetAmount} onChange={(e) => budget("dailyBudgetAmount", e.target.value)} /></label><label>用户每日上限<input type="number" value={campaign.budget.userDailyLimitAmount} onChange={(e) => budget("userDailyLimitAmount", e.target.value)} /></label><label>用户每月上限<input type="number" value={campaign.budget.userMonthlyLimitAmount} onChange={(e) => budget("userMonthlyLimitAmount", e.target.value)} /></label></div>
    <div className="actions"><button onClick={onSave}>保存草稿</button><button className="primary" onClick={onPublish}>发布活动</button></div></section>
    <section className="panel"><h2>历史规则版本</h2><p className="muted">历史奖励流水继续保留当时适用的版本。</p><div className="timeline">{versions.slice().reverse().map((item) => <article key={item.ruleVersion}><span></span><div><strong>{item.ruleVersion}</strong><p>{item.name}</p><small>{date(item.publishedAt)} · {money(item.budget.totalBudgetAmount)}</small></div></article>)}</div></section></div>;
}

function WithdrawalQueue({ items, onReview }: { items: WithdrawalRequest[]; onReview: (id: string, action: "approve" | "reject", reason: string) => void }) {
  return <section className="panel"><div className="section-head"><div><h2>模拟提现审核队列</h2><p>审核只改变模拟状态和冻结奖励，不连接真实银行通道。</p></div></div><div className="cards">{items.map((item) => <article className="withdrawal" key={item.id}><div><span className={"status " + item.status}>{item.status}</span><h3>{money(item.amount)}</h3><p>{item.withdrawalAccount.accountName} · {item.withdrawalAccount.accountNumberMasked}</p><small>{item.id} · {date(item.submittedAt)}</small></div>{["submitted", "under_review"].includes(item.status) && <div className="row-actions"><button onClick={() => onReview(item.id, "reject", "运营审核拒绝")}>拒绝</button><button className="primary" onClick={() => onReview(item.id, "approve", "")}>批准</button></div>}</article>)}</div></section>;
}

function AuditTable({ items }: { items: AuditLogEntry[] }) { return <section className="panel"><h2>不可省略的操作记录</h2><p className="muted">记录操作者、动作、规则版本与发生时间，便于追溯。</p><div className="table-wrap"><table><thead><tr><th>时间</th><th>操作者</th><th>动作</th><th>对象</th><th>说明</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{date(item.occurredAt)}</td><td>{item.actorId}</td><td><code>{item.action}</code></td><td>{item.entityId}</td><td>{item.summary}</td></tr>)}</tbody></table></div></section>; }
function NoAccess() { return <section className="panel empty"><h2>当前角色无权查看</h2><p>请使用包含对应职责的管理员账号。</p></section>; }
