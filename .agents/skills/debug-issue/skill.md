---
name: Debug Issue
description: Systematically debug Growthmore issues using graph-powered code navigation
---

## Debug Issue

Use the knowledge graph to systematically trace and debug Growthmore issues.

## Growthmore Context

- Mobile app path: `apps/mobile`.
- API path: `apps/api`.
- Shared business contracts path: `packages/shared`.
- Development branch: `development`; bug fix branches should use `fix/BGM-<id>-short-name` when a Jira issue exists.
- User app scope is mobile app first. Do not debug by adding a Web/H5 user client unless Jira explicitly changes scope.
- For financial/reward bugs, trace both UI display and ledger/reward API semantics before changing code.

### Steps

1. Use `semantic_search_nodes` to find code related to the issue.
2. Use `query_graph` with `callers_of` and `callees_of` to trace call chains.
3. Use `get_flow` to see full execution paths through suspected areas.
4. Run `detect_changes` to check if recent changes caused the issue.
5. Use `get_impact_radius` on suspected files to see what else is affected.
6. Add or update a regression test before closing the bug whenever the bug is reproducible in code.

### Tips

- Check both callers and callees to understand the full context.
- Look at affected flows to find the entry point that triggers the bug.
- Recent changes are the most common source of new issues.
- Always finish with the smallest relevant command set, then run `npm run test` before pushing a fix.

## Token Efficiency Rules
- ALWAYS start with `get_minimal_context(task="<your task>")` before any other graph tool.
- Use `detail_level="minimal"` on all calls. Only escalate to "standard" when minimal is insufficient.
- Target: complete any review/debug/refactor task in ≤5 tool calls and ≤800 total output tokens.
