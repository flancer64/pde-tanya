---
name: project-conventions
description: Project-specific conventions. Use for every task in this repository.
---

# Project Conventions

`AGENTS.md` overrides this file.

## Repositories

- The repository root is the only repository in this project; there is no `ctx` repository.

## Workflow

- Work in the repository's `main` branch. This project rule overrides any GitHub-skill instruction to use a separate branch.
- At the start of work, check upstream state and safely fast-forward local `main` when possible.
- Before changes, inspect the affected working tree.
- Do not commit or push unless the user requests it.

## Project-local skills

- Before reading a project-local skill, inspect its directory entry with `ls -la` and resolve symlinks with `readlink -f`. Project skills may be symlinks into `node_modules`; do not conclude that a skill is absent until its target has been checked.

## Communication

- User communication is in Russian; source code, comments, documentation, commit messages, and identifiers are in English.
- Report changes, verification, and remaining risks.

## Project boundaries

- This package is the deployable head application for Personal Digital Embassy and composes the PDE Runtime and Telegram Desk packages through TeqFW CLI.
- Keep host-owned DI components under the `Pde_Tanya_` namespace and use the current `@teqfw/cli` contract for CLI metadata and plugins.
- Do not modify installed packages under `node_modules`; configure them through the host package, `.env`, and `etc/log.policy`.
- Never commit credentials from `.env` or state data from `var/`.

## Validation

- Run `teqfw-esm-validator` for changed TeqFW ESM modules under `src/`.
- The package has no automated test script; run focused syntax, metadata, or runtime checks appropriate to the changed scope.

## GitHub

- In all multiline text sent to GitHub, including issues and comments, use actual line breaks; never send literal `\n`, which GitHub displays as text.

## Shared memory

- `flancer32/ai-memo` is the shared cross-project issue tracker and memory.
- May create issues: source `flancer64/pde-tanya`; each issue must name the project or projects expected to resolve it.
- When referring to a commit in another repository, use its full GitHub URL: `https://github.com/vendor/name/commit/<sha>`.
- Notes: `project/flancer64/pde-tanya/`.
