---
name: review-changes
description: Review a Growthmore diff or pull request for actionable bugs and regressions. Use for code review and merge-readiness questions, not implementation or general status reporting.
---

# Review Growthmore changes

Read the repository AGENTS.md and relevant workflow requirements.

Establish the exact review target: working changes, commit range, or PR base and head. Inspect git status without switching the user's branch. For feature-branch review, use the merge base with development unless the PR specifies another base.
Read changed code and relevant callers/tests. Graph change and impact analysis is optional; validate its output against the actual diff.
Prioritize financial/reward correctness, ledger boundaries, disclosures, API validation/auth, shared contracts, and mobile accessibility where the diff affects them.
Report actionable findings with severity, file and line, a concrete triggering scenario, impact, and suggested correction. Separate confirmed defects from questions. If there are no findings, say so and describe verification limits.
Use actual test/CI evidence for readiness. Missing test links in a graph or file-count ratios are not coverage measurements. Do not claim tests passed unless they ran or a verified CI result establishes it.
Review alone does not authorize edits, commits, pushes, or Jira changes. Recommend merge readiness only for the reviewed revision and known checks.
