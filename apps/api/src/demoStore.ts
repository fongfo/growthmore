import { createHash, randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  demoAuditLogs,
  demoComplianceSummary,
  demoDisclosureAcceptances,
  demoLinkedBankAccount,
  demoMockSession,
  demoRewardJar,
  demoRewardLedger,
  demoSimulationAllocationDraft,
  demoSimulationCycleRun,
  demoTodayHomeSummary,
  demoIntroLesson,
  demoUserTasks,
  demoVirtualBalance,
  demoVirtualBalanceLedger,
  demoWithdrawalRequests,
  type AuditLogEntry,
  type ComplianceSummary,
  type DisclosureAcceptance,
  type LinkedBankAccount,
  type LearningProgress,
  type MockUserSession,
  type RewardJarSnapshot,
  type RewardLedgerEntry,
  type SimulationAllocationDraft,
  type SimulationCycleRun,
  type TodayHomeSummary,
  type UserTask,
  type VirtualBalanceLedgerEntry,
  type VirtualBalanceSnapshot,
  type WithdrawalRequest
} from "@growthmore/shared";

export type DemoUserState = {
  account: LinkedBankAccount;
  tasks: UserTask[];
  virtualBalance: VirtualBalanceSnapshot;
  virtualBalanceLedger: VirtualBalanceLedgerEntry[];
  allocationDraft: SimulationAllocationDraft;
  simulationRun: SimulationCycleRun;
  simulationRuns: SimulationCycleRun[];
  rewardJar: RewardJarSnapshot;
  rewardLedger: RewardLedgerEntry[];
  withdrawals: WithdrawalRequest[];
  disclosureAcceptances: DisclosureAcceptance[];
  complianceSummary: ComplianceSummary;
  auditLogs: AuditLogEntry[];
  home: TodayHomeSummary;
  learningProgress: LearningProgress[];
};

type StoredUser = {
  session: MockUserSession;
  state: DemoUserState;
};

const defaultDemoPhone = "13800004288";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function phoneDigits(phone: unknown): string {
  return String(phone ?? "").replace(/\D/g, "");
}

function phoneSuffix(phone: string): string {
  return phone.slice(-4).padStart(4, "0");
}

function phoneMask(phone: string): string {
  return phone.length >= 7 ? `${phone.slice(0, 3)}****${phoneSuffix(phone)}` : `***${phoneSuffix(phone)}`;
}

function identityForPhone(phone: string) {
  if (phone === defaultDemoPhone) {
    return {
      userId: demoMockSession.user.id,
      accessToken: demoMockSession.auth.accessToken,
      displayName: demoMockSession.user.displayName
    };
  }

  const digest = createHash("sha256").update(`growthmore-demo:${phone}`).digest("hex").slice(0, 12);
  return {
    userId: `mock-user-${digest}`,
    accessToken: `mock-demo-${digest}`,
    displayName: `Demo ${phoneSuffix(phone)}`
  };
}

function seedUser(phone: string): StoredUser {
  const identity = identityForPhone(phone);
  const session: MockUserSession = {
    user: {
      id: identity.userId,
      displayName: identity.displayName,
      phoneMasked: phoneMask(phone),
      tenantSlug: demoMockSession.user.tenantSlug,
      kycStatus: "mock_verified"
    },
    auth: {
      accessToken: identity.accessToken,
      tokenType: "Bearer",
      expiresInSeconds: demoMockSession.auth.expiresInSeconds
    }
  };
  const account: LinkedBankAccount = {
    ...clone(demoLinkedBankAccount),
    id: identity.userId === demoMockSession.user.id ? demoLinkedBankAccount.id : `mock-account-${identity.userId.slice(-12)}`,
    accountName: identity.displayName,
    accountNumberMasked: `**** **** **** ${phoneSuffix(phone)}`
  };
  const withUserId = <T extends { userId: string }>(value: T): T => ({ ...clone(value), userId: identity.userId });
  const state: DemoUserState = {
    account,
    tasks: demoUserTasks.map(withUserId),
    virtualBalance: clone(demoVirtualBalance),
    virtualBalanceLedger: demoVirtualBalanceLedger.map(withUserId),
    allocationDraft: withUserId(demoSimulationAllocationDraft),
    simulationRun: withUserId(demoSimulationCycleRun),
    simulationRuns: [withUserId(demoSimulationCycleRun)],
    rewardJar: {
      ...withUserId(demoRewardJar),
      ledger: demoRewardJar.ledger.map(withUserId)
    },
    rewardLedger: demoRewardLedger.map(withUserId),
    withdrawals: demoWithdrawalRequests.map((item) => ({
      ...withUserId(item),
      withdrawalAccount: {
        id: account.id,
        bankName: account.bankName,
        accountName: account.accountName,
        accountNumberMasked: account.accountNumberMasked,
        currency: account.currency,
        status: account.status
      }
    })),
    disclosureAcceptances: demoDisclosureAcceptances.map(withUserId),
    complianceSummary: {
      ...clone(demoComplianceSummary),
      acceptedDisclosures: demoComplianceSummary.acceptedDisclosures.map(withUserId),
      latestAuditLogs: demoComplianceSummary.latestAuditLogs.map(
        (item) => item.actorType === "user" ? { ...clone(item), actorId: identity.userId } : clone(item)
      )
    },
    auditLogs: demoAuditLogs.map((item) => item.actorType === "user" ? { ...clone(item), actorId: identity.userId } : clone(item)),
    home: { ...clone(demoTodayHomeSummary), userId: identity.userId },
    learningProgress: [{ lessonId: demoIntroLesson.id, taskId: demoIntroLesson.taskId, readSectionIds: [], quizAttemptCount: 0, quizPassed: false, score: null, feedback: null, completedAt: null, updatedAt: new Date().toISOString() }]
  };

  return { session, state };
}

export class DemoStore {
  private readonly database: DatabaseSync;

  constructor(databasePath = ":memory:") {
    if (databasePath !== ":memory:") {
      mkdirSync(dirname(databasePath), { recursive: true });
    }
    this.database = new DatabaseSync(databasePath);
    this.database.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS demo_users (
        user_id TEXT PRIMARY KEY,
        phone TEXT NOT NULL UNIQUE,
        session_json TEXT NOT NULL,
        state_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS demo_sessions (
        access_token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES demo_users(user_id)
      );
    `);
    this.login(defaultDemoPhone);
  }

  login(rawPhone: unknown): MockUserSession {
    const phone = phoneDigits(rawPhone) || defaultDemoPhone;
    const existing = this.database.prepare("SELECT session_json FROM demo_users WHERE phone = ?").get(phone) as
      | { session_json: string }
      | undefined;
    if (existing) return JSON.parse(existing.session_json) as MockUserSession;

    const seeded = seedUser(phone);
    const now = new Date().toISOString();
    this.database.exec("BEGIN IMMEDIATE");
    try {
      this.database.prepare(
        "INSERT INTO demo_users (user_id, phone, session_json, state_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(seeded.session.user.id, phone, JSON.stringify(seeded.session), JSON.stringify(seeded.state), now, now);
      this.database.prepare("INSERT INTO demo_sessions (access_token, user_id) VALUES (?, ?)")
        .run(seeded.session.auth.accessToken, seeded.session.user.id);
      this.database.exec("COMMIT");
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
    return clone(seeded.session);
  }

  getDefaultSession(): MockUserSession {
    return this.login(defaultDemoPhone);
  }

  getSession(accessToken?: string): MockUserSession | null {
    const token = accessToken || this.getDefaultSession().auth.accessToken;
    const row = this.database.prepare(`
      SELECT users.session_json
      FROM demo_sessions sessions
      JOIN demo_users users ON users.user_id = sessions.user_id
      WHERE sessions.access_token = ?
    `).get(token) as { session_json: string } | undefined;
    return row ? JSON.parse(row.session_json) as MockUserSession : null;
  }

  getState(userId: string): DemoUserState {
    const row = this.database.prepare("SELECT state_json FROM demo_users WHERE user_id = ?").get(userId) as
      | { state_json: string }
      | undefined;
    if (!row) throw new Error(`Demo user does not exist: ${userId}`);
    const state = JSON.parse(row.state_json) as DemoUserState;
    if (!Array.isArray(state.learningProgress)) {
      state.learningProgress = [{
        lessonId: demoIntroLesson.id,
        taskId: demoIntroLesson.taskId,
        readSectionIds: [],
        quizAttemptCount: 0,
        quizPassed: false,
        score: null,
        feedback: null,
        completedAt: null,
        updatedAt: new Date().toISOString()
      }];
    }
    const normalizeRun = (run: SimulationCycleRun): SimulationCycleRun => ({
      ...demoSimulationCycleRun,
      ...run,
      scenarioVersion: run.scenarioVersion ?? "education-scenario-2026-09-v1",
      allocationSnapshot: run.allocationSnapshot ?? state.allocationDraft.allocations,
      reviewStatus: run.reviewStatus ?? "pending",
      reviewCompletedAt: run.reviewCompletedAt ?? null,
      rewardEligible: run.rewardEligible ?? false,
      reflectionResult: run.reflectionResult ?? null
    });
    state.simulationRun = normalizeRun(state.simulationRun);
    state.simulationRuns = Array.isArray(state.simulationRuns) ? state.simulationRuns.map(normalizeRun) : [state.simulationRun];
    return state;
  }

  updateState(userId: string, update: (state: DemoUserState) => DemoUserState): DemoUserState {
    this.database.exec("BEGIN IMMEDIATE");
    try {
      const nextState = update(this.getState(userId));
      const result = this.database.prepare("UPDATE demo_users SET state_json = ?, updated_at = ? WHERE user_id = ?")
        .run(JSON.stringify(nextState), new Date().toISOString(), userId);
      if (result.changes !== 1) throw new Error(`Demo user does not exist: ${userId}`);
      this.database.exec("COMMIT");
      return clone(nextState);
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }

  createId(prefix: string): string {
    return `${prefix}-${randomUUID()}`;
  }

  close(): void {
    this.database.close();
  }
}
