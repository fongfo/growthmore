---
name: Review Changes
description: Perform a structured Growthmore code review using change detection and impact
---

## Review Changes

Perform a thorough, risk-aware code review for Growthmore using the knowledge graph.

## Growthmore Context

- Product: bank white-label rewards and investment learning mobile app.
- Primary user app path: `apps/mobile` (Expo + React Native + TypeScript).
- API path: `apps/api` (Node.js + Express + TypeScript).
- Shared package path: `packages/shared`.
- Base branch for development reviews: `development`.
- Do not review or request Web/H5 user client work unless a `BGM` Jira issue explicitly changes scope.
- Prioritize financial correctness, disclosure clarity, accessibility, and mobile touch safety.

### Steps

1. Run `detect_changes` to get risk-scored change analysis.
2. Run `get_affected_flows` to find impacted execution paths.
3. For each high-risk function, run `query_graph` with pattern="tests_for" to check test coverage.
4. Run `get_impact_radius` to understand the blast radius.
5. For any untested changes, suggest specific test cases.
6. Check that changes align with the relevant `BGM` Jira issue and target PRs into `development`.

### Output Format

Provide findings grouped by risk level (high/medium/low) with:
- What changed and why it matters
- Test coverage status
- Suggested improvements
- Overall merge recommendation
- Required verification commands, usually `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and security checks when dependencies or request handling changed.

## Token Efficiency Rules
- ALWAYS start with `get_minimal_context(task="<your task>")` before any other graph tool.
- Use `detail_level="minimal"` on all calls. Only escalate to "standard" when minimal is insufficient.
- Target: complete any review/debug/refactor task in ≤5 tool calls and ≤800 total output tokens.
