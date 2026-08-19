# Growthmore Project Workflow

Status: Active  
Date: 2026-08-18  
GitHub repository: `https://github.com/fongfo/growthmore`  
Jira project: `BGM` / `Bank-Growth More`  
Jira URL: `https://growth-more.atlassian.net/jira/software/projects/BGM`

## Product Target

- The user-facing product is a mobile app first.
- Use `apps/mobile` with Expo, React Native, and TypeScript for user app work.
- Do not create a Web/H5 user client unless a `BGM` Jira issue explicitly changes the scope.
- Web work is only in scope for an admin console or a separately approved channel.

## Branch Policy

- Do not commit directly to `main`.
- Use `development` as the shared testing branch.
- Feature work should start from `development`.
- Feature branches should use the Jira key when available:
  - `feature/BGM-123-short-name`
  - `fix/BGM-123-short-name`
  - `agent/BGM-123-short-name`
- Pull requests for development work should target `development`.
- Pull requests from `development` to `main` should be reserved for release-ready changes.

## Jira Workflow

The Jira project key is `BGM`.

Available issue types:

- `Epic`
- `Feature`
- `Story`
- `Task`
- `Bug`
- `Subtask`

Available statuses:

- `To Do`
- `In Progress`
- `In Review`
- `Done`

Recommended mapping:

- Product areas and large modules use `Epic` or `Feature`.
- User-facing implementation slices use `Story`.
- Engineering setup, documentation, and backend/admin units use `Task`.
- Defects use `Bug`.
- Small implementation pieces under a larger item use `Subtask`.

## Delivery Flow

1. Confirm or create the Jira issue in project `BGM`.
2. Create a branch from `development` with the Jira key in the branch name.
3. Implement the change.
4. Run the relevant local checks before pushing:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`
   - `npm run security:ci` when dependencies, API request handling, auth, env, reward, ledger, withdrawal, or disclosure behavior changed
5. Push the branch and open a pull request into `development`.
6. Use the PR template to document Jira key, scope, validation, risk review, and whether any Web/H5 user client work was intentionally avoided.
7. Move the Jira issue to `In Review` when the PR is ready for review or testing.
8. Wait for GitHub CI checks and code review before merging unless the change is an explicitly approved emergency fix.
9. Merge to `development` for testing.
10. Move the Jira issue to `Done` only after the change is tested and accepted.

## Quality Gates

GitHub Actions must run on pull requests into `development` and `main`:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run security:ci`

`npm run security:ci` blocks critical production dependency advisories. `npm run security:audit` produces the full production dependency audit and may report known Expo/Metro transitive advisories that require upstream fixes.

Recommended branch protection after the workflow exists in GitHub:

- Require pull request before merging into `development`.
- Require at least one approval before merging into `development`.
- Require passing CI checks before merging.
- Require pull request before merging `development` into `main`.
- Do not allow direct commits to `main`.

## Code Review Flow

Use `.agents/skills/review-changes/skill.md` for structured review when a PR changes implementation code.

Review priorities:

- Financial/reward correctness.
- Disclosure and compliance language.
- Mobile accessibility, touch target size, safe area handling, and readable typography.
- API input validation, security headers, auth assumptions, and env handling.
- Regression tests for changed behavior.
- No Web/H5 user client unless the Jira issue explicitly changes scope.

## Security Check Flow

Security checks are required for dependency, API, auth, env, reward, ledger, withdrawal, disclosure, or data handling changes.

Minimum checks:

- `npm run security:ci` before pushing.
- Full `npm run security:audit` before release readiness review.
- Review `.env.example` and app config changes for accidental secrets.
- Verify Express routes use safe defaults such as `helmet` and CORS boundaries.
- Confirm reward and withdrawal behavior cannot imply real investment returns.

Known baseline:

- Expo/Metro production dependency audit may show high-severity transitive advisories with no upstream fix available. These must remain visible in release notes and should be rechecked whenever Expo or React Native versions change.

## Bug Fix Flow

1. Create or confirm a Jira `Bug` issue in `BGM`.
2. Branch from `development` as `fix/BGM-<id>-short-name`.
3. Reproduce or isolate the failing behavior before changing code.
4. Use `.agents/skills/debug-issue/skill.md` to trace affected code paths.
5. Add or update a regression test when feasible.
6. Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
7. Run `npm run security:ci` when security, API, dependency, env, reward, withdrawal, or disclosure behavior changed.
8. Open a PR into `development` and mark the Jira issue `In Review`.
9. Merge only after CI passes and the fix is reviewed/tested.

## Current Project Baseline

The current product source of truth lives in:

- `project/BANK_REWARDS_INVEST_APP_PRODUCT_DESIGN.md`
- `project/sprout-prototype.jsx`

The first implementation phase should follow the Demo MVP scope in the product design document unless a `BGM` Jira issue explicitly narrows or changes the scope.
