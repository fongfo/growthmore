---
name: explore-codebase
description: Explain Growthmore architecture or locate the code implementing a feature. Use for code navigation and implementation questions, not a full project status audit.
---

# Explore Growthmore

Read the repository AGENTS.md for paths and product references.

Start from the user's question and search the likely entry point. Trace only the relevant UI, API, shared contracts, and tests. Read product documentation when intended behavior matters.
Use graph navigation when available and useful, checking its results against the current checkout. Fall back to file search and direct reads without requiring graph setup.
For a broad architecture question, map apps/mobile, apps/api, and packages/shared and their boundaries. For a narrow question, avoid a repository-wide inventory.
Answer with concrete file locations and a short explanation of the relevant flow. Distinguish implemented behavior, documented plans, and unknowns. Exploration alone does not require switching branches or editing files.
