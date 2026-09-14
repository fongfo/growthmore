---
name: refactor-safely
description: Refactor a specified Growthmore component while preserving behavior and shared contracts. Use for requested structural changes, not speculative repository-wide cleanup.
---

# Refactor Growthmore safely

Read the repository AGENTS.md and relevant workflow requirements.

Establish the requested scope and behavior to preserve. Inspect callers, exports, tests, and runtime usage before changing a shared contract or removing apparently unused code. A graph's missing references alone do not prove code is dead.
Use dependency or rename tools when helpful and available; preview their proposed edits and check current source before applying them. Otherwise use targeted search and direct edits.
Keep financial/reward semantics, disclosure wording, API contracts, and mobile behavior stable unless the task explicitly changes them. Preserve unrelated user edits.
Run focused behavior checks during the change and npm run check before pushing. Apply additional security gates from project/PROJECT_WORKFLOW.md when relevant.
Report what structure changed, why, validation results, and any behavior change or unresolved risk. Do not expand the task into additional refactors suggested by a tool.
