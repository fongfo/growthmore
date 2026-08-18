# Growthmore Project Workflow

Status: Active  
Date: 2026-08-18  
GitHub repository: `https://github.com/fongfo/growthmore`  
Jira project: `BGM` / `Bank-Growth More`  
Jira URL: `https://growth-more.atlassian.net/jira/software/projects/BGM`

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
4. Run the relevant tests before pushing.
5. Push the branch and open a pull request into `development`.
6. Move the Jira issue to `In Review` when the PR is ready for review or testing.
7. Merge to `development` for testing.
8. Move the Jira issue to `Done` only after the change is tested and accepted.

## Current Project Baseline

The current product source of truth lives in:

- `project/BANK_REWARDS_INVEST_APP_PRODUCT_DESIGN.md`
- `project/sprout-prototype.jsx`

The first implementation phase should follow the Demo MVP scope in the product design document unless a `BGM` Jira issue explicitly narrows or changes the scope.
