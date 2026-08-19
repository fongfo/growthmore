---
name: Refactor Safely
description: Plan and execute safe Growthmore refactoring using dependency analysis
---

## Refactor Safely

Use the knowledge graph to plan and execute Growthmore refactoring with confidence.

## Growthmore Context

- Development branch: `development`.
- Use Jira-keyed branches, for example `agent/BGM-<id>-short-name` or `fix/BGM-<id>-short-name`.
- Keep refactors scoped to `apps/mobile`, `apps/api`, or `packages/shared` unless the Jira issue explicitly spans multiple areas.
- Do not introduce a Web/H5 user client while refactoring mobile app work.
- Protect financial/reward semantics and disclosure wording; refactors must preserve compliance language.

### Steps

1. Use `refactor_tool` with mode="suggest" for community-driven refactoring suggestions.
2. Use `refactor_tool` with mode="dead_code" to find unreferenced code.
3. For renames, use `refactor_tool` with mode="rename" to preview all affected locations.
4. Use `apply_refactor_tool` with the refactor_id to apply renames.
5. After changes, run `detect_changes` to verify the refactoring impact.

### Safety Checks

- Always preview before applying (rename mode gives you an edit list).
- Check `get_impact_radius` before major refactors.
- Use `get_affected_flows` to ensure no critical paths are broken.
- Run `find_large_functions` to identify decomposition targets.
- Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` before pushing.

## Token Efficiency Rules
- ALWAYS start with `get_minimal_context(task="<your task>")` before any other graph tool.
- Use `detail_level="minimal"` on all calls. Only escalate to "standard" when minimal is insufficient.
- Target: complete any review/debug/refactor task in ≤5 tool calls and ≤800 total output tokens.
