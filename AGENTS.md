# Growthmore agent guidance

## Project context
- Mobile: apps/mobile (Expo, React Native, TypeScript).
- API: apps/api (Node.js, Express, TypeScript).
- Shared contracts and business constants: packages/shared.
- Product source: project/BANK_REWARDS_INVEST_APP_PRODUCT_DESIGN.md and project/sprout-prototype.jsx.
- Delivery and Jira conventions: project/PROJECT_WORKFLOW.md; Jira project key BGM.
- User-facing work is mobile first. Follow the documented scope; do not add a Web/H5 client unless the user or an approved issue changes it.

## Working rules
- Never commit directly to main. Development work targets development via a task branch and PR. Use codex/ for a new agent branch unless the user specifies another name; include the verified Jira key when available.
- Inspect the branch and working changes before editing. Preserve unrelated changes. Read-only reviews do not require a checkout.
- Follow the delivery gates in project/PROJECT_WORKFLOW.md. npm run check runs lint, typecheck, tests, and build. Always run tests before pushing; report failures as failures.
- Ground frontend changes in the existing prototype and product design. Trace reward/ledger changes across UI, API, and shared contracts.
- Treat graph tools as optional navigation aids. Inspect available tool schemas, confirm findings in current source, and fall back to targeted search when tools are missing or stale.
- Report the checked revision and verification limits when answering readiness questions. Distinguish code completion, passing checks, merge state, and acceptance.

## Task-specific skills
Load only the skill that fits the request:
- .agents/skills/explore-codebase/SKILL.md: find implementation and explain architecture.
- .agents/skills/debug-issue/SKILL.md: reproduce and fix a defect.
- .agents/skills/review-changes/SKILL.md: review a diff or PR.
- .agents/skills/refactor-safely/SKILL.md: preserve behavior during a requested refactor.
- .agents/skills/pm-review/SKILL.md: assess project progress and readiness.
