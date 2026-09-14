---
name: debug-issue
description: Diagnose and fix a reproducible Growthmore bug across mobile, API, and shared contracts. Use for failures or incorrect behavior, not general code exploration.
---

# Debug a Growthmore issue

Read the repository AGENTS.md and relevant sections of project/PROJECT_WORKFLOW.md.

1. Establish the failing action, expected result, actual result, and affected environment. Use logs or a focused reproduction; label an unverified hypothesis.
2. Trace the failing path through apps/mobile, apps/api, and packages/shared as applicable. For reward or ledger bugs, check server semantics as well as the displayed value.
3. Inspect callers and recent relevant changes, then apply the smallest root-cause fix. Avoid unrelated cleanup.
4. Add a regression test when the failure can be reproduced in code. For device-only failures, record the manual reproduction and validation limits.
5. Run relevant checks and the workflow's required gates before any push. Report the cause, fix, evidence, and remaining limitations.

Use available graph tools only when they help trace dependencies; verify results against current source. If absent or stale, use targeted search, git history, and direct reads. Do not stop investigation at an arbitrary tool or token count.
