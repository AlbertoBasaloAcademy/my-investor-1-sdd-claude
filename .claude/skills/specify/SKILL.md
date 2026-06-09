---
name: specify
description: Capture a feature as a one-page spec — problem, per-container solution overview, and verification criteria.
user-invocable: true
disable-model-invocation: true
---

# Specify skill

Generate the specification for a feature.

## Role
Act as a senior analyst.

## Task
Define **what** the feature must achieve, not **how**.
Output: `{Product_Folder}/specs/{slug}/spec.md`. Write the specification in one pass.

## Context

### Input
- A requirement or feature description. Ask the user for additional details if needed.
- `CLAUDE.md`, 
- `{Product_Folder}/arch/system.arch.md` (run `/explore` if missing).

### Assets
- [`spec.template.md`](./assets/spec.template.md).

### Glossary
- **Container** — a runnable unit in `system.arch.md` (`back`, `front`, `db`...). 

## Steps
### Step 1: Understand
- Ask the minimum questions if unclear.
- Derive `{slug}`.
- From `system.arch.md` list the containers this feature touches.

### Step 2: Write the spec
- Fill `spec.template.md` — problem, user stories, conceptual data model, and checkable acceptance criteria. 
- For each affected container, list the **expected results** in non-technical language. 
- No e2e container at this stage.
- Stay at the outcome level: no implementation steps, file paths, or technology choices (that's `/planify`'s job). 

## Output
- Write `{Product_Folder}/specs/{slug}/spec.md` with no `{placeholders}`; keep it short and actionable.
- Commit (`docs`); suggest `/planify`.

## Verification
- [ ] `spec.md` exists, is well formatted, and has no `{placeholders}` left.
