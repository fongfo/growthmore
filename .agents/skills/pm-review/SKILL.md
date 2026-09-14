---
name: pm-review
description: Assess Growthmore delivery progress, test evidence, blockers, and next priorities from repository and available Jira/PR state. Use for project status or readiness reports.
---

# Assess Growthmore delivery

Read the repository AGENTS.md and project/PROJECT_WORKFLOW.md. Assess and report within the user's requested scope.

## Gather evidence

- Inspect the current branch and uncommitted changes without switching branches. For integration status, inspect development by ref; fetch its remote ref if current remote evidence is needed and available.
- Choose a relevant time window, milestone, or PR range instead of assuming the last three or five commits define the task. Identify the ref/commit and date used.
- Compare implementation and tests with the relevant product scope. Recent commits and TODO counts alone do not establish completion.
- Verify Jira BGM issues, PR state, and CI where accessible. If an integration is unavailable, label that evidence unavailable and continue the repository assessment.
- Run checks when needed for the readiness question; distinguish a local result from CI and a simulated flow from a tested deployment. Report measured coverage only when a coverage report exists.

## Report

Give a concise module/status/evidence table when useful, followed by concrete blockers and ordered next actions. Distinguish implemented, locally verified, merged, and accepted work. Include the date, reviewed revision, checks run, and limitations.
Investigate quality or security concerns only where evidence and the requested scope justify them. A status request does not require a fixed set of agents or a full security audit.

## Save or publish when requested

An ordinary progress question should return the report in the conversation. If the user requests a saved report, write under project/reports using a descriptive dated filename; update latest.md only when requested or an established report workflow needs it.
If committing/pushing is in scope, use a task branch and a PR into development, follow the workflow checks, and run tests before pushing. Never commit directly to main or force a checkout over local work. Do not publish a report or update Jira solely because this skill was invoked.
